import { Vector3, } from 'three';
const localVector = new Vector3();
const localVector2 = new Vector3();

export function getWorldPosition(o) {
  return localVector.setFromMatrixPosition(o.matrixWorld);
}

export function getWorldQuaternion(o, q) {
  o.matrixWorld.decompose(localVector, q, localVector2);
  return q;
}

export function getWorldScale(o, v) {
  return v.setFromMatrixScale(o.matrixWorld);
}