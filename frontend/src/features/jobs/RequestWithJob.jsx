// /workers/:workerId/request?job=<id> — request this worker WITH the job (Module 6, Batch 8B, B6). The job's city,
// area and description are not asked again: a read-only "Your job" card shows them, and the server copies them into
// the booking. The skill tiles are only the worker's skills in the job's trade (the matched one pre-selected); the
// day and time come from the job. The Module 5 price information and the optional offer work exactly as on the
// normal request page. Body: { jobVersion, workerIdCode, skillId, preferredDate, timeSlot, offer? } and nothing else.
// Without ?job the normal page (pages/customer/RequestWorker.jsx) is shown, unchanged.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, CalendarDays, CalendarPlus, ClipboardPen, HandCoins, MapPin, RefreshCw, Send } from 'lucide-react';
import API from '../../api';
import { TradeArt } from '../../components/illustrations';
import { Alert, Button, EmptyState, PageHeader, RadioCardGroup, TextField, useToast } from '../../components/ui';
import { SLOTS, SLOT_ICONS, addDays, pktDay } from '../booking/bookingText';
import ChecksList from '../wage/ChecksList';
import { useLiveChecks } from '../wage/useLiveChecks';
import PriceFields from '../wage/PriceFields';
import { amountOf } from '../wage/wageLogic';
import PriceInfoCard from '../wage/PriceInfoCard';
import ProtectionCard from '../wage/ProtectionCard';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import { TASK_ICONS, openBookingOf, requestDayOf } from './jobText';
import bookingStyles from '../booking/Booking.module.css';
import wageStyles from '../wage/Wage.module.css';
import styles from './Jobs.module.css';

function YourJob({ job }) {
  const { t } = useT();
  const { categoryLabel } = useTaxonomy();
  const task = job.taskType ?? 'none';
  const TaskIcon = TASK_ICONS[task];
  return (
    <section className={styles.section} aria-labelledby="your-job" data-testid="your-job">
      <h2 id="your-job" className={styles.sectionTitle}><TradeArt category={job.category} size={32} /> {t('jobs.request.yourJob')}</h2>
      <ul className={styles.facts}>
        <li><ClipboardPen size={22} aria-hidden="true" /> <span><span className={styles.factLabel}>{t('jobs.request.code')}</span> <span dir="ltr" className="tabular">{job.code}</span> · {categoryLabel(job.category)}</span></li>
        <li><TaskIcon size={22} aria-hidden="true" /> <span><span className={styles.factLabel}>{t('jobs.summary.kind')}</span> {t(`jobs.task.${task}`)}</span></li>
        <li><MapPin size={22} aria-hidden="true" /> <span><span dir="auto">{job.area}</span>, <span dir="auto">{job.city}</span></span></li>
      </ul>
      <p className={styles.description} dir="auto">{job.description}</p>
      <p className={styles.muted}>{t('jobs.request.jobLead')}</p>
    </section>
  );
}

export default function RequestWithJob({ workerId, jobId }) {
  const { t, te } = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const { skillName } = useTaxonomy();
  useDocumentTitle(t('booking.titles.request'));
  const worker = useApiQuery(`/workers/${encodeURIComponent(workerId)}`);
  const jobQuery = useApiQuery(`/job-requests/${encodeURIComponent(jobId)}`);
  const [chosen, setChosen] = useState({}); // only what the person changed
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offer, setOffer] = useState({ unit: 'job', amount: '', quantity: 1, duration: null });
  const today = pktDay();

  const w = worker.data;
  const job = jobQuery.data?.job ?? null;
  const tradeSkills = w && job ? (w.skills ?? []).filter((s) => s.category === job.category) : [];
  const jobSkillIds = (job?.skills ?? []).map((s) => s.skillId);
  const matched = tradeSkills.find((s) => jobSkillIds.includes(s.skillId)) ?? tradeSkills[0] ?? null;
  const startDay = job ? requestDayOf(job.preferredDate, today) : { day: 'tomorrow', date: '', moved: false };
  const form = { skillId: matched?.skillId ?? null, day: startDay.day, date: startDay.date, timeSlot: job?.timeSlot ?? 'any', ...chosen };
  const set = (changes) => setChosen((c) => ({ ...c, ...changes }));
  const chosenSkill = tradeSkills.find((s) => s.skillId === form.skillId) ?? null;
  const offerAmount = amountOf(offer.amount);
  const offerBody = offerOpen && offerAmount ? {
    amount: offerAmount, unit: offer.unit,
    ...(offer.unit === 'job' ? (offer.duration ? { duration: offer.duration } : {}) : { quantity: offer.quantity || 1 }),
  } : null;
  const live = useLiveChecks(
    { skillId: chosenSkill?.skillId, category: chosenSkill?.category ?? job?.category ?? null, city: (job?.city ?? '').trim(), ...(offerBody ?? {}) },
    { enabled: Boolean(offerBody && chosenSkill) },
  );

  if (worker.loading || jobQuery.loading) return <PageLoading />;
  if (worker.status === 404 || worker.status === 400) {
    return <EmptyState art="empty-search" headingLevel={1} title={t('publicProfile.notFoundTitle')} description={t('publicProfile.notFoundText')} action={<Button to="/find">{t('publicProfile.back')}</Button>} />;
  }
  if (jobQuery.status === 404 || jobQuery.status === 400) {
    return <EmptyState art="not-found" headingLevel={1} title={t('jobs.detail.notFound')} description={t('jobs.detail.notFoundText')} action={<Button to="/job-requests">{t('jobs.detail.back')}</Button>} />;
  }
  if (worker.error) return <Alert tone="danger">{te(worker.error)}</Alert>;
  if (jobQuery.error) return <Alert tone="danger">{te(jobQuery.error)}</Alert>;

  const name = w.user?.name ?? t('common.worker');
  const backToWorkers = <Button to={`/job-requests/${job._id}/workers`} variant="secondary" icon={ArrowLeft}>{t('jobs.request.backToWorkers')}</Button>;
  const waiting = openBookingOf(job);
  const preferredDate = form.day === 'today' ? today : form.day === 'tomorrow' ? addDays(today, 1) : form.date;

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.skillId) found.skillId = 'booking.request.chooseSkill';
    if (!preferredDate) found.date = 'booking.request.chooseDate';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setError(null);
    try {
      const body = { jobVersion: job.version, workerIdCode: w.workerIdCode, skillId: form.skillId, preferredDate, timeSlot: form.timeSlot };
      if (offerBody) body.offer = offerBody;
      const { data } = await API.post(`/job-requests/${encodeURIComponent(job._id)}/request`, body);
      toast.show({ tone: 'success', title: t('booking.request.sent'), message: t('jobs.request.sentText', { name }) });
      navigate(`/bookings/${data.booking._id}`);
    } catch (err) {
      const fields = apiFieldErrors(err);
      setErrors({ ...fields, date: fields.preferredDate, amount: fields['offer.amount'] ?? fields.amount, unit: fields['offer.unit'] });
      const problem = apiError(err);
      setError(problem);
      if (problem.code === 'JOB_HAS_OPEN_REQUEST' || problem.code === 'JOB_NOT_OPEN') jobQuery.reload();
    } finally {
      setBusy(false);
    }
  };

  // the job cannot take a request now (the server's actions decide): say why, with the way forward
  const blocked = !(job.actions ?? []).includes('request');
  const header = (
    <>
      <Button to={`/job-requests/${job._id}/workers`} variant="ghost" size="sm" icon={ArrowLeft}>{t('jobs.request.backToWorkers')}</Button>
      <PageHeader title={t('jobs.request.title', { name })} description={t('jobs.request.lead', { name })} />
    </>
  );
  if (blocked || error?.code === 'JOB_HAS_OPEN_REQUEST' || error?.code === 'JOB_NOT_OPEN') {
    const withWorker = ['requested', 'accepted'].includes(job.state) || error?.code === 'JOB_HAS_OPEN_REQUEST';
    return (
      <div className={bookingStyles.page}>
        {header}
        <YourJob job={job} />
        <div data-testid="request-blocked">
          <Alert tone="warning" title={withWorker ? t('jobs.request.withWorkerTitle') : te({ code: 'JOB_NOT_OPEN' })}>
            {withWorker ? t('jobs.request.withWorker') : t('jobs.request.notOpen')}
          </Alert>
        </div>
        <div className={styles.actions}>
          {withWorker && waiting && <Button to={`/bookings/${waiting._id}`}>{t('jobs.request.openRequest')}</Button>}
          <Button to={`/job-requests/${job._id}`} variant="secondary">{t('jobs.workers.back')}</Button>
        </div>
      </div>
    );
  }
  if (tradeSkills.length === 0) {
    return (
      <div className={bookingStyles.page}>
        {header}
        <YourJob job={job} />
        <EmptyState art="empty-search" headingLevel={2} title={t('jobs.request.noSkill', { name })} description={t('jobs.request.noSkillText')} action={backToWorkers} />
      </div>
    );
  }

  return (
    <div className={bookingStyles.page}>
      {header}
      {w.availability === 'Busy' && <Alert tone="warning" title={t('booking.request.busyTitle')}>{t('booking.request.busyText', { name })}</Alert>}
      <YourJob job={job} />
      <form className={bookingStyles.form} onSubmit={submit} noValidate>
        <RadioCardGroup
          legend={t('jobs.request.skill', { name })}
          name="skill"
          layout="tiles"
          value={form.skillId}
          onChange={(v) => set({ skillId: v })}
          error={errors.skillId}
          assist="request.skill"
          options={tradeSkills.map((s) => ({
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
        {startDay.moved && !chosen.day && <p className={styles.muted} data-testid="day-moved">{t('jobs.request.dateNote')}</p>}
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
        {form.skillId && (
          <PriceInfoCard skillId={chosenSkill?.custom ? undefined : form.skillId} category={chosenSkill?.category ?? job.category} unit={offerOpen ? offer.unit : 'job'} city={job.city} workerIdCode={w.workerIdCode} testId="request-price-info" />
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
        <p className={bookingStyles.notice}>{t('booking.request.phoneNote')}</p>
        {error?.code === 'JOB_CHANGED' ? (
          <Alert tone="warning" title={t('jobs.request.changed')} action={<Button size="sm" variant="secondary" icon={RefreshCw} onClick={() => { setError(null); jobQuery.reload(); }}>{t('jobs.edit.reload')}</Button>}>{t('jobs.request.changedText')}</Alert>
        ) : error && <Alert tone="danger">{te(error)}</Alert>}
        <div className={bookingStyles.actions}>
          <Button type="submit" size="lg" icon={Send} loading={busy}>{t('booking.request.send')}</Button>
        </div>
      </form>
    </div>
  );
}
