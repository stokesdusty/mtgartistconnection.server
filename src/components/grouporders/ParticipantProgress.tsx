import { FormEvent, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, InputAdornment, MenuItem, TextField } from "@mui/material";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { PencilSimple, Printer } from "@phosphor-icons/react";
import {
  MARK_GROUP_ORDER_READY_TO_SHIP,
  REPORT_GROUP_ORDER_PAYMENT,
  SET_GROUP_ORDER_EMAIL_OPT_OUT,
  SET_GROUP_ORDER_INBOUND_TRACKING,
  SET_GROUP_ORDER_RETURN_OPTION,
  UPDATE_GROUP_ORDER_NOTES,
  WITHDRAW_GROUP_ORDER_PAYMENT,
} from "../graphql/mutations";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { groupOrderSheetHeader, printArtistSheet, slotsFromRows } from "../../utils/artistSheet";
import {
  CUSTOM_ITEM_STATUS_LABELS,
  formatMoney,
  ParticipantGroupOrder as Order,
  parseAmount,
  paymentLabel,
} from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";
import { ErrorMessage, formatShortDate, useAction } from "./GroupOrderParts";

const POPUP_BLOCKED = 'Your browser blocked the print window. Allow pop-ups for this site and try again.';

/** Packing and shipping: ready to ship (with the artist sheet), tracking, and return shipping. */
export function ShippingPanel({ order }: { order: Order }) {
  const navigate = useNavigate();
  const [markReady] = useMutation(MARK_GROUP_ORDER_READY_TO_SHIP);
  const [setInbound] = useMutation(SET_GROUP_ORDER_INBOUND_TRACKING);
  const [setReturnOption] = useMutation(SET_GROUP_ORDER_RETURN_OPTION);
  const { run, error, busy } = useAction();
  const { me } = order;
  const [tracking, setTracking] = useState(me.inboundTracking ?? '');

  const canShip = order.status === 'open' || order.status === 'closed';
  const slots = slotsFromRows(order, order.rows, me.discordName || me.displayName);
  const header = groupOrderSheetHeader(order);
  const returnOption = order.returnOptions.find((o) => o.id === me.returnOptionId);

  // The print window has to open straight from the click, before any request, or browsers block it.
  const printSheet = (thenMarkReady: boolean) => run(async () => {
    if (!printArtistSheet(slots, header)) throw new Error(POPUP_BLOCKED);
    if (thenMarkReady) await markReady({ variables: { orderId: order.id } });
  });

  return (
    <Box component="section" aria-labelledby="my-shipping" sx={styles.panel}>
      <Box sx={styles.sectionHeader}>
        <Box component="h2" id="my-shipping" sx={styles.sectionTitle}>Ship your cards</Box>
        {me.receivedAt && <Box component="span" sx={styles.pillAccent}>Received {formatShortDate(me.receivedAt)}</Box>}
      </Box>
      <Box component="p" sx={styles.sectionIntro}>
        {me.readyToShipAt
          ? `Marked ready to ship ${formatShortDate(me.readyToShipAt)}. Put your printed artist sheet in the package so the organizer can sort your cards.`
          : "When your cards are packed, mark them ready to ship. You'll print an artist sheet to put in the package."}
      </Box>
      <ErrorMessage>{error}</ErrorMessage>

      {me.mismatchCount > 0 && (
        <Box role="alert" sx={[styles.message, styles.messageError]}>
          The organizer counted {me.mismatchCount === 1 ? 'one of your cards' : `${me.mismatchCount} of your cards`} differently
          from your list. Check the Received column in your cards, then message them.
        </Box>
      )}
      {me.sheetChanged && !me.receivedAt && (
        <Box sx={styles.notice}>Your cards changed since you printed your artist sheet. Reprint it before you ship.</Box>
      )}

      <Box sx={[styles.actions, { mb: 3 }]}>
        {!me.readyToShipAt ? (
          <Button disabled={busy || !canShip || order.rows.length === 0} onClick={() => printSheet(true)} startIcon={<Printer size={16} />}
            sx={styles.primaryButton}>
            Ready to ship: print my artist sheet
          </Button>
        ) : (
          <>
            <Button disabled={busy} startIcon={<Printer size={16} />} onClick={() => printSheet(me.sheetChanged && canShip)}
              sx={me.sheetChanged ? styles.primaryButton : styles.secondaryButton}>
              {me.sheetChanged ? 'Reprint artist sheet' : 'Print artist sheet'}
            </Button>
            <Button startIcon={<PencilSimple size={16} />} onClick={() => navigate('/artistsheet', { state: { slots, header } })} sx={styles.secondaryButton}>
              Edit in Artist Sheet Generator
            </Button>
          </>
        )}
      </Box>

      <Box sx={styles.fieldRow}>
        <Box component="form" sx={styles.field} onSubmit={(e: FormEvent) => {
          e.preventDefault();
          run(() => setInbound({ variables: { orderId: order.id, tracking } }));
        }}>
          <Box component="label" htmlFor="my-tracking"><MonoLabel tracking="tight">Your tracking number</MonoLabel></Box>
          <Box sx={[styles.addRow, { mt: 0 }]}>
            <TextField id="my-tracking" size="small" value={tracking} onChange={(e) => setTracking(e.target.value)} disabled={!canShip}
              inputProps={{ maxLength: 100 }} sx={[styles.input, { flex: '1 1 180px' }]} />
            {canShip && <Button type="submit" disabled={busy || tracking === (me.inboundTracking ?? '')} sx={styles.smallButton}>Save</Button>}
          </Box>
        </Box>

        {order.returnOptions.length > 0 && (
          <Box sx={styles.field}>
            <Box component="label" htmlFor="my-return"><MonoLabel tracking="tight">Return shipping</MonoLabel></Box>
            <TextField id="my-return" select size="small" value={me.returnOptionId ?? ''} disabled={!canShip || busy}
              onChange={(e) => run(() => setReturnOption({ variables: { orderId: order.id, returnOptionId: e.target.value || null } }))}
              SelectProps={{ displayEmpty: true }} sx={styles.input}>
              <MenuItem value="">Choose one</MenuItem>
              {order.returnOptions.map((o) => <MenuItem key={o.id} value={o.id}>{o.label} · {formatMoney(o.price)}</MenuItem>)}
            </TextField>
          </Box>
        )}
      </Box>

      {me.returnTracking && (
        <Box sx={[styles.notice, { mt: 2, mb: 0 }]}>
          Your cards are on their way back{returnOption ? ` by ${returnOption.label.toLowerCase()}` : ''}. Tracking: <strong>{me.returnTracking}</strong>
        </Box>
      )}
    </Box>
  );
}

/** Their payment history, plus reporting a payment for the organizer to confirm. */
export function PaymentsSection({ order }: { order: Order }) {
  const [report] = useMutation(REPORT_GROUP_ORDER_PAYMENT);
  const [withdraw] = useMutation(WITHDRAW_GROUP_ORDER_PAYMENT);
  const { run, error, busy } = useAction();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const canReport = !['draft', 'cancelled'].includes(order.status);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = parseAmount(amount);
    run(async () => {
      if (value === null || value < 0) throw new Error('Enter the amount you sent, like 20 or 12.50.');
      await report({ variables: { orderId: order.id, amount: value, note: note.trim() || null } });
      setAmount('');
      setNote('');
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <MonoLabel tracking="tight" sx={{ display: 'block', mb: 1 }}>Payments</MonoLabel>
      <ErrorMessage>{error}</ErrorMessage>
      {order.me.payments.length === 0 ? (
        <Box component="p" sx={styles.emptyText}>No payments yet.</Box>
      ) : (
        <Box component="ul" sx={styles.personList} aria-label="Your payments">
          {order.me.payments.map((p) => (
            <Box component="li" key={p.id} sx={styles.personRow}>
              <Box>
                <Box component="p" sx={styles.personName}>{paymentLabel(p)}</Box>
                <Box component="p" sx={styles.personMeta}>
                  {formatShortDate(p.createdAt)}{p.source === 'organizer' ? ' · recorded by the organizer' : ''}{p.note ? ` · ${p.note}` : ''}
                </Box>
              </Box>
              {p.source === 'participant' && !p.confirmedAt && (
                <Button disabled={busy} sx={styles.smallButton} onClick={() => run(() => withdraw({ variables: { orderId: order.id, paymentId: p.id } }))}>
                  Withdraw
                </Button>
              )}
            </Box>
          ))}
        </Box>
      )}
      {canReport && (
        <Box component="form" onSubmit={submit} aria-label="Report a payment" sx={[styles.addRow, { mt: 2 }]}>
          <TextField size="small" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount"
            inputProps={{ inputMode: 'decimal', 'aria-label': 'Amount you sent' }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} sx={[styles.input, { width: 140 }]} />
          <TextField size="small" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note, e.g. PayPal transaction ID"
            inputProps={{ maxLength: 200, 'aria-label': 'Payment note' }} sx={[styles.input, { flex: '1 1 220px' }]} />
          <Button type="submit" disabled={busy || !amount.trim()} sx={styles.secondaryButton}>Report payment</Button>
        </Box>
      )}
    </Box>
  );
}

/** Artist proofs and other things the organizer is buying for them. Organizer-managed, read-only here. */
export function ItemsSection({ order }: { order: Order }) {
  if (order.me.customItems.length === 0) return null;
  return (
    <Box sx={{ mt: 3 }}>
      <MonoLabel tracking="tight" sx={{ display: 'block', mb: 1 }}>Other items</MonoLabel>
      <Box component="ul" sx={styles.personList} aria-label="Other items">
        {order.me.customItems.map((item) => (
          <Box component="li" key={item.id} sx={styles.personRow}>
            <Box>
              <Box component="p" sx={styles.personName}>{item.label}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</Box>
              <Box component="p" sx={styles.personMeta}>
                {[item.artistName, item.price === null ? 'Price pending' : `${formatMoney(item.price)} each`, item.note].filter(Boolean).join(' · ')}
              </Box>
            </Box>
            <Box component="span" sx={item.status === 'purchased' ? styles.pillAccent : styles.pill}>{CUSTOM_ITEM_STATUS_LABELS[item.status]}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Free text for the organizer, e.g. asking them to buy artist proofs. */
export function NotesPanel({ order }: { order: Order }) {
  const [updateNotes] = useMutation(UPDATE_GROUP_ORDER_NOTES);
  const { run, error, busy } = useAction();
  const [notes, setNotes] = useState(order.me.notesToOrganizer ?? '');
  const [saved, setSaved] = useState(false);
  const canEdit = ['open', 'closed', 'at-event', 'returning'].includes(order.status);

  return (
    <Box component="form" aria-labelledby="my-notes" sx={styles.panel} onSubmit={(e: FormEvent) => {
      e.preventDefault();
      run(async () => {
        await updateNotes({ variables: { orderId: order.id, notes } });
        setSaved(true);
      });
    }}>
      <Box component="h2" id="my-notes" sx={[styles.sectionTitle, { mb: 1 }]}>Notes to the organizer</Box>
      <Box component="p" sx={styles.sectionIntro}>Only the organizer sees these. Ask for artist proofs or prints here, or anything else they should know.</Box>
      <ErrorMessage>{error}</ErrorMessage>
      <TextField multiline minRows={2} fullWidth value={notes} disabled={!canEdit}
        onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
        inputProps={{ maxLength: 1000, 'aria-label': 'Notes to the organizer' }} sx={[styles.input, { mb: 2 }]} />
      {canEdit && (
        <Box sx={styles.actions}>
          <Button type="submit" disabled={busy || notes === (order.me.notesToOrganizer ?? '')} sx={styles.secondaryButton}>Save notes</Button>
          {saved && <Box component="span" role="status" sx={styles.fieldHint}>Saved</Box>}
        </Box>
      )}
    </Box>
  );
}

/** Per-order email opt-out. Works for participants and organizers alike. */
export function EmailPreference({ orderId, optedOut, label }: { orderId: string; optedOut: boolean; label: string }) {
  const [setOptOut] = useMutation(SET_GROUP_ORDER_EMAIL_OPT_OUT);
  const { run, error, busy } = useAction();
  const [on, setOn] = useState(!optedOut);

  return (
    <Box>
      <ErrorMessage>{error}</ErrorMessage>
      <FormControlLabel
        control={<Checkbox checked={on} disabled={busy} onChange={(e) => {
          const next = e.target.checked;
          run(async () => {
            await setOptOut({ variables: { orderId, optOut: !next } });
            setOn(next);
          });
        }} />}
        label={label}
        sx={[styles.checkboxRow, { mb: 0 }]}
      />
    </Box>
  );
}
