import {
  shareUrl,
  organizerCan,
  artistPickList,
  paymentLabel,
  parseAmount,
  balanceLabel,
  cellLabel,
  discordNameError,
  emptySettingsForm,
  formatMoney,
  formFromOrder,
  newArtistRow,
  offeredTypes,
  rowPriceLabel,
  signatureTypeLabel,
  OrganizerGroupOrder,
  settingsInputFromForm,
  SettingsForm,
} from './groupOrders';

const balance = (status: any, remaining: number | null) => ({
  cardsTotal: 0, customItemsTotal: 0, fee: 0, returnShipping: 0, pendingCount: 0,
  due: remaining, confirmedPaid: 0, reportedPaid: 0, remaining, status,
});

describe('labels', () => {
  it('formats whole and fractional dollars', () => {
    expect(formatMoney(5)).toBe('$5');
    expect(formatMoney(7.5)).toBe('$7.50');
  });

  it('shows grid cells as a price, TBD, or not offered', () => {
    const artist = { prices: [{ signatureTypeId: 'sig', price: 5 }, { signatureTypeId: 'sketch', price: null }] };
    expect(cellLabel(artist, 'sig')).toBe('$5');
    expect(cellLabel(artist, 'sketch')).toBe('TBD');
    expect(cellLabel(artist, 'doodle')).toBe('—');
  });

  it('describes balances', () => {
    expect(balanceLabel(balance('pending', null))).toBe('Price pending');
    expect(balanceLabel(balance('unpaid', 20))).toBe('Owes $20');
    expect(balanceLabel(balance('partial', 7.5))).toBe('Owes $7.50 more');
    expect(balanceLabel(balance('paid', 0))).toBe('Paid');
    expect(balanceLabel(balance('overpaid', -4))).toBe('Owed $4 back');
  });
});

describe('discordNameError', () => {
  it.each(['', 'card.runner', '@Card_Runner', 'Old Name#1234'])('accepts %p', (name) => {
    expect(discordNameError(name)).toBeNull();
  });

  it.each(['a', 'has space', 'two..dots'])('rejects %p', (name) => {
    expect(discordNameError(name)).toMatch('Discord names');
  });
});

describe('settingsInputFromForm', () => {
  const form: SettingsForm = {
    ...emptySettingsForm('runner'),
    name: ' IX run ',
    eventId: 'e1',
    signatureTypes: [{ id: 'sig', label: 'Signature' }, { id: 'sketch', label: 'Sketch' }],
    artists: [{ name: 'Rebecca Guay', cap: '10', cells: { sig: '5', sketch: '' } }, { name: 'Kaja Foglio', cap: '', cells: { sig: '$3.50' } }],
    participantFee: '2',
    returnOptions: [{ id: 'pwe', label: 'Plain envelope', price: '1' }],
    cutoff: '2026-11-01',
    paymentTiming: 'after-signing',
  };

  it('converts prices, TBD cells and not-offered cells', () => {
    const result = settingsInputFromForm(form);
    if (!('input' in result)) throw new Error(result.error);
    expect(result.input.name).toBe('IX run');
    expect(result.input.settings.artists).toEqual([
      { name: 'Rebecca Guay', cap: 10, prices: [{ signatureTypeId: 'sig', price: 5 }, { signatureTypeId: 'sketch', price: null }] },
      { name: 'Kaja Foglio', cap: null, prices: [{ signatureTypeId: 'sig', price: 3.5 }] },
    ]);
    expect(result.input.settings).toMatchObject({ participantFee: 2, maxCardsPerParticipant: null, paymentTiming: 'after-signing' });
  });

  it('counts the whole cutoff day in local time', () => {
    const result = settingsInputFromForm(form);
    if (!('input' in result)) throw new Error(result.error);
    const cutoff = new Date(result.input.settings.cutoff!);
    expect([cutoff.getFullYear(), cutoff.getMonth(), cutoff.getDate(), cutoff.getHours()]).toEqual([2026, 10, 1, 23]);
  });

  it('drops cells for signature types that were removed', () => {
    const result = settingsInputFromForm({ ...form, signatureTypes: [form.signatureTypes[0]] });
    if (!('input' in result)) throw new Error(result.error);
    expect(result.input.settings.artists[0].prices).toEqual([{ signatureTypeId: 'sig', price: 5 }]);
  });

  it.each([
    [{ name: ' ' }, 'name'],
    [{ artists: [] }, 'at least one artist'],
    [{ paymentTiming: '' as const }, 'when participants pay'],
    [{ participantFee: 'two' }, 'per-person fee'],
    [{ maxCardsPerParticipant: '2.5' }, 'Cards per person'],
    [{ artists: [{ name: 'Guay', cap: '', cells: { sig: 'free' } }] }, "Guay's prices"],
    [{ organizerDiscordName: 'has space' }, 'Discord names'],
  ])('reports %j', (override, message) => {
    const result = settingsInputFromForm({ ...form, ...override });
    expect('error' in result && result.error).toMatch(message);
  });
});

describe('formFromOrder', () => {
  it('round-trips an order back into the same input', () => {
    const order = {
      id: 'o1', name: 'IX run', eventId: 'e1', status: 'open', savedStatus: 'open', paymentTiming: 'upfront',
      signatureTypes: [{ id: 'sig', label: 'Signature' }],
      artists: [{ name: 'Rebecca Guay', cap: null, used: 0, remaining: null, prices: [{ signatureTypeId: 'sig', price: null }] }],
      participantFee: 0, returnOptions: [{ id: 'pwe', label: 'Plain envelope', price: 1 }],
      cutoff: null, maxCardsPerParticipant: 20, publicTerms: 'Terms', privateInstructions: 'Ship to me', organizerDiscordName: 'runner',
    } as unknown as OrganizerGroupOrder;
    const form = formFromOrder(order);
    expect(form.artists[0].cells).toEqual({ sig: '' });
    const result = settingsInputFromForm(form);
    if (!('input' in result)) throw new Error(result.error);
    expect(result.input.settings).toMatchObject({
      artists: [{ name: 'Rebecca Guay', cap: null, prices: [{ signatureTypeId: 'sig', price: null }] }],
      returnOptions: [{ id: 'pwe', label: 'Plain envelope', price: 1 }],
      maxCardsPerParticipant: 20, cutoff: null, paymentTiming: 'upfront', privateInstructions: 'Ship to me',
    });
  });
});

describe('newArtistRow', () => {
  it('offers every signature type at TBD', () => {
    expect(newArtistRow('Guay', [{ id: 'sig', label: 'Signature' }, { id: 'sketch', label: 'Sketch' }]).cells).toEqual({ sig: '', sketch: '' });
  });
});

describe('card helpers', () => {
  const order = {
    signatureTypes: [{ id: 'sig', label: 'Signature' }, { id: 'sketch', label: 'Sketch' }],
    artists: [{ name: 'Rebecca Guay', cap: null, used: 0, remaining: null, prices: [{ signatureTypeId: 'sig', price: 5 }, { signatureTypeId: 'sketch', price: null }] },
      { name: 'Kaja Foglio', cap: null, used: 0, remaining: null, prices: [{ signatureTypeId: 'sig', price: 3 }] }],
  };

  it('lists only the signature types an artist offers, with prices', () => {
    expect(offeredTypes(order, 'Rebecca Guay').map((t) => [t.label, t.priceLabel])).toEqual([['Signature', '$5'], ['Sketch', 'TBD']]);
    expect(offeredTypes(order, 'Kaja Foglio').map((t) => t.id)).toEqual(['sig']);
    expect(offeredTypes(order, 'Nobody')).toEqual([]);
  });

  it("prices a card from the grid, or shows — once its cell is gone", () => {
    expect(rowPriceLabel(order, { artist: 'Kaja Foglio', signatureTypeId: 'sig' })).toBe('$3');
    expect(rowPriceLabel(order, { artist: 'Kaja Foglio', signatureTypeId: 'sketch' })).toBe('—');
    expect(signatureTypeLabel(order, 'gone')).toBe('Removed type');
  });
});

describe('payments helpers', () => {
  const payment = (amount: number, confirmedAt: string | null = null) => ({ id: 'p', amount, note: null, source: 'participant' as const, createdAt: null, confirmedAt });

  it('labels reports, confirmations and refunds', () => {
    expect(paymentLabel(payment(15))).toBe('$15 · waiting for the organizer');
    expect(paymentLabel(payment(15, '2026-10-01'))).toBe('$15 · confirmed');
    expect(paymentLabel(payment(-4.5, '2026-10-01'))).toBe('$4.50 refund');
  });

  it.each([['20', 20], ['$7.50', 7.5], ['-3', -3], ['-$3', -3]])('parses %p', (text, value) => {
    expect(parseAmount(text)).toBe(value);
  });

  it.each(['', '0', 'ten', '1.234', '$'])('rejects %p', (text) => {
    expect(parseAmount(text)).toBeNull();
  });
});

describe('artistPickList', () => {
  const row = (rowId: string, participantId: string, artist: string, signatureTypeId: string, quantity: number, status = 'collecting') => ({
    rowId, participantId, artist, signatureTypeId, quantity, status, cardName: '', set: '', foil: 'non-foil', sigNotes: '', owner: '',
    notSignedReason: null, receivedQuantity: null,
  });
  const person = (id: string, discordName: string | null, customItems: any[] = []) => ({ id, discordName, displayName: `${id} name`, customItems });
  const order = {
    signatureTypes: [{ id: 'sig', label: 'Signature' }, { id: 'sketch', label: 'Sketch' }],
    artists: [{ name: 'Rebecca Guay' }, { name: 'Kaja Foglio' }, { name: 'Seb McKinnon' }, { name: 'Mark Tedin' }],
    participants: [
      person('a', 'zed.collects'),
      person('b', null, [{ id: 'i1', label: 'Bolt AP', artistName: 'Seb McKinnon', quantity: 2, price: null, status: 'requested', note: null }]),
    ],
    rows: [
      row('r1', 'a', 'Rebecca Guay', 'sig', 2, 'signed'),
      row('r2', 'b', 'Rebecca Guay', 'sketch', 1),
      row('r3', 'a', 'Rebecca Guay', 'sig', 1, 'not-signed'),
      row('r4', 'b', 'Kaja Foglio', 'sig', 3),
    ],
  } as any;

  it('groups each artist\'s line by person, with type counts and progress', () => {
    const [guay, foglio] = artistPickList(order);
    expect(guay).toMatchObject({
      name: 'Rebecca Guay', cardCount: 4, peopleCount: 2, waiting: 1, signed: 2, notSigned: 1,
      byType: [{ label: 'Signature', count: 3 }, { label: 'Sketch', count: 1 }],
    });
    // Sorted by the name the organizer knows them by: Discord name, else display name.
    expect(guay.people.map((p) => [p.label, p.rows.map((r) => r.rowId)])).toEqual([['b name', ['r2']], ['zed.collects', ['r1', 'r3']]]);
    expect(foglio).toMatchObject({ cardCount: 3, waiting: 3 });
  });

  it('lists things to buy at an artist with no cards, and skips artists with nothing', () => {
    const list = artistPickList(order);
    expect(list.map((a) => a.name)).toEqual(['Rebecca Guay', 'Kaja Foglio', 'Seb McKinnon']);
    expect(list[2]).toMatchObject({ cardCount: 0, items: [{ participantId: 'b', label: 'b name', item: { label: 'Bolt AP' } }] });
  });
});

describe('organizerCan', () => {
  it('matches the stages the webservice allows', () => {
    expect(organizerCan('checkIn', 'draft')).toBe(false);
    expect(organizerCan('checkIn', 'at-event')).toBe(true);
    expect(organizerCan('checkIn', 'returning')).toBe(false);
    expect(organizerCan('returnTracking', 'closed')).toBe(false);
    expect(organizerCan('recordPayment', 'cancelled')).toBe(true);
  });
});

describe('shareUrl', () => {
  it('points at the webservice preview page', () => {
    expect(shareUrl('tok')).toBe('https://mtgartistconnectionwebservice-production.up.railway.app/share/group-order/tok');
  });
});
