import { useEffect, useId, useState } from 'react';
import { ImageUp, X } from 'lucide-react';
import IconButton from './IconButton';
import Spinner from './Spinner';
import { prepareImage, formatBytes } from '../../utils/imageCheck';
import { useT } from '../../i18n/context';
import styles from './FileUpload.module.css';

// Thumbnail of the chosen file. One instance per file (key), so the temporary URL is made once
// and released when the file changes or the picker closes.
function Preview({ file }) {
  const { t } = useT();
  const [url] = useState(() => (typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : ''));
  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
  if (!url) return <ImageUp size={32} aria-hidden="true" className={styles.previewIcon} />;
  return <img src={url} alt={t('ui.file.preview')} className={styles.preview} />;
}

// Photo picker: a big tap target on phones (opens camera or gallery), drag and drop on desktop.
// The real <input type="file"> stays in the tab order (visually hidden), so keyboard and screen
// readers work. Type and size are checked here with the same error codes as the server.
export default function FileUpload({ label, hint, value, onChange, error, required }) {
  const { t, te } = useT();
  const id = `u${useId().replace(/:/g, '')}`;
  const [dragging, setDragging] = useState(false);
  const [checking, setChecking] = useState(false);
  const [localError, setLocalError] = useState(null);

  const take = async (file) => {
    if (!file) return;
    setChecking(true);
    setLocalError(null);
    const result = await prepareImage(file);
    setChecking(false);
    if (result.error) {
      setLocalError(result.error);
      onChange(null);
    } else {
      onChange(result.file);
    }
  };

  const shownError = localError || error;
  const describedBy = [shownError && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <span className={styles.label} id={`${id}-label`}>
        {label}
        {required && <span className={styles.required}><span aria-hidden="true"> *</span><span className="visually-hidden"> {t('common.required')}</span></span>}
      </span>
      {value ? (
        <div className={styles.selected}>
          <Preview key={`${value.name}-${value.size}-${value.lastModified}`} file={value} />
          <div className={styles.fileText}>
            <span className={styles.fileName}>{value.name}</span>
            <span className={styles.fileSize}>{formatBytes(value.size)}</span>
          </div>
          <IconButton label={t('ui.file.remove')} icon={X} onClick={() => onChange(null)} />
        </div>
      ) : (
        <label
          htmlFor={id}
          className={[styles.zone, dragging && styles.dragging, shownError && styles.invalid].filter(Boolean).join(' ')}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); take(e.dataTransfer.files?.[0]); }}
        >
          {checking ? <Spinner size={28} /> : <ImageUp size={32} strokeWidth={1.75} aria-hidden="true" />}
          <span className={styles.zoneTitle}>{checking ? t('ui.file.checking') : t('ui.file.choose')}</span>
          <span className={styles.zoneText}>{t('ui.file.help')}</span>
        </label>
      )}
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.input}
        aria-labelledby={`${id}-label`}
        aria-describedby={describedBy}
        aria-invalid={shownError ? true : undefined}
        onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }}
      />
      {hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
      {shownError && <p id={`${id}-error`} className={styles.error} role="alert">{te(shownError)}</p>}
    </div>
  );
}
