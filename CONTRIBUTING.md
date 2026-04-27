# Contributing to SPITE

Bug reports and small, focused PRs are welcome. Big features should open a discussion first — SPITE has a strong opinion about what it is and isn't.

## Setup

```bash
npm install
npm run lint
npm run serve
```

## Conventions

- **No build step.** The source you commit is the source that ships. Keep it that way.
- **No frameworks.** Vanilla HTML/CSS/JS only.
- **No analytics, ever.** This is part of the product's pitch.
- **No new third-party requests** beyond `api.gumroad.com` for license verification.

## What to NOT add

The pitch is *private* spite, sold once, with no infrastructure. Things that would be rejected:

- Social feeds, public profiles, friends, comments
- Any subscription tier (`/mo`)
- Any client-side analytics or tracking pixels
- Any backend service that holds user data

What's good fodder for a PR:

- Accessibility improvements
- Performance / Lighthouse score wins
- New themes (Pro)
- New receipt-card layouts (Pro)
- Translations
- Bug fixes
