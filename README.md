# utransfer UI

A user-friendly, browser-only command builder for [Unblu's `utransfer` CLI](https://docs.unblu.com/latest/knowledge-base/guides/tooling/utransfer.html).

Build any utransfer command — export, import, server-to-server transfer or file transformation — through a guided wizard with rich Unblu domain context per field. The app generates the exact `java -jar utransfer.jar ...` command for you to copy into your terminal. It runs entirely in your browser: nothing is sent over the network, no backend exists.

**Live demo:** https://thomasgourouza-collab.github.io/utransfer-ui/

---

## What it does

- Step-by-step **wizard** that covers every utransfer operating mode, flag and entity type, with contextual help drawn from a single domain catalog.
- **Power-user view** with all sections expanded on one page, sharing the same state as the wizard.
- **Server profiles** stored locally and encrypted with a master password (AES-GCM with a PBKDF2-derived key, 200 000 SHA-256 iterations).
- **Transfer presets, entity-selection presets and destination presets** so common configurations are one click away.
- **Command history** of the last 100 generated commands, with passwords automatically redacted.
- Outputs the command three ways: one-liner, multi-line with backslash continuations, runnable shell script.
- Light, dark and system theming.

---

## Operating modes covered

| Mode | What it does |
|------|--------------|
| Export | Read entities from a live Unblu server, write to JSON file / folder / ZIP |
| Import | Read an exported file, apply to a target Unblu server |
| Server-to-Server | Stream entities directly from one Unblu server to another |
| Transform | Re-export a file with different ID-conversion, suffix or format options |

All four are fully driven from the same wizard. Every documented utransfer flag is reachable from the UI.

---

## Running locally

Prerequisites: **Node 22+** (developed against Node 24) and **npm 10+**.

```bash
npm ci
npm start
```

The dev server runs at http://localhost:4200/. The application reloads on save.

### Configure the utransfer jar path

On first run, open **Settings** and set the path to your local `utransfer.jar`. The default baked into [src/app/core/data/utransfer-catalog.ts](src/app/core/data/utransfer-catalog.ts) is the original author's local Mac path — change it to whatever makes sense for your machine, or override it in Settings (it's persisted to `localStorage`).

---

## Architecture

```
src/app/
├── core/
│   ├── data/utransfer-catalog.ts       Single source of Unblu-domain knowledge
│   │                                   (entity types, ID strategies, auth modes,
│   │                                    output formats, global caveats)
│   ├── models/                         TypeScript types for the wizard state
│   ├── services/
│   │   ├── command-builder.service     Pure config → command string
│   │   ├── crypto.service              Web Crypto wrapper (PBKDF2 + AES-GCM)
│   │   ├── master-password.service     Unlock / idle-lock lifecycle
│   │   ├── storage.service             localStorage abstraction
│   │   ├── server-profiles.service     Encrypted server profile CRUD
│   │   ├── transfer-presets.service    Full wizard configs (no passwords)
│   │   ├── entity-presets.service      Named entity selections
│   │   ├── destination-presets.service Named output paths
│   │   ├── command-history.service     Last 100 generated commands
│   │   ├── jar-path.service            Path to utransfer.jar
│   │   └── theme.service               Light / dark / system
│   └── guards/unlocked.guard.ts        Gate routes that need decrypted profiles
├── features/
│   ├── dashboard          Landing page with operation cards
│   ├── wizard             7-step stepper wizard
│   ├── power-user         Single-page view sharing the wizard state
│   ├── profiles           Encrypted server profiles CRUD
│   ├── presets            Tabs for the three preset types
│   ├── history            Auto-logged command history
│   └── settings           Jar path, theme, master password lifecycle
└── shared/components      command-preview, entity-picker, endpoint-form,
                           server-profile-picker, theme-toggle, unlock-dialog,
                           info-popover
```

The architecture is intentionally backend-free. The whole app is built around a single signal of type `TransferConfig` that flows through the wizard's steps; a pure `CommandBuilderService` turns it into a `GeneratedCommand`. Everything else is presentation or persistence.

---

## Credentials and storage

There is no database, no server, no synced state — only `localStorage`.

| Key | Contents |
|-----|----------|
| `utransfer-ui.master-password` | Salt + verifier ciphertext (no password stored) |
| `utransfer-ui.server-profiles` | Profiles with passwords encrypted as AES-GCM ciphertext |
| `utransfer-ui.transfer-presets` | Full wizard configs with password fields stripped |
| `utransfer-ui.entity-presets` | Named entity selections |
| `utransfer-ui.destination-presets` | Named output paths |
| `utransfer-ui.history` | Generated commands with passwords redacted to `****` |
| `utransfer-ui.jar-path`, `utransfer-ui.theme` | Plain JSON preferences |

**How decryption works:** When you set a master password, a random salt is generated and PBKDF2-stretches the password into a 256-bit AES key. That key encrypts a verifier blob (the literal string `UTRANSFER-UI-OK`). At unlock time, the candidate key tries to decrypt the verifier — AES-GCM's integrity tag tells us whether the password was right. The password itself is never stored anywhere; the derived key lives in memory only and is cleared after 15 minutes of inactivity or on manual lock.

**Security caveats:**
- A 12-character random master password is effectively unbreakable at 200 000 PBKDF2 iterations; an 8-character dictionary password is not.
- XSS on the same origin can read the in-memory key after unlock. Don't paste untrusted scripts in DevTools while unlocked.
- There is no key escrow. Forgetting the master password means clicking **Reset** in Settings, which wipes encrypted blobs (profile names remain).

---

## Tests

```bash
npx vitest run
```

Logic-heavy services are covered:

- `command-builder.service.spec.ts` — 24 tests, table-driven from the documented utransfer example invocations (auth modes, entity filtering, `-f` / `-z`, `--idConversion`, suffixes, server-to-server, validation errors, quoting).
- `crypto.service.spec.ts` — 4 tests covering round-trip encryption, wrong-password rejection, unique IVs, Unicode plaintext.

Component-level tests are intentionally out of scope: the UI is a thin shell over the wizard state and a pure command-builder.

---

## Building for production

```bash
npx ng build --configuration production --base-href "/utransfer-ui/"
```

Outputs to `dist/utransfer-ui/browser/`. The base href above matches GitHub Pages deployment. Adjust it (or drop the flag) for any other static host.

---

## Deploying

### GitHub Pages (configured)

A workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and publishes the app on every push to `main`.

One-time GitHub setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The workflow:
1. Builds with `--base-href "/$REPO_NAME/"` derived from `$GITHUB_REPOSITORY`.
2. Copies `index.html` to `404.html` so SPA deep-links survive a refresh (GitHub Pages returns the same SPA on a 404; Angular routes from `location.pathname`).
3. Adds `.nojekyll` to skip Jekyll processing.
4. Uploads via `actions/upload-pages-artifact@v3` and deploys via `actions/deploy-pages@v4`.

After the workflow runs, the app is live at https://thomasgourouza-collab.github.io/utransfer-ui/.

### Any other static host

`ng build --configuration production` produces standard static files. Any HTTP server works (nginx, Caddy, Cloud Storage, S3 + CloudFront, GKE behind an HTTPS Ingress, ...). Two constraints:

- **HTTPS is required.** `crypto.subtle` (used for master-password encryption) only works in a secure context. Plain HTTP silently breaks credential storage.
- **SPA routing fallback.** Configure the host to serve `index.html` for any unmatched path under the base href, or replicate the `404.html = index.html` trick.

---

## Tech stack

- **Angular 21** with standalone components, signals, zoneless change detection and lazy-loaded routes
- **Angular Material** (Material 3) with `mat.theme()` and a custom azure palette
- **Web Crypto API** (`crypto.subtle`) for all encryption
- **Vitest** for unit tests
- **TypeScript** in strict mode

---

## License

Private project. Not affiliated with Unblu beyond using its public CLI tool.
