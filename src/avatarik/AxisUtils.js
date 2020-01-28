import { Vector3, Quaternion } from 'three';

/**
 * @author snayss -- https://codercat.tk
 *
 * Helper utility to iterate through a THREE.Bone heirarchy from a model
 * created in an external software and set each bone +Z Forward vector to
 * face the child bone.
 *
 **/

const t = new Vector3();
const q = new Quaternion();
const FORWARD = new Vector3(0,0,1);
var RESETQUAT = new Quaternion();
var ROT = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI/2);
var ROTI = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI/2);

export function setZForward(parsedActor) {
  var worldPos = {};
  getOriginalWorldPositions(parsedActor.hips, worldPos);
  
  //bot setup
  // rootBone.quaternion.multiply(ROTI);
  // rootBone.updateMatrixWorld();
  // shoulderR.quaternion.multiply(ROTI);
  // shoulderR.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI));
  // shoulderL.quaternion.multiply(ROTI);

  //sporty mixamorig6 setup
  parsedActor.hips.quaternion.multiply(ROTI);
  parsedActor.hips.updateMatrixWorld();

  // parsedActor.shoulderR.quaternion.multiply(ROTI);
  // parsedActor.upperArmR.quaternion
  //   .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI/2));
  // parsedActor.shoulderL.quaternion.multiply(ROTI);
  // parsedActor.upperArmL.quaternion
  //   .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI/2));

  parsedActor.shoulderR.quaternion.multiply(ROTI);
  parsedActor.shoulderR.quaternion
    .premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI/2));
  parsedActor.shoulderL.quaternion.multiply(ROTI);
  parsedActor.shoulderL.quaternion
    .premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI/2));

  updatePos(parsedActor.hips, worldPos);


  //original method
  // updateTransformationsToChildrenCenter(rootBone, worldPos);
  // updatePos(rootBone, worldPos);
}


function rotateTransformations(parentBone, worldPos) {
  parentBone.quaternion.multiply(ROT);
  
  parentBone.updateWorldMatrix(false, false);

  //parentBone.updateMatrixWorld();
  
  updatePos(parentBone, worldPos);

  // let child = parentBone.children[0];  
  //child.quaternion.multiply(ROT);
  // var childBonePosWorld = worldPos[child.id].clone();
  //   parentBone.worldToLocal(childBonePosWorld);
  //   childBone.position.copy(childBonePosWorld);
  //set child bone position relative to the new parent matrix.
  // parentBone.children.forEach((childBone) => {
  //   var childBonePosWorld = worldPos[childBone.id].clone();
  //   parentBone.worldToLocal(childBonePosWorld);
  //   childBone.position.copy(childBonePosWorld);
  // });

  
  // parentBone.children.forEach((childBone) => {
  //   childBone.quaternion.multiply(ROT);
  //   childBone.updateWorldMatrix(false, false);
  //   //updatePos(childBone, worldPos);
  // })


}
function updatePos(parentBone, worldPos) {
  //set child bone position relative to the new parent matrix.
  parentBone.updateMatrixWorld();
  //parentBone.updateWorldMatrix(false, false);
  parentBone.children.forEach((childBone) => {
    var childBonePosWorld = worldPos[childBone.id].clone();
    parentBone.worldToLocal(childBonePosWorld);
    childBone.position.copy(childBonePosWorld);
  });
  parentBone.children.forEach((childBone) => {
    updatePos(childBone, worldPos);
  })
}

function updateTransformationsToChildrenCenter(parentBone, worldPos) {

    var averagedDir = new Vector3();
    parentBone.children.forEach((childBone) => {
      //average the child bone world pos
      var childBonePosWorld = worldPos[childBone.id];
      averagedDir.add(childBonePosWorld);
    });

    averagedDir.multiplyScalar(1/(parentBone.children.length));

    //set quaternion
    parentBone.quaternion.copy(RESETQUAT);
    parentBone.updateMatrixWorld();
    //get the child bone position in local coordinates
    var childBoneDir = parentBone.worldToLocal(averagedDir).normalize();
    //set the direction to child bone to the forward direction
    var quat = getAlignmentQuaternion(FORWARD, childBoneDir);

    if (quat) {
      //rotate parent bone towards child bone
      parentBone.quaternion.premultiply(quat);
      parentBone.updateMatrixWorld();
      //set child bone position relative to the new parent matrix.
      parentBone.children.forEach((childBone) => {
        var childBonePosWorld = worldPos[childBone.id].clone();
        parentBone.worldToLocal(childBonePosWorld);
        childBone.position.copy(childBonePosWorld);
      });
    }

    parentBone.children.forEach((childBone) => {
      updateTransformationsToChildrenCenter(childBone, worldPos);
    })
}

function getAlignmentQuaternion(fromDir, toDir) {
  const adjustAxis = t.crossVectors(fromDir, toDir).normalize();
  const adjustAngle = fromDir.angleTo(toDir);
  if (adjustAngle) {
    const adjustQuat = q.setFromAxisAngle(adjustAxis, adjustAngle);
    return adjustQuat;
  }
  return null;
}

function getOriginalWorldPositions(rootBone, worldPos) {
  rootBone.children.forEach((child) => {
    var childWorldPos = child.getWorldPosition(new Vector3());
    worldPos[child.id] = childWorldPos;
    getOriginalWorldPositions(child, worldPos);
  })
}

