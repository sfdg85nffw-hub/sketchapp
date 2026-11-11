import type { ButtonHTMLAttributes, ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Rating } from '../lib/types';
import { Icon, type IconName } from './Icon';
import { useImageUrl } from './hooks';
import { goBack } from './router';

/* ---------- layout ---------- */

interface HeaderProps {
  title: string;
  kicker?: string;
  /** Route to fall back to when there is no history; shows a back button. */
  back?: string;
  children?: ComponentChildren;
}

export function Header({ title, kicker, back, children }: HeaderProps) {
  return (
    <header class="header">
      {back && (
        <button type="button" class="icon-btn" aria-label="Back" onClick={() => goBack(back)}>
          <Icon name="back" />
        </button>
      )}
      <div class="grow">
        {kicker && <p class="kicker">{kicker}</p>}
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  );
}

/** A hand-drawn rule: an SVG path with a slight wobble instead of a CSS border. */
export function Divider() {
  return (
    <svg class="divider" viewBox="0 0 300 10" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M2 5.5c28-2.2 51 1.6 82 .2 35-1.6 58-2 96-.4 31 1.3 62 2 118-.8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  );
}

export function Section({ title, hint, children }: { title: string; hint?: string; children: ComponentChildren }) {
  return (
    <section class="stack">
      <div>
        <h2>{title}</h2>
        {hint && <p class="muted small">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function Empty({ icon, title, children }: { icon: IconName; title: string; children?: ComponentChildren }) {
  return (
    <div class="empty">
      <Icon name={icon} size={36} />
      <h2>{title}</h2>
      {children}
    </div>
  );
}

/* ---------- buttons ---------- */

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'class' | 'icon'> & {
  variant?: 'primary' | 'secondary' | 'quiet';
  icon?: IconName;
  block?: boolean;
  large?: boolean;
};

export function Button({ variant = 'secondary', icon, block, large, children, ...rest }: ButtonProps) {
  const classes = ['btn', variant === 'primary' && 'btn-primary', variant === 'quiet' && 'btn-quiet', block && 'btn-block', large && 'btn-lg']
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" {...rest} class={classes}>
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
    </button>
  );
}

interface FileButtonProps {
  onFile: (file: File) => void;
  /** Open the rear camera directly instead of the photo library. */
  camera?: boolean;
  accept?: string;
  variant?: 'primary' | 'secondary' | 'quiet';
  icon?: IconName;
  block?: boolean;
  large?: boolean;
  testId?: string;
  children: ComponentChildren;
}

/** A button-styled label around a file input, so one tap opens the camera or picker. */
export function FileButton({ onFile, camera, accept = 'image/*', variant = 'secondary', icon, block, large, testId, children }: FileButtonProps) {
  const classes = ['btn', variant === 'primary' && 'btn-primary', variant === 'quiet' && 'btn-quiet', block && 'btn-block', large && 'btn-lg']
    .filter(Boolean)
    .join(' ');
  return (
    <label class={classes}>
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
      <input
        class="vh"
        type="file"
        accept={accept}
        data-testid={testId}
        {...(camera ? { capture: 'environment' as const } : {})}
        onChange={(event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];
          input.value = '';
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

/* ---------- chips ---------- */

export interface ChipOption<T extends string | number> {
  value: T;
  label: string;
  icon?: IconName;
}

interface ChipsProps<T extends string | number> {
  label: string;
  options: readonly ChipOption<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  /** Lay icons above labels in equal tiles. */
  tiles?: boolean;
  scroll?: boolean;
}

/** Tappable choices. Selected chips invert and show a tick, so state never depends on hue. */
export function Chips<T extends string | number>({ label, options, selected, onToggle, tiles, scroll }: ChipsProps<T>) {
  return (
    <div class={`chips${scroll ? ' chips-scroll' : ''}`} role="group" aria-label={label}>
      {options.map((option) => {
        const on = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            class={`chip${tiles ? ' chip-col' : ''}`}
            aria-pressed={on}
            onClick={() => onToggle(option.value)}
          >
            {option.icon ? <Icon name={on && !tiles ? 'check' : option.icon} size={tiles ? 24 : 18} /> : <span class="tick"><Icon name="check" size={16} /></span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface SegmentedProps<T extends string | number> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string | number>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div class="segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- rating ---------- */

export const RATING_OPTIONS: readonly { value: Rating; label: string; icon: IconName }[] = [
  { value: 0, label: 'Not yet', icon: 'ratingNo' },
  { value: 1, label: 'Partly', icon: 'ratingPartly' },
  { value: 2, label: 'Yes', icon: 'ratingYes' },
];

export function RatingPicker({ label, value, onChange }: { label: string; value: Rating | null; onChange: (rating: Rating) => void }) {
  return (
    <div class="rating" role="radiogroup" aria-label={label}>
      {RATING_OPTIONS.map((option) => (
        <button key={option.value} type="button" role="radio" aria-checked={value === option.value} onClick={() => onChange(option.value)}>
          <Icon name={option.icon} size={22} />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export function RatingMark({ rating }: { rating: Rating }) {
  const option = RATING_OPTIONS[rating]!;
  return (
    <span class="row-wrap" style={{ gap: '0.25rem', flexWrap: 'nowrap' }}>
      <Icon name={option.icon} size={16} />
      <span>{option.label}</span>
    </span>
  );
}

/* ---------- sheet ---------- */

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ComponentChildren;
}

/** A bottom sheet. The app never stacks one sheet on another. */
export function Sheet({ title, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);
  return (
    <div class="sheet-scrim" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div class="sheet-head">
          <h2>{title}</h2>
          <button type="button" class="icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div class="sheet-body">{children}</div>
      </div>
    </div>
  );
}

/* ---------- toast ---------- */

let showToast: (message: string) => void = () => undefined;

/** Briefly confirm something. Announced politely to VoiceOver. */
export function toast(message: string): void {
  showToast(message);
}

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    showToast = (text) => {
      setMessage(text);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 3200);
    };
    return () => clearTimeout(timer);
  }, []);
  return (
    <div aria-live="polite" role="status">
      {message && <div class="toast">{message}</div>}
    </div>
  );
}

/* ---------- stored images ---------- */

export function StoredImg({ id, alt, class: className }: { id: string | undefined; alt: string; class?: string }) {
  const url = useImageUrl(id);
  return url ? <img src={url} alt={alt} class={className} draggable={false} /> : <div class={className} aria-hidden="true" />;
}

/** Filled / empty squares for a 1-3 difficulty level, with the number spelled out for screen readers. */
export function LevelPips({ level }: { level: number }) {
  return (
    <span class="pips" role="img" aria-label={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((n) => (
        <i key={n} class={n <= level ? 'on' : ''} />
      ))}
    </span>
  );
}
