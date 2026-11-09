import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileImage } from 'lucide-react';
import { Alert, Badge, Button, Card, Stepper, StatusChip, useToast } from '../../components/ui';
import AboutForm from '../../features/profile/AboutForm';
import WorkForm from '../../features/profile/WorkForm';
import { aboutValuesFrom } from '../../features/profile/aboutForm';
import { workValuesFrom } from '../../features/profile/workForm';
import SkillsEditor from '../../features/skills/SkillsEditor';
import { useAuth } from '../../context/auth';
import { useOnboarding, allowedStep, ONBOARDING_STEPS, STEP_IDS, DATA_STEPS } from '../../hooks/useOnboarding';
import { useMyProfile } from '../../hooks/useMyProfile';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { PageLoading } from '../../routes/guards';
import styles from './Onboarding.module.css';

// Guided worker onboarding: one task per screen; each step saves on its own; the skills step
// opens by itself right after "Your work" is saved.
export default function Onboarding() {
  const { step } = useParams();
  const { state, setState, error } = useOnboarding();
  const { profile, setProfile, error: profileError } = useMyProfile();

  if (error || profileError) return <Alert tone="danger">{error || profileError}</Alert>;
  if (!state || profile === undefined) return <PageLoading />;

  const target = allowedStep(step, state);
  if (target !== step) return <Navigate to={`/onboarding/${target}`} replace />;
  return <OnboardingSteps step={step} state={state} setState={setState} profile={profile} setProfile={setProfile} />;
}

// Stays mounted while the worker moves between steps, so drafts (Back/Next) keep what was typed.
function OnboardingSteps({ step, state, setState, profile, setProfile }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, updateUser } = useAuth();
  const { categoryLabel } = useTaxonomy();
  const [about, setAbout] = useState(() => aboutValuesFrom(profile, user));
  const [work, setWork] = useState(() => workValuesFrom(profile));
  const [skillCount, setSkillCount] = useState(profile?.skills?.length ?? 0);

  useEffect(() => {
    document.getElementById('onboarding-title')?.focus();
  }, [step]);

  const index = STEP_IDS.indexOf(step);
  const goTo = (id) => navigate(`/onboarding/${id}`);
  const back = index > 0 ? (
    <Button variant="ghost" icon={ArrowLeft} onClick={() => goTo(STEP_IDS[index - 1])}>Back</Button>
  ) : null;

  // After a save: go to the next step, unless the server says an earlier one is still missing.
  const afterSave = (data, nextInOrder) => {
    setProfile(data.profile);
    setState(data.onboarding);
    toast.show({ title: 'Saved' });
    const serverNext = data.onboarding.nextStep;
    const go = serverNext && STEP_IDS.indexOf(serverNext) < STEP_IDS.indexOf(nextInOrder) ? serverNext : nextInOrder;
    goTo(go);
  };

  const completed = [...DATA_STEPS.filter((s) => state.steps[s]), ...(step === 'done' ? ['proof'] : [])];
  const current = ONBOARDING_STEPS[index];

  return (
    <div className={styles.page}>
      <Stepper steps={ONBOARDING_STEPS} current={step} completed={completed} label="Onboarding steps" />
      <div className={styles.head}>
        <h1 id="onboarding-title" tabIndex={-1}>{current.label}</h1>
        <p className={styles.lead}>{LEADS[step]}</p>
      </div>

      {step === 'about' && (
        <Card>
          <AboutForm
            values={about}
            onChange={setAbout}
            cnicOnFile={profile?.cnicOnFile}
            submitLabel="Save and continue"
            onSaved={(data) => {
              updateUser({ name: data.profile.user?.name, phone: data.profile.user?.phone });
              setAbout((v) => ({ ...v, cnicNumber: '' }));
              afterSave(data, 'work');
            }}
          />
        </Card>
      )}

      {step === 'work' && (
        <Card>
          <WorkForm values={work} onChange={setWork} submitLabel="Save and continue" secondary={back} onSaved={(data) => afterSave(data, 'skills')} />
        </Card>
      )}

      {step === 'skills' && (
        <>
          <SkillsEditor
            onSkillsChange={(list) => {
              setSkillCount(list.length);
              setState((s) => ({ ...s, steps: { ...s.steps, skills: list.length > 0 } }));
            }}
            onProfileSuggestionUsed={(data) => {
              setProfile(data.profile);
              setWork(workValuesFrom(data.profile));
            }}
          />
          <div className={styles.footer}>
            {back}
            <div className={styles.footerRight}>
              {skillCount === 0 && <p className={styles.hint} id="skills-needed">Add at least one skill to continue.</p>}
              <Button iconRight={ArrowRight} disabled={skillCount === 0} aria-describedby={skillCount === 0 ? 'skills-needed' : undefined} onClick={() => goTo('proof')}>
                Continue
              </Button>
            </div>
          </div>
        </>
      )}

      {step === 'proof' && (
        <Card>
          <div className={styles.proof}>
            <span className={styles.proofIcon}><FileImage size={28} strokeWidth={1.75} aria-hidden="true" /></span>
            <div className={styles.proofText}>
              <Badge tone="accent">Coming next</Badge>
              <p className={styles.proofTitle}>Upload photos of certificates or your work to get skills verified.</p>
              <p className={styles.hint}>This part is not ready yet. Your skills show as &quot;Self-declared&quot; until then.</p>
            </div>
          </div>
          <div className={styles.footer}>
            {back}
            <Button iconRight={ArrowRight} onClick={() => goTo('done')}>Skip for now</Button>
          </div>
        </Card>
      )}

      {step === 'done' && (
        <Card>
          <dl className={styles.summary}>
            <div><dt>Name</dt><dd>{profile?.user?.name ?? user.name}</dd></div>
            <div><dt>Your worker ID</dt><dd className="tabular">{profile?.workerIdCode}</dd></div>
            <div><dt>Trade</dt><dd>{profile?.occupation} · {categoryLabel(profile?.category)}</dd></div>
            <div><dt>Skills</dt><dd>{skillCount} added (Self-declared)</dd></div>
            <div>
              <dt>Identity</dt>
              <dd><StatusChip kind="identity" status={profile?.verificationStatus} /></dd>
            </div>
          </dl>
          {profile?.verificationStatus === 'Unverified' && (
            <Alert tone="info">Add your CNIC on your profile so an admin can check your identity.</Alert>
          )}
          <div className={styles.footer}>
            {back}
            <Button to="/worker" iconRight={ArrowRight}>Go to my dashboard</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

const LEADS = {
  about: 'Your name, how to reach you, and where you work. Customers never see your phone or CNIC.',
  work: 'Your trade, experience and rates. This is what customers see first.',
  skills: 'Tell us about your work. We suggest skills; you choose which ones to add.',
  proof: 'Proof makes your skills stronger.',
  done: 'Your profile is ready. Here is what we saved.',
};
