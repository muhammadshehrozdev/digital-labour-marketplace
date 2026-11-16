import { ArrowRight } from 'lucide-react';
import { Alert, Button, Card, Section, Skeleton, useToast } from '../../components/ui';
import EvidenceUploadForm from '../../features/evidence/EvidenceUploadForm';
import SkillProofList from '../../features/evidence/SkillProofList';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';
import styles from './Onboarding.module.css';

// Onboarding Step 4 "Proof of skills" (Module 3): upload a photo for one skill; it appears as
// "Pending review". The step can always be skipped.
export default function ProofStep({ profile, onProfileChange, back, onNext }) {
  const toast = useToast();
  const { t, te } = useT();
  const { data, error, loading, reload } = useApiQuery('/evidence/mine');
  const evidence = data?.evidence ?? [];
  const skills = profile?.skills ?? [];

  const uploaded = (result) => {
    toast.show({ title: t('evidence.uploaded'), message: t('evidence.uploadedText') });
    onProfileChange({
      ...profile,
      skills: skills.map((s) => (s.skillId === result.skill.skillId ? { ...s, evidenceSummary: result.skill.evidenceSummary } : s)),
    });
    reload();
  };

  return (
    <>
      <Card>
        <Section title={t('onboarding.proof.addTitle')} id="add-proof" description={t('onboarding.proof.addText')}>
          <EvidenceUploadForm skills={skills} onUploaded={uploaded} />
        </Section>
      </Card>
      <Card>
        <Section title={t('onboarding.proof.soFar')} id="my-proof">
          {error && <Alert tone="danger">{te(error)}</Alert>}
          {loading && <Skeleton lines={3} />}
          {!loading && !error && <SkillProofList skills={skills} evidence={evidence} headingLevel={3} />}
        </Section>
      </Card>
      <div className={styles.footer} data-bottom-bar>
        {back}
        <Button iconRight={ArrowRight} onClick={onNext} variant={evidence.length ? 'primary' : 'secondary'}>
          {evidence.length ? t('common.continue') : t('onboarding.proof.skip')}
        </Button>
      </div>
    </>
  );
}
