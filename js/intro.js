// intro.js — SF2-style animated title intro
// Phase 0-1.5s: dark street, two eggs face off
// Phase 1.5-3s: classic egg punches cockroach, cockroach flies back
// Phase 3-5s: camera pans up skyscraper, title appears
// Phase 5s+: title stays, start button fades in

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

// Draw an egg character (simplified pixel-art style)
function _drawIntroEgg(ctx,x,y,size,color,accentColor,facingLeft,eyeOpen){
    // Body
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.ellipse(x,y,size*0.6,size*0.8,0,0,Math.PI*2);
    ctx.fill();
    // Accent belly
    ctx.fillStyle=accentColor;
    ctx.beginPath();
    ctx.ellipse(x,y+size*0.15,size*0.4,size*0.45,0,0,Math.PI*2);
    ctx.fill();
    // Eyes
    var ex=facingLeft?-1:1;
    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.ellipse(x+ex*size*0.18,y-size*0.2,size*0.14,size*0.18,0,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x+ex*size*0.35,y-size*0.18,size*0.12,size*0.16,0,0,Math.PI*2);
    ctx.fill();
    // Pupils
    if(eyeOpen){
        ctx.fillStyle='#222';
        ctx.beginPath();
        ctx.arc(x+ex*size*0.22,y-size*0.18,size*0.06,0,Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x+ex*size*0.38,y-size*0.16,size*0.05,0,Math.PI*2);
        ctx.fill();
    }
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
    // Windows
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

// Main intro render loop
function _renderIntro(now){
    if(!_introRunning||!_introCtx)return;
    if(!_introStart)_introStart=now;
    var t=(now-_introStart)/1000; // seconds
    var W=_introCanvas.width,H=_introCanvas.height;
    var ctx=_introCtx;
    var scale=H/600; // normalize to 600px height

    ctx.clearRect(0,0,W,H);

    // ---- Background: dark city street ----
    // Sky gradient
    var skyGrad=ctx.createLinearGradient(0,0,0,H);
    skyGrad.addColorStop(0,'#0a0a1a');
    skyGrad.addColorStop(0.6,'#1a1030');
    skyGrad.addColorStop(1,'#2a1a3a');
    ctx.fillStyle=skyGrad;
    ctx.fillRect(0,0,W,H);

    // Camera pan offset (phase 3+: pan up)
    var panY=0;
    if(t>3&&t<5){
        panY=(t-3)/2*H*0.8; // pan up 80% of screen height over 2s
    } else if(t>=5){
        panY=H*0.8;
    }

    ctx.save();
    ctx.translate(0,panY);

    // Background buildings (silhouettes)
    var bColors=['#0d0d20','#111128','#0f0f22','#131330'];
    var bx=0;
    for(var bi=0;bi<8;bi++){
        var bw=W*0.12+bi*W*0.02;
        var bh=H*0.3+bi*H*0.08+(bi%3)*H*0.05;
        ctx.fillStyle=bColors[bi%bColors.length];
        ctx.fillRect(bx,H-bh-panY*0.3,bw,bh+panY*0.3+H);
        // Dim windows
        ctx.fillStyle='rgba(255,200,100,0.15)';
        for(var wi=0;wi<6;wi++){
            for(var wj=0;wj<Math.floor(bh/(H*0.04));wj++){
                if(Math.random()>0.4){
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

    // ---- Characters ----
    var cx=W*0.35, cy=H*0.72; // classic egg position
    var rx=W*0.65, ry=H*0.72; // cockroach position
    var eggSize=50*scale;

    if(t<1.5){
        // Phase 1: face off — both standing, slight bounce
        var bounce=Math.sin(t*4)*3*scale;
        _drawIntroEgg(ctx,cx,cy+bounce,eggSize,'#F5F5F0','#CC2222',false,true);
        _drawIntroEgg(ctx,rx,ry-bounce,eggSize,'#8B6914','#FFFFFF',true,true);
    } else if(t<3){
        // Phase 2: punch animation
        var pt=t-1.5; // 0 to 1.5
        if(pt<0.3){
            // Wind up — egg leans back
            var lean=pt/0.3;
            _drawIntroEgg(ctx,cx-lean*15*scale,cy,eggSize,'#F5F5F0','#CC2222',false,true);
            _drawIntroEgg(ctx,rx,ry,eggSize,'#8B6914','#FFFFFF',true,true);
        } else if(pt<0.6){
            // Punch forward
            var punch=(pt-0.3)/0.3;
            var punchX=cx+punch*W*0.15;
            _drawIntroEgg(ctx,cx+punch*20*scale,cy,eggSize,'#F5F5F0','#CC2222',false,true);
            _drawFist(ctx,punchX+eggSize*0.8,cy-eggSize*0.1,eggSize*0.3,'#F5F5F0');
            _drawIntroEgg(ctx,rx,ry,eggSize,'#8B6914','#FFFFFF',true,true);
        } else {
            // Impact + cockroach flies back
            var hit=(pt-0.6)/0.9;
            var flashAlpha=Math.max(0,1-hit*3);
            if(flashAlpha>0) _drawFlash(ctx,rx-eggSize*0.5,ry-eggSize*0.2,eggSize*3,flashAlpha);
            _drawIntroEgg(ctx,cx+20*scale,cy,eggSize,'#F5F5F0','#CC2222',false,true);
            // Cockroach flies back and up
            var flyX=rx+hit*W*0.3;
            var flyY=ry-Math.sin(hit*Math.PI)*H*0.3;
            var spin=hit*Math.PI*4;
            ctx.save();
            ctx.translate(flyX,flyY);
            ctx.rotate(spin);
            _drawIntroEgg(ctx,0,0,eggSize*(1-hit*0.3),'#8B6914','#FFFFFF',true,hit<0.5);
            ctx.restore();
            // Hit sparks
            if(hit<0.4){
                for(var si=0;si<5;si++){
                    var sa=si*Math.PI*2/5+hit*2;
                    var sr=hit*eggSize*4;
                    ctx.fillStyle='rgba(255,255,200,'+(0.8-hit*2)+')';
                    ctx.beginPath();
                    ctx.arc(rx-eggSize*0.3+Math.cos(sa)*sr,ry-eggSize*0.2+Math.sin(sa)*sr,3*scale,0,Math.PI*2);
                    ctx.fill();
                }
            }
        }
    }

    ctx.restore();

    // ---- Phase 3+: Skyscraper with title ----
    if(t>3){
        var titleAlpha=Math.min(1,(t-3.5)/1.0);
        // Main skyscraper (center)
        var bldW=W*0.35,bldH=H*1.8;
        var bldX=(W-bldW)/2;
        var bldY=H-bldH+panY;
        _drawBuilding(ctx,bldX,bldY,bldW,bldH,'#1a1a3a','rgba(255,220,100,0.3)');
        // Building top accent
        ctx.fillStyle='#2a2a5a';
        ctx.fillRect(bldX+bldW*0.1,bldY,bldW*0.8,bldH*0.02);
        // Neon glow on building
        ctx.shadowColor='rgba(255,215,0,0.5)';ctx.shadowBlur=30*scale;
        ctx.fillStyle='rgba(255,215,0,0.08)';
        ctx.fillRect(bldX,bldY,bldW,bldH);
        ctx.shadowBlur=0;

        // Title text on building
        if(titleAlpha>0){
            ctx.globalAlpha=titleAlpha;
            // Main title
            ctx.fillStyle='#FFD700';
            ctx.shadowColor='#FF8800';ctx.shadowBlur=20*scale;
            ctx.font='bold '+Math.floor(48*scale)+'px "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';
            ctx.textAlign='center';
            ctx.fillText(L('title'),W/2,H*0.35);
            ctx.shadowBlur=0;
            // Subtitle
            ctx.fillStyle='rgba(255,255,255,0.8)';
            ctx.font=Math.floor(16*scale)+'px "Segoe UI","PingFang SC",sans-serif';
            ctx.fillText('D A N B O   W O R L D',W/2,H*0.35+40*scale);
            // Slogan
            ctx.fillStyle='rgba(255,255,255,0.5)';
            ctx.font='italic '+Math.floor(12*scale)+'px "Segoe UI","PingFang SC",sans-serif';
            ctx.fillText(L('slogan'),W/2,H*0.35+65*scale);
            // Author
            ctx.fillStyle='rgba(255,255,255,0.4)';
            ctx.font=Math.floor(11*scale)+'px "Segoe UI",sans-serif';
            ctx.fillText(L('version'),W/2,H*0.35+90*scale);
            ctx.globalAlpha=1;
        }
    }

    // ---- Start button fade in ----
    if(t>5){
        var btn=document.getElementById('start-btn');
        if(btn)btn.style.opacity='1';
        // Blinking "PRESS START"
        if(Math.floor(t*2)%2===0){
            ctx.fillStyle='rgba(255,255,255,0.9)';
            ctx.font='bold '+Math.floor(18*scale)+'px "Segoe UI",sans-serif';
            ctx.textAlign='center';
            ctx.fillText('PRESS START',W/2,H*0.75);
        }
    }

    if(_introRunning) requestAnimationFrame(_renderIntro);
}

// Start the intro animation
function _startIntro(){
    _introStart=0;
    _introRunning=true;
    _resizeIntroCanvas();
    requestAnimationFrame(_renderIntro);
}

// Skip intro (tap/click anywhere)
function _skipIntro(){
    if(_introSkipped)return;
    _introSkipped=true;
    _introStart=performance.now()-5500; // jump to end
    var btn=document.getElementById('start-btn');
    if(btn)btn.style.opacity='1';
    // After skip, let clicks pass through to the start button
    if(_introCanvas)_introCanvas.style.pointerEvents='none';
}

if(_introCanvas){
    _introCanvas.addEventListener('click',function(){
        if(!_introSkipped){
            _skipIntro();
        } else {
            // Intro already done — trigger start
            var btn=document.getElementById('start-btn');
            if(btn)btn.click();
        }
    });
    _introCanvas.addEventListener('touchstart',function(e){
        if(_introStart&&(performance.now()-_introStart)>500){
            if(!_introSkipped){
                _skipIntro();
            } else {
                var btn=document.getElementById('start-btn');
                if(btn)btn.click();
            }
        }
    },{passive:true});
}

_startIntro();
