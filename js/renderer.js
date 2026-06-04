// renderer.js — DANBO World
// ---- Renderer ----
const root = document.getElementById('three-root');
const R = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance', stencil:false});
R.setSize(innerWidth,innerHeight);
var _pixelRatioMin=RENDER_CONFIG.pixelRatioMin||1.0;
var _pixelRatioMax=Math.min(devicePixelRatio||1,RENDER_CONFIG.pixelRatioMax||2);
var _renderPixelRatio=_pixelRatioMax;
function _setRenderPixelRatio(v){
    _renderPixelRatio=Math.max(_pixelRatioMin,Math.min(_pixelRatioMax,v));
    R.setPixelRatio(_renderPixelRatio);
}
_setRenderPixelRatio(_renderPixelRatio);
R.shadowMap.enabled = true;
R.shadowMap.type = THREE.PCFSoftShadowMap;
R.outputColorSpace = THREE.SRGBColorSpace;
if(THREE.LinearToneMapping!==undefined)R.toneMapping=THREE.LinearToneMapping;
else if(THREE.ACESFilmicToneMapping!==undefined)R.toneMapping=THREE.ACESFilmicToneMapping;
R.toneMappingExposure=RENDER_CONFIG.toneExposure||1.06;
root.appendChild(R.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(RENDER_CONFIG.fogColor);
scene.fog = new THREE.Fog(RENDER_CONFIG.fogColor, RENDER_CONFIG.fogNear, RENDER_CONFIG.fogFar);

const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.5, 2000000);
window.addEventListener('resize', ()=>{
    R.setSize(innerWidth,innerHeight);
    _pixelRatioMax=Math.min(devicePixelRatio||1,RENDER_CONFIG.pixelRatioMax||2);
    _setRenderPixelRatio(_renderPixelRatio);
    camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
});

// ---- Lighting ----
scene.add(new THREE.AmbientLight(0xffffff, RENDER_CONFIG.ambientIntensity));
const sun = new THREE.DirectionalLight(RENDER_CONFIG.sunColor, RENDER_CONFIG.sunIntensity);
sun.position.set(RENDER_CONFIG.sunPos.x,RENDER_CONFIG.sunPos.y,RENDER_CONFIG.sunPos.z); sun.castShadow=true;
sun.shadow.mapSize.set(RENDER_CONFIG.shadowMapSize,RENDER_CONFIG.shadowMapSize);
const ssc=sun.shadow.camera; ssc.left=-RENDER_CONFIG.shadowRange;ssc.right=RENDER_CONFIG.shadowRange;ssc.top=RENDER_CONFIG.shadowRange;ssc.bottom=-RENDER_CONFIG.shadowRange;ssc.near=RENDER_CONFIG.shadowNear;ssc.far=RENDER_CONFIG.shadowFar;
sun.shadow.bias=RENDER_CONFIG.shadowBias;
sun.shadow.radius=4.5;
scene.add(sun); scene.add(sun.target);
scene.add(new THREE.HemisphereLight(RENDER_CONFIG.hemiSkyColor,RENDER_CONFIG.hemiGroundColor,RENDER_CONFIG.hemiIntensity));
const rimLight = new THREE.DirectionalLight(0xD0F0FF,0.18);
rimLight.position.set(-50,45,-60);
scene.add(rimLight);
// Sun visual mesh (visible in ground cities)
var _sunMesh=new THREE.Mesh(new THREE.SphereGeometry(8,16,12),new THREE.MeshBasicMaterial({color:0xFFEE44,fog:false}));
_sunMesh.position.copy(sun.position).multiplyScalar(3);
scene.add(_sunMesh);
// Sun glow
var _sunGlow=new THREE.Mesh(new THREE.SphereGeometry(12,16,12),new THREE.MeshBasicMaterial({color:0xFFFF88,transparent:true,opacity:0.25,fog:false}));
_sunGlow.position.copy(_sunMesh.position);
scene.add(_sunGlow);

// ---- Procedural gradient sky + adaptive render quality ----
var _skyDomeGeo=new THREE.SphereGeometry(900000,32,16);
var _skyDomeMat=new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true,depthWrite:false,depthTest:false,fog:false});
var _skyDome=new THREE.Mesh(_skyDomeGeo,_skyDomeMat);
_skyDome.frustumCulled=false;
_skyDome.renderOrder=-1000;
scene.add(_skyDome);
function _mixHex(a,b,t){
    t=Math.max(0,Math.min(1,t));
    var ar=(a>>16)&255,ag=(a>>8)&255,ab=a&255;
    var br=(b>>16)&255,bg=(b>>8)&255,bb=b&255;
    var r=Math.round(ar+(br-ar)*t),g=Math.round(ag+(bg-ag)*t),bl=Math.round(ab+(bb-ab)*t);
    return (r<<16)|(g<<8)|bl;
}
function _updateSkyDome(skyHex,horizonHex,groundHex){
    skyHex=(skyHex===undefined)?0x87CEEB:skyHex;
    horizonHex=(horizonHex===undefined)?_mixHex(skyHex,0xffffff,0.35):horizonHex;
    groundHex=(groundHex===undefined)?_mixHex(skyHex,0x223344,0.35):groundHex;
    var pos=_skyDomeGeo.attributes.position;
    var colors=[];
    for(var i=0;i<pos.count;i++){
        var y=pos.getY(i)/900000;
        var cHex;
        if(y>=0)cHex=_mixHex(horizonHex,skyHex,Math.pow(y,0.65));
        else cHex=_mixHex(horizonHex,groundHex,Math.min(1,-y*1.8));
        colors.push(((cHex>>16)&255)/255,((cHex>>8)&255)/255,(cHex&255)/255);
    }
    _skyDomeGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    _skyDomeGeo.attributes.color.needsUpdate=true;
}
_updateSkyDome(RENDER_CONFIG.fogColor,0xEAF7FF,0x88CCAA);

var _qualityFrameCount=0,_qualityAvgMs=16.7,_qualityCooldown=0;
function _updateRenderQuality(frameMs){
    if(!frameMs||gameState==='menu')return;
    _qualityAvgMs=_qualityAvgMs*0.94+frameMs*0.06;
    _qualityFrameCount++;
    if(_qualityCooldown>0){_qualityCooldown--;return;}
    if(_qualityFrameCount%45!==0)return;
    if(_qualityAvgMs>24&&_renderPixelRatio>_pixelRatioMin+0.05){
        _setRenderPixelRatio(_renderPixelRatio-0.12);
        _qualityCooldown=45;
    } else if(_qualityAvgMs<17.2&&_renderPixelRatio<_pixelRatioMax-0.05){
        _setRenderPixelRatio(_renderPixelRatio+0.08);
        _qualityCooldown=90;
    }
}

function _updateSunShadowFocus(){
    if(!playerEgg||!sun.visible)return;
    var px=playerEgg.mesh.position.x,pz=playerEgg.mesh.position.z;
    sun.target.position.set(px,0,pz);
    sun.position.set(px+RENDER_CONFIG.sunPos.x,RENDER_CONFIG.sunPos.y,pz+RENDER_CONFIG.sunPos.z);
    _sunMesh.position.set(px+RENDER_CONFIG.sunPos.x*3,RENDER_CONFIG.sunPos.y*3,pz+RENDER_CONFIG.sunPos.z*3);
    _sunGlow.position.copy(_sunMesh.position);
}

// ---- Skins ----
// ---- Characters ----
