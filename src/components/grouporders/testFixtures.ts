// Group order objects shaped exactly like the GraphQL responses, for MockedProvider.

export const balance = {
  cardsTotal: 15, customItemsTotal: 0, fee: 2, returnShipping: 0, pendingCount: 0,
  due: 17, confirmedPaid: 0, reportedPaid: 0, remaining: 17, status: 'unpaid',
};

export const participant = (id: string, status: string, extra: Record<string, unknown> = {}) => ({
  id, isGuest: false, displayName: `${id} name`, discordName: `${id}_discord`, status, cardCount: 3,
  createdAt: '2099-09-01T12:00:00.000Z', balance,
  readyToShipAt: null, sheetChanged: false, inboundTracking: '', receivedAt: null, mismatchCount: 0, returnOptionId: null,
  returnTracking: '', notesToOrganizer: '', emailOptOut: false, payments: [], customItems: [],
  ...extra,
});

export const row = (rowId: string, participantId: string, extra: Record<string, unknown> = {}) => ({
  rowId, cardName: "Gaea's Liege", quantity: 2, set: 'lea', foil: 'non-foil', artist: 'Rebecca Guay', signatureTypeId: 'sig',
  sigNotes: '', owner: `${participantId}_discord`, participantId, status: 'collecting', notSignedReason: '', receivedQuantity: null, ...extra,
});

export const order = {
  id: 'o1',
  name: 'IX run',
  status: 'open',
  paymentTiming: 'upfront',
  paymentDue: true,
  disabled: false,
  disabledReason: null,
  eventId: 'e1',
  event: { id: 'e1', name: 'IX Art Show', city: 'Reading, PA', startDate: '2099-10-21T12:00:00', endDate: '2099-10-24T12:00:00' },
  organizerDiscordName: 'runner',
  publicTerms: 'Cards back within 3 weeks.',
  cutoff: null,
  maxCardsPerParticipant: 20,
  participantFee: 2,
  returnOptions: [{ id: 'pwe', label: 'Plain envelope', price: 1 }],
  signatureTypes: [{ id: 'sig', label: 'Signature' }, { id: 'sketch', label: 'Sketch' }],
  artists: [
    { name: 'Rebecca Guay', cap: 10, used: 4, remaining: 6, prices: [{ signatureTypeId: 'sig', price: 5 }, { signatureTypeId: 'sketch', price: null }] },
    { name: 'Kaja Foglio', cap: null, used: 0, remaining: null, prices: [{ signatureTypeId: 'sig', price: 3 }] },
  ],
};

export const organizerOrder = (extra: Record<string, unknown> = {}) => ({
  ...order,
  savedStatus: order.status,
  organizerEmailOptOut: false,
  inviteToken: 'tok123',
  privateInstructions: 'Ship to 123 Main Street.',
  rows: [row('r1', 'alice')],
  participants: [participant('alice', 'approved'), participant('bob', 'requested', { discordName: null })],
  ...extra,
});

export const participantOrder = (status = 'approved', extra: Record<string, unknown> = {}) => ({
  ...order,
  privateInstructions: status === 'approved' ? 'Ship to 123 Main Street.' : null,
  rows: status === 'approved' ? [row('r1', 'me')] : [],
  me: participant('me', status),
  ...extra,
});
