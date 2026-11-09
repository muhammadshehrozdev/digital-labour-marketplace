import { ArrowRight, CheckCircle2, Circle, Eye, ImagePlus, Pencil } from 'lucide-react';
import { Alert, Badge, Button, Card, PageHeader, ProgressRing, StatusChip } from '../../components/ui';
import Reveal from '../../components/motion/Reveal';
import { useMyFullProfile } from '../../hooks/useMyFullProfile';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from './Worker.module.css';

const SKILL_TONE = { verified: 'success', evidence_pending: 'warning', disputed: 'danger' };

// /worker: an overview only (D-020). No edit forms here: "View my profile" and "Edit profile".
export default function WorkerDashboard() {
  const { t, te } = useT();
  useDocumentTitle(t('titles.dashboard'));
  const { data, error } = useMyFullProfile();
  const { categoryLabel, categoryOccupation, skillName } = useTaxonomy();
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  if (!data) return <PageLoading />;

  const { profile, evidence } = data;
  const firstName = (profile.user?.name ?? '').split(' ')[0];
  const counts = { approved: 0, pending: 0, rejected: 0 };
  for (const e of evidence) if (e.status in counts) counts[e.status] += 1;
  const skillWithoutProof = profile.skills.find((sk) => !evidence.some((e) => e.skillId === sk.skillId)) ?? profile.skills[0];
  const nextSteps = [
    { id: 'cnic', done: profile.cnicOnFile, to: '/worker/profile/edit?section=about' },
    { id: 'skills', done: profile.skills.length > 0, to: '/worker/profile/edit?section=skills' },
    { id: 'job', done: profile.workHistory.length > 0, to: '/worker/profile/edit?section=history' },
    { id: 'proof', done: evidence.length > 0, to: `/worker/profile/edit?section=proof${skillWithoutProof ? `&skill=${encodeURIComponent(skillWithoutProof.skillId)}` : ''}` },
  ];
  const allDone = nextSteps.every((s) => s.done);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={<span className="tabular" dir="ltr">{t('dashboard.workerId', { id: profile.workerIdCode })}</span>}
        title={t('dashboard.welcome', { name: firstName })}
        description={[categoryOccupation(profile.category) || profile.occupation, categoryLabel(profile.category), profile.city].filter(Boolean).join(' · ')}
        actions={
          <>
            <Button to="/worker/profile" variant="secondary" icon={Eye}>{t('dashboard.viewProfile')}</Button>
            <Button to="/worker/profile/edit" icon={Pencil}>{t('dashboard.editProfile')}</Button>
          </>
        }
      />
      <div className={styles.grid}>
        <Reveal as={Card} index={0} className={styles.completion}>
          <ProgressRing value={profile.profileCompletion} label={t('ui.profileCompletion')} />
          <div>
            <h2 className={styles.cardTitle}>{t('dashboard.completionTitle')}</h2>
            <p className={styles.muted}>{t('dashboard.completionText')}</p>
          </div>
        </Reveal>

        <Reveal as={Card} index={1}>
          <h2 className={styles.cardTitle}>{t('dashboard.identityTitle')}</h2>
          <div className={styles.stack}>
            <StatusChip kind="identity" status={profile.verificationStatus} />
            <p className={styles.muted}>{t(`dashboard.identityText.${profile.verificationStatus}`)}</p>
            {profile.verificationStatus === 'Rejected' && profile.identityNote && (
              <Alert tone="danger" title={t('dashboard.adminReason')}>{profile.identityNote}</Alert>
            )}
          </div>
        </Reveal>

        <Reveal as={Card} index={2} className={styles.wideCard}>
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

        <Reveal as={Card} index={3} className={styles.wideCard}>
          <h2 className={styles.cardTitle}>{t('dashboard.proofTitle')}</h2>
          {evidence.length ? (
            <p className={styles.proofCounts}>
              <span className="tabular">{t('dashboard.proofCounts', counts)}</span>
            </p>
          ) : (
            <p className={styles.muted}>{t('dashboard.proofEmpty')}</p>
          )}
        </Reveal>

        <Reveal as={Card} index={4} className={styles.wideCard}>
          <h2 className={styles.cardTitle}>{t('dashboard.nextTitle')}</h2>
          {allDone ? (
            <p className={styles.muted}><CheckCircle2 size={18} aria-hidden="true" className={styles.doneIcon} /> {t('dashboard.allDone')}</p>
          ) : (
            <ul className={styles.checklist}>
              {nextSteps.map((s) => (
                <li key={s.id} className={styles.checkItem}>
                  {s.done ? (
                    <CheckCircle2 size={20} className={styles.doneIcon} aria-hidden="true" />
                  ) : (
                    <Circle size={20} className={styles.todoIcon} aria-hidden="true" />
                  )}
                  <span className={s.done ? styles.doneText : undefined}>
                    {t(`dashboard.next.${s.id}`)}
                    <span className="visually-hidden"> {s.done ? t('common.done') : t('common.toDo')}</span>
                  </span>
                  {!s.done && (
                    <Button to={s.to} size="sm" variant="ghost" icon={s.id === 'proof' ? ImagePlus : undefined} iconRight={s.id === 'proof' ? undefined : ArrowRight}>
                      {t('dashboard.doIt')}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </div>
  );
}
