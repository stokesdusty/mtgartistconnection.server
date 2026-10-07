import React, { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { RootState } from '../../store/store';
import { GET_SIGNING_BATCHES } from '../graphql/queries';
import { SAVE_SIGNING_BATCH, DELETE_SIGNING_BATCH, REORDER_SIGNING_BATCHES } from '../graphql/mutations';
import {
  Box,
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
import { vault } from '../../styles/design-tokens';
import {
  signingTrackerStyles,
  toneChip,
  trackerInput,
  trackerMenuItem,
  trackerSelect,
} from '../../styles/signing-tracker-styles';
import MonoLabel from '../shared/MonoLabel';

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
  collecting:         { label: 'Collecting',      color: vault.muted,      bg: vault.chipStrong },
  sent:               { label: 'Sent',            color: vault.info,       bg: vault.infoBg     },
  'artist-received':  { label: 'Artist Received', color: vault.warn,       bg: vault.warnBg     },
  signed:             { label: 'Signed',          color: vault.accentText, bg: vault.glow       },
  'shipped-back':     { label: 'Shipped Back',    color: vault.violet,     bg: vault.violetBg   },
  complete:           { label: 'Complete',        color: vault.ok,         bg: vault.okBg       },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  unpaid:  { label: 'Unpaid',  color: vault.danger, bg: vault.dangerBg },
  partial: { label: 'Partial', color: vault.warn,   bg: vault.warnBg   },
  paid:    { label: 'Paid',    color: vault.ok,     bg: vault.okBg     },
};

const STATUS_ORDER: CardStatus[] = ['collecting', 'sent', 'artist-received', 'signed', 'shipped-back', 'complete'];

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

const styles = signingTrackerStyles;
const smallInput = trackerInput;
const smallSelect = trackerSelect;
const chipSx = toneChip;

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
    <Box sx={[styles.row, { display: 'grid', gridTemplateColumns: GRID_COLS }, isEven ? styles.rowStriped : {}]}>
      <Box sx={styles.cell}>{txt('cardName')}</Box>

      <Box sx={styles.cell}>
        <TextField
          type="number"
          value={row.quantity}
          onChange={e => onChange({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
          disabled={disabled}
          size="small"
          fullWidth
          inputProps={{ min: 1, style: { padding: '4px', textAlign: 'center' } }}
          sx={smallInput}
        />
      </Box>

      <Box sx={styles.cell}>{txt('set')}</Box>

      <Box sx={styles.cell}>
        <Select value={row.foil} onChange={e => onChange({ foil: e.target.value as FoilType })}
          disabled={disabled} size="small" sx={smallSelect}>
          <MenuItem value="non-foil" sx={trackerMenuItem}>Non-Foil</MenuItem>
          <MenuItem value="foil" sx={trackerMenuItem}>Foil</MenuItem>
        </Select>
      </Box>

      <Box sx={styles.cell}>{txt('owner')}</Box>
      <Box sx={styles.cell}>{txt('artist')}</Box>
      <Box sx={styles.cell}>{txt('signatureType')}</Box>
      <Box sx={styles.cell}>{txt('sigNotes')}</Box>

      <Box sx={styles.cell}>
        <TextField
          type="number"
          value={row.pricePerSig || ''}
          onChange={e => onChange({ pricePerSig: parseFloat(e.target.value) || 0 })}
          disabled={disabled}
          size="small"
          fullWidth
          inputProps={{ min: 0, step: 0.01, style: { padding: '4px 8px' } }}
          sx={smallInput}
        />
      </Box>

      <Box sx={styles.totalCell}>${total}</Box>

      <Box sx={styles.cell}>
        <Select value={row.paymentStatus}
          onChange={e => onChange({ paymentStatus: e.target.value as PaymentStatus })}
          disabled={disabled} size="small"
          renderValue={val => (
            <Chip label={PAYMENT_CONFIG[val as PaymentStatus].label} size="small"
              sx={chipSx(PAYMENT_CONFIG[val as PaymentStatus])} />
          )}
          sx={smallSelect}>
          {(Object.keys(PAYMENT_CONFIG) as PaymentStatus[]).map(s => (
            <MenuItem key={s} value={s} sx={trackerMenuItem}>
              <Chip label={PAYMENT_CONFIG[s].label} size="small" sx={chipSx(PAYMENT_CONFIG[s])} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={styles.cell}>
        <Select value={row.status}
          onChange={e => onChange({ status: e.target.value as CardStatus })}
          disabled={disabled} size="small"
          renderValue={val => (
            <Chip label={STATUS_CONFIG[val as CardStatus].label} size="small"
              sx={chipSx(STATUS_CONFIG[val as CardStatus])} />
          )}
          sx={smallSelect}>
          {(Object.keys(STATUS_CONFIG) as CardStatus[]).map(s => (
            <MenuItem key={s} value={s} sx={trackerMenuItem}>
              <Chip label={STATUS_CONFIG[s].label} size="small" sx={chipSx(STATUS_CONFIG[s])} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={styles.cell}>
        <Select value={row.signingMethod}
          onChange={e => onChange({ signingMethod: e.target.value as SigningMethod })}
          disabled={disabled} size="small" sx={smallSelect}>
          {(Object.keys(SIGNING_METHOD_LABELS) as SigningMethod[]).map(m => (
            <MenuItem key={m} value={m} sx={trackerMenuItem}>
              {SIGNING_METHOD_LABELS[m]}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={styles.cell}>
        {row.signingMethod !== 'mail-to-artist'
          ? txt('signingMethodLabel')
          : <Box component="span" sx={styles.dash}>—</Box>
        }
      </Box>

      <Box sx={styles.cell}>{txt('outboundTracking')}</Box>
      <Box sx={styles.cell}>{txt('inboundTracking')}</Box>

      <Box sx={styles.removeCell}>
        {!disabled && (
          <Tooltip title="Remove row">
            <IconButton size="small" onClick={onDelete} aria-label="Remove row" sx={styles.iconButtonDanger}>
              <Trash size={14} />
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
  const statusCounts = batch.rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Partial<Record<CardStatus, number>>);

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

  const bulkSelectSx = { ...smallSelect, height: 28 };
  const bulkPlaceholder = <Box component="span" sx={styles.bulkPlaceholder}>— pick —</Box>;

  return (
    <Box sx={[styles.panel, batch.archived ? styles.panelArchived : {}]}>
      {/* Batch header */}
      <Box sx={[styles.panelHeader, batch.expanded ? styles.panelHeaderOpen : {}]}>
        {!batch.archived && dragListeners && (
          <Box
            {...(dragListeners as React.HTMLAttributes<HTMLDivElement>)}
            aria-label="Drag to reorder batch"
            sx={styles.dragHandle}
          >
            <DotsSixVertical size={16} />
          </Box>
        )}

        <IconButton size="small"
          onClick={() => onUpdateBatch(batch.id, { expanded: !batch.expanded })}
          aria-label={batch.expanded ? 'Collapse batch' : 'Expand batch'}
          aria-expanded={batch.expanded}
          sx={styles.iconButton}>
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
            sx={styles.batchNameInput}
          />
        ) : (
          <Box
            component="span"
            onClick={() => !batch.archived && setEditingName(true)}
            sx={[styles.batchName, batch.archived ? {} : styles.batchNameEditable]}
          >
            {batch.name}
          </Box>
        )}

        <Box component="span" sx={styles.batchMeta}>
          {new Date(batch.createdAt).toLocaleDateString()} · {batch.rows.length} row{batch.rows.length !== 1 ? 's' : ''}
        </Box>

        {allComplete && !batch.archived && (
          <Chip label="All Complete" size="small" sx={chipSx(STATUS_CONFIG.complete)} />
        )}

        {!allComplete && batch.rows.length > 0 && (
          <Box sx={styles.statusChips}>
            {STATUS_ORDER.filter(s => statusCounts[s]).map(s => (
              <Chip key={s} size="small"
                label={`${statusCounts[s]} ${STATUS_CONFIG[s].label}`}
                sx={[chipSx(STATUS_CONFIG[s]), { cursor: 'default' }]}
              />
            ))}
          </Box>
        )}

        <Box sx={styles.spacer} />

        {batchTotal > 0 && (
          <Box component="span" sx={styles.batchTotal}>
            ${batchTotal.toFixed(2)}
          </Box>
        )}

        {!batch.archived ? (
          <Tooltip title="Archive batch">
            <IconButton size="small" onClick={() => onArchive(batch.id)} aria-label="Archive batch" sx={styles.iconButton}>
              <Archive size={15} />
            </IconButton>
          </Tooltip>
        ) : onUnarchive ? (
          <Tooltip title="Restore batch">
            <IconButton size="small" onClick={() => onUnarchive(batch.id)} aria-label="Restore batch" sx={styles.iconButton}>
              <ArrowCounterClockwise size={15} />
            </IconButton>
          </Tooltip>
        ) : null}

        <Tooltip title="Delete batch">
          <IconButton size="small"
            onClick={() => {
              if (window.confirm(`Delete "${batch.name}"? This cannot be undone.`)) onDelete(batch.id);
            }}
            aria-label="Delete batch"
            sx={styles.iconButtonDanger}>
            <Trash size={15} />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={batch.expanded} unmountOnExit>
        {/* Bulk-set bar */}
        {!batch.archived && batch.rows.length > 0 && (
          <Box sx={styles.bulkBar}>
            <MonoLabel tone="accent" tracking="tight">Set all rows</MonoLabel>

            <Box sx={styles.bulkGroup}>
              <Box component="span" sx={styles.bulkLabel}>Status</Box>
              <Select value={bulkStatus} displayEmpty
                onChange={e => applyBulkStatus(e.target.value as string)}
                size="small"
                inputProps={{ 'aria-label': 'Set status for all rows' }}
                renderValue={val =>
                  val
                    ? <Chip label={STATUS_CONFIG[val as CardStatus].label} size="small"
                        sx={chipSx(STATUS_CONFIG[val as CardStatus])} />
                    : bulkPlaceholder
                }
                sx={{ ...bulkSelectSx, width: 140 }}>
                {(Object.keys(STATUS_CONFIG) as CardStatus[]).map(s => (
                  <MenuItem key={s} value={s} sx={trackerMenuItem}>
                    <Chip label={STATUS_CONFIG[s].label} size="small" sx={chipSx(STATUS_CONFIG[s])} />
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={styles.bulkGroup}>
              <Box component="span" sx={styles.bulkLabel}>Payment</Box>
              <Select value={bulkPayment} displayEmpty
                onChange={e => applyBulkPayment(e.target.value as string)}
                size="small"
                inputProps={{ 'aria-label': 'Set payment for all rows' }}
                renderValue={val =>
                  val
                    ? <Chip label={PAYMENT_CONFIG[val as PaymentStatus].label} size="small"
                        sx={chipSx(PAYMENT_CONFIG[val as PaymentStatus])} />
                    : bulkPlaceholder
                }
                sx={{ ...bulkSelectSx, width: 112 }}>
                {(Object.keys(PAYMENT_CONFIG) as PaymentStatus[]).map(s => (
                  <MenuItem key={s} value={s} sx={trackerMenuItem}>
                    <Chip label={PAYMENT_CONFIG[s].label} size="small" sx={chipSx(PAYMENT_CONFIG[s])} />
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={styles.bulkGroup}>
              <Box component="span" sx={styles.bulkLabel}>Method</Box>
              <Select value={bulkMethod} displayEmpty
                onChange={e => applyBulkMethod(e.target.value as string)}
                size="small"
                inputProps={{ 'aria-label': 'Set method for all rows' }}
                renderValue={val =>
                  val ? SIGNING_METHOD_LABELS[val as SigningMethod] : bulkPlaceholder
                }
                sx={{ ...bulkSelectSx, width: 134 }}>
                {(Object.keys(SIGNING_METHOD_LABELS) as SigningMethod[]).map(m => (
                  <MenuItem key={m} value={m} sx={trackerMenuItem}>
                    {SIGNING_METHOD_LABELS[m]}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        )}

        {/* Scrollable table */}
        <Box sx={styles.tableScroll}>
          <Box sx={styles.tableInner}>
            <Box sx={[styles.headerRow, { display: 'grid', gridTemplateColumns: GRID_COLS }]}>
              {COL_HEADERS.map((h, i) => (
                i === 0 ? (
                  <Box
                    key={i}
                    component="button"
                    type="button"
                    onClick={toggleSort}
                    aria-label={`Sort by card name${sortDir ? ` (${sortDir === 'asc' ? 'ascending' : 'descending'})` : ''}`}
                    sx={[styles.sortHeader, sortDir ? styles.sortHeaderActive : {}]}
                  >
                    <MonoLabel tone="inherit" size={10} tracking="tight">{h}</MonoLabel>
                    {sortDir === 'desc' ? <CaretDown size={10} /> : sortDir === 'asc' ? <CaretUp size={10} /> : <CaretDown size={10} />}
                  </Box>
                ) : (
                  <MonoLabel key={i} size={10} tracking="tight" sx={styles.colHeader}>
                    {h}
                  </MonoLabel>
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
              <Box sx={styles.emptyRows}>No cards in this batch.</Box>
            )}
          </Box>
        </Box>

        <Box sx={styles.panelFooter}>
          {!batch.archived && (
            <Button startIcon={<Plus size={13} weight="bold" />} onClick={() => onAddRow(batch.id)} size="small"
              sx={styles.addCardButton}>
              Add card
            </Button>
          )}
          <Box sx={styles.spacer} />
          {batchTotal > 0 && (
            <Box component="span" sx={styles.footerTotal}>
              Batch total: <strong>${batchTotal.toFixed(2)}</strong>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
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

  const apolloClient = useApolloClient();

  const [batches, setBatches] = useState<SigningBatch[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  const [saveSigningBatch] = useMutation(SAVE_SIGNING_BATCH);
  const [deleteSigningBatchMutation] = useMutation(DELETE_SIGNING_BATCH);
  const [reorderSigningBatchesMutation] = useMutation(REORDER_SIGNING_BATCHES);

  const hasMigrated = useRef(false);

  const { data: signingData } = useQuery(GET_SIGNING_BATCHES, {
    skip: !isLoggedIn,
    fetchPolicy: 'cache-and-network',
  });

  // On mount: seed from Apollo cache so repeat visits skip the network wait.
  // Wrapped in startTransition so the heavy component tree renders concurrently
  // (browser stays responsive / loading spinner stays visible) instead of
  // blocking the main thread until the full tree is painted.
  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      const cached: any = apolloClient.readQuery({ query: GET_SIGNING_BATCHES });
      if (cached?.signingBatches?.length) {
        startTransition(() => {
          setBatches((cached.signingBatches as any[]).map(b => ({ ...fromDbBatch(b), expanded: false })));
          setDbInitialized(true);
        });
      }
    } catch {}
    // Mount-only: seeds from whatever is already cached at load time. If isLoggedIn
    // flips true later, the cache is empty anyway (first login) and the signingData
    // effect below picks up the freshly-fetched data, so re-running this on
    // isLoggedIn/apolloClient changes would add nothing.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update from fresh network data (also handles first-login localStorage migration)
  useEffect(() => {
    if (!signingData) return;
    const dbBatches: SigningBatch[] = (signingData.signingBatches ?? []).map(fromDbBatch);
    if (dbBatches.length === 0 && !hasMigrated.current) {
      hasMigrated.current = true;
      // Auto-migrate localStorage data on first login
      const local = load();
      if (local.length > 0) {
        setBatches(local.map(b => ({ ...b, expanded: false })));
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
      setDbInitialized(true);
    } else {
      startTransition(() => {
        // Functional update: preserve any batches the user already opened
        // while waiting for the network response, rather than snapping them shut.
        setBatches(prev => {
          const expandedMap = new Map(prev.map(b => [b.id, b.expanded]));
          return dbBatches.map(b => ({ ...b, expanded: expandedMap.get(b.id) ?? false }));
        });
        setDbInitialized(true);
      });
    }
    // Only signingData should retrigger this: hasMigrated is a ref, saveSigningBatch
    // is a stable mutate function, and load() is a pure import — none of them are
    // meant to cause a re-run.
  }, [signingData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload from localStorage when auth state changes (e.g. logout mid-session)
  useEffect(() => {
    if (!isLoggedIn) {
      setBatches(load().map(b => ({ ...b, expanded: false })));
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
      <Box sx={styles.page}>
        <Box sx={styles.inner}>
          <Box role="status" sx={styles.loading}>Loading…</Box>
        </Box>
      </Box>
    );
  }

  const activeCardCount = active.reduce((sum, b) => sum + b.rows.length, 0);

  return (
    <Box sx={styles.page}>
      <Box sx={styles.inner}>

        {/* Page header */}
        <Box sx={styles.hero}>
          <Box>
            <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
              {active.length} active {active.length === 1 ? 'batch' : 'batches'} · {activeCardCount} {activeCardCount === 1 ? 'card' : 'cards'}
            </MonoLabel>
            <Box component="h1" sx={styles.title}>
              Signing tracker
            </Box>
            <Box component="p" sx={styles.subtitle}>
              Track cards sent out for signatures
            </Box>
          </Box>
          <Box sx={styles.actions}>
            {active.length > 0 && (
              <Button onClick={toggleAllExpanded} sx={styles.secondaryButton}>
                {anyExpanded ? 'Collapse all' : 'Expand all'}
              </Button>
            )}
            <Button startIcon={<Plus size={16} weight="bold" />} onClick={createBatch} sx={styles.primaryButton}>
              New batch
            </Button>
          </Box>
        </Box>

        {!isLoggedIn && (
          <Box sx={styles.notice}>
            You're not logged in — data is saved in your browser only. Log in to sync across devices.
          </Box>
        )}

        {/* Active batches — sortable */}
        {active.length === 0 ? (
          <Box sx={styles.emptyPanel}>
            No active batches. Click "New batch" to start tracking.
          </Box>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={active.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <Box sx={styles.batchList}>
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
          <Box component="section" sx={styles.archivedSection}>
            <Box
              component="button"
              type="button"
              onClick={() => setShowArchived(v => !v)}
              aria-expanded={showArchived}
              sx={styles.archivedToggle}
            >
              {showArchived ? <CaretDown size={14} /> : <CaretRight size={14} />}
              Archived batches
              <MonoLabel tone="faint" tracking="tight">{archived.length}</MonoLabel>
            </Box>
            <Collapse in={showArchived}>
              <Box sx={styles.batchList}>
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

      </Box>
    </Box>
  );
};

export default SigningTracker;
