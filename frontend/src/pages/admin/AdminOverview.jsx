import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import API from '../../api';
import { Alert, Card, PageHeader, Skeleton } from '../../components/ui';
import { apiMessage } from '../../utils/apiErrors';
import styles from './Admin.module.css';

// Real counts from GET /api/admin/stats (no invented numbers).
export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    API.get('/admin/stats').then(({ data }) => setStats(data)).catch((err) => setError(apiMessage(err, 'Could not load the counts.')));
  }, []);

  const tiles = stats
    ? [
        { label: 'Waiting for identity review', value: stats.workers.Pending, to: '/admin/identity?status=Pending', strong: true },
        { label: 'Worker profiles', value: stats.workers.total, to: '/admin/identity?status=All' },
        { label: 'Identity verified', value: stats.workers.Verified, to: '/admin/identity?status=Verified' },
        { label: 'Identity not accepted', value: stats.workers.Rejected, to: '/admin/identity?status=Rejected' },
        { label: 'No CNIC yet', value: stats.workers.Unverified, to: '/admin/identity?status=Unverified' },
        { label: 'Customer accounts', value: stats.users.customer },
        { label: 'Worker accounts', value: stats.users.worker },
        { label: 'Admin accounts', value: stats.users.admin },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Admin overview" description="Queues and counts. Every decision is written to the audit log." />
      {error && <Alert tone="danger">{error}</Alert>}
      {!stats && !error && (
        <div className={styles.tiles} aria-busy="true">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} variant="block" height={104} />)}</div>
      )}
      {stats && (
        <ul className={styles.tiles}>
          {tiles.map((t) => (
            <li key={t.label}>
              <Card className={[styles.tile, t.strong && styles.tileStrong].filter(Boolean).join(' ')}>
                <p className={styles.tileValue}>{t.value.toLocaleString('en')}</p>
                <p className={styles.tileLabel}>{t.label}</p>
                {t.to && (
                  <Link to={t.to} className={styles.tileLink}>
                    Open<span className="visually-hidden"> {t.label}</span> <ArrowRight size={16} aria-hidden="true" />
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
