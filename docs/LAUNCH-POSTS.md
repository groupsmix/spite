# Launch posts — ready-to-paste copy

**Rules of engagement**
- Post from *your own* accounts — not from a Devin-labeled account. Reddit mods ban AI-adjacent accounts on sight.
- Post order (same day, a few hours apart): r/SideProject → IndieHackers → r/InternetIsBeautiful → Twitter/X. Product Hunt the following Tuesday.
- Reply to every comment in the first 90 minutes. That window determines the post's trajectory.
- Refund anyone who asks. No arguments. It keeps your ratings clean and `revalidateStoredLicense()` auto-revokes Pro on next visit.
- Add `?utm_source=<channel>` to every link so Gumroad can attribute revenue.

Assume your live URL is `https://spite.lol`. If you bought a different domain, find-and-replace below.

---

## 1. r/SideProject

**Title**

```
I built SPITE — a petty grudge tracker that turns grievances into receipt cards
```

**Body**

```
Therapy says "let it go." You will not.

SPITE is a petty grudge tracker. File a grievance, pick a severity
("petty" → "nuclear"), and the app counts days since. You can
screenshot any grudge as a "receipt card" and post it.

Everything is local — no account, no email, no server, no analytics.
Your grudges live in localStorage. I can't read them; there is no
backend.

Free forever, up to 5 grudges. $9 once unlocks unlimited + watermark
removal + JSON export + a lifetime license. No subscription.

Vanilla JS, zero runtime dependencies, ~37 KB of JavaScript, installs
as a PWA. Built in a week.

Live: https://spite.lol/?utm_source=reddit_sideproject
Source: https://github.com/groupsmix/spite

Brutal feedback encouraged. What petty feature should ship next?
```

---

## 2. r/InternetIsBeautiful

**Title**

```
SPITE — a grudge tracker that counts days since they wronged you
```

**Body**

```
Local-only, no account, no analytics. Screenshot a grudge as a
"receipt card" and post it. Free up to 5 grudges; $9 once unlocks
unlimited + watermark removal + export.

https://spite.lol/?utm_source=reddit_iib
```

*(r/IIB is ruthless about self-promotion. Keep the body short, include a non-commercial framing, and be ready for "this is just a todo list" comments — the comeback is "yes, with feelings".)*

---

## 3. IndieHackers "Showing IH"

**Title**

```
Showing IH: SPITE — I turned "days since an incident" into a product
```

**Body**

```
tl;dr: SPITE is a petty grudge tracker. $9 once, lifetime. Launched
today. https://spite.lol/?utm_source=indiehackers

Why I built it: half my group chat has a running bit about "days
since [coworker] did [the thing]." It's funnier than it should be.
So I built the app for it.

Stack:
- Vanilla JS, no framework, no build step. What I commit is what
  ships.
- localStorage for data. No server, no account, no analytics, no
  tracking. I genuinely cannot see your grudges.
- PWA + installable. Works offline.
- Gumroad for payments (license keys). Static hosting on
  Cloudflare Pages. Net margin ~85% after fees.
- Receipt-card export is just html2canvas rendering the grudge
  tile to a PNG the user downloads.

Pricing:
- Free forever up to 5 grudges.
- $9 once → unlimited + no watermark + JSON export.
- No subscription. I will refund you in a heartbeat.

What I'm nervous about:
- Defamation surface. The whole product incentivizes posting
  receipts naming real people. I anonymized all landing-page
  examples, added an AUP to terms.html, and the receipt-card
  flow shows a nudge when you put a real-looking name in the
  title. Is that enough? Not sure.
- Distribution is the actual bottleneck. The product has ~$0
  marginal cost per user, so I can afford to give it away to
  100 people. What's the best "seed 100 users" play?

Roast it.
```

---

## 4. Product Hunt (schedule for the following Tuesday at 12:01 AM PT)

**Tagline (60 chars max)**

```
Days since they wronged you. A petty grudge tracker.
```

**Gallery** — 3 images minimum. Use the hero landing screenshot, the grudge grid, and a receipt-card export.

**Description**

```
SPITE is a grudge tracker that counts days since you were wronged.

It's a joke product that also works. File a grievance, rate it from
"petty" to "nuclear", and watch the streak grow. Screenshot any
grudge as a receipt card and post it.

Everything runs in your browser. Local storage only. No account,
no email, no analytics. I can't see your data because there is no
backend.

Free forever up to 5 grudges. $9 unlocks unlimited + watermark
removal + export. One-time. No subscription.

Installs as a PWA. Works offline. Open source.
```

**First comment (from the maker — pin this)**

```
Hi PH! Maker here.

Origin story: my group chat has a running bit about "days since
[X] did [Y]". I built the app for the joke. Then I realized the
joke was a product.

Honest caveats:
- 4 of the features on the pricing card are roadmap ("coming with
  your license when they ship") — themes, cloud sync, PDF export.
  They're clearly labeled as roadmap, not available today.
- This is my first paid product. Refund policy is "yes".

Questions I'll answer in the comments:
- Why Gumroad and not Stripe?
- How do you stop people from pasting their license on 1,000 phones?
- Why no AI?
- Isn't this just a todo list?

AMA.
```

---

## 5. Twitter/X thread

**Tweet 1**

```
I built SPITE.

It's a petty grudge tracker. You file grievances. It
counts days since. You can export each one as a receipt
card and post it.

Therapy says let it go. You will not.

https://spite.lol/?utm_source=twitter
```

*(attach receipt-card PNG #1)*

**Tweet 2**

```
Everything runs in your browser.

No account. No email. No analytics. Your grudges live
in localStorage. There is no server, which means there
is no "me reading your data".

I couldn't spy on you if I wanted to.
```

**Tweet 3**

```
Pricing:

• Free forever, up to 5 grudges.
• $9 once → unlimited + no watermark + export.
• No subscription. Ever.

Refund policy is "yes".
```

**Tweet 4**

```
Stack, because people ask:

• Vanilla JS, ~37 KB, no framework, no build step
• PWA, installs to home screen, works offline
• Gumroad for payments (license keys)
• Cloudflare Pages for hosting
• Margin ≈ 85% after fees

One person. One week. No AI.
```

**Tweet 5**

```
Questions I know you're going to ask:

"Is this just a todo list?"

Yes. With feelings.

https://spite.lol/?utm_source=twitter
```

*(attach receipt-card PNG #2)*

---

## 6. TikTok / Reels script (15 sec)

- **0:00** — phone screen, opening the SPITE web app. Caption: *"day 47 since a coworker stole my yogurt"*.
- **0:02** — tap a grudge. Receipt card appears.
- **0:04** — tap export. PNG saves to camera roll.
- **0:07** — cut to the PNG itself, fullscreen.
- **0:10** — text overlay: *"therapy says let it go. i will not."*
- **0:12** — text overlay: *"spite.lol — $9 once, no subscription"*.
- **0:15** — end.

**Audio**: any moody, deadpan pop audio currently trending. Do NOT use anything with copyright flags on Meta.

---

## Fallback plan if launch posts die on arrival

If none of the above posts hit 100 upvotes / 50 points on launch day, *stop posting*. Re-posting variations reads as spam.

Pivot to seeded distribution:

1. Post a 2-minute screen-recording demo to your own Twitter/Bluesky/LinkedIn. Tag 2–3 people whose audience overlaps (indie devs, product people, humor accounts).
2. Email 10 friends who would find this funny and ask them to post a receipt card from *their* account.
3. Submit to `BetaList`, `TinyLaunch`, `ProductHunt Ship`, and 2–3 "cool tools" newsletters (Refind, Morning Brew "Sidekick" etc.).
4. Wait 2 weeks. Re-launch on PH if v1 didn't hit 50 upvotes.

Revenue reality check: week one, $0–$300 is the realistic range. Everything above that is a launch-post going viral, which is a ~5% event.
