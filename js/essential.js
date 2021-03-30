export function setupRenderer(renderer,canvas,paramsTone){
	//anti alias make the object less jagged or squary feel
	renderer = new THREE.WebGLRenderer({antialias: true,canvas});
	renderer.setPixelRatio( window.devicePixelRatio );
	document.body.appendChild( renderer.domElement );	
	return renderer;
}

export function setupCamera(camera,fov,aspect,near,far,camPost){
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.copy(camPost);
	return camera;
}
