import { Object3D, Color, Matrix4, AxesHelper, Mesh, ConeBufferGeometry, MeshBasicMaterial, Vector3 } from 'three';

/**
 * Mesh for representing an IKJoint.
 * @private
 * @extends {THREE.Object3d}
 */
class BoneHelper extends Object3D {
  /**
   * @param {number} height
   * @param {number?} boneSize
   * @param {number?} axesSize
   */
  constructor(height, boneSize, axesSize) {
    super();

    // If our bone has 0 height (like an end effector),
    // use a dummy Object3D instead, otherwise the ConeBufferGeometry
    // will fall back to its default and not use 0 height.
    if (height !== 0) {
      const geo = new ConeBufferGeometry(boneSize, height, 4);
      geo.applyMatrix(new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), Math.PI/2));
      //geo.applyMatrix(new Matrix4().makeTranslation(0, 0, -height / 2));
      this.boneMesh = new Mesh(geo, new MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        depthTest: false,
        depthWrite: false,
      }));
    } else {
      this.boneMesh = new Object3D();
    }

    // Offset the bone so that its rotation point is at the base of the bone
    this.boneMesh.position.z = height / 2;
    this.add(this.boneMesh);

    this.axesHelper = new AxesHelper(axesSize);
    this.axesHelper.material.depthTest = false;
    this.axesHelper.material.depthWrite = false;
    this.axesHelper.material.transparent = true; //makes axis show through mesh, draw order problem on lines?
    this.add(this.axesHelper);
  }
}

/**
 * Class for visualizing a Skeleton.  From THREE.IK
 * @extends {THREE.Object3d}
 */
class SkeletonAxisHelper extends Object3D {

  /**
   * Creates a visualization for an IK.
   *
   * @param {THREE.Bone} rootBone
   * @param {Object} config
   * @param {THREE.Color} [config.color]
   * @param {boolean} [config.showBones]
   * @param {boolean} [config.showAxes]
   * @param {boolean} [config.wireframe]
   * @param {number} [config.axesSize]
   * @param {number} [config.boneSize]
   */
  constructor(rootBone, { color, showBones, boneSize, showAxes, axesSize, wireframe } = {}) {
    super();

    boneSize = boneSize || 1; //.1
    axesSize = axesSize || 5; //0.2

    if (!rootBone.isBone) {
      throw new Error('SkeletonAxisHelper must receive an bone instance.');
    }

    this.rootBone = rootBone;

    this._meshes = new Map();
    this.rootBone.traverse( (object3D) => {
      if(/hand\w+/i.test(object3D.name)) {
        return;
      }
      //const length = object3D.position.length();
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


    /**
     * Whether this IKHelper's bones are visible or not.
     *
     * @name IKHelper#showBones
     * @type boolean
     * @default true
     */
    this.showBones = showBones !== undefined ? showBones : true;

    /**
     * Whether this IKHelper's axes are visible or not.
     *
     * @name IKHelper#showAxes
     * @type boolean
     * @default true
     */
    this.showAxes = showAxes !== undefined ? showAxes : true;

    /**
     * Whether this IKHelper should be rendered as wireframes or not.
     *
     * @name IKHelper#wireframe
     * @type boolean
     * @default true
     */
    this.wireframe = wireframe !== undefined ? wireframe : true;

    /**
     * The color of this IKHelper's bones.
     *
     * @name IKHelper#color
     * @type THREE.Color
     * @default new THREE.Color(0xff0077)
     */
    this.color = color || new Color(0xff0077);
  }

  get showBones() { return this._showBones; }
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

  get showAxes() { return this._showAxes; }
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

  get wireframe() { return this._wireframe; }
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

  get color() { return this._color; }
  set color(color) {
    if (this._color && this._color.equals(color)) {
      return;
    }
    color = (color && color.isColor) ? color : new Color(color);
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

export default SkeletonAxisHelper;
