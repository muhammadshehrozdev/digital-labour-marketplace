// Step 2 of "Describe a job" and the edit page (Module 6, Batch 8B): every detail as a picture choice or a short box,
// each with its 🔊 help. A suggestion is pre-selected and says which of the person's words led to it ("Suggested from
// your words: ac, service"); the person may change everything. When the words are checked again, a field the person
// changed keeps their value and the new suggestion is only offered ("New suggestion: … — use it?", mergeSuggestions.js).
// The budget is private: only the customer and the site's admins see it, never a worker.
import { useState } from 'react';
import { CalendarCheck, CalendarDays, CalendarPlus, CalendarX, CircleHelp, Lightbulb, Lock, MapPin } from 'lucide-react';
import { TradeArt } from '../../components/illustrations';
import { Alert, Button, Checkbox, MaskedField, RadioCardGroup, Switch, TextField } from '../../components/ui';
import FieldAssist from '../assist/FieldAssist';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { SLOT_ICONS, addDays, dayWords } from '../booking/bookingText';
import PriceInfoCard from '../wage/PriceInfoCard';
import { UNIT_ICONS, rupees } from '../wage/wageText';
import { amountOf } from '../wage/wageLogic';
import { formatRupees } from '../../utils/masks';
import { BUDGET_UNITS, DAY_CHOICES, TASK_ICONS, TASK_TYPES, TIME_CHOICES, budgetLine } from './jobText';
import { suggestionWords } from './mergeSuggestions';
import styles from './Jobs.module.css';

const DAY_ICONS = { today: CalendarCheck, tomorrow: CalendarPlus, pick: CalendarDays, none: CalendarX };

function Words({ words }) {
  return words.map((w) => <span key={w} className={styles.word} dir="auto">{w}</span>);
}

// "Suggested from your words: ac, service" (or "usual for this trade") next to a field whose value IS the suggestion.
export function SuggestedNote({ mark }) {
  const { t } = useT();
  if (!mark) return null;
  if (mark.fromCategory) return <span className={styles.suggested}>{t('jobs.suggest.fromTrade')}</span>;
  if (!mark.words.length) return null;
  return <span className={styles.suggested}>{t('jobs.suggest.from')} <Words words={mark.words} /></span>;
}

export default function JobDetailsForm({ form, setField, analysis = null, offers = {}, onTakeOffer, errors = {}, today, limits, skillsNote = null }) {
  const { t, formatDate, formatNumber } = useT();
  const { categories, skills: allSkills, categoryLabel, skillName } = useTaxonomy();
  const [skillLimit, setSkillLimit] = useState(false);
  const money = (n) => rupees(t, formatNumber, n);
  const mark = (field) => suggestionWords(field, form, analysis, { formatAmount: formatRupees });

  // trades: on a tie the tied trades first (nothing is selected; the person chooses)
  const tie = analysis?.category?.tie ? analysis.category.ranked : [];
  const ordered = [...categories.filter((c) => tie.includes(c.id)).sort((a, b) => tie.indexOf(a.id) - tie.indexOf(b.id)), ...categories.filter((c) => !tie.includes(c.id))];
  const tradeMark = mark('category');
  const noTradeWords = analysis && !analysis.category?.suggested && !analysis.category?.tie;

  const tradeSkills = allSkills.filter((s) => s.category === form.category);
  const skillWords = new Map((analysis?.skills ?? []).map((s) => [s.skillId, s.matched]));
  const toggleSkill = (id, on) => {
    if (on && form.skills.length >= limits.maxSkills) {
      setSkillLimit(true);
      return;
    }
    setSkillLimit(false);
    setField('skills', on ? [...form.skills, id] : form.skills.filter((s) => s !== id));
  };

  const cityCandidates = analysis?.city?.conflict ? analysis.city.candidates ?? [] : [];
  const chosenSkill = form.skills[0] ?? null;
  const budgetFilled = Boolean(form.budget.amount || form.budget.unit);

  // the words of an offered suggestion
  const offerText = (field, v) => {
    if (field === 'category') return categoryLabel(v);
    if (field === 'skills') return v.map((id) => skillName({ skillId: id })).join(t('common.listSeparator'));
    if (field === 'taskType') return t(`jobs.task.${v}`);
    if (field === 'day') return v.day === 'pick' ? dayWords(t, formatDate, v.date) : t(`jobs.day.${v.day}`);
    if (field === 'timeSlot') return t(`booking.slot.${v}`);
    if (field === 'urgent') return t('jobs.summary.urgent');
    if (field === 'budget') return budgetLine(t, money, { amount: amountOf(v.amount), unit: v.unit });
    return String(v);
  };
  const offerRow = (field) => (field in offers ? (
    <div className={styles.offer} data-testid={`offer-${field}`}>
      <Lightbulb size={18} aria-hidden="true" />
      <p>{t('jobs.suggest.newOne', { value: offerText(field, offers[field]) })}</p>
      <Button size="sm" variant="secondary" onClick={() => onTakeOffer(field)}>{t('jobs.suggest.useIt')}</Button>
    </div>
  ) : null);

  return (
    <div className={styles.form}>
      {analysis?.category?.tie && <Alert tone="info" title={t('jobs.form.tieTitle')}>{t('jobs.form.tie')}</Alert>}
      {noTradeWords && <Alert tone="info">{t('jobs.form.chooseTrade')}</Alert>}
      <RadioCardGroup
        legend={t('jobs.form.trade')}
        name="category"
        layout="tiles"
        value={form.category}
        onChange={(v) => setField('category', v)}
        error={errors.category}
        assist="jobs.trade"
        listen="trade"
        options={ordered.map((c) => ({
          value: c.id,
          title: c.label,
          art: <TradeArt category={c.id} size={44} />,
          description: tradeMark && form.category === c.id ? <SuggestedNote mark={tradeMark} /> : undefined,
        }))}
      />
      {offerRow('category')}

      {form.category && (
        <fieldset className={styles.skillGroup} data-testid="job-skills">
          <legend>{t('jobs.form.skills', { max: limits.maxSkills })}</legend>
          <FieldAssist helpKey="jobs.skills" label={t('jobs.form.skills', { max: limits.maxSkills })} />
          {skillsNote && <p className={styles.muted} role="status">{skillsNote}</p>}
          {tradeSkills.map((s) => (
            <Checkbox
              key={s.id}
              label={s.name}
              checked={form.skills.includes(s.id)}
              onChange={(on) => toggleSkill(s.id, on)}
              hint={skillWords.has(s.id) ? <SuggestedNote mark={{ fromCategory: false, words: skillWords.get(s.id) }} /> : undefined}
            />
          ))}
          <p className={styles.muted} aria-live="polite">{skillLimit ? t('jobs.form.skillLimit', { max: limits.maxSkills }) : ''}</p>
        </fieldset>
      )}
      {offerRow('skills')}

      <RadioCardGroup
        legend={t('jobs.form.kind')}
        name="taskType"
        layout="tiles"
        value={form.taskType ?? 'none'}
        onChange={(v) => setField('taskType', v === 'none' ? null : v)}
        assist="jobs.kind"
        listen="jobTask"
        options={[...TASK_TYPES, 'none'].map((k) => ({
          value: k,
          title: t(`jobs.task.${k}`),
          icon: TASK_ICONS[k],
          description: (form.taskType ?? 'none') === k && k !== 'none' ? <SuggestedNote mark={mark('taskType')} /> : undefined,
        }))}
      />
      {offerRow('taskType')}

      <div className={styles.switchRow}>
        <TextField label={t('jobs.form.city')} maxLength={50} value={form.city} onChange={(e) => setField('city', e.target.value)} error={errors.city} icon={MapPin} assist="jobs.city" urdu required
          hint={mark('city') ? <SuggestedNote mark={mark('city')} /> : undefined} />
        {cityCandidates.length > 1 && (
          <div className={styles.cityChoice} data-testid="city-choice">
            <p>{t('jobs.form.whichCity')}</p>
            <div className={styles.actions}>
              {cityCandidates.map((c) => (
                <Button key={c} size="sm" variant={form.city === c ? 'primary' : 'secondary'} aria-pressed={form.city === c} onClick={() => setField('city', c)}>{c}</Button>
              ))}
            </div>
          </div>
        )}
      </div>
      {offerRow('city')}
      <TextField label={t('jobs.form.area')} hint={t('jobs.form.areaHint')} maxLength={limits.areaMax} value={form.area} onChange={(e) => setField('area', e.target.value)} error={errors.area} assist="jobs.area" urdu required />

      <RadioCardGroup
        legend={t('jobs.form.day')}
        name="day"
        layout="tiles"
        value={form.day}
        onChange={(v) => setField('day', { day: v, date: v === 'pick' ? form.date || addDays(today, 2) : '' })}
        assist="jobs.day"
        listen="jobDay"
        options={DAY_CHOICES.map((d) => ({
          value: d, title: t(`jobs.day.${d}`), icon: DAY_ICONS[d],
          description: form.day === d && d !== 'none' ? <SuggestedNote mark={mark('day')} /> : undefined,
        }))}
      />
      {form.day === 'pick' && (
        <TextField label={t('jobs.form.date')} type="date" min={today} max={addDays(today, 30)} value={form.date} onChange={(e) => setField('day', { day: 'pick', date: e.target.value })} error={errors.date} assist="jobs.date" speak={false} required />
      )}
      {offerRow('day')}
      <RadioCardGroup
        legend={t('jobs.form.time')}
        name="timeSlot"
        layout="tiles"
        value={form.timeSlot ?? 'none'}
        onChange={(v) => setField('timeSlot', v === 'none' ? null : v)}
        assist="jobs.time"
        listen="jobTime"
        options={TIME_CHOICES.map((s) => ({
          value: s, title: s === 'none' ? t('jobs.time.none') : t(`booking.slot.${s}`), icon: s === 'none' ? CircleHelp : SLOT_ICONS[s],
          description: (form.timeSlot ?? 'none') === s && s !== 'none' ? <SuggestedNote mark={mark('timeSlot')} /> : undefined,
        }))}
      />
      {offerRow('timeSlot')}

      <div className={styles.switchRow} data-testid="job-urgent">
        <Switch label={t('jobs.form.urgent')} hint={t('jobs.form.urgentHint')} checked={form.urgent} onChange={(on) => setField('urgent', on)} />
        <FieldAssist helpKey="jobs.urgent" label={t('jobs.form.urgent')} />
        {form.urgent && <SuggestedNote mark={mark('urgent')} />}
      </div>
      {offerRow('urgent')}

      <section className={styles.section} aria-labelledby="budget-title" data-testid="job-budget-step">
        <h2 id="budget-title" className={styles.sectionTitle}>{t('jobs.budget.title')}</h2>
        <p className={styles.privateBox}><Lock size={18} aria-hidden="true" /> {t('jobs.budget.privateNote')}</p>
        <MaskedField
          mask="rupees"
          prefix="Rs"
          max={limits.amountMax}
          label={t('jobs.budget.amount')}
          inputMode="numeric"
          value={form.budget.amount}
          onChange={(e) => setField('budget', { ...form.budget, amount: e.target.value })}
          error={errors.budget && !form.budget.amount ? errors.budget : undefined}
          assist="jobs.budgetAmount"
        />
        <RadioCardGroup
          legend={t('jobs.budget.unit')}
          name="budgetUnit"
          layout="tiles"
          value={form.budget.unit}
          onChange={(unit) => setField('budget', { ...form.budget, unit })}
          error={errors.budget && form.budget.amount ? errors.budget : undefined}
          assist="jobs.budgetUnit"
          listen="wageUnit"
          options={BUDGET_UNITS.map((u) => ({ value: u, title: t(`wage.unit.${u}`), icon: UNIT_ICONS[u] }))}
        />
        {mark('budget') && <SuggestedNote mark={mark('budget')} />}
        {offerRow('budget')}
        {budgetFilled && <Button variant="ghost" size="sm" onClick={() => setField('budget', { amount: '', unit: null })}>{t('jobs.budget.remove')}</Button>}
        {form.category && (
          <PriceInfoCard skillId={chosenSkill ?? undefined} category={form.category} unit={form.budget.unit ?? 'job'} city={form.city} testId="job-price-info" />
        )}
      </section>
    </div>
  );
}
