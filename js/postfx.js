// postfx.js — DANBO World
// ============================================================
//  Lightweight cinematic post-processing for a premium cartoon look.
//  Single render-target pass: soft bloom, color grading, vignette,
//  subtle chromatic edge and filmic curve. No external dependencies.
// ============================================================
/* global THREE, R, scene, camera, currentCityStyle, _renderPixelRatio */

var _postFXEnabled=true;
var _postFXRT=null,_postFXScene=null,_postFXCamera=null,_postFXQuad=null,_postFXMat=null;
var _postFXSize=new THREE.Vector2(1,1);
var _postFXFrame=0;

var _postFXMood=[
    {bloom:0.30,sat:1.16,contrast:1.08,exposure:1.02,vignette:0.38,warm:0.02,threshold:0.62},
    {bloom:0.26,sat:1.18,contrast:1.10,exposure:1.00,vignette:0.42,warm:0.09,threshold:0.58},
    {bloom:0.34,sat:1.12,contrast:1.08,exposure:1.03,vignette:0.36,warm:-0.05,threshold:0.56},
    {bloom:0.46,sat:1.24,contrast:1.16,exposure:0.98,vignette:0.55,warm:0.13,threshold:0.48},
    {bloom:0.38,sat:1.28,contrast:1.08,exposure:1.03,vignette:0.32,warm:0.06,threshold:0.54},
    {bloom:0.42,sat:1.22,contrast:1.20,exposure:0.94,vignette:0.58,warm:-0.04,threshold:0.46},
    {bloom:0.36,sat:1.20,contrast:1.08,exposure:1.02,vignette:0.34,warm:0.04,threshold:0.55},
    {bloom:0.40,sat:1.13,contrast:1.10,exposure:1.04,vignette:0.48,warm:-0.02,threshold:0.50}
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
            uBloom:{value:0.32},
            uSaturation:{value:1.15},
            uContrast:{value:1.08},
            uExposure:{value:1.0},
            uVignette:{value:0.42},
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
            '  vec2 chroma=(uv-0.5)*px*2.2*smoothstep(0.35,0.82,edge);',
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
            '  vec3 shoulder=col/(col+vec3(0.45))*1.28;',
            '  col=mix(col,shoulder,0.24);',
            '  col=pow(max(col,vec3(0.0)),vec3(0.90));',
            '  col+=vec3(0.012);',
            '  float vig=smoothstep(uVignette,0.92,edge);',
            '  col*=mix(1.0,0.78,vig);',
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
