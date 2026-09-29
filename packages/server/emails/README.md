<!-- cspell:ignore maizzle preheader kedaluwarsa tautan -->
# @taman/emails

Transactional email templates for Taman, designed in [Maizzle](https://maizzle.com) 6
and compiled at build time. Runtime rendering supports `en-US` and `id-ID` and has
no platform dependencies. Delivery lives in `apps/api/server/email`.

## How it fits together

| Layer | Location | Syntax |
|---|---|---|
| Maizzle layout | `emails/*.vue` | `{{slot}}` placeholders only |
| Compiled layout | `src/generated/*.ts` | Produced by `build:templates` |
| Localized copy | `src/locales/*.json` | `{param}` tokens, plain text |
| Typed renderers | `src/templates/*.ts` | `renderEmail(job)` |

Each copy key except `subject` fills the matching template slot. URL slots accept
only absolute HTTP or HTTPS links. Values inserted into HTML are escaped.

## Commands

```sh
pnpm --filter @taman/emails dev:templates
pnpm --filter @taman/emails build:templates
```

Edit `src/locales/<locale>.json` to change copy. Keep the same copy keys in each
locale. Edit a layout in `emails/<name>.vue`, rebuild templates, then commit the
generated module in `src/generated/`.

To add a template, add its Maizzle layout, localized copy entry, typed renderer,
and registry entry. To add a locale, update `EMAIL_LOCALES`, add its JSON copy,
and register it in `src/copy.ts`.

## Backend delivery

The backend selects a sender and dispatcher from the Worker bindings:

| Bindings | Behavior |
|---|---|
| None (`nitro dev`) | Inline delivery to the console |
| `EMAIL` | Inline Cloudflare Email Service delivery |
| `EMAIL` and `EMAIL_QUEUE` | Queue through `taman-email`, with 5 retries and `taman-email-dlq` |

Onboard the sender domain with Cloudflare Email Service, create the queues with
`npx wrangler queues create taman-email` and
`npx wrangler queues create taman-email-dlq`, then set `NITRO_EMAIL_FROM`,
optional `NITRO_EMAIL_FROM_NAME`, and `NITRO_APP_URL`. Remove the `queues`
configuration to send inline.

For another provider, implement `EmailSender` beside
`email.sender.cloudflare.ts` and select it in `server/email/index.ts`.
