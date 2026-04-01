// city.js — DANBO World
// ============================================================
//  CITY BUILDER
// ============================================================
const cityGroup = new THREE.Group();
scene.add(cityGroup);
const cityNPCs = []; // wandering AI eggs in city
const portals = [];  // {mesh, glow, name, desc, raceIndex, x, z}
const cityColliders = []; // {x,z,hw,hd} boxes for buildings
const cityBuildingMeshes = []; // all meshes per building [{body,roof,windows,door}]
const cityCoins = []; // {mesh, collected}
const cityProps = []; // {group, x, z, radius, type, grabbed, origY}

const CITY_SIZE = CITY_CONFIG.size;
var currentCityStyle=0;
var _prevCityStyle=0; // track previous city for earth return
var CITY_STYLES=[
    {name:'\uD83C\uDFD9\uFE0F \u5E0C\u671B\u4E4B\u57CE',ground:0x55AA88,path:0xBBCCAA,sky:0x87CEEB,bColors:[0xFF8888,0x88BBFF,0xFFDD66,0xAADD88,0xDDAA88,0xBB99DD,0xFF99CC,0x88DDCC],roof:0xDD6644,tree:0x44BB44,fog:null},
    {name:'🏜️ 沙漠城',ground:0xDDCC88,path:0xCCBB77,sky:0xFFCC66,bColors:[0xDDAA66,0xCC9955,0xEEBB77,0xBB8844,0xDDCC88,0xCCAA55,0xEECC99,0xBB9966],roof:0xAA6633,tree:0x88AA44,fog:0xFFEECC},
    {name:'❄️ 冰雪城',ground:0xDDEEFF,path:0xBBCCDD,sky:0xAABBDD,bColors:[0xAADDFF,0x88BBEE,0xCCEEFF,0x99CCEE,0xBBDDFF,0x77AADD,0xDDEEFF,0xAABBCC],roof:0x6699BB,tree:0x88CCAA,fog:0xCCDDEE},
    {name:'🔥 熔岩城',ground:0x443322,path:0x554433,sky:0x331111,bColors:[0x884422,0x663311,0xAA5533,0x774422,0x995544,0x553311,0xBB6644,0x664422],roof:0x442211,tree:0x556633,fog:0x221100},
    {name:'🍬 糖果城',ground:0xFFBBDD,path:0xFFDDEE,sky:0xFFCCEE,bColors:[0xFF88BB,0xBB88FF,0xFFBB88,0x88FFBB,0xFF88FF,0xFFFF88,0x88BBFF,0xFFAA88],roof:0xDD66AA,tree:0xFF88CC,fog:null},
    {name:'\uD83C\uDF19 \u6708\u9762\u90FD\u5E02',ground:0x888899,path:0xAAAABB,sky:0x0A0015,bColors:[0x9999AA,0x7777AA,0xBBBBCC,0x8888AA,0xAAAABB,0x6666AA,0xCCCCDD,0x9999BB],roof:0x6666AA,tree:0x99AACC,fog:null},
    {name:'\uD83C\uDF38 \u6A31\u4E4B\u56FD',ground:0xDDCCBB,path:0xBBAA99,sky:0x7BC8F6,bColors:[0xCC8888,0xEEBBAA,0xDDAA99,0xCCBBAA,0xDDCCBB,0xBB9988,0xEECCBB,0xDDBBAA],roof:0x884444,tree:0xFFAABB,fog:null}
];
// Warp pipe definitions: 4 pipes at city edges
var WARP_PIPES=[
    {x:0,z:-65,targetStyle:1,rot:0,label:'🏜️ 沙漠'},
    {x:65,z:0,targetStyle:2,rot:-Math.PI/2,label:'❄️ 冰雪'},
    {x:0,z:65,targetStyle:3,rot:Math.PI,label:'🔥 熔岩'},
    {x:-65,z:0,targetStyle:4,rot:Math.PI/2,label:'🍬 糖果'}
];
var warpPipeMeshes=[]; // {group, x, z, targetStyle, entered}
// Apply localized city names
for(var _si=0;_si<CITY_STYLES.length;_si++){CITY_STYLES[_si].name=I18N.cityNames[_langCode][_si]||CITY_STYLES[_si].name;}

function buildCity() {
    var st=CITY_STYLES[currentCityStyle];
    // Ground
    if(currentCityStyle===5){
        // Moon: large flat ground plane
        var moonGroundGeo=new THREE.PlaneGeometry(MOON_CITY_SIZE*2,MOON_CITY_SIZE*2,16,16);
        var moonGround=new THREE.Mesh(moonGroundGeo,toon(st.ground));
        moonGround.rotation.x=-Math.PI/2;moonGround.receiveShadow=true;
        cityGroup.add(moonGround);
        // Subtle surface detail — darker patches on flat ground
        for(var pi=0;pi<15;pi++){
            var ppx=(Math.random()-0.5)*MOON_CITY_SIZE*1.6;
            var ppz=(Math.random()-0.5)*MOON_CITY_SIZE*1.6;
            var pr=8+Math.random()*16;
            var patch=new THREE.Mesh(new THREE.CircleGeometry(pr,16),toon(0x666677));
            patch.rotation.x=-Math.PI/2;
            patch.position.set(ppx,0.02,ppz);
            cityGroup.add(patch);
        }
    } else {
    const groundGeo = new THREE.PlaneGeometry(CITY_SIZE*2, CITY_SIZE*2, 16, 16);
    const ground = new THREE.Mesh(groundGeo, toon(st.ground));
    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true;
    cityGroup.add(ground);
    }

    // Paths (not on moon) — organized grid street system
    if(currentCityStyle!==5&&currentCityStyle!==6){
    const pathM = toon(st.path);
    // Main cross avenues (wide)
    [{w:CITY_SIZE*2,d:8,x:0,z:0},{w:8,d:CITY_SIZE*2,x:0,z:0},
    // Inner ring road (radius ~45)
     {w:90,d:6,x:0,z:45},{w:90,d:6,x:0,z:-45},{w:6,d:90,x:45,z:0},{w:6,d:90,x:-45,z:0},
    // Outer ring road (radius ~100)
     {w:200,d:5,x:0,z:100},{w:200,d:5,x:0,z:-100},{w:5,d:200,x:100,z:0},{w:5,d:200,x:-100,z:0},
    // Diagonal boulevards
     {w:4,d:70,x:30,z:30},{w:4,d:70,x:-30,z:-30},{w:70,d:4,x:-30,z:30},{w:70,d:4,x:30,z:-30}
    ].forEach(p=>{
        const path=new THREE.Mesh(new THREE.BoxGeometry(p.w,0.06,p.d),pathM);
        path.position.set(p.x,0.03,p.z); path.receiveShadow=true; cityGroup.add(path);
    });
    }
    // Sakura City: 銀山温泉 — high terrain + deep gorge + ryokan facing river
    if(currentCityStyle===6){
    var _sPathM=toon(0xAA9977);
    var _cliffM=toon(0x665544);
    var _grassM=toon(0x88AA66);
    var _pH=8; // plateau height
    // === Left plateau ===
    var _leftPlat=new THREE.Mesh(new THREE.BoxGeometry(120,_pH,280),_cliffM);
    _leftPlat.position.set(-68,_pH/2,0);_leftPlat.castShadow=true;cityGroup.add(_leftPlat);
    var _leftGrass=new THREE.Mesh(new THREE.BoxGeometry(120,0.3,280),_grassM);
    _leftGrass.position.set(-68,_pH+0.15,0);cityGroup.add(_leftGrass);
    cityColliders.push({x:-68,z:0,hw:60,hd:140,h:_pH});
    // === Right plateau ===
    var _rightPlat=new THREE.Mesh(new THREE.BoxGeometry(120,_pH,280),_cliffM);
    _rightPlat.position.set(68,_pH/2,0);_rightPlat.castShadow=true;cityGroup.add(_rightPlat);
    var _rightGrass=new THREE.Mesh(new THREE.BoxGeometry(120,0.3,280),_grassM);
    _rightGrass.position.set(68,_pH+0.15,0);cityGroup.add(_rightGrass);
    cityColliders.push({x:68,z:0,hw:60,hd:140,h:_pH});
    // === Paths on plateaus ===
    // Paths between trees and ryokan
    var _lpth=new THREE.Mesh(new THREE.BoxGeometry(8,0.06,240),_sPathM);
    _lpth.position.set(-22,_pH+0.03,0);cityGroup.add(_lpth);
    var _rpth=new THREE.Mesh(new THREE.BoxGeometry(8,0.06,240),_sPathM);
    _rpth.position.set(22,_pH+0.03,0);cityGroup.add(_rpth);
    // === Background mountains ===
    var _hillM=toon(0x447744);
    [[-90,0,-60,30,40],[-110,0,50,35,45],[90,0,-50,32,42],[100,0,60,28,35]].forEach(function(hp){
        var hill=new THREE.Mesh(new THREE.ConeGeometry(hp[3],hp[4],6),_hillM);
        hill.position.set(hp[0],hp[4]/2,hp[2]);cityGroup.add(hill);
    });
    }

    // ---- Buildings (not on moon) — organized blocks along streets ----
    if(currentCityStyle!==5){
    const bColors = st.bColors;
    const buildings = [
        // ===== Inner commercial district (tall, near center) =====
        // NE block
        {x:22,z:-22,w:10,d:10,h:16},{x:35,z:-22,w:8,d:10,h:20},{x:22,z:-35,w:10,d:8,h:14},
        // NW block
        {x:-22,z:-22,w:10,d:10,h:18},{x:-35,z:-22,w:8,d:10,h:15},{x:-22,z:-35,w:10,d:8,h:13},
        // SE block
        {x:22,z:22,w:10,d:10,h:17},{x:35,z:22,w:8,d:10,h:14},{x:22,z:35,w:10,d:8,h:19},
        // SW block
        {x:-22,z:22,w:10,d:10,h:15},{x:-35,z:22,w:8,d:10,h:21},{x:-22,z:35,w:10,d:8,h:12},

        // ===== Mid-ring residential (medium height) =====
        // North street
        {x:-25,z:-60,w:12,d:8,h:10},{x:-8,z:-60,w:10,d:8,h:12},{x:10,z:-60,w:10,d:8,h:9},{x:28,z:-60,w:12,d:8,h:11},
        // South street
        {x:-25,z:60,w:12,d:8,h:11},{x:-8,z:60,w:10,d:8,h:9},{x:10,z:60,w:10,d:8,h:13},{x:28,z:60,w:12,d:8,h:10},
        // West street
        {x:-60,z:-25,w:8,d:12,h:12},{x:-60,z:-8,w:8,d:10,h:10},{x:-60,z:10,w:8,d:10,h:14},{x:-60,z:28,w:8,d:12,h:11},
        // East street
        {x:60,z:-25,w:8,d:12,h:11},{x:60,z:-8,w:8,d:10,h:13},{x:60,z:10,w:8,d:10,h:10},{x:60,z:28,w:8,d:12,h:15},

        // ===== Outer suburbs (shorter, spread out) =====
        // NE quarter
        {x:80,z:-60,w:10,d:8,h:8},{x:80,z:-80,w:8,d:10,h:7},{x:60,z:-80,w:10,d:8,h:9},
        // NW quarter
        {x:-80,z:-60,w:10,d:8,h:7},{x:-80,z:-80,w:8,d:10,h:9},{x:-60,z:-80,w:10,d:8,h:8},
        // SE quarter
        {x:80,z:60,w:10,d:8,h:9},{x:80,z:80,w:8,d:10,h:8},{x:60,z:80,w:10,d:8,h:7},
        // SW quarter
        {x:-80,z:60,w:10,d:8,h:8},{x:-80,z:80,w:8,d:10,h:7},{x:-60,z:80,w:10,d:8,h:9},

        // ===== Landmark towers (corners & axis endpoints) =====
        {x:-120,z:-120,w:10,d:10,h:22},{x:120,z:-120,w:10,d:10,h:18},
        {x:-120,z:120,w:10,d:10,h:16},{x:120,z:120,w:10,d:10,h:24},
        {x:-130,z:0,w:8,d:8,h:14},{x:130,z:0,w:8,d:8,h:12},
        {x:0,z:-130,w:8,d:8,h:11},{x:0,z:130,w:8,d:8,h:13},
    ];
    buildings.forEach((b,i)=>{
        // Sakura City: skip ALL default buildings — custom onsen town layout built below
        if(currentCityStyle===6)return;
        const col = bColors[i%bColors.length];
        const bm = new THREE.Mesh(new THREE.BoxGeometry(b.w,b.h,b.d), toon(col));
        bm.position.set(b.x, b.h/2, b.z); bm.castShadow=true; bm.receiveShadow=true;
        cityGroup.add(bm);
        const bMeshes = [bm]; // collect all meshes for this building
        // Roof — Japanese style for Sakura City
        if(currentCityStyle===6){
            // 和式屋根: wide flat overhanging roof (box wider than building)
            var _jrW=b.w*1.4,_jrD=b.d*1.4,_jrH=0.4;
            var jRoof=new THREE.Mesh(new THREE.BoxGeometry(_jrW,_jrH,_jrD),toon(0x333333));
            jRoof.position.set(b.x,b.h+_jrH/2,b.z);jRoof.castShadow=true;cityGroup.add(jRoof);bMeshes.push(jRoof);
            // Slight upward curve at edges (second thinner layer)
            var jRoof2=new THREE.Mesh(new THREE.BoxGeometry(_jrW+1,0.15,_jrD+1),toon(0x444444));
            jRoof2.position.set(b.x,b.h+_jrH+0.08,b.z);cityGroup.add(jRoof2);bMeshes.push(jRoof2);
            // Ridge beam on top
            var jRidge=new THREE.Mesh(new THREE.BoxGeometry(_jrW*0.8,0.2,0.2),toon(0x222222));
            jRidge.position.set(b.x,b.h+_jrH+0.25,b.z);cityGroup.add(jRidge);bMeshes.push(jRidge);
            // Engawa (wooden porch around base)
            var engawa=new THREE.Mesh(new THREE.BoxGeometry(b.w+1.5,0.15,b.d+1.5),toon(0xBB9966));
            engawa.position.set(b.x,0.08,b.z);cityGroup.add(engawa);bMeshes.push(engawa);
        } else {
        const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(b.w,b.d)*BUILDING_CONFIG.roofHeightMul, BUILDING_CONFIG.roofHeight, 4), toon(st.roof));
        roof.position.set(b.x, b.h+BUILDING_CONFIG.roofHeight/2, b.z); roof.rotation.y=Math.PI/4; roof.castShadow=true;
        cityGroup.add(roof); bMeshes.push(roof);
        }
        // Windows — warm shouji for Sakura City, blue glass for others
        const winM = currentCityStyle===6?toon(0xFFEECC,{emissive:0xFFDD88,emissiveIntensity:0.3}):toon(0xAADDFF, {emissive:0x4488AA, emissiveIntensity:0.2});
        for(let wy=2; wy<b.h-1; wy+=BUILDING_CONFIG.windowSpacingY){
            for(let wx=-b.w/2+1.5; wx<b.w/2-1; wx+=BUILDING_CONFIG.windowSpacingX){
                const win=new THREE.Mesh(new THREE.BoxGeometry(BUILDING_CONFIG.windowSize.w,BUILDING_CONFIG.windowSize.h,BUILDING_CONFIG.windowSize.d), winM);
                win.position.set(b.x+wx, wy, b.z+b.d/2+0.05); cityGroup.add(win); bMeshes.push(win);
                const win2=new THREE.Mesh(new THREE.BoxGeometry(BUILDING_CONFIG.windowSize.w,BUILDING_CONFIG.windowSize.h,BUILDING_CONFIG.windowSize.d), winM);
                win2.position.set(b.x+wx, wy, b.z-b.d/2-0.05); cityGroup.add(win2); bMeshes.push(win2);
            }
        }
        // Door
        const door=new THREE.Mesh(new THREE.BoxGeometry(BUILDING_CONFIG.doorSize.w,BUILDING_CONFIG.doorSize.h,BUILDING_CONFIG.doorSize.d), toon(0x885533));
        door.position.set(b.x, BUILDING_CONFIG.doorSize.h/2, b.z+b.d/2+0.07); cityGroup.add(door); bMeshes.push(door);

        cityColliders.push({x:b.x, z:b.z, hw:b.w/2+0.5, hd:b.d/2+0.5, h:b.h, roofR:Math.max(b.w,b.d)*BUILDING_CONFIG.roofHeightMul, roofH:BUILDING_CONFIG.roofHeight});
        cityBuildingMeshes.push({meshes:bMeshes, x:b.x, z:b.z, hw:b.w/2, hd:b.d/2, h:b.h});
    });

    // ---- Trees ----
    var _treeCount=currentCityStyle===6?40:80; // sakura: fewer random trees (river trees are separate)
    for(let i=0;i<_treeCount;i++){
        var tx,tz;
        if(currentCityStyle===6){
            // Sakura: background trees on outer plateau, away from path and buildings
            var _onLeft=Math.random()<0.5;
            tx=_onLeft?(-50-Math.random()*60):(50+Math.random()*60);
            tz=(Math.random()-0.5)*220;
        } else {
            tx=-CITY_SIZE+Math.random()*CITY_SIZE*2;tz=-CITY_SIZE+Math.random()*CITY_SIZE*2;
        }
        let skip=false;
        for(const c of cityColliders){
            if(c.hw>50)continue; // skip huge terrain colliders for tree placement
            if(Math.abs(tx-c.x)<c.hw+2&&Math.abs(tz-c.z)<c.hd+2) skip=true;
        }
        if(Math.abs(tx)<10&&currentCityStyle===6) skip=true; // avoid canyon
        else if(Math.abs(tx)<4&&Math.abs(tz)<4) skip=true;
        if(skip) continue;
        const tg=new THREE.Group(); tg.position.set(tx,currentCityStyle===6?8:0,tz);
        if(currentCityStyle===6){
            // 大樱花树 — tall trunk, wide pink crown, weeping branches (垂樱)
            var _sakH=4+Math.random()*3; // trunk height 4-7
            var _sakR=3+Math.random()*2; // crown radius 3-5
            var sakTrunk=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.4,_sakH,8),toon(0x6B4226));
            sakTrunk.position.y=_sakH/2;sakTrunk.castShadow=true;tg.add(sakTrunk);
            // Main branches (2 angled trunks)
            for(var _bri2=0;_bri2<2;_bri2++){
                var _brA=_bri2*Math.PI+Math.random()*0.5;
                var branch=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.15,_sakH*0.5,4),toon(0x6B4226));
                branch.position.set(Math.cos(_brA)*0.3,_sakH*0.7,Math.sin(_brA)*0.3);
                branch.rotation.z=Math.cos(_brA)*0.5;branch.rotation.x=-Math.sin(_brA)*0.5;
                tg.add(branch);
            }
            // Large pink crown (2 overlapping spheres)
            var _petalColors=[0xFFAABB,0xFFBBCC,0xFFCCDD,0xFF99AA,0xFFDDEE];
            for(var _sci2=0;_sci2<3;_sci2++){
                var _scOff=_sci2*(Math.PI*2/3);
                var _scr=_sakR*(0.7+Math.random()*0.3);
                var sakC=new THREE.Mesh(new THREE.SphereGeometry(_scr,8,6),toon(_petalColors[_sci2%5],{transparent:true,opacity:0.85}));
                sakC.position.set(Math.cos(_scOff)*_sakR*0.3,_sakH+_sakR*0.4+Math.random(),Math.sin(_scOff)*_sakR*0.3);
                sakC.scale.y=0.6;sakC.castShadow=true;tg.add(sakC);
            }
            // 垂樱 Weeping branches — angled cylinders with petal tips
            for(var _wbi=0;_wbi<5;_wbi++){
                var _wbAngle=_wbi*(Math.PI*2/5)+Math.random()*0.5;
                var _wbLen=_sakR*1.2;
                var _wbMesh=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.05,_wbLen,3),toon(0x6B4226));
                _wbMesh.position.set(Math.cos(_wbAngle)*_wbLen*0.4,_sakH-_wbLen*0.3,Math.sin(_wbAngle)*_wbLen*0.4);
                _wbMesh.rotation.z=Math.cos(_wbAngle)*1.0;_wbMesh.rotation.x=-Math.sin(_wbAngle)*1.0;
                tg.add(_wbMesh);
                // Pink petal ball at tip
                var _wpc=new THREE.Mesh(new THREE.SphereGeometry(0.5,4,3),toon(_petalColors[_wbi%5],{transparent:true,opacity:0.8}));
                _wpc.position.set(Math.cos(_wbAngle)*_wbLen*0.7,_sakH-_wbLen*0.6,Math.sin(_wbAngle)*_wbLen*0.7);
                tg.add(_wpc);
            }
        } else {
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(TREE_CONFIG.trunkRadius.min,TREE_CONFIG.trunkRadius.max,TREE_CONFIG.trunkHeight,6),toon(0x8B5E3C));
        trunk.position.y=TREE_CONFIG.trunkHeight/2; trunk.castShadow=true; tg.add(trunk);
        const crown=new THREE.Mesh(new THREE.SphereGeometry(TREE_CONFIG.crownRadius,8,6),toon(st.tree));
        crown.position.y=TREE_CONFIG.trunkHeight+1; crown.scale.y=TREE_CONFIG.crownScaleY; crown.castShadow=true; tg.add(crown);
        }
        cityGroup.add(tg);
        cityProps.push({group:tg, x:tx, z:tz, radius:TREE_CONFIG.collisionRadius, type:'tree', grabbed:false, origY:0, throwVx:0, throwVy:0, throwVz:0, throwTimer:0, weight:TREE_CONFIG.weight});
    }

// ---- Grand Roman Wishing Fountain (Trevi-style) — skip for Sakura City ----
    if(currentCityStyle!==6){
    var stoneM=toon(0xCCBBAA);var stoneD=toon(0xAA9988);var marbleM=toon(0xEEE8DD);
    var waterM=toon(0x44AADD,{transparent:true,opacity:0.55});
    var goldM=toon(0xFFDD44,{emissive:0xFFAA00,emissiveIntensity:0.3});
    // Outer pool — large circular basin
    var poolOuter=new THREE.Mesh(new THREE.TorusGeometry(7,0.8,8,24),stoneM);
    poolOuter.position.y=0.4;poolOuter.rotation.x=Math.PI/2;cityGroup.add(poolOuter);
    // Pool floor
    var poolFloor=new THREE.Mesh(new THREE.CylinderGeometry(6.5,6.5,0.15,24),toon(0x88BBCC));
    poolFloor.position.y=0.08;cityGroup.add(poolFloor);
    // Water surface
    var poolWater=new THREE.Mesh(new THREE.CylinderGeometry(6.2,6.2,0.2,24),waterM);
    poolWater.position.y=0.6;cityGroup.add(poolWater);
    window._fountainPoolWater=poolWater;
    var innerWaterRef=null;
    // Steps around the pool (3 tiers)
    for(var si=0;si<3;si++){
        var stepR=8+si*1.2;var stepH=0.2;
        var step=new THREE.Mesh(new THREE.TorusGeometry(stepR,0.5,6,24),stoneD);
        step.position.y=0.15-si*0.12;step.rotation.x=Math.PI/2;cityGroup.add(step);
    }
    // Inner raised basin (second tier)
    var innerRim=new THREE.Mesh(new THREE.TorusGeometry(3.5,0.5,8,16),marbleM);
    innerRim.position.y=1.2;innerRim.rotation.x=Math.PI/2;cityGroup.add(innerRim);
    var innerFloor=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.2,0.8,16),stoneM);
    innerFloor.position.y=0.8;cityGroup.add(innerFloor);
    var innerWater=new THREE.Mesh(new THREE.CylinderGeometry(3,3,0.15,16),waterM);
    innerWater.position.y=1.35;cityGroup.add(innerWater);
    innerWaterRef=innerWater;
    window._fountainInnerWater=innerWater;
    // Central pillar — ornate column
    var colBase=new THREE.Mesh(new THREE.CylinderGeometry(1,1.2,0.6,8),marbleM);
    colBase.position.y=1.6;cityGroup.add(colBase);
    var colShaft=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.55,4,12),marbleM);
    colShaft.position.y=3.9;cityGroup.add(colShaft);
    // Fluted column grooves (decorative cylinders around shaft)
    for(var fi=0;fi<8;fi++){
        var fa=fi/8*Math.PI*2;
        var groove=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,3.6,4),stoneD);
        groove.position.set(Math.cos(fa)*0.52,3.9,Math.sin(fa)*0.52);cityGroup.add(groove);
    }
    var colCap=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.55,0.5,8),marbleM);
    colCap.position.y=6.1;cityGroup.add(colCap);
    // Top statue — angel/figure holding a shell
    var statueBody=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.5,1.2,8),marbleM);
    statueBody.position.y=7;cityGroup.add(statueBody);
    var statueHead=new THREE.Mesh(new THREE.SphereGeometry(0.3,8,6),marbleM);
    statueHead.position.y=7.8;cityGroup.add(statueHead);
    // Shell/bowl on top that water pours from
    var shell=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,4,0,Math.PI*2,0,Math.PI/2),goldM);
    shell.position.y=8.2;shell.rotation.x=Math.PI;cityGroup.add(shell);
    // 4 lion head spouts around inner basin
    for(var li=0;li<4;li++){
        var la=li/4*Math.PI*2;
        var lx2=Math.cos(la)*3.3,lz2=Math.sin(la)*3.3;
        // Lion head (simplified)
        var lionHead=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.4),stoneD);
        lionHead.position.set(lx2,1.5,lz2);lionHead.lookAt(0,1.5,0);cityGroup.add(lionHead);
        var lionMane=new THREE.Mesh(new THREE.SphereGeometry(0.35,6,4),stoneM);
        lionMane.position.set(lx2,1.6,lz2);cityGroup.add(lionMane);
        // Water jet from lion mouth (static blue cylinder)
        var jetDir={x:-Math.cos(la),z:-Math.sin(la)};
        var jet=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.04,1.5,6),waterM);
        jet.position.set(lx2+jetDir.x*0.8,1.3,lz2+jetDir.z*0.8);
        jet.rotation.z=Math.PI/2*Math.sign(jetDir.x||0.1);
        jet.rotation.x=Math.atan2(jetDir.z,jetDir.x);
        cityGroup.add(jet);
    }
    // 8 small decorative columns around outer rim
    for(var ci2=0;ci2<8;ci2++){
        var ca=ci2/8*Math.PI*2;
        var cx2=Math.cos(ca)*7.5,cz2=Math.sin(ca)*7.5;
        var miniCol=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.18,2,6),marbleM);
        miniCol.position.set(cx2,1,cz2);cityGroup.add(miniCol);
        var miniCap=new THREE.Mesh(new THREE.SphereGeometry(0.22,6,4),stoneM);
        miniCap.position.set(cx2,2.1,cz2);cityGroup.add(miniCap);
    }
    // Scattered gold coins in the water
    for(var gi=0;gi<20;gi++){
        var ga=Math.random()*Math.PI*2;
        var gr=Math.random()*5.5;
        var coin=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.03,8),goldM);
        coin.position.set(Math.cos(ga)*gr,0.55+Math.random()*0.15,Math.sin(ga)*gr);
        coin.rotation.x=Math.PI/2+(Math.random()-0.5)*0.5;
        coin.rotation.z=Math.random()*Math.PI;
        cityGroup.add(coin);
    }
    // Fountain collider — only the inner column, not the pool (player can wade in)
    cityColliders.push({x:0,z:0,hw:1.5,hd:1.5,h:8});

    // ---- Fountain water particle system ----
    var _fwParticles=[];
    var _fwMat=new THREE.MeshBasicMaterial({color:0x66CCFF,transparent:true,opacity:0.6});
    // Central jet particles (spray from top shell)
    for(var fpi=0;fpi<120;fpi++){
        var fp=new THREE.Mesh(new THREE.SphereGeometry(0.25,4,3),_fwMat);
        fp.visible=false;
        cityGroup.add(fp);
        _fwParticles.push({mesh:fp,type:'jet',life:Math.floor(Math.random()*80),maxLife:70+Math.random()*40,
            vx:(Math.random()-0.5)*0.12,vy:0.12+Math.random()*0.08,vz:(Math.random()-0.5)*0.12,
            ox:0,oy:8.2,oz:0});
    }
    // Lion spout particles (4 lions, 20 particles each)
    for(var lli=0;lli<4;lli++){
        var lla=lli/4*Math.PI*2;
        var llx=Math.cos(lla)*3.3,llz=Math.sin(lla)*3.3;
        var jdx=-Math.cos(lla)*0.1,jdz=-Math.sin(lla)*0.1;
        for(var lpi=0;lpi<20;lpi++){
            var lp=new THREE.Mesh(new THREE.SphereGeometry(0.18,4,3),_fwMat);
            lp.visible=false;
            cityGroup.add(lp);
            _fwParticles.push({mesh:lp,type:'lion',life:Math.floor(Math.random()*40),maxLife:40+Math.random()*20,
                vx:jdx+(Math.random()-0.5)*0.03,vy:0.02+Math.random()*0.03,vz:jdz+(Math.random()-0.5)*0.03,
                ox:llx,oy:1.4,oz:llz,_lionAngle:lla});
        }
    }
    // Store reference for animation
    window._fountainParticles=_fwParticles;
    window._fountainSplashParticles=[];
    // Splash particle pool
    var _fsMat=new THREE.MeshBasicMaterial({color:0x88DDFF,transparent:true,opacity:0.7});
    for(var fsi=0;fsi<40;fsi++){
        var fsp=new THREE.Mesh(new THREE.SphereGeometry(0.3,4,3),_fsMat);
        fsp.visible=false;
        cityGroup.add(fsp);
        window._fountainSplashParticles.push({mesh:fsp,life:0,maxLife:0,vx:0,vy:0,vz:0});
    }

    // ---- Streams & Canals (water city style 0) ----
    if(currentCityStyle===0){
        var streamMat=toon(0x44AACC,{transparent:true,opacity:0.5});
        var bankMat=toon(0x88AA77);
        // 4 canals radiating from central fountain to city edges
        var canalDirs=[{dx:1,dz:0},{dx:-1,dz:0},{dx:0,dz:1},{dx:0,dz:-1}];
        for(var cdi=0;cdi<4;cdi++){
            var cd=canalDirs[cdi];
            var cLen=CITY_SIZE*0.9;
            // Water surface
            var cw=cd.dx!==0?cLen:3;var ch=cd.dz!==0?cLen:3;
            var canal=new THREE.Mesh(new THREE.BoxGeometry(cw,0.15,ch),streamMat);
            canal.position.set(cd.dx*cLen/2+cd.dx*8,0.35,cd.dz*cLen/2+cd.dz*8);
            cityGroup.add(canal);
            // Stone banks on both sides
            var bOff=cd.dx!==0?0:1.8;var bOff2=cd.dz!==0?0:1.8;
            var bank1=new THREE.Mesh(new THREE.BoxGeometry(cd.dx!==0?cLen:0.5,0.4,cd.dz!==0?cLen:0.5),bankMat);
            bank1.position.set(cd.dx*cLen/2+cd.dx*8+bOff2,0.2,cd.dz*cLen/2+cd.dz*8+bOff);
            cityGroup.add(bank1);
            var bank2=new THREE.Mesh(new THREE.BoxGeometry(cd.dx!==0?cLen:0.5,0.4,cd.dz!==0?cLen:0.5),bankMat);
            bank2.position.set(cd.dx*cLen/2+cd.dx*8-bOff2,0.2,cd.dz*cLen/2+cd.dz*8-bOff);
            cityGroup.add(bank2);
        }
        // Ring canal around the fountain (inner)
        var ringCanal=new THREE.Mesh(new THREE.TorusGeometry(25,2.5,6,24),streamMat);
        ringCanal.rotation.x=Math.PI/2;ringCanal.position.y=0.3;cityGroup.add(ringCanal);
        var ringBank=new THREE.Mesh(new THREE.TorusGeometry(25,0.4,6,24),bankMat);
        ringBank.rotation.x=Math.PI/2;ringBank.position.y=0.4;cityGroup.add(ringBank);
        // Outer ring canal
        var ringCanal2=new THREE.Mesh(new THREE.TorusGeometry(55,2,6,32),streamMat);
        ringCanal2.rotation.x=Math.PI/2;ringCanal2.position.y=0.28;cityGroup.add(ringCanal2);
        var ringBank2=new THREE.Mesh(new THREE.TorusGeometry(55,0.35,6,32),bankMat);
        ringBank2.rotation.x=Math.PI/2;ringBank2.position.y=0.38;cityGroup.add(ringBank2);
        // Stone bridges over canals (inner ring)
        var bridgeMat=toon(0xCCBBAA);
        for(var bri=0;bri<8;bri++){
            var bra=bri/8*Math.PI*2;var brr=25;
            var brx=Math.cos(bra)*brr,brz=Math.sin(bra)*brr;
            var bridge=new THREE.Mesh(new THREE.BoxGeometry(5,0.4,6),bridgeMat);
            bridge.position.set(brx,0.55,brz);bridge.rotation.y=bra;
            cityGroup.add(bridge);
            // Bridge railings
            var rail1=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.6,6),toon(0xAA9988));
            rail1.position.set(brx+Math.cos(bra+Math.PI/2)*2.2,0.8,brz+Math.sin(bra+Math.PI/2)*2.2);
            rail1.rotation.y=bra;cityGroup.add(rail1);
            var rail2=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.6,6),toon(0xAA9988));
            rail2.position.set(brx-Math.cos(bra+Math.PI/2)*2.2,0.8,brz-Math.sin(bra+Math.PI/2)*2.2);
            rail2.rotation.y=bra;cityGroup.add(rail2);
        }
        // Bridges over outer ring
        for(var bri2=0;bri2<6;bri2++){
            var bra2=bri2/6*Math.PI*2+Math.PI/6;var brr2=55;
            var bridge2=new THREE.Mesh(new THREE.BoxGeometry(5,0.4,5),bridgeMat);
            bridge2.position.set(Math.cos(bra2)*brr2,0.5,Math.sin(bra2)*brr2);
            bridge2.rotation.y=bra2;cityGroup.add(bridge2);
        }
        // Water wheels (Gagharv style)
        window._waterWheels=[];
        for(var wwi=0;wwi<4;wwi++){
            var wwa=wwi/4*Math.PI*2+Math.PI/4;var wwr=25;
            var wwG=new THREE.Group();
            // Wheel
            var wheel=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.3,8,12),toon(0x8B6914));
            wheel.rotation.y=Math.PI/2;wwG.add(wheel);
            // Spokes
            for(var wsi=0;wsi<6;wsi++){
                var wsa=wsi/6*Math.PI*2;
                var spoke=new THREE.Mesh(new THREE.BoxGeometry(0.15,4.5,0.15),toon(0x8B6914));
                spoke.rotation.z=wsa;wwG.add(spoke);
            }
            // Paddles
            for(var wpi=0;wpi<8;wpi++){
                var wpa=wpi/8*Math.PI*2;
                var paddle=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.15,0.4),toon(0x6B4914));
                paddle.position.set(0,Math.sin(wpa)*2.3,Math.cos(wpa)*2.3);
                paddle.rotation.x=wpa;wwG.add(paddle);
            }
            // Support frame
            var frame1=new THREE.Mesh(new THREE.BoxGeometry(0.2,4,0.2),toon(0x665533));
            frame1.position.set(0.5,0,0);wwG.add(frame1);
            var frame2=new THREE.Mesh(new THREE.BoxGeometry(0.2,4,0.2),toon(0x665533));
            frame2.position.set(-0.5,0,0);wwG.add(frame2);
            wwG.position.set(Math.cos(wwa)*wwr,2,Math.sin(wwa)*wwr);
            wwG.rotation.y=wwa;
            cityGroup.add(wwG);
            window._waterWheels.push(wwG);
        }
    }
    // ---- Fish in all water areas (grabbable) ----
    if(currentCityStyle===0){
        window._cityFish=[];
        var fishColors=[0xFF6644,0xFFAA22,0xFFFFFF,0xFF4488,0x44AAFF,0x44DD88,0xFFDD44,0xDD66FF];
        // Spawn fish across fountain pool, inner canal, outer canal
        var _fishSpawns=[];
        // Fountain pool (8 fish)
        for(var _fsi=0;_fsi<8;_fsi++){var _fsa=_fsi/8*Math.PI*2;_fishSpawns.push({x:Math.cos(_fsa)*(1+Math.random()*4),z:Math.sin(_fsa)*(1+Math.random()*4),r:1+Math.random()*4});}
        // Inner ring canal (10 fish)
        for(var _fsi2=0;_fsi2<10;_fsi2++){var _fsa2=_fsi2/10*Math.PI*2;_fishSpawns.push({x:Math.cos(_fsa2)*25,z:Math.sin(_fsa2)*25,r:25});}
        // Outer ring canal (8 fish)
        for(var _fsi3=0;_fsi3<8;_fsi3++){var _fsa3=_fsi3/8*Math.PI*2;_fishSpawns.push({x:Math.cos(_fsa3)*55,z:Math.sin(_fsa3)*55,r:55});}
        // Radial canals (4 fish each direction)
        for(var _fsi4=0;_fsi4<4;_fsi4++){
            var _fcd=[{dx:1,dz:0},{dx:-1,dz:0},{dx:0,dz:1},{dx:0,dz:-1}][_fsi4];
            var _fcDist=15+Math.random()*50;
            _fishSpawns.push({x:_fcd.dx*_fcDist,z:_fcd.dz*_fcDist,r:_fcDist,_canal:true,_canalDir:_fsi4});
        }
        for(var fii=0;fii<_fishSpawns.length;fii++){
            var _fs=_fishSpawns[fii];
            var fishG=new THREE.Group();
            var fc=fishColors[fii%fishColors.length];
            var fishBody=new THREE.Mesh(new THREE.SphereGeometry(0.3,6,4),toon(fc));
            fishBody.scale.set(1,0.5,1.8);fishG.add(fishBody);
            var fishTail=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.4,4),toon(fc));
            fishTail.rotation.x=Math.PI/2;fishTail.position.z=-0.5;fishG.add(fishTail);
            var fishEye=new THREE.Mesh(new THREE.SphereGeometry(0.06,4,3),toon(0x111111));
            fishEye.position.set(0.12,0.08,0.2);fishG.add(fishEye);
            fishG.position.set(_fs.x,0.4,_fs.z);
            fishG.rotation.y=Math.random()*Math.PI*2;
            cityGroup.add(fishG);
            var fish={group:fishG,angle:Math.atan2(_fs.z,_fs.x),radius:_fs.r,speed:0.003+Math.random()*0.005,
                jumpTimer:120+Math.floor(Math.random()*300),jumping:false,jumpVy:0,baseY:0.4,
                grabbed:false,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:3.0,
                _canal:_fs._canal||false,_canalDir:_fs._canalDir||0};
            window._cityFish.push(fish);
            cityProps.push({group:fishG,x:fishG.position.x,z:fishG.position.z,radius:0.5,
                type:'fish',grabbed:false,origY:0.4,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,
                weight:3.0,_fishRef:fish});
        }
    }

    // ---- Lamp posts / Stone lanterns (sakura) ----
    for(let i=0;i<20;i++){
        const lx=(Math.random()-0.5)*CITY_SIZE*1.5, lz=(Math.random()-0.5)*CITY_SIZE*1.5;
        let skip2=false;
        for(const c of cityColliders) if(Math.abs(lx-c.x)<c.hw+1&&Math.abs(lz-c.z)<c.hd+1) skip2=true;
        if(skip2) continue;
        const lg=new THREE.Group(); lg.position.set(lx,0,lz);
        if(currentCityStyle===6){
            // Stone lantern (toro) — shorter, stone pillar with warm lantern head
            var lanBase=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.3,0.6),toon(0x999999));
            lanBase.position.y=0.15;lg.add(lanBase);
            var lanPillar=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,1.5,6),toon(0x999999));
            lanPillar.position.y=1.05;lg.add(lanPillar);
            var lanHead=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.4,0.5),toon(0xFFDD88,{emissive:0xFFDD88,emissiveIntensity:0.4}));
            lanHead.position.y=2.0;lg.add(lanHead);
            var lanRoof=new THREE.Mesh(new THREE.ConeGeometry(0.45,0.3,4),toon(0x777777));
            lanRoof.position.y=2.35;lanRoof.rotation.y=Math.PI/4;lg.add(lanRoof);
        } else {
        const pole=new THREE.Mesh(new THREE.CylinderGeometry(LAMP_CONFIG.poleRadius.top,LAMP_CONFIG.poleRadius.bottom,LAMP_CONFIG.poleHeight,4),toon(0x555555));
        pole.position.y=LAMP_CONFIG.poleHeight/2; lg.add(pole);
        const lamp=new THREE.Mesh(new THREE.SphereGeometry(LAMP_CONFIG.lampRadius,6,4),toon(0xFFEE88,{emissive:0xFFDD44,emissiveIntensity:LAMP_CONFIG.emissiveIntensity}));
        lamp.position.y=LAMP_CONFIG.lampHeight; lg.add(lamp);
        }
        cityGroup.add(lg);
        cityProps.push({group:lg, x:lx, z:lz, radius:0.5, type:'lamp', grabbed:false, origY:0, throwVx:0, throwVy:0, throwVz:0, throwTimer:0, weight:1.5});
    }

    // ---- Benches ----
    for(let i=0;i<12;i++){
        const bx=(Math.random()-0.5)*CITY_SIZE*1.4, bz=(Math.random()-0.5)*CITY_SIZE*1.4;
        let skip3=false;
        for(const c of cityColliders) if(Math.abs(bx-c.x)<c.hw+1.5&&Math.abs(bz-c.z)<c.hd+1.5) skip3=true;
        if(skip3) continue;
        const bg=new THREE.Group(); bg.position.set(bx,0,bz);
        const seat=new THREE.Mesh(new THREE.BoxGeometry(BENCH_CONFIG.seatSize.w,BENCH_CONFIG.seatSize.h,BENCH_CONFIG.seatSize.d),toon(0x8B5E3C));
        seat.position.y=BENCH_CONFIG.seatHeight; bg.add(seat);
        const back=new THREE.Mesh(new THREE.BoxGeometry(BENCH_CONFIG.backSize.w,BENCH_CONFIG.backSize.h,BENCH_CONFIG.backSize.d),toon(0x8B5E3C));
        back.position.y=BENCH_CONFIG.backHeight; back.position.z=-0.25; bg.add(back);
        const leg1=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.5,0.5),toon(0x555555));
        leg1.position.set(-0.8,0.25,0); bg.add(leg1);
        const leg2=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.5,0.5),toon(0x555555));
        leg2.position.set(0.8,0.25,0); bg.add(leg2);
        cityGroup.add(bg);
        cityProps.push({group:bg, x:bx, z:bz, radius:1.2, type:'bench', grabbed:false, origY:0, throwVx:0, throwVy:0, throwVz:0, throwTimer:0, weight:2.5});
    }
    // ---- City Animals: pigeons, rabbits, deer ----
    window._cityAnimals=[];
    // Pigeons (12) — fly and land
    for(var _pi=0;_pi<12;_pi++){
        var pg=new THREE.Group();
        var pbody=new THREE.Mesh(new THREE.SphereGeometry(0.2,6,4),toon(0xAAAAAA));
        pbody.scale.set(1,0.7,1.3);pg.add(pbody);
        var phead=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),toon(0x999999));
        phead.position.set(0,0.15,0.2);pg.add(phead);
        // Eyes
        [-1,1].forEach(function(s){
            var peye=new THREE.Mesh(new THREE.SphereGeometry(0.03,4,3),toon(0xFF6600));
            peye.position.set(s*0.06,0.18,0.28);pg.add(peye);
        });
        // Beak
        var pbeak=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.1,4),toon(0xFFAA44));
        pbeak.position.set(0,0.12,0.32);pbeak.rotation.x=-Math.PI/2;pg.add(pbeak);
        // Wings
        [-1,1].forEach(function(s){
            var pwing=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.03,0.25),toon(0x888888));
            pwing.position.set(s*0.25,0.05,0);pwing.userData._side=s;pg.add(pwing);
        });
        // Tail
        var ptail=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.02,0.15),toon(0x777777));
        ptail.position.set(0,0.02,-0.25);pg.add(ptail);
        var px2=(Math.random()-0.5)*CITY_SIZE*1.2,pz2=(Math.random()-0.5)*CITY_SIZE*1.2;
        var py2=Math.random()*15+3;
        pg.position.set(px2,py2,pz2);
        cityGroup.add(pg);
        window._cityAnimals.push({group:pg,type:'pigeon',x:px2,y:py2,z:pz2,
            vx:(Math.random()-0.5)*0.1,vy:0,vz:(Math.random()-0.5)*0.1,
            state:'fly',stateTimer:120+Math.floor(Math.random()*180),
            flapPhase:Math.random()*Math.PI*2,targetY:py2});
    }
    // Seagulls (8) — white body, gray wing tips, yellow beak, fly higher
    for(var _si2=0;_si2<8;_si2++){
        var sg=new THREE.Group();
        sg.scale.set(1.5,1.5,1.5);
        var sbody=new THREE.Mesh(new THREE.SphereGeometry(0.22,6,4),toon(0xFFFFFF));
        sbody.scale.set(1,0.7,1.4);sg.add(sbody);
        var shead=new THREE.Mesh(new THREE.SphereGeometry(0.13,6,4),toon(0xFFFFFF));
        shead.position.set(0,0.16,0.22);sg.add(shead);
        [-1,1].forEach(function(s){
            var seye=new THREE.Mesh(new THREE.SphereGeometry(0.03,4,3),toon(0x111111));
            seye.position.set(s*0.07,0.19,0.3);sg.add(seye);
        });
        var sbeak=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.12,4),toon(0xFFCC00));
        sbeak.position.set(0,0.12,0.34);sbeak.rotation.x=-Math.PI/2;sg.add(sbeak);
        [-1,1].forEach(function(s){
            var swing=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.03,0.28),toon(0x999999));
            swing.position.set(s*0.28,0.05,0);swing.userData._side=s;sg.add(swing);
        });
        var stail=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.02,0.18),toon(0xCCCCCC));
        stail.position.set(0,0.02,-0.28);sg.add(stail);
        var sx2=(Math.random()-0.5)*CITY_SIZE*1.2,sz2=(Math.random()-0.5)*CITY_SIZE*1.2;
        var sy2=10+Math.random()*15;
        sg.position.set(sx2,sy2,sz2);
        cityGroup.add(sg);
        window._cityAnimals.push({group:sg,type:'seagull',x:sx2,y:sy2,z:sz2,
            vx:(Math.random()-0.5)*0.08,vy:0,vz:(Math.random()-0.5)*0.08,
            state:'fly',stateTimer:200+Math.floor(Math.random()*200),
            flapPhase:Math.random()*Math.PI*2,targetY:sy2,diveTimer:0});
    }
    // Ducks (6) — green head, brown body, near fountain/center
    for(var _dki=0;_dki<6;_dki++){
        var dkg=new THREE.Group();
        var dkbody=new THREE.Mesh(new THREE.SphereGeometry(0.22,6,4),toon(0x8B6914));
        dkbody.scale.set(0.8,0.7,1.3);dkbody.position.y=0.15;dkg.add(dkbody);
        var dkhead=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),toon(0x006633));
        dkhead.position.set(0,0.3,0.2);dkg.add(dkhead);
        [-1,1].forEach(function(s){
            var dkeye=new THREE.Mesh(new THREE.SphereGeometry(0.025,4,3),toon(0x111111));
            dkeye.position.set(s*0.06,0.33,0.28);dkg.add(dkeye);
        });
        var dkbeak=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.1,4),toon(0xFF8800));
        dkbeak.position.set(0,0.26,0.32);dkbeak.rotation.x=-Math.PI/2;dkg.add(dkbeak);
        [-1,1].forEach(function(s){
            var dkwing=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.03,0.2),toon(0x7A5B10));
            dkwing.position.set(s*0.2,0.18,0);dkwing.userData._side=s;dkg.add(dkwing);
        });
        var dktail=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.06,0.12),toon(0x8B6914));
        dktail.position.set(0,0.18,-0.28);dktail.rotation.x=0.3;dkg.add(dktail);
        [-1,1].forEach(function(s){
            var dkfoot=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.02,0.1),toon(0xFF6600));
            dkfoot.position.set(s*0.08,0.02,0.05);dkg.add(dkfoot);
        });
        var dkx=(Math.random()-0.5)*30,dkz=(Math.random()-0.5)*30;
        dkg.position.set(dkx,0.3,dkz);
        cityGroup.add(dkg);
        var _dkAnimal={group:dkg,type:'duck',x:dkx,y:0.3,z:dkz,
            vx:0,vy:0,vz:0,state:'swim',stateTimer:80+Math.floor(Math.random()*120),
            waddlePhase:Math.random()*Math.PI*2,moveDir:Math.random()*Math.PI*2};
        window._cityAnimals.push(_dkAnimal);
        var _dkProp={group:dkg,x:dkx,z:dkz,radius:0.6,type:'duck',grabbed:false,origY:0.3,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:0.4,_animal:_dkAnimal};
        _dkAnimal._propRef=_dkProp;
        cityProps.push(_dkProp);
    }
    // Eagles (3) — dark brown, large wingspan, fly very high
    for(var _ei2=0;_ei2<3;_ei2++){
        var eg=new THREE.Group();
        eg.scale.set(2.5,2.5,2.5);
        var ebody=new THREE.Mesh(new THREE.SphereGeometry(0.25,6,4),toon(0x3B2210));
        ebody.scale.set(1,0.6,1.5);eg.add(ebody);
        var ehead=new THREE.Mesh(new THREE.SphereGeometry(0.14,6,4),toon(0x3B2210));
        ehead.position.set(0,0.14,0.3);eg.add(ehead);
        [-1,1].forEach(function(s){
            var eeye=new THREE.Mesh(new THREE.SphereGeometry(0.03,4,3),toon(0xFFDD00));
            eeye.position.set(s*0.07,0.17,0.38);eg.add(eeye);
        });
        var ebeak=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.14,4),toon(0xCCAA00));
        ebeak.position.set(0,0.1,0.42);ebeak.rotation.x=-Math.PI/2;eg.add(ebeak);
        [-1,1].forEach(function(s){
            var ewing=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.03,0.3),toon(0x4A3018));
            ewing.position.set(s*0.4,0.02,0);ewing.userData._side=s;eg.add(ewing);
        });
        var etail=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.03,0.2),toon(0x3B2210));
        etail.position.set(0,0,-0.35);eg.add(etail);
        var ex2=(Math.random()-0.5)*CITY_SIZE*1.5,ez2=(Math.random()-0.5)*CITY_SIZE*1.5;
        var ey2=20+Math.random()*20;
        eg.position.set(ex2,ey2,ez2);
        cityGroup.add(eg);
        window._cityAnimals.push({group:eg,type:'eagle',x:ex2,y:ey2,z:ez2,
            vx:(Math.random()-0.5)*0.04,vy:0,vz:(Math.random()-0.5)*0.04,
            state:'soar',stateTimer:9999,
            flapPhase:Math.random()*Math.PI*2,targetY:ey2,circleAngle:Math.random()*Math.PI*2});
    }
    // Crows (5) — all black, perch on buildings
    for(var _ci2=0;_ci2<5;_ci2++){
        var cg=new THREE.Group();
        cg.scale.set(0.8,0.8,0.8);
        var cbody=new THREE.Mesh(new THREE.SphereGeometry(0.2,6,4),toon(0x111111));
        cbody.scale.set(1,0.7,1.3);cg.add(cbody);
        var chead=new THREE.Mesh(new THREE.SphereGeometry(0.11,6,4),toon(0x0D0D15));
        chead.position.set(0,0.14,0.2);cg.add(chead);
        [-1,1].forEach(function(s){
            var ceye=new THREE.Mesh(new THREE.SphereGeometry(0.025,4,3),toon(0x222222));
            ceye.position.set(s*0.05,0.17,0.27);cg.add(ceye);
        });
        var cbeak=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.1,4),toon(0x222222));
        cbeak.position.set(0,0.11,0.3);cbeak.rotation.x=-Math.PI/2;cg.add(cbeak);
        [-1,1].forEach(function(s){
            var cwing=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.03,0.22),toon(0x1A0A2E));
            cwing.position.set(s*0.22,0.04,0);cwing.userData._side=s;cg.add(cwing);
        });
        var ctail=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.02,0.15),toon(0x111111));
        ctail.position.set(0,0.01,-0.24);cg.add(ctail);
        // Perch on a random building rooftop
        var crowCol=cityColliders[Math.floor(Math.random()*Math.min(cityColliders.length,20))];
        var cx2=crowCol.x+(Math.random()-0.5)*crowCol.hw*0.5;
        var cz2=crowCol.z+(Math.random()-0.5)*crowCol.hd*0.5;
        var cy2=(crowCol.h||5)+0.3;
        cg.position.set(cx2,cy2,cz2);
        cityGroup.add(cg);
        window._cityAnimals.push({group:cg,type:'crow',x:cx2,y:cy2,z:cz2,
            vx:0,vy:0,vz:0,state:'perch',stateTimer:100+Math.floor(Math.random()*200),
            flapPhase:Math.random()*Math.PI*2,spawnY:cy2,hopPhase:0});
    }
    // Rabbits (8) — hop around on ground, bigger and near center
    for(var _ri2=0;_ri2<8;_ri2++){
        var rg=new THREE.Group();
        rg.scale.set(2,2,2); // 2x bigger for visibility
        var rbody=new THREE.Mesh(new THREE.SphereGeometry(0.25,8,6),toon(0xEEDDCC));
        rbody.scale.set(0.8,0.7,1);rbody.position.y=0.2;rg.add(rbody);
        var rhead=new THREE.Mesh(new THREE.SphereGeometry(0.15,6,4),toon(0xEEDDCC));
        rhead.position.set(0,0.38,0.15);rg.add(rhead);
        // Ears
        [-1,1].forEach(function(s){
            var rear=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.05,0.25,4),toon(0xEEDDCC));
            rear.position.set(s*0.08,0.55,0.1);rear.rotation.z=s*0.15;rg.add(rear);
            var rearIn=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.03,0.2,4),toon(0xFFBBCC));
            rearIn.position.set(s*0.08,0.55,0.12);rearIn.rotation.z=s*0.15;rg.add(rearIn);
        });
        // Eyes + nose
        [-1,1].forEach(function(s){
            var reye=new THREE.Mesh(new THREE.SphereGeometry(0.03,4,3),toon(0x332222));
            reye.position.set(s*0.07,0.4,0.27);rg.add(reye);
        });
        var rnose=new THREE.Mesh(new THREE.SphereGeometry(0.025,4,3),toon(0xFFAAAA));
        rnose.position.set(0,0.35,0.3);rg.add(rnose);
        // Tail puff
        var rtail=new THREE.Mesh(new THREE.SphereGeometry(0.08,6,4),toon(0xFFFFFF));
        rtail.position.set(0,0.2,-0.25);rg.add(rtail);
        var rx3=(Math.random()-0.5)*60+(_ri2<3?(Math.random()-0.5)*20:0),rz3=(Math.random()-0.5)*60+(_ri2<3?(Math.random()-0.5)*20:0);
        rg.position.set(rx3,0,rz3);
        cityGroup.add(rg);
        var _rAnimal={group:rg,type:'rabbit',x:rx3,y:0,z:rz3,
            vx:0,vy:0,vz:0,state:'idle',stateTimer:60+Math.floor(Math.random()*120),
            hopPhase:0,moveDir:Math.random()*Math.PI*2};
        window._cityAnimals.push(_rAnimal);
        var _rProp={group:rg,x:rx3,z:rz3,radius:0.8,type:'rabbit',grabbed:false,origY:0,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:0.5,_animal:_rAnimal};
        _rAnimal._propRef=_rProp;
        cityProps.push(_rProp);
    }
    // Deer (6) — graceful walking, bigger
    for(var _di2=0;_di2<6;_di2++){
        var dg=new THREE.Group();
        dg.scale.set(1.8,1.8,1.8);
        var dbody=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,6),toon(0xCC9966));
        dbody.scale.set(0.7,0.6,1.2);dbody.position.y=0.7;dg.add(dbody);
        // White belly
        var dbelly=new THREE.Mesh(new THREE.SphereGeometry(0.3,6,4),toon(0xFFEEDD));
        dbelly.scale.set(0.6,0.4,1);dbelly.position.set(0,0.6,0);dg.add(dbelly);
        // Head
        var dhead=new THREE.Mesh(new THREE.SphereGeometry(0.18,6,4),toon(0xCC9966));
        dhead.position.set(0,1.0,0.4);dg.add(dhead);
        // Ears
        [-1,1].forEach(function(s){
            var dear=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.15,4),toon(0xCC9966));
            dear.position.set(s*0.12,1.15,0.35);dear.rotation.z=s*0.4;dg.add(dear);
        });
        // Eyes
        [-1,1].forEach(function(s){
            var deye=new THREE.Mesh(new THREE.SphereGeometry(0.04,4,3),toon(0x332222));
            deye.position.set(s*0.08,1.02,0.55);dg.add(deye);
        });
        // Nose
        var dnose=new THREE.Mesh(new THREE.SphereGeometry(0.03,4,3),toon(0x333333));
        dnose.position.set(0,0.95,0.58);dg.add(dnose);
        // Antlers (small)
        [-1,1].forEach(function(s){
            var antler=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.03,0.3,4),toon(0x886644));
            antler.position.set(s*0.1,1.25,0.35);antler.rotation.z=s*0.3;dg.add(antler);
            var antlerTip=new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.02,0.15,4),toon(0x886644));
            antlerTip.position.set(s*0.18,1.35,0.35);antlerTip.rotation.z=s*0.8;dg.add(antlerTip);
        });
        // Legs (4)
        [{x:-0.12,z:0.25},{x:0.12,z:0.25},{x:-0.12,z:-0.25},{x:0.12,z:-0.25}].forEach(function(lp){
            var dleg=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.035,0.55,4),toon(0xBB8855));
            dleg.position.set(lp.x,0.28,lp.z);dg.add(dleg);
            var dhoof=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.04,0.06,4),toon(0x444444));
            dhoof.position.set(lp.x,0.03,lp.z);dg.add(dhoof);
        });
        // Tail
        var dtail=new THREE.Mesh(new THREE.SphereGeometry(0.06,4,3),toon(0xFFFFFF));
        dtail.position.set(0,0.75,-0.5);dg.add(dtail);
        // White spots
        for(var _dsi=0;_dsi<5;_dsi++){
            var dspot=new THREE.Mesh(new THREE.SphereGeometry(0.04,4,3),toon(0xFFEEDD));
            dspot.position.set((Math.random()-0.5)*0.3,0.6+Math.random()*0.3,(Math.random()-0.5)*0.4);
            dg.add(dspot);
        }
        var dx3=(Math.random()-0.5)*80,dz3=(Math.random()-0.5)*80;
        dg.position.set(dx3,0,dz3);
        cityGroup.add(dg);
        var _dAnimal={group:dg,type:'deer',x:dx3,y:0,z:dz3,
            vx:0,vy:0,vz:0,state:'walk',stateTimer:120+Math.floor(Math.random()*180),
            walkPhase:0,moveDir:Math.random()*Math.PI*2};
        window._cityAnimals.push(_dAnimal);
        var _dProp={group:dg,x:dx3,z:dz3,radius:1.2,type:'deer',grabbed:false,origY:0,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:1.0,_animal:_dAnimal};
        _dAnimal._propRef=_dProp;
        cityProps.push(_dProp);
    }
    // ---- Ocean with waves (below city ground, waves must NOT reach y=0) ----
    var oceanGeo = new THREE.PlaneGeometry(CITY_SIZE*8, CITY_SIZE*8, 40, 40);
    var oceanMat = toon(0x2266AA, {transparent:true, opacity:0.7});
    var ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI/2;
    ocean.position.y = -4;
    window._oceanMesh = ocean;
    // Wave foam rings at different radii
    var _waveRings=[];
    for(var _wri=0;_wri<4;_wri++){
        var wr=CITY_SIZE+10+_wri*40;
        var wring=new THREE.Mesh(new THREE.TorusGeometry(wr,0.8,4,48),
            toon(0xAADDFF,{transparent:true,opacity:0.3+_wri*0.05}));
        wring.rotation.x=Math.PI/2;wring.position.y=-3.5;
        cityGroup.add(wring);_waveRings.push(wring);
    }
    window._waveRings=_waveRings;
    cityGroup.add(ocean);
    // ---- Boats (6) — on the ocean beyond city bounds ----
    var _boatColors=[0xCC3333,0x3366CC,0xFFCC00,0x33AA55,0xFF6600,0x9933CC];
    for(var _bi2=0;_bi2<6;_bi2++){
        var boatAngle=(_bi2/6)*Math.PI*2+Math.random()*0.5;
        var boatDist=180+Math.random()*170;
        var bx2=Math.cos(boatAngle)*boatDist,bz2=Math.sin(boatAngle)*boatDist;
        var btg=new THREE.Group();
        // Hull
        var hull=new THREE.Mesh(new THREE.BoxGeometry(2,0.6,5),toon(_boatColors[_bi2]));
        hull.scale.set(1,0.6,1);hull.position.y=0;btg.add(hull);
        // Cabin
        var cabin=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.8,1.5),toon(0xEEDDCC));
        cabin.position.set(0,0.6,-0.5);btg.add(cabin);
        // Mast
        var mast=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,3,4),toon(0x886644));
        mast.position.set(0,1.8,0.5);btg.add(mast);
        // Flag
        var flag=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.4,0.03),toon(0xFF4444));
        flag.position.set(0.4,3.0,0.5);btg.add(flag);
        btg.position.set(bx2,-3.5,bz2);
        btg.rotation.y=boatAngle+Math.PI/2;
        cityGroup.add(btg);
        window._cityAnimals.push({group:btg,type:'boat',x:bx2,y:-3.5,z:bz2,
            vx:0,vy:0,vz:0,state:'drift',stateTimer:9999,
            circleAngle:boatAngle,circleDist:boatDist,rockPhase:Math.random()*Math.PI*2});
    }
    // ---- Flying Fish (10) — on the ocean ----
    for(var _fi2=0;_fi2<10;_fi2++){
        var ffAngle=Math.random()*Math.PI*2;
        var ffDist=180+Math.random()*170;
        var ffx=Math.cos(ffAngle)*ffDist,ffz=Math.sin(ffAngle)*ffDist;
        var ffg=new THREE.Group();
        // Body
        var ffbody=new THREE.Mesh(new THREE.SphereGeometry(0.15,6,4),toon(0x6699CC));
        ffbody.scale.set(0.5,0.4,1.5);ffg.add(ffbody);
        // Tail fin
        var fftail=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.12,0.12),toon(0x4477AA));
        fftail.position.set(0,0.02,-0.22);fftail.rotation.x=0.2;ffg.add(fftail);
        // Side fins
        [-1,1].forEach(function(s){
            var ffin=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.02,0.1),toon(0x88BBDD));
            ffin.position.set(s*0.1,0,0.05);ffin.userData._side=s;ffg.add(ffin);
        });
        ffg.position.set(ffx,-3.5,ffz);
        cityGroup.add(ffg);
        window._cityAnimals.push({group:ffg,type:'flyingFish',x:ffx,y:-3.5,z:ffz,
            vx:0,vy:0,vz:0,state:'underwater',stateTimer:30+Math.floor(Math.random()*120),
            jumpPhase:0,moveDir:Math.random()*Math.PI*2,jumpSpeed:0.08+Math.random()*0.04,
            baseX:ffx,baseZ:ffz});
    }
    // (Hidden entrances removed — moon only reachable from cloud world)
    } // end if not Sakura (fountain/canal/waterwheel/fish/lamp/bench/animals)

    // ===============================================================
    //  Sakura City — Ginzan Onsen (銀山温泉)
    // ===============================================================
    if(currentCityStyle===6){try{
        var _jWinM=toon(0xFFDD88,{emissive:0xFFAA44,emissiveIntensity:0.5});
        var _jStoneM=toon(0x888888);
        var _jRedM=toon(0xCC3333);
        var _jDarkRoof=toon(0x333333);
        var _jWoodM=toon(0xBB9966);
        // Helper: build a Japanese building with roof, engawa, windows, collider
        function _buildJpn(x,z,w,d,h,wallColor){
            var col=wallColor||0xDDAA88;
            var body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),toon(col));
            body.position.set(x,h/2,z);body.castShadow=true;body.receiveShadow=true;cityGroup.add(body);
            var ms=[body];
            // Flat overhanging roof
            var rW=w*1.4,rD=d*1.4,rH=0.4;
            var roof=new THREE.Mesh(new THREE.BoxGeometry(rW,rH,rD),_jDarkRoof);
            roof.position.set(x,h+rH/2,z);roof.castShadow=true;cityGroup.add(roof);ms.push(roof);
            var roof2=new THREE.Mesh(new THREE.BoxGeometry(rW+0.8,0.15,rD+0.8),toon(0x444444));
            roof2.position.set(x,h+rH+0.08,z);cityGroup.add(roof2);ms.push(roof2);
            // Ridge beam
            var ridge=new THREE.Mesh(new THREE.BoxGeometry(rW*0.7,0.18,0.18),toon(0x222222));
            ridge.position.set(x,h+rH+0.22,z);cityGroup.add(ridge);ms.push(ridge);
            // Engawa porch
            var eng=new THREE.Mesh(new THREE.BoxGeometry(w+1.2,0.12,d+1.2),_jWoodM);
            eng.position.set(x,0.06,z);cityGroup.add(eng);ms.push(eng);
            // Warm shouji windows
            for(var wy=1.5;wy<h-0.5;wy+=2){
                for(var wx=-w/2+1.2;wx<w/2-0.8;wx+=2){
                    var wn=new THREE.Mesh(new THREE.BoxGeometry(0.8,1.2,0.15),_jWinM);
                    wn.position.set(x+wx,wy,z+d/2+0.08);cityGroup.add(wn);ms.push(wn);
                    var wn2=new THREE.Mesh(new THREE.BoxGeometry(0.8,1.2,0.15),_jWinM);
                    wn2.position.set(x+wx,wy,z-d/2-0.08);cityGroup.add(wn2);ms.push(wn2);
                }
            }
            // Noren curtain (door)
            var noren=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,0.1),toon(0x884433));
            noren.position.set(x,1,z+d/2+0.1);cityGroup.add(noren);ms.push(noren);
            cityColliders.push({x:x,z:z,hw:w/2+0.5,hd:d/2+0.5,h:h});
            cityBuildingMeshes.push({meshes:ms,x:x,z:z,hw:w/2,hd:d/2,h:h});
        }
        // Helper: elevated Japanese building (on plateau)
        function _buildJpnElev(x,z,w,d,h,wallColor,baseY,faceDir){
            // faceDir: 1=face +x (left bank), -1=face -x (right bank), 0/undefined=face +z
            var col=wallColor||0xDDAA88;
            var body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),toon(col));
            body.position.set(x,baseY+h/2,z);body.castShadow=true;body.receiveShadow=true;cityGroup.add(body);
            var ms=[body];
            var rW=w*1.4,rD=d*1.4,rH=0.4;
            var roof=new THREE.Mesh(new THREE.BoxGeometry(rW,rH,rD),_jDarkRoof);
            roof.position.set(x,baseY+h+rH/2,z);roof.castShadow=true;cityGroup.add(roof);ms.push(roof);
            var roof2=new THREE.Mesh(new THREE.BoxGeometry(rW+0.8,0.15,rD+0.8),toon(0x444444));
            roof2.position.set(x,baseY+h+rH+0.08,z);cityGroup.add(roof2);ms.push(roof2);
            var ridge=new THREE.Mesh(new THREE.BoxGeometry(faceDir?0.18:rW*0.7,0.18,faceDir?rD*0.7:0.18),toon(0x222222));
            ridge.position.set(x,baseY+h+rH+0.22,z);cityGroup.add(ridge);ms.push(ridge);
            var eng=new THREE.Mesh(new THREE.BoxGeometry(w+1.2,0.12,d+1.2),_jWoodM);
            eng.position.set(x,baseY+0.06,z);cityGroup.add(eng);ms.push(eng);
            // Windows face the river (X axis) or default (Z axis)
            if(faceDir){
                var _fSide=faceDir>0?1:-1; // which X side has windows
                for(var wy=1.5;wy<h-0.5;wy+=2){
                    for(var wz=-d/2+1.2;wz<d/2-0.8;wz+=2){
                        // River-facing windows (bright, many)
                        var wn=new THREE.Mesh(new THREE.BoxGeometry(0.15,1.2,0.8),_jWinM);
                        wn.position.set(x+_fSide*(w/2+0.08),baseY+wy,z+wz);cityGroup.add(wn);ms.push(wn);
                        // Back windows (fewer)
                        if(Math.random()>0.5){
                            var wn2=new THREE.Mesh(new THREE.BoxGeometry(0.15,1.2,0.8),_jWinM);
                            wn2.position.set(x-_fSide*(w/2+0.08),baseY+wy,z+wz);cityGroup.add(wn2);ms.push(wn2);
                        }
                    }
                }
                // Noren on river side
                var noren=new THREE.Mesh(new THREE.BoxGeometry(0.1,2,1.5),toon(0x884433));
                noren.position.set(x+_fSide*(w/2+0.1),baseY+1,z);cityGroup.add(noren);ms.push(noren);
            } else {
                for(var wy2=1.5;wy2<h-0.5;wy2+=2){
                    for(var wx=-w/2+1.2;wx<w/2-0.8;wx+=2){
                        var wn3=new THREE.Mesh(new THREE.BoxGeometry(0.8,1.2,0.15),_jWinM);
                        wn3.position.set(x+wx,baseY+wy2,z+d/2+0.08);cityGroup.add(wn3);ms.push(wn3);
                        var wn4=new THREE.Mesh(new THREE.BoxGeometry(0.8,1.2,0.15),_jWinM);
                        wn4.position.set(x+wx,baseY+wy2,z-d/2-0.08);cityGroup.add(wn4);ms.push(wn4);
                    }
                }
                var noren2=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,0.1),toon(0x884433));
                noren2.position.set(x,baseY+1,z+d/2+0.1);cityGroup.add(noren2);ms.push(noren2);
            }
            cityColliders.push({x:x,z:z,hw:w/2+0.5,hd:d/2+0.5,h:baseY+h,y:baseY});
            cityBuildingMeshes.push({meshes:ms,x:x,z:z,hw:w/2,hd:d/2,h:baseY+h});
        }
        // Helper: stone lantern (toro), optionally elevated
        function _buildToro(x,z,elev){
            var _ty=elev||0;
            var tg=new THREE.Group();tg.position.set(x,_ty,z);
            tg.add(new THREE.Mesh(new THREE.BoxGeometry(0.5,0.25,0.5),_jStoneM));tg.children[0].position.y=0.12;
            tg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,1.4,6),_jStoneM));tg.children[1].position.y=0.95;
            tg.add(new THREE.Mesh(new THREE.BoxGeometry(0.45,0.35,0.45),toon(0xFFDD88,{emissive:0xFFDD88,emissiveIntensity:0.5})));tg.children[2].position.y=1.85;
            tg.add(new THREE.Mesh(new THREE.ConeGeometry(0.4,0.3,4),_jStoneM));tg.children[3].position.y=2.2;tg.children[3].rotation.y=Math.PI/4;
            cityGroup.add(tg);
        }

        // === 1. Tall ryokan set back from gorge (河辺→垂桜→道→旅館) ===
        // Layout: gorge edge x=±8 → sakura trees x=±12 → path x=±18 → ryokan x=±35
        var _leftBlds=[],_rightBlds=[];
        // Japanese onsen hotel colors — warm wood tones, each building unique
        var _ryokanColors=[0xC49A6C,0xA67B4B,0xD4A96A,0x8B7355,0xBB9060,0x9E8258,0xCBA26E,0xB08B57,
                           0xD9B675,0xA88B5E,0xC4985A,0x9A7C50,0xDDAA70,0xB89462,0xAF8648,0xC89E68];
        for(var _lbi=0;_lbi<16;_lbi++){
            var _lbz=-110+_lbi*14;
            var _lbh=10+Math.floor(Math.random()*8);
            var _lbw=8+Math.floor(Math.random()*4); // varied width
            _leftBlds.push({x:-30,z:_lbz,w:_lbw,d:13,h:_lbh,c:_ryokanColors[_lbi],face:1});
        }
        for(var _rbi=0;_rbi<16;_rbi++){
            var _rbz=-103+_rbi*14;
            var _rbh=10+Math.floor(Math.random()*8);
            var _rbw=8+Math.floor(Math.random()*4);
            _rightBlds.push({x:30,z:_rbz,w:_rbw,d:13,h:_rbh,c:_ryokanColors[15-_rbi],face:-1});
        }
        // Riverside weeping sakura (垂桜) — one row per side, staggered, leaning over gorge
        for(var _rsti=0;_rsti<14;_rsti++){
            var _rstZ=-100+_rsti*15+((_rsti%2)*7); // staggered positions
            [[-11,0.3],[11,-0.3]].forEach(function(sxr){ // x pos + lean angle toward river
                var sx=sxr[0],_lean=sxr[1];
                var _rstG=new THREE.Group();_rstG.position.set(sx,_pH,_rstZ);
                _rstG.rotation.z=_lean; // lean toward river
                var _rstH=5+Math.random()*2;
                var rstTrunk=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.35,_rstH,6),toon(0x6B4226));
                rstTrunk.position.y=_rstH/2;_rstG.add(rstTrunk);
                var _rstCols=[0xFFAABB,0xFFBBCC,0xFFCCDD];
                for(var _rsci=0;_rsci<3;_rsci++){
                    var _rscr=2+Math.random()*1.5;
                    var _rscOff=_rsci*(Math.PI*2/3);
                    var sakC=new THREE.Mesh(new THREE.SphereGeometry(_rscr,6,5),toon(_rstCols[_rsci],{transparent:true,opacity:0.85}));
                    sakC.position.set(Math.cos(_rscOff)*_rscr*0.3,_rstH+_rscr*0.3,Math.sin(_rscOff)*_rscr*0.3);
                    sakC.scale.y=0.6;_rstG.add(sakC);
                }
                // Weeping branches (垂樱) — long drooping branches with petal clusters
                for(var _wbi2=0;_wbi2<7;_wbi2++){
                    var _wbA=_wbi2*(Math.PI*2/7)+Math.random()*0.3;
                    var _wbL=3+Math.random()*2; // longer branches
                    var _wbM=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.05,_wbL,3),toon(0x6B4226));
                    _wbM.position.set(Math.cos(_wbA)*_wbL*0.35,_rstH-_wbL*0.35,Math.sin(_wbA)*_wbL*0.35);
                    _wbM.rotation.z=Math.cos(_wbA)*1.0;_wbM.rotation.x=-Math.sin(_wbA)*1.0;_rstG.add(_wbM);
                    // Multiple petal clusters along each branch
                    for(var _wpc2=0;_wpc2<3;_wpc2++){
                        var _wpD=0.3+_wpc2*0.25;
                        var _wpc=new THREE.Mesh(new THREE.SphereGeometry(0.4+_wpc2*0.15,4,3),toon(_rstCols[(_wbi2+_wpc2)%3],{transparent:true,opacity:0.8}));
                        _wpc.position.set(Math.cos(_wbA)*_wbL*_wpD,_rstH-_wbL*_wpD*0.8,Math.sin(_wbA)*_wbL*_wpD);_rstG.add(_wpc);
                    }
                }
                cityGroup.add(_rstG);
                cityBuildingMeshes.push({meshes:_rstG.children.slice(),x:sx,z:_rstZ,hw:3,hd:3,h:_pH+_rstH});
            });
        }
        var _allJpnB=[].concat(_leftBlds,_rightBlds);
        for(var _jbi=0;_jbi<_allJpnB.length;_jbi++){
            var jb=_allJpnB[_jbi];
            _buildJpnElev(jb.x,jb.z,jb.w,jb.d,jb.h,jb.c,_pH,jb.face||0);
        }

        // === 2. The Bathhouse (油屋) — large building at end of street ===
        var _bhX=-50,_bhZ=-90;
        // Tier 1 — base (on plateau)
        var _by=8;
        var _bh1=new THREE.Mesh(new THREE.BoxGeometry(24,14,20),toon(0x8B2500));
        _bh1.position.set(_bhX,_by+7,_bhZ);_bh1.castShadow=true;cityGroup.add(_bh1);
        cityColliders.push({x:_bhX,z:_bhZ,hw:13,hd:11,h:_by+14});
        var _bhR1=new THREE.Mesh(new THREE.BoxGeometry(26,0.6,22),_jRedM);
        _bhR1.position.set(_bhX,_by+14.3,_bhZ);cityGroup.add(_bhR1);
        var _bh2=new THREE.Mesh(new THREE.BoxGeometry(18,10,14),toon(0x7B1F00));
        _bh2.position.set(_bhX,_by+19,_bhZ);_bh2.castShadow=true;cityGroup.add(_bh2);
        var _bhR2=new THREE.Mesh(new THREE.BoxGeometry(20,0.6,16),_jRedM);
        _bhR2.position.set(_bhX,_by+24.3,_bhZ);cityGroup.add(_bhR2);
        var _bhRoof=new THREE.Mesh(new THREE.ConeGeometry(12,5,4),toon(0x224422));
        _bhRoof.position.set(_bhX,_by+27,_bhZ);_bhRoof.rotation.y=Math.PI/4;_bhRoof.castShadow=true;cityGroup.add(_bhRoof);
        for(var _bwi2=0;_bwi2<6;_bwi2++){
            var _bwx=-10+_bwi2*4;
            var wn1=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,0.2),_jWinM);
            wn1.position.set(_bhX+_bwx,_by+5,_bhZ+10.1);cityGroup.add(wn1);
            var wn1b=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,0.2),_jWinM);
            wn1b.position.set(_bhX+_bwx,_by+10,_bhZ+10.1);cityGroup.add(wn1b);
        }
        for(var _bwi3=0;_bwi3<4;_bwi3++){
            var _bwx2=-6+_bwi3*4;
            var wn2=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,0.2),_jWinM);
            wn2.position.set(_bhX+_bwx2,_by+17,_bhZ+7.1);cityGroup.add(wn2);
            var wn2b=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,0.2),_jWinM);
            wn2b.position.set(_bhX+_bwx2,_by+21,_bhZ+7.1);cityGroup.add(wn2b);
        }
        var _bhLP=[[-13,_by+14.5,10],[-13,_by+14.5,-10],[13,_by+14.5,10],[13,_by+14.5,-10],
                   [-10,_by+24.5,7],[-10,_by+24.5,-7],[10,_by+24.5,7],[10,_by+24.5,-7]];
        for(var _bli2=0;_bli2<_bhLP.length;_bli2++){
            var lp=_bhLP[_bli2];
            var bLan=new THREE.Mesh(new THREE.SphereGeometry(0.6,6,4),toon(0xFF6644,{emissive:0xFF4422,emissiveIntensity:0.6}));
            bLan.position.set(_bhX+lp[0],lp[1],_bhZ+lp[2]);cityGroup.add(bLan);
        }
        // Bathhouse name sign
        var _bhSignC=document.createElement('canvas');_bhSignC.width=256;_bhSignC.height=64;
        var _bhCtx=_bhSignC.getContext('2d');
        _bhCtx.fillStyle='rgba(80,20,0,0.8)';_bhCtx.fillRect(0,0,256,64);
        _bhCtx.fillStyle='#FFD700';_bhCtx.font='bold 40px serif';_bhCtx.textAlign='center';
        _bhCtx.fillText('\u6CB9\u5C4B',128,46);
        var _bhTex=new THREE.CanvasTexture(_bhSignC);
        var _bhSign=new THREE.Sprite(new THREE.SpriteMaterial({map:_bhTex,transparent:true}));
        _bhSign.scale.set(6,1.5,1);_bhSign.position.set(_bhX,_by+16,_bhZ+10.5);cityGroup.add(_bhSign);
        cityBuildingMeshes.push({meshes:[_bh1,_bh2,_bhRoof],x:_bhX,z:_bhZ,hw:13,hd:11,h:_by+14});

        // === 3. Deep gorge river (深い渓流) ===
        window._sakuraCanalWater=[];
        // Deep canyon floor
        var _canyonFloor=new THREE.Mesh(new THREE.BoxGeometry(16,0.3,260),toon(0x334433));
        _canyonFloor.position.set(0,0.15,0);cityGroup.add(_canyonFloor);
        // Prominent stone embankment walls (高い石垣)
        [-1,1].forEach(function(side){
            // Main wall (full height from ground to plateau)
            var _embWall=new THREE.Mesh(new THREE.BoxGeometry(1.5,_pH,260),toon(0x887766));
            _embWall.position.set(side*8,_pH/2,0);_embWall.castShadow=true;cityGroup.add(_embWall);
            // Stone cap on top
            var _embCap=new THREE.Mesh(new THREE.BoxGeometry(2,0.4,260),toon(0x999888));
            _embCap.position.set(side*8,_pH+0.2,0);cityGroup.add(_embCap);
            // Stone texture detail strips
            for(var _esi=0;_esi<6;_esi++){
                var _esY=1+_esi*1.2;
                var _esLine=new THREE.Mesh(new THREE.BoxGeometry(1.55,0.08,260),toon(0x776655));
                _esLine.position.set(side*8,_esY,0);cityGroup.add(_esLine);
            }
        });
        // Water at bottom of gorge (y=2, plateau at y=8, so 6 units deep)
        for(var _rsi2=0;_rsi2<8;_rsi2++){
            var _rz2=-110+_rsi2*28;
            var rSeg=new THREE.Mesh(new THREE.BoxGeometry(14,0.15,30),toon(0x225566,{transparent:true,opacity:0.65}));
            rSeg.position.set(0,2,_rz2);cityGroup.add(rSeg);
            window._sakuraCanalWater.push(rSeg);
        }
        // Rocks in gorge
        for(var _rki=0;_rki<25;_rki++){
            var _rkx=(Math.random()-0.5)*12,_rkz=(Math.random()-0.5)*240;
            var sRock=new THREE.Mesh(new THREE.SphereGeometry(0.4+Math.random()*0.8,5,4),toon(0x667766));
            sRock.position.set(_rkx,0.3+Math.random()*1.5,_rkz);sRock.scale.set(1,0.6,1);cityGroup.add(sRock);
        }

        // === 4. Big bridges spanning gorge at plateau height ===
        // Wooden bridges (wide, at y=8)
        var _woodBridgeZs=[-60,0,60];
        for(var _wbi=0;_wbi<_woodBridgeZs.length;_wbi++){
            var _wbZ=_woodBridgeZs[_wbi];
            var _wbMeshes=[];
            var _wDeck=new THREE.Mesh(new THREE.BoxGeometry(18,0.4,6),_jWoodM);
            _wDeck.position.set(0,_pH-0.2,_wbZ);cityGroup.add(_wDeck);_wbMeshes.push(_wDeck);
            var _wSupport=new THREE.Mesh(new THREE.BoxGeometry(16,0.3,4),toon(0x775533));
            _wSupport.position.set(0,_pH-0.55,_wbZ);cityGroup.add(_wSupport);_wbMeshes.push(_wSupport);
            // Support pillars from ground
            [-5,0,5].forEach(function(px){
                var _pil=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,_pH,6),toon(0x664422));
                _pil.position.set(px,_pH/2,_wbZ);cityGroup.add(_pil);
            });
            [-1,1].forEach(function(s){
                var _wRail=new THREE.Mesh(new THREE.BoxGeometry(18,0.15,0.15),_jWoodM);
                _wRail.position.set(0,_pH+1,_wbZ+s*2.7);cityGroup.add(_wRail);
                for(var _wpi3=0;_wpi3<9;_wpi3++){
                    var _wpx2=-8+_wpi3*2;
                    var _wPost=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1.2,4),_jWoodM);
                    _wPost.position.set(_wpx2,_pH+0.4,_wbZ+s*2.7);cityGroup.add(_wPost);
                }
            });
            cityColliders.push({x:0,z:_wbZ,hw:9,hd:3,h:_pH,_bridge:true});
            cityBuildingMeshes.push({meshes:_wbMeshes,x:0,z:_wbZ,hw:9,hd:3,h:_pH});
        }
        // Red arched bridges (big, spanning gorge)
        var _redBridgeZs=[-30,30];
        for(var _rbzi=0;_rbzi<_redBridgeZs.length;_rbzi++){
            var _rbG=new THREE.Group();var _rbZ=_redBridgeZs[_rbzi];
            _rbG.position.set(0,0,_rbZ);
            var _rbSegs=10,_rbSpan=18,_rbBase=_pH-0.5,_rbArch=2;
            for(var _rbsi=0;_rbsi<_rbSegs;_rbsi++){
                var _rbt=_rbsi/_rbSegs;var _rbnt=(_rbsi+1)/_rbSegs;
                var _rbx=-_rbSpan/2+_rbt*_rbSpan,_rby=_rbBase+Math.sin(_rbt*Math.PI)*_rbArch;
                var _rbnx=-_rbSpan/2+_rbnt*_rbSpan,_rbny=_rbBase+Math.sin(_rbnt*Math.PI)*_rbArch;
                var _rbAng=Math.atan2(_rbny-_rby,_rbnx-_rbx);
                var _rbLen=Math.sqrt((_rbnx-_rbx)*(_rbnx-_rbx)+(_rbny-_rby)*(_rbny-_rby));
                var _rbPlk=new THREE.Mesh(new THREE.BoxGeometry(_rbLen+0.3,0.35,6),_jRedM);
                _rbPlk.position.set((_rbx+_rbnx)/2,(_rby+_rbny)/2,0);_rbPlk.rotation.z=_rbAng;_rbG.add(_rbPlk);
            }
            [-1,1].forEach(function(s){
                for(var _rri=0;_rri<=8;_rri++){
                    var _rrt=_rri/8;var _rrx=-_rbSpan/2+_rrt*_rbSpan,_rry=_rbBase+Math.sin(_rrt*Math.PI)*_rbArch;
                    var rp=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,1.5,6),_jRedM);
                    rp.position.set(_rrx,_rry+0.75,s*2.8);_rbG.add(rp);
                    var rb3=new THREE.Mesh(new THREE.SphereGeometry(0.16,5,4),_jRedM);
                    rb3.position.set(_rrx,_rry+1.5,s*2.8);_rbG.add(rb3);
                    if(_rri<8){var _nrt2=(_rri+1)/8;var _nrx2=-_rbSpan/2+_nrt2*_rbSpan,_nry2=_rbBase+Math.sin(_nrt2*Math.PI)*_rbArch;
                    var _hrL2=Math.sqrt((_nrx2-_rrx)*(_nrx2-_rrx)+(_nry2-_rry)*(_nry2-_rry));var _hrA2=Math.atan2(_nry2-_rry,_nrx2-_rrx);
                    var hr2=new THREE.Mesh(new THREE.BoxGeometry(_hrL2,0.1,0.1),_jRedM);
                    hr2.position.set((_rrx+_nrx2)/2,(_rry+_nry2)/2+1.4,s*2.8);hr2.rotation.z=_hrA2;_rbG.add(hr2);}
                }
            });
            cityGroup.add(_rbG);
            // Add all bridge meshes for camera occlusion (transparency when underneath)
            cityBuildingMeshes.push({meshes:_rbG.children.slice(),x:0,z:_rbZ,hw:9,hd:3,h:_rbBase+_rbArch});
            for(var _rbci=0;_rbci<6;_rbci++){var _rbcT=(_rbci+0.5)/6;
                var _rbcH=_rbBase+Math.sin(_rbcT*Math.PI)*_rbArch;
                cityColliders.push({x:-_rbSpan/2+_rbcT*_rbSpan,z:_rbZ,hw:_rbSpan/6/2+0.8,hd:3,h:_rbcH,_bridge:true});}
        }
        // Lanterns on plateau edges
        for(var _gli=0;_gli<14;_gli++){var _glz=-100+_gli*15;_buildToro(-10,_glz,_pH);_buildToro(10,_glz+8,_pH);}
        // SKIP old bridge code
        if(false){
        // Three bridges at z=-40, z=0, z=40
        // Plateaus are at y=8, bridge starts at y=8 on both ends, arches to y=11
        var _bridgeZs=[-40,0,40];
        for(var _bzi=0;_bzi<_bridgeZs.length;_bzi++){
            var _bridgeG=new THREE.Group();
            var _bgZ=_bridgeZs[_bzi];
            _bridgeG.position.set(0,0,_bgZ);
            var _bSegs=10,_bSpan=18,_bBase=7.8,_bArch=1.8;
            // Arched deck segments
            for(var _bsi=0;_bsi<_bSegs;_bsi++){
                var _bt=_bsi/_bSegs;
                var _bx2=-_bSpan/2+_bt*_bSpan;
                var _by2=_bBase+Math.sin(_bt*Math.PI)*_bArch;
                var _bNext=(_bsi+1)/_bSegs;
                var _bnx=-_bSpan/2+_bNext*_bSpan;
                var _bny2=_bBase+Math.sin(_bNext*Math.PI)*_bArch;
                var _bAngle=Math.atan2(_bny2-_by2,_bnx-_bx2);
                var _bLen=Math.sqrt((_bnx-_bx2)*(_bnx-_bx2)+(_bny2-_by2)*(_bny2-_by2));
                var plank=new THREE.Mesh(new THREE.BoxGeometry(_bLen+0.3,0.35,7),_jRedM);
                plank.position.set((_bx2+_bnx)/2,(_by2+_bny2)/2,0);
                plank.rotation.z=_bAngle;_bridgeG.add(plank);
            }
            // Railings with handrails following arch
            [-1,1].forEach(function(s){
                for(var _rli=0;_rli<=8;_rli++){
                    var _rlt=_rli/8;
                    var _rlx=-_bSpan/2+_rlt*_bSpan;
                    var _rly=_bBase+Math.sin(_rlt*Math.PI)*_bArch;
                    var rPost=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,1.5,6),_jRedM);
                    rPost.position.set(_rlx,_rly+0.75,s*3.2);_bridgeG.add(rPost);
                    var rBall=new THREE.Mesh(new THREE.SphereGeometry(0.18,5,4),_jRedM);
                    rBall.position.set(_rlx,_rly+1.5,s*3.2);_bridgeG.add(rBall);
                    if(_rli<8){
                        var _nlt2=(_rli+1)/8;
                        var _nlx2=-_bSpan/2+_nlt2*_bSpan;
                        var _nly2=_bBase+Math.sin(_nlt2*Math.PI)*_bArch;
                        var _hLen2=Math.sqrt((_nlx2-_rlx)*(_nlx2-_rlx)+(_nly2-_rly)*(_nly2-_rly));
                        var _hAng2=Math.atan2(_nly2-_rly,_nlx2-_rlx);
                        var hRail2=new THREE.Mesh(new THREE.BoxGeometry(_hLen2,0.12,0.12),_jRedM);
                        hRail2.position.set((_rlx+_nlx2)/2,(_rly+_nly2)/2+1.4,s*3.2);
                        hRail2.rotation.z=_hAng2;_bridgeG.add(hRail2);
                    }
                }
            });
            // Step colliders following arch — 8 overlapping segments
            for(var _bci=0;_bci<8;_bci++){
                var _bcT=(_bci+0.5)/8;
                var _bcX=-_bSpan/2+_bcT*_bSpan;
                var _bcH=_bBase+Math.sin(_bcT*Math.PI)*_bArch;
                cityColliders.push({x:_bcX,z:_bgZ,hw:_bSpan/8/2+0.8,hd:3.5,h:_bcH,_bridge:true});
            }
            cityGroup.add(_bridgeG);
        }

        } // end if(false) skip old bridges
        // === Hot Spring Pool on plateau ===
        var _onsenX=60,_onsenZ=-70;
        var _pool1=new THREE.Mesh(new THREE.CylinderGeometry(6,6,0.3,16),toon(0x66BBBB,{transparent:true,opacity:0.55}));
        _pool1.position.set(_onsenX,_pH+0.15,_onsenZ);cityGroup.add(_pool1);
        var _pEdge1=new THREE.Mesh(new THREE.TorusGeometry(7,0.6,6,16),_jStoneM);
        _pEdge1.position.set(_onsenX,_pH+0.35,_onsenZ);_pEdge1.rotation.x=Math.PI/2;cityGroup.add(_pEdge1);
        for(var _ori=0;_ori<6;_ori++){
            var _oa=_ori/6*Math.PI*2;
            var rock=new THREE.Mesh(new THREE.SphereGeometry(0.4+Math.random()*0.5,5,4),toon(0x777766));
            rock.position.set(_onsenX+Math.cos(_oa)*7.5,_pH+0.2,_onsenZ+Math.sin(_oa)*7.5);
            rock.scale.set(1,0.5,1);cityGroup.add(rock);
        }

        // === Fox Shrine (稲荷神社) ===
        var _shX=70,_shZ=40,_shY=_pH;
        // Stone path to shrine
        for(var _spi2=0;_spi2<8;_spi2++){
            var _spStep=new THREE.Mesh(new THREE.BoxGeometry(4,0.15,1.5),_jStoneM);
            _spStep.position.set(_shX,_shY+0.08,_shZ-20+_spi2*3);cityGroup.add(_spStep);
        }
        // 4 red torii gates — facing screen (+z direction)
        for(var _tgi2=0;_tgi2<4;_tgi2++){
            var _tgz2=_shZ-18+_tgi2*4;
            var _toriiG=new THREE.Group();_toriiG.position.set(_shX,_shY,_tgz2);
            [-1,1].forEach(function(s){
                var pil=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.22,5,8),_jRedM);
                pil.position.set(s*2,2.5,0);_toriiG.add(pil);
            });
            var tBeam=new THREE.Mesh(new THREE.BoxGeometry(5.5,0.3,0.4),_jRedM);
            tBeam.position.set(0,4.8,0);_toriiG.add(tBeam);
            var tBeam2=new THREE.Mesh(new THREE.BoxGeometry(4.5,0.2,0.3),_jRedM);
            tBeam2.position.set(0,4.2,0);_toriiG.add(tBeam2);
            cityGroup.add(_toriiG);
        }
        // Main shrine
        var _shrBody=new THREE.Mesh(new THREE.BoxGeometry(8,5,6),_jRedM);
        _shrBody.position.set(_shX,_shY+2.5,_shZ);cityGroup.add(_shrBody);
        cityColliders.push({x:_shX,z:_shZ,hw:4,hd:3,h:_shY+5});
        var _shrRoof=new THREE.Mesh(new THREE.ConeGeometry(6,3,4),_jDarkRoof);
        _shrRoof.position.set(_shX,_shY+6.5,_shZ);_shrRoof.rotation.y=Math.PI/4;cityGroup.add(_shrRoof);
        // Fox statues
        [-1,1].forEach(function(s){
            var fb=new THREE.Mesh(new THREE.ConeGeometry(0.4,1.5,6),toon(0xDDDDDD));
            fb.position.set(_shX+s*3,_shY+0.75,_shZ-10);cityGroup.add(fb);
            var fh=new THREE.Mesh(new THREE.SphereGeometry(0.35,6,4),toon(0xDDDDDD));
            fh.position.set(_shX+s*3,_shY+1.7,_shZ-10);cityGroup.add(fh);
            [-0.15,0.15].forEach(function(ex){
                var ear=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.25,4),toon(0xDDDDDD));
                ear.position.set(_shX+s*3+ex,_shY+2.0,_shZ-10);cityGroup.add(ear);
            });
            var feye=new THREE.Mesh(new THREE.SphereGeometry(0.06,4,3),toon(0xCC0000));
            feye.position.set(_shX+s*3+s*0.15,_shY+1.75,_shZ-9.65);cityGroup.add(feye);
        });
        _buildToro(_shX-4,_shZ-12,_shY);_buildToro(_shX+4,_shZ-12,_shY);
        var _saisen=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.8,0.8),toon(0x442200));
        _saisen.position.set(_shX,_shY+0.4,_shZ-6);cityGroup.add(_saisen);
        cityBuildingMeshes.push({meshes:[_shrBody,_shrRoof],x:_shX,z:_shZ,hw:4,hd:3,h:_shY+5});

        // (Lanterns already placed above with bridges)

        // === 7. Decorative high clouds (薄雲) ===
        for(var _dci=0;_dci<12;_dci++){
            var _dcg=new THREE.Group();
            var _dcx=(Math.random()-0.5)*300;
            var _dcy=40+Math.random()*30;
            var _dcz=(Math.random()-0.5)*300;
            var _dcParts=3+Math.floor(Math.random()*3);
            for(var _dcp=0;_dcp<_dcParts;_dcp++){
                var _dcr=6+Math.random()*8;
                var _dcm=new THREE.Mesh(new THREE.SphereGeometry(_dcr,6,4),
                    new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:0.25+Math.random()*0.15}));
                _dcm.position.set((Math.random()-0.5)*_dcr*2,Math.random()*2,(Math.random()-0.5)*_dcr);
                _dcm.scale.set(1.5,0.3,1);
                _dcg.add(_dcm);
            }
            _dcg.position.set(_dcx,_dcy,_dcz);
            cityGroup.add(_dcg);
        }

        // === 8. Massive Falling Petal Particles (満開の桜吹雪) ===
        window._sakuraPetals=[];
        var _petalMats=[toon(0xFFAABB),toon(0xFFBBCC),toon(0xFFCCDD),toon(0xFF99AA),toon(0xFFDDEE)];
        for(var _spi3=0;_spi3<3000;_spi3++){
            var _spGeo2=new THREE.PlaneGeometry(0.2+Math.random()*0.15,0.2+Math.random()*0.15);
            var _spMesh2=new THREE.Mesh(_spGeo2,_petalMats[_spi3%_petalMats.length]);
            _spMesh2.material.side=THREE.DoubleSide;
            var _spx2=(Math.random()-0.5)*CITY_SIZE*2;
            var _spy2=10+Math.random()*25;
            var _spz2=(Math.random()-0.5)*CITY_SIZE*2;
            _spMesh2.position.set(_spx2,_spy2,_spz2);
            _spMesh2.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
            cityGroup.add(_spMesh2);
            window._sakuraPetals.push({mesh:_spMesh2,x:_spx2,y:_spy2,z:_spz2,
                vx:(Math.random()-0.5)*0.015,vy:-0.012-Math.random()*0.008,vz:(Math.random()-0.5)*0.015,
                rotSpeed:0.02+Math.random()*0.03});
        }
        // Some petals floating on water surface (static decoration)
        for(var _wpi=0;_wpi<60;_wpi++){
            var _wpx=(Math.random()-0.5)*14;
            var _wpz=(Math.random()-0.5)*240;
            var _wpMesh=new THREE.Mesh(new THREE.PlaneGeometry(0.25,0.25),_petalMats[_wpi%5]);
            _wpMesh.material.side=THREE.DoubleSide;
            _wpMesh.position.set(_wpx,1.15,_wpz);
            _wpMesh.rotation.x=-Math.PI/2+Math.random()*0.3;
            _wpMesh.rotation.z=Math.random()*Math.PI*2;
            cityGroup.add(_wpMesh);
        }

        // === 8. Stream Animals (溪流の生き物) ===
        window._sakuraStreamAnimals=[];
        // Ducks (8) swimming in the stream
        for(var _dki2=0;_dki2<8;_dki2++){
            var _dkg=new THREE.Group();
            var _dkBody=new THREE.Mesh(new THREE.SphereGeometry(0.22,6,4),toon(0x8B6914));
            _dkBody.scale.set(0.8,0.7,1.3);_dkBody.position.y=0.15;_dkg.add(_dkBody);
            var _dkHead=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),toon(_dki2<4?0x006633:0xFFFFFF));
            _dkHead.position.set(0,0.3,0.2);_dkg.add(_dkHead);
            var _dkBeak=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.1,4),toon(0xFF8800));
            _dkBeak.position.set(0,0.26,0.32);_dkBeak.rotation.x=-Math.PI/2;_dkg.add(_dkBeak);
            var _dkx=(Math.random()-0.5)*10,_dkz=(Math.random()-0.5)*200;
            _dkg.position.set(_dkx,1.3,_dkz);
            cityGroup.add(_dkg);
            window._sakuraStreamAnimals.push({group:_dkg,type:'duck',x:_dkx,y:1.3,z:_dkz,
                moveDir:Math.random()*Math.PI*2,speed:0.02+Math.random()*0.01,wobble:Math.random()*Math.PI*2});
        }
        // Koi fish (10) — visible through the water
        for(var _kfi=0;_kfi<10;_kfi++){
            var _kfg=new THREE.Group();
            var _kfBody=new THREE.Mesh(new THREE.SphereGeometry(0.18,6,4),toon([0xFF6600,0xFFFFFF,0xFF3333,0xFFAA00,0xFF8844][_kfi%5]));
            _kfBody.scale.set(0.5,0.4,1.5);_kfg.add(_kfBody);
            var _kfTail=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.1,0.1),toon([0xFF6600,0xFFFFFF,0xFF3333,0xFFAA00,0xFF8844][_kfi%5]));
            _kfTail.position.set(0,0,-0.25);_kfg.add(_kfTail);
            var _kfx=(Math.random()-0.5)*10,_kfz=(Math.random()-0.5)*200;
            _kfg.position.set(_kfx,0.7,_kfz);
            cityGroup.add(_kfg);
            window._sakuraStreamAnimals.push({group:_kfg,type:'koi',x:_kfx,y:0.7,z:_kfz,
                angle:Math.random()*Math.PI*2,radius:2+Math.random()*4,speed:0.01+Math.random()*0.008,phase:Math.random()*Math.PI*2});
        }
        // Turtles (5) — on rocks or floating
        for(var _tti=0;_tti<5;_tti++){
            var _ttg=new THREE.Group();
            var _ttShell=new THREE.Mesh(new THREE.SphereGeometry(0.3,6,4),toon(0x556B2F));
            _ttShell.scale.set(1,0.5,1.2);_ttShell.position.y=0.15;_ttg.add(_ttShell);
            var _ttHead=new THREE.Mesh(new THREE.SphereGeometry(0.1,5,3),toon(0x8B8B00));
            _ttHead.position.set(0,0.15,0.3);_ttg.add(_ttHead);
            // 4 tiny legs
            [[-0.15,0,0.1],[0.15,0,0.1],[-0.15,0,-0.15],[0.15,0,-0.15]].forEach(function(lp){
                var leg=new THREE.Mesh(new THREE.SphereGeometry(0.05,4,3),toon(0x8B8B00));
                leg.position.set(lp[0],lp[1],lp[2]);_ttg.add(leg);
            });
            var _ttx=(Math.random()-0.5)*10,_ttz=(Math.random()-0.5)*180;
            _ttg.position.set(_ttx,1.1,_ttz);
            cityGroup.add(_ttg);
            window._sakuraStreamAnimals.push({group:_ttg,type:'turtle',x:_ttx,y:1.1,z:_ttz,
                moveDir:Math.random()*Math.PI*2,speed:0.005,timer:200+Math.floor(Math.random()*300)});
        }
        // Herons/cranes (3) — standing at stream edge
        for(var _hri=0;_hri<3;_hri++){
            var _hrg=new THREE.Group();
            var _hrBody=new THREE.Mesh(new THREE.SphereGeometry(0.25,6,4),toon(0xFFFFFF));
            _hrBody.scale.set(0.6,0.8,1);_hrBody.position.y=1.0;_hrg.add(_hrBody);
            var _hrNeck=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.05,0.8,4),toon(0xFFFFFF));
            _hrNeck.position.set(0,1.5,0.1);_hrg.add(_hrNeck);
            var _hrHead=new THREE.Mesh(new THREE.SphereGeometry(0.08,5,3),toon(0xFFFFFF));
            _hrHead.position.set(0,1.9,0.15);_hrg.add(_hrHead);
            var _hrBeak=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.2,4),toon(0xFFAA00));
            _hrBeak.position.set(0,1.85,0.3);_hrBeak.rotation.x=-Math.PI/2;_hrg.add(_hrBeak);
            // Legs
            [-0.08,0.08].forEach(function(lx){
                var leg=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.8,4),toon(0x444444));
                leg.position.set(lx,0.4,0);_hrg.add(leg);
            });
            var _hrSide=(_hri%2===0)?-7.5:7.5;
            var _hrz=(Math.random()-0.5)*160;
            _hrg.position.set(_hrSide,1.0,_hrz);
            cityGroup.add(_hrg);
            window._sakuraStreamAnimals.push({group:_hrg,type:'heron',x:_hrSide,y:1.0,z:_hrz,
                timer:100+Math.floor(Math.random()*200),state:'stand'});
        }
    }catch(e){alert('Sakura build error: '+e.message);}
    }

    } // end if not moon

    // ---- Moon City special decorations (FLAT) ----
    if(currentCityStyle===5){
        // Layout: Von Braun city on left (x<0), battlefield on right (x>0)
        var _moonCityHalf=MOON_CITY_SIZE; // 400
        // Craters on flat ground (outside city zone)
        for(var ci=0;ci<30;ci++){
            var crx=(Math.random()-0.5)*_moonCityHalf*1.8;
            var crz=(Math.random()-0.5)*_moonCityHalf*1.8;
            // Skip if inside Von Braun zone (x<-50) or too close to center
            if(crx<-50&&Math.abs(crz)<120)continue;
            var crr=3+Math.random()*8;
            var craterG=new THREE.Group();
            var crater=new THREE.Mesh(new THREE.CylinderGeometry(crr,crr*1.1,1,16),toon(0x555566));
            crater.position.y=-0.3;craterG.add(crater);
            var rim=new THREE.Mesh(new THREE.TorusGeometry(crr,0.8,6,16),toon(0x777788));
            rim.position.y=0.1;rim.rotation.x=Math.PI/2;craterG.add(rim);
            craterG.position.set(crx,0,crz);
            cityGroup.add(craterG);
        }
        // Apollo Lunar Module — flat positioned
        var apollo=new THREE.Group();
        var descent=new THREE.Mesh(new THREE.BoxGeometry(3,2,3),toon(0xCCAA44,{emissive:0x886622,emissiveIntensity:0.2}));
        descent.position.y=2;apollo.add(descent);
        for(var li=0;li<4;li++){
            var la=li/4*Math.PI*2+Math.PI/4;
            var leg=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,2.5,4),toon(0xAAAAAA));
            leg.position.set(Math.cos(la)*2,0.8,Math.sin(la)*2);
            leg.rotation.z=Math.cos(la)*0.3;leg.rotation.x=-Math.sin(la)*0.3;
            apollo.add(leg);
            var pad=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,0.1,8),toon(0x999999));
            pad.position.set(Math.cos(la)*2.5,0.05,Math.sin(la)*2.5);
            apollo.add(pad);
        }
        var ascent=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.8,2.2),toon(0xCCCCCC));
        ascent.position.y=3.8;apollo.add(ascent);
        var win=new THREE.Mesh(new THREE.CircleGeometry(0.4,8),toon(0x224466,{emissive:0x112233,emissiveIntensity:0.3}));
        win.position.set(0,4,1.12);apollo.add(win);
        var ant=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,2,4),toon(0xDDDDDD));
        ant.position.set(0.5,5.5,0);apollo.add(ant);
        var dish=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,4,0,Math.PI*2,0,Math.PI/2),toon(0xDDDDDD));
        dish.position.set(0.5,6.5,0);dish.rotation.x=Math.PI;apollo.add(dish);
        var flagPole=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,3,4),toon(0xCCCCCC));
        flagPole.position.set(5,1.5,0);apollo.add(flagPole);
        var flag=new THREE.Mesh(new THREE.BoxGeometry(1.5,1,0.02),toon(0x2244AA));
        flag.position.set(5.8,2.8,0);apollo.add(flag);
        var stripes=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.08,0.03),toon(0xDD2222));
        stripes.position.set(5.8,2.5,0.01);apollo.add(stripes);
        var stripes2=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.08,0.03),toon(0xDD2222));
        stripes2.position.set(5.8,3.1,0.01);apollo.add(stripes2);
        // Place Apollo on flat ground (battlefield side)
        apollo.position.set(280,0,280);
        apollo.scale.set(3,3,3);
        cityGroup.add(apollo);
        // Lunar Rover — projected onto sphere
        var rover=new THREE.Group();
        var rBody=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.3,1.2),toon(0xBBBBBB));
        rBody.position.y=0.8;rover.add(rBody);
        for(var wi=0;wi<4;wi++){
            var wx2=(wi%2===0?-1:1)*1.1;
            var wz2=(wi<2?-1:1)*0.7;
            var wheel=new THREE.Mesh(new THREE.TorusGeometry(0.35,0.08,6,12),toon(0x666666));
            wheel.position.set(wx2,0.35,wz2);wheel.rotation.y=Math.PI/2;
            rover.add(wheel);
        }
        var rDish=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,4,0,Math.PI*2,0,Math.PI/2),toon(0xDDDDDD));
        rDish.position.set(0,1.5,0);rDish.rotation.x=Math.PI;rover.add(rDish);
        // Place rover on flat ground near Apollo
        rover.position.set(270,0,290);
        rover.scale.set(3,3,3);
        rover.rotateY(0.5);
        cityGroup.add(rover);
        // ---- Grand Lunar City "Von Braun" (Gundam-style) ----
        var lunarCity=new THREE.Group();
        var lcBase=toon(0x888899),lcWall=toon(0x667788),lcDark=toon(0x445566);
        var lcGlow=new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.4});
        var lcWarm=new THREE.MeshBasicMaterial({color:0xFFCC66,transparent:true,opacity:0.35});
        // Crater rim (outer wall — raised)
        var craterRim=new THREE.Mesh(new THREE.TorusGeometry(18,3,8,24),toon(0x666677));
        craterRim.rotation.x=Math.PI/2;craterRim.position.y=2;lunarCity.add(craterRim);
        // Crater floor (sunken)
        var craterFloor=new THREE.Mesh(new THREE.CylinderGeometry(17,17,0.5,24),toon(0x555566));
        craterFloor.position.y=-3;lunarCity.add(craterFloor);
        // Crater inner wall (sloped)
        var craterWall=new THREE.Mesh(new THREE.CylinderGeometry(17,18.5,5,24,1,true),toon(0x556677));
        craterWall.position.y=-0.5;lunarCity.add(craterWall);
        // Main dome — large transparent geodesic
        var mainDome=new THREE.Mesh(new THREE.SphereGeometry(16,24,16,0,Math.PI*2,0,Math.PI/2),
            new THREE.MeshPhongMaterial({color:0x8899BB,transparent:true,opacity:0.18,side:THREE.DoubleSide}));
        mainDome.position.y=0;lunarCity.add(mainDome);
        // Dome wireframe for geodesic look
        var domeWire=new THREE.Mesh(new THREE.SphereGeometry(16.1,24,16,0,Math.PI*2,0,Math.PI/2),
            new THREE.MeshBasicMaterial({color:0x6688AA,wireframe:true,transparent:true,opacity:0.25}));
        lunarCity.add(domeWire);
        // Central tower (Anaheim Electronics HQ)
        var aeHQ=new THREE.Mesh(new THREE.CylinderGeometry(0.8,1.5,18,8),lcWall);aeHQ.position.y=9;lunarCity.add(aeHQ);
        var aeTop=new THREE.Mesh(new THREE.SphereGeometry(1.2,8,6),toon(0x99AABB));aeTop.position.y=18.5;lunarCity.add(aeTop);
        var aeAnt=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,8,4),toon(0xCCCCCC));aeAnt.position.y=23;lunarCity.add(aeAnt);
        // AE logo glow
        var aeLogo=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.6,0.1),lcGlow);aeLogo.position.set(0,14,1.55);lunarCity.add(aeLogo);
        // Tall needle spires (Gundam-style Von Braun skyline)
        for(var nsi=0;nsi<20;nsi++){
            var nsa=nsi/20*Math.PI*2+Math.random()*0.3;
            var nsr=3+Math.random()*14;
            var nsh=8+Math.random()*18;
            var nsw=0.15+Math.random()*0.3;
            var ns=new THREE.Mesh(new THREE.CylinderGeometry(nsw*0.3,nsw,nsh,5),toon(0x778899));
            ns.position.set(Math.cos(nsa)*nsr,nsh/2-1,Math.sin(nsa)*nsr);lunarCity.add(ns);
            // Spire tip glow
            if(Math.random()<0.5){
                var nsGlow=new THREE.Mesh(new THREE.SphereGeometry(0.2,4,3),new THREE.MeshBasicMaterial({color:0x88CCFF,transparent:true,opacity:0.6}));
                nsGlow.position.set(Math.cos(nsa)*nsr,nsh-0.5,Math.sin(nsa)*nsr);lunarCity.add(nsGlow);
            }
        }
        // Ring of tall buildings (commercial district) — skyscrapers with lights
        var _vbBldgMeshes=[]; // collect for occlusion
        for(var lbi=0;lbi<18;lbi++){
            var lba=lbi/18*Math.PI*2;var lbr=7+Math.random()*4;
            var lbh=4+Math.random()*8;var lbw=0.8+Math.random()*1.2;var lbd=0.8+Math.random()*1.0;
            var lbColor=[lcWall,lcDark,toon(0x556688),toon(0x667799),toon(0x5577AA)][lbi%5];
            var lb=new THREE.Mesh(new THREE.BoxGeometry(lbw,lbh,lbd),lbColor);
            lb.position.set(Math.cos(lba)*lbr,lbh/2-1,Math.sin(lba)*lbr);lunarCity.add(lb);_vbBldgMeshes.push(lb);
            // Window grid (warm yellow lights)
            var wRows=Math.floor(lbh/0.8);
            for(var wri=0;wri<wRows;wri++){
                for(var wci=0;wci<2;wci++){
                    if(Math.random()<0.3)continue; // some windows dark
                    var wc=Math.random()<0.7?0xFFCC66:0x88CCFF;
                    var wm=new THREE.Mesh(new THREE.BoxGeometry(lbw*0.3,0.2,0.05),new THREE.MeshBasicMaterial({color:wc,transparent:true,opacity:0.5+Math.random()*0.3}));
                    wm.position.set(Math.cos(lba)*lbr+(wci-0.5)*lbw*0.35,wri*0.8+0.3,Math.sin(lba)*lbr+lbd/2+0.03);
                    lunarCity.add(wm);_vbBldgMeshes.push(wm);
                }
            }
            // Rooftop antenna/light
            if(Math.random()<0.6){
                var rl=new THREE.Mesh(new THREE.SphereGeometry(0.12,4,3),new THREE.MeshBasicMaterial({color:Math.random()<0.5?0xFF4444:0x44FF44,transparent:true,opacity:0.8}));
                rl.position.set(Math.cos(lba)*lbr,lbh-0.5,Math.sin(lba)*lbr);lunarCity.add(rl);_vbBldgMeshes.push(rl);
            }
        }
        // Inner ring — tall residential towers with balcony lights
        for(var lri=0;lri<10;lri++){
            var lra=lri/10*Math.PI*2+0.3;var lrr=3.5+Math.random()*2.5;
            var lrh=3+Math.random()*5;
            var lr=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.7,lrh,6),lcWall);
            lr.position.set(Math.cos(lra)*lrr,lrh/2-1,Math.sin(lra)*lrr);lunarCity.add(lr);_vbBldgMeshes.push(lr);
            // Balcony ring lights
            for(var bli=0;bli<Math.floor(lrh/1.5);bli++){
                var blr=new THREE.Mesh(new THREE.TorusGeometry(0.55,0.04,4,8),new THREE.MeshBasicMaterial({color:0xFFCC66,transparent:true,opacity:0.4}));
                blr.position.set(Math.cos(lra)*lrr,bli*1.5+1,Math.sin(lra)*lrr);
                blr.rotation.x=Math.PI/2;lunarCity.add(blr);_vbBldgMeshes.push(blr);
            }
        }
        // Outer ring — shorter commercial blocks with neon signs
        for(var ori=0;ori<14;ori++){
            var ora=ori/14*Math.PI*2+0.15;var orr=13+Math.random()*3;
            var orh=2+Math.random()*3;var orw=1+Math.random()*1.5;
            var ob2=new THREE.Mesh(new THREE.BoxGeometry(orw,orh,orw*0.8),toon(0x556677));
            ob2.position.set(Math.cos(ora)*orr,orh/2-1,Math.sin(ora)*orr);lunarCity.add(ob2);_vbBldgMeshes.push(ob2);
            // Neon sign on front
            var neonC=[0xFF4488,0x44FFAA,0xFFAA22,0x44AAFF,0xFF66FF][ori%5];
            var neon=new THREE.Mesh(new THREE.BoxGeometry(orw*0.6,0.3,0.05),new THREE.MeshBasicMaterial({color:neonC,transparent:true,opacity:0.7}));
            neon.position.set(Math.cos(ora)*orr,orh*0.7,Math.sin(ora)*orr+orw*0.4+0.03);
            lunarCity.add(neon);_vbBldgMeshes.push(neon);
        }
        // Street lights along radial roads
        for(var sli=0;sli<16;sli++){
            var sla=sli/4*Math.PI/2;var slr=3+sli%4*4;
            var slPole=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,2,4),toon(0x888888));
            slPole.position.set(Math.cos(sla)*slr,1,Math.sin(sla)*slr);lunarCity.add(slPole);
            var slLight=new THREE.Mesh(new THREE.SphereGeometry(0.15,4,3),new THREE.MeshBasicMaterial({color:0xFFEECC,transparent:true,opacity:0.7}));
            slLight.position.set(Math.cos(sla)*slr,2.1,Math.sin(sla)*slr);lunarCity.add(slLight);_vbBldgMeshes.push(slLight);
        }
        // Spaceport — 4 large landing pads on crater rim
        for(var spi2=0;spi2<4;spi2++){
            var spa2=spi2/4*Math.PI*2+Math.PI/8;var spr=19;
            var sPad=new THREE.Mesh(new THREE.CylinderGeometry(3,3,0.3,12),toon(0x556666));
            sPad.position.set(Math.cos(spa2)*spr,1.5,Math.sin(spa2)*spr);lunarCity.add(sPad);
            // Pad markings
            var sMark=new THREE.Mesh(new THREE.RingGeometry(1.5,2,12),new THREE.MeshBasicMaterial({color:0xFFAA00,transparent:true,opacity:0.5,side:THREE.DoubleSide}));
            sMark.rotation.x=-Math.PI/2;sMark.position.set(Math.cos(spa2)*spr,1.7,Math.sin(spa2)*spr);lunarCity.add(sMark);
            // Control tower
            var sTower=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,3,6),lcWall);
            sTower.position.set(Math.cos(spa2)*(spr+3),3,Math.sin(spa2)*(spr+3));lunarCity.add(sTower);
            var sLight=new THREE.Mesh(new THREE.SphereGeometry(0.3,4,3),lcGlow);
            sLight.position.set(Math.cos(spa2)*(spr+3),4.6,Math.sin(spa2)*(spr+3));lunarCity.add(sLight);
        }
        // Mass driver — long rail extending from city
        var mdGroup=new THREE.Group();
        var mdRail=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.4,40),toon(0x556677));mdRail.position.z=20;mdGroup.add(mdRail);
        var mdRail2=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.8,40),toon(0x445566));mdRail2.position.set(-0.8,0.4,20);mdGroup.add(mdRail2);
        var mdRail3=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.8,40),toon(0x445566));mdRail3.position.set(0.8,0.4,20);mdGroup.add(mdRail3);
        // Electromagnetic coils along rail
        for(var mci=0;mci<8;mci++){
            var mc=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.15,6,12),toon(0x4466AA));
            mc.position.set(0,0.8,mci*5+2);mc.rotation.y=Math.PI/2;mdGroup.add(mc);
        }
        mdGroup.position.set(22,0,0);mdGroup.rotation.y=Math.PI/4;lunarCity.add(mdGroup);
        // Solar panel arrays (large, on stilts)
        for(var sai=0;sai<6;sai++){
            var saa=sai/6*Math.PI*2+Math.PI/6;var sar=24+Math.random()*4;
            var saG=new THREE.Group();
            var saPole=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,5,4),toon(0x888888));saPole.position.y=2.5;saG.add(saPole);
            var saPanel=new THREE.Mesh(new THREE.BoxGeometry(5,0.08,2.5),toon(0x224488));saPanel.position.y=5.2;saG.add(saPanel);
            var saFrame=new THREE.Mesh(new THREE.BoxGeometry(5.2,0.15,0.1),toon(0x666666));saFrame.position.y=5.2;saG.add(saFrame);
            saG.position.set(Math.cos(saa)*sar,0,Math.sin(saa)*sar);
            saG.rotation.y=saa+Math.PI/2;lunarCity.add(saG);
        }
        // Fiber-optic light viaducts (glowing tubes inside dome)
        for(var fvi=0;fvi<6;fvi++){
            var fva=fvi/6*Math.PI*2;
            var fv=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,14,6),
                new THREE.MeshBasicMaterial({color:0x88CCFF,transparent:true,opacity:0.25}));
            fv.position.set(Math.cos(fva)*12,7,Math.sin(fva)*12);
            fv.rotation.z=Math.PI/2*0.3;fv.rotation.y=fva;lunarCity.add(fv);
        }
        // Place Von Braun on flat ground (left side, x<0)
        lunarCity.position.set(-200,0,0);
        lunarCity.scale.set(8,8,8);
        cityGroup.add(lunarCity);
        // Von Braun city doors — 4 entrances (N/S/E/W) on crater rim
        var _vbDoorAngles=[0,Math.PI/2,Math.PI,Math.PI*1.5];
        var _vbDoorR=18.5; // on crater rim
        for(var vdi=0;vdi<4;vdi++){
            var vda=_vbDoorAngles[vdi];
            var doorG=new THREE.Group();
            // Door frame
            var doorFrame=new THREE.Mesh(new THREE.BoxGeometry(3,4,0.5),toon(0x4466AA));
            doorFrame.position.y=2;doorG.add(doorFrame);
            // Door opening (glowing)
            var doorGlow=new THREE.Mesh(new THREE.BoxGeometry(2.2,3.2,0.3),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.4}));
            doorGlow.position.y=1.8;doorG.add(doorGlow);
            // Arch top
            var doorArch=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,0.5,8,1,false,0,Math.PI),toon(0x4466AA));
            doorArch.position.y=4;doorArch.rotation.z=Math.PI/2;doorArch.rotation.y=Math.PI/2;doorG.add(doorArch);
            // Position on rim
            doorG.position.set(Math.cos(vda)*_vbDoorR,1,Math.sin(vda)*_vbDoorR);
            doorG.rotation.y=vda+Math.PI; // face outward
            lunarCity.add(doorG);
        }
        // Von Braun collider zone (flat)
        window._moonShields=[];
        // AT Field shields around cities — MS and projectiles can't enter
        // doors: array of {angle, width} for player pass-through openings
        window._moonShields.push({x:-200,y:0,z:0,r:160,
            doors:[{a:0,w:0.25},{a:Math.PI/2,w:0.25},{a:Math.PI,w:0.25},{a:Math.PI*1.5,w:0.25}]
        }); // Von Braun dome
        window._moonCities=[
            {cx:-200,cy:0,cz:0,r:160,scale:8,name:{zhs:'\u51AF\u00B7\u5E03\u52B3\u6069',zht:'\u99AE\u00B7\u5E03\u52DE\u6069',ja:'\u30D5\u30A9\u30F3\u30FB\u30D6\u30E9\u30A6\u30F3',en:'Von Braun'},flatX:-200,flatZ:0}
        ];
        // ---- Granada (second city, far side) ----
        var granada=new THREE.Group();
        // Deep crater rim
        var grRim=new THREE.Mesh(new THREE.TorusGeometry(10,2,8,20),toon(0x556666));
        grRim.rotation.x=Math.PI/2;grRim.position.y=0.5;granada.add(grRim);
        // Crater bowl (sunken floor)
        var grFloor=new THREE.Mesh(new THREE.CylinderGeometry(9,9,0.5,20),toon(0x334455));
        grFloor.position.y=-3;granada.add(grFloor);
        // Crater inner wall (sloped)
        var grWall=new THREE.Mesh(new THREE.CylinderGeometry(9,10.5,4,20,1,true),toon(0x445566));
        grWall.position.y=-1;granada.add(grWall);
        // Blue glow from within (Granada's signature blue lighting)
        var grGlowFloor=new THREE.Mesh(new THREE.CircleGeometry(8,20),new THREE.MeshBasicMaterial({color:0x2244AA,transparent:true,opacity:0.15,side:THREE.DoubleSide}));
        grGlowFloor.rotation.x=-Math.PI/2;grGlowFloor.position.y=-2.5;granada.add(grGlowFloor);
        // Concentric ring lights (blue)
        for(var gri=0;gri<3;gri++){
            var grRing=new THREE.Mesh(new THREE.TorusGeometry(3+gri*2.5,0.08,6,24),new THREE.MeshBasicMaterial({color:0x4488FF,transparent:true,opacity:0.3}));
            grRing.rotation.x=Math.PI/2;grRing.position.y=-2.4;granada.add(grRing);
        }
        // Military hangars + barracks (inside crater)
        for(var ghi=0;ghi<6;ghi++){
            var gha=ghi/6*Math.PI*2;var ghr=5+Math.random()*2;
            var gh=new THREE.Mesh(new THREE.BoxGeometry(2,1.5,3),toon(0x445544));
            gh.position.set(Math.cos(gha)*ghr,-2,Math.sin(gha)*ghr);gh.rotation.y=gha;granada.add(gh);
            var ghd=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.2,0.1),new THREE.MeshBasicMaterial({color:0x44AA44,transparent:true,opacity:0.3}));
            ghd.position.set(Math.cos(gha)*(ghr+1.5),-1.9,Math.sin(gha)*(ghr+1.5));ghd.rotation.y=gha;granada.add(ghd);
            // Hangar interior light
            var ghL=new THREE.Mesh(new THREE.SphereGeometry(0.2,4,3),new THREE.MeshBasicMaterial({color:0x88FF88,transparent:true,opacity:0.5}));
            ghL.position.set(Math.cos(gha)*(ghr+1.5),-1.2,Math.sin(gha)*(ghr+1.5));granada.add(ghL);
        }
        // Inner buildings — military command structures
        for(var gbi=0;gbi<8;gbi++){
            var gba=gbi/8*Math.PI*2+0.4;var gbr=2.5+Math.random()*2;
            var gbh=2+Math.random()*3;
            var gb2=new THREE.Mesh(new THREE.BoxGeometry(1,gbh,1),toon(0x556666));
            gb2.position.set(Math.cos(gba)*gbr,gbh/2-2.5,Math.sin(gba)*gbr);granada.add(gb2);
            // Blue window strips
            for(var gwi=0;gwi<Math.floor(gbh/0.8);gwi++){
                var gw=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.12,0.05),new THREE.MeshBasicMaterial({color:0x4488FF,transparent:true,opacity:0.5}));
                gw.position.set(Math.cos(gba)*gbr,gwi*0.8-2,Math.sin(gba)*gbr+0.53);granada.add(gw);
            }
        }
        var grTower=new THREE.Mesh(new THREE.CylinderGeometry(0.6,1.0,12,8),toon(0x556655));grTower.position.y=3;granada.add(grTower);
        // Tower top beacon
        var grBeacon=new THREE.Mesh(new THREE.SphereGeometry(0.4,6,4),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.7}));
        grBeacon.position.y=9.5;granada.add(grBeacon);
        // Granada spires (military comm towers)
        for(var gsi=0;gsi<10;gsi++){
            var gsa=gsi/10*Math.PI*2+0.2;var gsr=3+Math.random()*6;
            var gsh=5+Math.random()*12;
            var gs=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.18,gsh,4),toon(0x667766));
            gs.position.set(Math.cos(gsa)*gsr,gsh/2-2.5,Math.sin(gsa)*gsr);granada.add(gs);
            // Spire tip light
            if(Math.random()<0.5){
                var gsL=new THREE.Mesh(new THREE.SphereGeometry(0.12,4,3),new THREE.MeshBasicMaterial({color:0xFF4444,transparent:true,opacity:0.7}));
                gsL.position.set(Math.cos(gsa)*gsr,gsh-2,Math.sin(gsa)*gsr);granada.add(gsL);
            }
        }
        // Place Granada on flat ground (left side, behind Von Braun)
        granada.position.set(-200,0,-200);
        granada.scale.set(8,8,8);
        cityGroup.add(granada);
        // Granada city doors — 4 entrances (N/S/E/W) on rim
        var _grDoorR=10.5;
        for(var gdi=0;gdi<4;gdi++){
            var gda=gdi/4*Math.PI*2;
            var gdoorG=new THREE.Group();
            var gdFrame=new THREE.Mesh(new THREE.BoxGeometry(2.5,3.5,0.4),toon(0x446644));
            gdFrame.position.y=1.75;gdoorG.add(gdFrame);
            var gdGlow=new THREE.Mesh(new THREE.BoxGeometry(1.8,2.8,0.3),new THREE.MeshBasicMaterial({color:0x44FF88,transparent:true,opacity:0.4}));
            gdGlow.position.y=1.5;gdoorG.add(gdGlow);
            gdoorG.position.set(Math.cos(gda)*_grDoorR,0.5,Math.sin(gda)*_grDoorR);
            gdoorG.rotation.y=gda+Math.PI;
            granada.add(gdoorG);
        }
        // Granada collider zone (flat)
        window._moonCities.push({cx:-200,cy:0,cz:-200,r:100,scale:8,name:{zhs:'\u683C\u62C9\u7EB3\u8FBE',zht:'\u683C\u62C9\u7D0D\u9054',ja:'\u30B0\u30E9\u30CA\u30C0',en:'Granada'},flatX:-200,flatZ:-200});
        window._moonShields.push({x:-200,y:0,z:-200,r:100,
            doors:[{a:0,w:0.3},{a:Math.PI/2,w:0.3},{a:Math.PI,w:0.3},{a:Math.PI*1.5,w:0.3}]
        }); // Granada dome
        // Visible AT Field shield domes (translucent hexagonal-look spheres)
        var _shieldMat=new THREE.MeshBasicMaterial({color:0xFF8800,transparent:true,opacity:0.04,side:THREE.DoubleSide});
        var _shieldWire=new THREE.MeshBasicMaterial({color:0xFF6600,wireframe:true,transparent:true,opacity:0.06});
        // Von Braun shield dome
        var vbShield=new THREE.Mesh(new THREE.SphereGeometry(160,24,16,0,Math.PI*2,0,Math.PI/2),_shieldMat);
        vbShield.position.set(-200,0,0);scene.add(vbShield);
        var vbWire=new THREE.Mesh(new THREE.SphereGeometry(160.5,24,16,0,Math.PI*2,0,Math.PI/2),_shieldWire);
        vbWire.position.set(-200,0,0);scene.add(vbWire);
        // Granada shield dome
        var grShield=new THREE.Mesh(new THREE.SphereGeometry(100,20,12,0,Math.PI*2,0,Math.PI/2),_shieldMat);
        grShield.position.set(-200,0,-200);scene.add(grShield);
        var grWire2=new THREE.Mesh(new THREE.SphereGeometry(100.5,20,12,0,Math.PI*2,0,Math.PI/2),_shieldWire);
        grWire2.position.set(-200,0,-200);scene.add(grWire2);
        // Store for cleanup
        window._moonShieldDomes=[vbShield,vbWire,grShield,grWire2];
        // Moon city building colliders — flat box colliders
        window._moonBldgColliders=[];
        // Von Braun central tower
        cityColliders.push({x:-200,z:0,hw:12,hd:12,h:100});
        // Von Braun ring buildings
        for(var mbi=0;mbi<12;mbi++){
            var mba=mbi/12*Math.PI*2;var mbr=70;
            var mbx=-200+Math.cos(mba)*mbr;var mbz=Math.sin(mba)*mbr;
            cityColliders.push({x:mbx,z:mbz,hw:10,hd:10,h:50});
        }
        // Granada hangars
        for(var gci=0;gci<6;gci++){
            var gca=gci/6*Math.PI*2;var gcr=45;
            var gcx=-200+Math.cos(gca)*gcr;var gcz=-200+Math.sin(gca)*gcr;
            cityColliders.push({x:gcx,z:gcz,hw:10,hd:14,h:15});
        }
        // Granada central tower
        cityColliders.push({x:-200,z:-200,hw:8,hd:8,h:70});
        // Add moon city meshes to building occlusion array — per collider zone
        var _vbAllMeshes=[];lunarCity.traverse(function(c){if(c.isMesh)_vbAllMeshes.push(c);});
        var _grAllMeshes=[];granada.traverse(function(c){if(c.isMesh)_grAllMeshes.push(c);});
        // Von Braun central tower
        cityBuildingMeshes.push({meshes:_vbAllMeshes,x:-200,z:0,hw:12,hd:12,h:100});
        // Von Braun ring buildings — each ring building gets an occlusion entry
        for(var _obi=0;_obi<12;_obi++){
            var _oba2=_obi/12*Math.PI*2;var _obr2=70;
            cityBuildingMeshes.push({meshes:_vbAllMeshes,x:-200+Math.cos(_oba2)*_obr2,z:Math.sin(_oba2)*_obr2,hw:10,hd:10,h:50});
        }
        // Granada
        cityBuildingMeshes.push({meshes:_grAllMeshes,x:-200,z:-200,hw:8,hd:8,h:70});
        for(var _ogci=0;_ogci<6;_ogci++){
            var _ogca=_ogci/6*Math.PI*2;var _ogcr=45;
            cityBuildingMeshes.push({meshes:_grAllMeshes,x:-200+Math.cos(_ogca)*_ogcr,z:-200+Math.sin(_ogca)*_ogcr,hw:10,hd:14,h:15});
        }
        // Earth in sky — semi-realistic scale (Earth radius ~3.67x Moon)
        var earthGroup=new THREE.Group();
        var _earthR=29340; // Earth radius in game units (real ratio to moon)
        var earth=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),new THREE.MeshBasicMaterial({color:0x3366CC,fog:false}));
        earthGroup.add(earth);
        for(var ei=0;ei<8;ei++){
            var ea=ei/8*Math.PI*2;
            var ep=(Math.random()-0.5)*Math.PI*0.7;
            var cont=new THREE.Mesh(new THREE.SphereGeometry(0.26+Math.random()*0.2,10,8),new THREE.MeshBasicMaterial({color:0x33AA44,fog:false}));
            cont.position.set(Math.cos(ea)*Math.cos(ep)*0.87,Math.sin(ep)*0.87,Math.sin(ea)*Math.cos(ep)*0.87);
            cont.scale.set(1,0.5,1);
            earthGroup.add(cont);
        }
        var iceCap1=new THREE.Mesh(new THREE.SphereGeometry(0.27,10,8),new THREE.MeshBasicMaterial({color:0xDDEEFF,fog:false}));
        iceCap1.position.set(0,0.93,0);earthGroup.add(iceCap1);
        var iceCap2=new THREE.Mesh(new THREE.SphereGeometry(0.2,10,8),new THREE.MeshBasicMaterial({color:0xDDEEFF,fog:false}));
        iceCap2.position.set(0,-0.93,0);earthGroup.add(iceCap2);
        var atmo=new THREE.Mesh(new THREE.SphereGeometry(1.07,32,24),new THREE.MeshBasicMaterial({color:0x6699FF,transparent:true,opacity:0.15,side:THREE.BackSide,fog:false}));
        earthGroup.add(atmo);
        var atmo2=new THREE.Mesh(new THREE.SphereGeometry(1.17,32,24),new THREE.MeshBasicMaterial({color:0x88BBFF,transparent:true,opacity:0.08,side:THREE.BackSide,fog:false}));
        earthGroup.add(atmo2);
        // Earth-Moon distance: visible in sky (close enough to see clearly)
        var _earthDist=800;
        earthGroup.position.set(_earthDist*0.5,_earthDist*0.8,-_earthDist*0.3);
        earthGroup.scale.set(60,60,60);
        scene.add(earthGroup);
        window._moonEarth=earthGroup;

        // ---- Solar System — Sun and planets at compressed but proportional distances ----
        // Sun and planets (compressed for visibility in moon sky)
        var _sunSolar=new THREE.Mesh(new THREE.SphereGeometry(30,24,16),new THREE.MeshBasicMaterial({color:0xFFEE44,fog:false}));
        _sunSolar.position.set(-600,500,300);
        scene.add(_sunSolar);
        window._sunSolar=_sunSolar;
        var _sunSolarGlow=new THREE.Mesh(new THREE.SphereGeometry(45,16,12),new THREE.MeshBasicMaterial({color:0xFFFF88,transparent:true,opacity:0.15,fog:false}));
        _sunSolarGlow.position.copy(_sunSolar.position);
        scene.add(_sunSolarGlow);
        window._sunSolarGlow=_sunSolarGlow;
        var _solarLight=new THREE.DirectionalLight(0xFFEECC,1.0);
        _solarLight.position.copy(_sunSolar.position).normalize().multiplyScalar(100);
        scene.add(_solarLight);
        window._solarLight=_solarLight;
        var _planets=[
            {name:'Mercury',color:0xAA9988,r:1,dist:200,angle:0.8},
            {name:'Venus',color:0xFFCC88,r:2,dist:300,angle:2.1},
            {name:'Mars',color:0xCC6644,r:1.5,dist:400,angle:3.5},
            {name:'Jupiter',color:0xDDAA66,r:8,dist:550,angle:1.2},
            {name:'Saturn',color:0xDDCC88,r:7,dist:700,angle:4.0},
            {name:'Uranus',color:0x88CCDD,r:4,dist:850,angle:5.5},
            {name:'Neptune',color:0x4466CC,r:3.5,dist:950,angle:0.3},
            {name:'Pluto',color:0xBBAA99,r:0.5,dist:1100,angle:2.8}
        ];
        window._solarPlanets=[];
        for(var _pi=0;_pi<_planets.length;_pi++){
            var _pl=_planets[_pi];
            var _pm=new THREE.Mesh(new THREE.SphereGeometry(_pl.r,12,8),new THREE.MeshBasicMaterial({color:_pl.color,fog:false}));
            var _pa=_pl.angle;
            var _pelev=(Math.random()-0.3)*0.2; // slight orbital inclination
            _pm.position.set(
                _sunSolar.position.x+Math.cos(_pa)*_pl.dist,
                Math.sin(_pelev)*_pl.dist*0.1+_pl.dist*0.3,
                _sunSolar.position.z+Math.sin(_pa)*_pl.dist
            );
            scene.add(_pm);
            window._solarPlanets.push({mesh:_pm,data:_pl});
            // Saturn rings
            if(_pl.name==='Saturn'){
                var ring=new THREE.Mesh(new THREE.RingGeometry(_pl.r*1.3,_pl.r*2.2,32),new THREE.MeshBasicMaterial({color:0xCCBB88,transparent:true,opacity:0.5,side:THREE.DoubleSide,fog:false}));
                ring.position.copy(_pm.position);
                ring.rotation.x=Math.PI*0.35;
                scene.add(ring);
            }
        }

        // ---- Nebulae (large colorful gas clouds in deep space) ----
        window._moonNebulae=[];
        var nebColors=[0x330044,0x220033,0x440022,0x110033,0x330033,0x220044,0x441122,0x112244];
        for(var ni=0;ni<20;ni++){
            var na=Math.random()*Math.PI*2;
            var ne2=(Math.random()-0.5)*Math.PI;
            var nd=500+Math.random()*800;
            var nnx=Math.cos(na)*Math.cos(ne2)*nd;
            var nny=Math.sin(ne2)*nd;
            var nnz=Math.sin(na)*Math.cos(ne2)*nd;
            var ns=20000+Math.random()*60000;
            var nc=nebColors[Math.floor(Math.random()*nebColors.length)];
            var neb=new THREE.Mesh(new THREE.SphereGeometry(ns,8,6),new THREE.MeshBasicMaterial({color:nc,transparent:true,opacity:0.08+Math.random()*0.06,fog:false,side:THREE.BackSide}));
            neb.position.set(nnx,nny,nnz);
            scene.add(neb);
            window._moonNebulae.push(neb);
        }

        // ---- Twinkling stars — surround the sphere ----
        window._moonStars=[];
        var starColors=[0xFFFFFF,0xFFFFFF,0xFFFFFF,0xCCDDFF,0xAABBFF,0xFFEECC,0xFFCCDD,0xDDCCFF];
        for(var sti=0;sti<500;sti++){
            var sa=Math.random()*Math.PI*2;
            var se=(Math.random()-0.5)*Math.PI;
            var sd=MOON_CITY_SIZE*4+Math.random()*MOON_CITY_SIZE*8;
            var sx=Math.cos(sa)*Math.cos(se)*sd;
            var sy=Math.sin(se)*sd;
            var sz=Math.sin(sa)*Math.cos(se)*sd;
            var ss=8+Math.random()*32;
            var sc=starColors[Math.floor(Math.random()*starColors.length)];
            var star=new THREE.Mesh(new THREE.SphereGeometry(ss,4,3),new THREE.MeshBasicMaterial({color:sc,fog:false,transparent:true}));
            star.position.set(sx,sy,sz);
            scene.add(star);
            window._moonStars.push({mesh:star,phase:Math.random()*Math.PI*2,speed:0.5+Math.random()*3});
        }
        // Footprints — flat positioned near Apollo
        var fpMat=toon(0x666677);
        for(var fi=0;fi<15;fi++){
            var ffx=270+(Math.random()-0.5)*20;
            var ffz=280+(Math.random()-0.5)*20;
            var fp=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.05,0.8),fpMat);
            fp.position.set(ffx,0.02,ffz);
            fp.rotation.y=Math.random()*Math.PI*2;
            cityGroup.add(fp);
        }
        // Moon rocks — flat positioned (outside city zones)
        for(var ri2=0;ri2<25;ri2++){
            var rrx=(Math.random()-0.5)*_moonCityHalf*1.8;
            var rrz=(Math.random()-0.5)*_moonCityHalf*1.8;
            // Skip if inside Von Braun zone
            if(rrx<-50&&Math.abs(rrz)<120)continue;
            var rs=1+Math.random()*3;
            var rock=new THREE.Mesh(new THREE.DodecahedronGeometry(rs,0),toon(0x888899));
            rock.position.set(rrx,rs*0.4,rrz);
            rock.rotation.set(Math.random(),Math.random(),Math.random());
            cityGroup.add(rock);
        }
        // ---- Large craters with rims (battlefield terrain) ----
        var _bigCraters=[];
        for(var bci=0;bci<15;bci++){
            var bcx=30+Math.random()*320;
            var bcz=(Math.random()-0.5)*600;
            var bcr=8+Math.random()*20;
            var bcG=new THREE.Group();
            // Crater depression (dark floor)
            var bcFloor=new THREE.Mesh(new THREE.CylinderGeometry(bcr*0.8,bcr,0.6,16),toon(0x444455));
            bcFloor.position.y=-0.5;bcG.add(bcFloor);
            // Raised rim
            var bcRim=new THREE.Mesh(new THREE.TorusGeometry(bcr,bcr*0.15,6,16),toon(0x777788));
            bcRim.rotation.x=Math.PI/2;bcRim.position.y=bcr*0.08;bcG.add(bcRim);
            // Scattered ejecta rocks around rim
            for(var bri=0;bri<5;bri++){
                var bra=Math.random()*Math.PI*2;
                var brr=bcr*0.9+Math.random()*bcr*0.4;
                var brs=0.5+Math.random()*1.5;
                var brk=new THREE.Mesh(new THREE.DodecahedronGeometry(brs,0),toon(0x666677));
                brk.position.set(Math.cos(bra)*brr,brs*0.3,Math.sin(bra)*brr);
                brk.rotation.set(Math.random(),Math.random(),Math.random());
                bcG.add(brk);
            }
            bcG.position.set(bcx,0,bcz);
            cityGroup.add(bcG);
            _bigCraters.push({x:bcx,z:bcz,r:bcr});
        }
        // ---- Apollo Lunar Rover (moving) ----
        window._moonRover=null;
        var roverG=new THREE.Group();
        var rvBody=new THREE.Mesh(new THREE.BoxGeometry(3,0.4,1.5),toon(0xBBBBBB));
        rvBody.position.y=0.9;roverG.add(rvBody);
        // Fenders
        var rvFender1=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.1,1.8),toon(0xAAAAAA));
        rvFender1.position.set(-0.9,0.7,0);roverG.add(rvFender1);
        var rvFender2=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.1,1.8),toon(0xAAAAAA));
        rvFender2.position.set(0.9,0.7,0);roverG.add(rvFender2);
        // Wheels (wire mesh)
        for(var rwi=0;rwi<4;rwi++){
            var rwx=(rwi%2===0?-1:1)*1.2;
            var rwz=(rwi<2?-1:1)*0.8;
            var rwh=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.1,6,12),toon(0x555555));
            rwh.position.set(rwx,0.4,rwz);rwh.rotation.y=Math.PI/2;roverG.add(rwh);
        }
        // High-gain antenna dish
        var rvDish=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,4,0,Math.PI*2,0,Math.PI/2),toon(0xDDDDDD));
        rvDish.position.set(0,1.8,0);rvDish.rotation.x=Math.PI;roverG.add(rvDish);
        var rvAnt=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.2,4),toon(0xCCCCCC));
        rvAnt.position.set(0,1.4,0);roverG.add(rvAnt);
        // Camera/TV on front
        var rvCam=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.4),toon(0x333333));
        rvCam.position.set(1.3,1.2,0);roverG.add(rvCam);
        // Seats (2 simple frames)
        var rvSeat1=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.8),toon(0x999999));
        rvSeat1.position.set(-0.3,1.1,0);roverG.add(rvSeat1);
        var rvSeat2=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.8),toon(0x999999));
        rvSeat2.position.set(0.5,1.1,0);roverG.add(rvSeat2);
        roverG.position.set(150,0,100);
        roverG.scale.set(3,3,3);
        cityGroup.add(roverG);
        window._moonRover={group:roverG,x:150,z:100,angle:0,speed:0.15,timer:0,turnTimer:0,targetAngle:0};
        // ---- Additional US flags scattered on battlefield ----
        var _flagPositions=[[100,0,50],[200,0,-80],[320,0,150],[80,0,-150],[250,0,250]];
        for(var fli=0;fli<_flagPositions.length;fli++){
            var fp2=_flagPositions[fli];
            var flG=new THREE.Group();
            var flPole=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,5,4),toon(0xCCCCCC));
            flPole.position.y=2.5;flG.add(flPole);
            // Flag — red/white/blue
            var flFlag=new THREE.Mesh(new THREE.BoxGeometry(2.5,1.5,0.03),toon(0x2244AA));
            flFlag.position.set(1.3,4.5,0);flG.add(flFlag);
            // Red stripes
            for(var fsi=0;fsi<4;fsi++){
                var fStr=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.1,0.04),toon(0xDD2222));
                fStr.position.set(1.3,3.9+fsi*0.3,0.01);flG.add(fStr);
            }
            // White canton area
            var flCanton=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.7,0.04),toon(0xEEEEEE));
            flCanton.position.set(0.3,4.7,0.02);flG.add(flCanton);
            flG.position.set(fp2[0],fp2[1],fp2[2]);
            flG.scale.set(2,2,2);
            cityGroup.add(flG);
        }
        // ---- More footprint trails across battlefield ----
        var fpMat2=toon(0x555566);
        for(var fti=0;fti<40;fti++){
            var ftx=50+Math.random()*300;
            var ftz=(Math.random()-0.5)*400;
            var ftp=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.05,0.9),fpMat2);
            ftp.position.set(ftx,0.02,ftz);
            ftp.rotation.y=Math.random()*Math.PI*2;
            cityGroup.add(ftp);
        }
        // ---- Regolith mounds (small hills on battlefield) ----
        for(var rmi=0;rmi<20;rmi++){
            var rmx=20+Math.random()*350;
            var rmz=(Math.random()-0.5)*600;
            var rmr=2+Math.random()*5;
            var rmh=0.5+Math.random()*1.5;
            var mound=new THREE.Mesh(new THREE.SphereGeometry(rmr,8,4,0,Math.PI*2,0,Math.PI/2),toon(0x777788));
            mound.position.set(rmx,0,rmz);mound.scale.y=rmh/rmr;
            cityGroup.add(mound);
        }
        // ---- Return-to-Earth portal inside Von Braun city ----
        // Placed near the central tower, looks like a space elevator pad
        var earthPortalG=new THREE.Group();
        // Platform base
        var epBase=new THREE.Mesh(new THREE.CylinderGeometry(3,3.5,0.5,12),toon(0x4466AA));
        epBase.position.y=0.25;earthPortalG.add(epBase);
        // Glowing ring
        var epRing=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.2,8,24),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.6}));
        epRing.rotation.x=Math.PI/2;epRing.position.y=0.6;earthPortalG.add(epRing);
        // Inner portal glow (Earth colors)
        var epInner=new THREE.Mesh(new THREE.CircleGeometry(2,16),new THREE.MeshBasicMaterial({color:0x3366CC,transparent:true,opacity:0.4,side:THREE.DoubleSide}));
        epInner.rotation.x=-Math.PI/2;epInner.position.y=0.7;earthPortalG.add(epInner);
        // Holographic Earth above portal
        var epEarth=new THREE.Mesh(new THREE.SphereGeometry(1.2,16,12),new THREE.MeshBasicMaterial({color:0x3366CC,transparent:true,opacity:0.35}));
        epEarth.position.y=4;earthPortalG.add(epEarth);
        var epCont=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6),new THREE.MeshBasicMaterial({color:0x33AA44,transparent:true,opacity:0.3}));
        epCont.position.set(0.3,4.2,0.5);earthPortalG.add(epCont);
        // Arch frame
        var epArch1=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,6,6),toon(0x4466AA));
        epArch1.position.set(-2.5,3,0);earthPortalG.add(epArch1);
        var epArch2=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,6,6),toon(0x4466AA));
        epArch2.position.set(2.5,3,0);earthPortalG.add(epArch2);
        var epArchTop=new THREE.Mesh(new THREE.BoxGeometry(5.5,0.3,0.3),toon(0x4466AA));
        epArchTop.position.y=6;earthPortalG.add(epArchTop);
        // Sign: "Earth" in holographic text style
        var epSign=new THREE.Mesh(new THREE.BoxGeometry(2,0.5,0.1),new THREE.MeshBasicMaterial({color:0x44CCFF,transparent:true,opacity:0.5}));
        epSign.position.set(0,6.5,0);earthPortalG.add(epSign);
        // Orbiting particles
        for(var epi=0;epi<6;epi++){
            var epPart=new THREE.Mesh(new THREE.SphereGeometry(0.12,4,3),new THREE.MeshBasicMaterial({color:0x88CCFF,transparent:true,opacity:0.7}));
            epPart.userData.orbitPhase=epi/6*Math.PI*2;
            earthPortalG.add(epPart);
        }
        // Place inside Von Braun, near central tower (local coords, will be scaled by 8)
        earthPortalG.position.set(-200+8*5,0,8*5); // offset from VB center
        cityGroup.add(earthPortalG);
        window._earthReturnPortal={group:earthPortalG,x:-200+8*5,z:8*5,ring:epRing,inner:epInner,earth:epEarth};
        // Add to portals array for proximity detection
        portals.push({mesh:earthPortalG,ring:epRing,inner:epInner,
            name:'\uD83C\uDF0D '+L('earthReturn'),desc:L('earthReturnDesc'),
            raceIndex:-1,x:-200+8*5,z:8*5,y:0,color:0x3366CC,_hiddenType:'earthReturn',_targetStyle:-99});
        // (Moon mini-game portals removed — races are Earth-only)
        // ---- Moon city props (inside Von Braun) ----
        // Oxygen tanks
        var _vbPropsData=[
            {type:'tank',x:-200+8*3,z:8*2},{type:'tank',x:-200-8*3,z:-8*2},
            {type:'tank',x:-200+8*7,z:-8*3},{type:'tank',x:-200-8*6,z:8*4},
            {type:'crate',x:-200+8*(-2),z:8*6},{type:'crate',x:-200+8*4,z:-8*5},
            {type:'crate',x:-200-8*5,z:-8*6},{type:'crate',x:-200+8*(-8),z:8*2},
            {type:'barrel',x:-200+8*6,z:8*7},{type:'barrel',x:-200-8*4,z:8*(-3)},
            {type:'antenna',x:-200+8*(-7),z:8*(-5)},{type:'antenna',x:-200+8*8,z:8*(-7)}
        ];
        for(var vpi=0;vpi<_vbPropsData.length;vpi++){
            var vpd=_vbPropsData[vpi];
            var vpG=new THREE.Group();
            if(vpd.type==='tank'){
                // Oxygen/fuel tank
                var tk=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,2,8),toon(0xDDDDDD));
                tk.position.y=1;vpG.add(tk);
                var tkTop=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,4),toon(0xCCCCCC));
                tkTop.position.y=2;vpG.add(tkTop);
                var tkValve=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.3,4),toon(0xCC2222));
                tkValve.position.y=2.3;vpG.add(tkValve);
                vpG.position.set(vpd.x,0,vpd.z);
                cityGroup.add(vpG);
                cityProps.push({group:vpG,x:vpd.x,z:vpd.z,radius:0.8,type:'tank',grabbed:false,origY:0,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:1.8});
            } else if(vpd.type==='crate'){
                // Supply crate
                var cr=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5),toon(0x887744));
                cr.position.y=0.75;vpG.add(cr);
                var crStripe=new THREE.Mesh(new THREE.BoxGeometry(1.55,0.15,1.55),toon(0xCC8833));
                crStripe.position.y=0.75;vpG.add(crStripe);
                vpG.position.set(vpd.x,0,vpd.z);
                cityGroup.add(vpG);
                cityProps.push({group:vpG,x:vpd.x,z:vpd.z,radius:1.0,type:'crate',grabbed:false,origY:0,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:2.5});
            } else if(vpd.type==='barrel'){
                // Fuel barrel
                var br=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1.5,8),toon(0x336633));
                br.position.y=0.75;vpG.add(br);
                var brBand=new THREE.Mesh(new THREE.TorusGeometry(0.52,0.05,6,12),toon(0x888888));
                brBand.position.y=0.4;brBand.rotation.x=Math.PI/2;vpG.add(brBand);
                vpG.position.set(vpd.x,0,vpd.z);
                cityGroup.add(vpG);
                cityProps.push({group:vpG,x:vpd.x,z:vpd.z,radius:0.8,type:'barrel',grabbed:false,origY:0,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:2.0});
            } else if(vpd.type==='antenna'){
                // Communication antenna
                var anPole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,4,4),toon(0xAAAAAA));
                anPole.position.y=2;vpG.add(anPole);
                var anDish=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,4,0,Math.PI*2,0,Math.PI/2),toon(0xCCCCCC));
                anDish.position.y=4;anDish.rotation.x=Math.PI*0.7;vpG.add(anDish);
                vpG.position.set(vpd.x,0,vpd.z);
                cityGroup.add(vpG);
                cityProps.push({group:vpG,x:vpd.x,z:vpd.z,radius:0.6,type:'antenna',grabbed:false,origY:0,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:1.2});
            }
        }
        // ---- Mobile Suit battles in moon space ----
        window._moonGundams=[];
        window._moonBeams=[];
        window._moonMissiles=[];
        // MS units: 6 Gundam, 20 GM, 60 Zaku, 14 Dom = 100 Gundam-verse
        // Macross: 8 VF-1 Valkyrie, 1 SDF-1, 15 Zentradi pods, 6 Zentradi cruisers = 30 Macross
        var msUnits=[];
        msUnits.push({ms:'gundam',weapon:'rifle'});msUnits.push({ms:'gundam',weapon:'saber'});msUnits.push({ms:'gundam',weapon:'funnel'});msUnits.push({ms:'gundam',weapon:'rifle'});
        for(var gmi=0;gmi<12;gmi++){msUnits.push({ms:'gm',weapon:Math.random()<0.5?'rifle':Math.random()<0.5?'saber':'missile'});}
        var zakuColors=[0x336633,0x225522,0x447744,0xCC2222,0x882222,0x224488,0x335533,0x556655,0x443366,0x228844];
        for(var zki=0;zki<35;zki++){msUnits.push({ms:'zaku',weapon:Math.random()<0.35?'rifle':Math.random()<0.5?'missile':'saber',color:zakuColors[zki%zakuColors.length]});}
        for(var dmi=0;dmi<8;dmi++){msUnits.push({ms:'dom',weapon:Math.random()<0.5?'rifle':'missile'});}
        // Macross units
        for(var vfi=0;vfi<5;vfi++){msUnits.push({ms:'valkyrie',weapon:'rifle'});}
        msUnits.push({ms:'sdf1',weapon:'missile'});
        for(var zpi=0;zpi<10;zpi++){msUnits.push({ms:'zenPod',weapon:'rifle'});}
        for(var zci=0;zci<4;zci++){msUnits.push({ms:'zenCruiser',weapon:'missile'});}
        for(var gi=0;gi<msUnits.length;gi++){
            var mu=msUnits[gi];
            var gd=_buildMobileSuit(mu.ms,mu.weapon,mu.color);
            // Spawn above battlefield area (right side, x>0)
            var gAlt=30+Math.random()*60; // altitude above ground
            if(mu.ms==='sdf1')gAlt=200+Math.random()*100;
            if(mu.ms==='zenCruiser')gAlt=150+Math.random()*100;
            // Spread across entire battlefield area (all directions, avoid cities)
            var gAngle=Math.random()*Math.PI*2;
            var gDist=80+Math.random()*300;
            var gFlatX=Math.cos(gAngle)*gDist;
            var gFlatZ=Math.sin(gAngle)*gDist;
            // Avoid spawning inside city zones
            var _gInCity=false;
            if(Math.sqrt((gFlatX+200)*(gFlatX+200)+gFlatZ*gFlatZ)<170)_gInCity=true;
            if(Math.sqrt((gFlatX+200)*(gFlatX+200)+(gFlatZ+200)*(gFlatZ+200))<110)_gInCity=true;
            if(_gInCity){gFlatX=100+Math.random()*250;gFlatZ=(Math.random()-0.5)*500;}
            gd.group.position.set(gFlatX,gAlt,gFlatZ);
            gd.group.scale.set(2,2,2);
            scene.add(gd.group);
            var faction;
            if(mu.ms==='gundam'||mu.ms==='gm')faction='efsf';
            else if(mu.ms==='valkyrie'||mu.ms==='sdf1')faction='unSpacy';
            else if(mu.ms==='zenPod'||mu.ms==='zenCruiser')faction='zentradi';
            else faction='zeon';
            // Faction-based spawn zones (formations)
            // Zeon: near cities (defenders), EFSF: north, UN Spacy: east, Zentradi: south
            var _fZone={efsf:{cx:300,cz:-350},unSpacy:{cx:350,cz:300},zentradi:{cx:-250,cz:350},zeon:{cx:-300,cz:-150}};
            var _fz=_fZone[faction];
            gFlatX=_fz.cx+(Math.random()-0.5)*400;
            gFlatZ=_fz.cz+(Math.random()-0.5)*400;
            // Random waypoint AI state
            var wpAngle=Math.random()*Math.PI*2;
            var wpElev=(Math.random()-0.5)*Math.PI*0.3;
            var wpR=50+Math.random()*100;
            if(mu.ms==='sdf1')wpR=200+Math.random()*100;
            if(mu.ms==='zenCruiser')wpR=150+Math.random()*100;
            window._moonGundams.push({group:gd.group,type:mu.weapon,ms:mu.ms,faction:faction,
                px:gFlatX,py:gAlt,pz:gFlatZ,
                wpAngle:wpAngle,wpElev:wpElev,wpR:wpR,
                wpTimer:30+Math.floor(Math.random()*60),
                speed:mu.ms==='sdf1'?1.0:mu.ms==='zenCruiser'?1.2:1.8+Math.random()*1.8,
                phase:Math.random()*Math.PI*2,
                actionTimer:Math.floor(Math.random()*30),
                funnels:gd.funnels||null,saberMesh:gd.saberMesh||null,weapon:gd.weapon||null,
                target:null,dodgeTimer:0,dodgeDir:null,
                hp:mu.ms==='sdf1'?50:mu.ms==='zenCruiser'?30:mu.ms==='gundam'?12:mu.ms==='dom'?10:8,
                hpMax:mu.ms==='sdf1'?50:mu.ms==='zenCruiser'?30:mu.ms==='gundam'?12:mu.ms==='dom'?10:8,
                _dead:false,_respawnTimer:0,_msType:mu.ms,_weaponType:mu.weapon,_color:mu.color
            });
        }
        // Pair up saber units for cross-faction duels
        var _allSabers=window._moonGundams.filter(function(g2){return g2.type==='saber';});
        for(var sp=0;sp<_allSabers.length;sp++){
            if(_allSabers[sp].duelPartner)continue;
            for(var sp2=sp+1;sp2<_allSabers.length;sp2++){
                if(_allSabers[sp2].duelPartner)continue;
                if(_allSabers[sp].faction!==_allSabers[sp2].faction){
                    _allSabers[sp].duelPartner=_allSabers[sp2];
                    _allSabers[sp2].duelPartner=_allSabers[sp];break;
                }
            }
        }
    }
}

function _buildMobileSuit(msType,weaponType,customColor){
    var g=new THREE.Group();
    var gray=toon(0x666677);var darkGray=toon(0x333344);
    var glowMat=new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.6});
    var result={group:g};
    if(msType==='gundam'){
        var w=toon(0xEEEEF0),b=toon(0x2244AA),r=toon(0xCC2222),y=toon(0xDDAA00);
        g.add(new THREE.Mesh(new THREE.BoxGeometry(1.8,2.0,1.0),w));
        var v1=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.3,0.15),r);v1.position.set(-0.45,0.5,0.55);g.add(v1);
        var v2=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.3,0.15),r);v2.position.set(0.45,0.5,0.55);g.add(v2);
        var wa2=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.4,0.8),y);wa2.position.y=-1.2;g.add(wa2);
        var hd=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.8,0.8),w);hd.position.y=1.5;g.add(hd);
        var f1=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.7,4),y);f1.position.set(-0.3,2.1,0.1);f1.rotation.z=0.5;g.add(f1);
        var f2=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.7,4),y);f2.position.set(0.3,2.1,0.1);f2.rotation.z=-0.5;g.add(f2);
        var gvi=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.2,0.15),new THREE.MeshBasicMaterial({color:0x44FF88}));gvi.position.set(0,1.55,0.45);g.add(gvi);
        var ch=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.15,0.2),r);ch.position.set(0,1.2,0.35);g.add(ch);
        var s1=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.7),b);s1.position.set(-1.5,0.6,0);g.add(s1);
        var s2=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.7),b);s2.position.set(1.5,0.6,0);g.add(s2);
        [[-1.5,w],[1.5,w]].forEach(function(p){var a=new THREE.Mesh(new THREE.BoxGeometry(0.4,1.4,0.4),p[1]);a.position.set(p[0],-0.4,0);g.add(a);var h=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.3,0.35),gray);h.position.set(p[0],-1.2,0);g.add(h);});
        [[-0.45,w,b,r],[0.45,w,b,r]].forEach(function(p){var u=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.0,0.5),p[1]);u.position.set(p[0],-1.9,0);g.add(u);var l=new THREE.Mesh(new THREE.BoxGeometry(0.55,1.2,0.55),p[2]);l.position.set(p[0],-3.1,0);g.add(l);var ft=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.3,0.8),p[3]);ft.position.set(p[0],-3.85,0.1);g.add(ft);});
        var bp=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.4,0.6),gray);bp.position.set(0,0.2,-0.8);g.add(bp);
        [[-0.35],[0.35]].forEach(function(p){var t=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,0.5,6),darkGray);t.position.set(p[0],-0.3,-1.1);g.add(t);var gl=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.8,6),glowMat);gl.position.set(p[0],-0.9,-1.1);gl.rotation.x=Math.PI;g.add(gl);});
        var sh=new THREE.Group();sh.add(new THREE.Mesh(new THREE.BoxGeometry(0.15,2.0,1.2),w));var sht=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.6,1.0),r);sht.position.y=0.8;sh.add(sht);var shc=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.15,0.8),y);shc.position.y=0.2;sh.add(shc);sh.position.set(-2.0,-0.3,0.3);g.add(sh);
    } else if(msType==='gm'){
        var bg=toon(0xCCBB99),r2=toon(0xCC3333),dkBg=toon(0xAA9977);
        g.add(new THREE.Mesh(new THREE.BoxGeometry(1.7,1.9,0.9),bg));
        var gwa=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.4,0.7),dkBg);gwa.position.y=-1.15;g.add(gwa);
        var ghd=new THREE.Mesh(new THREE.BoxGeometry(0.85,0.75,0.75),bg);ghd.position.y=1.4;g.add(ghd);
        var gmvi=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.2,0.15),new THREE.MeshBasicMaterial({color:0xFF4444}));gmvi.position.set(0,1.45,0.42);g.add(gmvi);
        var gs1=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.6),r2);gs1.position.set(-1.4,0.5,0);g.add(gs1);
        var gs2=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.6),r2);gs2.position.set(1.4,0.5,0);g.add(gs2);
        [[-1.4,bg],[1.4,bg]].forEach(function(p){var a=new THREE.Mesh(new THREE.BoxGeometry(0.38,1.3,0.38),p[1]);a.position.set(p[0],-0.4,0);g.add(a);var h=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.28,0.32),gray);h.position.set(p[0],-1.15,0);g.add(h);});
        [[-0.42,bg,dkBg],[0.42,bg,dkBg]].forEach(function(p){var u=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.95,0.48),p[1]);u.position.set(p[0],-1.8,0);g.add(u);var l=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.1,0.5),p[2]);l.position.set(p[0],-2.95,0);g.add(l);var ft=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.28,0.7),p[2]);ft.position.set(p[0],-3.65,0.1);g.add(ft);});
        var gbp=new THREE.Mesh(new THREE.BoxGeometry(1.0,1.2,0.5),gray);gbp.position.set(0,0.1,-0.7);g.add(gbp);
        [[-0.3],[0.3]].forEach(function(p){var gt=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.7,6),glowMat);gt.position.set(p[0],-0.7,-0.7);gt.rotation.x=Math.PI;g.add(gt);});
        var gsh=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.6,1.0),r2);gsh.position.set(-1.9,-0.2,0.3);g.add(gsh);
    } else if(msType==='zaku'){
        var zc=toon(customColor||0x336633);var zdk=toon(0x224422);
        g.add(new THREE.Mesh(new THREE.BoxGeometry(1.7,1.9,0.9),zc));
        var zwa=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.4,0.7),zdk);zwa.position.y=-1.15;g.add(zwa);
        var zhd=new THREE.Mesh(new THREE.SphereGeometry(0.55,8,6),zc);zhd.position.y=1.5;g.add(zhd);
        var zeye=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),new THREE.MeshBasicMaterial({color:0xFF44AA}));zeye.position.set(0,1.5,0.5);g.add(zeye);
        var zt1=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.8,6),gray);zt1.position.set(0.3,1.2,0.3);zt1.rotation.z=0.5;g.add(zt1);
        var zt2=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.8,6),gray);zt2.position.set(-0.3,1.2,0.3);zt2.rotation.z=-0.5;g.add(zt2);
        var zs1=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.6),zc);zs1.position.set(-1.4,0.5,0);g.add(zs1);
        var zs2=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.7,0.8),zc);zs2.position.set(1.4,0.6,0);g.add(zs2);
        var zspk=new THREE.Mesh(new THREE.ConeGeometry(0.15,0.6,6),gray);zspk.position.set(1.4,1.1,0);g.add(zspk);
        [[-1.4,zc],[1.4,zc]].forEach(function(p){var a=new THREE.Mesh(new THREE.BoxGeometry(0.38,1.3,0.38),p[1]);a.position.set(p[0],-0.4,0);g.add(a);var h=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.28,0.32),gray);h.position.set(p[0],-1.15,0);g.add(h);});
        [[-0.42,zc,zdk],[0.42,zc,zdk]].forEach(function(p){var u=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.95,0.48),p[1]);u.position.set(p[0],-1.8,0);g.add(u);var l=new THREE.Mesh(new THREE.BoxGeometry(0.52,1.1,0.52),p[2]);l.position.set(p[0],-2.95,0);g.add(l);var ft=new THREE.Mesh(new THREE.BoxGeometry(0.52,0.28,0.7),p[2]);ft.position.set(p[0],-3.65,0.1);g.add(ft);});
        var zbp=new THREE.Mesh(new THREE.BoxGeometry(0.9,1.0,0.5),gray);zbp.position.set(0,0.1,-0.7);g.add(zbp);
        var zgl=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.7,6),glowMat);zgl.position.set(0,-0.6,-0.7);zgl.rotation.x=Math.PI;g.add(zgl);
        var zsh=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,0.12,8),zc);zsh.rotation.z=Math.PI/2;zsh.position.set(-1.9,-0.2,0.3);g.add(zsh);
    } else if(msType==='dom'){
        var dc2=toon(0x332244);var dlc=toon(0x443355);var dblk=toon(0x1A1A2A);
        g.add(new THREE.Mesh(new THREE.BoxGeometry(2.0,2.0,1.1),dc2));
        var dwa=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.4,0.9),dblk);dwa.position.y=-1.2;g.add(dwa);
        var dhd=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.7,0.7),dc2);dhd.position.y=1.5;g.add(dhd);
        var dvi=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.15,0.15),new THREE.MeshBasicMaterial({color:0xFF4444}));dvi.position.set(0,1.55,0.4);g.add(dvi);
        var ds1=new THREE.Mesh(new THREE.SphereGeometry(0.5,6,5),dlc);ds1.position.set(-1.5,0.6,0);g.add(ds1);
        var ds2=new THREE.Mesh(new THREE.SphereGeometry(0.5,6,5),dlc);ds2.position.set(1.5,0.6,0);g.add(ds2);
        var da1=new THREE.Mesh(new THREE.BoxGeometry(0.42,1.3,0.42),dc2);da1.position.set(-1.5,-0.4,0);g.add(da1);
        var da2=new THREE.Mesh(new THREE.BoxGeometry(0.42,1.3,0.42),dc2);da2.position.set(1.5,-0.4,0);g.add(da2);
        var dsk=new THREE.Mesh(new THREE.CylinderGeometry(0.8,1.4,1.8,8),dblk);dsk.position.y=-2.3;g.add(dsk);
        var dgl=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.3,0.3,8),new THREE.MeshBasicMaterial({color:0x6644FF,transparent:true,opacity:0.4}));dgl.position.y=-3.3;g.add(dgl);
        var dbp=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.2,0.5),gray);dbp.position.set(0,0.2,-0.8);g.add(dbp);
    } else if(msType==='valkyrie'){
        return _buildValkyrie();
    } else if(msType==='sdf1'){
        return _buildSDF1();
    } else if(msType==='zenPod'){
        return _buildZenPod();
    } else if(msType==='zenCruiser'){
        return _buildZenCruiser();
    }
    // Weapons (shared across all MS types)
    if(weaponType==='rifle'){
        var rf=new THREE.Group();var brl=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,2.5,6),gray);brl.rotation.x=Math.PI/2;brl.position.z=1.0;rf.add(brl);var rfgrp=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.4,0.3),darkGray);rfgrp.position.set(0,-0.15,0);rf.add(rfgrp);rf.position.set(1.5,-1.0,0.5);g.add(rf);result.weapon=rf;
    } else if(weaponType==='saber'){
        var sb=new THREE.Group();sb.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.5,6),gray));
        var bld=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.02,2.5,6),new THREE.MeshBasicMaterial({color:msType==='zaku'||msType==='dom'?0xFF4466:0xFF88CC,transparent:true,opacity:0.8}));bld.position.y=1.5;sb.add(bld);
        sb.position.set(1.5,-0.5,0.8);sb.rotation.x=-0.3;g.add(sb);result.saberMesh=sb;
    } else if(weaponType==='funnel'){
        var funnels=[];
        for(var fi2=0;fi2<6;fi2++){var fnG=new THREE.Group();var fnBody=new THREE.Mesh(new THREE.ConeGeometry(0.35,0.9,4),toon(0x8866AA));fnG.add(fnBody);var fnGlow=new THREE.Mesh(new THREE.SphereGeometry(0.2,4,3),new THREE.MeshBasicMaterial({color:0xFF44FF,transparent:true,opacity:0.5}));fnGlow.position.y=-0.5;fnG.add(fnGlow);var fa2=fi2*Math.PI*2/6;fnG.position.set(Math.cos(fa2)*3,Math.sin(fa2)*2,Math.sin(fa2)*3);g.add(fnG);funnels.push({mesh:fnG,angle:fa2,dist:3+Math.random()});}
        result.funnels=funnels;
    } else if(weaponType==='missile'){
        [[-1.5],[1.5]].forEach(function(p){var pd=new THREE.Group();for(var mi=0;mi<3;mi++){var tb=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.8,6),darkGray);tb.position.set(0,0,mi*0.25-0.25);tb.rotation.x=Math.PI/2;pd.add(tb);}pd.position.set(p[0],1.1,0);g.add(pd);});
    }
    g.scale.set(0.4,0.4,0.4); // realistic proportions, visible at moon scale
    if(msType==='sdf1')g.scale.set(0.8,0.8,0.8);
    if(msType==='zenCruiser')g.scale.set(0.3,0.3,0.3);
    return result;
}
// ---- Macross units ----
function _buildValkyrie(){
    var g=new THREE.Group();
    var w=toon(0xEEEEEE),r=toon(0xCC2222),b=toon(0x2244AA),dk=toon(0x444455);
    // Fuselage
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.8,0.5,3.5),w));
    // Nose cone
    var nose=new THREE.Mesh(new THREE.ConeGeometry(0.35,1.5,6),w);nose.rotation.x=Math.PI/2;nose.position.z=2.5;g.add(nose);
    // Canopy
    var canopy=new THREE.Mesh(new THREE.SphereGeometry(0.25,6,4,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.6}));
    canopy.position.set(0,0.35,1.2);g.add(canopy);
    // Wings (swept)
    var wingL=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.08,1.2),w);wingL.position.set(-1.5,0,-0.3);wingL.rotation.y=0.15;g.add(wingL);
    var wingR=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.08,1.2),w);wingR.position.set(1.5,0,-0.3);wingR.rotation.y=-0.15;g.add(wingR);
    // Tail fins
    var tailV=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.8,0.6),b);tailV.position.set(0,0.4,-1.5);g.add(tailV);
    var tailL=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.06,0.5),w);tailL.position.set(-0.5,0,-1.5);g.add(tailL);
    var tailR=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.06,0.5),w);tailR.position.set(0.5,0,-1.5);g.add(tailR);
    // Engines
    var eng1=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,1.0,6),dk);eng1.rotation.x=Math.PI/2;eng1.position.set(-0.4,-0.15,-1.8);g.add(eng1);
    var eng2=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,1.0,6),dk);eng2.rotation.x=Math.PI/2;eng2.position.set(0.4,-0.15,-1.8);g.add(eng2);
    // Engine glow
    var gl1=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.6,6),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.6}));gl1.rotation.x=-Math.PI/2;gl1.position.set(-0.4,-0.15,-2.4);g.add(gl1);
    var gl2=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.6,6),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.6}));gl2.rotation.x=-Math.PI/2;gl2.position.set(0.4,-0.15,-2.4);g.add(gl2);
    // Red stripes
    var stripe=new THREE.Mesh(new THREE.BoxGeometry(0.82,0.06,0.4),r);stripe.position.set(0,0.28,0.5);g.add(stripe);
    g.scale.set(0.7,0.7,0.7);
    return {group:g};
}
function _buildSDF1(){
    var g=new THREE.Group();
    var w=toon(0xCCCCDD),dk=toon(0x555566),r=toon(0xCC2222);
    // Main body (long hull)
    g.add(new THREE.Mesh(new THREE.BoxGeometry(3,3,18),w));
    // Bridge tower
    var bridge=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.5,2),dk);bridge.position.set(0,2.5,4);g.add(bridge);
    // Arm booms (Daedalus/Prometheus)
    var armL=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,8),w);armL.position.set(-3.5,0,2);g.add(armL);
    var armR=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,8),w);armR.position.set(3.5,0,2);g.add(armR);
    // Carrier decks at arm ends
    var deckL=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.5,4),dk);deckL.position.set(-3.5,0.5,6.5);g.add(deckL);
    var deckR=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.5,4),dk);deckR.position.set(3.5,0.5,6.5);g.add(deckR);
    // Main cannon (bow)
    var cannon=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.8,6,8),r);cannon.rotation.x=Math.PI/2;cannon.position.set(0,0,12);g.add(cannon);
    // Engine block
    var eng=new THREE.Mesh(new THREE.BoxGeometry(4,3,3),dk);eng.position.set(0,0,-9);g.add(eng);
    // Engine glow
    for(var ei=0;ei<4;ei++){var egl=new THREE.Mesh(new THREE.ConeGeometry(0.6,2,6),new THREE.MeshBasicMaterial({color:0x44CCFF,transparent:true,opacity:0.5}));egl.rotation.x=-Math.PI/2;egl.position.set(-1.2+ei*0.8,0,-11);g.add(egl);}
    // Antenna
    var ant=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,4,4),w);ant.position.set(0,4.5,4);g.add(ant);
    g.scale.set(0.8,0.8,0.8);
    return {group:g};
}
function _buildZenPod(){
    var g=new THREE.Group();
    var grn=toon(0x446644),dk=toon(0x334433);
    // Body (egg-shaped)
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),grn));
    // Legs
    var leg1=new THREE.Mesh(new THREE.BoxGeometry(0.2,1.5,0.2),dk);leg1.position.set(-0.5,-1.3,0);leg1.rotation.z=0.2;g.add(leg1);
    var leg2=new THREE.Mesh(new THREE.BoxGeometry(0.2,1.5,0.2),dk);leg2.position.set(0.5,-1.3,0);leg2.rotation.z=-0.2;g.add(leg2);
    // Eye
    var eye=new THREE.Mesh(new THREE.SphereGeometry(0.15,6,4),new THREE.MeshBasicMaterial({color:0xFF4444}));eye.position.set(0,0.2,0.75);g.add(eye);
    // Gun arm
    var gun=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1.2,6),dk);gun.rotation.x=Math.PI/2;gun.position.set(0.7,0,0.5);g.add(gun);
    g.scale.set(0.5,0.5,0.5);
    return {group:g};
}
function _buildZenCruiser(){
    var g=new THREE.Group();
    var grn=toon(0x335533),dk=toon(0x223322),r=toon(0x884422);
    // Hull (elongated)
    g.add(new THREE.Mesh(new THREE.BoxGeometry(2,1.5,10),grn));
    // Bow
    var bow=new THREE.Mesh(new THREE.ConeGeometry(1.0,3,6),grn);bow.rotation.x=Math.PI/2;bow.position.z=6.5;g.add(bow);
    // Engine section
    var eng=new THREE.Mesh(new THREE.BoxGeometry(2.5,2,3),dk);eng.position.z=-5.5;g.add(eng);
    // Turrets
    for(var ti=0;ti<3;ti++){var turret=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.5,6),r);turret.position.set(0,1,ti*3-2);g.add(turret);}
    // Engine glow
    var egl=new THREE.Mesh(new THREE.ConeGeometry(0.8,2,6),new THREE.MeshBasicMaterial({color:0x44FF44,transparent:true,opacity:0.4}));egl.rotation.x=-Math.PI/2;egl.position.z=-7.5;g.add(egl);
    g.scale.set(0.3,0.3,0.3);
    return {group:g};
}

