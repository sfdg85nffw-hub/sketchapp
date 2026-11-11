import { useMemo, useState } from 'preact/hooks';
import { RECIPES } from '../data/paints';
import { deletePaint, getPaints, putPaint } from '../db/db';
import { shareOrDownload } from '../db/share';
import { findConfusablePairs } from '../lib/color/confusable';
import { greyForLstar, lstarOfRgb, rgbToHex, rgbToLab, type RGB } from '../lib/color/convert';
import { DILUTION_STEPS, dilute, mixPaints } from '../lib/color/mix';
import { nearestColorName } from '../lib/color/names';
import { classifyTemperature, type Temperature } from '../lib/color/temperature';
import { valueFromLstar } from '../lib/color/value';
import { newId } from '../lib/id';
import type { Paint } from '../lib/types';
import { useLive, useSettings } from '../ui/hooks';
import { Icon, type IconName } from '../ui/Icon';
import { Button, Divider, Header, Section, Sheet, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';
import { buildSwatchChart } from '../ui/swatchChart';

const TEMP: Record<Temperature, { label: string; icon: IconName }> = {
  warm: { label: 'Warm', icon: 'sun' },
  cool: { label: 'Cool', icon: 'cool' },
  neutral: { label: 'Neutral', icon: 'neutral' },
};

const grey = (rgb: RGB) => {
  const g = greyForLstar(lstarOfRgb(rgb));
  return `rgb(${g},${g},${g})`;
};

function TempTag({ rgb }: { rgb: RGB }) {
  const t = TEMP[classifyTemperature(rgbToLab(rgb))];
  return (
    <span class="tag">
      <Icon name={t.icon} size={12} />
      {t.label}
    </span>
  );
}

/** A paint's wash from full strength to water, with the same steps in greyscale underneath. */
function ValueStrips({ rgb, name }: { rgb: RGB; name: string }) {
  const steps = DILUTION_STEPS.map((s) => dilute(rgb, s));
  return (
    <div role="img" aria-label={`${name}: full strength is value ${valueFromLstar(lstarOfRgb(rgb))} of 10, thinning to nearly white`}>
      <div class="strip">
        {steps.map((c, i) => (
          <span key={i} style={{ background: rgbToHex(c) }} />
        ))}
      </div>
      <div class="strip">
        {steps.map((c, i) => (
          <span key={i} style={{ background: grey(c) }} />
        ))}
      </div>
    </div>
  );
}

export type Role = 'blue' | 'brown' | 'yellow';

/** Work out which of the three limited-palette paints plays blue, brown and yellow. */
export function assignRoles(limited: readonly Paint[]): Record<Role, Paint> | null {
  if (limited.length !== 3) return null;
  const byB = [...limited].sort((a, b) => rgbToLab(a.rgb)[2] - rgbToLab(b.rgb)[2]);
  const blue = byB[0]!;
  const rest = byB.slice(1).sort((a, b) => lstarOfRgb(a.rgb) - lstarOfRgb(b.rgb));
  return { blue, brown: rest[0]!, yellow: rest[1]! };
}

export function PaletteLab() {
  const paints = useLive(getPaints);
  const settings = useSettings();
  const [editing, setEditing] = useState<Paint | null>(null);
  const [name, setName] = useState('');
  const [showAllPairs, setShowAllPairs] = useState(false);
  const [building, setBuilding] = useState(false);

  const pairs = useMemo(() => findConfusablePairs(paints ?? []), [paints]);
  if (!paints) return <Screen label="Palette Lab">{null}</Screen>;

  const limited = paints.filter((p) => p.inLimited);
  const roles = assignRoles(limited);
  const byId = (id: string) => paints.find((p) => p.id === id)!;
  const forHim = pairs.filter((p) => !p.similarForEveryone);
  const forAnyone = pairs.filter((p) => p.similarForEveryone);
  const unnamed = paints.filter((p) => p.placeholder).length;
  const unsampled = paints.filter((p) => !p.sampled).length;

  const open = (paint: Paint) => {
    setEditing(paint);
    setName(paint.placeholder ? '' : paint.name);
  };

  const saveEdit = async (patch: Partial<Paint> = {}) => {
    if (!editing) return;
    const trimmed = name.trim();
    await putPaint({ ...editing, ...patch, ...(trimmed ? { name: trimmed, placeholder: false } : {}) });
    setEditing(null);
  };

  const addPaint = async () => {
    const paint: Paint = {
      id: newId('paint'),
      slot: Math.max(0, ...paints.map((p) => p.slot)) + 1,
      name: 'New paint',
      rgb: [150, 150, 150],
      sampled: false,
      placeholder: true,
      inLimited: false,
    };
    await putPaint(paint);
    open(paint);
  };

  const makeChart = async () => {
    setBuilding(true);
    try {
      const browns = paints.filter((p) => nearestColorName(rgbToLab(p.rgb)).family === 'brown');
      const blob = await buildSwatchChart(paints, roles?.blue, browns.length ? browns : roles ? [roles.brown] : []);
      const outcome = await shareOrDownload(new File([blob], 'swatch-chart-template.png', { type: 'image/png' }), 'Swatch chart template');
      if (outcome === 'downloaded') toast('Chart saved to your downloads. Print it, or copy the grid onto cotton paper.');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <Screen label="Palette Lab">
      <Header title="Palette Lab" back="/see" />
      <p class="muted">You cannot trust the hue, so every paint here is known by its name, its temperature and its value.</p>

      <Section title="Three-paint palette" hint="A blue, a brown and a yellow cover most of the city. Ask: warm or cool? Light or dark? Never: what color is this?">
        {roles ? (
          <>
            <ul class="stack">
              {(['blue', 'brown', 'yellow'] as const).map((role) => (
                <li key={role} class="card card-soft row">
                  <span class="swatch" style={{ background: rgbToHex(roles[role].rgb) }} aria-hidden="true" />
                  <span class="grow">
                    <span class="kicker">Your {role}</span>
                    <br />
                    <strong>{roles[role].name}</strong>
                  </span>
                  <TempTag rgb={roles[role].rgb} />
                </li>
              ))}
            </ul>
            <ul class="stack">
              {RECIPES.map((recipe) => {
                const parts = recipe.parts.map((part) => roles[part]);
                const mixed = parts.length === 2 ? mixPaints(parts[0]!.rgb, parts[1]!.rgb) : parts[0]!.rgb;
                return (
                  <li key={recipe.id} class="card">
                    <div class="row">
                      <span class="swatch" style={{ background: rgbToHex(mixed) }} aria-hidden="true" />
                      <span class="swatch" style={{ background: grey(mixed) }} aria-hidden="true" />
                      <div class="grow">
                        <h3>{recipe.title}</h3>
                        <p class="small muted">
                          {parts.map((p) => p.name).join(' + ')} · value {valueFromLstar(lstarOfRgb(mixed))} at full strength
                        </p>
                      </div>
                    </div>
                    <p>
                      <strong>Use it for:</strong> {recipe.uses.join(', ')}.
                    </p>
                    <p class="small muted">{recipe.how}</p>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p class="card card-note">
            The three-paint palette needs exactly three paints: a blue, a brown and a yellow. You have {limited.length} selected. Open a pan below and tick or untick "In the three-paint palette."
          </p>
        )}
      </Section>

      <Divider />

      <Section
        title="Your pans"
        hint={
          unnamed > 0
            ? `${unnamed} still have guessed names. Tap a pan and type the name printed on it.`
            : 'Every pan is labeled. Top strip: full strength to water. Bottom strip: the same in gray.'
        }
      >
        <ul class="stack">
          {paints.map((paint) => (
            <li key={paint.id}>
              <button type="button" class="list-link" style={{ display: 'block' }} onClick={() => open(paint)}>
                <span class="row" style={{ marginBottom: '0.5rem' }}>
                  <span class="swatch swatch-sm" style={{ background: rgbToHex(paint.rgb) }} aria-hidden="true" />
                  <span class="grow">
                    {paint.name}
                    <span class="sub">
                      Pan {paint.slot}
                      {paint.placeholder ? ' · name is a guess' : ''}
                      {paint.sampled ? '' : ' · color not sampled yet'}
                      {paint.inLimited ? ' · in the three-paint palette' : ''}
                    </span>
                  </span>
                  <TempTag rgb={paint.rgb} />
                </span>
                <ValueStrips rgb={paint.rgb} name={paint.name} />
              </button>
            </li>
          ))}
        </ul>
        <Button block icon="plus" onClick={() => void addPaint()}>
          Add a paint
        </Button>
      </Section>

      {settings.redGreenMode && (
        <>
          <Divider />
          <Section
            title="Easy for you to confuse"
            hint="Pairs that look alike with red-green colorblindness, from a simulation of your swatches. Label these pans clearly and reach for them by name."
          >
            {unsampled > 0 && (
              <p class="small muted">Based partly on guessed colors. Sample your real swatches for a list you can rely on.</p>
            )}
            {forHim.length === 0 && <p class="muted">No risky pairs found among these paints.</p>}
            <ul class="stack">
              {forHim.map((pair) => (
                <li key={`${pair.a}-${pair.b}`} class="card card-soft row">
                  <span class="swatch swatch-sm" style={{ background: rgbToHex(byId(pair.a).rgb) }} aria-hidden="true" />
                  <span class="swatch swatch-sm" style={{ background: rgbToHex(byId(pair.b).rgb) }} aria-hidden="true" />
                  <span class="grow">
                    <strong>{byId(pair.a).name}</strong> and <strong>{byId(pair.b).name}</strong>
                  </span>
                </li>
              ))}
            </ul>
            {forAnyone.length > 0 && (
              <>
                <Button variant="quiet" aria-expanded={showAllPairs} onClick={() => setShowAllPairs(!showAllPairs)}>
                  {showAllPairs ? 'Hide' : 'Show'} {forAnyone.length} pairs that are close for anyone
                </Button>
                {showAllPairs && (
                  <ul class="stack small">
                    {forAnyone.map((pair) => (
                      <li key={`${pair.a}-${pair.b}`}>
                        {byId(pair.a).name} and {byId(pair.b).name}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </Section>
        </>
      )}

      <Divider />

      <Section title="Swatch chart" hint="The old chart had no labels and the wet squares ran together. This one fixes both.">
        <Button variant="primary" block icon="camera" onClick={() => navigate('/sample')}>
          Sample colors from my chart
        </Button>
        <Button block icon="download" disabled={building} onClick={() => void makeChart()}>
          {building ? 'Drawing the chart…' : 'Make a blank chart to paint'}
        </Button>
      </Section>

      {editing && (
        <Sheet title={`Pan ${editing.slot}`} onClose={() => setEditing(null)}>
          <div class="row">
            <span class="swatch" style={{ background: rgbToHex(editing.rgb) }} aria-hidden="true" />
            <p class="small muted grow">
              {editing.sampled ? 'Color sampled from your chart.' : 'This color is a guess until you sample your real swatch.'}
            </p>
          </div>
          <div class="field">
            <label for="paint-name">Name printed on the pan</label>
            <input id="paint-name" class="input" type="text" maxLength={40} placeholder={editing.name} value={name} onInput={(e) => setName(e.currentTarget.value)} />
          </div>
          <label class="switch-row">
            <input
              class="check"
              type="checkbox"
              checked={editing.inLimited}
              onChange={(e) => setEditing({ ...editing, inLimited: e.currentTarget.checked })}
            />
            <span>In the three-paint palette</span>
          </label>
          <Button variant="primary" block large onClick={() => void saveEdit()}>
            Save
          </Button>
          <Button
            block
            icon="pipette"
            onClick={() => {
              void saveEdit().then(() => navigate(`/sample?paint=${editing.id}`));
            }}
          >
            Sample its color from a photo
          </Button>
          <Button
            block
            icon="trash"
            onClick={() => {
              void deletePaint(editing.id);
              setEditing(null);
            }}
          >
            Remove this paint
          </Button>
        </Sheet>
      )}
    </Screen>
  );
}
