// /prices — Price information (Module 5, §7), for workers and customers: pick a trade and a skill (pictures),
// how the price is counted, and the city (a worker's own city first), then see the price information card:
// the typical price on this platform, or the admin guide, and the minimum wage reference.
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { TradeArt } from '../../components/illustrations';
import { PageHeader, RadioCardGroup, TextField } from '../../components/ui';
import PriceInfoCard from '../../features/wage/PriceInfoCard';
import { UNIT_ICONS } from '../../features/wage/wageText';
import { useAuth } from '../../context/auth';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import styles from '../../features/wage/Wage.module.css';

export default function PriceInfo() {
  const { t } = useT();
  const { user } = useAuth();
  const { categories, skills: allSkills, categoryLabel } = useTaxonomy();
  useDocumentTitle(t('wage.priceInfo.title'));
  const mine = useApiQuery(user?.role === 'worker' ? '/workers/me' : null).data;
  const [category, setCategory] = useState(null);
  const [skillId, setSkillId] = useState(null);
  const [unit, setUnit] = useState('job');
  const [city, setCity] = useState(null);
  const chosenCategory = category ?? mine?.category ?? null;
  const shownCity = city ?? mine?.city ?? '';
  const skills = allSkills.filter((s) => s.category === chosenCategory);
  return (
    <div className={styles.page}>
      <PageHeader title={t('wage.priceInfo.title')} description={t('wage.priceInfo.lead')} />
      <div className={styles.form}>
        <RadioCardGroup
          legend={t('wage.priceInfo.trade')}
          name="price-trade"
          layout="tiles"
          value={chosenCategory}
          onChange={(v) => { setCategory(v); setSkillId(null); }}
          assist="wage.priceTrade"
          options={categories.map((c) => ({ value: c.id, title: categoryLabel(c.id), art: <TradeArt category={c.id} size={40} />, listenKey: 'help.option.requestSkill.any', listenParams: { name: categoryLabel(c.id) } }))}
        />
        {chosenCategory && (
          <RadioCardGroup
            legend={t('wage.priceInfo.skill')}
            name="price-skill"
            layout="tiles"
            value={skillId}
            onChange={setSkillId}
            assist="wage.priceSkill"
            options={skills.map((s) => ({ value: s.id, title: s.name, art: <TradeArt category={s.category} size={36} />, listenKey: 'help.option.requestSkill.any', listenParams: { name: s.name } }))}
          />
        )}
        <RadioCardGroup legend={t('wage.form.unit')} name="price-unit" layout="tiles" value={unit} onChange={setUnit} assist="wage.unit" listen="wageUnit"
          options={['job', 'day', 'hour'].map((u) => ({ value: u, title: t(`wage.unit.${u}`), icon: UNIT_ICONS[u] }))} />
        <TextField label={t('wage.priceInfo.city')} maxLength={50} value={shownCity} onChange={(e) => setCity(e.target.value)} icon={MapPin} assist="wage.priceCity" urdu />
      </div>
      {skillId ? (
        <PriceInfoCard skillId={skillId} unit={unit} city={shownCity} />
      ) : chosenCategory && unit !== 'job' ? (
        <PriceInfoCard category={chosenCategory} unit={unit} city={shownCity} />
      ) : (
        <p className={styles.muted}>{t('wage.priceInfo.pick')}</p>
      )}
    </div>
  );
}
