// Marks the parts of a text that match the search words (Batch 4, feature 21).
import { splitMatches } from './highlightText';

export default function Highlight({ text, query }) {
  return splitMatches(text, query).map((part, i) => (part.match ? <mark key={i}>{part.text}</mark> : part.text));
}
