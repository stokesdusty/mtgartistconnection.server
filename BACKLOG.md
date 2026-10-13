# Backlog

---

## Search by Card Name

**Goal:** Allow users to type a card name (e.g. "Black Lotus") in a search field and see only the artists who illustrated that card.

### Context & Findings

No card→artist mapping currently exists in the system. The Artist MongoDB documents have no card data. The only bridge between local artists and card data is the `scryfall_name` field on each Artist document, which maps local artist names to Scryfall's version of their name.

> **Update (2026-10):** `set-artists.json` and its build script have been removed. The set filter now uses the webservice: a daily job (`jobs/setArtistSync.ts`) stores Scryfall artist credits per set in the `SetArtists` collection, and the `artistsBySet(code)` query maps them to our artists via `scryfall_name` at request time. A card-name index would fit the same pattern (daily job + query) better than a bundled static JSON file, which went stale and added ~300 KB to the homepage bundle.

### Recommended Approach: Static JSON Index

**Step 1 — Build script** (`scripts/generate-card-artists.ts` in webservice or server)
- Downloads Scryfall Oracle Cards bulk data (~100MB, one entry per unique card)
- Fetches all artists from the backend to get `{ name, scryfall_name }` pairs
- Builds a `scryfall_name → local_name` map (normalized: lowercase, no spaces)
- Outputs `src/data/card-artists.json`:
  ```json
  { "blacklotus": ["christopherrush"], "lightningbolt": ["christophermoeller", ...] }
  ```
- Re-run when new sets release. Cards with no matching local artist are omitted.

**Step 2 — Backend (optional minor change)**
- Add `scryfall_name` to the `artistFilterFlags` GraphQL response
- Files: `mtgartistconnection.webservice/src/handlers/handlers.ts` (~line 117), `src/schema/schema.ts`
- Only needed if the generation script doesn't query MongoDB directly

**Step 3 — Frontend filter logic** (`src/components/home/Homepage.tsx`)
- Add `cardNameFilter` URL param: `searchParams.get('card') || ''`
- Add filter step in `matchingFlags` useMemo (after the `setFilter` block, ~line 428):
  ```typescript
  if (cardNameFilter.length >= 2) {
    const normalized = cardNameFilter.toLowerCase().replace(/\s/g, '');
    const artistsForCard = new Set<string>(
      (cardArtistsData as Record<string, string[]>)[normalized] ?? []
    );
    filtered = filtered.filter((a) =>
      artistsForCard.has(a.name.toLowerCase().replace(/\s/g, ''))
    );
  }
  ```

**Step 4 — Frontend UI** (`src/components/home/FiltersForm.tsx`)
- Add a card name `Autocomplete` field (same pattern as the existing set filter)
- Scryfall autocomplete API: `https://api.scryfall.com/cards/autocomplete?q=[term]`
- New props: `cardNameFilter: string`, `onCardNameFilterChange: (value: string) => void`

### Open Question
UX for the input field:
- **Separate field** (recommended) — dedicated "Search by card name" alongside artist search
- **Toggle on existing field** — mode switch on current field
- **Combined** — existing field searches both artist names and card names simultaneously

### Effort
- Build script: medium
- Backend: minimal (optional)
- Frontend filter: small (mirrors set-filter pattern exactly)
- Frontend UI: small–medium (depends on whether Scryfall autocomplete is included)

---

## Shared Group Orders (Signing Runs)

**Status (Oct 13, 2026):** v1 is built but not deployed. Test it with `npm run dev:local` (webservice) and `npm run start:local` (here); `npm run test:integration` in the webservice runs the flows against a real MongoDB. **Deploy the webservice before this frontend:** the frontend asks for fields the current production API doesn't have. Follow-ups: an Amplify rewrite so the Discord link can live on www.mtgartistconnection.com instead of the API domain; the v2/v3 items below.

**Goal:** Let an organizer (a "runner") who is going to a signing event carry cards for other people. Participants join through a shared link, add their own cards, and track payment, shipping and signing status. This replaces the spreadsheet + DMs workflow that runners use today. Most discovery will happen by posting the link in Discord groups.

### Context & Findings

The Signing Tracker (`src/components/signingtracker/SigningTracker.tsx`, webservice `src/models/SigningBatch.ts`) has a starting point, but it is built for a single user:

- A `SigningBatch` belongs to one user. Its `batchId` is generated on the client and is only unique per user (`{ userId, batchId }` index), so it can't be used as a shared reference.
- `owner` on each row is free text with no link to a user. `paymentStatus` (`unpaid`/`partial`/`paid`), `signatureType` (free text) and `pricePerSig` are also set per row.
- **Saves overwrite the whole batch.** The client saves the entire batch, all rows included, on an 800ms debounce (`scheduleSave`, ~line 763). `saveSigningBatch` then `$set`s the full `rows` array, so the last write wins. If two people edit the same batch, they will overwrite each other's rows. This is the main technical change.
- `expanded`, `sortOrder` and `archived` are personal view state stored on the batch. Each person needs their own copy.
- Link previews: `PageMeta.tsx` uses `react-helmet-async` (client-side), and `public/index.html` has static generic OG tags. Discord's crawler doesn't run JS, so every shared link currently unfurls as the generic site card.

### Roles
- **Organizer:** creates the order, sets terms and pricing, carries the cards, and updates statuses.
- **Participant:** a user with an account who joins through the link and manages only their own cards.
- **Guest participant:** added by hand by the organizer and has no account, e.g. a friend handing over cards in person. This is what the free-text `owner` field is used for today, so keep supporting it.

### Order Lifecycle

The order gets an overall status in addition to the existing per-row statuses (`collecting → sent → artist-received → signed → shipped-back → complete`).

`Draft → Open → Closed → At event → Returning → Complete` (+ `Cancelled` from any pre-event state)

| State | Participants can | Organizer can |
|---|---|---|
| Draft | Nothing (link is inactive) | Set terms, artists and the price grid |
| Open | Join; add, edit or remove their cards; report payment; add inbound tracking | Approve people, check in packages |
| Closed (cutoff passed) | View; report payment; add tracking | Final check-in, adjust individual rows |
| At event | View live status | Mark each card signed / not signed |
| Returning | View return tracking | Enter return tracking per participant |
| Complete | Optionally add signed cards to their collection | Archive |

### Organizer Setup

Add a "Share as group order" option on an existing batch, or create a new order directly. Settings:

- **Event:** link to a `SigningEvent`. Pre-fill the artist list from `MapArtistToEvent`, then let the organizer add or remove artists.
- **Artist caps:** optional, set per artist. Artists often limit how many cards one person can bring through the line.
- **Pricing (set entirely by the organizer, per artist and signature type):** see Pricing below. Prices are **not** pulled from signing reports or anywhere else.
- **Other fees:** an optional flat fee per participant, and return shipping options with prices (e.g. `Plain envelope $1`, `Bubble mailer $5`).
- **Limits:** a cutoff date, and a maximum number of cards per participant.
- **Joining:** every join request waits for the organizer's approval. There is no auto-join.
- **Payment timing (required):** participants pay either **upfront** (once they're approved) or **after signing** (once the order moves to Returning). The organizer must pick one.
- **Organizer's Discord name:** shown on the public summary page, so people coming from a Discord group can confirm the runner is who they expect.
- **Instructions:** public terms that anyone with the link can see, and private instructions (shipping address, PayPal/Venmo handles) that only approved participants see.
- **Invite link:** `/tracker/join/:token`. The organizer can rotate or revoke it.

### Pricing

A card's price comes **only** from its artist + signature type, because every artist charges differently for each type. Which specific card it is doesn't matter, and there are no prices for individual cards.

- **Signature types:** the organizer defines the types offered across the order, e.g. `Signature`, `Sig + doodle`, `Sketch`, `Remarque`.
- **Price grid:** for each artist, the organizer sets a price per card for each type, e.g.:

  | Artist | Signature | Sig + doodle | Sketch |
  |---|---|---|---|
  | Guay | $5 | $15 | TBD |
  | Rush | $3 | — | $40 |

  Prices are all-in, with the organizer's handling built in. Each cell is one of:
  - **a price**
  - **TBD:** the artist offers it, but the price isn't known yet (e.g. the artist hasn't announced convention pricing)
  - **not offered (—):** participants can't pick it
- **Join and ship before pricing:** participants can join, add cards and ship while cells are TBD. Those cards show "Price pending", and their balance shows "Pending" until the organizer fills in the cell.
- **Cards look up their price from the grid.** A participant picks the artist and signature type, and the price always comes from that grid cell. Participants can never set or edit a price.
- **Changing a cell updates every card in it:** filling in a TBD cell, or changing a price, applies to all cards with that artist + type at once. Only participants with cards in that cell are notified.
- Regular private batches keep free-text `signatureType`/`pricePerSig` as they do today.

### Custom Items (e.g. Artist Proofs)

Some things are bought on a participant's behalf rather than signed: artist proofs, prints, playmats, and so on. These have their own pricing, so the organizer can add custom items to a specific participant.

- **Fields:** a free-text label (e.g. `Lightning Bolt AP`), an optional artist, quantity, and price per item. The price can be left blank until it's known, and shows as pending meanwhile.
- **Only the organizer** can add, edit, price or remove custom items. Participants see their own in their order view and balance.
- **Requesting:** participants ask for these through Discord or an optional **"Notes to organizer"** field on their participant record.
- **Status:** `requested` → `purchased` or `unavailable`. Unavailable items drop out of the bill, the same way not-signed cards do.
- **Limits:** they don't count toward artist caps or the per-participant card maximum. Those are signing-line limits.
- **Event-day list:** they appear on the organizer's by-artist view as a shopping list, e.g. "Guay: buy 3 APs for 2 people".
- **Returns:** they ship back with the participant's signed cards.

### Discord Name

- Add `discordName` to `User`, editable in `Settings.tsx`. The join flow pre-fills it from there.
- Store a copy on each participant record. The organizer can also enter one for guest participants.
- **Optional but strongly encouraged.** It's never required to join, but most runs are coordinated in Discord, so a matching name avoids confusion over whose cards are whose.
  - **Join form:** the field is prominent, with a short note like "Most runs are coordinated on Discord. Adding your name helps the organizer match your cards to you." Skipping it is allowed.
  - **After joining:** if it's still blank, the participant's order view shows a dismissible reminder to add it.
  - **Organizer setup:** the same nudge applies to the organizer, since their Discord name appears on the join page and the link preview.
  - **Organizer view:** participants without a Discord name are marked "No Discord name", and their account display name is shown instead.
- **Light validation only:** 2–32 characters, matching Discord's current username rules (lowercase letters, digits, `_` and `.`). Accept legacy `name#1234` names as well.
- **It is not verified.** Label it "Discord (unverified)" in the UI. See Trust & Safety.
- **Who sees it:** the organizer sees every participant's Discord name, since that's how they'll contact people. Participants see only the organizer's.

### Discord Link Previews

Most discovery will come from pasting the invite link into Discord, so the link has to unfurl with real details. Because of the client-side Helmet issue noted above, this needs a server-rendered route.

- **New webservice route** (e.g. `/share/group-order/:token`), following the existing `routes/publicArtist.ts` pattern:
  - It returns minimal HTML with OG/Twitter meta tags: order name, event and dates, artist list, cutoff, slots remaining, and the organizer's Discord name.
  - It then redirects real browsers to the SPA join page.
- Rate-limit the route, and only include public-terms fields (no address, no participant data).
- "Copy link for Discord" is the main share button in the organizer UI.

### Participant Journey

1. **Open the link.** Anyone can see the public summary page: event, organizer and their Discord name, artists with remaining slots, the price grid, return shipping options, and the cutoff. If not logged in, show `SignupPromptModal`, then send them back to the link.
2. **Join.** Accept the terms, and add or confirm their Discord name (optional, but encouraged on the form). Record the acceptance time. They then wait for the organizer to approve them.
3. **Add cards.** Only artists in the order can be chosen. For each card, pick the artist and then a signature type that artist offers. The price fills in from the grid, or shows "Price pending" if that cell is TBD. The server enforces artist caps and the per-participant maximum. Later (v2), offer a quick-add list from their `wishlistSigned` cards by the order's artists.
4. **Ship the cards.** They click **Ready to ship**, which shows the private instructions and automatically generates their printable artist sheet (see below) to include in the package. Then they enter tracking for the package they send.
5. **Pay.** Report "I've sent $X" with a note (e.g. a PayPal transaction ID). The organizer confirms it.
6. **Follow progress** of their own cards and of the order as a whole.
7. **Get the cards back** with return tracking. Optionally (v2), add the signed cards to their collection (`UserCardCollection`).

Shared orders show up in each participant's Signing Tracker under a **"Shared with me"** section.

### Payment Per Participant

- **Tracked per participant, not per row.** People pay for their whole set of cards at once.
- **Amount due is calculated:**
  - for each card, quantity × its grid price
  - plus each custom item's quantity × price
  - plus the flat per-participant fee and the chosen return shipping

  The balance shows "Pending" while any of their cards sit in a TBD cell or any custom item is unpriced.
- **Payments are a list of entries:** amount, date, note, and who recorded it. Payments the participant reported and payments the organizer confirmed are tracked separately. Unpaid / partial / paid / overpaid is worked out from the totals, not set by hand.
- **Unsigned cards drop out of the bill.** Add a new `not-signed` row status with a reason (artist no-show, limit reached, declined). These rows are removed from the amount due, so the participant shows as owed a refund or credit.
- **No money moves through the site.** That would bring liability and money-transmission rules. The site only keeps the record.
- The row-level `paymentStatus` stays as-is for regular private batches.

### Shipping Per Participant

- **Inbound:** the participant enters tracking. The organizer marks the package received and checks the count for each row ("received 3 of 4"). Any mismatch is flagged to both sides.
- **Return:** the participant picks a return method from the organizer's options. The organizer enters return tracking per participant.
- Row-level `outboundTracking`/`inboundTracking` stay for mail-to-artist batches. In group orders, tracking lives at the participant level.

### Artist Sheet on "Ready to Ship"

When a participant marks their cards **Ready to ship**, automatically generate their artist sheet from their cards in the order. They print it and put it in the package, so the organizer can sort cards by artist and match them to the right person.

- **Reuse the existing generator** (`src/components/artistsheet/ArtistSheet.tsx`, `/artistsheet`). Today it's a manual form that holds 30 slots in memory and prints a letter-size page of 3×10 slips: **Your Name**, **Color** (signature type / colors), **Artist/Quantity**. Pull its print-HTML builder (`handlePrint`) out into a shared util, so both the standalone page and group orders use it.
- **One slip per artist + signature type,** built from the participant's rows:
  - **Your Name:** their Discord name, falling back to their display name. The organizer coordinates by Discord name, so that's the name to put on the slip.
  - **Color:** the signature type label, plus any `sigNotes` (e.g. ink color).
  - **Artist/Quantity:** the artist name × the total quantity of their cards in that group.
  - Custom items (APs, etc.) are left off, since the organizer buys those at the event and the participant isn't shipping anything for them.
- **Header line on each page:** the order name and the organizer's Discord name. This is new; the current sheet has no header.
- **More than 30 slips:** paginate across multiple pages. The current generator stops at one page.
- **Flow:**
  - Clicking "Ready to ship" records `readyToShipAt`, shows the private shipping instructions, and opens the sheet preview with a print button.
  - "Print artist sheet" stays available on their order view afterwards.
  - An "Edit in Artist Sheet Generator" link opens `/artistsheet` pre-filled with the slips, for anyone who wants to tweak them before printing.
- **The sheet always reflects the current cards.** If a participant changes their cards after marking ready to ship, show a "Your cards changed — reprint your artist sheet" banner.
- **Organizer access:** the organizer can print any participant's sheet. This covers guest participants, and packages that arrive without one. Their by-participant view shows "X of Y ready to ship".

### Visibility

- **Organizer:** sees everything, in two views:
  - **By participant:** for check-in, payments and returns. Shows each person's Discord name.
  - **By artist:** a mobile-friendly event-day pick list, e.g. "Guay: 23 cards from 5 people, 2 sketch requests, buy 3 APs", with one-tap buttons for signed / not signed and purchased / unavailable. This is the organizer's most important screen.
- **Participant:** sees their own cards and custom items, their own balance, the terms, the price grid, slot counts per artist, and the organizer's Discord name. They do **not** see other participants' names, Discord names or cards.

### Data Model (webservice)

- **`SigningBatch`:** add a `groupOrder` subdocument:
  - `status`, `eventId`
  - `signatureTypes[] { id, label }`
  - `artists[] { name, cap, prices[] { signatureTypeId, price | null } }`. A `null` price means TBD. A type missing from `prices` means that artist doesn't offer it.
  - `participantFee`, `returnOptions[] { id, label, price }`
  - `cutoff`, `maxCardsPerParticipant`, `paymentTiming` (`upfront` / `after-signing`)
  - `inviteToken`
  - `publicTerms`, `privateInstructions`
  - `organizerDiscordName`
- **New `GroupOrderParticipant` collection:**
  - `orderId`, `userId` (null for guests), `displayName`, `discordName`
  - `status`: `requested` / `approved` / `declined` / `removed` / `left`
  - `payments[]`, `readyToShipAt`, `inboundTracking`, `receivedAt`, `returnOptionId`, `returnTracking`
  - `customItems[] { id, label, artistName?, quantity, price | null, status, note }`
  - `notesToOrganizer`
  - personal view state (`expanded` / `sortOrder` / `archived`)
  - `termsAcceptedAt`
- **Rows:** add `participantId` and `signatureTypeId`. In group orders the price is resolved from the grid (artist + `signatureTypeId`), and `pricePerSig` isn't used. Keep `owner` as the display label. Add `not-signed` to the row status enum, plus a `notSignedReason` field.
- **`User`:** add `discordName`.
- Shared references use the batch's Mongo `_id`, not `batchId`.

### API (webservice)

- **Public:** `groupOrderByInvite(token)` returns only the public summary fields. Rate-limit it with the existing `rateLimiter` middleware.
- **Participant:** `joinGroupOrder`, `leaveGroupOrder` (only allowed before their package is received), `add/update/deleteGroupOrderRow` on their own rows while the order is Open, `reportGroupOrderPayment`, `markReadyToShip`, `setParticipantInboundTracking`, `setReturnOption`, `updateNotesToOrganizer`.
- **Organizer:**
  - `updateGroupOrderSettings` (including price grid edits)
  - `rotateInviteToken`, `approve/declineParticipant`, `removeParticipant`, `addGuestParticipant`
  - `markPackageReceived`, `updateGroupOrderRowStatus`
  - `add/update/removeCustomItem`
  - `recordGroupOrderPayment`, `setReturnTracking`, `setGroupOrderStatus`
- **One atomic update per row change.** Every row change is its own update (`$push` / positional `$set` by `rowId`), checked on the server against the caller's role and the order status. Shared batches **stop using whole-batch `saveSigningBatch`**, which removes the overwrite problem. Private batches can keep the current save path.
- **No websockets needed.** Use Apollo `pollInterval` and refetch when the window regains focus.

### Notifications (existing `emailService`)

- **To the organizer:** a join request has come in.
- **To participants:**
  - approved
  - a TBD price was filled in, or a price changed, for an artist + type they have cards in
  - a custom item was added to their order or priced
  - reminder 48h before the cutoff
  - package received (with any count mismatch)
  - cards signed, or not signed with the reason
  - return shipped (with tracking)
  - order cancelled

These are transactional, so they're sent regardless of `emailPreferences`, with an opt-out per order.

### Trust & Safety

- **Terms of Service update:** say the site is not a party to these arrangements. Record each participant's terms acceptance at join.
- **Who can organize:** anyone who is logged in.
- **Account safety:**
  - Participants can't leave after their package is received.
  - Organizers can cancel an order but can't delete it once any cards have arrived.
- **Admin controls:** a report button on orders. Admins can view and disable any order.
- **Discord names are unverified.** Label them that way, and tell participants to confirm the organizer's identity in the Discord group the link came from. Discord OAuth verification is a v3 option.
- **Addresses:** shipping addresses only appear in private instructions, shown to approved participants. No participant return addresses are stored in v1.

### Phasing

- **v1:**
  - sharing on a batch, invite link + join flow, Discord name field
  - Discord link previews
  - per-artist, per-signature-type price grid (with TBD cells)
  - custom items (artist proofs, etc.) per participant
  - row-level mutations
  - payment and shipping per participant
  - cutoff and caps
  - by-artist event-day view
  - automatic artist sheet on "Ready to ship"
  - key emails
- **v2:**
  - optional public listing of group orders on event pages (`EventDetail.tsx`)
  - wishlist quick-add
  - add-to-collection on completion
  - check-in photos (reusing the existing presigned upload flow)
- **v3:**
  - organizer reputation (completed orders, participant reviews)
  - co-organizers, CSV export
  - Discord OAuth to verify Discord names
  - optional Discord webhook that posts order updates to the organizer's server

### Decisions (Oct 13, 2026)
1. **Joining:** the organizer approves every join. No auto-join option.
2. **Payment timing:** the organizer chooses per order, upfront or after signing.
3. **Who can organize:** anyone who is logged in. No email verification or new-account limits.

### Effort
- Data model + row-level mutations + authorization: large. The per-row and per-role permission checks are most of the work.
- Join flow + Discord link previews route: medium
- Organizer views (by participant, by artist): medium
- Price grid editor (artists × signature types): medium. It needs to be quick to fill in on a phone, e.g. copy one artist's row to another.
- Custom items: small
- Artist sheet on "Ready to ship": small. It's mostly pulling the print builder out of `ArtistSheet.tsx`, plus pagination and the header line.
- Participant view + "Shared with me": small–medium
- Emails: small (reuses `emailService` and the template pattern)
