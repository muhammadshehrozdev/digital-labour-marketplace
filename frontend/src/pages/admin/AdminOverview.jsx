import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import API from '../../api';
import { Alert, Card, PageHeader, Skeleton } from '../../components/ui';
import { apiError } from '../../utils/apiErrors';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './Admin.module.css';

// Real counts from GET /api/admin/stats (no invented numbers).
export default function AdminOverview() {
  const { t, te, formatNumber } = useT();
  useDocumentTitle(t('titles.adminOverview'));
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    API.get('/admin/stats').then(({ data }) => setStats(data)).catch((err) => setError(apiError(err, 'admin.overview.loadFailed')));
  }, []);

  const tiles = stats
    ? [
        { key: 'identityPending', value: stats.workers.Pending, to: '/admin/identity?status=Pending', strong: true },
        { key: 'proofPending', value: stats.evidence?.pending ?? 0, to: '/admin/evidence?status=pending', strong: true },
        { key: 'proofFake', value: stats.evidence?.suspected_fake ?? 0, to: '/admin/evidence?status=suspected_fake' },
        { key: 'profiles', value: stats.workers.total, to: '/admin/identity?status=All' },
        { key: 'verified', value: stats.workers.Verified, to: '/admin/identity?status=Verified' },
        { key: 'rejected', value: stats.workers.Rejected, to: '/admin/identity?status=Rejected' },
        { key: 'noCnic', value: stats.workers.Unverified, to: '/admin/identity?status=Unverified' },
        { key: 'customers', value: stats.users.customer },
        { key: 'workers', value: stats.users.worker },
        { key: 'admins', value: stats.users.admin },
      ]
    : [];

  return (
    <div>
      <PageHeader title={t('admin.overview.title')} description={t('admin.overview.lead')} />
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {!stats && !error && (
        <div className={styles.tiles} aria-busy="true">{Array.from({ length: 10 }, (_, i) => <Skeleton key={i} variant="block" height={104} />)}</div>
      )}
      {stats && (
        <ul className={styles.tiles}>
          {tiles.map((tile, i) => (
            <li key={tile.key} style={{ '--i': i }}>
              <Card className={[styles.tile, tile.strong && styles.tileStrong].filter(Boolean).join(' ')}>
                <p className={`${styles.tileValue} tabular`}>{formatNumber(tile.value)}</p>
                <p className={styles.tileLabel}>{t(`admin.overview.tiles.${tile.key}`)}</p>
                {tile.to && (
                  <Link to={tile.to} className={styles.tileLink}>
                    {t('admin.overview.open')}<span className="visually-hidden"> {t(`admin.overview.tiles.${tile.key}`)}</span> <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
