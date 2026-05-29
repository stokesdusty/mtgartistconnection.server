import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation } from '@apollo/client';
import { RootState } from '../../store/store';
import { GET_SIGNING_BATCHES } from '../graphql/queries';
import { SAVE_SIGNING_BATCH, DELETE_SIGNING_BATCH, REORDER_SIGNING_BATCHES } from '../graphql/mutations';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Chip,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  Plus,
  Trash,
  CaretDown,
  CaretRight,
  CaretUp,
  Archive,
  ArrowCounterClockwise,
  DotsSixVertical,
} from '@phosphor-icons/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePageTitle } from '../../hooks/usePageTitle';
import { colors, statusColors } from '../../styles/design-tokens';

// ── Types ──────────────────────────────────────────────────────────────────────

type FoilType = 'non-foil' | 'foil';
type SigningMethod = 'mail-to-artist' | 'service' | 'event' | 'custom';
type CardStatus = 'collecting' | 'sent' | 'artist-received' | 'signed' | 'shipped-back' | 'complete';
type PaymentStatus = 'unpaid' | 'partial' | 'paid';

interface CardRow {
  id: string;
  cardName: string;
  quantity: number;
  set: string;
  foil: FoilType;
  owner: string;
  artist: string;
  signatureType: string;
  sigNotes: string;
  pricePerSig: number;
  paymentStatus: PaymentStatus;
  status: CardStatus;
  signingMethod: SigningMethod;
  signingMethodLabel: string;
  outboundTracking: string;
  inboundTracking: string;
}

interface SigningBatch {
  id: string;
  name: string;
  createdAt: string;
  archived: boolean;
  expanded: boolean;
  rows: CardRow[];
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'mtgac-signing-tracker';

const STATUS_CONFIG: Record<CardStatus, { label: string; color: string; bg: string }> = {
  collecting:         { label: 'Collecting',      color: colors.neutral[600],       bg: colors.neutral[100]          },
  sent:               { label: 'Sent',             color: statusColors.sent.text,    bg: statusColors.sent.bg         },
  'artist-received':  { label: 'Artist Received',  color: colors.accent.orange,      bg: colors.accent.orangeLight    },
  signed:             { label: 'Signed',           color: colors.primary.main,       bg: colors.primary.lighter       },
  'shipped-back':     { label: 'Shipped Back',     color: statusColors.shippedBack.text, bg: statusColors.shippedBack.bg },
  complete:           { label: 'Complete',         color: statusColors.complete.text, bg: statusColors.complete.bg   },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  unpaid:  { label: 'Unpaid',  color: statusColors.unpaidText,    bg: colors.accent.redLight    },
  partial: { label: 'Partial', color: colors.accent.orange,       bg: colors.accent.orangeLight },
  paid:    { label: 'Paid',    color: statusColors.complete.text, bg: statusColors.complete.bg  },
};

const SIGNING_METHOD_LABELS: Record<SigningMethod, string> = {
  'mail-to-artist': 'Mail to Artist',
  service: 'Service',
  event: 'Event',
  custom: 'Custom',
};

const GRID_COLS = '155px 50px 82px 86px 100px 120px 100px 130px 60px 64px 96px 140px 116px 114px 140px 140px 36px';
const COL_HEADERS = [
  'Card Name', 'Qty', 'Set', 'Foil', 'Owner', 'Artist',
  'Sig Type', 'Sig Notes', '$/Sig', 'Total',
  'Payment', 'Status', 'Method', 'Details',
  'Outbound Track.', 'Inbound Track.', '',
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const genId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const makeRow = (): CardRow => ({
  id: genId(),
  cardName: '', quantity: 1, set: '', foil: 'non-foil',
  owner: '', artist: '', signatureType: '', sigNotes: '', pricePerSig: 0,
  paymentStatus: 'unpaid', status: 'collecting',
  signingMethod: 'mail-to-artist', signingMethodLabel: '',
  outboundTracking: '', inboundTracking: '',
});

const makeBatch = (): SigningBatch => ({
  id: genId(),
  name: `Batch – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
  createdAt: new Date().toISOString(),
  archived: false,
  expanded: true,
  rows: [makeRow()],
});

const load = (): SigningBatch[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
};

const save = (batches: SigningBatch[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
};

const fromDbBatch = (db: any): SigningBatch => ({
  id: db.batchId,
  name: db.name,
  createdAt: db.createdAt,
  archived: db.archived ?? false,
  expanded: db.expanded ?? true,
  rows: (db.rows ?? []).map((r: any) => ({
    id: r.rowId,
    cardName: r.cardName ?? '',
    quantity: r.quantity ?? 1,
    set: r.set ?? '',
    foil: (r.foil ?? 'non-foil') as FoilType,
    owner: r.owner ?? '',
    artist: r.artist ?? '',
    signatureType: r.signatureType ?? '',
    sigNotes: r.sigNotes ?? '',
    pricePerSig: r.pricePerSig ?? 0,
    paymentStatus: (r.paymentStatus ?? 'unpaid') as PaymentStatus,
    status: (r.status ?? 'collecting') as CardStatus,
    signingMethod: (r.signingMethod ?? 'mail-to-artist') as SigningMethod,
    signingMethodLabel: r.signingMethodLabel ?? '',
    outboundTracking: r.outboundTracking ?? '',
    inboundTracking: r.inboundTracking ?? '',
  })),
});

const toDbRows = (rows: CardRow[]) => rows.map(r => ({
  rowId: r.id,
  cardName: r.cardName,
  quantity: r.quantity,
  set: r.set,
  foil: r.foil,
  owner: r.owner,
  artist: r.artist,
  signatureType: r.signatureType,
  sigNotes: r.sigNotes,
  pricePerSig: r.pricePerSig,
  paymentStatus: r.paymentStatus,
  status: r.status,
  signingMethod: r.signingMethod,
  signingMethodLabel: r.signingMethodLabel,
  outboundTracking: r.outboundTracking,
  inboundTracking: r.inboundTracking,
}));

// ── Shared styles ──────────────────────────────────────────────────────────────

const smallInput = {
  '& .MuiInputBase-root': { height: 28, fontSize: '0.75rem', backgroundColor: colors.background.default },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.neutral[200] },
  '& .MuiInputBase-input': { py: '3px', px: '7px' },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.neutral[400] },
};

const smallSelect = {
  height: 28, fontSize: '0.75rem', width: '100%',
  backgroundColor: colors.background.default,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.neutral[200] },
  '& .MuiSelect-select': { py: '3px', px: '7px', display: 'flex', alignItems: 'center' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.neutral[400] },
};

const chipSx = (cfg: { label: string; color: string; bg: string }) => ({
  backgroundColor: cfg.bg,
  color: cfg.color,
  fontSize: '0.65rem',
  fontWeight: 600,
  height: 18,
  cursor: 'pointer',
  '& .MuiChip-label': { px: '6px' },
});

// ── CardRowEditor ──────────────────────────────────────────────────────────────

interface RowEditorProps {
  row: CardRow;
  index: number;
  disabled: boolean;
  onChange: (changes: Partial<CardRow>) => void;
  onDelete: () => void;
}

const CardRowEditor: React.FC<RowEditorProps> = ({ row, index, disabled, onChange, onDelete }) => {
  const total = (row.quantity * row.pricePerSig).toFixed(2);

  const txt = (field: keyof CardRow) => (
    <TextField
      value={row[field] as string}
      onChange={e => onChange({ [field]: e.target.value } as Partial<CardRow>)}
      disabled={disabled}
      size="small"
      fullWidth
      sx={smallInput}
    />
  );

  const isEven = index % 2 === 0;

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: GRID_COLS,
      alignItems: 'center',
      px: 1, py: 0.35,
      borderBottom: `1px solid ${colors.neutral[100]}`,
      backgroundColor: isEven ? colors.accent.greenRow : colors.background.default,
      '&:hover': { backgroundColor: colors.accent.greenRowHover },
    }}>
      <Box sx={{ px: 0.5 }}>{txt('cardName')}</Box>

      <Box sx={{ px: 0.5 }}>
        <TextField
          type="number"
          value={row.quantity}
          onChange={e => onChange({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
          disabled={disabled}
          size="small"
          fullWidth
          inputProps={{ min: 1, style: { padding: '3px 4px', fontSize: '0.75rem', textAlign: 'center' } }}
          sx={{ '& .MuiOutlinedInput-root': { height: 28, backgroundColor: colors.background.default, '& fieldset': { borderColor: colors.neutral[200] } } }}
        />
      </Box>

      <Box sx={{ px: 0.5 }}>{txt('set')}</Box>

      <Box sx={{ px: 0.5 }}>
        <Select value={row.foil} onChange={e => onChange({ foil: e.target.value as FoilType })}
          disabled={disabled} size="small" sx={smallSelect}>
          <MenuItem value="non-foil" sx={{ fontSize: '0.75rem' }}>Non-Foil</MenuItem>
          <MenuItem value="foil" sx={{ fontSize: '0.75rem' }}>Foil</MenuItem>
        </Select>
      </Box>

      <Box sx={{ px: 0.5 }}>{txt('owner')}</Box>
      <Box sx={{ px: 0.5 }}>{txt('artist')}</Box>
      <Box sx={{ px: 0.5 }}>{txt('signatureType')}</Box>
      <Box sx={{ px: 0.5 }}>{txt('sigNotes')}</Box>

      <Box sx={{ px: 0.5 }}>
        <TextField
          type="number"
          value={row.pricePerSig || ''}
          onChange={e => onChange({ pricePerSig: parseFloat(e.target.value) || 0 })}
          disabled={disabled}
          size="small"
          fullWidth
          inputProps={{ min: 0, step: 0.01, style: { padding: '3px 7px', fontSize: '0.75rem' } }}
          sx={{ '& .MuiOutlinedInput-root': { height: 28, backgroundColor: colors.background.default, '& fieldset': { borderColor: colors.neutral[200] } } }}
        />
      </Box>

      <Box sx={{ px: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Typography sx={{ fontSize: '0.75rem', color: colors.neutral[800], fontWeight: 500, pr: 0.5 }}>
          ${total}
        </Typography>
      </Box>

      <Box sx={{ px: 0.5 }}>
        <Select value={row.paymentStatus}
          onChange={e => onChange({ paymentStatus: e.target.value as PaymentStatus })}
          disabled={disabled} size="small"
          renderValue={val => (
            <Chip label={PAYMENT_CONFIG[val as PaymentStatus].label} size="small"
              sx={chipSx(PAYMENT_CONFIG[val as PaymentStatus])} />
          )}
          sx={smallSelect}>
          {(Object.keys(PAYMENT_CONFIG) as PaymentStatus[]).map(s => (
            <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem' }}>
              <Chip label={PAYMENT_CONFIG[s].label} size="small"
                sx={{ ...chipSx(PAYMENT_CONFIG[s]), cursor: 'pointer' }} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ px: 0.5 }}>
        <Select value={row.status}
          onChange={e => onChange({ status: e.target.value as CardStatus })}
          disabled={disabled} size="small"
          renderValue={val => (
            <Chip label={STATUS_CONFIG[val as CardStatus].label} size="small"
              sx={chipSx(STATUS_CONFIG[val as CardStatus])} />
          )}
          sx={smallSelect}>
          {(Object.keys(STATUS_CONFIG) as CardStatus[]).map(s => (
            <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem' }}>
              <Chip label={STATUS_CONFIG[s].label} size="small"
                sx={{ ...chipSx(STATUS_CONFIG[s]), cursor: 'pointer' }} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ px: 0.5 }}>
        <Select value={row.signingMethod}
          onChange={e => onChange({ signingMethod: e.target.value as SigningMethod })}
          disabled={disabled} size="small" sx={smallSelect}>
          {(Object.keys(SIGNING_METHOD_LABELS) as SigningMethod[]).map(m => (
            <MenuItem key={m} value={m} sx={{ fontSize: '0.75rem' }}>
              {SIGNING_METHOD_LABELS[m]}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ px: 0.5 }}>
        {row.signingMethod !== 'mail-to-artist'
          ? txt('signingMethodLabel')
          : <Typography sx={{ fontSize: '0.7rem', color: colors.neutral[400], px: 0.5 }}>—</Typography>
        }
      </Box>

      <Box sx={{ px: 0.5 }}>{txt('outboundTracking')}</Box>
      <Box sx={{ px: 0.5 }}>{txt('inboundTracking')}</Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {!disabled && (
          <Tooltip title="Remove row">
            <IconButton size="small" onClick={onDelete}
              sx={{ p: 0.4, color: colors.neutral[400], '&:hover': { color: colors.accent.red, backgroundColor: colors.accent.redLight } }}>
              <Trash size={13} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

// ── BatchPanel ─────────────────────────────────────────────────────────────────

interface BatchPanelProps {
  batch: SigningBatch;
  dragListeners?: Record<string, unknown>;
  onUpdateBatch: (id: string, changes: Partial<SigningBatch>) => void;
  onUpdateRow: (batchId: string, rowId: string, changes: Partial<CardRow>) => void;
  onBulkUpdateRows: (batchId: string, changes: Partial<CardRow>) => void;
  onAddRow: (batchId: string) => void;
  onDeleteRow: (batchId: string, rowId: string) => void;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onDelete: (id: string) => void;
}

const BatchPanel: React.FC<BatchPanelProps> = ({
  batch, dragListeners, onUpdateBatch, onUpdateRow, onBulkUpdateRows,
  onAddRow, onDeleteRow, onArchive, onUnarchive, onDelete,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(batch.name);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkMethod, setBulkMethod] = useState('');
  const [bulkPayment, setBulkPayment] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  const toggleSort = () => setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');

  const displayRows = sortDir === null
    ? batch.rows
    : [...batch.rows].sort((a, b) => {
        const cmp = a.cardName.localeCompare(b.cardName, undefined, { sensitivity: 'base' });
        return sortDir === 'asc' ? cmp : -cmp;
      });

  const batchTotal = batch.rows.reduce((s, r) => s + r.quantity * r.pricePerSig, 0);
  const allComplete = batch.rows.length > 0 && batch.rows.every(r => r.status === 'complete');

  const commitName = () => {
    setEditingName(false);
    const trimmed = nameVal.trim();
    if (trimmed && trimmed !== batch.name) onUpdateBatch(batch.id, { name: trimmed });
    else setNameVal(batch.name);
  };

  const applyBulkStatus = (val: string) => {
    if (!val) return;
    onBulkUpdateRows(batch.id, { status: val as CardStatus });
    setTimeout(() => setBulkStatus(''), 80);
  };
  const applyBulkMethod = (val: string) => {
    if (!val) return;
    onBulkUpdateRows(batch.id, { signingMethod: val as SigningMethod });
    setTimeout(() => setBulkMethod(''), 80);
  };
  const applyBulkPayment = (val: string) => {
    if (!val) return;
    onBulkUpdateRows(batch.id, { paymentStatus: val as PaymentStatus });
    setTimeout(() => setBulkPayment(''), 80);
  };

  const bulkSelectSx = {
    ...smallSelect, height: 26,
    '& .MuiSelect-select': { py: '2px', px: '8px', display: 'flex', alignItems: 'center' },
  };

  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: batch.archived ? colors.neutral[50] : colors.background.default,
    }}>
      {/* Batch header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.75,
        px: 1.5, py: 1.25,
        backgroundColor: batch.archived ? colors.neutral[100] : colors.background.default,
        borderBottom: batch.expanded ? `1px solid ${colors.neutral[200]}` : 'none',
      }}>
        {!batch.archived && dragListeners && (
          <Box
            {...(dragListeners as React.HTMLAttributes<HTMLDivElement>)}
            sx={{
              color: colors.neutral[400], display: 'flex', alignItems: 'center',
              cursor: 'grab', touchAction: 'none', px: 0.25,
              '&:active': { cursor: 'grabbing', color: colors.neutral[500] },
            }}
          >
            <DotsSixVertical size={16} />
          </Box>
        )}

        <IconButton size="small"
          onClick={() => onUpdateBatch(batch.id, { expanded: !batch.expanded })}
          sx={{ color: colors.neutral[500], p: 0.4 }}>
          {batch.expanded ? <CaretDown size={15} /> : <CaretRight size={15} />}
        </IconButton>

        {editingName ? (
          <TextField
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') { setNameVal(batch.name); setEditingName(false); }
            }}
            autoFocus size="small"
            sx={{ ...smallInput, width: 250 }}
          />
        ) : (
          <Typography
            onClick={() => !batch.archived && setEditingName(true)}
            sx={{
              fontWeight: 600, fontSize: '0.875rem', color: colors.neutral[900],
              cursor: batch.archived ? 'default' : 'text',
              '&:hover': batch.archived ? {} : { color: colors.primary.main },
            }}
          >
            {batch.name}
          </Typography>
        )}

        <Typography sx={{ fontSize: '0.7rem', color: colors.neutral[500], ml: 0.25 }}>
          {new Date(batch.createdAt).toLocaleDateString()} · {batch.rows.length} row{batch.rows.length !== 1 ? 's' : ''}
        </Typography>

        {allComplete && !batch.archived && (
          <Chip label="All Complete" size="small"
            sx={{ ml: 0.5, backgroundColor: statusColors.complete.bg, color: statusColors.complete.text, fontSize: '0.65rem', fontWeight: 600, height: 18 }} />
        )}

        <Box sx={{ flex: 1 }} />

        {batchTotal > 0 && (
          <Typography sx={{ fontSize: '0.75rem', color: colors.neutral[600], fontWeight: 500, mr: 0.5 }}>
            ${batchTotal.toFixed(2)}
          </Typography>
        )}

        {!batch.archived ? (
          <Tooltip title="Archive batch">
            <IconButton size="small" onClick={() => onArchive(batch.id)}
              sx={{ color: colors.neutral[400], '&:hover': { color: colors.primary.main } }}>
              <Archive size={15} />
            </IconButton>
          </Tooltip>
        ) : onUnarchive ? (
          <Tooltip title="Restore batch">
            <IconButton size="small" onClick={() => onUnarchive(batch.id)}
              sx={{ color: colors.neutral[400], '&:hover': { color: colors.primary.main } }}>
              <ArrowCounterClockwise size={15} />
            </IconButton>
          </Tooltip>
        ) : null}

        <Tooltip title="Delete batch">
          <IconButton size="small"
            onClick={() => {
              if (window.confirm(`Delete "${batch.name}"? This cannot be undone.`)) onDelete(batch.id);
            }}
            sx={{ color: colors.neutral[400], '&:hover': { color: colors.accent.red } }}>
            <Trash size={15} />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={batch.expanded}>
        {/* Bulk-set bar */}
        {!batch.archived && batch.rows.length > 0 && (
          <Box sx={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5,
            px: 2, py: 0.9,
            backgroundColor: colors.primary.lighter,
            borderBottom: `1px solid ${statusColors.primaryMutedBorder}`,
          }}>
            <Typography sx={{
              fontSize: '0.65rem', fontWeight: 700, color: colors.primary.main,
              textTransform: 'uppercase', letterSpacing: '0.06em', mr: 0.5,
            }}>
              Set all rows:
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: '0.7rem', color: colors.neutral[600] }}>Status</Typography>
              <Select value={bulkStatus} displayEmpty
                onChange={e => applyBulkStatus(e.target.value as string)}
                size="small"
                renderValue={val =>
                  val
                    ? <Chip label={STATUS_CONFIG[val as CardStatus].label} size="small"
                        sx={{ ...chipSx(STATUS_CONFIG[val as CardStatus]), cursor: 'pointer' }} />
                    : <Typography sx={{ fontSize: '0.72rem', color: colors.neutral[500] }}>— pick —</Typography>
                }
                sx={{ ...bulkSelectSx, width: 136 }}>
                {(Object.keys(STATUS_CONFIG) as CardStatus[]).map(s => (
                  <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem' }}>
                    <Chip label={STATUS_CONFIG[s].label} size="small"
                      sx={{ ...chipSx(STATUS_CONFIG[s]), cursor: 'pointer' }} />
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: '0.7rem', color: colors.neutral[600] }}>Payment</Typography>
              <Select value={bulkPayment} displayEmpty
                onChange={e => applyBulkPayment(e.target.value as string)}
                size="small"
                renderValue={val =>
                  val
                    ? <Chip label={PAYMENT_CONFIG[val as PaymentStatus].label} size="small"
                        sx={{ ...chipSx(PAYMENT_CONFIG[val as PaymentStatus]), cursor: 'pointer' }} />
                    : <Typography sx={{ fontSize: '0.72rem', color: colors.neutral[500] }}>— pick —</Typography>
                }
                sx={{ ...bulkSelectSx, width: 110 }}>
                {(Object.keys(PAYMENT_CONFIG) as PaymentStatus[]).map(s => (
                  <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem' }}>
                    <Chip label={PAYMENT_CONFIG[s].label} size="small"
                      sx={{ ...chipSx(PAYMENT_CONFIG[s]), cursor: 'pointer' }} />
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: '0.7rem', color: colors.neutral[600] }}>Method</Typography>
              <Select value={bulkMethod} displayEmpty
                onChange={e => applyBulkMethod(e.target.value as string)}
                size="small"
                renderValue={val =>
                  val
                    ? <Typography sx={{ fontSize: '0.72rem', color: colors.neutral[800] }}>
                        {SIGNING_METHOD_LABELS[val as SigningMethod]}
                      </Typography>
                    : <Typography sx={{ fontSize: '0.72rem', color: colors.neutral[500] }}>— pick —</Typography>
                }
                sx={{ ...bulkSelectSx, width: 130 }}>
                {(Object.keys(SIGNING_METHOD_LABELS) as SigningMethod[]).map(m => (
                  <MenuItem key={m} value={m} sx={{ fontSize: '0.75rem' }}>
                    {SIGNING_METHOD_LABELS[m]}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        )}

        {/* Scrollable table */}
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 1540 }}>
            <Box sx={{
              display: 'grid', gridTemplateColumns: GRID_COLS,
              px: 1, py: 0.75,
              backgroundColor: colors.neutral[50],
              borderBottom: `1px solid ${colors.neutral[200]}`,
            }}>
              {COL_HEADERS.map((h, i) => (
                i === 0 ? (
                  <Box key={i} onClick={toggleSort} sx={{
                    px: 0.5, display: 'flex', alignItems: 'center', gap: 0.25,
                    cursor: 'pointer', userSelect: 'none',
                    '&:hover .sort-label': { color: colors.primary.main },
                  }}>
                    <Typography className="sort-label" sx={{
                      fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: sortDir ? colors.primary.main : colors.neutral[500],
                    }}>
                      {h}
                    </Typography>
                    {sortDir === 'asc' && <CaretUp size={10} color={colors.primary.main} />}
                    {sortDir === 'desc' && <CaretDown size={10} color={colors.primary.main} />}
                    {sortDir === null && <CaretDown size={10} color={colors.neutral[400]} />}
                  </Box>
                ) : (
                  <Typography key={i} sx={{
                    px: 0.5, fontSize: '0.65rem', fontWeight: 600,
                    color: colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em',
                    userSelect: 'none',
                  }}>
                    {h}
                  </Typography>
                )
              ))}
            </Box>

            {displayRows.map((row, index) => (
              <CardRowEditor
                key={row.id}
                row={row}
                index={index}
                disabled={batch.archived}
                onChange={changes => onUpdateRow(batch.id, row.id, changes)}
                onDelete={() => onDeleteRow(batch.id, row.id)}
              />
            ))}

            {batch.rows.length === 0 && (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography sx={{ fontSize: '0.8rem', color: colors.neutral[500], fontStyle: 'italic' }}>
                  No cards in this batch.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{
          px: 2, py: 1.25, borderTop: `1px solid ${colors.neutral[200]}`,
          display: 'flex', alignItems: 'center',
        }}>
          {!batch.archived && (
            <Button startIcon={<Plus size={13} />} onClick={() => onAddRow(batch.id)} size="small"
              sx={{
                color: colors.primary.main, textTransform: 'none', fontSize: '0.8rem',
                fontWeight: 600, px: 1.5, py: 0.5,
                '&:hover': { backgroundColor: colors.primary.lighter },
              }}>
              Add Card
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          {batchTotal > 0 && (
            <Typography sx={{ fontSize: '0.75rem', color: colors.neutral[600] }}>
              Batch total: <strong>${batchTotal.toFixed(2)}</strong>
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

// ── SortableBatchPanel ─────────────────────────────────────────────────────────

interface SortableWrapperProps extends BatchPanelProps {
  id: string;
}

const SortableBatchPanel: React.FC<SortableWrapperProps> = ({ id, ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
      }}
    >
      <BatchPanel {...props} dragListeners={listeners as Record<string, unknown>} />
    </Box>
  );
};

// ── SigningTracker (page) ──────────────────────────────────────────────────────

const SigningTracker: React.FC = () => {
  usePageTitle('Signing Tracker');
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  const [batches, setBatches] = useState<SigningBatch[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  const [saveSigningBatch] = useMutation(SAVE_SIGNING_BATCH);
  const [deleteSigningBatchMutation] = useMutation(DELETE_SIGNING_BATCH);
  const [reorderSigningBatchesMutation] = useMutation(REORDER_SIGNING_BATCHES);

  useQuery(GET_SIGNING_BATCHES, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only',
    onCompleted: (data: any) => {
      const dbBatches: SigningBatch[] = (data.signingBatches ?? []).map(fromDbBatch);
      if (dbBatches.length === 0) {
        // Auto-migrate localStorage data on first login
        const local = load();
        if (local.length > 0) {
          setBatches(local);
          local.forEach((batch, index) => {
            saveSigningBatch({
              variables: {
                batchId: batch.id, name: batch.name, createdAt: batch.createdAt,
                archived: batch.archived, expanded: batch.expanded, sortOrder: index,
                rows: toDbRows(batch.rows),
              },
            });
          });
        }
      } else {
        setBatches(dbBatches);
      }
      setDbInitialized(true);
    },
  });

  // Init from localStorage for unauthenticated users
  useEffect(() => {
    if (!isLoggedIn) {
      setBatches(load());
      setDbInitialized(true);
    }
  }, [isLoggedIn]);

  const saveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const scheduleSave = useCallback((batchId: string, batch: SigningBatch) => {
    const existing = saveTimers.current.get(batchId);
    if (existing) clearTimeout(existing);
    saveTimers.current.set(batchId, setTimeout(() => {
      saveSigningBatch({
        variables: {
          batchId, name: batch.name, createdAt: batch.createdAt,
          archived: batch.archived, expanded: batch.expanded,
          rows: toDbRows(batch.rows),
        },
      });
      saveTimers.current.delete(batchId);
    }, 800));
  }, [saveSigningBatch]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const mutate = useCallback((
    fn: (prev: SigningBatch[]) => SigningBatch[],
    saveIds?: string[] | 'all',
  ) => {
    setBatches(prev => {
      const next = fn(prev);
      if (!isLoggedIn) {
        save(next);
      } else if (saveIds) {
        const ids = saveIds === 'all' ? next.map(b => b.id) : saveIds;
        for (const id of ids) {
          const b = next.find(b => b.id === id);
          if (b) scheduleSave(id, b);
        }
      }
      return next;
    });
  }, [isLoggedIn, scheduleSave]);

  const updateBatch = useCallback((id: string, changes: Partial<SigningBatch>) => {
    mutate(prev => prev.map(b => b.id === id ? { ...b, ...changes } : b), [id]);
  }, [mutate]);

  const updateRow = useCallback((batchId: string, rowId: string, changes: Partial<CardRow>) => {
    mutate(prev => prev.map(b =>
      b.id !== batchId ? b :
        { ...b, rows: b.rows.map(r => r.id === rowId ? { ...r, ...changes } : r) }
    ), [batchId]);
  }, [mutate]);

  const bulkUpdateRows = useCallback((batchId: string, changes: Partial<CardRow>) => {
    mutate(prev => prev.map(b =>
      b.id !== batchId ? b :
        { ...b, rows: b.rows.map(r => ({ ...r, ...changes })) }
    ), [batchId]);
  }, [mutate]);

  const addRow = useCallback((batchId: string) => {
    mutate(prev => prev.map(b =>
      b.id !== batchId ? b : { ...b, rows: [...b.rows, makeRow()] }
    ), [batchId]);
  }, [mutate]);

  const deleteRow = useCallback((batchId: string, rowId: string) => {
    mutate(prev => prev.map(b =>
      b.id !== batchId ? b : { ...b, rows: b.rows.filter(r => r.id !== rowId) }
    ), [batchId]);
  }, [mutate]);

  const createBatch = () => {
    const newBatch = makeBatch();
    setBatches(prev => {
      const next = [...prev, newBatch];
      if (!isLoggedIn) save(next);
      return next;
    });
    if (isLoggedIn) {
      const sortOrder = batches.filter(b => !b.archived).length;
      saveSigningBatch({
        variables: {
          batchId: newBatch.id, name: newBatch.name, createdAt: newBatch.createdAt,
          archived: false, expanded: true, sortOrder, rows: [],
        },
      });
    }
  };

  const deleteBatch = useCallback((id: string) => {
    mutate(prev => prev.filter(b => b.id !== id));
    if (isLoggedIn) {
      deleteSigningBatchMutation({ variables: { batchId: id } });
    }
  }, [mutate, isLoggedIn, deleteSigningBatchMutation]);

  const archiveBatch = useCallback((id: string) => {
    updateBatch(id, { archived: true, expanded: false });
  }, [updateBatch]);

  const unarchiveBatch = useCallback((id: string) => {
    updateBatch(id, { archived: false, expanded: true });
  }, [updateBatch]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBatches(prev => {
      const activeIds = prev.filter(b => !b.archived).map(b => b.id);
      const oldIndex = activeIds.indexOf(active.id as string);
      const newIndex = activeIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(activeIds, oldIndex, newIndex);
      const archived = prev.filter(b => b.archived);
      const next = [...reordered.map(id => prev.find(b => b.id === id)!), ...archived];
      if (!isLoggedIn) save(next);
      else reorderSigningBatchesMutation({ variables: { orderedBatchIds: reordered } });
      return next;
    });
  };

  const active = batches.filter(b => !b.archived);
  const archived = batches.filter(b => b.archived);
  const anyExpanded = active.some(b => b.expanded);

  const toggleAllExpanded = () => {
    const expand = !anyExpanded;
    mutate(prev => prev.map(b => b.archived ? b : { ...b, expanded: expand }), 'all');
  };

  const sharedBatchProps = {
    onUpdateBatch: updateBatch,
    onUpdateRow: updateRow,
    onBulkUpdateRows: bulkUpdateRows,
    onAddRow: addRow,
    onDeleteRow: deleteRow,
    onArchive: archiveBatch,
    onDelete: deleteBatch,
  };

  if (!dbInitialized) {
    return (
      <Box sx={{ backgroundColor: colors.neutral[100], minHeight: '100vh', py: 4 }}>
        <Container maxWidth={false} sx={{ maxWidth: 1680, px: { xs: 1, sm: 2, md: 3 } }}>
          <Typography sx={{ color: colors.neutral[500], fontSize: '0.875rem' }}>Loading…</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: colors.neutral[100], minHeight: '100vh', py: 4 }}>
      <Container maxWidth={false} sx={{ maxWidth: 1680, px: { xs: 1, sm: 2, md: 3 } }}>

        {/* Page header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{
              fontWeight: 700, color: colors.primary.main,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              Signing Tracker
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: colors.neutral[500], mt: 0.5 }}>
              Track cards sent out for signatures
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {active.length > 0 && (
              <Button
                onClick={toggleAllExpanded}
                variant="outlined"
                size="small"
                sx={{
                  color: colors.primary.main,
                  borderColor: statusColors.primaryMutedBorder,
                  textTransform: 'none',
                  fontWeight: 600, fontSize: '0.8rem', borderRadius: '8px', px: 2,
                  '&:hover': { borderColor: colors.primary.main, backgroundColor: colors.primary.lighter },
                }}
              >
                {anyExpanded ? 'Collapse All' : 'Expand All'}
              </Button>
            )}
            <Button
              startIcon={<Plus size={16} />}
              onClick={createBatch}
              sx={{
                backgroundColor: colors.primary.main, color: colors.primary.contrast,
                textTransform: 'none', fontWeight: 600, fontSize: '0.875rem',
                borderRadius: '8px', px: 2.5, py: 1,
                '&:hover': { backgroundColor: colors.primary.dark },
              }}
            >
              New Batch
            </Button>
          </Box>
        </Box>

        {!isLoggedIn && (
          <Paper elevation={0} sx={{
            p: 1.5, mb: 2.5, borderRadius: '8px',
            border: `1px solid ${colors.neutral[300]}`,
            backgroundColor: colors.neutral[50],
          }}>
            <Typography sx={{ fontSize: '0.8rem', color: colors.neutral[600] }}>
              You're not logged in — data is saved in your browser only. Log in to sync across devices.
            </Typography>
          </Paper>
        )}

        {/* Active batches — sortable */}
        {active.length === 0 ? (
          <Paper elevation={0} sx={{
            p: 5, borderRadius: '12px', border: `1px solid ${colors.neutral[200]}`,
            textAlign: 'center', backgroundColor: colors.background.default,
          }}>
            <Typography sx={{ color: colors.neutral[500], fontSize: '0.875rem', fontStyle: 'italic' }}>
              No active batches. Click "New Batch" to start tracking.
            </Typography>
          </Paper>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={active.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {active.map(batch => (
                  <SortableBatchPanel
                    key={batch.id}
                    id={batch.id}
                    batch={batch}
                    {...sharedBatchProps}
                  />
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        )}

        {/* Archived batches */}
        {archived.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Button disableRipple
              startIcon={showArchived ? <CaretDown size={14} /> : <CaretRight size={14} />}
              onClick={() => setShowArchived(v => !v)}
              sx={{
                color: colors.neutral[600], textTransform: 'none', fontSize: '0.875rem',
                fontWeight: 600, px: 0, mb: 1.5, minWidth: 0,
                '&:hover': { backgroundColor: 'transparent', color: colors.neutral[800] },
              }}
            >
              Archived Batches ({archived.length})
            </Button>
            <Collapse in={showArchived}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {archived.map(batch => (
                  <BatchPanel
                    key={batch.id}
                    batch={batch}
                    {...sharedBatchProps}
                    onUnarchive={unarchiveBatch}
                  />
                ))}
              </Box>
            </Collapse>
          </Box>
        )}

      </Container>
    </Box>
  );
};

export default SigningTracker;
