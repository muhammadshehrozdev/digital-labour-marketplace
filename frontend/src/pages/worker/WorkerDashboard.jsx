// /worker: an overview only (D-020). No edit forms here: "View my profile" and "Edit profile".
// Design v3 (Batch 4): a bento of the profile strength with real next steps (feature 10), skills
// the worker may also do (feature 11), identity, skills and proof. Every number is the worker's
// own data from GET /api/workers/me/full.
import { useEffect, useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import Confetti from '../../components/motion/Confetti';
import { useAuth } from '../../context/auth';
import { markCelebrated, milestoneToCelebrate } from '../../features/worker/milestones';
import { Alert, Badge, Button, PageHeader, StatusChip } from '../../components/ui';
import { SceneArt } from '../../components/illustrations';
import Reveal from '../../components/motion/Reveal';
import CopyId from '../../features/worker/CopyId';
import CountUp from '../../features/worker/CountUp';
import PotentialSkills from '../../features/worker/PotentialSkills';
import StrengthMeter from '../../features/worker/StrengthMeter';
import WelcomeTour from '../../features/worker/WelcomeTour';
import { ShareButton } from '../../features/customer/ShareButtons';
import { useMyFullProfile } from '../../hooks/useMyFullProfile';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from './Worker.module.css';

const SKILL_TONE = { verified: 'success', evidence_pending: 'warning', disputed: 'danger' };

export default function WorkerDashboard() {
  const { t, te, formatNumber } = useT();
  useDocumentTitle(t('titles.dashboard'));
  const full = useMyFullProfile();
  const { categoryLabel, categoryOccupation, skillName } = useTaxonomy();
  const { user } = useAuth();
  const [party, setParty] = useState(null);
  const level = full.data?.strength?.level;
  const approvedCount = (full.data?.evidence ?? []).filter((e) => e.status === 'approved').length;
  // a milestone reached since the last visit is celebrated once (feature 52)
  useEffect(() => {
    if (!level) return undefined;
    const milestone = milestoneToCelebrate(user?._id, { level, approved: approvedCount });
    if (!milestone) return undefined;
    markCelebrated(user._id, milestone.id);
    const timer = window.setTimeout(() => setParty(milestone.variant), 400);
    return () => window.clearTimeout(timer);
  }, [level, approvedCount, user]);
  if (full.error) return <Alert tone="danger">{te(full.error)}</Alert>;
  if (!full.data) return <PageLoading />;

  const { profile, evidence, strength } = full.data;
  const firstName = (profile.user?.name ?? '').split(' ')[0];
  const counts = { approved: 0, pending: 0, rejected: 0 };
  for (const e of evidence) if (e.status in counts) counts[e.status] += 1;
  const trade = categoryOccupation(profile.category) || profile.occupation;
  // a newly added skill changes the profile at once (and the strength on the next load)
  const onSkillsChange = (skills) => full.update({ profile: { ...full.data.profile, skills } });

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={<CopyId id={profile.workerIdCode} />}
        title={t('dashboard.welcome', { name: firstName })}
        description={[trade, categoryLabel(profile.category), profile.city].filter(Boolean).join(' · ')}
        actions={
          <>
            {full.data.listedInDirectory && <ShareButton size="md" workerIdCode={profile.workerIdCode} name={profile.user?.name ?? ''} trade={trade} />}
            <Button to="/worker/profile" variant="secondary" icon={Eye}>{t('dashboard.viewProfile')}</Button>
            <Button to="/worker/profile/edit" icon={Pencil}>{t('dashboard.editProfile')}</Button>
          </>
        }
      />
      <div className={styles.bento}>
        <Reveal className={styles.strengthCell}><StrengthMeter strength={strength} /></Reveal>

        <Reveal index={1} className={`${styles.tile} ${styles.identityCell}`}>
          <h2 className={styles.cardTitle}>{t('dashboard.identityTitle')}</h2>
          <div className={styles.stack}>
            <StatusChip kind="identity" status={profile.verificationStatus} />
            <p className={styles.muted}>{t(`dashboard.identityText.${profile.verificationStatus}`)}</p>
            {profile.verificationStatus === 'Rejected' && profile.identityNote && (
              <Alert tone="danger" title={t('dashboard.adminReason')}><span dir="auto">{profile.identityNote}</span></Alert>
            )}
          </div>
        </Reveal>

        <Reveal index={2} className={`${styles.tile} ${styles.proofCell}`} data-tour="proof" data-art-hover>
          <div className={styles.proofHead}>
            <h2 className={styles.cardTitle}>{t('dashboard.proofTitle')}</h2>
            <Button to="/worker/profile/edit?section=proof" size="sm" variant="secondary">{t('editor.addProof')}</Button>
          </div>
          {evidence.length ? (
            <dl className={styles.counts}>
              {['approved', 'pending', 'rejected'].map((key) => (
                <div key={key} data-kind={key}>
                  <dt>{t(`status.evidence.${key}`)}</dt>
                  <dd><CountUp value={counts[key]} format={formatNumber} /></dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className={styles.proofEmpty}>
              <SceneArt name="empty-proof" size={120} />
              <p className={styles.muted}>{t('dashboard.proofEmpty')}</p>
            </div>
          )}
        </Reveal>

        <Reveal index={1} className={styles.potentialCell}><PotentialSkills onSkillsChange={onSkillsChange} /></Reveal>

        <Reveal index={2} className={`${styles.tile} ${styles.skillsCell}`}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{t('dashboard.skillsTitle')}</h2>
            <span className={styles.muted}>{t('dashboard.skillsCount', { count: profile.skills.length })}</span>
          </div>
          {profile.skills.length === 0 ? (
            <p className={styles.muted}>{t('dashboard.skillsEmpty')}</p>
          ) : (
            <ul className={styles.chips}>
              {profile.skills.map((s) => {
                const status = s.evidenceSummary?.status ?? 'self_declared';
                return (
                  <li key={s.skillId}>
                    <Badge tone={SKILL_TONE[status] ?? 'primary'}>
                      {skillName(s)}
                      <span className={styles.chipStatus}> · {t(`status.skill.${status}`)}</span>
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Reveal>
      </div>
      <WelcomeTour />
      {party && <Confetti key={party} variant={party} />}
    </div>
  );
}
