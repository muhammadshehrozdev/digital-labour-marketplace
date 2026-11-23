// Payment records of a booking (Module 5, §4.7 and §7). The app does NOT move money: it keeps a record that
// both people confirm. Either person records a payment ("I paid" / "I received"); only the OTHER person confirms
// it ("Yes, I received it" / "Yes, I paid this") or says "This is not right" (a reason). A record is never
// edited or deleted; a mistake is disputed and recorded again. The server decides the buttons (paymentActions).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, CalendarDays, Check, Flag, Plus, Printer, Wallet } from 'lucide-react';
import API from '../../api';
import { Alert, Badge, Button, ConfirmDialog, Dialog, MaskedField, RadioCardGroup, TextArea, TextField, useToast } from '../../components/ui';
import { useT } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import { pktDay } from '../booking/bookingText';
import ListenButton from './ListenButton';
import { amountOf, summaryLine } from './wageLogic';
import { KIND_ICONS, METHOD_ICONS, REASON_ICONS, RECORD_LOOK, STATE_LOOK, dayDate, rupees, spokenRupees } from './wageText';
import styles from './Wage.module.css';

const KINDS = ['advance', 'part', 'final', 'materials', 'extra_work'];
const METHODS = ['cash', 'easypaisa', 'jazzcash', 'bank', 'other'];
const REASONS = ['not_received', 'wrong_amount', 'other'];

export function PaymentStateChip({ state }) {
  const { t } = useT();
  const look = STATE_LOOK[state] ?? STATE_LOOK.no_price;
  return <Badge tone={look.tone} icon={look.icon}>{t(`wage.state.${state ?? 'no_price'}`)}</Badge>;
}

function RecordDialog({ booking: b, viewer, onClose, onDone }) {
  const { t, te } = useT();
  const today = pktDay();
  const [kind, setKind] = useState(b.paymentSummary?.agreedTotal ? 'final' : null);
  const [method, setMethod] = useState(b.terms?.agreed?.paymentMethod ?? 'cash');
  const [amount, setAmount] = useState('');
  const [when, setWhen] = useState('today');
  const [date, setDate] = useState(today);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const created = String(b.createdAt ?? '').slice(0, 10);
  const submit = async () => {
    const found = {};
    if (!kind) found.kind = 'wage.pay.needKind';
    if (!amountOf(amount)) found.amount = 'wage.pay.needAmount';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await API.post(`/bookings/${b._id}/payments`, { kind, amount: amountOf(amount), method, paidOn: when === 'today' ? today : date });
      onDone(data.booking);
    } catch (err) {
      setErrors(apiFieldErrors(err));
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={onClose} title={t(`wage.pay.recordTitle.${viewer}`)} footer={<><Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button><Button icon={Check} loading={busy} onClick={submit}>{t('wage.pay.save')}</Button></>}>
      <div className={styles.dialogBody} data-testid="record-payment">
        <p className={styles.notice}>{t('wage.pay.noMoney')}</p>
        <RadioCardGroup legend={t('wage.pay.kind')} name="pay-kind" layout="tiles" value={kind} onChange={setKind} error={errors.kind} assist="wage.payKind" listen="wagePayKind"
          options={KINDS.map((k) => ({ value: k, title: t(`wage.kind.${k}`), icon: KIND_ICONS[k] }))} />
        <MaskedField mask="rupees" prefix="Rs" max={5000000} label={t('wage.pay.amount')} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} assist="wage.payAmount" />
        <RadioCardGroup legend={t('wage.pay.method')} name="pay-method" layout="tiles" value={method} onChange={setMethod} assist="wage.payMethod" listen="wageMethod"
          options={METHODS.map((m) => ({ value: m, title: t(`wage.method.option.${m}`), icon: METHOD_ICONS[m] }))} />
        <RadioCardGroup legend={t('wage.pay.when')} name="pay-when" layout="tiles" value={when} onChange={setWhen} assist="wage.payWhen" listen="wagePayWhen"
          options={[{ value: 'today', title: t('wage.pay.today'), icon: CalendarCheck }, { value: 'pick', title: t('wage.pay.pickDay'), icon: CalendarDays }]} />
        {when === 'pick' && <TextField type="date" label={t('wage.pay.date')} min={created || undefined} max={today} value={date} onChange={(e) => setDate(e.target.value)} error={errors.paidOn} assist="wage.payDate" speak={false} />}
        {error && <p className={styles.errorText} role="alert">{te(error)}</p>}
      </div>
    </Dialog>
  );
}

function DisputeDialog({ booking: b, payment, onClose, onDone }) {
  const { t, te } = useT();
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!reason) {
      setError('wage.pay.needReason');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data } = await API.post(`/bookings/${b._id}/payments/${payment._id}/dispute`, { reason, ...(note.trim() ? { note: note.trim() } : {}) });
      onDone(data.booking);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={onClose} title={t('wage.pay.disputeTitle')} footer={<><Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button><Button variant="danger" icon={Flag} loading={busy} onClick={submit}>{t('wage.pay.notRight')}</Button></>}>
      <div className={styles.dialogBody}>
        <p>{t('wage.pay.disputeText')}</p>
        <RadioCardGroup legend={t('wage.pay.reason')} name="pay-reason" value={reason} onChange={setReason} assist="wage.payReason" listen="wagePayReason"
          options={REASONS.map((r) => ({ value: r, title: t(`wage.pay.reasons.${r}`), icon: REASON_ICONS[r] }))} />
        <TextArea label={t('wage.pay.disputeNote')} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} assist="wage.payNote" urdu />
        {error && <p className={styles.errorText} role="alert">{te(error)}</p>}
      </div>
    </Dialog>
  );
}

export default function PaymentsCard({ booking: b, viewer, onChanged, recordPath }) {
  const { t, te, formatNumber, formatDate } = useT();
  const toast = useToast();
  const [open, setOpen] = useState(null); // 'record' | { confirm: payment } | { dispute: payment }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const s = b.paymentSummary;
  if (!s) return null;
  const actions = b.paymentActions ?? { record: false, respond: [] };
  const money = (n) => rupees(t, formatNumber, n);
  const done = (fresh, key) => {
    setOpen(null);
    toast.show({ tone: 'success', title: t(key) });
    onChanged?.(fresh);
  };
  const confirm = async (p) => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await API.post(`/bookings/${b._id}/payments/${p._id}/confirm`, {});
      done(data.booking, 'wage.pay.confirmedDone');
    } catch (err) {
      setOpen(null);
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };
  const recordText = (tt, m, p) => [m(p.amount), tt(`wage.kind.${p.kind}`), tt(`wage.method.option.${p.method}`), dayDate(formatDate, p.paidOn), tt(`wage.pay.by.${p.recordedBy}`)].join(' · ');

  return (
    <section className={styles.section} aria-labelledby={`pay-${b._id}`} data-testid="payments-card">
      <div className={styles.cardHead}>
        <h2 id={`pay-${b._id}`} className={styles.sectionTitle}><Wallet size={20} aria-hidden="true" /> {t('wage.pay.title')}</h2>
        <PaymentStateChip state={s.state} />
      </div>
      <p className={styles.big} data-testid="payment-summary">{summaryLine(t, money, s)}</p>
      {(s.awaiting > 0 || s.disputed > 0 || s.materials?.confirmed > 0) && (
        <p className={styles.muted}>
          {[s.awaiting > 0 && t('wage.pay.awaitingLine', { amount: money(s.awaiting) }), s.disputed > 0 && t('wage.pay.disputedLine', { amount: money(s.disputed) }), s.materials?.confirmed > 0 && t('wage.pay.materialsLine', { amount: money(s.materials.confirmed) })].filter(Boolean).join(' · ')}
        </p>
      )}
      <ListenButton build={(spokenT) => summaryLine(spokenT, spokenRupees(spokenT), s)} />
      {(b.payments ?? []).length > 0 && (
        <ul className={styles.records} data-testid="payment-records">
          {b.payments.map((p) => {
            const look = RECORD_LOOK[p.status];
            const Icon = KIND_ICONS[p.kind];
            const mine = p.recordedBy === viewer;
            return (
              <li key={p._id} className={styles.record} data-status={p.status}>
                <div className={styles.recordTop}>
                  <Icon size={20} aria-hidden="true" />
                  <span className={styles.recordText}>{recordText(t, money, p)}</span>
                  <Badge tone={look.tone} icon={look.icon}>{t(`wage.record.${p.status}`)}</Badge>
                </div>
                {p.status === 'disputed' && <p className={styles.muted}>{t('wage.pay.disputedBecause', { reason: t(`wage.pay.reasons.${p.disputeReason}`) })}{p.disputeNote && <> · <span dir="auto">{p.disputeNote}</span></>}</p>}
                {p.status === 'awaiting_confirmation' && mine && <p className={styles.muted}>{t('wage.pay.waitingOther')}</p>}
                {actions.respond.includes(String(p._id)) && (
                  <div className={styles.actions}>
                    <Button icon={Check} onClick={() => setOpen({ confirm: p })}>{t(`wage.pay.yes.${viewer}`)}</Button>
                    <Button variant="secondary" icon={Flag} onClick={() => setOpen({ dispute: p })}>{t('wage.pay.notRight')}</Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {error && <Alert tone="danger">{te(error)}</Alert>}
      <div className={styles.actions}>
        {actions.record && <Button icon={Plus} variant="secondary" onClick={() => setOpen('record')}>{t('wage.pay.record')}</Button>}
        {recordPath && (b.payments?.length > 0 || b.terms?.agreed) && <Link to={recordPath} className={styles.link}><Printer size={18} aria-hidden="true" /> {t('wage.pay.printable')}</Link>}
      </div>
      <p className={styles.notice}>{t('wage.pay.noMoney')}</p>
      {open === 'record' && <RecordDialog booking={b} viewer={viewer} onClose={() => setOpen(null)} onDone={(fresh) => done(fresh, 'wage.pay.recordedDone')} />}
      {open?.dispute && <DisputeDialog booking={b} payment={open.dispute} onClose={() => setOpen(null)} onDone={(fresh) => done(fresh, 'wage.pay.disputedDone')} />}
      <ConfirmDialog
        open={Boolean(open?.confirm)}
        title={t(`wage.pay.confirmTitle.${viewer}`)}
        message={open?.confirm ? recordText(t, money, open.confirm) : ''}
        confirmLabel={t(`wage.pay.yes.${viewer}`)}
        loading={busy}
        onCancel={() => setOpen(null)}
        onConfirm={() => confirm(open.confirm)}
      />
    </section>
  );
}
