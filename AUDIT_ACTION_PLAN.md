# Audit Action Plan (2026-07-05)

This document consolidates findings from a full audit of the MTG Artist Connection
project: features/completeness, security/PII, and UI/design — across **both**
repos, since this repo (`mtgartistconnection.server`, actually the React
frontend) talks to a separate backend repo, `mtgartistconnection.webservice`
(GraphQL/Express/MongoDB API, deployed on Railway).

Each item below is a standalone task with a ready-to-paste **Prompt** that can
be handed to Claude Code (in the appropriate repo) independently of this
conversation — no other context required. Work through them roughly in
priority order. Items tagged `[webservice]` must be run from the
`mtgartistconnection.webservice` repo; items tagged `[server]` from this repo.

## Table of Contents

- [Critical](#critical)
- [High](#high)
- [Medium](#medium)
- [Low](#low)
- [New Feature Ideas](#new-feature-ideas)

---

## Critical

<!-- ### 1. [webservice] Unauthenticated `users` query leaks all user PII

**File:** `src/handlers/handlers.ts:152-157`

**Issue:** The `users` GraphQL query has no auth check — every other sensitive
resolver in the file calls `requireAuth`/`requireAdmin`, but this one doesn't.
Anyone, unauthenticated, can query `{ users { name email role followedArtists
monitoredStates } }` and get every registered user's name, email, role, and
behavioral data. GraphQL introspection is also not disabled in production, so
this is discoverable without reading source.

**Prompt:**
> In this Express/GraphQL backend, open `src/handlers/handlers.ts` and find the
> `users` query (around line 152-157), which currently does `resolve() {
> return await User.find(); }` with no authorization check. Every other
> resolver in this file gates access with a `requireAuth(context...)` or
> `requireAdmin(context.isAuthenticated, context.userRole)` call — check how
> those are implemented (likely in `src/middleware/auth.ts`) and apply the same
> `requireAdmin` pattern to this resolver, since it returns other users' PII
> (email, followedArtists, monitoredStates) and should not be reachable by
> non-admins. Also check `src/app.ts` for how the GraphQL server is
> constructed and disable introspection queries in production (e.g. via
> `NoSchemaIntrospectionCustomRule` or the equivalent option for whatever
> GraphQL server library is in use), leaving introspection enabled only in
> non-production environments. Confirm the frontend (`mtgartistconnection.server`
> repo) doesn't call this `users` query anywhere before locking it down, so we
> don't break a legitimate use case — if it's unused, removing it entirely is
> also an acceptable fix.

---

## High

### 2. [webservice] User enumeration on login via distinct error messages

**File:** `src/handlers/handlers.ts:567-586`

**Issue:** Login throws `"No User registered with this email"` when the email
doesn't exist vs `"Incorrect Password"` when it does but the password is
wrong — letting an attacker enumerate valid registered emails.

**Prompt:**
> In `src/handlers/handlers.ts`, find the `login` resolver (around lines
> 567-586). It currently throws `"No User registered with this email"` when
> `User.findOne({email})` returns null, and a separate `"Incorrect Password"`
> error when `compareSync` fails. Change both failure paths to throw the same
> generic message, e.g. `"Invalid email or password"`, so a caller cannot
> distinguish "email doesn't exist" from "email exists, wrong password."
> Verify the frontend login form (`mtgartistconnection.server` repo,
> `src/components/auth/*`) doesn't have logic that branches on the specific
> error text before changing it — update it to handle the generic message if
> it does.

### 3. [webservice] No rate limiting on `login`/`signup`

**Issue:** No `express-rate-limit` or equivalent exists in the project, so
`login` and `signup` can be hit at unlimited speed — enabling credential
stuffing and email enumeration at scale.

**Prompt:**
> This Express + GraphQL backend (`mtgartistconnection.webservice`) has no
> rate limiting anywhere (confirmed no `express-rate-limit` or similar
> dependency). Add `express-rate-limit` as a dependency and apply a rate
> limiter middleware scoped to the GraphQL endpoint (or specifically to
> requests whose body contains `login`/`signup` operations, if the whole
> `/graphql` endpoint can't be blanket-limited without affecting other
> queries) — something like 10 attempts per 15 minutes per IP is a reasonable
> starting point. Check `src/app.ts` for where `helmet()` and CORS middleware
> are currently wired in and add the rate limiter alongside them. Make sure
> the limiter returns a generic error rather than leaking internal state.

### 4. [server] Internal links bypass React Router (full-page reloads, unencoded names)

**Files:** `src/components/home/Footer.tsx:102-105`,
`src/components/home/AffiliateDisclosure.tsx:111`,
`src/components/artist/ExternalLinkCard.tsx:23-24` (used by
`src/components/artist/Artist.tsx:534-539`),
`src/components/allcards/AllCards.tsx:1016` and `:1115`,
`src/components/calendar/SigningEvent.tsx:305`,
`src/components/calendar/EventDetail.tsx:283`

**Issue:** These components link to internal routes (e.g.
`/allcards/${artist}`, `/artist/${artist}`, `/privacypolicy`) using plain
`<Link href="...">` (or a raw `<a href>` in `AffiliateDisclosure.tsx`) instead
of React Router's `Link`. This causes a full-page reload on every click
(defeating the SPA) and breaks for artist names containing `/`, `?`, `&`, or
other URL-special characters since the name isn't URL-encoded. This is the
exact bug class already fixed in `src/components/home/ArtistGridItem.tsx`
(compare its git diff) and the correct pattern already used in
`src/components/dashboard/Dashboard.tsx`'s `DataRow` helper (~line 481), which
branches between `component={RouterLink}` for internal links and a plain `<a>`
for external ones.

**Prompt:**
> In this React SPA (Create React App + MUI + react-router-dom v6), several
> components link to internal app routes using a plain MUI `<Link href="...">`
> (or a raw `<a href>`) instead of React Router's client-side navigation,
> causing full-page reloads and, where an artist name is interpolated into the
> URL, broken links for names containing special characters since the name
> isn't URL-encoded. Fix the following, following the pattern already used
> correctly in `src/components/home/ArtistGridItem.tsx` (import `Link as
> RouterLink` from `react-router-dom`, render MUI's `Link` with
> `component={RouterLink}` and `to={`/allcards/${encodeURIComponent(artistName)}`}`
> instead of `href`) and in `src/components/dashboard/Dashboard.tsx`'s
> `DataRow` helper (~line 481), which already branches correctly between
> internal `RouterLink` navigation and external `<a>` tags:
> 1. `src/components/home/Footer.tsx:102-105` — Privacy Policy, Terms of
>    Service, Affiliate Disclosure, and Contact links.
> 2. `src/components/home/AffiliateDisclosure.tsx:111` — raw `<a href="/contact">`.
> 3. `src/components/artist/ExternalLinkCard.tsx:23-24` — always renders a
>    plain `<Link href={href}>`; used in `src/components/artist/Artist.tsx:534-539`
>    for the internal "View all {artist} cards" link. Either add an `isInternal`
>    prop to `ExternalLinkCard` that switches to `RouterLink`, or have
>    `Artist.tsx` render its own `RouterLink` for this specific case instead of
>    reusing `ExternalLinkCard`.
> 4. `src/components/allcards/AllCards.tsx:1016` ("View Artist Details" →
>    `/artist/${artist}`) and `:1115` ("Card Statistics" →
>    `/artistcardbreakdown/${artist}`) — both also missing
>    `encodeURIComponent` around the artist name.
> 5. `src/components/calendar/SigningEvent.tsx:305` and
>    `src/components/calendar/EventDetail.tsx:283` — artist grid links to
>    `/allcards/${artist.name}`, plain `href`, unencoded name.
>
> After fixing, manually click through each of these links in the running app
> and confirm the URL bar updates without a full page reload (check the
> browser network tab shows no full document request) and that an artist name
> containing a character like `&` or `/` (if one exists in the data) still
> resolves correctly. -->

<!-- ---

## Medium

### 5. [webservice] Hardcoded Mongo username/cluster host

**Files:** `src/utils/connection.ts:5`, `src/scripts/backfillArtistNames.ts:6`

**Issue:** The MongoDB Atlas username (`stokesdusty`) and cluster hostname are
hardcoded in source, with only the password pulled from an env var, narrowing
an attacker's job to just guessing/leaking the password.

**Prompt:**
> In `src/utils/connection.ts` (line 5) and `src/scripts/backfillArtistNames.ts`
> (line 6), the MongoDB connection is built as
> `` `mongodb+srv://stokesdusty:${process.env.MONGODB_PASSWORD}@cluster0.mo7516l.mongodb.net/?retryWrites=true&w=majority` ``
> — the username and cluster host are hardcoded, only the password comes from
> an env var. Replace this with a single `MONGODB_URI` environment variable
> containing the full connection string, read via `process.env.MONGODB_URI`,
> in both files. Update `.env.example` to show the new variable name (as a
> placeholder, not a real value), and update the deployment environment
> (Railway) to set `MONGODB_URI` instead of `MONGODB_PASSWORD` before removing
> the old variable. -->

<!-- ### 6. [webservice] Regex built from unescaped user input (ReDoS risk)

**Files:** `src/handlers/handlers.ts:206` (`cardKingdomPricesByNames`),
`src/handlers/handlers.ts:322` (`newsReviewsByArtist`, public/unauthenticated)

**Issue:** User-supplied strings are interpolated directly into `new
RegExp(...)` without escaping regex metacharacters, risking both
query-broadening abuse and ReDoS (catastrophic backtracking) on a public,
unauthenticated endpoint.

**Prompt:**
> In `src/handlers/handlers.ts`, two resolvers build a MongoDB regex filter
> directly from user input without escaping regex metacharacters:
> `cardKingdomPricesByNames` (line 206, `new RegExp(`^${name}$`, 'i')` over an
> array of names) and `newsReviewsByArtist` (line 322, `{ $regex: new
> RegExp(`^${artistName}$`, 'i') }`, which is a public/unauthenticated query).
> Add a small escape helper (e.g. `const escapeRegex = (s: string) =>
> s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`) and apply it to every
> user-supplied string before constructing a `RegExp` in both call sites, so a
> crafted input can't cause catastrophic backtracking (ReDoS) or broaden the
> query beyond an exact case-insensitive match. Add a unit test that passes a
> string containing regex special characters (e.g. `"Some (Artist)+"`) and
> confirms it's treated as a literal match, not a pattern. -->

<!-- ### 7. [webservice] Arbitrary field mass-assignment in `updateArtist`

**File:** `src/handlers/handlers.ts:747-777`

**Issue:** `updateArtist` takes `fieldName`/`valueToSet` args and does
`updateValue[fieldName] = valueToSet` with no allowlist. It's gated by
`requireAdmin`, so this needs an already-privileged session to exploit, but
there's no defense-in-depth if an admin session were ever compromised.

**Prompt:**
> In `src/handlers/handlers.ts`, the `updateArtist` mutation (around lines
> 747-777) accepts a `fieldName: GraphQLString!` argument and does
> `updateValue[fieldName] = valueToSet` before calling
> `Artist.findByIdAndUpdate`, with no validation of which fields are
> updatable. It's already gated behind `requireAdmin`, but add an explicit
> allowlist (e.g. a `const UPDATABLE_ARTIST_FIELDS = new Set([...])` matching
> the known Artist schema fields like `name`, `email`, `facebook`, `location`,
> etc. — check `src/schema/schema.ts` or the Mongoose model for the full
> field list) and throw a clear error if `fieldName` isn't in that set, before
> performing the update. This is defense-in-depth in case an admin session is
> ever compromised via XSS or a leaked token. -->

<!-- ### 8. [webservice] PII (emails) written to plaintext logs

**Files:** `src/jobs/dailyDigest.ts:86`, `src/jobs/dailyEventDigest.ts:138`,
`src/jobs/dailyNewArtistDigest.ts:62,64`, `src/jobs/scryfallArtistSync.ts:127,129`,
`src/services/emailService.ts:40,44,54`

**Issue:** Several background jobs and the email service log raw user/admin
email addresses via `console.log`, which typically end up in the hosting
provider's (Railway) plaintext operational logs.

**Prompt:**
> Several files log raw user email addresses via `console.log` as part of
> normal operation: `src/jobs/dailyDigest.ts:86`, `src/jobs/dailyEventDigest.ts:138`,
> `src/jobs/dailyNewArtistDigest.ts:62,64`, `src/jobs/scryfallArtistSync.ts:127,129`,
> and `src/services/emailService.ts:40,44,54`. Replace the email address in
> each log line with the user's `_id` (or a redacted form like masking the
> local part, e.g. `j***@example.com`) so PII doesn't end up in plaintext
> operational logs. Keep the log messages otherwise informative (e.g. "Email
> sent to user <id>" instead of "Email sent to <email>"). -->

<!-- ### 9. [server] Missing `rel="noopener noreferrer"` on external links

**Files:** `src/components/artist/Artist.tsx:608-619,721-729,735-744`,
`src/components/home/Contact.tsx:70-76`,
`src/components/allcards/AllCards.tsx:183-216,218-250,256-288,333`

**Issue:** These `target="_blank"` links are missing `rel="noopener
noreferrer"` — a tab-nabbing risk. Most of the codebase (`Footer.tsx:106,109`,
`SigningServices.tsx`, `NewsArticle.tsx`, `EventDetail.tsx:155`,
`Dashboard.tsx:472`) already does this correctly, so it's an inconsistency
rather than a systemic gap.

**Prompt:**
> Several `target="_blank"` links in this React app are missing
> `rel="noopener noreferrer"`, unlike most of the codebase which already
> includes it correctly (see `src/components/home/Footer.tsx:106,109` or
> `src/components/calendar/EventDetail.tsx:155` for the correct pattern). Add
> `rel="noopener noreferrer"` to every `target="_blank"` link in:
> `src/components/artist/Artist.tsx` (social icon links around lines
> 608-619, the Marks Signature Service link around 721-729, and the
> MountainMage link around 735-744), `src/components/home/Contact.tsx`
> (Bluesky link around lines 70-76), and `src/components/allcards/AllCards.tsx`
> (Manapool price link ~183-216, TCGPlayer link ~218-250, Card Kingdom link
> ~256-288, and the Scryfall card-image link ~333). -->

<!-- ### 10. [server] Dashboard swallows GraphQL errors, uses spinner instead of skeleton

**File:** `src/components/dashboard/Dashboard.tsx:101-120`

**Issue:** `Dashboard.tsx` destructures `loading` from two `useQuery` calls
(`GET_CURRENT_USER`, `GET_MY_CARD_COLLECTION`) but never checks `error` — if
either query fails, the page silently renders as if the user has zero
followed artists/collection instead of showing an error, unlike every other
data-driven page in the app (Homepage, Artist, AllCards, Calendar, News all
show explicit error states). It also uses a generic `CircularProgress`
spinner instead of the app's skeleton-first loading pattern
(`src/components/shared/Skeletons.tsx`).

**Prompt:**
> In `src/components/dashboard/Dashboard.tsx` (around lines 101-120), two
> `useQuery` calls (`GET_CURRENT_USER` and `GET_MY_CARD_COLLECTION`) destructure
> `loading` but not `error`, so a failed query silently renders as if the user
> has no followed artists or collection instead of showing an error state.
> Every other data-driven page in this app (`Homepage.tsx`, `Artist.tsx`,
> `AllCards.tsx`, `Calendar.tsx`, `News.tsx`) shows an explicit error state —
> follow that same pattern here: destructure `error` from both queries and
> render an error message (check `src/components/shared/EmptyState.tsx` or how
> `Homepage.tsx` renders its error branch for the established pattern) when
> either query errors. Also replace the generic MUI `CircularProgress` spinner
> currently used for the loading state (~lines 114-120) with a
> layout-matching skeleton from `src/components/shared/Skeletons.tsx`, matching
> the skeleton-first pattern used on Homepage/Artist/AllCards/Calendar/News.

--- -->

<!-- ## Low

### 11. [webservice] `node_modules/`, `dist/`, `coverage/` tracked in git

**Issue:** These directories are in `.gitignore` but were committed before the
ignore rules were added and never untracked — currently 12,645 files under
`node_modules/`, 20 under `dist/`, 59 under `coverage/`.

**Prompt:**
> In the `mtgartistconnection.webservice` repo, `node_modules/`, `dist/`, and
> `coverage/` are all listed in `.gitignore` but are still tracked in git
> (added before the ignore rules existed). Run `git rm -r --cached
> node_modules dist coverage` to untrack them (this won't delete the local
> files, just stop tracking them), then commit that cleanup as its own commit
> with a message like "Untrack node_modules/dist/coverage (already gitignored)".
> Double check `git status` afterward shows a clean diff with only removals,
> and confirm the app still builds/runs locally afterward since none of the
> actual source files are touched. -->

<!-- ### 12. [webservice] Deprecated dependencies

**Issue:** `bcrypt-nodejs` (unmaintained since ~2015), `express-graphql`
(deprecated by maintainers), and `graphql` v15 (current major is 16/17) are
all in use.

**Prompt:**
> This backend uses several deprecated/unmaintained dependencies:
> `bcrypt-nodejs` (used for password hashing in `src/handlers/handlers.ts`,
> unmaintained since ~2015), `express-graphql` (^0.12.0, deprecated by its
> maintainers in favor of `graphql-http`), and `graphql` (^15.8.0, current
> major is 16/17). Investigate migrating `bcrypt-nodejs` to `bcrypt` or
> `bcryptjs` first (lowest risk, most important since it's the password
> hashing library) — check that `hashSync`/`compareSync` call signatures are
> compatible or update call sites accordingly, and verify existing hashed
> passwords in the database still validate correctly (bcrypt hash format is
> compatible across these libraries). Treat `express-graphql`/`graphql`
> version upgrades as a separate, larger follow-up task since they may involve
> breaking API changes — don't attempt them in the same change as the bcrypt
> migration. -->

### 13. [server] Refresh-token mutation uses string interpolation instead of Apollo variables

**File:** `src/store/auth-slice.ts:66-68`

**Issue:** `refreshAccessToken()` builds the GraphQL mutation via raw string
interpolation (`` `mutation { refreshToken(refreshToken: "${token}") { token }
}` ``) instead of using variables, even though a proper `REFRESH_TOKEN` gql
mutation with variables already exists in `src/components/graphql/mutations.ts:33-39`.

**Prompt:**
> In `src/store/auth-slice.ts` (around lines 59-80), `refreshAccessToken()`
> builds its GraphQL request body by interpolating the refresh token directly
> into a query string: `` `mutation { refreshToken(refreshToken: "${token}")
> { token } }` ``. This repo already defines a proper `REFRESH_TOKEN` mutation
> with variables in `src/components/graphql/mutations.ts:33-39` — use that
> instead: send the request body as `{ query: REFRESH_TOKEN.loc.source.body,
> variables: { refreshToken: token } }` (or use Apollo Client directly if this
> function has access to the client instance) so the token is passed as a
> proper GraphQL variable instead of being interpolated into the query string.
> Confirm login/refresh flow still works after the change by logging in,
> waiting for or forcing a token refresh, and confirming the session persists.

### 14. [server] Self-XSS via unescaped `document.write` in ArtistSheet

**File:** `src/components/artistsheet/ArtistSheet.tsx:135-149`

**Issue:** Builds an HTML string with unescaped `slot.name`/`slot.color`
(user's own typed text) and writes it via `document.write` into a same-origin
popup. Since the data is always the current session's own local state, this
is self-XSS only, not exploitable against other users — but still worth
fixing.

**Prompt:**
> In `src/components/artistsheet/ArtistSheet.tsx` (around lines 135-149), the
> printable sheet generator builds an HTML string by directly interpolating
> `slot.name` and `slot.color` (free-text fields the user types into the
> current session's form) and writes it into a popup window via
> `win.document.write(...)`. Add an HTML-escaping helper (escape `&`, `<`,
> `>`, `"`, `'`) and apply it to `slot.name` and `slot.color` before
> interpolating them into the HTML string, so a value like
> `</div><script>...` typed into the name field can't execute as script in the
> popup. Test by typing a string containing `<` and `>` characters into the
> name field and confirming it renders as literal text in the generated sheet
> rather than being interpreted as HTML.

### 15. [server] Search fields lack accessible labels

**Files:** `src/components/home/FiltersForm.tsx:80-95`,
`src/components/home/Homepage.tsx:546-561`

**Issue:** These MUI `TextField` search inputs rely on `placeholder` only, no
`label` or `aria-label`. Placeholder text disappears once text is entered and
isn't a reliable accessible-name substitute per WCAG.

**Prompt:**
> In `src/components/home/FiltersForm.tsx` (the `searchField`, reused in both
> grid and stacked layouts, around lines 80-95) and
> `src/components/home/Homepage.tsx` (the mobile persistent search bar, around
> lines 546-561), the MUI `TextField` search inputs only have a `placeholder`
> prop with no `label` or `aria-label`. Add an `aria-label="Search artists"`
> (or equivalent wording matching the field's purpose) to each `TextField` so
> screen reader users get an accessible name that doesn't disappear once text
> is typed. Keep the existing placeholder/visual styling unchanged.

### 16. [server] Icon-only buttons missing `aria-label`

**Files:** `src/components/artist/Artist.tsx:604-621` (social media icon
links), `src/components/allcards/AllCards.tsx:292-320` (collection-toggle
`IconButton`s)

**Issue:** Social icon links have no `aria-label` (screen reader announces
only the raw URL or nothing meaningful). The collection-toggle buttons rely on
a native `title` attribute on a wrapping `<span>` rather than `aria-label` on
the button itself, which isn't reliably exposed to assistive tech.

**Prompt:**
> Two places in this app have icon-only interactive elements without proper
> accessible names: `src/components/artist/Artist.tsx` (social media icon
> links around lines 604-621, e.g. Facebook/Instagram/Twitter/Bluesky/YouTube)
> — add an `aria-label` to each icon link describing the platform, e.g.
> `aria-label="Visit {artistName}'s Instagram"`. And
> `src/components/allcards/AllCards.tsx` (collection-toggle `IconButton`s
> around lines 292-320) — these currently rely on a `title` attribute on a
> wrapping `<span>`, which isn't reliably exposed to screen readers; add an
> explicit `aria-label` directly on each `IconButton` describing its action
> (e.g. "Mark as signed", "Add to wishlist"), keeping the existing `title`
> tooltip for sighted users. Follow the good pattern already used in
> `src/components/home/DensityToggle.tsx:60-61`, which uses both `aria-label`
> and `aria-pressed` correctly.

### 17. [server] Dead file `App.css`

**File:** `src/App.css`

**Issue:** Never imported anywhere — pure CRA-boilerplate leftover. Also
contains invalid CSS at line 18 (`background-color: "#507A60";` — literal
quote characters embedded in the value).

**Prompt:**
> `src/App.css` in this Create React App project is never imported anywhere
> (confirm with a repo-wide search for `App.css` or `./App.css`) — it's a dead
> CRA-boilerplate leftover, and even contains invalid CSS at line 18
> (`background-color: "#507A60";` has literal quote characters embedded,
> which would be ignored by browsers even if the file were used). Delete
> `src/App.css` entirely. Double-check no `.tsx`/`.ts` file imports it before
> deleting.

### 18. [server] Dead/legacy type definitions

**File:** `src/types/types.ts`

**Issue:** Defines `UserType`, `BlogType`, `CommentType` that don't match the
actual data model used elsewhere in the app (GraphQL-derived types for
Artist/User/SigningEvent/etc. live in component-level interfaces) — likely
leftover boilerplate from an earlier iteration.

**Prompt:**
> `src/types/types.ts` defines `UserType`, `BlogType`, and `CommentType`,
> which don't match the actual data model used throughout the rest of the app
> (the real Artist/User/SigningEvent/etc. shapes are defined inline in
> component files or inferred from GraphQL query results). First, grep the
> whole `src/` tree for imports from `types/types` or usages of `BlogType`/
> `CommentType` to confirm they're genuinely unused. If confirmed dead,
> delete `src/types/types.ts` entirely. If anything does import it, report
> back what's using it instead of deleting.

### 19. [server] `build/` and `coverage/` directories committed to git

**Issue:** Same pattern as the webservice repo — stale build artifacts and
coverage reports checked into source control.

**Prompt:**
> In this repo, the `build/` and `coverage/` directories appear to be
> committed to git (check `git ls-files build coverage` to confirm — note
> `public/` and `build/` may contain near-duplicate static assets, so verify
> carefully which files are actually tracked before removing anything). If
> confirmed tracked, add `build/` and `coverage/` to `.gitignore` if not
> already present, then run `git rm -r --cached build coverage` to untrack
> them without deleting local copies, and commit that cleanup separately from
> any other changes.

### 20. [server] Leftover debug `console.log` statements

**Files:** `src/components/blogs/AddArtistToEvent.tsx`,
`src/components/blogs/AddEvent.tsx`, `src/components/blogs/EditArtist.tsx`,
`src/components/home/Following.tsx` (`Following.tsx` per structure audit),
`src/components/artist/ArtistCardBreakdown.tsx`, `src/components/home/Footer.tsx`,
`src/components/blogs/NewsReview.tsx`, `src/components/settings/Settings.tsx`,
`src/components/blogs/AdminPostReview.tsx`, `src/components/artist/Artist.tsx`,
`src/components/allcards/AllCards.tsx`

**Prompt:**
> Search this repo's `src/` directory for `console.log(` calls left over from
> development/debugging (found in files including
> `src/components/blogs/AddArtistToEvent.tsx`, `src/components/blogs/AddEvent.tsx`,
> `src/components/blogs/EditArtist.tsx`, `src/components/home/Following.tsx`,
> `src/components/artist/ArtistCardBreakdown.tsx`, `src/components/home/Footer.tsx`,
> `src/components/blogs/NewsReview.tsx`, `src/components/settings/Settings.tsx`,
> `src/components/blogs/AdminPostReview.tsx`, `src/components/artist/Artist.tsx`,
> and `src/components/allcards/AllCards.tsx`). Review each one: remove
> `console.log` calls that are clearly just leftover debugging (printing
> intermediate values with no operational purpose), but keep/convert to
> `console.error` any that are genuinely reporting caught errors. Do this file
> by file and confirm each app flow still works after removal (e.g. admin
> forms in the `blogs/` directory still submit correctly).

### 21. [server] `eslint-disable` suppressions worth auditing

**Files:** `src/components/blogs/AddArtistToEvent.tsx:129`,
`src/components/signingtracker/SigningTracker.tsx:796,830`

**Issue:** These suppress `react-hooks/exhaustive-deps`, which can mask real
stale-closure bugs.

**Prompt:**
> Three `eslint-disable-next-line react-hooks/exhaustive-deps` comments exist
> in this codebase: `src/components/blogs/AddArtistToEvent.tsx:129` and
> `src/components/signingtracker/SigningTracker.tsx:796` and `:830`. For each,
> read the surrounding `useEffect`/`useCallback`/`useMemo` and determine
> whether the omitted dependency is intentional (e.g. deliberately running
> only once on mount) or masks a real stale-closure bug where the effect
> should re-run when a dependency changes but currently doesn't. Fix any
> genuine bugs found by adding the missing dependency (and adjusting the
> effect body if needed to avoid unwanted re-runs), and remove the
> `eslint-disable` comment where it's no longer needed. If a suppression is
> genuinely intentional, leave it but add a one-line comment explaining why.

### 22. [server] No CI test gate before deploy

**File:** `amplify.yml`

**Issue:** No `.github/workflows` exist; `amplify.yml`'s build phases only run
`npm ci` and `npm run build` — `npm test` is never invoked. Combined with
~5.5% test coverage and zero component tests (despite Testing Library being
installed), regressions can ship to production without any automated
verification.

**Prompt:**
> This repo has no CI pipeline (no `.github/workflows`) and its AWS Amplify
> build config (`amplify.yml`) never runs `npm test` before deploying — only
> `npm ci` and `npm run build`. Add a GitHub Actions workflow at
> `.github/workflows/ci.yml` that runs on pull requests and pushes to `main`:
> checks out the repo, sets up Node 18 (matching `amplify.yml`'s nvm version),
> runs `npm ci`, then `npm test -- --watchAll=false` (CRA's test runner needs
> `--watchAll=false` in CI) and `npm run build`, failing the workflow if
> either step fails. This gives a test gate even though Amplify itself doesn't
> run tests during deploy. As a starter improvement to make this gate
> meaningful, add basic component render tests (using the already-installed
> `@testing-library/react`) for the highest-traffic pages — start with
> `Homepage.tsx`, `Artist.tsx`, and `AllCards.tsx` — that at minimum render
> without crashing given mocked Apollo `MockedProvider` responses. Follow the
> existing test style in `src/store/auth-slice.test.ts` for conventions used
> in this repo.

### 23. [server] Google Analytics with no consent gate

**File:** `public/index.html:48-56`

**Issue:** `gtag.js` loads unconditionally for every visitor with no
cookie-consent banner. Disclosed in the Privacy Policy, but no opt-out
mechanism exists — a compliance consideration (GDPR/ePrivacy, CCPA) rather
than a hard bug.

**Prompt:**
> `public/index.html` (lines 48-56) loads Google Analytics (`gtag.js`, tag
> `G-GGY95C3RHZ`) unconditionally on every page load with no cookie-consent
> banner, though `src/components/home/PrivacyPolicy.tsx` (~line 70) does
> disclose this practice. Add a lightweight cookie-consent banner component
> (simple accept/decline UI, persisted via `localStorage`) that gates loading
> of the GA script — only inject the `gtag.js` script tag and call
> `gtag('config', ...)` after the user has accepted, and don't load it at all
> if they've declined or haven't yet responded. This is a compliance
> improvement for GDPR/ePrivacy (EU) and CCPA (California) visitors, not a
> functional bug fix, so scope it as its own PR.

### 24. [server] Empty `featureFlags.ts` scaffolding

**File:** `src/featureFlags.ts`

**Prompt:**
> `src/featureFlags.ts` currently exports `export const FEATURE_FLAGS = {};` —
> an empty object with no consumers anywhere in the codebase (confirm via a
> repo-wide search for `FEATURE_FLAGS` or `featureFlags`). Decide whether this
> is worth keeping as scaffolding for a near-term feature-flag need, or should
> be deleted as unused dead code. If there's no concrete plan to use it within
> the next few changes, delete it; otherwise leave a one-line comment stating
> what it's reserved for.

---

## New Feature Ideas

### 25. Card Name Search (already scoped)

**Reference:** `BACKLOG.md`

**Prompt:**
> Read `BACKLOG.md` in this repo, which fully scopes a "Search by Card Name"
> feature (search artists by the cards they've illustrated, since no
> card→artist mapping currently exists). Implement it following the plan
> already laid out there: extend the existing Scryfall bulk-data build script
> (`scripts/build-set-artists.js`, which currently generates
> `src/data/set-artists.json`) to also build a card-name → artist-name(s)
> index, wire a new filter/search mode into the existing `FiltersForm.tsx`/
> `Homepage.tsx` search UI (reusing the existing search input rather than
> adding a new one), and update `artistFilters.ts` to support filtering by
> card name using the new index. Follow the existing static-JSON-plus-client-side-filter
> pattern already used for the set-artists feature rather than adding a new
> backend endpoint, unless `BACKLOG.md` specifies otherwise.

### 26. Cookie-consent banner

See item 23 above — implementing the GA consent gate doubles as this feature.

### 27. Public/shareable collection or wishlist pages

**Prompt:**
> This app has a `UserCardCollection` model (`scryfallId, cardName,
> artistName, set, collectorNumber, signedNonfoil, signedFoil,
> wishlistSigned, artistProof, artistProofFoil` — see
> `src/components/graphql/queries.ts`/`mutations.ts` and
> `src/components/dashboard/YourCards.tsx`) that's currently only viewable by
> the owning user. Design and scope (as a plan, before implementing) a
> public/shareable read-only view of a user's collection or signed-card
> wishlist — e.g. a route like `/collection/:userId` or a shareable link
> generated from `YourCards.tsx` — gated behind an explicit user opt-in toggle
> (default off) in `Settings.tsx`, so no collection is exposed publicly
> without the owner choosing to share it. This would need a corresponding
> backend query in `mtgartistconnection.webservice` that only returns
> collection data for users who've opted in.

### 28. Artist self-service claim/verification flow

**Prompt:**
> Currently artist profiles (name, social links, email, signing info) are
> managed entirely by admins via `AddArtist`/`EditArtist` — there's no way for
> an artist to claim or verify ownership of their own profile. Scope (as a
> plan first) a self-service flow where an artist can request to claim their
> existing profile (e.g. via an email-verification link sent to the artist's
> email already on file, or an admin-approved request queue similar to the
> existing `AdminPostReview`/`NewsReview` admin-approval patterns), after
> which they'd get limited edit rights to their own profile fields without
> needing full admin access. This would need new backend mutations/auth
> scoping in `mtgartistconnection.webservice` (a new role or per-resource
> ownership check distinct from the current global `admin`/`user` roles) and
> new frontend UI in `mtgartistconnection.server`.
