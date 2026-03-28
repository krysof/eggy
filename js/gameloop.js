// gameloop.js — DANBO World
// ============================================================
//  CITY UPDATE (portals, coins, NPCs)
// ============================================================
// Pain expression — squint eyes and open mouth when hurt
function _updatePainFace(egg){
    var ud=egg.mesh.userData;
    if(!ud._eyeWhites||!ud._pupils)return;
    var inPain=egg._hitStun>0||egg._stunTimer>0||egg.throwTimer>0||egg._electrocuted>0||egg._elecFlying>0;
    if(inPain){
        // Squint eyes — flatten vertically
        for(var i=0;i<ud._eyeWhites.length;i++){
            ud._eyeWhites[i].scale.set(1,0.2,0.7); // squished flat = squinting
            ud._pupils[i].visible=false;
            ud._shines[i].visible=false;
        }
        // Mouth — open in pain (move smile down and scale)
        if(ud._smile){ud._smile.position.y=-0.05;ud._smile.scale.set(1.3,1.3,1.3);}
    } else {
        // Normal eyes
        for(var j=0;j<ud._eyeWhites.length;j++){
            ud._eyeWhites[j].scale.set(1,1.2,0.7);
            ud._pupils[j].visible=true;
            ud._shines[j].visible=true;
        }
        if(ud._smile){ud._smile.position.y=0;ud._smile.scale.set(1,1,1);}
    }
}
function updateCity(){
    if(!playerEgg)return;
    const px=playerEgg.mesh.position.x, pz=playerEgg.mesh.position.z, py=playerEgg.mesh.position.y;

    // Animate portals
    const t=Date.now()*0.001;
    for(const p of portals){
        p.ring.rotation.z=t*0.5;
        p.inner.rotation.z=-t*0.8;
        // Particles orbit
        p.mesh.children.forEach(ch=>{
            if(ch.userData.orbitPhase!==undefined){
                const a=ch.userData.orbitPhase+t*1.5;
                ch.position.set(Math.cos(a)*1.8, 2.5+Math.sin(a*2)*0.5, Math.sin(a)*1.8);
            }
        });
    }

    // ---- Hadouken projectile update ----
    if(window._playerHadouken){
        var _hk=window._playerHadouken;
        _hk.ball.position.x+=_hk.vx;_hk.ball.position.z+=_hk.vz;
        _hk.ring.position.copy(_hk.ball.position);
        _hk.ring.rotation.z+=0.2;
        // Sonic Boom: spin the crescent plane
        if(_hk.isSonicBoom){
            _hk.ball.rotation.z+=0.5; // spin like a disc
        }
        // Yoga Fire: flicker flame particles
        if(_hk.isYogaFire&&_hk.ball.children){
            for(var _yfc=2;_yfc<_hk.ball.children.length;_yfc++){
                var _yfch=_hk.ball.children[_yfc];
                _yfch.position.set((Math.random()-0.5)*0.5,(Math.random()-0.5)*0.5,(Math.random()-0.5)*0.5);
                _yfch.material.opacity=0.4+Math.random()*0.5;
                _yfch.scale.setScalar(0.7+Math.random()*0.8);
            }
            _hk.ball.children[1].scale.setScalar(0.9+Math.sin(_hk.life*0.3)*0.2); // outer flame pulse
        }
        _hk.life--;
        if(_hk.ball.material){_hk.ball.material.opacity=Math.min(0.9,_hk.life/30);}
        else if(_hk.isYogaFire&&_hk.ball.children[0]){_hk.ball.children[0].material.opacity=Math.min(0.95,_hk.life/30);}
        _hk.ring.material.opacity=Math.min(0.6,_hk.life/30);
        // Hit eggs
        for(var _hei=0;_hei<allEggs.length;_hei++){
            var _he2=allEggs[_hei];if(_he2===_hk.owner||!_he2.alive||_he2.heldBy||_he2._piledriverLocked)continue;
            var _hdx=_he2.mesh.position.x-_hk.ball.position.x;
            var _hdz=_he2.mesh.position.z-_hk.ball.position.z;
            var _hd2=Math.sqrt(_hdx*_hdx+_hdz*_hdz);
            if(_hd2<1.5){
                _he2.vx+=_hk.vx*0.8;_he2.vz+=_hk.vz*0.8;_he2.vy=0.15;
                _he2.squash=0.5;_he2.throwTimer=25;_he2._bounces=1;_addStunDamage(_he2,15);
                if(_hk.burns)_he2._onFire=120; // 2 seconds fire
                _dropNpcStolenCoins(_he2);playHitSound(_he2.mesh.position.x,_he2.mesh.position.z);
                _hk.life=0;break;
            }
        }
        if(_hk.life<=0){scene.remove(_hk.ball);scene.remove(_hk.ring);window._playerHadouken=null;}
    }
    // NPC Hadouken projectiles
    if(!window._npcHadoukens)window._npcHadoukens=[];
    for(var _nhi=window._npcHadoukens.length-1;_nhi>=0;_nhi--){
        var _nh=window._npcHadoukens[_nhi];
        _nh.ball.position.x+=_nh.vx;_nh.ball.position.z+=_nh.vz;
        _nh.ring.position.copy(_nh.ball.position);_nh.ring.rotation.z+=0.2;
        _nh.life--;
        _nh.ball.material.opacity=Math.min(0.85,_nh.life/30);
        _nh.ring.material.opacity=Math.min(0.6,_nh.life/30);
        for(var _nhei=0;_nhei<allEggs.length;_nhei++){
            var _nhe=allEggs[_nhei];if(_nhe===_nh.owner||!_nhe.alive||_nhe.heldBy)continue;
            var _nhdx=_nhe.mesh.position.x-_nh.ball.position.x;
            var _nhdz=_nhe.mesh.position.z-_nh.ball.position.z;
            if(Math.sqrt(_nhdx*_nhdx+_nhdz*_nhdz)<1.5){
                _nhe.vx+=_nh.vx*0.8;_nhe.vz+=_nh.vz*0.8;_nhe.vy=0.15;
                _nhe.squash=0.5;_nhe.throwTimer=25;_nhe._bounces=1;_nhe._stunTimer=50;
                if(_nh.burns)_nhe._onFire=120;
                _dropNpcStolenCoins(_nhe);if(_nhe.isPlayer)playHitSound(_nh.ball.position.x,_nh.ball.position.z);
                _nh.life=0;break;
            }
        }
        if(_nh.life<=0){scene.remove(_nh.ball);scene.remove(_nh.ring);window._npcHadoukens.splice(_nhi,1);}
    }

    // ---- Fountain water animation ----
    if(window._fountainPoolWater){
        var wt=Date.now()*0.002;
        window._fountainPoolWater.position.y=0.6+Math.sin(wt)*0.03;
        window._fountainPoolWater.rotation.y=wt*0.1;
    }
    if(window._fountainInnerWater){
        var wt2=Date.now()*0.003;
        window._fountainInnerWater.position.y=1.35+Math.sin(wt2+1)*0.02;
    }
    // ---- Fish animation (swim + jump + crawl back when thrown) ----
    if(window._waterWheels){
        for(var _wwi2=0;_wwi2<window._waterWheels.length;_wwi2++){
            window._waterWheels[_wwi2].children[0].rotation.x+=0.01; // rotate wheel
            for(var _wci=1;_wci<7;_wci++){window._waterWheels[_wwi2].children[_wci].rotation.z+=0.01;} // spokes
        }
    }
    if(window._cityFish){
        for(var _fi2=0;_fi2<window._cityFish.length;_fi2++){
            var fish=window._cityFish[_fi2];
            // Find matching prop
            var _fishProp=null;
            for(var _fpi=0;_fpi<cityProps.length;_fpi++){
                if(cityProps[_fpi]._fishRef===fish){_fishProp=cityProps[_fpi];break;}
            }
            // Sync grabbed state from prop
            if(_fishProp)fish.grabbed=_fishProp.grabbed;
            if(fish.grabbed)continue;
            // Skip animation while being thrown — let prop physics handle it
            if(_fishProp&&_fishProp.throwTimer>0){fish._thrownRecovery=180+Math.floor(Math.random()*300);continue;}
            // Post-throw recovery: lie still then flop back
            if(fish._thrownRecovery>0){
                fish._thrownRecovery--;
                if(fish.group.position.y>0.2){fish.group.position.y-=0.05;if(fish.group.position.y<0.2)fish.group.position.y=0.2;}
                if(fish._thrownRecovery>60){
                    // Lying still on ground (stunned)
                    fish.group.rotation.z=Math.PI/2*0.8;
                    fish.group.position.y=0.15+Math.abs(Math.sin(Date.now()*0.008))*0.05;
                    continue;
                }
                // Flop toward nearest water (center pool)
                var _ftpx=-fish.group.position.x;var _ftpz=-fish.group.position.z;
                var _ftpd=Math.sqrt(_ftpx*_ftpx+_ftpz*_ftpz)||1;
                fish.group.position.x+=_ftpx/_ftpd*0.12;
                fish.group.position.z+=_ftpz/_ftpd*0.12;
                fish.group.position.y=0.15+Math.abs(Math.sin(Date.now()*0.015))*0.15;
                fish.group.rotation.y=Math.atan2(_ftpx,_ftpz);
                fish.group.rotation.z=Math.sin(Date.now()*0.02)*0.5;
                var _ftDist=Math.sqrt(fish.group.position.x*fish.group.position.x+fish.group.position.z*fish.group.position.z);
                if(_ftDist<8||Math.abs(_ftDist-25)<4||Math.abs(_ftDist-55)<4){fish._thrownRecovery=0;fish.angle=Math.atan2(fish.group.position.z,fish.group.position.x);fish.radius=_ftDist||3;}
                continue;
            }
            // Check if fish was thrown and landed outside water — crawl back
            var fDistFromPool=Math.sqrt(fish.group.position.x*fish.group.position.x+fish.group.position.z*fish.group.position.z);
            var _inWater=(fDistFromPool<7)||(Math.abs(fDistFromPool-25)<3)||(Math.abs(fDistFromPool-55)<3);
            // Also check radial canals (within 2 units of x=0 or z=0 axes)
            var _onCanalX=Math.abs(fish.group.position.z)<2&&Math.abs(fish.group.position.x)>8;
            var _onCanalZ=Math.abs(fish.group.position.x)<2&&Math.abs(fish.group.position.z)>8;
            if(_onCanalX||_onCanalZ)_inWater=true;
            if(!_inWater&&!fish.jumping){
                // Fish is on land — flop back to nearest water
                var fToPoolX=-fish.group.position.x;var fToPoolZ=-fish.group.position.z;
                var fToPoolD=Math.sqrt(fToPoolX*fToPoolX+fToPoolZ*fToPoolZ)||1;
                fish.group.position.x+=fToPoolX/fToPoolD*0.04;
                fish.group.position.z+=fToPoolZ/fToPoolD*0.04;
                fish.group.position.y=0.15;
                fish.group.rotation.y=Math.atan2(fToPoolX,fToPoolZ);
                fish.group.rotation.z=Math.sin(Date.now()*0.02)*0.5;
                fish.group.position.y+=Math.abs(Math.sin(Date.now()*0.015))*0.15;
                continue;
            }
            // In water — realistic fish swimming
            if(_inWater){
                fish.group.rotation.z=0;
                fish.group.rotation.x=0;
            }
            // Realistic swimming: vary speed, occasional pause, tail wiggle
            if(!fish._swimState)fish._swimState='swim';
            if(!fish._swimPause)fish._swimPause=0;
            if(!fish._swimSpeedMul)fish._swimSpeedMul=1;
            if(fish._swimPause>0){
                // Paused — idle drift
                fish._swimPause--;
                fish.group.position.y=fish.baseY+Math.sin(Date.now()*0.002+_fi2)*0.03;
                // Gentle tail wiggle while idle
                var _tailMesh=fish.group.children[1]; // tail cone
                if(_tailMesh)_tailMesh.rotation.y=Math.sin(Date.now()*0.005)*0.2;
            } else {
                // Swimming — move along circle with speed variation
                fish._swimSpeedMul+=(((Math.sin(Date.now()*0.001+_fi2*3)>0)?1.3:0.6)-fish._swimSpeedMul)*0.02;
                fish.angle+=fish.speed*fish._swimSpeedMul;
                fish.group.position.x=Math.cos(fish.angle)*fish.radius;
                fish.group.position.z=Math.sin(fish.angle)*fish.radius;
                // Face swimming direction with slight body sway
                fish.group.rotation.y=fish.angle+Math.PI/2+Math.sin(Date.now()*0.008)*0.1;
                // Tail wiggle while swimming (faster = more wiggle)
                var _tailM=fish.group.children[1];
                if(_tailM)_tailM.rotation.y=Math.sin(Date.now()*0.015)*0.4*fish._swimSpeedMul;
                // Body sway side to side
                fish.group.rotation.z=Math.sin(Date.now()*0.006+_fi2)*0.08;
                // Random pause
                if(Math.random()<0.002)fish._swimPause=60+Math.floor(Math.random()*120);
            }
            // Jump timer
            fish.jumpTimer--;
            if(fish.jumpTimer<=0&&!fish.jumping){
                fish.jumping=true;
                fish.jumpVy=0.08+Math.random()*0.06;
                fish.jumpTimer=180+Math.floor(Math.random()*300);
                if(sfxEnabled&&playerEgg){
                    var fdx2=fish.group.position.x-playerEgg.mesh.position.x;
                    var fdz2=fish.group.position.z-playerEgg.mesh.position.z;
                    if(fdx2*fdx2+fdz2*fdz2<400)playSplashSound();
                }
            }
            if(fish.jumping){
                fish.group.position.y+=fish.jumpVy;
                fish.jumpVy-=0.005;
                fish.group.rotation.x=Math.sin(Date.now()*0.01)*0.5;
                if(fish.group.position.y<=fish.baseY){
                    fish.group.position.y=fish.baseY;
                    fish.jumping=false;
                    fish.group.rotation.x=0;
                }
            } else {
                fish.group.position.y=fish.baseY+Math.sin(Date.now()*0.003+_fi2)*0.05;
            }
        }
    }
    if(window._fountainParticles){
        for(var ffi=0;ffi<window._fountainParticles.length;ffi++){
            var fp=window._fountainParticles[ffi];
            fp.life++;
            if(fp.life>=fp.maxLife||!fp.mesh.visible){
                // Respawn immediately — continuous spray
                fp.life=0;
                fp.mesh.position.set(fp.ox,fp.oy,fp.oz);
                fp.mesh.visible=true;
                fp.mesh.material.opacity=0.6;
                if(fp.type==='jet'){
                    fp.vx=(Math.random()-0.5)*0.12;
                    fp.vy=0.12+Math.random()*0.08;
                    fp.vz=(Math.random()-0.5)*0.12;
                    fp.maxLife=70+Math.random()*40;
                } else {
                    var lla2=fp._lionAngle||0;
                    fp.vx=-Math.cos(lla2)*0.1+(Math.random()-0.5)*0.03;
                    fp.vy=0.02+Math.random()*0.03;
                    fp.vz=-Math.sin(lla2)*0.1+(Math.random()-0.5)*0.03;
                    fp.maxLife=40+Math.random()*20;
                }
            }
            fp.mesh.position.x+=fp.vx;
            fp.mesh.position.z+=fp.vz;
            fp.mesh.position.y+=fp.vy;
            if(fp.type==='jet'){
                fp.vy-=0.004;
            } else {
                fp.vy-=0.003;
            }
            // Hit water surface — hide and respawn next frame
            if(fp.mesh.position.y<0.65){fp.mesh.visible=false;}
            var fAlpha=1-fp.life/fp.maxLife;
            fp.mesh.material.opacity=Math.max(0.05,0.7*fAlpha);
        }
    }
    // Fountain splash when player walks in water
    if(_splashCooldown>0)_splashCooldown--;
    if(_beamSoundCD>0)_beamSoundCD--;
    if(_explSoundCD>0)_explSoundCD--;
    if(_missileSoundCD>0)_missileSoundCD--;
    var _fdist=Math.sqrt(px*px+pz*pz);
    var _pspd=playerEgg?Math.sqrt((playerEgg.vx||0)*(playerEgg.vx||0)+(playerEgg.vz||0)*(playerEgg.vz||0)):0;
    if(_fdist<6.5&&playerEgg.mesh.position.y<1.5&&window._fountainSplashParticles){
        // Play splash sound on entry
        if(!playerEgg._inFountain){playerEgg._inFountain=true;playSplashSound();}
        // Check if player is moving (wading)
        var _spawnRate=_pspd>0.02?0.5:0.12; // more splashes when moving
        // Continuous wading splash particles
        for(var fsi2=0;fsi2<window._fountainSplashParticles.length;fsi2++){
            var fsp2=window._fountainSplashParticles[fsi2];
            if(!fsp2.mesh.visible&&fsp2.life>=fsp2.maxLife&&Math.random()<_spawnRate){
                fsp2.mesh.position.set(px+(Math.random()-0.5)*2,0.7,pz+(Math.random()-0.5)*2);
                fsp2.vx=(Math.random()-0.5)*0.2+(playerEgg.vx||0)*0.5;
                fsp2.vy=0.1+Math.random()*0.18;
                fsp2.vz=(Math.random()-0.5)*0.2+(playerEgg.vz||0)*0.5;
                fsp2.life=0;fsp2.maxLife=18+Math.random()*12;
                fsp2.mesh.visible=true;
            }
        }
    } else {
        if(playerEgg)playerEgg._inFountain=false;
    }
    // Periodic splash sound while wading
    if(playerEgg&&playerEgg._inFountain&&_pspd>0.03){playSplashSound();}
    // Always update visible splash particles even if player left
    if(window._fountainSplashParticles){
        for(var fsu=0;fsu<window._fountainSplashParticles.length;fsu++){
            var fsp3=window._fountainSplashParticles[fsu];
            if(fsp3.mesh.visible){
                fsp3.life++;
                fsp3.mesh.position.x+=fsp3.vx;
                fsp3.mesh.position.y+=fsp3.vy;
                fsp3.mesh.position.z+=fsp3.vz;
                fsp3.vy-=0.008;
                fsp3.mesh.material.opacity=0.7*(1-fsp3.life/fsp3.maxLife);
                if(fsp3.life>=fsp3.maxLife){fsp3.mesh.visible=false;}
            }
        }
    }

    // Check portal proximity — show prompt on base, enter when walk into ring
    // Skip portal triggers while spin dashing
    if(_pipeArrivalCooldown>0)_pipeArrivalCooldown--;
    var _notWalking=!!(playerEgg._hondaDash||playerEgg._blankaSpinTimer||playerEgg._tatsuActive||playerEgg._shoryuActive||playerEgg._guileSomersault||playerEgg.throwTimer>0||playerEgg._blankaShock||playerEgg._yogaFlame||playerEgg._hyakuretsuTimer||playerEgg._hyakuretsuKickTimer||!playerEgg.onGround);
    if(_pipeTraveling||_pipeArrivalCooldown>0||_spinDashing||_notWalking){document.getElementById('portal-prompt').style.display='none';} else {
    var _pp=document.getElementById('portal-prompt');
    var _pt=document.getElementById('portal-prompt-text');
    var _nearP=null, _nearD=9999;
    for(var pi=0;pi<portals.length;pi++){
        var _dx=px-portals[pi].x, _dz=pz-portals[pi].z;
        var _dy=(currentCityStyle===5)?(py-(portals[pi].y||0)):0;
        var _d=Math.sqrt(_dx*_dx+_dz*_dz+_dy*_dy);
        // Ground portals: only trigger when player is near ground level (y < 4)
        if(currentCityStyle!==5&&py>4)continue;
        if(_d<_nearD){_nearD=_d;_nearP=portals[pi];}
    }
    if(_nearP&&_nearD<6.0){
        _pp.style.display='block';
        var _dismissKey=(_nearP.raceIndex>=0)?_nearP.raceIndex:('h'+(_nearP._targetStyle||0));
        if(_nearD<2.5&&!_portalConfirmOpen&&_portalDismissed!==_dismissKey){
            _pp.style.display='none';
            showPortalConfirm(_nearP);
        } else if(!_portalConfirmOpen){
            _pt.textContent=_nearP.name+' \u2014 '+_nearP.desc+'  ('+L('walkIn')+')';
        }
    } else if(!_portalConfirmOpen){
        _pp.style.display='none';
        _portalDismissed=null;
    }
    } // end if !_pipeTraveling

    // Coins
    for(const c of cityCoins){
        if(c.collected)continue;
        // Sonic-style scatter physics
        if(c._scatterTimer>0){
            c._scatterTimer--;
            c.mesh.position.x+=c._scatterVX;
            c.mesh.position.y+=c._scatterVY;
            c.mesh.position.z+=c._scatterVZ;
            c._scatterVY-=0.008; // gravity
            c.mesh.rotation.y+=0.2;
            c.mesh.rotation.x+=0.15;
            // Bounce on ground
            if(c.mesh.position.y<1.2){c.mesh.position.y=1.2;c._scatterVY=Math.abs(c._scatterVY)*0.5;c._scatterVX*=0.7;c._scatterVZ*=0.7;}
            // Building wall bounce for scattered coins
            for(var _sci=0;_sci<cityColliders.length;_sci++){
                    var _sc=cityColliders[_sci];
                    var _scdx=c.mesh.position.x-_sc.x, _scdz=c.mesh.position.z-_sc.z;
                    if(Math.abs(_scdx)<_sc.hw+0.5&&Math.abs(_scdz)<_sc.hd+0.5&&c.mesh.position.y<(_sc.h||6)){
                        var _scox=_sc.hw+0.5-Math.abs(_scdx);
                        var _scoz=_sc.hd+0.5-Math.abs(_scdz);
                        if(_scox<_scoz){c.mesh.position.x+=(_scdx>=0?1:-1)*_scox;c._scatterVX*=-0.5;}
                        else{c.mesh.position.z+=(_scdz>=0?1:-1)*_scoz;c._scatterVZ*=-0.5;}
                        break;
                    }
                }
                // City boundary bounce for coins
                var _cb=(currentCityStyle===5?MOON_CITY_SIZE:CITY_SIZE)-1;
                if(c.mesh.position.x>_cb){c.mesh.position.x=_cb;c._scatterVX=-Math.abs(c._scatterVX)*0.4;}
                if(c.mesh.position.x<-_cb){c.mesh.position.x=-_cb;c._scatterVX=Math.abs(c._scatterVX)*0.4;}
                if(c.mesh.position.z>_cb){c.mesh.position.z=_cb;c._scatterVZ=-Math.abs(c._scatterVZ)*0.4;}
                if(c.mesh.position.z<-_cb){c.mesh.position.z=-_cb;c._scatterVZ=Math.abs(c._scatterVZ)*0.4;}
            if(c._scatterTimer<=0){
                // Settle coin at final position
                c.baseY=1.2;c.mesh.position.y=1.2;
                c._scatterVX=0;c._scatterVY=0;c._scatterVZ=0;
            }
            continue; // skip normal bobbing while scattering
        }
        c.mesh.rotation.y+=0.03;
        var coinBaseY=c.baseY||1.2;
        c.mesh.position.y=coinBaseY+Math.sin(Date.now()*0.003+c.mesh.position.x)*0.2;
        var cdx2=px-c.mesh.position.x, cdz2=pz-c.mesh.position.z, cdy2=py-c.mesh.position.y;
        if(Math.sqrt(cdx2*cdx2+cdz2*cdz2+cdy2*cdy2)<1.5){
            c.collected=true; c.mesh.visible=false;
            coins++; document.getElementById('coin-hud').textContent='⭐ '+coins;
            playCoinSound();
            // Tower of Babel trigger at 10 coins
            if(coins>=10&&!_babylonTriggered){_triggerBabylonEvent();}
        }
    }

    // NPC AI
    for(const npc of cityNPCs){
        updateCityNPC(npc);
        updateEggPhysics(npc, true);
        _updateStunStars(npc);_updatePainFace(npc);
        // Stun meter decay
        if(npc._stunMeter>0&&npc._stunTimer<=0)npc._stunMeter=Math.max(0,npc._stunMeter-0.5);
        // Fire effect (Ken shoryuken)
        if(npc._onFire>0){
            npc._onFire--;
            if(!npc._fireParticles){
                npc._fireParticles=[];
                for(var _fpi=0;_fpi<14;_fpi++){
                    var _fpSize=_fpi<4?0.3:0.2;
                    var _fp=new THREE.Mesh(new THREE.SphereGeometry(_fpSize,5,4),new THREE.MeshBasicMaterial({color:0xFF4400,transparent:true,opacity:0.85}));
                    _fp.visible=false;npc.mesh.add(_fp);
                    npc._fireParticles.push(_fp);
                }
            }
            for(var _fpj=0;_fpj<npc._fireParticles.length;_fpj++){
                var _fpp=npc._fireParticles[_fpj];
                _fpp.visible=true;
                var _fpa=_fpj*Math.PI*2/npc._fireParticles.length+npc._onFire*0.25;
                var _fpR=0.4+Math.sin(_fpa*2)*0.2;
                var _fpY=0.3+_fpj*0.12+Math.random()*0.3;
                _fpp.position.set(Math.sin(_fpa)*_fpR,_fpY,Math.cos(_fpa)*_fpR);
                // Flicker between orange, yellow, red
                var _fpRnd=Math.random();
                _fpp.material.color.setHex(_fpRnd>0.6?0xFFCC00:(_fpRnd>0.3?0xFF6600:0xFF2200));
                _fpp.material.opacity=0.6+Math.random()*0.35;
                _fpp.scale.setScalar(0.6+Math.random()*1.0);
            }
            // Body tint orange while burning
            var _fbody=npc.mesh.userData.body;
            if(_fbody&&npc._onFire>0){_fbody.material.emissive=new THREE.Color(0xFF4400);_fbody.material.emissiveIntensity=0.3+Math.sin(npc._onFire*0.3)*0.15;}
            if(npc._onFire<=0){
                for(var _fpk=0;_fpk<npc._fireParticles.length;_fpk++)npc._fireParticles[_fpk].visible=false;
                if(_fbody){_fbody.material.emissiveIntensity=0;}
            }
            // Fire stun (Yoga Flame) — freeze then knockback
            if(npc._fireStun>0){
                npc._fireStun--;
                npc.vx=0;npc.vz=0;npc.vy=0;
                npc.throwTimer=0;
                npc._hitStun=5;
                // Shake while burning
                npc.mesh.rotation.z=Math.sin(Date.now()*0.05)*0.15;
                if(npc._fireStun<=0){
                    // Knockback away from fire source
                    var _fkDir=npc._fireStunDir||0;
                    npc.vx=Math.sin(_fkDir)*0.3;npc.vz=Math.cos(_fkDir)*0.3;npc.vy=0.1;
                    npc.throwTimer=30;npc._bounces=1;npc.squash=0.5;
                    npc.mesh.rotation.z=0;
                }
            }
        }
        // Electrocution effect (Blanka electric) — flash skeleton
        if(npc._electrocuted>0){
            npc._electrocuted--;
            npc.vx=0;npc.vz=0;npc.vy=0; // completely frozen
            npc.throwTimer=0; // prevent physics bounce
            // Flash between normal and dark skeleton every 3 frames
            var _elecBody=npc.mesh.userData.body;
            if(_elecBody){
                if(Math.floor(npc._electrocuted/3)%2===0){
                    _elecBody.material=new THREE.MeshBasicMaterial({color:0x111111,transparent:true,opacity:0.9});
                } else {
                    _elecBody.material=new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:0.9});
                }
            }
            // When shock phase ends — launch knockback (phase 2)
            if(npc._electrocuted<=0){
                if(npc._elecKnockDir){
                    npc._elecFlying=60;
                    npc._elecFlyDir={x:npc._elecKnockDir.x,z:npc._elecKnockDir.z};
                    npc._elecKnockDir=null;
                    npc.vy=0.5; // bounce up high
                    npc.throwTimer=80;
                } else {
                    if(_elecBody)_elecBody.material=toon(npc._origColor||0xFFDD44);
                    npc._stunTimer=40;npc._slamImmune=0;
                }
            }
        }
        // Electrocution flight phase — smooth slide (direct position move)
        if(npc._elecFlying>0){
            npc._elecFlying--;
            if(npc._elecFlyDir){
                npc.vx=npc._elecFlyDir.x*0.4;
                npc.vz=npc._elecFlyDir.z*0.4;
            }
            var _efBody=npc.mesh.userData.body;
            if(_efBody){
                if(Math.floor(npc._elecFlying/3)%2===0){
                    _efBody.material=new THREE.MeshBasicMaterial({color:0x111111,transparent:true,opacity:0.9});
                } else {
                    _efBody.material=new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:0.9});
                }
            }
            if(npc._elecFlying<=0){
                if(_efBody)_efBody.material=toon(npc._origColor||0xFFDD44);
                npc.vx*=0.1;npc.vz*=0.1;
                npc._stunTimer=40;npc._slamImmune=0;
                npc._elecFlyDir=null;
            }
        }
    }

    // ---- Tower of Babel rise animation ----
    if(_babylonRising&&_babylonTower){
        _babylonRiseY+=0.29; // rise speed (~3 seconds)
        // Push player away from tower during rise
        if(playerEgg){
            var brx=px-_babylonTower.x, brz=pz-_babylonTower.z;
            var brd=Math.sqrt(brx*brx+brz*brz);
            var brHalf=_babylonTower.baseW/2+1.5;
            if(brd<brHalf&&brd>0.01){
                var brPush=(brHalf-brd)*0.15;
                playerEgg.vx+=brx/brd*brPush;playerEgg.vz+=brz/brd*brPush;
            }
        }
        if(_babylonRiseY>=0){
            _babylonRiseY=0;
            _babylonRising=false;
            // Add wall colliders now that tower is fully risen
            if(!_babylonTower._collidersAdded){
                _babylonTower._collidersAdded=true;
                var bw=_babylonTower.baseW||16, bd=_babylonTower.baseD||16;
                var tx=_babylonTower.x, tz=_babylonTower.z, tTop=_babylonTower.topY;
                // Solid body collider (player can't walk through)
                // Split into left and right halves with door gap on +Z face
                var doorGap=2.0; // door width
                cityColliders.push({x:tx,z:tz,hw:bw/2,hd:bd/2,h:tTop,_babel:true});
                // Add tower meshes to building occlusion array
                var _babelMeshes=[];
                _babylonTower.group.traverse(function(child){if(child.isMesh)_babelMeshes.push(child);});
                cityBuildingMeshes.push({meshes:_babelMeshes,x:tx,z:tz,hw:bw/2,hd:bd/2,h:tTop,_babel:true});
            }
        }
        _babylonTower.group.position.y=_babylonRiseY;
    }
    // ---- Tower of Babel door collision (4 doors: N/S/E/W) ----
    if(_babylonTower&&!_pipeTraveling&&!_portalConfirmOpen&&!_babylonElevator&&!_spinDashing){
        var bt=_babylonTower;
        var bHalfW=bt.baseW/2+0.5;
        // Check all 4 door positions
        var _babelDoors=[
            {x:bt.x,z:bt.z+bHalfW},{x:bt.x,z:bt.z-bHalfW},
            {x:bt.x+bHalfW,z:bt.z},{x:bt.x-bHalfW,z:bt.z}
        ];
        var _nearestBabelDoor=9999;
        for(var bdi=0;bdi<4;bdi++){
            var bdx2=px-_babelDoors[bdi].x, bdz2=pz-_babelDoors[bdi].z;
            var bdd=Math.sqrt(bdx2*bdx2+bdz2*bdz2);
            if(bdd<_nearestBabelDoor)_nearestBabelDoor=bdd;
            if(bdd<3&&py<3&&!_babylonPromptDismissed&&!_babylonRising){
                _showBabylonPrompt(1);
            }
        }
        // Top of tower — return elevator
        var topDoorX=bt.x, topDoorZ=bt.z;
        var tdx=px-topDoorX, tdz=pz-topDoorZ;
        var tdist=Math.sqrt(tdx*tdx+tdz*tdz);
        if(tdist<3&&py>=bt.topY-2&&py<=bt.topY+4&&!_babylonPromptDismissed&&!_babylonRising){
            _showBabylonPrompt(-1);
        }
        if(_nearestBabelDoor>4.5&&tdist>4.5)_babylonPromptDismissed=false;
    }
    // ---- Babel elevator ride animation ----
    if(_babylonElevator&&_babylonTower&&playerEgg){
        var bt2=_babylonTower;
        var elevSpeed=0.35;
        _babylonElevY+=_babylonElevDir*elevSpeed;
        playerEgg.mesh.position.set(bt2.x,_babylonElevY,bt2.z);
        playerEgg.vx=0;playerEgg.vy=0;playerEgg.vz=0;
        playerEgg.onGround=true;
        // Arrived at top
        if(_babylonElevDir===1&&_babylonElevY>=bt2.topY+1){
            _babylonElevator=false;
            playerEgg.mesh.position.set(bt2.x,bt2.topY+1,bt2.z);
            playerEgg.onGround=true;
            _babylonPromptDismissed=true; // don't immediately prompt to go back down
            _showCloudAreaName();
        }
        // Arrived at bottom
        if(_babylonElevDir===-1&&_babylonElevY<=1){
            _babylonElevator=false;
            playerEgg.mesh.position.set(bt2.x,1,bt2.z+9);
            playerEgg.onGround=false;
            _babylonPromptDismissed=true; // don't immediately prompt to go back up
        }
    }

    // Moving clouds
    for(var mci=0;mci<cityCloudPlatforms.length;mci++){
        var mc=cityCloudPlatforms[mci];
        if(!mc.moving)continue;
        mc.movePhase+=mc.moveSpeed;
        var offset=Math.sin(mc.movePhase)*mc.moveRange;
        if(mc.moveAxis==='x'){
            mc.group.position.x=mc.baseX+offset;
            mc.x=mc.baseX+offset;
        } else {
            mc.group.position.z=mc.baseZ+offset;
            mc.z=mc.baseZ+offset;
        }
    }
    // Moon earth rotation + star twinkling
    if(window._moonEarth){window._moonEarth.rotation.y+=0.001;}
    if(window._moonStars){
        var st2=Date.now()*0.003;
        for(var si2=0;si2<window._moonStars.length;si2++){
            var s=window._moonStars[si2];
            s.mesh.material.opacity=0.3+0.7*Math.abs(Math.sin(st2*s.speed+s.phase));
        }
    }
    // ---- Moon rover movement ----
    if(window._moonRover){
        var rv=window._moonRover;
        rv.timer++;
        rv.turnTimer--;
        if(rv.turnTimer<=0){
            rv.targetAngle=Math.random()*Math.PI*2;
            rv.turnTimer=120+Math.floor(Math.random()*180);
        }
        // Smoothly turn toward target angle
        var aDiff=rv.targetAngle-rv.angle;
        while(aDiff>Math.PI)aDiff-=Math.PI*2;
        while(aDiff<-Math.PI)aDiff+=Math.PI*2;
        rv.angle+=aDiff*0.02;
        // Move forward
        var rvNx=rv.x+Math.cos(rv.angle)*rv.speed;
        var rvNz=rv.z+Math.sin(rv.angle)*rv.speed;
        // Keep on battlefield (x>20, within bounds)
        if(rvNx>20&&rvNx<350&&Math.abs(rvNz)<280){
            rv.x=rvNx;rv.z=rvNz;
        } else {
            rv.targetAngle=Math.atan2(-rv.z,-rv.x+150);
            rv.turnTimer=60;
        }
        rv.group.position.x=rv.x;rv.group.position.z=rv.z;
        rv.group.rotation.y=rv.angle;
    }
    // ---- Animate earth return portal ----
    if(window._earthReturnPortal){
        var erp=window._earthReturnPortal;
        var ert=Date.now()*0.001;
        erp.ring.rotation.z=ert*0.5;
        erp.inner.rotation.z=-ert*0.8;
        erp.earth.rotation.y=ert*0.3;
        erp.earth.position.y=4+Math.sin(ert)*0.3;
    }
    // ---- Gundam battle animation ----
    if(window._moonGundams){
        var gt=Date.now()*0.001;
        // Get player position for MS clustering (flat battlefield)
        var _plAng=0, _plElev=0;
        if(playerEgg){
            var _pdx=playerEgg.mesh.position.x, _pdz=playerEgg.mesh.position.z;
            _plAng=Math.atan2(_pdz,_pdx);
            _plElev=0;
        }
        for(var ggi=0;ggi<window._moonGundams.length;ggi++){
            var gm=window._moonGundams[ggi];
            if(gm._dead)continue;
            gm.phase+=0.03;
            // Waypoint AI: move toward random waypoint near player
            gm.wpTimer--;
            if(gm.wpTimer<=0){
                gm.wpTimer=120+Math.floor(Math.random()*180); // longer patrol legs
                gm.wpAngle+=((Math.random()-0.5)*Math.PI*0.6); // gradual turns, not random jumps
                gm.wpElev+=(Math.random()-0.5)*0.3;
                gm.wpElev=Math.max(-Math.PI*0.3,Math.min(Math.PI*0.3,gm.wpElev));
                gm.wpR=40+Math.random()*80;
                if(gm.ms==='sdf1')gm.wpR=200+Math.random()*100;
                if(gm.ms==='zenCruiser')gm.wpR=150+Math.random()*100;
            }
            // Random dodge maneuver (less frequent)
            if(gm.dodgeTimer>0){gm.dodgeTimer--;}
            else if(Math.random()<0.005){gm.dodgeTimer=8+Math.floor(Math.random()*10);gm.dodgeDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();}
            // Compute waypoint — faction-based targeting (spread out more)
            var _fTargets={efsf:{x:150,z:-200},zentradi:{x:-200,z:200},unSpacy:{x:200,z:100},zeon:{x:-150,z:-50}};
            var _ft=_fTargets[gm.faction]||{x:0,z:0};
            // Stable waypoint — patrol around faction target area
            var wpx=_ft.x+Math.cos(gm.wpAngle)*150;
            var wpy=gm.wpR;
            var wpz=_ft.z+Math.sin(gm.wpAngle)*150;
            // Zeon patrols around cities
            if(gm.faction==='zeon'){wpx=-150+Math.cos(gm.wpAngle)*120;wpz=-50+Math.sin(gm.wpAngle)*200;}
            // Steer toward waypoint
            var dx3=wpx-gm.group.position.x,dy3=wpy-gm.group.position.y,dz3=wpz-gm.group.position.z;
            var dd3=Math.sqrt(dx3*dx3+dy3*dy3+dz3*dz3)||1;
            var spd=gm.speed;
            gm.group.position.x+=dx3/dd3*spd;
            gm.group.position.y+=dy3/dd3*spd;
            gm.group.position.z+=dz3/dd3*spd;
            // Dodge offset
            if(gm.dodgeTimer>0&&gm.dodgeDir){
                gm.group.position.x+=gm.dodgeDir.x*spd*0.5;
                gm.group.position.y+=gm.dodgeDir.y*spd*0.5;
                gm.group.position.z+=gm.dodgeDir.z*spd*0.5;
            }
            // Face direction of travel
            var gx=gm.group.position.x,gy=gm.group.position.y,gz=gm.group.position.z;
            // Shield deflection — MS can't enter city shields
            var _gsShield=_checkMoonShield(gx,gy,gz);
            if(_gsShield){
                var _gsdx=gx-_gsShield.x,_gsdy=gy-_gsShield.y,_gsdz=gz-_gsShield.z;
                var _gsd=Math.sqrt(_gsdx*_gsdx+_gsdy*_gsdy+_gsdz*_gsdz)||1;
                // Push out to shield surface
                gm.group.position.x=_gsShield.x+_gsdx/_gsd*(_gsShield.r+1);
                gm.group.position.y=_gsShield.y+_gsdy/_gsd*(_gsShield.r+1);
                gm.group.position.z=_gsShield.z+_gsdz/_gsd*(_gsShield.r+1);
                gx=gm.group.position.x;gy=gm.group.position.y;gz=gm.group.position.z;
                gm.wpTimer=0; // pick new waypoint
                if(Math.random()<0.08)_spawnATField(gx,gy,gz,_gsdx/_gsd,_gsdy/_gsd,_gsdz/_gsd);
            }
            gm.group.lookAt(wpx,wpy,wpz);
            if(dd3<3)gm.wpTimer=0; // arrived, pick new waypoint
            // Saber duel: fast swing
            if(gm.type==='saber'&&gm.saberMesh){
                gm.saberMesh.rotation.x=-0.3+Math.sin(gt*8+ggi*2)*0.9;
                gm.saberMesh.rotation.z=Math.sin(gt*7+ggi*3)*0.5;
                // Saber clash sparks
                if(gm.duelPartner&&Math.random()<0.04&&window._moonBeams.length<300){
                    var sp=new THREE.Mesh(new THREE.SphereGeometry(0.3,4,3),new THREE.MeshBasicMaterial({color:0xFFFF44,transparent:true,opacity:1.0}));
                    sp.position.set(gx+(Math.random()-0.5)*2,gy+(Math.random()-0.5)*2,gz+(Math.random()-0.5)*2);
                    scene.add(sp);
                    window._moonBeams.push({mesh:sp,life:8,vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5,vz:(Math.random()-0.5)*0.5});
                }
            }
            // Funnels: orbit + shoot
            if(gm.type==='funnel'&&gm.funnels){
                for(var ffi=0;ffi<gm.funnels.length;ffi++){
                    var ff=gm.funnels[ffi];
                    ff.angle+=0.06;
                    var fd=ff.dist+Math.sin(gt*3+ffi)*0.5;
                    ff.mesh.position.set(Math.cos(ff.angle)*fd,Math.sin(ff.angle*0.7+ffi)*fd*0.5,Math.sin(ff.angle)*fd);
                    if(Math.random()<0.03&&window._moonBeams.length<300){
                        var bDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                        var fWorld=new THREE.Vector3();ff.mesh.getWorldPosition(fWorld);
                        var fb=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,8,4),new THREE.MeshBasicMaterial({color:0xFF44FF,transparent:true,opacity:0.9}));
                        fb.position.copy(fWorld);fb.lookAt(fWorld.x+bDir.x,fWorld.y+bDir.y,fWorld.z+bDir.z);fb.rotateX(Math.PI/2);
                        scene.add(fb);
                        window._moonBeams.push({mesh:fb,life:25,vx:bDir.x*3,vy:bDir.y*3,vz:bDir.z*3});
                    }
                }
            }
            // Rifle: frequent beam shots
            gm.actionTimer--;
            if(gm.type==='rifle'&&gm.actionTimer<=0){
                gm.actionTimer=25+Math.floor(Math.random()*45);
                if(window._moonBeams.length<300){
                    var beamColor=gm.faction==='efsf'?0xFF8844:gm.faction==='unSpacy'?0x44CCFF:gm.faction==='zentradi'?0x88FF44:0x44FF44;
                    var bm=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,4,4),new THREE.MeshBasicMaterial({color:beamColor,transparent:true,opacity:0.9}));
                    var fwd3=new THREE.Vector3(0,0,1).applyQuaternion(gm.group.quaternion);
                    bm.position.set(gx+fwd3.x*2,gy+fwd3.y*2,gz+fwd3.z*2);
                    bm.lookAt(gx+fwd3.x*20,gy+fwd3.y*20,gz+fwd3.z*20);bm.rotateX(Math.PI/2);
                    scene.add(bm);
                    window._moonBeams.push({mesh:bm,life:35,vx:fwd3.x*4,vy:fwd3.y*4,vz:fwd3.z*4});
                    playBeamSound();
                }
            }
            // Missile: frequent launch
            if(gm.type==='missile'&&gm.actionTimer<=0){
                gm.actionTimer=40+Math.floor(Math.random()*60);
                if(window._moonMissiles.length<150){
                    var mg=new THREE.Group();
                    var mbody=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.06,1.0,6),new THREE.MeshStandardMaterial({color:0x888888}));
                    mbody.rotation.x=Math.PI/2;mg.add(mbody);
                    var mnose=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.3,6),new THREE.MeshStandardMaterial({color:0xCC4444}));
                    mnose.rotation.x=-Math.PI/2;mnose.position.z=0.65;mg.add(mnose);
                    var mflame=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.5,4),new THREE.MeshBasicMaterial({color:0xFF6600,transparent:true,opacity:0.7}));
                    mflame.rotation.x=Math.PI/2;mflame.position.z=-0.7;mg.add(mflame);
                    var mfwd3=new THREE.Vector3(0,0,1).applyQuaternion(gm.group.quaternion);
                    mfwd3.x+=(Math.random()-0.5)*0.4;mfwd3.y+=(Math.random()-0.5)*0.4;mfwd3.z+=(Math.random()-0.5)*0.4;mfwd3.normalize();
                    mg.position.set(gx,gy,gz);
                    mg.lookAt(gx+mfwd3.x,gy+mfwd3.y,gz+mfwd3.z);
                    scene.add(mg);
                    window._moonMissiles.push({group:mg,life:80,vx:mfwd3.x*2.5,vy:mfwd3.y*2.5,vz:mfwd3.z*2.5,trail:[]});
                    playMissileSound();
                }
            }
            // ---- Capital ship main cannon beam (SDF1 / Argama) ----
            if(gm.ms==='sdf1'){
                if(!gm._beamCD)gm._beamCD=300+Math.floor(Math.random()*200);
                gm._beamCD--;
                if(gm._beamCD<=0&&window._moonBeams.length<300){
                    gm._beamCD=300+Math.floor(Math.random()*200);
                    var _bcColor=0xFFDD44;
                    var _bcMat=new THREE.MeshBasicMaterial({color:_bcColor,transparent:true,opacity:0.9});
                    var _bcGeo=new THREE.CylinderGeometry(0.6,0.6,40,8);
                    var _bcMesh=new THREE.Mesh(_bcGeo,_bcMat);
                    var _bcFwd=new THREE.Vector3(0,0,1).applyQuaternion(gm.group.quaternion);
                    _bcMesh.position.set(gx+_bcFwd.x*22,gy+_bcFwd.y*22,gz+_bcFwd.z*22);
                    _bcMesh.lookAt(gx+_bcFwd.x*60,gy+_bcFwd.y*60,gz+_bcFwd.z*60);
                    _bcMesh.rotateX(Math.PI/2);
                    scene.add(_bcMesh);
                    window._moonBeams.push({mesh:_bcMesh,life:30,vx:_bcFwd.x*2,vy:_bcFwd.y*2,vz:_bcFwd.z*2});
                    playBeamSound();
                }
            }
            // ---- Red Zaku mega particle cannon ----
            if(gm.ms==='zaku'&&(gm._color===0xCC2222||gm._color===0x882222)){
                if(!gm._megaCD)gm._megaCD=400+Math.floor(Math.random()*200);
                gm._megaCD--;
                if(gm._megaCD<=0&&window._moonBeams.length<300){
                    gm._megaCD=400+Math.floor(Math.random()*200);
                    var _mpMat=new THREE.MeshBasicMaterial({color:0xFFDD44,transparent:true,opacity:0.85});
                    var _mpGeo=new THREE.CylinderGeometry(0.15,0.15,20,6);
                    var _mpMesh=new THREE.Mesh(_mpGeo,_mpMat);
                    var _mpFwd=new THREE.Vector3(0,0,1).applyQuaternion(gm.group.quaternion);
                    _mpMesh.position.set(gx+_mpFwd.x*12,gy+_mpFwd.y*12,gz+_mpFwd.z*12);
                    _mpMesh.lookAt(gx+_mpFwd.x*40,gy+_mpFwd.y*40,gz+_mpFwd.z*40);
                    _mpMesh.rotateX(Math.PI/2);
                    scene.add(_mpMesh);
                    window._moonBeams.push({mesh:_mpMesh,life:30,vx:_mpFwd.x*3.5,vy:_mpFwd.y*3.5,vz:_mpFwd.z*3.5});
                    playBeamSound();
                }
            }
            // ---- Valkyrie transformation toggle ----
            if(gm.ms==='valkyrie'){
                if(!gm._valkCD)gm._valkCD=200+Math.floor(Math.random()*200);
                gm._valkCD--;
                if(gm._valkCD<=0){
                    gm._valkCD=200+Math.floor(Math.random()*200);
                    gm._valkMode=gm._valkMode?0:1;
                    if(gm._valkMode){
                        gm.group.scale.set(1.0,1.4,1.0);
                        gm.group.rotation.x=-Math.PI/4;
                    } else {
                        gm.group.scale.set(1.4,1.4,1.4);
                        gm.group.rotation.x=0;
                    }
                }
            }
            // ---- Valkyrie Missile Barrage ----
            if(gm.ms==='valkyrie'){
                if(!gm._barrageCD)gm._barrageCD=500+Math.floor(Math.random()*300);
                gm._barrageCD--;
                if(gm._barrageCD<=0){
                    gm._barrageCD=500+Math.floor(Math.random()*300);
                    if(!window._moonMissiles)window._moonMissiles=[];
                    var _bmCount=8+Math.floor(Math.random()*5);
                    var _bmFwd=new THREE.Vector3(0,0,1).applyQuaternion(gm.group.quaternion);
                    for(var _bmi=0;_bmi<_bmCount;_bmi++){
                        var _bmMesh=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.3,4),new THREE.MeshBasicMaterial({color:0xDDDDDD}));
                        _bmMesh.position.set(gx,gy,gz);scene.add(_bmMesh);
                        var _bmVx=_bmFwd.x+(Math.random()-0.5)*0.8;
                        var _bmVy=_bmFwd.y+(Math.random()-0.5)*0.8;
                        var _bmVz=_bmFwd.z+(Math.random()-0.5)*0.8;
                        var _bmSpd=1.5+Math.random();
                        var _bmLen=Math.sqrt(_bmVx*_bmVx+_bmVy*_bmVy+_bmVz*_bmVz)||1;
                        window._moonMissiles.push({group:_bmMesh,life:60,vx:_bmVx/_bmLen*_bmSpd,vy:_bmVy/_bmLen*_bmSpd,vz:_bmVz/_bmLen*_bmSpd,trail:[],_isBarrage:true});
                    }
                    playMissileSound();
                }
            }
            // ---- Funnel Weapons targeted beams ----
            if(gm.funnels&&gm.funnels.length>0){
                if(!gm._funnelCD)gm._funnelCD=200+Math.floor(Math.random()*200);
                gm._funnelCD--;
                if(gm._funnelCD<=0){
                    gm._funnelCD=200+Math.floor(Math.random()*200);
                    var _fnTarget=null,_fnDist=9999;
                    for(var _fni=0;_fni<window._moonGundams.length;_fni++){
                        var _fnE=window._moonGundams[_fni];
                        if(_fnE._dead||_fnE.faction===gm.faction)continue;
                        var _fdx=_fnE.group.position.x-gx,_fdy=_fnE.group.position.y-gy,_fdz=_fnE.group.position.z-gz;
                        var _fdd=Math.sqrt(_fdx*_fdx+_fdy*_fdy+_fdz*_fdz);
                        if(_fdd<_fnDist){_fnDist=_fdd;_fnTarget=_fnE;}
                    }
                    if(_fnTarget&&_fnDist<200){
                        for(var _ffi2=0;_ffi2<gm.funnels.length;_ffi2++){
                            var _ffW=new THREE.Vector3();gm.funnels[_ffi2].mesh.getWorldPosition(_ffW);
                            var _ftPos=_fnTarget.group.position;
                            var _fbDx=_ftPos.x-_ffW.x,_fbDy=_ftPos.y-_ffW.y,_fbDz=_ftPos.z-_ffW.z;
                            var _fbLen=Math.sqrt(_fbDx*_fbDx+_fbDy*_fbDy+_fbDz*_fbDz)||1;
                            var _fbMesh=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,_fbLen,4),new THREE.MeshBasicMaterial({color:0xFF44FF,transparent:true,opacity:0.9}));
                            _fbMesh.position.set((_ffW.x+_ftPos.x)/2,(_ffW.y+_ftPos.y)/2,(_ffW.z+_ftPos.z)/2);
                            _fbMesh.lookAt(_ftPos.x,_ftPos.y,_ftPos.z);_fbMesh.rotateX(Math.PI/2);
                            scene.add(_fbMesh);
                            window._moonBeams.push({mesh:_fbMesh,life:15,vx:0,vy:0,vz:0});
                            if(_ffi2%3===0)playBeamSound();
                        }
                    }
                }
            }
            // ---- Beam Saber Duels ----
            if(gm.type==='saber'&&gm.duelPartner&&!gm.duelPartner._dead){
                var _dpPos=gm.duelPartner.group.position;
                var _ddx=_dpPos.x-gx,_ddy=_dpPos.y-gy,_ddz=_dpPos.z-gz;
                var _ddd=Math.sqrt(_ddx*_ddx+_ddy*_ddy+_ddz*_ddz)||1;
                if(_ddd<80){
                    gm.group.position.x+=_ddx/_ddd*spd*0.5;
                    gm.group.position.y+=_ddy/_ddd*spd*0.5;
                    gm.group.position.z+=_ddz/_ddd*spd*0.5;
                }
                if(_ddd<8){
                    if(!gm._duelAngle)gm._duelAngle=Math.random()*Math.PI*2;
                    gm._duelAngle+=0.08;
                    var _orbR=4+Math.sin(gm._duelAngle*0.3);
                    gm.group.position.x=_dpPos.x+Math.cos(gm._duelAngle)*_orbR;
                    gm.group.position.z=_dpPos.z+Math.sin(gm._duelAngle)*_orbR;
                    gm.group.lookAt(_dpPos.x,_dpPos.y,_dpPos.z);
                    if(!gm._swingCD)gm._swingCD=15+Math.floor(Math.random()*10);
                    gm._swingCD--;
                    if(gm._swingCD<=0){
                        gm._swingCD=15+Math.floor(Math.random()*10);
                        gm._swingFlash=5;
                        var _spMesh=new THREE.Mesh(new THREE.SphereGeometry(0.4,4,3),new THREE.MeshBasicMaterial({color:0xFFFF44,transparent:true,opacity:1.0}));
                        _spMesh.position.set((gx+_dpPos.x)/2,(gy+_dpPos.y)/2,(gz+_dpPos.z)/2);
                        scene.add(_spMesh);
                        window._moonBeams.push({mesh:_spMesh,life:8,vx:0,vy:0.2,vz:0});
                    }
                    if(gm._swingFlash>0){
                        gm._swingFlash--;
                        if(gm.saberMesh)gm.saberMesh.material.emissive.setHex(0xFFFFFF);
                    } else {
                        if(gm.saberMesh)gm.saberMesh.material.emissive.setHex(0x000000);
                    }
                    if(!gm._clashCD)gm._clashCD=30+Math.floor(Math.random()*20);
                    gm._clashCD--;
                    if(gm._clashCD<=0){gm._clashCD=30+Math.floor(Math.random()*20);playHitSound(gm.group.position.x,gm.group.position.z);}
                }
            }
            // Random explosions near MS (battle damage effects)
            if(Math.random()<0.012&&window._moonBeams.length<300){
                var exOff=2+Math.random()*4;
                var exDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                var exSize=0.5+Math.random()*1.0;
                var exColors=[0xFF4400,0xFF8800,0xFFCC00,0xFF6600];
                var exColor=exColors[Math.floor(Math.random()*exColors.length)];
                var exMesh=new THREE.Mesh(new THREE.SphereGeometry(exSize,6,4),new THREE.MeshBasicMaterial({color:exColor,transparent:true,opacity:0.9}));
                exMesh.position.set(gx+exDir.x*exOff,gy+exDir.y*exOff,gz+exDir.z*exOff);
                scene.add(exMesh);
                window._moonBeams.push({mesh:exMesh,life:15,vx:exDir.x*0.3,vy:exDir.y*0.3,vz:exDir.z*0.3,_isExplosion:true});
                playExplosionSound();
                // Debris particles
                for(var dbi=0;dbi<3;dbi++){
                    var dbDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                    var dbMesh=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2),new THREE.MeshBasicMaterial({color:0x666666,transparent:true,opacity:0.8}));
                    dbMesh.position.copy(exMesh.position);
                    scene.add(dbMesh);
                    window._moonBeams.push({mesh:dbMesh,life:20,vx:dbDir.x*1.5,vy:dbDir.y*1.5,vz:dbDir.z*1.5});
                }
                // Deal damage to this MS
                gm.hp=(gm.hp||gm.hpMax)-1;
            }
        }
        // ---- MS destruction: remove dead units with big explosion ----
        for(var _di=window._moonGundams.length-1;_di>=0;_di--){
            var _dm=window._moonGundams[_di];
            if(_dm._dead){
                // Respawn timer countdown
                _dm._respawnTimer--;
                if(_dm._respawnTimer<=0){
                    // Respawn: rebuild MS and fly in above battlefield
                    var _newGd=_buildMobileSuit(_dm._msType,_dm._weaponType,_dm._color);
                    // Respawn in faction zone
                    var _isLargeShip=(_dm._msType==='sdf1'||_dm._msType==='zenCruiser');
                    var _rsFz={efsf:{cx:200,cz:-200},unSpacy:{cx:200,cz:200},zentradi:{cx:-100,cz:250},zeon:{cx:-200,cz:-50}};
                    var _rsZ=_rsFz[_dm.faction]||{cx:0,cz:0};
                    var _sx=_rsZ.cx+(Math.random()-0.5)*120;
                    var _sy=_isLargeShip?200+Math.random()*100:30+Math.random()*60;
                    var _sz=_rsZ.cz+(Math.random()-0.5)*120;
                    _newGd.group.position.set(_sx,_sy,_sz);
                    _newGd.group.scale.set(2,2,2);
                    scene.add(_newGd.group);
                    _dm.group=_newGd.group;_dm.funnels=_newGd.funnels||null;_dm.saberMesh=_newGd.saberMesh||null;_dm.weapon=_newGd.weapon||null;
                    _dm.hp=_dm.hpMax;_dm._dead=false;
                    _dm.wpAngle=Math.random()*Math.PI*2;_dm.wpElev=0;
                    _dm.wpR=_isLargeShip?200+Math.random()*100:30+Math.random()*60;
                    _dm.wpTimer=5;
                }
                continue;
            }
            if(_dm.hp<=0&&!_dm._dead){
                // Destroy: big explosion + scatter debris
                var _dpos=_dm.group.position;
                var _dScale=_dm.ms==='sdf1'?8:_dm.ms==='zenCruiser'?6:3;
                for(var _ei=0;_ei<4;_ei++){
                    var _eDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                    var _eR=_dScale*(1+_ei*0.5);
                    var _eC=[0xFF4400,0xFF8800,0xFFCC00,0xFFFFFF][_ei%4];
                    var _eM=new THREE.Mesh(new THREE.SphereGeometry(_eR,6,4),new THREE.MeshBasicMaterial({color:_eC,transparent:true,opacity:0.95}));
                    _eM.position.set(_dpos.x+_eDir.x*_ei*0.5,_dpos.y+_eDir.y*_ei*0.5,_dpos.z+_eDir.z*_ei*0.5);
                    scene.add(_eM);
                    window._moonBeams.push({mesh:_eM,life:12+_ei*3,vx:_eDir.x*0.4,vy:_eDir.y*0.4,vz:_eDir.z*0.4,_isExplosion:true});
                }
                // Scatter debris pieces
                for(var _dbi=0;_dbi<4;_dbi++){
                    var _dbD=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                    var _dbM=new THREE.Mesh(new THREE.BoxGeometry(0.15*_dScale,0.1*_dScale,0.08*_dScale),new THREE.MeshBasicMaterial({color:0x555566,transparent:true,opacity:0.8}));
                    _dbM.position.copy(_dpos);scene.add(_dbM);
                    window._moonBeams.push({mesh:_dbM,life:30,vx:_dbD.x*2.5,vy:_dbD.y*2.5,vz:_dbD.z*2.5});
                }
                playExplosionSound();
                // Hide the MS group
                scene.remove(_dm.group);
                _dm._dead=true;
                _dm._respawnTimer=300+Math.floor(Math.random()*300); // 5-10 seconds
            }
        }
        // Determine if player is inside a city shield — hide all battle visuals if so
        var _playerInShield=playerEgg?_checkMoonShield(playerEgg.mesh.position.x,playerEgg.mesh.position.y,playerEgg.mesh.position.z):null;
        // Hide/show Gundam groups based on player shield status
        for(var _gvi=0;_gvi<window._moonGundams.length;_gvi++){
            var _gvm=window._moonGundams[_gvi];
            if(_gvm.group)_gvm.group.visible=!_playerInShield;
        }
        // Update beams + explosions
        for(var bbi=window._moonBeams.length-1;bbi>=0;bbi--){
            var bb=window._moonBeams[bbi];
            bb.mesh.position.x+=bb.vx;bb.mesh.position.y+=bb.vy;bb.mesh.position.z+=bb.vz;
            bb.life--;
            bb.mesh.visible=!_playerInShield;
            if(bb._isExplosion){
                if(bb._atField){
                    // AT Field ripple: delayed appearance, expand outward, then fade
                    if(bb._atDelay>0){
                        bb._atDelay--;
                        bb.mesh.visible=false;
                        bb.life++; // don't count down while waiting
                    } else {
                        bb.mesh.visible=!_playerInShield;
                        bb._atAge++;
                        if(bb._atMaxR){
                            // Ring: expand from small to max radius
                            var expandT=Math.min(bb._atAge/20,1);
                            var curR=1+expandT*(bb._atMaxR-1);
                            bb.mesh.scale.set(curR,curR,1);
                            // Fade in then out
                            if(bb._atAge<8) bb.mesh.material.opacity=bb._atAge/8*0.8;
                            else bb.mesh.material.opacity=Math.max(0,(bb.life/40)*0.8);
                        } else {
                            // Central flash: just fade
                            bb.mesh.material.opacity=Math.max(0,bb.life/20*0.9);
                            bb.mesh.scale.multiplyScalar(1.03);
                        }
                    }
                } else {
                    bb.mesh.material.opacity=bb.life/15*0.9;
                    bb.mesh.scale.multiplyScalar(1.1);
                }
            } else {
                bb.mesh.material.opacity=Math.max(0,bb.life/35);
                // Shield collision — AT Field effect
                if(!bb._shieldHit){
                    var _bs=_checkMoonShield(bb.mesh.position.x,bb.mesh.position.y,bb.mesh.position.z);
                    if(_bs){
                        var _bsx=bb.mesh.position.x-_bs.x,_bsy=bb.mesh.position.y-_bs.y,_bsz=bb.mesh.position.z-_bs.z;
                        var _bsd=Math.sqrt(_bsx*_bsx+_bsy*_bsy+_bsz*_bsz)||1;
                        _spawnATField(bb.mesh.position.x,bb.mesh.position.y,bb.mesh.position.z,_bsx/_bsd,_bsy/_bsd,_bsz/_bsd);
                        bb._shieldHit=true;bb.life=Math.min(bb.life,3);
                        bb.vx*=-0.3;bb.vy*=-0.3;bb.vz*=-0.3;
                    }
                }
                // Beam hits eggs (same as being thrown) — skip eggs inside city shields
                if(!bb._hitEgg)for(var _bei=0;_bei<allEggs.length;_bei++){
                    var _be=allEggs[_bei];if(!_be.alive||_be.heldBy||_be.throwTimer>0)continue;
                    if(_checkMoonShield(_be.mesh.position.x,_be.mesh.position.y,_be.mesh.position.z))continue;
                    var _bdx=_be.mesh.position.x-bb.mesh.position.x;
                    var _bdy=_be.mesh.position.y-bb.mesh.position.y;
                    var _bdz=_be.mesh.position.z-bb.mesh.position.z;
                    var _bd=Math.sqrt(_bdx*_bdx+_bdy*_bdy+_bdz*_bdz);
                    if(_bd<2.0){
                        var _bImp=0.15;
                        _be.vx+=bb.vx*_bImp;_be.vy+=bb.vy*_bImp+0.1;_be.vz+=bb.vz*_bImp;
                        _be.throwTimer=15;_be._bounces=1;_be.squash=0.5;
                        if(_be.isPlayer)playHitSound(_be.mesh.position.x,_be.mesh.position.z);
                        _dropNpcStolenCoins(_be);
                        bb._hitEgg=true;bb.life=Math.min(bb.life,3);break;
                    }
                }
            }
            if(bb.life<=0){scene.remove(bb.mesh);window._moonBeams.splice(bbi,1);}
        }
        // Update missiles with smoke trails
        for(var mmi2=window._moonMissiles.length-1;mmi2>=0;mmi2--){
            var mm=window._moonMissiles[mmi2];
            mm.group.position.x+=mm.vx;mm.group.position.y+=mm.vy;mm.group.position.z+=mm.vz;
            mm.life--;
            mm.group.visible=!_playerInShield;
            // Smoke trail puff
            if(mm.life%3===0&&mm.trail.length<(mm._isBarrage?15:12)){
                var _puffColor=mm._isBarrage?0xFF8833:0xAAAAAA;var _puffR=mm._isBarrage?0.05:0.15+Math.random()*0.15;var puff=new THREE.Mesh(new THREE.SphereGeometry(_puffR,4,3),new THREE.MeshBasicMaterial({color:_puffColor,transparent:true,opacity:0.5}));
                puff.position.copy(mm.group.position);
                scene.add(puff);
                mm.trail.push({mesh:puff,life:20});
            }
            // Fade trail
            for(var ti=mm.trail.length-1;ti>=0;ti--){
                mm.trail[ti].life--;
                mm.trail[ti].mesh.material.opacity=mm.trail[ti].life/20*0.5;
                mm.trail[ti].mesh.scale.multiplyScalar(1.04);
                mm.trail[ti].mesh.visible=!_playerInShield;
                if(mm.trail[ti].life<=0){scene.remove(mm.trail[ti].mesh);mm.trail.splice(ti,1);}
            }
            // Missile hits shields — AT Field
            if(!mm._shieldHit){
                var _ms=_checkMoonShield(mm.group.position.x,mm.group.position.y,mm.group.position.z);
                if(_ms){
                    var _msx=mm.group.position.x-_ms.x,_msy=mm.group.position.y-_ms.y,_msz=mm.group.position.z-_ms.z;
                    var _msd=Math.sqrt(_msx*_msx+_msy*_msy+_msz*_msz)||1;
                    _spawnATField(mm.group.position.x,mm.group.position.y,mm.group.position.z,_msx/_msd,_msy/_msd,_msz/_msd);
                    mm._shieldHit=true;mm.life=0;
                }
            }
            // Missile hits eggs — skip eggs inside city shields
            if(!mm._hitEgg)for(var _mei=0;_mei<allEggs.length;_mei++){
                var _me=allEggs[_mei];if(!_me.alive||_me.heldBy||_me.throwTimer>0)continue;
                if(_checkMoonShield(_me.mesh.position.x,_me.mesh.position.y,_me.mesh.position.z))continue;
                var _mdx=_me.mesh.position.x-mm.group.position.x;
                var _mdy=_me.mesh.position.y-mm.group.position.y;
                var _mdz=_me.mesh.position.z-mm.group.position.z;
                var _md=Math.sqrt(_mdx*_mdx+_mdy*_mdy+_mdz*_mdz);
                if(_md<3.0){
                    var _mImp=0.2;if(_md>0.1){_me.vx+=_mdx/_md*_mImp;_me.vy+=_mdy/_md*_mImp+0.15;_me.vz+=_mdz/_md*_mImp;}
                    _me.throwTimer=20;_me._bounces=1;_me.squash=0.4;
                    if(_me.isPlayer)playHitSound(_me.mesh.position.x,_me.mesh.position.z);
                    _dropNpcStolenCoins(_me);
                    mm._hitEgg=true;mm.life=0;break;
                }
            }
            // Missile expired — big explosion
            if(mm.life<=0){
                // Multi-layer explosion
                var exColors2=[0xFF4400,0xFF8800,0xFFCC00];
                for(var exi=0;exi<3;exi++){
                    var exR=0.5+exi*0.4;
                    var flash=new THREE.Mesh(new THREE.SphereGeometry(exR,6,4),new THREE.MeshBasicMaterial({color:exColors2[exi%3],transparent:true,opacity:0.9-exi*0.15}));
                    flash.position.copy(mm.group.position);
                    flash.position.x+=(Math.random()-0.5)*0.5;flash.position.y+=(Math.random()-0.5)*0.5;flash.position.z+=(Math.random()-0.5)*0.5;
                    scene.add(flash);
                    window._moonBeams.push({mesh:flash,life:10+exi*4,vx:0,vy:0,vz:0,_isExplosion:true});
                }
                playExplosionSound();
                // Shrapnel
                for(var shi=0;shi<4;shi++){
                    var shDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                    var shMesh=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.15,0.15),new THREE.MeshBasicMaterial({color:0x888888,transparent:true,opacity:0.7}));
                    shMesh.position.copy(mm.group.position);scene.add(shMesh);
                    window._moonBeams.push({mesh:shMesh,life:18,vx:shDir.x*2,vy:shDir.y*2,vz:shDir.z*2});
                }
                for(var tri=mm.trail.length-1;tri>=0;tri--){scene.remove(mm.trail[tri].mesh);}
                scene.remove(mm.group);window._moonMissiles.splice(mmi2,1);
            }
        }
    }
}

// ---- Struggle bar (HTML overlay) ----
var struggleBarDiv=null;
function ensureStruggleBar(){
    if(struggleBarDiv&&struggleBarDiv.parentNode)return;
    if(struggleBarDiv&&!struggleBarDiv.parentNode)struggleBarDiv=null; // was detached
    struggleBarDiv=document.createElement('div');
    struggleBarDiv.id='struggle-bar-container';
    struggleBarDiv.style.cssText='position:absolute;top:18%;left:50%;transform:translateX(-50%);z-index:15;pointer-events:none;display:none;text-align:center;';
    var _stText=L('struggle');struggleBarDiv.innerHTML='<div id="struggle-text" style="color:#fff;font-size:13px;font-weight:700;text-shadow:1px 1px 0 #000;margin-bottom:4px">'+_stText+'</div><div style="width:180px;height:14px;background:rgba(0,0,0,0.5);border-radius:7px;border:2px solid rgba(255,255,255,0.3);overflow:hidden"><div id="struggle-fill" style="height:100%;background:linear-gradient(90deg,#FF4444,#FFAA00);border-radius:5px;width:100%;transition:width 0.05s"></div></div>';
    document.getElementById('game-container').appendChild(struggleBarDiv);
}

// ---- PSOBB-style Chat Bubble System ----
var _chatBubbles=[]; // {egg, div, timer}
var _chatInput=null, _chatOpen=false;
function _ensureChatInput(){
    if(_chatInput)return;
    _chatInput=document.createElement('div');
    _chatInput.id='chat-input-bar';
    _chatInput.style.cssText='position:absolute;bottom:60px;left:50%;transform:translateX(-50%);z-index:20;display:none;';
    _chatInput.innerHTML='<input id="chat-field" type="text" maxlength="40" style="width:260px;padding:8px 12px;border:2px solid rgba(255,255,255,0.4);border-radius:20px;background:rgba(0,0,0,0.7);color:#fff;font-size:14px;outline:none;backdrop-filter:blur(6px);" placeholder="'+L('chatPlaceholder')+'">';
    document.getElementById('game-container').appendChild(_chatInput);
    var field=document.getElementById('chat-field');
    field.addEventListener('keydown',function(e){
        e.stopPropagation();
        if(e.code==='Enter'){
            var msg=field.value.trim();
            if(msg){
                // Check for chat commands (don't show bubble)
                if(_processChatCommand(msg)){
                    field.value='';_closeChatInput();
                    return;
                }
                if(playerEgg)_showChatBubble(playerEgg,msg);
            }
            field.value='';_closeChatInput();
        }
        if(e.code==='Escape'){field.value='';_closeChatInput();}
    });
}
function _openChatInput(){
    if(_chatOpen||gameState!=='city')return;
    _ensureChatInput();
    _chatOpen=true;
    _chatInput.style.display='block';
    var field=document.getElementById('chat-field');
    field.placeholder=L('chatPlaceholder');
    field.focus();
}
function _closeChatInput(){
    _chatOpen=false;
    if(_chatInput)_chatInput.style.display='none';
    var field=document.getElementById('chat-field');
    if(field)field.blur();
}
function _processChatCommand(msg){
    var cmd=msg.toLowerCase().replace(/\s+/g,' ').trim();
    // /fly me to the moon — teleport to moon
    if(cmd==='/fly me to the moon'||cmd==='fly me to the moon'){
        if(playerEgg&&currentCityStyle!==5&&gameState==='city'){
            startPipeTravel(playerEgg.mesh.position.x,playerEgg.mesh.position.z,5,playerEgg.mesh.position.y);
        }
        return true;
    }
    // Commands start with / are hidden
    if(msg.charAt(0)==='/') return true;
    return false;
}
// Move name translations — now reads from MOVE_PARAMS.text, fallback to legacy table
var _moveNames={};
// Build from MOVE_PARAMS
(function(){
    for(var ct in MOVE_PARAMS){
        for(var mk in MOVE_PARAMS[ct]){
            var m=MOVE_PARAMS[ct][mk];
            if(m&&m.shout&&m.text)_moveNames[m.shout]=m.text;
        }
    }
})();
function _shoutMove(egg,key){
    var t=_moveNames[key];
    var txt=t?t[_langCode]||t.en||key:key;
    _showChatBubble(egg,txt,60);
}
function _showChatBubble(egg,msg,duration){
    if(!egg||!egg.mesh)return;
    var _bubbleTime=duration||300;
    // Remove old bubble for this egg
    for(var i=_chatBubbles.length-1;i>=0;i--){
        if(_chatBubbles[i].egg===egg){
            if(_chatBubbles[i].sprite)egg.mesh.remove(_chatBubbles[i].sprite);
            _chatBubbles.splice(i,1);
        }
    }
    // Create 3D sprite bubble above egg head (PSOBB comic style)
    var canvas=document.createElement('canvas');
    canvas.width=512;canvas.height=128;
    var ctx2=canvas.getContext('2d');
    // Comic bubble background
    ctx2.fillStyle='rgba(255,255,255,0.92)';
    _drawBubblePath(ctx2,10,10,492,90,18);
    ctx2.fill();
    ctx2.strokeStyle='rgba(0,0,0,0.5)';ctx2.lineWidth=3;
    _drawBubblePath(ctx2,10,10,492,90,18);
    ctx2.stroke();
    // Tail triangle
    ctx2.fillStyle='rgba(255,255,255,0.92)';
    ctx2.beginPath();ctx2.moveTo(230,100);ctx2.lineTo(256,125);ctx2.lineTo(280,100);ctx2.fill();
    ctx2.strokeStyle='rgba(0,0,0,0.5)';ctx2.lineWidth=3;
    ctx2.beginPath();ctx2.moveTo(230,100);ctx2.lineTo(256,125);ctx2.lineTo(280,100);ctx2.stroke();
    // Text — auto-size font to fit
    ctx2.fillStyle='#222';ctx2.textAlign='center';ctx2.textBaseline='middle';
    var _bfs=32;ctx2.font='bold '+_bfs+'px sans-serif';
    var _btxt=msg.substring(0,24);
    while(ctx2.measureText(_btxt).width>470&&_bfs>14){_bfs-=2;ctx2.font='bold '+_bfs+'px sans-serif';}
    ctx2.fillText(_btxt,256,55);
    var tex=new THREE.CanvasTexture(canvas);
    var spriteMat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});
    var sprite=new THREE.Sprite(spriteMat);
    sprite.scale.set(4,1,1);
    sprite.position.y=3.2;
    egg.mesh.add(sprite);
    _chatBubbles.push({egg:egg,sprite:sprite,timer:_bubbleTime});
}
function _drawBubblePath(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
}
function _updateChatBubbles(){
    for(var i=_chatBubbles.length-1;i>=0;i--){
        var cb=_chatBubbles[i];
        cb.timer--;
        if(cb.timer<30&&cb.sprite)cb.sprite.material.opacity=cb.timer/30;
        if(cb.timer<=0){
            if(cb.sprite&&cb.egg&&cb.egg.mesh)cb.egg.mesh.remove(cb.sprite);
            _chatBubbles.splice(i,1);
        }
    }
}
// NPC random chat bubbles
var _npcChatPhrases={
    zhs:['\u4F60\u597D\uFF01','\u54C8\u54C8','\u8DD1\u5440\uFF01','\u52A0\u6CB9\uFF01','\u563F\u563F','\u597D\u73A9\uFF01','\u8981\u8D62\uFF01','\u522B\u8DD1\uFF01','\u6765\u6293\u6211\u5440','\u54CE\u5440\uFF01'],
    zht:['\u4F60\u597D\uFF01','\u54C8\u54C8','\u8DD1\u5440\uFF01','\u52A0\u6CB9\uFF01','\u563F\u563F','\u597D\u73A9\uFF01','\u8981\u8D0F\uFF01','\u5225\u8DD1\uFF01','\u4F86\u6293\u6211\u5440','\u54CE\u5440\uFF01'],
    ja:['\u3084\u3042\uFF01','\u30CF\u30CF','\u8D70\u308C\uFF01','\u30D5\u30A1\u30A4\u30C8\uFF01','\u30D8\u30D8','\u697D\u3057\u3044\uFF01','\u52DD\u3064\uFF01','\u9003\u3052\u308D\uFF01','\u6355\u307E\u3048\u3066\u307F\u308D','\u3046\u308F\uFF01'],
    en:['Hi!','Haha','Run!','Go go!','Hehe','Fun!','Win!','Catch me!','Whoa!','Yay!']
};
function _npcRandomChat(egg){
    if(Math.random()>0.0008)return; // very rare
    if(egg.heldBy||!egg.alive)return;
    var phrases=_npcChatPhrases[_langCode]||_npcChatPhrases.en;
    _showChatBubble(egg,phrases[Math.floor(Math.random()*phrases.length)]);
}

// ---- Held egg follow + struggle + NPC grab AI ----
function updateHeldEggs(){
    ensureStruggleBar();
    var playerIsHeld=false;
    for(var i=0;i<allEggs.length;i++){
        var egg=allEggs[i];
        if(!egg.heldBy){
            // Remove 3D bar if it had one
            if(egg.struggleBar){egg.mesh.remove(egg.struggleBar);egg.struggleBar=null;}
            // Reset upside-down rotation if was held
            if(egg.mesh.rotation.x>Math.PI*0.5){egg.mesh.rotation.x=0;egg.mesh.rotation.z=0;}
            var _rb=egg.mesh.userData.body;if(_rb&&_rb.rotation.x!==0)_rb.rotation.x=0;
            // Hide arms if this egg was a holder
            if(!egg.holding){var _ra=egg.mesh.userData;if(_ra.rightArm&&_ra.rightArm.rotation.x<-1){_ra.rightArm.visible=false;_ra.rightArm.rotation.x=0;_ra.rightArm.position.set(0.4,0.2,0.7);_ra.rightArm.scale.set(1,1,1);}if(_ra.leftArm&&_ra.leftArm.rotation.x<-1){_ra.leftArm.visible=false;_ra.leftArm.rotation.x=0;_ra.leftArm.position.set(-0.4,0.2,0.7);_ra.leftArm.scale.set(1,1,1);}}
            continue;
        }
        var holder=egg.heldBy;
        // Skip normal held positioning during piledriver (piledriver handles its own positioning)
        if(holder._piledriverTarget===egg||holder._npcPiledriver===egg||egg._piledriverLocked)continue;
        // Position on holder head
        egg.mesh.position.x=holder.mesh.position.x;
        egg.mesh.position.y=holder.mesh.position.y+3.0;
        egg.mesh.position.z=holder.mesh.position.z;
        egg.vx=0;egg.vy=0;egg.vz=0;
        egg.mesh.rotation.y=holder.mesh.rotation.y+Math.PI; // face toward holder
        egg.mesh.rotation.x=Math.PI; // upside down (held by head)
        // Show holder's arms raised up
        var _hArms=holder.mesh.userData;
        if(_hArms.rightArm){_hArms.rightArm.visible=true;_hArms.rightArm.position.set(0.25,1.0,0);_hArms.rightArm.scale.set(1,1,1.5);_hArms.rightArm.rotation.x=-Math.PI/2;}
        if(_hArms.leftArm){_hArms.leftArm.visible=true;_hArms.leftArm.position.set(-0.25,1.0,0);_hArms.leftArm.scale.set(1,1,1.5);_hArms.leftArm.rotation.x=-Math.PI/2;}
        // Struggle timer countdown
        egg.struggleTimer--;
        // Player mashing directions speeds up escape
        if(egg.isPlayer){
            playerIsHeld=true;
            if(keys['KeyA']||keys['KeyD']||keys['KeyW']||keys['KeyS']||keys['ArrowLeft']||keys['ArrowRight']||keys['ArrowUp']||keys['ArrowDown']||joyActive){
                egg.struggleTimer-=2;
            }
        } else {
            // NPC random extra struggle
            if(Math.random()<0.08) egg.struggleTimer--;
        }
        // NPC holder may throw the held egg randomly
        if(!holder.isPlayer&&holder.holding===egg&&Math.random()<0.006){
            holder.holding=null; egg.heldBy=null;
            if(egg.struggleBar){egg.mesh.remove(egg.struggleBar);egg.struggleBar=null;}
            holder.grabCD=40; egg.grabCD=40;
            var throwDir=holder.mesh.rotation.y;
            egg.mesh.position.set(holder.mesh.position.x+Math.sin(throwDir)*1.5, holder.mesh.position.y+0.5, holder.mesh.position.z+Math.cos(throwDir)*1.5);
            var ntw=egg.weight||1.0;var ntf=0.3/ntw;egg.vx=Math.sin(throwDir)*ntf;egg.vy=-0.02;egg.vz=Math.cos(throwDir)*ntf;egg._throwTotal=60;egg.throwTimer=60;egg._bounces=2;
            if(currentCityStyle===5&&gameState==='city'){egg.vx*=0.3;egg.vy*=0.3;egg.vz*=0.3;egg._throwTotal=60;egg.throwTimer=60;}
            egg.squash=0.5; playThrowSound(holder.mesh.position.x,holder.mesh.position.z);
            egg._dropCoinsOnLand=true;egg._coinsDropped=false;
            continue;
        }
        // Escape!
        if(egg.struggleTimer<=0){
            holder.holding=null; egg.heldBy=null;
            holder.grabCD=30; egg.grabCD=40;
            // Pop out to the side
            var escDir=holder.mesh.rotation.y+Math.PI*(0.5+Math.random());
            egg.mesh.position.x=holder.mesh.position.x+Math.sin(escDir)*1.5;
            egg.mesh.position.y=holder.mesh.position.y+0.5;
            egg.mesh.position.z=holder.mesh.position.z+Math.cos(escDir)*1.5;
            egg.vx=Math.sin(escDir)*0.2;egg.vy=0.18;egg.vz=Math.cos(escDir)*0.2;
            egg.squash=0.6;
            if(egg.struggleBar){egg.mesh.remove(egg.struggleBar);egg.struggleBar=null;}
            _dropNpcStolenCoins(egg);
            continue;
        }
        // 3D struggle bar above held egg (for NPC being held)
        if(!egg.isPlayer){
            if(!egg.struggleBar){
                var bg=new THREE.Group();
                var barBg=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.12,0.06),new THREE.MeshBasicMaterial({color:0x333333,transparent:true,opacity:0.7}));
                bg.add(barBg);
                var barFill=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.08,0.07),new THREE.MeshBasicMaterial({color:0xFF4444}));
                barFill.position.z=0.01;
                bg.add(barFill);
                bg.position.y=-1.0; // just above butt (top of flipped egg)
                egg.mesh.add(bg);
                egg.struggleBar=bg;
                egg.struggleBar.userData.fill=barFill;
            }
            var pct=Math.max(0,egg.struggleTimer/egg.struggleMax);
            var fill=egg.struggleBar.userData.fill;
            fill.scale.x=pct;
            fill.position.x=-(1-pct)*0.55;
            fill.material.color.setHex(pct>0.5?0xFFAA00:0xFF4444);
            egg.struggleBar.lookAt(camera.position);
        }
        // Struggle animation — wobble and shake (upside-down base)
        var t=Date.now()*0.012;
        egg.mesh.rotation.z=Math.sin(t*3.7)*0.4;
        egg.mesh.rotation.x=Math.PI+Math.sin(t*2.9)*0.3;
        var body=egg.mesh.userData.body;
        if(body){body.rotation.z=Math.sin(t*5.1)*0.25;body.rotation.x=Math.cos(t*4.3)*0.2;}
        var feet=egg.mesh.userData.feet;
        if(feet&&feet.length===2){feet[0].position.z=0.06+Math.sin(t*6)*0.15;feet[1].position.z=0.06-Math.sin(t*6)*0.15;}
    }
    // Player held UI
    if(playerIsHeld&&playerEgg&&playerEgg.heldBy){
        struggleBarDiv.style.display='block';
        var pct2=Math.max(0,playerEgg.struggleTimer/playerEgg.struggleMax);
        document.getElementById('struggle-fill').style.width=(pct2*100)+'%';
    } else {
        if(!playerEgg||!playerEgg._stunTimer||playerEgg._stunTimer<=0)struggleBarDiv.style.display='none';
    }
    // ---- NPC grab AI (low chance, very close range) ----
    for(var n=0;n<allEggs.length;n++){
        var npc=allEggs[n];
        if(npc.isPlayer||!npc.alive||npc.heldBy||npc.holding||npc.holdingProp||npc.grabCD>0)continue;
        if(npc.grabCD>0){npc.grabCD--;continue;}
        if(Math.random()>0.004)continue; // very low chance per frame
        // Find nearest non-held egg within 1.5 distance
        var best=null,bestD=1.5;
        for(var m=0;m<allEggs.length;m++){
            var target=allEggs[m];
            if(target===npc||!target.alive||target.heldBy||target.holding)continue;
            var ddx=target.mesh.position.x-npc.mesh.position.x;
            var ddz=target.mesh.position.z-npc.mesh.position.z;
            var dd=Math.sqrt(ddx*ddx+ddz*ddz);
            if(dd<bestD){bestD=dd;best=target;}
        }
        if(best){
            npc.holding=best;best.heldBy=npc;
            // Drop any prop the grabbed NPC was holding
            if(best.holdingProp){best.holdingProp.grabbed=false;best.holdingProp=null;}
            npc.grabCD=30;
            best.struggleMax=240+Math.floor(Math.random()*240);
            best.struggleTimer=best.struggleMax;
            playGrabSound(npc.mesh.position.x,npc.mesh.position.z);
        } else if(gameState==='city'){
            // NPC grab city prop if no egg nearby
            var bestProp=null,bestPD=2.5;
            for(var pp2=0;pp2<cityProps.length;pp2++){
                var cp2=cityProps[pp2];
                if(cp2.grabbed)continue;
                var cpdx=cp2.group.position.x-npc.mesh.position.x;
                var cpdz=cp2.group.position.z-npc.mesh.position.z;
                var cpd2=Math.sqrt(cpdx*cpdx+cpdz*cpdz);
                if(cpd2<bestPD){bestPD=cpd2;bestProp=cp2;}
            }
            if(bestProp){
                npc.holdingProp=bestProp;
                bestProp.grabbed=true;
                bestProp.throwTimer=0;bestProp.throwVx=0;bestProp.throwVy=0;bestProp.throwVz=0;
                bestProp.group.rotation.set(0,0,0);
                npc.grabCD=30;
                npc._npcPropHoldTimer=90+Math.floor(Math.random()*120);
                playGrabSound(npc.mesh.position.x,npc.mesh.position.z);
            }
        }
    }
    // ---- NPC throw held props ----
    for(var np2=0;np2<allEggs.length;np2++){
        var npc2=allEggs[np2];
        if(npc2.isPlayer||!npc2.alive||!npc2.holdingProp)continue;
        var hp=npc2.holdingProp;
        hp.group.position.x=npc2.mesh.position.x;
        hp.group.position.y=npc2.mesh.position.y+1.8;
        hp.group.position.z=npc2.mesh.position.z;
        if(!npc2._npcPropHoldTimer)npc2._npcPropHoldTimer=60;
        npc2._npcPropHoldTimer--;
        if(npc2._npcPropHoldTimer<=0){
            // Throw prop toward nearest egg
            var throwDir2=npc2.mesh.rotation.y;
            var nearTgt=null,nearTD=20;
            for(var nt=0;nt<allEggs.length;nt++){
                var tgt=allEggs[nt];
                if(tgt===npc2||!tgt.alive||tgt.heldBy)continue;
                var ntdx=tgt.mesh.position.x-npc2.mesh.position.x;
                var ntdz=tgt.mesh.position.z-npc2.mesh.position.z;
                var ntd=Math.sqrt(ntdx*ntdx+ntdz*ntdz);
                if(ntd<nearTD){nearTD=ntd;nearTgt=tgt;throwDir2=Math.atan2(ntdx,ntdz);}
            }
            npc2.holdingProp=null;
            var pw2=hp.weight||1.0;var pf2=2.5/pw2;
            hp.throwVx=Math.sin(throwDir2)*pf2;hp.throwVy=0.18;hp.throwVz=Math.cos(throwDir2)*pf2;
            hp._bounces=2;hp.throwTimer=25;
            hp.group.position.set(npc2.mesh.position.x+Math.sin(throwDir2)*1.5,npc2.mesh.position.y+0.5,npc2.mesh.position.z+Math.cos(throwDir2)*1.5);
            npc2.grabCD=40;
            playThrowSound(npc2.mesh.position.x,npc2.mesh.position.z);
        }
    }
    // Update held city prop position
    if(playerEgg&&playerEgg.holdingProp){
        var pp=playerEgg.holdingProp;
        pp.group.position.x=playerEgg.mesh.position.x;
        pp.group.position.y=playerEgg.mesh.position.y+1.8;
        pp.group.position.z=playerEgg.mesh.position.z;
    }
    // Thrown city prop physics
    for(var tpi=0;tpi<cityProps.length;tpi++){
        var tp=cityProps[tpi];
        if(tp.throwTimer<=0)continue;
        tp.throwTimer--;
        if(tp.throwTimer<=0){
            // Throw ended — reset grabbed state
            tp.grabbed=false;
            tp.x=tp.group.position.x;tp.z=tp.group.position.z;
            if(tp.group.position.y>0.01){tp.throwVy=-0.05;tp.throwTimer=1;} // still in air, keep falling
            else{tp.group.rotation.set(Math.PI/2*(Math.random()*0.4+0.8)*(Math.random()<0.5?1:-1),Math.random()*Math.PI*2,0);} // topple over
            continue;
        }
        tp.group.position.x+=tp.throwVx;
        tp.group.position.y+=tp.throwVy;
        tp.group.position.z+=tp.throwVz;
        tp.throwVy-=0.012*(tp.weight||1);
        var _tpDrag=tp._chargeDrag||0.92;
        tp.throwVx*=_tpDrag; tp.throwVz*=_tpDrag;
        tp.group.rotation.x+=0.25; tp.group.rotation.z+=0.2;
        // Building collision for thrown props
        for(var _tpci=0;_tpci<cityColliders.length;_tpci++){
            var _tpc=cityColliders[_tpci];
            var _tpdx=tp.group.position.x-_tpc.x, _tpdz=tp.group.position.z-_tpc.z;
            if(Math.abs(_tpdx)<_tpc.hw+1.5&&Math.abs(_tpdz)<_tpc.hd+1.5&&tp.group.position.y<(_tpc.h||6)){
                var _tpox=_tpc.hw+1.5-Math.abs(_tpdx);
                var _tpoz=_tpc.hd+1.5-Math.abs(_tpdz);
                if(_tpox<_tpoz){tp.group.position.x+=(_tpdx>=0?1:-1)*_tpox;tp.throwVx*=-0.3;}
                else{tp.group.position.z+=(_tpdz>=0?1:-1)*_tpoz;tp.throwVz*=-0.3;}
                tp.throwTimer=1;playHitSound(tp.group.position.x,tp.group.position.z);break;
            }
        }
        // City boundary air wall bounce for props
        var _pb=CITY_SIZE-1;
        if(tp.group.position.x>_pb){tp.group.position.x=_pb;tp.throwVx=-Math.abs(tp.throwVx)*0.4;}
        if(tp.group.position.x<-_pb){tp.group.position.x=-_pb;tp.throwVx=Math.abs(tp.throwVx)*0.4;}
        if(tp.group.position.z>_pb){tp.group.position.z=_pb;tp.throwVz=-Math.abs(tp.throwVz)*0.4;}
        if(tp.group.position.z<-_pb){tp.group.position.z=-_pb;tp.throwVz=Math.abs(tp.throwVz)*0.4;}
        if(tp.group.position.y<0.01&&tp.throwVy<0){
            if(tp._bounces>0){tp._bounces--;tp.throwVy=Math.abs(tp.throwVy)*0.45;tp.throwVx*=0.7;tp.throwVz*=0.7;tp.group.position.y=0.01;playHitSound(tp.group.position.x,tp.group.position.z);}
            else{tp.group.position.y=0.01;tp.throwTimer=0;tp.grabbed=false;tp.group.rotation.set(Math.PI/2*(Math.random()*0.4+0.8)*(Math.random()<0.5?1:-1),Math.random()*Math.PI*2,0);tp.x=tp.group.position.x;tp.z=tp.group.position.z;}
        }
        // Hit eggs
        for(var tpe=0;tpe<allEggs.length;tpe++){
            var tpeg=allEggs[tpe];
            if(!tpeg.alive||tpeg.heldBy)continue;
            var tpdx=tpeg.mesh.position.x-tp.group.position.x;
            var tpdz=tpeg.mesh.position.z-tp.group.position.z;
            var tpd=Math.sqrt(tpdx*tpdx+tpdz*tpdz);
            if(tpd<tp.radius+0.8){
                var impW=tp.weight||1;tpeg.vx+=tpdx/tpd*0.4*impW;tpeg.vz+=tpdz/tpd*0.4*impW;tpeg.vy=0.3+0.12*impW;tpeg.squash=0.4;tpeg.throwTimer=15;tpeg._bounces=1;
                if(tpeg.isPlayer)playHitSound(tpeg.mesh.position.x,tpeg.mesh.position.z);
                _dropNpcStolenCoins(tpeg);
            }
        }
        // Hit other props
        for(var tpp=0;tpp<cityProps.length;tpp++){
            if(tpp===tpi||cityProps[tpp].grabbed)continue;
            var op=cityProps[tpp];
            var opdx=op.group.position.x-tp.group.position.x;
            var opdz=op.group.position.z-tp.group.position.z;
            var opd=Math.sqrt(opdx*opdx+opdz*opdz);
            if(opd<tp.radius+op.radius&&opd>0.01){
                op.group.position.x+=opdx/opd*0.8;
                op.group.position.z+=opdz/opd*0.8;
                op.group.position.y+=0.3;
            }
        }
    }
    // Update held obstacle position
    if(playerEgg&&playerEgg.holdingObs){
        var ob=playerEgg.holdingObs;
        ob.mesh.position.x=playerEgg.mesh.position.x;
        ob.mesh.position.y=playerEgg.mesh.position.y+1.8;
        ob.mesh.position.z=playerEgg.mesh.position.z;
    }
    // Thrown obstacle physics
    for(var ti=0;ti<obstacleObjects.length;ti++){
        var tob=obstacleObjects[ti];
        if(!tob._throwTimer||tob._throwTimer<=0)continue;
        tob._throwTimer--;
        tob.mesh.position.x+=tob._throwVx;
        tob.mesh.position.y+=tob._throwVy;
        tob.mesh.position.z+=tob._throwVz;
        tob._throwVy-=0.012*(tob._weight||2);
        var _obDrag=tob._chargeDrag||0.96;
        tob._throwVx*=_obDrag; tob._throwVz*=_obDrag;
        if(tob.mesh.position.y<(tob.data.fy||0)+0.5&&tob._throwVy<0){
            if(tob._bounces>0){tob._bounces--;tob._throwVy=Math.abs(tob._throwVy)*0.45;tob._throwVx*=0.7;tob._throwVz*=0.7;tob.mesh.position.y=(tob.data.fy||0)+0.5;playHitSound(tob.mesh.position.x,tob.mesh.position.z);}
            else{tob.mesh.position.y=(tob.data.fy||0)+0.5;tob._throwTimer=0;tob._grabbed=false;}
        }
        // Hit other eggs with thrown obstacle
        for(var te=0;te<allEggs.length;te++){
            var teg=allEggs[te];
            if(!teg.alive||teg.heldBy)continue;
            var tdx=teg.mesh.position.x-tob.mesh.position.x;
            var tdz=teg.mesh.position.z-tob.mesh.position.z;
            if(Math.sqrt(tdx*tdx+tdz*tdz)<1.5){
                var oiw=tob._weight||2;teg.vx+=tdx*0.35*oiw;teg.vz+=tdz*0.35*oiw;teg.vy=0.3+0.12*oiw;teg.squash=0.4;teg.throwTimer=15;teg._bounces=1;if(teg.isPlayer)playHitSound(teg.mesh.position.x,teg.mesh.position.z);
                _dropNpcStolenCoins(teg);
            }
        }
        if(tob._throwTimer<=0){
            tob._grabbed=false;
            // Reset obstacle to original position after a delay
            tob._resetDelay=120;
        }
        tob.mesh.rotation.x+=0.3;tob.mesh.rotation.z+=0.25;
    }
    // Reset thrown obstacles
    for(var ri2=0;ri2<obstacleObjects.length;ri2++){
        var rob=obstacleObjects[ri2];
        if(rob._resetDelay>0){
            rob._resetDelay--;
            if(rob._resetDelay<=0&&rob._origPos){
                rob.mesh.position.set(rob._origPos.x,rob._origPos.y,rob._origPos.z);
                rob.mesh.rotation.set(0,0,0);
                rob._origPos=null;
            }
        }
    }
    // Decrement grabCD for all
    for(var g=0;g<allEggs.length;g++){if(allEggs[g].grabCD>0)allEggs[g].grabCD--;}
}


// ---- Portal confirm dialog ----
var _portalConfirmOpen=false, _portalConfirmRace=-1, _portalConfirmTarget=-1, _portalDismissed=null, _portalConfirmHidden=null;
var _portalSel=0;
function _updatePortalSel(){
    var yb=document.getElementById('portal-yes');
    var nb=document.getElementById('portal-no');
    if(yb)yb.style.outline=_portalSel===0?'3px solid #FFD700':'none';
    if(nb)nb.style.outline=_portalSel===1?'3px solid #FFD700':'none';
}
function showPortalConfirm(portal){
    _portalConfirmOpen=true;
    _babylonPromptOpen=false;_moonPipePromptOpen=false; // safety reset
    _portalConfirmRace=portal.raceIndex;
    _portalConfirmTarget=portal._targetStyle||(-1);
    _portalConfirmHidden=portal._hiddenType||null;
    _portalDismissed=null;
    var box=document.getElementById('portal-confirm');
    document.getElementById('portal-confirm-name').textContent=portal.name;
    document.getElementById('portal-confirm-desc').textContent=portal.desc;
    box.style.display='flex';_portalSel=0;_updatePortalSel();
}
function hidePortalConfirm(){
    _portalDismissed=(_portalConfirmRace>=0)?_portalConfirmRace:('h'+_portalConfirmTarget);
    _portalConfirmOpen=false;
    _portalConfirmRace=-1;
    _portalConfirmTarget=-1;
    _portalConfirmHidden=null;
    document.getElementById('portal-confirm').style.display='none';
}
function confirmPortalEnter(){
    var ri=_portalConfirmRace;
    var ts=_portalConfirmTarget;
    var ht=_portalConfirmHidden;
    hidePortalConfirm();
    document.getElementById('portal-prompt').style.display='none';
    if(ri>=0){ enterRace(ri); }
    else if(ht==='earthReturn'&&playerEgg){
        // Return to Earth with pipe travel effect — go back to previous city
        var _retStyle=(_prevCityStyle>=0&&_prevCityStyle<5)?_prevCityStyle:0;
        startPipeTravel(playerEgg.mesh.position.x,playerEgg.mesh.position.z,_retStyle,playerEgg.mesh.position.y);
    }
    else if(ht==='platformer'){if(typeof _pfStart==='function'){_pfStart();}}
    else if(ts>=0){ switchCity(ts); }
}
document.getElementById('portal-yes').addEventListener('click',function(){if(_babylonPromptOpen){_confirmBabylonEnter();}else if(_moonPipePromptOpen){_confirmMoonPipeEnter();}else{confirmPortalEnter();}});
document.getElementById('portal-no').addEventListener('click',function(){if(_babylonPromptOpen){_hideBabylonPrompt();}else if(_moonPipePromptOpen){_hideMoonPipePrompt();}else{hidePortalConfirm();}});

// ---- Babel Tower prompt (reuses portal-confirm dialog) ----
var _babylonPromptOpen=false, _babylonPromptDir=1;
function _showBabylonPrompt(dir){
    if(_babylonPromptOpen||_portalConfirmOpen)return;
    _babylonPromptOpen=true;
    _babylonPromptDir=dir||1;
    _portalConfirmOpen=true;
    var box=document.getElementById('portal-confirm');
    var babelName={zhs:'\u5DF4\u522B\u5854',zht:'\u5DF4\u5225\u5854',ja:'\u30D0\u30D9\u30EB\u306E\u5854',en:'Tower of Babel'};
    var upDesc={zhs:'\u4E58\u5750\u7535\u68AF\u524D\u5F80\u4E91\u4E2D\u754C\uFF1F',zht:'\u4E58\u5750\u96FB\u68AF\u524D\u5F80\u96F2\u4E2D\u754C\uFF1F',ja:'\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u3067\u96F2\u4E2D\u754C\u3078\uFF1F',en:'Take elevator to Cloud Realm?'};
    var downDesc={zhs:'\u4E58\u5750\u7535\u68AF\u8FD4\u56DE\u5730\u9762\uFF1F',zht:'\u4E58\u5750\u96FB\u68AF\u8FD4\u56DE\u5730\u9762\uFF1F',ja:'\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u3067\u5730\u4E0A\u3078\uFF1F',en:'Take elevator back down?'};
    document.getElementById('portal-confirm-name').textContent=babelName[_langCode]||babelName.en;
    document.getElementById('portal-confirm-desc').textContent=(dir===-1?downDesc:upDesc)[_langCode]||(dir===-1?downDesc:upDesc).en;
    box.style.display='flex';
}
function _hideBabylonPrompt(){
    _babylonPromptOpen=false;
    _portalConfirmOpen=false;
    _babylonPromptDismissed=true;
    document.getElementById('portal-confirm').style.display='none';
}
function _confirmBabylonEnter(){
    _babylonPromptOpen=false;
    _portalConfirmOpen=false;
    document.getElementById('portal-confirm').style.display='none';
    if(!_babylonTower)return;
    _babylonElevator=true;
    _babylonElevDir=_babylonPromptDir;
    _babylonElevY=(_babylonPromptDir===1)?1:_babylonTower.topY;
    if(sfxEnabled){
        var ctx=ensureAudio();if(ctx){
            var o=ctx.createOscillator();var g=ctx.createGain();
            o.type='sine';
            if(_babylonPromptDir===1){o.frequency.setValueAtTime(200,ctx.currentTime);o.frequency.linearRampToValueAtTime(600,ctx.currentTime+2);}
            else{o.frequency.setValueAtTime(600,ctx.currentTime);o.frequency.linearRampToValueAtTime(200,ctx.currentTime+2);}
            g.gain.setValueAtTime(0.1,ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+2.5);
            o.connect(g);g.connect(ctx.destination);
            o.start();o.stop(ctx.currentTime+2.5);
        }
    }
}
// ---- Moon Pipe prompt (reuses portal-confirm dialog) ----
function _showMoonPipePrompt(){
    if(_moonPipePromptOpen||_portalConfirmOpen||_babylonPromptOpen)return;
    _moonPipePromptOpen=true;
    _portalConfirmOpen=true;
    var box=document.getElementById('portal-confirm');
    var moonName=CITY_STYLES[5]?CITY_STYLES[5].name:'Moon';
    var desc={zhs:'\u901A\u8FC7\u661F\u7A7A\u96A7\u9053\u524D\u5F80'+moonName+'\uFF1F',zht:'\u901A\u904E\u661F\u7A7A\u96A7\u9053\u524D\u5F80'+moonName+'\uFF1F',ja:'\u661F\u7A7A\u30C8\u30F3\u30CD\u30EB\u3067'+moonName+'\u3078\uFF1F',en:'Travel through starfield tunnel to '+moonName+'?'};
    document.getElementById('portal-confirm-name').textContent=moonName;
    document.getElementById('portal-confirm-desc').textContent=desc[_langCode]||desc.en;
    box.style.display='flex';
}
function _hideMoonPipePrompt(){
    _moonPipePromptOpen=false;
    _portalConfirmOpen=false;
    _moonPipeDismissed=true;
    document.getElementById('portal-confirm').style.display='none';
}
function _confirmMoonPipeEnter(){
    _moonPipePromptOpen=false;
    _portalConfirmOpen=false;
    document.getElementById('portal-confirm').style.display='none';
    if(_cloudWorldPipe){
        startPipeTravel(_cloudWorldPipe.x,_cloudWorldPipe.z,_cloudWorldPipe.targetStyle,_cloudWorldPipe.y);
    }
}
addEventListener('keydown',function(e){
    if(!_portalConfirmOpen)return;
    if(_babylonPromptOpen){
        if(e.code==='KeyY'||e.code==='Enter'||e.code==='Space'||e.code==='ArrowRight'){e.preventDefault();_confirmBabylonEnter();}
        if(e.code==='KeyN'||e.code==='Escape'||e.code==='ArrowLeft'){e.preventDefault();_hideBabylonPrompt();}
        return;
    }
    if(_moonPipePromptOpen){
        if(e.code==='KeyY'||e.code==='Enter'||e.code==='Space'||e.code==='ArrowRight'){e.preventDefault();_confirmMoonPipeEnter();}
        if(e.code==='KeyN'||e.code==='Escape'||e.code==='ArrowLeft'){e.preventDefault();_hideMoonPipePrompt();}
        return;
    }
    if(e.code==='ArrowLeft'||e.code==='KeyA'){e.preventDefault();_portalSel=(_portalSel+1)%2;_updatePortalSel();}
    if(e.code==='ArrowRight'||e.code==='KeyD'){e.preventDefault();_portalSel=(_portalSel+1)%2;_updatePortalSel();}
    if(e.code==='Enter'||e.code==='Space'||e.code==='KeyR'||e.code==='KeyT'||e.code==='KeyF'||e.code==='KeyG'){e.preventDefault();if(_portalSel===0)confirmPortalEnter();else hidePortalConfirm();}
    if(e.code==='Escape'||e.code==='KeyN'){e.preventDefault();hidePortalConfirm();}
});
// Result screen — Enter/Space to go back to city
addEventListener('keydown',function(e){
    if(gameState!=='raceResult')return;
    if(e.code==='Enter'||e.code==='Space'){e.preventDefault();goBackToCity();}
});

// ============================================================
//  SOTN Area Name Reveal
// ============================================================
var _areaNameTimer=null;
var _areaNames={
    zhs:['\u5E0C\u671B\u4E4B\u57CE \u2014 \u6E56\u5149\u6C34\u8272','\u6C99\u6F20\u57CE \u2014 \u9EC4\u91D1\u4E4B\u7802','\u51B0\u96EA\u57CE \u2014 \u6C38\u51BB\u4E4B\u5730','\u7194\u5CA9\u57CE \u2014 \u706B\u7130\u4E4B\u5FC3','\u7CD6\u679C\u57CE \u2014 \u68A6\u5E7B\u4E50\u56ED','\u6708\u9762\u90FD\u5E02 \u2014 \u5BD2\u5BC2\u4E4B\u6D77'],
    zht:['\u5E0C\u671B\u4E4B\u57CE \u2014 \u6E56\u5149\u6C34\u8272','\u6C99\u6F20\u57CE \u2014 \u9EC3\u91D1\u4E4B\u7802','\u51B0\u96EA\u57CE \u2014 \u6C38\u51CD\u4E4B\u5730','\u7194\u5CA9\u57CE \u2014 \u706B\u7130\u4E4B\u5FC3','\u7CD6\u679C\u57CE \u2014 \u5922\u5E7B\u6A02\u5712','\u6708\u9762\u90FD\u5E02 \u2014 \u5BD2\u5BC2\u4E4B\u6D77'],
    ja:['\u5E0C\u671B\u306E\u8857 \u2014 \u6E56\u5149\u6C34\u8272','\u7802\u6F20\u30B7\u30C6\u30A3 \u2014 \u9EC4\u91D1\u306E\u7802','\u6C37\u96EA\u30B7\u30C6\u30A3 \u2014 \u6C38\u51CD\u306E\u5730','\u6EB6\u5CA9\u30B7\u30C6\u30A3 \u2014 \u708E\u306E\u5FC3\u81D3','\u30AD\u30E3\u30F3\u30C7\u30A3\u30B7\u30C6\u30A3 \u2014 \u5922\u306E\u697D\u5712','\u30EB\u30CA\u30FC\u30BE\u30FC\u30F3 \u2014 \u9759\u5BC2\u306E\u6D77'],
    en:['City of Hope \u2014 Shimmering Waters','Desert City \u2014 Golden Sands','Ice City \u2014 Frozen Lands','Lava City \u2014 Heart of Flame','Candy City \u2014 Dreamland','Lunar Zone \u2014 Sea of Silence']
};
var _areaNameCloud={zhs:'\u4E91\u4E2D\u754C \u2014 \u5929\u7A7A\u4E4B\u57CE',zht:'\u96F2\u4E2D\u754C \u2014 \u5929\u7A7A\u4E4B\u57CE',ja:'\u96F2\u4E2D\u754C \u2014 \u5929\u7A7A\u306E\u57CE',en:'Cloud Realm \u2014 City in the Sky'};
function _showAreaName(name){
    if(!name)return;
    var overlay=document.getElementById('area-name-overlay');
    var text=document.getElementById('area-name-text');
    if(!overlay||!text)return;
    if(_areaNameTimer){clearTimeout(_areaNameTimer);_areaNameTimer=null;}
    overlay.style.display='none';
    text.style.animation='none';
    // Force reflow to restart animation
    void text.offsetWidth;
    text.textContent=name;
    text.style.animation='sotnReveal 3.5s ease-out forwards';
    overlay.style.display='flex';
    _areaNameTimer=setTimeout(function(){overlay.style.display='none';_areaNameTimer=null;},3600);
}
function _showCityAreaName(cityIdx){
    var names=_areaNames[_langCode]||_areaNames.en;
    if(cityIdx>=0&&cityIdx<names.length)_showAreaName(names[cityIdx]);
}
function _showCloudAreaName(){
    _showAreaName(_areaNameCloud[_langCode]||_areaNameCloud.en);
}

// ============================================================
//  GAME FLOW
// ============================================================
function showScreen(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const el=document.getElementById(id);
    if(el)el.classList.add('active');
}

function enterCity(spawnX,spawnZ){
    gameState='city';
    _spinDashing=false;_spinDashTimer=0;_spinDashTimerMax=0;_spinDashSpeed=0;if(_spinDashBar)_spinDashBar.visible=false;
    showScreen(null);
    stopSelectBGM();
    stopRaceBGM();
    startBGM();
    document.getElementById('city-hud').classList.remove('hidden');
    document.getElementById('race-hud').classList.add('hidden');
    if('ontouchstart' in window||_touchVisible){document.getElementById('touch-controls').classList.remove('hidden');if(typeof _hideMenuTouch==='function')_hideMenuTouch();}

    cityGroup.visible=true; raceGroup.visible=false;
    clearRace();

    // Clear all NPC grab/held states to prevent invisible grabs
    for(var ni=0;ni<cityNPCs.length;ni++){
        var npc=cityNPCs[ni];
        npc.holding=null;npc.heldBy=null;npc.holdingObs=null;npc.holdingProp=null;
        npc.throwTimer=0;npc.grabCD=60;npc.finished=false;npc._stunTimer=0;
        if(npc.struggleBar){try{npc.mesh.remove(npc.struggleBar);}catch(e){}npc.struggleBar=null;}
    }

    // Create player in city
    var sx=(spawnX!==undefined)?spawnX:0;
    var sz=(spawnZ!==undefined)?spawnZ:0;
    const skin=CHARACTERS[selectedChar];
    playerEgg=createEgg(sx,sz,skin.color,skin.accent,true,undefined,skin.type);
    playerEgg.finished=false;playerEgg.alive=true;
    if(currentCityStyle===5){
        // Moon flat: spawn in battlefield area (right side)
        if(sx===0&&sz===5){sx=50;sz=0;}
        playerEgg.mesh.position.set(sx,0.5,sz);
        camera.position.set(sx,12,sz+14);camera.lookAt(sx,0,sz);
        camera.up.set(0,1,0);
    } else {
        // Spawn high above fountain, fall down
        if(sx===0&&sz===0)playerEgg.mesh.position.y=15;
        camera.position.set(sx,12,sz+14); camera.lookAt(sx,0,sz);
        camera.up.set(0,1,0);
    }
    // Check if Tower of Babel should already be triggered
    if(coins>=10&&!_babylonTriggered&&currentCityStyle!==5){_triggerBabylonEvent();}
    // SOTN area name reveal
    _showCityAreaName(currentCityStyle);
}

function enterRace(raceIndex){
    currentRaceIndex=raceIndex;
    finishedEggs=[]; playerFinished=false;
    raceCoinScore=0;

    // Hide all UI
    document.getElementById('city-hud').classList.add('hidden');
    document.getElementById('race-hud').classList.add('hidden');
    document.getElementById('touch-controls').classList.add('hidden');
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));

    // Clear player grab states before leaving city
    if(playerEgg){
        if(playerEgg.holding){var h2=playerEgg.holding;h2.heldBy=null;playerEgg.holding=null;if(h2.struggleBar){h2.mesh.remove(h2.struggleBar);h2.struggleBar=null;}}
        if(playerEgg.heldBy){var hdr2=playerEgg.heldBy;hdr2.holding=null;playerEgg.heldBy=null;if(playerEgg.struggleBar){playerEgg.mesh.remove(playerEgg.struggleBar);playerEgg.struggleBar=null;}}
        if(playerEgg.holdingObs){playerEgg.holdingObs._grabbed=false;playerEgg.holdingObs=null;}
        if(playerEgg.holdingProp){playerEgg.holdingProp.grabbed=false;playerEgg.holdingProp=null;}
        scene.remove(playerEgg.mesh);
        const idx=allEggs.indexOf(playerEgg);
        if(idx!==-1) allEggs.splice(idx,1);
        playerEgg=null;
    }

    // Hide city
    cityGroup.visible=false;
    for(const npc of cityNPCs) npc.mesh.visible=false;

    // Build race
    raceGroup.visible=true;
    trackSegments=buildRaceTrack(raceIndex);

    // Spawn race eggs
    const skin=CHARACTERS[selectedChar];
    const total=14+raceIndex*2;
    playerEgg=createEgg(0, -3, skin.color, skin.accent, true, undefined, skin.type);
    for(let i=1;i<total;i++){
        const ci=(i-1)%AI_COLORS.length;
        createEgg((Math.random()-0.5)*8, -3 - Math.random()*4, AI_COLORS[ci], AI_COLORS[(ci+3)%AI_COLORS.length], false, undefined, CHARACTERS[i%CHARACTERS.length].type);
    }

    camera.position.set(0, 12, 11);
    camera.lookAt(0, 0, -5);
    camera.up.set(0,1,0); // reset from moon spherical camera

    // Show countdown then start
    gameState='raceIntro';
    stopBGM(); startRaceBGM(raceIndex);
    const race=RACES[raceIndex];
    // SOTN area name reveal for race
    var raceNames=I18N.raceNames[_langCode]||I18N.raceNames.en;
    if(raceNames[raceIndex])_showAreaName(raceNames[raceIndex]);
    document.getElementById('round-label').textContent=race.name;
    document.getElementById('round-name').textContent=race.desc;
    document.getElementById('round-desc').textContent=L('rushGoal');
    document.getElementById('player-count').textContent='🥚 × '+total;
    document.getElementById('countdown').textContent='3';
    document.getElementById('round-screen').classList.add('active');

    if(countdownTimer) clearInterval(countdownTimer);
    let count=3;
    countdownTimer=setInterval(()=>{
        count--;
        if(count>0){
            document.getElementById('countdown').textContent=count;
        } else {
            clearInterval(countdownTimer);
            countdownTimer=null;
            document.getElementById('round-screen').classList.remove('active');
            gameState='racing';
            document.getElementById('race-hud').classList.remove('hidden');
            document.getElementById('round-hud').textContent='🏆 '+race.name;
            document.getElementById('alive-hud').textContent='🥚 '+allEggs.filter(e=>!e.cityNPC).length;
            if('ontouchstart' in window||_touchVisible){document.getElementById('touch-controls').classList.remove('hidden');if(typeof _hideMenuTouch==='function')_hideMenuTouch();}
        }
    },1000);
}

function checkRaceEnd(){
    if(gameState!=='racing')return;
    if(playerFinished){
        showRaceResult();
        return;
    }
    const raceEggs=allEggs.filter(e=>!e.cityNPC);
    const surviveCount=Math.ceil(raceEggs.length*0.6);
    if(finishedEggs.length>=surviveCount&&!playerFinished){
        showRaceResult();
    }
}

function showRaceResult(){
    gameState='raceResult';
    const place=playerFinished ? playerEgg.finishOrder+1 : 999;
    const total=allEggs.filter(e=>!e.cityNPC).length;
    const won=playerFinished && place<=Math.ceil(total*0.6);
    document.getElementById('result-emoji').textContent=won?'🎉':'😵';
    document.getElementById('result-title').textContent=won?I18N.resultWin(place):L('resultLose');
    document.getElementById('result-sub').textContent=won?I18N.resultSub(raceCoinScore):L('tryAgain');
    if(won){coins+=3+raceCoinScore;document.getElementById('coin-hud').textContent='⭐ '+coins;}
    showScreen('result-screen');
    document.getElementById('race-hud').classList.add('hidden');
    document.getElementById('touch-controls').classList.add('hidden');
}

function updateRaceHUD(){
    if(gameState!=='racing'||!playerEgg)return;
    const progress=Math.min(1,(-playerEgg.mesh.position.z)/trackLength);
    document.getElementById('pbar-fill').style.width=(progress*100)+'%';
    let place=1;
    const pz=-playerEgg.mesh.position.z;
    const raceEggs=allEggs.filter(e=>!e.cityNPC);
    for(const e of raceEggs){if(e!==playerEgg&&e.alive&&(-e.mesh.position.z)>pz)place++;}
    document.getElementById('place-hud').textContent=I18N.placeN(place);
    document.getElementById('alive-hud').textContent='🥚 '+raceEggs.filter(e=>e.alive&&!e.finished).length;
    document.getElementById('race-coin-hud').textContent='🪙 '+raceCoinScore;
}


// ---- Thrown egg impact (Kunio-kun style) ----
function checkThrownEggImpact(eggList){
    for(var i=0;i<eggList.length;i++){
        var a=eggList[i];
        if(!a||!a.alive||a.throwTimer<=0)continue;
        var airFrames=(a._throwTotal||60)-a.throwTimer;
        if(airFrames<5)continue; // grace period
        for(var j=0;j<eggList.length;j++){
            var b=eggList[j];
            if(!b||b===a||!b.alive||b.heldBy)continue;
            var dx=b.mesh.position.x-a.mesh.position.x;
            var dz=b.mesh.position.z-a.mesh.position.z;
            var dy=b.mesh.position.y-a.mesh.position.y;
            var dist=Math.sqrt(dx*dx+dz*dz+dy*dy);
            if(dist<1.3){
                // Kunio-kun impact: victim flies up and away
                var nx=dx/(dist||1), nz=dz/(dist||1);
                b.vx+=nx*0.5+a.vx*0.4;
                b.vz+=nz*0.5+a.vz*0.4;
                b.vy=0.28;
                b.squash=0.4;
                b._throwTotal=30;b.throwTimer=30;b._bounces=1;
                // Thrower slows down
                a.vx*=0.3;a.vz*=0.3;
                a.throwTimer=Math.min(a.throwTimer,5);
                playHitSound(a.mesh.position.x,a.mesh.position.z);
                _dropNpcStolenCoins(b);
            }
        }
    }
}
// ============================================================
//  MAIN LOOP
// ============================================================
const clock = new THREE.Clock();
var _lastFrameTime=0;
var _targetFrameInterval=1000/60; // target 60fps
var _accumulator=0;
var _fixedStep=1000/60; // fixed timestep

function animate(now){
    requestAnimationFrame(animate);
    if(!now)now=performance.now();
    var _elapsed=now-_lastFrameTime;
    if(_elapsed<8)return; // skip if too fast (>120fps)
    _lastFrameTime=now;
    // Accumulate time and run fixed timestep updates (catch up if behind)
    _accumulator+=Math.min(_elapsed,100); // cap at 100ms to prevent spiral
    var _ticks=0;
    while(_accumulator>=_fixedStep&&_ticks<3){
        _gameUpdate();
        _accumulator-=_fixedStep;
        _ticks++;
    }
    R.render(scene,camera);
}

function _gameUpdate(){
    const dt=1/60;

    if(gameState==='city'){
        if(_pipeTraveling){
            updatePipeTravel();
        } else {
            handlePlayerInput();
        }
        if(playerEgg&&!_pipeTraveling) updateEggPhysics(playerEgg, true);
        if(playerEgg){_updateStunStars(playerEgg);_updatePainFace(playerEgg);}
        if(playerEgg&&playerEgg._stunMeter>0&&playerEgg._stunTimer<=0)playerEgg._stunMeter=Math.max(0,playerEgg._stunMeter-0.5);
        // Player electrocution effect
        if(playerEgg&&playerEgg._electrocuted>0){
            playerEgg._electrocuted--;
            playerEgg.vx=0;playerEgg.vz=0;playerEgg.vy=0;playerEgg.throwTimer=0;
            var _peBody=playerEgg.mesh.userData.body;
            if(_peBody)_peBody.material=new THREE.MeshBasicMaterial({color:Math.floor(playerEgg._electrocuted/3)%2===0?0x111111:0xFFFFFF,transparent:true,opacity:0.9});
            if(playerEgg._electrocuted<=0&&playerEgg._elecKnockDir){
                playerEgg._elecFlying=60;
                playerEgg._elecFlyDir={x:playerEgg._elecKnockDir.x,z:playerEgg._elecKnockDir.z};
                playerEgg._elecKnockDir=null;
                playerEgg.vy=0.35;
                playerEgg.throwTimer=60;
            } else if(playerEgg._electrocuted<=0){
                if(_peBody)_peBody.material=toon(playerEgg._origColor||0xFFDD44);
                playerEgg._stunTimer=40;playerEgg._slamImmune=0;
            }
        }
        if(playerEgg&&playerEgg._elecFlying>0){
            playerEgg._elecFlying--;
            if(playerEgg._elecFlyDir){
                playerEgg.vx=playerEgg._elecFlyDir.x*0.4;
                playerEgg.vz=playerEgg._elecFlyDir.z*0.4;
            }
            var _peBody2=playerEgg.mesh.userData.body;
            if(_peBody2)_peBody2.material=new THREE.MeshBasicMaterial({color:Math.floor(playerEgg._elecFlying/3)%2===0?0x111111:0xFFFFFF,transparent:true,opacity:0.9});
            if(playerEgg._elecFlying<=0){
                if(_peBody2)_peBody2.material=toon(playerEgg._origColor||0xFFDD44);
                playerEgg.vx*=0.1;playerEgg.vz*=0.1;
                playerEgg._stunTimer=40;playerEgg._slamImmune=0;playerEgg._elecFlyDir=null;
            }
        }
        // Player fire effect
        if(playerEgg&&playerEgg._onFire>0){
            playerEgg._onFire--;
            if(!playerEgg._fireParticles){
                playerEgg._fireParticles=[];
                for(var _pfpi=0;_pfpi<14;_pfpi++){
                    var _pfpSize=_pfpi<4?0.3:0.2;
                    var _pfp=new THREE.Mesh(new THREE.SphereGeometry(_pfpSize,5,4),new THREE.MeshBasicMaterial({color:0xFF4400,transparent:true,opacity:0.85}));
                    _pfp.visible=false;playerEgg.mesh.add(_pfp);
                    playerEgg._fireParticles.push(_pfp);
                }
            }
            for(var _pfpj=0;_pfpj<playerEgg._fireParticles.length;_pfpj++){
                var _pfpp=playerEgg._fireParticles[_pfpj];
                _pfpp.visible=true;
                var _pfpa=_pfpj*Math.PI*2/playerEgg._fireParticles.length+playerEgg._onFire*0.25;
                var _pfpR=0.4+Math.sin(_pfpa*2)*0.2;
                var _pfpY=0.3+_pfpj*0.12+Math.random()*0.3;
                _pfpp.position.set(Math.sin(_pfpa)*_pfpR,_pfpY,Math.cos(_pfpa)*_pfpR);
                var _pfRnd=Math.random();
                _pfpp.material.color.setHex(_pfRnd>0.6?0xFFCC00:(_pfRnd>0.3?0xFF6600:0xFF2200));
                _pfpp.material.opacity=0.6+Math.random()*0.35;
                _pfpp.scale.setScalar(0.6+Math.random()*1.0);
            }
            var _pfbody=playerEgg.mesh.userData.body;
            if(_pfbody&&playerEgg._onFire>0){_pfbody.material.emissive=new THREE.Color(0xFF4400);_pfbody.material.emissiveIntensity=0.3+Math.sin(playerEgg._onFire*0.3)*0.15;}
            if(playerEgg._onFire<=0){
                for(var _pfpk=0;_pfpk<playerEgg._fireParticles.length;_pfpk++)playerEgg._fireParticles[_pfpk].visible=false;
                if(_pfbody){_pfbody.material.emissiveIntensity=0;}
            }
            if(playerEgg._fireStun>0){
                playerEgg._fireStun--;
                playerEgg.vx=0;playerEgg.vz=0;playerEgg.vy=0;playerEgg.throwTimer=0;playerEgg._hitStun=5;
                playerEgg.mesh.rotation.z=Math.sin(Date.now()*0.05)*0.15;
                if(playerEgg._fireStun<=0){
                    var _pfkDir=playerEgg._fireStunDir||0;
                    playerEgg.vx=Math.sin(_pfkDir)*0.3;playerEgg.vz=Math.cos(_pfkDir)*0.3;playerEgg.vy=0.1;
                    playerEgg.throwTimer=30;playerEgg._bounces=1;playerEgg.squash=0.5;
                    playerEgg.mesh.rotation.z=0;
                }
            }
        }
        updateCity();
        const cityEggList = [playerEgg, ...cityNPCs].filter(e=>e&&e.alive);
        resolveEggCollisions(cityEggList);
        checkThrownEggImpact(cityEggList);
        updateHeldEggs();
        _updateChatBubbles();
        for(var _nci=0;_nci<allEggs.length;_nci++){if(!allEggs[_nci].isPlayer)_npcRandomChat(allEggs[_nci]);}
        if(_pfActive&&typeof _pfUpdateCamera==='function'){_pfUpdateCamera();}else{updateCamera();}
    } else if(gameState==='racing'){
        handlePlayerInput();
        const raceEggs=allEggs.filter(e=>!e.cityNPC);
        for(const egg of raceEggs){
            if(!egg.isPlayer) updateRaceAI(egg);
            updateEggPhysics(egg, false);
        }
        resolveEggCollisions(raceEggs);
        checkThrownEggImpact(raceEggs);
        updateHeldEggs();
                // Race coin collection + animation
        for(var ci=0;ci<raceCoins.length;ci++){
            var rc=raceCoins[ci];
            if(rc.collected)continue;
            rc.bobPhase+=0.05;
            rc.mesh.position.y=rc.fy+1.2+Math.sin(rc.bobPhase)*0.3;
            rc.mesh.rotation.y+=0.04;
            if(!playerEgg)continue;
            var cdx=playerEgg.mesh.position.x-rc.x;
            var cdz=playerEgg.mesh.position.z-(-rc.z);
            var cdy=playerEgg.mesh.position.y-(rc.fy+1.2);
            var cdist=Math.sqrt(cdx*cdx+cdz*cdz+cdy*cdy);
            if(cdist<1.5){rc.collected=true;rc.mesh.visible=false;raceCoinScore++;playCoinSound();}
        }
        updateObstacles();
        updateCamera();
        updateRaceHUD();
        checkRaceEnd();
    } else if(gameState==='raceIntro'){
        if(playerEgg) updateCamera();
    }

    _updateDropShadow();
    _updateChargeParticles();
    // Update grab button text
    if(grabBtn&&playerEgg){if(playerEgg.holding){grabBtn.textContent=L('throwT');grabBtn.classList.add('holding');}else{grabBtn.textContent=L('grab');grabBtn.classList.remove('holding');}}
}

