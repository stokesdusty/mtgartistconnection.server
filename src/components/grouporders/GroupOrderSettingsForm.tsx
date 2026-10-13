import { FormEvent, useMemo, useState } from "react";
import { Autocomplete, Box, Button, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from "@mui/material";
import { ArrowLineDown, Plus, Trash, X } from "@phosphor-icons/react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_ARTISTSBYEVENTID, GET_ARTIST_NAMES, GET_SIGNINGEVENTS } from "../graphql/queries";
import { groupOrderStyles as styles } from "../../styles/group-order-styles";
import { daysUntil, formatDateRangeWithYear } from "../../utils/eventDates";
import {
  discordNameError,
  newArtistRow,
  newId,
  PAYMENT_TIMING_ORGANIZER_HINTS,
  PAYMENT_TIMING_LABELS,
  PaymentTiming,
  SettingsForm,
  SettingsInput,
  settingsInputFromForm,
} from "../../utils/groupOrders";
import MonoLabel from "../shared/MonoLabel";
import SegmentedControl from "../shared/SegmentedControl";

interface Props {
  initial: SettingsForm;
  submitLabel: string;
  /** Throws (or rejects) with a user-facing message when the server says no. */
  onSubmit: (input: SettingsInput) => Promise<void>;
  onCancel?: () => void;
}

const Field = ({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) => (
  <Box sx={styles.field}>
    <Box component="label" htmlFor={id}><MonoLabel tracking="tight">{label}</MonoLabel></Box>
    {children}
    {hint && <Box component="p" sx={styles.fieldHint}>{hint}</Box>}
  </Box>
);

const GroupOrderSettingsForm = ({ initial, submitLabel, onSubmit, onCancel }: Props) => {
  const [form, setForm] = useState<SettingsForm>(initial);
  const [artistInput, setArtistInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: eventsData } = useQuery(GET_SIGNINGEVENTS);
  const { data: namesData } = useQuery(GET_ARTIST_NAMES);
  const [loadEventArtists, { loading: loadingEventArtists }] = useLazyQuery(GET_ARTISTSBYEVENTID);

  const update = (patch: Partial<SettingsForm>) => setForm((f) => ({ ...f, ...patch }));
  const updateArtist = (index: number, patch: Partial<SettingsForm['artists'][number]>) =>
    setForm((f) => ({ ...f, artists: f.artists.map((a, i) => (i === index ? { ...a, ...patch } : a)) }));

  // Upcoming events only, plus the chosen one if it has since passed.
  const events = useMemo(() => {
    const all: any[] = eventsData?.signingEvent ?? [];
    return all
      .filter((e) => daysUntil(e.endDate) >= 0 || e.id === form.eventId)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [eventsData, form.eventId]);

  const artistNames: string[] = useMemo(() => (namesData?.artistNames ?? []).map((a: any) => a.name), [namesData]);

  const addArtists = (names: string[]) =>
    setForm((f) => {
      const have = new Set(f.artists.map((a) => a.name.toLowerCase()));
      const fresh: string[] = [];
      for (const raw of names) {
        const name = raw.trim();
        if (!name || have.has(name.toLowerCase())) continue;
        have.add(name.toLowerCase());
        fresh.push(name);
      }
      return { ...f, artists: [...f.artists, ...fresh.map((n) => newArtistRow(n, f.signatureTypes))] };
    });

  const addTypedArtist = () => {
    addArtists([artistInput]);
    setArtistInput('');
  };

  const addEventArtists = async () => {
    if (!form.eventId) return;
    const { data } = await loadEventArtists({ variables: { eventId: form.eventId } });
    addArtists((data?.mapArtistToEventByEventId ?? []).map((a: any) => a.artistName).sort((a: string, b: string) => a.localeCompare(b)));
  };

  const addSignatureType = () =>
    setForm((f) => {
      const id = newId();
      // Existing artists start without the new type; the organizer turns on the cells that apply.
      return { ...f, signatureTypes: [...f.signatureTypes, { id, label: '' }] };
    });

  const removeSignatureType = (id: string) =>
    setForm((f) => ({ ...f, signatureTypes: f.signatureTypes.filter((t) => t.id !== id) }));

  const setCell = (index: number, typeId: string, value: string | null) =>
    setForm((f) => ({
      ...f,
      artists: f.artists.map((a, i) => {
        if (i !== index) return a;
        const cells = { ...a.cells };
        if (value === null) delete cells[typeId];
        else cells[typeId] = value;
        return { ...a, cells };
      }),
    }));

  const copyFromAbove = (index: number) => updateArtist(index, { cells: { ...form.artists[index - 1].cells } });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const result = settingsInputFromForm(form);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(result.input);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const discordError = discordNameError(form.organizerDiscordName);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={styles.sections}>
      {/* ── Basics ─────────────────────────────────────────────────────── */}
      <Box component="section" aria-labelledby="setup-basics" sx={styles.panel}>
        <Box component="h2" id="setup-basics" sx={styles.sectionTitle}>The order</Box>
        <Box component="p" sx={styles.sectionIntro}>Everyone with the invite link sees these, so they know who's running it and when.</Box>
        <Box sx={styles.fields}>
          <Field id="go-name" label="Order name">
            <TextField id="go-name" size="small" fullWidth value={form.name} onChange={(e) => update({ name: e.target.value })}
              placeholder="e.g. MagicCon Vegas signing run" inputProps={{ maxLength: 100 }} sx={styles.input} />
          </Field>
          <Field id="go-event" label="Signing event" hint="Optional. Picking one lets you add its confirmed artists in one go.">
            <TextField id="go-event" select size="small" fullWidth value={form.eventId ?? ''} onChange={(e) => update({ eventId: e.target.value || null })} sx={styles.input}>
              <MenuItem value="">No event</MenuItem>
              {events.map((e) => (
                <MenuItem key={e.id} value={e.id}>{e.name} · {formatDateRangeWithYear(e.startDate, e.endDate)}</MenuItem>
              ))}
            </TextField>
          </Field>
          <Field id="go-discord" label="Your Discord name"
            hint="Shown on the invite page so people from your Discord group can tell it's you. Strongly recommended.">
            <TextField id="go-discord" size="small" fullWidth value={form.organizerDiscordName}
              onChange={(e) => update({ organizerDiscordName: e.target.value })} error={!!discordError} helperText={discordError ?? undefined}
              placeholder="e.g. card.runner" inputProps={{ maxLength: 40, autoComplete: 'off' }} sx={styles.input} />
          </Field>
        </Box>
      </Box>

      {/* ── Signature types and price grid ─────────────────────────────── */}
      <Box component="section" aria-labelledby="setup-prices" sx={styles.panel}>
        <Box component="h2" id="setup-prices" sx={styles.sectionTitle}>Artists and prices</Box>
        <Box component="p" sx={styles.sectionIntro}>
          Set an all-in price per card for each artist and signature type. Leave a price blank for TBD: people can still join and ship,
          and you fill it in later. Switch off anything an artist doesn't offer.
        </Box>

        <MonoLabel tracking="tight" sx={{ display: 'block', mb: 1 }}>Signature types</MonoLabel>
        <Box sx={styles.typeList}>
          {form.signatureTypes.map((t, i) => (
            <TextField
              key={t.id}
              size="small"
              value={t.label}
              onChange={(e) => update({ signatureTypes: form.signatureTypes.map((x) => (x.id === t.id ? { ...x, label: e.target.value } : x)) })}
              placeholder="e.g. Sketch"
              inputProps={{ maxLength: 40, 'aria-label': `Signature type ${i + 1}` }}
              sx={[styles.input, styles.typeInput]}
              InputProps={form.signatureTypes.length > 1 ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label={`Remove ${t.label || 'signature type'}`} onClick={() => removeSignatureType(t.id)} sx={styles.iconButton}>
                      <X size={14} />
                    </IconButton>
                  </InputAdornment>
                ),
              } : undefined}
            />
          ))}
          <Button startIcon={<Plus size={14} />} onClick={addSignatureType} sx={styles.smallButton}>Add type</Button>
        </Box>

        {form.artists.length > 0 && (
          <Box sx={styles.gridScroll}>
            <Box component="table" sx={styles.gridTable}>
              <thead>
                <tr>
                  <th scope="col">Artist</th>
                  <th scope="col">Cap</th>
                  {form.signatureTypes.map((t) => <th key={t.id} scope="col">{t.label || 'New type'}</th>)}
                  <th scope="col" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {form.artists.map((artist, i) => (
                  <tr key={artist.name}>
                    <th scope="row">{artist.name}</th>
                    <td>
                      <TextField size="small" value={artist.cap} onChange={(e) => updateArtist(i, { cap: e.target.value })}
                        placeholder="None" inputProps={{ inputMode: 'numeric', 'aria-label': `${artist.name} card cap` }}
                        sx={[styles.cellInput, styles.capInput]} />
                    </td>
                    {form.signatureTypes.map((t) => {
                      const value = artist.cells[t.id];
                      const label = `${artist.name} ${t.label || 'new type'}`;
                      return (
                        <td key={t.id}>
                          {value === undefined ? (
                            <Button aria-label={`Offer ${label}`} onClick={() => setCell(i, t.id, '')} sx={styles.offButton}>— Offer</Button>
                          ) : (
                            <Box sx={styles.cellControls}>
                              <TextField size="small" value={value} onChange={(e) => setCell(i, t.id, e.target.value)} placeholder="TBD"
                                inputProps={{ inputMode: 'decimal', 'aria-label': `${label} price` }}
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                sx={styles.cellInput} />
                              <Tooltip title="Not offered">
                                <IconButton size="small" aria-label={`${label} not offered`} onClick={() => setCell(i, t.id, null)} sx={styles.iconButton}>
                                  <X size={14} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </td>
                      );
                    })}
                    <td>
                      <Box sx={styles.cellControls}>
                        {i > 0 && (
                          <Tooltip title="Copy prices from the artist above">
                            <IconButton size="small" aria-label={`Copy prices to ${artist.name} from the artist above`} onClick={() => copyFromAbove(i)} sx={styles.iconButton}>
                              <ArrowLineDown size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Remove artist">
                          <IconButton size="small" aria-label={`Remove ${artist.name}`}
                            onClick={() => update({ artists: form.artists.filter((_, j) => j !== i) })} sx={styles.iconButton}>
                            <Trash size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        )}

        <Box sx={styles.addRow}>
          <Autocomplete
            freeSolo
            options={artistNames}
            inputValue={artistInput}
            onInputChange={(_e, value) => setArtistInput(value)}
            onChange={(_e, value) => {
              if (typeof value === 'string' && value) {
                addArtists([value]);
                setArtistInput('');
              }
            }}
            filterOptions={(options, { inputValue }) => {
              const q = inputValue.trim().toLowerCase();
              return q ? options.filter((o) => o.toLowerCase().includes(q)).slice(0, 20) : [];
            }}
            sx={styles.artistPicker}
            renderInput={(params) => (
              <TextField {...params} size="small" placeholder="Add an artist" inputProps={{ ...params.inputProps, 'aria-label': 'Artist name' }} sx={styles.input} />
            )}
          />
          <Button startIcon={<Plus size={14} />} onClick={addTypedArtist} disabled={!artistInput.trim()} sx={styles.smallButton}>Add artist</Button>
          {form.eventId && (
            <Button onClick={addEventArtists} disabled={loadingEventArtists} sx={styles.smallButton}>
              Add the event's artists
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Payment, fees and limits ───────────────────────────────────── */}
      <Box component="section" aria-labelledby="setup-terms" sx={styles.panel}>
        <Box component="h2" id="setup-terms" sx={styles.sectionTitle}>Payment and limits</Box>
        <Box component="p" sx={styles.sectionIntro}>No money moves through the site. It only keeps the record of who owes what.</Box>
        <Box sx={styles.fields}>
          <Box sx={styles.field}>
            <MonoLabel tracking="tight">When do participants pay?</MonoLabel>
            <SegmentedControl<PaymentTiming>
              options={[
                { value: 'upfront', label: PAYMENT_TIMING_LABELS.upfront },
                { value: 'after-signing', label: PAYMENT_TIMING_LABELS['after-signing'] },
              ]}
              value={form.paymentTiming as PaymentTiming}
              onChange={(paymentTiming) => update({ paymentTiming })}
              aria-label="When do participants pay?"
              sx={{ alignSelf: 'flex-start' }}
            />
            <Box component="p" sx={styles.fieldHint}>
              {form.paymentTiming ? PAYMENT_TIMING_ORGANIZER_HINTS[form.paymentTiming] : 'Required.'}
            </Box>
          </Box>
          <Box sx={styles.fieldRow}>
            <Field id="go-fee" label="Per-person fee" hint="Optional flat fee on top of card prices.">
              <TextField id="go-fee" size="small" value={form.participantFee} onChange={(e) => update({ participantFee: e.target.value })}
                placeholder="0" inputProps={{ inputMode: 'decimal' }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} sx={styles.input} />
            </Field>
            <Field id="go-max" label="Cards per person" hint="Optional limit for each participant.">
              <TextField id="go-max" size="small" value={form.maxCardsPerParticipant} onChange={(e) => update({ maxCardsPerParticipant: e.target.value })}
                placeholder="No limit" inputProps={{ inputMode: 'numeric' }} sx={styles.input} />
            </Field>
            <Field id="go-cutoff" label="Cutoff" hint="The last day people can join and add cards.">
              <TextField id="go-cutoff" type="date" size="small" value={form.cutoff} onChange={(e) => update({ cutoff: e.target.value })}
                InputLabelProps={{ shrink: true }} sx={styles.input} />
            </Field>
          </Box>

          <Box sx={styles.field}>
            <MonoLabel tracking="tight">Return shipping options</MonoLabel>
            {form.returnOptions.map((o, i) => (
              <Box key={o.id} sx={[styles.addRow, { mt: 0 }]}>
                <TextField size="small" value={o.label} placeholder="e.g. Bubble mailer"
                  onChange={(e) => update({ returnOptions: form.returnOptions.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                  inputProps={{ maxLength: 60, 'aria-label': `Return option ${i + 1} name` }} sx={[styles.input, { flex: '1 1 220px' }]} />
                <TextField size="small" value={o.price} placeholder="0"
                  onChange={(e) => update({ returnOptions: form.returnOptions.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)) })}
                  inputProps={{ inputMode: 'decimal', 'aria-label': `Return option ${i + 1} price` }}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} sx={[styles.input, { width: 120 }]} />
                <IconButton aria-label={`Remove return option ${i + 1}`} onClick={() => update({ returnOptions: form.returnOptions.filter((_, j) => j !== i) })} sx={styles.iconButton}>
                  <Trash size={16} />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<Plus size={14} />} onClick={() => update({ returnOptions: [...form.returnOptions, { id: newId(), label: '', price: '' }] })}
              sx={[styles.smallButton, { alignSelf: 'flex-start' }]}>
              Add return option
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Instructions ───────────────────────────────────────────────── */}
      <Box component="section" aria-labelledby="setup-instructions" sx={styles.panel}>
        <Box component="h2" id="setup-instructions" sx={styles.sectionTitle}>Instructions</Box>
        <Box component="p" sx={styles.sectionIntro}>Keep your address and payment handles in the private box. Only people you approve see it.</Box>
        <Box sx={styles.fields}>
          <Field id="go-public" label="Public terms" hint="Anyone with the link sees these, e.g. turnaround, what happens if an artist doesn't show.">
            <TextField id="go-public" multiline minRows={3} fullWidth value={form.publicTerms} onChange={(e) => update({ publicTerms: e.target.value })}
              inputProps={{ maxLength: 4000 }} sx={styles.input} />
          </Field>
          <Field id="go-private" label="Private instructions" hint="Approved participants only: where to ship, how to pay.">
            <TextField id="go-private" multiline minRows={3} fullWidth value={form.privateInstructions} onChange={(e) => update({ privateInstructions: e.target.value })}
              inputProps={{ maxLength: 4000 }} sx={styles.input} />
          </Field>
        </Box>
      </Box>

      {error && <Box role="alert" sx={[styles.message, styles.messageError]}>{error}</Box>}
      <Box sx={styles.actions}>
        <Button type="submit" disabled={saving} sx={styles.primaryButton}>{saving ? 'Saving…' : submitLabel}</Button>
        {onCancel && <Button onClick={onCancel} sx={styles.secondaryButton}>Cancel</Button>}
      </Box>
    </Box>
  );
};

export default GroupOrderSettingsForm;
