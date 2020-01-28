import { Object3D } from 'three';
// import { Object3D, SphereGeometry, MeshLambertMaterial, Mesh} from 'three';
class TrackedPerson {
  
  constructor() {
    this.root = new Object3D();
    this.head = new Object3D();
    this.root.add(this.head);
    this.handR = new Object3D();
    this.root.add(this.handR);
    this.handL = new Object3D();
    this.root.add(this.handL);

    // var geometry = new SphereGeometry(.01, 10, 10, 0, Math.PI * 2, 0, Math.PI * 2);
    // var material = new MeshLambertMaterial();
    // var cube = new Mesh(geometry, material);
    // this.handR.add(cube);

    // var cube = new Mesh(geometry, material);
    // this.handL.add(cube);
  }

  tick() {
  }

}

class MirroredTrackedPerson extends TrackedPerson{
  
  constructor() {
    super();
  }

  tick() {
    //mirror along x axis
    this.handL.position.copy(this.handR.position);
    this.handL.position.x *= -1;
    this.handL.quaternion.copy(this.handR.quaternion); 
    this.handL.quaternion.y *= -1;
    this.handL.quaternion.z *= -1;
  }

}

export { TrackedPerson, MirroredTrackedPerson};
