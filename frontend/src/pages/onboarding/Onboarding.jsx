import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Alert, Button, Card, Stepper, StatusChip, useToast } from '../../components/ui';
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
import ProofStep from './ProofStep';
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
            onSkillsChange={(list, serverState) => {
              setSkillCount(list.length);
              // Use the server's onboarding state (complete, nextStep), so Continue is allowed (Batch 3 fix).
              if (serverState) setState(serverState);
            }}
            onProfileSuggestionUsed={(data) => {
              setProfile(data.profile);
              setWork(workValuesFrom(data.profile));
            }}
          />
          <div className={styles.footer}>
            {back}
            <div className={styles.footerRight}>
              {skillCount === 0 && (
                <p className={styles.hint} id="skills-needed">
                  Add at least one skill to continue: use “Find my skills”, or{' '}
                  <button type="button" className={styles.inlineLink} onClick={() => document.getElementById('skill-search')?.focus()}>
                    search the skill list
                  </button>
                  .
                </p>
              )}
              <Button iconRight={ArrowRight} disabled={skillCount === 0} aria-describedby={skillCount === 0 ? 'skills-needed' : undefined} onClick={() => goTo('proof')}>
                Continue
              </Button>
            </div>
          </div>
        </>
      )}

      {step === 'proof' && (
        <ProofStep profile={profile} onProfileChange={setProfile} back={back} onNext={() => goTo('done')} />
      )}

      {step === 'done' && (
        <Card>
          <dl className={styles.summary}>
            <div><dt>Name</dt><dd>{profile?.user?.name ?? user.name}</dd></div>
            <div><dt>Your worker ID</dt><dd className="tabular">{profile?.workerIdCode}</dd></div>
            <div><dt>Trade</dt><dd>{profile?.occupation} · {categoryLabel(profile?.category)}</dd></div>
            <div><dt>Skills</dt><dd>{skillCount} added</dd></div>
            <div><dt>Proof</dt><dd>{(profile?.skills ?? []).reduce((n, s) => n + (s.evidenceSummary?.pending ?? 0), 0)} waiting for review</dd></div>
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
  proof: 'A photo of a certificate, a finished job or a reference letter makes a skill stronger. An admin checks every photo.',
  done: 'Your profile is ready. Here is what we saved.',
};
