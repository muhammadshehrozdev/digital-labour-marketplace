// 🔊 "Hear this request" (Batch 6, section 7): reads a composed sentence in the SPOKEN language
// ("New work: house wiring, tomorrow, morning, G-9 Markaz, Islamabad"), then, when that ends, the
// customer's own words in their own script with Batch 5's read-back ("Written: ...").
import { useEffect, useId, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { skillNameIn } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { getAudioState, stopSound, subscribeAudio } from '../assist/audio';
import { useAudioState } from '../assist/useAudioState';
import { useSay } from '../assist/useSay';
import { dayKey } from './bookingText';
import styles from './Booking.module.css';

export default function HearRequest({ booking: b }) {
  const { t, formatDate } = useT();
  const { say, readBack } = useSay();
  const { playingId } = useAudioState();
  const id = `hear${useId().replace(/:/g, '')}`;
  const [noVoice, setNoVoice] = useState(false);
  const cleanup = useRef(null);
  useEffect(() => () => cleanup.current?.(), []);
  const busy = playingId === id;

  const onClick = async () => {
    if (busy) {
      cleanup.current?.();
      stopSound();
      return;
    }
    cleanup.current?.();
    const day = dayKey(b.preferredDate);
    const how = await say(id, 'booking.hear.sentence', {
      skill: (lang) => skillNameIn({ skillId: b.skillId, name: b.skillName }, lang),
      day: (lang, spokenT) => (day ? spokenT(day) : formatDate(`${b.preferredDate}T12:00:00Z`, { weekday: 'long', day: 'numeric', month: 'long' })),
      slot: (lang, spokenT) => spokenT(`booking.slot.${b.timeSlot}`),
      area: b.area,
      city: b.city,
    });
    if (how === 'none') {
      setNoVoice(true);
      return;
    }
    if (!b.description) return;
    // when the sentence has ended by itself (not stopped, not replaced by another sound), read the text
    let started = getAudioState().playingId === id; // say() returns once the sentence has started
    const unsubscribe = subscribeAudio(() => {
      const state = getAudioState(); // listeners are called without arguments
      if (state.playingId === id) started = true;
      else if (started || state.playingId !== null) {
        unsubscribe();
        cleanup.current = null;
        if (state.playingId === null) readBack(id, b.description);
      }
    });
    cleanup.current = () => { unsubscribe(); cleanup.current = null; };
  };

  return (
    <div className={styles.hear}>
      <button type="button" className={styles.hearButton} aria-pressed={busy} onClick={onClick} data-testid="hear-request">
        <Volume2 size={22} aria-hidden="true" /> {t('booking.hear.button')}
      </button>
      {noVoice && <p className={styles.muted}>{t('booking.hear.noVoice')}</p>}
    </div>
  );
}
