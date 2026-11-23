// The price terms of a booking (Module 5, §7): the agreed price (or the change waiting next to the last agreed
// one), the conditions, the checks, the version history, and the right button: Agree (with the read-back
// and 🔊) or Propose a change (the terms form). The server decides which buttons fit (booking.termsActions).
import { useState } from 'react';
import { Handshake, History, PencilLine } from 'lucide-react';
import API from '../../api';
import { Alert, Button, Dialog, useToast } from '../../components/ui';
import { useT } from '../../i18n';
import { apiError } from '../../utils/apiErrors';
import ChecksList from './ChecksList';
import ListenButton from './ListenButton';
import TermsForm from './TermsForm';
import { conditionWords, priceLine, readBack, rupees, spokenRupees } from './wageText';
import styles from './Wage.module.css';

function Version({ title, p, category, extra }) {
  const { t, formatNumber } = useT();
  const money = (n) => rupees(t, formatNumber, n);
  return (
    <div className={styles.version}>
      <p className={styles.versionTitle}>{title}</p>
      <p className={styles.big}>{priceLine(t, money, p)}</p>
      {conditionWords(t, money, p, { category }).map((w) => <p key={w} className={styles.muted}>{w}</p>)}
      {p.note && <p className={styles.noteText} dir="auto">{p.note}</p>}
      {extra}
    </div>
  );
}

export default function TermsSummary({ booking: b, viewer, onChanged }) {
  const { t, te, formatDate, formatNumber } = useT();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [agreeing, setAgreeing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const terms = b.terms ?? { status: 'none' };
  const actions = b.termsActions ?? [];
  const money = (n) => rupees(t, formatNumber, n);
  const other = terms.proposedBy && terms.proposedBy !== viewer;
  const who = (role) => t(`wage.terms.by.${role}`);

  const agree = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await API.post(`/bookings/${b._id}/terms/agree`, { version: terms.version });
      setAgreeing(false);
      toast.show({ tone: 'success', title: t('wage.terms.agreedDone') });
      onChanged?.(data.booking);
    } catch (err) {
      setAgreeing(false);
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.section} aria-labelledby={`terms-${b._id}`} data-testid="terms-summary" id="terms">
      <h2 id={`terms-${b._id}`} className={styles.sectionTitle}><Handshake size={20} aria-hidden="true" /> {t('wage.terms.title')}</h2>
      {terms.status === 'none' && <p data-testid="terms-none">{t('wage.terms.none')}</p>}
      {terms.agreed && (
        <Version
          title={t('wage.terms.agreedOn', { date: formatDate(terms.agreed.agreedAt, { day: 'numeric', month: 'long', year: 'numeric' }) })}
          p={terms.agreed}
          category={b.category}
          extra={<p className={styles.agreedLine} data-testid="price-agreed">{t('wage.terms.priceAgreed', { price: priceLine(t, money, terms.agreed) })}</p>}
        />
      )}
      {terms.status === 'proposed' && terms.current && (
        <Version
          title={terms.agreed ? t('wage.terms.changeWaiting', { by: who(terms.proposedBy) }) : t('wage.terms.proposedBy', { by: who(terms.proposedBy) })}
          p={terms.current}
          category={b.category}
          extra={<p className={styles.muted} data-testid="terms-waiting">{other ? t('wage.terms.waitingForYou') : t('wage.terms.waitingForOther')}</p>}
        />
      )}
      {terms.status !== 'none' && <ChecksList checks={b.termsChecks ?? []} names={b.wageReference?.names} viewer={viewer} />}
      <p className={styles.rule}>{t('wage.form.extraWorkRule')}</p>
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {!editing && (
        <div className={styles.actions}>
          {actions.includes('agree_terms') && <Button size="lg" icon={Handshake} onClick={() => setAgreeing(true)}>{t('wage.terms.agree')}</Button>}
          {actions.includes('propose_terms') && (
            <Button size="lg" variant={actions.includes('agree_terms') ? 'secondary' : 'primary'} icon={PencilLine} onClick={() => setEditing(true)}>
              {t(terms.status === 'none' ? 'wage.terms.propose' : viewer === 'worker' && terms.status === 'proposed' && other ? 'wage.terms.proposeAnother' : 'wage.terms.proposeChange')}
            </Button>
          )}
        </div>
      )}
      {editing && <TermsForm booking={b} viewer={viewer} onCancel={() => setEditing(false)} onSent={(fresh) => { setEditing(false); onChanged?.(fresh); }} />}
      {(b.termsHistory ?? []).length > 0 && (
        <details className={styles.history}>
          <summary><History size={18} aria-hidden="true" /> {t('wage.terms.history', { count: b.termsHistory.length })}</summary>
          <ol className={styles.historyList} data-testid="terms-history">
            {b.termsHistory.map((h) => (
              <li key={`${h.version}-${h.action}`}>
                <strong>{t(`wage.terms.event.${h.action}`, { version: h.version, by: who(h.by) })}</strong>
                {' · '}{formatDate(h.at, { dateStyle: 'medium', timeStyle: 'short' })}
                {h.snapshot && <span className={styles.muted}> · {priceLine(t, money, h.snapshot)}</span>}
                {h.action === 'proposed' && terms.agreed && h.version > terms.agreed.version && terms.status !== 'proposed' && <span className={styles.muted}> · {t('wage.terms.notAgreed')}</span>}
              </li>
            ))}
          </ol>
        </details>
      )}
      <Dialog
        open={agreeing}
        onClose={() => setAgreeing(false)}
        title={t('wage.terms.agreeTitle')}
        footer={<><Button variant="secondary" onClick={() => setAgreeing(false)}>{t('common.cancel')}</Button><Button icon={Handshake} loading={busy} onClick={agree}>{t('wage.terms.agree')}</Button></>}
      >
        {terms.current && (
          <div className={styles.readBack} data-testid="agree-read-back">
            <p>{readBack(t, money, terms.current, { category: b.category, intro: 'wage.readBack.agree' })}</p>
            {terms.current.note && <p className={styles.muted} dir="auto">{t('wage.readBack.note', { note: terms.current.note })}</p>}
            <ListenButton build={(spokenT) => readBack(spokenT, spokenRupees(spokenT), terms.current, { category: b.category, prefix: 'wage.spoken.price', intro: 'wage.readBack.agree' })} />
          </div>
        )}
      </Dialog>
    </section>
  );
}
