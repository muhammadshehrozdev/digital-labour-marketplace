// Propose a price on a booking (Module 5, §7): the price fields, the condition questions for the booking's trade
// category, the fixed extra-work rule, an optional note (🎤), the checks shown live while the person chooses,
// then a READ-BACK dialog ("You propose: Rs 2,500 for the whole job. The customer buys the materials. ...")
// with 🔊 and Send. The server checks every rule again; `baseVersion` makes sure nobody answers a price that
// changed a second ago (409 TERMS_CHANGED).
import { useState } from 'react';
import { Send } from 'lucide-react';
import API from '../../api';
import { Alert, Button, Dialog, TextArea, useToast } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import { formatRupees } from '../../utils/masks';
import ChecksList from './ChecksList';
import { useLiveChecks } from './useLiveChecks';
import { draftOf } from './wageLogic';
import ConditionFields from './ConditionFields';
import ListenButton from './ListenButton';
import PriceFields from './PriceFields';
import { readBack, rupees, spokenRupees } from './wageText';
import styles from './Wage.module.css';

const fromTerms = (p) => ({
  price: { unit: p?.unit ?? 'job', amount: p?.amount ? formatRupees(String(p.amount)) : '', quantity: p?.quantity ?? 1, duration: p?.duration ?? null },
  cond: {
    materials: p?.materials ?? null,
    advanceChoice: p?.advance === 0 ? 'none' : Number.isFinite(p?.advance) ? 'some' : null,
    advanceAmount: Number.isFinite(p?.advance) && p.advance > 0 ? formatRupees(String(p.advance)) : '',
    paymentTiming: p?.paymentTiming ?? null,
    paymentMethod: p?.paymentMethod ?? null,
    visitCharge: p?.visitCharge ?? null,
  },
  note: p?.note ?? '',
});

export default function TermsForm({ booking: b, viewer, onSent, onCancel }) {
  const { t, te, formatNumber } = useT();
  const toast = useToast();
  const meta = useApiQuery('/meta/work-terms').data;
  const start = fromTerms(b.terms?.current ?? b.terms?.agreed);
  const [price, setPrice] = useState(start.price);
  const [cond, setCond] = useState(start.cond);
  const [note, setNote] = useState(start.note);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);

  const conditions = meta ? meta.categoryConditions?.[b.category] ?? meta.defaultConditions ?? [] : [];
  const notes = meta?.categoryNotes?.[b.category] ?? [];
  const draft = draftOf(price, cond, conditions);
  const live = useLiveChecks({ skillId: b.skillId, category: b.category ?? null, city: b.city, ...draft }, { enabled: Boolean(meta) });
  const money = (n) => rupees(t, formatNumber, n);
  const shown = { ...draft, total: draft.amount ? draft.amount * draft.quantity : null };

  const check = () => {
    const found = {};
    if (!draft.amount || draft.amount < (meta?.limits?.amountMin ?? 1)) found.amount = 'wage.form.needAmount';
    if (cond.advanceChoice === 'some' && !draft.advance) found.advance = 'wage.form.needAdvance';
    setErrors(found);
    if (Object.keys(found).length === 0) setReading(true);
  };
  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = { baseVersion: b.terms?.version ?? 0, ...draft, ...(note.trim() ? { note: note.trim() } : {}) };
      const { data } = await API.post(`/bookings/${b._id}/terms`, body);
      setReading(false);
      toast.show({ tone: 'success', title: t('wage.terms.sent') });
      onSent?.(data.booking);
    } catch (err) {
      setReading(false);
      setErrors(apiFieldErrors(err));
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.form} data-testid="terms-form">
      <PriceFields value={price} onChange={setPrice} errors={errors} name={`terms-${b._id}`} amountMax={meta?.limits?.amountMax} />
      {meta && <ConditionFields conditions={conditions} notes={notes} category={b.category} value={cond} onChange={setCond} errors={errors} name={`terms-${b._id}`} amountMax={meta?.limits?.amountMax} />}
      <TextArea label={t('wage.form.note')} hint={t('wage.form.noteHint')} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} error={errors.note} assist="wage.note" urdu />
      <ChecksList checks={live.checks} names={live.wageReference?.names ?? b.wageReference?.names} viewer={viewer} busy={live.busy} />
      {error && <Alert tone="danger">{te(error)}</Alert>}
      <div className={styles.actions}>
        <Button size="lg" icon={Send} onClick={check}>{t('wage.form.checkAndSend')}</Button>
        {onCancel && <Button variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>}
      </div>
      <Dialog
        open={reading}
        onClose={() => setReading(false)}
        title={t('wage.readBack.title')}
        footer={<><Button variant="secondary" onClick={() => setReading(false)}>{t('wage.readBack.change')}</Button><Button icon={Send} loading={busy} onClick={send}>{t('wage.readBack.send')}</Button></>}
      >
        <div className={styles.readBack} data-testid="terms-read-back">
          <p>{readBack(t, money, shown, { category: b.category })}</p>
          {note.trim() && <p className={styles.muted} dir="auto">{t('wage.readBack.note', { note: note.trim() })}</p>}
          <ListenButton build={(spokenT) => readBack(spokenT, spokenRupees(spokenT), shown, { category: b.category, prefix: 'wage.spoken.price' })} />
        </div>
      </Dialog>
    </div>
  );
}
