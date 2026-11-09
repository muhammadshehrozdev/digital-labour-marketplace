import { BadgeCheck, ClipboardList, Hammer, Lock, Search, ShieldCheck, UserPlus, UserRoundSearch } from 'lucide-react';
import HeroIllustration from '../../components/brand/HeroIllustration';
import { Badge, Button } from '../../components/ui';
import styles from './Landing.module.css';

const WORKER_STEPS = [
  { icon: UserPlus, title: 'Create your profile', text: 'Your trade, your experience and your rates, in a few short steps.' },
  { icon: ClipboardList, title: 'Describe your skills', text: 'Write or say what you do, in Urdu, Roman Urdu or English. You choose which skills to add.' },
  { icon: ShieldCheck, title: 'Get checked', text: 'An admin checks your identity. Proof for your skills comes next.' },
];
const CUSTOMER_STEPS = [
  { icon: Search, title: 'Search by trade', text: 'Electricians, plumbers, painters, masons, carpenters, AC technicians, domestic workers and more.' },
  { icon: UserRoundSearch, title: 'Compare profiles', text: 'Experience, rates, skills and whether the identity was checked.' },
  { icon: BadgeCheck, title: 'Choose with trust', text: 'See clearly what is checked and what the worker only says about themselves.' },
];

export default function Landing() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Digital Labour Marketplace</p>
          <h1 id="hero-title" className={styles.display}>Skilled work, verified.</h1>
          <p className={styles.lead}>
            Workers build a profile that shows what they can do. Customers find a worker and can see what has
            been checked.
          </p>
          <div className={styles.ctas}>
            <Button to="/register?role=customer" size="lg">Find a worker</Button>
            <Button to="/register?role=worker" size="lg" variant="secondary" icon={Hammer}>Join as a worker</Button>
          </div>
        </div>
        <div className={styles.heroArt}><HeroIllustration /></div>
      </section>

      <section className={styles.section} aria-labelledby="how-title">
        <h2 id="how-title" className={styles.sectionTitle}>How it works</h2>
        <div className={styles.howGrid}>
          {[['For workers', WORKER_STEPS], ['For customers', CUSTOMER_STEPS]].map(([title, steps]) => (
            <div key={title} className={styles.howColumn}>
              <h3>{title}</h3>
              <ol className={styles.steps}>
                {steps.map(({ icon: Icon, title: t, text }, i) => (
                  <li key={t} className={styles.step}>
                    <span className={styles.stepIcon}><Icon size={22} strokeWidth={1.75} aria-hidden="true" /></span>
                    <div>
                      <p className={styles.stepTitle}><span className="visually-hidden">Step {i + 1}: </span>{t}</p>
                      <p className={styles.stepText}>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="trust-title">
        <h2 id="trust-title" className={styles.sectionTitle}>What you can trust here</h2>
        <div className={styles.trustGrid}>
          <article className={styles.trustCard}>
            <ShieldCheck size={28} strokeWidth={1.75} aria-hidden="true" className={styles.trustIcon} />
            <h3>Identity checked by a person</h3>
            <p>An admin checks the worker&apos;s CNIC in person or on a video call. The number is stored encrypted and is never shown to customers.</p>
          </article>
          <article className={styles.trustCard}>
            <BadgeCheck size={28} strokeWidth={1.75} aria-hidden="true" className={styles.trustIcon} />
            <h3>Skills with proof <Badge tone="accent">Coming next</Badge></h3>
            <p>Workers will upload photos of certificates or finished work. Until an admin checks proof, a skill is shown as &quot;Self-declared&quot;.</p>
          </article>
          <article className={styles.trustCard}>
            <Lock size={28} strokeWidth={1.75} aria-hidden="true" className={styles.trustIcon} />
            <h3>Phone numbers stay private</h3>
            <p>A worker&apos;s phone number is not shown in search results. It will be shared only after a booking is accepted.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
