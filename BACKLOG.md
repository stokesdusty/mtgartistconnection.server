# Backlog

---

## Search by Card Name

**Goal:** Allow users to type a card name (e.g. "Black Lotus") in a search field and see only the artists who illustrated that card.

### Context & Findings

No card→artist mapping currently exists in the system. The Artist MongoDB documents have no card data. The only bridge between local artists and card data is the `scryfall_name` field on each Artist document, which maps local artist names to Scryfall's version of their name.

The existing `set-artists.json` pattern (`src/data/set-artists.json`) is the right model to follow — a static JSON file mapping normalized keys to arrays of normalized artist names, filtered entirely on the client.

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
