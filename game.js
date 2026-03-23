// ============================================================
//  蛋仔冲冲冲 — Egg Party Rush  (Hub City + Race Portals)
// ============================================================
/* global THREE */

// ---- Toon gradient ----
const _tc = document.createElement('canvas');
_tc.width = 4; _tc.height = 1;
const _tg = _tc.getContext('2d');
_tg.fillStyle='#555';_tg.fillRect(0,0,1,1);
_tg.fillStyle='#999';_tg.fillRect(1,0,1,1);
_tg.fillStyle='#ddd';_tg.fillRect(2,0,1,1);
_tg.fillStyle='#fff';_tg.fillRect(3,0,1,1);
const toonTex = new THREE.CanvasTexture(_tc);
toonTex.minFilter = THREE.NearestFilter; toonTex.magFilter = THREE.NearestFilter;

function toon(color, opts={}) { return new THREE.MeshToonMaterial({color, gradientMap:toonTex, ...opts}); }

// ---- Audio System (procedural, no files needed) ----
let audioCtx=null, soundEnabled=true, _audioUnlocked=false;
function ensureAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
// Mobile audio unlock — must resume AudioContext inside a user gesture
function _unlockAudio(){
    if(_audioUnlocked)return;
    _audioUnlocked=true;
    var ctx=ensureAudio();
    if(ctx.state==='suspended'){
        ctx.resume().then(function(){
            // Play a silent buffer to fully unlock on iOS
            var b=ctx.createBuffer(1,1,22050);
            var s=ctx.createBufferSource();s.buffer=b;s.connect(ctx.destination);s.start(0);
        });
    }
}
document.addEventListener('touchstart',_unlockAudio,{once:true});
document.addEventListener('touchend',_unlockAudio,{once:true});
document.addEventListener('click',_unlockAudio,{once:true});

// Sound toggle button
const soundBtn=document.getElementById("sound-btn");
if(soundBtn) soundBtn.addEventListener("click",function(){
    soundEnabled=!soundEnabled;
    soundBtn.textContent=soundEnabled?"🔊":"🔇";
    soundBtn.classList.toggle("muted",!soundEnabled);
    if(!soundEnabled) stopBGM();
    else if(gameState==="city"||gameState==="racing"||gameState==="raceIntro") startBGM();
});

// Background music — cheerful multi-layer procedural BGM
let bgmPlaying=false, bgmGain=null, bgmNodes=[];
function startBGM(){
    if(bgmPlaying||!soundEnabled)return;
    const ctx=ensureAudio(); bgmPlaying=true;
    if(ctx.state==='suspended'){ctx.resume().then(function(){if(bgmPlaying)_playBGMLoop(ctx);});return;}
    _playBGMLoop(ctx);
}
function _playBGMLoop(ctx){
    bgmGain=ctx.createGain(); bgmGain.gain.value=0.15; bgmGain.connect(ctx.destination);
    // Chord progressions (C-Am-F-G pattern, two octaves of melody)
    const chords=[
        [262,330,392],[220,262,330],[175,220,262],[196,247,294],
        [262,330,392],[220,262,330],[175,220,262],[196,247,330]
    ];
    const melodyA=[784,880,784,659,698,784,880,988,784,659,523,587,659,784,880,784];
    const melodyB=[659,698,784,880,784,698,659,587,523,587,659,523,440,494,523,659];
    const noteLen=0.18;
    let loopCount=0;
    function playLoop(){
        if(!bgmPlaying)return;
        const now=ctx.currentTime;
        const melody=loopCount%2===0?melodyA:melodyB;
        loopCount++;
        for(let i=0;i<melody.length;i++){
            // Melody — triangle wave with vibrato
            const osc=ctx.createOscillator(); const g=ctx.createGain();
            osc.type='triangle';
            osc.frequency.setValueAtTime(melody[i],now+i*noteLen);
            // Slight pitch bend for expression
            osc.frequency.exponentialRampToValueAtTime(melody[i]*1.01,now+i*noteLen+noteLen*0.3);
            osc.frequency.exponentialRampToValueAtTime(melody[i],now+i*noteLen+noteLen*0.8);
            g.gain.setValueAtTime(0,now+i*noteLen);
            g.gain.linearRampToValueAtTime(0.14,now+i*noteLen+0.02);
            g.gain.setValueAtTime(0.12,now+i*noteLen+noteLen*0.5);
            g.gain.exponentialRampToValueAtTime(0.005,now+i*noteLen+noteLen*0.95);
            osc.connect(g); g.connect(bgmGain);
            osc.start(now+i*noteLen); osc.stop(now+i*noteLen+noteLen);
            bgmNodes.push(osc);
            // Harmony — soft sine a third above
            if(i%2===0){
                const h=ctx.createOscillator(); const hg=ctx.createGain();
                h.type='sine'; h.frequency.value=melody[i]*1.25;
                hg.gain.setValueAtTime(0.04,now+i*noteLen);
                hg.gain.exponentialRampToValueAtTime(0.003,now+i*noteLen+noteLen*1.8);
                h.connect(hg); hg.connect(bgmGain);
                h.start(now+i*noteLen); h.stop(now+i*noteLen+noteLen*2);
                bgmNodes.push(h);
            }
            // Chord pads — change every 4 notes
            if(i%4===0){
                const ci=Math.floor(i/4)%chords.length;
                for(let cn=0;cn<chords[ci].length;cn++){
                    const co=ctx.createOscillator(); const cg=ctx.createGain();
                    co.type='sine'; co.frequency.value=chords[ci][cn];
                    cg.gain.setValueAtTime(0.035,now+i*noteLen);
                    cg.gain.exponentialRampToValueAtTime(0.005,now+i*noteLen+noteLen*3.8);
                    co.connect(cg); cg.connect(bgmGain);
                    co.start(now+i*noteLen); co.stop(now+i*noteLen+noteLen*4);
                    bgmNodes.push(co);
                }
            }
            // Bass — root note of chord
            if(i%4===0){
                const ci=Math.floor(i/4)%chords.length;
                const bo=ctx.createOscillator(); const bg2=ctx.createGain();
                bo.type='sine'; bo.frequency.value=chords[ci][0]*0.5;
                bg2.gain.setValueAtTime(0.1,now+i*noteLen);
                bg2.gain.exponentialRampToValueAtTime(0.008,now+i*noteLen+noteLen*3.8);
                bo.connect(bg2); bg2.connect(bgmGain);
                bo.start(now+i*noteLen); bo.stop(now+i*noteLen+noteLen*4);
                bgmNodes.push(bo);
            }
            // Percussion — soft kick on beats, hi-hat on off-beats
            if(i%4===0){
                const kb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.08),ctx.sampleRate);
                const kd=kb.getChannelData(0);
                for(let s=0;s<kd.length;s++){const p=s/kd.length;kd[s]=Math.sin(p*Math.PI*8*(1-p*0.8))*0.4*Math.exp(-p*6);}
                const ks=ctx.createBufferSource(); const kg=ctx.createGain(); kg.gain.value=0.12;
                ks.buffer=kb; ks.connect(kg); kg.connect(bgmGain);
                ks.start(now+i*noteLen); ks.stop(now+i*noteLen+0.08);
                bgmNodes.push(ks);
            }
            if(i%2===1){
                const hb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.03),ctx.sampleRate);
                const hd=hb.getChannelData(0);
                for(let s=0;s<hd.length;s++) hd[s]=(Math.random()-0.5)*0.15*Math.exp(-s/(hd.length*0.1));
                const hs=ctx.createBufferSource(); const hg=ctx.createGain(); hg.gain.value=0.06;
                hs.buffer=hb; hs.connect(hg); hg.connect(bgmGain);
                hs.start(now+i*noteLen); hs.stop(now+i*noteLen+0.03);
                bgmNodes.push(hs);
            }
        }
        setTimeout(playLoop, melody.length*noteLen*1000);
    }
    playLoop();
}
function stopBGM(){bgmPlaying=false;bgmNodes.forEach(function(n){try{n.stop();}catch(e){}});bgmNodes=[];if(bgmGain){bgmGain.gain.value=0;bgmGain=null;}}

// Select screen BGM — intense fighting game style
let selectBgmPlaying=false, selectBgmGain=null, selectBgmNodes=[], selectBgmTimer=null;
function startSelectBGM(){
    if(selectBgmPlaying||!soundEnabled)return;
    stopBGM(); // stop main BGM
    var ctx=ensureAudio();
    if(ctx.state==='suspended'){ctx.resume().then(function(){if(!selectBgmPlaying){selectBgmPlaying=true;_selectLoop(ctx);}});selectBgmPlaying=true;return;}
    selectBgmPlaying=true; _selectLoop(ctx);
}
function _selectLoop(ctx){
    selectBgmGain=ctx.createGain();selectBgmGain.gain.value=0.14;selectBgmGain.connect(ctx.destination);
    // Dramatic minor key progression: Am-F-C-G with driving rhythm
    var chords=[[220,262,330],[175,220,262],[262,330,392],[196,247,294],[220,262,330],[175,220,262],[262,330,392],[233,294,349]];
    var melA=[660,660,784,880,784,660,587,523,660,784,880,988,880,784,660,784];
    var melB=[880,784,660,587,660,784,880,784,523,587,660,523,440,523,587,660];
    var noteLen=0.15;
    var loopN=0;
    function doLoop(){
        if(!selectBgmPlaying)return;
        var now=ctx.currentTime;
        var mel=loopN%2===0?melA:melB;loopN++;
        for(var i=0;i<mel.length;i++){
            // Lead — aggressive square wave
            var o=ctx.createOscillator();var g=ctx.createGain();
            o.type='square';o.frequency.setValueAtTime(mel[i],now+i*noteLen);
            o.frequency.exponentialRampToValueAtTime(mel[i]*0.98,now+i*noteLen+noteLen*0.7);
            g.gain.setValueAtTime(0.1,now+i*noteLen);g.gain.linearRampToValueAtTime(0.08,now+i*noteLen+noteLen*0.3);
            g.gain.exponentialRampToValueAtTime(0.005,now+i*noteLen+noteLen*0.9);
            o.connect(g);g.connect(selectBgmGain);o.start(now+i*noteLen);o.stop(now+i*noteLen+noteLen);
            selectBgmNodes.push(o);
            // Sub octave power
            if(i%2===0){var o2=ctx.createOscillator();var g2=ctx.createGain();
            o2.type='sawtooth';o2.frequency.value=mel[i]*0.5;
            g2.gain.setValueAtTime(0.05,now+i*noteLen);g2.gain.exponentialRampToValueAtTime(0.003,now+i*noteLen+noteLen*1.5);
            o2.connect(g2);g2.connect(selectBgmGain);o2.start(now+i*noteLen);o2.stop(now+i*noteLen+noteLen*1.5);
            selectBgmNodes.push(o2);}
            // Chords every 4 notes
            if(i%4===0){var ci=Math.floor(i/4)%chords.length;
            for(var cn=0;cn<chords[ci].length;cn++){var co=ctx.createOscillator();var cg=ctx.createGain();
            co.type='triangle';co.frequency.value=chords[ci][cn];
            cg.gain.setValueAtTime(0.04,now+i*noteLen);cg.gain.exponentialRampToValueAtTime(0.004,now+i*noteLen+noteLen*3.8);
            co.connect(cg);cg.connect(selectBgmGain);co.start(now+i*noteLen);co.stop(now+i*noteLen+noteLen*4);
            selectBgmNodes.push(co);}}
            // Heavy bass
            if(i%4===0){var ci2=Math.floor(i/4)%chords.length;
            var bo=ctx.createOscillator();var bg2=ctx.createGain();
            bo.type='sawtooth';bo.frequency.value=chords[ci2][0]*0.25;
            bg2.gain.setValueAtTime(0.12,now+i*noteLen);bg2.gain.exponentialRampToValueAtTime(0.008,now+i*noteLen+noteLen*3.5);
            bo.connect(bg2);bg2.connect(selectBgmGain);bo.start(now+i*noteLen);bo.stop(now+i*noteLen+noteLen*4);
            selectBgmNodes.push(bo);}
            // Driving kick every 2 beats
            if(i%2===0){var kb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.08),ctx.sampleRate);
            var kd=kb.getChannelData(0);
            for(var s=0;s<kd.length;s++){var p=s/kd.length;kd[s]=Math.sin(p*Math.PI*12*(1-p*0.7))*0.5*Math.exp(-p*5);}
            var ks=ctx.createBufferSource();var kg=ctx.createGain();kg.gain.value=0.15;
            ks.buffer=kb;ks.connect(kg);kg.connect(selectBgmGain);ks.start(now+i*noteLen);ks.stop(now+i*noteLen+0.08);
            selectBgmNodes.push(ks);}
            // Snare on off-beats
            if(i%4===2){var sb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.06),ctx.sampleRate);
            var sd=sb.getChannelData(0);
            for(var s2=0;s2<sd.length;s2++) sd[s2]=(Math.random()-0.5)*0.4*Math.exp(-s2/(sd.length*0.15));
            var ss=ctx.createBufferSource();var sg=ctx.createGain();sg.gain.value=0.12;
            ss.buffer=sb;ss.connect(sg);sg.connect(selectBgmGain);ss.start(now+i*noteLen);ss.stop(now+i*noteLen+0.06);
            selectBgmNodes.push(ss);}
            // Hi-hat
            if(i%2===1){var hb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.025),ctx.sampleRate);
            var hd=hb.getChannelData(0);
            for(var s3=0;s3<hd.length;s3++) hd[s3]=(Math.random()-0.5)*0.2*Math.exp(-s3/(hd.length*0.08));
            var hs=ctx.createBufferSource();var hg=ctx.createGain();hg.gain.value=0.08;
            hs.buffer=hb;hs.connect(hg);hg.connect(selectBgmGain);hs.start(now+i*noteLen);hs.stop(now+i*noteLen+0.025);
            selectBgmNodes.push(hs);}
        }
        selectBgmTimer=setTimeout(doLoop,mel.length*noteLen*1000);
    }
    doLoop();
}
function stopSelectBGM(){selectBgmPlaying=false;if(selectBgmTimer){clearTimeout(selectBgmTimer);selectBgmTimer=null;}selectBgmNodes.forEach(function(n){try{n.stop();}catch(e){}});selectBgmNodes=[];if(selectBgmGain){selectBgmGain.gain.value=0;selectBgmGain=null;}}


// Walk sound — cute "pata pata" Doraemon style with cooldown
let lastStepTime=0;
function playStepSound(){
    if(!soundEnabled) return;
    const now=performance.now();
    if(now-lastStepTime<180) return; // min 180ms between steps
    lastStepTime=now;
    const ctx=ensureAudio();
    const t=ctx.currentTime;
    // Soft "pa" — short pitched tap
    const osc=ctx.createOscillator();
    const g=ctx.createGain();
    osc.type='sine';
    const pitch=380+Math.random()*40; // slight variation
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch*0.6, t+0.06);
    g.gain.setValueAtTime(0.07, t);
    g.gain.linearRampToValueAtTime(0.04, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t+0.08);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t+0.08);
    // Soft "ta" layer — tiny noise pop
    const buf=ctx.createBuffer(1, Math.floor(ctx.sampleRate*0.03), ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()-0.5)*0.15*Math.exp(-i/(d.length*0.15));
    const ns=ctx.createBufferSource();
    const ng=ctx.createGain(); ng.gain.value=0.04;
    ns.buffer=buf; ns.connect(ng); ng.connect(ctx.destination);
    ns.start(t+0.01); ns.stop(t+0.04);
}

// Jump sound
function playJumpSound(){
    if(!soundEnabled) return;
    const ctx=ensureAudio();
    const osc=ctx.createOscillator();
    const g=ctx.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(300,ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600,ctx.currentTime+0.12);
    g.gain.setValueAtTime(0.1,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.15);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime+0.15);
}

// Coin collect sound
function playCoinSound(){
    if(!soundEnabled) return;
    const ctx=ensureAudio();
    [800,1200].forEach((f,i)=>{
        const osc=ctx.createOscillator();
        const g=ctx.createGain();
        osc.type='sine'; osc.frequency.value=f;
        g.gain.setValueAtTime(0.12,ctx.currentTime+i*0.08);
        g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.08+0.12);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(ctx.currentTime+i*0.08); osc.stop(ctx.currentTime+i*0.08+0.12);
    });
}

// Hit/bump sound
function playHitSound(){
    const ctx=ensureAudio();
    const osc=ctx.createOscillator();
    const g=ctx.createGain();
    osc.type='sawtooth'; osc.frequency.value=120;
    g.gain.setValueAtTime(0.08,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.1);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime+0.1);
}

// Grab sound — short "boop"
function playGrabSound(){
    if(!soundEnabled) return;
    const ctx=ensureAudio(); const t=ctx.currentTime;
    const osc=ctx.createOscillator(); const g=ctx.createGain();
    osc.type='sine'; osc.frequency.setValueAtTime(500,t); osc.frequency.exponentialRampToValueAtTime(350,t+0.1);
    g.gain.setValueAtTime(0.1,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
    osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t+0.12);
}

// Throw sound — whoosh
function playThrowSound(){
    if(!soundEnabled) return;
    const ctx=ensureAudio(); const t=ctx.currentTime;
    const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.15),ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++){const p=i/d.length;d[i]=(Math.random()-0.5)*0.3*Math.sin(p*Math.PI)*Math.exp(-p*2);}
    const ns=ctx.createBufferSource(); const ng=ctx.createGain(); ng.gain.value=0.12;
    ns.buffer=buf; ns.connect(ng); ng.connect(ctx.destination); ns.start(t); ns.stop(t+0.15);
    // Rising pitch layer
    const osc=ctx.createOscillator(); const g=ctx.createGain();
    osc.type='sine'; osc.frequency.setValueAtTime(200,t); osc.frequency.exponentialRampToValueAtTime(800,t+0.12);
    g.gain.setValueAtTime(0.06,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.15);
    osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t+0.15);
}


// Menu sound effects
function playMenuMove(){
    if(!soundEnabled)return;var ctx=ensureAudio();var t=ctx.currentTime;
    // Punchy arcade move sound
    var o=ctx.createOscillator();var g=ctx.createGain();
    o.type='square';o.frequency.setValueAtTime(880,t);o.frequency.exponentialRampToValueAtTime(660,t+0.04);
    g.gain.setValueAtTime(0.1,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.06);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.06);
    // Click layer
    var o2=ctx.createOscillator();var g2=ctx.createGain();
    o2.type='sine';o2.frequency.value=1200;
    g2.gain.setValueAtTime(0.06,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.03);
    o2.connect(g2);g2.connect(ctx.destination);o2.start(t);o2.stop(t+0.03);
}
function playMenuConfirm(){
    if(!soundEnabled)return;var ctx=ensureAudio();var t=ctx.currentTime;
    // Epic rising confirm — 5 rapid notes ascending with power chord
    var notes=[523,659,784,988,1318];
    notes.forEach(function(f,i){
        var o=ctx.createOscillator();var g=ctx.createGain();
        o.type='sawtooth';o.frequency.value=f;
        g.gain.setValueAtTime(0.12,t+i*0.05);g.gain.exponentialRampToValueAtTime(0.001,t+i*0.05+0.15);
        o.connect(g);g.connect(ctx.destination);o.start(t+i*0.05);o.stop(t+i*0.05+0.15);
        // Octave layer
        var o2=ctx.createOscillator();var g2=ctx.createGain();
        o2.type='triangle';o2.frequency.value=f*2;
        g2.gain.setValueAtTime(0.06,t+i*0.05);g2.gain.exponentialRampToValueAtTime(0.001,t+i*0.05+0.12);
        o2.connect(g2);g2.connect(ctx.destination);o2.start(t+i*0.05);o2.stop(t+i*0.05+0.12);
    });
    // Final impact burst
    var nb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.1),ctx.sampleRate);
    var nd=nb.getChannelData(0);
    for(var s=0;s<nd.length;s++){var p=s/nd.length;nd[s]=Math.sin(p*Math.PI*20)*0.3*Math.exp(-p*4);}
    var ns=ctx.createBufferSource();var ng=ctx.createGain();ng.gain.value=0.1;
    ns.buffer=nb;ns.connect(ng);ng.connect(ctx.destination);ns.start(t+0.25);ns.stop(t+0.35);
}
// ---- Renderer ----
const root = document.getElementById('three-root');
const R = new THREE.WebGLRenderer({antialias:true});
R.setSize(innerWidth,innerHeight);
R.setPixelRatio(Math.min(devicePixelRatio,2));
R.shadowMap.enabled = true;
R.shadowMap.type = THREE.PCFSoftShadowMap;
R.outputColorSpace = THREE.SRGBColorSpace;
root.appendChild(R.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 80, 260);

const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.5, 350);
window.addEventListener('resize', ()=>{ R.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); });

// ---- Lighting ----
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(30,50,30); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
const ssc=sun.shadow.camera; ssc.left=-70;ssc.right=70;ssc.top=70;ssc.bottom=-70;ssc.near=1;ssc.far=160;
scene.add(sun); scene.add(sun.target);
scene.add(new THREE.HemisphereLight(0xaaddff,0x88cc66,0.8));

// ---- Skins ----
// ---- Characters ----
const CHARACTERS = [
    {name:'经典蛋',type:'egg',color:0xFFF5D6,accent:0xFFCC00,icon:'🥚',portrait:'#FFF5D6'},
    {name:'小狗',type:'dog',color:0xC8915A,accent:0x8B5E3C,icon:'🐶',portrait:'#C8915A'},
    {name:'马骝',type:'monkey',color:0xD4956B,accent:0xFFCC88,icon:'🐵',portrait:'#D4956B'},
    {name:'公鸡',type:'rooster',color:0xFFEEDD,accent:0xFF4444,icon:'🐓',portrait:'#FFEECC'},
    {name:'蟑螂',type:'cockroach',color:0x6B3A2A,accent:0x3D2215,icon:'🪳',portrait:'#6B3A2A'},
    {name:'小猫',type:'cat',color:0xFFAA77,accent:0xFF8844,icon:'🐱',portrait:'#FFAA77'},
    {name:'小猪',type:'pig',color:0xFFBBCC,accent:0xFF8899,icon:'🐷',portrait:'#FFBBCC'},
    {name:'青蛙',type:'frog',color:0x55BB55,accent:0x338833,icon:'🐸',portrait:'#55BB55'},
];
let selectedChar = 0;
const AI_COLORS=[0xFFAA44,0x66DD66,0xFF5555,0x88CCDD,0xEEEE55,0xCC88CC,0xFFBBCC,0xAA88BB,0xFF8855,0x77BBFF,0xBB88FF,0xFFCC88,0xAAFF77,0xFF77AA,0x77DDDD,0xDDAA55];

// ---- SF2 Character Select Grid ----
const charGrid = document.getElementById('char-grid');
const portraitCanvas = document.getElementById('portrait-canvas');
const portraitCtx = portraitCanvas ? portraitCanvas.getContext('2d') : null;
const portraitName = document.getElementById('portrait-name');

function drawPortrait(ch) {
    if (!portraitCtx) return;
    const W=portraitCanvas.width, H=portraitCanvas.height;
    portraitCtx.clearRect(0,0,W,H);
    const bg=portraitCtx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#1a1a4a'); bg.addColorStop(1,'#0a0a2e');
    portraitCtx.fillStyle=bg; portraitCtx.fillRect(0,0,W,H);
    const cx=W/2, cy=H*0.52, rx=55, ry=70;
    portraitCtx.beginPath(); portraitCtx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
    portraitCtx.fillStyle=ch.portrait; portraitCtx.fill();
    portraitCtx.strokeStyle='rgba(255,255,255,0.15)'; portraitCtx.lineWidth=2; portraitCtx.stroke();
    // Eyes
    [-1,1].forEach(s => {
        portraitCtx.beginPath(); portraitCtx.ellipse(cx+s*18,cy-12,10,12,0,0,Math.PI*2);
        portraitCtx.fillStyle='#fff'; portraitCtx.fill();
        portraitCtx.beginPath(); portraitCtx.arc(cx+s*18,cy-11,6,0,Math.PI*2);
        portraitCtx.fillStyle='#111'; portraitCtx.fill();
        portraitCtx.beginPath(); portraitCtx.arc(cx+s*16,cy-14,2,0,Math.PI*2);
        portraitCtx.fillStyle='#fff'; portraitCtx.fill();
    });
    // Smile
    portraitCtx.beginPath(); portraitCtx.arc(cx,cy+12,14,0.15*Math.PI,0.85*Math.PI);
    portraitCtx.strokeStyle='#333'; portraitCtx.lineWidth=2.5; portraitCtx.stroke();
    // Blush
    [-1,1].forEach(s => {
        portraitCtx.beginPath(); portraitCtx.ellipse(cx+s*32,cy+8,10,6,0,0,Math.PI*2);
        portraitCtx.fillStyle='rgba(255,120,120,0.35)'; portraitCtx.fill();
    });
    // Type features
    if (ch.type==='dog') {
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.ellipse(cx+s*45,cy-50,16,28,s*0.3,0,Math.PI*2);
            portraitCtx.fillStyle='#A0704A'; portraitCtx.fill();
        });
        portraitCtx.beginPath(); portraitCtx.ellipse(cx,cy+6,12,8,0,0,Math.PI*2);
        portraitCtx.fillStyle='#333'; portraitCtx.fill();
    } else if (ch.type==='cat') {
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.moveTo(cx+s*30,cy-60);
            portraitCtx.lineTo(cx+s*50,cy-30); portraitCtx.lineTo(cx+s*15,cy-35);
            portraitCtx.fillStyle='#FF8844'; portraitCtx.fill();
        });
        [-1,1].forEach(s => { for(let w=-1;w<=1;w++){
            portraitCtx.beginPath(); portraitCtx.moveTo(cx+s*20,cy+8+w*6);
            portraitCtx.lineTo(cx+s*55,cy+4+w*8);
            portraitCtx.strokeStyle='rgba(0,0,0,0.3)'; portraitCtx.lineWidth=1; portraitCtx.stroke();
        }});
    } else if (ch.type==='monkey') {
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.arc(cx+s*55,cy-5,18,0,Math.PI*2);
            portraitCtx.fillStyle='#FFCC88'; portraitCtx.fill();
            portraitCtx.beginPath(); portraitCtx.arc(cx+s*55,cy-5,12,0,Math.PI*2);
            portraitCtx.fillStyle='#D4956B'; portraitCtx.fill();
        });
        portraitCtx.beginPath(); portraitCtx.ellipse(cx,cy+10,25,18,0,0,Math.PI*2);
        portraitCtx.fillStyle='#FFCC88'; portraitCtx.fill();
    } else if (ch.type==='rooster') {
        for(let i=0;i<3;i++){
            portraitCtx.beginPath(); portraitCtx.arc(cx-10+i*10,cy-68+Math.abs(i-1)*5,10,0,Math.PI*2);
            portraitCtx.fillStyle='#FF3333'; portraitCtx.fill();
        }
        portraitCtx.beginPath(); portraitCtx.ellipse(cx,cy+28,8,12,0,0,Math.PI*2);
        portraitCtx.fillStyle='#FF3333'; portraitCtx.fill();
        portraitCtx.beginPath(); portraitCtx.moveTo(cx-6,cy+4); portraitCtx.lineTo(cx+6,cy+4);
        portraitCtx.lineTo(cx,cy+16); portraitCtx.fillStyle='#FFAA00'; portraitCtx.fill();
    } else if (ch.type==='cockroach') {
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.moveTo(cx+s*10,cy-55);
            portraitCtx.quadraticCurveTo(cx+s*35,cy-85,cx+s*45,cy-70);
            portraitCtx.strokeStyle='#4A2A1A'; portraitCtx.lineWidth=2.5; portraitCtx.stroke();
        });
        portraitCtx.beginPath(); portraitCtx.moveTo(cx,cy-30); portraitCtx.lineTo(cx,cy+40);
        portraitCtx.strokeStyle='rgba(0,0,0,0.2)'; portraitCtx.lineWidth=1.5; portraitCtx.stroke();
    } else if (ch.type==='pig') {
        portraitCtx.beginPath(); portraitCtx.ellipse(cx,cy+10,16,12,0,0,Math.PI*2);
        portraitCtx.fillStyle='#FF99AA'; portraitCtx.fill();
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.ellipse(cx+s*5,cy+10,3,4,0,0,Math.PI*2);
            portraitCtx.fillStyle='#DD7788'; portraitCtx.fill();
        });
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.ellipse(cx+s*40,cy-45,18,22,s*0.4,0,Math.PI*2);
            portraitCtx.fillStyle='#FFAABB'; portraitCtx.fill();
        });
    } else if (ch.type==='frog') {
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.arc(cx+s*25,cy-50,20,0,Math.PI*2);
            portraitCtx.fillStyle='#55BB55'; portraitCtx.fill();
            portraitCtx.beginPath(); portraitCtx.arc(cx+s*25,cy-50,14,0,Math.PI*2);
            portraitCtx.fillStyle='#fff'; portraitCtx.fill();
            portraitCtx.beginPath(); portraitCtx.arc(cx+s*25,cy-48,8,0,Math.PI*2);
            portraitCtx.fillStyle='#111'; portraitCtx.fill();
        });
        portraitCtx.beginPath(); portraitCtx.arc(cx,cy+8,22,0.1*Math.PI,0.9*Math.PI);
        portraitCtx.strokeStyle='#338833'; portraitCtx.lineWidth=3; portraitCtx.stroke();
    }
    if (portraitName) portraitName.textContent = ch.name;
}

CHARACTERS.forEach((ch,i) => {
    const cell = document.createElement('div');
    cell.className = 'char-cell' + (i===0?' selected':'');
    cell.innerHTML = '<span class="char-icon">'+ch.icon+'</span><span class="char-label">'+ch.name+'</span>';
    cell.addEventListener('click', () => {
        document.querySelectorAll('.char-cell').forEach(c=>c.classList.remove('selected'));
        cell.classList.add('selected');
        selectedChar = i;
        drawPortrait(ch);
        playMenuMove();
    });
    if (charGrid) charGrid.appendChild(cell);
});
if (portraitCtx) drawPortrait(CHARACTERS[0]);

// ---- State ----
let gameState = 'menu'; // menu, city, raceIntro, racing, raceResult
let coins = 0, nearPortal = null, countdownTimer = null;
let raceCoinScore = 0;
let finishedEggs=[], playerFinished=false, trackLength=0, currentRaceIndex=-1;

// ---- Input ----
const keys={};
addEventListener('keydown',e=>{ keys[e.code]=true; if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyE','KeyF'].includes(e.code))e.preventDefault(); });
addEventListener('keyup',e=>{ keys[e.code]=false; });

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
if(jumpBtn) jumpBtn.addEventListener('touchstart',e=>{e.preventDefault();keys['Space']=true;setTimeout(()=>keys['Space']=false,120);},{passive:false});
const grabBtn=document.getElementById('grab-btn');
if(grabBtn) grabBtn.addEventListener('touchstart',e=>{e.preventDefault();keys['KeyF']=true;setTimeout(()=>keys['KeyF']=false,200);},{passive:false});


// Portal prompt removed — auto-enter on walk-in

// ============================================================
//  EGG MESH & ENTITY
// ============================================================
function createEggMesh(color, accent, charType) {
    const g = new THREE.Group();
    const bodyGeo = new THREE.SphereGeometry(0.6,20,14);
    const pos = bodyGeo.attributes.position;
    for(let i=0;i<pos.count;i++){
        let y=pos.getY(i); const t=(y+0.6)/1.2;
        const s=0.9+0.25*Math.sin(t*Math.PI)-0.08*t;
        pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.1);
    }
    bodyGeo.computeVertexNormals();
    const body=new THREE.Mesh(bodyGeo,toon(color));
    body.position.y=0.7; body.castShadow=true; g.add(body);

    // ---- Big cute eyes (on body surface) ----
    const eyeWhiteG=new THREE.SphereGeometry(0.14,12,10);
    const pupilG=new THREE.SphereGeometry(0.09,10,8);
    const shineG=new THREE.SphereGeometry(0.035,6,4);
    [-1,1].forEach(s=>{
        // White
        const ew=new THREE.Mesh(eyeWhiteG,toon(0xffffff));
        ew.position.set(s*0.22, 0.88, 0.48); ew.scale.set(1,1.15,0.7);
        body.add(ew);
        // Pupil
        const ep=new THREE.Mesh(pupilG,toon(0x111111));
        ep.position.set(s*0.22, 0.86, 0.54);
        body.add(ep);
        // Shine
        const es=new THREE.Mesh(shineG,toon(0xffffff));
        es.position.set(s*0.22+s*0.04, 0.91, 0.57);
        body.add(es);
    });

    // ---- Smile (curved tube) ----
    const smileCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.12, 0.62, 0.52),
        new THREE.Vector3(0, 0.56, 0.55),
        new THREE.Vector3(0.12, 0.62, 0.52)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 10, 0.025, 6, false);
    const smile = new THREE.Mesh(smileGeo, toon(0x333333));
    body.add(smile);

    // ---- Blush cheeks ----
    const blG=new THREE.CircleGeometry(0.1,12);
    const blM=toon(0xff7777,{transparent:true,opacity:0.45,side:THREE.DoubleSide});
    [-1,1].forEach(s=>{
        const bl=new THREE.Mesh(blG,blM);
        bl.position.set(s*0.38, 0.72, 0.42); bl.rotation.y=s*0.5;
        body.add(bl);
    });


    // ---- Character-specific features ----
    if (charType==='dog') {
        // Floppy ears
        const earG=new THREE.SphereGeometry(0.18,8,6); earG.scale(1,1.8,0.6);
        [-1,1].forEach(s=>{
            const ear=new THREE.Mesh(earG,toon(color===0xC8915A?0xA0704A:color));
            ear.position.set(s*0.42,1.05,0.1); ear.rotation.z=s*0.6;
            ear.castShadow=true; body.add(ear);
        });
        // Nose
        const nose=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),toon(0x333333));
        nose.position.set(0,0.72,0.55); body.add(nose);
    } else if (charType==='cat') {
        // Pointy ears
        const earG=new THREE.ConeGeometry(0.14,0.35,4);
        [-1,1].forEach(s=>{
            const ear=new THREE.Mesh(earG,toon(color));
            ear.position.set(s*0.32,1.2,0.1);ear.rotation.z=s*0.2;
            body.add(ear);
            const inner=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.2,4),toon(0xFFBBAA));
            inner.position.set(s*0.32,1.18,0.14);inner.rotation.z=s*0.2;
            body.add(inner);
        });
        // Whiskers
        const whG=new THREE.CylinderGeometry(0.008,0.008,0.4,3);
        [-1,1].forEach(s=>{
            for(let w=-1;w<=1;w++){
                const wh=new THREE.Mesh(whG,toon(0x888888));
                wh.position.set(s*0.35,0.7+w*0.06,0.45);
                wh.rotation.z=Math.PI/2+s*0.15+w*0.1;
                body.add(wh);
            }
        });
    } else if (charType==='monkey') {
        // Round ears
        const earG=new THREE.SphereGeometry(0.18,8,6);
        [-1,1].forEach(s=>{
            const ear=new THREE.Mesh(earG,toon(0xFFCC88));
            ear.position.set(s*0.5,0.9,0); ear.scale.z=0.5;
            body.add(ear);
            const inner=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),toon(0xD4956B));
            inner.position.set(s*0.5,0.9,0.05); inner.scale.z=0.5;
            body.add(inner);
        });
        // Muzzle
        const muz=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),toon(0xFFCC88));
        muz.position.set(0,0.65,0.45); muz.scale.set(1.2,0.8,0.6);
        body.add(muz);
    } else if (charType==='rooster') {
        // Comb
        for(let i=0;i<3;i++){
            const cb=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),toon(0xFF3333));
            cb.position.set(-0.08+i*0.08,1.25+Math.abs(i-1)*0.04,0.15);
            body.add(cb);
        }
        // Wattle
        const wat=new THREE.Mesh(new THREE.SphereGeometry(0.08,6,4),toon(0xFF3333));
        wat.position.set(0,0.52,0.5); wat.scale.y=1.5; body.add(wat);
        // Beak
        const beak=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.18,4),toon(0xFFAA00));
        beak.position.set(0,0.7,0.58); beak.rotation.x=-Math.PI/2;
        body.add(beak);
    } else if (charType==='cockroach') {
        // Antennae
        [-1,1].forEach(s=>{
            const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.008,0.6,3),toon(0x4A2A1A));
            ant.position.set(s*0.12,1.35,0.2); ant.rotation.z=s*0.4; ant.rotation.x=-0.3;
            body.add(ant);
        });
        // Shell line
        const line=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.6,0.02),toon(0x3D2215));
        line.position.set(0,0.8,-0.1); body.add(line);
        // Small legs (decorative)
        [-1,1].forEach(s=>{
            for(let j=0;j<2;j++){
                const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.25,3),toon(0x4A2A1A));
                leg.position.set(s*0.45,0.4+j*0.25,0); leg.rotation.z=s*0.8;
                body.add(leg);
            }
        });
    } else if (charType==='pig') {
        // Snout
        const snout=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.1,8),toon(0xFF99AA));
        snout.position.set(0,0.68,0.52); snout.rotation.x=Math.PI/2;
        body.add(snout);
        [-1,1].forEach(s=>{
            const nos=new THREE.Mesh(new THREE.SphereGeometry(0.035,4,4),toon(0xDD7788));
            nos.position.set(s*0.05,0.68,0.58); body.add(nos);
        });
        // Floppy ears
        const earG=new THREE.SphereGeometry(0.16,6,4); earG.scale(1,1.3,0.5);
        [-1,1].forEach(s=>{
            const ear=new THREE.Mesh(earG,toon(0xFFAABB));
            ear.position.set(s*0.35,1.1,0.1); ear.rotation.z=s*0.5;
            body.add(ear);
        });
    } else if (charType==='frog') {
        // Bulging eyes on top (override default eyes by making them bigger)
        [-1,1].forEach(s=>{
            const bulge=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),toon(color));
            bulge.position.set(s*0.22,1.1,0.3); body.add(bulge);
            const bigEye=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),toon(0xffffff));
            bigEye.position.set(s*0.22,1.12,0.38); body.add(bigEye);
            const bigPupil=new THREE.Mesh(new THREE.SphereGeometry(0.07,6,4),toon(0x111111));
            bigPupil.position.set(s*0.22,1.11,0.44); body.add(bigPupil);
        });
        // Wide mouth line
        const mouthCurve=new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-0.25,0.55,0.48),
            new THREE.Vector3(0,0.48,0.52),
            new THREE.Vector3(0.25,0.55,0.48)
        );
        const mouthGeo=new THREE.TubeGeometry(mouthCurve,10,0.02,4,false);
        body.add(new THREE.Mesh(mouthGeo,toon(0x226622)));
    }
    // ---- Feet ----
    const ftG=new THREE.SphereGeometry(0.14,8,6); ftG.scale(1.1,0.45,1.4);
    const ftM=toon(accent||0xFFCC00);
    const feet=[];
    [-1,1].forEach(s=>{ const ft=new THREE.Mesh(ftG,ftM); ft.position.set(s*0.2,0.05,0.06); ft.castShadow=true; g.add(ft); feet.push(ft); });
    g.userData.body=body; g.userData.feet=feet;
    return g;
}

const allEggs=[];
let playerEgg=null;

function createEgg(x,z,color,accent,isPlayer,targetScene,charType){
    const mesh=createEggMesh(color,accent,charType);
    mesh.position.set(x,0.01,z);
    (targetScene||scene).add(mesh);
    let arrow=null;
    if(isPlayer){
        const ag=new THREE.ConeGeometry(0.25,0.5,8);
        arrow=new THREE.Mesh(ag,toon(0xFFCC00,{emissive:0xFFCC00,emissiveIntensity:0.4}));
        arrow.rotation.x=Math.PI; arrow.position.y=2.0; mesh.add(arrow);
    }
    const egg={
        mesh, vx:0,vy:0,vz:0, onGround:false, isPlayer,
        alive:true, finished:false, finishOrder:-1,
        radius:0.55, squash:1, arrow, walkPhase:0,
        aiSkill:0.4+Math.random()*0.6,
        aiTargetX:x, aiReactTimer:Math.random()*30, aiJumpCD:0,
        conveyorVx:0, conveyorVz:0, onPlatform:null,
        heldBy:null, holding:null, grabCD:0, struggleTimer:0, struggleMax:0, struggleBar:null, throwTimer:0, holdingObs:null, holdingProp:null, weight:1.0,
    };
    allEggs.push(egg);
    return egg;
}

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

const CITY_SIZE = 80; // half-size of city ground

function buildCity() {
    // Ground — big green plaza with pattern
    const groundGeo = new THREE.PlaneGeometry(CITY_SIZE*2, CITY_SIZE*2, 16, 16);
    const ground = new THREE.Mesh(groundGeo, toon(0x6EC850));
    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true;
    cityGroup.add(ground);

    // Paths (cross pattern)
    const pathM = toon(0xDDCCAA);
    [{w:CITY_SIZE*2,d:5,x:0,z:0},{w:5,d:CITY_SIZE*2,x:0,z:0},
     {w:CITY_SIZE*1.2,d:4,x:15,z:25},{w:4,d:CITY_SIZE*1.2,x:-25,z:-10}].forEach(p=>{
        const path=new THREE.Mesh(new THREE.BoxGeometry(p.w,0.06,p.d),pathM);
        path.position.set(p.x,0.03,p.z); path.receiveShadow=true; cityGroup.add(path);
    });

    // ---- Buildings ----
    const bColors = [0xFF8888,0x88BBFF,0xFFDD66,0xAADD88,0xDDAA88,0xBB99DD,0xFF99CC,0x88DDCC,0xFFBB77,0xAABBDD];
    const buildings = [
        {x:-30,z:-30,w:8,d:8,h:10},{x:-30,z:10,w:10,d:8,h:14},{x:30,z:-30,w:8,d:10,h:12},
        {x:30,z:25,w:10,d:8,h:16},{x:-15,z:-50,w:12,d:8,h:8},{x:20,z:-50,w:8,d:8,h:11},
        {x:-50,z:-15,w:8,d:12,h:13},{x:50,z:0,w:8,d:10,h:10},{x:-50,z:30,w:10,d:8,h:9},
        {x:50,z:35,w:8,d:8,h:15},{x:0,z:-55,w:14,d:6,h:7},{x:0,z:55,w:12,d:8,h:11},
        {x:-45,z:-45,w:7,d:7,h:8},{x:45,z:-45,w:9,d:7,h:12},{x:-20,z:40,w:8,d:10,h:10},
        {x:15,z:45,w:10,d:6,h:8},
    ];
    buildings.forEach((b,i)=>{
        const col = bColors[i%bColors.length];
        const bm = new THREE.Mesh(new THREE.BoxGeometry(b.w,b.h,b.d), toon(col));
        bm.position.set(b.x, b.h/2, b.z); bm.castShadow=true; bm.receiveShadow=true;
        cityGroup.add(bm);
        const bMeshes = [bm]; // collect all meshes for this building
        // Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(b.w,b.d)*0.6, 3, 4), toon(col===0xFFDD66?0xDD4444:0xDD6644));
        roof.position.set(b.x, b.h+1.5, b.z); roof.rotation.y=Math.PI/4; roof.castShadow=true;
        cityGroup.add(roof); bMeshes.push(roof);
        // Windows
        const winM = toon(0xAADDFF, {emissive:0x4488AA, emissiveIntensity:0.2});
        for(let wy=2; wy<b.h-1; wy+=3){
            for(let wx=-b.w/2+1.5; wx<b.w/2-1; wx+=2.5){
                const win=new THREE.Mesh(new THREE.BoxGeometry(1,1.2,0.1), winM);
                win.position.set(b.x+wx, wy, b.z+b.d/2+0.05); cityGroup.add(win); bMeshes.push(win);
                const win2=new THREE.Mesh(new THREE.BoxGeometry(1,1.2,0.1), winM);
                win2.position.set(b.x+wx, wy, b.z-b.d/2-0.05); cityGroup.add(win2); bMeshes.push(win2);
            }
        }
        // Door
        const door=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.2,0.15), toon(0x885533));
        door.position.set(b.x, 1.1, b.z+b.d/2+0.07); cityGroup.add(door); bMeshes.push(door);

        cityColliders.push({x:b.x, z:b.z, hw:b.w/2+0.5, hd:b.d/2+0.5});
        cityBuildingMeshes.push({meshes:bMeshes, x:b.x, z:b.z, hw:b.w/2, hd:b.d/2, h:b.h});
    });

    // ---- Trees ----
    for(let i=0;i<40;i++){
        const tx=-CITY_SIZE+Math.random()*CITY_SIZE*2, tz=-CITY_SIZE+Math.random()*CITY_SIZE*2;
        let skip=false;
        for(const c of cityColliders) if(Math.abs(tx-c.x)<c.hw+2&&Math.abs(tz-c.z)<c.hd+2) skip=true;
        if(Math.abs(tx)<4&&Math.abs(tz)<4) skip=true;
        if(skip) continue;
        const tg=new THREE.Group(); tg.position.set(tx,0,tz);
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.3,2,6),toon(0x8B5E3C));
        trunk.position.y=1; trunk.castShadow=true; tg.add(trunk);
        const crown=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,6),toon([0x44BB44,0x33AA55,0x55CC33][i%3]));
        crown.position.y=3; crown.scale.y=0.7; crown.castShadow=true; tg.add(crown);
        cityGroup.add(tg);
        cityProps.push({group:tg, x:tx, z:tz, radius:1.2, type:'tree', grabbed:false, origY:0, throwVx:0, throwVy:0, throwVz:0, throwTimer:0, weight:3.0});
    }

// ---- Fountain in center ----
    const fBase=new THREE.Mesh(new THREE.CylinderGeometry(3,3.5,1,16),toon(0xBBBBBB));
    fBase.position.y=0.5; cityGroup.add(fBase);
    const fWater=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,0.3,16),toon(0x44AADD,{transparent:true,opacity:0.6}));
    fWater.position.y=0.9; cityGroup.add(fWater);
    const fPillar=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,3,8),toon(0xCCCCCC));
    fPillar.position.y=2.5; cityGroup.add(fPillar);
    const fTop=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6),toon(0xFFDD44));
    fTop.position.y=4.2; cityGroup.add(fTop);
    cityColliders.push({x:0,z:0,hw:4,hd:4});

    // ---- Lamp posts ----
    for(let i=0;i<20;i++){
        const lx=(Math.random()-0.5)*CITY_SIZE*1.5, lz=(Math.random()-0.5)*CITY_SIZE*1.5;
        let skip2=false;
        for(const c of cityColliders) if(Math.abs(lx-c.x)<c.hw+1&&Math.abs(lz-c.z)<c.hd+1) skip2=true;
        if(skip2) continue;
        const lg=new THREE.Group(); lg.position.set(lx,0,lz);
        const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,4,4),toon(0x555555));
        pole.position.y=2; lg.add(pole);
        const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.25,6,4),toon(0xFFEE88,{emissive:0xFFDD44,emissiveIntensity:0.3}));
        lamp.position.y=4.2; lg.add(lamp);
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
        const seat=new THREE.Mesh(new THREE.BoxGeometry(2,0.15,0.6),toon(0x8B5E3C));
        seat.position.y=0.5; bg.add(seat);
        const back=new THREE.Mesh(new THREE.BoxGeometry(2,0.8,0.1),toon(0x8B5E3C));
        back.position.y=0.9; back.position.z=-0.25; bg.add(back);
        const leg1=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.5,0.5),toon(0x555555));
        leg1.position.set(-0.8,0.25,0); bg.add(leg1);
        const leg2=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.5,0.5),toon(0x555555));
        leg2.position.set(0.8,0.25,0); bg.add(leg2);
        cityGroup.add(bg);
        cityProps.push({group:bg, x:bx, z:bz, radius:1.2, type:'bench', grabbed:false, origY:0, throwVx:0, throwVy:0, throwVz:0, throwTimer:0, weight:2.5});
    }
}

// ============================================================
//  PORTALS (race entrances in city)
// ============================================================
const RACES = [
    {name:'🌀 疯狂赛道', desc:'旋转臂与传送带！', x:-25, z:0, color:0xFF4444},
    {name:'🔨 锤子风暴', desc:'大锤与摆锤！小心！', x:25, z:0, color:0xFF8800},
    {name:'⚡ 极限挑战', desc:'所有障碍加速！', x:0, z:-35, color:0x8844FF},
    {name:'👑 冠军之路', desc:'最终决战！', x:0, z:40, color:0xFFD700},
    {name:'💎 \u7eff\u5b9d\u77f3\u5c71\u4e18', desc:'Sonic\u98ce\u683c\uff01\u91d1\u5e01\u4e0e\u5f39\u7c27\uff01', x:-55, z:-20, color:0x44DD44},
    {name:'🔥 \u706b\u7130\u5c71\u8c37', desc:'\u52a0\u901f\u5e26\u4e0e\u5ca9\u6d46\u5730\u5f62\uff01', x:55, z:-20, color:0xFF4400},
    {name:'\u2744\ufe0f \u51b0\u971c\u6ed1\u9053', desc:'\u6ed1\u51b0\u5730\u5f62\u4e0e\u5f39\u7c27\uff01', x:-60, z:50, color:0x44CCFF},
    {name:'🌈 \u5f69\u8679\u5929\u7a7a', desc:'\u7a7a\u4e2d\u5e73\u53f0\u4e0e\u91d1\u5e01\u96e8\uff01', x:60, z:50, color:0xFF88FF},
    {name:'🍄 \u8611\u83c7\u738b\u56fd', desc:'\u7ecf\u5178\u6c34\u7ba1\u4e0e\u677f\u6817\uff01', x:35, z:60, color:0x44BB44},
    {name:'🔥 \u5ca9\u6d46\u57ce\u5821', desc:'\u5ca9\u6d46\u5730\u5f62\u4e0e\u706b\u7403\uff01', x:-35, z:60, color:0xDD4400},
    {name:'\u2601\ufe0f \u4e91\u7aef\u5929\u5802', desc:'\u7a7a\u4e2d\u5e73\u53f0\u4e0e\u5f39\u7c27\uff01', x:70, z:20, color:0x88CCFF},
    {name:'🏰 \u5e93\u5df4\u57ce\u5821', desc:'\u6700\u7ec8\u5173\u5361\uff01\u5168\u969c\u788d\uff01', x:-70, z:20, color:0x884422}
];

function buildPortals() {
    RACES.forEach((race,i)=>{
        const g = new THREE.Group();
        g.position.set(race.x, 0, race.z);

        // Portal ring
        const ring = new THREE.Mesh(new THREE.TorusGeometry(2, 0.3, 8, 24), toon(race.color, {emissive:race.color, emissiveIntensity:0.3}));
        ring.position.y = 2.5; ring.castShadow = true;
        g.add(ring);

        // Swirling inner
        const inner = new THREE.Mesh(new THREE.CircleGeometry(1.7, 20), toon(race.color, {transparent:true, opacity:0.4, side:THREE.DoubleSide, emissive:race.color, emissiveIntensity:0.5}));
        inner.position.y = 2.5;
        g.add(inner);

        // Base platform
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.8, 0.4, 16), toon(0x888888));
        base.position.y = 0.2; base.receiveShadow = true;
        g.add(base);

        // Floating particles (small spheres)
        for(let p=0;p<8;p++){
            const particle = new THREE.Mesh(new THREE.SphereGeometry(0.12,4,4), toon(race.color, {emissive:race.color, emissiveIntensity:0.6}));
            particle.position.set(Math.cos(p)*1.8, 2.5+Math.sin(p*2)*0.8, Math.sin(p)*1.8);
            particle.userData.orbitPhase = p;
            g.add(particle);
        }

        cityGroup.add(g);
        portals.push({mesh:g, ring, inner, name:race.name, desc:race.desc, raceIndex:i, x:race.x, z:race.z, color:race.color});
        // No collider for portals — player walks through them to enter
    });
}

// ---- Collectible coins in city ----
function buildCityCoins() {
    for(let i=0;i<30;i++){
        const cx=(Math.random()-0.5)*CITY_SIZE*1.5, cz=(Math.random()-0.5)*CITY_SIZE*1.5;
        let skip=false;
        for(const c of cityColliders) if(Math.abs(cx-c.x)<c.hw+1&&Math.abs(cz-c.z)<c.hd+1) skip=true;
        if(skip) continue;
        const coin=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.08,12), toon(0xFFDD00,{emissive:0xFFAA00,emissiveIntensity:0.3}));
        coin.position.set(cx,1.2,cz); coin.rotation.x=Math.PI/2;
        cityGroup.add(coin);
        cityCoins.push({mesh:coin, collected:false});
    }
}

// ---- NPC eggs wandering city ----
function spawnCityNPCs() {
    for(let i=0;i<12;i++){
        const nx=(Math.random()-0.5)*50, nz=(Math.random()-0.5)*50;
        const col=AI_COLORS[i%AI_COLORS.length];
        const npc=createEgg(nx,nz,col,AI_COLORS[(i+4)%AI_COLORS.length],false,undefined,CHARACTERS[i%CHARACTERS.length].type);
        npc.cityNPC=true;
        npc.aiTargetX=nx; npc.aiTargetZ=nz;
        npc.aiWanderTimer=60+Math.random()*120;
        cityNPCs.push(npc);
    }
}

// ---- Clouds ----
function addClouds(){
    const cg=new THREE.SphereGeometry(1,8,6);
    const cm=toon(0xffffff,{transparent:true,opacity:0.85});
    for(let i=0;i<30;i++){
        const g=new THREE.Group();
        for(let j=0;j<2+Math.floor(Math.random()*3);j++){
            const s=2+Math.random()*3;
            const m=new THREE.Mesh(cg,cm);
            m.scale.set(s,s*0.45,s*0.7);
            m.position.set(j*2.5,0,Math.random()*1.5);
            g.add(m);
        }
        g.position.set((Math.random()-0.5)*200, 25+Math.random()*25, (Math.random()-0.5)*200);
        scene.add(g);
    }
}
addClouds();

// ============================================================
//  RACE TRACK SYSTEM
// ============================================================
const raceGroup = new THREE.Group();
raceGroup.visible = false;
scene.add(raceGroup);
const obstacleObjects = [];
const raceCoins = [];
const TRACK_W = 10;
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
}

function getSegAt(z){for(const s of trackSegments)if(z>=s.startZ&&z<s.endZ)return s;return trackSegments[trackSegments.length-1];}
function getHW(z){const s=getSegAt(z);return s?s.width:TRACK_W;}
function getFloorY(z,x){
    const s=getSegAt(z);
    if(!s) return 0;
    if(s.type==='platforms') return -100; // no floor — must land on moving platforms
    if(s.type==='ramp'){const t=(z-s.startZ)/(s.endZ-s.startZ);return s.startY+t*(s.endY-s.startY);}
    return s.floorY||0;
}

const FLOOR_THEMES=[[0x6EC850,0x5DB83A],[0xE8C170,0xD4A84B],[0x88BBEE,0x6699CC],[0xDD7799,0xCC5577]];

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

// ============================================================
//  PHYSICS
// ============================================================
const GRAVITY=0.018, JUMP_FORCE=0.28, MOVE_ACCEL=0.016, MAX_SPEED=0.22, FRICTION=0.92;

function updateEggPhysics(egg, isCity){if(egg.heldBy)return;
    if(!egg.alive) return;
    egg.vy -= GRAVITY;
    egg.mesh.position.x += egg.vx + (egg.conveyorVx||0);
    egg.mesh.position.y += egg.vy;
    // Thrown egg bounce
    if(egg.throwTimer>0&&egg.vy<-0.05){
        var _bFloor=0.01;
        if(!isCity){var _bgz=-egg.mesh.position.z;_bFloor=getFloorY(_bgz)+0.01;}
        if(egg.mesh.position.y<=_bFloor){
            if(egg._bounces>0){egg._bounces--;egg.vy=Math.abs(egg.vy)*0.5;egg.mesh.position.y=_bFloor;egg.squash=0.6;egg.vx*=0.75;egg.vz*=0.75;playHitSound();}
        }
    }
    egg.mesh.position.z += egg.vz + (egg.conveyorVz||0);
    egg.conveyorVx=0; egg.conveyorVz=0;

    if(isCity){
        // City ground
        if(egg.mesh.position.y<=0.01){egg.mesh.position.y=0.01;if(egg.vy<-0.1)egg.squash=0.7;egg.vy=0;egg.onGround=true;}else{egg.onGround=false;}
        // City bounds
        const bound=CITY_SIZE-1;
        if(egg.mesh.position.x>bound)egg.mesh.position.x=bound;
        if(egg.mesh.position.x<-bound)egg.mesh.position.x=-bound;
        if(egg.mesh.position.z>bound)egg.mesh.position.z=bound;
        if(egg.mesh.position.z<-bound)egg.mesh.position.z=-bound;
        // Building collisions (skip if thrown)
        if(egg.throwTimer>0){} else for(const c of cityColliders){
            const dx=egg.mesh.position.x-c.x, dz=egg.mesh.position.z-c.z;
            if(Math.abs(dx)<c.hw+egg.radius&&Math.abs(dz)<c.hd+egg.radius){
                // Push out
                const overlapX=c.hw+egg.radius-Math.abs(dx);
                const overlapZ=c.hd+egg.radius-Math.abs(dz);
                if(overlapX<overlapZ){egg.mesh.position.x+=Math.sign(dx)*overlapX;egg.vx*=-0.2;}
                else{egg.mesh.position.z+=Math.sign(dz)*overlapZ;egg.vz*=-0.2;}
            }
        }
    
        // City prop collisions (skip if thrown)
        if(egg.throwTimer<=0) for(var pi=0;pi<cityProps.length;pi++){
            var cp=cityProps[pi];
            if(cp.grabbed)continue;
            var pdx=egg.mesh.position.x-cp.group.position.x;
            var pdz=egg.mesh.position.z-cp.group.position.z;
            var pd=Math.sqrt(pdx*pdx+pdz*pdz);
            if(pd<cp.radius+egg.radius&&pd>0.01){
                // Check if egg is above the prop — stand on it
                var propTopY=cp.group.position.y+(cp.type==='bench'?0.7:cp.type==='tree'?1.5:2.5);
                if(egg.mesh.position.y>propTopY-0.3&&egg.vy<=0){
                    egg.mesh.position.y=propTopY+0.01;
                    egg.vy=0; egg.onGround=true;
                } else {
                    var pov=cp.radius+egg.radius-pd;
                    egg.mesh.position.x+=pdx/pd*pov;
                    egg.mesh.position.z+=pdz/pd*pov;
                    egg.vx*=-0.2;egg.vz*=-0.2;
                }
            }
        }
} else {
        // Race track
        const gz=-egg.mesh.position.z;
        const hw=getHW(gz), floorY=getFloorY(gz);
        if(egg.mesh.position.y<=floorY+0.01){egg.mesh.position.y=floorY+0.01;if(egg.vy<-0.1)egg.squash=0.7;egg.vy=0;egg.onGround=true;}else{egg.onGround=false;}
        // Platform check
        egg.onPlatform=null;
        for(const ob of obstacleObjects){
            if(ob.type!=='platform')continue;
            const d=ob.data, px=ob.mesh.position.x, pz=ob.mesh.position.z;
            if(Math.abs(egg.mesh.position.x-px)<d.width/2+egg.radius*0.5&&Math.abs(egg.mesh.position.z-pz)<d.depth/2+egg.radius*0.5&&egg.mesh.position.y<=d.fy+0.3&&egg.mesh.position.y>=d.fy-0.5&&egg.vy<=0){
                egg.mesh.position.y=d.fy+0.01;egg.vy=0;egg.onGround=true;egg.onPlatform=ob;
            }
        }
        if(Math.abs(egg.mesh.position.x)>hw-egg.radius){egg.mesh.position.x=Math.sign(egg.mesh.position.x)*(hw-egg.radius);egg.vx*=-0.3;}
        // Fall respawn
        if(egg.mesh.position.y<-12){
            const rz=Math.max(0,gz-3);
            egg.mesh.position.set((Math.random()-0.5)*4,getFloorY(rz)+5,-rz);
            egg.vx=0;egg.vy=0;egg.vz=0;
            if(egg.holding){var h=egg.holding;h.heldBy=null;egg.holding=null;if(h.struggleBar){h.mesh.remove(h.struggleBar);h.struggleBar=null;}}
            if(egg.holdingObs){egg.holdingObs._grabbed=false;egg.holdingObs=null;}
            if(egg.holdingProp){egg.holdingProp.grabbed=false;egg.holdingProp=null;}
            if(egg.heldBy){var hdr=egg.heldBy;hdr.holding=null;egg.heldBy=null;if(egg.struggleBar){egg.mesh.remove(egg.struggleBar);egg.struggleBar=null;}}
        }
        // Finish
        if(!egg.finished&&gz>=trackLength){
            egg.finished=true;egg.finishOrder=finishedEggs.length;finishedEggs.push(egg);
            if(egg.isPlayer)playerFinished=true;
        }
    }

    if(egg.throwTimer>0){egg.throwTimer--;egg.vx*=0.98;egg.vz*=0.98;}else{egg.vx*=FRICTION;egg.vz*=FRICTION;}

    // Walk anim
    const speed=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);
    const prevPhase=egg.walkPhase;
    if(speed>0.005&&egg.onGround)egg.walkPhase+=speed*20; else egg.walkPhase*=0.85;
    // Step sound for player
    if(egg.isPlayer&&speed>0.02&&egg.onGround){
        const prevStep=Math.floor(prevPhase/Math.PI);
        const curStep=Math.floor(egg.walkPhase/Math.PI);
        if(curStep!==prevStep) playStepSound();
    }
    const feet=egg.mesh.userData.feet, body=egg.mesh.userData.body;
    if(feet&&feet.length===2){
        const sw=Math.sin(egg.walkPhase)*0.14;
        feet[0].position.z=0.06+sw; feet[1].position.z=0.06-sw;
        feet[0].position.y=0.05+Math.max(0,Math.sin(egg.walkPhase))*0.07;
        feet[1].position.y=0.05+Math.max(0,-Math.sin(egg.walkPhase))*0.07;
    }
    if(body){const tz=Math.sin(egg.walkPhase)*speed*0.25;const tx=-speed*0.35;body.rotation.z+=(tz-body.rotation.z)*0.1;body.rotation.x+=(tx-body.rotation.x)*0.1;}

    const sq=egg.squash; egg.squash+=(1-egg.squash)*0.15;
    egg.mesh.scale.set(1+(1-sq)*0.3,sq,1+(1-sq)*0.3);

    if(speed>0.01){
        const ta=Math.atan2(egg.vx,egg.vz);
        let diff=ta-egg.mesh.rotation.y;
        while(diff>Math.PI)diff-=Math.PI*2; while(diff<-Math.PI)diff+=Math.PI*2;
        egg.mesh.rotation.y+=diff*0.15;
    }
    if(egg.arrow)egg.arrow.position.y=2.0+Math.sin(Date.now()*0.005)*0.15;
}

// ---- Egg-to-egg collision ----
function resolveEggCollisions(eggList){
    for(let i=0;i<eggList.length;i++){
        const a=eggList[i];
        if(!a.alive)continue;
        for(let j=i+1;j<eggList.length;j++){
            const b=eggList[j];
            if(!b.alive)continue;
            const dx=b.mesh.position.x-a.mesh.position.x;
            const dz=b.mesh.position.z-a.mesh.position.z;
            const dy=b.mesh.position.y-a.mesh.position.y;
            const dist=Math.sqrt(dx*dx+dz*dz+dy*dy);
            const minDist=a.radius+b.radius;
            if(dist<minDist&&dist>0.01){
                const overlap=(minDist-dist)*0.5;
                const nx=dx/dist, nz=dz/dist, ny=dy/dist;
                a.mesh.position.x-=nx*overlap;
                a.mesh.position.z-=nz*overlap;
                b.mesh.position.x+=nx*overlap;
                b.mesh.position.z+=nz*overlap;
                // Bounce velocities
                const pushStr=0.06;
                a.vx-=nx*pushStr; a.vz-=nz*pushStr;
                b.vx+=nx*pushStr; b.vz+=nz*pushStr;
                // Slight squash on contact
                a.squash=Math.min(a.squash,0.85);
                b.squash=Math.min(b.squash,0.85);
            }
        }
    }
}

// ============================================================
//  OBSTACLE UPDATE (race only)
// ============================================================
function updateObstacles(){
    for(const ob of obstacleObjects){
        if(ob.type==='spinner'){
            ob.data.angle+=ob.data.speed; ob.mesh.rotation.y=ob.data.angle;
            for(const egg of allEggs){
                if(!egg.alive||egg.finished||egg.cityNPC)continue;
                const ez=-egg.mesh.position.z;
                if(Math.abs(ez-ob.data.z)>ob.data.armLen+1)continue;
                // Full arm collision — check multiple points along each arm half
                for(const s of[-1,1]){
                    const armDirX=Math.sin(ob.data.angle)*s;
                    const armDirZ=-Math.cos(ob.data.angle)*s;
                    for(let t=0.3;t<=1.0;t+=0.2){
                        const ptX=armDirX*ob.data.armLen*t;
                        const ptZ=-(ob.data.z)+armDirZ*ob.data.armLen*t;
                        const dx=egg.mesh.position.x-ptX, ddz=egg.mesh.position.z-ptZ;
                        const dist=Math.sqrt(dx*dx+ddz*ddz);
                        if(dist<egg.radius+0.45){
                            const str=0.22+t*0.08;
                            egg.vx+=(dx/dist)*str;egg.vz+=(ddz/dist)*str;egg.vy=0.1;egg.squash=0.65;
                            if(egg.isPlayer)playHitSound();
                            break; // one hit per arm half is enough
                        }
                    }
                }
            }
        }
        if(ob.type==='hammer'){
            ob.data.angle+=ob.data.speed;
            const sa=Math.sin(ob.data.angle)*1.2; ob.swing.rotation.z=sa;
            const headX=ob.data.pivotX+Math.sin(sa)*ob.data.armLen;
            const headY=ob.data.pivotY-Math.cos(sa)*ob.data.armLen;
            for(const egg of allEggs){
                if(!egg.alive||egg.finished||egg.cityNPC)continue;
                if(Math.abs(-egg.mesh.position.z-ob.data.z)>1.5)continue;
                const dx=egg.mesh.position.x-headX,dy=egg.mesh.position.y-headY;
                const dist=Math.sqrt(dx*dx+dy*dy);
                if(dist<egg.radius+0.9){egg.vx+=dx*0.35;egg.vy=0.22;egg.vz+=(Math.random()-0.5)*0.2;egg.squash=0.55;}
            }
        }
        if(ob.type==='roller'){
            ob.mesh.rotation.x+=ob.data.speed;
            for(const egg of allEggs){
                if(!egg.alive||egg.finished||egg.cityNPC)continue;
                if(Math.abs(-egg.mesh.position.z-ob.data.z)>1.2)continue;
                if(egg.mesh.position.y<ob.data.fy+ob.data.radius*2+0.3){egg.vy=0.16;egg.vz+=0.05;egg.squash=0.7;}
            }
        }
        if(ob.type==='bumper'){
            ob.data.pulse+=0.05;const s=1+Math.sin(ob.data.pulse)*0.12;ob.mesh.scale.set(s,s,s);
            for(const egg of allEggs){
                if(!egg.alive||egg.finished||egg.cityNPC)continue;
                const dx=egg.mesh.position.x-ob.data.x,dz=egg.mesh.position.z-(-ob.data.z),dy=egg.mesh.position.y-(ob.data.fy+ob.data.radius);
                const dist=Math.sqrt(dx*dx+dz*dz+dy*dy);
                if(dist<egg.radius+ob.data.radius){egg.vx+=(dx/dist)*0.32;egg.vz+=(dz/dist)*0.32;egg.vy=0.14;egg.squash=0.65;}
            }
        }
        if(ob.type==='pendulum'){
            ob.data.angle+=ob.data.speed;
            const swA=Math.sin(ob.data.angle)*1.4; ob.arm.rotation.z=swA;
            const ballX=Math.sin(swA)*ob.data.chainLen, ballY=ob.data.pivotY-Math.cos(swA)*ob.data.chainLen;
            for(const egg of allEggs){
                if(!egg.alive||egg.finished||egg.cityNPC)continue;
                if(Math.abs(-egg.mesh.position.z-ob.data.z)>2)continue;
                const dx=egg.mesh.position.x-ballX,dy=egg.mesh.position.y-ballY;
                const dist=Math.sqrt(dx*dx+dy*dy);
                if(dist<egg.radius+1.0){egg.vx+=(dx/dist)*0.4;egg.vy=0.25;egg.vz+=(Math.random()-0.5)*0.2;egg.squash=0.5;}
            }
        }
        if(ob.type==='platform'){
            ob.data.phase+=ob.data.speed;
            const newX=Math.sin(ob.data.phase)*ob.data.moveRange;
            const deltaX=newX-ob.mesh.position.x; ob.mesh.position.x=newX;
            for(const egg of allEggs){if(egg.onPlatform===ob)egg.mesh.position.x+=deltaX;}
        }
        if(ob.type==='conveyor'){
            for(const egg of allEggs){
                if(!egg.alive||egg.finished||egg.cityNPC)continue;
                const ez=-egg.mesh.position.z;
                if(Math.abs(ez-ob.data.z)<ob.data.halfLen&&Math.abs(egg.mesh.position.x)<ob.data.halfW&&egg.onGround){
                    egg.conveyorVx=ob.data.pushX; egg.conveyorVz=ob.data.pushZ;
                }
            }
        }
        if(ob.type==='fallingBlock'){
            const d=ob.data;
            if(d.onGround){d.resetTimer--;if(d.resetTimer<=0){d.onGround=false;d.falling=false;d.fallSpeed=0;d.timer=80+Math.random()*100;ob.mesh.position.y=d.baseY;ob.shadow.material.opacity=0;}}
            else if(d.falling){
                d.fallSpeed+=0.02;ob.mesh.position.y-=d.fallSpeed;
                ob.shadow.material.opacity=Math.min(0.5,ob.shadow.material.opacity+0.02);
                if(ob.mesh.position.y<=d.fy+d.size/2){
                    ob.mesh.position.y=d.fy+d.size/2;d.onGround=true;d.resetTimer=90;
                    for(const egg of allEggs){
                        if(!egg.alive||egg.finished||egg.cityNPC)continue;
                        const dx=egg.mesh.position.x-d.x,dz=egg.mesh.position.z-(-d.z);
                        if(Math.abs(dx)<d.size*0.7&&Math.abs(dz)<d.size*0.7&&egg.mesh.position.y<d.fy+d.size+0.5){
                            egg.vy=0.3;egg.vx+=dx*0.3;egg.vz+=dz*0.3;egg.squash=0.4;
                        }
                    }
                }
            } else {
                d.timer--;
                if(d.timer<=d.warningTime){ob.mesh.position.x=d.x+(Math.random()-0.5)*0.3;ob.shadow.material.opacity=0.15+Math.sin(d.timer*0.5)*0.1;}
                if(d.timer<=0){d.falling=true;d.fallSpeed=0;ob.mesh.position.x=d.x;}
            }
        }
            if(ob.type==='boost'){
            ob.data._pulse=(ob.data._pulse||0)+0.06;
            const glow=0.3+Math.sin(ob.data._pulse)*0.2;
            ob.mesh.material.emissiveIntensity=glow;
            for(const egg of allEggs){
                if(!egg.alive||egg.finished||egg.cityNPC)continue;
                const ez=-egg.mesh.position.z;
                if(Math.abs(ez-ob.data.z)<ob.data.halfD&&Math.abs(egg.mesh.position.x)<ob.data.halfW&&egg.onGround){
                    egg.vz-=ob.data.strength; egg.squash=0.8;
                }
            }
        }
        if(ob.type==='spring'){
            ob.data.anim*=0.92;
            ob.mesh.scale.y=1-ob.data.anim*0.3;
            for(const egg of allEggs){
                if(!egg.alive||egg.finished||egg.cityNPC)continue;
                const dx=egg.mesh.position.x-ob.data.x;
                const dz=egg.mesh.position.z-(-ob.data.z);
                const dist=Math.sqrt(dx*dx+dz*dz);
                if(dist<ob.data.radius+egg.radius&&egg.onGround&&egg.mesh.position.y<ob.data.fy+1.5){
                    egg.vy=ob.data.jumpForce;
                    egg.vz-=0.08;
                    egg.squash=0.5;
                    ob.data.anim=1;
                    if(egg.isPlayer)playJumpSound();
                }
            }
        }
        if(ob.type==='pipe'){
            for(const egg of allEggs){
                if(!egg.alive||egg.finished||egg.cityNPC)continue;
                const dx=egg.mesh.position.x-ob.data.x;
                const dz=egg.mesh.position.z-(-ob.data.z);
                const dist=Math.sqrt(dx*dx+dz*dz);
                if(dist<ob.data.radius+egg.radius&&egg.mesh.position.y<ob.data.fy+ob.data.height){
                    const push=ob.data.radius+egg.radius-dist;
                    if(dist>0.01){egg.mesh.position.x+=dx/dist*push;egg.mesh.position.z+=dz/dist*push;}
                    egg.vx+=(dx/(dist||1))*0.08;egg.vz+=(dz/(dist||1))*0.08;
                }
                // Stand on top of pipe
                if(dist<ob.data.radius&&egg.mesh.position.y>=ob.data.fy+ob.data.height-0.5&&egg.vy<=0){
                    egg.mesh.position.y=ob.data.fy+ob.data.height+0.42;egg.vy=0;egg.onGround=true;
                }
            }
        }
        if(ob.type==='goomba'){
            ob.data.phase+=ob.data.walkSpeed;
            var gx=ob.data.startX+Math.sin(ob.data.phase)*ob.data.walkRange;
            ob.mesh.position.x=gx; ob.data.x=gx;
            // Waddle animation
            ob.mesh.rotation.z=Math.sin(ob.data.phase*3)*0.15;
            ob.mesh.children.forEach(function(ch,ci){if(ci>=5){ch.position.y=0.08+Math.abs(Math.sin(ob.data.phase*3+ci))*0.06;}});
            for(const egg of allEggs){
                if(!egg.alive||egg.finished||egg.cityNPC)continue;
                const dx=egg.mesh.position.x-gx;
                const dz=egg.mesh.position.z-(-ob.data.z);
                const dist=Math.sqrt(dx*dx+dz*dz);
                if(dist<ob.data.radius+egg.radius){
                    // If egg is above goomba — stomp it (bounce)
                    if(egg.mesh.position.y>ob.data.fy+0.8&&egg.vy<0){
                        egg.vy=0.3;egg.squash=0.6;
                        ob.mesh.scale.y=0.2;ob.mesh.position.y=ob.data.fy-0.3;
                        ob.data._squashed=true;ob.data._respawn=180;
                        if(egg.isPlayer)playCoinSound();
                    } else if(!ob.data._squashed){
                        // Hit from side — knockback
                        egg.vx+=(dx/(dist||1))*0.25;egg.vz+=(dz/(dist||1))*0.25;
                        egg.vy=0.12;egg.squash=0.65;
                        if(egg.isPlayer)playHitSound();
                    }
                }
            }
            // Respawn squashed goomba
            if(ob.data._squashed){
                ob.data._respawn--;
                if(ob.data._respawn<=0){ob.data._squashed=false;ob.mesh.scale.y=1;ob.mesh.position.y=ob.data.fy;}
            }
        }

    }
}

// ============================================================
//  AI
// ============================================================
function updateCityNPC(egg){if(egg.heldBy)return;
    if(!egg.alive)return;
    // Initialize AI state if needed
    if(!egg._aiState){
        var states=['wander','idle','chase','flee','dance','circle'];
        egg._aiState=states[Math.floor(Math.random()*3)]; // start with wander/idle/chase
        egg._aiStateTimer=60+Math.random()*120;
        egg._dancePhase=Math.random()*Math.PI*2;
        egg._circleAngle=Math.random()*Math.PI*2;
        egg._circleCenter={x:egg.mesh.position.x,z:egg.mesh.position.z};
        egg._idleAction=0;egg._idleTimer=0;
    }
    egg._aiStateTimer--;
    // Switch state randomly
    if(egg._aiStateTimer<=0){
        var r=Math.random();
        if(r<0.3) egg._aiState='wander';
        else if(r<0.45) egg._aiState='idle';
        else if(r<0.6) egg._aiState='chase';
        else if(r<0.72) egg._aiState='flee';
        else if(r<0.84) egg._aiState='dance';
        else egg._aiState='circle';
        egg._aiStateTimer=80+Math.random()*200;
        egg._circleCenter={x:egg.mesh.position.x,z:egg.mesh.position.z};
        egg._circleAngle=Math.random()*Math.PI*2;
    }
    var st=egg._aiState;
    if(st==='wander'){
        egg.aiWanderTimer--;
        if(egg.aiWanderTimer<=0){
            egg.aiWanderTimer=60+Math.random()*120;
            egg.aiTargetX=(Math.random()-0.5)*55;
            egg.aiTargetZ=(Math.random()-0.5)*55;
        }
        var dx=egg.aiTargetX-egg.mesh.position.x, dz=egg.aiTargetZ-egg.mesh.position.z;
        var dist=Math.sqrt(dx*dx+dz*dz);
        if(dist>1.5){egg.vx+=(dx/dist)*MOVE_ACCEL*0.3;egg.vz+=(dz/dist)*MOVE_ACCEL*0.3;}
        if(egg.onGround&&Math.random()<0.003){egg.vy=JUMP_FORCE*0.6;egg.squash=0.7;}
    } else if(st==='idle'){
        // Stand still, occasionally look around (small random nudges) or jump
        egg.vx*=0.9;egg.vz*=0.9;
        egg._idleTimer--;
        if(egg._idleTimer<=0){
            egg._idleAction=Math.floor(Math.random()*4);
            egg._idleTimer=30+Math.random()*60;
        }
        if(egg._idleAction===1){egg.mesh.rotation.y+=0.03;} // look around
        else if(egg._idleAction===2){egg.mesh.rotation.y-=0.03;}
        else if(egg._idleAction===3&&egg.onGround&&Math.random()<0.02){egg.vy=JUMP_FORCE*0.4;egg.squash=0.8;} // small hop
    } else if(st==='chase'){
        // Chase nearest other NPC or player
        var closest=null,closeDist=20;
        for(var ci=0;ci<allEggs.length;ci++){
            var other=allEggs[ci];
            if(other===egg||!other.alive||other.heldBy)continue;
            var cdx=other.mesh.position.x-egg.mesh.position.x;
            var cdz=other.mesh.position.z-egg.mesh.position.z;
            var cd=Math.sqrt(cdx*cdx+cdz*cdz);
            if(cd<closeDist){closeDist=cd;closest=other;}
        }
        if(closest){
            var cdx2=closest.mesh.position.x-egg.mesh.position.x;
            var cdz2=closest.mesh.position.z-egg.mesh.position.z;
            var cd2=Math.sqrt(cdx2*cdx2+cdz2*cdz2);
            if(cd2>2){egg.vx+=(cdx2/cd2)*MOVE_ACCEL*0.4;egg.vz+=(cdz2/cd2)*MOVE_ACCEL*0.4;}
            if(cd2<3&&egg.onGround&&Math.random()<0.01){egg.vy=JUMP_FORCE*0.7;egg.squash=0.65;}
        }
    } else if(st==='flee'){
        // Run away from nearest egg
        var nearest2=null,nearDist2=15;
        for(var fi=0;fi<allEggs.length;fi++){
            var fo=allEggs[fi];
            if(fo===egg||!fo.alive)continue;
            var fdx=fo.mesh.position.x-egg.mesh.position.x;
            var fdz=fo.mesh.position.z-egg.mesh.position.z;
            var fd=Math.sqrt(fdx*fdx+fdz*fdz);
            if(fd<nearDist2){nearDist2=fd;nearest2=fo;}
        }
        if(nearest2&&nearDist2<12){
            var fdx2=egg.mesh.position.x-nearest2.mesh.position.x;
            var fdz2=egg.mesh.position.z-nearest2.mesh.position.z;
            var fd2=Math.sqrt(fdx2*fdx2+fdz2*fdz2)||1;
            egg.vx+=(fdx2/fd2)*MOVE_ACCEL*0.45;egg.vz+=(fdz2/fd2)*MOVE_ACCEL*0.45;
        }
        if(egg.onGround&&Math.random()<0.008){egg.vy=JUMP_FORCE*0.8;egg.squash=0.6;}
    } else if(st==='dance'){
        // Bounce in place with spinning
        egg.vx*=0.85;egg.vz*=0.85;
        egg._dancePhase+=0.12;
        egg.mesh.rotation.y+=0.08;
        if(egg.onGround&&Math.sin(egg._dancePhase)>0.7){egg.vy=JUMP_FORCE*0.45;egg.squash=0.75;}
    } else if(st==='circle'){
        // Walk in circles
        egg._circleAngle+=0.02+Math.random()*0.005;
        var cr=4+Math.random()*2;
        var tx=egg._circleCenter.x+Math.cos(egg._circleAngle)*cr;
        var tz=egg._circleCenter.z+Math.sin(egg._circleAngle)*cr;
        var cdx3=tx-egg.mesh.position.x, cdz3=tz-egg.mesh.position.z;
        var cd3=Math.sqrt(cdx3*cdx3+cdz3*cdz3);
        if(cd3>0.5){egg.vx+=(cdx3/cd3)*MOVE_ACCEL*0.35;egg.vz+=(cdz3/cd3)*MOVE_ACCEL*0.35;}
        if(egg.onGround&&Math.random()<0.004){egg.vy=JUMP_FORCE*0.5;egg.squash=0.7;}
    }
    var spd=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);
    var maxSpd=st==='flee'?MAX_SPEED*0.7:st==='chase'?MAX_SPEED*0.6:MAX_SPEED*0.45;
    if(spd>maxSpd){egg.vx=(egg.vx/spd)*maxSpd;egg.vz=(egg.vz/spd)*maxSpd;}
}

function updateRaceAI(egg){
    if(!egg.alive||egg.finished||egg.isPlayer||egg.cityNPC)return;
    egg.aiReactTimer--;
    if(egg.aiReactTimer<=0){egg.aiReactTimer=8+Math.random()*18;egg.aiTargetX=(Math.random()-0.5)*5;}
    egg.vz-=MOVE_ACCEL*(0.55+egg.aiSkill*0.55);
    const dx=egg.aiTargetX-egg.mesh.position.x;
    egg.vx+=Math.sign(dx)*MOVE_ACCEL*0.5;
    const ez=-egg.mesh.position.z;
    for(const ob of obstacleObjects){
        const dz=Math.abs(ez-(ob.data.z||0));
        if(dz>8)continue;
        if(ob.type==='spinner'&&dz<6){
            const tipX=Math.sin(ob.data.angle)*ob.data.armLen;
            if(Math.abs(egg.mesh.position.x-tipX)<2.5)egg.vx+=(egg.mesh.position.x>tipX?1:-1)*MOVE_ACCEL*egg.aiSkill*1.2;
        }
        if(ob.type==='bumper'&&dz<4&&Math.abs(egg.mesh.position.x-ob.data.x)<2)
            egg.vx+=(egg.mesh.position.x>ob.data.x?1:-1)*MOVE_ACCEL*0.9;
        if(ob.type==='roller'&&dz<3){
            egg.aiJumpCD--;
            if(egg.aiJumpCD<=0&&egg.onGround&&Math.random()<egg.aiSkill*0.4){egg.vy=JUMP_FORCE*(0.7+egg.aiSkill*0.3);egg.aiJumpCD=25;}
        }
        if(ob.type==='pendulum'&&dz<5){
            const ballX=Math.sin(ob.data.angle*1.4)*ob.data.chainLen;
            if(Math.abs(egg.mesh.position.x-ballX)<2)egg.vx+=(egg.mesh.position.x>ballX?1:-1)*MOVE_ACCEL*egg.aiSkill;
        }
        if(ob.type==='platform'&&dz<4)egg.vx+=(ob.mesh.position.x-egg.mesh.position.x)*0.02*egg.aiSkill;
        if(ob.type==='conveyor'&&dz<ob.data.halfLen)egg.vx-=ob.data.pushX*0.3*egg.aiSkill;
        if(ob.type==='fallingBlock'&&dz<3&&ob.data.timer<ob.data.warningTime&&Math.abs(egg.mesh.position.x-ob.data.x)<ob.data.size)

        if(ob.type==='spring'&&dz<2&&Math.abs(egg.mesh.position.x-(ob.data.x||0))<1.5&&egg.onGround){
            egg.vy=ob.data.jumpForce*0.9;
        }

        if(ob.type==='pipe'&&dz<4&&Math.abs(egg.mesh.position.x-(ob.data.x||0))<2)
            egg.vx+=(egg.mesh.position.x>(ob.data.x||0)?1:-1)*MOVE_ACCEL*egg.aiSkill*1.5;
        if(ob.type==='goomba'&&dz<3&&!ob.data._squashed){
            var gdx=egg.mesh.position.x-(ob.data.x||0);
            if(Math.abs(gdx)<2){
                if(egg.onGround&&Math.random()<egg.aiSkill*0.15){egg.vy=JUMP_FORCE*0.9;egg.aiJumpCD=25;}
                else egg.vx+=(gdx>0?1:-1)*MOVE_ACCEL*0.8;
            }
        }
            egg.vx+=(egg.mesh.position.x>ob.data.x?1:-1)*MOVE_ACCEL*1.5;
    }
    egg.aiJumpCD--;
    if(egg.aiJumpCD<=0&&egg.onGround&&Math.random()<0.008*egg.aiSkill){egg.vy=JUMP_FORCE*0.85;egg.aiJumpCD=35;}
    const spd=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);
    if(spd>MAX_SPEED){egg.vx=(egg.vx/spd)*MAX_SPEED;egg.vz=(egg.vz/spd)*MAX_SPEED;}
}

// ============================================================
//  PLAYER INPUT
// ============================================================
function handlePlayerInput(){
    if(!playerEgg||!playerEgg.alive)return;
    if(_portalConfirmOpen)return;
    if(playerEgg.finished&&gameState==='racing')return;
    let mx=0,mz=0;
    if(keys['KeyA']||keys['ArrowLeft'])mx-=1;
    if(keys['KeyD']||keys['ArrowRight'])mx+=1;
    if(keys['KeyW']||keys['ArrowUp'])mz-=1;
    if(keys['KeyS']||keys['ArrowDown'])mz+=1;
    if(joyActive){mx+=joyVec.x;mz+=joyVec.y;}
    const len=Math.sqrt(mx*mx+mz*mz);
    if(len>0.1){mx/=len;mz/=len;playerEgg.vx+=mx*MOVE_ACCEL;playerEgg.vz+=mz*MOVE_ACCEL;}
    if(keys['Space']&&playerEgg.onGround){playerEgg.vy=JUMP_FORCE;playerEgg.squash=0.65;playJumpSound();}
    const spd=Math.sqrt(playerEgg.vx*playerEgg.vx+playerEgg.vz*playerEgg.vz);
    if(spd>MAX_SPEED){playerEgg.vx=(playerEgg.vx/spd)*MAX_SPEED;playerEgg.vz=(playerEgg.vz/spd)*MAX_SPEED;}
    // Grab / Throw (F key or touch grab button)
    if(playerEgg.grabCD>0) playerEgg.grabCD--;
    if(keys['KeyF']&&playerEgg.grabCD<=0){
        if(playerEgg.holdingProp){
            // Throw city prop
            var prop=playerEgg.holdingProp;
            playerEgg.holdingProp=null;
            var dir1=playerEgg.mesh.rotation.y;
            var pw=prop.weight||1.0;var pf=2.5/pw;prop.throwVx=Math.sin(dir1)*pf;prop.throwVy=0.18;prop.throwVz=Math.cos(dir1)*pf;prop._bounces=2;prop.throwTimer=25;
            prop.group.position.set(playerEgg.mesh.position.x+Math.sin(dir1)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir1)*1.5);
            playerEgg.grabCD=20; playThrowSound(); keys['KeyF']=false;
        } else if(playerEgg.holdingObs){
            // Throw obstacle
            var obs=playerEgg.holdingObs;
            playerEgg.holdingObs=null;
            obs._grabbed=false;
            var dir0=playerEgg.mesh.rotation.y;
            obs.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir0)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir0)*1.5);
            var ow=obs._weight||2.0;var of2=4.5/ow;obs._throwVx=Math.sin(dir0)*of2;obs._throwVy=0.18;obs._throwVz=Math.cos(dir0)*of2;obs._throwTimer=Math.floor(50+20/ow);obs._bounces=2;
            playerEgg.grabCD=20; playThrowSound(); keys['KeyF']=false;
        } else if(playerEgg.holding){
            var held=playerEgg.holding;
            held.heldBy=null; playerEgg.holding=null; if(held.struggleBar){held.mesh.remove(held.struggleBar);held.struggleBar=null;}
            var dir=playerEgg.mesh.rotation.y;
            held.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir)*2, playerEgg.mesh.position.y+2.0, playerEgg.mesh.position.z+Math.cos(dir)*2);
            var tw=held.weight||1.0;var tf=9.0/tw;held.vx=Math.sin(dir)*tf;held.vy=0.22;held.vz=Math.cos(dir)*tf;held._throwTotal=120;held.throwTimer=120;held._bounces=2;
            held.squash=0.5; playerEgg.grabCD=20;
            playThrowSound(); keys['KeyF']=false;
        } else {
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
                nearest.struggleMax=300+Math.floor(Math.random()*240); nearest.struggleTimer=nearest.struggleMax;
                playerEgg.grabCD=20; playGrabSound();
            } else {
                // Try grab obstacle
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
                    playerEgg.grabCD=20; playGrabSound();
                } else if(gameState==='city'){
                    // Try grab city prop
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
                        playerEgg.grabCD=20; playGrabSound();
                    }
                }
            }
            keys['KeyF']=false;
        }
    }
}

// ============================================================
//  CAMERA
// ============================================================
function updateCamera(){
    if(!playerEgg)return;
    const p=playerEgg.mesh.position;
    // Camera follows directly behind and above the player
    const tx=p.x, ty=p.y+10, tz=p.z+14;
    camera.position.x+=(tx-camera.position.x)*0.08;
    camera.position.y+=(ty-camera.position.y)*0.08;
    camera.position.z+=(tz-camera.position.z)*0.08;
    camera.lookAt(p.x, p.y+1, p.z-4);
    sun.position.set(p.x+30,50,p.z+30);
    sun.target.position.set(p.x,0,p.z);

    // Building occlusion — fade buildings between camera and player
    if(gameState==='city'){
        const cx=camera.position.x, cz=camera.position.z;
        const px2=p.x, pz2=p.z;
        for(const bld of cityBuildingMeshes){
            // 2D line-segment (camera→player) vs AABB intersection in XZ
            let shouldFade=false;
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

// ============================================================
//  CITY UPDATE (portals, coins, NPCs)
// ============================================================
function updateCity(){
    if(!playerEgg)return;
    const px=playerEgg.mesh.position.x, pz=playerEgg.mesh.position.z;

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

    // Check portal proximity — show prompt on base, enter when walk into ring
    var _pp=document.getElementById('portal-prompt');
    var _pt=document.getElementById('portal-prompt-text');
    var _nearP=null, _nearD=9999;
    for(var pi=0;pi<portals.length;pi++){
        var _dx=px-portals[pi].x, _dz=pz-portals[pi].z;
        var _d=Math.sqrt(_dx*_dx+_dz*_dz);
        if(_d<_nearD){_nearD=_d;_nearP=portals[pi];}
    }
    if(_nearP&&_nearD<6.0){
        _pp.style.display='block';
        if(_nearD<1.2&&!_portalConfirmOpen){
            _pp.style.display='none';
            showPortalConfirm(_nearP);
        } else if(!_portalConfirmOpen){
            _pt.textContent=_nearP.name+' \u2014 '+_nearP.desc+'  (\u8d70\u8fd1\u8fdb\u5165)';
        }
    } else if(!_portalConfirmOpen){
        _pp.style.display='none';
    }

    // Coins
    for(const c of cityCoins){
        if(c.collected)continue;
        c.mesh.rotation.y+=0.03;
        c.mesh.position.y=1.2+Math.sin(Date.now()*0.003+c.mesh.position.x)*0.2;
        const dx=px-c.mesh.position.x, dz=pz-c.mesh.position.z;
        if(Math.sqrt(dx*dx+dz*dz)<1.2){
            c.collected=true; c.mesh.visible=false;
            coins++; document.getElementById('coin-hud').textContent='⭐ '+coins;
            playCoinSound();
        }
    }

    // NPC AI
    for(const npc of cityNPCs){
        updateCityNPC(npc);
        updateEggPhysics(npc, true);
    }
}

// ---- Struggle bar (HTML overlay) ----
var struggleBarDiv=null;
function ensureStruggleBar(){
    if(struggleBarDiv)return;
    struggleBarDiv=document.createElement('div');
    struggleBarDiv.id='struggle-bar-container';
    struggleBarDiv.style.cssText='position:absolute;top:18%;left:50%;transform:translateX(-50%);z-index:15;pointer-events:none;display:none;text-align:center;';
    struggleBarDiv.innerHTML='<div style="color:#fff;font-size:13px;font-weight:700;text-shadow:1px 1px 0 #000;margin-bottom:4px">🔥 挣扎中！疯狂按方向键！</div><div style="width:180px;height:14px;background:rgba(0,0,0,0.5);border-radius:7px;border:2px solid rgba(255,255,255,0.3);overflow:hidden"><div id="struggle-fill" style="height:100%;background:linear-gradient(90deg,#FF4444,#FFAA00);border-radius:5px;width:100%;transition:width 0.05s"></div></div>';
    document.getElementById('game-container').appendChild(struggleBarDiv);
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
            continue;
        }
        var holder=egg.heldBy;
        // Position on holder head
        egg.mesh.position.x=holder.mesh.position.x;
        egg.mesh.position.y=holder.mesh.position.y+1.7;
        egg.mesh.position.z=holder.mesh.position.z;
        egg.vx=0;egg.vy=0;egg.vz=0;
        egg.mesh.rotation.y=holder.mesh.rotation.y;
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
            var ntw=egg.weight||1.0;var ntf=9.0/ntw;egg.vx=Math.sin(throwDir)*ntf;egg.vy=0.22;egg.vz=Math.cos(throwDir)*ntf;egg._throwTotal=120;egg.throwTimer=120;egg._bounces=2;
            egg.squash=0.5; playThrowSound();
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
                bg.position.y=2.2;
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
        // Struggle animation — wobble and shake
        var t=Date.now()*0.012;
        egg.mesh.rotation.z=Math.sin(t*3.7)*0.4;
        egg.mesh.rotation.x=Math.sin(t*2.9)*0.3;
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
        struggleBarDiv.style.display='none';
    }
    // ---- NPC grab AI (low chance, very close range) ----
    for(var n=0;n<allEggs.length;n++){
        var npc=allEggs[n];
        if(npc.isPlayer||!npc.alive||npc.heldBy||npc.holding||npc.grabCD>0)continue;
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
            npc.grabCD=30;
            best.struggleMax=240+Math.floor(Math.random()*240);
            best.struggleTimer=best.struggleMax;
            playGrabSound();
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
        tp.group.position.x+=tp.throwVx;
        tp.group.position.y+=tp.throwVy;
        tp.group.position.z+=tp.throwVz;
        tp.throwVy-=0.012*(tp.weight||1);
        tp.throwVx*=0.92; tp.throwVz*=0.92;
        tp.group.rotation.x+=0.25; tp.group.rotation.z+=0.2;
        if(tp.group.position.y<0.01&&tp.throwVy<0){
            if(tp._bounces>0){tp._bounces--;tp.throwVy=Math.abs(tp.throwVy)*0.45;tp.throwVx*=0.7;tp.throwVz*=0.7;tp.group.position.y=0.01;playHitSound();}
            else{tp.group.position.y=0.01;tp.throwTimer=0;tp.grabbed=false;tp.group.rotation.set(0,0,0);tp.x=tp.group.position.x;tp.z=tp.group.position.z;}
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
                if(tpeg.isPlayer)playHitSound();
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
        tob._throwVx*=0.96; tob._throwVz*=0.96;
        if(tob.mesh.position.y<(tob.data.fy||0)+0.5&&tob._throwVy<0){
            if(tob._bounces>0){tob._bounces--;tob._throwVy=Math.abs(tob._throwVy)*0.45;tob._throwVx*=0.7;tob._throwVz*=0.7;tob.mesh.position.y=(tob.data.fy||0)+0.5;playHitSound();}
            else{tob.mesh.position.y=(tob.data.fy||0)+0.5;tob._throwTimer=0;}
        }
        // Hit other eggs with thrown obstacle
        for(var te=0;te<allEggs.length;te++){
            var teg=allEggs[te];
            if(!teg.alive||teg.heldBy)continue;
            var tdx=teg.mesh.position.x-tob.mesh.position.x;
            var tdz=teg.mesh.position.z-tob.mesh.position.z;
            if(Math.sqrt(tdx*tdx+tdz*tdz)<1.5){
                var oiw=tob._weight||2;teg.vx+=tdx*0.35*oiw;teg.vz+=tdz*0.35*oiw;teg.vy=0.3+0.12*oiw;teg.squash=0.4;teg.throwTimer=15;teg._bounces=1;if(teg.isPlayer)playHitSound();
            }
        }
        if(tob._throwTimer<=0){
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
var _portalConfirmOpen=false, _portalConfirmRace=-1;
function showPortalConfirm(portal){
    _portalConfirmOpen=true;
    _portalConfirmRace=portal.raceIndex;
    var box=document.getElementById('portal-confirm');
    document.getElementById('portal-confirm-name').textContent=portal.name;
    document.getElementById('portal-confirm-desc').textContent=portal.desc;
    box.style.display='flex';
}
function hidePortalConfirm(){
    _portalConfirmOpen=false;
    _portalConfirmRace=-1;
    document.getElementById('portal-confirm').style.display='none';
}
function confirmPortalEnter(){
    var ri=_portalConfirmRace;
    hidePortalConfirm();
    document.getElementById('portal-prompt').style.display='none';
    if(ri>=0) enterRace(ri);
}
document.getElementById('portal-yes').addEventListener('click',confirmPortalEnter);
document.getElementById('portal-no').addEventListener('click',hidePortalConfirm);
addEventListener('keydown',function(e){
    if(!_portalConfirmOpen)return;
    if(e.code==='KeyY'||e.code==='Enter'||e.code==='Space'){e.preventDefault();confirmPortalEnter();}
    if(e.code==='KeyN'||e.code==='Escape'){e.preventDefault();hidePortalConfirm();}
});
// Result screen — Enter/Space to go back to city
addEventListener('keydown',function(e){
    if(gameState!=='raceResult')return;
    if(e.code==='Enter'||e.code==='Space'){e.preventDefault();goBackToCity();}
});

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
    showScreen(null);
    stopSelectBGM();
    startBGM();
    document.getElementById('city-hud').classList.remove('hidden');
    document.getElementById('race-hud').classList.add('hidden');
    if('ontouchstart' in window) document.getElementById('touch-controls').classList.remove('hidden');

    cityGroup.visible=true; raceGroup.visible=false;
    clearRace();

    // Clear all NPC grab/held states to prevent invisible grabs
    for(var ni=0;ni<cityNPCs.length;ni++){
        var npc=cityNPCs[ni];
        npc.holding=null;npc.heldBy=null;npc.holdingObs=null;npc.holdingProp=null;
        npc.throwTimer=0;npc.grabCD=60;npc.finished=false;
        if(npc.struggleBar){try{npc.mesh.remove(npc.struggleBar);}catch(e){}npc.struggleBar=null;}
    }

    // Create player in city
    var sx=(spawnX!==undefined)?spawnX:0;
    var sz=(spawnZ!==undefined)?spawnZ:5;
    const skin=CHARACTERS[selectedChar];
    playerEgg=createEgg(sx,sz,skin.color,skin.accent,true,undefined,skin.type);
    playerEgg.finished=false;playerEgg.alive=true;
    camera.position.set(sx,12,sz+14); camera.lookAt(sx,0,sz);
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

    // Show countdown then start
    gameState='raceIntro';
    const race=RACES[raceIndex];
    document.getElementById('round-label').textContent=race.name;
    document.getElementById('round-name').textContent=race.desc;
    document.getElementById('round-desc').textContent='冲向终点！';
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
            if('ontouchstart' in window) document.getElementById('touch-controls').classList.remove('hidden');
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
    document.getElementById('result-title').textContent=won?'第'+place+'名 · 晋级！':'被淘汰了！';
    document.getElementById('result-sub').textContent=won?'获得 ⭐×3 + 🪙×'+raceCoinScore:'再接再厉！';
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
    document.getElementById('place-hud').textContent='📍 第'+place+'名';
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
                playHitSound();
            }
        }
    }
}
// ============================================================
//  MAIN LOOP
// ============================================================
const clock = new THREE.Clock();

function animate(){
    requestAnimationFrame(animate);
    const dt=Math.min(clock.getDelta(),0.05);

    if(gameState==='city'){
        handlePlayerInput();
        if(playerEgg) updateEggPhysics(playerEgg, true);
        updateCity();
        const cityEggList = [playerEgg, ...cityNPCs].filter(e=>e&&e.alive);
        resolveEggCollisions(cityEggList);
        checkThrownEggImpact(cityEggList);
        updateHeldEggs();
        updateCamera();
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

    R.render(scene,camera);
    // Update grab button text
    if(grabBtn&&playerEgg){if(playerEgg.holding){grabBtn.textContent='扔';grabBtn.classList.add('holding');}else{grabBtn.textContent='抓';grabBtn.classList.remove('holding');}}
}

// ============================================================
//  INIT
// ============================================================
buildCity();
buildPortals();
buildCityCoins();


// Start button
document.getElementById('start-btn').addEventListener('click',()=>{
    showScreen('select-screen');
    ensureAudio(); startSelectBGM();
    playMenuConfirm();
});

document.getElementById('confirm-btn').addEventListener('click',()=>{
    playMenuConfirm();
    stopSelectBGM();
    showScreen(null);
    spawnCityNPCs();
    enterCity();
});

// Keyboard navigation for menus
function selectCharByIndex(idx){
    if(idx<0)idx=CHARACTERS.length-1;
    if(idx>=CHARACTERS.length)idx=0;
    selectedChar=idx;
    document.querySelectorAll('.char-cell').forEach((c,i)=>{c.classList.toggle('selected',i===idx);});
    drawPortrait(CHARACTERS[idx]);
}
addEventListener('keydown',function(e){
    if(gameState==='menu'){
        if(e.code==='Enter'||e.code==='Space'){
            e.preventDefault();
            var ss=document.getElementById('start-screen');
            if(ss&&ss.classList.contains('active')){
                showScreen('select-screen');ensureAudio();startSelectBGM();playMenuConfirm();
            } else {
                var sel=document.getElementById('select-screen');
                if(sel&&sel.classList.contains('active')){
                    playMenuConfirm(); stopSelectBGM(); showScreen(null); spawnCityNPCs(); enterCity();
                }
            }
        }
        var sel2=document.getElementById('select-screen');
        if(sel2&&sel2.classList.contains('active')){
            if(e.code==='ArrowRight'||e.code==='KeyD'){e.preventDefault();selectCharByIndex(selectedChar+1);playMenuMove();}
            if(e.code==='ArrowLeft'||e.code==='KeyA'){e.preventDefault();selectCharByIndex(selectedChar-1);playMenuMove();}
            if(e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();selectCharByIndex(selectedChar+4);playMenuMove();}
            if(e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();selectCharByIndex(selectedChar-4);playMenuMove();}
        }
    }
});

// Back to city (shared logic)
function goBackToCity(){
    if(countdownTimer){clearInterval(countdownTimer);countdownTimer=null;}
    // Reset all blocking states
    _portalConfirmOpen=false;
    _portalConfirmRace=-1;
    document.getElementById('portal-confirm').style.display='none';
    document.getElementById('portal-prompt').style.display='none';
    finishedEggs=[];playerFinished=false;
    gameState='city';
    raceGroup.visible=false;
    clearRace();
    document.getElementById('race-hud').classList.add('hidden');
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    cityGroup.visible=true;
    for(const npc of cityNPCs) npc.mesh.visible=true;
    // Spawn near the portal they entered, offset so it won't re-trigger
    var sx=0,sz=5;
    if(currentRaceIndex>=0&&currentRaceIndex<RACES.length&&RACES[currentRaceIndex]){
        var r=RACES[currentRaceIndex];
        // Offset 5 units away from portal center (toward city center)
        var dx2=r.x,dz2=r.z;
        var dd=Math.sqrt(dx2*dx2+dz2*dz2)||1;
        sx=r.x-dx2/dd*5;
        sz=r.z-dz2/dd*5;
    }
    enterCity(sx,sz);
    // Reset any stale key states and ensure focus
    for(var k in keys) keys[k]=false;
    R.domElement.focus();
}

// Back to city from race result
document.getElementById('back-city-btn').addEventListener('click', goBackToCity);

// Back to city during race
document.getElementById('race-back-btn').addEventListener('click', goBackToCity);

animate();
