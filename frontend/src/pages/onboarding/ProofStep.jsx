import { ArrowRight } from 'lucide-react';
import { Alert, Button, Card, Section, Skeleton, useToast } from '../../components/ui';
import EvidenceUploadForm from '../../features/evidence/EvidenceUploadForm';
import SkillProofList from '../../features/evidence/SkillProofList';
import { useApiQuery } from '../../hooks/useApiQuery';
import styles from './Onboarding.module.css';

// Onboarding Step 4 "Proof of skills" (Module 3): upload a photo for one skill; it appears as
// "Pending review". The step can always be skipped.
export default function ProofStep({ profile, onProfileChange, back, onNext }) {
  const toast = useToast();
  const { data, error, loading, reload } = useApiQuery('/evidence/mine');
  const evidence = data?.evidence ?? [];
  const skills = profile?.skills ?? [];

  const uploaded = (result) => {
    toast.show({ title: 'Photo uploaded', message: 'It is now waiting for an admin to review it.' });
    onProfileChange({
      ...profile,
      skills: skills.map((s) => (s.skillId === result.skill.skillId ? { ...s, evidenceSummary: result.skill.evidenceSummary } : s)),
    });
    reload();
  };

  return (
    <>
      <Card>
        <Section title="Add a photo" id="add-proof" description="One photo for one skill. You can add more later from your dashboard.">
          <EvidenceUploadForm skills={skills} onUploaded={uploaded} />
        </Section>
      </Card>
      <Card>
        <Section title="Your proof so far" id="my-proof">
          {error && <Alert tone="danger">{error}</Alert>}
          {loading && <Skeleton lines={3} />}
          {!loading && !error && <SkillProofList skills={skills} evidence={evidence} headingLevel={3} />}
        </Section>
      </Card>
      <div className={styles.footer}>
        {back}
        <Button iconRight={ArrowRight} onClick={onNext} variant={evidence.length ? 'primary' : 'secondary'}>
          {evidence.length ? 'Continue' : 'Skip for now'}
        </Button>
      </div>
    </>
  );
}
