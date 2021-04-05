import { Euler } from '../three/build/three.module.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../three/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from '../three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../three/examples/jsm/postprocessing/ShaderPass.js';
import { GradientMapShader } from '../three/examples/jsm/shaders/GradientMapShader.js';
import { BrightnessContrastShader } from '../three/examples/jsm/shaders/BrightnessContrastShader.js';
import { GammaCorrectionShader } from '../three/examples/jsm/shaders/GammaCorrectionShader.js';
import { Character } from './character.js';
import { setupRenderer, setupCamera } from './essential.js';

let scene,camera,renderer,canvas,composer;
let cameraFrustum = new THREE.Frustum();
const mouse = new THREE.Vector2();
let isPlay = true;

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( './three/examples/js/libs/draco/' );
gltfLoader.setDRACOLoader(dracoLoader);
let mixers = [];
let models = [];

let glbLists = ['./3dObject/Cincau.glb','./3dObject/Es Campur.glb',
				'./3dObject/Kelapa.glb','./3dObject/Kue Ape 1.glb',
				'./3dObject/Kue Ape 2.glb','./3dObject/Kue Ape 3.glb',
				'./3dObject/Kue Mangkok Hijau.glb','./3dObject/Kue Mangkok Kuning.glb',
				'./3dObject/Kue Mangkok Pink.glb','./3dObject/Martabak Coaster.glb',
				'./3dObject/Mutiara.glb','./3dObject/Statue of Martabak.glb','./3dObject/Tape.glb'];
	
// let glbLists = ['./3dObject/Cincau.glb','./3dObject/Es Campur.glb',
				// './3dObject/Kelapa.glb','./3dObject/Kue Ape 1.glb',
				// './3dObject/Kue Ape 2.glb','./3dObject/Kue Ape 3.glb',
				// './3dObject/Martabak Coaster.glb',
				// './3dObject/Mutiara.glb','./3dObject/Statue of Martabak.glb','./3dObject/Tape.glb'];
	
const clock = new THREE.Clock();
let backgroundNameStr = "background_name";
let overlayPanel = document.getElementById("overlay");
let descriptionPanel = document.getElementById("descriptionPanel");
let loadingScreen = document.getElementById("loading-screen");
// let backgroundText = document.getElementById("background-text");

let objectDescriptionEN = ["Martabak Manis is the king of indonesia dessert, it is sinfully good",
"Spongy chewy golden cake.","String hopper dish made of rice flour","Grandma hair but made of sugar",
"Javanese sncek made of Cassava","Amazing cold dessert in indonesia since its hot here almost all year.",
"Kue Mangkok Uhuy"]

let objectDescriptionID = ["Martabak Manis adalah raja street food indonesia, dosa yang sangat nikmat",
"Bika Ambon tapi bukan dari ambon","Piring hopper terbuat dari tepung beras", "Rambut nenek tapi terbuat dari gula",
"Sncek Jawa terbuat dari Singkong", "Makanan penutup dingin yang luar biasa di Indonesia karena di sini panas hampir sepanjang tahun.",
"Kue Mangkok Uhuy"]

function objectPosition(pos,description,title,img) {
	this.position = pos;
	this.hasSeen = false;
	this.objectButton = "";
	this.description = description;
	this.title = title;
	this.img = img
}

let objects = [
	new objectPosition(new THREE.Vector3(0,15,-50),0,"Martabak Manis","images/icons/martabak.png"), // martabak
	new objectPosition(new THREE.Vector3(30,8,-50),1,"Bika Ambon","images/icons/Bika ambon icon.png"), // bika ambon
	new objectPosition(new THREE.Vector3(10,2,-2),2,"Putu Mayang","images/icons/putu mayang.png"), // putu mayang
	new objectPosition(new THREE.Vector3(10,3,10),3,"Rambut Nenek","images/icons/rambut nenek.png"), // Rambut Nenek
	new objectPosition(new THREE.Vector3(5,2,8),4,"Kue Gethuk","images/icons/kue gethuk.png"), // Kue Getuk
	new objectPosition(new THREE.Vector3(-10,7,10),5,"Es Campur","images/icons/es campur.png"), // Es Campur
	new objectPosition(new THREE.Vector3(-10,3,-8),6,"Kue Mangkok","images/icons/kue mangkok.png") // Kue Mangkok
];

let object = new objectPosition(new THREE.Vector3(50,5,0));

const paramsTone = {
	exposure: 1,
	toneMapping: 'ACESFilmic'
};
const descriptionToneExposure = 0.1;

//camera parameters
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.01;
const far = 200;
const camPost = new THREE.Vector3( 0,2,0 );

//camera rotation events parameters
let CharRotate = Character(0.002);
let isClicking = false;
	
	
function loadModel(url) {
  return new Promise(resolve => {
    gltfLoader.load(url, resolve);
  });
}

function loadModelsArray(){
	let modelsPromise = [];
	for(let i = 0;i<glbLists.length;i++){
		modelsPromise.push(loadModel(glbLists[i]).then(result => {  models.push(result);updateLoadingBar(); }));
	}
	return modelsPromise;
}	


let loadingNow = 0;
let loadingBar = document.getElementById('loading');
function updateLoadingBar(){
	loadingNow += 1;
	var percent = parseInt((loadingNow/glbLists.length) * 100);
	loadingBar.style.width = percent + "%";
}	
	
	
let prevTouch = new THREE.Vector2();
function setupCanvas(){
	canvas = document.getElementById('c');
	// Add the event listeners for mousedown, mousemove, and mouseup
	canvas.addEventListener('mousedown', e => {
		isClicking = true;
	});

	canvas.addEventListener('touchstart', e => {
		isClicking = true;
		prevTouch.x = - e.touches[0].screenX;
		prevTouch.y = - e.touches[0].screenY;
	});

	canvas.addEventListener('mousemove', e => {
		mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;		
		if (isClicking === true) {
			var x = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
			var y = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
			CharRotate(x,y,camera);
		}
		
	});

	canvas.addEventListener('touchmove', e => {
		mouse.x = - e.touches[0].screenX;
		mouse.y = - e.touches[0].screenY;	
		if (isClicking === true) {
			var x = prevTouch.x - mouse.x;
			var y = prevTouch.y - mouse.y;
			CharRotate(x,y,camera);
			prevTouch.x = mouse.x;
			prevTouch.y = mouse.y;
		}	
	});

	window.addEventListener('mouseup', e => {
	  if (isClicking) {
		isClicking = false;
	  }
	});
	
	window.addEventListener('touchend', e => {
	  if (isClicking) {
		isClicking = false;
		prevTouch.set(0,0);
	  }
	});	
}

function setupSkyBox(){
	const skyboxLoader = new THREE.CubeTextureLoader();
	const skyboxTexture = skyboxLoader.load([
	'images/skybox_1024/px.png',
	'images/skybox_1024/nx.png',
	'images/skybox_1024/py.png',
	'images/skybox_1024/ny.png',
	'images/skybox_1024/pz.png',
	'images/skybox_1024/nz.png',
	]);
	skyboxTexture.format = THREE.RGBFormat;
	skyboxTexture.encoding = THREE.sRGBEncoding;	
	scene.background = skyboxTexture;	
	// scene.environment = skyboxTexture;	
}

function setupLight(){
	// ff849c pink
	// ffce9f cream
	const skyColor = 0xffce9f; 
	const groundColor = 0xffce9f;
	const intensity = 1;
	const hemiLight = new THREE.HemisphereLight( skyColor, groundColor, 0.6 );
	hemiLight.color.setHSL( 0.08, 1, 0.81 );
	hemiLight.groundColor.setHSL( 0.08, 1, 0.81 );
	hemiLight.position.set( 0, 50, 0 );
	scene.add( hemiLight );

	const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
	scene.add( hemiLightHelper );
	const dirLight = new THREE.DirectionalLight( skyColor, 1 );
	dirLight.color.setHSL( 0.08, 1, 0.81 );
	dirLight.position.set( - 1, 1.75, 1 );
	dirLight.position.multiplyScalar( 30 );
	scene.add( dirLight );

	dirLight.castShadow = true;	
	
	const dirLight2 = new THREE.DirectionalLight( skyColor, 1 );
	dirLight2.color.setHSL( 0.08, 1, 0.81 );
	dirLight2.position.set( 1, 1.75, -1 );
	dirLight2.position.multiplyScalar( 30 );
	scene.add( dirLight2 );

	dirLight2.castShadow = true;		
	// const ambLight = new THREE.AmbientLight( skyColor , 1); // soft white light
	// scene.add( ambLight );
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

function generateSearchIconImage(){
	let img = document.createElement("IMG");
	img.setAttribute("src","svg/search-black.svg");
	img.setAttribute("alt", "The search icon");
	return img;
}

let learnMoreButton = document.getElementById("learnMoreButton");
let cutleryButton = document.getElementById("cutleryButton");
let descPanTitle = document.getElementById("descTitle");
let descPanDesc = document.getElementById("descDesc");
let imgPanel = document.getElementById("iconFood");
function objectOnClick(object){
	// gradientMap();
	imgPanel.src = object.img;
	descPanTitle.innerHTML = object.title;
	descPanDesc.innerHTML = (activeLanguage == englishNote) ? objectDescriptionEN[object.description] : objectDescriptionID[object.description]; 
	learnMoreButton.onclick = () => {
		window.open('http://google.com/search?q=what is '+object.title);
	};
	cutleryButton.onclick = () => {
		window.open('http://google.com/search?q='+object.title+' near me');
	};	
	panelShowAnimation()
	let elem = document.getElementsByClassName('searchButton');
	while(elem[0]){
		elem[0].classList.add('searchButtonnoHover');
		elem[0].disabled = true;
		elem[0].classList.remove('searchButton');
	}
	isPlay = false;
	clock.running = false;
}

function objectsCameraVision(){
	cameraFrustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
	for(let i = 0;i<objects.length;i++){
		if(cameraFrustum.containsPoint(objects[i].position)){
			let pos = new THREE.Vector3(0,0,0);
			pos.copy(objects[i].position);
			let projectPos = pos.project( camera );	
			let screenWidth = canvas.clientWidth;
			let screenHeight = canvas.clientHeight;
			let lf = ((projectPos.x + 1)/2) * screenWidth
			let bt = ((projectPos.y + 1)/2) * screenHeight	
			if(!objects[i].hasSeen){
				let x = document.createElement("BUTTON");
				x.classList.add("searchButton");
				x.style.left = lf + "px";
				x.style.bottom = bt + "px";
				objects[i].hasSeen = true;
				objects[i].objectButton = x;
				x.appendChild(generateSearchIconImage());
				x.onclick = function(event){
					objectOnClick(objects[i]);
				}
				document.body.appendChild(x);				
			}else{
				objects[i].objectButton.style.left = lf + "px";
				objects[i].objectButton.style.bottom = bt + "px";
			}			
		}else{
			if(objects[i].hasSeen){
				document.body.removeChild(objects[i].objectButton);
				objects[i].hasSeen = false;
			}
		}	
	}
}

function render(){
    if (resizeRendererToDisplaySize(renderer)) {
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		composer.setSize(canvas.clientWidth,canvas.clientHeight);
		camera.updateProjectionMatrix();
    }	
	
	objectsCameraVision();
	// renderer.render(scene,camera);
	composer.render();
}

function animate(){
	if (!isPlay) return;
	
	const delta = clock.getDelta();
	for(let i = 0;i<mixers.length;i++){
		mixers[i].update(delta)
	}
	requestAnimationFrame(animate);	
	render();	
}

let logoList = ['logo-u','logo-e','logo-n','logo-a','logo-k'];

function panelShowAnimation(){
	descriptionPanel.style.display = "flex";
	descriptionPanel.classList.remove("descPanScaleDown");
	overlayPanel.classList.add('fadein');
	overlayPanel.classList.remove('fadeout');	
	// backgroundText.style.display = "block";
}

function panelGoneAnimation(){
	descriptionPanel.classList.add("descPanScaleDown");
	setTimeout(function(){ descriptionPanel.style.display = "none"; 
							// backgroundText.style.display = "none"; 
							disableSearchButtonHover();}, 500);
	overlayPanel.classList.remove('fadein');
	overlayPanel.classList.add('fadeout');	
	
}

function disableSearchButtonHover(){
	let elem = document.getElementsByClassName('searchButtonnoHover');
	while(elem[0]){
		elem[0].classList.add('searchButton');
		elem[0].disabled = false;
		elem[0].classList.remove('searchButtonnoHover');
	}		
}

// closing panel
document.getElementById('close-icon').onclick = function(){
	panelGoneAnimation();
	imgPanel.src = "";
	isPlay = true;
	requestAnimationFrame(animate);
};


document.getElementById("startButton").addEventListener("click",closeCurtain);
function closeCurtain(){
	for(let i =0;i<logoList.length;i++){
		document.getElementById(logoList[i]).style.animation = "logoClose .5s ." + (4 + i) +"s forwards";
	}	
	setTimeout(function(){ document.getElementById("startButton").style.animation = "logoClose .5s forwards";}, 1000);
	setTimeout(function(){ loadingScreen.style.display = "none"; musicToggle();}, 1500);		
}

function main(){
	scene = new THREE.Scene();
	setupCanvas();
	renderer = setupRenderer(renderer,canvas,paramsTone);
	camera = setupCamera(camera,fov,aspect,near,far,camPost);
	
	composer = new EffectComposer(renderer);
	composer.setSize(canvas.clientWidth,canvas.clientHeight);
	composer.addPass(new RenderPass(scene,camera));
	// composer.addPass(new ShaderPass(BrightnessContrastShader));
	composer.addPass(new ShaderPass(GradientMapShader));
	composer.addPass(new ShaderPass(GammaCorrectionShader));	
	
	setupLight();
	setupSkyBox();
	Promise.all(loadModelsArray()).then(() => {
		for(let i = 0;i<models.length;i++){
			let model = models[i].scene || models[i].scenes[0];	
			let clips = models[i].animations || [];
			model.scale.set(1,1,1);
			// if(model.children[0].children.length>0){
				// model.children[0].children.forEach(function(child){
					// if(child.material.map != null){
						// console.log("Image")
					// }else{
						// // child.material.roughness = 1;
						// // let newMat = new THREE.MeshBasicMaterial();
						// // newMat.color = child.material.color;
						// // newMat.name = child.material.name;
						// // child.material = newMat;
					// }
					// // console.log(child.material.name + " " + child.material.color.getHexString() );
					// // child.material.color = child.material.color.convertSRGBToLinear();
					// // child.material.needUpdates = true;
				// });
			// }else{
				// if(model.children[0].material.map != null){
					// console.log("Image")
				// }else{
					// // model.children[0].material.roughness = 1;		
					// // let newMat = new THREE.MeshBasicMaterial();
					// // newMat.color = model.children[0].material.color;
					// // newMat.name = model.children[0].name;
					// // model.children[0].material = newMat;
				// }
				// // console.log(model.children[0].material.name + " " + model.children[0].material.color.getHexString() );
				// // model.children[0].material.color = model.children[0].material.color.convertSRGBToLinear();
				// // model.children[0].material.needUpdates = true;
			// }
						
			scene.add( model );		

			if(clips.length != 0){
				mixers.push(new THREE.AnimationMixer(model));
				let action = mixers[mixers.length-1].clipAction(clips[0]);
				action.play();				
			}				
		}				
		loadingScreen.style.animation = "fadeOutBackground .5s forwards";
		document.getElementById("loading-border").style.animation = "fadeOutOp .5s .5s forwards";
		setTimeout(()=>{document.getElementById("loading-border").style.display = "none";document.getElementById("startButton").style.display = "block"},1500);

		render();	
		animate();
		
	});	
}

// javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
main();