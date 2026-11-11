// "You may also do..." (Batch 4, feature 11; proposal Module 2: "identification of potential
// skills that can be added to the worker profile"). The server suggests skills of the worker's
// own trade category that are not on the profile yet (rule-based). One tap adds one skill;
// the toast offers Undo. Nothing is ever added without that tap.
import { useState } from 'react';
import { Plus } from 'lucide-react';
import API from '../../api';
import { useToast } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';
import { buzz } from '../../utils/haptics';
import styles from './WorkerFeatures.module.css';

export default function PotentialSkills({ onSkillsChange, headingLevel = 2 }) {
  const toast = useToast();
  const { t, lang } = useT();
  const { data, reload } = useApiQuery('/workers/me/skills/potential');
  const [busy, setBusy] = useState('');
  const [hidden, setHidden] = useState(() => new Set()); // added just now: gone at once
  const H = `h${headingLevel}`;
  const nameOf = (s) => (lang === 'en' ? s.name : s.i18n?.[lang] || s.name);
  const suggestions = (data?.suggestions ?? []).filter((s) => !hidden.has(s.id));
  if (!data || (data.suggestions.length === 0)) return null;

  const undo = async (skill) => {
    try {
      const res = await API.delete(`/workers/me/skills/${encodeURIComponent(skill.id)}`);
      onSkillsChange?.(res.data.skills, res.data.onboarding);
      setHidden((set) => { const next = new Set(set); next.delete(skill.id); return next; });
      reload();
    } catch {
      toast.show({ tone: 'danger', title: t('workerx.undoFailed') });
    }
  };

  const add = async (skill) => {
    setBusy(skill.id);
    try {
      const res = await API.post('/workers/me/skills', { skillIds: [skill.id], addedVia: 'related' });
      buzz(12);
      setHidden((set) => new Set(set).add(skill.id));
      onSkillsChange?.(res.data.skills, res.data.onboarding);
      toast.show({ title: t('workerx.potential.added', { skill: nameOf(skill) }), action: { label: t('workerx.undo'), onClick: () => undo(skill) } });
    } catch {
      toast.show({ tone: 'danger', title: t('workerx.potential.failed') });
    } finally {
      setBusy('');
    }
  };

  return (
    <section className={styles.potential} aria-labelledby="potential-title" data-tour="potential">
      <H id="potential-title" className={styles.cardTitle}>{t('workerx.potential.title')}</H>
      <p className={styles.muted}>{t('workerx.potential.lead')}</p>
      {suggestions.length === 0 ? (
        <p className={styles.muted}>{t('workerx.potential.none')}</p>
      ) : (
        <ul className={styles.potentialList}>
          {suggestions.map((s, i) => (
            <li key={s.id} style={{ '--i': i }}>
              <button type="button" className={styles.potentialChip} disabled={busy === s.id} onClick={() => add(s)} aria-label={t('workerx.potential.add', { skill: nameOf(s) })}>
                <Plus size={16} aria-hidden="true" /> {nameOf(s)}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.honest}>{t('workerx.potential.honest')}</p>
    </section>
  );
}
