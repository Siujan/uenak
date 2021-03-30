import { OrbitControls } from '../three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, skyboxGeo, skybox;

function main() {
  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({canvas});

  const fov = 20;
  const aspect = window.innerWidth / window.innerHeight;  // the canvas default
  const near = 0.01;
  const far = 10000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.y = 500;
	
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(500, 0, 0);
  controls.update();

  scene = new THREE.Scene();

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  // {
    // const loader = new THREE.CubeTextureLoader();
    // const texture = loader.load([
      // 'http://localhost/foody/images/skybox/right.png',
      // 'http://localhost/foody/images/skybox/left.png',
      // 'http://localhost/foody/images/skybox/top.png',
      // 'http://localhost/foody/images/skybox/top.png',
      // 'http://localhost/foody/images/skybox/front.png',
      // 'http://localhost/foody/images/skybox/back.png',
    // ]);
    // scene.background = texture;
  // }

	
	{
		function createPathStrings() {
		  const basePath = "http://localhost/foody/images/skybox/";
		  const fileType = ".png";
		  const sides = ["front", "back", "top", "top", "right", "left"];
		  const pathStings = sides.map(side => {
			return basePath + side + fileType;
		  });
		  return pathStings;
		}
			
		function createMaterialArray() {
		  const skyboxImagepaths = createPathStrings();
		  const materialArray = skyboxImagepaths.map(image => {
			let texture = new THREE.TextureLoader().load(image);
			
			return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
		  });
		  return materialArray;
		}		
		
		const materialArray = createMaterialArray();
		const boxSize = [500,500,500];
		skyboxGeo = new THREE.BoxGeometry(boxSize[0],boxSize[1],boxSize[2]);
		skybox = new THREE.Mesh(skyboxGeo, materialArray);
		skybox.position.y = 250;
		scene.add(skybox);		
	}


	{
		const gltfLoader = new THREE.GLTFLoader();
		gltfLoader.load( '3dObject/ground.glb', function ( gltf ) {
			var mesh = gltf.scene;
			mesh.scale.set(50,50,50);
			mesh.position.set(0,-20,0);
			scene.add( mesh );		

		}, undefined, function ( error ) {

			console.error( error );

		} );		
	}


  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
  
}



main();