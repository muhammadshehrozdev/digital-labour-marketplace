// Example sentences, one at a time (Batch 4, feature 13). Starts with the website language; the
// previous / next buttons move through all of them; "Use this example" copies it into the box.
// Each example keeps its own language and direction, so screen readers read it right.
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button, IconButton } from '../../components/ui';
import { useT } from '../../i18n';
import { examplesFor } from './skillsText';
import styles from './SkillsEditor.module.css';

export default function ExampleCarousel({ onUse }) {
  const { t, lang } = useT();
  const examples = examplesFor(lang);
  const [index, setIndex] = useState(0);
  const example = examples[index];
  const move = (by) => setIndex((i) => (i + by + examples.length) % examples.length);
  return (
    <section className={styles.carousel} aria-roledescription="carousel" aria-label={t('workerx.examples.label')}>
      <IconButton size="sm" label={t('workerx.examples.previous')} icon={ChevronLeft} onClick={() => move(-1)} />
      <figure className={styles.slide} aria-live="polite" aria-roledescription="slide" aria-label={t('workerx.examples.position', { n: index + 1, total: examples.length })}>
        <Quote size={18} aria-hidden="true" className={styles.quote} />
        <blockquote key={example.id} lang={example.lang} dir={example.dir} className={styles.exampleText}>{example.text}</blockquote>
        <figcaption className={styles.slideMeta}>
          <span>{t('workerx.examples.position', { n: index + 1, total: examples.length })}</span>
          <Button size="sm" variant="secondary" onClick={() => onUse(example.text)}>{t('workerx.examples.use')}</Button>
        </figcaption>
      </figure>
      <IconButton size="sm" label={t('workerx.examples.next')} icon={ChevronRight} onClick={() => move(1)} />
    </section>
  );
}
