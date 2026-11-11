import { MATERIAL_NOTES } from '../data/materials';
import { Header } from '../ui/kit';
import { Screen } from '../ui/Screen';

export function Materials() {
  return (
    <Screen label="Materials notes">
      <Header title="Materials notes" back="/progress" />
      <p class="muted">Short answers to the problems that are about kit, not skill.</p>
      {MATERIAL_NOTES.map((note) => (
        <article key={note.id} class="card">
          <h2>{note.title}</h2>
          <p class="hand">{note.summary}</p>
          <ul class="stack">
            {note.points.map((point) => (
              <li key={point} style={{ paddingLeft: '1.1rem', textIndent: '-1.1rem' }}>
                <span aria-hidden="true">– </span>
                {point}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </Screen>
  );
}
