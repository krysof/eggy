// renderer.js — DANBO World
// ---- Renderer ----
const root = document.getElementById('three-root');
const R = new THREE.WebGLRenderer({antialias:true});
R.setSize(innerWidth,innerHeight);
R.setPixelRatio(Math.min(devicePixelRatio,2));
R.shadowMap.enabled = true;
R.shadowMap.type = THREE.PCFSoftShadowMap;
R.outputColorSpace = THREE.SRGBColorSpace;
root.appendChild(R.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(RENDER_CONFIG.fogColor);
scene.fog = new THREE.Fog(RENDER_CONFIG.fogColor, RENDER_CONFIG.fogNear, RENDER_CONFIG.fogFar);

const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.5, 2000000);
window.addEventListener('resize', ()=>{ R.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); });

// ---- Lighting ----
scene.add(new THREE.AmbientLight(0xffffff, RENDER_CONFIG.ambientIntensity));
const sun = new THREE.DirectionalLight(RENDER_CONFIG.sunColor, RENDER_CONFIG.sunIntensity);
sun.position.set(RENDER_CONFIG.sunPos.x,RENDER_CONFIG.sunPos.y,RENDER_CONFIG.sunPos.z); sun.castShadow=true;
sun.shadow.mapSize.set(RENDER_CONFIG.shadowMapSize,RENDER_CONFIG.shadowMapSize);
const ssc=sun.shadow.camera; ssc.left=-RENDER_CONFIG.shadowRange;ssc.right=RENDER_CONFIG.shadowRange;ssc.top=RENDER_CONFIG.shadowRange;ssc.bottom=-RENDER_CONFIG.shadowRange;ssc.near=RENDER_CONFIG.shadowNear;ssc.far=RENDER_CONFIG.shadowFar;
sun.shadow.bias=RENDER_CONFIG.shadowBias;
scene.add(sun); scene.add(sun.target);
scene.add(new THREE.HemisphereLight(RENDER_CONFIG.hemiSkyColor,RENDER_CONFIG.hemiGroundColor,RENDER_CONFIG.hemiIntensity));
// Sun visual mesh (visible in ground cities)
var _sunMesh=new THREE.Mesh(new THREE.SphereGeometry(8,16,12),new THREE.MeshBasicMaterial({color:0xFFEE44,fog:false}));
_sunMesh.position.copy(sun.position).multiplyScalar(3);
scene.add(_sunMesh);
// Sun glow
var _sunGlow=new THREE.Mesh(new THREE.SphereGeometry(12,16,12),new THREE.MeshBasicMaterial({color:0xFFFF88,transparent:true,opacity:0.25,fog:false}));
_sunGlow.position.copy(_sunMesh.position);
scene.add(_sunGlow);

// ---- Skins ----
// ---- Characters ----
