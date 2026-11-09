import { useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Badge, Button, ConfirmDialog, IconButton, StatusChip } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { evidenceFileUrl, canWorkerDelete } from './evidenceText';
import styles from './Evidence.module.css';

// One skill: its chip, "Evidence: N approved", the strength label (plain words, no %).
export function SkillProofSummary({ skill }) {
  const { t } = useT();
  const s = skill.evidenceSummary ?? { status: 'self_declared', approved: 0, strength: 'none' };
  return (
    <div className={styles.summary}>
      <StatusChip kind="skill" status={s.status} />
      <span className={styles.meta}>{t('evidence.summary.approved', { count: s.approved ?? 0 })}</span>
      <span className={styles.meta}>{t('evidence.summary.strength', { strength: t(`status.strength.${s.strength ?? 'none'}`) })}</span>
    </div>
  );
}

// skills: profile skills (with evidenceSummary); evidence: own proof items (metadata).
// compact = no thumbnails and no delete (dashboard).
export default function SkillProofList({ skills, evidence, onAddProof, onDelete, compact = false, headingLevel = 3 }) {
  const { t, formatDate } = useT();
  const { skillName } = useTaxonomy();
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const H = `h${headingLevel}`;
  const typeName = (item) => t(`evidence.types.${item.type}.title`);
  return (
    <>
      <ul className={styles.skillList}>
        {skills.map((skill) => {
          const name = skillName(skill);
          const items = evidence.filter((e) => e.skillId === skill.skillId);
          return (
            <li key={skill.skillId} className={styles.skillCard}>
              <div className={styles.skillHead}>
                <H className={styles.skillName}>{name}</H>
                {onAddProof && (
                  <Button size="sm" variant="secondary" icon={ImagePlus} onClick={() => onAddProof(skill.skillId)} aria-label={t('evidence.list.addProofFor', { skill: name })}>
                    {t('evidence.list.addProof')}
                  </Button>
                )}
              </div>
              <SkillProofSummary skill={skill} />
              {items.length > 0 && (
                <ul className={styles.items} aria-label={t('evidence.list.proofFor', { skill: name })}>
                  {items.map((item) => (
                    <li key={item._id} className={styles.item}>
                      {!compact && <img src={evidenceFileUrl(item._id)} alt={t('evidence.list.photoAlt', { type: typeName(item), skill: name })} className={styles.thumb} loading="lazy" />}
                      <div className={styles.itemText}>
                        <span className={styles.itemTitle} dir="auto">{item.title || typeName(item)}</span>
                        <span className={styles.meta}>{typeName(item)} · <span className="tabular">{formatDate(item.createdAt)}</span></span>
                        {item.status === 'rejected' && (
                          <span className={styles.reason}>{t('evidence.list.reason', { reason: item.reviewNote || t(`evidence.reasons.${item.reasonCode ?? 'other'}`) })}</span>
                        )}
                        {(item.status === 'suspected_fake' || item.status === 'revoked') && item.reviewNote && (
                          <span className={styles.reason}>{t('evidence.list.adminNote', { note: item.reviewNote })}</span>
                        )}
                      </div>
                      <StatusChip kind="evidence" status={item.status} />
                      {!compact && onDelete && canWorkerDelete(item) && (
                        <IconButton label={t('evidence.list.deleteItem', { name: item.title || typeName(item) })} icon={Trash2} size="sm" onClick={() => setToDelete(item)} />
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {items.length === 0 && <p className={styles.meta}>{t('evidence.list.none')}</p>}
            </li>
          );
        })}
      </ul>
      {onDelete && (
        <ConfirmDialog
          open={Boolean(toDelete)}
          title={t('evidence.list.deleteTitle')}
          message={t('evidence.list.deleteText')}
          confirmLabel={t('evidence.list.deleteConfirm')}
          tone="danger"
          loading={busy}
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            setBusy(true);
            try {
              await onDelete(toDelete);
            } finally {
              setBusy(false);
              setToDelete(null);
            }
          }}
        />
      )}
      {skills.length === 0 && <Badge>{t('evidence.list.noSkills')}</Badge>}
    </>
  );
}
