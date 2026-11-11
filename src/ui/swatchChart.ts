import { canvasToBlob } from '../db/images';
import type { Paint } from '../lib/types';

/** US Letter at 200 dpi. Prints cleanly; also fine to trace onto cotton paper. */
const W = 1700;
const H = 2200;
const M = 90;
const INK = '#111111';
const FAINT = '#777777';
const SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dashed = false): void {
  ctx.setLineDash(dashed ? [10, 8] : []);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
}

/**
 * A blank swatch chart worth filling in: a labelled row per pan with a five-step
 * value strip, a warm/cool tick box and a value number, then a blue + brown mix row.
 * Boxes alternate "1st" and "2nd" so wet neighbours are never painted together.
 */
export async function buildSwatchChart(paints: readonly Paint[], blue: Paint | undefined, browns: readonly Paint[]): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not build the chart.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 3;
  ctx.textBaseline = 'alphabetic';

  ctx.font = `700 56px ${SANS}`;
  ctx.fillText('Swatch chart', M, M + 40);
  ctx.font = `400 26px ${SANS}`;
  ctx.fillStyle = FAINT;
  ctx.fillText('Write the pan name before any paint goes down. Paint the boxes marked 1st, let them dry, then the 2nd:', M, M + 86);
  ctx.fillText('wet neighbours bleed into each other. Each strip runs from full strength (left) to nearly water (right).', M, M + 120);

  const rows = Math.max(paints.length, 12);
  const mixRows = Math.max(1, browns.length);
  const top = M + 170;
  const mixBlock = 110 + mixRows * 120;
  const rowH = Math.min(128, Math.floor((H - top - M - mixBlock - 40) / rows));
  const stripX = M + 520;
  const cell = Math.min(150, Math.floor((W - M - stripX - 170) / 5));
  const cellH = rowH - 34;

  for (let i = 0; i < rows; i++) {
    const y = top + i * rowH;
    const paint = paints[i];
    ctx.fillStyle = INK;
    ctx.font = `700 28px ${SANS}`;
    ctx.fillText(`${i + 1}.`, M, y + 44);
    ctx.font = `600 28px ${SANS}`;
    if (paint && !paint.placeholder) ctx.fillText(paint.name, M + 56, y + 44);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(M + 56, y + 56);
    ctx.lineTo(M + 380, y + 56);
    ctx.stroke();
    ctx.font = `400 20px ${SANS}`;
    ctx.fillStyle = FAINT;
    ctx.fillText('name printed on the pan', M + 56, y + 82);

    ctx.lineWidth = 2;
    box(ctx, M + 404, y + 20, 28, 28);
    box(ctx, M + 404, y + 56, 28, 28);
    ctx.fillStyle = INK;
    ctx.fillText('warm', M + 440, y + 42);
    ctx.fillText('cool', M + 440, y + 78);

    ctx.lineWidth = 3;
    for (let c = 0; c < 5; c++) {
      const x = stripX + c * cell;
      box(ctx, x + 6, y + 8, cell - 12, cellH);
      ctx.font = `400 18px ${SANS}`;
      ctx.fillStyle = FAINT;
      ctx.fillText(c % 2 === 0 ? '1st' : '2nd', x + 14, y + 30);
    }
    ctx.font = `400 20px ${SANS}`;
    ctx.fillStyle = INK;
    ctx.fillText('darkest', stripX + 5 * cell + 14, y + 36);
    ctx.fillText('value:', stripX + 5 * cell + 14, y + 66);
    ctx.lineWidth = 2;
    box(ctx, stripX + 5 * cell + 84, y + 44, 60, 34);
  }

  let y = top + rows * rowH + 50;
  ctx.fillStyle = INK;
  ctx.font = `700 34px ${SANS}`;
  ctx.fillText('Blue + brown = your greys', M, y);
  ctx.font = `400 24px ${SANS}`;
  ctx.fillStyle = FAINT;
  ctx.fillText('Shadows, metal, pavement. Three boxes per pair: more blue, equal, more brown.', M, y + 36);
  y += 60;
  const mixCell = 210;
  const pairs = browns.length ? browns : [undefined];
  for (const brown of pairs) {
    ctx.fillStyle = INK;
    ctx.font = `600 26px ${SANS}`;
    const label = blue && brown ? `${blue.name} + ${brown.name}` : 'Blue: ____________  +  Brown: ____________';
    ctx.fillText(label, M, y + 50);
    ctx.lineWidth = 3;
    ['more blue', 'equal', 'more brown'].forEach((caption, c) => {
      const x = stripX + c * mixCell;
      box(ctx, x + 6, y + 4, mixCell - 12, 84);
      ctx.font = `400 18px ${SANS}`;
      ctx.fillStyle = FAINT;
      ctx.fillText(`${c % 2 === 0 ? '1st' : '2nd'} · ${caption}`, x + 14, y + 26);
    });
    y += 120;
  }

  ctx.font = `400 22px ${SANS}`;
  ctx.fillStyle = FAINT;
  ctx.fillText('When it is dry, photograph it in even daylight and sample each swatch in Sketchbook Coach › See › Palette Lab.', M, H - M + 20);
  return canvasToBlob(canvas, 'image/png');
}
