// First visit: choose the website language (Batch 3, D-019). A full screen, not a browser pop-up.
// Each card is written in its own language, with lang and dir set, so screen readers read it right.
import { useEffect, useState } from 'react';
import { ArrowRight, Volume2 } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import { TradeArt } from '../../components/illustrations';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { LANGUAGES, useChangeLanguage } from '../../i18n';
import { clipUrl, play, stopSound } from '../../features/assist/audio';
import { setSettings } from '../../features/assist/settingsStore';
import { useAudioState } from '../../features/assist/useAudioState';
import { audioLangFor } from '../../features/assist/voices';
import styles from './LanguageChooser.module.css';

const CHOOSER_TRADES = ['electrical_solar', 'plumbing_sanitary', 'construction_masonry', 'carpentry_woodwork', 'painting_renovation'];

export default function LanguageChooser() {
  const changeLanguage = useChangeLanguage();
  const [busy, setBusy] = useState('');

  useEffect(() => {
    document.title = LANGUAGES.map((l) => l.chooserTitle).join(' · ');
  }, []);

  const choose = async (code) => {
    setBusy(code);
    setSettings({ offerPending: true }); // next: ask once whether pages should be read aloud (Batch 5)
    await changeLanguage(code);
    setBusy('');
  };

  return (
    <main id="main" className={styles.page}>
      <div className={styles.corner}><ThemeToggle tone="dark" /></div>
      <div className={styles.inner}>
        <div className={styles.logo}><Logo size={44} animated tone="dark" /></div>
        <h1 className={styles.title}>
          {LANGUAGES.map((l) => (
            <span key={l.code} lang={l.htmlLang} dir={l.dir} className={styles.titleLine}>{l.chooserTitle}</span>
          ))}
        </h1>
        {/* Design v3: who the website is for, before any word is read (decorative) */}
        <div className={styles.trades} aria-hidden="true" data-testid="chooser-trades">
          {CHOOSER_TRADES.map((c) => <TradeArt key={c} category={c} size={64} tone="dark" className={styles.trade} />)}
        </div>
        <ul className={styles.cards}>
          {LANGUAGES.map((l, i) => (
            <li key={l.code} style={{ '--i': i }} className={styles.item}>
              <button
                type="button"
                className={styles.card}
                lang={l.htmlLang}
                dir={l.dir}
                onClick={() => choose(l.code)}
                aria-busy={busy === l.code || undefined}
                disabled={Boolean(busy)}
              >
                <span className={styles.name}>{l.nativeName}</span>
                <span className={styles.preview}>{l.preview}</span>
                <span className={styles.go}>
                  {l.chooserContinue}
                  <ArrowRight size={18} aria-hidden="true" className={styles.arrow} />
                </span>
              </button>
              <ChooserListen language={l} />
            </li>
          ))}
        </ul>
        <p className={styles.hints}>
          {LANGUAGES.map((l) => (
            <span key={l.code} lang={l.htmlLang} dir={l.dir}>{l.chooserHint}</span>
          ))}
        </p>
      </div>
    </main>
  );
}

// Batch 5: each card has its own 🔊 that says, in that language, "press here for …". Nothing has been
// chosen yet, so these are the most important sounds of the website (the team records them first).
function ChooserListen({ language }) {
  const { playingId } = useAudioState();
  const [noVoice, setNoVoice] = useState(false);
  const id = `chooser-${language.code}`;
  const playing = playingId === id;
  const onClick = async () => {
    if (playing) {
      stopSound();
      return;
    }
    const lang = audioLangFor(language.code);
    const how = await play({ id, clip: clipUrl(lang, `help.chooser.${language.code}`), text: language.chooserSpoken, lang });
    setNoVoice(how === 'none');
  };
  return (
    <div className={styles.listenRow} lang={language.htmlLang} dir={language.dir}>
      <button type="button" className={styles.listen} aria-pressed={playing} aria-label={language.chooserListenLabel} onClick={onClick}>
        <Volume2 size={20} strokeWidth={1.75} aria-hidden="true" />
        <span aria-hidden="true">{language.chooserListen}</span>
      </button>
      {noVoice && <span className={styles.noVoice}>{language.chooserNoVoice}</span>}
    </div>
  );
}
