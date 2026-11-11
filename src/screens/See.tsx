import { useState } from 'preact/hooks';
import { getPaints } from '../db/db';
import { useLive, useSettings } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Divider, FileButton, Header } from '../ui/kit';
import { LiveCamera } from '../ui/LiveCamera';
import { Screen } from '../ui/Screen';
import { ValueTools, type ToolMode } from '../ui/ValueTools';

/** Live value camera, colour identifier, and the way in to the Palette Lab. */
export function See() {
  const settings = useSettings();
  const paints = useLive(getPaints);
  const [photo, setPhoto] = useState<{ blob: Blob; mode: ToolMode } | null>(null);

  if (!paints) return <Screen label="See">{null}</Screen>;

  if (photo) {
    return (
      <Screen label="Look at a photo">
        <Header title="Look closer" kicker="Not saved to the journal" />
        <ValueTools key={photo.mode} blob={photo.blob} paints={paints} redGreenMode={settings.redGreenMode} initialMode={photo.mode} />
        <Divider />
        <Button block icon="back" onClick={() => setPhoto(null)}>
          Back to the live view
        </Button>
      </Screen>
    );
  }

  const photoButtons = (
    <>
      <FileButton block icon="pipette" testId="identify-input" onFile={(blob) => setPhoto({ blob, mode: 'identify' })}>
        Identify a color in a photo
      </FileButton>
      <FileButton block icon="values" testId="values-input" onFile={(blob) => setPhoto({ blob, mode: 'values' })}>
        Check values in a photo
      </FileButton>
    </>
  );

  return (
    <Screen label="See">
      <Header title="See" />
      <LiveCamera onFreeze={(blob) => setPhoto({ blob, mode: 'identify' })} />
      <Divider />
      <div class="stack">
        {photoButtons}
        <a class="list-link" href="#/palette">
          <Icon name="palette" />
          <span class="grow">
            Palette Lab
            <span class="sub">Your labeled pans, the three-paint palette, and which pairs you will confuse</span>
          </span>
          <Icon name="chevron" size={20} />
        </a>
      </div>
    </Screen>
  );
}
