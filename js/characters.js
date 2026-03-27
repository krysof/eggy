// characters.js — DANBO World
const CHARACTERS = [
    // SF2 select screen layout: top row L→R, bottom row L→R
    {name:'\u7ECF\u5178\u86CB\u5B9D',type:'egg',color:0xF5F5F0,accent:0xCC2222,icon:'\uD83E\uDD5A',portrait:'#F5F5F0',sf2:'Ryu',country:'Japan',flag:'\uD83C\uDDEF\uD83C\uDDF5',mapX:360,mapY:52},
    {name:'\u91CE\u725B',type:'pig',color:0x4A3728,accent:0x2244AA,icon:'\uD83D\uDC03',portrait:'#4A3728',sf2:'E.Honda',country:'Japan',flag:'\uD83C\uDDEF\uD83C\uDDF5',mapX:360,mapY:52},
    {name:'\u732B\u4ED4',type:'cat',color:0x33AA33,accent:0xFF8800,icon:'\uD83D\uDC31',portrait:'#33AA33',sf2:'Blanka',country:'Brazil',flag:'\uD83C\uDDE7\uD83C\uDDF7',mapX:95,mapY:155},
    {name:'\u9E21\u516C',type:'rooster',color:0x556B2F,accent:0xFFDD44,icon:'\uD83D\uDC13',portrait:'#556B2F',sf2:'Guile',country:'USA',flag:'\uD83C\uDDFA\uD83C\uDDF8',mapX:70,mapY:55},
    {name:'\u72D7\u4ED4',type:'dog',color:0xCC2222,accent:0xFFDD44,icon:'\uD83D\uDC36',portrait:'#CC2222',sf2:'Ken',country:'USA',flag:'\uD83C\uDDFA\uD83C\uDDF8',mapX:70,mapY:55},
    {name:'\u9A6C\u9A9D',type:'monkey',color:0x2255CC,accent:0xFFFFFF,icon:'\uD83D\uDC35',portrait:'#2255CC',sf2:'Chun-Li',country:'China',flag:'\uD83C\uDDE8\uD83C\uDDF3',mapX:310,mapY:55},
    {name:'\u5927\u718A',type:'frog',color:0x8B6B4A,accent:0x8B4513,icon:'\uD83D\uDC3B',portrait:'#8B6B4A',sf2:'Zangief',country:'Russia',flag:'\uD83C\uDDF7\uD83C\uDDFA',mapX:290,mapY:18},
    {name:'\u66F1\u7534',type:'cockroach',color:0x8B6914,accent:0xFFFFFF,icon:'\uD83E\uDEB3',portrait:'#8B6914',sf2:'Dhalsim',country:'India',flag:'\uD83C\uDDEE\uD83C\uDDF3',mapX:278,mapY:88},
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
    var W=portraitCanvas.width, H=portraitCanvas.height;
    portraitCtx.clearRect(0,0,W,H);
    var bg=portraitCtx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#1a1a4a');bg.addColorStop(1,'#0a0a2e');
    portraitCtx.fillStyle=bg;portraitCtx.fillRect(0,0,W,H);
    var cx=W/2,cy=H*0.52;
    // Body shape varies by character type
    var rx=55,ry=70;
    if(ch.type==='monkey'){rx=42;ry=75;} // Chun-Li: slim
    else if(ch.type==='cat'||ch.type==='pig'){rx=65;ry=60;} // Blanka/Honda: round
    else if(ch.type==='frog'){rx=72;ry=72;} // Zangief: 1.5x big
    else if(ch.type==='cockroach'){rx=30;ry=78;} // Dhalsim: thin tall
    // Body
    portraitCtx.beginPath();portraitCtx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
    portraitCtx.fillStyle=ch.portrait;portraitCtx.fill();
    portraitCtx.strokeStyle='rgba(255,255,255,0.15)';portraitCtx.lineWidth=2;portraitCtx.stroke();
    // Eyes
    var _eyeY=cy-12;
    [-1,1].forEach(function(s){
        portraitCtx.beginPath();portraitCtx.ellipse(cx+s*18,_eyeY,10,12,0,0,Math.PI*2);
        portraitCtx.fillStyle='#fff';portraitCtx.fill();
        portraitCtx.beginPath();portraitCtx.arc(cx+s*18,_eyeY+1,6,0,Math.PI*2);
        portraitCtx.fillStyle='#111';portraitCtx.fill();
        portraitCtx.beginPath();portraitCtx.arc(cx+s*16,_eyeY-3,2,0,Math.PI*2);
        portraitCtx.fillStyle='#fff';portraitCtx.fill();
    });
    // Smile
    portraitCtx.beginPath();portraitCtx.arc(cx,cy+12,14,0.15*Math.PI,0.85*Math.PI);
    portraitCtx.strokeStyle='#333';portraitCtx.lineWidth=2.5;portraitCtx.stroke();
    // Blush
    [-1,1].forEach(function(s){
        portraitCtx.beginPath();portraitCtx.ellipse(cx+s*32,cy+8,10,6,0,0,Math.PI*2);
        portraitCtx.fillStyle='rgba(255,120,120,0.3)';portraitCtx.fill();
    });
    // ---- Character-specific SF2 features ----
    var _ac='#'+((ch.accent||0).toString(16)).padStart(6,'0');
    if(ch.type==='egg'){
        // Ryu: eggshell + red headband
        portraitCtx.strokeStyle='#FFFFF0';portraitCtx.lineWidth=2.5;
        portraitCtx.beginPath();
        portraitCtx.moveTo(cx-35,cy-55);portraitCtx.lineTo(cx-28,cy-65);portraitCtx.lineTo(cx-15,cy-52);
        portraitCtx.lineTo(cx-5,cy-68);portraitCtx.lineTo(cx+8,cy-54);portraitCtx.lineTo(cx+20,cy-66);
        portraitCtx.lineTo(cx+30,cy-53);portraitCtx.lineTo(cx+38,cy-58);portraitCtx.stroke();
        // Red headband
        portraitCtx.strokeStyle='#CC2222';portraitCtx.lineWidth=5;
        portraitCtx.beginPath();portraitCtx.arc(cx,cy-48,38,0.7*Math.PI,0.3*Math.PI);portraitCtx.stroke();
        // Trailing ends
        portraitCtx.beginPath();portraitCtx.moveTo(cx+36,cy-42);portraitCtx.quadraticCurveTo(cx+50,cy-35,cx+55,cy-25);
        portraitCtx.strokeStyle='#CC2222';portraitCtx.lineWidth=4;portraitCtx.stroke();
    } else if(ch.type==='dog'){
        // Ken: floppy ears + blonde spiky hair
        [-1,1].forEach(function(s){
            portraitCtx.beginPath();portraitCtx.ellipse(cx+s*45,cy-50,16,28,s*0.3,0,Math.PI*2);
            portraitCtx.fillStyle=ch.portrait;portraitCtx.fill();
        });
        // Blonde spiky hair
        for(var ki=0;ki<5;ki++){
            portraitCtx.beginPath();portraitCtx.moveTo(cx-20+ki*10,cy-60);
            portraitCtx.lineTo(cx-15+ki*10,cy-80-Math.random()*10);portraitCtx.lineTo(cx-10+ki*10,cy-60);
            portraitCtx.fillStyle='#FFDD44';portraitCtx.fill();
        }
        portraitCtx.beginPath();portraitCtx.ellipse(cx,cy+6,12,8,0,0,Math.PI*2);
        portraitCtx.fillStyle='#333';portraitCtx.fill();
    } else if(ch.type==='pig'){
        // Buffalo (野牛) — Honda
        // Big bull horns (牛魔王 style) — horizontal then curve up
        [-1,1].forEach(function(s){
            // Thick horn going outward then curving up
            portraitCtx.beginPath();
            portraitCtx.moveTo(cx+s*22,cy-40);
            portraitCtx.quadraticCurveTo(cx+s*60,cy-38,cx+s*65,cy-65);
            portraitCtx.lineTo(cx+s*58,cy-62);
            portraitCtx.quadraticCurveTo(cx+s*50,cy-38,cx+s*22,cy-34);
            portraitCtx.closePath();
            portraitCtx.fillStyle='#444';portraitCtx.fill();
            // Horn tip lighter
            portraitCtx.beginPath();portraitCtx.arc(cx+s*63,cy-63,4,0,Math.PI*2);
            portraitCtx.fillStyle='#CCBB88';portraitCtx.fill();
        });
        // Nose ring
        portraitCtx.beginPath();portraitCtx.arc(cx,cy+18,6,0,Math.PI);
        portraitCtx.strokeStyle='#CCAA00';portraitCtx.lineWidth=3;portraitCtx.stroke();
        // Wide nostrils
        [-1,1].forEach(function(s){
            portraitCtx.beginPath();portraitCtx.arc(cx+s*8,cy+12,4,0,Math.PI*2);
            portraitCtx.fillStyle='#2A1A0A';portraitCtx.fill();
        });
        // Face paint
        portraitCtx.fillStyle='rgba(34,68,170,0.4)';
        portraitCtx.fillRect(cx-38,cy-8,16,4);portraitCtx.fillRect(cx+22,cy-8,16,4);
        portraitCtx.fillStyle='rgba(204,34,34,0.4)';
        portraitCtx.fillRect(cx-38,cy-2,16,4);portraitCtx.fillRect(cx+22,cy-2,16,4);
        // Topknot
        portraitCtx.beginPath();portraitCtx.arc(cx,cy-68,10,0,Math.PI*2);
        portraitCtx.fillStyle='#222';portraitCtx.fill();
    } else if(ch.type==='cat'){
        // Blanka: pointed ears UP + orange wild mane + fangs
        [-1,1].forEach(function(s){
            portraitCtx.beginPath();portraitCtx.moveTo(cx+s*30,cy-60);
            portraitCtx.lineTo(cx+s*50,cy-30);portraitCtx.lineTo(cx+s*15,cy-35);
            portraitCtx.fillStyle=ch.portrait;portraitCtx.fill();
        });
        // Orange wild mane
        for(var bi=0;bi<8;bi++){
            var ba=bi/8*Math.PI-Math.PI/2;
            portraitCtx.beginPath();portraitCtx.moveTo(cx+Math.cos(ba)*30,cy-50+Math.sin(ba)*15);
            portraitCtx.lineTo(cx+Math.cos(ba)*55,cy-55+Math.sin(ba)*25);
            portraitCtx.lineTo(cx+Math.cos(ba+0.3)*35,cy-48+Math.sin(ba+0.3)*15);
            portraitCtx.fillStyle='#FF8800';portraitCtx.fill();
        }
        // Fangs
        [-1,1].forEach(function(s){
            portraitCtx.beginPath();portraitCtx.moveTo(cx+s*10,cy+18);portraitCtx.lineTo(cx+s*8,cy+28);
            portraitCtx.lineTo(cx+s*12,cy+18);portraitCtx.fillStyle='#fff';portraitCtx.fill();
        });
        // Whiskers
        [-1,1].forEach(function(s){for(var w=-1;w<=1;w++){
            portraitCtx.beginPath();portraitCtx.moveTo(cx+s*20,cy+8+w*6);portraitCtx.lineTo(cx+s*55,cy+4+w*8);
            portraitCtx.strokeStyle='rgba(0,0,0,0.3)';portraitCtx.lineWidth=1;portraitCtx.stroke();
        }});
    } else if(ch.type==='rooster'){
        // Guile: comb + blonde flat-top + beak
        for(var ri=0;ri<3;ri++){
            portraitCtx.beginPath();portraitCtx.arc(cx-10+ri*10,cy-68+Math.abs(ri-1)*5,10,0,Math.PI*2);
            portraitCtx.fillStyle='#FF3333';portraitCtx.fill();
        }
        // Blonde flat-top
        portraitCtx.fillStyle='#FFDD44';portraitCtx.fillRect(cx-25,cy-78,50,16);
        // Beak
        portraitCtx.beginPath();portraitCtx.moveTo(cx-6,cy+4);portraitCtx.lineTo(cx+6,cy+4);
        portraitCtx.lineTo(cx,cy+16);portraitCtx.fillStyle='#FFAA00';portraitCtx.fill();
        // Wattle
        portraitCtx.beginPath();portraitCtx.ellipse(cx,cy+28,8,12,0,0,Math.PI*2);
        portraitCtx.fillStyle='#FF3333';portraitCtx.fill();
    } else if(ch.type==='monkey'){
        // Chun-Li: round ears + hair buns with white ribbons
        [-1,1].forEach(function(s){
            portraitCtx.beginPath();portraitCtx.arc(cx+s*55,cy-5,18,0,Math.PI*2);
            portraitCtx.fillStyle='#FFCC88';portraitCtx.fill();
            portraitCtx.beginPath();portraitCtx.arc(cx+s*55,cy-5,12,0,Math.PI*2);
            portraitCtx.fillStyle='#D4956B';portraitCtx.fill();
        });
        // Hair buns
        [-1,1].forEach(function(s){
            portraitCtx.beginPath();portraitCtx.arc(cx+s*38,cy-55,14,0,Math.PI*2);
            portraitCtx.fillStyle='#222';portraitCtx.fill();
            // White ribbon
            portraitCtx.beginPath();portraitCtx.moveTo(cx+s*38,cy-42);portraitCtx.lineTo(cx+s*42,cy-30);
            portraitCtx.lineTo(cx+s*34,cy-30);portraitCtx.fillStyle='#fff';portraitCtx.fill();
        });
        portraitCtx.beginPath();portraitCtx.ellipse(cx,cy+10,25,18,0,0,Math.PI*2);
        portraitCtx.fillStyle='#FFCC88';portraitCtx.fill();
    } else if(ch.type==='frog'){
        // Bear with boar mask (Inosuke style) — Zangief
        // Round bear ears
        [-1,1].forEach(function(s){
            portraitCtx.beginPath();portraitCtx.arc(cx+s*38,cy-55,14,0,Math.PI*2);
            portraitCtx.fillStyle='#6B4A2A';portraitCtx.fill();
            portraitCtx.beginPath();portraitCtx.arc(cx+s*38,cy-55,8,0,Math.PI*2);
            portraitCtx.fillStyle='#AA7755';portraitCtx.fill();
        });
        // Boar mask
        portraitCtx.beginPath();portraitCtx.ellipse(cx,cy+2,30,22,0,0,Math.PI*2);
        portraitCtx.fillStyle='#DDCCAA';portraitCtx.fill();
        // Snout
        portraitCtx.beginPath();portraitCtx.ellipse(cx,cy+12,14,10,0,0,Math.PI*2);
        portraitCtx.fillStyle='#CCBB99';portraitCtx.fill();
        [-1,1].forEach(function(s){
            portraitCtx.beginPath();portraitCtx.arc(cx+s*5,cy+12,3,0,Math.PI*2);
            portraitCtx.fillStyle='#885544';portraitCtx.fill();
        });
        // Tusks
        [-1,1].forEach(function(s){
            portraitCtx.beginPath();portraitCtx.moveTo(cx+s*10,cy+18);portraitCtx.lineTo(cx+s*8,cy+28);
            portraitCtx.lineTo(cx+s*14,cy+20);portraitCtx.fillStyle='#FFFFF0';portraitCtx.fill();
        });
        // Chest hair
        portraitCtx.fillStyle='rgba(139,69,19,0.5)';
        portraitCtx.beginPath();portraitCtx.ellipse(cx,cy+15,20,12,0,0,Math.PI*2);portraitCtx.fill();
        // Scars
        portraitCtx.strokeStyle='rgba(200,100,100,0.5)';portraitCtx.lineWidth=2;
        portraitCtx.beginPath();portraitCtx.moveTo(cx-15,cy-5);portraitCtx.lineTo(cx-5,cy+10);portraitCtx.stroke();
        portraitCtx.beginPath();portraitCtx.moveTo(cx+10,cy);portraitCtx.lineTo(cx+20,cy+12);portraitCtx.stroke();
    } else if(ch.type==='cockroach'){
        // Dhalsim: antennae + skull necklace
        [-1,1].forEach(function(s){
            portraitCtx.beginPath();portraitCtx.moveTo(cx+s*10,cy-55);
            portraitCtx.quadraticCurveTo(cx+s*35,cy-85,cx+s*45,cy-70);
            portraitCtx.strokeStyle='#5C2E0A';portraitCtx.lineWidth=3;portraitCtx.stroke();
            portraitCtx.beginPath();portraitCtx.arc(cx+s*45,cy-70,5,0,Math.PI*2);
            portraitCtx.fillStyle='#8B6040';portraitCtx.fill();
        });
        // Skull necklace
        for(var si=0;si<3;si++){
            portraitCtx.beginPath();portraitCtx.arc(cx-12+si*12,cy+35,5,0,Math.PI*2);
            portraitCtx.fillStyle='#fff';portraitCtx.fill();
            portraitCtx.beginPath();portraitCtx.arc(cx-12+si*12,cy+35,2,0,Math.PI*2);
            portraitCtx.fillStyle='#333';portraitCtx.fill();
        }
    }
}

