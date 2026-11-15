// Writes one indexed triangle mesh as a meshopt-compressed GLB.
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression } from '@gltf-transform/extensions';
import { meshopt, reorder, weld } from '@gltf-transform/functions';
import { statSync } from 'node:fs';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

export async function ioWithMeshopt() {
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;
  return new NodeIO().registerExtensions([EXTMeshoptCompression]).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
}

export async function compress(document) {
  await document.transform(weld(), reorder({ encoder: MeshoptEncoder }), meshopt({ encoder: MeshoptEncoder, level: 'high' }));
}

export async function writeGlb(file, positions, indices, name = 'mesh') {
  const document = new Document();
  const buffer = document.createBuffer();
  const primitive = document
    .createPrimitive()
    .setAttribute('POSITION', document.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer))
    .setIndices(document.createAccessor().setType('SCALAR').setArray(indices).setBuffer(buffer));
  const node = document.createNode(name).setMesh(document.createMesh(name).addPrimitive(primitive));
  document.createScene().addChild(node);
  await compress(document);
  await (await ioWithMeshopt()).write(file, document);
  return statSync(file).size;
}

/** Several named meshes in one GLB. Parts may share a positions array. */
export async function writeGlbParts(file, parts) {
  const document = new Document();
  const buffer = document.createBuffer();
  const scene = document.createScene();
  for (const part of parts) {
    const primitive = document
      .createPrimitive()
      .setAttribute('POSITION', document.createAccessor().setType('VEC3').setArray(part.positions).setBuffer(buffer))
      .setIndices(document.createAccessor().setType('SCALAR').setArray(part.indices).setBuffer(buffer));
    scene.addChild(document.createNode(part.name).setMesh(document.createMesh(part.name).addPrimitive(primitive)));
  }
  await compress(document);
  await (await ioWithMeshopt()).write(file, document);
  return statSync(file).size;
}
