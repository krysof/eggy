// ============================================================
//  platformer.js — Side-scrolling adventure using existing city engine
//  Creates a new long narrow map with side-view camera
// ============================================================
var _pfActive=false;
var _pfSavedCity=-1;

function _pfStart(){
    _pfSavedCity=currentCityStyle;
    // Fully clear old city using existing clearCity
    if(typeof clearCity==='function')clearCity();
    // Also remove player egg
    if(playerEgg&&playerEgg.mesh)scene.remove(playerEgg.mesh);
    // Clear allEggs
    for(var ai=allEggs.length-1;ai>=0;ai--){scene.remove(allEggs[ai].mesh);allEggs.splice(ai,1);}
    playerEgg=null;
    cityNPCs.length=0;
    // Set special city style
    currentCityStyle=99;
    gameState='city';
    // Build the platformer level
    _pfBuildLevel();
    scene.add(cityGroup);
    // Create player
    var ch=CHARACTERS[selectedChar];
    playerEgg=createEgg(4,0,ch.color,ch.accent,true,scene,ch.type);
    playerEgg.mesh.position.set(4,2,0);
    playerEgg.isPlayer=true;
    allEggs.push(playerEgg);
    // Pick 3 random NPC companions (different characters)
    var npcPool=[];
    for(var ci=0;ci<CHARACTERS.length;ci++){if(ci!==selectedChar)npcPool.push(ci);}
    for(var si=npcPool.length-1;si>0;si--){var sj=Math.floor(Math.random()*(si+1));var t=npcPool[si];npcPool[si]=npcPool[sj];npcPool[sj]=t;}
    for(var ni=0;ni<3;ni++){
        var nch=CHARACTERS[npcPool[ni]];
        var npc=createEgg(2+ni*3,0,nch.color,nch.accent,false,scene,nch.type);
        npc.mesh.position.set(2+ni*3,2,(ni-1)*2);
        npc.cityNPC=true;
        cityNPCs.push(npc);
        allEggs.push(npc);
    }
    _pfActive=true;
    // UI
    scene.fog=null;
    if(R)R.setClearColor(0x87CEEB);
    var hud=document.getElementById('city-hud');if(hud)hud.style.display='';
    var tc=document.getElementById('touch-controls');if(tc)tc.classList.remove('hidden');
}

function _pfBuildLevel(){
    var T=4,L=120,D=T*3;
    var W=T*L;
    // ---- Ground (segmented with gaps) ----
    var gaps=[[20,23],[45,48],[75,78],[100,103]];
    var gapSet={};
    for(var gi=0;gi<gaps.length;gi++)for(var gx=gaps[gi][0];gx<gaps[gi][1];gx++)gapSet[gx]=true;
    // Build ground segments
    var segStart=0,inSeg=false;
    for(var tx=0;tx<=L;tx++){
        var solid=!gapSet[tx]&&tx<L;
        if(solid&&!inSeg){segStart=tx;inSeg=true;}
        if(!solid&&inSeg){
            var sx=segStart*T,sw=(tx-segStart)*T;
            // Visual ground
            var gnd=new THREE.Mesh(new THREE.BoxGeometry(sw,1,D),toon(0x44AA44));
            gnd.position.set(sx+sw/2,-0.5,0);gnd.receiveShadow=true;cityGroup.add(gnd);
            var drt=new THREE.Mesh(new THREE.BoxGeometry(sw,3,D),toon(0x8B5E3C));
            drt.position.set(sx+sw/2,-2.5,0);cityGroup.add(drt);
            // Collider
            cityColliders.push({x:sx+sw/2,z:0,hw:sw/2,hd:D/2,h:1,y:0});
            inSeg=false;
        }
    }
    // Gap visuals (dark pits)
    for(var ggi=0;ggi<gaps.length;ggi++){
        var gx1=gaps[ggi][0]*T,gx2=gaps[ggi][1]*T,gw=gx2-gx1;
        var pit=new THREE.Mesh(new THREE.BoxGeometry(gw,5,D),toon(0x111111));
        pit.position.set(gx1+gw/2,-3,0);cityGroup.add(pit);
    }
    // ---- Brick platforms ----
    var plats=[[8,14,4],[28,35,5],[50,56,3],[60,68,5],[82,88,4],[92,98,6],[108,115,4]];
    for(var pi=0;pi<plats.length;pi++){
        var px1=plats[pi][0]*T,px2=plats[pi][1]*T,ph=plats[pi][2];
        var pw=px2-px1;
        var plat=new THREE.Mesh(new THREE.BoxGeometry(pw,1,D),toon(0xC4713B));
        plat.position.set(px1+pw/2,ph,0);cityGroup.add(plat);
        cityColliders.push({x:px1+pw/2,z:0,hw:pw/2,hd:D/2,h:1,y:ph});
    }
    // ---- Pipes ----
    var pipes=[[18,3],[40,4],[70,3],[90,5]];
    for(var ppi=0;ppi<pipes.length;ppi++){
        var ppx=pipes[ppi][0]*T,pph=pipes[ppi][1]*T;
        var pipe=new THREE.Mesh(new THREE.CylinderGeometry(T*0.7,T*0.7,pph,12),toon(0x33AA33));
        pipe.position.set(ppx,pph/2,0);cityGroup.add(pipe);
        var rim=new THREE.Mesh(new THREE.CylinderGeometry(T*0.9,T*0.9,T*0.4,12),toon(0x44CC44));
        rim.position.set(ppx,pph+T*0.2,0);cityGroup.add(rim);
        cityColliders.push({x:ppx,z:0,hw:T*0.7,hd:T*0.7,h:pph+T*0.4,y:0});
    }
    // ---- Staircase ----
    for(var si2=0;si2<8;si2++){
        var sh=(si2+1)*T;
        var step=new THREE.Mesh(new THREE.BoxGeometry(T,sh,D),toon(0x8B5E3C));
        step.position.set((L-15+si2)*T,sh/2,0);cityGroup.add(step);
        cityColliders.push({x:(L-15+si2)*T,z:0,hw:T/2,hd:D/2,h:sh,y:0});
    }
    // ---- Flag pole ----
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,T*10,6),toon(0x888888));
    pole.position.set((L-8)*T,T*5,0);cityGroup.add(pole);
    var flag=new THREE.Mesh(new THREE.PlaneGeometry(T*2,T),new THREE.MeshBasicMaterial({color:0xFF4444,side:THREE.DoubleSide}));
    flag.position.set((L-8)*T+T,T*9,0);cityGroup.add(flag);
    // ---- Castle ----
    var castle=new THREE.Mesh(new THREE.BoxGeometry(T*6,T*5,D*1.5),toon(0xAA8866));
    castle.position.set((L-3)*T,T*2.5,0);cityGroup.add(castle);
    var door=new THREE.Mesh(new THREE.BoxGeometry(T*1.5,T*2.5,1),toon(0x442200));
    door.position.set((L-3)*T,T*1.25,D*0.76);cityGroup.add(door);
    for(var ti=-1;ti<=1;ti+=2){
        var turret=new THREE.Mesh(new THREE.CylinderGeometry(T*0.6,T*0.8,T*2,8),toon(0x998877));
        turret.position.set((L-3)*T+ti*T*2,T*6,0);cityGroup.add(turret);
        var cone=new THREE.Mesh(new THREE.ConeGeometry(T*0.8,T*1.5,8),toon(0xCC4444));
        cone.position.set((L-3)*T+ti*T*2,T*7.5,0);cityGroup.add(cone);
    }
    // ---- Sky ----
    var sky=new THREE.Mesh(new THREE.PlaneGeometry(W+200,200),new THREE.MeshBasicMaterial({color:0x87CEEB,side:THREE.DoubleSide}));
    sky.position.set(W/2,50,-D*3);cityGroup.add(sky);
    // ---- Clouds ----
    for(var ci2=0;ci2<15;ci2++){
        var cloud=new THREE.Group();
        for(var cp=0;cp<3;cp++){
            var cb=new THREE.Mesh(new THREE.SphereGeometry(2+Math.random()*2,8,6),toon(0xFFFFFF));
            cb.position.set(cp*2.5-2.5,Math.random()*0.5,0);cloud.add(cb);
        }
        cloud.position.set(Math.random()*W,25+Math.random()*20,-D*2-Math.random()*10);
        cityGroup.add(cloud);
    }
    // ---- Coins ----
    for(var cci=0;cci<40;cci++){
        var ccx=10+Math.random()*(W-40);
        var inGap2=false;
        for(var gci=0;gci<gaps.length;gci++){if(ccx/T>=gaps[gci][0]&&ccx/T<gaps[gci][1])inGap2=true;}
        if(inGap2)continue;
        var cc=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.08,12),toon(0xFFDD00,{emissive:0xFFAA00,emissiveIntensity:0.3}));
        cc.position.set(ccx,1.2+Math.random()*3,0);cc.rotation.x=Math.PI/2;
        cityGroup.add(cc);
        cityCoins.push({mesh:cc,collected:false});
    }
}

// ---- Side-view camera ----
function _pfUpdateCamera(){
    if(!_pfActive||!playerEgg)return;
    // Restrict Z for all eggs
    for(var i=0;i<allEggs.length;i++){
        if(!allEggs[i]||!allEggs[i].mesh)continue;
        allEggs[i].mesh.position.z=Math.max(-5,Math.min(5,allEggs[i].mesh.position.z));
        allEggs[i].vz*=0.3;
    }
    // Side camera
    var px=playerEgg.mesh.position.x;
    var py=Math.max(playerEgg.mesh.position.y+8,10);
    camera.position.x+=(px-camera.position.x)*0.08;
    camera.position.y+=(py-camera.position.y)*0.08;
    camera.position.z=45;
    camera.lookAt(new THREE.Vector3(camera.position.x,camera.position.y-4,0));
}

// ---- End platformer ----
function _pfEndGame(){
    _pfActive=false;
    currentCityStyle=_pfSavedCity>=0?_pfSavedCity:0;
    if(typeof switchCity==='function')switchCity(currentCityStyle);
}
