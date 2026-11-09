import { useState } from 'react';
import { ListChecks } from 'lucide-react';
import { Alert, Badge, Button, Card, PageHeader, Section, StatusChip, useToast } from '../../components/ui';
import AboutForm from '../../features/profile/AboutForm';
import WorkForm from '../../features/profile/WorkForm';
import { aboutValuesFrom } from '../../features/profile/aboutForm';
import { workValuesFrom } from '../../features/profile/workForm';
import { useAuth } from '../../context/auth';
import { useMyProfile } from '../../hooks/useMyProfile';
import { PageLoading } from '../../routes/guards';
import styles from './Worker.module.css';

export default function WorkerProfileEdit() {
  const { profile, setProfile, error } = useMyProfile();
  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!profile) return <PageLoading />;
  return <ProfileEditor profile={profile} setProfile={setProfile} />;
}

function ProfileEditor({ profile, setProfile }) {
  const toast = useToast();
  const { user, updateUser } = useAuth();
  const [about, setAbout] = useState(() => aboutValuesFrom(profile, user));
  const [work, setWork] = useState(() => workValuesFrom(profile));

  const saved = (data) => {
    setProfile(data.profile);
    updateUser({ name: data.profile.user?.name, phone: data.profile.user?.phone });
    setAbout((v) => ({ ...v, cnicNumber: '' }));
    toast.show({ title: 'Profile saved' });
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Your profile"
        eyebrow={<span className="tabular">Worker ID {profile.workerIdCode}</span>}
        description="Only your name, trade, city, experience, rates, languages, bio, skills and past jobs (without the client's name) are shown to customers."
      />
      <div className={styles.sections}>
        <Card>
          <Section
            title="About you"
            id="about"
            actions={<StatusChip kind="identity" status={profile.verificationStatus} />}
            description={profile.cnicOnFile ? 'Your CNIC is saved in encrypted form. It is never shown, not even to you.' : 'You have not added your CNIC yet.'}
          >
            <AboutForm values={about} onChange={setAbout} cnicOnFile={profile.cnicOnFile} onSaved={saved} submitLabel="Save personal details" />
          </Section>
        </Card>
        <Card>
          <Section title="Your work" id="work">
            <WorkForm values={work} onChange={setWork} onSaved={saved} submitLabel="Save work details" />
          </Section>
        </Card>
        <Card>
          <Section
            title="Skills"
            id="skills"
            description={`${profile.skills.length} skill${profile.skills.length === 1 ? '' : 's'} on your profile.`}
            actions={<Button to="/worker/skills" variant="secondary" icon={ListChecks}>Edit skills</Button>}
          >
            {profile.skills.length > 0 && (
              <ul className={styles.chips}>
                {profile.skills.map((s) => <li key={s.skillId}><Badge tone="primary">{s.name}</Badge></li>)}
              </ul>
            )}
          </Section>
        </Card>
      </div>
    </div>
  );
}
