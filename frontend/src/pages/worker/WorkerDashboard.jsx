import { CheckCircle2, Circle, ListChecks, Pencil } from 'lucide-react';
import { Alert, Badge, Button, Card, PageHeader, ProgressRing, StatusChip } from '../../components/ui';
import { useMyProfile } from '../../hooks/useMyProfile';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { PageLoading } from '../../routes/guards';
import styles from './Worker.module.css';

const IDENTITY_TEXT = {
  Unverified: 'Add your CNIC on your profile so an admin can check your identity.',
  Pending: 'An admin will check your CNIC in person or on a video call.',
  Verified: 'An admin has checked your identity. Customers see "Identity verified".',
  Rejected: 'Your identity check was not accepted. Please read the reason and update your profile.',
};

export default function WorkerDashboard() {
  const { profile, error } = useMyProfile();
  const { categoryLabel } = useTaxonomy();
  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!profile) return <PageLoading />;

  const firstName = (profile.user?.name ?? '').split(' ')[0];
  const nextSteps = [
    { done: profile.cnicOnFile, text: 'Add your CNIC for the identity check', to: '/worker/profile' },
    { done: profile.skills.length > 0, text: 'Add your skills', to: '/worker/skills' },
    { done: profile.workHistory.length > 0, text: 'Add a past job', to: '/worker/profile' },
    { done: false, soon: true, text: 'Add proof for your skills' },
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={<span className="tabular">Worker ID {profile.workerIdCode}</span>}
        title={`Welcome, ${firstName}`}
        description={`${profile.occupation} · ${categoryLabel(profile.category)} · ${profile.city}`}
        actions={<Button to="/worker/profile" variant="secondary" icon={Pencil}>Edit profile</Button>}
      />
      <div className={styles.grid}>
        <Card className={styles.completion}>
          <ProgressRing value={profile.profileCompletion} label="Profile completion" />
          <div>
            <h2 className={styles.cardTitle}>Profile completion</h2>
            <p className={styles.muted}>A complete profile helps customers choose you.</p>
          </div>
        </Card>

        <Card>
          <h2 className={styles.cardTitle}>Identity</h2>
          <div className={styles.stack}>
            <StatusChip kind="identity" status={profile.verificationStatus} />
            <p className={styles.muted}>{IDENTITY_TEXT[profile.verificationStatus]}</p>
            {profile.verificationStatus === 'Rejected' && profile.identityNote && (
              <Alert tone="danger" title="Reason from the admin">{profile.identityNote}</Alert>
            )}
          </div>
        </Card>

        <Card className={styles.wideCard}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Your skills</h2>
            <Button to="/worker/skills" size="sm" icon={ListChecks}>Update skills</Button>
          </div>
          {profile.skills.length === 0 ? (
            <p className={styles.muted}>No skills yet. Add them so customers can find you.</p>
          ) : (
            <ul className={styles.skillList}>
              {profile.skills.map((s) => (
                <li key={s.skillId} className={styles.skillRow}>
                  <span className={styles.skillName}>{s.name}</span>
                  <StatusChip kind="skill" status="self_declared" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className={styles.wideCard}>
          <h2 className={styles.cardTitle}>Next steps</h2>
          <ul className={styles.checklist}>
            {nextSteps.map((s) => (
              <li key={s.text} className={styles.checkItem}>
                {s.done ? (
                  <CheckCircle2 size={20} className={styles.doneIcon} aria-hidden="true" />
                ) : (
                  <Circle size={20} className={styles.todoIcon} aria-hidden="true" />
                )}
                <span className={s.done ? styles.doneText : undefined}>
                  {s.text}
                  <span className="visually-hidden">{s.done ? ' (done)' : s.soon ? ' (coming next)' : ' (to do)'}</span>
                </span>
                {s.soon ? <Badge tone="accent">Coming next</Badge> : !s.done && <Button to={s.to} size="sm" variant="ghost">Do it</Button>}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
