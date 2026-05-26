import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { Printer, Trash } from '@phosphor-icons/react';
import { GET_ARTISTS_FOR_HOMEPAGE } from '../graphql/queries';
import { usePageTitle } from '../../hooks/usePageTitle';
import { colors, themeColors } from '../../styles/design-tokens';

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


// Shared MUI overrides so form fields adapt to dark mode
const inputSx = {
  '& .MuiInputBase-input': { color: themeColors.text.primary },
  '& .MuiInputLabel-root': { color: themeColors.text.secondary },
  '& .MuiInputLabel-root.Mui-focused': { color: themeColors.primary.main },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.neutral[300] },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.text.hint },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.primary.main },
  '& .MuiSvgIcon-root': { color: themeColors.text.secondary },
};

// SlotCard always uses light/print colors — it represents content on white paper
function SlotCard({ slot, onDelete }: { slot: Slot | null; onDelete?: () => void }) {
  const empty = slot === null;
  return (
    <Box
      sx={{
        borderLeft: `4px solid ${empty ? colors.neutral[300] : colors.accent.blue}`,
        backgroundColor: colors.neutral.white,
        p: '6px 8px',
        minHeight: 72,
        boxSizing: 'border-box',
        position: 'relative',
        '&:hover .slot-delete': { opacity: 1 },
      }}
    >
      <Typography sx={{ fontSize: '0.7rem', color: colors.neutral[700], lineHeight: 1.6 }}>
        <strong>Your Name:</strong> {slot?.name ?? ''}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: colors.neutral[700], lineHeight: 1.6 }}>
        <strong>Color:</strong> {slot?.color ?? ''}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: colors.neutral[700], lineHeight: 1.6 }}>
        <strong>Artist/Quantity:</strong> {slot ? `${slot.artist} ×${slot.quantity}` : ''}
      </Typography>
      {!empty && (
        <Box
          className="slot-delete"
          onClick={onDelete}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 150ms',
            color: colors.neutral[500],
            fontSize: '0.65rem',
            fontWeight: 700,
            lineHeight: 1,
            '&:hover': { color: colors.accent.red },
          }}
        >
          ✕
        </Box>
      )}
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

  const { data } = useQuery(GET_ARTISTS_FOR_HOMEPAGE);

  const artists: string[] = (data?.artists ?? [])
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
            <div><strong>Your Name:</strong> ${slot.name}</div>
            <div><strong>Color:</strong> ${slot.color}</div>
            <div><strong>Artist/Quantity:</strong> ${slot.artist} ×${slot.quantity}</div>
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
    <>
      {/* Form */}
      <Box sx={{ bgcolor: themeColors.background.default, py: 2 }}>
        <Container maxWidth="md">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: themeColors.text.primary,
              mb: 1.5,
              fontFamily: 'Fraunces, Georgia, serif',
            }}
          >
            Artist Sheet Generator
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: themeColors.background.paper,
              border: `1px solid ${themeColors.neutral[200]}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 1.5 }}>
              <TextField
                label="Your Name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
                size="small"
                sx={inputSx}
              />

              <TextField
                label="Color(s)"
                placeholder="e.g. W, U, B, R, G"
                value={color}
                onChange={e => setColor(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
                size="small"
                sx={inputSx}
              />

              <Autocomplete
                fullWidth
                size="small"
                options={artists}
                value={artist || null}
                onChange={(_, v) => setArtist(v ?? '')}
                sx={inputSx}
                componentsProps={{
                  paper: { sx: { bgcolor: themeColors.background.paper, color: themeColors.text.primary } },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Artist"
                    placeholder="Search artists..."
                    sx={inputSx}
                  />
                )}
              />

              <TextField
                label="Quantity"
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
                sx={inputSx}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!canAdd}
                disableElevation
                size="small"
                sx={{
                  bgcolor: colors.primary.main,
                  '&:hover': { bgcolor: colors.primary.dark },
                  '&.Mui-disabled': { bgcolor: themeColors.neutral[100], color: themeColors.text.disabled },
                }}
              >
                Add Slot ({slots.length}/{SLOTS_PER_PAGE})
              </Button>

              {slots.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Printer size={16} />}
                    onClick={handlePrint}
                    sx={{ borderColor: themeColors.neutral[300], color: themeColors.text.primary }}
                  >
                    Print Sheet
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<Trash size={16} />}
                    onClick={() => setSlots([])}
                    sx={{ color: colors.accent.red, ml: 'auto' }}
                  >
                    Clear
                  </Button>
                </>
              )}
            </Box>
          </Paper>

          {slots.length > 0 && (
            <Typography sx={{ mt: 1, fontSize: '0.75rem', color: themeColors.text.secondary }}>
              Preview below — keep adding slots or print when ready.
            </Typography>
          )}
        </Container>
      </Box>

      {/* Sheet preview — "desk" surface with a paper card on it */}
      <Box
        sx={{
          bgcolor: themeColors.background.dark,
          py: 4,
          px: { xs: 1, sm: 3 },
        }}
      >
        <Container maxWidth="md" disableGutters>
          {/* Page label */}
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: themeColors.text.hint,
              mb: 1,
              textAlign: 'center',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Sheet preview — {slots.length} / {SLOTS_PER_PAGE} slots filled
          </Typography>

          {/* The "paper" */}
          <Paper
            elevation={6}
            sx={{
              bgcolor: colors.neutral.white,
              borderRadius: 1,
              p: 1.5,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
            }}
          >
            {displaySlots.map((slot, i) => (
              <SlotCard
                key={i}
                slot={slot}
                onDelete={slot !== null ? () => handleDelete(i) : undefined}
              />
            ))}
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default ArtistSheet;
