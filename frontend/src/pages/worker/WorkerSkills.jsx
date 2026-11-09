import { useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import API from '../../api';
import { Alert, Button, Card, Drawer, PageHeader, Section, Skeleton, useToast } from '../../components/ui';
import SkillsEditor from '../../features/skills/SkillsEditor';
import EvidenceUploadForm from '../../features/evidence/EvidenceUploadForm';
import SkillProofList from '../../features/evidence/SkillProofList';
import { useApiQuery } from '../../hooks/useApiQuery';
import { apiMessage } from '../../utils/apiErrors';
import styles from './Worker.module.css';

export default function WorkerSkills() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const proofFor = params.get('proof'); // ?proof=<skillId> opens the upload drawer for that skill
  const skillsQuery = useApiQuery('/workers/me/skills');
  const evidenceQuery = useApiQuery('/evidence/mine');
  const skills = skillsQuery.data?.skills ?? [];
  const evidence = evidenceQuery.data?.evidence ?? [];

  const openProof = (skillId) => setParams({ proof: skillId });
  const closeProof = () => setParams({});
  const refresh = () => {
    skillsQuery.reload();
    evidenceQuery.reload();
  };

  const remove = async (item) => {
    try {
      await API.delete(`/evidence/${item._id}`);
      toast.show({ tone: 'info', title: 'Proof deleted' });
      refresh();
    } catch (err) {
      toast.show({ tone: 'danger', title: 'Could not delete', message: apiMessage(err) });
    }
  };

  return (
    <div className={styles.narrow}>
      <PageHeader
        title="Your skills"
        description="Describe your work and choose the skills that are right. Then add photos as proof. Nothing is saved until you click a save button."
        actions={<Button to="/worker" variant="ghost" icon={ArrowLeft}>Dashboard</Button>}
      />
      <div className={styles.sections}>
        <SkillsEditor onSkillsChange={() => skillsQuery.reload()} />
        <Card>
          <Section
            title="Proof of skills"
            id="proof"
            description="An admin checks every photo. A skill shows “Verified by evidence” after at least one photo is approved."
          >
            {(skillsQuery.error || evidenceQuery.error) && <Alert tone="danger">{skillsQuery.error || evidenceQuery.error}</Alert>}
            {(skillsQuery.loading || evidenceQuery.loading) ? (
              <Skeleton lines={4} />
            ) : (
              <SkillProofList skills={skills} evidence={evidence} onAddProof={openProof} onDelete={remove} />
            )}
          </Section>
        </Card>
      </div>
      <Drawer open={Boolean(proofFor) && skills.length > 0} onClose={closeProof} title="Add proof" description="One photo for one skill.">
        {proofFor && skills.length > 0 && (
          <EvidenceUploadForm
            key={proofFor}
            skills={skills}
            defaultSkillId={skills.some((s) => s.skillId === proofFor) ? proofFor : ''}
            onUploaded={() => {
              toast.show({ title: 'Photo uploaded', message: 'It is now waiting for an admin to review it.' });
              closeProof();
              refresh();
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
