// camera.js — DANBO World
// ============================================================
//  CAMERA
// ============================================================
var _cameraZoom=1.0; // 1.0 = default, smaller = closer, larger = farther
// Moon third-person camera orbit angles (mouse-controlled)
var _moonCamYaw=0; // horizontal orbit angle around player (radians)
var _moonCamPitch=0.35; // vertical angle (0=level, positive=above)
var _moonCamDragging=false;
var _moonCamLastX=0, _moonCamLastY=0;
var _spectatorMode=false;
// Third-person (RE5 style) camera
var _tpsCamMode=false;
var _tpsCamYaw=0; // horizontal orbit around player
var _tpsCamPitch=0.4; // vertical angle (0=level, higher=above)
var _tpsCamDist=8; // distance behind player
var _tpsDragging=false;
var _tpsLastX=0,_tpsLastY=0;
var _specCamX=0,_specCamY=50,_specCamZ=0;
var _specLookX=0,_specLookY=0,_specLookZ=-50;
document.addEventListener('wheel',function(e){
    if(_tpsCamMode){_tpsCamDist+=e.deltaY*0.01;return;}
    _cameraZoom+=e.deltaY*0.001*Math.max(1,_cameraZoom*0.5);
    if(_cameraZoom<CAMERA_CONFIG.zoomMin)_cameraZoom=CAMERA_CONFIG.zoomMin;
    if(_cameraZoom>CAMERA_CONFIG.zoomMax)_cameraZoom=CAMERA_CONFIG.zoomMax;
},{passive:true});
// Mouse drag to orbit camera (disabled — moon now uses flat camera)
document.addEventListener('mousedown',function(e){
    if(currentCityStyle===5&&(e.button===2||e.button===1)){_moonCamDragging=true;_moonCamLastX=e.clientX;_moonCamLastY=e.clientY;e.preventDefault();}
});
document.addEventListener('mousemove',function(e){
    if(_moonCamDragging){
        var dx=e.clientX-_moonCamLastX, dy=e.clientY-_moonCamLastY;
        _moonCamYaw-=dx*0.005;
        _moonCamPitch+=dy*0.005;
        if(_moonCamPitch<0.05)_moonCamPitch=0.05;
        if(_moonCamPitch>1.2)_moonCamPitch=1.2;
        _moonCamLastX=e.clientX;_moonCamLastY=e.clientY;
    }
});
document.addEventListener('mouseup',function(e){
    if(e.button===2||e.button===1)_moonCamDragging=false;
});
document.addEventListener('contextmenu',function(e){if(currentCityStyle===5||_tpsCamMode)e.preventDefault();});
// TPS camera: mouse drag to orbit
document.addEventListener('mousedown',function(e){
    if(_tpsCamMode&&gameState==='city'&&(e.button===0||e.button===2)){_tpsDragging=true;_tpsLastX=e.clientX;_tpsLastY=e.clientY;e.preventDefault();}
});
document.addEventListener('mousemove',function(e){
    if(_tpsDragging){
        _tpsCamYaw-=(e.clientX-_tpsLastX)*0.005;
        _tpsCamPitch+=(e.clientY-_tpsLastY)*0.005;
        if(_tpsCamPitch<0.05)_tpsCamPitch=0.05;
        if(_tpsCamPitch>1.2)_tpsCamPitch=1.2;
        _tpsLastX=e.clientX;_tpsLastY=e.clientY;
    }
});
document.addEventListener('mouseup',function(e){_tpsDragging=false;});
// TPS camera: touch drag
var _tpsTouchId=null;
document.addEventListener('touchstart',function(e){
    if(_tpsCamMode&&gameState==='city'&&e.touches.length===1){
        var t=e.touches[0];
        if(t.clientX>window.innerWidth*0.4){
            _tpsTouchId=t.identifier;_tpsLastX=t.clientX;_tpsLastY=t.clientY;
        }
    }
},{passive:true});
document.addEventListener('touchmove',function(e){
    if(_tpsTouchId!==null){
        for(var ti=0;ti<e.touches.length;ti++){
            if(e.touches[ti].identifier===_tpsTouchId){
                var t=e.touches[ti];
                _tpsCamYaw-=(t.clientX-_tpsLastX)*0.008;
                _tpsCamPitch+=(t.clientY-_tpsLastY)*0.008;
                if(_tpsCamPitch<0.05)_tpsCamPitch=0.05;
                if(_tpsCamPitch>1.2)_tpsCamPitch=1.2;
                _tpsLastX=t.clientX;_tpsLastY=t.clientY;
                break;
            }
        }
    }
},{passive:true});
document.addEventListener('touchend',function(e){
    if(_tpsTouchId!==null){
        var found=false;
        for(var ti=0;ti<e.touches.length;ti++){if(e.touches[ti].identifier===_tpsTouchId)found=true;}
        if(!found)_tpsTouchId=null;
    }
},{passive:true});
// Toggle TPS with key 1 or button
function _toggleTPS(){
    _tpsCamMode=!_tpsCamMode;
    if(_tpsCamMode&&playerEgg)_tpsCamYaw=playerEgg.mesh.rotation.y+Math.PI;
    var _tpsBtn=document.getElementById('tps-btn');
    if(_tpsBtn)_tpsBtn.textContent=_tpsCamMode?'🎥':'📷';
}
document.addEventListener('keydown',function(e){
    if(e.code==='Digit1'&&gameState==='city')_toggleTPS();
});
var _tpsBtnEl=document.getElementById('tps-btn');
if(_tpsBtnEl){
    _tpsBtnEl.addEventListener('click',function(){if(gameState==='city')_toggleTPS();});
    _tpsBtnEl.addEventListener('touchend',function(e){e.preventDefault();if(gameState==='city')_toggleTPS();},{passive:false});
}
// Spectator button for mobile
var _specBtn=document.getElementById('spectator-btn');
if(_specBtn){_specBtn.addEventListener('click',function(){
    if(currentCityStyle===5&&gameState==='city'){
        _spectatorMode=!_spectatorMode;
        if(_spectatorMode&&playerEgg){_specCamX=camera.position.x;_specCamY=camera.position.y;_specCamZ=camera.position.z;}
        _specBtn.textContent=_spectatorMode?'\uD83C\uDFAE Player':'\uD83D\uDC41 Spectator';
    }
});}
document.addEventListener('keydown',function(e){
    if(e.code==='KeyV'&&currentCityStyle===5&&gameState==='city'){
        _spectatorMode=!_spectatorMode;
        if(_spectatorMode&&playerEgg){_specCamX=camera.position.x;_specCamY=camera.position.y;_specCamZ=camera.position.z;}
        if(_specBtn)_specBtn.textContent=_spectatorMode?'\uD83C\uDFAE Player':'\uD83D\uDC41 Spectator';
    }
});
// Touch orbit disabled — moon now uses flat camera
var _moonTouchOrbit=false, _moonTouchStartX=0, _moonTouchStartY=0;
document.addEventListener('touchstart',function(e){
    if(_spectatorMode&&currentCityStyle===5&&e.touches.length===1){
        var t=e.touches[0];
        // Only orbit if touching the right half of screen (not joystick area)
        if(t.clientX>window.innerWidth*0.4){
            _moonTouchOrbit=true;_moonTouchStartX=t.clientX;_moonTouchStartY=t.clientY;
        }
    }
},{passive:true});
document.addEventListener('touchmove',function(e){
    if(e.touches.length>=2){_moonTouchOrbit=false;return;}
    if(_moonTouchOrbit&&e.touches.length===1){
        var t=e.touches[0];
        var dx=t.clientX-_moonTouchStartX,dy=t.clientY-_moonTouchStartY;
        _moonCamYaw-=dx*0.008;
        _moonCamPitch+=dy*0.008;
        if(_moonCamPitch<0.05)_moonCamPitch=0.05;
        if(_moonCamPitch>1.2)_moonCamPitch=1.2;
        _moonTouchStartX=t.clientX;_moonTouchStartY=t.clientY;
    }
},{passive:true});
document.addEventListener('touchend',function(e){_moonTouchOrbit=false;},{passive:true});
function updateCamera(){
    if(!playerEgg)return;
    // Spectator mode — free camera on moon
    if(_spectatorMode&&currentCityStyle===5){
        var _spSpd=1.5;
        // Punch = speed boost
        if(keys['KeyR'])_spSpd=3.0;
        // Grab toggles joystick mode (move vs angle)
        if(keys['KeyF']&&!window._specGrabWas){window._specAngleMode=!window._specAngleMode;}
        window._specGrabWas=!!keys['KeyF'];
        // Keyboard move
        if(keys['KeyW']||keys['ArrowUp']){_specCamX-=Math.sin(_moonCamYaw)*_spSpd;_specCamZ-=Math.cos(_moonCamYaw)*_spSpd;}
        if(keys['KeyS']||keys['ArrowDown']){_specCamX+=Math.sin(_moonCamYaw)*_spSpd;_specCamZ+=Math.cos(_moonCamYaw)*_spSpd;}
        if(keys['KeyA']||keys['ArrowLeft']){_specCamX-=Math.cos(_moonCamYaw)*_spSpd;_specCamZ+=Math.sin(_moonCamYaw)*_spSpd;}
        if(keys['KeyD']||keys['ArrowRight']){_specCamX+=Math.cos(_moonCamYaw)*_spSpd;_specCamZ-=Math.sin(_moonCamYaw)*_spSpd;}
        if(keys['Space']){_specCamY+=_spSpd;}
        if(keys['ShiftLeft']||keys['ShiftRight']){_specCamY-=_spSpd;if(_specCamY<5)_specCamY=5;}
        // Joystick (mobile) — move or angle depending on mode
        if(joyActive){
            if(window._specAngleMode){
                // Angle mode: joystick rotates camera
                _moonCamYaw-=joyVec.x*0.04;
                _moonCamPitch+=joyVec.y*0.03;
                if(_moonCamPitch<0.05)_moonCamPitch=0.05;
                if(_moonCamPitch>1.2)_moonCamPitch=1.2;
            } else {
                // Move mode: joystick moves camera
                var _jfwd=-joyVec.y*_spSpd;
                var _jside=joyVec.x*_spSpd;
                _specCamX+=Math.sin(_moonCamYaw)*_jfwd+Math.cos(_moonCamYaw)*_jside;
                _specCamZ+=Math.cos(_moonCamYaw)*_jfwd-Math.sin(_moonCamYaw)*_jside;
            }
        }
        // Pinch zoom = FOV/distance zoom (not height)
        camera.fov=45*Math.max(0.3,Math.min(3,_cameraZoom));
        camera.updateProjectionMatrix();
        camera.position.set(_specCamX,_specCamY,_specCamZ);
        var _lookDist=100;
        camera.lookAt(_specCamX-Math.sin(_moonCamYaw)*_lookDist,_specCamY-Math.sin(_moonCamPitch)*_lookDist*0.5,_specCamZ-Math.cos(_moonCamYaw)*_lookDist);
        sun.position.set(_specCamX+RENDER_CONFIG.sunPos.x,RENDER_CONFIG.sunPos.y,_specCamZ+RENDER_CONFIG.sunPos.z);
        sun.target.position.set(_specCamX,0,_specCamZ);
        _sunMesh.position.set(_specCamX+180,240,_specCamZ+120);
        _sunGlow.position.copy(_sunMesh.position);
        return;
    }
    const p=playerEgg.mesh.position;
    // Third-person (RE5 style) camera — over-the-shoulder
    if(_tpsCamMode){
        // Right stick / mouse controls yaw/pitch, scroll controls distance
        _tpsCamDist=Math.max(3,Math.min(20,_tpsCamDist));
        var _tpx=p.x+Math.sin(_tpsCamYaw)*_tpsCamDist*Math.cos(_tpsCamPitch);
        var _tpy=p.y+1.5+_tpsCamDist*Math.sin(_tpsCamPitch);
        var _tpz=p.z+Math.cos(_tpsCamYaw)*_tpsCamDist*Math.cos(_tpsCamPitch);
        // Slight right offset for over-the-shoulder feel
        _tpx+=Math.cos(_tpsCamYaw)*1.2;
        _tpz-=Math.sin(_tpsCamYaw)*1.2;
        camera.position.x+=(_tpx-camera.position.x)*0.15;
        camera.position.y+=(_tpy-camera.position.y)*0.15;
        camera.position.z+=(_tpz-camera.position.z)*0.15;
        if(camera.position.y<p.y+1)camera.position.y=p.y+1;
        camera.lookAt(p.x,p.y+1.2,p.z);
        // Scroll wheel adjusts distance
        // Player faces camera direction when moving
        if(Math.abs(playerEgg.vx)>0.01||Math.abs(playerEgg.vz)>0.01){
            playerEgg.mesh.rotation.y=Math.atan2(playerEgg.vx,playerEgg.vz);
        }
        sun.position.set(p.x+RENDER_CONFIG.sunPos.x,RENDER_CONFIG.sunPos.y,p.z+RENDER_CONFIG.sunPos.z);
        sun.target.position.set(p.x,0,p.z);
        _sunMesh.position.set(p.x+180,240,p.z+120);
        _sunGlow.position.copy(_sunMesh.position);
        return;
    }
    // Normal flat camera (used for all cities including moon)
    var tx=p.x, ty=p.y+CAMERA_CONFIG.yOffset*_cameraZoom, tz=p.z+CAMERA_CONFIG.zOffset*_cameraZoom;
    camera.position.x+=(tx-camera.position.x)*CAMERA_CONFIG.followSmooth;
    camera.position.y+=(ty-camera.position.y)*CAMERA_CONFIG.followSmooth;
    camera.position.z+=(tz-camera.position.z)*CAMERA_CONFIG.followSmooth;
    // Clamp camera above ground to prevent blue screen when falling
    if(camera.position.y<CAMERA_CONFIG.minHeight)camera.position.y=CAMERA_CONFIG.minHeight;
    // Earthquake shake
    if(_earthquakeTimer>0){
        var shakeAmt=_earthquakeIntensity*(_earthquakeTimer/180);
        camera.position.x+=(Math.random()-0.5)*shakeAmt*CAMERA_CONFIG.shakeMultX;
        camera.position.y+=(Math.random()-0.5)*shakeAmt*CAMERA_CONFIG.shakeMultY;
        camera.position.z+=(Math.random()-0.5)*shakeAmt*CAMERA_CONFIG.shakeMultZ;
        _earthquakeTimer--;
    }
    camera.lookAt(p.x, p.y+1, p.z-4);
    sun.position.set(p.x+RENDER_CONFIG.sunPos.x,RENDER_CONFIG.sunPos.y,p.z+RENDER_CONFIG.sunPos.z);
    sun.target.position.set(p.x,0,p.z);
    // Show spectator button on moon
    if(_specBtn){_specBtn.style.display=(currentCityStyle===5&&gameState==='city')?'inline-block':'none';}
    // Sun mesh follows directional light direction (far away visual)
    _sunMesh.position.set(p.x+180,240,p.z+120);
    _sunGlow.position.copy(_sunMesh.position);

    // Building occlusion — fade buildings between camera and player
    // BUT don't fade if player is standing on the roof
    if(gameState==='city'){
        const cx=camera.position.x, cz=camera.position.z;
        const px2=p.x, pz2=p.z;
        const py2=playerEgg?playerEgg.mesh.position.y:0;
        for(const bld of cityBuildingMeshes){
            // Check if player is on this building's roof
            var onRoof=false;
            if(Math.abs(px2-bld.x)<bld.hw+1&&Math.abs(pz2-bld.z)<bld.hd+1&&py2>=bld.h-1){
                onRoof=true;
            }
            // 2D line-segment (camera→player) vs AABB intersection in XZ
            let shouldFade=false;
            if(!onRoof){
            const bx0=bld.x-bld.hw-0.5, bx1=bld.x+bld.hw+0.5;
            const bz0=bld.z-bld.hd-0.5, bz1=bld.z+bld.hd+0.5;
            // Liang-Barsky algorithm for 2D segment clipping
            const dx=px2-cx, dz=pz2-cz;
            const pp=[-dx, dx, -dz, dz];
            const qq=[cx-bx0, bx1-cx, cz-bz0, bz1-cz];
            let tmin=0, tmax=1;
            let valid=true;
            for(let i=0;i<4;i++){
                if(Math.abs(pp[i])<1e-8){
                    if(qq[i]<0){valid=false;break;}
                } else {
                    const t=qq[i]/pp[i];
                    if(pp[i]<0){if(t>tmin)tmin=t;} else {if(t<tmax)tmax=t;}
                }
            }
            if(valid&&tmin<tmax&&tmax>0.05&&tmin<0.95) shouldFade=true;
            }
            // Also fade if player is directly underneath (bridges, overhangs)
            if(!onRoof&&Math.abs(px2-bld.x)<bld.hw+1&&Math.abs(pz2-bld.z)<bld.hd+1&&py2<bld.h-1){
                shouldFade=true;
            }

            const targetOp=shouldFade?0.2:1.0;
            for(const m of bld.meshes){
                const mat=m.material;
                if(!mat.hasOwnProperty('_origOpacity')){mat._origOpacity=mat.opacity||1;mat._origTransparent=mat.transparent||false;mat._origDepthWrite=mat.depthWrite!==undefined?mat.depthWrite:true;}
                const goal=targetOp*mat._origOpacity;
                mat.opacity+=(goal-mat.opacity)*0.15;
                mat.transparent=true;
                mat.depthWrite=mat.opacity>0.95;
                mat.needsUpdate=true;
                m.renderOrder=shouldFade?10:0;
            }
        }
    }
}

