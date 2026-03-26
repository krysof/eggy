// characters.js — DANBO World
const CHARACTERS = [
    // SF2 select screen layout: top row L→R, bottom row L→R
    {name:'\u7ECF\u5178\u86CB\u5B9D',type:'egg',color:0xF5F5F0,accent:0xCC2222,icon:'\uD83E\uDD5A',portrait:'#F5F5F0',sf2:'Ryu',country:'Japan',flag:'\uD83C\uDDEF\uD83C\uDDF5',mapX:350,mapY:95},
    {name:'\u732A\u4ED4',type:'pig',color:0xFFCCAA,accent:0x2244AA,icon:'\uD83D\uDC37',portrait:'#FFCCAA',sf2:'E.Honda',country:'Japan',flag:'\uD83C\uDDEF\uD83C\uDDF5',mapX:350,mapY:95},
    {name:'\u732B\u4ED4',type:'cat',color:0x33AA33,accent:0xFF8800,icon:'\uD83D\uDC31',portrait:'#33AA33',sf2:'Blanka',country:'Brazil',flag:'\uD83C\uDDE7\uD83C\uDDF7',mapX:130,mapY:165},
    {name:'\u9E21\u516C',type:'rooster',color:0x556B2F,accent:0xFFDD44,icon:'\uD83D\uDC13',portrait:'#556B2F',sf2:'Guile',country:'USA',flag:'\uD83C\uDDFA\uD83C\uDDF8',mapX:80,mapY:80},
    {name:'\u72D7\u4ED4',type:'dog',color:0xCC2222,accent:0xFFDD44,icon:'\uD83D\uDC36',portrait:'#CC2222',sf2:'Ken',country:'USA',flag:'\uD83C\uDDFA\uD83C\uDDF8',mapX:80,mapY:80},
    {name:'\u9A6C\u9A9D',type:'monkey',color:0x2255CC,accent:0xFFFFFF,icon:'\uD83D\uDC35',portrait:'#2255CC',sf2:'Chun-Li',country:'China',flag:'\uD83C\uDDE8\uD83C\uDDF3',mapX:310,mapY:90},
    {name:'\u7530\u9E21',type:'frog',color:0xCC3333,accent:0x8B4513,icon:'\uD83D\uDC38',portrait:'#CC3333',sf2:'Zangief',country:'Russia',flag:'\uD83C\uDDF7\uD83C\uDDFA',mapX:260,mapY:50},
    {name:'\u66F1\u7534',type:'cockroach',color:0x8B6914,accent:0xFFFFFF,icon:'\uD83E\uDEB3',portrait:'#8B6914',sf2:'Dhalsim',country:'India',flag:'\uD83C\uDDEE\uD83C\uDDF3',mapX:290,mapY:110},
];
let selectedChar = 0;
// Apply localized character names
for(var _ci=0;_ci<CHARACTERS.length;_ci++){CHARACTERS[_ci].name=I18N.charNames[_langCode][_ci]||CHARACTERS[_ci].name;}
const AI_COLORS=[0xFFAA44,0x66DD66,0xFF5555,0x88CCDD,0xEEEE55,0xCC88CC,0xFFBBCC,0xAA88BB,0xFF8855,0x77BBFF,0xBB88FF,0xFFCC88,0xAAFF77,0xFF77AA,0x77DDDD,0xDDAA55];

// ---- SF2 Character Select Grid ----
const charGrid = document.getElementById('char-grid');
const portraitCanvas = document.getElementById('portrait-canvas');
const portraitCtx = null; // no longer using 2D context — drawPortrait uses WebGL
const portraitName = document.getElementById('portrait-name');

function drawPortrait(ch) {
    if (!portraitCanvas) return;
    var W=portraitCanvas.width, H=portraitCanvas.height;
    // Use a separate Three.js renderer to render the actual 3D character
    if(!window._portraitRenderer){
        try{
            window._portraitRenderer=new THREE.WebGLRenderer({canvas:portraitCanvas,alpha:true,antialias:true});
        }catch(e){
            // WebGL failed — skip portrait rendering
            window._portraitRenderer=null;
            return;
        }
        window._portraitRenderer.setSize(W,H);
        window._portraitRenderer.setClearColor(0x0a0a2e,1);
        window._portraitScene=new THREE.Scene();
        window._portraitCamera=new THREE.PerspectiveCamera(35,W/H,0.1,100);
        window._portraitCamera.position.set(0,1.2,3.5);
        window._portraitCamera.lookAt(0,0.7,0);
        window._portraitScene.add(new THREE.AmbientLight(0xffffff,0.7));
        var _pSun=new THREE.DirectionalLight(0xFFEECC,1.5);
        _pSun.position.set(2,3,2);
        window._portraitScene.add(_pSun);
        window._portraitScene.add(new THREE.HemisphereLight(0xaaddff,0x88cc66,0.4));
    }
    if(!window._portraitRenderer)return;
    // Remove old character mesh
    if(window._portraitMesh){
        window._portraitScene.remove(window._portraitMesh);
        window._portraitMesh=null;
    }
    // Create the actual character mesh
    var mesh=createEggMesh(ch.color,ch.accent,ch.type);
    mesh.position.set(0,0,0);
    mesh.rotation.y=0.3; // slight angle for better view
    window._portraitScene.add(mesh);
    window._portraitMesh=mesh;
    // Render
    window._portraitRenderer.render(window._portraitScene,window._portraitCamera);
}

