// The other person's phone number, ONLY when the server sent it (booking accepted, or closed less than
// 7 days ago: D-002). Call (tel:) and WhatsApp (wa.me) buttons, each with an icon and a word.
import { MessageCircle, Phone } from 'lucide-react';
import { useT } from '../../i18n';
import styles from './Booking.module.css';

const tel = (phone) => `tel:${String(phone).replace(/[^\d+]/g, '')}`;

export default function ContactCard({ contact, viewer }) {
  const { t, formatDate } = useT();
  if (!contact) {
    return <p className={styles.contactHidden}>{t(viewer === 'customer' ? 'booking.contact.hiddenCustomer' : 'booking.contact.hiddenWorker')}</p>;
  }
  const person = viewer === 'customer' ? contact.worker : contact.customer;
  if (!person) return null;
  return (
    <section className={styles.contact} aria-labelledby="contact-title" data-testid="contact-card">
      <h2 id="contact-title" className={styles.sectionTitle}>{t(viewer === 'customer' ? 'booking.contact.titleWorker' : 'booking.contact.titleCustomer')}</h2>
      <p className={styles.phone} dir="ltr">{person.phone}</p>
      <div className={styles.actions}>
        <a className={styles.call} href={tel(person.phone)}>
          <Phone size={20} aria-hidden="true" /> {t('booking.contact.call')}
        </a>
        {person.whatsappLink && (
          <a className={styles.whatsapp} href={person.whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={20} aria-hidden="true" /> {t('booking.contact.whatsapp')}
          </a>
        )}
      </div>
      {contact.visibleUntil && <p className={styles.muted}>{t('booking.contact.until', { date: formatDate(contact.visibleUntil) })}</p>}
    </section>
  );
}
