import { useT } from '../../i18n/context';
import { useState } from 'react';
import FieldAssist from '../../features/assist/FieldAssist';
import OptionListen from '../../features/assist/OptionListen';
import styles from './RadioCard.module.css';

// One large selectable card. A real radio input inside keeps keyboard (arrow keys) and screen readers working.
// listenKey (Batch 5): a help key; a 🔊 button next to the radio says the option's name and one line.
export function RadioCard({ name, value, checked, onChange, title, description, icon: Icon, art, disabled, listenKey, listenParams, onNoVoice, tile = false }) {
  const card = (
    <label className={[styles.card, tile && styles.tile, checked && styles.checked, disabled && styles.disabled, listenKey && styles.withListen].filter(Boolean).join(' ')}>
      <input
        type="radio"
        className={styles.input}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      {art && <span className={styles.art}>{art}</span>}
      {!art && Icon && <span className={styles.icon}><Icon size={24} strokeWidth={1.75} aria-hidden="true" /></span>}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      <span className={styles.dot} aria-hidden="true" />
    </label>
  );
  if (!listenKey) return card;
  return (
    <div className={styles.option}>
      {card}
      <OptionListen helpKey={listenKey} params={listenParams} name={typeof title === 'string' ? title : String(value)} onNoVoice={onNoVoice} className={styles.listenSpot} />
    </div>
  );
}

// A group of RadioCards with a visible legend (fieldset), as one question.
// assist (Batch 5): help key for a Listen button under the question (choices are never spoken into).
// listen: the option group of the help texts, so each card gets a 🔊 (help.option.<listen>.<value>).
// layout "tiles": picture on top and the name under it, two or more per row (trades, availability).
export default function RadioCardGroup({ legend, name, value, onChange, options, error, columns = 1, assist, listen, layout = 'list', id }) {
  const { t, te } = useT();
  const [noVoice, setNoVoice] = useState(false);
  const tiles = layout === 'tiles';
  return (
    <fieldset className={styles.group} aria-invalid={error ? true : undefined} id={id}>
      <legend className={styles.legend}>{legend}</legend>
      {assist && <FieldAssist helpKey={assist} label={typeof legend === 'string' ? legend : ''} />}
      <div className={[styles.grid, columns === 2 && styles.two, tiles && styles.tiles].filter(Boolean).join(' ')}>
        {options.map((o) => (
          <RadioCard
            key={o.value}
            name={name}
            {...o}
            tile={tiles}
            listenKey={o.listenKey ?? (listen ? `help.option.${listen}.${o.value}` : undefined)}
            onNoVoice={() => setNoVoice(true)}
            checked={value === o.value}
            onChange={onChange}
          />
        ))}
      </div>
      {noVoice && <p className={styles.note}>{t('assist.noVoiceOption')}</p>}
      {error && <p className={styles.error}>{te(error)}</p>}
    </fieldset>
  );
}
