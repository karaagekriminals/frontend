class Visualizer {
  constructor() {
    this.targetQuat = null;
    this.cubes = {};

    //

    let container = document.createElement("div");
    document.body.appendChild(container);

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 150;
    camera.position.z = 500;
    this.camera = camera;

    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    this.scene = scene;

    // Plane
    let plane = new THREE.PlaneBufferGeometry(200, 200);
    plane.rotateX(-Math.PI / 2);

    let plane_material = new THREE.MeshBasicMaterial({ color: 0xe0e0e0, overdraw: 0.5 });
    plane = new THREE.Mesh(plane, plane_material);
    scene.add(plane);

    this.renderer = new THREE.CanvasRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.onWindowResize, false);

    this.animate();
  }

  addCube(id) {
    // Cube
    let geometry = new THREE.BoxGeometry(200, 200, 200);
    for (let i = 0; i < geometry.faces.length; i += 2) {
      let hex = Math.random() * 0xffffff;
      geometry.faces[i].color.setHex(hex);
      geometry.faces[i + 1].color.setHex(hex);
    }

    let material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, overdraw: 0.5 });

    let cube = new THREE.Mesh(geometry, material);
    cube.position.y = 150;

    this.scene.add(cube);
    this.cubes[id] = { obj: cube, targetQuat: null };
  }

  onWindowResize() {
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setTargetQuat(cubeId, targetQuat) {
    this.cubes[cubeId].targetQuat = targetQuat;
  }

  animate() {
    requestAnimationFrame(() => {
      this.animate();
    });
    this.render();
  }

  render() {
    let currentIndex = 0;
    let totalCubes = Object.keys(this.cubes).length;

    for (let cubeId in this.cubes) {
      let cubeObj = this.cubes[cubeId].obj;
      let targetQuat = this.cubes[cubeId].targetQuat;

      if (currentIndex < Math.floor(totalCubes / 2)) {
        cubeObj.position.x = -200;
      } else {
        cubeObj.position.x = 200;
      }

      if (targetQuat != null) {
        let currentQuat = new THREE.Quaternion();
        currentQuat.setFromEuler(cubeObj.rotation);

        let lerped = currentQuat.slerp(targetQuat, 0.1);

        cubeObj.setRotationFromQuaternion(lerped);
      }

      currentIndex += 1;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
