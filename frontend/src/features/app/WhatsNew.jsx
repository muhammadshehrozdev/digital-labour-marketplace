// "What's new" (Batch 4, feature 54): the newest sections of docs/CHANGELOG.md, built into
// src/content/whatsNew.json by `npm run whats-new`. The entries are the project's own change log,
// written in English; the panel says so.
import { Dialog } from '../../components/ui';
import { useT } from '../../i18n';
import data from '../../content/whatsNew.json';
import styles from './AppFeatures.module.css';

export default function WhatsNew({ open, onClose }) {
  const { t } = useT();
  return (
    <Dialog open={open} onClose={onClose} title={t('appx.whatsNew.title')} description={t('appx.whatsNew.lead')} size="lg">
      {data.sections.length === 0 ? (
        <p>{t('appx.whatsNew.empty')}</p>
      ) : (
        <div className={styles.whatsNew} lang="en" dir="ltr">
          {data.sections.map((section) => (
            <section key={section.title}>
              <h3 className={styles.whatsNewTitle}>{section.title}</h3>
              <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </section>
          ))}
        </div>
      )}
      <p className={styles.source}>{t('appx.whatsNew.source')}</p>
    </Dialog>
  );
}
