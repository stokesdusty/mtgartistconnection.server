import { MEDIA_BASE_URL } from '../config/media';

// Must match services/signatureExamples.ts in the webservice.
export const MAX_SIGNATURE_EXAMPLES = 8;
export const MAX_SIGNATURE_LABEL_LENGTH = 40;

export const SIGNATURE_LABEL_SUGGESTIONS = ['Regular', 'Shadow', 'Sketch', 'Doodle', 'Initials', 'Personalized'];

export const EMPTY_SIGNATURE_IMAGE = `${MEDIA_BASE_URL}/emptycardframe.jpg`;

export interface SignatureExample {
  id: string;
  imageUrl: string;
  label: string;
}

// Non-admin requests are capped at 1MB, so photos are scaled down before
// upload. 1400px on the long side is plenty for a card-sized slab.
const MAX_DIMENSION = 1400;
const TARGET_BYTES = 600 * 1024;

export const fileToBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file doesn't look like an image.")); };
    img.src = url;
  });

const toJpeg = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't process that image."))), 'image/jpeg', quality));

/** Scales a photo down to a JPEG small enough to upload, as a data URL. */
export async function prepareSignatureImage(file: File): Promise<{ base64Data: string; contentType: string }> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a PNG, JPEG or WebP image.');
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Couldn't process that image.");
  // White behind transparent PNGs, since JPEG has no alpha.
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let blob = await toJpeg(canvas, 0.85);
  if (blob.size > TARGET_BYTES) blob = await toJpeg(canvas, 0.7);
  return { base64Data: await fileToBase64(blob), contentType: 'image/jpeg' };
}

/** The ids in a new order after moving one example up or down. */
export function moveExample(examples: SignatureExample[], index: number, delta: -1 | 1): string[] {
  const ids = examples.map((e) => e.id);
  const target = index + delta;
  if (target < 0 || target >= ids.length) return ids;
  [ids[index], ids[target]] = [ids[target], ids[index]];
  return ids;
}
