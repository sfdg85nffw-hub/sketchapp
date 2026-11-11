import { useEffect, useRef } from 'preact/hooks';
import { renderToCanvas, type CropRect, type Rotation } from '../db/images';

interface CropEditorProps {
  image: HTMLImageElement;
  rotation: Rotation;
  /** null means no crop UI: just the rotated preview. */
  crop: CropRect | null;
  onCrop: (crop: CropRect) => void;
}

const MIN_SIZE = 0.15;
const CORNERS = [
  { id: 'nw', label: 'Top left corner', x: 0, y: 0 },
  { id: 'ne', label: 'Top right corner', x: 1, y: 0 },
  { id: 'sw', label: 'Bottom left corner', x: 0, y: 1 },
  { id: 'se', label: 'Bottom right corner', x: 1, y: 1 },
] as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Preview of the rotated photo with an optional crop box. Corners drag; arrow keys nudge. */
export function CropEditor({ image, rotation, crop, onCrop }: CropEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preview = renderToCanvas(image, { rotation, maxLongEdge: 1024 });
    canvas.width = preview.width;
    canvas.height = preview.height;
    canvas.getContext('2d')?.drawImage(preview, 0, 0);
  }, [image, rotation]);

  const moveCorner = (corner: (typeof CORNERS)[number], nx: number, ny: number) => {
    if (!crop) return;
    let left = crop.x;
    let top = crop.y;
    let right = crop.x + crop.width;
    let bottom = crop.y + crop.height;
    if (corner.x === 0) left = clamp(nx, 0, right - MIN_SIZE);
    else right = clamp(nx, left + MIN_SIZE, 1);
    if (corner.y === 0) top = clamp(ny, 0, bottom - MIN_SIZE);
    else bottom = clamp(ny, top + MIN_SIZE, 1);
    onCrop({ x: left, y: top, width: right - left, height: bottom - top });
  };

  const drag = (corner: (typeof CORNERS)[number]) => (event: PointerEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const move = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      moveCorner(corner, (e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);
    };
    const stop = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', stop);
      target.removeEventListener('pointercancel', stop);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', stop);
    target.addEventListener('pointercancel', stop);
  };

  const nudge = (corner: (typeof CORNERS)[number]) => (event: KeyboardEvent) => {
    if (!crop) return;
    const step = 0.02;
    const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
    const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
    if (!dx && !dy) return;
    event.preventDefault();
    moveCorner(corner, crop.x + corner.x * crop.width + dx, crop.y + corner.y * crop.height + dy);
  };

  return (
    <div class="crop-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label="Photo preview" data-testid="capture-preview" />
      {crop && (
        <>
          <div
            class="crop-box"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.width * 100}%`,
              height: `${crop.height * 100}%`,
            }}
          />
          {CORNERS.map((corner) => (
            <button
              key={corner.id}
              type="button"
              class="crop-handle"
              aria-label={`${corner.label}. Drag, or use arrow keys, to crop.`}
              style={{ left: `${(crop.x + corner.x * crop.width) * 100}%`, top: `${(crop.y + corner.y * crop.height) * 100}%` }}
              onPointerDown={drag(corner)}
              onKeyDown={nudge(corner)}
            />
          ))}
        </>
      )}
    </div>
  );
}
