// Development only (/dev/themes): compare the three themes (D-017) and the three logo concepts
// (D-018) live. Switching here changes the whole page until reload.
import { ArrowRight, BadgeCheck, Hammer } from 'lucide-react';
import Logo, { LogoMark } from '../../components/brand/Logo';
import { LOGO_CONCEPTS, LOGO_CONCEPT_IDS } from '../../components/brand/logoMarks';
import { Alert, Badge, Button, Card, PageHeader, ProgressRing, Section, StatusChip } from '../../components/ui';
import ThemePicker from './ThemePicker';
import styles from './ThemeLab.module.css';

const ROLES = [
  'bg', 'bg-subtle', 'surface', 'surface-muted', 'text', 'text-secondary', 'border', 'border-input',
  'primary', 'primary-hover', 'primary-soft', 'primary-text', 'secondary', 'secondary-soft', 'accent', 'accent-soft',
  'success', 'warning', 'danger', 'info', 'dark-bg', 'dark-surface', 'on-dark', 'dark-primary', 'dark-accent', 'focus',
];

export default function ThemeLab() {
  return (
    <div className={styles.page}>
      <PageHeader eyebrow="Development only" title="Theme lab" description="Switch the three design v2 themes and compare the logo concepts. The default is DEFAULT_THEME in src/styles/theme.js." />
      <ThemePicker />

      <Section title="Logo concepts (D-018)">
        <div className={styles.logoGrid}>
          {LOGO_CONCEPT_IDS.map((id) => (
            <Card key={id} className={styles.logoCard}>
              <p className={styles.logoName}>{LOGO_CONCEPTS[id].name}</p>
              <div className={styles.logoRow}>
                {[16, 24, 32, 64].map((size) => <LogoMark key={size} concept={id} size={size} title={`${LOGO_CONCEPTS[id].name}, ${size} px`} />)}
                <span className={styles.mono}><LogoMark concept={id} size={32} mono /></span>
              </div>
              <div className={`${styles.logoRow} ${styles.onDark} dark-section`}>
                {[16, 32, 64].map((size) => <LogoMark key={size} concept={id} size={size} tone="dark" />)}
                <LogoMark concept={id} size={64} tone="dark" animated />
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Logo concepts in the header">
        <div className={styles.headerPreviews}>
          {LOGO_CONCEPT_IDS.map((id) => (
            <div key={id} className={styles.headerPreview} data-concept={id}>
              <Logo size={34} concept={id} compact />
              <span className={styles.headerSpacer} />
              <Button size="sm" variant="ghost">Log in</Button>
              <Button size="sm">Create account</Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Colour roles">
        <ul className={styles.roles}>
          {ROLES.map((r) => (
            <li key={r}>
              <span className={styles.chip} style={{ background: `var(--color-${r})` }} />
              <code>--color-{r}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Sample: hero">
        <div className={`${styles.heroSample} dark-section`}>
          <p className={styles.heroTitle}>Skilled work, verified.</p>
          <p>Workers build a profile that shows what they can do.</p>
          <div className={styles.row}>
            <Button iconRight={ArrowRight}>Find a worker</Button>
            <Button variant="secondary" icon={Hammer}>Join as a worker</Button>
          </div>
        </div>
      </Section>

      <Section title="Sample: components">
        <div className={styles.sampleGrid}>
          <Card className={styles.stack}>
            <div className={styles.row}><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button></div>
            <div className={styles.row}>
              <StatusChip kind="identity" status="Verified" /><StatusChip kind="skill" status="evidence_pending" /><StatusChip kind="evidence" status="rejected" />
              <Badge tone="accent">Accent</Badge><Badge tone="success" icon={BadgeCheck}>Verified by evidence</Badge>
            </div>
            <Alert tone="info" title="Info">A short message.</Alert>
          </Card>
          <Card className={styles.ringCard}><ProgressRing value={72} label="Profile completion" /><p>Profile completion</p></Card>
        </div>
      </Section>
    </div>
  );
}
