import { GroupOrder, OrderRow, signatureTypeLabel } from './groupOrders';

// Printable artist sheets: letter pages of 3×9 slips that go in a package of cards so the
// person at the signing can sort them by artist. Shared by the Artist Sheet Generator and
// group orders ("Ready to ship").

export interface SheetSlot {
  name: string;
  artist: string;
  quantity: number;
  color: string;
}

/** Nine rows of three, which leaves room at the bottom of the page. */
export const SLOTS_PER_PAGE = 27;
const ROWS_PER_PAGE = SLOTS_PER_PAGE / 3;
/** More than any one package needs. */
export const MAX_SLOTS = 300;

/** Slip text size; wordy slips shrink toward the minimum at print time so they fit their cell. */
const SLOT_FONT_PT = 9;
const MIN_SLOT_FONT_PT = 6;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Splits slots into pages, padding the last page with empty slips. Always at least one page. */
export function paginateSlots(slots: SheetSlot[]): (SheetSlot | null)[][] {
  const pages: (SheetSlot | null)[][] = [];
  for (let i = 0; i < Math.max(slots.length, 1); i += SLOTS_PER_PAGE) {
    const page: (SheetSlot | null)[] = slots.slice(i, i + SLOTS_PER_PAGE);
    while (page.length < SLOTS_PER_PAGE) page.push(null);
    pages.push(page);
  }
  return pages;
}

const slotHtml = (slot: SheetSlot | null) =>
  slot
    ? `<div class="slot filled">
        <div><strong>Your Name:</strong> ${escapeHtml(slot.name)}</div>
        <div><strong>Color:</strong> ${escapeHtml(slot.color)}</div>
        <div><strong>Artist/Quantity:</strong> ${escapeHtml(slot.artist)} ×${slot.quantity}</div>
       </div>`
    : `<div class="slot empty">
        <div><strong>Your Name:</strong></div>
        <div><strong>Color:</strong></div>
        <div><strong>Artist/Quantity:</strong></div>
       </div>`;

/** The whole printable document. `header` (e.g. the order and organizer) tops every page. */
export function buildArtistSheetHtml(slots: SheetSlot[], header?: string): string {
  const pages = paginateSlots(slots)
    .map((page) => `<section class="page">${header ? `<div class="header">${escapeHtml(header)}</div>` : ''}<div class="grid">${page.map(slotHtml).join('')}</div></section>`)
    .join('');
  return `<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: letter portrait; margin: 0.35in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  /* A hair shorter than the printable area so rounding never spills a page; the bottom padding is
     breathing room the rows never reach, however wordy the slips. */
  .page { display: flex; flex-direction: column; height: calc(11in - 0.8in); padding-bottom: 0.5in; break-after: page; }
  .page:last-child { break-after: auto; }
  .header { font-size: 9pt; font-weight: 600; padding: 0 0 6px; }
  /* minmax(0, …) keeps a wordy slip from stretching its row and pushing the last row off the page. */
  .grid { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(${ROWS_PER_PAGE}, minmax(0, 1fr)); gap: 6px; }
  .slot { padding: 5px 8px; font-size: ${SLOT_FONT_PT}pt; line-height: 1.7; border-left: 4px solid #ccc; overflow: hidden; overflow-wrap: anywhere; }
  .slot.filled { border-left-color: #3498db; }
  .slot strong { font-weight: 600; }
</style>
</head>
<body>
${pages}
<script>
  // Shrink only the slips whose text overflows their cell, so the 3×9 cut grid stays uniform.
  function fitSlots() {
    var slots = document.querySelectorAll('.slot');
    for (var i = 0; i < slots.length; i++) {
      var pt = ${SLOT_FONT_PT};
      while (slots[i].scrollHeight > slots[i].clientHeight && pt > ${MIN_SLOT_FONT_PT}) {
        pt -= 0.5;
        slots[i].style.fontSize = pt + 'pt';
      }
    }
  }
  window.onload = function() { fitSlots(); window.print(); window.close(); };
${'</script>'}
</body>
</html>`;
}

/** Opens the print dialog for a sheet. Returns false if the browser blocked the window. */
export function printArtistSheet(slots: SheetSlot[], header?: string): boolean {
  const win = window.open('', '_blank', 'width=816,height=1056');
  if (!win) return false;
  win.document.write(buildArtistSheetHtml(slots, header));
  win.document.close();
  return true;
}

/**
 * A participant's slips: one per artist + signature type, with the total count. The Color
 * line carries the signature type plus any notes (e.g. ink color).
 */
export function slotsFromRows(order: Pick<GroupOrder, 'signatureTypes' | 'artists'>, rows: OrderRow[], name: string): SheetSlot[] {
  const groups = new Map<string, { artist: string; typeId: string; quantity: number; notes: string[] }>();
  for (const row of rows) {
    const key = `${row.artist}\u0000${row.signatureTypeId}`;
    const group = groups.get(key) ?? { artist: row.artist, typeId: row.signatureTypeId, quantity: 0, notes: [] };
    group.quantity += row.quantity;
    const note = row.sigNotes?.trim();
    if (note && !group.notes.includes(note)) group.notes.push(note);
    groups.set(key, group);
  }
  const artistOrder = order.artists.map((a) => a.name);
  return Array.from(groups.values())
    .sort((a, b) => artistOrder.indexOf(a.artist) - artistOrder.indexOf(b.artist) || a.typeId.localeCompare(b.typeId))
    .map((g) => ({
      name,
      artist: g.artist,
      quantity: g.quantity,
      color: [signatureTypeLabel(order, g.typeId), ...g.notes].join(', '),
    }));
}

/** "IX run · organizer card.runner", for the top of each page. */
export const groupOrderSheetHeader = (order: Pick<GroupOrder, 'name' | 'organizerDiscordName'>) =>
  order.organizerDiscordName ? `${order.name} · organizer ${order.organizerDiscordName}` : order.name;
