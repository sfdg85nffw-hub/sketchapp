/** Line icons drawn on a 24-unit grid. Strokes only, so they inherit text colour. */
const PATHS = {
  journal: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm0 13a3 3 0 0 1 3-3h11M9 8h6',
  practice: 'M12 21a9 9 0 1 1 9-9M12 17a5 5 0 1 1 5-5M12 12l8-8m0 0h-3m3 0v3',
  camera: 'M4 8h3l1.5-2.5h7L17 8h3v11H4V8Zm8 8.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  chart: 'M4 20V4m0 16h16M7.5 15.5l3.5-4 3 2.5 5-7',
  urban: 'M3 21h18M5 21V8l5-3v16m0-11h9v11M13 14h3m-3 3.5h3M7 11v0m0 3.5v0',
  interior: 'M5 20v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M5 16h14M8 11V5h8v6M5 20h0m14 0h0',
  stillLife: 'M12 8c-3-1.5-6 .5-6 4.5S8.5 20 12 20s6-3.5 6-7.5S15 6.5 12 8Zm0 0c0-2 1-3.5 2.5-4',
  portrait: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8.5c.5-3.5 3.5-5.5 7-5.5s6.5 2 7 5.5',
  gesture: 'M13 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM13 7l-2 6 3 3.5L13 21m-2-8-3 3-2 4M12 9l-4 1.5m4.5-1 4 3',
  study: 'M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 8L4 7m8 4 8-4m-8 4v10',
  drop: 'M12 3.5s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  back: 'M14.5 5.5 8 12l6.5 6.5',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5 10 17.5 19.5 7',
  plus: 'M12 5v14M5 12h14',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  flag: 'M6 21V4m0 1h11l-2.5 4L17 13H6',
  flip: 'M12 3v18M8.5 7 4 12l4.5 5V7Zm7 0L20 12l-4.5 5V7Z',
  values: 'M4 4h16v16H4V4Zm5.333 0v16m5.334-16v16M4 12h5.333',
  squint: 'M3 9c2.5 3 5.5 4.5 9 4.5S18.5 12 21 9M6.5 12.5 5 15.5m7-2v3.5m5.5-4.5 1.5 3',
  glance: 'M9 8h6v8H9V8ZM3 6V4h2m14 0h2v2M3 18v2h2m14 0h2v-2',
  compare: 'M3.5 5h7v14h-7V5Zm10 0h7v14h-7V5Z',
  pipette: 'M14 6.5 17.5 10m-2-5 3.5 3.5-2 2-3.5-3.5 2-2ZM14.5 9l-8 8L5 20l3-1.5 8-8',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-13.5V5m0 14v2.5M2.5 12H5m14 0h2.5M5.300 5.300 7 7m10 10 1.700 1.700M18.700 5.300 17 7M7 17l-1.700 1.700',
  cool: 'M12 3v18M4.200 7.5l15.600 9M19.800 7.5l-15.600 9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5',
  neutral: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12h8',
  share: 'M12 15V3.5m0 0L8 7.5m4-4 4 4M5 12v8h14v-8',
  copy: 'M9 9h10v11H9V9Zm-4 6V4h10',
  trash: 'M5 7h14M10 7V4h4v3m-7 0 1 13h8l1-13M10 11v5m4-5v5',
  edit: 'M4 20l1-4L16.5 4.5l3 3L8 19l-4 1Zm10.5-13.5 3 3',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12v4l2.5 2M9.5 2.5h5',
  play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
  pause: 'M8 5v14M16 5v14',
  skip: 'M6 5.5v13l9-6.5-9-6.5ZM18 5v14',
  rotateLeft: 'M4 9.5A8 8 0 1 1 5.5 16M4 4.5v5h5',
  rotateRight: 'M20 9.5A8 8 0 1 0 18.5 16M20 4.5v5h-5',
  crop: 'M7 3v14h14M3 7h14v14',
  download: 'M12 3.5V15m0 0-4-4m4 4 4-4M5 19.5h14',
  upload: 'M12 15V3.5m0 0-4 4m4-4 4 4M5 19.5h14',
  palette: 'M12 3.5a8.5 8.5 0 1 0 0 17c1.5 0 2-1 2-2s-.5-2 1-2h2a3.5 3.5 0 0 0 3.5-3.5c0-4.5-4-7.5-8.5-7.5ZM8 12h.01M10 8.5h.01M14.5 8.5h.01',
  settings: 'M5 7h9m4 0h1M5 17h3m4 0h7M16 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM10 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  ratingNo: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  arrowUp: 'M6 15l6-6 6 6',
  arrowFlat: 'M5 12h14',
  arrowDown: 'M6 9l6 6 6-6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v6m0-9.5v.01',
  layers: 'M12 4 3.5 8.5 12 13l8.5-4.5L12 4ZM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5',
  nib: 'M12 3l5 9-3.5 6h-3L7 12l5-9Zm0 7.5V18m-2.5 3h5',
  image: 'M4 5h16v14H4V5Zm0 10 4.5-4.5 4 4 2.5-2.5L20 17M15 9.5h.01',
  calendar: 'M4 6h16v14H4V6Zm0 4h16M8 3.5V7m8-3.5V7',
  chevron: 'M9.5 5.5 16 12l-6.5 6.5',
  filter: 'M4 6h16M7 12h10M10 18h4',
  book: 'M12 6.5C10 5 7 4.5 4 5v13.5c3-.5 6 0 8 1.5m0-13.5c2-1.5 5-2 8-1.5v13.5c-3-.5-6 0-8 1.5m0-13.5V20',
  slider: 'M4 12h16M9 8l-4 4 4 4m6-8 4 4-4 4',
  freeze: 'M7 4h10v16H7V4Zm3 5h4m-4 4h4',
} as const;

export type IconName = keyof typeof PATHS | 'ratingPartly' | 'ratingYes';

interface IconProps {
  name: IconName;
  size?: number;
  /** Accessible name. Omit for decorative icons that sit beside a text label. */
  label?: string;
}

function a11y(label: string | undefined) {
  return label ? ({ role: 'img', 'aria-label': label } as const) : ({ 'aria-hidden': true } as const);
}

export function Icon({ name, size = 24, label }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 1.75,
    'stroke-linecap': 'round' as const,
    'stroke-linejoin': 'round' as const,
    ...a11y(label),
  };
  // The three rating marks differ by fill, so they read without colour: empty, half, solid.
  if (name === 'ratingPartly') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4a8 8 0 0 0 0 16V4Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'ratingYes') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d={PATHS[name]} />
    </svg>
  );
}
