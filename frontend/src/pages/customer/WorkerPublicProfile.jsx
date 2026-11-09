import { useParams } from 'react-router-dom';
import { ArrowLeft, Info, UserX } from 'lucide-react';
import { Alert, Avatar, Button, Card, EmptyState, Section, StatusChip } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { PageLoading } from '../../routes/guards';
import { useApiQuery } from '../../hooks/useApiQuery';
import styles from './Customer.module.css';

// A worker's profile as a customer sees it: public fields only, no phone (D-002).
export default function WorkerPublicProfile() {
  const { workerId } = useParams();
  const { categoryLabel } = useTaxonomy();
  const { data: worker, error, status, loading } = useApiQuery(`/workers/${encodeURIComponent(workerId)}`);

  if (loading) return <PageLoading />;
  if (status === 404 || status === 400) {
    return <EmptyState icon={UserX} headingLevel={1} title="Worker not found" description="This worker ID does not exist." action={<Button to="/find">Back to search</Button>} />;
  }
  if (error) return <Alert tone="danger">{error}</Alert>;

  return (
    <div className={styles.profile}>
      <Button to="/find" variant="ghost" size="sm" icon={ArrowLeft}>Back to search</Button>
      <Card className={styles.profileHead}>
        <Avatar name={worker.user?.name ?? ''} size="lg" />
        <div className={styles.profileTitle}>
          <h1>{worker.user?.name}</h1>
          <p className={styles.trade}>{worker.occupation} · {categoryLabel(worker.category)}</p>
          <p className={styles.meta}>{worker.city} · <span className="tabular">{worker.workerIdCode}</span></p>
          <StatusChip kind="identity" status={worker.verificationStatus} />
        </div>
      </Card>

      <Alert tone="info" title="How to contact this worker">
        Contact details are shared after a booking is accepted (coming in a later module).
      </Alert>

      <div className={styles.profileGrid}>
        <Card>
          <Section title="Work details" id="details">
            <dl className={styles.facts}>
              <div><dt>Experience</dt><dd className="tabular">{worker.experienceYears ?? 0} years</dd></div>
              <div><dt>Per hour</dt><dd className="tabular">{worker.hourlyRate ? `Rs ${worker.hourlyRate.toLocaleString('en')}` : '—'}</dd></div>
              <div><dt>Per day</dt><dd className="tabular">{worker.dailyRate ? `Rs ${worker.dailyRate.toLocaleString('en')}` : '—'}</dd></div>
              <div><dt>Availability</dt><dd>{worker.availability}</dd></div>
              <div><dt>Languages</dt><dd>{(worker.languages ?? []).join(', ') || '—'}</dd></div>
            </dl>
            {worker.bio && <p className={styles.bio} dir="auto">{worker.bio}</p>}
          </Section>
        </Card>
        <Card>
          <Section title="Skills" id="skills" description='"Self-declared" means the worker added it; proof checks come next.'>
            {worker.skills?.length ? (
              <ul className={styles.skillRows}>
                {worker.skills.map((s) => (
                  <li key={s.skillId}>
                    <span>{s.name}</span>
                    <StatusChip kind="skill" status="self_declared" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.meta}><Info size={16} aria-hidden="true" className={styles.inlineIcon} /> No skills added yet.</p>
            )}
          </Section>
        </Card>
        {worker.workHistory?.length > 0 && (
          <Card className={styles.full}>
            <Section title="Past work" id="history">
              <ul className={styles.history}>
                {worker.workHistory.map((w, i) => (
                  <li key={i}>
                    <p className={styles.historyTitle} dir="auto">{w.jobTitle}{w.duration && <span className={styles.meta}> · {w.duration}</span>}</p>
                    {w.description && <p className={styles.meta} dir="auto">{w.description}</p>}
                  </li>
                ))}
              </ul>
            </Section>
          </Card>
        )}
      </div>
    </div>
  );
}
