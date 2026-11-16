// 🔊 next to a notification (Batch 5): reads its title and text aloud, in the spoken language
// (Roman Urdu users hear the Urdu sentences and the Urdu skill name).
import OptionListen from '../assist/OptionListen';
import { skillNameIn } from '../../hooks/useTaxonomy';

export default function NotificationListen({ n, name }) {
  const skill = (lang) => (n.params?.skillId ? skillNameIn({ skillId: n.params.skillId, name: n.params.skillName }, lang) : n.params?.skillName ?? '');
  const params = {
    title: (lang, spokenT) => spokenT(`workerx.notifications.types.${n.type}.title`, { skill: skill(lang) }),
    text: (lang, spokenT) => spokenT(`workerx.notifications.types.${n.type}.text`),
  };
  return <OptionListen helpKey="help.notification" params={params} name={name} />;
}
