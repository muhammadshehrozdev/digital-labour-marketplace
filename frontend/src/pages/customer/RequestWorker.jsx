// /workers/:workerId/request — "Request this worker" (Batch 6, section 7). Picture choices for the
// skill (the worker's own skills, with their trade pictures), the day and the time; area and
// description can be spoken (🎤). The phone number is shared only if the worker accepts (D-002).
// Every rule (skill, date range, limits, contact details in the text) is checked again by the server.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, CalendarDays, CalendarPlus, MapPin, Send } from 'lucide-react';
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
      const { data } = await API.post('/bookings', body);
      toast.show({ tone: 'success', title: t('booking.request.sent'), message: t('booking.request.sentText', { name }) });
      navigate(`/bookings/${data.booking._id}`);
    } catch (err) {
      const fields = apiFieldErrors(err);
      setErrors({ ...fields, date: fields.preferredDate });
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
