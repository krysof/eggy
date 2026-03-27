// hud.js — DANBO World
var _chargeBeepTimer=0, _chargeHoldTimer=0, _chargeHoldMax=600; // 600 frames ≈ 10s at 60fps
function _createChargeBar(){
    // Use a canvas texture on a Sprite — always faces camera automatically
    var canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=40;
    var tex=new THREE.CanvasTexture(canvas);
    tex.minFilter=THREE.LinearFilter;
    var mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});
    var sprite=new THREE.Sprite(mat);
    sprite.scale.set(2.5,0.4,1);
    sprite.renderOrder=1000;
    sprite._canvas=canvas;sprite._ctx=canvas.getContext('2d');sprite._tex=tex;
    return sprite;
}
function _drawChargeBar(sprite,pct){
    var ctx=sprite._ctx,w=256,h=40;
    ctx.clearRect(0,0,w,h);
    // Helper for rounded rect (compat)
    function rr(x,y,rw,rh,rad){ctx.beginPath();ctx.moveTo(x+rad,y);ctx.lineTo(x+rw-rad,y);ctx.quadraticCurveTo(x+rw,y,x+rw,y+rad);ctx.lineTo(x+rw,y+rh-rad);ctx.quadraticCurveTo(x+rw,y+rh,x+rw-rad,y+rh);ctx.lineTo(x+rad,y+rh);ctx.quadraticCurveTo(x,y+rh,x,y+rh-rad);ctx.lineTo(x,y+rad);ctx.quadraticCurveTo(x,y,x+rad,y);ctx.closePath();}
    // Outer border
    ctx.fillStyle='rgba(0,0,0,0.85)';
    rr(2,2,w-4,h-4,8);ctx.fill();
    // Color calc
    var r2,g2,b3;
    if(pct<0.33){r2=0;g2=255;b3=50;}
    else if(pct<0.66){var t=(pct-0.33)/0.33;r2=Math.floor(255*t);g2=Math.floor(255*(1-t*0.3));b3=0;}
    else{var t2=(pct-0.66)/0.34;r2=255;g2=Math.floor(180*(1-t2));b3=0;}
    // Border glow
    ctx.strokeStyle='rgba('+r2+','+g2+','+b3+','+(pct>0.8?0.7+Math.sin(Date.now()*0.015)*0.3:0.5)+')';
    ctx.lineWidth=3;rr(5,5,w-10,h-10,6);ctx.stroke();
    // Fill bar
    var fw=Math.max(4,(w-20)*pct);
    var grad=ctx.createLinearGradient(10,0,10+fw,0);
    grad.addColorStop(0,'rgb('+Math.floor(r2*0.6)+','+Math.floor(g2*0.6)+','+b3+')');
    grad.addColorStop(1,'rgb('+r2+','+g2+','+b3+')');
    ctx.fillStyle=grad;
    rr(10,10,fw,h-20,4);ctx.fill();
    // Shine highlight
    ctx.fillStyle='rgba(255,255,255,0.3)';
    rr(10,10,fw,Math.floor((h-20)/2),4);ctx.fill();
    sprite._tex.needsUpdate=true;
}
function _updateChargeBar(){
    if(!playerEgg)return;
    var pct=_jumpCharge/_jumpChargeMax;
    if(_jumpCharging&&playerEgg.onGround){
        if(!_jumpChargeBar){_jumpChargeBar=_createChargeBar();scene.add(_jumpChargeBar);}
        _jumpChargeBar.visible=true;
        _jumpChargeBar.position.set(playerEgg.mesh.position.x,playerEgg.mesh.position.y+2.5,playerEgg.mesh.position.z);
        var drawPct=_jumpCharge/_jumpChargeMax;
        // If fully charged, show hold timer decay
        if(_jumpCharge>=_jumpChargeMax&&_chargeHoldTimer>0){
            var holdPct=1-_chargeHoldTimer/_chargeHoldMax;
            drawPct=holdPct;
        }
        _drawChargeBar(_jumpChargeBar,drawPct);
    } else {
        if(_jumpChargeBar){_jumpChargeBar.visible=false;}
    }
}

// ---- Stun stars (SF2 style spinning stars above head) ----
function _createStunStars(egg){
    if(egg._stunStars)return;
    var group=new THREE.Group();
    // Stun type based on severity: longer stun = higher tier visual
    // 0=small stars (light), 1=big stars, 2=ducks, 3=birds (heavy)
    var dur=egg._stunTimer||0;
    var stunType=dur<60?0:dur<120?1:dur<200?2:3;
    var items=[];
    for(var i=0;i<4;i++){
        var s;
        if(stunType===0){
            // Small yellow stars
            s=new THREE.Mesh(new THREE.OctahedronGeometry(0.15,0),new THREE.MeshBasicMaterial({color:0xFFFF00,transparent:true,opacity:0.9}));
        } else if(stunType===1){
            // Big white stars with glow
            s=new THREE.Mesh(new THREE.OctahedronGeometry(0.28,0),new THREE.MeshBasicMaterial({color:0xFFFFCC,transparent:true,opacity:0.85}));
        } else if(stunType===2){
            // Little ducks (yellow sphere body + orange beak)
            s=new THREE.Group();
            var body=new THREE.Mesh(new THREE.SphereGeometry(0.14,6,4),new THREE.MeshBasicMaterial({color:0xFFDD00}));
            s.add(body);
            var head=new THREE.Mesh(new THREE.SphereGeometry(0.09,5,4),new THREE.MeshBasicMaterial({color:0xFFDD00}));
            head.position.set(0,0.12,0.06);s.add(head);
            var beak=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.08,4),new THREE.MeshBasicMaterial({color:0xFF8800}));
            beak.position.set(0,0.12,0.16);beak.rotation.x=Math.PI/2;s.add(beak);
            var eye=new THREE.Mesh(new THREE.SphereGeometry(0.02,3,3),new THREE.MeshBasicMaterial({color:0x000000}));
            eye.position.set(0.04,0.15,0.12);s.add(eye);
        } else {
            // Little birds (blue body + wings)
            s=new THREE.Group();
            var bb=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),new THREE.MeshBasicMaterial({color:0x4488FF}));
            s.add(bb);
            var wing1=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.02,0.1),new THREE.MeshBasicMaterial({color:0x6699FF}));
            wing1.position.set(-0.15,0.04,0);s.add(wing1);
            var wing2=wing1.clone();wing2.position.set(0.15,0.04,0);s.add(wing2);
            var bbeak=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.06,3),new THREE.MeshBasicMaterial({color:0xFF6600}));
            bbeak.position.set(0,0,0.14);bbeak.rotation.x=Math.PI/2;s.add(bbeak);
        }
        group.add(s);
        items.push(s);
    }
    scene.add(group);
    egg._stunStars={group:group,stars:items,phase:0,type:stunType};
}
function _updateStunStars(egg){
    if(egg._stunTimer>0){
        if(!egg._stunStars)_createStunStars(egg);
        var ss=egg._stunStars;
        ss.phase+=0.12;
        var p=egg.mesh.position;
        ss.group.position.set(p.x,p.y+1.4,p.z);
        for(var i=0;i<ss.stars.length;i++){
            var a=ss.phase+i/ss.stars.length*Math.PI*2;
            var ix=Math.cos(a)*0.7,iz=Math.sin(a)*0.7;
            var iy=Math.sin(ss.phase*2+i)*0.15;
            ss.stars[i].position.set(ix,iy,iz);
            if(ss.type<=1){
                // Stars spin
                ss.stars[i].rotation.y=ss.phase*3;
            } else if(ss.type===2){
                // Ducks bob and face outward
                ss.stars[i].rotation.y=a+Math.PI;
                ss.stars[i].position.y=iy+Math.sin(ss.phase*3+i*1.5)*0.08;
            } else {
                // Birds flap wings and face forward
                ss.stars[i].rotation.y=a+Math.PI/2;
                if(ss.stars[i].children&&ss.stars[i].children.length>1){
                    var flapAngle=Math.sin(ss.phase*8+i*2)*0.4;
                    ss.stars[i].children[1].rotation.z=flapAngle;
                    ss.stars[i].children[2].rotation.z=-flapAngle;
                }
            }
        }
        ss.group.visible=true;
    } else {
        // Remove stun stars when stun ends so next stun picks a new random type
        if(egg._stunStars&&egg._stunStars.group.visible){
            egg._stunStars.group.visible=false;
            scene.remove(egg._stunStars.group);egg._stunStars=null;
        }
    }
}
function _removeStunStars(egg){
    if(egg._stunStars){scene.remove(egg._stunStars.group);egg._stunStars=null;}
}

// ---- Sonic spin dash state ----
var _spinDashing=false, _spinDashTimer=0, _spinDashTimerMax=0, _spinDashSpeed=0;
var _spinDashBar=null;
function _createSpinDashBar(){
    var canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=40;
    var tex=new THREE.CanvasTexture(canvas);
    tex.minFilter=THREE.LinearFilter;
    var mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});
    var sprite=new THREE.Sprite(mat);
    sprite.scale.set(2.5,0.4,1);
    sprite.renderOrder=1002;
    sprite._canvas=canvas;sprite._ctx=canvas.getContext('2d');sprite._tex=tex;
    return sprite;
}
function _drawSpinDashBar(sprite,pct){
    var ctx=sprite._ctx,w=256,h=40;
    ctx.clearRect(0,0,w,h);
    function rr(x,y,rw,rh,rad){ctx.beginPath();ctx.moveTo(x+rad,y);ctx.lineTo(x+rw-rad,y);ctx.quadraticCurveTo(x+rw,y,x+rw,y+rad);ctx.lineTo(x+rw,y+rh-rad);ctx.quadraticCurveTo(x+rw,y+rh,x+rw-rad,y+rh);ctx.lineTo(x+rad,y+rh);ctx.quadraticCurveTo(x,y+rh,x,y+rh-rad);ctx.lineTo(x,y+rad);ctx.quadraticCurveTo(x,y,x+rad,y);ctx.closePath();}
    ctx.fillStyle='rgba(0,0,0,0.85)';
    rr(2,2,w-4,h-4,8);ctx.fill();
    // Cyan → blue as it depletes
    var r2=0,g2=Math.floor(180+75*pct),b3=255;
    ctx.strokeStyle='rgba('+r2+','+g2+','+b3+','+(0.6+Math.sin(Date.now()*0.02)*0.2)+')';
    ctx.lineWidth=3;rr(5,5,w-10,h-10,6);ctx.stroke();
    var fw=Math.max(4,(w-20)*pct);
    var grad=ctx.createLinearGradient(10,0,10+fw,0);
    grad.addColorStop(0,'rgb(0,'+Math.floor(g2*0.7)+',200)');
    grad.addColorStop(1,'rgb('+r2+','+g2+','+b3+')');
    ctx.fillStyle=grad;
    rr(10,10,fw,h-20,4);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.3)';
    rr(10,10,fw,Math.floor((h-20)/2),4);ctx.fill();
    sprite._tex.needsUpdate=true;
}

// ---- Sprint bar (gradual charge like jump bar) ----
var _sprintBar=null, _sprintCharge=0, _sprintChargeMax=40;
function _createSprintBar(){
    var canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=40;
    var tex=new THREE.CanvasTexture(canvas);
    tex.minFilter=THREE.LinearFilter;
    var mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});
    var sprite=new THREE.Sprite(mat);
    sprite.scale.set(2.5,0.4,1);
    sprite.renderOrder=1001;
    sprite._canvas=canvas;sprite._ctx=canvas.getContext('2d');sprite._tex=tex;
    return sprite;
}
function _drawSprintBar(sprite,pct){
    var ctx=sprite._ctx,w=256,h=40;
    ctx.clearRect(0,0,w,h);
    function rr(x,y,rw,rh,rad){ctx.beginPath();ctx.moveTo(x+rad,y);ctx.lineTo(x+rw-rad,y);ctx.quadraticCurveTo(x+rw,y,x+rw,y+rad);ctx.lineTo(x+rw,y+rh-rad);ctx.quadraticCurveTo(x+rw,y+rh,x+rw-rad,y+rh);ctx.lineTo(x+rad,y+rh);ctx.quadraticCurveTo(x,y+rh,x,y+rh-rad);ctx.lineTo(x,y+rad);ctx.quadraticCurveTo(x,y,x+rad,y);ctx.closePath();}
    ctx.fillStyle='rgba(0,0,0,0.85)';
    rr(2,2,w-4,h-4,8);ctx.fill();
    // Same color scheme as charge bar: green → yellow → red
    var r2,g2,b3;
    if(pct<0.33){r2=0;g2=255;b3=50;}
    else if(pct<0.66){var t=(pct-0.33)/0.33;r2=Math.floor(255*t);g2=Math.floor(255*(1-t*0.3));b3=0;}
    else{var t2=(pct-0.66)/0.34;r2=255;g2=Math.floor(180*(1-t2));b3=0;}
    // Border glow
    ctx.strokeStyle='rgba('+r2+','+g2+','+b3+','+(pct>0.8?0.7+Math.sin(Date.now()*0.015)*0.3:0.5)+')';
    ctx.lineWidth=3;rr(5,5,w-10,h-10,6);ctx.stroke();
    // Fill bar
    var fw=Math.max(4,(w-20)*pct);
    var grad=ctx.createLinearGradient(10,0,10+fw,0);
    grad.addColorStop(0,'rgb('+Math.floor(r2*0.6)+','+Math.floor(g2*0.6)+','+b3+')');
    grad.addColorStop(1,'rgb('+r2+','+g2+','+b3+')');
    ctx.fillStyle=grad;
    rr(10,10,fw,h-20,4);ctx.fill();
    // Shine highlight
    ctx.fillStyle='rgba(255,255,255,0.3)';
    rr(10,10,fw,Math.floor((h-20)/2),4);ctx.fill();
    sprite._tex.needsUpdate=true;
}
// ---- Sprint sound (FC Mario 3 style "lin lin" running tone) ----
var _sprintSoundTimer=0;
function _playSprintTick(pct){
    if(!sfxEnabled)return;
    var ctx=ensureAudio();var t=ctx.currentTime;
    // Two quick ascending notes — "lin lin"
    var baseFreq=1200+pct*600;
    var o1=ctx.createOscillator();var g1=ctx.createGain();
    o1.type='square';
    o1.frequency.setValueAtTime(baseFreq,t);
    o1.frequency.exponentialRampToValueAtTime(baseFreq*1.5,t+0.03);
    g1.gain.setValueAtTime(0.07,t);
    g1.gain.exponentialRampToValueAtTime(0.001,t+0.04);
    o1.connect(g1);g1.connect(ctx.destination);
    o1.start(t);o1.stop(t+0.04);
    var o2=ctx.createOscillator();var g2=ctx.createGain();
    o2.type='square';
    o2.frequency.setValueAtTime(baseFreq*1.2,t+0.05);
    o2.frequency.exponentialRampToValueAtTime(baseFreq*1.8,t+0.08);
    g2.gain.setValueAtTime(0.06,t+0.05);
    g2.gain.exponentialRampToValueAtTime(0.001,t+0.09);
    o2.connect(g2);g2.connect(ctx.destination);
    o2.start(t+0.05);o2.stop(t+0.09);
}

function _updateSprintBar(holdingF){
    if(!playerEgg)return 0;
    // 0.3s delay (18 frames) before sprint starts
    if(!playerEgg._sprintHoldFrames)playerEgg._sprintHoldFrames=0;
    if(holdingF){
        playerEgg._sprintHoldFrames++;
        if(playerEgg._sprintHoldFrames>=18){
            _sprintCharge=Math.min(_sprintCharge+1,_sprintChargeMax);
        }
        playerEgg._wasSprintHolding=true;
    } else {
        // Trigger spin dash on release if charge was high enough
        if(playerEgg._wasSprintHolding&&_sprintCharge>=_sprintChargeMax&&!_spinDashing){
            var sdPct=_sprintCharge/_sprintChargeMax;
            _spinDashing=true;
            _spinDashTimer=Math.floor(80+sdPct*160);
            _spinDashTimerMax=_spinDashTimer;
            _spinDashSpeed=MAX_SPEED*4.0;
            // Store dash direction from player facing
            var dashDir=playerEgg.mesh.rotation.y;
            playerEgg._dashDirX=Math.sin(dashDir);
            playerEgg._dashDirZ=Math.cos(dashDir);
            // Sonic spin sound
            if(sfxEnabled){var ctx=ensureAudio();if(ctx){var ct=ctx.currentTime;var o=ctx.createOscillator();var g=ctx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(200,ct);o.frequency.exponentialRampToValueAtTime(800,ct+0.15);o.frequency.exponentialRampToValueAtTime(400,ct+0.3);g.gain.setValueAtTime(0.12,ct);g.gain.exponentialRampToValueAtTime(0.001,ct+0.35);o.connect(g);g.connect(ctx.destination);o.start(ct);o.stop(ct+0.35);}}
        }
        playerEgg._wasSprintHolding=false;
        playerEgg._sprintHoldFrames=0;
        _sprintCharge=Math.max(_sprintCharge-2,0);
    }
    var pct=_sprintCharge/_sprintChargeMax;
    // Sprint sound — faster as charge fills
    if(holdingF&&pct>0.05){
        _sprintSoundTimer++;
        var interval=Math.max(4,Math.floor(12-pct*8));
        if(_sprintSoundTimer>=interval){_sprintSoundTimer=0;_playSprintTick(pct);}
    } else {
        _sprintSoundTimer=0;
    }
    if(pct>0.01){
        if(!_sprintBar){_sprintBar=_createSprintBar();scene.add(_sprintBar);}
        _sprintBar.visible=true;
        var yOff=(_jumpCharging&&playerEgg.onGround)?1.8:2.1;
        _sprintBar.position.set(playerEgg.mesh.position.x,playerEgg.mesh.position.y+yOff,playerEgg.mesh.position.z);
        _drawSprintBar(_sprintBar,pct);
    } else {
        if(_sprintBar){_sprintBar.visible=false;}
    }
    return pct;
}

// ---- Ascending butt smoke (after charged jump, while vy>0) ----
var _ascendSmoke=false, _ascendSmokePct=0;

function _playChargeBeep(pct){
    if(!sfxEnabled)return;
    var ctx=ensureAudio();var t=ctx.currentTime;
    // Higher pitch and shorter as charge fills
    var freq=400+pct*800;
    var dur=0.06-pct*0.03;
    var o=ctx.createOscillator();var g=ctx.createGain();
    o.type='square';o.frequency.setValueAtTime(freq,t);
    o.frequency.exponentialRampToValueAtTime(freq*1.3,t+dur);
    g.gain.setValueAtTime(0.12,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g);g.connect(ctx.destination);
    o.start(t);o.stop(t+dur);
}

// ---- Charge jump effects: butt smoke (charging) + ground dust (release) ----
var _chargeParticles=[];
// Butt smoke — called every few frames while charging
function _spawnButtSmoke(egg,pct){
    var count=1+Math.floor(pct*2);
    for(var i=0;i<count;i++){
        var size=0.15+Math.random()*0.2;
        var geo=new THREE.SphereGeometry(size,5,4);
        var gray=0.7+Math.random()*0.3;
        var mat=new THREE.MeshBasicMaterial({color:new THREE.Color(gray,gray,gray),transparent:true,opacity:0.6,depthTest:false});
        var m=new THREE.Mesh(geo,mat);
        // Spawn behind and below the egg
        var dir=egg.mesh.rotation.y;
        var bx=egg.mesh.position.x-Math.sin(dir)*0.4+(Math.random()-0.5)*0.3;
        var by=egg.mesh.position.y+0.3+Math.random()*0.2;
        var bz=egg.mesh.position.z-Math.cos(dir)*0.4+(Math.random()-0.5)*0.3;
        m.position.set(bx,by,bz);
        scene.add(m);
        _chargeParticles.push({mesh:m,vx:(Math.random()-0.5)*0.01,vy:0.02+Math.random()*0.02,vz:(Math.random()-0.5)*0.01,life:20+Math.random()*15,maxLife:35,type:'smoke'});
    }
}
// Ground dust — burst on jump release
function _spawnGroundDust(x,y,z,pct){
    var count=Math.floor(6+pct*14);
    for(var i=0;i<count;i++){
        var size=0.2+Math.random()*0.3*pct;
        var geo=new THREE.SphereGeometry(size,5,4);
        var brown=0.55+Math.random()*0.2;
        var mat=new THREE.MeshBasicMaterial({color:new THREE.Color(brown,brown*0.85,brown*0.6),transparent:true,opacity:0.7,depthTest:false});
        var m=new THREE.Mesh(geo,mat);
        m.position.set(x+(Math.random()-0.5)*0.5,y+0.1+Math.random()*0.2,z+(Math.random()-0.5)*0.5);
        scene.add(m);
        var angle=Math.random()*Math.PI*2;
        var spd=0.04+Math.random()*0.1*pct;
        _chargeParticles.push({mesh:m,vx:Math.cos(angle)*spd,vy:0.01+Math.random()*0.03,vz:Math.sin(angle)*spd,life:25+Math.random()*20,maxLife:45,type:'dust'});
    }
    // Dust ring on ground
    var ringGeo=new THREE.RingGeometry(0.2,0.8+pct*1.5,16);
    var ringMat=new THREE.MeshBasicMaterial({color:0xBBAA88,transparent:true,opacity:0.5,side:THREE.DoubleSide,depthTest:false});
    var ring=new THREE.Mesh(ringGeo,ringMat);
    ring.position.set(x,y+0.05,z);ring.rotation.x=-Math.PI/2;
    scene.add(ring);
    _chargeParticles.push({mesh:ring,vx:0,vy:0,vz:0,life:18,maxLife:18,type:'ring',scaleSpeed:0.2+pct*0.3});
}
function _updateChargeParticles(){
    for(var i=_chargeParticles.length-1;i>=0;i--){
        var p=_chargeParticles[i];
        p.life--;
        if(p.life<=0){scene.remove(p.mesh);_chargeParticles.splice(i,1);continue;}
        var t=p.life/p.maxLife;
        p.mesh.material.opacity=t*(p.type==='smoke'?0.5:0.6);
        if(p.type==='ring'){
            var s=1+(1-t)*4*p.scaleSpeed;
            p.mesh.scale.set(s,s,s);
        } else {
            p.mesh.position.x+=p.vx;p.mesh.position.y+=p.vy;p.mesh.position.z+=p.vz;
            if(p.type==='smoke'){
                // Smoke rises and expands
                p.vy+=0.001;
                var sc=1+(1-t)*1.5;p.mesh.scale.set(sc,sc,sc);
            } else {
                // Dust settles
                p.vy-=0.001;
                if(p.mesh.position.y<0.05){p.mesh.position.y=0.05;p.vy=0;}
                p.vx*=0.96;p.vz*=0.96;
                var sc2=0.6+t*0.4;p.mesh.scale.set(sc2,sc2,sc2);
            }
        }
    }
}
