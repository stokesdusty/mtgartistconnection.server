import { FormEvent, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, MenuItem, TextField } from "@mui/material";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { GroupOrder, offeredTypes, OrderRow, ROW_STATUS_LABELS, RowInput, rowPriceLabel, signatureTypeLabel } from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";
import { ErrorMessage, useAction } from "./GroupOrderParts";

export interface Person { id: string; label: string }

interface Props {
  order: GroupOrder;
  rows: OrderRow[];
  canEdit: boolean;
  /** Organizer view: shows whose card each is, and asks whose card is being added. */
  people?: Person[];
  onAdd: (row: RowInput, participantId?: string) => Promise<unknown>;
  onUpdate: (rowId: string, row: RowInput) => Promise<unknown>;
  onRemove: (rowId: string) => Promise<unknown>;
  emptyText: string;
}

const emptyDraft = (artist = '', signatureTypeId = '') => ({
  artist, signatureTypeId, quantity: '1', cardName: '', set: '', foil: false, sigNotes: '',
});
type Draft = ReturnType<typeof emptyDraft>;

const draftFromRow = (row: OrderRow): Draft => ({
  artist: row.artist,
  signatureTypeId: row.signatureTypeId,
  quantity: String(row.quantity),
  cardName: row.cardName ?? '',
  set: row.set ?? '',
  foil: row.foil === 'foil',
  sigNotes: row.sigNotes ?? '',
});

/** A table of cards plus an add/edit form. Prices always come from the order's grid. */
const CardsEditor = ({ order, rows, canEdit, people, onAdd, onUpdate, onRemove, emptyText }: Props) => {
  const { run, error, busy } = useAction();
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [personId, setPersonId] = useState('');

  const types = offeredTypes(order, draft.artist);
  // Once cards are checked in or marked at the event, show how each one did.
  const showProgress = rows.some((r) => (r.status && r.status !== 'collecting') || r.receivedQuantity != null);
  const personLabel = (id: string | null) => people?.find((p) => p.id === id)?.label ?? 'Removed';
  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const pickArtist = (artist: string) => {
    // Keep the signature type when the new artist offers it too, else take their first.
    const offered = offeredTypes(order, artist);
    update({ artist, signatureTypeId: offered.some((t) => t.id === draft.signatureTypeId) ? draft.signatureTypeId : offered[0]?.id ?? '' });
  };

  const startEdit = (row: OrderRow) => {
    setEditingId(row.rowId);
    setDraft(draftFromRow(row));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const quantity = Number(draft.quantity);
    const input: RowInput = {
      artist: draft.artist,
      signatureTypeId: draft.signatureTypeId,
      quantity,
      cardName: draft.cardName.trim(),
      set: draft.set.trim(),
      foil: draft.foil ? 'foil' : 'non-foil',
      sigNotes: draft.sigNotes.trim(),
    };
    run(async () => {
      if (!input.artist || !input.signatureTypeId) throw new Error('Pick an artist and a signature type.');
      if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Quantity must be a whole number of 1 or more.');
      if (editingId) {
        await onUpdate(editingId, input);
        cancelEdit();
      } else {
        if (people && !personId) throw new Error('Pick whose card this is.');
        await onAdd(input, people ? personId : undefined);
        // Ready for the next card from the same artist.
        setDraft(emptyDraft(input.artist, input.signatureTypeId));
      }
    });
  };

  return (
    <>
      <ErrorMessage>{error}</ErrorMessage>
      {rows.length === 0 ? (
        <Box component="p" sx={styles.emptyText}>{emptyText}</Box>
      ) : (
        <Box sx={styles.gridScroll}>
          <Box component="table" sx={styles.gridTable}>
            <thead>
              <tr>
                {people && <th scope="col">Person</th>}
                <th scope="col">Card</th>
                <th scope="col">Artist</th>
                <th scope="col">Signature</th>
                <th scope="col">Qty</th>
                <th scope="col">Each</th>
                {showProgress && <th scope="col">Status</th>}
                {canEdit && <th scope="col" aria-label="Actions" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const price = rowPriceLabel(order, row);
                const name = row.cardName || 'Unnamed card';
                return (
                  <tr key={row.rowId}>
                    {people && <td>{personLabel(row.participantId)}</td>}
                    <Box component="th" scope="row" sx={{ whiteSpace: 'normal' }}>
                      {name}
                      {(row.set || row.foil === 'foil' || row.sigNotes) && (
                        <Box component="span" sx={[styles.personMeta, { display: 'block' }]}>
                          {[row.set?.toUpperCase(), row.foil === 'foil' && 'Foil', row.sigNotes].filter(Boolean).join(' · ')}
                        </Box>
                      )}
                    </Box>
                    <td>{row.artist}</td>
                    <td>{signatureTypeLabel(order, row.signatureTypeId)}</td>
                    <td>{row.quantity}</td>
                    <Box component="td" sx={price === 'TBD' ? styles.cellTbd : undefined}>{price}</Box>
                    {showProgress && (
                      <Box component="td" sx={{ whiteSpace: 'normal' }}>
                        <Box component="span" sx={row.status === 'signed' ? styles.pillAccent : styles.pill}>{ROW_STATUS_LABELS[row.status] ?? row.status}</Box>
                        {row.status === 'not-signed' && row.notSignedReason && (
                          <Box component="span" sx={[styles.personMeta, { display: 'block' }]}>{row.notSignedReason}</Box>
                        )}
                        {row.receivedQuantity != null && row.receivedQuantity !== row.quantity && (
                          <Box component="span" sx={[styles.slotsFull, { display: 'block' }]}>Received {row.receivedQuantity} of {row.quantity}</Box>
                        )}
                      </Box>
                    )}
                    {canEdit && (
                      <td>
                        <Box sx={styles.cellControls}>
                          <Button size="small" startIcon={<PencilSimple size={14} />} onClick={() => startEdit(row)} sx={styles.textButton}
                            aria-label={`Edit ${name}`}>
                            Edit
                          </Button>
                          <Button size="small" startIcon={<Trash size={14} />} disabled={busy} sx={styles.textButton} aria-label={`Remove ${name}`}
                            onClick={() => {
                              if (window.confirm(`Remove ${name}?`)) run(() => onRemove(row.rowId));
                            }}>
                            Remove
                          </Button>
                        </Box>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Box>
        </Box>
      )}

      {canEdit && (
        <Box component="form" onSubmit={submit} aria-label={editingId ? 'Edit card' : 'Add a card'} sx={{ mt: 3 }}>
          <MonoLabel tracking="tight" sx={{ display: 'block', mb: 1.5 }}>{editingId ? 'Edit card' : 'Add a card'}</MonoLabel>
          <Box sx={styles.fieldRow}>
            {people && !editingId && (
              <TextField select size="small" label="Person" value={personId} onChange={(e) => setPersonId(e.target.value)} sx={styles.input}>
                {people.map((p) => <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>)}
              </TextField>
            )}
            <TextField select size="small" label="Artist" value={draft.artist} onChange={(e) => pickArtist(e.target.value)} sx={styles.input}>
              {order.artists.map((a) => (
                <MenuItem key={a.name} value={a.name} disabled={a.remaining === 0 && a.name !== draft.artist}>
                  {a.name}{a.remaining === 0 ? ' (full)' : a.remaining !== null ? ` (${a.remaining} left)` : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Signature" value={types.some((t) => t.id === draft.signatureTypeId) ? draft.signatureTypeId : ''}
              onChange={(e) => update({ signatureTypeId: e.target.value })} disabled={!draft.artist} sx={styles.input}>
              {types.map((t) => <MenuItem key={t.id} value={t.id}>{t.label} · {t.priceLabel}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Quantity" value={draft.quantity} onChange={(e) => update({ quantity: e.target.value })}
              inputProps={{ inputMode: 'numeric' }} sx={styles.input} />
          </Box>
          <Box sx={[styles.fieldRow, { mt: 2 }]}>
            <TextField size="small" label="Card name" value={draft.cardName} onChange={(e) => update({ cardName: e.target.value })}
              inputProps={{ maxLength: 200 }} sx={styles.input} />
            <TextField size="small" label="Set code" value={draft.set} onChange={(e) => update({ set: e.target.value })}
              placeholder="e.g. LEA" inputProps={{ maxLength: 20 }} sx={styles.input} />
            <TextField size="small" label="Notes for the artist" value={draft.sigNotes} onChange={(e) => update({ sigNotes: e.target.value })}
              placeholder="e.g. silver ink" inputProps={{ maxLength: 200 }} sx={styles.input} />
          </Box>
          <FormControlLabel control={<Checkbox checked={draft.foil} onChange={(e) => update({ foil: e.target.checked })} />} label="Foil"
            sx={[styles.checkboxRow, { mt: 1, mb: 1 }]} />
          <Box sx={styles.actions}>
            <Button type="submit" disabled={busy} sx={styles.primaryButton}>{editingId ? 'Save card' : 'Add card'}</Button>
            {editingId && <Button onClick={cancelEdit} sx={styles.secondaryButton}>Cancel</Button>}
          </Box>
        </Box>
      )}
    </>
  );
};

export default CardsEditor;
