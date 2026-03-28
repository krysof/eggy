// ============================================================
//  moves.js — Unified projectile system (Phase 1+2 refactor)
// ============================================================

// Global projectile pool — replaces _playerHadouken + _npcHadoukens
if(!window._allProjectiles) window._allProjectiles=[];

// ---- Shared hit detection utility ----
function _moveHitDetect(sourceEgg, projPos, range, callback){
    for(var i=0;i<allEggs.length;i++){
        var t=allEggs[i];
        if(t===sourceEgg||!t.alive||t.heldBy||t._piledriverLocked)continue;
        var dx=t.mesh.position.x-projPos.x;
        var dz=t.mesh.position.z-projPos.z;
        var dist=Math.sqrt(dx*dx+dz*dz);
        if(dist<range){
            if(callback(t,dist,dx,dz))return true;
        }
    }
    return false;
}

// ---- Shared knockback application ----
function _moveApplyKnockback(target, dx, dz, dist, force, vy, opts){
    opts=opts||{};
    target.vx+=dx*force;
    target.vz+=dz*force;
    target.vy=vy;
    target.squash=opts.squash||0.5;
    target.throwTimer=opts.throwTimer||25;
    target._bounces=opts.bounces||1;
    if(opts.stunDmg) _addStunDamage(target,opts.stunDmg);
    if(opts.fire) target._onFire=opts.fire;
    if(opts.electrocute){target._electrocuted=opts.electrocute;target._elecKnockDir={x:-dx/(dist||1),z:-dz/(dist||1)};target.vx=0;target.vz=0;}
    if(opts.slashEffect) spawnSlashEffect(target,opts.slashDir||0);
    _dropNpcStolenCoins(target);
    if(target.isPlayer) playHitSound(target.mesh.position.x,target.mesh.position.z);
    else playHitSound(target.mesh.position.x,target.mesh.position.z);
}

// ---- Create sonic boom crescent canvas texture ----
function _createSonicBoomTexture(){
    var cvs=document.createElement('canvas');cvs.width=64;cvs.height=64;
    var ctx=cvs.getContext('2d');
    ctx.fillStyle='#FFDD44';
    ctx.beginPath();ctx.arc(32,32,28,0,Math.PI*2);ctx.fill();
    ctx.globalCompositeOperation='destination-out';
    ctx.beginPath();ctx.arc(44,32,22,0,Math.PI*2);ctx.fill();
    return new THREE.CanvasTexture(cvs);
}

// ---- Create yoga fire mesh group ----
function _createYogaFireGroup(){
    var grp=new THREE.Group();
    var core=new THREE.Mesh(new THREE.SphereGeometry(0.3,8,6),new THREE.MeshBasicMaterial({color:0xFFDD00,transparent:true,opacity:0.95}));
    grp.add(core);
    var outer=new THREE.Mesh(new THREE.SphereGeometry(0.45,8,6),new THREE.MeshBasicMaterial({color:0xFF4400,transparent:true,opacity:0.5}));
    grp.add(outer);
    for(var i=0;i<6;i++){
        var p=new THREE.Mesh(new THREE.SphereGeometry(0.15+Math.random()*0.15,4,3),new THREE.MeshBasicMaterial({color:[0xFF2200,0xFF6600,0xFFAA00,0xFFDD00][i%4],transparent:true,opacity:0.7}));
        p.position.set((Math.random()-0.5)*0.4,(Math.random()-0.5)*0.4,(Math.random()-0.5)*0.4);
        grp.add(p);
    }
    return grp;
}

// ---- Unified projectile creation ----
// type: 'normal' | 'sonicBoom' | 'yogaFire'
// params: {speed, life, color, ringColor, burns, isPlayer, type}
function MoveProjectile_execute(egg, dir, params){
    var type=params.type||'normal';
    var spd=params.speed;
    var life=params.life;
    var sx=egg.mesh.position.x+Math.sin(dir)*1.5;
    var sy=egg.mesh.position.y+0.7;
    var sz=egg.mesh.position.z+Math.cos(dir)*1.5;
    var ball,ring;

    if(type==='sonicBoom'){
        // Crescent plane
        var tex=_createSonicBoomTexture();
        ball=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.2),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}));
        ball.position.set(sx,sy,sz);
        ball.rotation.x=-Math.PI/2;
        ball.rotation.order='YXZ';
        ball.rotation.y=dir;
        scene.add(ball);
        // Small glow sphere as ring
        ring=new THREE.Mesh(new THREE.SphereGeometry(0.15,6,4),new THREE.MeshBasicMaterial({color:params.ringColor||0xFFFF88,transparent:true,opacity:0.3}));
        ring.position.copy(ball.position);scene.add(ring);
    } else if(type==='yogaFire'){
        // Multi-mesh fire group
        ball=_createYogaFireGroup();
        ball.position.set(sx,sy,sz);
        scene.add(ball);
        ring=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.08,6,12),new THREE.MeshBasicMaterial({color:params.ringColor||0xFF8800,transparent:true,opacity:0.4}));
        ring.position.copy(ball.position);scene.add(ring);
    } else {
        // Normal sphere projectile
        var radius=params.radius||0.4;
        var npcRadius=params.npcRadius||0.35;
        var r=params.isPlayer?radius:npcRadius;
        ball=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),new THREE.MeshBasicMaterial({color:params.color,transparent:true,opacity:0.85}));
        ball.position.set(sx,sy,sz);scene.add(ball);
        var torusR=params.isPlayer?0.5:0.45;
        var torusTube=params.isPlayer?0.08:0.07;
        ring=new THREE.Mesh(new THREE.TorusGeometry(torusR,torusTube,6,12),new THREE.MeshBasicMaterial({color:params.ringColor,transparent:true,opacity:params.isPlayer?0.6:0.6}));
        ring.position.copy(ball.position);scene.add(ring);
    }

    var proj={
        ball:ball,
        ring:ring,
        vx:Math.sin(dir)*spd,
        vz:Math.cos(dir)*spd,
        life:life,
        owner:egg,
        burns:!!params.burns,
        isSonicBoom:(type==='sonicBoom'),
        isYogaFire:(type==='yogaFire'),
        isPlayer:!!params.isPlayer
    };

    // Player can only have one active projectile — tracked via window._playerHadouken
    if(params.isPlayer){
        window._playerHadouken=proj;
    }

    window._allProjectiles.push(proj);
    return proj;
}

// ---- Unified projectile update (called each frame) ----
// Returns false when projectile should be removed
function MoveProjectile_update(proj){
    // Move
    proj.ball.position.x+=proj.vx;
    proj.ball.position.z+=proj.vz;
    proj.ring.position.copy(proj.ball.position);
    proj.ring.rotation.z+=0.2;

    // Sonic boom: spin the crescent plane
    if(proj.isSonicBoom){
        proj.ball.rotation.z+=0.5;
    }

    // Yoga fire: flicker flame particles
    if(proj.isYogaFire&&proj.ball.children){
        for(var i=2;i<proj.ball.children.length;i++){
            var ch=proj.ball.children[i];
            ch.position.set((Math.random()-0.5)*0.5,(Math.random()-0.5)*0.5,(Math.random()-0.5)*0.5);
            ch.material.opacity=0.4+Math.random()*0.5;
            ch.scale.setScalar(0.7+Math.random()*0.8);
        }
        proj.ball.children[1].scale.setScalar(0.9+Math.sin(proj.life*0.3)*0.2);
    }

    proj.life--;

    // Opacity fade
    if(proj.ball.material){
        proj.ball.material.opacity=Math.min(proj.isPlayer?0.9:0.85,proj.life/30);
    } else if(proj.isYogaFire&&proj.ball.children[0]){
        proj.ball.children[0].material.opacity=Math.min(0.95,proj.life/30);
    }
    proj.ring.material.opacity=Math.min(0.6,proj.life/30);

    // Hit detection
    var hit=_moveHitDetect(proj.owner, proj.ball.position, 1.5, function(target){
        target.vx+=proj.vx*0.8;
        target.vz+=proj.vz*0.8;
        target.vy=0.15;
        target.squash=0.5;
        target.throwTimer=25;
        target._bounces=1;
        if(proj.isPlayer){
            _addStunDamage(target,15);
        } else {
            target._stunTimer=50;
        }
        if(proj.burns) target._onFire=120;
        if(proj.isSonicBoom) spawnSlashEffect(target,Math.atan2(proj.vx,proj.vz));
        _dropNpcStolenCoins(target);
        if(target.isPlayer) playHitSound(proj.ball.position.x,proj.ball.position.z);
        else playHitSound(target.mesh.position.x,target.mesh.position.z);
        proj.life=0;
        return true; // stop after first hit
    });

    if(proj.life<=0) return false;
    return true;
}

// ---- Cleanup a projectile's meshes ----
function MoveProjectile_cleanup(proj){
    scene.remove(proj.ball);
    scene.remove(proj.ring);
    // Clear player reference if this was the player's projectile
    if(proj.isPlayer && window._playerHadouken===proj){
        window._playerHadouken=null;
    }
}
