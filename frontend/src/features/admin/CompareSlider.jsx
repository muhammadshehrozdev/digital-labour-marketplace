// Duplicate-photo compare slider (Batch 4, feature 34): the earlier photo lies under this upload;
// a range slider uncovers it from one side. A real <input type="range">, so it works with the
// keyboard (arrow keys) and screen readers. A second view shows the photos side by side.
import { useState } from 'react';
import { Columns2, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../components/ui';
import { useT } from '../../i18n';
import styles from './AdminFeatures.module.css';

export default function CompareSlider({ thisSrc, earlierSrc, thisAlt, earlierAlt, earlierLabel }) {
  const { t } = useT();
  const [position, setPosition] = useState(50);
  const [mode, setMode] = useState('overlay');
  return (
    <section className={styles.compare} aria-label={t('adminx.compare.title')}>
      <div className={styles.compareHead}>
        <p className={styles.compareTitle}>{t('adminx.compare.title')}</p>
        <Button size="sm" variant="secondary" icon={mode === 'overlay' ? Columns2 : SlidersHorizontal} onClick={() => setMode(mode === 'overlay' ? 'side' : 'overlay')}>
          {mode === 'overlay' ? t('adminx.compare.sideBySide') : t('adminx.compare.overlay')}
        </Button>
      </div>
      {mode === 'overlay' ? (
        <>
          <div className={styles.stage} dir="ltr" style={{ '--cut': `${position}%` }}>
            <img src={earlierSrc} alt={earlierAlt} className={styles.under} />
            <img src={thisSrc} alt={thisAlt} className={styles.over} />
            <span className={styles.handle} aria-hidden="true" />
            <span className={`${styles.tag} ${styles.tagStart}`}>{t('adminx.compare.thisUpload')}</span>
            <span className={`${styles.tag} ${styles.tagEnd}`}>{t('adminx.compare.earlier')}</span>
          </div>
          <label className={styles.range}>
            <span className="visually-hidden">{t('adminx.compare.slider')}</span>
            <input type="range" min="0" max="100" step="1" value={position} onChange={(e) => setPosition(Number(e.target.value))} dir="ltr" />
          </label>
        </>
      ) : (
        <div className={styles.side}>
          <figure><img src={thisSrc} alt={thisAlt} /><figcaption>{t('adminx.compare.thisUpload')}</figcaption></figure>
          <figure><img src={earlierSrc} alt={earlierAlt} /><figcaption>{earlierLabel}</figcaption></figure>
        </div>
      )}
      <p className={styles.compareNote}>{earlierLabel}</p>
    </section>
  );
}
