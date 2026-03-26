// ui.js — DANBO World
// ---- SF2 World Map ----
function _drawSF2Map(highlightX,highlightY){
    var mc=document.getElementById('sf2-map-canvas');if(!mc)return;
    var ctx=mc.getContext('2d');var W=mc.width,H=mc.height;
    ctx.clearRect(0,0,W,H);
    // Ocean
    ctx.fillStyle='#0a1a3a';ctx.fillRect(0,0,W,H);
    // Simplified continents (pixel-art style)
    ctx.fillStyle='#1a4a2a';
    // North America
    ctx.fillRect(30,30,80,60);ctx.fillRect(40,20,50,15);ctx.fillRect(60,90,30,20);
    // South America
    ctx.fillRect(100,120,40,70);ctx.fillRect(110,110,25,15);
    // Europe
    ctx.fillRect(180,25,50,40);ctx.fillRect(170,35,15,20);
    // Africa
    ctx.fillRect(185,80,45,70);ctx.fillRect(195,70,30,15);
    // Asia
    ctx.fillRect(240,20,120,60);ctx.fillRect(280,75,60,40);ctx.fillRect(340,60,30,50);
    // India
    ctx.fillRect(275,90,30,35);
    // Australia
    ctx.fillRect(330,150,40,25);
    // Grid lines
    ctx.strokeStyle='rgba(100,150,255,0.1)';ctx.lineWidth=0.5;
    for(var gi=0;gi<W;gi+=40){ctx.beginPath();ctx.moveTo(gi,0);ctx.lineTo(gi,H);ctx.stroke();}
    for(var gj=0;gj<H;gj+=40){ctx.beginPath();ctx.moveTo(0,gj);ctx.lineTo(W,gj);ctx.stroke();}
    // Highlight marker
    if(highlightX!==undefined){
        ctx.fillStyle='#FF4444';
        ctx.beginPath();ctx.arc(highlightX,highlightY,6,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#FFD700';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(highlightX,highlightY,10,0,Math.PI*2);ctx.stroke();
        // Pulsing ring
        var pulse=Math.sin(Date.now()*0.005)*3;
        ctx.strokeStyle='rgba(255,215,0,0.4)';ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(highlightX,highlightY,14+pulse,0,Math.PI*2);ctx.stroke();
    }
}

// ---- SF2 Airplane Animation ----
var _planeAnim=null;
function _startPlaneAnim(fromX,fromY,toX,toY,callback){
    var pc=document.getElementById('sf2-plane-canvas');if(!pc)return callback();
    pc.style.display='block';
    var pctx=pc.getContext('2d');
    pc.width=pc.parentElement.offsetWidth;pc.height=pc.parentElement.offsetHeight;
    var sx=fromX/400*pc.width,sy=fromY/220*pc.height*0.6+pc.height*0.15;
    var ex=toX/400*pc.width,ey=toY/220*pc.height*0.6+pc.height*0.15;
    var t=0;
    _planeAnim=setInterval(function(){
        t+=0.02;
        pctx.clearRect(0,0,pc.width,pc.height);
        var cx=sx+(ex-sx)*t;var cy=sy+(ey-sy)*t-Math.sin(t*Math.PI)*40;
        // Trail
        pctx.strokeStyle='rgba(255,255,255,0.3)';pctx.lineWidth=2;
        pctx.beginPath();pctx.moveTo(sx,sy);
        pctx.quadraticCurveTo((sx+cx)/2,Math.min(sy,cy)-30,cx,cy);
        pctx.stroke();
        // Plane
        pctx.fillStyle='#FFFFFF';
        pctx.beginPath();
        var angle=Math.atan2(ey-sy,ex-sx);
        pctx.save();pctx.translate(cx,cy);pctx.rotate(angle);
        pctx.moveTo(10,0);pctx.lineTo(-8,-6);pctx.lineTo(-5,0);pctx.lineTo(-8,6);
        pctx.closePath();pctx.fill();pctx.restore();
        if(t>=1){
            clearInterval(_planeAnim);_planeAnim=null;
            pc.style.display='none';
            callback();
        }
    },30);
}

function _updateSF2Select(idx){
    var ch=CHARACTERS[idx];
    drawPortrait(ch);
    // Update name
    var nameEl=document.getElementById('sf2-char-name');
    if(nameEl)nameEl.textContent=ch.name;
    // Update flag
    var flagEl=document.getElementById('sf2-country-flag');
    if(flagEl)flagEl.textContent=ch.flag;
    // Update map
    _drawSF2Map(ch.mapX,ch.mapY);
}

CHARACTERS.forEach((ch,i) => {
    const cell = document.createElement('div');
    cell.className = 'char-cell' + (i===0?' selected':'');
    cell.innerHTML = '<span class="char-icon">'+ch.icon+'</span><span class="char-label">'+ch.name+'</span>';
    cell.addEventListener('click', () => {
        document.querySelectorAll('.char-cell').forEach(c=>c.classList.remove('selected'));
        cell.classList.add('selected');
        selectedChar = i;
        _updateSF2Select(i);
        playMenuMove();
    });
    if (charGrid) charGrid.appendChild(cell);
});
if (portraitCtx) _updateSF2Select(0);

// ---- State ----
let gameState = 'menu'; // menu, city, raceIntro, racing, raceResult
let coins = 0, nearPortal = null, countdownTimer = null;
// ---- Tower of Babel state ----
var _babylonTriggered=false, _babylonTower=null, _babylonRising=false, _babylonRiseY=-52;
var _earthquakeTimer=0, _earthquakeIntensity=0;
var _babylonPromptDismissed=false;
var _babylonElevator=false, _babylonElevDir=0, _babylonElevY=0; // elevator ride state
var _moonPipePromptOpen=false, _moonPipeDismissed=false; // moon pipe prompt state
let raceCoinScore = 0;
let finishedEggs=[], playerFinished=false, trackLength=0, currentRaceIndex=-1;

// ---- Jump charge system ----
var _jumpCharging=false, _jumpCharge=0, _jumpChargeMax=60, _jumpChargeBar=null;
