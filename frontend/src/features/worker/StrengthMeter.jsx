// Profile strength with next steps (Batch 4, feature 10). Everything shown comes from the server
// (services/profileStrength.js): the documented checklist percentage, a level word, how many
// skills have proof, and up to five next steps that each name one missing thing and link to it.
import { ArrowRight, Check, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProgressRing } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import styles from './WorkerFeatures.module.css';

const edit = (section, skillId) => `/worker/profile/edit?section=${section}${skillId ? `&skill=${encodeURIComponent(skillId)}` : ''}`;
// where each next step is done
const TIP_LINKS = {
  add_trade: () => edit('work'),
  add_skills: () => edit('skills'),
  add_cnic: () => edit('about'),
  fix_identity: () => edit('about'),
  replace_proof: (p) => edit('proof', p?.skillId),
  add_proof: (p) => edit('proof', p?.skillId),
  add_experience_rate: () => edit('work'),
  add_bio: () => edit('work'),
  add_work_history: () => edit('history'),
  add_city_address: () => edit('about'),
  add_contact: () => edit('about'),
};

export default function StrengthMeter({ strength }) {
  const { t, formatNumber } = useT();
  const { skillName } = useTaxonomy();
  if (!strength) return null;
  const tipText = (tip) => t(`workerx.strength.tips.${tip.code}`, { skill: tip.params ? skillName({ skillId: tip.params.skillId, name: tip.params.skillName }) : '' });

  return (
    <section className={styles.strength} aria-labelledby="strength-title" data-tour="strength">
      <div className={styles.strengthHead}>
        {/* the ring is the completion checklist; the level word below the title is the strength */}
        <figure className={styles.ringFigure}>
          <ProgressRing value={strength.percent} size={112} label={t('workerx.strength.ringCaption')} />
          <figcaption className={styles.ringCaption}>{t('workerx.strength.ringCaption')}</figcaption>
        </figure>
        <div className={styles.strengthText}>
          <h2 id="strength-title" className={styles.cardTitle}>{t('workerx.strength.title')}</h2>
          <p className={styles.level} data-level={strength.level}>{t(`workerx.strength.levels.${strength.level}`)}</p>
          <p className={styles.muted}>{t(`workerx.strength.leads.${strength.level}`)}</p>
        </div>
      </div>

      {strength.proof.skills > 0 && (
        <p className={styles.proofLine}>{t('workerx.strength.proofLine', { approved: formatNumber(strength.proof.approved), pending: formatNumber(strength.proof.pending), none: formatNumber(strength.proof.none) })}</p>
      )}

      <div>
        <h3 className={styles.tipsTitle}>{t('workerx.strength.tipsTitle')}</h3>
        {strength.tips.length === 0 ? (
          <p className={styles.allDone}><Check size={18} aria-hidden="true" /> {t('workerx.strength.noTips')}</p>
        ) : (
          <ol className={styles.tips}>
            {strength.tips.map((tip, i) => (
              <li key={`${tip.code}-${tip.params?.skillId ?? i}`}>
                <Link to={(TIP_LINKS[tip.code] ?? TIP_LINKS.add_skills)(tip.params)} className={styles.tip}>
                  <span className={styles.tipNumber} aria-hidden="true">{i + 1}</span>
                  <span className={styles.tipText}>{tipText(tip)}</span>
                  <ArrowRight size={16} aria-hidden="true" className={styles.tipArrow} />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      <details className={styles.how}>
        <summary>{t('workerx.strength.how')}</summary>
        <p className={styles.muted}>{t('workerx.strength.howText')}</p>
        <ul className={styles.checks}>
          {strength.checks.map((check) => (
            <li key={check.id} data-done={check.done}>
              {check.done ? <Check size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
              <span>{t(`workerx.strength.checks.${check.id}`)}</span>
              <span className="tabular" dir="ltr">{check.weight}</span>
              <span className="visually-hidden">{t(check.done ? 'workerx.strength.done' : 'workerx.strength.missing')}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
