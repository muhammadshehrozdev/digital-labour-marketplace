// Admin: saved reason templates (Batch 4, feature 29). Sentences in three languages, grouped by
// where they are used. Add, edit, delete, or start with the ready set.
import { useState } from 'react';
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import API from '../../api';
import { Alert, Button, ConfirmDialog, Dialog, EmptyState, IconButton, PageHeader, Select, Skeleton, TextArea, useToast } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDocumentTitle, useT } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import styles from './Admin.module.css';

const TEMPLATE_KINDS = ['identity_verify', 'identity_reject', 'evidence_reject', 'evidence_fake', 'evidence_revoke', 'user_suspend', 'user_reactivate'];
const EMPTY = { en: '', ur: '', 'ur-Latn': '' };

function TemplateDialog({ template, onClose, onSaved }) {
  const { t, te } = useT();
  const editing = Boolean(template?._id);
  const [kind, setKind] = useState(template?.kind ?? TEMPLATE_KINDS[0]);
  const [text, setText] = useState({ ...EMPTY, ...(template?.text ?? {}) });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (text.en.trim().length < 5) {
      setErrors({ 'text.en': 'adminx.templates.textError' });
      return;
    }
    setErrors({});
    setError(null);
    setSaving(true);
    const body = { text: { en: text.en.trim() } };
    if (text.ur.trim()) body.text.ur = text.ur.trim();
    if (text['ur-Latn'].trim()) body.text['ur-Latn'] = text['ur-Latn'].trim();
    try {
      if (editing) await API.patch(`/admin/reason-templates/${template._id}`, body);
      else await API.post('/admin/reason-templates', { kind, ...body });
      onSaved();
    } catch (err) {
      const fields = apiFieldErrors(err);
      if (Object.keys(fields).length) setErrors(fields);
      else setError(apiError(err, 'adminx.users.saveFailed'));
      setSaving(false);
    }
  };

  const area = (lang, label, extra = {}) => (
    <TextArea label={label} maxLength={300} rows={2} value={text[lang]} onChange={(e) => setText({ ...text, [lang]: e.target.value })} error={lang === 'en' ? errors['text.en'] ?? errors.text : undefined} {...extra} />
  );

  return (
    <Dialog
      open
      onClose={onClose}
      title={t(editing ? 'adminx.templates.editTitle' : 'adminx.templates.addTitle')}
      description={t('adminx.templates.textHint')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button loading={saving} onClick={save}>{t('common.save')}</Button>
        </>
      }
    >
      {error && <Alert tone="danger">{te(error)}</Alert>}
      <Select label={t('adminx.templates.kind')} value={kind} disabled={editing} onChange={(e) => setKind(e.target.value)} options={TEMPLATE_KINDS.map((k) => ({ value: k, label: t(`adminx.templates.kinds.${k}`) }))} />
      {area('en', t('adminx.templates.textEn'), { required: true, lang: 'en', dir: 'ltr' })}
      {area('ur', t('adminx.templates.textUr'), { urdu: true, lang: 'ur' })}
      {area('ur-Latn', t('adminx.templates.textRoman'), { lang: 'ur-Latn', dir: 'ltr' })}
    </Dialog>
  );
}

export default function AdminTemplates() {
  const toast = useToast();
  const { t, te } = useT();
  useDocumentTitle(t('adminx.titles.templates'));
  const { data, error, reload } = useApiQuery('/admin/reason-templates');
  const [editing, setEditing] = useState(null); // a template, or {} for a new one
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const addStarter = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const { data: result } = await API.post('/admin/reason-templates/starter-set');
      toast.show({ tone: result.added ? 'success' : 'info', title: result.added ? t('adminx.templates.starterAdded', { count: result.added }) : t('adminx.templates.starterNone') });
      reload();
    } catch (err) {
      setActionError(apiError(err, 'adminx.users.saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await API.delete(`/admin/reason-templates/${removing._id}`);
      toast.show({ title: t('adminx.templates.deleted') });
      setRemoving(null);
      reload();
    } catch (err) {
      setActionError(apiError(err, 'adminx.users.saveFailed'));
      setRemoving(null);
    } finally {
      setBusy(false);
    }
  };

  const templates = data?.templates ?? [];
  const kindsWith = TEMPLATE_KINDS.filter((kind) => templates.some((tpl) => tpl.kind === kind));

  return (
    <div>
      <PageHeader
        title={t('adminx.templates.title')}
        description={t('adminx.templates.lead')}
        actions={
          <>
            <Button variant="secondary" icon={Sparkles} loading={busy} onClick={addStarter}>{t('adminx.templates.starter')}</Button>
            <Button icon={Plus} onClick={() => setEditing({})}>{t('adminx.templates.add')}</Button>
          </>
        }
      />
      {(error || actionError) && <Alert tone="danger">{te(error ?? actionError)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={240} />}
      {data && templates.length === 0 && (
        <EmptyState art="empty-skills" title={t('adminx.templates.empty')} description={t('adminx.templates.emptyText')} action={<Button icon={Sparkles} loading={busy} onClick={addStarter}>{t('adminx.templates.starter')}</Button>} />
      )}
      {data && templates.length > 0 && (
        <>
          <p className={styles.count}>{t('adminx.templates.count', { count: templates.length, max: data.max })}</p>
          <div className={styles.templateGroups}>
            {kindsWith.map((kind) => (
              <section key={kind} className={styles.templateGroup} aria-labelledby={`kind-${kind}`}>
                <h2 id={`kind-${kind}`} className={styles.sectionTitle}>{t(`adminx.templates.kinds.${kind}`)}</h2>
                <ul className={styles.templateList}>
                  {templates.filter((tpl) => tpl.kind === kind).map((tpl) => (
                    <li key={tpl._id} className={styles.template}>
                      <div className={styles.templateTexts}>
                        <p lang="en" dir="ltr">{tpl.text.en}</p>
                        {tpl.text.ur ? <p lang="ur" dir="rtl" className="urdu">{tpl.text.ur}</p> : null}
                        {tpl.text['ur-Latn'] ? <p lang="ur-Latn" dir="ltr" className={styles.method}>{tpl.text['ur-Latn']}</p> : null}
                      </div>
                      <div className={styles.templateActions}>
                        <IconButton label={`${t('adminx.templates.edit')}: ${tpl.text.en}`} icon={Pencil} onClick={() => setEditing(tpl)} />
                        <IconButton label={`${t('adminx.templates.remove')}: ${tpl.text.en}`} icon={Trash2} onClick={() => setRemoving(tpl)} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
      {editing && (
        <TemplateDialog
          template={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            toast.show({ title: t('adminx.templates.saved') });
            reload();
          }}
        />
      )}
      <ConfirmDialog open={Boolean(removing)} tone="danger" title={t('adminx.templates.deleteTitle')} message={t('adminx.templates.deleteText')} confirmLabel={t('adminx.templates.remove')} loading={busy} onConfirm={remove} onCancel={() => setRemoving(null)} />
    </div>
  );
}
