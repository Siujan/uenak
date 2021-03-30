import { Euler } from '../three/build/three.module.js';
export function Character(rotSpeed){
	let euler = new Euler( 0, 0, 0, 'YXZ' );
	const PI_2 = Math.PI / 2;
	const rotatingSpeed = rotSpeed;

	function rotateCamera(x,y,camera){
		euler.setFromQuaternion( camera.quaternion );
		euler.y += x * rotatingSpeed;
		euler.x += y * rotatingSpeed;	
		
		euler.x = Math.max( PI_2 - Math.PI, Math.min(euler.x, PI_2) );
		camera.quaternion.setFromEuler( euler );
		
	}
	return rotateCamera;
}