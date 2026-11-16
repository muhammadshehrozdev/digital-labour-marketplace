// Clip recorder (Batch 5, development builds only: /dev/recorder). The team records the spoken help
// in their own voices; the website then plays these clips first (D-034). One text at a time:
// record with the microphone (MediaRecorder), play back, record again, and save the file with the
// right name. Saving downloads the file; where the browser can choose a folder, it can also write
// straight into frontend/public/audio/help/<ur|en>/. Afterwards: npm run audio:manifest.
// Only the team's own recordings go here: no generated or downloaded audio (Batch 5 rules).
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Circle, FolderOpen, Play, Save, Square } from 'lucide-react';
import { Alert, Button, Checkbox, PageHeader } from '../../components/ui';
import en from '../../i18n/dictionaries/en';
import ur from '../../i18n/dictionaries/ur';
import manifest from '../../features/assist/clipManifest.json';
import { clipBaseName, clipKeysFrom, clipText } from '../../features/assist/clipKeys';
import styles from './ClipRecorder.module.css';

const DICTS = { ur, en };
const EXT = [['audio/webm', 'webm'], ['audio/ogg', 'ogg'], ['audio/mp4', 'm4a'], ['audio/mpeg', 'mp3']];
const extFor = (mime) => EXT.find(([m]) => String(mime).startsWith(m))?.[1] ?? 'webm';

export default function ClipRecorder() {
  const [lang, setLang] = useState('ur');
  const keys = useMemo(() => clipKeysFrom(DICTS[lang], lang), [lang]);
  const existing = useMemo(() => new Set((manifest[lang] ?? []).map((f) => f.replace(/\.[^.]+$/, ''))), [lang]);
  const [saved, setSaved] = useState(() => new Set());
  const [missingOnly, setMissingOnly] = useState(false);
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [clip, setClip] = useState(null); // { url, blob, ext }
  const [problem, setProblem] = useState('');
  const [folder, setFolder] = useState(null);
  const recorder = useRef(null);

  const done = (key) => existing.has(clipBaseName(key)) || saved.has(`${lang}/${clipBaseName(key)}`);
  const shown = missingOnly ? keys.filter((k) => !done(k)) : keys;
  const current = shown[Math.min(index, Math.max(0, shown.length - 1))];
  const recordedCount = keys.filter(done).length;

  useEffect(() => () => { if (clip?.url) URL.revokeObjectURL(clip.url); }, [clip]);

  const move = (step) => {
    setClip(null);
    setProblem('');
    setIndex((i) => Math.min(Math.max(0, i + step), shown.length - 1));
  };

  const record = async () => {
    setProblem('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const type = rec.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type });
        setClip({ url: URL.createObjectURL(blob), blob, ext: extFor(type) });
        setRecording(false);
      };
      recorder.current = rec;
      setClip(null);
      rec.start();
      setRecording(true);
    } catch {
      setProblem('The microphone could not be opened. Allow it for this page (lock icon next to the address) and try again.');
    }
  };

  const save = async () => {
    if (!clip || !current) return;
    const name = `${clipBaseName(current)}.${clip.ext}`;
    try {
      if (folder) {
        const handle = await folder.getFileHandle(name, { create: true });
        const writable = await handle.createWritable();
        await writable.write(clip.blob);
        await writable.close();
      } else {
        const a = document.createElement('a');
        a.href = clip.url;
        a.download = name;
        a.click();
      }
      setSaved((s) => new Set(s).add(`${lang}/${clipBaseName(current)}`));
    } catch {
      setProblem('The file could not be saved. Try "Save" again, or download it instead of using a folder.');
    }
  };

  const chooseFolder = async () => {
    try {
      setFolder(await window.showDirectoryPicker({ mode: 'readwrite' }));
    } catch {
      // the person closed the folder dialog
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader title="Clip recorder" description="Record the spoken help in the team's own voices. Development page; not in the live website." />
      <Alert tone="info">
        Save each file into <code>frontend/public/audio/help/{lang}/</code>, then run <code>npm run audio:manifest</code> in <code>.\frontend</code>.
        Guide: <code>docs/audio/RECORDING-GUIDE.md</code>.
      </Alert>
      <div className={styles.bar}>
        <div className={styles.langs} role="group" aria-label="Recording language">
          {['ur', 'en'].map((l) => (
            <Button key={l} size="sm" variant={lang === l ? 'primary' : 'secondary'} aria-pressed={lang === l} onClick={() => { setLang(l); setIndex(0); setClip(null); }}>
              {l === 'ur' ? 'Urdu' : 'English'}
            </Button>
          ))}
        </div>
        <p className={styles.progress} role="status">{recordedCount} of {keys.length} recorded</p>
        <Checkbox label="Show missing clips only" checked={missingOnly} onChange={(on) => { setMissingOnly(on); setIndex(0); }} />
        {'showDirectoryPicker' in window && (
          <Button size="sm" variant="secondary" icon={FolderOpen} onClick={chooseFolder}>{folder ? `Folder: ${folder.name}` : 'Choose the folder'}</Button>
        )}
      </div>

      {current ? (
        <section className={styles.card} aria-labelledby="clip-key">
          <p className={styles.counter}>{Math.min(index, shown.length - 1) + 1} / {shown.length}{done(current) ? ' · recorded' : ' · missing'}</p>
          <h2 id="clip-key" className={styles.key}><code>{current}</code></h2>
          <p className={styles.file}>File: <code>{clipBaseName(current)}.webm</code> (or .mp3, .m4a, .ogg)</p>
          <p className={styles.say} lang={lang} dir={lang === 'ur' ? 'rtl' : 'ltr'}>{clipText(current, DICTS[lang], lang)}</p>
          {lang === 'ur' && <p className={styles.english}>{clipText(current, en, 'en')}</p>}
          {problem && <Alert tone="danger">{problem}</Alert>}
          <div className={styles.actions}>
            {recording
              ? <Button icon={Square} onClick={() => recorder.current?.stop()}>Stop</Button>
              : <Button icon={Circle} onClick={record}>{clip ? 'Record again' : 'Record'}</Button>}
            <Button variant="secondary" icon={Play} disabled={!clip || recording} onClick={() => new Audio(clip.url).play()}>Play</Button>
            <Button variant="secondary" icon={Save} disabled={!clip || recording} onClick={save}>Save</Button>
          </div>
          <div className={styles.nav}>
            <Button variant="ghost" icon={ChevronLeft} disabled={index === 0} onClick={() => move(-1)}>Previous</Button>
            <Button variant="ghost" iconRight={ChevronRight} disabled={index >= shown.length - 1} onClick={() => move(1)}>Next</Button>
          </div>
        </section>
      ) : <Alert tone="success">Every clip is recorded.</Alert>}

      <details className={styles.missing}>
        <summary>Missing clips ({keys.length - recordedCount})</summary>
        <ul>{keys.filter((k) => !done(k)).map((k) => <li key={k}><code>{clipBaseName(k)}</code></li>)}</ul>
      </details>
    </div>
  );
}
