import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { decodeImage, renderToCanvas } from '../db/images';
import { greyForLstar, rgbToHex, rgbToLab, type RGB } from '../lib/color/convert';
import { closestPaintOrMix } from '../lib/color/match';
import { isConfusableFamily, nearestColorName } from '../lib/color/names';
import { classifyTemperature, type Temperature } from '../lib/color/temperature';
import { valueFromLstar, type ValueSteps } from '../lib/color/value';
import { applyGains, gainsFromWhiteReference, NO_GAINS } from '../lib/color/whiteBalance';
import { averagePatch } from '../lib/image/filters';
import type { Paint } from '../lib/types';
import { Icon, type IconName } from './Icon';
import { Button, Chips, FileButton, Segmented, Sheet, toast } from './kit';
import { filterPixels } from './pixelClient';

export type ToolMode = 'original' | 'grey' | 'values' | 'squint' | 'glance' | 'compare' | 'identify';

export const TOOL_MODES: readonly { value: ToolMode; label: string; icon: IconName }[] = [
  { value: 'original', label: 'Photo', icon: 'image' },
  { value: 'grey', label: 'Grayscale', icon: 'neutral' },
  { value: 'values', label: 'Value map', icon: 'values' },
  { value: 'squint', label: 'Squint', icon: 'squint' },
  { value: 'glance', label: 'Passerby', icon: 'glance' },
  { value: 'compare', label: 'Compare', icon: 'compare' },
  { value: 'identify', label: 'Identify color', icon: 'pipette' },
];

export const STEP_OPTIONS: readonly { value: ValueSteps; label: string }[] = [
  { value: 2, label: '2 · notan' },
  { value: 3, label: '3 values' },
  { value: 5, label: '5 values' },
];

/** Working resolution for analysis. Plenty for judging values; small enough to stay instant. */
const WORK_LONG_EDGE = 1280;

export async function blobToImageData(blob: Blob): Promise<ImageData> {
  const canvas = renderToCanvas(await decodeImage(blob), { maxLongEdge: WORK_LONG_EDGE });
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('This browser could not read the image.');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

interface FilteredCanvasProps {
  data: ImageData | null;
  /** null shows the photo as is; 0 is continuous greyscale; 2, 3, 5 posterize. */
  steps: number | null;
  autoRange: boolean;
  label: string;
  testId?: string;
  style?: Record<string, string>;
  onTap?: (x: number, y: number) => void;
}

/** A canvas that shows image data through the value filter, computed off the main thread. */
export function FilteredCanvas({ data, steps, autoRange, label, testId, style, onTap }: FilteredCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data) return;
    let alive = true;
    const key = steps === null ? 'original' : `steps-${steps}${autoRange ? '-auto' : ''}`;
    const paint = (image: ImageData) => {
      if (!alive) return;
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext('2d')?.putImageData(image, 0, 0);
      canvas.dataset.rendered = key;
    };
    if (steps === null) paint(data);
    else void filterPixels(data, { steps, autoRange }).then(paint);
    return () => {
      alive = false;
    };
  }, [data, steps, autoRange]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      data-testid={testId}
      style={style}
      onClick={(event) => {
        if (!onTap || !data) return;
        const rect = event.currentTarget.getBoundingClientRect();
        onTap(((event.clientX - rect.left) / rect.width) * data.width, ((event.clientY - rect.top) / rect.height) * data.height);
      }}
    />
  );
}

/* ---------- colour identifier ---------- */

const TEMPERATURE_TEXT: Record<Temperature, { label: string; icon: IconName }> = {
  warm: { label: 'Warm', icon: 'sun' },
  cool: { label: 'Cool', icon: 'cool' },
  neutral: { label: 'Neutral', icon: 'neutral' },
};

export interface ColorReading {
  rgb: RGB;
  name: string;
  confusable: boolean;
  temperature: Temperature;
  value: number;
  match: ReturnType<typeof closestPaintOrMix>;
}

export function readColor(rgb: RGB, paints: readonly Paint[]): ColorReading {
  const lab = rgbToLab(rgb);
  const named = nearestColorName(lab);
  return {
    rgb,
    name: named.name,
    confusable: isConfusableFamily(named.family),
    temperature: classifyTemperature(lab),
    value: valueFromLstar(lab[0]),
    match: closestPaintOrMix(lab, paints),
  };
}

export function ValueScale({ value }: { value: number }) {
  return (
    <div class="value-scale" role="img" aria-label={`Value ${value} on a scale of 1, white paper, to 10, black ink`}>
      {Array.from({ length: 10 }, (_, i) => {
        const step = i + 1;
        const grey = greyForLstar(100 - i * (100 / 9));
        return (
          <span key={step} class={step === value ? 'on' : ''} style={{ background: `rgb(${grey},${grey},${grey})`, color: step <= 5 ? '#000' : '#fff' }}>
            {step === value ? step : ''}
          </span>
        );
      })}
    </div>
  );
}

export function ColorReadout({ reading, redGreenMode }: { reading: ColorReading; redGreenMode: boolean }) {
  const temp = TEMPERATURE_TEXT[reading.temperature];
  return (
    <div class="card stack" data-testid="color-reading">
      <div class="readout">
        <div class="swatch" style={{ background: rgbToHex(reading.rgb) }} aria-hidden="true" />
        <div>
          <p class="kicker">Sampled color</p>
          <p class="h2">{reading.name}</p>
        </div>
      </div>
      <div class="facts">
        <div class="fact">
          <span class="k">Temperature</span>
          <span class="v">
            <Icon name={temp.icon} size={18} />
            {temp.label}
          </span>
        </div>
        <div class="fact">
          <span class="k">Value</span>
          <span class="v">{reading.value} of 10</span>
        </div>
      </div>
      <ValueScale value={reading.value} />
      <p class="small muted">1 is white paper, 10 is black ink.</p>
      {reading.match && (
        <div class="readout">
          <div class="swatch" style={{ background: rgbToHex(reading.match.rgb) }} aria-hidden="true" />
          <div>
            <p class="kicker">Closest from your paints</p>
            <p class="h3">{reading.match.label}</p>
            <p class="small muted">Use it {reading.match.dilution}.</p>
          </div>
        </div>
      )}
      {redGreenMode && reading.confusable && (
        <p class="small">
          <strong>In your confusable zone.</strong> Reds, greens, browns and oranges swap places for you. Go by the name and the value here, not by how it looks.
        </p>
      )}
    </div>
  );
}

/* ---------- the tool set ---------- */

interface ValueToolsProps {
  blob: Blob;
  paints: readonly Paint[];
  redGreenMode: boolean;
  initialMode?: ToolMode;
  /** Persisted white-paper sample for this photo, if any. */
  whiteRef?: RGB;
  onWhiteRef?: (rgb: RGB | undefined) => void;
  /** Reference photo of the scene for Compare. */
  referenceBlob?: Blob | null;
  onReference?: (file: File) => void;
}

export function ValueTools(props: ValueToolsProps) {
  const { blob, paints, redGreenMode } = props;
  const [mode, setMode] = useState<ToolMode>(props.initialMode ?? 'original');
  const [steps, setSteps] = useState<ValueSteps>(3);
  const [blur, setBlur] = useState(6);
  const [flipped, setFlipped] = useState(false);
  const [autoRange, setAutoRange] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [data, setData] = useState<ImageData | null>(null);
  const [refData, setRefData] = useState<ImageData | null>(null);
  const [localRef, setLocalRef] = useState<Blob | null>(null);
  const [sample, setSample] = useState<{ x: number; y: number; raw: RGB } | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [localWhite, setLocalWhite] = useState<RGB | undefined>(props.whiteRef);

  const whiteRef = props.onWhiteRef ? props.whiteRef : localWhite;
  const referenceBlob = props.referenceBlob ?? localRef;

  useEffect(() => {
    let alive = true;
    setData(null);
    setSample(null);
    void blobToImageData(blob).then((image) => alive && setData(image));
    return () => {
      alive = false;
    };
  }, [blob]);

  useEffect(() => {
    let alive = true;
    setRefData(null);
    if (referenceBlob) void blobToImageData(referenceBlob).then((image) => alive && setRefData(image));
    return () => {
      alive = false;
    };
  }, [referenceBlob]);

  const gains = useMemo(() => (whiteRef ? gainsFromWhiteReference(whiteRef) : NO_GAINS), [whiteRef]);
  const reading = useMemo(() => (sample ? readColor(applyGains(sample.raw, gains), paints) : null), [sample, gains, paints]);

  const setWhite = (rgb: RGB | undefined) => {
    if (props.onWhiteRef) props.onWhiteRef(rgb);
    else setLocalWhite(rgb);
  };

  const onTap = (x: number, y: number) => {
    if (!data || mode !== 'identify') return;
    const px = flipped ? data.width - x : x;
    const radius = Math.max(3, Math.round(Math.max(data.width, data.height) * 0.012));
    const raw = averagePatch(data.data, data.width, data.height, px, y, radius);
    if (calibrating) {
      setCalibrating(false);
      if (gainsFromWhiteReference(raw) === NO_GAINS) {
        toast('That spot is too dark to be paper. Tap a clean, well-lit area of the page.');
        return;
      }
      setWhite(raw);
      toast('Calibrated. That paper now reads as value 1.');
      return;
    }
    setSample({ x: px, y, raw });
  };

  const filterSteps = mode === 'grey' ? 0 : mode === 'values' || mode === 'compare' ? steps : null;
  const canvasStyle: Record<string, string> = {};
  if (mode === 'squint') canvasStyle.filter = `blur(${blur}px)`;
  if (mode === 'identify') canvasStyle.cursor = 'crosshair';

  return (
    <div class="stack">
      <Chips
        label="View"
        scroll
        options={TOOL_MODES}
        selected={[mode]}
        onToggle={(next) => {
          setMode(next);
          setCalibrating(false);
        }}
      />

      {mode === 'compare' ? (
        <div class="stage">
          <div class="compare">
            <figure>
              <FilteredCanvas data={data} steps={steps} autoRange={autoRange} label={`Your sketch in ${steps} values`} testId="compare-sketch" />
              <figcaption>Your sketch</figcaption>
            </figure>
            <figure>
              {refData ? (
                <FilteredCanvas data={refData} steps={steps} autoRange={autoRange} label={`Reference photo in ${steps} values`} testId="compare-reference" />
              ) : (
                <div class="stack" style={{ padding: '1rem', textAlign: 'center' }}>
                  <p class="small">Add a photo of the scene to check your values against reality.</p>
                </div>
              )}
              <figcaption>The scene</figcaption>
            </figure>
          </div>
        </div>
      ) : (
        <div class={`stage${mode === 'glance' ? ' stage-glance' : ''}`}>
          <div class={flipped ? 'flip' : ''} style={{ position: 'relative', lineHeight: '0' }}>
            <FilteredCanvas
              data={data}
              steps={filterSteps}
              autoRange={autoRange}
              label={describe(mode, steps, flipped)}
              testId="tool-canvas"
              style={canvasStyle}
              onTap={onTap}
            />
            {mode === 'identify' && sample && data && (
              <span class="sample-dot" style={{ left: `${(sample.x / data.width) * 100}%`, top: `${(sample.y / data.height) * 100}%` }} />
            )}
          </div>
        </div>
      )}

      {mode === 'glance' && <p class="stage-caption hand">What reads at a glance?</p>}

      {(mode === 'values' || mode === 'compare') && (
        <Segmented label="Number of values" options={STEP_OPTIONS} value={steps} onChange={setSteps} />
      )}

      {mode === 'compare' && (
        <FileButton
          block
          icon="image"
          testId="reference-input"
          onFile={(file) => {
            if (props.onReference) props.onReference(file);
            else setLocalRef(file);
          }}
        >
          {refData ? 'Change the reference photo' : 'Add a photo of the scene'}
        </FileButton>
      )}

      {mode === 'squint' && (
        <div class="field">
          <label for="squint-amount">
            Squint <span class="hint">· slide until the detail goes and only big shapes are left</span>
          </label>
          <input id="squint-amount" type="range" min={0} max={24} step={1} value={blur} onInput={(e) => setBlur(Number(e.currentTarget.value))} />
        </div>
      )}

      {mode === 'identify' && (
        <div class="stack">
          <p class="muted small" aria-live="polite">
            {calibrating
              ? 'Now tap a clean, bare area of the paper.'
              : sample
                ? 'Tap anywhere else to sample again.'
                : 'Tap any point on the photo. A small patch is averaged, not one pixel.'}
          </p>
          {reading && <ColorReadout reading={reading} redGreenMode={redGreenMode} />}
          <div class="card card-soft stack">
            <p class="small">
              Phone cameras shift color with the light. Treat the name as a good guess and the value as the reliable part.
            </p>
            <div class="row-wrap">
              <Button icon="sun" aria-pressed={calibrating} onClick={() => setCalibrating(!calibrating)}>
                {whiteRef ? 'Recalibrate on white paper' : 'Calibrate on white paper'}
              </Button>
              {whiteRef && (
                <Button variant="quiet" onClick={() => setWhite(undefined)}>
                  Clear calibration
                </Button>
              )}
            </div>
            {whiteRef && <p class="small muted">Calibrated for this photo: the paper you tapped is treated as white.</p>}
          </div>
        </div>
      )}

      <div class="row-wrap">
        <Button icon="flip" aria-pressed={flipped} onClick={() => setFlipped(!flipped)}>
          {flipped ? 'Mirrored · tap to undo' : 'Mirror flip'}
        </Button>
        {(mode === 'grey' || mode === 'values' || mode === 'compare') && (
          <Button variant="quiet" onClick={() => setMoreOpen(true)}>
            More
          </Button>
        )}
      </div>

      {moreOpen && (
        <Sheet title="Value options" onClose={() => setMoreOpen(false)}>
          <label class="switch-row">
            <input class="check" type="checkbox" checked={autoRange} onChange={(e) => setAutoRange(e.currentTarget.checked)} />
            <span>
              <strong>Stretch to the photo's own range</strong>
              <span class="hint small" style={{ display: 'block' }}>
                Treats the lightest area as paper white and the darkest as black. Useful for a dim photo; off gives the true values.
              </span>
            </span>
          </label>
          <Button variant="primary" block onClick={() => setMoreOpen(false)}>
            Done
          </Button>
        </Sheet>
      )}
    </div>
  );
}

function describe(mode: ToolMode, steps: number, flipped: boolean): string {
  const base: Record<ToolMode, string> = {
    original: 'The photo',
    grey: 'The photo in true grayscale',
    values: `The photo reduced to ${steps} values`,
    squint: 'The photo blurred, as if squinting',
    glance: 'The photo at thumbnail size, as a passerby would see it',
    compare: 'Sketch and reference side by side',
    identify: 'The photo. Tap a point to identify its color',
  };
  return `${base[mode]}${flipped ? ', mirrored' : ''}`;
}
