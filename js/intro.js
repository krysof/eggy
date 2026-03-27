// intro.js - SF2-style animated title intro
// Phase 0-1.5s: Black screen, WAWE logo fades in/out
// Phase 1.5-2.5s: Dark street, lightning flash, two eggs appear
// Phase 2.5-3.5s: Characters face off with bounce
// Phase 3.5-5s: Classic egg fires beam, cockroach flies back
// Phase 5-7s: Camera pans up skyscraper, title appears with shake
// Phase 7s+: PRESS START blinks, start button fades in

var _introCanvas=document.getElementById('intro-canvas');
var _introCtx=_introCanvas?_introCanvas.getContext('2d'):null;
var _introStart=0;
var _introRunning=true;
var _introSkipped=false;

function _resizeIntroCanvas(){
    if(!_introCanvas)return;
    _introCanvas.width=_introCanvas.parentElement.offsetWidth*Math.min(devicePixelRatio,2);
    _introCanvas.height=_introCanvas.parentElement.offsetHeight*Math.min(devicePixelRatio,2);
}
_resizeIntroCanvas();
window.addEventListener('resize',_resizeIntroCanvas);

// Draw an egg character (cute pixel-art style with blush and smile)
function _drawIntroEgg(ctx,x,y,size,color,accentColor,facingLeft,eyeOpen){
    var squash=arguments.length>8?arguments[8]:1.0;
    var sx=1.0+(1.0-squash)*0.15;
    var sy=squash;
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(sx,sy);
    // Body
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.ellipse(0,0,size*0.6,size*0.8,0,0,Math.PI*2);
    ctx.fill();
    // Accent belly
    ctx.fillStyle=accentColor;
    ctx.beginPath();
    ctx.ellipse(0,size*0.15,size*0.4,size*0.45,0,0,Math.PI*2);
    ctx.fill();
    var ex=facingLeft?-1:1;
    // Eyes - slightly larger, rounder
    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.ellipse(ex*size*0.18,-size*0.2,size*0.16,size*0.21,0,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ex*size*0.35,-size*0.18,size*0.14,size*0.19,0,0,Math.PI*2);
    ctx.fill();
    if(eyeOpen){
        // Pupils
        ctx.fillStyle='#222';
        ctx.beginPath();
        ctx.arc(ex*size*0.22,-size*0.18,size*0.07,0,Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex*size*0.38,-size*0.16,size*0.06,0,Math.PI*2);
        ctx.fill();
        // Bigger white highlights
        ctx.fillStyle='#fff';
        ctx.beginPath();
        ctx.arc(ex*size*0.19,-size*0.21,size*0.035,0,Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex*size*0.35,-size*0.19,size*0.03,0,Math.PI*2);
        ctx.fill();
    }
    // Rosy cheek blushes
    ctx.fillStyle='rgba(255,120,150,0.45)';
    ctx.beginPath();
    ctx.ellipse(ex*size*0.1,-size*0.02,size*0.1,size*0.06,0,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ex*size*0.42,size*0.0,size*0.08,size*0.05,0,0,Math.PI*2);
    ctx.fill();
    // Tiny smile arc
    if(eyeOpen){
        ctx.strokeStyle='rgba(80,40,20,0.6)';
        ctx.lineWidth=size*0.03;
        ctx.beginPath();
        ctx.arc(ex*size*0.28,-size*0.04,size*0.1,0.2,Math.PI-0.2);
        ctx.stroke();
    }
    ctx.restore();
}

// Draw a fist
function _drawFist(ctx,x,y,size,color){
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.arc(x,y,size,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.arc(x,y,size*0.4,0,Math.PI*2);
    ctx.fill();
}

// Draw skyscraper
function _drawBuilding(ctx,x,y,w,h,color,windowColor){
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle=windowColor;
    var ww=w*0.12,wh=h*0.03,gap=w*0.08;
    var cols=Math.floor((w-gap*2)/(ww+gap));
    var rows=Math.floor((h-gap*3)/(wh+gap*1.5));
    for(var r=0;r<rows;r++){
        for(var c=0;c<cols;c++){
            var wx=x+gap+c*(ww+gap);
            var wy=y+gap*2+r*(wh+gap*1.5);
            if(Math.random()>0.15) ctx.fillRect(wx,wy,ww,wh);
        }
    }
}

// Impact flash
function _drawFlash(ctx,x,y,size,alpha){
    var grad=ctx.createRadialGradient(x,y,0,x,y,size);
    grad.addColorStop(0,'rgba(255,255,200,'+alpha+')');
    grad.addColorStop(0.5,'rgba(255,200,100,'+alpha*0.5+')');
    grad.addColorStop(1,'rgba(255,100,50,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(x-size,y-size,size*2,size*2);
}

// Draw lightning zigzag
function _drawLightning(ctx,x1,y1,x2,y2,alpha,thickness){
    ctx.strokeStyle='rgba(255,255,255,'+alpha+')';
    ctx.lineWidth=thickness;
    ctx.shadowColor='rgba(200,200,255,'+alpha+')';
    ctx.shadowBlur=20;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    var segments=8;
    var dx=(x2-x1)/segments;
    var dy=(y2-y1)/segments;
    for(var i=1;i<segments;i++){
        var ox=(Math.random()-0.5)*60;
        var oy=(Math.random()-0.5)*40;
        ctx.lineTo(x1+dx*i+ox,y1+dy*i+oy);
    }
    ctx.lineTo(x2,y2);
    ctx.stroke();
    ctx.shadowBlur=0;
}


// Twinkling stars data (persistent positions)
var _introStars=[];
for(var _si=0;_si<15;_si++){
    _introStars.push({x:Math.random()*0.9+0.05,y:Math.random()*0.4,phase:Math.random()*Math.PI*2,speed:1.5+Math.random()*2});
}

// Draw dark city background with moon, stars, fog
function _drawCityBG(ctx,W,H,panY){
    var skyGrad=ctx.createLinearGradient(0,0,0,H);
    skyGrad.addColorStop(0,'#050510');
    skyGrad.addColorStop(0.6,'#0a0820');
    skyGrad.addColorStop(1,'#151030');
    ctx.fillStyle=skyGrad;
    ctx.fillRect(0,0,W,H);

    // Large moon upper right
    var moonX=W*0.82,moonY=H*0.15,moonR=H*0.09;
    var moonGrad=ctx.createRadialGradient(moonX-moonR*0.2,moonY-moonR*0.2,moonR*0.1,moonX,moonY,moonR);
    moonGrad.addColorStop(0,'#FFFDE8');
    moonGrad.addColorStop(0.7,'#F5E6A0');
    moonGrad.addColorStop(1,'rgba(200,180,100,0.3)');
    ctx.fillStyle=moonGrad;
    ctx.beginPath();
    ctx.arc(moonX,moonY,moonR,0,Math.PI*2);
    ctx.fill();
    // Moon glow
    var glowGrad=ctx.createRadialGradient(moonX,moonY,moonR*0.8,moonX,moonY,moonR*2.5);
    glowGrad.addColorStop(0,'rgba(255,250,200,0.12)');
    glowGrad.addColorStop(1,'rgba(255,250,200,0)');
    ctx.fillStyle=glowGrad;
    ctx.beginPath();
    ctx.arc(moonX,moonY,moonR*2.5,0,Math.PI*2);
    ctx.fill();
    // Craters
    ctx.fillStyle='rgba(180,160,100,0.25)';
    ctx.beginPath();ctx.arc(moonX-moonR*0.3,moonY-moonR*0.2,moonR*0.15,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(moonX+moonR*0.25,moonY+moonR*0.3,moonR*0.12,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(moonX+moonR*0.1,moonY-moonR*0.4,moonR*0.08,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(moonX-moonR*0.15,moonY+moonR*0.35,moonR*0.1,0,Math.PI*2);ctx.fill();

    // Twinkling stars
    var now=performance.now()/1000;
    for(var si=0;si<_introStars.length;si++){
        var s=_introStars[si];
        var flicker=0.4+0.6*Math.abs(Math.sin(now*s.speed+s.phase));
        ctx.fillStyle='rgba(255,255,255,'+flicker+')';
        ctx.beginPath();
        ctx.arc(s.x*W,s.y*H,1.2+flicker*1.2,0,Math.PI*2);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(0,panY);

    var bColors=['#0d0d20','#111128','#0f0f22','#131330'];
    var bx=0;
    for(var bi=0;bi<8;bi++){
        var bw=W*0.12+bi*W*0.02;
        var bh=H*0.3+bi*H*0.08+(bi%3)*H*0.05;
        ctx.fillStyle=bColors[bi%bColors.length];
        ctx.fillRect(bx,H-bh-panY*0.3,bw,bh+panY*0.3+H);
        // Warm window glows (orange/yellow, some flickering)
        for(var wi=0;wi<6;wi++){
            for(var wj=0;wj<Math.floor(bh/(H*0.04));wj++){
                if(Math.random()>0.4){
                    var wFlicker=0.7+0.3*Math.random();
                    var wHue=Math.random()>0.3?'rgba(255,200,80,':'rgba(255,160,60,';
                    ctx.fillStyle=wHue+(0.18*wFlicker)+')';
                    ctx.fillRect(bx+bw*0.15+wi*bw*0.13,H-bh+wj*H*0.04+H*0.02,bw*0.08,H*0.02);
                }
            }
        }
        bx+=bw+W*0.01;
    }

    // Ground
    ctx.fillStyle='#1a1a2a';
    ctx.fillRect(0,H*0.82,W,H*0.2);
    ctx.fillStyle='#222235';
    ctx.fillRect(0,H*0.82,W,H*0.01);

    // Fog/mist layer near ground
    var fogGrad=ctx.createLinearGradient(0,H*0.72,0,H*0.88);
    fogGrad.addColorStop(0,'rgba(100,100,140,0)');
    fogGrad.addColorStop(0.5,'rgba(100,100,140,0.08)');
    fogGrad.addColorStop(1,'rgba(80,80,120,0.15)');
    ctx.fillStyle=fogGrad;
    ctx.fillRect(0,H*0.72,W,H*0.16);

    ctx.restore();
}
