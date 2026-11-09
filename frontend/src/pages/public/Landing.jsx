import {
  AirVent, ArrowRight, BadgeCheck, BrickWall, ClipboardList, Droplets, FileCheck2, Hammer, House, Lock, PaintRoller,
  ScrollText, Search, ShieldCheck, Sparkles, Truck, UserPlus, UserRoundSearch, Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../components/brand/Logo';
import HeroIllustration from '../../components/brand/HeroIllustration';
import LanguageSwitcher from '../../components/layout/LanguageSwitcher';
import Reveal from '../../components/motion/Reveal';
import Typewriter from '../../components/motion/Typewriter';
import { Button } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './Landing.module.css';

// The hero headline types itself in the three languages (Part 4.5; lines to be reviewed by the team).
const HEADLINES = [
  { text: 'Skilled work, verified.', lang: 'en', dir: 'ltr' },
  { text: 'ہنر مند کام، تصدیق شدہ۔', lang: 'ur', dir: 'rtl' },
  { text: 'Hunarmand kaam, tasdeeq shuda.', lang: 'ur-Latn', dir: 'ltr' },
];

const WORKER_STEPS = [
  { id: 'profile', icon: UserPlus },
  { id: 'skills', icon: ClipboardList },
  { id: 'proof', icon: FileCheck2 },
];
const CUSTOMER_STEPS = [
  { id: 'search', icon: Search },
  { id: 'compare', icon: UserRoundSearch },
  { id: 'choose', icon: BadgeCheck },
];
const TRUST = [
  { id: 'identity', icon: ShieldCheck },
  { id: 'proof', icon: BadgeCheck },
  { id: 'review', icon: ScrollText },
  { id: 'privacy', icon: Lock },
];
const TRADE_ICONS = {
  electrical_solar: Zap,
  plumbing_sanitary: Droplets,
  construction_masonry: BrickWall,
  carpentry_woodwork: Hammer,
  painting_renovation: PaintRoller,
  ac_appliance_repair: AirVent,
  home_maintenance: House,
  domestic_work: Sparkles,
  moving_loading: Truck,
};

function Track({ title, prefix, steps, tone }) {
  const { t } = useT();
  return (
    <Reveal className={`${styles.track} ${styles[tone]}`}>
      <h3 className={styles.trackTitle}>{title}</h3>
      <ol className={styles.steps}>
        {steps.map(({ id, icon: Icon }, i) => (
          <Reveal as="li" key={id} index={i + 1} className={styles.step}>
            <span className={styles.stepIcon}><Icon size={22} strokeWidth={1.75} aria-hidden="true" /></span>
            <div>
              <p className={styles.stepNumber}>{t('landing.stepNumber', { n: i + 1 })}</p>
              <p className={styles.stepTitle}>{t(`landing.${prefix}.${id}.title`)}</p>
              <p className={styles.stepText}>{t(`landing.${prefix}.${id}.text`)}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Reveal>
  );
}

export default function Landing() {
  const { t } = useT();
  useDocumentTitle(t('titles.home'));
  const { categories, skills } = useTaxonomy();

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} dark-section`} aria-labelledby="hero-title">
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.heroTop}>
              <Logo size={40} tone="dark" animated />
              <LanguageSwitcher tone="dark" />
            </div>
            <h1 id="hero-title" className={styles.display}>
              <Typewriter lines={HEADLINES} label={t('landing.title')} />
            </h1>
            <p className={styles.lead}>{t('landing.lead')}</p>
            <div className={styles.ctas}>
              <Button to="/register?role=customer" size="lg" className={styles.ctaPrimary} iconRight={ArrowRight}>{t('landing.findWorker')}</Button>
              <Button to="/register?role=worker" size="lg" variant="secondary" icon={Hammer} className={styles.ctaSecondary}>{t('landing.joinWorker')}</Button>
            </div>
            <p className={styles.heroNote}>{t('landing.heroNote')}</p>
          </div>
          <div className={styles.heroArt}><HeroIllustration /></div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="how-title">
        <Reveal className={styles.sectionHead}>
          <h2 id="how-title" className={styles.sectionTitle}>{t('landing.howTitle')}</h2>
          <p className={styles.sectionLead}>{t('landing.howLead')}</p>
        </Reveal>
        <div className={styles.tracks}>
          <Track title={t('landing.forWorkers')} prefix="workerSteps" steps={WORKER_STEPS} tone="workerTrack" />
          <Track title={t('landing.forCustomers')} prefix="customerSteps" steps={CUSTOMER_STEPS} tone="customerTrack" />
        </div>
      </section>

      <section className={`${styles.section} ${styles.trustSection}`} aria-labelledby="trust-title">
        <Reveal className={styles.sectionHead}>
          <h2 id="trust-title" className={styles.sectionTitle}>{t('landing.trustTitle')}</h2>
          <p className={styles.sectionLead}>{t('landing.trustLead')}</p>
        </Reveal>
        <div className={styles.trustGrid}>
          {TRUST.map(({ id, icon: Icon }, i) => (
            <Reveal as="article" key={id} index={i} className={styles.trustCard}>
              <span className={styles.trustIcon}><Icon size={26} strokeWidth={1.75} aria-hidden="true" /></span>
              <h3>{t(`landing.trust.${id}.title`)}</h3>
              <p>{t(`landing.trust.${id}.text`)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="trades-title">
        <Reveal className={styles.sectionHead}>
          <h2 id="trades-title" className={styles.sectionTitle}>{t('landing.tradesTitle')}</h2>
          <p className={styles.sectionLead}>{t('landing.tradesLead')}</p>
        </Reveal>
        <ul className={styles.trades}>
          {categories.map((c, i) => {
            const Icon = TRADE_ICONS[c.id] ?? Hammer;
            const count = skills.filter((s) => s.category === c.id).length;
            return (
              <Reveal as="li" key={c.id} index={i % 3}>
                <Link to="/register?role=customer" className={styles.trade} aria-label={t('landing.tradeLink', { trade: c.label })}>
                  <span className={styles.tradeIcon}><Icon size={24} strokeWidth={1.75} aria-hidden="true" /></span>
                  <span className={styles.tradeText}>
                    <span className={styles.tradeName}>{c.label}</span>
                    <span className={styles.tradeMeta}>{c.occupation} · {t('landing.tradeSkills', { count })}</span>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" className={styles.tradeArrow} />
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className={styles.ctaWrap} aria-labelledby="cta-title">
        <Reveal className={`${styles.ctaBand} dark-section`}>
          <div>
            <h2 id="cta-title" className={styles.ctaTitle}>{t('landing.ctaTitle')}</h2>
            <p className={styles.ctaText}>{t('landing.ctaText')}</p>
          </div>
          <div className={styles.ctas}>
            <Button to="/register?role=customer" size="lg" className={styles.ctaPrimary}>{t('landing.findWorker')}</Button>
            <Button to="/register?role=worker" size="lg" variant="secondary" className={styles.ctaSecondary}>{t('landing.joinWorker')}</Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
