import { Vector3, Quaternion, Euler, Matrix4, AxesHelper, Object3D, Color, ConeBufferGeometry, Mesh, MeshBasicMaterial } from 'three';

const t = new Vector3();
const q = new Quaternion();
const FORWARD = new Vector3(0, 0, 1);
var RESETQUAT = new Quaternion();
var ROT = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
var ROTI = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
function setZForward(parsedActor) {
  var worldPos = {};
  getOriginalWorldPositions(parsedActor.hips, worldPos);
  parsedActor.hips.quaternion.multiply(ROTI);
  parsedActor.hips.updateMatrixWorld();
  parsedActor.shoulderR.quaternion.multiply(ROTI);
  parsedActor.shoulderR.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2));
  parsedActor.shoulderL.quaternion.multiply(ROTI);
  parsedActor.shoulderL.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2));
  updatePos(parsedActor.hips, worldPos);
}
function updatePos(parentBone, worldPos) {
  parentBone.updateMatrixWorld();
  parentBone.children.forEach(childBone => {
    var childBonePosWorld = worldPos[childBone.id].clone();
    parentBone.worldToLocal(childBonePosWorld);
    childBone.position.copy(childBonePosWorld);
  });
  parentBone.children.forEach(childBone => {
    updatePos(childBone, worldPos);
  });
}
function getOriginalWorldPositions(rootBone, worldPos) {
  rootBone.children.forEach(child => {
    var childWorldPos = child.getWorldPosition(new Vector3());
    worldPos[child.id] = childWorldPos;
    getOriginalWorldPositions(child, worldPos);
  });
}

const localVector = new Vector3();
const localVector2 = new Vector3();

const BANK_RIGHT = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
const BANK_LEFT = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2);
const FORWARD$1 = new Vector3(0, 0, 1);
const mixamoUP = new Vector3(1, 0, 0);
const ZERO_V = new Vector3(0, 0, 0);
const Y_180 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
const Z_180 = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI);
const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const v4 = new Vector3();
const v5 = new Vector3();
const v6 = new Vector3();
const v7 = new Vector3();
const q1 = new Quaternion();
const q2 = new Quaternion();
const q3 = new Quaternion();
const q4 = new Quaternion();
const e1 = new Euler();
const m1 = new Matrix4();
class ActorIK {
  constructor(parsedAvatar) {
    this.root = parsedAvatar.root;
    this.targetHandR = null;
    this.targetHandL = null;
    this.shoulderR = parsedAvatar.shoulderR;
    this.shoulderL = parsedAvatar.shoulderL;
    this.upperArmR = parsedAvatar.upperArmR;
    this.upperArmL = parsedAvatar.upperArmL;
    this.lowerArmR = parsedAvatar.lowerArmR;
    this.lowerArmL = parsedAvatar.lowerArmL;
    this.handR = parsedAvatar.handR;
    this.handL = parsedAvatar.handL;
    this.setup();
    this.axesHelper1 = new AxesHelper(5);
    this.axesHelper1.material.depthTest = false;
    this.axesHelper1.material.depthWrite = false;
    this.axesHelper1.material.transparent = true;
    this.axesHelper2 = new AxesHelper(5);
    this.axesHelper2.material.depthTest = false;
    this.axesHelper2.material.depthWrite = false;
    this.axesHelper2.material.transparent = true;
  }
  setup() {
    this.upperArmLength = v1.setFromMatrixPosition(this.upperArmR.matrixWorld).distanceTo(v2.setFromMatrixPosition(this.lowerArmR.matrixWorld));
    this.lowerArmLength = v1.setFromMatrixPosition(this.lowerArmR.matrixWorld).distanceTo(v2.setFromMatrixPosition(this.handR.matrixWorld));
    this.armLength = this.upperArmLength + this.lowerArmLength;
  }
  tick() {
    this.root.updateWorldMatrix(true, true);
    if (this.targetHandR) {
      this.poseArm(this.targetHandR, this.shoulderR, this.upperArmR, this.lowerArmR, this.handR, false, this.axesHelper1);
    }
    if (this.targetHandL) {
      this.poseArm(this.targetHandL, this.shoulderL, this.upperArmL, this.lowerArmL, this.handL, true, this.axesHelper2);
    }
  }
  poseArm(target, shoulder, upper, lower, hand, isLeft, axisHelper) {
    const upperArmPosition = v1.setFromMatrixPosition(upper.matrixWorld);
    const targetRotation = q2;
    const targetPos = v2;
    target.matrixWorld.decompose(targetPos, targetRotation, v3);
    const shoulderQuat = q1;
    const shoulderQuatInv = q3;
    shoulder.matrixWorld.decompose(v3, shoulderQuat, v3);
    shoulderQuatInv.copy(shoulderQuat).inverse();
    const directDistance = upperArmPosition.distanceTo(targetPos) - this.lowerArmLength;
    const hypotenuseDistance = this.upperArmLength;
    const offsetDistance = hypotenuseDistance > directDistance ? Math.sqrt(hypotenuseDistance * hypotenuseDistance - directDistance * directDistance) : 0;
    const axis = isLeft ? v3.set(1, -1, -1) : v3.set(1, 1, 1);
    const offsetDirection = v7.copy(targetPos).sub(upperArmPosition).normalize()
    .cross(axis.normalize().applyQuaternion(shoulderQuat));
    const elbowPosition = v4.copy(upperArmPosition).add(targetPos).divideScalar(2).add(v5.copy(offsetDirection).multiplyScalar(offsetDistance));
    upper.lookAt(elbowPosition);
    upper.updateMatrixWorld();
    axisHelper.position.copy(elbowPosition);
    lower.lookAt(targetPos);
    lower.updateWorldMatrix(true);
  }
}

class AvatarIK extends ActorIK {
  constructor(parsedActor, trackedPerson) {
    super(parsedActor);
    this.targetHandR = trackedPerson.handR;
    this.targetHandL = trackedPerson.handL;
  }
}

class TrackedPerson {
  constructor() {
    this.root = new Object3D();
    this.head = new Object3D();
    this.root.add(this.head);
    this.handR = new Object3D();
    this.root.add(this.handR);
    this.handL = new Object3D();
    this.root.add(this.handL);
  }
  tick() {}
}
class MirroredTrackedPerson extends TrackedPerson {
  constructor() {
    super();
  }
  tick() {
    this.handL.position.copy(this.handR.position);
    this.handL.position.x *= -1;
    this.handL.quaternion.copy(this.handR.quaternion);
    this.handL.quaternion.y *= -1;
    this.handL.quaternion.z *= -1;
  }
}

class BoneHelper extends Object3D {
  constructor(height, boneSize, axesSize) {
    super();
    if (height !== 0) {
      const geo = new ConeBufferGeometry(boneSize, height, 4);
      geo.applyMatrix(new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), Math.PI / 2));
      this.boneMesh = new Mesh(geo, new MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        depthTest: false,
        depthWrite: false
      }));
    } else {
      this.boneMesh = new Object3D();
    }
    this.boneMesh.position.z = height / 2;
    this.add(this.boneMesh);
    this.axesHelper = new AxesHelper(axesSize);
    this.axesHelper.material.depthTest = false;
    this.axesHelper.material.depthWrite = false;
    this.axesHelper.material.transparent = true;
    this.add(this.axesHelper);
  }
}
class SkeletonAxisHelper extends Object3D {
  constructor(rootBone, {
    color,
    showBones,
    boneSize,
    showAxes,
    axesSize,
    wireframe
  } = {}) {
    super();
    boneSize = boneSize || 1;
    axesSize = axesSize || 5;
    if (!rootBone.isBone) {
      throw new Error('SkeletonAxisHelper must receive an bone instance.');
    }
    this.rootBone = rootBone;
    this._meshes = new Map();
    this.rootBone.traverse(object3D => {
      if (/hand\w+/i.test(object3D.name)) {
        return;
      }
      let length = 0;
      const child1 = object3D.children[0];
      if (child1) {
        length = child1.position.length();
      }
      const mesh = new BoneHelper(length, boneSize, axesSize);
      mesh.matrixAutoUpdate = false;
      this._meshes.set(object3D, mesh);
      this.add(mesh);
    });
    this.showBones = showBones !== undefined ? showBones : true;
    this.showAxes = showAxes !== undefined ? showAxes : true;
    this.wireframe = wireframe !== undefined ? wireframe : true;
    this.color = color || new Color(0xff0077);
  }
  get showBones() {
    return this._showBones;
  }
  set showBones(showBones) {
    if (showBones === this._showBones) {
      return;
    }
    for (let [joint, mesh] of this._meshes) {
      if (showBones) {
        mesh.add(mesh.boneMesh);
      } else {
        mesh.remove(mesh.boneMesh);
      }
    }
    this._showBones = showBones;
  }
  get showAxes() {
    return this._showAxes;
  }
  set showAxes(showAxes) {
    if (showAxes === this._showAxes) {
      return;
    }
    for (let [joint, mesh] of this._meshes) {
      if (showAxes) {
        mesh.add(mesh.axesHelper);
      } else {
        mesh.remove(mesh.axesHelper);
      }
    }
    this._showAxes = showAxes;
  }
  get wireframe() {
    return this._wireframe;
  }
  set wireframe(wireframe) {
    if (wireframe === this._wireframe) {
      return;
    }
    for (let [joint, mesh] of this._meshes) {
      if (mesh.boneMesh.material) {
        mesh.boneMesh.material.wireframe = wireframe;
      }
    }
    this._wireframe = wireframe;
  }
  get color() {
    return this._color;
  }
  set color(color) {
    if (this._color && this._color.equals(color)) {
      return;
    }
    color = color && color.isColor ? color : new Color(color);
    for (let [joint, mesh] of this._meshes) {
      if (mesh.boneMesh.material) {
        mesh.boneMesh.material.color = color;
      }
    }
    this._color = color;
  }
  updateMatrixWorld(force) {
    for (let [bone, mesh] of this._meshes) {
      mesh.matrix.copy(bone.matrixWorld);
    }
    super.updateMatrixWorld(force);
  }
}

class ActorParser {
  constructor(opt) {
    this.fileName = opt.fileName;
    this.bonePrefix = opt.bonePrefix;
    this.root = null;
    this.rootBone = null;
  }
  setRoot(root) {
    this.root = root;
    this.hips = this.root.getObjectByName(this.bonePrefix + 'Hips');
    this.shoulderR = this.root.getObjectByName(this.bonePrefix + 'RightShoulder');
    this.shoulderL = this.root.getObjectByName(this.bonePrefix + 'LeftShoulder');
    this.upperArmR = this.root.getObjectByName(this.bonePrefix + 'RightArm');
    this.upperArmL = this.root.getObjectByName(this.bonePrefix + 'LeftArm');
    this.lowerArmR = this.root.getObjectByName(this.bonePrefix + 'RightForeArm');
    this.lowerArmL = this.root.getObjectByName(this.bonePrefix + 'LeftForeArm');
    this.handR = this.root.getObjectByName(this.bonePrefix + 'RightHand');
    this.handL = this.root.getObjectByName(this.bonePrefix + 'LeftHand');
    this.footR = this.root.getObjectByName(this.bonePrefix + 'RightFoot');
    this.footL = this.root.getObjectByName(this.bonePrefix + 'LeftFoot');
    this.root.updateWorldMatrix(true, true);
    setZForward(this);
    console.log(this.root);
    this.root.traverse(object3D => {
      if (object3D.isSkinnedMesh) {
        object3D.skeleton.calculateInverses();
      }
    });
    this.root.updateMatrixWorld(true);
  }
}

if (typeof window !== 'undefined' && typeof window.THREE === 'object') {
  window.THREE.Actor = {
    AvatarIK: AvatarIK,
    TrackedPerson: TrackedPerson,
    SkeletonAxisHelper: SkeletonAxisHelper
  };
}

export { ActorParser, AvatarIK, MirroredTrackedPerson, SkeletonAxisHelper, TrackedPerson };
