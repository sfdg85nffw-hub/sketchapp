import { mediumLabel, subjectLabel } from '../data/catalog';
import { weaknessById } from '../data/weaknesses';
import { canvasToBlob, decodeImage } from '../db/images';
import { RATING_LABELS } from '../lib/critique';
import { formatDayLong } from '../lib/dates';
import { fitWithin } from '../lib/image/filters';
import type { Entry, Rating } from '../lib/types';

const WIDTH = 1200;
const MARGIN = 56;
const INK = '#1c1b18';
const SOFT = '#48453d';
const PAPER = '#f5f0e6';
const SERIF = "'Iowan Old Style', Palatino, Georgia, serif";
const SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** The rating mark as a shape: empty, half-filled or solid circle. */
function drawRating(ctx: CanvasRenderingContext2D, rating: Rating, cx: number, cy: number, r: number): void {
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  if (rating === 2) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  } else if (rating === 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI / 2, Math.PI * 1.5);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

interface Block {
  height: number;
  draw: (y: number) => void;
}

/**
 * One shareable image: the photo with the entry's facts and reflection answers set
 * neatly underneath, ready to send to a teacher, a friend, or an AI assistant.
 */
export async function buildCritiqueImage(entry: Entry, photo: Blob): Promise<Blob> {
  const image = await decodeImage(photo);
  const photoSize = fitWithin(image.naturalWidth, image.naturalHeight, 1600);
  const scale = Math.min(1, (WIDTH - MARGIN * 2) / photoSize.width);
  const pw = Math.round(photoSize.width * scale);
  const ph = Math.round(photoSize.height * scale);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not build the image.');
  const textWidth = WIDTH - MARGIN * 2;
  const blocks: Block[] = [];

  const text = (content: string, font: string, color: string, lineHeight: number, gapAfter: number, indent = 0) => {
    ctx.font = font;
    const lines = wrap(ctx, content, textWidth - indent);
    blocks.push({
      height: lines.length * lineHeight + gapAfter,
      draw: (y) => {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';
        lines.forEach((line, i) => ctx.fillText(line, MARGIN + indent, y + i * lineHeight));
      },
    });
  };

  text(formatDayLong(entry.date), `600 44px ${SERIF}`, INK, 54, 6);
  const facts = [subjectLabel(entry.subject), mediumLabel(entry.medium), entry.location, entry.minutes ? `${entry.minutes} min` : null]
    .filter(Boolean)
    .join('  ·  ');
  text(facts, `500 28px ${SANS}`, SOFT, 38, 10);
  text(`Feeling word: ${entry.feeling ?? 'none chosen'}`, `italic 500 32px ${SERIF}`, INK, 42, 8);
  if (entry.plan?.focal) text(`Focal point: ${entry.plan.focal}`, `400 28px ${SANS}`, SOFT, 38, 8);
  if (entry.weaknessIds.length) {
    text(`Working on: ${entry.weaknessIds.map((id) => weaknessById(id).skill).join(', ')}`, `400 28px ${SANS}`, SOFT, 38, 8);
  }

  const items = entry.reflection?.items ?? [];
  blocks.push({
    height: 40,
    draw: (y) => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(MARGIN, y + 16);
      ctx.bezierCurveTo(WIDTH * 0.3, y + 10, WIDTH * 0.6, y + 22, WIDTH - MARGIN, y + 15);
      ctx.stroke();
    },
  });
  text(items.length ? 'My own answers' : 'No self-reflection yet', `700 24px ${SANS}`, SOFT, 32, 14);

  for (const item of items) {
    ctx.font = `500 30px ${SANS}`;
    const lines = wrap(ctx, item.prompt, textWidth - 64);
    const noteLines = item.note ? (ctx.font = `italic 400 28px ${SERIF}`, wrap(ctx, `“${item.note}”`, textWidth - 64)) : [];
    blocks.push({
      height: lines.length * 40 + 40 + noteLines.length * 38 + 22,
      draw: (y) => {
        drawRating(ctx, item.rating, MARGIN + 18, y + 20, 15);
        ctx.textBaseline = 'top';
        ctx.fillStyle = INK;
        ctx.font = `500 30px ${SANS}`;
        lines.forEach((line, i) => ctx.fillText(line, MARGIN + 64, y + i * 40));
        ctx.font = `700 28px ${SANS}`;
        ctx.fillText(RATING_LABELS[item.rating], MARGIN + 64, y + lines.length * 40 + 2);
        ctx.font = `italic 400 28px ${SERIF}`;
        ctx.fillStyle = SOFT;
        noteLines.forEach((line, i) => ctx.fillText(line, MARGIN + 64, y + lines.length * 40 + 40 + i * 38));
      },
    });
  }
  text('Sketchbook Coach', `600 22px ${SANS}`, SOFT, 30, 0);

  const textHeight = blocks.reduce((sum, b) => sum + b.height, 0);
  canvas.width = WIDTH;
  canvas.height = MARGIN + ph + 40 + textHeight + MARGIN;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const px = Math.round((WIDTH - pw) / 2);
  ctx.drawImage(image, px, MARGIN, pw, ph);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(px, MARGIN, pw, ph);

  let y = MARGIN + ph + 40;
  for (const block of blocks) {
    block.draw(y);
    y += block.height;
  }
  return canvasToBlob(canvas, 'image/jpeg', 0.9);
}
