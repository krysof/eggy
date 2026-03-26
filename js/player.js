// player.js — DANBO World
// ============================================================
//  PLAYER INPUT
// ============================================================
function handlePlayerInput(){
    if(!playerEgg||!playerEgg.alive)return;
    if(_portalConfirmOpen)return;
    if(playerEgg.finished&&gameState==='racing')return;
    // Cannot control while being piledrivered or held by NPC piledriver
    if(playerEgg.heldBy)return;
    // Cannot control while thrown or stunned (except struggle when held)
    if(playerEgg.throwTimer>0||playerEgg._stunTimer>0){
        // Interrupt: drop held items and cancel ALL special moves
        if(playerEgg.holding){var _ih=playerEgg.holding;_ih.heldBy=null;playerEgg.holding=null;if(_ih.struggleBar){_ih.mesh.remove(_ih.struggleBar);_ih.struggleBar=null;}playerEgg.grabCD=20;}
        if(playerEgg.holdingProp){playerEgg.holdingProp.grabbed=false;playerEgg.holdingProp=null;playerEgg.grabCD=20;}
        if(playerEgg.holdingObs){playerEgg.holdingObs._grabbed=false;playerEgg.holdingObs=null;playerEgg.grabCD=20;}
        _jumpCharging=false;_jumpCharge=0;_chargeHoldTimer=0;
        playerEgg._throwCharging=false;playerEgg._throwCharge=0;
        _sprintCharge=0;
        // Cancel all special moves
        if(playerEgg._piledriverTarget){var _ipt=playerEgg._piledriverTarget;_ipt._piledriverLocked=false;playerEgg._piledriverTarget=null;playerEgg._piledriverPhase=0;}
        playerEgg._bodySlam=false;playerEgg._bodySlamTarget=null;
        playerEgg._tatsuActive=0;playerEgg._tatsuDir=0;
        playerEgg._shoryuReady=false;playerEgg._shoryuSeq=0;playerEgg._shoryuActive=0;
        playerEgg._comboCount=0;playerEgg._comboTimer=0;
        // Cancel dash attacks
        if(playerEgg._hondaDash>0){playerEgg._hondaDash=0;playerEgg.mesh.scale.set(1,1,1);playerEgg.mesh.rotation.x=0;
            var _cdB=playerEgg.mesh.userData.body;if(_cdB)_cdB.rotation.x=0;
            playerEgg._dashDirX=undefined;playerEgg._dashDirZ=undefined;playerEgg._dashFaceY=undefined;playerEgg._blankaRoll=false;}
        playerEgg._blankaShock=0;
        playerEgg._hyakuretsuTimer=0;
        // Hide attack limbs
        var _iud=playerEgg.mesh.userData;
        if(_iud.rightArm)_iud.rightArm.visible=false;
        if(_iud.leftArm)_iud.leftArm.visible=false;
        if(_iud.rightLeg)_iud.rightLeg.visible=false;
        if(_iud.leftLeg)_iud.leftLeg.visible=false;
        playerEgg._atkAnim=0;
        if(playerEgg.throwTimer>0)return;
    }
    // Hitstun flinch — can't act but no stun stars; also cancel special moves
    if(playerEgg._hitStun>0){
        playerEgg._hitStun--;playerEgg.vx*=0.85;playerEgg.vz*=0.85;
        playerEgg._tatsuActive=0;playerEgg._comboCount=0;
        return;
    }
    if(playerEgg._stunTimer>0){
        // Mash directions to escape stun faster
        if(keys['KeyA']||keys['KeyD']||keys['KeyW']||keys['KeyS']||keys['ArrowLeft']||keys['ArrowRight']||keys['ArrowUp']||keys['ArrowDown']||joyActive){
            playerEgg._stunTimer-=2; // mashing doubles escape speed
        }
        playerEgg._stunTimer--;playerEgg.vx*=0.9;playerEgg.vz*=0.9;
        // Show stun progress bar
        if(!playerEgg._stunMax)playerEgg._stunMax=playerEgg._stunTimer+1;
        var _stunPct=Math.max(0,playerEgg._stunTimer/playerEgg._stunMax);
        ensureStruggleBar();
        struggleBarDiv.style.display='block';
        var _sfill=document.getElementById('struggle-fill');
        if(_sfill)_sfill.style.width=(_stunPct*100)+'%';
        var _stext=document.getElementById('struggle-text');
        if(_stext)_stext.textContent=L('struggle');
        // Cancel spin dash on stun
        if(_spinDashing){_spinDashing=false;_spinDashTimer=0;_spinDashSpeed=0;if(_spinDashBar)_spinDashBar.visible=false;}
        if(playerEgg._stunTimer<=0){playerEgg._stunMax=0;struggleBarDiv.style.display='none';}
        return;}
    let mx=0,mz=0;
    if(keys['KeyA']||keys['ArrowLeft'])mx-=1;
    if(keys['KeyD']||keys['ArrowRight'])mx+=1;
    if(keys['KeyW']||keys['ArrowUp'])mz-=1;
    if(keys['KeyS']||keys['ArrowDown'])mz+=1;
    if(joyActive){mx+=joyVec.x;mz+=joyVec.y;}
    // Sprint: hold F — gradual speed ramp (only when not holding something)
    var _holdAnything=playerEgg.holding||playerEgg.holdingProp||playerEgg.holdingObs;
    var holdingF=keys['KeyF']&&!_portalConfirmOpen&&!_holdAnything;
    var sprintPct=_updateSprintBar(holdingF);
    var accelMul=1+sprintPct*1.0;
    var speedMul=1+sprintPct*1.0;
    const len=Math.sqrt(mx*mx+mz*mz);
    if(len>0.1){
        mx/=len;mz/=len;
        playerEgg.vx+=mx*MOVE_ACCEL*accelMul;playerEgg.vz+=mz*MOVE_ACCEL*accelMul;
        // Backstep: if moving opposite to facing, don't turn for 30 frames
        var _moveAngle=Math.atan2(mx,mz);
        var _faceDiff=Math.abs(_moveAngle-playerEgg.mesh.rotation.y);
        if(_faceDiff>Math.PI)_faceDiff=Math.PI*2-_faceDiff;
        if(_faceDiff>Math.PI*0.7){
            // Only true backward — backstep 0.2s then quick turn
            if(!playerEgg._backstepTimer||playerEgg._backstepTimer<=0)playerEgg._backstepTimer=12;
            playerEgg.vx*=0.5;playerEgg.vz*=0.5;
        }
    }
    if(playerEgg._backstepTimer>0)playerEgg._backstepTimer--;
    if(playerEgg._dashBounceTimer>0)playerEgg._dashBounceTimer--;
    // Sprint smoke + ground dust
    if(sprintPct>0.15&&playerEgg.onGround&&len>0.1){
        if(!playerEgg._sprintSmokeTick)playerEgg._sprintSmokeTick=0;
        playerEgg._sprintSmokeTick++;
        if(playerEgg._sprintSmokeTick%3===0)_spawnButtSmoke(playerEgg,sprintPct*0.6);
        if(playerEgg._sprintSmokeTick%5===0)_spawnGroundDust(playerEgg.mesh.position.x,playerEgg.mesh.position.y,playerEgg.mesh.position.z,sprintPct*0.3);
    } else { playerEgg._sprintSmokeTick=0; }
    // ---- Sonic spin dash ----
    if(_spinDashing){
        _spinDashTimer--;
        if(_spinDashTimer<=0){_spinDashing=false;_spinDashSpeed=0;if(_spinDashBar)_spinDashBar.visible=false;}
        else{
            // Steering during spin dash — WASD/joystick can curve the direction
            var sdSteerX=0, sdSteerZ=0;
            if(keys['KeyA']||keys['ArrowLeft'])sdSteerX-=1;
            if(keys['KeyD']||keys['ArrowRight'])sdSteerX+=1;
            if(keys['KeyW']||keys['ArrowUp'])sdSteerZ-=1;
            if(keys['KeyS']||keys['ArrowDown'])sdSteerZ+=1;
            if(joyActive){sdSteerX+=joyVec.x;sdSteerZ+=joyVec.y;}
            var sdSteerLen=Math.sqrt(sdSteerX*sdSteerX+sdSteerZ*sdSteerZ);
            if(sdSteerLen>0.1){
                sdSteerX/=sdSteerLen;sdSteerZ/=sdSteerLen;
                // Blend steering into dash direction (turn rate)
                var turnRate=0.06;
                playerEgg._dashDirX+=(sdSteerX-playerEgg._dashDirX)*turnRate;
                playerEgg._dashDirZ+=(sdSteerZ-playerEgg._dashDirZ)*turnRate;
                var ddl=Math.sqrt(playerEgg._dashDirX*playerEgg._dashDirX+playerEgg._dashDirZ*playerEgg._dashDirZ)||1;
                playerEgg._dashDirX/=ddl;playerEgg._dashDirZ/=ddl;
            }
            // Apply dash velocity
            playerEgg.vx=playerEgg._dashDirX*_spinDashSpeed;
            playerEgg.vz=playerEgg._dashDirZ*_spinDashSpeed;
            // No speed decay — constant speed until bar depletes
            // Show spin dash progress bar
            var sdBarPct=_spinDashTimer/_spinDashTimerMax;
            if(!_spinDashBar){_spinDashBar=_createSpinDashBar();scene.add(_spinDashBar);}
            _spinDashBar.visible=true;
            _spinDashBar.position.set(playerEgg.mesh.position.x,playerEgg.mesh.position.y+2.8,playerEgg.mesh.position.z);
            _drawSpinDashBar(_spinDashBar,sdBarPct);
            // Spin the egg body rapidly
            playerEgg.mesh.rotation.x+=0.6;
            playerEgg.squash=1.0; // keep normal scale — no sinking
            // Keep egg on ground during spin dash
            if(playerEgg.mesh.position.y<0.6)playerEgg.mesh.position.y=0.6;
            playerEgg.vy=0;playerEgg.onGround=true;
            // Spawn ground dust while dashing
            if(_spinDashTimer%2===0)_spawnGroundDust(playerEgg.mesh.position.x,playerEgg.mesh.position.y,playerEgg.mesh.position.z,0.4);
            // Hit NPCs while spin dashing — knock them away
            for(var sdi=0;sdi<allEggs.length;sdi++){
                var sde=allEggs[sdi];
                if(sde===playerEgg||!sde.alive||sde.heldBy)continue;
                var sddx=sde.mesh.position.x-playerEgg.mesh.position.x;
                var sddz=sde.mesh.position.z-playerEgg.mesh.position.z;
                var sddy=sde.mesh.position.y-playerEgg.mesh.position.y;
                var sdd=Math.sqrt(sddx*sddx+sddz*sddz+sddy*sddy);
                // Only hit NPCs at similar height (within 1.5 units vertically on flat cities)
                if(currentCityStyle!==5&&Math.abs(sddy)>1.5)continue;
                if(sdd<2.5&&sdd>0.01){
                    var sdForce=_spinDashSpeed*2;
                    sde.vx+=sddx/sdd*sdForce;sde.vy+=0.2+sdForce*0.3;sde.vz+=sddz/sdd*sdForce;
                    sde.throwTimer=20;sde._bounces=1;sde.squash=0.4;
                    sde._stunTimer=Math.floor(40+_spinDashSpeed*200);
                    playHitSound();
                    _dropNpcStolenCoins(sde);
                }
            }
            // Hit city props while spin dashing — knock them away
            for(var sdpi=0;sdpi<cityProps.length;sdpi++){
                var sdp=cityProps[sdpi];
                if(sdp.grabbed)continue;
                var spdx=sdp.group.position.x-playerEgg.mesh.position.x;
                var spdz=sdp.group.position.z-playerEgg.mesh.position.z;
                var spdy=sdp.group.position.y-playerEgg.mesh.position.y;
                if(currentCityStyle!==5&&Math.abs(spdy)>1.5)continue;
                var spdd=Math.sqrt(spdx*spdx+spdz*spdz+spdy*spdy);
                if(spdd<3.0&&spdd>0.01){
                    var spForce=_spinDashSpeed*1.5;
                    sdp.throwVx=spdx/spdd*spForce;sdp.throwVy=0.15+spForce*0.2;sdp.throwVz=spdz/spdd*spForce;
                    sdp.throwTimer=30;sdp._bounces=2;
                    playHitSound();
                }
            }
        }
    }
    // Charge jump: release Space within 0.3s = normal jump, hold past 0.3s = charge mode
    var _onGroundOrGrace=playerEgg.onGround;
    if(!playerEgg.onGround&&_jumpCharging){
        if(!playerEgg._chargeGrace)playerEgg._chargeGrace=0;
        playerEgg._chargeGrace++;
        if(playerEgg._chargeGrace<=8)_onGroundOrGrace=true;
    } else {
        playerEgg._chargeGrace=0;
    }
    if(!playerEgg._spaceHoldFrames)playerEgg._spaceHoldFrames=0;
    var _chargeDelay=18; // 0.3s at 60fps
    if(keys['Space']&&_onGroundOrGrace){
        // Charge jump works while holding (needed for body slam combo)
        playerEgg._spaceHoldFrames++;
        // After 0.3s hold, enter charge mode (no instant jump)
        if(playerEgg._spaceHoldFrames>=_chargeDelay&&!_jumpCharging){
            _jumpCharging=true;_jumpCharge=0;_chargeBeepTimer=0;_chargeHoldTimer=0;
        }
        if(_jumpCharging){
            if(_jumpCharge<_jumpChargeMax){
                _jumpCharge=Math.min(_jumpCharge+1,_jumpChargeMax);
                var pct=_jumpCharge/_jumpChargeMax;
                var beepInterval=Math.max(3,Math.floor(15-pct*12));
                _chargeBeepTimer++;
                if(_chargeBeepTimer>=beepInterval){_chargeBeepTimer=0;_playChargeBeep(pct);}
                if(_jumpCharge%4===0)_spawnButtSmoke(playerEgg,pct);
            } else {
                _chargeHoldTimer++;
                _chargeBeepTimer++;
                if(_chargeBeepTimer>=3){_chargeBeepTimer=0;_playChargeBeep(0.8+0.2*Math.random());}
                if(_chargeHoldTimer%3===0)_spawnButtSmoke(playerEgg,1.0);
                if(_chargeHoldTimer>=_chargeHoldMax){
                    _jumpCharge=0;_jumpCharging=false;_chargeHoldTimer=0;
                }
            }
        }
    }
    if(!keys['Space']||!_onGroundOrGrace){
        if(_onGroundOrGrace){
            if(_jumpCharging&&_jumpCharge>0){
                // Release from charge mode → charged jump
                var pct2=_jumpCharge/_jumpChargeMax;
                var jumpF=JUMP_FORCE*(1.6+pct2*2.4);
                playerEgg.vy=jumpF;
                playerEgg.squash=0.65-pct2*0.2;
                playJumpSound();
                if(pct2>0.15)_spawnGroundDust(playerEgg.mesh.position.x,playerEgg.mesh.position.y,playerEgg.mesh.position.z,pct2);
                _ascendSmoke=true;_ascendSmokePct=pct2;
            } else if(!_jumpCharging&&playerEgg._spaceHoldFrames>0&&playerEgg._spaceHoldFrames<_chargeDelay){
                // Released before 0.3s → normal tap jump
                playerEgg.vy=JUMP_FORCE*1.5;
                playerEgg.squash=0.65;playJumpSound();
            }
        }
        _jumpCharging=false;_jumpCharge=0;_chargeHoldTimer=0;
        if(!keys['Space']){playerEgg._spaceHoldFrames=0;}
    }
    _updateChargeBar();
    // Ascending butt smoke while rising from charged jump
    if(_ascendSmoke&&playerEgg.vy>0&&!playerEgg.onGround){
        _spawnButtSmoke(playerEgg,_ascendSmokePct*0.7);
    }
    if(_ascendSmoke&&playerEgg.vy<=0&&!playerEgg.onGround){
        _ascendSmoke=false;
    }
    if(!_spinDashing){
        const spd=Math.sqrt(playerEgg.vx*playerEgg.vx+playerEgg.vz*playerEgg.vz);
        var curMax=MAX_SPEED*speedMul;
        if(spd>curMax&&!playerEgg._hondaDash){playerEgg.vx=(playerEgg.vx/spd)*curMax;playerEgg.vz=(playerEgg.vz/spd)*curMax;}
    }
    // Grab / Throw (F key)
    if(playerEgg.grabCD>0) playerEgg.grabCD--;
    if(!playerEgg._fHoldFrames)playerEgg._fHoldFrames=0;
    if(!playerEgg._throwCharging)playerEgg._throwCharging=false;
    var _throwChargeDelay=18; // 0.3s at 60fps
    var _throwChargeMax=60; // 1 second max charge
    var _holdingSomething=playerEgg.holding||playerEgg.holdingProp||playerEgg.holdingObs;
    // Normal state check — block all new moves during any special move
    var _inSpecialMove=!!(playerEgg._tatsuActive||playerEgg._shoryuActive||playerEgg._piledriverTarget||playerEgg._bodySlam||_spinDashing||playerEgg._hyakuretsuTimer);
    // Track F press (blocked during special moves)
    if(keys['KeyF']&&!playerEgg._fWasDown&&playerEgg.grabCD<=0&&!_inSpecialMove){
        // ---- Body Slam (Kirby): holding NPC + in air + holding down + press F ----
        if(playerEgg.holding&&!playerEgg.onGround&&(keys['KeyS']||keys['ArrowDown'])){
            var _bsHeld=playerEgg.holding;
            _bsHeld.heldBy=null;playerEgg.holding=null;
            if(_bsHeld.struggleBar){_bsHeld.mesh.remove(_bsHeld.struggleBar);_bsHeld.struggleBar=null;}
            // Slam down fast
            playerEgg.vy=-0.6;playerEgg.vx*=0.1;playerEgg.vz*=0.1;
            playerEgg._bodySlam=true;playerEgg._bodySlamTarget=_bsHeld;
            playerEgg._bodySlamStartY=playerEgg.mesh.position.y; // track height for damage
            // Place held NPC below player
            _bsHeld.mesh.position.set(playerEgg.mesh.position.x,playerEgg.mesh.position.y-1.5,playerEgg.mesh.position.z);
            _bsHeld.vy=-0.6;_bsHeld.vx=0;_bsHeld.vz=0;
            playerEgg.grabCD=30;
            playThrowSound();
            playerEgg._fPressStart=false;playerEgg._fHoldFrames=0;playerEgg._fWasDown=true;
        }
        // ---- Piledriver (Zangief): left-right-left-F ----
        else if(playerEgg._piledriverReady&&playerEgg.onGround&&!playerEgg.holding&&!playerEgg.holdingProp&&!playerEgg.holdingObs){
            var _pdTarget=null;
            var _pdDist=2.5;
            for(var _pdi=0;_pdi<allEggs.length;_pdi++){
                var _pde=allEggs[_pdi];if(_pde===playerEgg||!_pde.alive||_pde.heldBy||_pde._piledriverLocked)continue;
                var _pddx=_pde.mesh.position.x-playerEgg.mesh.position.x;
                var _pddz=_pde.mesh.position.z-playerEgg.mesh.position.z;
                var _pdd=Math.sqrt(_pddx*_pddx+_pddz*_pddz);
                if(_pdd<_pdDist){_pdDist=_pdd;_pdTarget=_pde;}
            }
            if(_pdTarget){
                playerEgg._piledriverTarget=_pdTarget;
                playerEgg._piledriverPhase=0;
                _pdTarget._piledriverLocked=true;
                playerEgg.grabCD=40;
                playGrabSound();
                playerEgg._fPressStart=false;playerEgg._fHoldFrames=0;playerEgg._fWasDown=true;
                playerEgg._piledriverReady=false;
            } else {
                playerEgg._fPressStart=true;playerEgg._fHoldFrames=0;
                playerEgg._throwCharging=false;playerEgg._throwCharge=0;playerEgg._justGrabbed=false;
            }
        }
        else {
        playerEgg._fPressStart=true;
        playerEgg._fHoldFrames=0;
        playerEgg._throwCharging=false;
        playerEgg._throwCharge=0;
        playerEgg._justGrabbed=false;
        }
    }
    // Count hold frames while F is down (skip during special moves)
    if(keys['KeyF']&&!playerEgg._piledriverTarget&&!_inSpecialMove){
        playerEgg._fHoldFrames++;
        // Charge throw: holding something + held past 0.3s
        if(_holdingSomething&&playerEgg._fHoldFrames>=_throwChargeDelay){
            playerEgg._throwCharging=true;
            playerEgg._throwCharge=Math.min((playerEgg._throwCharge||0)+1,_throwChargeMax);
        }
    }
    // F released (skip during special moves)
    if(!keys['KeyF']&&playerEgg._fWasDown&&!playerEgg._piledriverTarget&&!_inSpecialMove){
        if(playerEgg._throwCharging&&_holdingSomething&&!playerEgg._justGrabbed){
            // Charge throw release → power throw
            var dir=playerEgg.mesh.rotation.y;
            var chargePct=(playerEgg._throwCharge||0)/_throwChargeMax;
            var throwMul=1+chargePct*4;
            if(playerEgg.holding){
                var held=playerEgg.holding;
                held.heldBy=null; playerEgg.holding=null; if(held.struggleBar){held.mesh.remove(held.struggleBar);held.struggleBar=null;}
                held.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir)*2, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir)*2);
                var tw=held.weight||1.0;var tf=0.5/tw*throwMul;held.vx=Math.sin(dir)*tf;held.vy=0.05+chargePct*0.25;held.vz=Math.cos(dir)*tf;held._throwTotal=80+Math.floor(chargePct*100);held.throwTimer=held._throwTotal;held._bounces=2+Math.floor(chargePct*2);held._chargeDrag=0.985+chargePct*0.01;
                held.squash=0.5; playerEgg.grabCD=20;
                playThrowSound();
                held._dropCoinsOnLand=true;held._coinsDropped=false;
            } else if(playerEgg.holdingProp){
                var prop=playerEgg.holdingProp;
                playerEgg.holdingProp=null;
                var pw=prop.weight||1.0;var pf=2.5/pw*throwMul;prop.throwVx=Math.sin(dir)*pf;prop.throwVy=0.18+chargePct*0.25;prop.throwVz=Math.cos(dir)*pf;prop._bounces=2+Math.floor(chargePct*2);prop.throwTimer=25+Math.floor(chargePct*60);prop._chargeDrag=0.98-chargePct*0.02;
                prop.group.position.set(playerEgg.mesh.position.x+Math.sin(dir)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir)*1.5);
                playerEgg.grabCD=20; playThrowSound();
            } else if(playerEgg.holdingObs){
                var obs=playerEgg.holdingObs;
                playerEgg.holdingObs=null;
                obs._grabbed=false;
                obs.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir)*1.5);
                var ow=obs._weight||2.0;var of2=4.5/ow*throwMul;obs._throwVx=Math.sin(dir)*of2;obs._throwVy=0.18+chargePct*0.25;obs._throwVz=Math.cos(dir)*of2;obs._throwTimer=Math.floor((50+20/ow)*(1+chargePct*1.5));obs._bounces=2+Math.floor(chargePct*2);obs._chargeDrag=0.98-chargePct*0.02;
                playerEgg.grabCD=20; playThrowSound();
            }
        } else if(_holdingSomething&&!playerEgg._justGrabbed&&playerEgg._fHoldFrames<_throwChargeDelay&&playerEgg._fHoldFrames>0){
            // Quick tap F while holding → normal throw (separate press from grab)
            if(playerEgg.holdingProp){
                var prop=playerEgg.holdingProp;
                playerEgg.holdingProp=null;
                var dir1=playerEgg.mesh.rotation.y;
                var pw=prop.weight||1.0;var pf=2.5/pw;prop.throwVx=Math.sin(dir1)*pf;prop.throwVy=0.18;prop.throwVz=Math.cos(dir1)*pf;prop._bounces=2;prop.throwTimer=25;prop._chargeDrag=0;
                prop.group.position.set(playerEgg.mesh.position.x+Math.sin(dir1)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir1)*1.5);
                playerEgg.grabCD=20; playThrowSound();
            } else if(playerEgg.holdingObs){
                var obs=playerEgg.holdingObs;
                playerEgg.holdingObs=null;
                obs._grabbed=false;
                var dir0=playerEgg.mesh.rotation.y;
                obs.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir0)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir0)*1.5);
                var ow=obs._weight||2.0;var of2=4.5/ow;obs._throwVx=Math.sin(dir0)*of2;obs._throwVy=0.18;obs._throwVz=Math.cos(dir0)*of2;obs._throwTimer=Math.floor(50+20/ow);obs._bounces=2;
                playerEgg.grabCD=20; playThrowSound();
            } else if(playerEgg.holding){
                var held2=playerEgg.holding;
                held2.heldBy=null; playerEgg.holding=null; if(held2.struggleBar){held2.mesh.remove(held2.struggleBar);held2.struggleBar=null;}
                var dir2=playerEgg.mesh.rotation.y;
                held2.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir2)*2, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir2)*2);
                var tw2=held2.weight||1.0;var tf2=0.4/tw2;held2.vx=Math.sin(dir2)*tf2;held2.vy=0.15;held2.vz=Math.cos(dir2)*tf2;held2._throwTotal=80;held2.throwTimer=80;held2._bounces=2;held2._chargeDrag=0.992;
                held2.squash=0.5; playerEgg.grabCD=20;
                playThrowSound();
                held2._dropCoinsOnLand=true;held2._coinsDropped=false;
            }
        }
        playerEgg._throwCharging=false;playerEgg._throwCharge=0;playerEgg._fHoldFrames=0;playerEgg._fPressStart=false;
    }
    // Grab on first press (only when not holding anything)
    if(playerEgg._fPressStart&&!_holdingSomething&&playerEgg.grabCD<=0){
        playerEgg._fPressStart=false;
        var nearest=null, nearDist=2.5;
        for(var ei=0;ei<allEggs.length;ei++){
            var e=allEggs[ei];
            if(e===playerEgg||!e.alive||e.heldBy)continue;
            var dx2=e.mesh.position.x-playerEgg.mesh.position.x;
            var dz2=e.mesh.position.z-playerEgg.mesh.position.z;
            var d2=Math.sqrt(dx2*dx2+dz2*dz2);
            if(d2<nearDist){nearDist=d2;nearest=e;}
        }
        if(nearest){
            playerEgg.holding=nearest; nearest.heldBy=playerEgg;
            // Drop any prop the grabbed NPC was holding
            if(nearest.holdingProp){nearest.holdingProp.grabbed=false;nearest.holdingProp=null;}
            nearest.struggleMax=300+Math.floor(Math.random()*240); nearest.struggleTimer=nearest.struggleMax;
            playerEgg.grabCD=20; playGrabSound();
            playerEgg._justGrabbed=true;
        } else {
            var nearObs=null, nearObsDist=3.0;
            for(var oi=0;oi<obstacleObjects.length;oi++){
                var ob=obstacleObjects[oi];
                if(ob._grabbed)continue;
                if(ob.type==='spinner'||ob.type==='pendulum'||ob.type==='conveyor'||ob.type==='platform')continue;
                var ox=ob.mesh.position.x-playerEgg.mesh.position.x;
                var oz=ob.mesh.position.z-playerEgg.mesh.position.z;
                var od=Math.sqrt(ox*ox+oz*oz);
                if(od<nearObsDist){nearObsDist=od;nearObs=ob;}
            }
            if(nearObs){
                playerEgg.holdingObs=nearObs;
                nearObs._grabbed=true;nearObs._weight=(nearObs.type==='bumper'?1.5:nearObs.type==='fallingBlock'?2.5:2.0);
                nearObs._origPos={x:nearObs.mesh.position.x,y:nearObs.mesh.position.y,z:nearObs.mesh.position.z};
                nearObs._throwTimer=0;nearObs._throwVx=0;nearObs._throwVy=0;nearObs._throwVz=0;
                nearObs.mesh.rotation.set(0,0,0);
                playerEgg.grabCD=20; playGrabSound();
                playerEgg._justGrabbed=true;
            } else if(gameState==='city'){
                var nearProp=null, nearPropDist=3.0;
                for(var cpi=0;cpi<cityProps.length;cpi++){
                        var cpp=cityProps[cpi];
                        if(cpp.grabbed)continue;
                        var cpx=cpp.group.position.x-playerEgg.mesh.position.x;
                        var cpz=cpp.group.position.z-playerEgg.mesh.position.z;
                        var cpd=Math.sqrt(cpx*cpx+cpz*cpz);
                        if(cpd<nearPropDist){nearPropDist=cpd;nearProp=cpp;}
                    }
                    if(nearProp){
                        playerEgg.holdingProp=nearProp;
                        nearProp.grabbed=true;
                        nearProp.throwTimer=0;nearProp.throwVx=0;nearProp.throwVy=0;nearProp.throwVz=0;
                        nearProp.group.rotation.set(0,0,0);
                        playerEgg.grabCD=20; playGrabSound();
                        playerEgg._justGrabbed=true;
                    }
            }
        }
    }
    // Show charge throw bar while charging
    if(playerEgg._throwCharging&&_holdingSomething){
        var chPct=(playerEgg._throwCharge||0)/60;
        if(chPct>0.01){
            if(!playerEgg._throwChargeBar){
                var tc=document.createElement('canvas');tc.width=128;tc.height=16;
                var ttex=new THREE.CanvasTexture(tc);
                playerEgg._throwChargeBar=new THREE.Sprite(new THREE.SpriteMaterial({map:ttex,transparent:true}));
                playerEgg._throwChargeBar.scale.set(2,0.3,1);
                scene.add(playerEgg._throwChargeBar);
            }
            playerEgg._throwChargeBar.visible=true;
            playerEgg._throwChargeBar.position.set(playerEgg.mesh.position.x,playerEgg.mesh.position.y+3.2,playerEgg.mesh.position.z);
            var tctx=playerEgg._throwChargeBar.material.map.image.getContext('2d');
            tctx.clearRect(0,0,128,16);
            tctx.fillStyle='rgba(0,0,0,0.5)';tctx.fillRect(0,0,128,16);
            var grd=tctx.createLinearGradient(0,0,128*chPct,0);
            grd.addColorStop(0,'#FF4444');grd.addColorStop(1,'#FFAA00');
            tctx.fillStyle=grd;tctx.fillRect(2,2,124*chPct,12);
            playerEgg._throwChargeBar.material.map.needsUpdate=true;
        }
    } else {
        if(playerEgg._throwChargeBar){playerEgg._throwChargeBar.visible=false;}
    }
    // ---- Punch (R) / Kick (T) — Kunio-kun style with visible limbs ----
    // Block all combat input during any special move
    if(_inSpecialMove){
        playerEgg._rWasDown=!!keys['KeyR'];
        playerEgg._tWasDown=!!keys['KeyT'];
    } else {
    // Light hits = hitstun flinch (NO stun stars), combo finisher/aerial = knockdown fly
    if(!playerEgg._comboCount)playerEgg._comboCount=0;
    if(!playerEgg._comboTimer)playerEgg._comboTimer=0;
    if(!playerEgg._attackCD)playerEgg._attackCD=0;
    if(playerEgg._attackCD>0)playerEgg._attackCD--;
    if(playerEgg._comboTimer>0)playerEgg._comboTimer--;
    if(playerEgg._comboTimer<=0)playerEgg._comboCount=0;
    // Attack limb animation timer
    if(!playerEgg._atkAnim)playerEgg._atkAnim=0;
    if(playerEgg._atkAnim>0&&!playerEgg._shoryuActive&&!playerEgg._tatsuActive){
        playerEgg._atkAnim--;
        if(playerEgg._atkAnim<=0){
            var _ud=playerEgg.mesh.userData;
            if(_ud.rightArm){_ud.rightArm.visible=false;_ud.rightArm.scale.set(1,1,1);_ud.rightArm.position.set(0.4,0.2,0.7);}
            if(_ud.leftArm){_ud.leftArm.visible=false;_ud.leftArm.scale.set(1,1,1);_ud.leftArm.position.set(-0.4,0.2,0.7);}
            if(_ud.rightLeg){_ud.rightLeg.visible=false;_ud.rightLeg.position.set(0.22,0.1,0.5);_ud.rightLeg.rotation.x=-Math.PI/3;}
            if(_ud.leftLeg){_ud.leftLeg.visible=false;_ud.leftLeg.position.set(-0.22,0.1,0.5);_ud.leftLeg.rotation.x=-Math.PI/3;}
            if(_ud.body)_ud.body.rotation.x=0; // reset headbutt
        }
    }
    // Zangief Double Lariat — R+T held together (checked before normal R press)
    var _ct=playerEgg.mesh.userData._charType||'egg';
    if(playerEgg._lariatReady&&playerEgg._attackCD<=0&&!playerEgg.holding&&!playerEgg._tatsuActive){
        playerEgg._comboCount=0;playerEgg._attackCD=40;playerEgg._lariatReady=false;
        playerEgg._tatsuActive=60;playerEgg._tatsuDir=playerEgg.mesh.rotation.y;
        playerEgg._atkAnim=62;playerEgg.squash=0.9;
        _shoutMove(playerEgg,'Double Lariat!');
    }
    // Punch (R) — character-specific special moves on command input
    if(keys['KeyR']&&!playerEgg._rWasDown&&playerEgg._attackCD<=0&&!playerEgg.holding){
        var _isHadou=playerEgg._hadouReady&&!window._playerHadouken;
        var _isShoryu=playerEgg._shoryuReady;
        // ---- HONDA: always Hyakuretsu (百裂掌) on normal punch ----
        if(_ct==='pig'&&!_isHadou&&!_isShoryu&&!playerEgg._bfReady){
            _shoutMove(playerEgg,'Hyakuretsu!');
            playerEgg._comboCount=0;playerEgg._attackCD=4;
            // Start continuous slap state
            if(!playerEgg._hyakuretsuTimer)playerEgg._hyakuretsuTimer=0;
            playerEgg._hyakuretsuTimer=60;
            playerEgg._hyakuretsuTick=0;
            playerEgg.vx=0;playerEgg.vz=0;
            playerEgg.squash=0.88;
        }
        // ---- RAPID-PRESS SPECIALS FIRST (priority over command inputs) ----
        else if(playerEgg._rapidRReady&&_ct==='pig'){
            playerEgg._comboCount=0;playerEgg._attackCD=1;playerEgg._rapidR=2;
            if(!playerEgg._slapSide)playerEgg._slapSide=0;
            playerEgg._slapSide=(playerEgg._slapSide+1)%3;
            var _slapY=[0.4,0.15,-0.1][playerEgg._slapSide];
            var _sArm=(playerEgg._slapSide%2===0)?playerEgg.mesh.userData.rightArm:playerEgg.mesh.userData.leftArm;
            var _sArmOther=(playerEgg._slapSide%2===0)?playerEgg.mesh.userData.leftArm:playerEgg.mesh.userData.rightArm;
            if(_sArm){_sArm.visible=true;_sArm.position.set((playerEgg._slapSide%2===0)?0.35:-0.35,_slapY,3.0);_sArm.scale.set(1.5,1.5,1.5);}
            if(_sArmOther){_sArmOther.visible=true;_sArmOther.position.set((playerEgg._slapSide%2===0)?-0.2:0.2,_slapY+0.1,1.5);_sArmOther.scale.set(1.2,1.2,1.2);}
            playerEgg._atkAnim=2;
            var _hsDir=playerEgg.mesh.rotation.y;
            playerEgg.vx+=Math.sin(_hsDir)*0.04;playerEgg.vz+=Math.cos(_hsDir)*0.04;
            for(var _hsi=0;_hsi<allEggs.length;_hsi++){
                var _hse=allEggs[_hsi];if(_hse===playerEgg||!_hse.alive||_hse.heldBy)continue;
                var _hsdx=_hse.mesh.position.x-playerEgg.mesh.position.x;
                var _hsdz=_hse.mesh.position.z-playerEgg.mesh.position.z;
                if(Math.sqrt(_hsdx*_hsdx+_hsdz*_hsdz)<3.5){_hse.vx+=_hsdx*0.1;_hse.vz+=_hsdz*0.1;_hse._hitStun=6;_dropNpcStolenCoins(_hse);playHitSound();}
            }
            playerEgg.squash=0.88;
        } else if(playerEgg._rapidRReady&&_ct==='cat'){
            // ELECTRIC THUNDER (Blanka) — infinite while mashing
            _shoutMove(playerEgg,'ELECTRIC!');
            playerEgg._comboCount=0;playerEgg._attackCD=2;playerEgg._rapidR=2;
            playerEgg._blankaShock=25;playerEgg.squash=0.6;
            if(sfxEnabled){var _beCtx=ensureAudio();if(_beCtx){var _bet=_beCtx.currentTime;var _beo=_beCtx.createOscillator();var _beg=_beCtx.createGain();_beo.type='square';_beo.frequency.setValueAtTime(800,_bet);_beo.frequency.linearRampToValueAtTime(2000,_bet+0.1);_beg.gain.setValueAtTime(0.08,_bet);_beg.gain.exponentialRampToValueAtTime(0.001,_bet+0.3);_beo.connect(_beg);_beg.connect(_beCtx.destination);_beo.start(_bet);_beo.stop(_bet+0.3);}}
        }
        // ---- COMMAND INPUT SPECIALS ----
        else if(_isHadou&&(_ct==='egg'||_ct==='dog')){
            // HADOUKEN (Ryu blue, Ken red)
            _shoutMove(playerEgg,_ct==='dog'?'Hadouken!':'HADOUKEN!');
            playerEgg._comboCount=0;playerEgg._attackCD=25;playerEgg._hadouReady=false;
            var _hDir=playerEgg.mesh.rotation.y;
            var _hx=playerEgg.mesh.position.x+Math.sin(_hDir)*1.5;
            var _hz=playerEgg.mesh.position.z+Math.cos(_hDir)*1.5;
            var _hy=playerEgg.mesh.position.y+0.7;
            var _hColor=_ct==='dog'?0xFF4444:0x44AAFF; // Ken=red, Ryu=blue
            var _hBall=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,6),new THREE.MeshBasicMaterial({color:_hColor,transparent:true,opacity:0.85}));
            _hBall.position.set(_hx,_hy,_hz);scene.add(_hBall);
            var _hRing=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.08,6,12),new THREE.MeshBasicMaterial({color:_ct==='dog'?0xFFAA66:0x88DDFF,transparent:true,opacity:0.6}));
            _hRing.position.copy(_hBall.position);scene.add(_hRing);
            window._playerHadouken={ball:_hBall,ring:_hRing,vx:Math.sin(_hDir)*0.35,vz:Math.cos(_hDir)*0.35,life:120,owner:playerEgg};
            playerEgg._atkAnim=15;playerEgg.squash=0.8;
            if(sfxEnabled){var _hCtx=ensureAudio();if(_hCtx){var _ht=_hCtx.currentTime;var _ho=_hCtx.createOscillator();var _hg=_hCtx.createGain();_ho.type='sine';_ho.frequency.setValueAtTime(300,_ht);_ho.frequency.exponentialRampToValueAtTime(150,_ht+0.3);_hg.gain.setValueAtTime(0.1,_ht);_hg.gain.exponentialRampToValueAtTime(0.001,_ht+0.35);_ho.connect(_hg);_hg.connect(_hCtx.destination);_ho.start(_ht);_ho.stop(_ht+0.35);}}
        } else if(_isHadou&&_ct==='cockroach'){
            // YOGA FIRE (Dhalsim) — slow fireball
            _shoutMove(playerEgg,'Yoga Fire!');
            playerEgg._comboCount=0;playerEgg._attackCD=30;playerEgg._hadouReady=false;
            var _yfDir=playerEgg.mesh.rotation.y;
            var _yfBall=new THREE.Mesh(new THREE.SphereGeometry(0.35,8,6),new THREE.MeshBasicMaterial({color:0xFF6600,transparent:true,opacity:0.9}));
            _yfBall.position.set(playerEgg.mesh.position.x+Math.sin(_yfDir)*1.5,playerEgg.mesh.position.y+0.7,playerEgg.mesh.position.z+Math.cos(_yfDir)*1.5);scene.add(_yfBall);
            var _yfRing=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.06,6,12),new THREE.MeshBasicMaterial({color:0xFFAA00,transparent:true,opacity:0.5}));
            _yfRing.position.copy(_yfBall.position);scene.add(_yfRing);
            window._playerHadouken={ball:_yfBall,ring:_yfRing,vx:Math.sin(_yfDir)*0.2,vz:Math.cos(_yfDir)*0.2,life:180,owner:playerEgg};
            playerEgg._atkAnim=15;playerEgg.squash=0.8;
        } else if(_isHadou&&(_ct==='rooster')){
            // SONIC BOOM (Guile) — ↓→+R fast projectile
            playerEgg._comboCount=0;playerEgg._attackCD=20;playerEgg._hadouReady=false;
            var _sbDir=playerEgg.mesh.rotation.y;
            var _sbColor=_ct==='rooster'?0x44FF44:0xFF8800;
            var _sbBall=new THREE.Mesh(new THREE.SphereGeometry(_ct==='cat'?0.6:0.3,8,6),new THREE.MeshBasicMaterial({color:_sbColor,transparent:true,opacity:0.85}));
            _sbBall.position.set(playerEgg.mesh.position.x+Math.sin(_sbDir)*1.5,playerEgg.mesh.position.y+0.7,playerEgg.mesh.position.z+Math.cos(_sbDir)*1.5);scene.add(_sbBall);
            var _sbRing=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.06,6,12),new THREE.MeshBasicMaterial({color:_sbColor,transparent:true,opacity:0.5}));
            _sbRing.position.copy(_sbBall.position);scene.add(_sbRing);
            window._playerHadouken={ball:_sbBall,ring:_sbRing,vx:Math.sin(_sbDir)*(_ct==='cat'?0.45:0.5),vz:Math.cos(_sbDir)*(_ct==='cat'?0.45:0.5),life:100,owner:playerEgg};
            playerEgg._atkAnim=12;playerEgg.squash=0.85;
        } else if(playerEgg._bfReady&&_ct==='pig'){
            // SUMO HEADBUTT (E.Honda) — ←→+R, half speed, double duration for same distance
            _shoutMove(playerEgg,'Dosukoi!');
            playerEgg._comboCount=0;playerEgg._attackCD=70;playerEgg._bfReady=false;playerEgg._bfSeq=0; // 70 frames = ~1.2s total cooldown
            var _shDir=playerEgg.mesh.rotation.y;
            playerEgg.vx=Math.sin(_shDir)*MAX_SPEED*2;playerEgg.vz=Math.cos(_shDir)*MAX_SPEED*2;
            playerEgg._dashDirX=Math.sin(_shDir)*MAX_SPEED*2;playerEgg._dashDirZ=Math.cos(_shDir)*MAX_SPEED*2;
            playerEgg._dashFaceY=_shDir; // remember original facing for after bounce
            playerEgg._hondaDash=60;playerEgg._atkAnim=62;playerEgg.squash=0.55;
            // Head tilt forward
            var _hBody=playerEgg.mesh.userData.body;
            if(_hBody)_hBody.rotation.x=-0.6;
        } else if(_isShoryu&&(_ct==='egg'||_ct==='dog')){
            // SHORYUKEN (Ryu/Ken) — Ryu: diagonal up-forward, Ken: flies further
            _shoutMove(playerEgg,_ct==='dog'?'Shoryuken!':'SHORYUKEN!');
            playerEgg._comboCount=0;playerEgg._attackCD=30;playerEgg._shoryuReady=false;
            var _shFaceDir=playerEgg.mesh.rotation.y;
            var _shFwd=_ct==='dog'?0.45:0.25; // Ken flies 3x further forward than Ryu
            playerEgg.vy=JUMP_FORCE*(_ct==='dog'?2.0:1.6);
            playerEgg.vx=Math.sin(_shFaceDir)*_shFwd;
            playerEgg.vz=Math.cos(_shFaceDir)*_shFwd;
            playerEgg.squash=0.5;
            playerEgg._shoryuActive=_ct==='dog'?85:65; // Ken lasts longer
            if(sfxEnabled){var _sCtx=ensureAudio();if(_sCtx){var _st=_sCtx.currentTime;var _so=_sCtx.createOscillator();var _sg=_sCtx.createGain();_so.type='sawtooth';_so.frequency.setValueAtTime(200,_st);_so.frequency.exponentialRampToValueAtTime(1200,_st+0.2);_so.frequency.exponentialRampToValueAtTime(800,_st+0.35);_sg.gain.setValueAtTime(0.12,_st);_sg.gain.exponentialRampToValueAtTime(0.001,_st+0.4);_so.connect(_sg);_sg.connect(_sCtx.destination);_so.start(_st);_so.stop(_st+0.4);}}
            playJumpSound();
        } else if(_isShoryu&&_ct==='rooster'){
            // SOMERSAULT KICK (Guile) — backflip kick
            playerEgg._comboCount=0;playerEgg._attackCD=30;playerEgg._shoryuReady=false;
            playerEgg.vy=JUMP_FORCE*1.8;playerEgg.squash=0.5;
            playerEgg._shoryuActive=50; // reuse shoryuActive for rising attack
            playJumpSound();
        } else if(_isShoryu&&_ct==='cat'){
            // ELECTRIC THUNDER (Blanka) — shock nearby enemies
            _shoutMove(playerEgg,'ELECTRIC!');
            playerEgg._comboCount=0;playerEgg._attackCD=25;playerEgg._shoryuReady=false;
            playerEgg._blankaShock=30;playerEgg.squash=0.6;
            if(sfxEnabled){var _bsCtx2=ensureAudio();if(_bsCtx2){var _bst3=_bsCtx2.currentTime;var _bso2=_bsCtx2.createOscillator();var _bsg2=_bsCtx2.createGain();_bso2.type='square';_bso2.frequency.setValueAtTime(800,_bst3);_bso2.frequency.linearRampToValueAtTime(2000,_bst3+0.1);_bso2.frequency.linearRampToValueAtTime(400,_bst3+0.3);_bsg2.gain.setValueAtTime(0.08,_bst3);_bsg2.gain.exponentialRampToValueAtTime(0.001,_bst3+0.35);_bso2.connect(_bsg2);_bsg2.connect(_bsCtx2.destination);_bso2.start(_bst3);_bso2.stop(_bst3+0.35);}}
        } else if(_isShoryu&&_ct==='monkey'){
            // Chun-Li has no shoryuken — fall through to default
            playerEgg._comboCount=0;playerEgg._attackCD=30;playerEgg._shoryuReady=false;
            playerEgg.vy=JUMP_FORCE*1.5;playerEgg.squash=0.5;
            playerEgg._shoryuActive=60;
            playJumpSound();
        } else if(_isShoryu){
            // Default: Shoryuken for any character
            playerEgg._comboCount=0;playerEgg._attackCD=30;playerEgg._shoryuReady=false;
            playerEgg.vy=JUMP_FORCE*1.5;playerEgg.squash=0.5;
            playerEgg._shoryuActive=60;
            playJumpSound();
        } else if(_isHadou&&(_ct==='rooster'||_ct==='monkey')&&!window._playerHadouken){
            // SONIC BOOM (Guile) / 気功拳 (Chun-Li) — ↓→+R
            _shoutMove(playerEgg,_ct==='monkey'?'Kikouken!':'Sonic Boom!');
            playerEgg._comboCount=0;playerEgg._attackCD=20;playerEgg._chargeBack=0;
            var _sbDir2=playerEgg.mesh.rotation.y;
            var _sbColor2=_ct==='monkey'?0x88BBFF:0x44FF44;
            var _sbBall2=new THREE.Mesh(new THREE.SphereGeometry(_ct==='monkey'?0.5:0.3,8,6),new THREE.MeshBasicMaterial({color:_sbColor2,transparent:true,opacity:0.85}));
            _sbBall2.position.set(playerEgg.mesh.position.x+Math.sin(_sbDir2)*1.5,playerEgg.mesh.position.y+0.7,playerEgg.mesh.position.z+Math.cos(_sbDir2)*1.5);scene.add(_sbBall2);
            var _sbRing2=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.06,6,12),new THREE.MeshBasicMaterial({color:0x88FF88,transparent:true,opacity:0.5}));
            _sbRing2.position.copy(_sbBall2.position);scene.add(_sbRing2);
            window._playerHadouken={ball:_sbBall2,ring:_sbRing2,vx:Math.sin(_sbDir2)*0.5,vz:Math.cos(_sbDir2)*0.5,life:100,owner:playerEgg};
            playerEgg._atkAnim=12;playerEgg.squash=0.85;
        } else if(playerEgg._bfReady&&(_ct==='cat')){
            // ROLLING ATTACK (Blanka) — ←→+R, ball roll 12 body-lengths
            _shoutMove(playerEgg,'GRAAAH!');
            playerEgg._comboCount=0;playerEgg._attackCD=35;playerEgg._bfReady=false;playerEgg._bfSeq=0;
            var _raDir=playerEgg.mesh.rotation.y;
            playerEgg.vx=Math.sin(_raDir)*MAX_SPEED*3;playerEgg.vz=Math.cos(_raDir)*MAX_SPEED*3;
            playerEgg._dashDirX=Math.sin(_raDir)*MAX_SPEED*3;playerEgg._dashDirZ=Math.cos(_raDir)*MAX_SPEED*3;
            playerEgg._hondaDash=80;playerEgg._atkAnim=82;playerEgg.squash=0.5;
            playerEgg._blankaRoll=true; // flag for bounce-back on hit
        } else {
        // Normal punch combo
        playerEgg._comboCount++;playerEgg._comboTimer=25;playerEgg._attackCD=8;
        var _punchArm=(playerEgg._comboCount%2===1)?playerEgg.mesh.userData.rightArm:playerEgg.mesh.userData.leftArm;
        if(_punchArm){_punchArm.visible=true;_punchArm.position.set(_punchArm===playerEgg.mesh.userData.rightArm?0.3:-0.3,0.2,0.9);_punchArm.scale.set(1.3,1.3,1.3);}
        playerEgg._atkAnim=8;
        var _atkDir=playerEgg.mesh.rotation.y;
        var _isFinisher=(playerEgg._comboCount>=3)&&_ct!=='pig'&&_ct!=='cat'; // Honda/Blanka skip finisher (use rapid-press instead)
        var _isAerial=!playerEgg.onGround;
        // Finisher visual: show both arms or headbutt
        if(_isFinisher){
            var _finType=Math.floor(Math.random()*3); // 0=big punch, 1=headbutt, 2=tail whip
            var _fud=playerEgg.mesh.userData;
            if(_finType===0){
                // Big punch — both arms forward
                if(_fud.rightArm){_fud.rightArm.visible=true;_fud.rightArm.position.set(0.2,0.85,0.9);_fud.rightArm.scale.set(1.5,1.2,2);}
                if(_fud.leftArm){_fud.leftArm.visible=true;_fud.leftArm.position.set(-0.2,0.85,0.9);_fud.leftArm.scale.set(1.5,1.2,2);}
            } else if(_finType===1){
                // Headbutt — body lunge forward
                if(_fud.body)_fud.body.rotation.x=-0.5;
            }
            // Tail whip: just extra squash
            playerEgg._atkAnim=14;
        }
        for(var _ai=0;_ai<allEggs.length;_ai++){
            var _ae=allEggs[_ai];if(_ae===playerEgg||!_ae.alive||_ae.heldBy)continue;
            if(_ae._slamImmune>0)continue;
            var _adx=_ae.mesh.position.x-playerEgg.mesh.position.x;
            var _adz=_ae.mesh.position.z-playerEgg.mesh.position.z;
            var _ad=Math.sqrt(_adx*_adx+_adz*_adz);
            if(_ad<2.5*playerEgg._extendedRange&&_ad>0.01){
                var _aAngle=Math.atan2(_adx,_adz);
                var _aDiff=Math.abs(_aAngle-_atkDir);if(_aDiff>Math.PI)_aDiff=Math.PI*2-_aDiff;
                if(_aDiff<Math.PI/3){
                    if(_isFinisher||_isAerial){
                        var _kf=0.4+(_isAerial?0.2:0);
                        _ae.vx+=_adx/_ad*_kf;_ae.vz+=_adz/_ad*_kf;
                        _ae.vy=_isAerial?0.25:0.2;
                        _ae.squash=0.4;_ae.throwTimer=30;_ae._bounces=1;
                        _ae._stunTimer=Math.floor(40+(_isAerial?30:0));
                    } else {
                        _ae.vx+=_adx/_ad*0.08;_ae.vz+=_adz/_ad*0.08;
                        _ae.squash=0.78;_ae._hitStun=12;
                    }
                    _dropNpcStolenCoins(_ae);playHitSound();
                }
            }
        }
        playerEgg.squash=_isFinisher?0.75:0.88;
        // Punch swing sound
        if(sfxEnabled){var _pCtx=ensureAudio();if(_pCtx){var _pt2=_pCtx.currentTime;
            var _po=_pCtx.createOscillator();var _pg=_pCtx.createGain();
            _po.type='sawtooth';_po.frequency.setValueAtTime(_isFinisher?400:600,_pt2);_po.frequency.exponentialRampToValueAtTime(200,_pt2+0.08);
            _pg.gain.setValueAtTime(0.06,_pt2);_pg.gain.exponentialRampToValueAtTime(0.001,_pt2+0.1);
            _po.connect(_pg);_pg.connect(_pCtx.destination);_po.start(_pt2);_po.stop(_pt2+0.1);
        }}
        if(_isFinisher){playerEgg._comboCount=0;playerEgg._attackCD=18;}
        }
    }
    // Kick (T) — character-specific kick specials
    if(keys['KeyT']&&!playerEgg._tWasDown&&playerEgg._attackCD<=0&&!playerEgg.holding){
        var _isTatsu=playerEgg._tatsuReady;
        // RAPID-PRESS KICK SPECIALS FIRST
        if(playerEgg._rapidTReady&&_ct==='monkey'){
            // 百裂脚 (Chun-Li) — infinite while mashing
            playerEgg._comboCount=0;playerEgg._attackCD=2;playerEgg._rapidT=3;
            var _rlDir=playerEgg.mesh.rotation.y;
            for(var _rli=0;_rli<allEggs.length;_rli++){
                var _rle=allEggs[_rli];if(_rle===playerEgg||!_rle.alive||_rle.heldBy)continue;
                var _rldx=_rle.mesh.position.x-playerEgg.mesh.position.x;
                var _rldz=_rle.mesh.position.z-playerEgg.mesh.position.z;
                var _rld=Math.sqrt(_rldx*_rldx+_rldz*_rldz);
                if(_rld<3){_rle.vx+=_rldx/_rld*0.15;_rle.vz+=_rldz/_rld*0.15;_rle._hitStun=8;_dropNpcStolenCoins(_rle);playHitSound();}
            }
            playerEgg.squash=0.85;playerEgg._atkAnim=6;
        }
        // Character-specific kick specials
        else if(_isTatsu&&(_ct==='egg'||_ct==='dog')){
            // TATSUMAKI (Ryu/Ken)
            _shoutMove(playerEgg,'Tatsumaki Senpukyaku!');
            playerEgg._comboCount=0;playerEgg._attackCD=40;playerEgg._tatsuReady=false;
            playerEgg.vy=0.1; // slight hop
            playerEgg._tatsuActive=94; // 12 full rotations at 0.8 rad/frame
            playerEgg._tatsuDir=playerEgg.mesh.rotation.y; // store facing direction
            // Show both legs extended
            var _tud=playerEgg.mesh.userData;
            if(_tud.rightLeg){_tud.rightLeg.visible=true;_tud.rightLeg.position.set(0.3,0.15,0.6);_tud.rightLeg.rotation.x=-Math.PI/2;}
            if(_tud.leftLeg){_tud.leftLeg.visible=true;_tud.leftLeg.position.set(-0.3,0.15,0.6);_tud.leftLeg.rotation.x=-Math.PI/2;}
            playerEgg._atkAnim=96;
            // Tatsumaki sound — spinning whoosh
            if(sfxEnabled){var _tCtx=ensureAudio();if(_tCtx){var _tt=_tCtx.currentTime;
                var _to=_tCtx.createOscillator();var _tg2=_tCtx.createGain();
                _to.type='sawtooth';_to.frequency.setValueAtTime(150,_tt);_to.frequency.linearRampToValueAtTime(400,_tt+0.3);_to.frequency.linearRampToValueAtTime(150,_tt+0.6);
                _tg2.gain.setValueAtTime(0.08,_tt);_tg2.gain.linearRampToValueAtTime(0.12,_tt+0.3);_tg2.gain.exponentialRampToValueAtTime(0.001,_tt+1.5);
                _to.connect(_tg2);_tg2.connect(_tCtx.destination);_to.start(_tt);_to.stop(_tt+1.5);
            }}
        } else if(_isTatsu&&_ct==='monkey'){
            // SPINNING BIRD KICK (Chun-Li) — ↓←+T
            playerEgg._comboCount=0;playerEgg._attackCD=35;playerEgg._tatsuReady=false;
            playerEgg.vy=JUMP_FORCE*1.2;
            playerEgg._tatsuActive=60;playerEgg._tatsuDir=playerEgg.mesh.rotation.y;
            playerEgg._atkAnim=62;
            _shoutMove(playerEgg,'Spinning Bird Kick!');
        } else if(_isTatsu&&(_ct==='rooster')){
            // SOMERSAULT KICK (Guile) — ↓←+T
            playerEgg._comboCount=0;playerEgg._attackCD=35;playerEgg._tatsuReady=false;
            playerEgg.vy=JUMP_FORCE*2.0;playerEgg.squash=0.5;
            playerEgg._shoryuActive=50;
            playJumpSound();
            _shoutMove(playerEgg,'Somersault Kick!');
        } else {
        // Normal kick
        playerEgg._comboCount++;playerEgg._comboTimer=25;playerEgg._attackCD=12;
        var _kickLeg=(playerEgg._comboCount%2===1)?playerEgg.mesh.userData.rightLeg:playerEgg.mesh.userData.leftLeg;
        if(_kickLeg){_kickLeg.visible=true;_kickLeg.position.z=0.7;_kickLeg.rotation.x=-Math.PI/2.5;}
        playerEgg._atkAnim=10;
        var _kDir=playerEgg.mesh.rotation.y;
        var _kFinisher=(playerEgg._comboCount>=3)&&_ct!=='monkey'; // Chun-Li skips finisher (use rapid-press instead)
        var _kAerial=!playerEgg.onGround;
        if(_kFinisher){
            // Finisher kick: show both legs
            var _kud=playerEgg.mesh.userData;
            if(_kud.rightLeg){_kud.rightLeg.visible=true;_kud.rightLeg.position.z=0.8;_kud.rightLeg.rotation.x=-Math.PI/2;}
            if(_kud.leftLeg){_kud.leftLeg.visible=true;_kud.leftLeg.position.z=0.8;_kud.leftLeg.rotation.x=-Math.PI/2;}
            playerEgg._atkAnim=14;
        }
        for(var _ki=0;_ki<allEggs.length;_ki++){
            var _ke=allEggs[_ki];if(_ke===playerEgg||!_ke.alive||_ke.heldBy)continue;
            if(_ke._slamImmune>0)continue;
            var _kdx=_ke.mesh.position.x-playerEgg.mesh.position.x;
            var _kdz=_ke.mesh.position.z-playerEgg.mesh.position.z;
            var _kd=Math.sqrt(_kdx*_kdx+_kdz*_kdz);
            if(_kd<3.0*playerEgg._extendedRange&&_kd>0.01){
                var _kAngle=Math.atan2(_kdx,_kdz);
                var _kDiff=Math.abs(_kAngle-_kDir);if(_kDiff>Math.PI)_kDiff=Math.PI*2-_kDiff;
                if(_kDiff<Math.PI/3){
                    if(_kFinisher||_kAerial){
                        var _kkf=0.5+(_kAerial?0.25:0);
                        _ke.vx+=_kdx/_kd*_kkf;_ke.vz+=_kdz/_kd*_kkf;
                        _ke.vy=_kAerial?0.3:0.25;
                        _ke.squash=0.3;_ke.throwTimer=45;_ke._bounces=2;
                        _ke._stunTimer=Math.floor(60+(_kAerial?40:0));
                    } else {
                        _ke.vx+=_kdx/_kd*0.12;_ke.vz+=_kdz/_kd*0.12;
                        _ke.squash=0.72;_ke._hitStun=15;
                    }
                    _dropNpcStolenCoins(_ke);playHitSound();
                }
            }
        }
        playerEgg.squash=_kFinisher?0.7:0.82;
        // Kick swing sound
        if(sfxEnabled){var _kCtx=ensureAudio();if(_kCtx){var _kt2=_kCtx.currentTime;
            var _ko=_kCtx.createOscillator();var _kg2=_kCtx.createGain();
            _ko.type='sawtooth';_ko.frequency.setValueAtTime(_kFinisher?300:500,_kt2);_ko.frequency.exponentialRampToValueAtTime(150,_kt2+0.1);
            _kg2.gain.setValueAtTime(0.07,_kt2);_kg2.gain.exponentialRampToValueAtTime(0.001,_kt2+0.12);
            _ko.connect(_kg2);_kg2.connect(_kCtx.destination);_ko.start(_kt2);_ko.stop(_kt2+0.12);
        }}
        if(_kFinisher){playerEgg._comboCount=0;playerEgg._attackCD=22;}
        } // end normal kick (else from tatsu)
    }
    playerEgg._rWasDown=!!keys['KeyR'];
    playerEgg._tWasDown=!!keys['KeyT'];
    } // end combat block (else from _inSpecialMove)
    // ---- Shoryuken fist (world-space, not child of egg) ----
    if(playerEgg._shoryuActive>0){
        if(!window._shoryuFist){
            window._shoryuFist=new THREE.Mesh(new THREE.SphereGeometry(0.25,8,6),toon(0xFFFFFF));
            scene.add(window._shoryuFist);
        }
        window._shoryuFist.visible=true;
        var _sfDir=playerEgg.mesh.rotation.y;
        window._shoryuFist.position.set(
            playerEgg.mesh.position.x+Math.sin(_sfDir)*0.5,
            playerEgg.mesh.position.y+1.8,
            playerEgg.mesh.position.z+Math.cos(_sfDir)*0.5
        );
        playerEgg.mesh.rotation.y+=0.12;
        // ---- Shoryuken Dragon (visual only) ----
        if(!window._shoryuDragon){
            window._shoryuDragon=[];
            var _sdMat=new THREE.MeshBasicMaterial({color:0x44BBFF,transparent:true,opacity:0.8});
            var _sdMatHead=new THREE.MeshBasicMaterial({color:0xFFDD44,transparent:true,opacity:0.9});
            for(var _sdi=0;_sdi<16;_sdi++){
                var _sdSize=_sdi===0?0.6:0.45-_sdi*0.018;
                var _sdSeg=new THREE.Mesh(new THREE.SphereGeometry(Math.max(_sdSize,0.12),8,6),_sdi===0?_sdMatHead:_sdMat);
                _sdSeg.visible=false;scene.add(_sdSeg);
                window._shoryuDragon.push(_sdSeg);
            }
        }
        // Store start position on first frame only
        if(!playerEgg._shoryuStartSet){
            playerEgg._shoryuStartSet=true;
            playerEgg._shoryuStartX=playerEgg.mesh.position.x;
            playerEgg._shoryuStartY=playerEgg.mesh.position.y;
            playerEgg._shoryuStartZ=playerEgg.mesh.position.z;
        }
        for(var _sdj=0;_sdj<window._shoryuDragon.length;_sdj++){
            var _sdSeg2=window._shoryuDragon[_sdj];
            _sdSeg2.visible=true;
            var _sdAngle=_sfDir+_sdj*0.6+playerEgg._shoryuActive*0.15;
            var _sdR=1.2+_sdj*0.06;
            // Lerp between current pos (head) and start pos (tail)
            var _sdLerp=_sdj/window._shoryuDragon.length;
            var _sdPx=playerEgg.mesh.position.x*(1-_sdLerp)+playerEgg._shoryuStartX*_sdLerp;
            var _sdPy=playerEgg.mesh.position.y*(1-_sdLerp)+playerEgg._shoryuStartY*_sdLerp;
            var _sdPz=playerEgg.mesh.position.z*(1-_sdLerp)+playerEgg._shoryuStartZ*_sdLerp;
            _sdSeg2.position.set(
                _sdPx+Math.sin(_sdAngle)*_sdR,
                _sdPy+0.5,
                _sdPz+Math.cos(_sdAngle)*_sdR
            );
        }
        if(playerEgg._shoryuActive<55&&(playerEgg.vy<=0||playerEgg.onGround)){
            playerEgg._shoryuActive=0;
            playerEgg._shoryuStartSet=false;
            window._shoryuFist.visible=false;
            if(window._shoryuDragon)for(var _sdk=0;_sdk<window._shoryuDragon.length;_sdk++)window._shoryuDragon[_sdk].visible=false;
        } else {
            playerEgg._shoryuActive--;
            if(playerEgg._shoryuActive<=0)playerEgg._shoryuActive=0;
        }
    } else {
        if(window._shoryuFist)window._shoryuFist.visible=false;
        if(window._shoryuDragon)for(var _sdl=0;_sdl<window._shoryuDragon.length;_sdl++)window._shoryuDragon[_sdl].visible=false;
    }
    // ---- Tatsumaki animation (runs even during special move) ----
    if(playerEgg._tatsuActive>0){
        playerEgg._tatsuActive--;
        playerEgg.mesh.rotation.y+=0.8;
        if(!playerEgg._tatsuDir)playerEgg._tatsuDir=playerEgg.mesh.rotation.y;
        var _tFwd=1.5;var _tVert=0;
        if(keys['KeyW']||keys['ArrowUp'])_tVert=0.04;
        if(keys['KeyS']||keys['ArrowDown'])_tVert=-0.03;
        var _tSteer=0;
        if(keys['KeyA']||keys['ArrowLeft'])_tSteer=0.03;
        if(keys['KeyD']||keys['ArrowRight'])_tSteer=-0.03;
        playerEgg._tatsuDir+=_tSteer;
        playerEgg.vx=Math.sin(playerEgg._tatsuDir)*MAX_SPEED*_tFwd;
        playerEgg.vz=Math.cos(playerEgg._tatsuDir)*MAX_SPEED*_tFwd;
        playerEgg.vy=_tVert;
        if(playerEgg.mesh.position.y<0.5)playerEgg.mesh.position.y=0.5;
        // ---- Tatsumaki Dragon (visual only, wraps around legs) ----
        if(!window._tatsuDragon){
            window._tatsuDragon=[];
            var _tdMat=new THREE.MeshBasicMaterial({color:0xFF6644,transparent:true,opacity:0.6});
            var _tdMatHead=new THREE.MeshBasicMaterial({color:0xFFDD44,transparent:true,opacity:0.85});
            for(var _tdi=0;_tdi<14;_tdi++){
                var _tdSize=_tdi===0?0.45:0.35-_tdi*0.012;
                var _tdSeg=new THREE.Mesh(new THREE.SphereGeometry(Math.max(_tdSize,0.1),6,4),_tdi===0?_tdMatHead:_tdMat);
                _tdSeg.visible=false;scene.add(_tdSeg);
                window._tatsuDragon.push(_tdSeg);
            }
        }
        var _ttPhase=playerEgg.mesh.rotation.y;
        for(var _ttj=0;_ttj<window._tatsuDragon.length;_ttj++){
            var _ttSeg=window._tatsuDragon[_ttj];
            _ttSeg.visible=true;
            var _ttAngle=_ttPhase-_ttj*0.5;
            var _ttR=1.2+_ttj*0.08;
            var _ttY=playerEgg.mesh.position.y-0.2+Math.sin(_ttAngle*0.5+_ttj*0.4)*0.4;
            _ttSeg.position.set(
                playerEgg.mesh.position.x+Math.sin(_ttAngle)*_ttR,
                _ttY,
                playerEgg.mesh.position.z+Math.cos(_ttAngle)*_ttR
            );
        }
        for(var _ti=0;_ti<allEggs.length;_ti++){
            var _te=allEggs[_ti];if(_te===playerEgg||!_te.alive||_te.heldBy)continue;
            if(_te._slamImmune>0)continue;
            if(!_te._tatsuHitCD)_te._tatsuHitCD=0;
            if(_te._tatsuHitCD>0){_te._tatsuHitCD--;continue;}
            var _tdx=_te.mesh.position.x-playerEgg.mesh.position.x;
            var _tdz=_te.mesh.position.z-playerEgg.mesh.position.z;
            var _td=Math.sqrt(_tdx*_tdx+_tdz*_tdz);
            if(_td<3&&_td>0.01){
                _te.vx+=_tdx/_td*0.25;_te.vz+=_tdz/_td*0.25;_te.vy=0.12;
                _te.squash=0.55;_te._hitStun=8;_te._tatsuHitCD=8;
                _dropNpcStolenCoins(_te);playHitSound();
            }
        }
        if(playerEgg._tatsuActive<=0){
            playerEgg.vx*=0.3;playerEgg.vz*=0.3;playerEgg._tatsuDir=0;
            if(window._tatsuDragon)for(var _ttk=0;_ttk<window._tatsuDragon.length;_ttk++)window._tatsuDragon[_ttk].visible=false;
        }
    } else {
        if(window._tatsuDragon)for(var _ttl=0;_ttl<window._tatsuDragon.length;_ttl++)window._tatsuDragon[_ttl].visible=false;
    }
    // ---- Honda Hyakuretsu continuous animation ----
    if(!playerEgg._hyakuretsuTimer)playerEgg._hyakuretsuTimer=0;
    if(playerEgg._hyakuretsuTimer>0){
        playerEgg._hyakuretsuTimer--;
        if(!playerEgg._hyakuretsuTick)playerEgg._hyakuretsuTick=0;
        playerEgg._hyakuretsuTick++;
        // Pressing R again extends the duration (no gap)
        if(keys['KeyR']){
            playerEgg._hyakuretsuTimer=Math.max(playerEgg._hyakuretsuTimer,30);
            playerEgg._attackCD=0; // allow immediate re-trigger if timer runs out
        }
        // Animate arms: cycle every 3 frames, upper/mid/lower
        var _hSlot=Math.floor(playerEgg._hyakuretsuTick/3)%3;
        var _hSlapY=[0.45,0.2,-0.05][_hSlot];
        var _hUseRight=(Math.floor(playerEgg._hyakuretsuTick/3)%2===0);
        var _hArmA=_hUseRight?playerEgg.mesh.userData.rightArm:playerEgg.mesh.userData.leftArm;
        var _hArmB=_hUseRight?playerEgg.mesh.userData.leftArm:playerEgg.mesh.userData.rightArm;
        // Smooth extend/retract within 3-frame cycle
        var _hFrame=playerEgg._hyakuretsuTick%3;
        var _hExtend=_hFrame===0?1.8:(_hFrame===1?1.4:0.6); // extend, hold, retract
        var _hZ=_hFrame===0?1.8:(_hFrame===1?1.5:0.8); // z=1.8 at full extend (2/5 of 4.5)
        if(_hArmA){_hArmA.visible=true;_hArmA.position.set(_hUseRight?0.35:-0.35,_hSlapY,_hZ);_hArmA.scale.set(_hExtend,_hExtend,_hExtend);}
        if(_hArmB){_hArmB.visible=false;} // hide the other arm
        // Stop player movement, only allow manual forward creep
        playerEgg.vx*=0.3;playerEgg.vz*=0.3;
        var _hFaceDir=playerEgg.mesh.rotation.y;
        var _hmx=0,_hmz=0;
        if(keys['KeyA']||keys['ArrowLeft'])_hmx-=1;
        if(keys['KeyD']||keys['ArrowRight'])_hmx+=1;
        if(keys['KeyW']||keys['ArrowUp'])_hmz-=1;
        if(keys['KeyS']||keys['ArrowDown'])_hmz+=1;
        if(joyActive){_hmx+=joyVec.x;_hmz+=joyVec.y;}
        var _hInputDot=_hmx*Math.sin(_hFaceDir)+_hmz*Math.cos(_hFaceDir);
        if(_hInputDot>0.2){
            playerEgg.vx+=Math.sin(_hFaceDir)*MOVE_ACCEL*0.3;
            playerEgg.vz+=Math.cos(_hFaceDir)*MOVE_ACCEL*0.3;
        }
        // Hit detection
        if(playerEgg._hyakuretsuTick%3===0){
            for(var _hhi=0;_hhi<allEggs.length;_hhi++){
                var _hhe=allEggs[_hhi];if(_hhe===playerEgg||!_hhe.alive||_hhe.heldBy)continue;
                var _hhdx=_hhe.mesh.position.x-playerEgg.mesh.position.x;
                var _hhdz=_hhe.mesh.position.z-playerEgg.mesh.position.z;
                if(Math.sqrt(_hhdx*_hhdx+_hhdz*_hhdz)<2.5){_hhe.vx+=_hhdx*0.08;_hhe.vz+=_hhdz*0.08;_hhe._hitStun=5;_dropNpcStolenCoins(_hhe);playHitSound();}
            }
        }
        playerEgg.squash=0.85+Math.sin(playerEgg._hyakuretsuTick*0.8)*0.05;
        // End: hide arms
        if(playerEgg._hyakuretsuTimer<=0){
            var _hud2=playerEgg.mesh.userData;
            if(_hud2.rightArm){_hud2.rightArm.visible=false;_hud2.rightArm.scale.set(1,1,1);}
            if(_hud2.leftArm){_hud2.leftArm.visible=false;_hud2.leftArm.scale.set(1,1,1);}
        }
    }
    // ---- Blanka Electric Thunder ----
    if(playerEgg._blankaShock>0){
        playerEgg._blankaShock--;
        playerEgg.mesh.rotation.z=Math.sin(Date.now()*0.05)*0.3;
        for(var _bsi=0;_bsi<allEggs.length;_bsi++){
            var _bse=allEggs[_bsi];if(_bse===playerEgg||!_bse.alive||_bse.heldBy)continue;
            var _bsdx=_bse.mesh.position.x-playerEgg.mesh.position.x;
            var _bsdz=_bse.mesh.position.z-playerEgg.mesh.position.z;
            if(Math.sqrt(_bsdx*_bsdx+_bsdz*_bsdz)<3){
                _bse.vx+=_bsdx*0.1;_bse.vz+=_bsdz*0.1;_bse.vy=0.1;
                _bse.squash=0.6;_bse._hitStun=6;
                _dropNpcStolenCoins(_bse);if(_bse.isPlayer)playHitSound();
            }
        }
        if(playerEgg._blankaShock<=0)playerEgg.mesh.rotation.z=0;
    }
    // ---- Honda/Blanka Dash Attack (constant speed each frame) ----
    if(playerEgg._hondaDash>0){
        playerEgg._hondaDash--;
        // Maintain constant dash speed (override friction)
        if(playerEgg._dashDirX!==undefined){
            playerEgg.vx=playerEgg._dashDirX;playerEgg.vz=playerEgg._dashDirZ;
        }
        // Honda headbutt: face-down head-forward torpedo (consistent in all directions)
        if(!playerEgg._blankaRoll){
            if(playerEgg._dashDirX!==undefined){
                playerEgg.mesh.rotation.y=Math.atan2(playerEgg._dashDirX,playerEgg._dashDirZ);
                playerEgg.mesh.rotation.x=0;playerEgg.mesh.rotation.z=0;
                // Torpedo: stretch forward + tilt face down
                playerEgg.mesh.scale.set(1,0.5,2.0);
                var _htB=playerEgg.mesh.userData.body;
                if(_htB)_htB.rotation.x=Math.PI/2.5; // tilt face toward ground
            }
            playerEgg.mesh.position.y=Math.max(playerEgg.mesh.position.y,1.5);
        }
        // Blanka rolls visually
        if(playerEgg._blankaRoll)playerEgg.mesh.rotation.x+=0.6;
        for(var _hdi=0;_hdi<allEggs.length;_hdi++){
            var _hde=allEggs[_hdi];if(_hde===playerEgg||!_hde.alive||_hde.heldBy)continue;
            var _hddx=_hde.mesh.position.x-playerEgg.mesh.position.x;
            var _hddz=_hde.mesh.position.z-playerEgg.mesh.position.z;
            if(Math.sqrt(_hddx*_hddx+_hddz*_hddz)<2.5){
                _hde.vx+=playerEgg.vx*0.5;_hde.vz+=playerEgg.vz*0.5;_hde.vy=0.2;
                _hde.squash=0.4;_hde.throwTimer=30;_hde._bounces=1;_hde._stunTimer=50;
                _dropNpcStolenCoins(_hde);playHitSound();
                // Bounce back on hit — reverse, land, recover
                playerEgg._dashDirX*=-0.3;playerEgg._dashDirZ*=-0.3;
                playerEgg.vx=playerEgg._dashDirX;playerEgg.vz=playerEgg._dashDirZ;
                playerEgg._hondaDash=0;playerEgg._dashBounceTimer=30;
                playerEgg.vy=0.1; // small hop on bounce
            }
        }
        // Building collision bounce during dash
        for(var _dci=0;_dci<cityColliders.length;_dci++){
            var _dc=cityColliders[_dci];
            var _ddx=playerEgg.mesh.position.x-_dc.x,_ddz=playerEgg.mesh.position.z-_dc.z;
            if(Math.abs(_ddx)<_dc.hw+1&&Math.abs(_ddz)<_dc.hd+1&&playerEgg.mesh.position.y<(_dc.h||6)){
                playerEgg._dashDirX*=-0.3;playerEgg._dashDirZ*=-0.3;
                playerEgg.vx=playerEgg._dashDirX;playerEgg.vz=playerEgg._dashDirZ;
                playerEgg._hondaDash=0;playerEgg.vy=0.1;playerEgg._dashBounceTimer=30;
                playHitSound();break;
            }
        }
        if(playerEgg._hondaDash<=0){playerEgg.vx*=0.2;playerEgg.vz*=0.2;playerEgg._blankaRoll=false;
            // Restore original facing direction after bounce
            if(playerEgg._dashFaceY!==undefined)playerEgg.mesh.rotation.y=playerEgg._dashFaceY;
            playerEgg._dashDirX=undefined;playerEgg._dashDirZ=undefined;playerEgg._dashFaceY=undefined;
            playerEgg.mesh.rotation.x=0;
            playerEgg.mesh.scale.set(1,1,1); // reset torpedo shape
            var _hdBody=playerEgg.mesh.userData.body;if(_hdBody)_hdBody.rotation.x=0;
        }
    }
    // ---- Special move input trackers ----
    // Detect horizontal direction presses (keyboard + joystick)
    var _joyL=joyActive&&joyVec.x<-0.3;
    var _joyR=joyActive&&joyVec.x>0.3;
    var _joyD=joyActive&&joyVec.y>0.3;
    var _hLeft=(keys['KeyA']||keys['ArrowLeft']||_joyL);
    var _hRight=(keys['KeyD']||keys['ArrowRight']||_joyR);
    var _hDown=(keys['KeyS']||keys['ArrowDown']||_joyD);
    var _hLeftPress=_hLeft&&!playerEgg._prevHLeft;
    var _hRightPress=_hRight&&!playerEgg._prevHRight;
    var _hDownPress=_hDown&&!playerEgg._prevHDown;
    var _joyU=joyActive&&joyVec.y<-0.3;
    var _hUp=(keys['KeyW']||keys['ArrowUp']||_joyU);
    var _hUpPress=_hUp&&!playerEgg._prevHUp;
    // ---- Shoryuken: 下+上+R (down then up + punch) ----
    if(!playerEgg._shoryuSeq)playerEgg._shoryuSeq=0;
    if(!playerEgg._shoryuTimer)playerEgg._shoryuTimer=0;
    playerEgg._shoryuTimer--;
    if(_hDownPress&&playerEgg._shoryuSeq===0){
        playerEgg._shoryuSeq=1;playerEgg._shoryuTimer=30;
    } else if(_hUpPress&&playerEgg._shoryuSeq===1){
        playerEgg._shoryuSeq=2;playerEgg._shoryuTimer=30;playerEgg._shoryuReady=true;
    }
    if(playerEgg._shoryuTimer<=0){playerEgg._shoryuSeq=0;playerEgg._shoryuReady=false;}
    // ---- Back-Forward+R (Honda headbutt, Blanka roll): relative to facing ----
    if(!playerEgg._bfSeq)playerEgg._bfSeq=0;
    if(!playerEgg._bfTimer)playerEgg._bfTimer=0;
    playerEgg._bfTimer--;
    // Determine "forward" and "back" based on facing direction
    var _faceY=playerEgg.mesh.rotation.y;
    var _faceSinY=Math.sin(_faceY),_faceCosY=Math.cos(_faceY);
    // Project current input direction onto facing axis
    var _inputX=(_hLeft?-1:0)+(_hRight?1:0);
    var _inputZ=(_hDown?1:0)+(keys['KeyW']||keys['ArrowUp']?-1:0);
    var _inputDot=_inputX*_faceSinY+_inputZ*_faceCosY; // positive=forward, negative=back
    var _inputBack=(_inputDot<-0.3);
    var _inputFwd=(_inputDot>0.3);
    var _inputBackPress=_inputBack&&!playerEgg._prevBfBack;
    var _inputFwdPress=_inputFwd&&!playerEgg._prevBfFwd;
    if(_inputBackPress&&playerEgg._bfSeq===0){
        playerEgg._bfSeq=1;playerEgg._bfTimer=30;
    } else if(_inputFwdPress&&playerEgg._bfSeq===1){
        playerEgg._bfSeq=2;playerEgg._bfTimer=30;playerEgg._bfReady=true;
    }
    if(playerEgg._bfTimer<=0){playerEgg._bfSeq=0;playerEgg._bfReady=false;}
    playerEgg._prevBfBack=_inputBack;playerEgg._prevBfFwd=_inputFwd;
    // ---- Tatsumaki (旋风腿): 後+前+T (back-forward-kick) ----
    playerEgg._tatsuReady=playerEgg._bfReady;
    // ---- Hadouken (波動拳): 後+前+R (back-forward-punch) ----
    playerEgg._hadouReady=playerEgg._bfReady;
    playerEgg._prevHLeft=_hLeft;playerEgg._prevHRight=_hRight;playerEgg._prevHDown=_hDown;playerEgg._prevHUp=_hUp;
    // ---- Simple command inputs for charge characters (no actual charging needed) ----
    // Sonic Boom / 気功拳: use ←→+R (same as hadouken = bf)
    playerEgg._chargeForwardReady=playerEgg._bfReady;
    // Somersault / Spinning Bird: use ←→+T (same as tatsumaki = bf)
    playerEgg._chargeUpReady=playerEgg._bfReady;
    // ---- Rapid press detection (Chun-Li/Honda/Blanka) ----
    if(!playerEgg._rapidR)playerEgg._rapidR=0;
    if(!playerEgg._rapidT)playerEgg._rapidT=0;
    if(!playerEgg._rapidRTimer)playerEgg._rapidRTimer=0;
    if(!playerEgg._rapidTTimer)playerEgg._rapidTTimer=0;
    if(keys['KeyR']&&!playerEgg._rWasDown){playerEgg._rapidR++;playerEgg._rapidRTimer=60;}
    if(keys['KeyT']&&!playerEgg._tWasDown){playerEgg._rapidT++;playerEgg._rapidTTimer=60;}
    playerEgg._rapidRTimer--;playerEgg._rapidTTimer--;
    if(playerEgg._rapidRTimer<=0)playerEgg._rapidR=0;
    if(playerEgg._rapidTTimer<=0)playerEgg._rapidT=0;
    // Rapid R ready (3+ presses in 60 frames) — Honda 百裂張手 / Blanka Electric
    playerEgg._rapidRReady=(playerEgg._rapidR>=3);
    // Rapid T ready (3+ presses in 60 frames) — Chun-Li 百裂脚
    playerEgg._rapidTReady=(playerEgg._rapidT>=3);
    // ---- Dhalsim passive: extended attack range ----
    playerEgg._extendedRange=(_ct==='cockroach')?1.5:1.0;
    // ---- Zangief Double Lariat: R+T held together ----
    playerEgg._lariatReady=(keys['KeyR']&&keys['KeyT']&&_ct==='frog');
    // ---- Piledriver input sequence tracker (left-right-left) ----
    if(!playerEgg._pdSeq)playerEgg._pdSeq=0;
    if(!playerEgg._pdTimer)playerEgg._pdTimer=0;
    playerEgg._pdTimer--;
    var _leftPress=(keys['KeyA']||keys['ArrowLeft'])&&!(playerEgg._pdPrevLeft);
    var _rightPress=(keys['KeyD']||keys['ArrowRight'])&&!(playerEgg._pdPrevRight);
    if(_leftPress&&playerEgg._pdSeq===0){playerEgg._pdSeq=1;playerEgg._pdTimer=40;}
    else if(_rightPress&&playerEgg._pdSeq===1){playerEgg._pdSeq=2;playerEgg._pdTimer=40;}
    else if(_leftPress&&playerEgg._pdSeq===2){playerEgg._pdSeq=3;playerEgg._pdTimer=40;playerEgg._piledriverReady=true;}
    if(playerEgg._pdTimer<=0){playerEgg._pdSeq=0;playerEgg._piledriverReady=false;}
    playerEgg._pdPrevLeft=!!(keys['KeyA']||keys['ArrowLeft']);
    playerEgg._pdPrevRight=!!(keys['KeyD']||keys['ArrowRight']);
    // ---- Body Slam landing impact (height-based damage) ----
    if(playerEgg._bodySlam&&playerEgg.onGround){
        playerEgg._bodySlam=false;
        var _bst=playerEgg._bodySlamTarget;
        var _slamH=Math.max(1,(playerEgg._bodySlamStartY||3));
        var _slamPower=Math.min(_slamH/20,3); // 0-3 power scale based on height
        if(_bst&&_bst.alive){
            // Crush NPC: flatten + bounce away — stronger from higher
            _bst.mesh.position.set(playerEgg.mesh.position.x,0.1,playerEgg.mesh.position.z);
            _bst.squash=0.1+0.1/(1+_slamPower);
            var _bsDir=playerEgg.mesh.rotation.y+Math.PI*(Math.random()-0.5);
            var _bsForce=0.4+_slamPower*0.3;
            _bst.vx=Math.sin(_bsDir)*_bsForce;_bst.vy=0.3+_slamPower*0.2;_bst.vz=Math.cos(_bsDir)*_bsForce;
            _bst.throwTimer=40+Math.floor(_slamPower*20);_bst._bounces=2;
            _bst._stunTimer=Math.floor(60+_slamPower*80);
            _dropNpcStolenCoins(_bst);
            playHitSound();
            // Screen shake effect (camera wobble)
            if(playerEgg._bodySlamStartY>5){
                // Big impact: ground dust ring
                for(var _dri=0;_dri<8;_dri++){
                    var _dra=_dri/8*Math.PI*2;
                    _spawnGroundDust(playerEgg.mesh.position.x+Math.cos(_dra)*2,0,playerEgg.mesh.position.z+Math.sin(_dra)*2,0.5+_slamPower*0.3);
                }
            }
            // Player bounces up — higher from bigger slam + brief immunity
            playerEgg.vy=0.2+_slamPower*0.1;playerEgg.squash=0.4;
            playerEgg.throwTimer=0;playerEgg._stunTimer=0; // clear any stun
            playerEgg.grabCD=Math.max(playerEgg.grabCD,20);
            playerEgg._slamImmune=30; // 0.5s immunity from thrown NPC bounce-back
            _spawnGroundDust(playerEgg.mesh.position.x,0,playerEgg.mesh.position.z,0.6+_slamPower*0.4);
            // Body slam impact sound — heavy thud
            if(sfxEnabled){var _bsCtx=ensureAudio();if(_bsCtx){var _bst2=_bsCtx.currentTime;
                var _bso=_bsCtx.createOscillator();var _bsg=_bsCtx.createGain();
                _bso.type='sine';_bso.frequency.setValueAtTime(80+_slamPower*20,_bst2);_bso.frequency.exponentialRampToValueAtTime(30,_bst2+0.3);
                _bsg.gain.setValueAtTime(0.15,_bst2);_bsg.gain.exponentialRampToValueAtTime(0.001,_bst2+0.35);
                _bso.connect(_bsg);_bsg.connect(_bsCtx.destination);_bso.start(_bst2);_bso.stop(_bst2+0.35);
            }}
        }
        playerEgg._bodySlamTarget=null;playerEgg._bodySlamStartY=0;
    }
    // ---- Piledriver animation (direct position control) ----
    if(playerEgg._piledriverTarget){
        var _pdt=playerEgg._piledriverTarget;
        playerEgg._piledriverPhase++;
        var _pdStartX=playerEgg._pdStartX||(playerEgg._pdStartX=playerEgg.mesh.position.x);
        var _pdStartZ=playerEgg._pdStartZ||(playerEgg._pdStartZ=playerEgg.mesh.position.z);
        var _pdMaxY=15; // max height
        // Lock player horizontal position
        playerEgg.mesh.position.x=_pdStartX;playerEgg.mesh.position.z=_pdStartZ;
        playerEgg.vx=0;playerEgg.vz=0;playerEgg.vy=0;
        // Lock target to player
        _pdt.vx=0;_pdt.vy=0;_pdt.vz=0;
        _pdt.mesh.rotation.z=Math.PI;_pdt.mesh.rotation.y=playerEgg.mesh.rotation.y;
        if(playerEgg._piledriverPhase<=40){
            // Rise: linear interpolation to max height
            var _riseT=playerEgg._piledriverPhase/40;
            playerEgg.mesh.position.y=0.5+_riseT*_pdMaxY;
            playerEgg.mesh.rotation.y+=0.5;
            if(playerEgg._piledriverPhase%4===0)_spawnButtSmoke(playerEgg,0.6);
        } else if(playerEgg._piledriverPhase<=48){
            // Pause at top
            playerEgg.mesh.position.y=0.5+_pdMaxY;
            playerEgg.mesh.rotation.y+=0.6;
        } else if(playerEgg._piledriverPhase<=60){
            // Slam down: fast linear to ground
            var _slamT=(playerEgg._piledriverPhase-48)/12;
            playerEgg.mesh.position.y=0.5+_pdMaxY*(1-_slamT);
            playerEgg.mesh.rotation.y+=0.7;
        } else {
            // Impact
            playerEgg.mesh.position.y=0.5;
            _pdt._piledriverLocked=false;
            _pdt.mesh.position.set(_pdStartX,0.1,_pdStartZ);
            _pdt.mesh.rotation.z=0;_pdt.squash=0.1;
            var _pdBounceDir=Math.random()*Math.PI*2;
            _pdt.vx=Math.sin(_pdBounceDir)*0.8;_pdt.vy=0.5;_pdt.vz=Math.cos(_pdBounceDir)*0.8;
            _pdt.throwTimer=80;_pdt._bounces=3;_pdt._stunTimer=180;
            _dropNpcStolenCoins(_pdt);playHitSound();
            if(sfxEnabled){var _pdCtx=ensureAudio();if(_pdCtx){var _pdt2=_pdCtx.currentTime;
                var _pdo=_pdCtx.createOscillator();var _pdg=_pdCtx.createGain();
                _pdo.type='square';_pdo.frequency.setValueAtTime(120,_pdt2);_pdo.frequency.exponentialRampToValueAtTime(25,_pdt2+0.4);
                _pdg.gain.setValueAtTime(0.18,_pdt2);_pdg.gain.exponentialRampToValueAtTime(0.001,_pdt2+0.5);
                _pdo.connect(_pdg);_pdg.connect(_pdCtx.destination);_pdo.start(_pdt2);_pdo.stop(_pdt2+0.5);
            }}
            for(var _pddi=0;_pddi<12;_pddi++){
                var _pdda=_pddi/12*Math.PI*2;
                _spawnGroundDust(_pdStartX+Math.cos(_pdda)*2.5,0,_pdStartZ+Math.sin(_pdda)*2.5,0.8);
            }
            playerEgg.vy=0.2;playerEgg.squash=0.5;playerEgg.grabCD=40;playerEgg._slamImmune=30;
            playerEgg._piledriverTarget=null;playerEgg._piledriverPhase=0;playerEgg._pdStartX=0;playerEgg._pdStartZ=0;
        }
        // Position target on player head
        if(playerEgg._piledriverTarget)_pdt.mesh.position.set(playerEgg.mesh.position.x,playerEgg.mesh.position.y+1.5,playerEgg.mesh.position.z);
    }
    playerEgg._fWasDown=!!keys['KeyF'];
}

