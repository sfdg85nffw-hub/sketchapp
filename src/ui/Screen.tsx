import type { ComponentChildren } from 'preact';
import { Icon } from './Icon';
import { goBack } from './router';

interface ScreenProps {
  children: ComponentChildren;
  /** Buttons pinned to the bottom of the screen, in the thumb zone. */
  actions?: ComponentChildren;
  /** Adds a thumb-reachable Back button to the action bar, falling back to this route. */
  back?: string;
  label: string;
}

/** A scrolling screen with an optional pinned action bar. */
export function Screen({ children, actions, back, label }: ScreenProps) {
  return (
    <>
      <main class="screen" aria-label={label}>
        {children}
        <div class="screen-end" />
      </main>
      {actions && (
        <div class="actionbar">
          {back && (
            <button type="button" class="icon-btn" aria-label="Back" onClick={() => goBack(back)}>
              <Icon name="back" />
            </button>
          )}
          {actions}
        </div>
      )}
    </>
  );
}
