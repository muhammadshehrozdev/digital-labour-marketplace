// A customer's review of ONE completed booking (Module 4, decisions D-040, D-041). One per booking
// (unique index). The customer can never edit or delete it (a review that can be changed later can be
// bargained over). Only an admin can hide it (with a reason) or restore it; a hidden review leaves the
// public list and every score. Being negative is never a reason to hide a review.
import mongoose from 'mongoose';

export const REVIEW_ANSWERS = Object.freeze(['yes', 'no']);
export const REPORT_REASONS = Object.freeze(['abusive', 'personal_information', 'not_about_my_work', 'job_did_not_happen', 'other']);
export const HIDE_REASONS = Object.freeze(['abusive_language', 'personal_information', 'unrelated', 'fake_or_manipulated', 'other']);
export const REVIEW_TEXT_MAX = Object.freeze({ comment: 500, reply: 300, note: 300 });

const answer = { type: String, enum: [...REVIEW_ANSWERS, null], default: null };

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },
    workerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: String, required: true, maxlength: 80 }, // copied from the booking
    rating: {
      type: Number, required: true, min: 1, max: 5,
      validate: { validator: Number.isInteger, message: 'rating must be a whole number' },
    },
    onTime: answer,
    workQuality: answer,
    polite: answer,
    priceAsAgreed: answer,
    wouldHireAgain: answer,
    comment: { type: String, trim: true, maxlength: REVIEW_TEXT_MAX.comment, default: '' },
    status: { type: String, enum: ['visible', 'hidden'], default: 'visible' },
    hidden: {
      reasonCode: { type: String, enum: [...HIDE_REASONS, null], default: null },
      note: { type: String, trim: true, maxlength: REVIEW_TEXT_MAX.note, default: '' },
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      at: { type: Date, default: null },
    },
    reply: {
      text: { type: String, trim: true, maxlength: REVIEW_TEXT_MAX.reply, default: '' },
      at: { type: Date, default: null },
    },
    reports: {
      type: [{
        reasonCode: { type: String, enum: REPORT_REASONS, required: true },
        note: { type: String, trim: true, maxlength: REVIEW_TEXT_MAX.note, default: '' },
        at: { type: Date, required: true },
        _id: false,
      }],
      default: [],
    },
    synthetic: { type: Boolean, default: false }, // demo data only
  },
  { timestamps: true }
);

reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ worker: 1, status: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
