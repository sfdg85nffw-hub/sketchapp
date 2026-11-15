import { useEffect, useState } from 'preact/hooks';
import { Capture } from './screens/Capture';
import { DrillDetail, DrillLibrary } from './screens/Drills';
import { EntryDetail } from './screens/EntryDetail';
import { Journal } from './screens/Journal';
import { Materials } from './screens/Materials';
import { Onboarding } from './screens/Onboarding';
import { PaletteLab } from './screens/PaletteLab';
import { Plan } from './screens/Plan';
import { Practice } from './screens/Practice';
import { Progress } from './screens/Progress';
import { ProjectDetail, Projects } from './screens/Projects';
import { Reflect } from './screens/Reflect';
import { RefHome } from './screens/RefHome';
import { RefPlayer } from './screens/RefPlayer';
import { RefSetup } from './screens/RefSetup';
import { Review } from './screens/Review';
import { See } from './screens/See';
import { SettingsScreen } from './screens/Settings';
import { SwatchSampler } from './screens/SwatchSampler';
import { ThenNow } from './screens/ThenNow';
import { setPendingCapture } from './ui/captureStore';
import { useSettings } from './ui/hooks';
import { Icon, type IconName } from './ui/Icon';
import { Button, ToastHost } from './ui/kit';
import { navigate, useRoute, type Route } from './ui/router';

type TabId = 'journal' | 'practice' | 'see' | 'progress';

const TABS: readonly { id: TabId; label: string; icon: IconName }[] = [
  { id: 'journal', label: 'Journal', icon: 'journal' },
  { id: 'practice', label: 'Practice', icon: 'practice' },
  { id: 'see', label: 'See', icon: 'eye' },
  { id: 'progress', label: 'Progress', icon: 'chart' },
];

const TAB_OF_ROUTE: Record<string, TabId> = {
  journal: 'journal',
  entry: 'journal',
  thennow: 'journal',
  practice: 'practice',
  drills: 'practice',
  drill: 'practice',
  gesture: 'practice',
  ref: 'practice',
  refplay: 'practice',
  projects: 'practice',
  project: 'practice',
  plan: 'practice',
  see: 'see',
  palette: 'see',
  sample: 'see',
  progress: 'progress',
  settings: 'progress',
  materials: 'progress',
  review: 'progress',
};

/** Focused flows replace the tab bar with their own single primary action. */
const FLOWS = new Set(['capture', 'reflect', 'plan', 'drill', 'gesture', 'review', 'sample', 'ref', 'refplay']);

function screenFor(route: Route) {
  const id = route.params[0] ?? '';
  switch (route.name) {
    case 'entry':
      return <EntryDetail id={id} />;
    case 'capture':
      return <Capture />;
    case 'reflect':
      return <Reflect id={id} />;
    case 'thennow':
      return <ThenNow initialA={route.query.get('a')} initialB={route.query.get('b')} />;
    case 'practice':
      return <Practice />;
    case 'drills':
      return <DrillLibrary />;
    case 'drill':
      return <DrillDetail id={id} />;
    case 'gesture':
      return <RefSetup mode="life" />;
    case 'ref':
      return id ? <RefSetup mode={id} /> : <RefHome />;
    case 'refplay':
      return <RefPlayer />;
    case 'projects':
      return <Projects />;
    case 'project':
      return <ProjectDetail id={id} />;
    case 'plan':
      return <Plan />;
    case 'see':
      return <See />;
    case 'palette':
      return <PaletteLab />;
    case 'sample':
      return <SwatchSampler />;
    case 'progress':
      return <Progress />;
    case 'settings':
      return <SettingsScreen />;
    case 'materials':
      return <Materials />;
    case 'review':
      return <Review month={id} />;
    default:
      return <Journal />;
  }
}

function TabBar({ active }: { active: TabId }) {
  const tab = (t: (typeof TABS)[number]) => (
    <a key={t.id} class="tab" href={`#/${t.id}`} aria-current={active === t.id ? 'page' : undefined}>
      <Icon name={t.icon} />
      <span>{t.label}</span>
    </a>
  );
  return (
    <nav class="tabbar" aria-label="Main">
      {TABS.slice(0, 2).map(tab)}
      <label class="capture-tab">
        <span class="capture-disc">
          <Icon name="camera" size={30} />
        </span>
        <span>Capture</span>
        <input
          class="vh"
          type="file"
          accept="image/*"
          capture="environment"
          aria-label="Capture a sketch"
          data-testid="capture-input"
          onChange={(event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            input.value = '';
            if (!file) return;
            setPendingCapture(file);
            navigate('/capture');
          }}
        />
      </label>
      {TABS.slice(2).map(tab)}
    </nav>
  );
}

export function App() {
  const route = useRoute();
  const settings = useSettings();
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    const onUpdate = () => setUpdated(true);
    window.addEventListener('app-updated', onUpdate);
    return () => window.removeEventListener('app-updated', onUpdate);
  }, []);

  const routeKey = `${route.name}/${route.params.join('/')}`;
  return (
    <div class="app">
      <div key={routeKey} style={{ display: 'contents' }}>
        {screenFor(route)}
      </div>
      {updated && (
        <div class="actionbar" role="status">
          <span class="grow small">A newer version is ready.</span>
          <Button onClick={() => location.reload()}>Reload</Button>
        </div>
      )}
      {!FLOWS.has(route.name) && <TabBar active={TAB_OF_ROUTE[route.name] ?? 'journal'} />}
      <ToastHost />
      {!settings.onboarded && <Onboarding />}
    </div>
  );
}
