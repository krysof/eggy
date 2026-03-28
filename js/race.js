// race.js — DANBO World
// ============================================================
//  RACE TRACK SYSTEM
// ============================================================
const raceGroup = new THREE.Group();
raceGroup.visible = false;
scene.add(raceGroup);
const obstacleObjects = [];
const raceCoins = [];
const TRACK_W = RACE_CONFIG.trackWidth;
let trackSegments = [];

function clearRace() {
    while(raceGroup.children.length){
        const c=raceGroup.children[0]; raceGroup.remove(c);
        c.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});
    }
    obstacleObjects.length=0;
    for(var rc of raceCoins) raceGroup.remove(rc.mesh);
    raceCoins.length=0;
    // Remove race eggs
    for(const e of allEggs) if(!e.cityNPC) scene.remove(e.mesh);
    const keep=allEggs.filter(e=>e.cityNPC);
    allEggs.length=0; allEggs.push(...keep);
    playerEgg=null;
    _jumpCharging=false;_jumpCharge=0;if(_jumpChargeBar){scene.remove(_jumpChargeBar);_jumpChargeBar=null;}
    if(_sprintBar){scene.remove(_sprintBar);_sprintBar=null;}_sprintCharge=0;_ascendSmoke=false;
}

function getSegAt(z){for(var s of trackSegments)if(z>=s.startZ&&z<s.endZ)return s;return trackSegments[trackSegments.length-1];}
function getHW(z){const s=getSegAt(z);return s?s.width:TRACK_W;}
function getFloorY(z,x){
    const s=getSegAt(z);
    if(!s) return 0;
    if(s.type==='platforms') return -100; // no floor — must land on moving platforms
    if(s.type==='ramp'){const t=(z-s.startZ)/(s.endZ-s.startZ);return s.startY+t*(s.endY-s.startY);}
    return s.floorY||0;
}

const FLOOR_THEMES=RACE_CONFIG.floorThemes;

function buildRaceTrack(ri){
    clearRace();
    const segs=[]; let cz=0, curY=0;
    const theme=FLOOR_THEMES[ri%FLOOR_THEMES.length];
    function add(len,type,o={}){
        const seg={startZ:cz,endZ:cz+len,type,width:o.width||TRACK_W,floorY:curY,startY:curY,endY:curY,...o};
        if(type==='ramp'){seg.startY=curY;seg.endY=o.endY!==undefined?o.endY:curY;curY=seg.endY;}
        segs.push(seg); cz+=len;
    }

    if(ri===0){
        add(22,'flat');add(20,'spinners',{count:3});add(8,'flat');
        add(12,'ramp',{endY:3});add(16,'platforms',{count:4});add(12,'ramp',{endY:0});
        add(18,'hammers',{count:3});add(10,'flat');
        add(14,'conveyor',{count:3});add(8,'flat');
        add(16,'rollers',{count:2});add(10,'flat');
        add(8,'narrow',{width:5.5});add(16,'bumpers',{count:6});
        add(20,'pendulums',{count:3});add(10,'flat');
        add(14,'fallingBlocks',{count:6});add(12,'flat');
    } else if(ri===1){
        add(18,'flat');add(22,'spinners',{count:4});add(6,'flat');
        add(14,'ramp',{endY:4});add(20,'platforms',{count:6});add(14,'ramp',{endY:0});
        add(22,'hammers',{count:5});add(8,'flat');
        add(18,'conveyor',{count:5});add(6,'flat');
        add(20,'pendulums',{count:4});add(8,'flat');
        add(10,'narrow',{width:5});add(20,'bumpers',{count:10});
        add(18,'rollers',{count:3});add(8,'flat');
        add(16,'fallingBlocks',{count:8});add(10,'flat');
    } else if(ri===2){
        add(14,'flat');add(24,'spinners',{count:5});add(6,'flat');
        add(16,'ramp',{endY:5});add(24,'platforms',{count:8});add(16,'ramp',{endY:0});
        add(24,'hammers',{count:6});add(6,'flat');
        add(20,'conveyor',{count:6});add(6,'flat');
        add(22,'pendulums',{count:5});add(6,'flat');
        add(8,'narrow',{width:4.5});add(22,'bumpers',{count:12});
        add(20,'rollers',{count:4});add(6,'flat');
        add(20,'fallingBlocks',{count:10});add(10,'flat');
    } else if(ri===3){
        add(12,'flat');add(26,'spinners',{count:6});add(4,'flat');
        add(18,'ramp',{endY:6});add(28,'platforms',{count:10});add(18,'ramp',{endY:0});
        add(26,'hammers',{count:7});add(4,'flat');
        add(22,'conveyor',{count:7});add(4,'flat');
        add(24,'pendulums',{count:6});add(4,'flat');
        add(6,'narrow',{width:4});add(24,'bumpers',{count:14});
        add(22,'rollers',{count:5});add(4,'flat');
        add(22,'fallingBlocks',{count:12});add(10,'flat');
    } else if(ri===4){
        // Green Gem Hills — Sonic style with coins, boosts, springs
        add(20,'flat');add(12,'coins',{count:20});
        add(10,'boost');add(15,'flat');add(8,'ramp',{endY:3});
        add(12,'coins',{count:15});add(10,'springs',{count:4});
        add(12,'ramp',{endY:0});add(8,'flat');
        add(20,'bumpers',{count:8});add(10,'coins',{count:12});
        add(10,'boost');add(12,'flat');
        add(14,'ramp',{endY:4});add(18,'platforms',{count:6});add(14,'ramp',{endY:0});
        add(10,'coins',{count:18});add(8,'springs',{count:3});
        add(16,'spinners',{count:2});add(10,'flat');
        add(12,'coins',{count:20});add(10,'boost');add(12,'flat');
    } else if(ri===5){
        // Flame Valley — boosts and conveyors, fast paced
        add(16,'flat');add(10,'boost');add(8,'coins',{count:10});
        add(14,'ramp',{endY:5});add(10,'coins',{count:12});add(14,'ramp',{endY:0});
        add(20,'conveyor',{count:6});add(6,'flat');
        add(10,'boost');add(12,'coins',{count:15});
        add(18,'spinners',{count:4});add(6,'flat');
        add(10,'springs',{count:5});add(8,'flat');
        add(16,'rollers',{count:3});add(10,'coins',{count:18});
        add(10,'boost');add(14,'flat');
        add(20,'hammers',{count:4});add(8,'coins',{count:10});
        add(12,'fallingBlocks',{count:6});add(10,'flat');
    } else if(ri===6){
        // Ice Slide — wide track, springs, lots of coins
        add(20,'flat',{width:14});add(12,'coins',{count:25});
        add(10,'boost');add(10,'springs',{count:6});
        add(16,'ramp',{endY:3});add(12,'coins',{count:15});add(16,'ramp',{endY:0});
        add(14,'flat',{width:14});add(10,'boost');
        add(20,'bumpers',{count:10});add(10,'coins',{count:20});
        add(12,'springs',{count:4});add(8,'flat');
        add(18,'platforms',{count:8});add(10,'coins',{count:15});
        add(14,'ramp',{endY:4});add(10,'boost');add(14,'ramp',{endY:0});
        add(16,'pendulums',{count:3});add(12,'coins',{count:20});add(10,'flat');
    } else if(ri===7){
        // Rainbow Sky — aerial platforms, coins everywhere
        add(14,'flat');add(10,'coins',{count:15});add(10,'boost');
        add(16,'ramp',{endY:6});add(24,'platforms',{count:10});
        add(10,'coins',{count:20});add(16,'ramp',{endY:3});
        add(10,'springs',{count:6});add(12,'coins',{count:15});
        add(14,'ramp',{endY:6});add(20,'platforms',{count:8});add(14,'ramp',{endY:0});
        add(10,'boost');add(12,'coins',{count:25});
        add(18,'spinners',{count:3});add(8,'flat');
        add(10,'springs',{count:4});add(10,'coins',{count:20});
        add(16,'pendulums',{count:3});add(10,'boost');
        add(12,'coins',{count:15});add(10,'flat');
    } else if(ri===8){
        // Mushroom Kingdom — Mario pipes, goombas, classic platforming
        add(20,'flat');add(14,'pipes',{count:4});add(8,'flat');
        add(10,'coins',{count:12});add(12,'goombas',{count:5});
        add(8,'flat');add(12,'ramp',{endY:3});
        add(16,'platforms',{count:5});add(12,'ramp',{endY:0});
        add(10,'pipes',{count:3});add(8,'coins',{count:10});
        add(14,'goombas',{count:6});add(8,'flat');
        add(10,'boost');add(12,'coins',{count:15});
        add(16,'spinners',{count:2});add(8,'flat');
        add(10,'pipes',{count:5});add(12,'goombas',{count:4});
        add(10,'coins',{count:18});add(10,'flat');
    } else if(ri===9){
        // Lava Castle — conveyors, falling blocks, pipes, fast pace
        add(16,'flat');add(10,'pipes',{count:3});
        add(14,'ramp',{endY:4});add(10,'goombas',{count:4});add(14,'ramp',{endY:0});
        add(18,'conveyor',{count:5});add(6,'flat');
        add(12,'pipes',{count:6});add(10,'coins',{count:12});
        add(16,'fallingBlocks',{count:8});add(6,'flat');
        add(10,'boost');add(12,'goombas',{count:6});
        add(8,'coins',{count:15});add(10,'pipes',{count:4});
        add(14,'hammers',{count:4});add(8,'flat');
        add(10,'springs',{count:4});add(12,'coins',{count:20});
        add(10,'goombas',{count:5});add(10,'flat');
    } else if(ri===10){
        // Cloud Heaven — lots of platforms, springs, coins
        add(18,'flat',{width:14});add(10,'coins',{count:20});
        add(10,'springs',{count:5});add(8,'flat');
        add(16,'ramp',{endY:5});add(20,'platforms',{count:8});
        add(10,'coins',{count:15});add(16,'ramp',{endY:2});
        add(10,'pipes',{count:3});add(12,'goombas',{count:4});
        add(10,'boost');add(8,'flat');
        add(14,'ramp',{endY:6});add(22,'platforms',{count:10});add(14,'ramp',{endY:0});
        add(10,'springs',{count:6});add(12,'coins',{count:25});
        add(10,'pipes',{count:4});add(10,'coins',{count:15});add(10,'flat');
    } else {
        // Bowser Castle — everything, max difficulty
        add(14,'flat');add(12,'pipes',{count:5});add(10,'goombas',{count:6});
        add(14,'ramp',{endY:5});add(10,'coins',{count:12});add(14,'ramp',{endY:0});
        add(18,'spinners',{count:4});add(6,'flat');
        add(14,'pipes',{count:6});add(12,'conveyor',{count:5});
        add(10,'goombas',{count:8});add(8,'coins',{count:15});
        add(16,'hammers',{count:5});add(6,'flat');
        add(12,'fallingBlocks',{count:10});add(10,'boost');
        add(14,'ramp',{endY:6});add(24,'platforms',{count:10});add(14,'ramp',{endY:0});
        add(10,'springs',{count:5});add(12,'pendulums',{count:4});
        add(10,'pipes',{count:4});add(12,'goombas',{count:6});
        add(10,'coins',{count:25});add(10,'flat');
    }


    trackLength=cz; trackSegments=segs;
    const sm=1+ri*0.2;

    for(let si=0;si<segs.length;si++){
        const seg=segs[si], len=seg.endZ-seg.startZ, hw=seg.width;
        const midZ=seg.startZ+len/2, midY=(seg.startY+seg.endY)/2;

        if(seg.type==='ramp'){
            const fl=new THREE.Mesh(new THREE.BoxGeometry(hw*2,0.5,len),toon(theme[si%2]));
            fl.position.set(0,midY-0.25,-midZ);
            fl.rotation.x=Math.atan2(seg.endY-seg.startY,len);
            fl.receiveShadow=true; raceGroup.add(fl);
        } else if(seg.type!=='platforms'){
            const fl=new THREE.Mesh(new THREE.BoxGeometry(hw*2,0.5,len),toon(theme[si%2]));
            fl.position.set(0,seg.floorY-0.25,-midZ); fl.receiveShadow=true; raceGroup.add(fl);
        }
        if(seg.type!=='narrow'&&seg.type!=='platforms'){
            const wg=new THREE.BoxGeometry(0.5,2,len);
            [-1,1].forEach(side=>{
                const w=new THREE.Mesh(wg,toon(0x9977DD,{transparent:true,opacity:0.45}));
                w.position.set(side*hw,seg.floorY+0.75,-midZ); raceGroup.add(w);
            });
        }
        if(seg.type==='narrow'){
            const rg=new THREE.CylinderGeometry(0.06,0.06,len,4);
            [-1,1].forEach(side=>{
                const rail=new THREE.Mesh(rg,toon(0xFFCC00));
                rail.rotation.x=Math.PI/2; rail.position.set(side*hw,seg.floorY+0.6,-midZ); raceGroup.add(rail);
            });
        }
        buildObs(seg,ri,sm);
    }
    // Finish
    for(let i=0;i<10;i++){
        const c=new THREE.Mesh(new THREE.BoxGeometry(TRACK_W*2/10,0.08,0.6),toon(i%2===0?0x222222:0xffffff));
        c.position.set(-TRACK_W+TRACK_W/5+i*TRACK_W*2/10,0.04,-trackLength); raceGroup.add(c);
    }
    const arch=new THREE.Mesh(new THREE.TorusGeometry(5,0.3,8,20,Math.PI),toon(0xFFD700));
    arch.position.set(0,0,-trackLength); arch.rotation.y=Math.PI/2; raceGroup.add(arch);
    return segs;
}

// ============================================================
//  OBSTACLE BUILDER
// ============================================================
function buildObs(seg,ri,sm){
    const len=seg.endZ-seg.startZ, hw=seg.width, fy=seg.floorY||0;

    if(seg.type==='spinners') for(let i=0;i<seg.count;i++){
        const oz=seg.startZ+(i+1)*len/(seg.count+1), al=hw*0.85;
        const piv=new THREE.Group(); piv.position.set(0,fy+1.2,-oz);
        const pl=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.35,1.2,8),toon(0x666666));
        pl.position.set(0,-0.6,0); pl.castShadow=true; piv.add(pl);
        const arm=new THREE.Mesh(new THREE.BoxGeometry(al*2,0.55,0.55),toon(0xFF4444)); arm.castShadow=true; piv.add(arm);
        [-1,1].forEach(s=>{const cp=new THREE.Mesh(new THREE.SphereGeometry(0.45,8,6),toon(0xCC0000));cp.position.x=s*al;cp.castShadow=true;piv.add(cp);});
        raceGroup.add(piv);
        obstacleObjects.push({type:'spinner',mesh:piv,data:{z:oz,fy,armLen:al,speed:(0.012+ri*0.004)*(i%2===0?1:-1)*sm,angle:i*Math.PI/Math.max(seg.count,1)}});
    }
    if(seg.type==='hammers') for(let i=0;i<seg.count;i++){
        const oz=seg.startZ+(i+1)*len/(seg.count+1), side=i%2===0?-1:1, al=4+ri*0.5;
        const pg=new THREE.Group(); pg.position.set(side*(hw+1),fy+5,-oz);
        pg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,5,6),toon(0x888888)));
        const sw=new THREE.Group();
        const rod=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,al,4),toon(0x999999)); rod.position.y=-al/2; sw.add(rod);
        const hd=new THREE.Mesh(new THREE.SphereGeometry(0.9,10,8),toon(0xFF6633)); hd.position.y=-al; hd.castShadow=true; sw.add(hd);
        [-1,1].forEach(s=>{
            const ew=new THREE.Mesh(new THREE.SphereGeometry(0.14,6,4),toon(0xffffff)); ew.position.set(s*0.28,-al+0.18,0.7); sw.add(ew);
            const eb=new THREE.Mesh(new THREE.SphereGeometry(0.08,4,4),toon(0x222222)); eb.position.set(s*0.28,-al+0.14,0.78); sw.add(eb);
        });
        pg.add(sw); raceGroup.add(pg);
        obstacleObjects.push({type:'hammer',mesh:pg,swing:sw,data:{z:oz,fy,armLen:al,side,speed:(0.016+ri*0.004)*sm,angle:0,pivotX:side*(hw+1),pivotY:fy+5}});
    }
    if(seg.type==='rollers') for(let i=0;i<seg.count;i++){
        const oz=seg.startZ+(i+1)*len/(seg.count+1);
        const rl=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,hw*1.8,12),toon(0xE74C3C));
        rl.rotation.z=Math.PI/2; rl.position.set(0,fy+0.8,-oz); rl.castShadow=true; raceGroup.add(rl);
        obstacleObjects.push({type:'roller',mesh:rl,data:{z:oz,fy,radius:0.8,speed:0.035*sm}});
    }
    if(seg.type==='bumpers') for(let i=0;i<seg.count;i++){
        const oz=seg.startZ+Math.random()*len, ox=(Math.random()-0.5)*hw*1.4, r=0.5+Math.random()*0.3;
        const bm=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),toon(0xFF69B4,{emissive:0xFF1493,emissiveIntensity:0.15}));
        bm.position.set(ox,fy+r,-oz); bm.castShadow=true; raceGroup.add(bm);
        obstacleObjects.push({type:'bumper',mesh:bm,data:{z:oz,fy,x:ox,radius:r,pulse:Math.random()*Math.PI*2}});
    }
    if(seg.type==='pendulums') for(let i=0;i<seg.count;i++){
        const oz=seg.startZ+(i+1)*len/(seg.count+1), chainLen=5+ri*0.5;
        const pg=new THREE.Group(); pg.position.set(0,fy+8,-oz);
        pg.add(new THREE.Mesh(new THREE.BoxGeometry(hw*1.6,0.4,0.4),toon(0x888888)));
        const arm=new THREE.Group();
        const chain=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,chainLen,4),toon(0xAAAAAA));
        chain.position.set(0,-chainLen/2,0); arm.add(chain);
        const ball=new THREE.Mesh(new THREE.SphereGeometry(1.0,10,8),toon(0x9933FF)); ball.position.y=-chainLen; ball.castShadow=true; arm.add(ball);
        pg.add(arm); raceGroup.add(pg);
        obstacleObjects.push({type:'pendulum',mesh:pg,arm,data:{z:oz,fy,chainLen,speed:(0.013+ri*0.003)*sm,angle:i*0.8,pivotY:fy+8}});
    }
    if(seg.type==='platforms') for(let i=0;i<seg.count;i++){
        const oz=seg.startZ+(i+0.5)*len/seg.count;
        const pw=5+Math.random()*3, pd=3.5;
        const pm=new THREE.Mesh(new THREE.BoxGeometry(pw,0.5,pd),toon(0x44AADD));
        pm.position.set(0,fy-0.25,-oz); pm.castShadow=true; pm.receiveShadow=true; raceGroup.add(pm);
        const moveRange=hw*0.35;
        pm.position.x=(i%2===0?-1:1)*moveRange*0.5;
        obstacleObjects.push({type:'platform',mesh:pm,data:{z:oz,fy,width:pw,depth:pd,moveRange,speed:(0.008+ri*0.003)*sm*(i%2===0?1:-1),phase:i*Math.PI/seg.count}});
    }
    if(seg.type==='conveyor') for(let i=0;i<seg.count;i++){
        const oz=seg.startZ+(i+1)*len/(seg.count+1);
        const beltLen=6, beltW=hw*1.2;
        const belt=new THREE.Mesh(new THREE.BoxGeometry(beltW,0.15,beltLen),toon(0x555555));
        belt.position.set(0,fy+0.08,-oz); raceGroup.add(belt);
        const dir=(i%2===0)?1:-1;
        for(let a=0;a<3;a++){
            const arr=new THREE.Mesh(new THREE.ConeGeometry(0.3,0.6,4),toon(0xFFFF00,{transparent:true,opacity:0.5}));
            arr.rotation.x=dir>0?0:Math.PI; arr.rotation.z=Math.PI;
            arr.position.set((a-1)*2,fy+0.2,-oz); raceGroup.add(arr);
        }
        obstacleObjects.push({type:'conveyor',mesh:belt,data:{z:oz,fy,halfLen:beltLen/2,halfW:beltW/2,pushX:dir*(0.04+ri*0.01)*sm,pushZ:0}});
    }
    if(seg.type==='fallingBlocks') for(let i=0;i<seg.count;i++){
        const oz=seg.startZ+Math.random()*len, ox=(Math.random()-0.5)*hw*1.4;
        const bSize=1.2+Math.random()*0.8;
        const block=new THREE.Mesh(new THREE.BoxGeometry(bSize,bSize,bSize),toon(0xFF8844));
        block.position.set(ox,fy+12+Math.random()*5,-oz); block.castShadow=true; raceGroup.add(block);
        const shadow=new THREE.Mesh(new THREE.CircleGeometry(bSize*0.6,8),toon(0xFF0000,{transparent:true,opacity:0,side:THREE.DoubleSide}));
        shadow.rotation.x=-Math.PI/2; shadow.position.set(ox,fy+0.05,-oz); raceGroup.add(shadow);
        obstacleObjects.push({type:'fallingBlock',mesh:block,shadow,data:{z:oz,fy,x:ox,size:bSize,baseY:fy+12+Math.random()*5,fallSpeed:0,falling:false,onGround:false,timer:100+Math.random()*160,resetTimer:0,warningTime:60}});
    }
    // ---- Coins (Sonic-style gold rings) ----
    if(seg.type==='coins') for(let i=0;i<(seg.count||10);i++){
        const oz=seg.startZ+(i+0.5)*len/(seg.count||10);
        const ox=(Math.sin(i*1.7))*hw*0.5;
        const coinG=new THREE.Group();
        const disc=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.08,12),toon(0xFFDD00,{emissive:0xFFAA00,emissiveIntensity:0.4}));
        disc.rotation.x=Math.PI/2; coinG.add(disc);
        const rim=new THREE.Mesh(new THREE.TorusGeometry(0.35,0.06,6,16),toon(0xFFCC00));
        coinG.add(rim);
        coinG.position.set(ox,fy+1.2,-oz);
        raceGroup.add(coinG);
        raceCoins.push({mesh:coinG,z:oz,x:ox,fy:fy,collected:false,bobPhase:i*0.5});
    }
    // ---- Boost pads ----
    if(seg.type==='boost'){
        const padCount=3;
        for(let i=0;i<padCount;i++){
            const oz=seg.startZ+(i+1)*len/(padCount+1);
            const padW=hw*1.2, padD=3;
            const pad=new THREE.Mesh(new THREE.BoxGeometry(padW,0.15,padD),toon(0x00CCFF,{emissive:0x0088FF,emissiveIntensity:0.5}));
            pad.position.set(0,fy+0.08,-oz); pad.receiveShadow=true; raceGroup.add(pad);
            // Arrow indicators
            for(let a=0;a<3;a++){
                const arr=new THREE.Mesh(new THREE.ConeGeometry(0.4,0.8,4),toon(0xFFFF00,{emissive:0xFFDD00,emissiveIntensity:0.4,transparent:true,opacity:0.7}));
                arr.rotation.x=Math.PI; arr.position.set((a-1)*2.5,fy+0.25,-oz);
                raceGroup.add(arr);
            }
            obstacleObjects.push({type:'boost',mesh:pad,data:{z:oz,fy:fy,halfW:padW/2,halfD:padD/2,strength:0.35}});
        }
    }
    // ---- Spring pads ----
    if(seg.type==='springs') for(let i=0;i<(seg.count||3);i++){
        const oz=seg.startZ+(i+1)*len/((seg.count||3)+1);
        const ox=(i%2===0?-1:1)*hw*0.25*(i%3);
        const sg2=new THREE.Group();
        // Base cylinder
        const base2=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.7,0.3,10),toon(0xFF4444));
        base2.position.y=0.15; sg2.add(base2);
        // Spring coil (stacked torus)
        for(let c=0;c<3;c++){
            const coil=new THREE.Mesh(new THREE.TorusGeometry(0.35,0.06,6,12),toon(0xCCCCCC));
            coil.position.y=0.4+c*0.18; coil.rotation.x=Math.PI/2; sg2.add(coil);
        }
        // Top plate
        const top2=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.5,0.15,10),toon(0xFF6666,{emissive:0xFF2222,emissiveIntensity:0.3}));
        top2.position.y=1.0; sg2.add(top2);
        sg2.position.set(ox,fy,-oz);
        raceGroup.add(sg2);
        obstacleObjects.push({type:'spring',mesh:sg2,data:{z:oz,fy:fy,x:ox,radius:0.7,jumpForce:0.5,anim:0}});
    }
    // ---- Mario Pipes (green warp pipes as obstacles) ----
    if(seg.type==='pipes') for(let i=0;i<(seg.count||3);i++){
        const oz=seg.startZ+(i+1)*len/((seg.count||3)+1);
        const ox=(i%2===0?-1:1)*hw*0.3*(0.5+Math.random()*0.5);
        const pH=2.0+Math.random()*1.5;
        const pg=new THREE.Group();
        // Pipe body
        const body2=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,pH,12),toon(0x33AA33));
        body2.position.y=pH/2; body2.castShadow=true; pg.add(body2);
        // Pipe rim (wider top)
        const rim2=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.0,0.4,12),toon(0x228822));
        rim2.position.y=pH+0.2; rim2.castShadow=true; pg.add(rim2);
        // Dark inside
        const hole=new THREE.Mesh(new THREE.CircleGeometry(0.7,12),toon(0x111111));
        hole.rotation.x=-Math.PI/2; hole.position.y=pH+0.41; pg.add(hole);
        // Highlight stripe
        const stripe=new THREE.Mesh(new THREE.CylinderGeometry(0.82,0.82,0.15,12),toon(0x55CC55));
        stripe.position.y=pH*0.6; pg.add(stripe);
        pg.position.set(ox,fy,-oz);
        raceGroup.add(pg);
        obstacleObjects.push({type:'pipe',mesh:pg,data:{z:oz,fy:fy,x:ox,radius:1.0,height:pH}});
    }
    // ---- Goombas (walking mushroom enemies) ----
    if(seg.type==='goombas') for(let i=0;i<(seg.count||3);i++){
        const oz=seg.startZ+(i+1)*len/((seg.count||3)+1);
        const ox=(Math.random()-0.5)*hw*1.0;
        const gg=new THREE.Group();
        // Body — brown mushroom cap
        const cap=new THREE.Mesh(new THREE.SphereGeometry(0.55,10,8),toon(0x8B4513));
        cap.scale.set(1.2,0.7,1.2); cap.position.y=0.7; cap.castShadow=true; gg.add(cap);
        // Stem/body
        const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.4,0.5,8),toon(0xFFDDAA));
        stem.position.y=0.3; gg.add(stem);
        // Angry eyes
        [-1,1].forEach(function(s){
            var ew2=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),toon(0xffffff));
            ew2.position.set(s*0.2,0.75,0.4); gg.add(ew2);
            var ep2=new THREE.Mesh(new THREE.SphereGeometry(0.07,4,4),toon(0x111111));
            ep2.position.set(s*0.2,0.73,0.48); gg.add(ep2);
            // Angry eyebrows
            var brow=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.04,0.04),toon(0x111111));
            brow.position.set(s*0.2,0.88,0.44); brow.rotation.z=s*0.4; gg.add(brow);
        });
        // Feet
        [-1,1].forEach(function(s){
            var ft=new THREE.Mesh(new THREE.SphereGeometry(0.15,6,4),toon(0x222222));
            ft.position.set(s*0.2,0.08,0); ft.scale.set(1,0.5,1.3); gg.add(ft);
        });
        gg.position.set(ox,fy,-oz);
        raceGroup.add(gg);
        obstacleObjects.push({type:'goomba',mesh:gg,data:{z:oz,fy:fy,x:ox,startX:ox,radius:0.6,walkDir:i%2===0?1:-1,walkRange:hw*0.6,walkSpeed:(0.02+ri*0.003)*sm,phase:i*Math.PI}});
    }
}

