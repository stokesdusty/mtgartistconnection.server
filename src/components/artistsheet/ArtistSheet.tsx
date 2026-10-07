import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  Button,
  TextField,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { Plus, Printer, Trash, X } from '@phosphor-icons/react';
import { GET_ARTIST_NAMES } from '../graphql/queries';
import { usePageTitle } from '../../hooks/usePageTitle';
import { vault, vaultRadii } from '../../styles/design-tokens';
import { artistSheetStyles as styles } from '../../styles/artist-sheet-styles';
import MonoLabel from '../shared/MonoLabel';

interface Slot {
  name: string;
  artist: string;
  quantity: number;
  color: string;
}

interface ArtistRecord {
  name: string;
}

const SLOTS_PER_PAGE = 30;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// SlotCard always uses light/print colors — it represents content on white paper
function SlotCard({ slot, onDelete }: { slot: Slot | null; onDelete?: () => void }) {
  const empty = slot === null;
  return (
    <Box sx={[styles.slot, empty ? {} : styles.slotFilled]}>
      <Box sx={styles.slotLine}>
        <strong>Your Name:</strong> {slot?.name ?? ''}
      </Box>
      <Box sx={styles.slotLine}>
        <strong>Color:</strong> {slot?.color ?? ''}
      </Box>
      <Box sx={styles.slotLine}>
        <strong>Artist/Quantity:</strong> {slot ? `${slot.artist} ×${slot.quantity}` : ''}
      </Box>
      {!empty && (
        <Box
          component="button"
          type="button"
          className="slot-delete"
          onClick={onDelete}
          aria-label={`Remove slot for ${slot.name} and edit it`}
          sx={styles.slotDelete}
        >
          <X size={11} weight="bold" />
        </Box>
      )}
    </Box>
  );
}

/** Mono label stacked above a form control. */
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <Box sx={styles.field}>
      <Box component="label" htmlFor={htmlFor} sx={{ cursor: 'pointer' }}>
        <MonoLabel tracking="tight">{label}</MonoLabel>
      </Box>
      {children}
    </Box>
  );
}

const ArtistSheet = () => {
  usePageTitle('Artist Sheet Generator');

  const [slots, setSlots] = useState<Slot[]>([]);
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [color, setColor] = useState('');

  const { data } = useQuery(GET_ARTIST_NAMES);

  const artists: string[] = (data?.artistNames ?? [])
    .map((a: ArtistRecord) => a.name)
    .sort();

  const canAdd = name.trim() !== '' && artist !== '' && slots.length < SLOTS_PER_PAGE;

  const handleAdd = () => {
    if (!canAdd) return;
    setSlots(prev => [...prev, { name: name.trim(), artist, quantity, color: color.trim() }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleDelete = (index: number) => {
    const slot = slots[index];
    setSlots(prev => prev.filter((_, i) => i !== index));
    setName(slot.name);
    setArtist(slot.artist);
    setQuantity(slot.quantity);
    setColor(slot.color);
  };

  const handlePrint = () => {
    const filled = [...slots, ...Array(SLOTS_PER_PAGE - slots.length).fill(null)];
    const slotRows = filled.map(slot =>
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
           </div>`
    ).join('');

    const win = window.open('', '_blank', 'width=816,height=1056');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: letter portrait; margin: 0.35in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    width: 100%;
    height: calc(11in - 0.7in);
  }
  .slot {
    padding: 5px 8px;
    font-size: 9pt;
    line-height: 1.7;
    border-left: 4px solid #ccc;
  }
  .slot.filled { border-left-color: #3498db; }
  .slot strong { font-weight: 600; }
</style>
</head>
<body>
<div class="grid">${slotRows}</div>
<script>window.onload = function() { window.print(); window.close(); }${'</script>'}
</body>
</html>`);
    win.document.close();
  };

  const displaySlots: (Slot | null)[] = [
    ...slots,
    ...Array(SLOTS_PER_PAGE - slots.length).fill(null),
  ];

  return (
    <Box sx={styles.page}>
      <Box sx={styles.inner}>
        {/* Header */}
        <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
          {slots.length} / {SLOTS_PER_PAGE} slots filled
        </MonoLabel>
        <Box component="h1" sx={styles.title}>
          Artist sheet
        </Box>
        <Box component="p" sx={styles.subtitle}>
          Build a printable signing session sheet
        </Box>

        {/* Form */}
        <Box sx={styles.formPanel}>
          <Box sx={styles.fields}>
            <Field label="Your name" htmlFor="sheet-name">
              <TextField
                id="sheet-name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
                size="small"
                sx={styles.input}
              />
            </Field>

            <Field label="Signature type / color(s)" htmlFor="sheet-color">
              <TextField
                id="sheet-color"
                placeholder="e.g. W, U, B, R, G"
                value={color}
                onChange={e => setColor(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
                size="small"
                sx={styles.input}
              />
            </Field>

            <Field label="Artist" htmlFor="sheet-artist">
              <Autocomplete
                id="sheet-artist"
                freeSolo
                fullWidth
                size="small"
                options={artists}
                value={artist}
                onChange={(_, v) => setArtist(v ?? '')}
                onInputChange={(_, v) => setArtist(v)}
                sx={styles.input}
                componentsProps={{
                  paper: {
                    sx: {
                      mt: '6px',
                      bgcolor: vault.surface,
                      color: vault.fg,
                      border: `1px solid ${vault.line}`,
                      borderRadius: vaultRadii.card,
                      boxShadow: `0 20px 60px ${vault.shadow}`,
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search or type an artist name..."
                  />
                )}
              />
            </Field>

            <Field label="Quantity" htmlFor="sheet-quantity">
              <TextField
                id="sheet-quantity"
                type="number"
                value={quantity}
                onChange={e => {
                  const v = Math.max(1, Math.min(99, Number(e.target.value) || 1));
                  setQuantity(v);
                }}
                onKeyDown={handleKeyDown}
                fullWidth
                size="small"
                inputProps={{ min: 1, max: 99 }}
                sx={styles.input}
              />
            </Field>
          </Box>

          <Box sx={styles.actions}>
            <Button
              onClick={handleAdd}
              disabled={!canAdd}
              startIcon={<Plus size={16} weight="bold" />}
              sx={styles.primaryButton}
            >
              Add slot
              <Box component="span" sx={styles.slotCount}>
                {slots.length}/{SLOTS_PER_PAGE}
              </Box>
            </Button>

            {slots.length > 0 && (
              <>
                <Button
                  startIcon={<Printer size={16} />}
                  onClick={handlePrint}
                  sx={styles.secondaryButton}
                >
                  Print sheet
                </Button>
                <Button
                  startIcon={<Trash size={16} />}
                  onClick={() => setSlots([])}
                  sx={styles.clearButton}
                >
                  Clear
                </Button>
              </>
            )}
          </Box>

          {slots.length > 0 && (
            <Box component="p" sx={styles.hint}>
              Preview below — keep adding slots or print when ready.
            </Box>
          )}
        </Box>

        {/* Sheet preview — white page on a slab mount */}
        <Box component="section" sx={styles.previewSection}>
          <Box sx={styles.sectionHeader}>
            <Box component="h2" sx={styles.sectionTitle}>
              Sheet preview
            </Box>
            <MonoLabel tracking="tight">
              {slots.length} / {SLOTS_PER_PAGE} filled
            </MonoLabel>
          </Box>

          <Box sx={styles.paperMount}>
            <Box sx={styles.paper}>
              {displaySlots.map((slot, i) => (
                <SlotCard
                  key={i}
                  slot={slot}
                  onDelete={slot !== null ? () => handleDelete(i) : undefined}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ArtistSheet;
