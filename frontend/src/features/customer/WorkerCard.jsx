// One worker in a list (search results, saved workers). Public fields only, exactly as the
// server sends them: no phone, WhatsApp, email, address or CNIC is ever rendered here (D-002).
// query: the search words to mark in the name, trade and skills (feature 21).
import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin } from 'lucide-react';
import { Avatar, Badge, StatusChip } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import Highlight from './Highlight';
import SaveButton from './SaveButton';
import styles from './Customer.module.css';

export default function WorkerCard({ worker: w, index = 0, query = '', saved, onToggleSave, compare, onToggleCompare, compareDisabled }) {
  const { t, formatNumber } = useT();
  const { categoryLabel, categoryOccupation, skillName } = useTaxonomy();
  const name = w.user?.name ?? t('common.worker');
  const trade = categoryOccupation(w.category) || w.occupation;
  const verified = (w.skills ?? []).filter((s) => s.evidenceSummary?.status === 'verified');
  const shown = [...(w.skills ?? [])].sort((x, y) => (y.evidenceSummary?.status === 'verified') - (x.evidenceSummary?.status === 'verified')).slice(0, 3);
  const rate = (n) => (n ? t('common.rupees', { amount: formatNumber(n) }) : t('common.empty'));

  return (
    <li className={styles.card} data-testid="worker-card" style={{ '--i': index }} data-spotlight>
      <div className={styles.cardTop}>
        <Avatar name={name} size="lg" transitionName={`worker-${w.workerIdCode}`} />
        <div className={styles.cardName}>
          <h3 className={styles.name} dir="auto">
            <Link to={`/workers/${w.workerIdCode}`} className={styles.cardLink} viewTransition><Highlight text={name} query={query} /></Link>
          </h3>
          <p className={styles.trade}><Highlight text={trade} query={query} /></p>
          <p className={styles.meta}><MapPin size={14} aria-hidden="true" /> {w.city} · {categoryLabel(w.category)}</p>
        </div>
        {onToggleSave && <SaveButton name={name} saved={saved} onToggle={onToggleSave} />}
      </div>
      <div className={styles.cardChips}>
        <StatusChip kind="identity" status={w.verificationStatus} />
        {verified.length > 0 && <Badge tone="success" icon={BadgeCheck}>{t('status.skill.verified')} · {verified.length}</Badge>}
      </div>
      <dl className={styles.facts}>
        <div><dt>{t('find.experience')}</dt><dd className="tabular">{t('common.yearsShort', { count: w.experienceYears ?? 0 })}</dd></div>
        <div><dt>{t('find.perHour')}</dt><dd className="tabular" dir="ltr">{rate(w.hourlyRate)}</dd></div>
        <div><dt>{t('find.perDay')}</dt><dd className="tabular" dir="ltr">{rate(w.dailyRate)}</dd></div>
      </dl>
      {shown.length > 0 && (
        <ul className={styles.skills} aria-label={t('find.topSkills')}>
          {shown.map((s) => (
            <li key={s.skillId}>
              {s.evidenceSummary?.status === 'verified' ? (
                <Badge tone="success" icon={BadgeCheck}><Highlight text={skillName(s)} query={query} /><span className="visually-hidden"> {t('find.verifiedSkill')}</span></Badge>
              ) : (
                <Badge tone="primary"><Highlight text={skillName(s)} query={query} /></Badge>
              )}
            </li>
          ))}
          {w.skills.length > 3 && <li><Badge>{t('find.more', { count: w.skills.length - 3 })}</Badge></li>}
        </ul>
      )}
      {onToggleCompare && (
        <label className={styles.compareCheck}>
          <input type="checkbox" checked={compare} disabled={compareDisabled && !compare} onChange={onToggleCompare} aria-label={t(compare ? 'customerx.compare.remove' : 'customerx.compare.add', { name })} />
          <span aria-hidden="true">{t('customerx.compare.label')}</span>
        </label>
      )}
    </li>
  );
}
