import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Eye, PartyPopper } from 'lucide-react';
import { Alert, Button, Card, Stepper, StatusChip, useToast } from '../../components/ui';
import { SceneArt } from '../../components/illustrations';
import Confetti from '../../components/motion/Confetti';
import AboutForm from '../../features/profile/AboutForm';
import WorkForm from '../../features/profile/WorkForm';
import { aboutValuesFrom } from '../../features/profile/aboutForm';
import { workValuesFrom } from '../../features/profile/workForm';
import SkillsEditor from '../../features/skills/SkillsEditor';
import { useAuth } from '../../context/auth';
import { useDocumentTitle, useT } from '../../i18n';
import { useOnboarding, allowedStep, STEP_IDS, DATA_STEPS } from '../../hooks/useOnboarding';
import { useMyProfile } from '../../hooks/useMyProfile';
import { useDraft } from '../../hooks/useDraft';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { PageLoading } from '../../routes/guards';
import ProofStep from './ProofStep';
import styles from './Onboarding.module.css';

// Guided worker onboarding: one task per screen; each step saves on its own; the skills step
// opens by itself right after "Your work" is saved.
export default function Onboarding() {
  const { step } = useParams();
  const { t, te } = useT();
  useDocumentTitle(t('titles.onboarding'));
  const { state, setState, error } = useOnboarding();
  // Ask for the profile only after the onboarding state says whether it exists (no 404 for new workers).
  const { profile, setProfile, error: profileError } = useMyProfile({ exists: state ? state.profileExists : false });

  if (error || profileError) return <Alert tone="danger">{te(error || profileError)}</Alert>;
  if (!state || profile === undefined) return <PageLoading />;

  const target = allowedStep(step, state);
  if (target !== step) return <Navigate to={`/onboarding/${target}`} replace />;
  return <OnboardingSteps step={step} state={state} setState={setState} profile={profile} setProfile={setProfile} />;
}

// Stays mounted while the worker moves between steps, so drafts (Back/Next) keep what was typed.
function OnboardingSteps({ step, state, setState, profile, setProfile }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useT();
  const { user, updateUser } = useAuth();
  const { categoryLabel, categoryOccupation } = useTaxonomy();
  const [about, setAbout] = useState(() => aboutValuesFrom(profile, user));
  const [work, setWork] = useState(() => workValuesFrom(profile));
  const [skillCount, setSkillCount] = useState(profile?.skills?.length ?? 0);
  // What is typed is kept on this device until it is saved (never the CNIC).
  const aboutDraft = useDraft('onboarding-about', about, setAbout, { exclude: ['cnicNumber'] });
  const workDraft = useDraft('onboarding-work', work, setWork);

  useEffect(() => {
    document.getElementById('onboarding-title')?.focus();
  }, [step]);

  const steps = STEP_IDS.map((id) => ({ id, label: t(`onboarding.steps.${id}`) }));
  const index = STEP_IDS.indexOf(step);
  const goTo = (id) => navigate(`/onboarding/${id}`);
  const back = index > 0 ? (
    <Button variant="ghost" icon={ArrowLeft} onClick={() => goTo(STEP_IDS[index - 1])}>{t('common.back')}</Button>
  ) : null;

  // After a save: go to the next step, unless the server says an earlier one is still missing.
  const afterSave = (data, nextInOrder) => {
    setProfile(data.profile);
    setState(data.onboarding);
    toast.show({ title: t('onboarding.saved') });
    const serverNext = data.onboarding.nextStep;
    const go = serverNext && STEP_IDS.indexOf(serverNext) < STEP_IDS.indexOf(nextInOrder) ? serverNext : nextInOrder;
    goTo(go);
  };

  const completed = [...DATA_STEPS.filter((s) => state.steps[s]), ...(step === 'done' ? ['proof'] : [])];
  const pendingProof = (profile?.skills ?? []).reduce((n, s) => n + (s.evidenceSummary?.pending ?? 0), 0);

  return (
    <div className={styles.page}>
      <Stepper steps={steps} current={step} completed={completed} label={t('onboarding.stepperLabel')} />
      <div className={styles.head}>
        <div className={styles.headText}>
          <h1 id="onboarding-title" tabIndex={-1}>{steps[index].label}</h1>
          <p className={styles.lead}>{t(`onboarding.leads.${step}`)}</p>
        </div>
        {/* design v3: each step has its own drawing ("All set" has a bigger one in its card) */}
        {step !== 'done' && <SceneArt key={step} name={`step-${step}`} size={104} className={styles.stepArt} />}
      </div>

      {step === 'about' && (
        <Card>
          <AboutForm
            values={about}
            onChange={setAbout}
            cnicOnFile={profile?.cnicOnFile}
            submitLabel={t('onboarding.saveContinue')}
            onSaved={(data) => {
              updateUser({ name: data.profile.user?.name, phone: data.profile.user?.phone });
              setAbout((v) => ({ ...v, cnicNumber: '' }));
              aboutDraft.clear(aboutValuesFrom(data.profile, user));
              afterSave(data, 'work');
            }}
          />
        </Card>
      )}

      {step === 'work' && (
        <Card>
          <WorkForm values={work} onChange={setWork} submitLabel={t('onboarding.saveContinue')} secondary={back} onSaved={(data) => { workDraft.clear(workValuesFrom(data.profile)); afterSave(data, 'skills'); }} />
        </Card>
      )}

      {step === 'skills' && (
        <>
          <SkillsEditor
            onSkillsChange={(list, serverState) => {
              setSkillCount(list.length);
              // Step 4 offers these skills for proof; without this it showed none until a reload
              // (found by the defence-demo rehearsal, 11 Nov 2026).
              if (profile) setProfile({ ...profile, skills: list });
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
                  {t('onboarding.skillsNeeded')}{' '}
                  <button type="button" className={styles.inlineLink} onClick={() => document.getElementById('skill-search')?.focus()}>
                    {t('onboarding.skillsNeededLink')}
                  </button>
                  .
                </p>
              )}
              <Button iconRight={ArrowRight} disabled={skillCount === 0} aria-describedby={skillCount === 0 ? 'skills-needed' : undefined} onClick={() => goTo('proof')}>
                {t('common.continue')}
              </Button>
            </div>
          </div>
        </>
      )}

      {step === 'proof' && (
        <ProofStep profile={profile} onProfileChange={setProfile} back={back} onNext={() => goTo('done')} />
      )}

      {step === 'done' && (
        <>
          <Confetti />
          <Card className={styles.doneCard}>
            <div className={styles.doneHero}>
              <SceneArt name="step-done" size={132} />
              <p className={styles.celebrate}>
                <PartyPopper size={24} aria-hidden="true" /> {t('onboarding.celebrate')}
              </p>
            </div>
            <dl className={styles.summary}>
              <div><dt>{t('onboarding.summary.name')}</dt><dd>{profile?.user?.name ?? user.name}</dd></div>
              <div><dt>{t('onboarding.summary.workerId')}</dt><dd className="tabular" dir="ltr">{profile?.workerIdCode}</dd></div>
              <div><dt>{t('onboarding.summary.trade')}</dt><dd>{categoryOccupation(profile?.category) || profile?.occupation} · {categoryLabel(profile?.category)}</dd></div>
              <div><dt>{t('onboarding.summary.skills')}</dt><dd>{t('onboarding.summary.skillsCount', { count: skillCount })}</dd></div>
              <div><dt>{t('onboarding.summary.proof')}</dt><dd>{t('onboarding.summary.proofCount', { count: pendingProof })}</dd></div>
              <div>
                <dt>{t('onboarding.summary.identity')}</dt>
                <dd><StatusChip kind="identity" status={profile?.verificationStatus} /></dd>
              </div>
            </dl>
            {profile?.verificationStatus === 'Unverified' && <Alert tone="info">{t('onboarding.addCnic')}</Alert>}
            {/* Design v3: the next steps as clear choices, the dashboard as the main one */}
            <nav className={styles.nextSteps} aria-labelledby="onboarding-next">
              <h2 id="onboarding-next" className={styles.nextTitle}>{t('onboarding.nextTitle')}</h2>
              <div className={styles.nextActions}>
                <Button to="/worker/profile" variant="secondary" icon={Eye}>{t('dashboard.viewProfile')}</Button>
                <Button to="/worker/profile/edit?section=proof" variant="secondary" icon={Camera}>{t('editor.addProof')}</Button>
              </div>
            </nav>
            <div className={styles.footer}>
              {back}
              <Button to="/worker" iconRight={ArrowRight}>{t('onboarding.goDashboard')}</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
