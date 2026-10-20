import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { Autocomplete, Box, Button, IconButton, TextField, Tooltip } from "@mui/material";
import { ArrowDown, ArrowUp, ImageSquare, Trash } from "@phosphor-icons/react";
import {
  ADD_SIGNATURE_EXAMPLE,
  REMOVE_SIGNATURE_EXAMPLE,
  REORDER_SIGNATURE_EXAMPLES,
  UPDATE_SIGNATURE_EXAMPLE,
} from "../graphql/mutations";
import {
  MAX_SIGNATURE_EXAMPLES,
  MAX_SIGNATURE_LABEL_LENGTH,
  moveExample,
  prepareSignatureImage,
  SIGNATURE_LABEL_SUGGESTIONS,
  SignatureExample,
} from "../../utils/signatureExamples";
import { signatureManagerStyles as styles } from "../../styles/signature-manager-styles";

// The old single image comes back from the API with this id prefix until the
// first upload saves it as a real example, so it can't be renamed or moved yet.
const isUnsavedLegacy = (example: SignatureExample) => example.id.startsWith("legacy-");

/**
 * Add, rename, reorder and remove an artist's signature examples. Changes save
 * right away; each mutation returns the artist's list, which Apollo merges into
 * the cached artist so the parent re-renders with the new `examples`.
 */
const SignatureExamplesManager = ({ artistId, examples }: { artistId: string; examples: SignatureExample[] }) => {
  const [addExample, { loading: adding }] = useMutation(ADD_SIGNATURE_EXAMPLE);
  const [updateExample] = useMutation(UPDATE_SIGNATURE_EXAMPLE);
  const [removeExample] = useMutation(REMOVE_SIGNATURE_EXAMPLE);
  const [reorderExamples] = useMutation(REORDER_SIGNATURE_EXAMPLES);

  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const atLimit = examples.length >= MAX_SIGNATURE_EXAMPLES;

  const run = async (id: string | null, action: () => Promise<unknown>) => {
    setError("");
    setBusyId(id);
    try {
      await action();
      return true;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    setPreview(picked ? URL.createObjectURL(picked) : null);
  };

  const handleAdd = async () => {
    if (!file) return;
    const label = newLabel.trim();
    const ok = await run(null, async () => {
      const image = await prepareSignatureImage(file);
      await addExample({ variables: { artistId, label, ...image } });
    });
    if (ok) {
      setFile(null);
      setPreview(null);
      setNewLabel("");
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const handleRename = (example: SignatureExample, label: string) => {
    if (!label.trim() || label.trim() === example.label) return;
    run(example.id, () => updateExample({ variables: { artistId, exampleId: example.id, label: label.trim() } }));
  };

  const handleRemove = (example: SignatureExample) => {
    if (!window.confirm(`Remove the "${example.label}" signature example?`)) return;
    run(example.id, () => removeExample({ variables: { artistId, exampleId: example.id } }));
  };

  const handleMove = (index: number, delta: -1 | 1) =>
    run(examples[index].id, () => reorderExamples({ variables: { artistId, exampleIds: moveExample(examples, index, delta) } }));

  return (
    <Box>
      {examples.length > 0 && (
        <Box component="ul" aria-label="Signature examples" sx={styles.list}>
          {examples.map((example, index) => {
            const legacy = isUnsavedLegacy(example);
            const busy = busyId === example.id;
            return (
              <Box component="li" key={example.id} sx={styles.item}>
                <Box component="img" src={example.imageUrl} alt="" sx={styles.thumb} />
                <ExampleLabel
                  example={example}
                  disabled={legacy || busy}
                  onCommit={(label) => handleRename(example, label)}
                />
                <Box sx={styles.actions}>
                  <Tooltip title="Move up">
                    <span>
                      <IconButton
                        size="small"
                        aria-label={`Move ${example.label} up`}
                        disabled={index === 0 || busy || legacy}
                        onClick={() => handleMove(index, -1)}
                        sx={styles.iconButton}
                      >
                        <ArrowUp size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move down">
                    <span>
                      <IconButton
                        size="small"
                        aria-label={`Move ${example.label} down`}
                        disabled={index === examples.length - 1 || busy || legacy}
                        onClick={() => handleMove(index, 1)}
                        sx={styles.iconButton}
                      >
                        <ArrowDown size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <span>
                      <IconButton
                        size="small"
                        aria-label={`Remove ${example.label}`}
                        disabled={busy}
                        onClick={() => handleRemove(example)}
                        sx={styles.iconButton}
                      >
                        <Trash size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {atLimit ? (
        <Box sx={styles.hint}>
          That's the maximum of {MAX_SIGNATURE_EXAMPLES}. Remove one to add another.
        </Box>
      ) : (
        <Box sx={styles.addRow}>
          <Button component="label" sx={styles.pickButton} aria-label={file ? "Change photo" : "Choose a photo"}>
            {preview ? (
              <Box component="img" src={preview} alt="" sx={[styles.thumb, { border: "none" }]} />
            ) : (
              <ImageSquare size={22} aria-hidden />
            )}
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickFile} />
          </Button>
          <Autocomplete
            freeSolo
            options={SIGNATURE_LABEL_SUGGESTIONS}
            inputValue={newLabel}
            onInputChange={(_e, value) => setNewLabel(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Signature type"
                placeholder="e.g. Regular, Shadow, Sketch"
                inputProps={{ ...params.inputProps, maxLength: MAX_SIGNATURE_LABEL_LENGTH }}
                sx={styles.input}
              />
            )}
          />
          <Button sx={styles.button} onClick={handleAdd} disabled={!file || !newLabel.trim() || adding}>
            {adding ? "Uploading…" : "Add example"}
          </Button>
        </Box>
      )}

      {examples.some(isUnsavedLegacy) && (
        <Box sx={styles.hint}>The current photo can be renamed or reordered once you add another example.</Box>
      )}
      {error && (
        <Box role="alert" sx={[styles.error, { mt: "10px" }]}>
          {error}
        </Box>
      )}
    </Box>
  );
};

/** A label field that saves on blur or Enter. */
function ExampleLabel({
  example,
  disabled,
  onCommit,
}: {
  example: SignatureExample;
  disabled: boolean;
  onCommit: (label: string) => void;
}) {
  const [value, setValue] = useState(example.label);
  useEffect(() => setValue(example.label), [example.label]);

  return (
    <TextField
      size="small"
      value={value}
      disabled={disabled}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => (value.trim() ? onCommit(value) : setValue(example.label))}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      inputProps={{ maxLength: MAX_SIGNATURE_LABEL_LENGTH, "aria-label": `Label for ${example.label}` }}
      sx={styles.input}
    />
  );
}

export default SignatureExamplesManager;
