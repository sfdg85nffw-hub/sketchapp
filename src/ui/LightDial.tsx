import { lightLabel } from '../screens/EntryDetail';
import { Icon } from './Icon';

const DIRECTIONS = [0, 45, 90, 135, 180, 225, 270, 315] as const;

/** A circular dial: eight tappable directions around a cube whose shadow falls away from the light. */
/**
 * A circular dial: eight tappable directions around a cube whose shadow falls away from the light.
 * Directions are degrees clockwise from straight up, as the light appears in the picture.
 */
export function LightDial({ value, onChange, answer, label = 'Light direction' }: { value: number | undefined; onChange: (degrees: number) => void; answer?: number; label?: string }) {
  const shadow = value === undefined ? null : { x: -Math.sin((value * Math.PI) / 180) * 22, y: Math.cos((value * Math.PI) / 180) * 22 };
  return (
    <div class="dial" role="radiogroup" aria-label={label} style={{ position: 'relative', aspectRatio: '1' }}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ color: 'var(--ink)' }}>
        <circle cx="100" cy="100" r="52" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 5" />
        {shadow && <ellipse cx={100 + shadow.x} cy={108 + shadow.y} rx="26" ry="14" fill="currentColor" opacity="0.75" />}
        {answer !== undefined && (
          <g transform={`rotate(${answer} 100 100)`}>
            <line x1="100" y1="12" x2="100" y2="58" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
            <path d="M88 46 100 62 112 46" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />
          </g>
        )}
        <path d="M100 78 122 90v24l-22 12-22-12V90Z" fill="var(--paper-raised)" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        <path d="M78 90l22 12 22-12M100 102v24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      </svg>
      {DIRECTIONS.map((degrees) => {
        const rad = (degrees * Math.PI) / 180;
        const on = value === degrees;
        return (
          <button
            key={degrees}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`Light from ${lightLabel(degrees)}`}
            class="icon-btn"
            style={{
              position: 'absolute',
              left: `${50 + Math.sin(rad) * 39}%`,
              top: `${50 - Math.cos(rad) * 39}%`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: on ? '2.5px solid var(--ink)' : '1.5px solid var(--line)',
              background: on ? 'var(--ink)' : 'var(--paper-raised)',
              color: on ? 'var(--paper)' : 'var(--ink-3)',
            }}
            onClick={() => onChange(degrees)}
          >
            <Icon name={on ? 'sun' : 'ratingNo'} size={on ? 24 : 12} />
          </button>
        );
      })}
    </div>
  );
}

