import { setZForward } from './AxisUtils';

export class ActorParser {
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
    this.handR = this.root.getObjectByName(this.bonePrefix +'RightHand');
    this.handL = this.root.getObjectByName(this.bonePrefix + 'LeftHand');
    this.footR = this.root.getObjectByName(this.bonePrefix + 'RightFoot');
    this.footL = this.root.getObjectByName(this.bonePrefix + 'LeftFoot');

    /**
    This model's bind matrices are -Z forward, while the IK system operates in +Z Forward -- assuming
    the parent's +Z forward faces the child. This utility helps us recalculate the models bone matrices
    to be consistent with the IK system.
    **/
    this.root.updateWorldMatrix(true, true);
    setZForward(this);

    //must rebind the skeleton to reset the bind matrix.
    console.log(this.root)
    this.root.traverse( (object3D) => {
      if(object3D.isSkinnedMesh) {
      object3D.skeleton.calculateInverses();
      // object3D.skeleton.update(); //called by renderer
      // object3D.bind(object3D.skeleton);
      }
    });

    this.root.updateMatrixWorld(true);

  }
}