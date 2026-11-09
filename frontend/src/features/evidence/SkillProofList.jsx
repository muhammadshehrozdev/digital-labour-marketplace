import { useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Badge, Button, ConfirmDialog, IconButton, StatusChip, STRENGTH_TEXT } from '../../components/ui';
import { TYPE_LABEL, REASON_TEXT, evidenceFileUrl, canWorkerDelete } from './evidenceText';
import styles from './Evidence.module.css';

// One skill: its chip, "Evidence: N approved", the strength label, and its proof items.
export function SkillProofSummary({ skill }) {
  const s = skill.evidenceSummary ?? { status: 'self_declared', approved: 0, strength: 'none' };
  return (
    <div className={styles.summary}>
      <StatusChip kind="skill" status={s.status} />
      <span className={styles.meta}>Evidence: {s.approved ?? 0} approved</span>
      <span className={styles.meta}>Strength: {STRENGTH_TEXT[s.strength] ?? STRENGTH_TEXT.none}</span>
    </div>
  );
}

// skills: profile skills (with evidenceSummary); evidence: GET /api/evidence/mine items.
// compact = no thumbnails and no delete (dashboard).
export default function SkillProofList({ skills, evidence, onAddProof, onDelete, compact = false, headingLevel = 3 }) {
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const H = `h${headingLevel}`;
  return (
    <>
      <ul className={styles.skillList}>
        {skills.map((skill) => {
          const items = evidence.filter((e) => e.skillId === skill.skillId);
          return (
            <li key={skill.skillId} className={styles.skillCard}>
              <div className={styles.skillHead}>
                <H className={styles.skillName}>{skill.name}</H>
                {onAddProof && (
                  <Button size="sm" variant="secondary" icon={ImagePlus} onClick={() => onAddProof(skill.skillId)} aria-label={`Add proof for ${skill.name}`}>
                    Add proof
                  </Button>
                )}
              </div>
              <SkillProofSummary skill={skill} />
              {items.length > 0 && (
                <ul className={styles.items} aria-label={`Proof for ${skill.name}`}>
                  {items.map((item) => (
                    <li key={item._id} className={styles.item}>
                      {!compact && <img src={evidenceFileUrl(item._id)} alt={`${TYPE_LABEL[item.type]} for ${skill.name}`} className={styles.thumb} loading="lazy" />}
                      <div className={styles.itemText}>
                        <span className={styles.itemTitle} dir="auto">{item.title || TYPE_LABEL[item.type]}</span>
                        <span className={styles.meta}>{TYPE_LABEL[item.type]} · {new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                        {item.status === 'rejected' && <span className={styles.reason}>Reason: {item.reviewNote || REASON_TEXT[item.reasonCode]}</span>}
                        {(item.status === 'suspected_fake' || item.status === 'revoked') && item.reviewNote && (
                          <span className={styles.reason}>Admin note: {item.reviewNote}</span>
                        )}
                      </div>
                      <StatusChip kind="evidence" status={item.status} />
                      {!compact && onDelete && canWorkerDelete(item) && (
                        <IconButton label={`Delete ${item.title || TYPE_LABEL[item.type]}`} icon={Trash2} size="sm" onClick={() => setToDelete(item)} />
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {items.length === 0 && <p className={styles.meta}>No proof added yet.</p>}
            </li>
          );
        })}
      </ul>
      {onDelete && (
        <ConfirmDialog
          open={Boolean(toDelete)}
          title="Delete this proof?"
          message="The photo will be removed. You can upload another one later."
          confirmLabel="Delete proof"
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
      {skills.length === 0 && <Badge>No skills yet</Badge>}
    </>
  );
}
