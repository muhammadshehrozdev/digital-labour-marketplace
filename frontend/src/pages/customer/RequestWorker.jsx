// /workers/:workerId/request — "Request this worker" (Batch 6, section 7). Picture choices for the
// skill (the worker's own skills, with their trade pictures), the day and the time; area and
// description can be spoken (🎤). The phone number is shared only if the worker accepts (D-002).
// Every rule (skill, date range, limits, contact details in the text) is checked again by the server.
// Module 5 (Batch 7): under the chosen skill, the price information (platform range or admin guide, the minimum
// wage reference, the worker's own rates) and an OPTIONAL "Offer a price" step (unit, amount, quantity or
// duration) with the live checks; the offer becomes price version 1 (accepting it is not agreeing to it).
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, CalendarDays, CalendarPlus, HandCoins, MapPin, Send } from 'lucide-react';
import API from '../../api';
import { TradeArt } from '../../components/illustrations';
import { Alert, Button, EmptyState, PageHeader, RadioCardGroup, TextArea, TextField, useToast } from '../../components/ui';
import { SLOTS, SLOT_ICONS, addDays, pktDay } from '../../features/booking/bookingText';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from '../../features/booking/Booking.module.css';
import ChecksList from '../../features/wage/ChecksList';
import { useLiveChecks } from '../../features/wage/useLiveChecks';
import PriceFields from '../../features/wage/PriceFields';
import { amountOf } from '../../features/wage/wageLogic';
import PriceInfoCard from '../../features/wage/PriceInfoCard';
import ProtectionCard from '../../features/wage/ProtectionCard';
import wageStyles from '../../features/wage/Wage.module.css';

export default function RequestWorker() {
  const { workerId } = useParams();
  const { t, te } = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const { skillName } = useTaxonomy();
  useDocumentTitle(t('booking.titles.request'));
  const worker = useApiQuery(`/workers/${encodeURIComponent(workerId)}`);
  const [form, setForm] = useState({ skillId: null, day: 'tomorrow', date: '', timeSlot: 'morning', city: null, area: '', description: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (changes) => setForm((f) => ({ ...f, ...changes }));
  // Module 5: the optional offer (closed by default, so the request works exactly as before)
  const [offerOpen, setOfferOpen] = useState(false);
  const [offer, setOffer] = useState({ unit: 'job', amount: '', quantity: 1, duration: null });
  const wSkills = worker.data?.skills ?? [];
  const chosenSkill = wSkills.find((s) => s.skillId === (form.skillId ?? wSkills[0]?.skillId)) ?? null;
  const offerAmount = amountOf(offer.amount);
  const offerBody = offerOpen && offerAmount ? {
    amount: offerAmount, unit: offer.unit,
    ...(offer.unit === 'job' ? (offer.duration ? { duration: offer.duration } : {}) : { quantity: offer.quantity || 1 }),
  } : null;
  const live = useLiveChecks(
    { skillId: chosenSkill?.skillId, category: chosenSkill?.category ?? worker.data?.category ?? null, city: (form.city ?? worker.data?.city ?? '').trim(), ...(offerBody ?? {}) },
    { enabled: Boolean(offerBody && chosenSkill) },
  );

  if (worker.loading) return <PageLoading />;
  if (worker.status === 404 || worker.status === 400) {
    return <EmptyState art="empty-search" headingLevel={1} title={t('publicProfile.notFoundTitle')} description={t('publicProfile.notFoundText')} action={<Button to="/find">{t('publicProfile.back')}</Button>} />;
  }
  if (worker.error) return <Alert tone="danger">{te(worker.error)}</Alert>;

  const w = worker.data;
  const name = w.user?.name ?? t('common.worker');
  const skills = w.skills ?? [];
  const today = pktDay();
  const skillId = form.skillId ?? skills[0]?.skillId ?? null;
  const city = form.city ?? w.city ?? '';
  const preferredDate = form.day === 'today' ? today : form.day === 'tomorrow' ? addDays(today, 1) : form.date;

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!skillId) found.skillId = 'booking.request.chooseSkill';
    if (!preferredDate) found.date = 'booking.request.chooseDate';
    if (city.trim().length < 2) found.city = 'booking.request.needCity';
    if (form.area.trim().length < 2) found.area = 'booking.request.needArea';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setError(null);
    try {
      const body = { workerIdCode: w.workerIdCode, skillId, preferredDate, timeSlot: form.timeSlot, city: city.trim(), area: form.area.trim() };
      if (form.description.trim()) body.description = form.description.trim();
      if (offerBody) body.offer = offerBody;
      const { data } = await API.post('/bookings', body);
      toast.show({ tone: 'success', title: t('booking.request.sent'), message: t('booking.request.sentText', { name }) });
      navigate(`/bookings/${data.booking._id}`);
    } catch (err) {
      const fields = apiFieldErrors(err);
      setErrors({ ...fields, date: fields.preferredDate, amount: fields['offer.amount'] ?? fields.amount, unit: fields['offer.unit'] });
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <Button to={`/workers/${encodeURIComponent(w.workerIdCode)}`} variant="ghost" size="sm" icon={ArrowLeft}>{t('booking.request.back', { name })}</Button>
      <PageHeader title={t('booking.request.title', { name })} description={t('booking.request.lead')} />
      {w.availability === 'Busy' && <Alert tone="warning" title={t('booking.request.busyTitle')}>{t('booking.request.busyText', { name })}</Alert>}
      <form className={styles.form} onSubmit={submit} noValidate>
        <RadioCardGroup
          legend={t('booking.request.skill')}
          name="skill"
          layout="tiles"
          value={skillId}
          onChange={(v) => set({ skillId: v })}
          error={errors.skillId}
          assist="request.skill"
          options={skills.map((s) => ({
            value: s.skillId,
            title: skillName(s),
            art: <TradeArt category={s.category} size={44} />,
            listenKey: 'help.option.requestSkill.any',
            listenParams: { name: skillName(s) },
          }))}
        />
        <RadioCardGroup
          legend={t('booking.request.day')}
          name="day"
          layout="tiles"
          value={form.day}
          onChange={(v) => set({ day: v })}
          assist="request.day"
          listen="requestDay"
          options={[
            { value: 'today', title: t('booking.day.today'), icon: CalendarCheck },
            { value: 'tomorrow', title: t('booking.day.tomorrow'), icon: CalendarPlus },
            { value: 'pick', title: t('booking.day.pick'), icon: CalendarDays },
          ]}
        />
        {form.day === 'pick' && (
          <TextField label={t('booking.request.date')} type="date" min={today} max={addDays(today, 30)} value={form.date} onChange={(e) => set({ date: e.target.value })} error={errors.date} assist="request.date" speak={false} required />
        )}
        <RadioCardGroup
          legend={t('booking.request.time')}
          name="timeSlot"
          layout="tiles"
          value={form.timeSlot}
          onChange={(v) => set({ timeSlot: v })}
          assist="request.time"
          listen="timeSlot"
          options={SLOTS.map((s) => ({ value: s, title: t(`booking.slot.${s}`), icon: SLOT_ICONS[s] }))}
        />
        {skillId && (
          <PriceInfoCard skillId={chosenSkill?.custom ? undefined : skillId} category={chosenSkill?.category ?? w.category} unit={offerOpen ? offer.unit : 'job'} city={city} workerIdCode={w.workerIdCode} testId="request-price-info" />
        )}
        <section className={wageStyles.section} aria-labelledby="offer-title" data-testid="offer-step">
          <h2 id="offer-title" className={wageStyles.sectionTitle}><HandCoins size={20} aria-hidden="true" /> {t('wage.offer.title')}</h2>
          <p className={wageStyles.muted}>{t('wage.offer.lead')}</p>
          {!offerOpen ? (
            <Button variant="secondary" icon={HandCoins} onClick={() => setOfferOpen(true)}>{t('wage.offer.open')}</Button>
          ) : (
            <>
              <PriceFields value={offer} onChange={setOffer} errors={errors} name="offer" amountMax={5000000} />
              <ChecksList checks={live.checks?.filter((c) => c.id !== 'missing_condition') ?? null} names={live.wageReference?.names} viewer="customer" busy={live.busy} />
              <p className={wageStyles.muted}>{t('wage.offer.conditionsLater')}</p>
              <Button variant="ghost" onClick={() => { setOfferOpen(false); setOffer({ unit: 'job', amount: '', quantity: 1, duration: null }); }}>{t('wage.offer.remove')}</Button>
            </>
          )}
          <ProtectionCard audience="customer" tip="agree_first" />
        </section>
        <TextField label={t('booking.request.city')} maxLength={50} value={city} onChange={(e) => set({ city: e.target.value })} error={errors.city} icon={MapPin} assist="request.city" urdu required />
        <TextField label={t('booking.request.area')} hint={t('booking.request.areaHint')} maxLength={80} value={form.area} onChange={(e) => set({ area: e.target.value })} error={errors.area} assist="request.area" urdu required />
        <TextArea label={t('booking.request.description')} hint={t('booking.request.descriptionHint')} maxLength={500} value={form.description} onChange={(e) => set({ description: e.target.value })} error={errors.description} assist="request.description" urdu />
        <p className={styles.notice}>{t('booking.request.phoneNote')}</p>
        {error && <Alert tone="danger">{te(error)}</Alert>}
        <div className={styles.actions}>
          <Button type="submit" size="lg" icon={Send} loading={busy}>{t('booking.request.send')}</Button>
        </div>
      </form>
    </div>
  );
}
