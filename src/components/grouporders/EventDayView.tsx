import { useState } from "react";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import { useMutation } from "@apollo/client";
import { Check, X } from "@phosphor-icons/react";
import { SET_GROUP_ORDER_ROW_STATUS, UPDATE_GROUP_ORDER_CUSTOM_ITEM } from "../graphql/mutations";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import {
  artistPickList,
  CUSTOM_ITEM_STATUS_LABELS,
  CustomItem,
  CustomItemStatus,
  NOT_SIGNED_REASONS,
  organizerCan,
  OrderRow,
  OrganizerGroupOrder as Order,
  ROW_STATUS_LABELS,
  RowStatus,
  signatureTypeLabel,
} from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";
import { ErrorMessage, useAction } from "./GroupOrderParts";

const OTHER_REASON = '__other__';

/**
 * The organizer's event-day screen: for each artist, whose cards are in that line and what to
 * buy at the table, with one-tap signed / not signed. Built for a phone at the convention.
 */
const EventDayView = ({ order }: { order: Order }) => {
  const [setRowStatus] = useMutation(SET_GROUP_ORDER_ROW_STATUS);
  const [updateItem] = useMutation(UPDATE_GROUP_ORDER_CUSTOM_ITEM);
  const { run, error, busy } = useAction();
  const [askingReason, setAskingReason] = useState<string[] | null>(null);
  const list = artistPickList(order);
  const canMark = organizerCan('markRows', order.status);
  const canBuy = organizerCan('customItems', order.status);

  const mark = (rowIds: string[], status: RowStatus, reason?: string) =>
    run(() => setRowStatus({ variables: { orderId: order.id, rowIds, status, reason: reason ?? null } }));

  const setItemStatus = (participantId: string, item: CustomItem, status: CustomItemStatus) =>
    run(() => updateItem({
      variables: {
        participantId,
        itemId: item.id,
        item: { label: item.label, artistName: item.artistName, quantity: item.quantity, price: item.price, status, note: item.note },
      },
    }));

  if (list.length === 0) {
    return <Box sx={styles.panel}><Box component="p" sx={[styles.sectionIntro, { mb: 0 }]}>No cards or items yet.</Box></Box>;
  }

  return (
    <Box sx={styles.sections}>
      {!canMark && (
        <Box sx={styles.notice}>Cards can be marked signed once the order is open, and until it's complete.</Box>
      )}
      <ErrorMessage>{error}</ErrorMessage>
      {askingReason && (
        <NotSignedReason
          count={askingReason.length}
          busy={busy}
          onCancel={() => setAskingReason(null)}
          onConfirm={(reason) => {
            mark(askingReason, 'not-signed', reason);
            setAskingReason(null);
          }}
        />
      )}

      {list.map((artist) => {
        const waitingIds = artist.people.flatMap((p) => p.rows.filter((r) => r.status === 'collecting').map((r) => r.rowId));
        return (
          <Box component="section" key={artist.name} aria-label={artist.name} sx={styles.panel}>
            <Box sx={styles.sectionHeader}>
              <Box component="h2" sx={styles.sectionTitle}>{artist.name}</Box>
              <MonoLabel tracking="tight">{artist.signed} signed · {artist.notSigned} not · {artist.waiting} waiting</MonoLabel>
            </Box>
            <Box component="p" sx={styles.sectionIntro}>
              {artist.cardCount} {artist.cardCount === 1 ? 'card' : 'cards'} from {artist.peopleCount} {artist.peopleCount === 1 ? 'person' : 'people'}
              {artist.byType.length > 0 && ` · ${artist.byType.map((t) => `${t.count} ${t.label}`).join(', ')}`}
              {artist.items.length > 0 && ` · buy ${artist.items.reduce((sum, i) => sum + i.item.quantity, 0)} ${artist.items.length === 1 ? 'item' : 'items'}`}
            </Box>

            {canMark && waitingIds.length > 0 && (
              <Button disabled={busy} startIcon={<Check size={16} />} sx={[styles.primaryButton, { mb: 2 }]}
                onClick={() => mark(waitingIds, 'signed')}>
                Mark all {waitingIds.length > 1 ? `${waitingIds.length} ` : ''}waiting signed
              </Button>
            )}

            {artist.people.map((person) => (
              <Box key={person.participantId ?? 'removed'} sx={{ mb: 2 }}>
                <MonoLabel tracking="tight" sx={{ display: 'block', mb: 0.5 }}>{person.label}</MonoLabel>
                <Box component="ul" sx={styles.personList}>
                  {person.rows.map((row) => (
                    <RowLine key={row.rowId} order={order} row={row} canMark={canMark} busy={busy}
                      onSigned={() => mark([row.rowId], 'signed')}
                      onNotSigned={() => setAskingReason([row.rowId])}
                      onUndo={() => mark([row.rowId], 'collecting')} />
                  ))}
                </Box>
              </Box>
            ))}

            {artist.items.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <MonoLabel tracking="tight" sx={{ display: 'block', mb: 0.5 }}>To buy at this table</MonoLabel>
                <Box component="ul" sx={styles.personList}>
                  {artist.items.map(({ participantId, label, item }) => (
                    <Box component="li" key={item.id} sx={styles.personRow}>
                      <Box>
                        <Box component="p" sx={styles.personName}>{item.label}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</Box>
                        <Box component="p" sx={styles.personMeta}>For {label} · {CUSTOM_ITEM_STATUS_LABELS[item.status]}</Box>
                      </Box>
                      {canBuy && (
                        <Box sx={styles.personActions}>
                          {item.status !== 'purchased' && (
                            <Button disabled={busy} sx={styles.primaryButton} onClick={() => setItemStatus(participantId, item, 'purchased')}
                              aria-label={`Bought ${item.label} for ${label}`}>
                              Bought
                            </Button>
                          )}
                          {item.status !== 'unavailable' && (
                            <Button disabled={busy} sx={styles.smallButton} onClick={() => setItemStatus(participantId, item, 'unavailable')}
                              aria-label={`${item.label} for ${label} unavailable`}>
                              Unavailable
                            </Button>
                          )}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

function RowLine({ order, row, canMark, busy, onSigned, onNotSigned, onUndo }: {
  order: Order; row: OrderRow; canMark: boolean; busy: boolean;
  onSigned: () => void; onNotSigned: () => void; onUndo: () => void;
}) {
  const name = row.cardName || 'Unnamed card';
  return (
    <Box component="li" sx={styles.personRow}>
      <Box>
        <Box component="p" sx={styles.personName}>{name}{row.quantity > 1 ? ` ×${row.quantity}` : ''}</Box>
        <Box component="p" sx={styles.personMeta}>
          {[signatureTypeLabel(order, row.signatureTypeId), row.sigNotes, row.status !== 'collecting' && ROW_STATUS_LABELS[row.status], row.notSignedReason]
            .filter(Boolean).join(' · ')}
        </Box>
      </Box>
      {canMark && (
        <Box sx={styles.personActions}>
          {row.status === 'collecting' ? (
            <>
              <Button disabled={busy} startIcon={<Check size={14} />} sx={styles.primaryButton} onClick={onSigned} aria-label={`${name} signed`}>Signed</Button>
              <Button disabled={busy} startIcon={<X size={14} />} sx={styles.smallButton} onClick={onNotSigned} aria-label={`${name} not signed`}>Not signed</Button>
            </>
          ) : (
            <Button disabled={busy} sx={styles.textButton} onClick={onUndo} aria-label={`Undo ${name}`}>Undo</Button>
          )}
        </Box>
      )}
    </Box>
  );
}

/** Asks why cards weren't signed; they drop out of the person's bill. */
function NotSignedReason({ count, busy, onConfirm, onCancel }: { count: number; busy: boolean; onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [choice, setChoice] = useState(NOT_SIGNED_REASONS[0]);
  const [other, setOther] = useState('');
  const reason = choice === OTHER_REASON ? other.trim() : choice;

  return (
    <Box role="dialog" aria-label="Why weren't they signed?" sx={[styles.panel, { borderColor: 'var(--line-strong)' }]}>
      <Box component="h2" sx={[styles.sectionTitle, { mb: 1 }]}>Why {count === 1 ? "wasn't it" : "weren't they"} signed?</Box>
      <Box component="p" sx={styles.sectionIntro}>Not-signed cards come off the person's bill, and they'll see the reason.</Box>
      <Box sx={styles.fieldRow}>
        <TextField select size="small" label="Reason" value={choice} onChange={(e) => setChoice(e.target.value)} sx={styles.input}>
          {NOT_SIGNED_REASONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          <MenuItem value={OTHER_REASON}>Something else…</MenuItem>
        </TextField>
        {choice === OTHER_REASON && (
          <TextField size="small" label="Reason" value={other} onChange={(e) => setOther(e.target.value)} inputProps={{ maxLength: 100 }} sx={styles.input} />
        )}
      </Box>
      <Box sx={[styles.actions, { mt: 2 }]}>
        <Button disabled={busy || !reason} onClick={() => onConfirm(reason)} sx={styles.primaryButton}>Mark not signed</Button>
        <Button onClick={onCancel} sx={styles.secondaryButton}>Cancel</Button>
      </Box>
    </Box>
  );
}

export default EventDayView;
