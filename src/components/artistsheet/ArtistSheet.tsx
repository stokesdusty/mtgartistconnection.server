import { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { MAX_SLOTS, paginateSlots, printArtistSheet, SheetSlot, SLOTS_PER_PAGE } from '../../utils/artistSheet';

type Slot = SheetSlot;

/** Group orders open the generator pre-filled, via router state, so people can tweak their slips. */
interface Prefill {
  slots?: Slot[];
  header?: string;
}

interface ArtistRecord {
  name: string;
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

  const prefill = (useLocation().state ?? null) as Prefill | null;
  const [slots, setSlots] = useState<Slot[]>(() => prefill?.slots?.slice(0, MAX_SLOTS) ?? []);
  const header = prefill?.header;
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [color, setColor] = useState('');

  const { data } = useQuery(GET_ARTIST_NAMES);

  const artists: string[] = (data?.artistNames ?? [])
    .map((a: ArtistRecord) => a.name)
    .sort();

  const canAdd = name.trim() !== '' && artist !== '' && slots.length < MAX_SLOTS;

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
    printArtistSheet(slots, header);
  };

  const pages = paginateSlots(slots);
  const pageLabel = `${pages.length} ${pages.length === 1 ? 'page' : 'pages'}`;

  return (
    <Box sx={styles.page}>
      <Box sx={styles.inner}>
        {/* Header */}
        <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
          {slots.length} {slots.length === 1 ? 'slot' : 'slots'} · {pageLabel}
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
                {slots.length}
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
              {pageLabel} · {SLOTS_PER_PAGE} slips per page
            </MonoLabel>
          </Box>

          {header && (
            <Box component="p" sx={styles.hint}>
              Each page is headed: {header}
            </Box>
          )}
          {pages.map((page, p) => (
            <Box key={p} sx={[styles.paperMount, p > 0 ? { mt: 3 } : {}]}>
              <Box sx={styles.paper} aria-label={`Page ${p + 1}`}>
                {page.map((slot, i) => (
                  <SlotCard
                    key={i}
                    slot={slot}
                    onDelete={slot !== null ? () => handleDelete(p * SLOTS_PER_PAGE + i) : undefined}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ArtistSheet;
