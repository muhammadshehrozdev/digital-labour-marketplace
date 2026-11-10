// "Insert a saved reason" (Batch 4, feature 29): a small select above a note box. Choosing a
// template fills the note with its text in the admin's website language (English if that language
// has no text); the admin can then change the words. Loads only the templates of one kind.
import { useApiQuery } from '../../hooks/useApiQuery';
import { Select } from '../../components/ui';
import { useT } from '../../i18n';

export default function TemplatePicker({ kind, onPick }) {
  const { t, lang } = useT();
  const { data } = useApiQuery(kind ? '/admin/reason-templates' : null, { kind });
  const templates = data?.templates ?? [];
  const textOf = (template) => template.text[lang] || template.text.en;
  if (!data) return null;
  if (templates.length === 0) return <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>{t('adminx.templates.insertNone')}</p>;
  return (
    <Select
      label={t('adminx.templates.insert')}
      value=""
      placeholder="—"
      onChange={(e) => {
        const chosen = templates.find((template) => template._id === e.target.value);
        if (chosen) onPick(textOf(chosen));
      }}
      options={templates.map((template) => ({ value: template._id, label: textOf(template) }))}
    />
  );
}
