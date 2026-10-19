import { buildArtistSheetHtml, groupOrderSheetHeader, paginateSlots, SLOTS_PER_PAGE, slotsFromRows } from './artistSheet';

const slot = (i: number) => ({ name: 'alice', artist: `Artist ${i}`, quantity: 1, color: 'Signature' });

describe('paginateSlots', () => {
  it('pads a short sheet to one full page', () => {
    const pages = paginateSlots([slot(1)]);
    expect(pages).toHaveLength(1);
    expect(pages[0]).toHaveLength(SLOTS_PER_PAGE);
    expect(pages[0].filter(Boolean)).toHaveLength(1);
  });

  it('goes past 30 slips onto more pages', () => {
    const pages = paginateSlots(Array.from({ length: 31 }, (_, i) => slot(i)));
    expect(pages).toHaveLength(2);
    expect(pages[1].filter(Boolean)).toHaveLength(1);
  });

  it('prints one empty page when there are no slips', () => {
    expect(paginateSlots([])).toHaveLength(1);
  });
});

describe('buildArtistSheetHtml', () => {
  it('escapes text and repeats the header on every page', () => {
    const html = buildArtistSheetHtml([...Array.from({ length: 30 }, (_, i) => slot(i)), { ...slot(99), name: '<b>me</b>' }], 'IX run · organizer card.runner');
    expect(html.match(/class="page"/g)).toHaveLength(2);
    expect(html.match(/IX run · organizer card.runner/g)).toHaveLength(2);
    expect(html).toContain('&lt;b&gt;me&lt;/b&gt;');
    expect(html).not.toContain('<b>me</b>');
  });

  it('keeps rows a fixed height so wordy slips cannot push the last row off the page', () => {
    const html = buildArtistSheetHtml([slot(1)]);
    expect(html).toContain('grid-template-rows: repeat(10, minmax(0, 1fr))');
    expect(html).toMatch(/\.slot \{[^}]*overflow: hidden/);
  });

  it('shrinks only the slips that overflow their cell before printing', () => {
    const html = buildArtistSheetHtml([slot(1), { ...slot(2), color: 'Signature, silver ink, personalized to Alice' }]);
    document.body.innerHTML = html.slice(html.indexOf('<body>') + 6, html.indexOf('<script>'));
    const [short, wordy] = Array.from(document.querySelectorAll<HTMLElement>('.slot'));
    // jsdom has no layout: the wordy slip overflows until its text drops to 7pt.
    const fontPt = (el: HTMLElement) => parseFloat(el.style.fontSize) || 9;
    for (const el of [short, wordy]) {
      Object.defineProperty(el, 'clientHeight', { value: 70 });
      Object.defineProperty(el, 'scrollHeight', { get: () => (el === wordy && fontPt(el) > 7 ? 90 : 70) });
    }
    const script = html.slice(html.indexOf('<script>') + 8, html.indexOf('window.onload'));
    new Function(`${script}; fitSlots();`)();
    expect(short.style.fontSize).toBe('');
    expect(wordy.style.fontSize).toBe('7pt');
  });

  it('leaves the header out of the standalone generator', () => {
    expect(buildArtistSheetHtml([slot(1)])).not.toContain('class="header"');
  });
});

describe('slotsFromRows', () => {
  const order = {
    signatureTypes: [{ id: 'sig', label: 'Signature' }, { id: 'sketch', label: 'Sketch' }],
    artists: [{ name: 'Rebecca Guay' }, { name: 'Kaja Foglio' }],
  } as any;
  const row = (artist: string, signatureTypeId: string, quantity: number, sigNotes = '') => ({ artist, signatureTypeId, quantity, sigNotes } as any);

  it('makes one slip per artist and signature type, in artist order, with notes on the color line', () => {
    const slots = slotsFromRows(order, [
      row('Kaja Foglio', 'sig', 1),
      row('Rebecca Guay', 'sig', 2, 'silver ink'),
      row('Rebecca Guay', 'sig', 1, 'silver ink'),
      row('Rebecca Guay', 'sketch', 1),
    ], 'alice.collects');
    expect(slots).toEqual([
      { name: 'alice.collects', artist: 'Rebecca Guay', quantity: 3, color: 'Signature, silver ink' },
      { name: 'alice.collects', artist: 'Rebecca Guay', quantity: 1, color: 'Sketch' },
      { name: 'alice.collects', artist: 'Kaja Foglio', quantity: 1, color: 'Signature' },
    ]);
  });

  it('heads pages with the order and organizer', () => {
    expect(groupOrderSheetHeader({ name: 'IX run', organizerDiscordName: 'card.runner' })).toBe('IX run · organizer card.runner');
    expect(groupOrderSheetHeader({ name: 'IX run', organizerDiscordName: null })).toBe('IX run');
  });
});
