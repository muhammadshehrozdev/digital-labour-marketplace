// Speech may only start after the person has touched the page (browsers block it otherwise, and we
// never talk on first load). AssistRoot marks the first tap or key press; auto-read waits for it.
let interacted = false;
export const hasInteracted = () => interacted;
export function markInteracted() {
  interacted = true;
}
// for tests
export function resetInteraction() {
  interacted = false;
}
