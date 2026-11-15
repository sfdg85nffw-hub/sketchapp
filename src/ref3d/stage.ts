import * as THREE from 'three';
import { loadBinary } from './binary';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { lightVector, type LightingSetup } from '../lib/ref/lighting';
import type { CameraSpec } from '../lib/ref/scene';
import { direction, turnY, type Vec3 } from '../lib/ref/vec';
import { fieldOfView } from '../lib/ref/views';

/** Stills are rendered once per image at this size, then shown like any photo. Portrait 4:5. */
export const STILL = { width: 1080, height: 1350 } as const;

let renderer: THREE.WebGLRenderer | null = null;

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function getRenderer(): THREE.WebGLRenderer {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(1);
    renderer.setSize(STILL.width, STILL.height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  return renderer;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not read the rendered image.'))), type, quality));
}

/** Render one frame and hand it back as a JPEG. Nothing keeps animating afterwards. */
export async function renderStill(scene: THREE.Scene, camera: THREE.Camera): Promise<Blob> {
  const r = getRenderer();
  r.setClearColor(0x000000, 1);
  r.render(scene, camera);
  return toBlob(r.domElement, 'image/jpeg', 0.92);
}

const depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });

/**
 * Render with every material swapped for `material` over a transparent background: for line overlays.
 * A depth-only pass goes first, so lines on the far side of a form stay hidden behind it.
 */
export async function renderOverlay(scene: THREE.Scene, camera: THREE.Camera, material: THREE.Material): Promise<Blob> {
  const r = getRenderer();
  const background = scene.background;
  scene.background = null;
  r.setClearColor(0x000000, 0);
  r.autoClear = false;
  r.clear();
  scene.overrideMaterial = depthOnly;
  r.render(scene, camera);
  scene.overrideMaterial = material;
  r.render(scene, camera);
  scene.overrideMaterial = null;
  r.autoClear = true;
  scene.background = background;
  return toBlob(r.domElement, 'image/png');
}

const grey = (value: number) => new THREE.Color().setRGB(value, value, value, THREE.SRGBColorSpace);

export interface LitScene {
  /** Unit vector from the subject towards the key light, in world space. */
  keyDirection: Vec3;
}

/**
 * Put a named lighting setup into a scene. `turn` rotates the whole rig about the
 * vertical axis, so the same recipe can be relative to a turned head or to the camera.
 */
export function applyLighting(scene: THREE.Scene, setup: LightingSetup, options: { turn: number; center: THREE.Vector3; radius: number }): LitScene {
  const { turn, center, radius } = options;
  scene.background = grey(setup.background);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8782, setup.fill * 2.2));

  const place = (spec: LightingSetup['key'], castShadow: boolean) => {
    const dir = turnY(lightVector(spec), turn);
    const light = new THREE.DirectionalLight(0xffffff, spec.intensity);
    light.position.set(center.x + dir[0] * radius * 4, center.y + dir[1] * radius * 4, center.z + dir[2] * radius * 4);
    light.target.position.copy(center);
    light.castShadow = castShadow;
    if (castShadow) {
      const cam = light.shadow.camera;
      cam.left = cam.bottom = -radius * 1.6;
      cam.right = cam.top = radius * 1.6;
      cam.near = radius * 0.5;
      cam.far = radius * 9;
      light.shadow.mapSize.set(2048, 2048);
      light.shadow.bias = -0.0004;
      light.shadow.normalBias = 0.02 * radius;
      light.shadow.radius = setup.soft ? 9 : 2.2;
      light.shadow.blurSamples = setup.soft ? 20 : 10;
    }
    scene.add(light, light.target);
    return dir;
  };

  const keyDirection = place(setup.key, true);
  if (setup.second) place(setup.second, setup.second.intensity > 1);
  return { keyDirection };
}

/** A perspective camera orbiting `target`. Field of view comes from the 35mm-equivalent focal length. */
export function makeCamera(spec: CameraSpec, target: THREE.Vector3): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(fieldOfView(spec.focal), STILL.width / STILL.height, 0.05, 200);
  const dir = direction(spec.azimuth, spec.elevation);
  camera.position.set(target.x + dir[0] * spec.distance, target.y + dir[1] * spec.distance, target.z + dir[2] * spec.distance);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  return camera;
}

/** Distance at which a sphere of `radius` fills the frame with a margin. */
export function framingDistance(radius: number, focal: number, margin = 1.15): number {
  const vertical = (fieldOfView(focal) * Math.PI) / 180;
  const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * (STILL.width / STILL.height));
  return (radius * margin) / Math.sin(Math.min(vertical, horizontal) / 2);
}

/** Project a world point to picture coordinates, 0-1 from the top-left. */
export function project(point: Vec3, camera: THREE.Camera): [number, number] {
  const v = new THREE.Vector3(point[0], point[1], point[2]).project(camera);
  return [(v.x + 1) / 2, (1 - v.y) / 2];
}

export function ground(size: number, value: number): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ color: grey(value), roughness: 1, metalness: 0 }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  mesh.userData.ground = true;
  return mesh;
}

export const MATERIALS = {
  plaster: () => new THREE.MeshStandardMaterial({ color: 0xe8e3d9, roughness: 0.96, metalness: 0 }),
  dark: () => new THREE.MeshStandardMaterial({ color: 0x3b3936, roughness: 0.9, metalness: 0 }),
  metal: () => new THREE.MeshStandardMaterial({ color: 0xd2d5d9, roughness: 0.2, metalness: 1 }),
  skin: () => new THREE.MeshStandardMaterial({ color: 0xd6c6b6, roughness: 0.82, metalness: 0 }),
  bone: () => new THREE.MeshStandardMaterial({ color: 0xe2dac8, roughness: 0.88, metalness: 0 }),
  wood: () => new THREE.MeshStandardMaterial({ color: 0xcaa67c, roughness: 0.72, metalness: 0 }),
};

/** A soft studio surround so polished metal has something to reflect. Built from code, no image file. */
export function studioEnvironment(): THREE.Texture {
  const room = new THREE.Scene();
  room.background = grey(0.3);
  const panel = (w: number, h: number, value: number, position: [number, number, number]) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: grey(value), side: THREE.DoubleSide }));
    mesh.position.set(...position);
    mesh.lookAt(0, 0, 0);
    room.add(mesh);
  };
  panel(6, 3, 1, [0, 6, 0]);
  panel(2, 6, 0.9, [-6, 2, 2]);
  panel(1.2, 6, 0.75, [6, 1, -2]);
  panel(8, 1, 0.5, [0, 1, 7]);
  const pmrem = new THREE.PMREMGenerator(getRenderer());
  const texture = pmrem.fromScene(room, 0.03).texture;
  pmrem.dispose();
  return texture;
}

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const geometryCache = new Map<string, Promise<Map<string, THREE.BufferGeometry>>>();

/** Load a bundled GLB once and return its meshes' geometry by node name, with normals. */
export function loadGeometries(url: string): Promise<Map<string, THREE.BufferGeometry>> {
  let pending = geometryCache.get(url);
  if (!pending) {
    pending = loadBinary(url, 'A 3D model is missing from this build.').then(async (bytes) => {
      const gltf = await loader.parseAsync(bytes, '');
      const found = new Map<string, THREE.BufferGeometry>();
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        // Compressed models store positions as quantised integers plus a node transform.
        // Bake both into plain floats so every engine can treat the geometry the same way.
        const source = mesh.geometry.getAttribute('position');
        const positions = new Float32Array(source.count * 3);
        const point = new THREE.Vector3();
        for (let i = 0; i < source.count; i++) point.fromBufferAttribute(source, i).applyMatrix4(mesh.matrixWorld).toArray(positions, i * 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setIndex(mesh.geometry.getIndex());
        geometry.computeVertexNormals();
        found.set(mesh.name || mesh.parent?.name || `mesh-${found.size}`, geometry);
      });
      return found;
    });
    geometryCache.set(url, pending);
    pending.catch(() => geometryCache.delete(url));
  }
  return pending;
}

/** Free everything a one-off scene allocated on the GPU. Shared, cached geometry is left alone. */
export function disposeScene(scene: THREE.Scene, keep: ReadonlySet<THREE.BufferGeometry> = new Set()): void {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) {
      if (!keep.has(mesh.geometry)) mesh.geometry.dispose();
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose();
    }
    const light = object as THREE.DirectionalLight;
    if (light.isDirectionalLight) light.shadow.map?.dispose();
  });
  scene.environment?.dispose();
}

/**
 * Draws a two-tone line where a surface turns away from the key light (N·L = 0):
 * the terminator. Light core, dark casing, so it reads on any value without relying on hue.
 */
export function terminatorMaterial(lightDirection: Vec3): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthFunc: THREE.LessEqualDepth,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    uniforms: { uLight: { value: new THREE.Vector3(...lightDirection).normalize() } },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uLight;
      varying vec3 vNormal;
      void main() {
        float d = dot(normalize(vNormal), uLight);
        float w = max(fwidth(d), 0.0005);
        float a = abs(d) / w;
        float core = 1.0 - smoothstep(1.2, 2.2, a);
        float casing = 1.0 - smoothstep(3.4, 4.6, a);
        if (casing <= 0.01) discard;
        gl_FragColor = vec4(vec3(mix(0.05, 1.0, core)), casing);
      }`,
  });
}
