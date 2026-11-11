import { useState } from 'preact/hooks';
import { PROJECT_STAGES, PROJECT_TEMPLATES, templateById, type ProjectTemplate } from '../data/projects';
import { weaknessById } from '../data/weaknesses';
import { deleteProject, getEntries, getProjects, putEntry, putProject } from '../db/db';
import { newId } from '../lib/id';
import type { Project } from '../lib/types';
import { setPendingCapture } from '../ui/captureStore';
import { EntryThumb } from '../ui/EntryCard';
import { useLive } from '../ui/hooks';
import { Icon } from '../ui/Icon';
import { Button, Divider, FileButton, Header, Section, Sheet, toast } from '../ui/kit';
import { navigate } from '../ui/router';
import { Screen } from '../ui/Screen';

function newProject(template?: ProjectTemplate): Project {
  return {
    id: newId('project'),
    templateId: template?.id,
    title: template?.title ?? 'Untitled project',
    brief: template?.brief ?? '',
    feeling: template?.feeling ?? '',
    weaknessIds: template ? [...template.weaknessIds] : [],
    targets: template ? [...template.targets] : [],
    stages: PROJECT_STAGES.map((s) => ({ key: s.key, done: false })),
    entryIds: [],
    createdAt: new Date().toISOString(),
  };
}

export function stageSummary(project: Project): string {
  const done = project.stages.filter((s) => s.done).length;
  const next = PROJECT_STAGES.find((def) => !project.stages.find((s) => s.key === def.key)?.done);
  return next ? `${done} of ${project.stages.length} stages · next: ${next.label.toLowerCase()}` : 'All five stages done';
}

export function Projects() {
  const projects = useLive(getProjects);
  if (!projects) return <Screen label="Projects">{null}</Screen>;

  const begin = async (template?: ProjectTemplate) => {
    const project = newProject(template);
    await putProject(project);
    navigate(`/project/${project.id}`);
  };

  return (
    <Screen label="Projects">
      <Header title="Projects" back="/practice" />
      <p class="muted">Spreads that take more than one sitting, each built around a feeling rather than a subject.</p>

      {projects.length > 0 && (
        <Section title="Under way">
          <ul class="stack">
            {projects.map((project) => (
              <li key={project.id}>
                <a class="list-link" href={`#/project/${project.id}`}>
                  <Icon name="layers" />
                  <span class="grow">
                    {project.title}
                    <span class="sub">{stageSummary(project)}</span>
                  </span>
                  <Icon name="chevron" size={20} />
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Divider />

      <Section title="Start from a template" hint="Each one targets things the critique flagged. Everything is editable once started.">
        <ul class="stack-lg">
          {PROJECT_TEMPLATES.map((template) => (
            <li key={template.id} class="card">
              <h3 class="h2">{template.title}</h3>
              <p>
                <span class="kicker">Feeling</span> <span class="hand">{template.feeling}</span>
              </p>
              <p class="muted">{template.brief}</p>
              <ul class="row-wrap" aria-label="Targets">
                {template.targets.map((target) => (
                  <li key={target} class="tag">
                    {target}
                  </li>
                ))}
              </ul>
              <Button variant="primary" block onClick={() => void begin(template)}>
                Start "{template.title}"
              </Button>
            </li>
          ))}
        </ul>
        <Button block icon="plus" onClick={() => void begin()}>
          Start a blank project
        </Button>
      </Section>
    </Screen>
  );
}

type SheetKind = 'edit' | 'link' | 'delete' | null;

export function ProjectDetail({ id }: { id: string }) {
  const projects = useLive(getProjects);
  const entries = useLive(getEntries);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [form, setForm] = useState({ title: '', feeling: '', brief: '' });

  if (!projects || !entries) return <Screen label="Project">{null}</Screen>;
  const project = projects.find((p) => p.id === id);
  if (!project) {
    return (
      <Screen label="Project">
        <Header title="Project not found" back="/projects" />
      </Screen>
    );
  }

  const template = templateById(project.templateId);
  const linked = entries.filter((e) => project.entryIds.includes(e.id));
  const save = (patch: Partial<Project>) => putProject({ ...project, ...patch });
  const setStage = (key: string, patch: { done?: boolean; note?: string }) =>
    save({ stages: project.stages.map((s) => (s.key === key ? { ...s, ...patch } : s)) });

  const toggleLink = async (entryId: string) => {
    const has = project.entryIds.includes(entryId);
    await save({ entryIds: has ? project.entryIds.filter((e) => e !== entryId) : [...project.entryIds, entryId] });
    const entry = entries.find((e) => e.id === entryId);
    if (entry) await putEntry({ ...entry, projectId: has ? undefined : project.id });
  };

  return (
    <Screen label={project.title}>
      <Header title={project.title} kicker="Project" back="/projects">
        <button
          type="button"
          class="icon-btn"
          aria-label="Edit project"
          onClick={() => {
            setForm({ title: project.title, feeling: project.feeling, brief: project.brief });
            setSheet('edit');
          }}
        >
          <Icon name="edit" />
        </button>
      </Header>

      {project.feeling && (
        <p>
          <span class="kicker">Feeling</span>
          <br />
          <span class="hand h2">{project.feeling}</span>
        </p>
      )}
      {project.brief && <p>{project.brief}</p>}
      {(project.targets.length > 0 || project.weaknessIds.length > 0) && (
        <ul class="row-wrap" aria-label="Targets">
          {project.targets.map((target) => (
            <li key={target} class="tag">
              {target}
            </li>
          ))}
          {project.weaknessIds.map((w) => (
            <li key={w} class="tag">
              {weaknessById(w).skill}
            </li>
          ))}
        </ul>
      )}

      {template && (
        <div class="card card-note">
          <p class="kicker">Notes to self</p>
          <ul class="stack small">
            {template.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      <Section title="Stages" hint={stageSummary(project)}>
        <ol class="stage-list">
          {PROJECT_STAGES.map((def, i) => {
            const stage = project.stages.find((s) => s.key === def.key) ?? { key: def.key, done: false };
            return (
              <li key={def.key}>
                <input
                  id={`stage-${def.key}`}
                  class="check"
                  type="checkbox"
                  checked={stage.done}
                  onChange={(e) => void setStage(def.key, { done: e.currentTarget.checked })}
                />
                <div class="grow stack">
                  <label for={`stage-${def.key}`}>
                    <strong>
                      {i + 1}. {def.label}
                    </strong>
                    <span class="hint small" style={{ display: 'block' }}>
                      {def.hint}
                    </span>
                  </label>
                  <input
                    class="input"
                    type="text"
                    aria-label={`Note for ${def.label}`}
                    placeholder="Note"
                    maxLength={160}
                    value={stage.note ?? ''}
                    onChange={(e) => void setStage(def.key, { note: e.currentTarget.value })}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section title="Pages" hint="Thumbnails, value plans and the spread itself, linked from your journal.">
        {linked.length > 0 && (
          <div class="thumb-grid">
            {linked.map((entry) => (
              <EntryThumb key={entry.id} entry={entry} />
            ))}
          </div>
        )}
        <FileButton
          variant="primary"
          block
          icon="camera"
          camera
          onFile={(file) => {
            setPendingCapture(file, { projectId: project.id });
            navigate('/capture');
          }}
        >
          Capture a page for this project
        </FileButton>
        {entries.length > 0 && (
          <Button block icon="plus" onClick={() => setSheet('link')}>
            Link a journal entry
          </Button>
        )}
      </Section>

      {sheet === 'edit' && (
        <Sheet title="Edit project" onClose={() => setSheet(null)}>
          <div class="field">
            <label for="project-title">Title</label>
            <input id="project-title" class="input" type="text" maxLength={60} value={form.title} onInput={(e) => setForm({ ...form, title: e.currentTarget.value })} />
          </div>
          <div class="field">
            <label for="project-feeling">Feeling word</label>
            <input id="project-feeling" class="input" type="text" maxLength={40} autocapitalize="none" value={form.feeling} onInput={(e) => setForm({ ...form, feeling: e.currentTarget.value })} />
          </div>
          <div class="field">
            <label for="project-brief">What is it?</label>
            <textarea id="project-brief" class="input" rows={4} maxLength={500} value={form.brief} onInput={(e) => setForm({ ...form, brief: e.currentTarget.value })} />
          </div>
          <Button
            variant="primary"
            block
            large
            onClick={() => {
              void save({ title: form.title.trim() || 'Untitled project', feeling: form.feeling.trim(), brief: form.brief.trim() });
              setSheet(null);
            }}
          >
            Save
          </Button>
          <Button block icon="trash" onClick={() => setSheet('delete')}>
            Delete project
          </Button>
        </Sheet>
      )}

      {sheet === 'link' && (
        <Sheet title="Link journal entries" onClose={() => setSheet(null)}>
          <p class="muted small">Tap to link or unlink.</p>
          <div class="thumb-grid">
            {entries.map((entry) => (
              <EntryThumb key={entry.id} entry={entry} picked={project.entryIds.includes(entry.id)} onPick={(e) => void toggleLink(e.id)} />
            ))}
          </div>
          <Button variant="primary" block onClick={() => setSheet(null)}>
            Done
          </Button>
        </Sheet>
      )}

      {sheet === 'delete' && (
        <Sheet title="Delete this project?" onClose={() => setSheet(null)}>
          <p>The plan and stage notes go. The linked sketches stay in your journal.</p>
          <Button
            block
            icon="trash"
            onClick={() => {
              void deleteProject(project.id).then(() => {
                toast('Project deleted.');
                navigate('/projects', { replace: true });
              });
            }}
          >
            Delete project
          </Button>
          <Button variant="primary" block onClick={() => setSheet(null)}>
            Keep it
          </Button>
        </Sheet>
      )}
    </Screen>
  );
}
