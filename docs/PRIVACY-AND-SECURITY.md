# Privacy and security details

This is an inventory of everything the game stores, sends, and receives, for the owner and for whoever does the legal review. It describes what the code does; it is not legal advice and does not claim legal compliance.

## Children's side of the game

| Question | Answer |
| --- | --- |
| Accounts or profiles | None |
| Names, ages, health or behavioral information | Never asked for or stored |
| Analytics, ads, tracking pixels, third-party scripts | None. The Content Security Policy in `netlify.toml` only allows the site's own files |
| Cookies | None |
| Fonts | Bundled with the site (no Google Fonts or other font services) |
| Network requests during play | None after the page loads |
| Marketing | None. The newsletter checkbox and the Burrow link appear only in the grown-up area |
| Scores, levels, streaks | None. The only reward is one coloring page per patient |

## Stored on the device (localStorage)

One key, `curious-creature-clinic.v1`, holding:

```json
{ "pages": ["pip", "mochi"], "muted": false, "calm": false }
```

Anything else found under that key is discarded when read. Saves from the first version (`stickers`) are turned into pages. Hints shown, chart discoveries, bandages and how a child played are never saved. "Start a fresh coloring book" in the grown-up area clears the pages.

## Grown-up area

The grown-up check asks the adult to tap three numbers written as words. It keeps little fingers out; it is **not** verification of a parent and not proof of COPPA compliance.

### Download and print

The PDF is built in the browser from the list of earned pages. Nothing is sent anywhere, and no email address is needed.

### Email preview (not connected)

- The form checks the address format on the device.
- The newsletter checkbox starts unchecked.
- On submit, `disconnectedDelivery` returns "not connected" without a network request. The address is held only in the form while it is on screen; it is never written to storage, cookies, logs, or anywhere else.
- The browser tests check that submitting the form makes no network request and leaves nothing in storage, and `npm run check` fails if the built site contains a call to the email endpoint.

The plan and checklist for connecting email later, including what the future server stores (salted hashes for rate limiting, in memory, for about an hour) and sends to providers, are in [EMAIL-INTEGRATION.md](EMAIL-INTEGRATION.md).

## Third parties

| Service | Role | Receives | When |
| --- | --- | --- | --- |
| Netlify | Hosting | Standard request data, including IP address, in its logs | Every visit |

No email or newsletter service is contacted by this version.

## Security measures

- No secrets exist in this version. `npm run check` still scans the built site for key patterns, server-only setting names, provider addresses, and the email endpoint path.
- Content Security Policy, `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, and a Permissions Policy that turns off camera, microphone and location.
- Office customization only uses entries from a list in the code, and logo paths are restricted to the site's own files, so links can't inject text or images.
- Saved data is validated on every read; unknown values are dropped.
- Children never see technical error messages. Grown-ups see plain-language messages with a print option if the PDF can't be made.

## Items for legal review

See section 9 of the [README](../README.md#9-what-still-needs-manual-setup).
