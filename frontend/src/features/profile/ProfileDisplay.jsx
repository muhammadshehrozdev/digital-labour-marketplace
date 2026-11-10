// The read-only profile layout (D-020), used three ways:
//   mode="owner"   My profile: everything, including the Private section and own proof photos
//   mode="public"  "See what customers see" and the customer page: only the public fields the
//                  server sends (GET /api/workers/:id or publicView), no private data, no photos
// The header card, About, Work and rates, Languages, Skills, Proof, Work history, Private.
import { BadgeCheck, Briefcase, Clock, Languages as LanguagesIcon, Lock, MapPin, Wallet } from 'lucide-react';
import { Avatar, Badge, Card, StatusChip } from '../../components/ui';
import Reveal from '../../components/motion/Reveal';
import { SkillProofSummary } from '../evidence/SkillProofList';
import { evidenceFileUrl } from '../evidence/evidenceText';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import styles from './ProfileDisplay.module.css';

function Fact({ icon: Icon, label, children }) {
  return (
    <div className={styles.fact}>
      <dt><Icon size={16} aria-hidden="true" /> {label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function ProfileDisplay({ profile, evidence = [], mode = 'public', actions, headingLevel = 1 }) {
  const { t, formatNumber } = useT();
  const { categoryLabel, categoryOccupation, skillName } = useTaxonomy();
  const owner = mode === 'owner';
  const H = `h${headingLevel}`;
  const S = `h${headingLevel + 1}`;
  const name = profile.user?.name ?? t('common.worker');
  const trade = categoryOccupation(profile.category) || profile.occupation;
  const rate = (n) => (n ? <span className="tabular" dir="ltr">{t('common.rupees', { amount: formatNumber(n) })}</span> : t('common.empty'));
  const skills = profile.skills ?? [];
  const verifiedCount = skills.filter((s) => s.evidenceSummary?.status === 'verified').length;

  return (
    <div className={styles.layout}>
      <Card className={styles.header} padding="lg">
        <div className={styles.headerGlow} aria-hidden="true" />
        <Avatar name={name} size="xl" />
        <div className={styles.identity}>
          <H className={styles.name} dir="auto">{name}</H>
          <p className={styles.trade}>
            {trade}
            {profile.category && <span className={styles.category}> · {categoryLabel(profile.category)}</span>}
          </p>
          <p className={styles.meta}>
            {profile.city && <span><MapPin size={14} aria-hidden="true" /> {profile.city}</span>}
            {profile.workerIdCode && <span className="tabular" dir="ltr">{t('profile.workerId')}: {profile.workerIdCode}</span>}
          </p>
          <div className={styles.chips}>
            <StatusChip kind="identity" status={profile.verificationStatus} />
            {verifiedCount > 0 && <Badge tone="success" icon={BadgeCheck}>{t('status.skill.verified')} · {verifiedCount}</Badge>}
            {profile.availability && <Badge tone="neutral">{t(`status.availability.${profile.availability}`)}</Badge>}
          </div>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </Card>

      <div className={styles.grid}>
        <Reveal as={Card} index={0} className={styles.about}>
          <S className={styles.sectionTitle}>{t('profile.about')}</S>
          {profile.bio ? <p className={styles.bio} dir="auto">{profile.bio}</p> : <p className={styles.muted}>{t('profile.noBio')}</p>}
        </Reveal>

        <Reveal as={Card} index={1}>
          <S className={styles.sectionTitle}>{t('profile.workAndRates')}</S>
          <dl className={styles.facts}>
            <Fact icon={Briefcase} label={t('profile.experience')}>{t('common.years', { count: profile.experienceYears ?? 0 })}</Fact>
            <Fact icon={Wallet} label={t('profile.perHour')}>{rate(profile.hourlyRate)}</Fact>
            <Fact icon={Wallet} label={t('profile.perDay')}>{rate(profile.dailyRate)}</Fact>
            <Fact icon={Clock} label={t('profile.availability')}>{profile.availability ? t(`status.availability.${profile.availability}`) : t('common.empty')}</Fact>
          </dl>
        </Reveal>

        <Reveal as={Card} index={2}>
          <S className={styles.sectionTitle}>{t('profile.languages')}</S>
          {(profile.languages ?? []).length ? (
            <ul className={styles.chipList}>
              {profile.languages.map((l) => <li key={l}><Badge tone="neutral" icon={LanguagesIcon}>{l}</Badge></li>)}
            </ul>
          ) : <p className={styles.muted}>{t('profile.notAdded')}</p>}
        </Reveal>

        <Reveal as={Card} index={3} className={styles.wide}>
          <S className={styles.sectionTitle}>{t('profile.skills')}</S>
          <p className={styles.help}>{t('profile.skillsHelp')}</p>
          {skills.length ? (
            <ul className={styles.skillRows}>
              {skills.map((s) => (
                <li key={s.skillId}>
                  <span className={styles.skillName}>{skillName(s)}</span>
                  <SkillProofSummary skill={s} />
                </li>
              ))}
            </ul>
          ) : <p className={styles.muted}>{t('profile.noSkills')}</p>}
        </Reveal>

        {owner && (
          <Reveal as={Card} index={4} className={styles.wide}>
            <S className={styles.sectionTitle}>{t('profile.proof')}</S>
            {evidence.length ? (
              <ul className={styles.thumbs}>
                {evidence.map((item) => (
                  <li key={item._id} className={styles.thumbItem}>
                    <img
                      src={evidenceFileUrl(item._id)}
                      alt={t('evidence.list.photoAlt', { type: t(`evidence.types.${item.type}.title`), skill: skillName({ skillId: item.skillId, name: item.skillName }) })}
                      loading="lazy"
                      className={styles.thumb}
                    />
                    <span className={styles.thumbCaption}>{skillName({ skillId: item.skillId, name: item.skillName })}</span>
                    <StatusChip kind="evidence" status={item.status} />
                  </li>
                ))}
              </ul>
            ) : <p className={styles.muted}>{t('profile.noProof')}</p>}
          </Reveal>
        )}

        <Reveal as={Card} index={5} className={styles.wide}>
          <S className={styles.sectionTitle}>{t('profile.history')}</S>
          {(profile.workHistory ?? []).length ? (
            <ol className={styles.timeline}>
              {profile.workHistory.map((w, i) => (
                <li key={w._id ?? i}>
                  <p className={styles.jobTitle} dir="auto">{w.jobTitle}{w.duration && <span className={styles.muted}> · {w.duration}</span>}</p>
                  {w.description && <p className={styles.muted} dir="auto">{w.description}</p>}
                  {owner && w.clientOrEmployer && <p className={styles.private} dir="auto"><Lock size={12} aria-hidden="true" /> {t('profile.clientPrivate', { client: w.clientOrEmployer })}</p>}
                </li>
              ))}
            </ol>
          ) : <p className={styles.muted}>{t('profile.noHistory')}</p>}
        </Reveal>

        {owner && (
          <Reveal as={Card} index={6} className={`${styles.wide} ${styles.privateCard}`}>
            <S className={styles.sectionTitle}><Lock size={18} aria-hidden="true" /> {t('profile.private')}</S>
            <p className={styles.help}>{t('profile.privateNote')}</p>
            <dl className={styles.privateFacts}>
              <div><dt>{t('profile.phone')}</dt><dd className="tabular" dir="ltr">{profile.user?.phone || t('profile.notAdded')}</dd></div>
              <div><dt>{t('profile.whatsapp')}</dt><dd className="tabular" dir="ltr">{profile.whatsappNumber || t('profile.notAdded')}</dd></div>
              <div><dt>{t('profile.email')}</dt><dd dir="ltr">{profile.user?.email || t('profile.notAdded')}</dd></div>
              <div><dt>{t('profile.area')}</dt><dd dir="auto">{profile.address || t('profile.notAdded')}</dd></div>
              <div><dt>{t('profile.emergency')}</dt><dd dir="auto">{profile.emergencyContact || t('profile.notAdded')}</dd></div>
              <div>
                <dt>{t('profile.cnic')}</dt>
                <dd>{profile.cnicOnFile ? <Badge tone="primary" icon={Lock}>{t('profile.cnicSaved')}</Badge> : t('profile.cnicMissing')}</dd>
              </div>
            </dl>
          </Reveal>
        )}
      </div>
    </div>
  );
}
