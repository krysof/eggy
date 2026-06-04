// postfx.js — DANBO World
// ============================================================
//  Lightweight post-processing for a soft kawaii toy-cartoon look.
//  Single render-target pass: gentle bloom, pastel color lift,
//  very light vignette, and mild filmic curve. No external dependencies.
// ============================================================
/* global THREE, R, scene, camera, currentCityStyle, _renderPixelRatio */

var _postFXEnabled=true;
var _postFXRT=null,_postFXScene=null,_postFXCamera=null,_postFXQuad=null,_postFXMat=null;
var _postFXSize=new THREE.Vector2(1,1);
var _postFXFrame=0;

var _postFXMood=[
    {bloom:0.20,sat:0.99,contrast:0.94,exposure:1.06,vignette:0.10,warm:0.040,threshold:0.70},
    {bloom:0.18,sat:1.00,contrast:0.94,exposure:1.06,vignette:0.12,warm:0.075,threshold:0.68},
    {bloom:0.20,sat:0.98,contrast:0.93,exposure:1.08,vignette:0.10,warm:-0.015,threshold:0.68},
    {bloom:0.26,sat:1.02,contrast:0.96,exposure:1.04,vignette:0.18,warm:0.070,threshold:0.63},
    {bloom:0.28,sat:1.04,contrast:0.93,exposure:1.08,vignette:0.08,warm:0.055,threshold:0.66},
    {bloom:0.24,sat:0.99,contrast:0.94,exposure:1.02,vignette:0.22,warm:-0.010,threshold:0.61},
    {bloom:0.24,sat:1.03,contrast:0.93,exposure:1.08,vignette:0.10,warm:0.050,threshold:0.66},
    {bloom:0.24,sat:0.98,contrast:0.93,exposure:1.09,vignette:0.12,warm:-0.005,threshold:0.64}
];

function _initCinematicPostFX(){
    if(_postFXRT||typeof R==='undefined'||typeof THREE==='undefined')return;
    _postFXRT=new THREE.WebGLRenderTarget(2,2,{
        minFilter:THREE.LinearFilter,
        magFilter:THREE.LinearFilter,
        format:THREE.RGBAFormat,
        depthBuffer:true,
        stencilBuffer:false
    });
    if(R.capabilities&&R.capabilities.isWebGL2)_postFXRT.samples=2;
    _postFXScene=new THREE.Scene();
    _postFXCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    _postFXMat=new THREE.ShaderMaterial({
        depthWrite:false,
        depthTest:false,
        uniforms:{
            tDiffuse:{value:null},
            resolution:{value:new THREE.Vector2(2,2)},
            time:{value:0},
            uBloom:{value:0.22},
            uSaturation:{value:0.99},
            uContrast:{value:0.94},
            uExposure:{value:1.06},
            uVignette:{value:0.10},
            uWarmth:{value:0.03},
            uThreshold:{value:0.55}
        },
        vertexShader:[
            'varying vec2 vUv;',
            'void main(){',
            '  vUv=uv;',
            '  gl_Position=vec4(position.xy,0.0,1.0);',
            '}'
        ].join('\n'),
        fragmentShader:[
            '#ifdef GL_ES',
            'precision highp float;',
            '#endif',
            'uniform sampler2D tDiffuse;',
            'uniform vec2 resolution;',
            'uniform float time;',
            'uniform float uBloom;',
            'uniform float uSaturation;',
            'uniform float uContrast;',
            'uniform float uExposure;',
            'uniform float uVignette;',
            'uniform float uWarmth;',
            'uniform float uThreshold;',
            'varying vec2 vUv;',
            'float luma(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}',
            'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
            'vec3 brightSample(vec2 uv){',
            '  vec3 c=texture2D(tDiffuse,uv).rgb;',
            '  float b=smoothstep(uThreshold,1.0,luma(c));',
            '  return c*b;',
            '}',
            'void main(){',
            '  vec2 uv=vUv;',
            '  vec2 px=1.0/max(resolution,vec2(1.0));',
            '  float edge=length(uv-0.5);',
            '  vec2 chroma=(uv-0.5)*px*0.75*smoothstep(0.45,0.95,edge);',
            '  vec3 col;',
            '  col.r=texture2D(tDiffuse,uv+chroma).r;',
            '  col.g=texture2D(tDiffuse,uv).g;',
            '  col.b=texture2D(tDiffuse,uv-chroma).b;',
            '  vec3 bloom=vec3(0.0);',
            '  vec2 d1=px*vec2(2.0,2.0);',
            '  vec2 d2=px*vec2(5.0,5.0);',
            '  vec2 d3=px*vec2(9.0,9.0);',
            '  bloom += brightSample(uv+vec2( d1.x, 0.0));',
            '  bloom += brightSample(uv+vec2(-d1.x, 0.0));',
            '  bloom += brightSample(uv+vec2(0.0,  d1.y));',
            '  bloom += brightSample(uv+vec2(0.0, -d1.y));',
            '  bloom += brightSample(uv+vec2( d2.x, d2.y))*0.72;',
            '  bloom += brightSample(uv+vec2(-d2.x, d2.y))*0.72;',
            '  bloom += brightSample(uv+vec2( d2.x,-d2.y))*0.72;',
            '  bloom += brightSample(uv+vec2(-d2.x,-d2.y))*0.72;',
            '  bloom += brightSample(uv+vec2( d3.x, 0.0))*0.42;',
            '  bloom += brightSample(uv+vec2(-d3.x, 0.0))*0.42;',
            '  bloom += brightSample(uv+vec2(0.0,  d3.y))*0.42;',
            '  bloom += brightSample(uv+vec2(0.0, -d3.y))*0.42;',
            '  bloom/=8.2;',
            '  col += bloom*uBloom;',
            '  col *= vec3(1.0+uWarmth*0.75,1.0+uWarmth*0.16,1.0-uWarmth*0.60);',
            '  col = (col-0.5)*uContrast+0.5;',
            '  float g=luma(col);',
            '  col=mix(vec3(g),col,uSaturation);',
            '  col=max(col,vec3(0.0))*uExposure;',
            '  vec3 shoulder=col/(col+vec3(0.62))*1.36;',
            '  col=mix(col,shoulder,0.04);',
            '  col=pow(max(col,vec3(0.0)),vec3(0.98));',
            '  col=col*0.940+vec3(0.058,0.052,0.055);',
            '  col=mix(col,vec3(1.0,0.960,0.935),0.065);',
            '  float vig=smoothstep(uVignette,0.92,edge);',
            '  col*=mix(1.0,0.92,vig);',
            '  col += (hash(gl_FragCoord.xy+time*17.0)-0.5)/255.0;',
            '  gl_FragColor=vec4(col,1.0);',
            '}'
        ].join('\n')
    });
    _postFXQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),_postFXMat);
    _postFXScene.add(_postFXQuad);
}

function _updatePostFXSize(){
    if(!_postFXRT)return;
    R.getDrawingBufferSize(_postFXSize);
    var w=Math.max(1,Math.floor(_postFXSize.x));
    var h=Math.max(1,Math.floor(_postFXSize.y));
    if(_postFXRT.width!==w||_postFXRT.height!==h){
        _postFXRT.setSize(w,h);
        _postFXMat.uniforms.resolution.value.set(w,h);
    }
}

function _updatePostFXMood(){
    if(!_postFXMat)return;
    var style=(typeof currentCityStyle==='number')?currentCityStyle:0;
    var m=_postFXMood[style]||_postFXMood[0];
    var u=_postFXMat.uniforms;
    u.uBloom.value=m.bloom;
    u.uSaturation.value=m.sat;
    u.uContrast.value=m.contrast;
    u.uExposure.value=m.exposure;
    u.uVignette.value=m.vignette;
    u.uWarmth.value=m.warm;
    u.uThreshold.value=m.threshold;
}

function _renderCinematicFrame(){
    if(!_postFXEnabled){R.render(scene,camera);return;}
    _initCinematicPostFX();
    if(!_postFXRT||!_postFXMat){R.render(scene,camera);return;}
    _updatePostFXSize();
    _updatePostFXMood();
    _postFXFrame++;
    _postFXMat.uniforms.time.value=performance.now()*0.001;
    R.setRenderTarget(_postFXRT);
    R.render(scene,camera);
    R.setRenderTarget(null);
    _postFXMat.uniforms.tDiffuse.value=_postFXRT.texture;
    R.render(_postFXScene,_postFXCamera);
}

function _setCinematicPostFXEnabled(v){_postFXEnabled=!!v;}
