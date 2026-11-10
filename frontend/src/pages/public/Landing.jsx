// Landing page v3 (Batch 4, design v3): dark hero with a slow mesh and grain, a trust strip,
// "How it works" and "Why you can trust a profile" as bento grids with small product vignettes,
// the trades with one in-house drawing each, and a closing call to action.
// Honest content only: the vignettes show skeleton lines and the real status words of the
// product, never invented names, numbers, ratings or reviews.
import { ArrowRight, BadgeCheck, Hammer, Link2, Lock, ScrollText, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../components/brand/Logo';
import HeroIllustration from '../../components/brand/HeroIllustration';
import { SceneArt, TradeArt } from '../../components/illustrations';
import Magnetic from '../../components/motion/Magnetic';
import Reveal from '../../components/motion/Reveal';
import Typewriter from '../../components/motion/Typewriter';
import { useParallax, useSpotlight } from '../../components/motion/pointerEffects';
import { Button, StatusChip } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { Rich, useDocumentTitle, useT } from '../../i18n';
import styles from './Landing.module.css';

// The hero headline types itself in the three languages (Part 4.5; lines to be reviewed by the team).
const HEADLINES = [
  { text: 'Skilled work, verified.', lang: 'en', dir: 'ltr' },
  { text: 'ہنر مند کام، تصدیق شدہ۔', lang: 'ur', dir: 'rtl' },
  { text: 'Hunarmand kaam, tasdeeq shuda.', lang: 'ur-Latn', dir: 'ltr' },
];

const TRUST_STRIP = [
  { id: 'identity', icon: ShieldCheck },
  { id: 'proof', icon: BadgeCheck },
  { id: 'privacy', icon: Lock },
];

// One bento tile: words on one side, a small picture of the product on the other.
function Tile({ area, tone = 'worker', label, title, text, index = 0, children }) {
  return (
    <Reveal as="article" index={index} className={[styles.tile, styles[area], styles[tone]].join(' ')} data-spotlight data-art-hover>
      <div className={styles.tileText}>
        <p className={styles.tileLabel}>{label}</p>
        <h3 className={styles.tileTitle}>{title}</h3>
        <p className={styles.tileBody}>{text}</p>
      </div>
      <div className={styles.vignette} aria-hidden="true">{children}</div>
    </Reveal>
  );
}

// Grey lines that stand for text we do not want to invent.
const Lines = ({ widths }) => (
  <span className={styles.lines}>{widths.map((w, i) => <span key={i} style={{ inlineSize: `${w}%` }} />)}</span>
);

export default function Landing() {
  const { t } = useT();
  useDocumentTitle(t('titles.home'));
  const { categories, skills, skillName } = useTaxonomy();
  const parallax = useParallax();
  const spotlight = useSpotlight();
  const step = (n) => t('landing.stepNumber', { n });
  const exampleSkills = ['elec_wiring', 'elec_solar'].map((id) => skillName({ skillId: id })).filter(Boolean);

  return (
    <div className={styles.page}>
      {/* ---------- 1. Hero ---------- */}
      <section className={`${styles.hero} dark-section`} aria-labelledby="hero-title" {...parallax}>
        <div className={styles.mesh} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.heroBrand}><Logo size={40} tone="dark" animated hero /></div>
            <h1 id="hero-title" className={styles.display}>
              <Typewriter lines={HEADLINES} label={t('landing.title')} />
            </h1>
            <p className={styles.lead}>{t('landing.lead')}</p>
            <div className={styles.ctas}>
              <Magnetic>
                <span className={styles.glowBorder}>
                  <Button to="/register?role=customer" size="lg" className={styles.ctaPrimary} iconRight={ArrowRight}>{t('landing.findWorker')}</Button>
                </span>
              </Magnetic>
              <Magnetic>
                <Button to="/register?role=worker" size="lg" variant="secondary" icon={Hammer} className={styles.ctaSecondary}>{t('landing.joinWorker')}</Button>
              </Magnetic>
            </div>
            <p className={styles.heroNote}>{t('landing.heroNote')}</p>
          </div>
          <div className={styles.heroArt}><HeroIllustration /></div>
        </div>
        <ul className={styles.strip}>
          {TRUST_STRIP.map(({ id, icon: Icon }) => (
            <li key={id}><Icon size={20} strokeWidth={1.75} aria-hidden="true" />{t(`landing.trust.${id}.title`)}</li>
          ))}
        </ul>
      </section>

      {/* ---------- 2. How it works (bento) ---------- */}
      <section className={styles.section} aria-labelledby="how-title">
        <Reveal className={styles.sectionHead}>
          <p className={styles.kicker}>{t('landing.howKicker')}</p>
          <h2 id="how-title" className={styles.sectionTitle}>{t('landing.howTitle')}</h2>
          <p className={styles.sectionLead}>{t('landing.howLead')}</p>
        </Reveal>
        <div className={styles.bento} onPointerMove={spotlight} data-spotlight-group>
          <Tile area="w1" label={`${t('landing.forWorkers')} · ${step(1)}`} title={t('landing.workerSteps.profile.title')} text={t('landing.workerSteps.profile.text')}>
            <div className={styles.miniCard}>
              <span className={styles.miniAvatar} />
              <Lines widths={[62, 40]} />
              <span className={styles.miniRing} />
              <span className={styles.miniRow}><i /><i /><i /></span>
            </div>
          </Tile>
          <Tile area="w2" index={1} label={`${t('landing.forWorkers')} · ${step(2)}`} title={t('landing.workerSteps.skills.title')} text={t('landing.workerSteps.skills.text')}>
            <div className={styles.typed}>
              <span className={styles.exampleTag}>{t('landing.bento.example')}</span>
              <p className={styles.typedText}><Rich text={t('landing.bento.sentence')} /></p>
              <span className={styles.typedChips}>
                {exampleSkills.map((name) => <span key={name} className={styles.skillChip}><BadgeCheck size={14} />{name}</span>)}
              </span>
            </div>
          </Tile>
          <Tile area="w3" index={0} label={`${t('landing.forWorkers')} · ${step(3)}`} title={t('landing.workerSteps.proof.title')} text={t('landing.workerSteps.proof.text')}>
            <div className={styles.proofVignette}>
              <SceneArt name="step-proof" size={150} />
              <span className={styles.chipFlow}><StatusChip kind="evidence" status="pending" /><ArrowRight size={16} /><StatusChip kind="evidence" status="approved" /></span>
            </div>
          </Tile>
          <Tile area="c1" tone="customer" index={1} label={`${t('landing.forCustomers')} · ${step(1)}`} title={t('landing.customerSteps.search.title')} text={t('landing.customerSteps.search.text')}>
            <div className={styles.searchVignette}>
              <span className={styles.fakeSearch}><Search size={16} /><Lines widths={[55]} /></span>
              <span className={styles.tradeRow}>
                <TradeArt category="electrical_solar" size={56} />
                <TradeArt category="plumbing_sanitary" size={56} />
                <TradeArt category="painting_renovation" size={56} />
              </span>
            </div>
          </Tile>
          <Tile area="c2" tone="customer" index={2} label={`${t('landing.forCustomers')} · ${step(2)}`} title={t('landing.customerSteps.compare.title')} text={t('landing.customerSteps.compare.text')}>
            <SceneArt name="compare" size={170} />
          </Tile>
          <Tile area="c3" tone="customer" index={0} label={`${t('landing.forCustomers')} · ${step(3)}`} title={t('landing.customerSteps.choose.title')} text={t('landing.customerSteps.choose.text')}>
            <dl className={styles.legend}>
              <div><dt><StatusChip kind="skill" status="verified" /></dt><dd>{t('landing.bento.verifiedMeans')}</dd></div>
              <div><dt><StatusChip kind="skill" status="self_declared" /></dt><dd>{t('landing.bento.selfMeans')}</dd></div>
            </dl>
          </Tile>
        </div>
      </section>

      {/* ---------- 3. Trust (bento) ---------- */}
      <section className={`${styles.section} ${styles.trustSection}`} aria-labelledby="trust-title">
        <Reveal className={styles.sectionHead}>
          <p className={styles.kicker}>{t('landing.trustKicker')}</p>
          <h2 id="trust-title" className={styles.sectionTitle}>{t('landing.trustTitle')}</h2>
          <p className={styles.sectionLead}>{t('landing.trustLead')}</p>
        </Reveal>
        <div className={styles.trustGrid} onPointerMove={spotlight} data-spotlight-group>
          <Reveal as="article" className={`${styles.trustCard} ${styles.t1}`} data-spotlight data-art-hover>
            <div>
              <h3>{t('landing.trust.identity.title')}</h3>
              <p>{t('landing.trust.identity.text')}</p>
            </div>
            <SceneArt name="step-about" size={190} className={styles.trustArt} />
          </Reveal>
          <Reveal as="article" index={1} className={`${styles.trustCard} ${styles.t2}`} data-spotlight data-art-hover>
            <SceneArt name="empty-proof" size={150} className={styles.trustArt} />
            <div>
              <h3>{t('landing.trust.proof.title')}</h3>
              <p>{t('landing.trust.proof.text')}</p>
            </div>
          </Reveal>
          <Reveal as="article" index={1} className={`${styles.trustCard} ${styles.t3}`} data-spotlight>
            <ol className={styles.chain} aria-hidden="true">
              <li><ScrollText size={16} /><Lines widths={[70]} /></li>
              <li><Link2 size={16} /><Lines widths={[52]} /></li>
              <li><ScrollText size={16} /><Lines widths={[64]} /></li>
            </ol>
            <div>
              <h3>{t('landing.trust.review.title')}</h3>
              <p>{t('landing.trust.review.text')}</p>
            </div>
          </Reveal>
          <Reveal as="article" index={2} className={`${styles.trustCard} ${styles.t4} dark-section`} data-spotlight>
            <span className={styles.lockBadge} aria-hidden="true"><Lock size={28} strokeWidth={1.75} /></span>
            <div>
              <h3>{t('landing.trust.privacy.title')}</h3>
              <p>{t('landing.trust.privacy.text')}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- 4. Trades ---------- */}
      <section className={styles.section} aria-labelledby="trades-title">
        <Reveal className={styles.sectionHead}>
          <p className={styles.kicker}>{t('landing.tradesKicker')}</p>
          <h2 id="trades-title" className={styles.sectionTitle}>{t('landing.tradesTitle')}</h2>
          <p className={styles.sectionLead}>{t('landing.tradesLead')}</p>
        </Reveal>
        <ul className={styles.trades} onPointerMove={spotlight} data-spotlight-group>
          {categories.map((c, i) => {
            const count = skills.filter((s) => s.category === c.id).length;
            return (
              <Reveal as="li" key={c.id} index={i % 3}>
                <Link to="/register?role=customer" className={styles.trade} data-spotlight data-art-hover>
                  <TradeArt category={c.id} size={68} />
                  <span className={styles.tradeText}>
                    <span className={styles.tradeName}>{c.label}</span>
                    <span className={styles.tradeMeta}>{c.occupation} · {t('landing.tradeSkills', { count })}</span>
                  </span>
                  {/* The visible text stays the link name (WCAG 2.5.3); the purpose is added for screen readers. */}
                  <span className="visually-hidden"> · {t('landing.findWorker')}</span>
                  <ArrowRight size={18} aria-hidden="true" className={styles.tradeArrow} />
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* ---------- 5. Call to action ---------- */}
      <section className={styles.ctaWrap} aria-labelledby="cta-title">
        <Reveal className={`${styles.ctaBand} dark-section`}>
          <div className={styles.mesh} aria-hidden="true" />
          <div className={styles.ctaCopy}>
            <h2 id="cta-title" className={styles.ctaTitle}>{t('landing.ctaTitle')}</h2>
            <p className={styles.ctaText}>{t('landing.ctaText')}</p>
          </div>
          <div className={styles.ctas}>
            <Magnetic><Button to="/register?role=customer" size="lg" className={styles.ctaPrimary} iconRight={ArrowRight}>{t('landing.findWorker')}</Button></Magnetic>
            <Magnetic><Button to="/register?role=worker" size="lg" variant="secondary" icon={Hammer} className={styles.ctaSecondary}>{t('landing.joinWorker')}</Button></Magnetic>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
