import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, Eye, FileCheck2, Globe, History, ListChecks, UserRound } from 'lucide-react';
import API from '../../api';
import { Alert, Badge, Button, Card, ConfirmDialog, PageHeader, RadioCardGroup, Section, Skeleton, StatusChip, Tabs, useToast } from '../../components/ui';
import AboutForm from '../../features/profile/AboutForm';
import WorkForm from '../../features/profile/WorkForm';
import { aboutValuesFrom } from '../../features/profile/aboutForm';
import { workValuesFrom } from '../../features/profile/workForm';
import SkillsEditor from '../../features/skills/SkillsEditor';
import EvidenceUploadForm from '../../features/evidence/EvidenceUploadForm';
import SkillProofList from '../../features/evidence/SkillProofList';
import { useAuth } from '../../context/auth';
import { useMyFullProfile } from '../../hooks/useMyFullProfile';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useDraft } from '../../hooks/useDraft';
import { LANGUAGES, useChangeLanguage, useDocumentTitle, useLanguage } from '../../i18n';
import { apiError } from '../../utils/apiErrors';
import { PageLoading } from '../../routes/guards';
import styles from './Worker.module.css';

const SECTIONS = [
  { id: 'about', icon: UserRound },
  { id: 'work', icon: Briefcase },
  { id: 'skills', icon: ListChecks },
  { id: 'proof', icon: FileCheck2 },
  { id: 'history', icon: History },
  { id: 'language', icon: Globe },
];
const SECTION_IDS = SECTIONS.map((s) => s.id);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// /worker/profile/edit: everything editable in one place (D-020). Each section saves on its own.
export default function WorkerProfileEdit() {
  const { t, te } = useLanguage();
  useDocumentTitle(t('titles.profileEdit'));
  const full = useMyFullProfile();
  if (full.error) return <Alert tone="danger">{te(full.error)}</Alert>;
  if (!full.data) return <PageLoading />;
  return <Editor full={full} />;
}

function Editor({ full }) {
  const toast = useToast();
  const { t, te, lang, info } = useLanguage();
  const changeLanguage = useChangeLanguage();
  const { user, updateUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const { profile, evidence } = full.data;
  const section = SECTION_IDS.includes(params.get('section')) ? params.get('section') : 'about';

  // Drafts and the last saved values (the baseline), to know what is not saved yet.
  const [about, setAbout] = useState(() => aboutValuesFrom(profile, user));
  const [aboutBase, setAboutBase] = useState(about);
  const [work, setWork] = useState(() => workValuesFrom(profile));
  const [workBase, setWorkBase] = useState(work);
  // Drafts stay on this device until the section is saved (never the CNIC).
  const aboutDraft = useDraft('edit-about', about, setAbout, { exclude: ['cnicNumber'] });
  const workDraft = useDraft('edit-work', work, setWork);
  const dirty = {
    about: !same(about, aboutBase),
    work: ['occupation', 'category', 'experienceYears', 'hourlyRate', 'dailyRate', 'availability', 'bio'].some((k) => String(work[k]) !== String(workBase[k])),
    history: !same(work.workHistory, workBase.workHistory),
  };
  const anyDirty = dirty.about || dirty.work || dirty.history;
  const guard = useUnsavedChanges(anyDirty);
  const [pendingSection, setPendingSection] = useState(null);

  const openSection = (id, extra = {}) => setParams({ section: id, ...extra }, { replace: true });
  const askOpen = (id) => {
    if (dirty[section]) setPendingSection(id);
    else openSection(id);
  };
  const discardAndOpen = () => {
    if (section === 'about') { setAbout(aboutBase); aboutDraft.clear(); }
    if (section === 'work' || section === 'history') { setWork(workBase); workDraft.clear(); }
    openSection(pendingSection);
    setPendingSection(null);
  };

  // After any save: the server's profile is the new truth (the view page shows it at once).
  const saved = (data, part) => {
    full.update({ profile: data.profile, onboarding: data.onboarding });
    if (part === 'about') {
      updateUser({ name: data.profile.user?.name, phone: data.profile.user?.phone });
      const next = { ...aboutValuesFrom(data.profile, user), cnicNumber: '' };
      setAbout(next);
      setAboutBase(next);
      aboutDraft.clear(next);
    } else {
      const next = workValuesFrom(data.profile);
      // keep the other part's draft, so saving "Work and rates" does not drop unsaved history
      const merged = part === 'work' ? { ...next, workHistory: work.workHistory } : { ...work, workHistory: next.workHistory };
      setWork(merged);
      workDraft.clear(part === 'work' ? { ...next, workHistory: workBase.workHistory } : { ...workBase, workHistory: next.workHistory });
      setWorkBase((base) => (part === 'work' ? { ...next, workHistory: base.workHistory } : { ...base, workHistory: next.workHistory }));
    }
    toast.show({ title: t('editor.saved'), message: t('editor.savedText') });
  };

  const deleteProof = async (item) => {
    try {
      await API.delete(`/evidence/${item._id}`);
      toast.show({ tone: 'info', title: t('evidence.deleted') });
      full.reload();
    } catch (err) {
      toast.show({ tone: 'danger', title: t('evidence.deleteFailed'), message: te(apiError(err)) });
    }
  };

  const unsaved = <Badge tone="warning" className={styles.unsavedBadge}>{t('editor.unsavedBadge')}</Badge>;
  const tabs = SECTIONS.map(({ id, icon }) => ({
    id,
    icon,
    label: t(`editor.sections.${id}`),
    badge: dirty[id] ? <span className={styles.dirtyDot} aria-label={t('editor.unsavedBadge')} /> : null,
    content: null,
  }));
  const contents = {
    about: (
      <Card>
        <Section
          title={t('editor.sections.about')}
          id="about"
          actions={<>{dirty.about && unsaved}<StatusChip kind="identity" status={profile.verificationStatus} /></>}
          description={profile.cnicOnFile ? t('editor.cnicSaved') : t('editor.cnicMissing')}
        >
          <AboutForm values={about} onChange={setAbout} cnicOnFile={profile.cnicOnFile} onSaved={(d) => saved(d, 'about')} submitLabel={t('editor.saveAbout')} />
        </Section>
      </Card>
    ),
    work: (
      <Card>
        <Section title={t('editor.sections.work')} id="work" actions={dirty.work && unsaved} description={t('editor.publicNote')}>
          <WorkForm parts={['work']} values={work} onChange={setWork} onSaved={(d) => saved(d, 'work')} submitLabel={t('editor.saveWork')} />
        </Section>
      </Card>
    ),
    skills: (
      <SkillsEditor
        onSkillsChange={(list) => full.update({ profile: { ...full.data.profile, skills: list } })}
        onProfileSuggestionUsed={(d) => saved(d, 'work')}
      />
    ),
    proof: (
      <div className={styles.sections}>
        <Card>
          <Section title={t('editor.addProof')} id="add-proof" description={t('editor.addProofText')}>
            {profile.skills.length ? (
              <EvidenceUploadForm
                key={params.get('skill') ?? 'any'}
                skills={profile.skills}
                defaultSkillId={profile.skills.some((s) => s.skillId === params.get('skill')) ? params.get('skill') : ''}
                onUploaded={() => {
                  toast.show({ title: t('evidence.uploaded'), message: t('evidence.uploadedText') });
                  full.reload();
                }}
              />
            ) : (
              <Alert tone="info" action={<Button size="sm" variant="secondary" onClick={() => openSection('skills')}>{t('editor.sections.skills')}</Button>}>
                {t('dashboard.skillsEmpty')}
              </Alert>
            )}
          </Section>
        </Card>
        <Card>
          <Section title={t('editor.sections.proof')} id="proof" description={t('editor.proofText')}>
            {full.loading ? <Skeleton lines={4} /> : (
              <SkillProofList skills={profile.skills} evidence={evidence} onAddProof={(skillId) => openSection('proof', { skill: skillId })} onDelete={deleteProof} />
            )}
          </Section>
        </Card>
      </div>
    ),
    history: (
      <Card>
        <Section title={t('editor.sections.history')} id="history" actions={dirty.history && unsaved}>
          <WorkForm parts={['history']} values={work} onChange={setWork} onSaved={(d) => saved(d, 'history')} submitLabel={t('editor.saveHistory')} />
        </Section>
      </Card>
    ),
    language: (
      <Card>
        <Section title={t('editor.sections.language')} id="language" description={t('editor.languageText')}>
          <RadioCardGroup
            legend={t('editor.languageCurrent', { name: info.nativeName })}
            name="site-language"
            assist="profile.language"
            value={lang}
            onChange={changeLanguage}
            options={LANGUAGES.map((l) => ({
              value: l.code,
              title: <span lang={l.htmlLang} dir={l.dir}>{l.nativeName}</span>,
              description: <span lang={l.htmlLang} dir={l.dir}>{l.preview}</span>,
              icon: Globe,
            }))}
          />
        </Section>
      </Card>
    ),
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('editor.title')}
        description={t('editor.lead')}
        eyebrow={<span className="tabular" dir="ltr">{t('dashboard.workerId', { id: profile.workerIdCode })}</span>}
        actions={<Button to="/worker/profile" variant="secondary" icon={Eye}>{t('editor.viewProfile')}</Button>}
      />
      <Tabs
        layout="side"
        label={t('editor.sectionsLabel')}
        value={section}
        onChange={askOpen}
        tabs={tabs.map((tab) => ({ ...tab, content: contents[tab.id] }))}
      />

      <ConfirmDialog
        open={Boolean(pendingSection) || guard.blocked}
        title={t('editor.unsavedTitle')}
        message={t('editor.unsavedText')}
        confirmLabel={t('editor.leave')}
        cancelLabel={t('editor.stay')}
        tone="danger"
        onConfirm={() => (pendingSection ? discardAndOpen() : guard.leave())}
        onCancel={() => (pendingSection ? setPendingSection(null) : guard.stay())}
      />
    </div>
  );
}
