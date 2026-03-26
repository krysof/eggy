// characters.js — DANBO World
const CHARACTERS = [
    // SF2 select screen layout: top row L→R, bottom row L→R
    {name:'\u7ECF\u5178\u86CB\u5B9D',type:'egg',color:0xFFDD44,accent:0xFFAA00,icon:'\uD83E\uDD5A',portrait:'#FFDD44',sf2:'Ryu',country:'Japan',flag:'\uD83C\uDDEF\uD83C\uDDF5',mapX:350,mapY:95},
    {name:'\u732A\u4ED4',type:'pig',color:0xFFAAAA,accent:0xFF7788,icon:'\uD83D\uDC37',portrait:'#FFAAAA',sf2:'E.Honda',country:'Japan',flag:'\uD83C\uDDEF\uD83C\uDDF5',mapX:350,mapY:95},
    {name:'\u732B\u4ED4',type:'cat',color:0xDDDDDD,accent:0xAAAAAA,icon:'\uD83D\uDC31',portrait:'#DDDDDD',sf2:'Blanka',country:'Brazil',flag:'\uD83C\uDDE7\uD83C\uDDF7',mapX:130,mapY:165},
    {name:'\u9E21\u516C',type:'rooster',color:0xFFEEDD,accent:0xFF4444,icon:'\uD83D\uDC13',portrait:'#FFEECC',sf2:'Guile',country:'USA',flag:'\uD83C\uDDFA\uD83C\uDDF8',mapX:80,mapY:80},
    {name:'\u72D7\u4ED4',type:'dog',color:0xC8915A,accent:0xA0704A,icon:'\uD83D\uDC36',portrait:'#C8915A',sf2:'Ken',country:'USA',flag:'\uD83C\uDDFA\uD83C\uDDF8',mapX:80,mapY:80},
    {name:'\u9A6C\u9A9D',type:'monkey',color:0xFF8866,accent:0xCC5533,icon:'\uD83D\uDC35',portrait:'#FF8866',sf2:'Chun-Li',country:'China',flag:'\uD83C\uDDE8\uD83C\uDDF3',mapX:310,mapY:90},
    {name:'\u7530\u9E21',type:'frog',color:0x55BB55,accent:0x338833,icon:'\uD83D\uDC38',portrait:'#55BB55',sf2:'Zangief',country:'Russia',flag:'\uD83C\uDDF7\uD83C\uDDFA',mapX:260,mapY:50},
    {name:'\u66F1\u7534',type:'cockroach',color:0x8B4513,accent:0x5C2E0A,icon:'\uD83E\uDEB3',portrait:'#8B4513',sf2:'Dhalsim',country:'India',flag:'\uD83C\uDDEE\uD83C\uDDF3',mapX:290,mapY:110},
];
let selectedChar = 0;
// Apply localized character names
for(var _ci=0;_ci<CHARACTERS.length;_ci++){CHARACTERS[_ci].name=I18N.charNames[_langCode][_ci]||CHARACTERS[_ci].name;}
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
        // Short tail hint
        portraitCtx.beginPath(); portraitCtx.arc(cx+52,cy+30,8,0,Math.PI*2);
        portraitCtx.fillStyle='#A0704A'; portraitCtx.fill();
    } else if (ch.type==='cat') {
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.moveTo(cx+s*30,cy-60);
            portraitCtx.lineTo(cx+s*50,cy-30); portraitCtx.lineTo(cx+s*15,cy-35);
            portraitCtx.fillStyle='#BBBBBB'; portraitCtx.fill();
        });
        [-1,1].forEach(s => { for(let w=-1;w<=1;w++){
            portraitCtx.beginPath(); portraitCtx.moveTo(cx+s*20,cy+8+w*6);
            portraitCtx.lineTo(cx+s*55,cy+4+w*8);
            portraitCtx.strokeStyle='rgba(0,0,0,0.3)'; portraitCtx.lineWidth=1; portraitCtx.stroke();
        }});
        // Tail
        portraitCtx.beginPath(); portraitCtx.moveTo(cx+50,cy+30);
        portraitCtx.quadraticCurveTo(cx+65,cy-10,cx+55,cy-30);
        portraitCtx.strokeStyle='#CCCCCC'; portraitCtx.lineWidth=5; portraitCtx.stroke();
    } else if (ch.type==='monkey') {
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.arc(cx+s*55,cy-5,18,0,Math.PI*2);
            portraitCtx.fillStyle='#FFCC88'; portraitCtx.fill();
            portraitCtx.beginPath(); portraitCtx.arc(cx+s*55,cy-5,12,0,Math.PI*2);
            portraitCtx.fillStyle='#D4956B'; portraitCtx.fill();
        });
        portraitCtx.beginPath(); portraitCtx.ellipse(cx,cy+10,25,18,0,0,Math.PI*2);
        portraitCtx.fillStyle='#FFCC88'; portraitCtx.fill();
        // Long tail
        portraitCtx.beginPath(); portraitCtx.moveTo(cx+48,cy+30);
        portraitCtx.quadraticCurveTo(cx+70,cy+10,cx+60,cy-20);
        portraitCtx.quadraticCurveTo(cx+55,cy-35,cx+65,cy-40);
        portraitCtx.strokeStyle='#CC5533'; portraitCtx.lineWidth=4; portraitCtx.stroke();
    } else if (ch.type==='rooster') {
        for(let i=0;i<3;i++){
            portraitCtx.beginPath(); portraitCtx.arc(cx-10+i*10,cy-68+Math.abs(i-1)*5,10,0,Math.PI*2);
            portraitCtx.fillStyle='#FF3333'; portraitCtx.fill();
        }
        portraitCtx.beginPath(); portraitCtx.ellipse(cx,cy+28,8,12,0,0,Math.PI*2);
        portraitCtx.fillStyle='#FF3333'; portraitCtx.fill();
        portraitCtx.beginPath(); portraitCtx.moveTo(cx-6,cy+4); portraitCtx.lineTo(cx+6,cy+4);
        portraitCtx.lineTo(cx,cy+16); portraitCtx.fillStyle='#FFAA00'; portraitCtx.fill();
        // Wings
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.ellipse(cx+s*52,cy+5,12,22,s*0.2,0,Math.PI*2);
            portraitCtx.fillStyle='#FFEECC'; portraitCtx.fill();
        });
        // Tail feathers
        for(let fi=0;fi<3;fi++){
            portraitCtx.beginPath(); portraitCtx.moveTo(cx-8+fi*8,cy+45);
            portraitCtx.lineTo(cx-12+fi*8,cy+70); portraitCtx.lineTo(cx-4+fi*8,cy+70);
            portraitCtx.fillStyle=fi===1?'#FF4444':'#FFAA00'; portraitCtx.fill();
        }
    } else if (ch.type==='cockroach') {
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.moveTo(cx+s*10,cy-55);
            portraitCtx.quadraticCurveTo(cx+s*35,cy-85,cx+s*45,cy-70);
            portraitCtx.strokeStyle='#5C2E0A'; portraitCtx.lineWidth=3; portraitCtx.stroke();
            // Tip ball
            portraitCtx.beginPath(); portraitCtx.arc(cx+s*45,cy-70,5,0,Math.PI*2);
            portraitCtx.fillStyle='#8B6040'; portraitCtx.fill();
        });
        portraitCtx.beginPath(); portraitCtx.moveTo(cx,cy-30); portraitCtx.lineTo(cx,cy+40);
        portraitCtx.strokeStyle='rgba(60,30,10,0.3)'; portraitCtx.lineWidth=1.5; portraitCtx.stroke();
    } else if (ch.type==='pig') {
        portraitCtx.beginPath(); portraitCtx.ellipse(cx,cy+10,16,12,0,0,Math.PI*2);
        portraitCtx.fillStyle='#FF8899'; portraitCtx.fill();
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.ellipse(cx+s*5,cy+10,3,4,0,0,Math.PI*2);
            portraitCtx.fillStyle='#DD6677'; portraitCtx.fill();
        });
        [-1,1].forEach(s => {
            portraitCtx.beginPath(); portraitCtx.ellipse(cx+s*40,cy-45,16,20,s*0.4,0,Math.PI*2);
            portraitCtx.fillStyle='#FFBBBB'; portraitCtx.fill();
        });
        // Curly tail hint
        portraitCtx.beginPath(); portraitCtx.arc(cx+50,cy+25,8,0,Math.PI*1.5);
        portraitCtx.strokeStyle='#FFAAAA'; portraitCtx.lineWidth=3; portraitCtx.stroke();
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
    // Eggshell for egg character
    if (ch.type==='egg') {
        portraitCtx.strokeStyle='#FFFFF0'; portraitCtx.lineWidth=2.5;
        portraitCtx.beginPath();
        portraitCtx.moveTo(cx-35,cy-55); portraitCtx.lineTo(cx-28,cy-65); portraitCtx.lineTo(cx-15,cy-52);
        portraitCtx.lineTo(cx-5,cy-68); portraitCtx.lineTo(cx+8,cy-54);
        portraitCtx.lineTo(cx+20,cy-66); portraitCtx.lineTo(cx+30,cy-53); portraitCtx.lineTo(cx+38,cy-58);
        portraitCtx.stroke();
        portraitCtx.fillStyle='rgba(255,255,240,0.25)';
        portraitCtx.beginPath(); portraitCtx.ellipse(cx,cy-55,38,8,0,0,Math.PI*2);
        portraitCtx.fill();
    }
    if (portraitName) portraitName.textContent = ch.name;
}

