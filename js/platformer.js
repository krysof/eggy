// ============================================================
//  platformer.js — Side-scrolling adventure using existing city engine
//  Creates a long narrow city (Z locked) with side-view camera
// ============================================================
var _pfActive=false;
var _pfSavedCity=-1;

function _pfStart(){
    _pfSavedCity=currentCityStyle;
    _pfActive=true;
    // Use a special city style index for platformer
    // Build a long narrow city using existing buildCity
    currentCityStyle=99; // special marker
    gameState='city'; // reuse city mode entirely
    // Clean and rebuild
    if(typeof cleanupCity==='function')cleanupCity();
    // Build the platformer city manually
    _pfBuildPlatformerCity();
    // Spawn player at start
    if(playerEgg){
        playerEgg.mesh.position.set(0,1,-5);
        playerEgg.vx=0;playerEgg.vy=0;playerEgg.vz=0;
    }
    // Side-view camera
    _pfActive=true;
    // Show UI
    var hud=document.getElementById('city-hud');if(hud)hud.style.display='';
    var tc=document.getElementById('touch-controls');if(tc)tc.classList.remove('hidden');
}

function _pfBuildPlatformerCity(){
    var T=4; // tile size in world units
    var levelLen=120; // tiles long
    var levelW=T*levelLen;
    // Ground plane — long and narrow
    var groundGeo=new THREE.BoxGeometry(levelW,1,T*4);
    var ground=new THREE.Mesh(groundGeo,toon(0x44AA44));
    ground.position.set(levelW/2-T*2,-0.5,0);
    ground.receiveShadow=true;
    cityGroup.add(ground);
    // Dirt layer below
    var dirt=new THREE.Mesh(new THREE.BoxGeometry(levelW,2,T*4),toon(0x8B5E3C));
    dirt.position.set(levelW/2-T*2,-2,0);
    cityGroup.add(dirt);
    // Add collider for ground
    cityColliders.push({x:levelW/2-T*2,z:0,hw:levelW/2,hd:T*2,h:1,y:0});
    // Gaps in ground
    var gaps=[[20,23],[45,48],[75,78],[100,103]];
    for(var gi=0;gi<gaps.length;gi++){
        var gx1=gaps[gi][0]*T,gx2=gaps[gi][1]*T;
        var gapW=gx2-gx1;
        // Remove ground section by placing a dark pit visual
        var pit=new THREE.Mesh(new THREE.BoxGeometry(gapW,3,T*4),toon(0x222222));
        pit.position.set(gx1+gapW/2,-1.5,0);
        cityGroup.add(pit);
    }
    // Brick platforms (elevated)
    var platforms=[[8,14,4],[28,35,5],[50,56,3],[60,68,5],[82,88,4],[92,98,6],[108,115,4]];
    for(var pi=0;pi<platforms.length;pi++){
        var px1=platforms[pi][0]*T,px2=platforms[pi][1]*T,ph=platforms[pi][2];
        var pw=px2-px1;
        var plat=new THREE.Mesh(new THREE.BoxGeometry(pw,1,T*3),toon(0xC4713B));
        plat.position.set(px1+pw/2,ph,0);
        cityGroup.add(plat);
        cityColliders.push({x:px1+pw/2,z:0,hw:pw/2,hd:T*1.5,h:1,y:ph});
    }
    // Question blocks
    var qBlocks=[[10,4],[30,5],[52,3],[63,5],[85,4],[95,6],[110,4]];
    for(var qi=0;qi<qBlocks.length;qi++){
        var qx=qBlocks[qi][0]*T,qh=qBlocks[qi][1];
        var qb=new THREE.Mesh(new THREE.BoxGeometry(T,T,T),toon(0xFFD700));
        qb.position.set(qx,qh+T/2,0);
        cityGroup.add(qb);
        cityColliders.push({x:qx,z:0,hw:T/2,hd:T/2,h:T,y:qh});
    }
    // Pipes
    var pipes=[[18,3],[40,4],[70,3],[90,5]];
    for(var ppi=0;ppi<pipes.length;ppi++){
        var ppx=pipes[ppi][0]*T,pph=pipes[ppi][1]*T;
        var pipe=new THREE.Mesh(new THREE.CylinderGeometry(T*0.8,T*0.8,pph,12),toon(0x33AA33));
        pipe.position.set(ppx,pph/2,0);
        cityGroup.add(pipe);
        // Pipe top rim
        var rim=new THREE.Mesh(new THREE.CylinderGeometry(T*1.0,T*1.0,T*0.4,12),toon(0x44CC44));
        rim.position.set(ppx,pph+T*0.2,0);
        cityGroup.add(rim);
        cityColliders.push({x:ppx,z:0,hw:T*0.8,hd:T*0.8,h:pph,y:0});
    }
    // Staircase near end
    for(var si=0;si<8;si++){
        var step=new THREE.Mesh(new THREE.BoxGeometry(T,T*(si+1),T*3),toon(0x8B5E3C));
        step.position.set((levelLen-15+si)*T,T*(si+1)/2,0);
        cityGroup.add(step);
        cityColliders.push({x:(levelLen-15+si)*T,z:0,hw:T/2,hd:T*1.5,h:T*(si+1),y:0});
    }
    // Castle at end
    var castleW=T*6,castleH=T*5;
    var castle=new THREE.Mesh(new THREE.BoxGeometry(castleW,castleH,T*4),toon(0xAA8866));
    castle.position.set((levelLen-4)*T,castleH/2,0);
    cityGroup.add(castle);
    // Castle door
    var door=new THREE.Mesh(new THREE.BoxGeometry(T*1.5,T*2.5,T*0.5),toon(0x442200));
    door.position.set((levelLen-4)*T,T*1.25,T*2);
    cityGroup.add(door);
    // Flag pole
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,T*8,6),toon(0x888888));
    pole.position.set((levelLen-10)*T,T*4,0);
    cityGroup.add(pole);
    var flag=new THREE.Mesh(new THREE.PlaneGeometry(T*2,T),new THREE.MeshBasicMaterial({color:0xFF4444,side:THREE.DoubleSide}));
    flag.position.set((levelLen-10)*T+T,T*7,0);
    cityGroup.add(flag);
    // Sky background
    var skyGeo=new THREE.PlaneGeometry(levelW+100,200);
    var skyMat=new THREE.MeshBasicMaterial({color:0x87CEEB,side:THREE.DoubleSide});
    var sky=new THREE.Mesh(skyGeo,skyMat);
    sky.position.set(levelW/2,50,-T*8);
    cityGroup.add(sky);
    // Spawn NPCs as companions
    for(var ni=0;ni<4;ni++){
        var npcColor=[0xFF8844,0x44AAFF,0xFFDD44,0xFF44AA][ni];
        var npc=createEgg(ni*3-4,0,npcColor,0xFFCC00,false,scene,'egg');
        npc.mesh.position.set(ni*3-4,1,-3+ni*1.5);
        cityNPCs.push(npc);allEggs.push(npc);
    }
    scene.add(cityGroup);
}

// Called every frame when platformer is active — override camera to side view
function _pfUpdateCamera(){
    if(!_pfActive||!playerEgg)return;
    // Lock Z position for all eggs (side-scrolling)
    playerEgg.mesh.position.z=Math.max(-6,Math.min(6,playerEgg.mesh.position.z));
    playerEgg.vz*=0.5; // dampen Z movement
    for(var i=0;i<allEggs.length;i++){
        allEggs[i].mesh.position.z=Math.max(-6,Math.min(6,allEggs[i].mesh.position.z));
        allEggs[i].vz*=0.5;
    }
    // Side-view camera
    var px=playerEgg.mesh.position.x;
    var py=Math.max(playerEgg.mesh.position.y+5,8);
    camera.position.x+=(px-camera.position.x)*0.08;
    camera.position.y+=(py-camera.position.y)*0.08;
    camera.position.z=40;
    camera.lookAt(new THREE.Vector3(camera.position.x,camera.position.y-3,0));
}

function _pfEndGame(won){
    _pfActive=false;
    currentCityStyle=_pfSavedCity>=0?_pfSavedCity:0;
    gameState='city';
    if(typeof switchCity==='function')switchCity(currentCityStyle);
}
