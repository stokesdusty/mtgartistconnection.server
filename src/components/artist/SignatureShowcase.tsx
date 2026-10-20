import { useState } from "react";
import { Box } from "@mui/material";
import { artistStyles } from "../../styles/artist-styles";
import { EMPTY_SIGNATURE_IMAGE, SignatureExample } from "../../utils/signatureExamples";
import MonoLabel from "../shared/MonoLabel";
import Slab from "../shared/Slab";

/** The big signature slab, plus labelled thumbnails to switch between examples. */
const SignatureShowcase = ({ artistName, examples }: { artistName: string; examples: SignatureExample[] }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = examples.find((e) => e.id === selectedId) ?? examples[0];
  const many = examples.length > 1;

  return (
    <Box component="section" aria-labelledby="artist-signature-label" sx={artistStyles.signature}>
      <MonoLabel component="h2" id="artist-signature-label">
        {many ? "Example signatures" : "Example signature"}
      </MonoLabel>
      <Slab
        src={selected?.imageUrl ?? EMPTY_SIGNATURE_IMAGE}
        alt={selected ? `${artistName} signature example: ${selected.label}` : `No signature example for ${artistName} yet`}
        aspectRatio="63 / 88"
        size="lg"
        sx={artistStyles.signatureSlab}
      />
      {/* A lone "Signature" label would just repeat the heading. */}
      {selected && !many && selected.label.toLowerCase() !== "signature" && (
        <Box component="p" sx={artistStyles.signatureCaption}>{selected.label}</Box>
      )}
      {many && (
        <Box component="ul" aria-label="Signature types" sx={artistStyles.signatureThumbs}>
          {examples.map((example) => (
            <li key={example.id}>
              <Box
                component="button"
                type="button"
                aria-pressed={example.id === selected?.id}
                onClick={() => setSelectedId(example.id)}
                sx={artistStyles.signatureThumb}
              >
                <img src={example.imageUrl} alt="" loading="lazy" decoding="async" />
                <Box component="span" sx={artistStyles.signatureThumbLabel}>{example.label}</Box>
              </Box>
            </li>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SignatureShowcase;
