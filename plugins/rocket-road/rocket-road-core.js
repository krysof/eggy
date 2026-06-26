// rocket-road-core.js — Danbo Rocket Road plugin
// 3D presentation with 2D arcade-road rules. Pure rules live in danbo_rocket_road.wasm with JS fallback.
(function(){
    'use strict';

    var PLAYER_Z=-16;
    var ROAD_SEG_LEN=8;
    var BUILD=202606271;

    function api(){return window.DANBO_MINIGAME_WASM&&window.DANBO_MINIGAME_WASM.rocketRoad;}
    function n(v,d){v=Number(v);return isFinite(v)?v:(d||0);}
    function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
    function esc(s){return String(s===undefined||s===null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
    function mat(color,opts){opts=opts||{};return new THREE.MeshStandardMaterial({color:color,roughness:opts.roughness===undefined?0.72:opts.roughness,metalness:opts.metalness||0,emissive:opts.emissive||0x000000,emissiveIntensity:opts.emissiveIntensity||0});}
    function colorFromCharacter(ch){var c=ch&&ch.style&&ch.style.color;if(!(typeof c==='number'&&isFinite(c)))c=ch&&ch.color;return (typeof c==='number'&&isFinite(c))?c:0x80EA7A;}
    function accentFromCharacter(ch){var c=ch&&ch.style&&ch.style.accent;if(!(typeof c==='number'&&isFinite(c)))c=ch&&ch.accent;return (typeof c==='number'&&isFinite(c))?c:0xffe15d;}
    function keyFromCharacter(ch){return String((ch&&(ch.key||ch.name||ch.id))||'egg').toLowerCase();}
    function charByIndex(i){
        var defs=(typeof CHAR_DEFS!=='undefined'&&CHAR_DEFS)||[];
        if(!defs.length)return {name:'egg',sf2:'Danbo',color:0xf5f5f0,accent:0xcc2222};
        i=Math.abs(i|0)%defs.length;return defs[i]||defs[0];
    }
    function addBox(parent,w,h,d,color,x,y,z){var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x||0,y||0,z||0);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
    function addWheel(parent,x,z){var geo=new THREE.CylinderGeometry(0.28,0.28,0.36,12);var mesh=new THREE.Mesh(geo,mat(0x252B35,{roughness:0.9}));mesh.rotation.z=Math.PI/2;mesh.position.set(x,0.28,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
    function addCone(parent,r,h,color,x,y,z,rx,rz){var m=new THREE.Mesh(new THREE.ConeGeometry(r,h,10),mat(color));m.position.set(x||0,y||0,z||0);m.rotation.x=rx||0;m.rotation.z=rz||0;m.castShadow=true;parent.add(m);return m;}
    function addMiniDriver(parent,ch,scale,x,y,z){
        var g=new THREE.Group(), bodyColor=colorFromCharacter(ch), accent=accentFromCharacter(ch), key=keyFromCharacter(ch);
        g.position.set(x||0,y||0,z||0);g.scale.setScalar(scale||1);
        var body=new THREE.Mesh(new THREE.SphereGeometry(0.38,18,12),mat(bodyColor,{roughness:0.82}));body.scale.set(0.88,1.05,0.82);body.position.y=0.08;body.castShadow=true;g.add(body);
        var head=new THREE.Mesh(new THREE.SphereGeometry(0.3,18,12),mat(bodyColor,{roughness:0.82}));head.scale.set(0.96,0.9,0.92);head.position.set(0,0.46,0.08);head.castShadow=true;g.add(head);
        var eyeGeo=new THREE.SphereGeometry(0.04,8,6), eyeMat=mat(0x1f2933);
        var e1=new THREE.Mesh(eyeGeo,eyeMat),e2=new THREE.Mesh(eyeGeo,eyeMat);e1.position.set(-0.1,0.5,0.34);e2.position.set(0.1,0.5,0.34);g.add(e1);g.add(e2);
        if(key.indexOf('bull')>=0){
            addCone(g,0.08,0.26,0xfff0c0,-0.25,0.58,0.06,0,Math.PI/2);
            addCone(g,0.08,0.26,0xfff0c0,0.25,0.58,0.06,0,-Math.PI/2);
        }else if(key.indexOf('cat')>=0||key.indexOf('dog')>=0){
            addCone(g,0.1,0.28,accent,-0.2,0.7,0.02,0,-0.28);
            addCone(g,0.1,0.28,accent,0.2,0.7,0.02,0,0.28);
        }else if(key.indexOf('bear')>=0||key.indexOf('monkey')>=0){
            var earGeo=new THREE.SphereGeometry(0.11,10,8), earMat=mat(accent,{roughness:0.82});
            var l=new THREE.Mesh(earGeo,earMat), r=new THREE.Mesh(earGeo,earMat);l.position.set(-0.25,0.55,0.02);r.position.set(0.25,0.55,0.02);l.castShadow=r.castShadow=true;g.add(l);g.add(r);
        }else if(key.indexOf('rooster')>=0){
            addBox(g,0.09,0.2,0.08,0xff344d,-0.09,0.72,0.03);addBox(g,0.09,0.25,0.08,0xff344d,0,0.75,0.04);addBox(g,0.09,0.18,0.08,0xff344d,0.09,0.71,0.03);
        }else if(key.indexOf('cockroach')>=0){
            addBox(g,0.04,0.34,0.04,accent,-0.16,0.72,0.1).rotation.z=-0.45;addBox(g,0.04,0.34,0.04,accent,0.16,0.72,0.1).rotation.z=0.45;
        }else{
            addBox(g,0.42,0.1,0.08,accent,0,0.72,0.04);
        }
        parent.add(g);return g;
    }

    var fallback={
        levelLength:function(){return 3300;},
        maxFuel:function(){return 100;},
        roadWidthAt:function(distance){var d=clamp(n(distance),0,3300);if(d<520)return 12;if(d<930)return 11.2-(d-520)/410*1.1;if(d<1420)return 8.8;if(d<1820)return 9.8;if(d<2380)return 7.4;if(d<2840)return 8.5;return 10.4;},
        laneX:function(lane,width){lane=Math.max(0,Math.min(3,lane|0));var inner=n(width,10)*0.72;return -inner*0.5+inner*(lane+0.5)/4;},
        eventCount:function(){return 60;},
        eventAt:function(i){
            i=Math.max(0,Math.min(59,i|0));var j,z,l,t,b=0;
            if(i<12){j=i;z=180+j*70;l=(j*2+1)%4;t=(j===2||j===9)?5:(j%5===0?2:1);b=t===5?18:0;return [z,l,t,0,j%3,b];}
            if(i<28){j=i-12;z=980+j*62;l=(j*3+2)%4;t=(j===1||j===12)?5:(j%6===0?6:(j%5===0?4:(j%3===0?3:2)));b=t===5?20:0;return [z,l,t,0,j%4,b];}
            if(i<44){j=i-28;z=1980+j*54;l=(j*5+1)%4;t=(j===4)?5:(j%4===0?6:(j%5===2?4:(j%2===0?3:2)));b=t===5?22:0;return [z,l,t,0,j%5,b];}
            j=i-44;z=2850+j*38;l=(j*7+3)%4;t=(j===10)?5:(j%7===0?6:(j%4===0?4:(j%3===0?3:2)));b=t===5?24:0;return [z,l,t,0,j%6,b];
        },
        speedFor:function(turbo,brake,spinning,fuel){if(fuel<=0)return 0;var s=brake?24:(turbo?58:38);if(spinning)s=18;if(fuel<12)s*=0.72;return s;},
        fuelAfter:function(fuel,dt,turbo,brake){var r=turbo?1.55:(brake?0.55:0.82);return clamp(n(fuel)-r*n(dt),0,100);},
        playerStep:function(x,vx,steer,dt,spinning,width){var control=spinning?0.22:1;vx+=clamp(steer,-1,1)*42*control*dt;var drag=Math.abs(steer)<0.01?7.5:3.2;vx*=clamp(1-drag*dt,0,1);vx=clamp(vx,-18,18);var half=width*0.5-0.75;x+=vx*dt;if(x>half){x=half;vx=-Math.abs(vx)*0.35;}if(x<-half){x=-half;vx=Math.abs(vx)*0.35;}return [x,vx];},
        collide:function(px,pz,ox,oz,t){var hx=1.1,hz=2.05;if(t===4){hx=1.55;hz=3.15;}else if(t===5){hx=1.18;hz=2.15;}else if(t===6){hx=1.65;hz=1.15;}else if(t===3){hx=1.16;hz=2.2;}else if(t===2){hx=1.2;hz=2.25;}return Math.abs(px-ox)<=hx&&Math.abs(pz-oz)<=hz;},
        score:function(progress,fuel,pickups,crashes,finished){var s=Math.floor(clamp(progress,0,3300)*3)+pickups*500+Math.floor(Math.max(0,fuel)*22)-crashes*350+(finished?2500:0);return Math.max(0,s);},
        finishReached:function(progress){return progress>=3300;}
    };

    function rules(){
        var a=api();
        return {
            mode:a?a.mode:'js-fallback',
            levelLength:function(){return a&&a.levelLength?a.levelLength():fallback.levelLength();},
            maxFuel:function(){return a&&a.maxFuel?a.maxFuel():fallback.maxFuel();},
            roadWidthAt:function(d){return a&&a.roadWidthAt?a.roadWidthAt(d):fallback.roadWidthAt(d);},
            laneX:function(l,w){return a&&a.laneX?a.laneX(l,w):fallback.laneX(l,w);},
            eventCount:function(){return a&&a.eventCount?a.eventCount():fallback.eventCount();},
            eventAt:function(i){return a&&a.eventAt?a.eventAt(i):fallback.eventAt(i);},
            speedFor:function(t,b,s,f){return a&&a.speedFor?a.speedFor(t,b,s,f):fallback.speedFor(t,b,s,f);},
            fuelAfter:function(f,dt,t,b){return a&&a.fuelAfter?a.fuelAfter(f,dt,t,b):fallback.fuelAfter(f,dt,t,b);},
            playerStep:function(x,vx,st,dt,sp,w){return a&&a.playerStep?a.playerStep(x,vx,st,dt,sp,w):fallback.playerStep(x,vx,st,dt,sp,w);},
            collide:function(px,pz,ox,oz,t){return a&&a.collide?a.collide(px,pz,ox,oz,t):fallback.collide(px,pz,ox,oz,t);},
            score:function(p,f,pk,c,fin){return a&&a.score?a.score(p,f,pk,c,fin):fallback.score(p,f,pk,c,fin);},
            finishReached:function(p){return a&&a.finishReached?a.finishReached(p):fallback.finishReached(p);}
        };
    }

    function DanboRocketRoad(ctx){
        this.ctx=ctx;this.ch=ctx.character||{};this.R=rules();this.state='title';this.keys={};this.touch={};this.objects={};this.hitEvents={};this.eventCache=[];this.running=true;this.last=performance.now();this.menuIndex=0;this.toastTimer=0;
        this.root=document.createElement('div');this.root.className='rr-root';this.root.innerHTML=this.html();ctx.mount.appendChild(this.root);
        this.canvas=this.root.querySelector('canvas');this.panel=this.root.querySelector('.rr-panel');this.hud=this.root.querySelector('.rr-hud');this.toast=this.root.querySelector('.rr-toast');this.touchLayer=this.root.querySelector('.rr-touch');this.countdownEl=this.root.querySelector('.rr-countdown');this.stageEl=this.root.querySelector('.rr-stage-banner');
        this.init3D();this.bind();this.showTitle();
        if(ctx.net)ctx.net.send('minigame.ready',{pluginId:ctx.pluginId,characterId:this.ch.id,build:BUILD});
        var self=this;this.raf=requestAnimationFrame(function(t){self.loop(t);});
    }

    DanboRocketRoad.prototype.html=function(){
        return '<style>'+ 
        '.rr-root{position:absolute;inset:0;overflow:hidden;background:#102039;font-family:"Segoe UI",Arial,sans-serif;color:#fff;touch-action:none;}'+
        '.rr-root canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}'+
        '.rr-panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(90vw,520px);padding:24px;border-radius:28px;background:linear-gradient(180deg,rgba(21,42,75,.92),rgba(9,18,38,.96));box-shadow:0 26px 70px rgba(0,0,0,.45),inset 0 0 0 3px rgba(255,255,255,.12);text-align:center;backdrop-filter:blur(8px);}'+
        '.rr-title{font-size:36px;font-weight:1000;letter-spacing:.04em;color:#fff6a0;text-shadow:0 4px 0 #b95b1a,0 0 20px rgba(255,220,80,.55);margin:0 0 4px;}'+
        '.rr-sub{opacity:.85;font-size:14px;margin-bottom:18px;}'+
        '.rr-menu-btn{display:block;width:100%;border:0;border-radius:18px;margin:10px 0;padding:14px 16px;background:linear-gradient(180deg,#ffe180,#ffab3d);color:#5a2e08;font-size:18px;font-weight:1000;box-shadow:0 5px 0 #b85d1b;cursor:pointer;}'+
        '.rr-menu-btn:hover,.rr-menu-btn.rr-selected{filter:brightness(1.1);transform:translateY(-1px);}'+
        '.rr-menu-btn[disabled]{opacity:.48;filter:grayscale(.25);cursor:not-allowed;box-shadow:0 4px 0 #555;background:#bfc5cf;color:#334;}'+
        '.rr-small{font-size:12px;opacity:.75;line-height:1.55;margin-top:14px;}'+
        '.rr-hud{position:absolute;left:12px;right:12px;top:12px;display:none;align-items:center;gap:10px;pointer-events:none;}'+
        '.rr-pill{border-radius:999px;background:rgba(8,19,38,.68);box-shadow:inset 0 0 0 2px rgba(255,255,255,.14);padding:8px 12px;font-weight:900;text-shadow:0 2px 2px rgba(0,0,0,.4);}'+
        '.rr-bar{height:12px;width:min(34vw,260px);border-radius:20px;overflow:hidden;background:rgba(0,0,0,.38);box-shadow:inset 0 0 0 2px rgba(255,255,255,.12);}'+
        '.rr-bar>i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#ff5040,#ffe26e,#62ff88);}'+
        '.rr-top-exit{margin-left:auto;pointer-events:auto;border:0;border-radius:999px;padding:8px 13px;background:rgba(255,255,255,.18);color:#fff;font-weight:1000;}'+
        '.rr-toast{position:absolute;left:50%;bottom:22%;transform:translateX(-50%);padding:10px 16px;border-radius:18px;background:rgba(0,0,0,.66);font-weight:900;display:none;}'+
        '.rr-stage-banner{position:absolute;left:50%;top:27%;transform:translate(-50%,-50%);display:none;pointer-events:none;padding:8px 18px;border-radius:999px;background:rgba(17,24,39,.62);box-shadow:inset 0 0 0 2px rgba(255,255,255,.18);font-size:clamp(15px,4.2vw,22px);font-weight:1000;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35);letter-spacing:.04em;white-space:nowrap;}'+
        '.rr-countdown{position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);display:none;pointer-events:none;font-size:clamp(64px,18vw,150px);font-weight:1000;color:#fff6a0;text-shadow:0 8px 0 #c6512d,0 0 32px rgba(255,232,88,.8),0 18px 40px rgba(0,0,0,.45);letter-spacing:.04em;}'+
        '.rr-touch{position:absolute;inset:0;display:none;pointer-events:none;}'+
        '.rr-touch button{position:absolute;bottom:24px;width:74px;height:74px;border-radius:50%;border:3px solid rgba(255,255,255,.38);background:rgba(255,255,255,.16);color:#fff;font-size:28px;font-weight:1000;pointer-events:auto;}'+
        '.rr-left{left:24px}.rr-right{left:112px}.rr-boost{right:24px;background:rgba(255,180,60,.32)!important}.rr-brake{right:112px;background:rgba(100,180,255,.24)!important}'+
        '.rr-list{margin:12px 0;text-align:left;background:rgba(255,255,255,.08);border-radius:18px;padding:12px 16px;line-height:1.8;}'+
        '@media (max-width:760px){.rr-title{font-size:28px}.rr-panel{padding:18px}.rr-touch{display:block}.rr-menu-btn{padding:12px;font-size:16px}.rr-hud{font-size:12px;gap:6px}.rr-pill{padding:7px 9px}}'+
        '</style><canvas></canvas><div class="rr-hud"><span class="rr-pill" data-score>0</span><span class="rr-pill" data-speed>0 km/h</span><div class="rr-bar"><i data-fuel></i></div><span class="rr-pill" data-dist>0%</span><button class="rr-top-exit" data-action="quit-run">退出</button></div><div class="rr-panel"></div><div class="rr-stage-banner"></div><div class="rr-countdown"></div><div class="rr-toast"></div><div class="rr-touch"><button class="rr-left" data-touch="left">◀</button><button class="rr-right" data-touch="right">▶</button><button class="rr-brake" data-touch="brake">▼</button><button class="rr-boost" data-touch="boost">▲</button></div>';
    };

    DanboRocketRoad.prototype.init3D=function(){
        this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
        this.renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
        if(THREE.SRGBColorSpace)this.renderer.outputColorSpace=THREE.SRGBColorSpace;
        this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x9ad9ff);this.scene.fog=new THREE.Fog(0x9ad9ff,82,185);
        this.camera=new THREE.PerspectiveCamera(46,1,0.1,280);this.camera.position.set(0,44,-58);this.camera.lookAt(0,0,14);
        var hemi=new THREE.HemisphereLight(0xffffff,0x95b878,1.4);this.scene.add(hemi);
        var sun=new THREE.DirectionalLight(0xfff0d0,1.5);sun.position.set(-24,42,28);this.scene.add(sun);
        this.world=new THREE.Group();this.scene.add(this.world);
        this.roadGroup=new THREE.Group();this.world.add(this.roadGroup);
        this.objectGroup=new THREE.Group();this.world.add(this.objectGroup);
        this.sceneryGroup=new THREE.Group();this.world.add(this.sceneryGroup);
        this.startGridGroup=new THREE.Group();this.world.add(this.startGridGroup);
        this.roadSegments=[];this.decorItems=[];this.startGridCars=[];this.buildRoadSegments();this.buildScenery();this.buildStartGrid();this.finishGroup=this.buildFinishGate();this.world.add(this.finishGroup);this.player=this.buildPlayerCar();this.world.add(this.player);
        this.resize();
    };

    DanboRocketRoad.prototype.buildRoadSegments=function(){
        var roadGeo=new THREE.BoxGeometry(1,0.08,1), railGeo=new THREE.BoxGeometry(0.25,0.35,1), markGeo=new THREE.BoxGeometry(0.12,0.04,2.1), flowerGeo=new THREE.BoxGeometry(0.18,0.06,0.18);
        var roadMat=mat(0x28384d,{roughness:0.86}), edgeMat=mat(0xffef99,{emissive:0x553300,emissiveIntensity:0.1}), markMat=mat(0xf7f4d4,{emissive:0x222200,emissiveIntensity:0.05});
        var fieldMats=[mat(0x7ee36b,{roughness:0.9}),mat(0x8cf27d,{roughness:0.88}),mat(0x6fd45f,{roughness:0.9}),mat(0x93ee84,{roughness:0.88})],
            flowerMats=[mat(0xffef66,{emissive:0x443300,emissiveIntensity:0.06}),mat(0xff7db5,{emissive:0x331122,emissiveIntensity:0.06}),mat(0xffffff),mat(0x48c9ff,{emissive:0x113344,emissiveIntensity:0.05})];
        for(var i=0;i<24;i++){
            var g=new THREE.Group();
            var road=new THREE.Mesh(roadGeo,roadMat);road.scale.set(10,1,ROAD_SEG_LEN+0.35);road.receiveShadow=true;g.add(road);g.road=road;
            var lf=new THREE.Mesh(roadGeo,fieldMats[i%fieldMats.length]), rf=new THREE.Mesh(roadGeo,fieldMats[(i+2)%fieldMats.length]);lf.scale.set(4.2,0.45,ROAD_SEG_LEN+0.35);rf.scale.set(4.2,0.45,ROAD_SEG_LEN+0.35);lf.position.y=rf.position.y=-0.03;lf.receiveShadow=rf.receiveShadow=true;g.add(lf);g.add(rf);g.leftField=lf;g.rightField=rf;
            var l=new THREE.Mesh(railGeo,edgeMat), r=new THREE.Mesh(railGeo,edgeMat);l.scale.z=r.scale.z=ROAD_SEG_LEN+0.35;l.position.y=r.position.y=0.22;g.add(l);g.add(r);g.leftRail=l;g.rightRail=r;
            g.marks=[];for(var m=0;m<3;m++){var mk=new THREE.Mesh(markGeo,markMat);mk.position.y=0.08;g.add(mk);g.marks.push(mk);}
            g.flowers=[];for(var f=0;f<12;f++){var fl=new THREE.Mesh(flowerGeo,flowerMats[(i+f)%flowerMats.length]);fl.position.y=0.07;fl.receiveShadow=true;g.add(fl);g.flowers.push(fl);}
            this.roadGroup.add(g);this.roadSegments.push(g);
        }
        var grassGeo=new THREE.PlaneGeometry(260,260);var grass=new THREE.Mesh(grassGeo,mat(0x72d887,{roughness:0.9}));grass.rotation.x=-Math.PI/2;grass.position.y=-0.08;grass.receiveShadow=true;this.world.add(grass);
    };

    DanboRocketRoad.prototype.buildPlayerCar=function(){
        var g=new THREE.Group();var bodyColor=0xff5151;
        addBox(g,1.65,0.46,2.75,bodyColor,0,0.45,0);
        addBox(g,1.25,0.36,1.15,0xffd05a,0,0.83,-0.15);
        addBox(g,0.92,0.24,0.65,0x82d8ff,0,1.05,-0.2);
        addBox(g,1.05,0.18,0.58,0x27384d,0,1.02,0.44);
        addBox(g,1.25,0.28,0.38,0x6b3333,0,0.62,-1.32);
        addWheel(g,-0.92,-0.82);addWheel(g,0.92,-0.82);addWheel(g,-0.92,0.86);addWheel(g,0.92,0.86);
        var nozzle=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.28,0.5,12),mat(0x4b5360,{metalness:0.1}));nozzle.rotation.x=Math.PI/2;nozzle.position.set(0,0.45,-1.66);g.add(nozzle);
        var flame=new THREE.Mesh(new THREE.ConeGeometry(0.28,0.9,16),mat(0xffad2d,{emissive:0xff6600,emissiveIntensity:0.85}));flame.rotation.x=-Math.PI/2;flame.position.set(0,0.45,-2.12);g.add(flame);g.flame=flame;
        g.driver=addMiniDriver(g,this.ch,0.98,0,1.2,0.52);
        g.position.set(0,0.2,PLAYER_Z);return g;
    };

    DanboRocketRoad.prototype.makeObject=function(type,id){
        var g=new THREE.Group();type=type|0;g.userData.type=type;
        if(type===6){var oil=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.55,0.04,24),mat(0x111923,{roughness:0.35,metalness:0.05}));oil.scale.z=0.62;oil.position.y=0.06;g.add(oil);return g;}
        var color=type===2?0xff4f4f:(type===3?0x4f8dff:(type===4?0x5ad1c0:(type===5?0xffe15d:0xffd34d)));
        var w=type===4?2.1:1.45,d=type===4?3.9:2.55,h=type===4?0.78:0.46;
        addBox(g,w,h,d,color,0,0.42,0);addBox(g,w*0.72,0.34,d*0.38,type===5?0xffffff:0x87d7ff,0,0.86,0.28);
        addWheel(g,-w*0.58,-d*0.28);addWheel(g,w*0.58,-d*0.28);addWheel(g,-w*0.58,d*0.32);addWheel(g,w*0.58,d*0.32);
        if(type!==5)g.driver=addMiniDriver(g,charByIndex((id||0)*3+type),type===4?0.72:0.62,0,0.92,0.16);
        if(type===5){var halo=new THREE.Mesh(new THREE.TorusGeometry(1.25,0.08,8,28),mat(0x70ff9b,{emissive:0x30ff70,emissiveIntensity:0.7}));halo.rotation.x=Math.PI/2;halo.position.y=1.1;g.add(halo);g.halo=halo;}
        return g;
    };

    DanboRocketRoad.prototype.makeDecor=function(kind){
        var g=new THREE.Group();kind=kind|0;g.userData.kind=kind;
        if(kind===0){
            var trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.25,1.25,8),mat(0x8d5b34));trunk.position.y=0.62;g.add(trunk);
            var crown=new THREE.Mesh(new THREE.ConeGeometry(0.95,1.8,9),mat(0x2abf62,{roughness:0.84}));crown.position.y=1.78;g.add(crown);
            var dot=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6),mat(0xfff07a,{emissive:0x553300,emissiveIntensity:0.1}));dot.position.set(0.28,1.85,0.18);g.add(dot);
        }else if(kind===1){
            addBox(g,2.4,1.9,1.2,0xffd8a8,0,0.95,0);addBox(g,2.1,0.22,1.38,0xff7e67,0,1.98,0);
            for(var i=0;i<3;i++)addBox(g,0.38,0.38,0.04,0x9edfff,-0.65+i*0.65,1.12,0.62);
            addBox(g,1.7,0.34,0.08,0xffffff,0,0.35,0.66);addBox(g,1.42,0.18,0.09,0x3a8fff,0,0.36,0.72);
        }else if(kind===2){
            addBox(g,0.18,2.2,0.18,0xffffff,-0.9,1.1,0);addBox(g,0.18,2.2,0.18,0xffffff,0.9,1.1,0);
            var board=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.1,0.12),mat(0xfff49a,{emissive:0x443300,emissiveIntensity:0.08}));board.position.y=1.72;g.add(board);
            addBox(g,1.55,0.16,0.14,0xff5f6d,0,1.86,0.08);addBox(g,1.2,0.14,0.14,0x43c6ff,0,1.54,0.08);
        }else if(kind===3){
            for(var b=0;b<4;b++){var bal=new THREE.Mesh(new THREE.SphereGeometry(0.28,12,8),mat([0xff6978,0xffe36d,0x62d6ff,0xa7f56d][b],{emissive:0x111111,emissiveIntensity:0.04}));bal.position.set((b-1.5)*0.25,1.8+(b%2)*0.28,(b%3)*0.12);g.add(bal);}
            addBox(g,0.08,1.45,0.08,0xffffff,0,0.9,0);
        }else if(kind===4){
            for(var f=0;f<5;f++){var fl=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),mat(f%2?0xffe76b:0xff78b9,{emissive:0x331111,emissiveIntensity:0.08}));fl.position.set(-0.8+f*0.4,0.2,(f%2)*0.22);g.add(fl);}
            addBox(g,2.1,0.16,0.5,0x38b764,0,0.08,0.1);
        }else if(kind===5){
            addBox(g,0.14,2.0,0.14,0xeff5ff,-0.58,1.0,0);addBox(g,0.14,2.0,0.14,0xeff5ff,0.58,1.0,0);
            var fg=new THREE.Group();for(var y=0;y<2;y++)for(var x=0;x<4;x++)addBox(fg,0.28,0.22,0.04,(x+y)%2?0x1b2638:0xffffff,-0.42+x*0.28,1.65-y*0.22,0);
            g.add(fg);
        }else if(kind===6){
            addBox(g,3.4,0.18,7.4,0x9fe8ff,0,0.09,0);
            addBox(g,3.05,0.12,6.85,0xcff6ff,0,0.23,0);
            for(var s=0;s<7;s++)addBox(g,3.15,0.04,0.08,0xffffff,0,0.32,-3+s*1.0);
            addBox(g,0.18,1.1,7.4,0x55bde9,-1.78,0.55,0);addBox(g,0.18,1.1,7.4,0x55bde9,1.78,0.55,0);
        }else{
            addBox(g,1.35,0.16,3.4,0x111827,0,0.08,0);
            for(var c=0;c<4;c++)addBox(g,0.25,0.22,0.18,(c%2)?0xffffff:0xffe45d,-0.48+c*0.32,0.24,0);
            addBox(g,1.1,0.08,0.12,0xffe45d,0,0.34,-1.2);addBox(g,1.1,0.08,0.12,0xffe45d,0,0.34,1.2);
        }
        g.traverse(function(o){if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
        return g;
    };

    DanboRocketRoad.prototype.buildScenery=function(){
        this.decorItems=[];
        var length=this.R.levelLength?this.R.levelLength():3300;
        for(var i=0;i<76;i++){
            var abs=35+i*47+(i%5)*7;if(abs>length+220)break;
            for(var s=0;s<2;s++){
                var side=s?1:-1, kind;
                if(side>0&&i%5===1)kind=6;else if(i%9===0)kind=7;else kind=(i+s*3)%6;
                var mesh=this.makeDecor(kind), off=kind===6?3.9:(2.8+((i+s)%4)*0.9);
                this.decorItems.push({abs:abs+(s?10:0),side:side,offset:off,kind:kind,mesh:mesh,scale:kind===6?1:(0.82+((i+s)%3)*0.12),spin:(i%7)*0.2});
                this.sceneryGroup.add(mesh);
            }
        }
    };

    DanboRocketRoad.prototype.buildStartGrid=function(){
        this.startGridCars=[];
        var slots=[
            {lane:1,z:9,type:1},{lane:2,z:15,type:2},{lane:0,z:22,type:3},
            {lane:3,z:28,type:1},{lane:1,z:35,type:2},{lane:2,z:42,type:4}
        ];
        for(var i=0;i<slots.length;i++){
            var s=slots[i], mesh=this.makeObject(s.type,100+i);
            mesh.visible=false;this.startGridGroup.add(mesh);
            this.startGridCars.push({mesh:mesh,lane:s.lane,z:s.z,type:s.type,launch:10+i*3});
        }
    };

    DanboRocketRoad.prototype.makeCheckerTexture=function(w,h){
        var c=document.createElement('canvas');c.width=w||256;c.height=h||64;var x=c.getContext('2d'), cols=16, rows=4;
        for(var yy=0;yy<rows;yy++)for(var xx=0;xx<cols;xx++){x.fillStyle=(xx+yy)%2?'#111827':'#ffffff';x.fillRect(xx*c.width/cols,yy*c.height/rows,c.width/cols+1,c.height/rows+1);}
        var tex=new THREE.CanvasTexture(c);tex.needsUpdate=true;return tex;
    };

    DanboRocketRoad.prototype.buildFinishGate=function(){
        var g=new THREE.Group();g.visible=false;
        var tex=this.makeCheckerTexture(256,64), finishMat=new THREE.MeshStandardMaterial({map:tex,roughness:0.68,metalness:0.02});
        var stripe=new THREE.Mesh(new THREE.BoxGeometry(1,0.08,1.8),finishMat);stripe.position.y=0.09;stripe.receiveShadow=true;g.add(stripe);g.stripe=stripe;
        var poleMat=mat(0xffffff,{roughness:0.65});
        g.leftPole=new THREE.Mesh(new THREE.BoxGeometry(0.22,4.6,0.22),poleMat);g.rightPole=new THREE.Mesh(new THREE.BoxGeometry(0.22,4.6,0.22),poleMat);g.leftPole.position.y=g.rightPole.position.y=2.3;g.add(g.leftPole);g.add(g.rightPole);
        g.topBar=new THREE.Mesh(new THREE.BoxGeometry(1,0.28,0.28),poleMat);g.topBar.position.y=4.45;g.add(g.topBar);
        var flagGeo=new THREE.PlaneGeometry(1.15,0.72), flagMat1=new THREE.MeshStandardMaterial({color:0xff4f5e,roughness:0.75,side:THREE.DoubleSide}), flagMat2=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.75,side:THREE.DoubleSide});
        g.flags=[];
        for(var f=0;f<4;f++){var fm=f%2?flagMat2:flagMat1, fl=new THREE.Mesh(flagGeo,fm);fl.position.y=3.35+(f%2)*0.55;fl.userData.side=f<2?-1:1;g.add(fl);g.flags.push(fl);}
        var banner=new THREE.Group();for(var by=0;by<2;by++)for(var bx=0;bx<12;bx++)addBox(banner,0.48,0.24,0.08,(bx+by)%2?0x111827:0xffffff,-2.64+bx*0.48,4.9-by*0.24,0);g.add(banner);g.banner=banner;
        return g;
    };

    DanboRocketRoad.prototype.bind=function(){
        var self=this;
        this.onResize=function(){self.resize();};window.addEventListener('resize',this.onResize);
        this.onKeyDown=function(e){
            if(!self.running)return;var code=e.code||e.key;self.keys[code]=true;
            if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyA','KeyD','KeyW','KeyS','Enter','Escape'].indexOf(code)>=0){e.preventDefault();e.stopImmediatePropagation();}
            if(self.state==='title'){
                if(code==='Enter'||code==='Space')self.startGame();
                else if(code==='Escape')self.exit();
            }else if(self.state==='scores'){
                if(code==='Escape'||code==='Enter'||code==='Space')self.showTitle();
            }else if(self.state==='result'){
                if(code==='Enter'||code==='Space')self.startGame();
                else if(code==='Escape')self.showTitle();
            }else if((self.state==='playing'||self.state==='countdown')&&code==='Escape')self.finish(false,'quit');
        };
        this.onKeyUp=function(e){self.keys[e.code||e.key]=false;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyA','KeyD','KeyW','KeyS'].indexOf(e.code||e.key)>=0){e.preventDefault();e.stopImmediatePropagation();}};
        window.addEventListener('keydown',this.onKeyDown,true);window.addEventListener('keyup',this.onKeyUp,true);
        this.onClick=function(e){var b=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(!b)return;var a=b.getAttribute('data-action');if(a==='single')self.startGame();else if(a==='multi')self.showToast('多人模式已预留，等服务器房间接入后开放');else if(a==='scores')self.showScores();else if(a==='exit')self.exit();else if(a==='title')self.showTitle();else if(a==='retry')self.startGame();else if(a==='quit-run')self.finish(false,'quit');};
        this.root.addEventListener('click',this.onClick);
        this.onPointer=function(e){var b=e.target&&e.target.closest?e.target.closest('[data-touch]'):null;if(!b)return;e.preventDefault();var k=b.getAttribute('data-touch');self.touch[k]=e.type!=='pointerup'&&e.type!=='pointercancel';};
        this.touchLayer.addEventListener('pointerdown',this.onPointer);this.touchLayer.addEventListener('pointerup',this.onPointer);this.touchLayer.addEventListener('pointercancel',this.onPointer);this.touchLayer.addEventListener('pointerleave',this.onPointer);
    };

    DanboRocketRoad.prototype.resize=function(){
        var w=this.root.clientWidth||innerWidth,h=this.root.clientHeight||innerHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
    };

    DanboRocketRoad.prototype.showTitle=function(){
        this.stopMusic();this.state='title';this.hud.style.display='none';this.touchLayer.style.display='none';this.panel.style.display='block';this.countdownEl.style.display='none';this.stageEl.style.display='none';
        var mode=(api()&&api().mode)||'js-fallback';
        this.panel.innerHTML='<h1 class="rr-title">🚗 蛋宝火箭公路</h1><div class="rr-sub">3D画面 · 2D街机公路 · 单关挑战</div>'+ 
            '<button class="rr-menu-btn rr-selected" data-action="single">单人游戏</button>'+
            '<button class="rr-menu-btn" data-action="multi">多人游戏 <span style="font-size:12px;opacity:.7">开发中</span></button>'+
            '<button class="rr-menu-btn" data-action="scores">高分榜</button>'+
            '<button class="rr-menu-btn" data-action="exit">退出</button>'+
            '<div class="rr-small">←/→ 或 A/D 转向，↑/Space/W 高速，↓/S 减速。<br>规则模块：'+esc(mode)+' · build '+BUILD+'</div>';
    };

    DanboRocketRoad.prototype.startGame=function(){
        this.state='countdown';this.panel.style.display='none';this.hud.style.display='flex';this.touchLayer.style.display=(('ontouchstart' in window)||(navigator.maxTouchPoints>0))?'block':'none';
        this.R=rules();this.progress=0;this.fuel=this.R.maxFuel();this.speed=0;this.score=0;this.pickups=0;this.crashes=0;this.carX=0;this.carVx=0;this.spin=0;this.spinDir=1;this.elapsed=0;this.netAcc=0;this.hitEvents={};
        this.countdown=3.15;this.countdownText='';this.countdownEl.textContent='3';this.countdownEl.style.display='block';this.stageEl.textContent='STAGE 1 · 彩田高速';this.stageEl.style.display='block';this.startMusic();
        for(var k in this.objects){if(this.objects[k]&&this.objects[k].mesh)this.objects[k].mesh.visible=false;}
        if(this.ctx.net)this.ctx.net.send('minigame.startIntent',{pluginId:this.ctx.pluginId,characterId:this.ch.id,mode:'single',seed:BUILD});
    };

    DanboRocketRoad.prototype.showScores=function(){
        this.stopMusic();this.state='scores';this.hud.style.display='none';this.touchLayer.style.display='none';this.panel.style.display='block';this.countdownEl.style.display='none';this.stageEl.style.display='none';
        var scores=this.getScores();var rows=scores.length?scores.map(function(s,i){return '<div><b>#'+(i+1)+'</b> '+esc(s.name||'Danbo')+' — '+esc(s.score)+' 分 <span style="opacity:.55">'+esc(s.date||'')+'</span></div>';}).join(''):'<div style="text-align:center;opacity:.75">还没有记录，先跑一局吧。</div>';
        this.panel.innerHTML='<h1 class="rr-title">🏆 高分榜</h1><div class="rr-list">'+rows+'</div><button class="rr-menu-btn" data-action="title">返回标题</button>';
    };

    DanboRocketRoad.prototype.finish=function(win,reason){
        if(this.state!=='playing'&&this.state!=='countdown')return;this.stopMusic();if(win)this.playFinishJingle();this.state='result';this.hud.style.display='none';this.touchLayer.style.display='none';this.panel.style.display='block';this.countdownEl.style.display='none';this.stageEl.style.display='none';
        var finalScore=this.R.score(this.progress,this.fuel,this.pickups,this.crashes,win?1:0);this.score=finalScore;this.saveScore(finalScore);
        if(this.ctx.net)this.ctx.net.send('minigame.finishIntent',{pluginId:this.ctx.pluginId,score:finalScore,finished:!!win,reason:reason||'',time:this.elapsed,crashes:this.crashes,pickups:this.pickups});
        this.panel.innerHTML='<h1 class="rr-title">'+(win?'🏁 通关！':'💥 挑战结束')+'</h1>'+ 
            '<div class="rr-list"><div>分数：<b>'+finalScore+'</b></div><div>距离：'+Math.floor(clamp(this.progress/this.R.levelLength()*100,0,100))+'%</div><div>补油：'+this.pickups+' 次</div><div>碰撞：'+this.crashes+' 次</div><div>用时：'+this.elapsed.toFixed(1)+' 秒</div></div>'+
            '<button class="rr-menu-btn" data-action="retry">再来一次</button><button class="rr-menu-btn" data-action="scores">高分榜</button><button class="rr-menu-btn" data-action="title">返回标题</button><button class="rr-menu-btn" data-action="exit">退出</button>';
    };

    DanboRocketRoad.prototype.getScores=function(){return (this.ctx.storage&&this.ctx.storage.get('rocketRoadScores',[]))||[];};
    DanboRocketRoad.prototype.saveScore=function(score){var list=this.getScores();list.push({score:score,name:this.ch.displayName||this.ch.name||'Danbo',date:new Date().toISOString().slice(0,10)});list.sort(function(a,b){return b.score-a.score;});list=list.slice(0,8);if(this.ctx.storage)this.ctx.storage.set('rocketRoadScores',list);};
    DanboRocketRoad.prototype.showToast=function(text){this.toast.textContent=text;this.toast.style.display='block';this.toastTimer=2.2;};
    DanboRocketRoad.prototype.exit=function(){this.stopMusic();if(this.ctx.net)this.ctx.net.send('minigame.stopIntent',{pluginId:this.ctx.pluginId,status:'exit'});this.ctx.api.finish({status:'exit',pluginId:this.ctx.pluginId});};

    DanboRocketRoad.prototype.ensureAudio=function(){
        if(this.audioCtx)return this.audioCtx;
        var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
        this.audioCtx=new AC();this.musicGain=this.audioCtx.createGain();this.musicGain.gain.value=0.055;this.musicGain.connect(this.audioCtx.destination);return this.audioCtx;
    };

    DanboRocketRoad.prototype.tone=function(freq,dur,delay,type,gain){
        var ctx=this.ensureAudio();if(!ctx||!this.musicGain)return;
        var when=ctx.currentTime+(delay||0), osc=ctx.createOscillator(), g=ctx.createGain();
        osc.type=type||'square';osc.frequency.setValueAtTime(freq,when);
        g.gain.setValueAtTime(0.0001,when);g.gain.linearRampToValueAtTime(gain||0.18,when+0.015);g.gain.exponentialRampToValueAtTime(0.0001,when+Math.max(0.04,dur||0.12));
        osc.connect(g);g.connect(this.musicGain);osc.start(when);osc.stop(when+(dur||0.12)+0.05);
    };

    DanboRocketRoad.prototype.startMusic=function(){
        var ctx=this.ensureAudio();if(!ctx)return;this.stopMusic(false);if(ctx.state==='suspended'&&ctx.resume)ctx.resume();
        var self=this, melody=[392,494,587,659,587,494,440,392,330,392,494,587,740,659,587,494], bass=[196,196,247,247,220,220,196,196];
        this.musicPlaying=true;this.musicBeat=0;
        var tick=function(){
            if(!self.musicPlaying||!self.running)return;
            var i=self.musicBeat++,
                lead=melody[i%melody.length],
                b=bass[Math.floor(i/2)%bass.length];
            self.tone(lead,0.12,0,'square',0.12);
            if(i%2===0)self.tone(b,0.18,0,'triangle',0.08);
            if(i%8===6)self.tone(lead*1.5,0.08,0.04,'sine',0.055);
            self.musicTimer=setTimeout(tick,145);
        };
        tick();
    };

    DanboRocketRoad.prototype.stopMusic=function(){
        this.musicPlaying=false;if(this.musicTimer){clearTimeout(this.musicTimer);this.musicTimer=0;}
    };

    DanboRocketRoad.prototype.playCountdownBeep=function(go){
        this.tone(go?784:523,go?0.22:0.12,0,go?'square':'sine',go?0.26:0.2);
        if(go)this.tone(1175,0.18,0.06,'square',0.14);
    };

    DanboRocketRoad.prototype.playFinishJingle=function(){
        this.tone(523,0.15,0,'square',0.22);this.tone(659,0.15,0.16,'square',0.22);this.tone(784,0.16,0.32,'square',0.22);this.tone(1046,0.32,0.5,'triangle',0.24);
    };

    DanboRocketRoad.prototype.inputState=function(){
        var left=this.keys.ArrowLeft||this.keys.KeyA||this.touch.left,right=this.keys.ArrowRight||this.keys.KeyD||this.touch.right;
        return {steer:(left?1:0)-(right?1:0),turbo:!!(this.keys.ArrowUp||this.keys.KeyW||this.keys.Space||this.touch.boost),brake:!!(this.keys.ArrowDown||this.keys.KeyS||this.touch.brake)};
    };

    DanboRocketRoad.prototype.updateCountdown=function(dt){
        this.countdown-=dt;
        var text=this.countdown>2.15?'3':(this.countdown>1.15?'2':(this.countdown>0.15?'1':'GO!'));
        if(text!==this.countdownText){this.countdownText=text;this.countdownEl.textContent=text;this.countdownEl.style.display='block';this.playCountdownBeep(text==='GO!');}
        if(this.countdown<=-0.32){this.state='playing';this.countdownEl.style.display='none';this.stageEl.style.display='none';this.countdownText='';}
    };

    DanboRocketRoad.prototype.updatePlaying=function(dt){
        this.elapsed+=dt;var inp=this.inputState(), width=this.R.roadWidthAt(this.progress);
        var step=this.R.playerStep(this.carX,this.carVx,inp.steer,dt,this.spin>0?1:0,width);this.carX=step[0];this.carVx=step[1];
        if(this.spin>0)this.spin=Math.max(0,this.spin-dt);
        this.speed=this.R.speedFor(inp.turbo?1:0,inp.brake?1:0,this.spin>0?1:0,this.fuel);
        this.progress+=this.speed*dt;this.fuel=this.R.fuelAfter(this.fuel,dt,inp.turbo?1:0,inp.brake?1:0);
        this.checkCollisions();
        if(Math.abs(this.carX)>width*0.5-0.82&&this.spin<=0){this.crash(0.8,this.carX>0?-1:1,2.4);}
        this.score=this.R.score(this.progress,this.fuel,this.pickups,this.crashes,0);
        this.netAcc+=dt;if(this.ctx.net&&this.netAcc>0.2){this.netAcc=0;this.ctx.net.send('input.drive',{steer:inp.steer,turbo:inp.turbo,brake:inp.brake,progress:this.progress});}
        if(this.R.finishReached(this.progress))this.finish(true,'finish');else if(this.fuel<=0.01)this.finish(false,'fuel');
    };

    DanboRocketRoad.prototype.crash=function(duration,dir,fuelLoss){this.spin=Math.max(this.spin,duration||1);this.spinDir=dir||1;this.crashes++;this.fuel=clamp(this.fuel-(fuelLoss||6),0,this.R.maxFuel());this.carVx+=this.spinDir*8;this.showToast('打滑！反打方向稳住！');};

    DanboRocketRoad.prototype.checkCollisions=function(){
        var count=this.R.eventCount();
        for(var i=0;i<count;i++){
            if(this.hitEvents[i])continue;var ev=this.R.eventAt(i), type=ev[2]|0, rel=this.eventRel(ev,i,type);if(rel<-4||rel>6)continue;
            var width=this.R.roadWidthAt(ev[0]),x=this.R.laneX(ev[1]|0,width);x+=this.objectSway(type,ev[4],i);
            if(this.R.collide(this.carX,0,x,rel,type)){
                this.hitEvents[i]=true;
                if(type===5){this.pickups++;this.fuel=clamp(this.fuel+(ev[5]||20),0,this.R.maxFuel());this.showToast('补油 +'+Math.floor(ev[5]||20));if(this.objects[i])this.objects[i].mesh.visible=false;}
                else if(type===6){this.crash(0.95,(this.carX<x?-1:1),2.5);}
                else this.crash(type===4?1.3:1.05,(this.carX<x?-1:1),type===4?8:5.5);
            }
        }
    };

    DanboRocketRoad.prototype.objectSway=function(type,pattern,id){
        if(type===2)return Math.sin(this.elapsed*1.8+pattern+id)*0.42;
        if(type===3)return Math.sin(this.elapsed*3.0+id)*0.24;
        return 0;
    };

    DanboRocketRoad.prototype.trafficSpeed=function(type,pattern,id){
        if(this.state!=='playing')return 0;
        if(type===1)return 10+(pattern||0)*1.1;      // same direction, slower than player
        if(type===2)return 18+Math.sin(this.elapsed*0.7+id)*5;
        if(type===3)return -12-Math.abs(Math.sin(id))*5; // oncoming / passing traffic
        if(type===4)return 7;
        return 0;
    };

    DanboRocketRoad.prototype.eventRel=function(ev,id,type){
        type=type|0;
        return ev[0]+this.trafficSpeed(type,ev[4],id)*this.elapsed-this.progress;
    };

    DanboRocketRoad.prototype.updateRoad=function(){
        var first=this.progress-(this.progress%ROAD_SEG_LEN)-32;
        for(var i=0;i<this.roadSegments.length;i++){
            var abs=first+i*ROAD_SEG_LEN, rel=abs-this.progress, g=this.roadSegments[i], width=this.R.roadWidthAt(abs);
            g.position.z=PLAYER_Z+rel;g.road.scale.x=width;g.road.scale.z=ROAD_SEG_LEN+0.35;
            g.leftField.position.x=-width*0.5-2.35;g.rightField.position.x=width*0.5+2.35;g.leftField.scale.z=g.rightField.scale.z=ROAD_SEG_LEN+0.35;
            g.leftRail.position.x=-width*0.5-0.18;g.rightRail.position.x=width*0.5+0.18;
            for(var m=0;m<g.marks.length;m++){var mk=g.marks[m];mk.position.x=(-width*0.25)+(m*width*0.25);mk.visible=((Math.floor(abs/ROAD_SEG_LEN)+m)%2)===0;}
            for(var f=0;f<g.flowers.length;f++){
                var fl=g.flowers[f], side=f<6?-1:1, row=f%6, wob=((Math.floor(abs/ROAD_SEG_LEN)+row)%2)*0.24;
                fl.position.x=side*(width*0.5+0.72+(row%3)*0.78+wob);
                fl.position.z=-ROAD_SEG_LEN*0.42+row*1.45;
                fl.visible=((Math.floor(abs/ROAD_SEG_LEN)+f)%3)!==0;
            }
        }
    };

    DanboRocketRoad.prototype.updateObjects=function(){
        var count=this.R.eventCount();
        for(var i=0;i<count;i++){
            var ev=this.R.eventAt(i), type=ev[2]|0, rel=this.eventRel(ev,i,type);
            var obj=this.objects[i];
            if(rel<-14||rel>110||this.hitEvents[i]&&type===5){if(obj)obj.mesh.visible=false;continue;}
            if(!obj){obj={mesh:this.makeObject(type,i),type:type};this.objects[i]=obj;this.objectGroup.add(obj.mesh);}obj.mesh.visible=true;
            var width=this.R.roadWidthAt(ev[0]), x=this.R.laneX(ev[1]|0,width)+this.objectSway(type,ev[4],i);
            obj.mesh.position.set(x,0.02,PLAYER_Z+rel);
            obj.mesh.rotation.y=(type===3?Math.PI:0)+Math.sin(this.elapsed*1.5+i)*0.025;
            if(obj.mesh.halo)obj.mesh.halo.rotation.z+=0.04;
            if(obj.mesh.driver)obj.mesh.driver.rotation.y=Math.sin(this.elapsed*2+i)*0.05;
        }
    };

    DanboRocketRoad.prototype.updateStartGrid=function(){
        if(!this.startGridCars)return;
        var show=this.state==='countdown'||(this.state==='playing'&&this.elapsed<0.9);
        this.startGridGroup.visible=!!show;
        for(var i=0;i<this.startGridCars.length;i++){
            var c=this.startGridCars[i], mesh=c.mesh;
            if(!show){mesh.visible=false;continue;}
            var width=this.R.roadWidthAt(this.progress), x=this.R.laneX(c.lane,width), launch=this.state==='playing'?this.elapsed*(c.launch+22):0;
            mesh.visible=true;mesh.position.set(x,0.02,PLAYER_Z+c.z+launch);
            mesh.rotation.y=0;mesh.rotation.z=Math.sin((this.elapsed||0)*4+i)*0.015;
        }
    };

    DanboRocketRoad.prototype.updateScenery=function(){
        if(!this.decorItems)return;
        for(var i=0;i<this.decorItems.length;i++){
            var d=this.decorItems[i], rel=d.abs-this.progress, mesh=d.mesh;
            if(rel<-58||rel>150){mesh.visible=false;continue;}
            var width=this.R.roadWidthAt(d.abs), x=d.side*(width*0.5+d.offset);
            mesh.visible=true;mesh.position.set(x,0,PLAYER_Z+rel);mesh.scale.setScalar(d.scale);
            mesh.rotation.y=(d.kind===6||d.kind===7)?0:(d.side<0?0.42:-0.42);
            if((i%6)===3&&d.kind!==6)mesh.rotation.y+=Math.sin(this.elapsed*1.2+d.spin)*0.12;
        }
    };

    DanboRocketRoad.prototype.updateFinishGate=function(){
        if(!this.finishGroup)return;
        var finish=this.R.levelLength(), rel=finish-this.progress, g=this.finishGroup;
        if(rel<-12||rel>150){g.visible=false;return;}
        var width=this.R.roadWidthAt(finish);
        g.visible=true;g.position.set(0,0,PLAYER_Z+rel);
        g.stripe.scale.x=width+0.6;g.leftPole.position.x=-(width*0.5+0.95);g.rightPole.position.x=width*0.5+0.95;g.topBar.scale.x=width+2.1;
        for(var i=0;i<g.flags.length;i++){
            var f=g.flags[i], side=f.userData.side||1;
            f.position.x=side*(width*0.5+0.95)+(side<0?-0.56:0.56);f.position.z=0;f.rotation.y=side<0?Math.PI:0;
            f.position.y=3.15+(i%2)*0.62+Math.sin(this.elapsed*5+i)*0.05;
        }
        if(g.banner)g.banner.position.x=0;
    };

    DanboRocketRoad.prototype.updateVisuals=function(dt){
        this.updateRoad();this.updateObjects();this.updateStartGrid();this.updateScenery();this.updateFinishGate();
        this.player.position.x=this.carX||0;this.player.rotation.z=-(this.carVx||0)*0.018+(this.spin>0?Math.sin(this.elapsed*28)*0.18*this.spinDir:0);this.player.rotation.y=(this.spin>0?Math.sin(this.elapsed*21)*0.22*this.spinDir:0);
        if(this.player.flame){var inp=this.inputState();var s=inp.turbo&&this.state==='playing'?1.35:0.65;this.player.flame.scale.set(s,s,0.75+Math.sin(this.elapsed*28)*0.2);this.player.flame.visible=this.state==='playing'&&this.speed>2;}
        this.world.position.x=-(this.carX||0)*0.06;
        this.camera.position.x=(this.carX||0)*0.18;this.camera.lookAt((this.carX||0)*0.1,0,14);
    };

    DanboRocketRoad.prototype.updateHud=function(){
        if(this.state!=='playing'&&this.state!=='countdown')return;var pct=clamp(this.progress/this.R.levelLength(),0,1), fuelPct=clamp(this.fuel/this.R.maxFuel(),0,1);
        this.root.querySelector('[data-score]').textContent='⭐ '+Math.floor(this.score);
        this.root.querySelector('[data-speed]').textContent=Math.floor(this.speed*7.0)+' km/h';
        this.root.querySelector('[data-dist]').textContent=Math.floor(pct*100)+'%';
        this.root.querySelector('[data-fuel]').style.width=(fuelPct*100)+'%';
    };

    DanboRocketRoad.prototype.loop=function(t){
        if(!this.running)return;var dt=Math.min(0.04,(t-this.last)/1000||0.016);this.last=t;
        if(this.toastTimer>0){this.toastTimer-=dt;if(this.toastTimer<=0)this.toast.style.display='none';}
        if(this.state==='countdown')this.updateCountdown(dt);else if(this.state==='playing')this.updatePlaying(dt);
        this.updateVisuals(dt);this.updateHud();this.renderer.render(this.scene,this.camera);
        var self=this;this.raf=requestAnimationFrame(function(nt){self.loop(nt);});
    };

    DanboRocketRoad.prototype.dispose=function(){
        this.running=false;this.stopMusic();if(this.raf)cancelAnimationFrame(this.raf);window.removeEventListener('resize',this.onResize);window.removeEventListener('keydown',this.onKeyDown,true);window.removeEventListener('keyup',this.onKeyUp,true);if(this.root)this.root.removeEventListener('click',this.onClick);
        if(this.renderer){var dispose=function(o){if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(function(m){if(m.map)m.map.dispose();m.dispose();});else{if(o.material.map)o.material.map.dispose();o.material.dispose();}}};this.scene.traverse(dispose);this.renderer.dispose();}
        if(this.root&&this.root.parentNode)this.root.parentNode.removeChild(this.root);
    };

    window.DanboRocketRoad={start:function(ctx){return new DanboRocketRoad(ctx);},fallback:fallback};
})();
