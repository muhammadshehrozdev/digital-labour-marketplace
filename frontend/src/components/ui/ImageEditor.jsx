// "Crop or rotate" before upload (Batch 4, feature 15). Keyboard friendly: two buttons turn the
// photo, four sliders cut each side (arrow keys move them), "Start again" resets. The preview is
// the exact picture that will be uploaded. Works without a pointer and without a mouse.
import { useEffect, useRef, useState } from 'react';
import { RotateCcw, RotateCw, Undo2 } from 'lucide-react';
import Button from './Button';
import Dialog from './Dialog';
import { useT } from '../../i18n/context';
import { MAX_CROP, canvasToFile, drawEdited, nextRotation } from '../../utils/imageEdit';
import styles from './ImageEditor.module.css';

const NONE = { left: 0, right: 0, top: 0, bottom: 0 };
const SIDES = [['left', 'cropLeft'], ['right', 'cropRight'], ['top', 'cropTop'], ['bottom', 'cropBottom']];

export default function ImageEditor({ file, onClose, onApply }) {
  const { t } = useT();
  const canvasRef = useRef(null);
  const [source, setSource] = useState(null);
  // a browser without createImageBitmap cannot edit; the photo can still be uploaded as it is
  const [failed, setFailed] = useState(() => typeof createImageBitmap !== 'function');
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState(NONE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (typeof createImageBitmap !== 'function') return undefined;
    createImageBitmap(file, { imageOrientation: 'from-image' })
      .then((bitmap) => active && setSource(bitmap))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [file]);

  useEffect(() => {
    if (source && canvasRef.current) drawEdited(canvasRef.current, source, rotation, crop, 900);
  }, [source, rotation, crop]);

  const apply = async () => {
    setSaving(true);
    const canvas = document.createElement('canvas');
    drawEdited(canvas, source, rotation, crop, 2000);
    const edited = await canvasToFile(canvas, file.name);
    setSaving(false);
    if (edited) onApply(edited);
    else setFailed(true);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={t('workerx.upload.editorTitle')}
      description={t('workerx.upload.editorText')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={apply} loading={saving} disabled={!source}>{t('workerx.upload.apply')}</Button>
        </>
      }
    >
      {failed ? (
        <p role="alert">{t('workerx.upload.editFailed')}</p>
      ) : (
        <div className={styles.editor}>
          <div className={styles.stage}>
            <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={t('workerx.upload.previewAlt')} />
          </div>
          <div className={styles.tools}>
            <div className={styles.turns}>
              <Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => setRotation((r) => nextRotation(r, -90))}>{t('workerx.upload.rotateLeft')}</Button>
              <Button size="sm" variant="secondary" icon={RotateCw} onClick={() => setRotation((r) => nextRotation(r, 90))}>{t('workerx.upload.rotateRight')}</Button>
              <Button size="sm" variant="ghost" icon={Undo2} onClick={() => { setRotation(0); setCrop(NONE); }}>{t('workerx.upload.reset')}</Button>
            </div>
            {SIDES.map(([side, label]) => (
              <label key={side} className={styles.slider}>
                <span>{t(`workerx.upload.${label}`)}</span>
                <input
                  type="range"
                  min="0"
                  max={MAX_CROP * 100}
                  step="1"
                  value={Math.round(crop[side] * 100)}
                  dir="ltr"
                  aria-valuetext={`${Math.round(crop[side] * 100)}%`}
                  onChange={(e) => setCrop({ ...crop, [side]: Number(e.target.value) / 100 })}
                />
                <span className="tabular" dir="ltr">{Math.round(crop[side] * 100)}%</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </Dialog>
  );
}
