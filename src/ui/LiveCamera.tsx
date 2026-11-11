import { useEffect, useRef, useState } from 'preact/hooks';
import { EMBEDDED } from '../env';
import type { ValueSteps } from '../lib/color/value';
import { applyValueFilter, fitWithin } from '../lib/image/filters';
import type { IconName } from './Icon';
import { Button, Chips, Segmented } from './kit';
import { STEP_OPTIONS } from './ValueTools';

type LiveMode = 'original' | 'grey' | 'values' | 'squint' | 'glance';

const LIVE_MODES: readonly { value: LiveMode; label: string; icon: IconName }[] = [
  { value: 'values', label: 'Value map', icon: 'values' },
  { value: 'grey', label: 'Grayscale', icon: 'neutral' },
  { value: 'squint', label: 'Squint', icon: 'squint' },
  { value: 'glance', label: 'Passerby', icon: 'glance' },
  { value: 'original', label: 'Camera', icon: 'camera' },
];

const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2((a_pos.x + 1.0) * 0.5, 1.0 - (a_pos.y + 1.0) * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/** The same maths as lib/color: sRGB -> linear -> luminance -> L*, then equal L* bands. */
const FRAGMENT = `
precision highp float;
uniform sampler2D u_tex;
uniform float u_steps; // -1 passthrough, 0 continuous grey, 2/3/5 posterize
varying vec2 v_uv;
vec3 toLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
void main() {
  vec3 c = texture2D(u_tex, v_uv).rgb;
  if (u_steps < 0.0) { gl_FragColor = vec4(c, 1.0); return; }
  float y = dot(toLinear(c), vec3(0.2126729, 0.7151522, 0.072175));
  float l = y > 0.008856 ? 116.0 * pow(y, 1.0 / 3.0) - 16.0 : 903.3 * y;
  if (u_steps >= 2.0) {
    float band = min(u_steps - 1.0, floor(l / 100.0 * u_steps));
    l = band / (u_steps - 1.0) * 100.0;
  }
  float f = (l + 16.0) / 116.0;
  float yo = f * f * f > 0.008856 ? f * f * f : (116.0 * f - 16.0) / 903.3;
  float g = yo <= 0.0031308 ? yo * 12.92 : 1.055 * pow(yo, 1.0 / 2.4) - 0.055;
  gl_FragColor = vec4(vec3(g), 1.0);
}`;

interface Renderer {
  draw: (video: HTMLVideoElement, steps: number) => void;
  dispose: () => void;
}

function createGlRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const stepsLocation = gl.getUniformLocation(program, 'u_steps');

  return {
    draw(video, steps) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.uniform1f(stepsLocation, steps);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

/** Canvas-2D fallback at reduced resolution, for devices without WebGL. */
function create2dRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  return {
    draw(video, steps) {
      const size = fitWithin(video.videoWidth, video.videoHeight, 480);
      if (canvas.width !== size.width || canvas.height !== size.height) {
        canvas.width = size.width;
        canvas.height = size.height;
      }
      ctx.drawImage(video, 0, 0, size.width, size.height);
      if (steps < 0) return;
      const frame = ctx.getImageData(0, 0, size.width, size.height);
      applyValueFilter(frame.data, { steps, autoRange: false });
      ctx.putImageData(frame, 0, 0);
    },
    dispose() {},
  };
}

type CameraState = 'idle' | 'starting' | 'live' | 'denied' | 'unavailable';

interface LiveCameraProps {
  /** Called with a still frame when he freezes the view to identify a colour. */
  onFreeze: (frame: Blob) => void;
}

export function LiveCamera({ onFreeze }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<CameraState>('idle');
  const [mode, setMode] = useState<LiveMode>('values');
  const [steps, setSteps] = useState<ValueSteps>(3);
  const [blur, setBlur] = useState(6);
  const [flipped, setFlipped] = useState(false);
  const settings = useRef({ mode, steps });
  settings.current = { mode, steps };

  // The Artifact preview frame refuses the camera outright, so offer photos there instead.
  const supported = !EMBEDDED && typeof navigator.mediaDevices?.getUserMedia === 'function';

  useEffect(() => {
    if (state !== 'starting') return;
    let stream: MediaStream | null = null;
    let renderer: Renderer | null = null;
    let raf = 0;
    let alive = true;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const loop = () => {
      if (!alive) return;
      if (renderer && video.readyState >= 2 && video.videoWidth > 0) {
        const { mode: m, steps: s } = settings.current;
        renderer.draw(video, m === 'grey' ? 0 : m === 'values' ? s : -1);
        // Frame counter for the e2e test and for checking the frame rate on a real phone.
        canvas.dataset.frames = String(Number(canvas.dataset.frames ?? 0) + 1);
      }
      raf = requestAnimationFrame(loop);
    };

    navigator.mediaDevices
      .getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then(async (media) => {
        if (!alive) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = media;
        video.srcObject = media;
        await video.play();
        renderer = createGlRenderer(canvas) ?? create2dRenderer(canvas);
        if (!renderer) {
          setState('unavailable');
          return;
        }
        setState('live');
        loop();
      })
      .catch((error: unknown) => {
        if (!alive) return;
        const name = error instanceof DOMException ? error.name : '';
        setState(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable');
      });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      renderer?.dispose();
      stream?.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    };
    // The effect starts on 'starting' and must keep running through 'live'.
  }, [state === 'starting' || state === 'live']);

  const freeze = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const still = document.createElement('canvas');
    still.width = video.videoWidth;
    still.height = video.videoHeight;
    still.getContext('2d')?.drawImage(video, 0, 0);
    still.toBlob((blob) => blob && onFreeze(blob), 'image/jpeg', 0.9);
  };

  if (!supported || state === 'denied' || state === 'unavailable') {
    return (
      <div class="card stack" data-testid="camera-fallback">
        <h2>{state === 'denied' ? 'Camera access is off' : 'No live camera here'}</h2>
        <p class="muted">
          {EMBEDDED
            ? 'This preview cannot use the live camera; the installed app can. The same tools work on a photo, just below.'
            : state === 'denied'
            ? 'Allow the camera for this app in Settings › Safari › Camera, then come back. Until then, the same tools work on a photo, just below.'
            : 'This browser will not give the app a live camera feed. The same tools work on a photo, just below.'}
        </p>
      </div>
    );
  }

  const live = state === 'live';
  return (
    <div class="stack">
      <div class={`stage live-stage${mode === 'glance' ? ' glance stage-glance' : ''}`} style={{ display: state === 'idle' ? 'none' : 'grid' }}>
        <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
        <canvas
          ref={canvasRef}
          class={flipped ? 'flip' : ''}
          data-testid="live-canvas"
          role="img"
          aria-label={`Live camera, ${LIVE_MODES.find((m) => m.value === mode)?.label ?? ''}`}
          style={mode === 'squint' ? { filter: `blur(${blur}px)` } : mode === 'glance' ? { filter: 'blur(0.6px)' } : {}}
        />
      </div>
      {mode === 'glance' && live && <p class="stage-caption hand">What reads at a glance?</p>}

      {state === 'idle' && (
        <div class="card stack">
          <h2>See the scene in values</h2>
          <p class="muted">Point the phone at what you are about to draw. Two values gives you the notan; three or five gives you a plan for a thumbnail.</p>
          <Button variant="primary" block large icon="eye" onClick={() => setState('starting')}>
            Start live view
          </Button>
        </div>
      )}
      {state === 'starting' && (
        <p class="muted" role="status">
          Starting the camera… If iOS asks, allow it. If nothing happens, the same tools work on a photo, just below.
        </p>
      )}

      {live && (
        <>
          <Chips label="Live view" scroll options={LIVE_MODES} selected={[mode]} onToggle={setMode} />
          {mode === 'values' && <Segmented label="Number of values" options={STEP_OPTIONS} value={steps} onChange={setSteps} />}
          {mode === 'squint' && (
            <div class="field">
              <label for="live-squint">Squint</label>
              <input id="live-squint" type="range" min={0} max={24} step={1} value={blur} onInput={(e) => setBlur(Number(e.currentTarget.value))} />
            </div>
          )}
          <div class="row-wrap">
            <Button variant="primary" icon="pipette" onClick={freeze}>
              Freeze and identify a color
            </Button>
            <Button icon="flip" aria-pressed={flipped} onClick={() => setFlipped(!flipped)}>
              {flipped ? 'Mirrored' : 'Mirror flip'}
            </Button>
            <Button variant="quiet" onClick={() => setState('idle')}>
              Stop camera
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
