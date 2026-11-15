// Dev-time: turns Khronos' CC0 "Skull" sample model into the small matte skull the app bundles.
// Source: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ScatteringSkull
//   (model by Vladimir Petkovic, CC0 1.0)
// Run with: node scripts/build-skull.mjs path/to/ScatteringSkull.glb
import { dedup, prune, simplify, weld } from '@gltf-transform/functions';
import { mkdirSync, statSync } from 'node:fs';
import { MeshoptSimplifier } from 'meshoptimizer';
import { compress, ioWithMeshopt } from './lib/glb.mjs';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/build-skull.mjs path/to/ScatteringSkull.glb');
  process.exit(1);
}
const RATIO = Number(process.env.RATIO ?? 0.35);
const OUT = 'public/models/skull.glb';

const io = await ioWithMeshopt();
const document = await io.read(input);
const root = document.getRoot();

let before = 0;
for (const mesh of root.listMeshes()) {
  for (const primitive of mesh.listPrimitives()) {
    before += primitive.getIndices().getCount() / 3;
    // The app renders it as matte bone under its own lights: geometry only.
    for (const semantic of primitive.listSemantics()) if (semantic !== 'POSITION') primitive.setAttribute(semantic, null);
    primitive.setMaterial(null);
  }
}
for (const material of root.listMaterials()) material.dispose();
for (const texture of root.listTextures()) texture.dispose();

await MeshoptSimplifier.ready;
await document.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: RATIO, error: 0.0008 }), dedup(), prune());
let after = 0;
for (const mesh of root.listMeshes()) for (const primitive of mesh.listPrimitives()) after += primitive.getIndices().getCount() / 3;

await compress(document);
mkdirSync('public/models', { recursive: true });
await io.write(OUT, document);
console.log(`${OUT}: ${before} -> ${after} triangles, ${(statSync(OUT).size / 1024).toFixed(0)} KB`);
for (const node of root.listNodes()) console.log('node', node.getName(), node.getTranslation(), node.getScale(), node.getMesh()?.getName());
