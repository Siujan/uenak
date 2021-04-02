/**
 * Full-screen textured quad shader
 */

var GradientMapShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }

	},

	vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'uniform float opacity;',

		'uniform sampler2D tDiffuse;',

		'varying vec2 vUv;',

		'void main() {',

		'	vec4 texel = texture2D( tDiffuse, vUv );',
		'	gl_FragColor = opacity * texel;',
		'   vec4 overlay = vec4(1,0.517647,0.61176,1) + ((gl_FragColor * vec4(0,74,40,1))/vec4(255,255,255,1));',
		'   float r = overlay.r;',
		'   if(overlay.r < 0.5){',
		'   	r = 2.0*gl_FragColor.r*r + gl_FragColor.r*gl_FragColor.r*(1.0-2.0*r);',
		'   }else{',
		'   	r = 2.0*gl_FragColor.r*(1.0-r)+sqrt(gl_FragColor.r)*(2.0*r-1.0);',
		'   };',
		'   float g = overlay.g;',
		'   if(overlay.g < 0.5){',
		'   	g = 2.0*gl_FragColor.g*g + gl_FragColor.g*gl_FragColor.g*(1.0-2.0*g);',
		'   }else{',
		'   	g = 2.0*gl_FragColor.g*(1.0-g)+sqrt(gl_FragColor.g)*(2.0*g-1.0);',
		'   };',	
		'   float b = overlay.b;',
		'   if(overlay.b < 0.5){',
		'   	b = 2.0*gl_FragColor.b*b + gl_FragColor.b*gl_FragColor.b*(1.0-2.0*b);',
		'   }else{',
		'   	b = 2.0*gl_FragColor.b*(1.0-b)+sqrt(gl_FragColor.b)*(2.0*b-1.0);',
		'   };',		
		'	gl_FragColor = vec4(r,g,b,overlay.a);',
		'}'

	].join( '\n' )

};

export { GradientMapShader };
