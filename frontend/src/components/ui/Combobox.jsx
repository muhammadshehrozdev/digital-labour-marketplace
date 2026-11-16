import { useCallback, useId, useMemo, useRef, useState } from 'react';
import Field from './Field';
import fieldStyles from './Field.module.css';
import styles from './Combobox.module.css';
import { useT } from '../../i18n/context';

// Searchable select (WAI-ARIA combobox pattern with a listbox popup).
// options: [{ value, label, group? }]. onSelect(option) is called on Enter or click; the input then clears.
// Keys: ArrowDown/ArrowUp move, Enter selects, Escape closes.
// assist (Batch 5): help key; a spoken search fills the box and opens the list. icon: shown in the help.
export default function Combobox({ id, label, hint, options, onSelect, placeholder, emptyText, maxResults = 50, assist, icon }) {
  const { t } = useT();
  const listId = `l${useId().replace(/:/g, '')}`;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const speakSearch = useCallback((said) => { setQuery(said); setOpen(true); setActive(0); }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? options.filter((o) => `${o.label} ${o.group ?? ''}`.toLowerCase().includes(q)) : options;
    return list.slice(0, maxResults);
  }, [options, query, maxResults]);

  const choose = (option) => {
    if (!option) return;
    onSelect(option);
    setQuery('');
    setOpen(false);
    setActive(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && results[active]) {
        e.preventDefault();
        choose(results[active]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const optionId = (i) => `${listId}-o${i}`;
  return (
    <Field label={label} hint={hint} id={id} assist={assist} assistControl={{ icon, speak: 'text', value: query, onValue: speakSearch }}>
      {(fieldProps) => (
        <div className={styles.wrap}>
          <input
            {...fieldProps}
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open && results[active] ? optionId(active) : undefined}
            className={fieldStyles.control}
            placeholder={placeholder}
            value={query}
            autoComplete="off"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
          />
          <ul id={listId} role="listbox" aria-label={label} className={styles.list} hidden={!open}>
            {results.length === 0 && <li className={styles.empty} role="presentation">{emptyText ?? t('ui.combobox.noMatch')}</li>}
            {results.map((o, i) => (
              <li
                key={o.value}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                className={[styles.option, i === active && styles.active].filter(Boolean).join(' ')}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(o);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span>{o.label}</span>
                {o.group && <span className={styles.group}>{o.group}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Field>
  );
}
