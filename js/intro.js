// intro.js — SF2-style animated title intro
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

// Draw an egg character (simplified pixel-art style)
function _drawIntroEgg(ctx,x,y,size,color,accentColor,facingLeft,eyeOpen){
    var _bg=ctx.createRadialGradient(x-size*0.1,y-size*0.15,size*0.1,x,y,size*0.8);
    _bg.addColorStop(0,color);_bg.addColorStop(1,accentColor);
    ctx.fillStyle=_bg;
    ctx.beginPath();ctx.ellipse(x,y,size*0.6,size*0.8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.15)';
    ctx.beginPath();ctx.ellipse(x-size*0.08,y-size*0.1,size*0.3,size*0.4,0,0,Math.PI*2);ctx.fill();
    var ex=facingLeft?-1:1;
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.ellipse(x+ex*size*0.18,y-size*0.2,size*0.16,size*0.2,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x+ex*size*0.38,y-size*0.18,size*0.13,size*0.18,0,0,Math.PI*2);ctx.fill();
    if(eyeOpen){
        ctx.fillStyle='#111';
        ctx.beginPath();ctx.arc(x+ex*size*0.22,y-size*0.17,size*0.07,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(x+ex*size*0.4,y-size*0.15,size*0.06,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff';
        ctx.beginPath();ctx.arc(x+ex*size*0.2,y-size*0.22,size*0.03,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(x+ex*size*0.38,y-size*0.2,size*0.025,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='rgba(255,120,120,0.15)';
    ctx.beginPath();ctx.ellipse(x+ex*size*0.08,y+size*0.02,size*0.12,size*0.06,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x+ex*size*0.42,y+size*0.04,size*0.1,size*0.05,0,0,Math.PI*2);ctx.fill();
    // Serious expression — slight frown
    if(eyeOpen){
        ctx.strokeStyle='rgba(80,40,20,0.4)';ctx.lineWidth=size*0.02;
        ctx.beginPath();ctx.moveTo(x+ex*size*0.15,y+size*0.1);ctx.lineTo(x+ex*size*0.35,y+size*0.08);ctx.stroke();
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

// Draw dark city background
function _drawCityBG(ctx,W,H,panY){
    var skyGrad=ctx.createLinearGradient(0,0,0,H);
    skyGrad.addColorStop(0,'#050510');
    skyGrad.addColorStop(0.6,'#0a0820');
    skyGrad.addColorStop(1,'#151030');
    ctx.fillStyle=skyGrad;
    ctx.fillRect(0,0,W,H);

    ctx.save();
    ctx.translate(0,panY);

    var bColors=['#0d0d20','#111128','#0f0f22','#131330'];
    var bx=0;
    for(var bi=0;bi<8;bi++){
        var bw=W*0.12+bi*W*0.02;
        var bh=H*0.3+bi*H*0.08+(bi%3)*H*0.05;
        ctx.fillStyle=bColors[bi%bColors.length];
        ctx.fillRect(bx,H-bh-panY*0.3,bw,bh+panY*0.3+H);
        ctx.fillStyle='rgba(255,200,100,0.12)';
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

    ctx.restore();
}

// Wind rain particles
var _introRain=[];
for(var _ri=0;_ri<120;_ri++){
    _introRain.push({x:Math.random(),y:Math.random(),speed:0.012+Math.random()*0.018,len:10+Math.random()*14});
}
function _drawRain(ctx,W,H,alpha){
    if(alpha<=0)return;
    ctx.strokeStyle='rgba(180,200,255,'+alpha*0.35+')';
    ctx.lineWidth=1;
    for(var i=0;i<_introRain.length;i++){
        var r=_introRain[i];
        r.x+=0.006;r.y+=r.speed;
        if(r.y>1){r.y=0;r.x=Math.random();}
        if(r.x>1)r.x-=1;
        var rx=r.x*W,ry=r.y*H;
        ctx.beginPath();
        ctx.moveTo(rx,ry);
        ctx.lineTo(rx+r.len*1.0,ry+r.len);
        ctx.stroke();
    }
}

// Main intro render loop
function _renderIntro(now){
    if(!_introRunning||!_introCtx)return;
    if(!_introStart)_introStart=now;
    var t=(now-_introStart)/1000;
    var W=_introCanvas.width,H=_introCanvas.height;
    var ctx=_introCtx;
    var scale=H/600;

    ctx.clearRect(0,0,W,H);

    // ======== PHASE 0: Black screen + WAWE logo (0-1.5s) ========
    if(t<1.5){
        ctx.fillStyle='#000';
        ctx.fillRect(0,0,W,H);
        var logoAlpha=0;
        if(t<0.5){
            logoAlpha=t/0.5;
        } else if(t<1.0){
            logoAlpha=1;
        } else {
            logoAlpha=1-(t-1.0)/0.5;
        }
        if(logoAlpha>0){
            ctx.globalAlpha=logoAlpha;
            ctx.fillStyle='#FFFFFF';
            ctx.font='bold '+Math.floor(72*scale)+'px "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';
            ctx.textAlign='center';
            ctx.textBaseline='middle';
            ctx.fillText('WAWE',W/2,H/2);
            ctx.globalAlpha=1;
        }
        ctx.textBaseline='alphabetic';
        if(_introRunning) requestAnimationFrame(_renderIntro);
        return;
    }

    // Camera pan offset (phase 5+: pan up)
    var panY=0;
    if(t>5&&t<7){
        panY=(t-5)/2*H*0.8;
    } else if(t>=7){
        panY=H*0.8;
    }

    // ======== Background ========
    _drawCityBG(ctx,W,H,panY);
    // Wind rain effect during street scene
    if(t>=1.5&&t<7){
        var _rainAlpha=1;
        if(t<2)_rainAlpha=(t-1.5)/0.5;
        if(t>6.5)_rainAlpha=1-(t-6.5)/0.5;
        _drawRain(ctx,W,H,_rainAlpha);
    }

    // ======== PHASE 1: Lightning + silhouettes appear (1.5-2.5s) ========
    var cx=W*0.35, cy=H*0.72;
    var rx=W*0.65, ry=H*0.72;
    var eggSize=50*scale;

    if(t>=1.5&&t<2.5){
        var pt=t-1.5;
        ctx.save();
        ctx.translate(0,panY);

        // Lightning flash
        if(pt<0.4){
            var lAlpha=1-pt/0.4;
            _drawLightning(ctx,W*0.1,H*0.1,W*0.9,H*0.5,lAlpha,3*scale);
            _drawLightning(ctx,W*0.15,H*0.05,W*0.85,H*0.55,lAlpha*0.6,2*scale);
            // Screen flash
            if(pt<0.1){
                ctx.fillStyle='rgba(255,255,255,'+(0.6-pt*6)+')';
                ctx.fillRect(0,0,W,H);
            }
        }

        // Characters appear as silhouettes then light up
        var charAlpha=Math.min(1,pt/0.6);
        var litUp=Math.max(0,(pt-0.4)/0.6);
        ctx.globalAlpha=charAlpha;
        if(litUp<1){
            // Silhouette phase
            var silColor='rgba(10,10,20,'+(1-litUp)+')';
            _drawIntroEgg(ctx,cx,cy,eggSize,silColor,silColor,false,false);
            _drawIntroEgg(ctx,rx,ry,eggSize,silColor,silColor,true,false);
        }
        if(litUp>0){
            ctx.globalAlpha=charAlpha*litUp;
            _drawIntroEgg(ctx,cx,cy,eggSize,'#FFDD44','#FFAA00',false,litUp>0.5);
            _drawIntroEgg(ctx,rx,ry,eggSize,'#8B4513','#5C2E0A',true,litUp>0.5);
        }
        ctx.globalAlpha=1;
        ctx.restore();
    }

    // ======== PHASE 2: Face off with bounce (2.5-3.5s) ========
    if(t>=2.5&&t<3.5){
        ctx.save();
        ctx.translate(0,panY);
        var bounce=Math.sin((t-2.5)*8)*4*scale;
        _drawIntroEgg(ctx,cx,cy+bounce,eggSize,'#FFDD44','#FFAA00',false,true);
        _drawIntroEgg(ctx,rx,ry-bounce,eggSize,'#8B4513','#5C2E0A',true,true);
        // White cat strolls across leisurely — walk, stop to watch, walk again
        var _catT=(t-2.5)/1.0; // 0 to 1 over 1 second
        // Movement: walk 0-0.3, stop 0.3-0.6 (watching), walk 0.6-1.0
        var _catProgress;
        var _catStopped=false;
        if(_catT<0.3){_catProgress=_catT/0.3*0.35;}
        else if(_catT<0.6){_catProgress=0.35;_catStopped=true;}
        else{_catProgress=0.35+(_catT-0.6)/0.4*0.65;}
        var _catX=W*0.85-_catProgress*W*0.7; // right to left, leisurely
        var _catY=H*0.88;
        var _catS=12*scale;
        var _headDir=_catStopped?-1:1; // look left normally, look UP when stopped (watching fight)
        // Body
        ctx.fillStyle='#EEEEEE';
        ctx.beginPath();ctx.ellipse(_catX,_catY,_catS*1.2,_catS*0.6,0,0,Math.PI*2);ctx.fill();
        // Head — turns to look at fighters when stopped
        var _headX=_catX-_catS*1.0;
        var _headY=_catStopped?_catY-_catS*0.6:_catY-_catS*0.3;
        ctx.beginPath();ctx.arc(_headX,_headY,_catS*0.5,0,Math.PI*2);ctx.fill();
        // Ears
        ctx.beginPath();ctx.moveTo(_headX-_catS*0.3,_headY-_catS*0.4);ctx.lineTo(_headX-_catS*0.5,_headY-_catS*0.9);ctx.lineTo(_headX-_catS*0.1,_headY-_catS*0.5);ctx.fill();
        ctx.beginPath();ctx.moveTo(_headX+_catS*0.2,_headY-_catS*0.4);ctx.lineTo(_headX+_catS*0.3,_headY-_catS*0.9);ctx.lineTo(_headX+_catS*0.5,_headY-_catS*0.4);ctx.fill();
        // Tail (curved, sways when stopped)
        ctx.strokeStyle='#EEEEEE';ctx.lineWidth=_catS*0.2;ctx.lineCap='round';
        var _tailSway=_catStopped?Math.sin(t*5)*_catS*0.4:0;
        ctx.beginPath();ctx.moveTo(_catX+_catS*1.2,_catY);
        ctx.quadraticCurveTo(_catX+_catS*1.8,_catY-_catS*0.5+_tailSway,_catX+_catS*1.5+_tailSway*0.5,_catY-_catS*1.2);ctx.stroke();
        // Eyes — look up at fighters when stopped
        ctx.fillStyle='#44AA44';
        if(_catStopped){
            // Wide curious eyes looking up
            ctx.beginPath();ctx.ellipse(_headX-_catS*0.15,_headY-_catS*0.1,_catS*0.1,_catS*0.12,0,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.ellipse(_headX+_catS*0.15,_headY-_catS*0.1,_catS*0.1,_catS*0.12,0,0,Math.PI*2);ctx.fill();
        } else {
            ctx.beginPath();ctx.arc(_headX-_catS*0.2,_headY-_catS*0.05,_catS*0.08,0,Math.PI*2);ctx.fill();
        }
        // Legs — walk animation or sitting when stopped
        ctx.strokeStyle='#DDDDDD';ctx.lineWidth=_catS*0.15;
        if(_catStopped){
            // Sitting pose — front legs straight, back legs tucked
            ctx.beginPath();ctx.moveTo(_catX-_catS*0.6,_catY+_catS*0.2);ctx.lineTo(_catX-_catS*0.6,_catY+_catS*0.6);ctx.stroke();
            ctx.beginPath();ctx.moveTo(_catX-_catS*0.3,_catY+_catS*0.2);ctx.lineTo(_catX-_catS*0.3,_catY+_catS*0.6);ctx.stroke();
        } else {
            var _legPhase=_catProgress*30;
            for(var _li=0;_li<4;_li++){
                var _lx=_catX+(_li-1.5)*_catS*0.5;
                var _ly=_catY+_catS*0.5+Math.sin(_legPhase+_li*1.5)*_catS*0.25;
                ctx.beginPath();ctx.moveTo(_lx,_catY+_catS*0.2);ctx.lineTo(_lx,_ly);ctx.stroke();
            }
        }
        ctx.restore();
    }

    // ======== PHASE 3: Beam attack (3.5-5s) ========
    if(t>=3.5&&t<5){
        ctx.save();
        ctx.translate(0,panY);
        var pt=t-3.5;

        if(pt<0.3){
            // Crouch and wind up
            var crouch=pt/0.3;
            var bodyX=cx-crouch*8*scale;
            var bodyY=cy+crouch*10*scale;
            _drawIntroEgg(ctx,bodyX,bodyY,eggSize*0.95,'#FFDD44','#FFAA00',false,true);
            _drawIntroEgg(ctx,rx,ry,eggSize,'#8B4513','#5C2E0A',true,true);
        } else if(pt<0.8){
            // Arms extend, beam fires
            var fire=(pt-0.3)/0.5;
            var bodyX=cx-5*scale;
            var bodyY=cy+8*scale;
            _drawIntroEgg(ctx,bodyX,bodyY,eggSize*0.95,'#FFDD44','#FFAA00',false,true);

            // Arms extending forward
            var armEndX=bodyX+eggSize*0.5+fire*eggSize*0.6;
            ctx.strokeStyle='#FFCC00';
            ctx.lineWidth=5*scale;
            ctx.beginPath();
            ctx.moveTo(bodyX+eggSize*0.35,bodyY-eggSize*0.05);
            ctx.lineTo(armEndX,bodyY-eggSize*0.1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(bodyX+eggSize*0.35,bodyY+eggSize*0.1);
            ctx.lineTo(armEndX,bodyY+eggSize*0.05);
            ctx.stroke();
            // Hands
            _drawFist(ctx,armEndX+eggSize*0.1,bodyY-eggSize*0.1,eggSize*0.18,'#FFDD44');
            _drawFist(ctx,armEndX+eggSize*0.1,bodyY+eggSize*0.05,eggSize*0.18,'#FFDD44');

            // Half-circle at hands + rectangular beam
            var ebX=armEndX+eggSize*0.1;
            var beamLen=fire*W*0.7;
            var beamH=eggSize*0.5+fire*eggSize*1.0;
            // Outer glow beam
            var beamGrad=ctx.createLinearGradient(ebX,bodyY,ebX+beamLen,bodyY);
            beamGrad.addColorStop(0,'rgba(255,140,50,'+fire*0.9+')');
            beamGrad.addColorStop(0.5,'rgba(255,220,120,'+fire*0.7+')');
            beamGrad.addColorStop(1,'rgba(255,240,200,0)');
            ctx.fillStyle=beamGrad;
            ctx.fillRect(ebX,bodyY-beamH*0.5,beamLen,beamH);
            // Half circle at hand
            ctx.fillStyle='rgba(255,140,50,'+fire*0.9+')';
            ctx.beginPath();
            ctx.arc(ebX,bodyY,beamH*0.55,Math.PI*0.5,Math.PI*1.5);
            ctx.fill();
            // Core beam (brighter)
            ctx.fillStyle='rgba(255,240,200,'+fire*0.7+')';
            ctx.fillRect(ebX,bodyY-beamH*0.25,beamLen*0.8,beamH*0.5);
            ctx.beginPath();
            ctx.arc(ebX,bodyY,beamH*0.3,Math.PI*0.5,Math.PI*1.5);
            ctx.fill();

            _drawIntroEgg(ctx,rx,ry,eggSize,'#8B4513','#5C2E0A',true,true);
        } else {
            // Impact — cockroach flies back spinning
            var hit=(pt-0.8)/0.7;
            var flashAlpha=Math.max(0,1-hit*3);
            if(flashAlpha>0) _drawFlash(ctx,rx-eggSize*0.5,ry-eggSize*0.2,eggSize*3,flashAlpha);
            _drawIntroEgg(ctx,cx+20*scale,cy,eggSize,'#FFDD44','#FFAA00',false,true);
            // Cockroach flies back and up spinning
            var flyX=rx+hit*W*0.3;
            var flyY=ry-Math.sin(hit*Math.PI)*H*0.3;
            var spin=hit*Math.PI*4;
            ctx.save();
            ctx.translate(flyX,flyY);
            ctx.rotate(spin);
            _drawIntroEgg(ctx,0,0,eggSize*(1-hit*0.3),'#8B4513','#5C2E0A',true,hit<0.5);
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
        ctx.restore();
    }

    // ======== PHASE 4: Pan up skyscraper + title (5-7s) ========
    if(t>5){
        var titleAlpha=Math.min(1,(t-5.5)/1.0);
        // Main skyscraper (center)
        var bldW=W*0.35,bldH=H*1.8;
        var bldX=(W-bldW)/2;
        var bldY=H-bldH+panY;
        _drawBuilding(ctx,bldX,bldY,bldW,bldH,'#1a1a3a','rgba(255,220,100,0.3)');
        ctx.fillStyle='#2a2a5a';
        ctx.fillRect(bldX+bldW*0.1,bldY,bldW*0.8,bldH*0.02);
        ctx.shadowColor='rgba(255,215,0,0.5)';
        ctx.shadowBlur=30*scale;
        ctx.fillStyle='rgba(255,215,0,0.08)';
        ctx.fillRect(bldX,bldY,bldW,bldH);
        ctx.shadowBlur=0;

        // Title with screen shake
        if(titleAlpha>0){
            var shakeX=0,shakeY=0;
            if(t>5.5&&t<6.0){
                var shakeT=(t-5.5)/0.5;
                var shakeAmp=(1-shakeT)*8*scale;
                shakeX=Math.sin(shakeT*40)*shakeAmp;
                shakeY=Math.cos(shakeT*35)*shakeAmp;
            }
            ctx.save();
            ctx.translate(shakeX,shakeY);
            ctx.globalAlpha=titleAlpha;

            // Title shadow
            ctx.fillStyle='rgba(0,0,0,0.7)';
            ctx.font='bold '+Math.floor(52*scale)+'px "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';
            ctx.textAlign='center';
            ctx.fillText(L('title'),W/2+3*scale,H*0.35+3*scale);

            // Main title — gold metallic
            ctx.fillStyle='#FFD700';
            ctx.shadowColor='#FF8800';
            ctx.shadowBlur=25*scale;
            ctx.fillText(L('title'),W/2,H*0.35);
            ctx.shadowBlur=0;

            // Subtitle
            ctx.fillStyle='rgba(255,255,255,0.85)';
            ctx.font=Math.floor(16*scale)+'px "Segoe UI","PingFang SC",sans-serif';
            ctx.fillText('D A N B O   W O R L D',W/2,H*0.35+45*scale);

            // Slogan
            ctx.fillStyle='rgba(255,255,255,0.5)';
            ctx.font='italic '+Math.floor(12*scale)+'px "Segoe UI","PingFang SC",sans-serif';
            ctx.fillText(L('slogan'),W/2,H*0.35+70*scale);

            // Version
            ctx.fillStyle='rgba(255,255,255,0.4)';
            ctx.font=Math.floor(11*scale)+'px "Segoe UI",sans-serif';
            ctx.fillText(L('version'),W/2,H*0.35+95*scale);

            ctx.globalAlpha=1;
            ctx.restore();
        }
    }

    // ======== PHASE 5: PRESS START + button (7s+) ========
    if(t>7){
        var btn=document.getElementById('start-btn');
        if(btn)btn.style.opacity='1';
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
    _introStart=performance.now()-7500;
    var btn=document.getElementById('start-btn');
    if(btn)btn.style.opacity='1';
    if(_introCanvas)_introCanvas.style.pointerEvents='none';
}

if(_introCanvas){
    _introCanvas.addEventListener('click',function(){
        if(!_introSkipped){
            _skipIntro();
        } else {
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
