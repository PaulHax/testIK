
// import * as THREE from './node_modules/three/build/three.module.js';
import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from '../node_modules/three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from '../node_modules/three/examples/jsm/utils/RoughnessMipmapper.js';
// import { ActorParser, AvatarIK, MirroredTrackedPerson, SkeletonAxisHelper } from '../build/actor.module.js';
import { ActorParser } from '../src/avatarik/ActorParser.js';
import { AvatarIK } from '../src/avatarik/AvatarIK.js';
import { MirroredTrackedPerson } from '../src/avatarik/TrackedPerson.js';
import { SkeletonAxisHelper } from '../src/avatarik/SkeletonAxisHelper.js';
var renderer, camera, scene, controls, trackedPerson, avatarIK;

// var avatarConfig = {fileName: 'bot.glb', bonePrefix: 'mixamorig'}

// var actorParser = new ActorParser({fileName: 'bot.glb', bonePrefix: 'mixamorig'})
var actorParser = new ActorParser({fileName: 'sporty_lady.glb', bonePrefix: 'mixamorig6'});
let avatarCarpet = new THREE.Object3D();

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  scene.add(avatarCarpet);

  new RGBELoader()
    .setDataType( THREE.UnsignedByteType )
    .setPath( 'assets/textures/' )
    .load( 'venice_sunset_2k.hdr', function ( texture ) {
      var envMap = pmremGenerator.fromEquirectangular( texture ).texture;
      pmremGenerator.dispose();
      //scene.background = envMap;
      scene.environment = envMap;
      var roughnessMipmapper = new RoughnessMipmapper( renderer );

      var loader = new GLTFLoader().setPath( './assets/' );
      loader.load( actorParser.fileName, function ( gltf ) {
        gltf.scene.traverse( function ( child ) {
          if ( child.isMesh ) {
            roughnessMipmapper.generateMipmaps( child.material );
            child.material.envMapIntensity = .2;
            child.material.roughness = 1.7;
            child.material.needsUpdate = true;
            child.frustumCulled = false;
          }
        });
        avatarCarpet.add( gltf.scene );
        roughnessMipmapper.dispose();

        actorParser.setRoot(gltf.scene.getObjectByName("Armature"))

        initAvatar(actorParser);

        // scene.add(new SkeletonAxisHelper(actorParser.hips));
      });
  });

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.8, 2);
  camera.lookAt(0, 2, 0);
  scene.add(camera)

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.toneMapping = THREE.LinearToneMapping;
  // renderer.toneMappingExposure = 0.8;
  
  document.body.appendChild(renderer.domElement);

  var pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  scene.add(new THREE.GridHelper(10, 10));

  const light1  = new THREE.AmbientLight(0xffffff, .3); //.2
  light1.name = 'ambient_light';
  scene.add( light1 );

  const light2  = new THREE.DirectionalLight(0xffffff, 2.5); //2.5
  light2.name = 'main_light';
  light2.position.set(0, 1, 0);
  scene.add( light2 );

  // light2.position.set(0.5, 0, 0.866); // ~60º
  // camera.add(light2)

  // var geometry = new THREE.SphereGeometry(.2, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
  // var material = new THREE.MeshLambertMaterial();
  // var cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target0.set(0, 1, 0);
  controls.target.set(0, 1, 0);
  controls.update();
  controls.screenSpacePanning = true;

  // const axesHelper = new THREE.AxesHelper(1);
  // scene.add(axesHelper);

  requestAnimationFrame(animate);
}

function animate() {
  requestAnimationFrame(animate);
  if(avatarIK) {
    trackedPerson.tick();
    avatarIK.tick();
  }
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);


let gizmoArray = [];
function makeGizmo(target) {
  const gizmo = new TransformControls(camera, renderer.domElement);
  scene.add(gizmo);
  // gizmo.setSize(0.5); 
  gizmo.attach(target);
  gizmo.target = target;


  gizmo.addEventListener('mouseDown', () => controls.enabled = false);
  gizmo.addEventListener('mouseUp', () => controls.enabled = true);

  gizmoArray.push(gizmo);

  return gizmo;
}


function initAvatar(parsedAvatar) {

  trackedPerson = new MirroredTrackedPerson();
  avatarCarpet.add(trackedPerson.root);
  // scene.add(trackedPerson.root);
  // parsedAvatar.root.updateWorldMatrix(true, true);

  trackedPerson.handR.position.set(-.1, 1.3, .3);
  trackedPerson.handR.quaternion.multiply(
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/2))
  trackedPerson.handR.quaternion.multiply(
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI/4))
  trackedPerson.handR.updateWorldMatrix(true, true);

  makeGizmo(trackedPerson.handR);
  // makeGizmo(trackedPerson.handL);

  document.addEventListener('keydown', (keyE) => {
    if(keyE.key == ' ' && gizmoArray.length) {
      const newMode = gizmoArray[0].getMode() == 'translate' ? 'rotate' : 'translate';
      gizmoArray.forEach(element => {
        element.setMode(newMode);
      });
    }
  });

  // trackedPerson.handL.position.set(.2, 1, .3);
  // trackedPerson.handL.quaternion.multiply(
  //   new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2))
  // trackedPerson.handL.quaternion.multiply(
  //   new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI/4))
  
  avatarIK = new AvatarIK(parsedAvatar, trackedPerson);

  // parsedAvatar.root.position.set(1, 0, -1);
  // avatarCarpet.position.set(.5, 0, -1);
  // avatarCarpet.rotation.y = 1;
  
}

init();