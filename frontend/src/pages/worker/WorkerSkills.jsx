import { ArrowLeft } from 'lucide-react';
import { Button, PageHeader } from '../../components/ui';
import SkillsEditor from '../../features/skills/SkillsEditor';
import styles from './Worker.module.css';

export default function WorkerSkills() {
  return (
    <div className={styles.narrow}>
      <PageHeader
        title="Your skills"
        description="Describe your work and choose the skills that are right. Nothing is saved until you click a save button."
        actions={<Button to="/worker" variant="ghost" icon={ArrowLeft}>Dashboard</Button>}
      />
      <SkillsEditor />
    </div>
  );
}
