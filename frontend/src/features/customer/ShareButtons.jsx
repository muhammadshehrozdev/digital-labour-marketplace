// Share and Print for a public profile (Batch 4, features 46 and 47).
// Share: the phone's own share sheet (Web Share API) where it exists, otherwise the link is
// copied. The link is the public profile page; it carries no private data.
// Print: the browser's print dialog; print styles (base.css) leave out the navigation and
// everything marked data-print="hide" (private sections never reach paper).
import { Printer, Share2 } from 'lucide-react';
import { Button, useToast } from '../../components/ui';
import { useT } from '../../i18n';
import { buzz } from '../../utils/haptics';
import { profileUrl, shareProfile } from './share';

export function ShareButton({ workerIdCode, name, trade, size = 'sm' }) {
  const toast = useToast();
  const { t } = useT();
  const share = async () => {
    const result = await shareProfile({ url: profileUrl(workerIdCode), title: name, text: t('customerx.share.text', { name, trade }) });
    if (result === 'copied') {
      buzz(12);
      toast.show({ title: t('customerx.share.copied'), message: t('customerx.share.note') });
    } else if (result === 'failed') {
      toast.show({ tone: 'danger', title: t('customerx.share.copyFailed') });
    }
  };
  return <Button size={size} variant="secondary" icon={Share2} onClick={share}>{t('customerx.share.button')}</Button>;
}

export function PrintButton({ size = 'sm' }) {
  const { t } = useT();
  return <Button size={size} variant="secondary" icon={Printer} onClick={() => window.print()}>{t('customerx.print')}</Button>;
}
