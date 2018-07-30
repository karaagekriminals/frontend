class Visualizer {
  constructor() {
    this.targetQuat = null;
    this.cubes = {};

    this.SEPARATION = 100;
    this.AMOUNTX = 50;
    this.AMOUNTY = 50;
    this.count = 0;

    this.targetHighness = 0;
    this.highness = 0;

    //

    let container = document.createElement("div");
    document.body.appendChild(container);

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 150;
    camera.position.z = 750;
    this.camera = camera;

    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    this.scene = scene;

    this.particles = new Array();
    var PI2 = Math.PI * 2;
    var material = new THREE.SpriteCanvasMaterial({
      color: "black",
      program: function(context) {
        context.beginPath();
        context.arc(0, 0, 0.5, 0, PI2, true);
        context.fill();
      }
    });
    var i = 0;
    for (var ix = 0; ix < this.AMOUNTX; ix++) {
      for (var iy = 0; iy < this.AMOUNTY; iy++) {
        let particle = (this.particles[i++] = new THREE.Sprite(material));
        particle.position.x = ix * this.SEPARATION - (this.AMOUNTX * this.SEPARATION) / 2;
        particle.position.z = iy * this.SEPARATION - (this.AMOUNTY * this.SEPARATION) / 2;
        this.scene.add(particle);
      }
    }

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

  setTargetColour(hex) {
    this.targetColour = new THREE.Color(hex);
  }

  generateRipple(xacc, yacc, zacc, colour = "gray") {
    let particles = [];

    var PI2 = Math.PI * 2;
    var material = new THREE.SpriteCanvasMaterial({
      color: colour,
      program: function(context) {
        context.beginPath();
        context.arc(0, 0, 0.5, 0, PI2, true);
        context.fill();
      }
    });

    let seedx = Math.random() - 0.5;
    let seedy = Math.random() - 0.5;

    for (let i = 0; i < 5; i++) {
      let particle = new THREE.Sprite(material);
      particles.push(particle);

      particle.position.set(
        seedx * 0.5 * window.innerWidth + 15 * -xacc * (5 - i),
        seedy * 0.5 * window.innerHeight + 15 * -yacc * (5 - i),
        0.01
      );
      particle.scale.x = particle.scale.y = 0.001;

      // console.log(seedy * 0.5 * window.innerHeight + 25 * -yacc * (10 - i));
      let scale = Math.random() * 15 + 40;

      new TWEEN.Tween(particle.scale)
        .delay(200 * i)
        .to({ x: scale, y: scale }, 500)
        .onComplete(() => {
          new TWEEN.Tween(particle.scale)
            .to({ x: 0.001, y: 0.001 }, 400)
            .onComplete(() => {
              this.scene.remove(particle);
            })
            .start();
        })
        .start();

      this.scene.add(particle);
    }
  }

  setHighness(val) {
    this.targetHighness = val;
  }

  animate() {
    requestAnimationFrame(() => {
      this.animate();
    });
    this.render();
    TWEEN.update();
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

    // COLOURS
    if (this.targetColour != null) {
      let origColour = this.scene.background;
      this.scene.background = origColour.lerp(this.targetColour, 0.03);
    }
    //

    var i = 0;
    for (var ix = 0; ix < this.AMOUNTX; ix++) {
      for (var iy = 0; iy < this.AMOUNTY; iy++) {
        let particle = this.particles[i++];
        particle.position.y =
          Math.sin((ix + this.count) * 0.3) * this.highness + Math.sin((iy + this.count) * 0.5) * this.highness;
        particle.scale.x = particle.scale.y =
          (Math.sin((ix + this.count) * 0.3) + 1) * 4 + (Math.sin((iy + this.count) * 0.5) + 1) * 4;
      }
    }

    this.count += 0.1;

    this.highness += (this.targetHighness - this.highness) * 0.02;

    this.renderer.render(this.scene, this.camera);
  }
}
