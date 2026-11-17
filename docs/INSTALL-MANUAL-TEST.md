# Manual test: "Install this app" (Batch 6B, Part B)

What the automated tests cannot do: press the browser's own **Install** button. No website can install
itself — the browser always shows its own question, and the person must press "Install" there. This page lists
the hand checks. Write the date, the device, the browser version and the result next to each step; never write
a result you did not see.

## What the browsers allow (checked 16–17 Nov 2026)

| Platform | What happens | Source |
|---|---|---|
| Chrome / Edge on a computer, Chrome on Android (Chromium) | The browser fires `beforeinstallprompt`; the website keeps it and shows the browser's own question when the person presses Install. The question can be shown once per saved event. | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event), [web.dev](https://web.dev/learn/pwa/installation-prompt) |
| iPhone / iPad, Safari | No question from the browser. Share → "Add to Home Screen" → "Add". The website shows these steps with pictures. | web.dev |
| iPhone / iPad, Chrome, Edge, other apps | They cannot install web apps. The website says "Open this page in Safari" and offers to copy the link. | web.dev |
| Firefox on a computer, other browsers | The website says "Installing works in Chrome or Edge" with the link. | |
| Already installed (`display-mode: standalone`, or `appinstalled` seen) | Nothing install-related is shown. | web.dev |

Installation needs HTTPS. `localhost` counts as secure on the laptop, but a phone that opens the laptop's
preview over the local network (`http://192.168.x.x:5173`) does not: test phones on the **live site** after
deployment.

## A. Desktop Chrome on the laptop (`http://127.0.0.1:5173` or `http://localhost:5173`)

1. Open Chrome in a new profile or a guest window (no earlier "Not now"). Open the site, choose a language.
2. First page: no invitation. Click anywhere, then open a second page (for example "Log in"). Within a second
   the invitation appears at the bottom: the app icon, "Install the app: it opens like any other app on your
   phone and works with weak internet", 🔊 Listen, **Install**, **Not now**.
   (Or wait 30 seconds on the first page after a click.)
3. Press 🔊 Listen: the line is read in the website's language.
4. Press **Install**.
   - If Chrome has offered installation (an install icon in the address bar), Chrome's own dialog opens. Press
     "Install": a thank-you message appears and the invitation and the footer button disappear; the app opens in
     its own window. Press "Cancel" instead: the invitation closes and does not come back for 14 days.
   - If Chrome has not offered it yet (common on the development server, which has no service worker), the
     steps dialog opens: ⋮ → "Install app" / "Add to Home screen" (on a computer: "Cast, save and share") → "Install".
5. Scroll to the bottom of any page (visitor, worker, customer, admin): **Install this app** with a phone icon and
   a small 🔊. It does the same as step 4. It is not covered by the page help button or the "Back to top" button.
6. Open the installed app: no invitation and no footer button.
7. Repeat steps 2 and 5 in Urdu (right to left) and in dark mode.

## B. Android phone, Chrome, on the LIVE site (after deployment)

1. Open the live site in Chrome (not in a WhatsApp or Facebook in-app browser).
2. Open a second page after a tap: the invitation appears. Press **Install**: Chrome asks "Install app?" → Install.
3. The icon appears on the home screen; the app opens without the browser bar. Inside it: no install button.
4. Uninstall, open the site again, and press **Not now**: no invitation for 14 days (the footer button stays).

## C. iPhone, Safari, on the LIVE site (after deployment)

1. Open the live site in Safari. Open a second page after a tap: the invitation appears.
2. Press **Install**: the steps dialog shows the Share icon, "Add to Home Screen", "Add", each with a 🔊.
3. Follow the steps. The icon appears on the home screen; opened from there, there is no install button.
4. Open the site in Chrome on the same iPhone: Install says "Open this page in Safari" with **Copy the link**.

## Results

| Date | Device and browser (version) | Steps | Result | Tester |
|---|---|---|---|---|
| | | | | |
