import { Quaternion, Vector3, Euler, Matrix4, AxesHelper } from 'three';
import { setZForward } from './AxisUtils';
import { getWorldQuaternion } from './Utils';

const BANK_RIGHT = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI/2);
const BANK_LEFT = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI/2);

const FORWARD = new Vector3(0, 0, 1);
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
    this.axesHelper1.material.transparent = true; //makes axis show through mesh, draw order problem on lines?
    // this.root.parent.add(this.axesHelper1);
    this.axesHelper2 = new AxesHelper(5);
    this.axesHelper2.material.depthTest = false;
    this.axesHelper2.material.depthWrite = false;
    this.axesHelper2.material.transparent = true; //makes axis show through mesh, draw order problem on lines?
    // this.root.parent.add(this.axesHelper2);
  }

  setup() {
    this.upperArmLength = v1.setFromMatrixPosition(this.upperArmR.matrixWorld)
                            .distanceTo(v2.setFromMatrixPosition(this.lowerArmR.matrixWorld));
    this.lowerArmLength = v1.setFromMatrixPosition(this.lowerArmR.matrixWorld)
                            .distanceTo(v2.setFromMatrixPosition(this.handR.matrixWorld));
    this.armLength = this.upperArmLength + this.lowerArmLength;
  }

  tick() {
    this.root.updateWorldMatrix(true, true);
    if(this.targetHandR) {
      this.poseArm(this.targetHandR, this.shoulderR, this.upperArmR, this.lowerArmR, this.handR, false, this.axesHelper1);
    }
    if(this.targetHandL) {
      this.poseArm(this.targetHandL, this.shoulderL, this.upperArmL, this.lowerArmL, this.handL, true, this.axesHelper2);
    }
  }

  
  poseArm(target, shoulder, upper, lower, hand, isLeft, axisHelper) {

    const upperArmPosition = v1.setFromMatrixPosition(upper.matrixWorld)

    const targetRotation = q2;
    const targetPos = v2;
    target.matrixWorld.decompose(targetPos, targetRotation, v3);

    const shoulderQuat = q1;
    const shoulderQuatInv = q3;
    shoulder.matrixWorld.decompose(v3, shoulderQuat, v3);
    shoulderQuatInv.copy(shoulderQuat).inverse();

    // const directDistance = upperArmPosition.distanceTo(targetPos) / 2;
    const directDistance = upperArmPosition.distanceTo(targetPos) - this.lowerArmLength;
    const hypotenuseDistance = this.upperArmLength; //armLength upperArmLength
    const offsetDistance = hypotenuseDistance > directDistance ? 
      Math.sqrt(hypotenuseDistance*hypotenuseDistance - directDistance*directDistance) : 0;

    //shoulder space depenant
    const axis = isLeft ? v3.set(1, -1, -1) : v3.set(1, 1, 1)
    const offsetDirection = v7.copy(targetPos).sub(upperArmPosition)
                              .normalize()
                              // .cross(v3.set(1, 0, 0).applyQuaternion(shoulderQuat)); //mixamorig6 ok
                              .cross(axis.normalize().applyQuaternion(shoulderQuat)); 
                              //.cross(v3.set(0, 1, 0).applyQuaternion(shoulderQuat)); //bot
    // if(isLeft) offsetDirection.applyQuaternion(Z_180);

    // Tweek elbow direction based on hand rotation in sholder space
    // const targetEuler = e1.setFromQuaternion(
    //   q4.multiplyQuaternions(targetRotation, shoulderQuatInv)
    //   .premultiply(Y_180)
    //   ,'XYZ'
    // );

    // const yFactor = Math.min(Math.max((-targetEuler.y-Math.PI*.1)/(Math.PI/2), 0), 1);
    // targetEuler.z = Math.min(Math.max(targetEuler.z, 0), Math.PI/2);
    // targetEuler.z = (targetEuler.z * (1 - yFactor)) + (Math.PI/2 * yFactor);

    // offsetDirection
    //   .applyQuaternion(shoulderQuatInv)
    //   .applyAxisAngle(FORWARD, -targetEuler.z)
    //   .applyQuaternion(shoulderQuat);

    const elbowPosition = v4.copy(upperArmPosition).add(targetPos).divideScalar(2)
      .add(v5.copy(offsetDirection).multiplyScalar(offsetDistance));

    axisHelper.position.copy(elbowPosition);//debug

    isLeft ? v6.set(-1, 0, 0) : v6.set(1, 0, 0) ;
    v6.applyQuaternion(shoulderQuat);
    // upper.up.copy(v6);
    upper.lookAt(elbowPosition);
    upper.updateMatrixWorld();

    upper.matrixWorld.decompose(v3, shoulderQuat, v3);
    // isLeft ? v6.set(1, 0, 0) : v6.set(-1, 0, 0) ;
    // v6.applyQuaternion(shoulderQuat);
    // lower.up.copy(v6);
    lower.lookAt(targetPos);
    lower.updateWorldMatrix(true);

    // hand.quaternion.copy(targetRotation)
    //     .multiply(isLeft ? BANK_LEFT : BANK_RIGHT)
    //     .premultiply(getWorldQuaternion(lower, q4).inverse());
  }
}

export { ActorIK };
