// Admin: CSV exports (Batch 4, feature 31). Four files; each download is written to the audit
// log by the server before the file is sent. The page says plainly what is never in a file.
import { useState } from 'react';
import { Download, FileCheck2, ScrollText, ShieldCheck, ShieldOff, Users } from 'lucide-react';
import API from '../../api';
import { Alert, Button, PageHeader, Select, TextField, useToast } from '../../components/ui';
import { filenameFrom, saveBlob } from '../../features/admin/adminHelpers';
import { useDocumentTitle, useT } from '../../i18n';
import { apiError } from '../../utils/apiErrors';
import styles from './Admin.module.css';

const IDENTITY = ['Pending', 'Unverified', 'Verified', 'Rejected', 'All'];
const EVIDENCE = ['pending', 'approved', 'rejected', 'suspected_fake', 'revoked', 'all'];
const ACCOUNT = ['all', 'active', 'suspended'];

function ExportCard({ kind, icon: Icon, children, params }) {
  const toast = useToast();
  const { t, te, formatNumber } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [note, setNote] = useState(null);

  const download = async () => {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const clean = Object.fromEntries(Object.entries(params).filter(([, value]) => value));
      const res = await API.get(`/admin/exports/${kind}`, { params: clean, responseType: 'blob' });
      saveBlob(res.data, filenameFrom(res.headers['content-disposition'], `dlm-${kind}.csv`));
      const rows = formatNumber(res.headers['x-export-rows'] ?? 0);
      toast.show({ title: t('adminx.exports.done', { rows }) });
      if (res.headers['x-export-truncated'] === 'true') setNote(t('adminx.exports.truncated', { rows }));
    } catch (err) {
      setError(apiError(err, 'adminx.exports.failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.exportCard} aria-labelledby={`export-${kind}`}>
      <span className={styles.exportIcon} aria-hidden="true"><Icon size={22} strokeWidth={1.75} /></span>
      <div className={styles.exportText}>
        <h2 id={`export-${kind}`} className={styles.sectionTitle}>{t(`adminx.exports.${kind}.title`)}</h2>
        <p className={styles.method}>{t(`adminx.exports.${kind}.text`)}</p>
      </div>
      <div className={styles.exportFilters}>{children}</div>
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {note && <Alert tone="warning">{note}</Alert>}
      <Button icon={Download} loading={busy} onClick={download}>{t('adminx.exports.download')}<span className="visually-hidden">: {t(`adminx.exports.${kind}.title`)}</span></Button>
    </section>
  );
}

export default function AdminExports() {
  const { t } = useT();
  useDocumentTitle(t('adminx.titles.exports'));
  const [audit, setAudit] = useState({ from: '', to: '' });
  const [identity, setIdentity] = useState('Pending');
  const [evidence, setEvidence] = useState('pending');
  const [account, setAccount] = useState('all');

  return (
    <div>
      <PageHeader title={t('adminx.exports.title')} description={t('adminx.exports.lead')} />
      <Alert tone="info" title={t('adminx.exports.privacyTitle')}>
        <span className={styles.privacy}><ShieldOff size={18} aria-hidden="true" /> {t('adminx.exports.privacyText')}</span>
      </Alert>
      <div className={styles.exportGrid}>
        <ExportCard kind="audit" icon={ScrollText} params={audit}>
          <TextField label={t('adminx.exports.from')} type="date" value={audit.from} onChange={(e) => setAudit({ ...audit, from: e.target.value })} />
          <TextField label={t('adminx.exports.to')} type="date" value={audit.to} onChange={(e) => setAudit({ ...audit, to: e.target.value })} />
        </ExportCard>
        <ExportCard kind="identity" icon={ShieldCheck} params={{ status: identity }}>
          <Select label={t('adminx.exports.status')} value={identity} onChange={(e) => setIdentity(e.target.value)} options={IDENTITY.map((s) => ({ value: s, label: t(`status.identityShort.${s}`) }))} />
        </ExportCard>
        <ExportCard kind="evidence" icon={FileCheck2} params={{ status: evidence }}>
          <Select label={t('adminx.exports.status')} value={evidence} onChange={(e) => setEvidence(e.target.value)} options={EVIDENCE.map((s) => ({ value: s, label: t(`status.evidence.${s}`) }))} />
        </ExportCard>
        <ExportCard kind="users" icon={Users} params={{ status: account }}>
          <Select label={t('adminx.exports.status')} value={account} onChange={(e) => setAccount(e.target.value)} options={ACCOUNT.map((s) => ({ value: s, label: t(`adminx.users.statuses.${s}`) }))} />
        </ExportCard>
      </div>
      <p className={styles.method}>{t('adminx.exports.limit')}</p>
    </div>
  );
}
