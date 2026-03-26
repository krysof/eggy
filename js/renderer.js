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
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 80, 400);

const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.5, 2000000);
window.addEventListener('resize', ()=>{ R.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); });

// ---- Lighting ----
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xFFEECC, 2.0);
sun.position.set(60,80,40); sun.castShadow=true;
sun.shadow.mapSize.set(4096,4096);
const ssc=sun.shadow.camera; ssc.left=-120;ssc.right=120;ssc.top=120;ssc.bottom=-120;ssc.near=1;ssc.far=300;
sun.shadow.bias=-0.001;
scene.add(sun); scene.add(sun.target);
scene.add(new THREE.HemisphereLight(0xaaddff,0x88cc66,0.5));
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
