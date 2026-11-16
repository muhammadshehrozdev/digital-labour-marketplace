import { useState } from 'react';
import { Banknote, Briefcase, Building2, CalendarClock, ClipboardList, Clock, Hammer, PenLine, Plus, Save, Trash2 } from 'lucide-react';
import API from '../../api';
import { Alert, Button, IconButton, MaskedField, RadioCardGroup, TextArea, TextField } from '../../components/ui';
import { TradeArt } from '../../components/illustrations';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import { ALL_PARTS, validateWork, workPayload } from './workForm';
import { AVAILABILITY, AVAILABILITY_ICONS } from './availability';
import styles from './ProfileForms.module.css';



// Module 1 "Your work". parts: ['work'] trade, experience, rates, availability, bio;
// ['history'] past jobs; both by default (onboarding). Saves only the fields of its parts.
export default function WorkForm({ values, onChange, onSaved, submitLabel, secondary, parts = ALL_PARTS }) {
  const { t, te } = useT();
  const { categories, categoryOccupation, error: taxonomyError } = useTaxonomy();
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  const showWork = parts.includes('work');
  const showHistory = parts.includes('history');

  const chooseCategory = (category) => {
    // Helpful default only when the occupation is still empty.
    const occupation = values.occupation.trim() ? values.occupation : categoryOccupation(category);
    onChange({ ...values, category, occupation });
  };
  const setJob = (i, key, value) => onChange({ ...values, workHistory: values.workHistory.map((w, j) => (j === i ? { ...w, [key]: value } : w)) });
  const addJob = () => onChange({ ...values, workHistory: [...values.workHistory, { jobTitle: '', clientOrEmployer: '', duration: '', description: '' }] });
  const removeJob = (i) => onChange({ ...values, workHistory: values.workHistory.filter((_, j) => j !== i) });

  const submit = async (e) => {
    e.preventDefault();
    const found = validateWork(values, parts);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const { data } = await API.put('/workers/me', workPayload(values, parts));
      onSaved(data);
    } catch (err) {
      setErrors(apiFieldErrors(err));
      setFormError(apiError(err, 'about.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={styles.form}>
      {formError && <Alert tone="danger">{te(formError)}</Alert>}
      {showWork && taxonomyError && <Alert tone="danger">{te(taxonomyError)}</Alert>}
      {showWork && (
        <>
          {/* Batch 5: the trade is chosen by picture (each card can be heard), not from a drop-down */}
          <RadioCardGroup
            legend={<>{t('work.trade')}<span className={styles.required}><span aria-hidden="true"> *</span><span className="visually-hidden"> {t('common.required')}</span></span></>}
            name="category"
            layout="tiles"
            options={categories.map((c) => ({ value: c.id, title: c.label, art: <TradeArt category={c.id} size={56} />, listenKey: `help.option.trade.${c.id}` }))}
            value={values.category}
            onChange={chooseCategory}
            error={errors.category}
            assist="work.trade"
            id="work-trade"
          />
          <div className={styles.grid}>
            <TextField label={t('work.occupation')} required placeholder={t('work.occupationPlaceholder')} value={values.occupation} onChange={set('occupation')} error={errors.occupation} urdu icon={Briefcase} assist="work.occupation" />
            <TextField label={t('work.experience')} required inputMode="numeric" dir="ltr" placeholder="5" value={values.experienceYears} onChange={set('experienceYears')} error={errors.experienceYears} hint={t('work.experienceHint')} icon={CalendarClock} assist="work.experience" speak="number" />
            <MaskedField mask="rupees" prefix="Rs" label={t('work.hourly')} inputMode="numeric" placeholder="800" value={values.hourlyRate} onChange={set('hourlyRate')} error={errors.hourlyRate} assistIcon={Banknote} assist="work.hourly" />
            <MaskedField mask="rupees" prefix="Rs" label={t('work.daily')} inputMode="numeric" placeholder="4,000" value={values.dailyRate} onChange={set('dailyRate')} error={errors.dailyRate} hint={t('work.dailyHint')} assistIcon={Banknote} assist="work.daily" />
          </div>
          <RadioCardGroup
            legend={t('work.availability')}
            name="availability"
            layout="tiles"
            options={AVAILABILITY.map((a) => ({ value: a, title: t(`status.availability.${a}`), icon: AVAILABILITY_ICONS[a] }))}
            value={values.availability}
            onChange={(availability) => onChange({ ...values, availability })}
            error={errors.availability}
            assist="work.availability"
            listen="availability"
          />
          <TextArea label={t('work.bio')} maxLength={500} rows={3} value={values.bio} onChange={set('bio')} error={errors.bio} placeholder={t('work.bioPlaceholder')} urdu icon={PenLine} assist="work.bio" />
        </>
      )}

      {showHistory && (
        <fieldset className={styles.jobs}>
          <legend className={styles.legend}>{t('work.historyLegend')}</legend>
          {values.workHistory.map((w, i) => (
            <div key={i} className={styles.job}>
              <div className={styles.jobHead}>
                <span className={styles.jobNumber}>{t('work.job', { n: i + 1 })}</span>
                <IconButton label={t('work.removeJob', { n: i + 1 })} icon={Trash2} size="sm" onClick={() => removeJob(i)} />
              </div>
              <div className={styles.grid}>
                <TextField label={t('work.jobTitle')} required value={w.jobTitle} onChange={(e) => setJob(i, 'jobTitle', e.target.value)} error={errors[`job${i}`]} urdu icon={Hammer} assist="work.jobTitle" />
                <TextField label={t('work.client')} value={w.clientOrEmployer} onChange={(e) => setJob(i, 'clientOrEmployer', e.target.value)} hint={t('work.clientHint')} urdu icon={Building2} assist="work.client" />
                <TextField label={t('work.duration')} placeholder={t('work.durationPlaceholder')} value={w.duration} onChange={(e) => setJob(i, 'duration', e.target.value)} urdu icon={Clock} assist="work.duration" />
                <TextField label={t('work.whatYouDid')} value={w.description} onChange={(e) => setJob(i, 'description', e.target.value)} urdu icon={ClipboardList} assist="work.whatYouDid" />
              </div>
            </div>
          ))}
          {values.workHistory.length < 20 && (
            <Button variant="secondary" size="sm" icon={Plus} onClick={addJob}>{t('work.addJob')}</Button>
          )}
        </fieldset>
      )}

      <div className={styles.actions}>
        {secondary}
        <Button type="submit" loading={saving} icon={Save}>{submitLabel ?? t('common.save')}</Button>
      </div>
    </form>
  );
}
