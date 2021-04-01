import { Euler } from '../three/build/three.module.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../three/examples/jsm/loaders/DRACOLoader.js';
import { Character } from './character.js';
import { setupRenderer, setupCamera } from './essential.js';

let scene,camera,renderer,canvas
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
"a very springy and chewy cake.","String hopper dish made of rice flour","Grandma hair but made of sugar",
"Javanese sncek made of Cassava","Amazing cold dessert in indonesia since its hot here almost all year.",
"Kue Mangkok Uhuy"]

let objectDescriptionID = ["Martabak Manis adalah raja Indonesia pencuci mulut, itu adalah sinfully baik",
"kue yang sangat kenyal dan kenyal","Piring hopper terbuat dari tepung beras", "Rambut nenek tapi terbuat dari gula",
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
	scene.background = skyboxTexture;	
	scene.environment = skyboxTexture;	
}

function setupLight(){
	// ff849c pink
	// ffce9f cream
	const skyColor = 0xffffff; 
	const groundColor = 0xffffff;
	const intensity = 1;
	const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
	// scene.add( light );	
	// const ambLight = new THREE.AmbientLight( 0xffffff , 0.3); // soft white light
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
		camera.updateProjectionMatrix();
    }	
	
	objectsCameraVision();
	renderer.render(scene,camera);
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
	isPlay = true;
	requestAnimationFrame(animate);
};

function convertMaterial(model){
	if(model.children.length > 0){
		console.log("Length more than 1");
		model.children.forEach(element => console.log(element.material))
	}else{
		console.log("Length 1");
		console.log(model.material);
	}
	
}

function main(){
	scene = new THREE.Scene();
	setupCanvas();
	renderer = setupRenderer(renderer,canvas,paramsTone);
	camera = setupCamera(camera,fov,aspect,near,far,camPost);
	setupLight();
	setupSkyBox();
	Promise.all(loadModelsArray()).then(() => {
		for(let i = 0;i<models.length;i++){
			let model = models[i].scene || models[i].scenes[0];	
			let clips = models[i].animations || [];
			model.scale.set(1,1,1);
			model.position.set(0,0,0);
			convertMaterial(model.children[0]);
			scene.add( model );				
			if(clips.length != 0){
				mixers.push(new THREE.AnimationMixer(model));
				let action = mixers[mixers.length-1].clipAction(clips[0]);
				action.play();				
			}				
		}				
		loadingScreen.style.animation = "fadeOutBackground .5s forwards";
		document.getElementById("loading-border").style.animation = "fadeOutOp .5s .5s forwards";
		for(let i =0;i<logoList.length;i++){
			document.getElementById(logoList[i]).style.animation = "logoClose .5s ." + (4 + i) +"s forwards";
		}
		render();	
		setTimeout(function(){ loadingScreen.style.display = "none"; animate();}, 1500);			
	});	
}

// javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
main();