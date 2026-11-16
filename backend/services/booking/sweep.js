// The booking timers, without a server clock (Module 4, decision D-042). Vercel's Hobby plan runs a
// cron job at most once a day, so this one function applies every DUE timer whenever it is called:
//   1. expiry            a request without an answer after REQUEST_EXPIRY_HOURS -> expired
//   2. auto-completion   one side pressed "Work done", the other did nothing for AUTO_COMPLETE_HOURS -> completed (auto)
//   3. unanswered no-show  no answer to "Worker did not come" within NO_SHOW_RESPONSE_HOURS -> confirmed no-show
//   4. review reminder   one reminder REVIEW_REMINDER_DAYS after completion, if there is no review yet
// It runs at the start of every booking read endpoint (scoped to that user's bookings, so people
// always see the right state) and from the daily cron (everything). Every step is a conditional update
// on the state it found, so two sweeps at the same moment, or a missed and a doubled cron run, can
// never apply a step twice: running it again changes nothing more.
import Booking from '../../models/Booking.js';
import Review from '../../models/Review.js';
import { BOOKING_RULES as RULES } from '../../config/bookingRules.js';
import { notify } from '../notifications.js';
import { addDays, addHours } from './schedule.js';
import { afterClose, applyStep, closeValues, trusted } from './lifecycle.js';
import { bookingParams } from './notify.js';

const NOT_DISPUTED = () => trusted({ $ne: 'open' });

export async function sweepBookings({ now = new Date(), filter = {} } = {}) {
  const counts = { expired: 0, autoCompleted: 0, noShowConfirmed: 0, reminded: 0 };

  // 1. expiry
  const expiryCutoff = addHours(now, -RULES.REQUEST_EXPIRY_HOURS);
  for (const b of await Booking.find({ ...filter, status: 'requested', createdAt: trusted({ $lte: expiryCutoff }) }).lean()) {
    const updated = await applyStep(b, { expect: { createdAt: trusted({ $lte: expiryCutoff }) }, set: closeValues('expired', 'expired', now), by: 'system', reason: 'no_answer', now });
    if (!updated) continue;
    counts.expired += 1;
    await notify(updated.customer, 'booking_expired', bookingParams(updated));
    await afterClose(updated, { by: 'system', now });
  }

  // 2. auto-completion (never while a dispute is open, never after a no-show report)
  const autoCutoff = addHours(now, -RULES.AUTO_COMPLETE_HOURS);
  const oneSided = [
    { customerConfirmedAt: trusted({ $lte: autoCutoff }), workerConfirmedAt: null },
    { workerConfirmedAt: trusted({ $lte: autoCutoff }), customerConfirmedAt: null },
  ];
  for (const side of oneSided) {
    for (const b of await Booking.find({ ...filter, status: 'accepted', 'dispute.status': NOT_DISPUTED(), 'noShow.reportedAt': null, ...side }).lean()) {
      const updated = await applyStep(b, {
        expect: { 'dispute.status': NOT_DISPUTED(), 'noShow.reportedAt': null, ...side },
        set: closeValues('completed', 'completed', now, { completedAt: now, completionMethod: 'auto' }),
        by: 'system',
        reason: 'auto_completed',
        now,
      });
      if (!updated) continue;
      counts.autoCompleted += 1;
      await notify(updated.workerUser, 'booking_completed', bookingParams(updated));
      await notify(updated.customer, 'review_requested', bookingParams(updated));
      await afterClose(updated, { by: 'system', now });
    }
  }

  // 3. unanswered no-show report -> confirmed no-show (the worker may still dispute it later: D-053)
  const noShowCutoff = addHours(now, -RULES.NO_SHOW_RESPONSE_HOURS);
  const unanswered = { 'noShow.reportedAt': trusted({ $lte: noShowCutoff }), 'noShow.workerResponse': null, 'dispute.status': NOT_DISPUTED() };
  for (const b of await Booking.find({ ...filter, status: 'accepted', ...unanswered }).lean()) {
    const updated = await applyStep(b, {
      expect: unanswered,
      set: closeValues('cancelled', 'worker_no_show', now, { cancelledBy: 'system', cancelReason: 'no_show', 'noShow.workerResponse': 'no_answer', 'noShow.respondedAt': null }),
      by: 'system',
      reason: 'no_show_unanswered',
      now,
    });
    if (!updated) continue;
    counts.noShowConfirmed += 1;
    await notify(updated.workerUser, 'booking_cancelled', bookingParams(updated, { reasonCode: 'no_show' }));
    await notify(updated.customer, 'booking_cancelled', bookingParams(updated, { reasonCode: 'no_show' }));
    await afterClose(updated, { by: 'system', now });
  }

  // 4. one review reminder, inside the review window, when there is no review and no open dispute
  const remindCutoff = addDays(now, -RULES.REVIEW_REMINDER_DAYS);
  const windowStart = addDays(now, -RULES.REVIEW_WINDOW_DAYS);
  const due = { reviewRemindedAt: null, 'dispute.status': NOT_DISPUTED(), completedAt: trusted({ $lte: remindCutoff, $gte: windowStart }) };
  for (const b of await Booking.find({ ...filter, status: 'completed', ...due }).lean()) {
    if (await Review.exists({ booking: b._id })) continue;
    const updated = await Booking.findOneAndUpdate({ _id: b._id, status: 'completed', reviewRemindedAt: null }, { $set: { reviewRemindedAt: now } }, { returnDocument: 'after' }).lean();
    if (!updated) continue;
    counts.reminded += 1;
    await notify(updated.customer, 'review_reminder', bookingParams(updated));
  }

  return counts;
}
