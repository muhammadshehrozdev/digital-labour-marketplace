// Sharing a public profile link (Batch 4, feature 46): the phone's own share sheet (Web Share API)
// where it exists, otherwise the link is copied. The link carries no private data.
export const profileUrl = (workerIdCode) => `${window.location.origin}/workers/${encodeURIComponent(workerIdCode)}`;

export async function shareProfile({ url, title, text }) {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ url, title, text });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled'; // the person closed the share sheet
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
