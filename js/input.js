// input.js — DANBO World

// ---- Input ----
const keys={};
addEventListener('keydown',e=>{ keys[e.code]=true; if(e.code==='KeyG')keys['Space']=true; if(['Space','KeyG','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyE','KeyF','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault(); if(e.code==='Enter'&&gameState==='city'&&!_portalConfirmOpen&&!_chatOpen){e.preventDefault();_openChatInput();} });
addEventListener('keyup',e=>{ keys[e.code]=false; if(e.code==='KeyG')keys['Space']=false; });

let joyVec={x:0,y:0}, joyActive=false, joyTouchId=null;
const joystickArea=document.getElementById('joystick-area');
const joystickBase=document.getElementById('joystick-base');
const joystickKnob=document.getElementById('joystick-knob');
const jumpBtn=document.getElementById('jump-btn');

if(joystickArea){
    joystickArea.addEventListener('touchstart',e=>{e.preventDefault();joyTouchId=e.changedTouches[0].identifier;joyActive=true;updJoy(e.changedTouches[0]);},{passive:false});
    joystickArea.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===joyTouchId)updJoy(t);},{passive:false});
    joystickArea.addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier===joyTouchId){joyActive=false;joyVec={x:0,y:0};joystickKnob.style.transform='translate(0,0)';}});
}
function updJoy(touch){
    const r=joystickBase.getBoundingClientRect();
    let dx=touch.clientX-(r.left+r.width/2),dy=touch.clientY-(r.top+r.height/2);
    const maxR=r.width/2-22,d=Math.sqrt(dx*dx+dy*dy);
    if(d>maxR){dx=dx/d*maxR;dy=dy/d*maxR;}
    joystickKnob.style.transform='translate('+dx+'px,'+dy+'px)';
    joyVec={x:dx/maxR,y:dy/maxR};
}
if(jumpBtn){
    jumpBtn.addEventListener('touchstart',function(e){e.preventDefault();keys['Space']=true;},{passive:false});
    jumpBtn.addEventListener('touchend',function(e){e.preventDefault();keys['Space']=false;},{passive:false});
    jumpBtn.addEventListener('touchcancel',function(e){keys['Space']=false;},{passive:false});
}
const grabBtn=document.getElementById('grab-btn');
if(grabBtn){
    grabBtn.addEventListener('touchstart',function(e){e.preventDefault();keys['KeyF']=true;},{passive:false});
    grabBtn.addEventListener('touchend',function(e){e.preventDefault();keys['KeyF']=false;},{passive:false});
    grabBtn.addEventListener('touchcancel',function(e){keys['KeyF']=false;},{passive:false});
}
// Chat button (mobile)
var chatBtn=document.getElementById('chat-btn');
if(chatBtn){
    chatBtn.addEventListener('touchstart',function(e){e.preventDefault();_openChatInput();},{passive:false});
}
// Punch/Kick buttons (mobile)
var punchBtn=document.getElementById('punch-btn');
if(punchBtn){
    punchBtn.addEventListener('touchstart',function(e){e.preventDefault();keys['KeyR']=true;},{passive:false});
    punchBtn.addEventListener('touchend',function(e){e.preventDefault();keys['KeyR']=false;},{passive:false});
    punchBtn.addEventListener('touchcancel',function(e){keys['KeyR']=false;},{passive:false});
}
var kickBtn=document.getElementById('kick-btn');
if(kickBtn){
    kickBtn.addEventListener('touchstart',function(e){e.preventDefault();keys['KeyT']=true;},{passive:false});
    kickBtn.addEventListener('touchend',function(e){e.preventDefault();keys['KeyT']=false;},{passive:false});
    kickBtn.addEventListener('touchcancel',function(e){keys['KeyT']=false;},{passive:false});
}

// ---- Pinch-to-zoom (mobile) ----
var _pinchStartDist=0, _pinchZoomStart=1;
document.addEventListener('touchstart',function(e){
    if(e.touches.length===2){
        var dx=e.touches[0].clientX-e.touches[1].clientX;
        var dy=e.touches[0].clientY-e.touches[1].clientY;
        _pinchStartDist=Math.sqrt(dx*dx+dy*dy);
        _pinchZoomStart=_cameraZoom;
    }
},{passive:true});
document.addEventListener('touchmove',function(e){
    if(e.touches.length===2&&_pinchStartDist>10){
        var dx=e.touches[0].clientX-e.touches[1].clientX;
        var dy=e.touches[0].clientY-e.touches[1].clientY;
        var dist=Math.sqrt(dx*dx+dy*dy);
        var ratio=_pinchStartDist/dist; // pinch in = zoom out, pinch out = zoom in
        _cameraZoom=_pinchZoomStart*ratio;
        if(_cameraZoom<0.04)_cameraZoom=0.04;
        if(_cameraZoom>1000)_cameraZoom=1000;
    }
},{passive:true});


// Portal prompt removed — auto-enter on walk-in

