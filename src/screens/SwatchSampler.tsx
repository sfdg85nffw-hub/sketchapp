import { useEffect, useMemo, useState } from 'preact/hooks';
import { getPaints, putPaint } from '../db/db';
import { rgbToHex, rgbToLab, type RGB } from '../lib/color/convert';
import { classifyTemperature } from '../lib/color/temperature';
import { valueFromLstar } from '../lib/color/value';
import { applyGains, gainsFromWhiteReference, NO_GAINS } from '../lib/color/whiteBalance';
import { averagePatch } from '../lib/image/filters';
import { useLive } from '../ui/hooks';
import { Button, Chips, FileButton, Header, toast } from '../ui/kit';
import { navigate, parseHash } from '../ui/router';
import { Screen } from '../ui/Screen';
import { blobToImageData, FilteredCanvas } from '../ui/ValueTools';

/** Photograph the swatch chart, then tap each swatch to record that paint's real colour. */
export function SwatchSampler() {
  const paints = useLive(getPaints);
  const [data, setData] = useState<ImageData | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(() => parseHash(location.hash).query.get('paint'));
  const [white, setWhite] = useState<RGB | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gains = useMemo(() => (white ? gainsFromWhiteReference(white) : NO_GAINS), [white]);

  useEffect(() => {
    if (paints && !currentId) setCurrentId(paints.find((p) => !p.sampled)?.id ?? paints[0]?.id ?? null);
  }, [paints, currentId]);

  if (!paints) return <Screen label="Sample swatches">{null}</Screen>;

  const load = (file: File) => {
    setError(null);
    blobToImageData(file).then(setData, (e: Error) => setError(e.message));
  };

  const onTap = async (x: number, y: number) => {
    if (!data) return;
    const radius = Math.max(4, Math.round(Math.max(data.width, data.height) * 0.012));
    const raw = averagePatch(data.data, data.width, data.height, x, y, radius);
    if (calibrating) {
      setCalibrating(false);
      if (gainsFromWhiteReference(raw) === NO_GAINS) {
        toast('Too dark to be paper. Tap a bare, well-lit area of the page.');
        return;
      }
      setWhite(raw);
      toast('Calibrated on your paper. Now tap the swatches.');
      return;
    }
    const paint = paints.find((p) => p.id === currentId);
    if (!paint) return;
    const rgb = applyGains(raw, gains);
    await putPaint({ ...paint, rgb, sampled: true });
    const lab = rgbToLab(rgb);
    toast(`${paint.name}: ${classifyTemperature(lab)}, value ${valueFromLstar(lab[0])} of 10.`);
    const index = paints.findIndex((p) => p.id === paint.id);
    const next = [...paints.slice(index + 1), ...paints.slice(0, index)].find((p) => !p.sampled);
    if (next) setCurrentId(next.id);
  };

  const current = paints.find((p) => p.id === currentId);
  const remaining = paints.filter((p) => !p.sampled).length;

  return (
    <Screen
      label="Sample swatches"
      back="/palette"
      actions={
        data ? (
          <Button variant="primary" large icon="check" onClick={() => navigate('/palette', { replace: true })}>
            Done{remaining ? ` · ${remaining} left for later` : ''}
          </Button>
        ) : (
          <FileButton variant="primary" large icon="camera" camera onFile={load}>
            Photograph the chart
          </FileButton>
        )
      }
    >
      <Header title="Sample your swatches" back="/palette" />
      {error && (
        <p class="card" role="alert">
          {error}
        </p>
      )}

      {!data ? (
        <div class="card stack">
          <p>Photograph your painted swatch chart flat, in even daylight, with some bare paper showing.</p>
          <p class="muted small">Then tap bare paper once to calibrate, and tap each swatch at full strength. The app records what each pan really looks like.</p>
          <FileButton block icon="image" testId="chart-input" onFile={load}>
            Choose a photo
          </FileButton>
        </div>
      ) : (
        <>
          <p class="muted small" aria-live="polite">
            {calibrating
              ? 'Tap a clean, bare area of the paper.'
              : current
                ? `Tap the darkest part of the ${current.name} swatch.`
                : 'Pick a paint below, then tap its swatch.'}
          </p>
          <div class="stage">
            <FilteredCanvas data={data} steps={null} autoRange={false} label="Your swatch chart. Tap a swatch to sample it." testId="chart-canvas" style={{ cursor: 'crosshair' }} onTap={(x, y) => void onTap(x, y)} />
          </div>
          <Button icon="sun" aria-pressed={calibrating} onClick={() => setCalibrating(!calibrating)}>
            {white ? 'Recalibrate on white paper' : 'Calibrate on white paper first'}
          </Button>
          <div class="field">
            <span class="label">Which pan are you tapping?</span>
            <Chips
              label="Paint to sample"
              options={paints.map((p) => ({ value: p.id, label: `${p.sampled ? '● ' : '○ '}${p.name}` }))}
              selected={currentId ? [currentId] : []}
              onToggle={setCurrentId}
            />
            <p class="small muted">● sampled · ○ not yet</p>
          </div>
          {current && (
            <div class="row card card-soft">
              <span class="swatch" style={{ background: rgbToHex(current.rgb) }} aria-hidden="true" />
              <span>
                <strong>{current.name}</strong>
                <br />
                <span class="small muted">{current.sampled ? 'Sampled. Tap again to replace it.' : 'Still a guess.'}</span>
              </span>
            </div>
          )}
        </>
      )}
    </Screen>
  );
}
