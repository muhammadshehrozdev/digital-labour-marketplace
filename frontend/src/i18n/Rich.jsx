// Shows a translated sentence where **two stars** mark bold words, e.g.
// "Windows voice typing with **Win + H**". No HTML from dictionaries is ever injected.
export default function Rich({ text }) {
  const parts = String(text).split('**');
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}
