import { FormEvent, useState } from "react";
import { Box, Button, InputAdornment, MenuItem, TextField } from "@mui/material";
import { useMutation } from "@apollo/client";
import { Printer } from "@phosphor-icons/react";
import {
  ADD_GROUP_ORDER_CUSTOM_ITEM,
  CHECK_IN_GROUP_ORDER_PACKAGE,
  CONFIRM_GROUP_ORDER_PAYMENT,
  RECORD_GROUP_ORDER_PAYMENT,
  REMOVE_GROUP_ORDER_CUSTOM_ITEM,
  REMOVE_GROUP_ORDER_PAYMENT,
  SET_GROUP_ORDER_RETURN_TRACKING,
  UPDATE_GROUP_ORDER_CUSTOM_ITEM,
} from "../graphql/mutations";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { groupOrderSheetHeader, printArtistSheet, slotsFromRows } from "../../utils/artistSheet";
import {
  CUSTOM_ITEM_STATUS_LABELS,
  CustomItem,
  CustomItemStatus,
  formatMoney,
  organizerCan,
  OrganizerGroupOrder as Order,
  parseAmount,
  Participant,
  paymentLabel,
  signatureTypeLabel,
} from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";
import { SummaryRow } from "./GroupOrderSummary";
import { ErrorMessage, formatShortDate, useAction } from "./GroupOrderParts";

const nameOf = (p: Participant) => p.discordName || p.displayName;

/** Everything the organizer manages for one participant after they join. */
const ParticipantDetail = ({ order, person }: { order: Order; person: Participant }) => {
  const rows = order.rows.filter((r) => r.participantId === person.id);
  const returnOption = order.returnOptions.find((o) => o.id === person.returnOptionId);
  const { run, error } = useAction();

  return (
    <Box sx={{ pt: 1, pb: 2 }}>
      <ErrorMessage>{error}</ErrorMessage>
      <Box component="dl" sx={styles.summaryList}>
        <SummaryRow label="Ready to ship">
          {person.readyToShipAt ? formatShortDate(person.readyToShipAt) : 'Not yet'}
          {person.sheetChanged && ' · cards changed since they printed their sheet'}
        </SummaryRow>
        <SummaryRow label="Their tracking">{person.inboundTracking || 'None yet'}</SummaryRow>
        <SummaryRow label="Package">
          {person.receivedAt ? `Received ${formatShortDate(person.receivedAt)}` : 'Not received'}
          {person.mismatchCount > 0 && ` · ${person.mismatchCount} counted differently`}
        </SummaryRow>
        <SummaryRow label="Return shipping">{returnOption ? `${returnOption.label} · ${formatMoney(returnOption.price)}` : 'Not chosen'}</SummaryRow>
        {person.notesToOrganizer && <SummaryRow label="Their notes"><Box component="span" sx={styles.longText}>{person.notesToOrganizer}</Box></SummaryRow>}
      </Box>

      {rows.length > 0 && (
        <Button startIcon={<Printer size={16} />} sx={[styles.smallButton, { mt: 2 }]} onClick={() => run(async () => {
          if (!printArtistSheet(slotsFromRows(order, rows, nameOf(person)), groupOrderSheetHeader(order))) {
            throw new Error('Your browser blocked the print window. Allow pop-ups for this site and try again.');
          }
        })}>
          Print their artist sheet
        </Button>
      )}

      {organizerCan('checkIn', order.status) && rows.length > 0 && <CheckInForm order={order} person={person} />}
      <PaymentsEditor order={order} person={person} />
      {organizerCan('returnTracking', order.status) && <ReturnTrackingForm person={person} />}
      <CustomItemsEditor order={order} person={person} />
    </Box>
  );
};

function CheckInForm({ order, person }: { order: Order; person: Participant }) {
  const [checkIn] = useMutation(CHECK_IN_GROUP_ORDER_PACKAGE);
  const { run, error, busy } = useAction();
  const rows = order.rows.filter((r) => r.participantId === person.id);
  const [counts, setCounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.rowId, String(r.receivedQuantity ?? r.quantity)])));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      const parsed = rows.map((r) => ({ rowId: r.rowId, receivedQuantity: Number(counts[r.rowId] ?? r.quantity) }));
      if (parsed.some((c) => !Number.isInteger(c.receivedQuantity) || c.receivedQuantity < 0)) throw new Error('Counts must be whole numbers.');
      await checkIn({ variables: { participantId: person.id, counts: parsed } });
    });
  };

  return (
    <Box component="form" onSubmit={submit} aria-label={`Check in ${nameOf(person)}'s package`} sx={{ mt: 3 }}>
      <MonoLabel tracking="tight" sx={{ display: 'block', mb: 1 }}>Check in their package</MonoLabel>
      <ErrorMessage>{error}</ErrorMessage>
      <Box sx={styles.gridScroll}>
        <Box component="table" sx={styles.gridTable}>
          <thead><tr><th scope="col">Card</th><th scope="col">Listed</th><th scope="col">Received</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rowId}>
                <Box component="th" scope="row" sx={{ whiteSpace: 'normal' }}>
                  {r.cardName || 'Unnamed card'}
                  <Box component="span" sx={[styles.personMeta, { display: 'block' }]}>{r.artist} · {signatureTypeLabel(order, r.signatureTypeId)}</Box>
                </Box>
                <td>{r.quantity}</td>
                <td>
                  <TextField size="small" value={counts[r.rowId] ?? ''} onChange={(e) => setCounts((c) => ({ ...c, [r.rowId]: e.target.value }))}
                    inputProps={{ inputMode: 'numeric', 'aria-label': `Received ${r.cardName || 'card'}` }} sx={[styles.cellInput, styles.capInput]} />
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
      <Button type="submit" disabled={busy} sx={[styles.secondaryButton, { mt: 2 }]}>
        {person.receivedAt ? 'Update counts' : 'Mark package received'}
      </Button>
    </Box>
  );
}

function PaymentsEditor({ order, person }: { order: Order; person: Participant }) {
  const [record] = useMutation(RECORD_GROUP_ORDER_PAYMENT);
  const [confirm] = useMutation(CONFIRM_GROUP_ORDER_PAYMENT);
  const [remove] = useMutation(REMOVE_GROUP_ORDER_PAYMENT);
  const { run, error, busy } = useAction();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const canRecord = organizerCan('recordPayment', order.status);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = parseAmount(amount);
    run(async () => {
      if (value === null) throw new Error('Enter an amount like 20, or -5 for a refund.');
      await record({ variables: { participantId: person.id, amount: value, note: note.trim() || null } });
      setAmount('');
      setNote('');
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <MonoLabel tracking="tight" sx={{ display: 'block', mb: 1 }}>Payments</MonoLabel>
      <ErrorMessage>{error}</ErrorMessage>
      {person.payments.length === 0 ? (
        <Box component="p" sx={styles.emptyText}>No payments yet.</Box>
      ) : (
        <Box component="ul" sx={styles.personList} aria-label={`${nameOf(person)}'s payments`}>
          {person.payments.map((p) => (
            <Box component="li" key={p.id} sx={styles.personRow}>
              <Box>
                <Box component="p" sx={styles.personName}>{paymentLabel(p)}</Box>
                <Box component="p" sx={styles.personMeta}>
                  {formatShortDate(p.createdAt)} · {p.source === 'participant' ? 'reported by them' : 'recorded by you'}{p.note ? ` · ${p.note}` : ''}
                </Box>
              </Box>
              {canRecord && (
                <Box sx={styles.personActions}>
                  {!p.confirmedAt && (
                    <Button disabled={busy} sx={styles.primaryButton} onClick={() => run(() => confirm({ variables: { participantId: person.id, paymentId: p.id } }))}>
                      Confirm
                    </Button>
                  )}
                  <Button disabled={busy} sx={styles.smallButton} onClick={() => {
                    if (window.confirm('Remove this payment entry?')) run(() => remove({ variables: { participantId: person.id, paymentId: p.id } }));
                  }}>
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
      {canRecord && (
        <Box component="form" onSubmit={submit} aria-label={`Record a payment from ${nameOf(person)}`} sx={[styles.addRow, { mt: 2 }]}>
          <TextField size="small" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount"
            inputProps={{ inputMode: 'decimal', 'aria-label': 'Payment amount' }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} sx={[styles.input, { width: 140 }]} />
          <TextField size="small" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note"
            inputProps={{ maxLength: 200, 'aria-label': 'Payment note' }} sx={[styles.input, { flex: '1 1 200px' }]} />
          <Button type="submit" disabled={busy || !amount.trim()} sx={styles.secondaryButton}>Record payment</Button>
        </Box>
      )}
      {canRecord && <Box component="p" sx={[styles.fieldHint, { mt: 1 }]}>Record money you received. Use a negative amount for a refund.</Box>}
    </Box>
  );
}

function ReturnTrackingForm({ person }: { person: Participant }) {
  const [setTracking] = useMutation(SET_GROUP_ORDER_RETURN_TRACKING);
  const { run, error, busy } = useAction();
  const [tracking, setDraft] = useState(person.returnTracking ?? '');

  return (
    <Box component="form" sx={{ mt: 3 }} aria-label={`Return tracking for ${nameOf(person)}`} onSubmit={(e: FormEvent) => {
      e.preventDefault();
      run(() => setTracking({ variables: { participantId: person.id, tracking } }));
    }}>
      <MonoLabel tracking="tight" sx={{ display: 'block', mb: 1 }}>Return tracking</MonoLabel>
      <ErrorMessage>{error}</ErrorMessage>
      <Box sx={[styles.addRow, { mt: 0 }]}>
        <TextField size="small" value={tracking} onChange={(e) => setDraft(e.target.value)} inputProps={{ maxLength: 100, 'aria-label': 'Return tracking number' }}
          sx={[styles.input, { flex: '1 1 220px' }]} />
        <Button type="submit" disabled={busy || tracking === (person.returnTracking ?? '')} sx={styles.secondaryButton}>Save</Button>
      </Box>
    </Box>
  );
}

const emptyItem = { label: '', artistName: '', quantity: '1', price: '', status: 'requested' as CustomItemStatus, note: '' };

/** Artist proofs, prints, playmats... bought for this participant. Organizer only. */
function CustomItemsEditor({ order, person }: { order: Order; person: Participant }) {
  const [addItem] = useMutation(ADD_GROUP_ORDER_CUSTOM_ITEM);
  const [updateItem] = useMutation(UPDATE_GROUP_ORDER_CUSTOM_ITEM);
  const [removeItem] = useMutation(REMOVE_GROUP_ORDER_CUSTOM_ITEM);
  const { run, error, busy } = useAction();
  const [draft, setDraft] = useState(emptyItem);
  const [editingId, setEditingId] = useState<string | null>(null);
  const canEdit = organizerCan('customItems', order.status);
  if (!canEdit && person.customItems.length === 0) return null;

  const edit = (item: CustomItem) => {
    setEditingId(item.id);
    setDraft({
      label: item.label, artistName: item.artistName ?? '', quantity: String(item.quantity),
      price: item.price === null ? '' : String(item.price), status: item.status, note: item.note ?? '',
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      const quantity = Number(draft.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Quantity must be a whole number of 1 or more.');
      const price = draft.price.trim() ? parseAmount(draft.price) : null;
      if (draft.price.trim() && (price === null || price < 0)) throw new Error('Enter a price like 15, or leave it blank while pending.');
      const item = { label: draft.label, artistName: draft.artistName || null, quantity, price, status: draft.status, note: draft.note || null };
      if (editingId) await updateItem({ variables: { participantId: person.id, itemId: editingId, item } });
      else await addItem({ variables: { participantId: person.id, item } });
      setEditingId(null);
      setDraft(emptyItem);
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <MonoLabel tracking="tight" sx={{ display: 'block', mb: 1 }}>Other items</MonoLabel>
      <ErrorMessage>{error}</ErrorMessage>
      {person.customItems.length > 0 && (
        <Box component="ul" sx={styles.personList} aria-label={`${nameOf(person)}'s other items`}>
          {person.customItems.map((item) => (
            <Box component="li" key={item.id} sx={styles.personRow}>
              <Box>
                <Box component="p" sx={styles.personName}>{item.label}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</Box>
                <Box component="p" sx={styles.personMeta}>
                  {[item.artistName, item.price === null ? 'Price pending' : `${formatMoney(item.price)} each`, CUSTOM_ITEM_STATUS_LABELS[item.status], item.note]
                    .filter(Boolean).join(' · ')}
                </Box>
              </Box>
              {canEdit && (
                <Box sx={styles.personActions}>
                  <Button sx={styles.smallButton} onClick={() => edit(item)} aria-label={`Edit ${item.label}`}>Edit</Button>
                  <Button disabled={busy} sx={styles.smallButton} aria-label={`Remove ${item.label}`} onClick={() => {
                    if (window.confirm(`Remove ${item.label}?`)) run(() => removeItem({ variables: { participantId: person.id, itemId: item.id } }));
                  }}>
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
      {canEdit && (
        <Box component="form" onSubmit={submit} aria-label={editingId ? 'Edit item' : `Add an item for ${nameOf(person)}`} sx={{ mt: 2 }}>
          <Box sx={styles.fieldRow}>
            <TextField size="small" label="Item" value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              placeholder="e.g. Lightning Bolt AP" inputProps={{ maxLength: 80 }} sx={styles.input} />
            <TextField select size="small" label="Artist" value={draft.artistName} onChange={(e) => setDraft((d) => ({ ...d, artistName: e.target.value }))}
              SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }} sx={styles.input}>
              <MenuItem value="">None</MenuItem>
              {order.artists.map((a) => <MenuItem key={a.name} value={a.name}>{a.name}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Quantity" value={draft.quantity} onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
              inputProps={{ inputMode: 'numeric' }} sx={styles.input} />
            <TextField size="small" label="Price each" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
              placeholder="Pending" InputLabelProps={{ shrink: true }} inputProps={{ inputMode: 'decimal' }} sx={styles.input} />
            <TextField select size="small" label="Status" value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as CustomItemStatus }))} sx={styles.input}>
              {(Object.keys(CUSTOM_ITEM_STATUS_LABELS) as CustomItemStatus[]).map((s) => <MenuItem key={s} value={s}>{CUSTOM_ITEM_STATUS_LABELS[s]}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={[styles.actions, { mt: 2 }]}>
            <Button type="submit" disabled={busy || !draft.label.trim()} sx={styles.secondaryButton}>{editingId ? 'Save item' : 'Add item'}</Button>
            {editingId && <Button onClick={() => { setEditingId(null); setDraft(emptyItem); }} sx={styles.textButton}>Cancel</Button>}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default ParticipantDetail;
