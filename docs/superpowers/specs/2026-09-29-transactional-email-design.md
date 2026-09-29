# Transactional email (Maizzle templates + Cloudflare Email Service) — design

- **Date:** 2026-09-29
- **Status:** Approved in conversation; pending written-spec review
- **Base:** `main` @ `a41b7eb`
- **Plan:** `docs/superpowers/plans/2026-09-29-transactional-email.md`

## 1. Goal

Give the Taman admin template a transactional email system that:

1. Lets you design emails in **Maizzle 6** (Vue SFC + Tailwind 4), compiled at
   build time. The Worker never runs Maizzle, Vue, Tailwind or a CSS inliner.
2. Renders three emails with dynamic, **escaped** values: organization
   invitation, email verification, password reset.
3. Ships **en-US and id-ID** copy from day one, chosen per recipient request.
4. Sends through **Cloudflare Email Service** (`send_email` binding) and, when a
   queue is bound, through **Cloudflare Queues** with retries and a dead-letter
   queue. The first consumer deploys on Cloudflare.
5. Stays **platform-agnostic**: taman is a template other people will build on.
   Template rendering depends on no platform. Delivery sits behind two small
   interfaces (`EmailSender`, `EmailDispatcher`), so another provider or
   runtime means adding one file.

Success means:

- Better Auth sends all three emails (invitation, sign-up verification,
  password reset). Under `nitro dev` they go to the console; on Workers they
  go through Cloudflare.
- A missing template value or a template/copy mismatch fails a unit test,
  not a customer's inbox.
- No `{{slot}}` placeholder, raw user HTML or non-http(s) link reaches an email.
- The production Worker bundle contains no `@maizzle/*` code.

## 2. Decisions

| Topic | Decision | Reason |
|---|---|---|
| Template engine | Maizzle 6 (`@maizzle/framework` ^6.1.7, CLI `maizzle` ^1.2.4) at **build time only** | Static output means no rendering CPU in the Worker. Maizzle 6 is Vue-based, which fits the repo. |
| Where templates reach the runtime | A codegen step turns Maizzle's `.html`/`.txt` output into **committed TS modules** (`src/generated/*.ts`) | Workers have no filesystem. TS modules bundle anywhere, need no Nitro `serverAssets`, and carry their slot list. |
| Package | New private `@taman/emails` at `packages/server/emails` (the directory already exists, empty), exporting `src/index.ts` directly like `@taman/rbac` | Matches existing private packages. It can be published later. |
| Two placeholder layers | HTML templates contain **slots** `{{camelCase}}`. Locale copy contains **params** `{camelCase}` | Templates are layout-only, so adding a locale never touches a template. The two syntaxes never overlap. |
| Copy location | `packages/server/emails/src/locales/{en-US,id-ID}.json` | JSON is how `packages/locales` stores copy. Root `check:cspell` lints only `*.ts`, so Indonesian copy doesn't trip it. |
| Escaping | Everything inserted into HTML (copy literals, params, URLs) goes through `escapeHtml`. Text gets raw values. The subject gets raw values with line breaks flattened | User-controlled values (org name, inviter name) must not inject markup or headers. |
| URLs | Only absolute `http:`/`https:` URLs may fill URL slots, otherwise `EmailJobError` | Blocks `javascript:` and relative links. |
| Locale choice | `Accept-Language` of the request that triggered the email (`matchEmailLocale`), fallback `en-US` | `user` has no locale column. The inviter's browser language is the best signal for invitations; for verification and reset it's the user's own. |
| Dates | `Intl.DateTimeFormat(locale, …, timeZone: 'UTC', timeZoneName: 'short')` | The recipient's timezone is unknown, so UTC is stated explicitly. |
| Sender selection | Binding `EMAIL` present → Cloudflare sender, otherwise console sender | Same pattern as `TODO_PUBLISHER` / `getTodoPublisher`. Binding presence is the configuration. |
| Dispatcher selection | Binding `EMAIL_QUEUE` present → queue dispatcher, otherwise inline dispatcher | A template consumer who deletes the queue config still gets working email. |
| Inline delivery errors | Logged and swallowed | The auth action (invite created, user signed up) already succeeded. Failing the request would be misleading and invites a duplicate retry. |
| Queue enqueue errors | Propagate to Better Auth, so the request fails | Enqueue failure is rare and means the email is definitely lost. |
| Queue consumer policy | Success → `ack()`. `EmailJobError` → log + `ack()` (retrying can't fix it). Anything else → log + `retry()` | After `max_retries: 5` Cloudflare moves the message to `taman-email-dlq`. |
| Queue payload | `EmailJob` = template name + locale + params, **not** rendered HTML | Messages stay small, and template fixes apply to messages already queued. |
| Env access in Better Auth callbacks | `server/middleware/2.email.ts` calls `useEmail(cloudflareEnv(event))` on every request (memoized). The queue plugin passes the hook's `env` | Better Auth callbacks have no H3 event. Middleware runs before every route. |
| `cloudflareEnv` | Moved from `server/realtime/publisher.ts` to `server/lib/cloudflare-env.ts` and made generic | Email and realtime both need it, and email shouldn't import from realtime. |
| Logging | Delivery failures log the template name and a **masked** recipient (`j***@example.com`) | Useful for operations without putting full addresses in Worker logs. |
| Dev sender | Console (consola) prints to, subject and the plaintext body | Zero setup, and the links are clickable in the terminal. `maizzle serve` gives the visual preview. |

## 3. Architecture

```
Better Auth callback (sendInvitationEmail / sendVerificationEmail / sendResetPassword)
  → auth.emails.ts builds an EmailJob { template, to, locale, params }
  → useEmail().dispatcher.dispatch(job)
       ├─ inline (no EMAIL_QUEUE): deliver(job) now; errors logged
       └─ queue  (EMAIL_QUEUE):    EMAIL_QUEUE.send(job)
                                     → cloudflare:queue hook (plugins/email-queue.ts)
                                     → consumeEmailBatch → deliver(job) → ack / retry
deliver(job) = renderEmail(job)           ← @taman/emails (pure, no platform)
             → sender.send({ to, from, subject, html, text })
                  ├─ Cloudflare (EMAIL binding)
                  └─ console (nitro dev / Node)
```

### 3.1 `@taman/emails` (platform-free)

```
packages/server/emails/
  maizzle.config.ts        content: emails/**/*.vue → .maizzle/ (gitignored), plaintext on
  emails/*.vue             one Maizzle template per email, layout + {{slots}} only
  scripts/generate.ts      .maizzle/*.html + *.txt → src/generated/*.ts
  scripts/generate.lib.ts  pure helpers (tested): export names, module source, placeholder checks
  src/
    types.ts               EMAIL_LOCALES, EmailLocale, DEFAULT_EMAIL_LOCALE, CompiledTemplate, RenderedEmail
    errors.ts              EmailJobError
    slots.ts               SLOT_TOKEN, extractSlots, fillSlots
    render.ts              escapeHtml, formatCopy, assertHttpUrl, renderCompiled
    locale.ts              matchEmailLocale(acceptLanguage)
    format.ts              formatEmailDate(iso, locale)
    copy.ts                emailCopy: Record<EmailLocale, EmailCopy> (JSON imports)
    locales/en-US.json     { invitation, verifyEmail, resetPassword }
    locales/id-ID.json
    templates/invitation.ts | verify-email.ts | reset-password.ts   typed params → renderCompiled
    registry.ts            EmailTemplateParams, EmailTemplateName, EmailJob, renderEmail(job)
    generated/*.ts         committed codegen output (eslint + cspell disabled)
    index.ts               public API
```

Public API (`src/index.ts`): `renderEmail`, `matchEmailLocale`, `EmailJobError`,
`EMAIL_LOCALES`, `DEFAULT_EMAIL_LOCALE`, and the types `EmailJob`, `EmailLocale`,
`EmailTemplateName`, `EmailTemplateParams`, `RenderedEmail`, `InvitationParams`,
`VerifyEmailParams`, `ResetPasswordParams`.

### 3.2 Template contract

| Template (file / job name) | Copy key | Slots | URL slots | Params |
|---|---|---|---|---|
| `invitation` | `invitation` | `preheader heading intro actionLabel linkHint actionUrl expiry ignore` | `actionUrl` | `inviterName inviterEmail organizationName role inviteUrl expiresAt(ISO)` |
| `verify-email` | `verifyEmail` | `preheader heading intro actionLabel linkHint actionUrl ignore` | `actionUrl` | `name verifyUrl` |
| `reset-password` | `resetPassword` | `preheader heading intro actionLabel linkHint actionUrl ignore` | `actionUrl` | `name resetUrl` |

Rules, each enforced by a test:

- For every template and every locale: `copy keys − {subject} ∪ URL slots` **equals** the
  compiled slot list.
- Each copy entry has a `subject`. It becomes the email subject and is never a slot.
- Copy is plain text. It may contain `{param}` tokens, never HTML.
- Every button repeats its URL as visible text (`linkHint` + `{{actionUrl}}`), so
  the plaintext version and clients that break buttons still get the link.
- Codegen rejects URL-encoded placeholders (`%7B%7B`) and malformed ones
  (`{{ action-url }}`).

### 3.3 Render rules (`renderCompiled`)

1. Split `subject` from the other copy entries.
2. URL slots: `assertHttpUrl` (absolute, http/https), then `escapeHtml` for HTML, raw for text.
3. Copy slots: `formatCopy(message, vars, escapeHtml)` for HTML, `formatCopy(message, vars)` for text.
   Substitution is **single-pass**: a value containing `{x}`, `{{x}}` or `$&` is inserted literally.
4. Subject: `formatCopy(subject, vars)`, with any run of CR/LF (and surrounding space) collapsed to one space, then trimmed.
5. `fillSlots` throws `EmailJobError` for a slot with no value. `formatCopy` throws for a
   missing or non-string param.

`renderEmail(job)` also throws `EmailJobError` for a non-object job or params and for
an unknown template name (checked with `Object.hasOwn`, so `"toString"` is unknown).
It falls back to `en-US` for an unknown locale.

### 3.4 Delivery (`apps/api/server/email/`)

| File | Exports |
|---|---|
| `email.types.ts` | `EmailAddress`, `OutgoingEmail`, `EmailSender`, `EmailDispatcher`, `DeliverEmail`, `SendEmailBinding`, `EmailQueueBinding`, `EmailEnv` |
| `email.log.ts` | `maskEmail`, `logDeliveryError` |
| `email.sender.console.ts` | `createConsoleEmailSender(log?)` |
| `email.sender.cloudflare.ts` | `createCloudflareEmailSender(binding)` |
| `email.deliver.ts` | `createEmailDeliverer({ sender, from })` |
| `email.dispatcher.inline.ts` | `createInlineEmailDispatcher(deliver, onError?)` |
| `email.dispatcher.queue.ts` | `createQueueEmailDispatcher(queue)` |
| `email.queue-consumer.ts` | `EMAIL_QUEUE_NAME = 'taman-email'`, `EmailQueueBatch`, `consumeEmailBatch(batch, deliver, onError?)` |
| `index.ts` | `createEmailServices(env, config)`, `useEmail(env?)` |

`SendEmailBinding` and `EmailQueueBinding` are structural subsets of the Cloudflare
types (the same approach as `DurableObjectNamespaceLike`), so the code compiles and
tests without Workers globals.

The deliverer throws a plain `Error` when `from.email` is empty; the queue consumer
treats that as transient, so it retries. It throws `EmailJobError` when `job.to`
isn't an email address.

### 3.5 Better Auth wiring (`server/auth/`)

`auth.emails.ts` holds pure builders, tested without Better Auth:

- `buildAppUrl(base, path)` joins onto the base **path** (`https://x.test/admin` + `auth/…`
  → `https://x.test/admin/auth/…`) and throws when `NITRO_APP_URL` is empty.
- `emailLocale(request?)` → `matchEmailLocale(request?.headers.get('accept-language'))`.
- `invitationEmailJob(data, { appUrl, locale })` → link `${appUrl}/auth/accept-invitation/${encodeURIComponent(id)}`,
  role `"admin,member"` shown as `"admin, member"`, `expiresAt` as ISO.
- `verifyEmailJob(data, locale)` / `resetPasswordEmailJob(data, locale)` pass Better Auth's `url` through.

`better-auth.instance.ts` gains `organizationPlugin({ sendInvitationEmail })`,
`emailVerification.sendVerificationEmail` and `emailAndPassword.sendResetPassword`.
Each one awaits `useEmail().dispatcher.dispatch(job)`. `sendOnSignUp` stays unset, so it
follows `requireEmailVerification: true`.

### 3.6 Configuration

| Name | Where | Purpose |
|---|---|---|
| `NITRO_EMAIL_FROM` → `emailFrom` | runtimeConfig (already in `.env`) | Sender address. It must be on a domain onboarded to Cloudflare Email Service |
| `NITRO_EMAIL_FROM_NAME` → `emailFromName` | runtimeConfig, new, optional | Display name |
| `NITRO_APP_URL` → `appUrl` | runtimeConfig, new | Frontend origin (with optional base path) for invitation links |
| `send_email: [{ name: 'EMAIL' }]` | `nitro.config.ts` wrangler | Cloudflare Email Service binding |
| `queues.producers: [{ binding: 'EMAIL_QUEUE', queue: 'taman-email' }]` | same | Producer |
| `queues.consumers: [{ queue: 'taman-email', max_retries: 5, dead_letter_queue: 'taman-email-dlq' }]` | same | Consumer: this same Worker, via the `cloudflare:queue` hook |

`NITRO_SMTP_HOST` / `NITRO_SMTP_PORT` in the local `.env` become unused.

## 4. Out of scope / follow-ups

- Frontend pages `/auth/accept-invitation/:id` and reset-password. The invitation link
  and Better Auth's reset redirect point to them, but they don't exist yet (the
  frontend only has `/auth/login`).
- Adapters for other providers (Resend, SES, SMTP): implement `EmailSender` when a
  non-Cloudflare consumer needs one.
- A per-user locale column. Today the locale comes from `Accept-Language`.
- A CI check that `src/generated/` matches `emails/*.vue` (run `build:templates` + `git diff --exit-code`).
- Bounce and complaint handling, suppression lists, and an email audit table.
- Mailpit or another local inbox.

## 5. Risks

- **Maizzle 6 is new to this repo.** If `<Raw content="{{x}}" />` doesn't emit the literal
  placeholder, switch to the documented `<Raw>{{ x }}</Raw>` form. The generated-module
  test (Task 2) pins the output either way.
- **Cloudflare Email Service limits** (50 recipients, 5 MiB, unpublished daily and rate
  limits) are fine for one recipient per email, but check the account quota before launch.
- **Deploying with the queue config needs the queues to exist**:
  `wrangler queues create taman-email` and `wrangler queues create taman-email-dlq`.
  A consumer who doesn't want queues deletes the `queues` block and gets inline delivery.
