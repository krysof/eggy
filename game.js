// ============================================================
//  蛋仔世界 — Egg World  (Hub City + Race Portals)
// ============================================================
/* global THREE */

// ---- i18n Localization ----
var _langCode=(function(){
    var nav=navigator.language||navigator.userLanguage||'en';
    nav=nav.toLowerCase();
    if(nav.indexOf('zh-tw')===0||nav.indexOf('zh-hant')===0||nav.indexOf('zh-hk')===0)return 'zht';
    if(nav.indexOf('zh')===0)return 'zhs';
    if(nav.indexOf('ja')===0)return 'ja';
    return 'en';
})();
var I18N={
    title:{zhs:'蛋仔世界',zht:'蛋仔世界',ja:'\u305F\u307E\u3054\u30EF\u30FC\u30EB\u30C9',en:'Egg World'},
    subtitle:{zhs:'E G G   W O R L D',zht:'E G G   W O R L D',ja:'E G G   W O R L D',en:'E G G   W O R L D'},
    version:{zhs:'v20260323.19 by \u767D\u6CB3\u6101',zht:'v20260323.19 by \u767D\u6CB3\u6101',ja:'v20260323.19 by \u767D\u6CB3\u6101',en:'v20260323.19 by Kryso'},
    startBtn:{zhs:'\uD83C\uDFAE \u5F00\u59CB\u6E38\u620F',zht:'\uD83C\uDFAE \u958B\u59CB\u904A\u6232',ja:'\uD83C\uDFAE \u30B2\u30FC\u30E0\u30B9\u30BF\u30FC\u30C8',en:'\uD83C\uDFAE Start Game'},
    selectTitle:{zhs:'\u2014 \u9009 \u62E9 \u89D2 \u8272 \u2014',zht:'\u2014 \u9078 \u64C7 \u89D2 \u8272 \u2014',ja:'\u2014 \u30AD\u30E3\u30E9\u9078\u629E \u2014',en:'\u2014 SELECT CHARACTER \u2014'},
    confirmBtn:{zhs:'\u2694\uFE0F \u786E\u8BA4\u51FA\u6218',zht:'\u2694\uFE0F \u78BA\u8A8D\u51FA\u6230',ja:'\u2694\uFE0F \u6C7A\u5B9A',en:'\u2694\uFE0F Confirm'},
    portalYes:{zhs:'\u2705 \u8FDB\u5165 (Y/\u56DE\u8F66)',zht:'\u2705 \u9032\u5165 (Y/Enter)',ja:'\u2705 \u5165\u308B (Y/Enter)',en:'\u2705 Enter (Y/Enter)'},
    portalNo:{zhs:'\u274C \u53D6\u6D88 (N/ESC)',zht:'\u274C \u53D6\u6D88 (N/ESC)',ja:'\u274C \u30AD\u30E3\u30F3\u30BB\u30EB (N/ESC)',en:'\u274C Cancel (N/ESC)'},
    grabThrow:{zhs:'F \u6293/\u6254',zht:'F \u6293/\u64F2',ja:'F \u3064\u304B\u3080/\u6295\u3052\u308B',en:'F Grab/Throw'},
    raceBack:{zhs:'\uD83C\uDFD9\uFE0F \u8FD4\u56DE',zht:'\uD83C\uDFD9\uFE0F \u8FD4\u56DE',ja:'\uD83C\uDFD9\uFE0F \u623B\u308B',en:'\uD83C\uDFD9\uFE0F Back'},
    backCity:{zhs:'\uD83C\uDFD9\uFE0F \u8FD4\u56DE\u57CE\u5E02',zht:'\uD83C\uDFD9\uFE0F \u8FD4\u56DE\u57CE\u5E02',ja:'\uD83C\uDFD9\uFE0F \u8857\u306B\u623B\u308B',en:'\uD83C\uDFD9\uFE0F Back to City'},
    resultDone:{zhs:'\u5B8C\u6210\uFF01',zht:'\u5B8C\u6210\uFF01',ja:'\u5B8C\u4E86\uFF01',en:'Done!'},
    rushGoal:{zhs:'\u51B2\u5411\u7EC8\u70B9\uFF01',zht:'\u885D\u5411\u7D42\u9EDE\uFF01',ja:'\u30B4\u30FC\u30EB\u3092\u76EE\u6307\u305B\uFF01',en:'Rush to the finish!'},
    roundN:function(n){return{zhs:'\u7B2C '+n+' \u8F6E',zht:'\u7B2C '+n+' \u8F2A',ja:'\u7B2C'+n+'\u30E9\u30A6\u30F3\u30C9',en:'Round '+n}[_langCode];},
    placeN:function(n){return{zhs:'\uD83D\uDCCD \u7B2C'+n+'\u540D',zht:'\uD83D\uDCCD \u7B2C'+n+'\u540D',ja:'\uD83D\uDCCD '+n+'\u4F4D',en:'\uD83D\uDCCD #'+n}[_langCode];},
    resultWin:function(p,c){return{zhs:'\u7B2C'+p+'\u540D \u00B7 \u664B\u7EA7\uFF01',zht:'\u7B2C'+p+'\u540D \u00B7 \u6649\u7D1A\uFF01',ja:p+'\u4F4D \u00B7 \u901A\u904E\uFF01',en:'#'+p+' \u00B7 Passed!'}[_langCode];},
    resultLose:{zhs:'\u88AB\u6DD8\u6C70\u4E86\uFF01',zht:'\u88AB\u6DD8\u6C70\u4E86\uFF01',ja:'\u8131\u843D\u2026',en:'Eliminated!'},
    resultSub:function(c){return{zhs:'\u83B7\u5F97 \u2B50\u00D73 + \uD83E\uDE99\u00D7'+c,zht:'\u7372\u5F97 \u2B50\u00D73 + \uD83E\uDE99\u00D7'+c,ja:'\u2B50\u00D73 + \uD83E\uDE99\u00D7'+c+' \u7372\u5F97',en:'Got \u2B50\u00D73 + \uD83E\uDE99\u00D7'+c}[_langCode];},
    tryAgain:{zhs:'\u518D\u63A5\u518D\u53B1\uFF01',zht:'\u518D\u63A5\u518D\u53B2\uFF01',ja:'\u3082\u3046\u4E00\u5EA6\uFF01',en:'Try again!'},
    grab:{zhs:'\u6293',zht:'\u6293',ja:'\u3064\u304B\u3080',en:'Grab'},
    throwT:{zhs:'\u6254',zht:'\u64F2',ja:'\u6295\u3052\u308B',en:'Throw'},
    jump:{zhs:'\u8DF3',zht:'\u8DF3',ja:'\u30B8\u30E3\u30F3\u30D7',en:'Jump'},
    walkIn:{zhs:'\u8D70\u8FD1\u8FDB\u5165',zht:'\u8D70\u8FD1\u9032\u5165',ja:'\u8FD1\u3065\u3044\u3066\u5165\u308B',en:'Walk in to enter'},
    charNames:{
        zhs:['经典蛋','小狗','马骝','公鸡','蟑螂','小猫','小猪','青蛙'],
        zht:['\u7D93\u5178\u86CB','\u5C0F\u72D7','\u99AC\u9A1D','\u516C\u96DE','\u8708\u87C2','\u5C0F\u8C93','\u5C0F\u8C6C','\u9752\u86D9'],
        ja:['\u305F\u307E\u3054','\u30A4\u30CC','\u30B5\u30EB','\u30CB\u30EF\u30C8\u30EA','\u30B4\u30AD\u30D6\u30EA','\u30CD\u30B3','\u30D6\u30BF','\u30AB\u30A8\u30EB'],
        en:['Classic Egg','Puppy','Monkey','Rooster','Cockroach','Kitty','Piggy','Frog']
    },
    cityNames:{
        zhs:['\uD83C\uDFD9\uFE0F \u86CB\u4ED4\u57CE','\uD83C\uDFDC\uFE0F \u6C99\u6F20\u57CE','\u2744\uFE0F \u51B0\u96EA\u57CE','\uD83D\uDD25 \u7194\u5CA9\u57CE','\uD83C\uDF6C \u7CD6\u679C\u57CE'],
        zht:['\uD83C\uDFD9\uFE0F \u86CB\u4ED4\u57CE','\uD83C\uDFDC\uFE0F \u6C99\u6F20\u57CE','\u2744\uFE0F \u51B0\u96EA\u57CE','\uD83D\uDD25 \u7194\u5CA9\u57CE','\uD83C\uDF6C \u7CD6\u679C\u57CE'],
        ja:['\uD83C\uDFD9\uFE0F \u305F\u307E\u3054\u30B7\u30C6\u30A3','\uD83C\uDFDC\uFE0F \u7802\u6F20\u30B7\u30C6\u30A3','\u2744\uFE0F \u6C37\u96EA\u30B7\u30C6\u30A3','\uD83D\uDD25 \u6EB6\u5CA9\u30B7\u30C6\u30A3','\uD83C\uDF6C \u30AD\u30E3\u30F3\u30C7\u30A3\u30B7\u30C6\u30A3'],
        en:['\uD83C\uDFD9\uFE0F Egg City','\uD83C\uDFDC\uFE0F Desert City','\u2744\uFE0F Ice City','\uD83D\uDD25 Lava City','\uD83C\uDF6C Candy City']
    },
    raceNames:{
        zhs:['\uD83C\uDF00 \u7591\u72C2\u8D5B\u9053','\uD83D\uDD28 \u9524\u5B50\u98CE\u66B4','\u26A1 \u6781\u9650\u6311\u6218','\uD83D\uDC51 \u51A0\u519B\u4E4B\u8DEF','\uD83D\uDC8E \u7EFF\u5B9D\u77F3\u5C71\u4E18','\uD83D\uDD25 \u706B\u7130\u5C71\u8C37','\u2744\uFE0F \u51B0\u971C\u6ED1\u9053','\uD83C\uDF08 \u5F69\u8679\u5929\u7A7A','\uD83C\uDF44 \u8611\u83C7\u738B\u56FD','\uD83D\uDD25 \u5CA9\u6D46\u57CE\u5821','\u2601\uFE0F \u4E91\u7AEF\u5929\u5802','\uD83C\uDFF0 \u5E93\u5DF4\u57CE\u5821'],
        zht:['\uD83C\uDF00 \u760B\u72C2\u8CFD\u9053','\uD83D\uDD28 \u9318\u5B50\u98A8\u66B4','\u26A1 \u6975\u9650\u6311\u6230','\uD83D\uDC51 \u51A0\u8ECD\u4E4B\u8DEF','\uD83D\uDC8E \u7DA0\u5BF6\u77F3\u5C71\u4E18','\uD83D\uDD25 \u706B\u7130\u5C71\u8C37','\u2744\uFE0F \u51B0\u971C\u6ED1\u9053','\uD83C\uDF08 \u5F69\u8679\u5929\u7A7A','\uD83C\uDF44 \u8611\u83C7\u738B\u570B','\uD83D\uDD25 \u5CA9\u6F3F\u57CE\u5821','\u2601\uFE0F \u96F2\u7AEF\u5929\u5802','\uD83C\uDFF0 \u5EAB\u5DF4\u57CE\u5821'],
        ja:['\uD83C\uDF00 \u30AF\u30EC\u30A4\u30B8\u30FC\u30B3\u30FC\u30B9','\uD83D\uDD28 \u30CF\u30F3\u30DE\u30FC\u30B9\u30C8\u30FC\u30E0','\u26A1 \u30A8\u30AF\u30B9\u30C8\u30EA\u30FC\u30E0','\uD83D\uDC51 \u30C1\u30E3\u30F3\u30D4\u30AA\u30F3\u30ED\u30FC\u30C9','\uD83D\uDC8E \u30A8\u30E1\u30E9\u30EB\u30C9\u30D2\u30EB','\uD83D\uDD25 \u30D5\u30EC\u30A4\u30E0\u30D0\u30EC\u30FC','\u2744\uFE0F \u30A2\u30A4\u30B9\u30B9\u30E9\u30A4\u30C0\u30FC','\uD83C\uDF08 \u30EC\u30A4\u30F3\u30DC\u30FC\u30B9\u30AB\u30A4','\uD83C\uDF44 \u30AD\u30CE\u30B3\u30AD\u30F3\u30B0\u30C0\u30E0','\uD83D\uDD25 \u30DE\u30B0\u30DE\u30AD\u30E3\u30C3\u30B9\u30EB','\u2601\uFE0F \u30AF\u30E9\u30A6\u30C9\u30D8\u30D6\u30F3','\uD83C\uDFF0 \u30AF\u30C3\u30D1\u57CE'],
        en:['\uD83C\uDF00 Crazy Course','\uD83D\uDD28 Hammer Storm','\u26A1 Extreme Challenge','\uD83D\uDC51 Champion Road','\uD83D\uDC8E Emerald Hills','\uD83D\uDD25 Flame Valley','\u2744\uFE0F Ice Slider','\uD83C\uDF08 Rainbow Sky','\uD83C\uDF44 Mushroom Kingdom','\uD83D\uDD25 Magma Castle','\u2601\uFE0F Cloud Heaven','\uD83C\uDFF0 Koopa Castle']
    },
    raceDescs:{
        zhs:['\u65CB\u8F6C\u81C2\u4E0E\u4F20\u9001\u5E26\uFF01','\u5927\u9524\u4E0E\u6446\u9524\uFF01\u5C0F\u5FC3\uFF01','\u6240\u6709\u969C\u788D\u52A0\u901F\uFF01','\u6700\u7EC8\u51B3\u6218\uFF01','\u91D1\u5E01\u4E0E\u5F39\u7C27\uFF01','\u52A0\u901F\u5E26\u4E0E\u5CA9\u6D46\u5730\u5F62\uFF01','\u6ED1\u51B0\u5730\u5F62\u4E0E\u5F39\u7C27\uFF01','\u7A7A\u4E2D\u5E73\u53F0\u4E0E\u91D1\u5E01\u96E8\uFF01','\u7ECF\u5178\u6C34\u7BA1\u4E0E\u677F\u6817\uFF01','\u5CA9\u6D46\u5730\u5F62\u4E0E\u706B\u7403\uFF01','\u7A7A\u4E2D\u5E73\u53F0\u4E0E\u5F39\u7C27\uFF01','\u6700\u7EC8\u5173\u5361\uFF01\u5168\u969C\u788D\uFF01'],
        zht:['\u65CB\u8F49\u81C2\u8207\u50B3\u9001\u5E36\uFF01','\u5927\u9318\u8207\u64FA\u9318\uFF01\u5C0F\u5FC3\uFF01','\u6240\u6709\u969C\u7919\u52A0\u901F\uFF01','\u6700\u7D42\u6C7A\u6230\uFF01','\u91D1\u5E63\u8207\u5F48\u7C27\uFF01','\u52A0\u901F\u5E36\u8207\u5CA9\u6F3F\u5730\u5F62\uFF01','\u6ED1\u51B0\u5730\u5F62\u8207\u5F48\u7C27\uFF01','\u7A7A\u4E2D\u5E73\u53F0\u8207\u91D1\u5E63\u96E8\uFF01','\u7D93\u5178\u6C34\u7BA1\u8207\u677F\u6817\uFF01','\u5CA9\u6F3F\u5730\u5F62\u8207\u706B\u7403\uFF01','\u7A7A\u4E2D\u5E73\u53F0\u8207\u5F48\u7C27\uFF01','\u6700\u7D42\u95DC\u5361\uFF01\u5168\u969C\u7919\uFF01'],
        ja:['\u56DE\u8EE2\u30A2\u30FC\u30E0\u3068\u30D9\u30EB\u30C8\u30B3\u30F3\u30D9\u30A2\uFF01','\u30CF\u30F3\u30DE\u30FC\u3068\u632F\u308A\u5B50\uFF01\u6CE8\u610F\uFF01','\u5168\u969C\u5BB3\u7269\u30B9\u30D4\u30FC\u30C9UP\uFF01','\u6700\u7D42\u6C7A\u6226\uFF01','\u30B3\u30A4\u30F3\u3068\u30D0\u30CD\uFF01','\u30D6\u30FC\u30B9\u30C8\u3068\u6EB6\u5CA9\uFF01','\u6C37\u306E\u5730\u5F62\u3068\u30D0\u30CD\uFF01','\u7A7A\u4E2D\u8DB3\u5834\u3068\u30B3\u30A4\u30F3\u306E\u96E8\uFF01','\u571F\u7BA1\u3068\u30AF\u30EA\u30DC\u30FC\uFF01','\u6EB6\u5CA9\u3068\u706B\u306E\u7389\uFF01','\u7A7A\u4E2D\u8DB3\u5834\u3068\u30D0\u30CD\uFF01','\u6700\u7D42\u30B9\u30C6\u30FC\u30B8\uFF01\u5168\u969C\u5BB3\u7269\uFF01'],
        en:['Spinners & conveyors!','Hammers & pendulums! Watch out!','All obstacles sped up!','Final showdown!','Coins & springs!','Boost pads & lava terrain!','Ice terrain & springs!','Sky platforms & coin rain!','Classic pipes & goombas!','Lava terrain & fireballs!','Sky platforms & springs!','Final stage! All obstacles!']
    },
    loadFail:{zhs:'\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0',zht:'\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u91CD\u65B0\u6574\u7406',ja:'\u8AAD\u307F\u8FBC\u307F\u5931\u6557\u3002\u30EA\u30ED\u30FC\u30C9\u3057\u3066\u304F\u3060\u3055\u3044',en:'Load failed, please refresh'},
    loading:{zhs:'3D\u5F15\u64CE\u52A0\u8F7D\u4E2D...',zht:'3D\u5F15\u64CE\u8F09\u5165\u4E2D...',ja:'3D\u30A8\u30F3\u30B8\u30F3\u8AAD\u307F\u8FBC\u307F\u4E2D...',en:'Loading 3D engine...'},
    music:{zhs:'\u97F3\u4E50',zht:'\u97F3\u6A02',ja:'\u97F3\u697D',en:'Music'},
    sfx:{zhs:'\u97F3\u6548',zht:'\u97F3\u6548',ja:'SE',en:'SFX'}
};
function L(key){var v=I18N[key];if(!v)return key;if(typeof v==='string')return v;return v[_langCode]||v.en||'';}

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
let audioCtx=null, soundEnabled=true, sfxEnabled=true, _audioUnlocked=false;
// iOS 17+ audio session hint
try{if(navigator.audioSession)navigator.audioSession.type='transient';}catch(e){}
function ensureAudio(){
    if(!audioCtx){
        var AC=window.AudioContext||window.webkitAudioContext;
        if(AC)audioCtx=new AC();
    }
    if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();
    return audioCtx;
}
// Silent HTML audio element trick — helps unlock on iOS Safari
var _silentAudio=null;
function _playSilentHtml(){
    if(_silentAudio)return;
    try{
        _silentAudio=document.createElement('audio');
        _silentAudio.setAttribute('playsinline','');
        _silentAudio.setAttribute('webkit-playsinline','');
        // Tiny silent WAV data URI
        _silentAudio.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        _silentAudio.volume=0.01;
        _silentAudio.play().catch(function(){});
    }catch(e){}
}
// Mobile audio unlock — aggressive multi-strategy approach
function _unlockAudio(){
    if(_audioUnlocked&&audioCtx&&audioCtx.state==='running')return;
    // Strategy 1: silent HTML audio element (iOS needs this)
    _playSilentHtml();
    // Strategy 2: create AudioContext inside gesture
    if(!audioCtx){
        var AC=window.AudioContext||window.webkitAudioContext;
        if(AC)audioCtx=new AC();
    }
    if(!audioCtx)return;
    // Strategy 3: resume + silent buffer
    audioCtx.resume();
    try{
        var b=audioCtx.createBuffer(1,1,audioCtx.sampleRate||22050);
        var s=audioCtx.createBufferSource();s.buffer=b;s.connect(audioCtx.destination);s.start(0);
    }catch(e){}
    if(audioCtx.state==='running')_audioUnlocked=true;
    // Strategy 4: check again after a tick
    setTimeout(function(){
        if(audioCtx&&audioCtx.state==='running')_audioUnlocked=true;
        else if(audioCtx)audioCtx.resume();
    },100);
}
// Keep retrying on every touch/click/key until unlocked
document.addEventListener('touchstart',_unlockAudio,{passive:true});
document.addEventListener('touchend',_unlockAudio,{passive:true});
document.addEventListener('click',_unlockAudio);
document.addEventListener('pointerdown',_unlockAudio,{passive:true});
document.addEventListener('keydown',_unlockAudio);

// Music toggle button
var musicBtn=document.getElementById("music-btn");
if(musicBtn) musicBtn.addEventListener("click",function(){
    soundEnabled=!soundEnabled;
    musicBtn.textContent=soundEnabled?"🎵":"🚫";
    musicBtn.classList.toggle("muted",!soundEnabled);
    if(!soundEnabled){stopBGM();stopRaceBGM();stopSelectBGM();}
    else if(gameState==="city") startBGM();
    else if(gameState==="racing"||gameState==="raceIntro") startRaceBGM(currentRaceIndex);
});
// SFX toggle button
var sfxBtn=document.getElementById("sfx-btn");
if(sfxBtn) sfxBtn.addEventListener("click",function(){
    sfxEnabled=!sfxEnabled;
    sfxBtn.textContent=sfxEnabled?"🔊":"🔇";
    sfxBtn.classList.toggle("muted",!sfxEnabled);
});

// Language toggle button
var _langOrder=['zhs','zht','ja','en'];
var _langLabels={zhs:'简',zht:'繁',ja:'JP',en:'EN'};
var langBtn=document.getElementById("lang-btn");
function _applyLang(){
    // Re-localize arrays
    for(var i=0;i<CHARACTERS.length;i++){CHARACTERS[i].name=I18N.charNames[_langCode][i]||CHARACTERS[i].name;}
    for(var i=0;i<CITY_STYLES.length;i++){CITY_STYLES[i].name=I18N.cityNames[_langCode][i]||CITY_STYLES[i].name;}
    for(var i=0;i<RACES.length;i++){RACES[i].name=I18N.raceNames[_langCode][i]||RACES[i].name;RACES[i].desc=I18N.raceDescs[_langCode][i]||RACES[i].desc;}
    // Re-localize HTML
    document.documentElement.lang=_langCode==='zhs'?'zh-CN':_langCode==='zht'?'zh-TW':_langCode==='ja'?'ja':'en';
    document.title=L('title');
    var h1=document.querySelector('#start-screen h1');if(h1)h1.textContent=L('title');
    var sub=document.querySelector('.subtitle');if(sub)sub.textContent=L('subtitle');
    var ver=document.querySelector('.version-text');if(ver)ver.textContent=L('version');
    var sb=document.getElementById('start-btn');if(sb)sb.textContent=L('startBtn');
    var st=document.querySelector('.select-title');if(st)st.textContent=L('selectTitle');
    var cb=document.getElementById('confirm-btn');if(cb)cb.textContent=L('confirmBtn');
    var py=document.getElementById('portal-yes');if(py)py.textContent=L('portalYes');
    var pn=document.getElementById('portal-no');if(pn)pn.textContent=L('portalNo');
    var mb=document.getElementById('music-btn');if(mb)mb.title=L('music');
    var sb2=document.getElementById('sfx-btn');if(sb2)sb2.title=L('sfx');
    var pills=document.querySelectorAll('#city-hud .hud-pill');
    if(pills.length>=3)pills[2].textContent=L('grabThrow');
    var rb=document.getElementById('race-back-btn');if(rb)rb.textContent=L('raceBack');
    var bc=document.getElementById('back-city-btn');if(bc)bc.textContent=L('backCity');
    var rt=document.getElementById('result-title');if(rt)rt.textContent=L('resultDone');
    var gb=document.getElementById('grab-btn');if(gb)gb.textContent=L('grab');
    var jb=document.getElementById('jump-btn');if(jb)jb.textContent=L('jump');
    var cn=document.getElementById('city-name-hud');if(cn)cn.textContent=CITY_STYLES[currentCityStyle].name;
    var pn2=document.getElementById('portrait-name');if(pn2&&CHARACTERS[selectedChar])pn2.textContent=CHARACTERS[selectedChar].name;
    if(langBtn)langBtn.textContent='\uD83C\uDF10'+_langLabels[_langCode];
    // Rebuild warp pipe signs with new city names
    if(typeof buildWarpPipes==='function'&&typeof cityGroup!=='undefined'&&gameState==='city'){buildWarpPipes();}
}
if(langBtn){
    langBtn.textContent='\uD83C\uDF10'+_langLabels[_langCode];
    langBtn.addEventListener("click",function(){
        var idx=_langOrder.indexOf(_langCode);
        _langCode=_langOrder[(idx+1)%_langOrder.length];
        _applyLang();
    });
}

// Background music — cheerful multi-layer procedural BGM
let bgmPlaying=false, bgmGain=null, bgmNodes=[], _bgmTimer=null;
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
        _bgmTimer=setTimeout(playLoop, melody.length*noteLen*1000);
    }
    playLoop();
}
function stopBGM(){bgmPlaying=false;if(_bgmTimer){clearTimeout(_bgmTimer);_bgmTimer=null;}bgmNodes.forEach(function(n){try{n.stop();}catch(e){}});bgmNodes=[];if(bgmGain){bgmGain.gain.value=0;bgmGain=null;}}

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

// ============================================================
// Race BGM — 3 styles for 12 levels
// ============================================================
var raceBgmPlaying=false, raceBgmGain=null, raceBgmNodes=[], raceBgmTimer=null;
function stopRaceBGM(){raceBgmPlaying=false;if(raceBgmTimer){clearTimeout(raceBgmTimer);raceBgmTimer=null;}raceBgmNodes.forEach(function(n){try{n.stop();}catch(e){}});raceBgmNodes=[];if(raceBgmGain){raceBgmGain.gain.value=0;raceBgmGain=null;}}
function startRaceBGM(ri){
    if(raceBgmPlaying||!soundEnabled)return;
    stopBGM();stopSelectBGM();
    var ctx=ensureAudio();raceBgmPlaying=true;
    if(ctx.state==='suspended'){ctx.resume().then(function(){if(raceBgmPlaying)_raceBgmLoop(ctx,ri);});return;}
    _raceBgmLoop(ctx,ri);
}
function _raceBgmLoop(ctx,ri){
    raceBgmGain=ctx.createGain();raceBgmGain.gain.value=0.15;raceBgmGain.connect(ctx.destination);
    var style=(ri<4)?0:(ri<8)?1:2;
    // Style 0: Original — energetic obstacle course (Dm-Bb-C-A)
    var chords0=[[294,349,440],[233,294,349],[262,330,392],[220,277,330],[294,349,440],[262,330,392],[233,294,349],[247,311,370]];
    var mel0A=[587,659,698,784,698,659,587,523,587,659,784,880,784,698,587,659];
    var mel0B=[523,587,659,587,523,440,494,523,587,698,784,698,587,523,494,587];
    // Style 1: Sonic — fast, driving, major key (E-A-B-C#m)
    var chords1=[[330,415,494],[220,277,330],[247,311,370],[277,330,415],[330,415,494],[247,311,370],[220,277,330],[294,370,440]];
    var mel1A=[988,880,784,880,988,1047,988,784,659,784,880,988,1047,988,880,784];
    var mel1B=[659,784,880,784,659,587,659,784,880,988,1047,1175,1047,988,880,988];
    // Style 2: Mario — bouncy, staccato, C major (C-F-G-Am)
    var chords2=[[262,330,392],[175,220,262],[196,247,294],[220,262,330],[262,330,392],[196,247,294],[175,220,262],[233,294,349]];
    var mel2A=[784,784,0,784,0,659,784,0,988,0,0,0,494,0,0,0];
    var mel2B=[784,0,659,0,523,0,440,494,0,440,0,392,0,0,0,0];
    var chords,melA,melB,noteLen,waveType,bassType,melVol,bassVol,tempo;
    if(style===0){chords=chords0;melA=mel0A;melB=mel0B;noteLen=0.16;waveType='triangle';bassType='sine';melVol=0.13;bassVol=0.09;tempo=1;}
    else if(style===1){chords=chords1;melA=mel1A;melB=mel1B;noteLen=0.13;waveType='sawtooth';bassType='square';melVol=0.10;bassVol=0.10;tempo=1;}
    else{chords=chords2;melA=mel2A;melB=mel2B;noteLen=0.15;waveType='square';bassType='triangle';melVol=0.11;bassVol=0.08;tempo=1;}
    var loopN=0;
    function doLoop(){
        if(!raceBgmPlaying)return;
        var now=ctx.currentTime;
        var mel=loopN%2===0?melA:melB;loopN++;
        for(var i=0;i<mel.length;i++){
            // Melody
            if(mel[i]>0){
                var o=ctx.createOscillator();var g=ctx.createGain();
                o.type=waveType;o.frequency.setValueAtTime(mel[i],now+i*noteLen);
                if(style===1)o.frequency.exponentialRampToValueAtTime(mel[i]*1.02,now+i*noteLen+noteLen*0.4);
                g.gain.setValueAtTime(0,now+i*noteLen);
                g.gain.linearRampToValueAtTime(melVol,now+i*noteLen+0.01);
                if(style===2){g.gain.setValueAtTime(melVol,now+i*noteLen+noteLen*0.3);g.gain.linearRampToValueAtTime(0,now+i*noteLen+noteLen*0.5);}
                else{g.gain.exponentialRampToValueAtTime(0.005,now+i*noteLen+noteLen*0.9);}
                o.connect(g);g.connect(raceBgmGain);o.start(now+i*noteLen);o.stop(now+i*noteLen+noteLen);
                raceBgmNodes.push(o);
            }
            // Harmony — octave below on even notes
            if(mel[i]>0&&i%2===0){
                var h=ctx.createOscillator();var hg=ctx.createGain();
                h.type='sine';h.frequency.value=mel[i]*0.5;
                hg.gain.setValueAtTime(0.04,now+i*noteLen);
                hg.gain.exponentialRampToValueAtTime(0.003,now+i*noteLen+noteLen*1.5);
                h.connect(hg);hg.connect(raceBgmGain);h.start(now+i*noteLen);h.stop(now+i*noteLen+noteLen*1.5);
                raceBgmNodes.push(h);
            }
            // Chords every 4 notes
            if(i%4===0){var ci=Math.floor(i/4)%chords.length;
            for(var cn=0;cn<chords[ci].length;cn++){var co=ctx.createOscillator();var cg=ctx.createGain();
            co.type=style===1?'sawtooth':'triangle';co.frequency.value=chords[ci][cn];
            cg.gain.setValueAtTime(0.035,now+i*noteLen);cg.gain.exponentialRampToValueAtTime(0.004,now+i*noteLen+noteLen*3.8);
            co.connect(cg);cg.connect(raceBgmGain);co.start(now+i*noteLen);co.stop(now+i*noteLen+noteLen*4);
            raceBgmNodes.push(co);}}
            // Bass
            if(i%4===0){var ci2=Math.floor(i/4)%chords.length;
            var bo=ctx.createOscillator();var bg2=ctx.createGain();
            bo.type=bassType;bo.frequency.value=chords[ci2][0]*(style===1?0.25:0.5);
            bg2.gain.setValueAtTime(bassVol,now+i*noteLen);bg2.gain.exponentialRampToValueAtTime(0.006,now+i*noteLen+noteLen*3.5);
            bo.connect(bg2);bg2.connect(raceBgmGain);bo.start(now+i*noteLen);bo.stop(now+i*noteLen+noteLen*4);
            raceBgmNodes.push(bo);}
            // Kick drum
            if(style===1?(i%2===0):(i%4===0)){
                var kb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.07),ctx.sampleRate);var kd=kb.getChannelData(0);
                for(var s=0;s<kd.length;s++){var p=s/kd.length;kd[s]=Math.sin(p*Math.PI*(style===1?14:8)*(1-p*0.8))*0.4*Math.exp(-p*6);}
                var ks=ctx.createBufferSource();var kg=ctx.createGain();kg.gain.value=style===1?0.16:0.12;
                ks.buffer=kb;ks.connect(kg);kg.connect(raceBgmGain);ks.start(now+i*noteLen);ks.stop(now+i*noteLen+0.07);
                raceBgmNodes.push(ks);
            }
            // Snare
            if(i%4===2){var sb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.05),ctx.sampleRate);var sd=sb.getChannelData(0);
            for(var s2=0;s2<sd.length;s2++) sd[s2]=(Math.random()-0.5)*0.3*Math.exp(-s2/(sd.length*0.12));
            var ss=ctx.createBufferSource();var sg=ctx.createGain();sg.gain.value=0.10;
            ss.buffer=sb;ss.connect(sg);sg.connect(raceBgmGain);ss.start(now+i*noteLen);ss.stop(now+i*noteLen+0.05);
            raceBgmNodes.push(ss);}
            // Hi-hat
            if(i%2===1){var hb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.02),ctx.sampleRate);var hd2=hb.getChannelData(0);
            for(var s3=0;s3<hd2.length;s3++) hd2[s3]=(Math.random()-0.5)*0.18*Math.exp(-s3/(hd2.length*0.08));
            var hs=ctx.createBufferSource();var hg2=ctx.createGain();hg2.gain.value=style===1?0.10:0.06;
            hs.buffer=hb;hs.connect(hg2);hg2.connect(raceBgmGain);hs.start(now+i*noteLen);hs.stop(now+i*noteLen+0.02);
            raceBgmNodes.push(hs);}
        }
        raceBgmTimer=setTimeout(doLoop,mel.length*noteLen*1000);
    }
    doLoop();
}

// Walk sound — cute "pata pata" Doraemon style with cooldown
let lastStepTime=0;
function playStepSound(){
    if(!sfxEnabled) return;
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
    if(!sfxEnabled) return;
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
    if(!sfxEnabled) return;
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
var _splashCooldown=0;
function playSplashSound(){
    if(!sfxEnabled||_splashCooldown>0) return;
    _splashCooldown=20;
    var ctx=ensureAudio();if(!ctx)return;
    // Filtered noise burst for water splash
    var bufSize=ctx.sampleRate*0.15;
    var buf=ctx.createBuffer(1,bufSize,ctx.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<bufSize;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/bufSize*4);
    var src=ctx.createBufferSource();src.buffer=buf;
    var filt=ctx.createBiquadFilter();filt.type='bandpass';filt.frequency.value=2000;filt.Q.value=0.8;
    var g=ctx.createGain();g.gain.setValueAtTime(0.12,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.15);
    src.connect(filt);filt.connect(g);g.connect(ctx.destination);
    src.start();src.stop(ctx.currentTime+0.15);
}
function playHitSound(){
    if(!sfxEnabled) return;
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
    if(!sfxEnabled) return;
    const ctx=ensureAudio(); const t=ctx.currentTime;
    const osc=ctx.createOscillator(); const g=ctx.createGain();
    osc.type='sine'; osc.frequency.setValueAtTime(500,t); osc.frequency.exponentialRampToValueAtTime(350,t+0.1);
    g.gain.setValueAtTime(0.1,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
    osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t+0.12);
}

// Throw sound — whoosh
function playThrowSound(){
    if(!sfxEnabled) return;
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
    if(!sfxEnabled)return;var ctx=ensureAudio();var t=ctx.currentTime;
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
    if(!sfxEnabled)return;var ctx=ensureAudio();var t=ctx.currentTime;
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
scene.fog = new THREE.Fog(0x87CEEB, 80, 400);

const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.5, 600);
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

// ---- Jump charge system ----
var _jumpCharging=false, _jumpCharge=0, _jumpChargeMax=60, _jumpChargeBar=null;
var _chargeBeepTimer=0, _chargeHoldTimer=0, _chargeHoldMax=600; // 600 frames ≈ 10s at 60fps
function _createChargeBar(){
    // Use a canvas texture on a Sprite — always faces camera automatically
    var canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=40;
    var tex=new THREE.CanvasTexture(canvas);
    tex.minFilter=THREE.LinearFilter;
    var mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});
    var sprite=new THREE.Sprite(mat);
    sprite.scale.set(2.5,0.4,1);
    sprite.renderOrder=1000;
    sprite._canvas=canvas;sprite._ctx=canvas.getContext('2d');sprite._tex=tex;
    return sprite;
}
function _drawChargeBar(sprite,pct){
    var ctx=sprite._ctx,w=256,h=40;
    ctx.clearRect(0,0,w,h);
    // Helper for rounded rect (compat)
    function rr(x,y,rw,rh,rad){ctx.beginPath();ctx.moveTo(x+rad,y);ctx.lineTo(x+rw-rad,y);ctx.quadraticCurveTo(x+rw,y,x+rw,y+rad);ctx.lineTo(x+rw,y+rh-rad);ctx.quadraticCurveTo(x+rw,y+rh,x+rw-rad,y+rh);ctx.lineTo(x+rad,y+rh);ctx.quadraticCurveTo(x,y+rh,x,y+rh-rad);ctx.lineTo(x,y+rad);ctx.quadraticCurveTo(x,y,x+rad,y);ctx.closePath();}
    // Outer border
    ctx.fillStyle='rgba(0,0,0,0.85)';
    rr(2,2,w-4,h-4,8);ctx.fill();
    // Color calc
    var r2,g2,b3;
    if(pct<0.33){r2=0;g2=255;b3=50;}
    else if(pct<0.66){var t=(pct-0.33)/0.33;r2=Math.floor(255*t);g2=Math.floor(255*(1-t*0.3));b3=0;}
    else{var t2=(pct-0.66)/0.34;r2=255;g2=Math.floor(180*(1-t2));b3=0;}
    // Border glow
    ctx.strokeStyle='rgba('+r2+','+g2+','+b3+','+(pct>0.8?0.7+Math.sin(Date.now()*0.015)*0.3:0.5)+')';
    ctx.lineWidth=3;rr(5,5,w-10,h-10,6);ctx.stroke();
    // Fill bar
    var fw=Math.max(4,(w-20)*pct);
    var grad=ctx.createLinearGradient(10,0,10+fw,0);
    grad.addColorStop(0,'rgb('+Math.floor(r2*0.6)+','+Math.floor(g2*0.6)+','+b3+')');
    grad.addColorStop(1,'rgb('+r2+','+g2+','+b3+')');
    ctx.fillStyle=grad;
    rr(10,10,fw,h-20,4);ctx.fill();
    // Shine highlight
    ctx.fillStyle='rgba(255,255,255,0.3)';
    rr(10,10,fw,Math.floor((h-20)/2),4);ctx.fill();
    sprite._tex.needsUpdate=true;
}
function _updateChargeBar(){
    if(!playerEgg)return;
    var pct=_jumpCharge/_jumpChargeMax;
    if(_jumpCharging&&playerEgg.onGround){
        if(!_jumpChargeBar){_jumpChargeBar=_createChargeBar();scene.add(_jumpChargeBar);}
        _jumpChargeBar.visible=true;
        _jumpChargeBar.position.set(playerEgg.mesh.position.x,playerEgg.mesh.position.y+2.5,playerEgg.mesh.position.z);
        var drawPct=_jumpCharge/_jumpChargeMax;
        // If fully charged, show hold timer decay
        if(_jumpCharge>=_jumpChargeMax&&_chargeHoldTimer>0){
            var holdPct=1-_chargeHoldTimer/_chargeHoldMax;
            drawPct=holdPct;
        }
        _drawChargeBar(_jumpChargeBar,drawPct);
    } else {
        if(_jumpChargeBar){_jumpChargeBar.visible=false;}
    }
}

// ---- Sprint bar (gradual charge like jump bar) ----
var _sprintBar=null, _sprintCharge=0, _sprintChargeMax=40;
function _createSprintBar(){
    var canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=40;
    var tex=new THREE.CanvasTexture(canvas);
    tex.minFilter=THREE.LinearFilter;
    var mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});
    var sprite=new THREE.Sprite(mat);
    sprite.scale.set(2.5,0.4,1);
    sprite.renderOrder=1001;
    sprite._canvas=canvas;sprite._ctx=canvas.getContext('2d');sprite._tex=tex;
    return sprite;
}
function _drawSprintBar(sprite,pct){
    var ctx=sprite._ctx,w=256,h=40;
    ctx.clearRect(0,0,w,h);
    function rr(x,y,rw,rh,rad){ctx.beginPath();ctx.moveTo(x+rad,y);ctx.lineTo(x+rw-rad,y);ctx.quadraticCurveTo(x+rw,y,x+rw,y+rad);ctx.lineTo(x+rw,y+rh-rad);ctx.quadraticCurveTo(x+rw,y+rh,x+rw-rad,y+rh);ctx.lineTo(x+rad,y+rh);ctx.quadraticCurveTo(x,y+rh,x,y+rh-rad);ctx.lineTo(x,y+rad);ctx.quadraticCurveTo(x,y,x+rad,y);ctx.closePath();}
    ctx.fillStyle='rgba(0,0,0,0.85)';
    rr(2,2,w-4,h-4,8);ctx.fill();
    // Same color scheme as charge bar: green → yellow → red
    var r2,g2,b3;
    if(pct<0.33){r2=0;g2=255;b3=50;}
    else if(pct<0.66){var t=(pct-0.33)/0.33;r2=Math.floor(255*t);g2=Math.floor(255*(1-t*0.3));b3=0;}
    else{var t2=(pct-0.66)/0.34;r2=255;g2=Math.floor(180*(1-t2));b3=0;}
    // Border glow
    ctx.strokeStyle='rgba('+r2+','+g2+','+b3+','+(pct>0.8?0.7+Math.sin(Date.now()*0.015)*0.3:0.5)+')';
    ctx.lineWidth=3;rr(5,5,w-10,h-10,6);ctx.stroke();
    // Fill bar
    var fw=Math.max(4,(w-20)*pct);
    var grad=ctx.createLinearGradient(10,0,10+fw,0);
    grad.addColorStop(0,'rgb('+Math.floor(r2*0.6)+','+Math.floor(g2*0.6)+','+b3+')');
    grad.addColorStop(1,'rgb('+r2+','+g2+','+b3+')');
    ctx.fillStyle=grad;
    rr(10,10,fw,h-20,4);ctx.fill();
    // Shine highlight
    ctx.fillStyle='rgba(255,255,255,0.3)';
    rr(10,10,fw,Math.floor((h-20)/2),4);ctx.fill();
    sprite._tex.needsUpdate=true;
}
// ---- Sprint sound (FC Mario 3 style "lin lin" running tone) ----
var _sprintSoundTimer=0;
function _playSprintTick(pct){
    if(!sfxEnabled)return;
    var ctx=ensureAudio();var t=ctx.currentTime;
    // Two quick ascending notes — "lin lin"
    var baseFreq=1200+pct*600;
    var o1=ctx.createOscillator();var g1=ctx.createGain();
    o1.type='square';
    o1.frequency.setValueAtTime(baseFreq,t);
    o1.frequency.exponentialRampToValueAtTime(baseFreq*1.5,t+0.03);
    g1.gain.setValueAtTime(0.07,t);
    g1.gain.exponentialRampToValueAtTime(0.001,t+0.04);
    o1.connect(g1);g1.connect(ctx.destination);
    o1.start(t);o1.stop(t+0.04);
    var o2=ctx.createOscillator();var g2=ctx.createGain();
    o2.type='square';
    o2.frequency.setValueAtTime(baseFreq*1.2,t+0.05);
    o2.frequency.exponentialRampToValueAtTime(baseFreq*1.8,t+0.08);
    g2.gain.setValueAtTime(0.06,t+0.05);
    g2.gain.exponentialRampToValueAtTime(0.001,t+0.09);
    o2.connect(g2);g2.connect(ctx.destination);
    o2.start(t+0.05);o2.stop(t+0.09);
}

function _updateSprintBar(holdingF){
    if(!playerEgg)return 0;
    if(holdingF){
        _sprintCharge=Math.min(_sprintCharge+1,_sprintChargeMax);
    } else {
        _sprintCharge=Math.max(_sprintCharge-2,0);
    }
    var pct=_sprintCharge/_sprintChargeMax;
    // Sprint sound — faster as charge fills
    if(holdingF&&pct>0.05){
        _sprintSoundTimer++;
        var interval=Math.max(4,Math.floor(12-pct*8));
        if(_sprintSoundTimer>=interval){_sprintSoundTimer=0;_playSprintTick(pct);}
    } else {
        _sprintSoundTimer=0;
    }
    if(pct>0.01){
        if(!_sprintBar){_sprintBar=_createSprintBar();scene.add(_sprintBar);}
        _sprintBar.visible=true;
        var yOff=(_jumpCharging&&playerEgg.onGround)?1.8:2.1;
        _sprintBar.position.set(playerEgg.mesh.position.x,playerEgg.mesh.position.y+yOff,playerEgg.mesh.position.z);
        _drawSprintBar(_sprintBar,pct);
    } else {
        if(_sprintBar){_sprintBar.visible=false;}
    }
    return pct;
}

// ---- Ascending butt smoke (after charged jump, while vy>0) ----
var _ascendSmoke=false, _ascendSmokePct=0;

function _playChargeBeep(pct){
    if(!sfxEnabled)return;
    var ctx=ensureAudio();var t=ctx.currentTime;
    // Higher pitch and shorter as charge fills
    var freq=400+pct*800;
    var dur=0.06-pct*0.03;
    var o=ctx.createOscillator();var g=ctx.createGain();
    o.type='square';o.frequency.setValueAtTime(freq,t);
    o.frequency.exponentialRampToValueAtTime(freq*1.3,t+dur);
    g.gain.setValueAtTime(0.12,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g);g.connect(ctx.destination);
    o.start(t);o.stop(t+dur);
}

// ---- Charge jump effects: butt smoke (charging) + ground dust (release) ----
var _chargeParticles=[];
// Butt smoke — called every few frames while charging
function _spawnButtSmoke(egg,pct){
    var count=1+Math.floor(pct*2);
    for(var i=0;i<count;i++){
        var size=0.15+Math.random()*0.2;
        var geo=new THREE.SphereGeometry(size,5,4);
        var gray=0.7+Math.random()*0.3;
        var mat=new THREE.MeshBasicMaterial({color:new THREE.Color(gray,gray,gray),transparent:true,opacity:0.6,depthTest:false});
        var m=new THREE.Mesh(geo,mat);
        // Spawn behind and below the egg
        var dir=egg.mesh.rotation.y;
        var bx=egg.mesh.position.x-Math.sin(dir)*0.4+(Math.random()-0.5)*0.3;
        var by=egg.mesh.position.y+0.3+Math.random()*0.2;
        var bz=egg.mesh.position.z-Math.cos(dir)*0.4+(Math.random()-0.5)*0.3;
        m.position.set(bx,by,bz);
        scene.add(m);
        _chargeParticles.push({mesh:m,vx:(Math.random()-0.5)*0.01,vy:0.02+Math.random()*0.02,vz:(Math.random()-0.5)*0.01,life:20+Math.random()*15,maxLife:35,type:'smoke'});
    }
}
// Ground dust — burst on jump release
function _spawnGroundDust(x,y,z,pct){
    var count=Math.floor(6+pct*14);
    for(var i=0;i<count;i++){
        var size=0.2+Math.random()*0.3*pct;
        var geo=new THREE.SphereGeometry(size,5,4);
        var brown=0.55+Math.random()*0.2;
        var mat=new THREE.MeshBasicMaterial({color:new THREE.Color(brown,brown*0.85,brown*0.6),transparent:true,opacity:0.7,depthTest:false});
        var m=new THREE.Mesh(geo,mat);
        m.position.set(x+(Math.random()-0.5)*0.5,y+0.1+Math.random()*0.2,z+(Math.random()-0.5)*0.5);
        scene.add(m);
        var angle=Math.random()*Math.PI*2;
        var spd=0.04+Math.random()*0.1*pct;
        _chargeParticles.push({mesh:m,vx:Math.cos(angle)*spd,vy:0.01+Math.random()*0.03,vz:Math.sin(angle)*spd,life:25+Math.random()*20,maxLife:45,type:'dust'});
    }
    // Dust ring on ground
    var ringGeo=new THREE.RingGeometry(0.2,0.8+pct*1.5,16);
    var ringMat=new THREE.MeshBasicMaterial({color:0xBBAA88,transparent:true,opacity:0.5,side:THREE.DoubleSide,depthTest:false});
    var ring=new THREE.Mesh(ringGeo,ringMat);
    ring.position.set(x,y+0.05,z);ring.rotation.x=-Math.PI/2;
    scene.add(ring);
    _chargeParticles.push({mesh:ring,vx:0,vy:0,vz:0,life:18,maxLife:18,type:'ring',scaleSpeed:0.2+pct*0.3});
}
function _updateChargeParticles(){
    for(var i=_chargeParticles.length-1;i>=0;i--){
        var p=_chargeParticles[i];
        p.life--;
        if(p.life<=0){scene.remove(p.mesh);_chargeParticles.splice(i,1);continue;}
        var t=p.life/p.maxLife;
        p.mesh.material.opacity=t*(p.type==='smoke'?0.5:0.6);
        if(p.type==='ring'){
            var s=1+(1-t)*4*p.scaleSpeed;
            p.mesh.scale.set(s,s,s);
        } else {
            p.mesh.position.x+=p.vx;p.mesh.position.y+=p.vy;p.mesh.position.z+=p.vz;
            if(p.type==='smoke'){
                // Smoke rises and expands
                p.vy+=0.001;
                var sc=1+(1-t)*1.5;p.mesh.scale.set(sc,sc,sc);
            } else {
                // Dust settles
                p.vy-=0.001;
                if(p.mesh.position.y<0.05){p.mesh.position.y=0.05;p.vy=0;}
                p.vx*=0.96;p.vz*=0.96;
                var sc2=0.6+t*0.4;p.mesh.scale.set(sc2,sc2,sc2);
            }
        }
    }
}

// ---- Input ----
const keys={};
addEventListener('keydown',e=>{ keys[e.code]=true; if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyE','KeyF','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault(); });
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

// ---- Drop shadow (dark circle projected straight down) ----
var _dropShadowMesh=null;
function _ensureDropShadow(){
    if(_dropShadowMesh)return;
    var geo=new THREE.CircleGeometry(0.7,16);
    var mat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false});
    _dropShadowMesh=new THREE.Mesh(geo,mat);
    _dropShadowMesh.rotation.x=-Math.PI/2;
    _dropShadowMesh.renderOrder=1;
    scene.add(_dropShadowMesh);
}
function _updateDropShadow(){
    if(!playerEgg||!playerEgg.mesh){if(_dropShadowMesh)_dropShadowMesh.visible=false;return;}
    _ensureDropShadow();
    var px=playerEgg.mesh.position.x, py=playerEgg.mesh.position.y, pz=playerEgg.mesh.position.z;
    var groundY=0;
    var isCity=(gameState==='city');
    if(isCity){
        // Check building roofs, props, clouds for highest surface below player
        for(var bi=0;bi<cityColliders.length;bi++){
            var c=cityColliders[bi];
            var dx=px-c.x, dz=pz-c.z;
            // Cone roof
            if(c.roofR&&c.roofH){
                var dist=Math.sqrt(dx*dx+dz*dz);
                if(dist<c.roofR){
                    var roofBase=c.h||6;
                    var surfY=roofBase+(1-dist/c.roofR)*c.roofH;
                    if(surfY<py&&surfY>groundY)groundY=surfY;
                }
            }
            // Flat roof top
            if(Math.abs(dx)<c.hw&&Math.abs(dz)<c.hd){
                var roofY2=(c.h||6);
                if(roofY2<py&&roofY2>groundY)groundY=roofY2;
            }
        }
        // Cloud platforms
        for(var ci3=0;ci3<cityCloudPlatforms.length;ci3++){
            var cl=cityCloudPlatforms[ci3];
            if(Math.abs(px-cl.x)<cl.hw&&Math.abs(pz-cl.z)<cl.hd){
                var clTop=cl.y+0.5;
                if(clTop<py&&clTop>groundY)groundY=clTop;
            }
        }
    } else {
        // Race track floor
        var gz=-pz;
        groundY=getFloorY(gz,px);
        if(groundY<-10)groundY=0;
    }
    _dropShadowMesh.visible=true;
    _dropShadowMesh.position.set(px,groundY+0.05,pz);
    // Scale shadow based on height — smaller when higher up
    var height=py-groundY;
    var sc=Math.max(0.3,1.2-height*0.04);
    _dropShadowMesh.scale.set(sc,sc,sc);
    _dropShadowMesh.material.opacity=Math.max(0.08,0.35-height*0.012);
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
var currentCityStyle=0;
var CITY_STYLES=[
    {name:'🏙️ 蛋仔城',ground:0x6EC850,path:0xDDCCAA,sky:0x87CEEB,bColors:[0xFF8888,0x88BBFF,0xFFDD66,0xAADD88,0xDDAA88,0xBB99DD,0xFF99CC,0x88DDCC],roof:0xDD6644,tree:0x44BB44,fog:null},
    {name:'🏜️ 沙漠城',ground:0xDDCC88,path:0xCCBB77,sky:0xFFCC66,bColors:[0xDDAA66,0xCC9955,0xEEBB77,0xBB8844,0xDDCC88,0xCCAA55,0xEECC99,0xBB9966],roof:0xAA6633,tree:0x88AA44,fog:0xFFEECC},
    {name:'❄️ 冰雪城',ground:0xDDEEFF,path:0xBBCCDD,sky:0xAABBDD,bColors:[0xAADDFF,0x88BBEE,0xCCEEFF,0x99CCEE,0xBBDDFF,0x77AADD,0xDDEEFF,0xAABBCC],roof:0x6699BB,tree:0x88CCAA,fog:0xCCDDEE},
    {name:'🔥 熔岩城',ground:0x443322,path:0x554433,sky:0x331111,bColors:[0x884422,0x663311,0xAA5533,0x774422,0x995544,0x553311,0xBB6644,0x664422],roof:0x442211,tree:0x556633,fog:0x221100},
    {name:'🍬 糖果城',ground:0xFFBBDD,path:0xFFDDEE,sky:0xFFCCEE,bColors:[0xFF88BB,0xBB88FF,0xFFBB88,0x88FFBB,0xFF88FF,0xFFFF88,0x88BBFF,0xFFAA88],roof:0xDD66AA,tree:0xFF88CC,fog:null}
];
// Warp pipe definitions: 4 pipes at city edges
var WARP_PIPES=[
    {x:0,z:-65,targetStyle:1,rot:0,label:'🏜️ 沙漠'},
    {x:65,z:0,targetStyle:2,rot:-Math.PI/2,label:'❄️ 冰雪'},
    {x:0,z:65,targetStyle:3,rot:Math.PI,label:'🔥 熔岩'},
    {x:-65,z:0,targetStyle:4,rot:Math.PI/2,label:'🍬 糖果'}
];
var warpPipeMeshes=[]; // {group, x, z, targetStyle, entered}
// Apply localized city names
for(var _si=0;_si<CITY_STYLES.length;_si++){CITY_STYLES[_si].name=I18N.cityNames[_langCode][_si]||CITY_STYLES[_si].name;}

function buildCity() {
    var st=CITY_STYLES[currentCityStyle];
    // Ground
    const groundGeo = new THREE.PlaneGeometry(CITY_SIZE*2, CITY_SIZE*2, 16, 16);
    const ground = new THREE.Mesh(groundGeo, toon(st.ground));
    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true;
    cityGroup.add(ground);

    // Paths
    const pathM = toon(st.path);
    [{w:CITY_SIZE*2,d:5,x:0,z:0},{w:5,d:CITY_SIZE*2,x:0,z:0},
     {w:CITY_SIZE*1.2,d:4,x:15,z:25},{w:4,d:CITY_SIZE*1.2,x:-25,z:-10}].forEach(p=>{
        const path=new THREE.Mesh(new THREE.BoxGeometry(p.w,0.06,p.d),pathM);
        path.position.set(p.x,0.03,p.z); path.receiveShadow=true; cityGroup.add(path);
    });

    // ---- Buildings ----
    const bColors = st.bColors;
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
        const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(b.w,b.d)*0.6, 3, 4), toon(st.roof));
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

        cityColliders.push({x:b.x, z:b.z, hw:b.w/2+0.5, hd:b.d/2+0.5, h:b.h, roofR:Math.max(b.w,b.d)*0.6, roofH:3});
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
        const crown=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,6),toon(st.tree));
        crown.position.y=3; crown.scale.y=0.7; crown.castShadow=true; tg.add(crown);
        cityGroup.add(tg);
        cityProps.push({group:tg, x:tx, z:tz, radius:1.2, type:'tree', grabbed:false, origY:0, throwVx:0, throwVy:0, throwVz:0, throwTimer:0, weight:3.0});
    }

// ---- Grand Roman Wishing Fountain (Trevi-style) ----
    var stoneM=toon(0xCCBBAA);var stoneD=toon(0xAA9988);var marbleM=toon(0xEEE8DD);
    var waterM=toon(0x44AADD,{transparent:true,opacity:0.55});
    var goldM=toon(0xFFDD44,{emissive:0xFFAA00,emissiveIntensity:0.3});
    // Outer pool — large circular basin
    var poolOuter=new THREE.Mesh(new THREE.TorusGeometry(7,0.8,8,24),stoneM);
    poolOuter.position.y=0.4;poolOuter.rotation.x=Math.PI/2;cityGroup.add(poolOuter);
    // Pool floor
    var poolFloor=new THREE.Mesh(new THREE.CylinderGeometry(6.5,6.5,0.15,24),toon(0x88BBCC));
    poolFloor.position.y=0.08;cityGroup.add(poolFloor);
    // Water surface
    var poolWater=new THREE.Mesh(new THREE.CylinderGeometry(6.2,6.2,0.2,24),waterM);
    poolWater.position.y=0.6;cityGroup.add(poolWater);
    window._fountainPoolWater=poolWater;
    var innerWaterRef=null;
    // Steps around the pool (3 tiers)
    for(var si=0;si<3;si++){
        var stepR=8+si*1.2;var stepH=0.2;
        var step=new THREE.Mesh(new THREE.TorusGeometry(stepR,0.5,6,24),stoneD);
        step.position.y=0.15-si*0.12;step.rotation.x=Math.PI/2;cityGroup.add(step);
    }
    // Inner raised basin (second tier)
    var innerRim=new THREE.Mesh(new THREE.TorusGeometry(3.5,0.5,8,16),marbleM);
    innerRim.position.y=1.2;innerRim.rotation.x=Math.PI/2;cityGroup.add(innerRim);
    var innerFloor=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.2,0.8,16),stoneM);
    innerFloor.position.y=0.8;cityGroup.add(innerFloor);
    var innerWater=new THREE.Mesh(new THREE.CylinderGeometry(3,3,0.15,16),waterM);
    innerWater.position.y=1.35;cityGroup.add(innerWater);
    innerWaterRef=innerWater;
    window._fountainInnerWater=innerWater;
    // Central pillar — ornate column
    var colBase=new THREE.Mesh(new THREE.CylinderGeometry(1,1.2,0.6,8),marbleM);
    colBase.position.y=1.6;cityGroup.add(colBase);
    var colShaft=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.55,4,12),marbleM);
    colShaft.position.y=3.9;cityGroup.add(colShaft);
    // Fluted column grooves (decorative cylinders around shaft)
    for(var fi=0;fi<8;fi++){
        var fa=fi/8*Math.PI*2;
        var groove=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,3.6,4),stoneD);
        groove.position.set(Math.cos(fa)*0.52,3.9,Math.sin(fa)*0.52);cityGroup.add(groove);
    }
    var colCap=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.55,0.5,8),marbleM);
    colCap.position.y=6.1;cityGroup.add(colCap);
    // Top statue — angel/figure holding a shell
    var statueBody=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.5,1.2,8),marbleM);
    statueBody.position.y=7;cityGroup.add(statueBody);
    var statueHead=new THREE.Mesh(new THREE.SphereGeometry(0.3,8,6),marbleM);
    statueHead.position.y=7.8;cityGroup.add(statueHead);
    // Shell/bowl on top that water pours from
    var shell=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,4,0,Math.PI*2,0,Math.PI/2),goldM);
    shell.position.y=8.2;shell.rotation.x=Math.PI;cityGroup.add(shell);
    // 4 lion head spouts around inner basin
    for(var li=0;li<4;li++){
        var la=li/4*Math.PI*2;
        var lx2=Math.cos(la)*3.3,lz2=Math.sin(la)*3.3;
        // Lion head (simplified)
        var lionHead=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.4),stoneD);
        lionHead.position.set(lx2,1.5,lz2);lionHead.lookAt(0,1.5,0);cityGroup.add(lionHead);
        var lionMane=new THREE.Mesh(new THREE.SphereGeometry(0.35,6,4),stoneM);
        lionMane.position.set(lx2,1.6,lz2);cityGroup.add(lionMane);
        // Water jet from lion mouth (static blue cylinder)
        var jetDir={x:-Math.cos(la),z:-Math.sin(la)};
        var jet=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.04,1.5,6),waterM);
        jet.position.set(lx2+jetDir.x*0.8,1.3,lz2+jetDir.z*0.8);
        jet.rotation.z=Math.PI/2*Math.sign(jetDir.x||0.1);
        jet.rotation.x=Math.atan2(jetDir.z,jetDir.x);
        cityGroup.add(jet);
    }
    // 8 small decorative columns around outer rim
    for(var ci2=0;ci2<8;ci2++){
        var ca=ci2/8*Math.PI*2;
        var cx2=Math.cos(ca)*7.5,cz2=Math.sin(ca)*7.5;
        var miniCol=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.18,2,6),marbleM);
        miniCol.position.set(cx2,1,cz2);cityGroup.add(miniCol);
        var miniCap=new THREE.Mesh(new THREE.SphereGeometry(0.22,6,4),stoneM);
        miniCap.position.set(cx2,2.1,cz2);cityGroup.add(miniCap);
    }
    // Scattered gold coins in the water
    for(var gi=0;gi<20;gi++){
        var ga=Math.random()*Math.PI*2;
        var gr=Math.random()*5.5;
        var coin=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.03,8),goldM);
        coin.position.set(Math.cos(ga)*gr,0.55+Math.random()*0.15,Math.sin(ga)*gr);
        coin.rotation.x=Math.PI/2+(Math.random()-0.5)*0.5;
        coin.rotation.z=Math.random()*Math.PI;
        cityGroup.add(coin);
    }
    // Fountain collider — only the inner column, not the pool (player can wade in)
    cityColliders.push({x:0,z:0,hw:1.5,hd:1.5,h:8});

    // ---- Fountain water particle system ----
    var _fwParticles=[];
    var _fwMat=new THREE.MeshBasicMaterial({color:0x66CCFF,transparent:true,opacity:0.6});
    // Central jet particles (spray from top shell)
    for(var fpi=0;fpi<120;fpi++){
        var fp=new THREE.Mesh(new THREE.SphereGeometry(0.25,4,3),_fwMat);
        fp.visible=false;
        cityGroup.add(fp);
        _fwParticles.push({mesh:fp,type:'jet',life:Math.floor(Math.random()*80),maxLife:70+Math.random()*40,
            vx:(Math.random()-0.5)*0.12,vy:0.12+Math.random()*0.08,vz:(Math.random()-0.5)*0.12,
            ox:0,oy:8.2,oz:0});
    }
    // Lion spout particles (4 lions, 20 particles each)
    for(var lli=0;lli<4;lli++){
        var lla=lli/4*Math.PI*2;
        var llx=Math.cos(lla)*3.3,llz=Math.sin(lla)*3.3;
        var jdx=-Math.cos(lla)*0.1,jdz=-Math.sin(lla)*0.1;
        for(var lpi=0;lpi<20;lpi++){
            var lp=new THREE.Mesh(new THREE.SphereGeometry(0.18,4,3),_fwMat);
            lp.visible=false;
            cityGroup.add(lp);
            _fwParticles.push({mesh:lp,type:'lion',life:Math.floor(Math.random()*40),maxLife:40+Math.random()*20,
                vx:jdx+(Math.random()-0.5)*0.03,vy:0.02+Math.random()*0.03,vz:jdz+(Math.random()-0.5)*0.03,
                ox:llx,oy:1.4,oz:llz,_lionAngle:lla});
        }
    }
    // Store reference for animation
    window._fountainParticles=_fwParticles;
    window._fountainSplashParticles=[];
    // Splash particle pool
    var _fsMat=new THREE.MeshBasicMaterial({color:0x88DDFF,transparent:true,opacity:0.7});
    for(var fsi=0;fsi<40;fsi++){
        var fsp=new THREE.Mesh(new THREE.SphereGeometry(0.3,4,3),_fsMat);
        fsp.visible=false;
        cityGroup.add(fsp);
        window._fountainSplashParticles.push({mesh:fsp,life:0,maxLife:0,vx:0,vy:0,vz:0});
    }

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
// Apply localized race names/descs
for(var _ri=0;_ri<RACES.length;_ri++){RACES[_ri].name=I18N.raceNames[_langCode][_ri]||RACES[_ri].name;RACES[_ri].desc=I18N.raceDescs[_langCode][_ri]||RACES[_ri].desc;}

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

        // Name sign above portal
        var _pc=document.createElement('canvas');_pc.width=256;_pc.height=64;
        var _px=_pc.getContext('2d');
        _px.fillStyle='rgba(0,0,0,0.6)';_px.fillRect(0,0,256,64);
        _px.fillStyle='#fff';_px.font='bold 24px sans-serif';_px.textAlign='center';
        _px.fillText(race.name,128,42);
        var _ptex=new THREE.CanvasTexture(_pc);
        var _psign=new THREE.Sprite(new THREE.SpriteMaterial({map:_ptex,transparent:true}));
        _psign.scale.set(4.5,1.1,1);_psign.position.y=5;
        g.add(_psign);
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

// ---- Warp Pipes (Mario 3D World style transparent tubes) ----
function buildWarpPipes(){
    warpPipeMeshes.forEach(function(wp){cityGroup.remove(wp.group);});
    warpPipeMeshes=[];
    var pipeMat=new THREE.MeshPhongMaterial({color:0x44DD44,transparent:true,opacity:0.45,side:THREE.DoubleSide});
    var rimMat=toon(0x33BB33,{emissive:0x22AA22,emissiveIntensity:0.2});
    // Build pipe targets: always show pipes to other cities
    var targets=[];
    for(var ti=0;ti<CITY_STYLES.length;ti++){
        if(ti===currentCityStyle)continue;
        targets.push(ti);
    }
    // Place up to 4 pipes at edges
    var positions=[
        {x:0,z:-65},{x:65,z:0},{x:0,z:65},{x:-65,z:0}
    ];
    var pipeColors=[0x44DD44,0x44CCFF,0xFF8844,0xFF44DD,0xFFDD44];
    for(var pi2=0;pi2<Math.min(targets.length,4);pi2++){
        var tgt=targets[pi2];
        var pos=positions[pi2];
        var tst=CITY_STYLES[tgt];
        var g=new THREE.Group();
        var pColor=pipeColors[tgt];
        var pMat=new THREE.MeshPhongMaterial({color:pColor,transparent:true,opacity:0.4,side:THREE.DoubleSide});
        // Vertical tube — big and visible
        var tube=new THREE.Mesh(new THREE.CylinderGeometry(3,3,8,16,1,true),pMat);
        tube.position.y=4;g.add(tube);
        // Top rim
        var rim=new THREE.Mesh(new THREE.TorusGeometry(3,0.4,8,16),toon(pColor,{emissive:pColor,emissiveIntensity:0.4}));
        rim.position.y=8;rim.rotation.x=Math.PI/2;g.add(rim);
        // Bottom rim
        var rim2=new THREE.Mesh(new THREE.TorusGeometry(3,0.35,8,16),toon(pColor,{emissive:pColor,emissiveIntensity:0.3}));
        rim2.position.y=0.1;rim2.rotation.x=Math.PI/2;g.add(rim2);
        // Inner glow spiral — more orbs
        var sMat=new THREE.MeshBasicMaterial({color:pColor,transparent:true,opacity:0.5});
        for(var si=0;si<12;si++){
            var sp=new THREE.Mesh(new THREE.SphereGeometry(0.4,6,4),sMat);
            var a=si/12*Math.PI*2;
            sp.position.set(Math.cos(a)*1.8,0.5+si*0.6,Math.sin(a)*1.8);
            g.add(sp);
        }
        // Beacon light on top
        var beacon=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),new THREE.MeshBasicMaterial({color:pColor,transparent:true,opacity:0.7}));
        beacon.position.y=9;g.add(beacon);
        // Label sign
        var canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
        var ctx2=canvas.getContext('2d');
        ctx2.fillStyle='rgba(0,0,0,0.6)';ctx2.fillRect(0,0,256,64);
        ctx2.fillStyle='#fff';ctx2.font='bold 28px sans-serif';ctx2.textAlign='center';
        ctx2.fillText(tst.name,128,42);
        var tex=new THREE.CanvasTexture(canvas);
        var signMat=new THREE.SpriteMaterial({map:tex,transparent:true});
        var sign=new THREE.Sprite(signMat);
        sign.scale.set(5,1.2,1);sign.position.y=10.5;
        g.add(sign);
        g.position.set(pos.x,0,pos.z);
        cityGroup.add(g);
        warpPipeMeshes.push({group:g,x:pos.x,z:pos.z,targetStyle:tgt,_cooldown:false});
    }
}

function clearCity(){
    // Remove everything from cityGroup
    while(cityGroup.children.length>0)cityGroup.remove(cityGroup.children[0]);
    cityColliders.length=0;
    cityBuildingMeshes.length=0;
    cityCoins.length=0;
    cityProps.length=0;
    warpPipeMeshes.length=0;
    window._fountainParticles=null;
    window._fountainSplashParticles=null;
    window._fountainPoolWater=null;
    window._fountainInnerWater=null;
    // Remove city NPCs
    for(var i=0;i<cityNPCs.length;i++){scene.remove(cityNPCs[i].mesh);}
    cityNPCs.length=0;
    // Remove from allEggs
    for(var j=allEggs.length-1;j>=0;j--){if(allEggs[j].cityNPC){scene.remove(allEggs[j].mesh);allEggs.splice(j,1);}}
    // Remove clouds
    for(var k=0;k<cityCloudPlatforms.length;k++){scene.remove(cityCloudPlatforms[k].group);}
    cityCloudPlatforms.length=0;
}

function applyCityTheme(){
    var st=CITY_STYLES[currentCityStyle];
    // Sky color
    scene.background=new THREE.Color(st.sky);
    // Fog
    if(st.fog){scene.fog=new THREE.Fog(st.fog,60,180);}
    else{scene.fog=null;}
    // Update HUD
    document.getElementById('city-name-hud').textContent=st.name;
}

// ---- Pipe travel animation state ----
var _pipeTraveling=false, _pipeTimer=0, _pipeDuration=180, _pipeArrivalCooldown=0; // 3 seconds at 60fps
var _pipeStartX=0, _pipeStartZ=0, _pipeEndX=0, _pipeEndZ=0;
var _pipeTubeGroup=null, _pipeTargetStyle=0;
var _pipeMidX=0, _pipeMidZ=0;

function startPipeTravel(fromX,fromZ,targetStyle){
    _pipeTraveling=true;_pipeTimer=0;_pipeTargetStyle=targetStyle;
    _pipeStartX=fromX;_pipeStartZ=fromZ;
    // Destination is far away — simulate flying to a distant continent
    // Direction from pipe position determines flight direction
    var dirX=fromX,dirZ=fromZ;
    var dirLen=Math.sqrt(dirX*dirX+dirZ*dirZ);
    if(dirLen>0.1){dirX/=dirLen;dirZ/=dirLen;}else{dirX=0;dirZ=-1;}
    // Fly 400 units outward then curve back to center of new city
    _pipeEndX=0;_pipeEndZ=0;
    var midX=fromX+dirX*200;
    var midZ=fromZ+dirZ*200;
    _pipeMidX=midX;_pipeMidZ=midZ;
    // Build the transparent tube corridor — long arc through sky
    _pipeTubeGroup=new THREE.Group();
    var steps=40;
    var tubeColor=CITY_STYLES[targetStyle]?0x44FF88:0x44DD44;
    var pipeColors=[0x44DD44,0x44CCFF,0xFF8844,0xFF44DD,0xFFDD44];
    var pColor=pipeColors[targetStyle]||tubeColor;
    var tubeMat=new THREE.MeshPhongMaterial({color:pColor,transparent:true,opacity:0.25,side:THREE.DoubleSide});
    for(var i=0;i<steps;i++){
        var t=i/steps;
        // Quadratic bezier: start → mid (far away) → end (center)
        var u=1-t;
        var px=u*u*fromX+2*u*t*midX+t*t*_pipeEndX;
        var pz=u*u*fromZ+2*u*t*midZ+t*t*_pipeEndZ;
        var py=3+Math.sin(t*Math.PI)*60; // high arc — 60 units up
        var seg=new THREE.Mesh(new THREE.CylinderGeometry(3,3,3,10,1,true),tubeMat);
        seg.position.set(px,py,pz);
        if(i<steps-1){
            var t2=(i+1)/steps;var u2=1-t2;
            var nx=u2*u2*fromX+2*u2*t2*midX+t2*t2*_pipeEndX;
            var nz=u2*u2*fromZ+2*u2*t2*midZ+t2*t2*_pipeEndZ;
            var ny=3+Math.sin(t2*Math.PI)*60;
            seg.lookAt(nx,ny,nz);seg.rotateX(Math.PI/2);
        }
        _pipeTubeGroup.add(seg);
        if(i%5===0){
            var ring=new THREE.Mesh(new THREE.TorusGeometry(3,0.2,8,16),new THREE.MeshBasicMaterial({color:pColor,transparent:true,opacity:0.4}));
            ring.position.set(px,py,pz);
            if(i<steps-1){
                var t3=(i+1)/steps;var u3=1-t3;
                ring.lookAt(u3*u3*fromX+2*u3*t3*midX+t3*t3*_pipeEndX,3+Math.sin(t3*Math.PI)*60,u3*u3*fromZ+2*u3*t3*midZ+t3*t3*_pipeEndZ);
            }
            _pipeTubeGroup.add(ring);
        }
    }
    scene.add(_pipeTubeGroup);
    // Disable fog during travel so tube is visible
    scene.fog=null;
    // Pipe travel sound — suction entry + rushing wind + sparkle ticks
    if(sfxEnabled){
        var ctx=ensureAudio();var ct=ctx.currentTime;
        // 1) Suction entry — descending pitch "fwoop"
        var suc=ctx.createOscillator();var sucG=ctx.createGain();
        suc.type='sawtooth';suc.frequency.setValueAtTime(800,ct);suc.frequency.exponentialRampToValueAtTime(100,ct+0.4);
        sucG.gain.setValueAtTime(0.15,ct);sucG.gain.exponentialRampToValueAtTime(0.001,ct+0.5);
        suc.connect(sucG);sucG.connect(ctx.destination);suc.start(ct);suc.stop(ct+0.5);
        // 2) Rushing wind — filtered noise for 3 seconds
        var windBuf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*3),ctx.sampleRate);
        var wd=windBuf.getChannelData(0);
        for(var wi=0;wi<wd.length;wi++){
            var wp=wi/wd.length;
            var env=Math.sin(wp*Math.PI); // fade in and out
            wd[wi]=(Math.random()-0.5)*0.12*env;
        }
        var windSrc=ctx.createBufferSource();windSrc.buffer=windBuf;
        var windFilt=ctx.createBiquadFilter();windFilt.type='bandpass';windFilt.frequency.value=600;windFilt.Q.value=2;
        var windG=ctx.createGain();windG.gain.value=0.2;
        windSrc.connect(windFilt);windFilt.connect(windG);windG.connect(ctx.destination);
        windSrc.start(ct+0.2);windSrc.stop(ct+3.2);
        // 3) Sparkle ticks during flight — ascending pings
        for(var ti=0;ti<8;ti++){
            var tt=ct+0.4+ti*0.35;
            var ping=ctx.createOscillator();var pingG=ctx.createGain();
            ping.type='sine';
            var pf=600+ti*150;
            ping.frequency.setValueAtTime(pf,tt);ping.frequency.exponentialRampToValueAtTime(pf*1.5,tt+0.08);
            pingG.gain.setValueAtTime(0.08,tt);pingG.gain.exponentialRampToValueAtTime(0.001,tt+0.12);
            ping.connect(pingG);pingG.connect(ctx.destination);ping.start(tt);ping.stop(tt+0.12);
        }
        // 4) Arrival pop — at end of travel
        var popTime=ct+2.8;
        var pop=ctx.createOscillator();var popG=ctx.createGain();
        pop.type='sine';pop.frequency.setValueAtTime(150,popTime);pop.frequency.exponentialRampToValueAtTime(600,popTime+0.1);pop.frequency.exponentialRampToValueAtTime(200,popTime+0.3);
        popG.gain.setValueAtTime(0.18,popTime);popG.gain.exponentialRampToValueAtTime(0.001,popTime+0.4);
        pop.connect(popG);popG.connect(ctx.destination);pop.start(popTime);pop.stop(popTime+0.4);
        // Arrival chime
        var chime1=ctx.createOscillator();var chG1=ctx.createGain();
        chime1.type='triangle';chime1.frequency.value=880;
        chG1.gain.setValueAtTime(0.1,popTime+0.1);chG1.gain.exponentialRampToValueAtTime(0.001,popTime+0.6);
        chime1.connect(chG1);chG1.connect(ctx.destination);chime1.start(popTime+0.1);chime1.stop(popTime+0.6);
        var chime2=ctx.createOscillator();var chG2=ctx.createGain();
        chime2.type='triangle';chime2.frequency.value=1320;
        chG2.gain.setValueAtTime(0.08,popTime+0.2);chG2.gain.exponentialRampToValueAtTime(0.001,popTime+0.7);
        chime2.connect(chG2);chG2.connect(ctx.destination);chime2.start(popTime+0.2);chime2.stop(popTime+0.7);
    }
}

function updatePipeTravel(){
    if(!_pipeTraveling||!playerEgg)return;
    _pipeTimer++;
    var t=_pipeTimer/_pipeDuration;
    if(t>1)t=1;
    // Smooth ease in-out
    var st=t<0.5?2*t*t:(1-Math.pow(-2*t+2,2)/2);
    // Quadratic bezier: start → mid (far away) → end (center)
    var u=1-st;
    var px=u*u*_pipeStartX+2*u*st*_pipeMidX+st*st*_pipeEndX;
    var pz=u*u*_pipeStartZ+2*u*st*_pipeMidZ+st*st*_pipeEndZ;
    var py=3+Math.sin(st*Math.PI)*60;
    playerEgg.mesh.position.set(px,py,pz);
    playerEgg.vx=0;playerEgg.vy=0;playerEgg.vz=0;
    playerEgg.mesh.rotation.y+=0.15;
    // Camera follows from behind and above
    var camDist=15;
    var lookAhead=Math.min(st+0.05,1);
    var lu=1-lookAhead;
    var lx=lu*lu*_pipeStartX+2*lu*lookAhead*_pipeMidX+lookAhead*lookAhead*_pipeEndX;
    var lz=lu*lu*_pipeStartZ+2*lu*lookAhead*_pipeMidZ+lookAhead*lookAhead*_pipeEndZ;
    var ly=3+Math.sin(lookAhead*Math.PI)*60;
    var cdx=px-lx,cdz=pz-lz;
    var cl=Math.sqrt(cdx*cdx+cdz*cdz)||1;
    camera.position.set(px+cdx/cl*camDist,py+6,pz+cdz/cl*camDist);
    camera.lookAt(px,py,pz);
    // At 40% — rebuild city (while player is high up and can't see ground)
    if(_pipeTimer===Math.floor(_pipeDuration*0.4)){
        currentCityStyle=_pipeTargetStyle;
        clearCity();
        buildCity();
        buildPortals();
        buildCityCoins();
        buildWarpPipes();
        addClouds();
        spawnCityNPCs();
        applyCityTheme();
        stopBGM();stopRaceBGM();
        startBGM();
    }
    // Done
    if(_pipeTimer>=_pipeDuration){
        _pipeTraveling=false;
        _pipeArrivalCooldown=60; // 1 second grace period before portal checks
        if(_pipeTubeGroup){scene.remove(_pipeTubeGroup);_pipeTubeGroup=null;}
        playerEgg.mesh.position.set(0,3,0);
        playerEgg.vy=0;playerEgg.vx=0;playerEgg.vz=0;
        playerEgg.onGround=false;
        camera.position.set(0,12,19);camera.lookAt(0,0,5);
        for(var i=0;i<warpPipeMeshes.length;i++)warpPipeMeshes[i]._cooldown=true;
    }
}

function switchCity(targetStyle){
    if(targetStyle===currentCityStyle)return;
    currentCityStyle=targetStyle;
    // Remember player was near a pipe — spawn at center of new city
    clearCity();
    buildCity();
    buildPortals();
    buildCityCoins();
    buildWarpPipes();
    addClouds();
    spawnCityNPCs();
    applyCityTheme();
    // Stop old BGM, start city BGM
    stopBGM();stopRaceBGM();
    startBGM();
    // Spawn player at center
    if(playerEgg){scene.remove(playerEgg.mesh);var idx=allEggs.indexOf(playerEgg);if(idx!==-1)allEggs.splice(idx,1);playerEgg=null;}
    var skin=CHARACTERS[selectedChar];
    playerEgg=createEgg(0,5,skin.color,skin.accent,true,undefined,skin.type);
    playerEgg.finished=false;playerEgg.alive=true;
    camera.position.set(0,12,19);camera.lookAt(0,0,5);
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

// ---- Clouds (can stand on them) ----
var cityCloudPlatforms=[]; // {group, x, z, y, hw, hd}
function addClouds(){
    const cg=new THREE.SphereGeometry(1,8,6);
    const cm=toon(0xffffff,{transparent:true,opacity:0.85});
    for(let i=0;i<30;i++){
        const g=new THREE.Group();
        var maxW=0,maxD=0;
        var numParts=2+Math.floor(Math.random()*3);
        for(let j=0;j<numParts;j++){
            const s=2+Math.random()*3;
            const m=new THREE.Mesh(cg,cm);
            m.scale.set(s,s*0.45,s*0.7);
            var pz=Math.random()*1.5-0.75;
            m.position.set(j*2.5,0,pz);
            g.add(m);
            if(j*2.5+s>maxW)maxW=j*2.5+s;
            var partD=Math.abs(pz)+s*0.7;
            if(partD>maxD)maxD=partD;
        }
        // Center the group so collision aligns with visual center
        var halfW=maxW*0.5;
        for(var ci2=0;ci2<g.children.length;ci2++){g.children[ci2].position.x-=halfW;}
        var cx=(Math.random()-0.5)*200;
        var cy=10+Math.random()*12;
        var cz=(Math.random()-0.5)*200;
        g.position.set(cx, cy, cz);
        scene.add(g);
        cityCloudPlatforms.push({group:g, x:cx, z:cz, y:cy, hw:halfW+1.5, hd:Math.max(maxD,3)});
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
    _jumpCharging=false;_jumpCharge=0;if(_jumpChargeBar){scene.remove(_jumpChargeBar);_jumpChargeBar=null;}
    if(_sprintBar){scene.remove(_sprintBar);_sprintBar=null;}_sprintCharge=0;_ascendSmoke=false;
}

function getSegAt(z){for(var s of trackSegments)if(z>=s.startZ&&z<s.endZ)return s;return trackSegments[trackSegments.length-1];}
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
        // Building collisions — can land on roof
        if(egg.throwTimer>0){} else for(const c of cityColliders){
            const dx=egg.mesh.position.x-c.x, dz=egg.mesh.position.z-c.z;
            // Cone roof collision — checked independently of box AABB
            if(c.roofR&&c.roofH){
                var distFromCenter=Math.sqrt(dx*dx+dz*dz);
                var ey=egg.mesh.position.y;
                var roofBase=c.h||6;
                if(distFromCenter<c.roofR+egg.radius){
                    var slopeT=Math.max(0,1-distFromCenter/c.roofR);
                    var surfaceY=roofBase+slopeT*c.roofH;
                    // Land only when falling through the surface (penetration correction)
                    if(egg.vy<=0&&ey<=surfaceY+0.05&&ey>=surfaceY-1.0){
                        egg.mesh.position.y=surfaceY+0.01;egg.vy=0;egg.onGround=true;
                        continue;
                    }
                }
            }
            var inX=Math.abs(dx)<c.hw+egg.radius, inZ=Math.abs(dz)<c.hd+egg.radius;
            if(inX&&inZ){
                var roofY=c.h||6;
                // On top of building body — land on roof (penetration correction only)
                if(Math.abs(dx)<c.hw&&Math.abs(dz)<c.hd&&egg.vy<=0&&egg.mesh.position.y<=roofY+0.05&&egg.mesh.position.y>=roofY-1.0){
                    egg.mesh.position.y=roofY+0.01;egg.vy=0;egg.onGround=true;
                }
                // Jumping upward past building — let egg phase through walls while going up
                else if(egg.vy>0.05){
                    // Allow vertical movement, no horizontal push
                }
                // Below roof — push out horizontally
                else if(egg.mesh.position.y<roofY-0.3){
                    const overlapX=c.hw+egg.radius-Math.abs(dx);
                    const overlapZ=c.hd+egg.radius-Math.abs(dz);
                    if(overlapX<overlapZ){egg.mesh.position.x+=Math.sign(dx)*overlapX;egg.vx*=-0.2;}
                    else{egg.mesh.position.z+=Math.sign(dz)*overlapZ;egg.vz*=-0.2;}
                }
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
        // Cloud platform collisions — can land on clouds
        for(var cli=0;cli<cityCloudPlatforms.length;cli++){
            var cl=cityCloudPlatforms[cli];
            var cdx=egg.mesh.position.x-cl.x, cdz=egg.mesh.position.z-cl.z;
            if(Math.abs(cdx)<cl.hw&&Math.abs(cdz)<cl.hd){
                // Land when falling and near cloud top
                var cloudTop=cl.y+0.5;
                if(egg.mesh.position.y>=cl.y-2&&egg.mesh.position.y<=cl.y+3&&egg.vy<=0){
                    egg.mesh.position.y=cloudTop;egg.vy=0;egg.onGround=true;
                }
            }
        }
        // Warp pipe teleport — player only
        if(egg.isPlayer){
            for(var wpi=0;wpi<warpPipeMeshes.length;wpi++){
                var wp=warpPipeMeshes[wpi];
                var wdx=egg.mesh.position.x-wp.x,wdz=egg.mesh.position.z-wp.z;
                var wdist=Math.sqrt(wdx*wdx+wdz*wdz);
                if(wdist<3.5&&!wp._cooldown&&!_pipeTraveling){
                    wp._cooldown=true;
                    startPipeTravel(wp.x,wp.z,wp.targetStyle);
                    return; // player is now in pipe travel mode
                }
                if(wdist>5)wp._cooldown=false;
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
        // NPC sprint burst
        var npcSprint=(egg._aiSprint||0)>0;
        var npcAccel=npcSprint?0.5:0.3;
        if(dist>1.5){egg.vx+=(dx/dist)*MOVE_ACCEL*npcAccel;egg.vz+=(dz/dist)*MOVE_ACCEL*npcAccel;}
        if(Math.random()<0.002){egg._aiSprint=60+Math.random()*90;}
        if(egg._aiSprint>0)egg._aiSprint--;
        // NPC charge jump — occasional big jump
        if(egg.onGround&&Math.random()<0.002){egg.vy=JUMP_FORCE*(1.5+Math.random()*1.5);egg.squash=0.5;}
        else if(egg.onGround&&Math.random()<0.005){egg.vy=JUMP_FORCE*0.6;egg.squash=0.7;}
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
            if(cd2>2){var chaseAccel=(egg._aiSprint>0)?0.65:0.4;egg.vx+=(cdx2/cd2)*MOVE_ACCEL*chaseAccel;egg.vz+=(cdz2/cd2)*MOVE_ACCEL*chaseAccel;}
            if(Math.random()<0.003){egg._aiSprint=40+Math.random()*60;}
            if(egg._aiSprint>0)egg._aiSprint--;
            if(cd2<3&&egg.onGround&&Math.random()<0.01){egg.vy=JUMP_FORCE*(0.7+Math.random()*1.5);egg.squash=0.55;}
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
        if(Math.random()<0.004){egg._aiSprint=50+Math.random()*70;}
        if(egg._aiSprint>0)egg._aiSprint--;
        if(egg.onGround&&Math.random()<0.006){egg.vy=JUMP_FORCE*(0.8+Math.random()*1.2);egg.squash=0.55;}
    } else if(st==='dance'){
        // Bounce in place with spinning
        egg.vx*=0.85;egg.vz*=0.85;
        egg._dancePhase+=0.12;
        egg.mesh.rotation.y+=0.08;
        if(egg.onGround&&Math.sin(egg._dancePhase)>0.7){egg.vy=JUMP_FORCE*(0.45+Math.random()*1.0);egg.squash=0.65;}
    } else if(st==='circle'){
        // Walk in circles
        egg._circleAngle+=0.02+Math.random()*0.005;
        var cr=4+Math.random()*2;
        var tx=egg._circleCenter.x+Math.cos(egg._circleAngle)*cr;
        var tz=egg._circleCenter.z+Math.sin(egg._circleAngle)*cr;
        var cdx3=tx-egg.mesh.position.x, cdz3=tz-egg.mesh.position.z;
        var cd3=Math.sqrt(cdx3*cdx3+cdz3*cdz3);
        if(cd3>0.5){egg.vx+=(cdx3/cd3)*MOVE_ACCEL*0.35;egg.vz+=(cdz3/cd3)*MOVE_ACCEL*0.35;}
        if(egg.onGround&&Math.random()<0.004){egg.vy=JUMP_FORCE*(0.5+Math.random()*1.5);egg.squash=0.6;}
    }
    var spd=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);
    var npcSpd=(egg._aiSprint>0)?1.2:1;
    var maxSpd=st==='flee'?MAX_SPEED*0.7*npcSpd:st==='chase'?MAX_SPEED*0.6*npcSpd:MAX_SPEED*0.45*npcSpd;
    if(spd>maxSpd){egg.vx=(egg.vx/spd)*maxSpd;egg.vz=(egg.vz/spd)*maxSpd;}
}

function updateRaceAI(egg){
    if(!egg.alive||egg.finished||egg.isPlayer||egg.cityNPC)return;
    // Initialize race personality if needed
    if(!egg._raceStyle){
        var r=Math.random();
        if(r<0.25) egg._raceStyle='rusher';      // fast, straight line
        else if(r<0.5) egg._raceStyle='zigzag';   // weaves side to side
        else if(r<0.75) egg._raceStyle='cautious'; // slower, avoids obstacles better
        else egg._raceStyle='jumper';              // jumps a lot
        egg._zigPhase=Math.random()*Math.PI*2;
        egg._speedMult=0.7+Math.random()*0.6;     // 0.7-1.3x speed variation
        egg._sideRange=3+Math.random()*5;          // how wide they weave
        egg._reactSpeed=0.3+Math.random()*0.7;     // how fast they react to obstacles
    }
    egg.aiReactTimer--;
    var style=egg._raceStyle;
    // Forward movement — varied speed per personality
    var fwdAccel=MOVE_ACCEL*egg._speedMult;
    if(style==='rusher') fwdAccel*=(0.7+egg.aiSkill*0.5);
    else if(style==='cautious') fwdAccel*=(0.45+egg.aiSkill*0.4);
    else fwdAccel*=(0.55+egg.aiSkill*0.45);
    egg.vz-=fwdAccel;
    // Lateral movement — personality-based
    if(style==='zigzag'){
        egg._zigPhase+=0.04+egg.aiSkill*0.02;
        egg.aiTargetX=Math.sin(egg._zigPhase)*egg._sideRange;
    } else if(style==='rusher'){
        if(egg.aiReactTimer<=0){egg.aiReactTimer=15+Math.random()*25;egg.aiTargetX=(Math.random()-0.5)*4;}
    } else if(style==='cautious'){
        if(egg.aiReactTimer<=0){egg.aiReactTimer=5+Math.random()*10;egg.aiTargetX=(Math.random()-0.5)*egg._sideRange;}
    } else {
        if(egg.aiReactTimer<=0){egg.aiReactTimer=10+Math.random()*20;egg.aiTargetX=(Math.random()-0.5)*6;}
    }
    var dx=egg.aiTargetX-egg.mesh.position.x;
    egg.vx+=Math.sign(dx)*MOVE_ACCEL*(0.4+egg._reactSpeed*0.4);
    // Jumper personality — frequent random jumps
    if(style==='jumper'&&egg.onGround&&Math.random()<0.025){egg.vy=JUMP_FORCE*(0.6+egg.aiSkill*0.3);egg.squash=0.65;egg.aiJumpCD=15;}
    // Obstacle avoidance
    var ez=-egg.mesh.position.z;
    for(var oi=0;oi<obstacleObjects.length;oi++){
        var ob=obstacleObjects[oi];
        var dz=Math.abs(ez-(ob.data.z||0));
        if(dz>8)continue;
        var avoidStr=egg._reactSpeed*egg.aiSkill;
        if(ob.type==='spinner'&&dz<6){
            var tipX=Math.sin(ob.data.angle)*ob.data.armLen;
            if(Math.abs(egg.mesh.position.x-tipX)<2.5)egg.vx+=(egg.mesh.position.x>tipX?1:-1)*MOVE_ACCEL*avoidStr*1.5;
        }
        if(ob.type==='bumper'&&dz<4&&Math.abs(egg.mesh.position.x-ob.data.x)<2)
            egg.vx+=(egg.mesh.position.x>ob.data.x?1:-1)*MOVE_ACCEL*avoidStr;
        if(ob.type==='roller'&&dz<3){
            if(egg.aiJumpCD<=0&&egg.onGround&&Math.random()<avoidStr*0.5){egg.vy=JUMP_FORCE*(0.7+egg.aiSkill*0.3);egg.aiJumpCD=20+Math.random()*15;}
        }
        if(ob.type==='pendulum'&&dz<5){
            var ballX=Math.sin(ob.data.angle*1.4)*ob.data.chainLen;
            if(Math.abs(egg.mesh.position.x-ballX)<2)egg.vx+=(egg.mesh.position.x>ballX?1:-1)*MOVE_ACCEL*avoidStr;
        }
        if(ob.type==='platform'&&dz<4)egg.vx+=(ob.mesh.position.x-egg.mesh.position.x)*0.02*avoidStr;
        if(ob.type==='conveyor'&&dz<ob.data.halfLen)egg.vx-=ob.data.pushX*0.3*avoidStr;
        if(ob.type==='fallingBlock'&&dz<3&&ob.data.timer<ob.data.warningTime&&Math.abs(egg.mesh.position.x-ob.data.x)<ob.data.size)
            egg.vx+=(egg.mesh.position.x>ob.data.x?1:-1)*MOVE_ACCEL*avoidStr*1.5;
        if(ob.type==='spring'&&dz<2&&Math.abs(egg.mesh.position.x-(ob.data.x||0))<1.5&&egg.onGround){
            egg.vy=ob.data.jumpForce*0.9;
        }
        if(ob.type==='pipe'&&dz<4&&Math.abs(egg.mesh.position.x-(ob.data.x||0))<2)
            egg.vx+=(egg.mesh.position.x>(ob.data.x||0)?1:-1)*MOVE_ACCEL*avoidStr*1.5;
        if(ob.type==='goomba'&&dz<3&&!ob.data._squashed){
            var gdx=egg.mesh.position.x-(ob.data.x||0);
            if(Math.abs(gdx)<2){
                if(egg.onGround&&Math.random()<avoidStr*0.2){egg.vy=JUMP_FORCE*0.9;egg.aiJumpCD=25;}
                else egg.vx+=(gdx>0?1:-1)*MOVE_ACCEL*0.8;
            }
        }
    }
    egg.aiJumpCD--;
    if(egg.aiJumpCD<=0&&egg.onGround&&Math.random()<0.006*egg.aiSkill){egg.vy=JUMP_FORCE*0.85;egg.aiJumpCD=30+Math.random()*20;}
    var spd=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);
    var maxSpd=MAX_SPEED*(style==='rusher'?1.05:style==='cautious'?0.85:0.95);
    if(spd>maxSpd){egg.vx=(egg.vx/spd)*maxSpd;egg.vz=(egg.vz/spd)*maxSpd;}
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
    // Sprint: hold F — gradual speed ramp (same key as grab/throw)
    var holdingF=keys['KeyF']&&!_portalConfirmOpen;
    var sprintPct=_updateSprintBar(holdingF);
    var accelMul=1+sprintPct*1.0;
    var speedMul=1+sprintPct*1.0;
    const len=Math.sqrt(mx*mx+mz*mz);
    if(len>0.1){mx/=len;mz/=len;playerEgg.vx+=mx*MOVE_ACCEL*accelMul;playerEgg.vz+=mz*MOVE_ACCEL*accelMul;}
    // Charge jump: hold Space to charge, release to jump
    // Grace period: allow brief off-ground (slopes/bumps) without canceling charge
    var _onGroundOrGrace=playerEgg.onGround;
    if(!playerEgg.onGround&&_jumpCharging){
        if(!playerEgg._chargeGrace)playerEgg._chargeGrace=0;
        playerEgg._chargeGrace++;
        if(playerEgg._chargeGrace<=8)_onGroundOrGrace=true; // 8 frame grace
    } else {
        playerEgg._chargeGrace=0;
    }
    if(keys['Space']&&_onGroundOrGrace&&!_jumpCharging){_jumpCharging=true;_jumpCharge=0;_chargeBeepTimer=0;_chargeHoldTimer=0;}
    if(_jumpCharging&&keys['Space']&&_onGroundOrGrace){
        if(_jumpCharge<_jumpChargeMax){
            _jumpCharge=Math.min(_jumpCharge+1,_jumpChargeMax);
            var pct=_jumpCharge/_jumpChargeMax;
            var beepInterval=Math.max(3,Math.floor(15-pct*12));
            _chargeBeepTimer++;
            if(_chargeBeepTimer>=beepInterval){_chargeBeepTimer=0;_playChargeBeep(pct);}
            // Butt smoke while charging
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
    if(_jumpCharging&&(!keys['Space']||!_onGroundOrGrace)){
        if(_onGroundOrGrace&&_jumpCharge>0){
            var pct2=_jumpCharge/_jumpChargeMax;
            playerEgg.vy=JUMP_FORCE*(1+pct2*2);
            playerEgg.squash=0.65-pct2*0.2;
            playJumpSound();
            if(pct2>0.15)_spawnGroundDust(playerEgg.mesh.position.x,playerEgg.mesh.position.y,playerEgg.mesh.position.z,pct2);
            _ascendSmoke=true;_ascendSmokePct=pct2;
        }
        _jumpCharging=false;_jumpCharge=0;_chargeHoldTimer=0;
    }
    _updateChargeBar();
    // Ascending butt smoke while rising from charged jump
    if(_ascendSmoke&&playerEgg.vy>0&&!playerEgg.onGround){
        _spawnButtSmoke(playerEgg,_ascendSmokePct*0.7);
    }
    if(_ascendSmoke&&playerEgg.vy<=0&&!playerEgg.onGround){
        _ascendSmoke=false;
    }
    const spd=Math.sqrt(playerEgg.vx*playerEgg.vx+playerEgg.vz*playerEgg.vz);
    var curMax=MAX_SPEED*speedMul;
    if(spd>curMax){playerEgg.vx=(playerEgg.vx/spd)*curMax;playerEgg.vz=(playerEgg.vz/spd)*curMax;}
    // Grab / Throw (F key — triggers once per press via _fJustPressed)
    if(playerEgg.grabCD>0) playerEgg.grabCD--;
    if(keys['KeyF']&&!playerEgg._fWasDown&&playerEgg.grabCD<=0){
        playerEgg._fJustPressed=true;
    } else {
        playerEgg._fJustPressed=false;
    }
    playerEgg._fWasDown=!!keys['KeyF'];
    if(playerEgg._fJustPressed){
        if(playerEgg.holdingProp){
            // Throw city prop
            var prop=playerEgg.holdingProp;
            playerEgg.holdingProp=null;
            var dir1=playerEgg.mesh.rotation.y;
            var pw=prop.weight||1.0;var pf=2.5/pw;prop.throwVx=Math.sin(dir1)*pf;prop.throwVy=0.18;prop.throwVz=Math.cos(dir1)*pf;prop._bounces=2;prop.throwTimer=25;
            prop.group.position.set(playerEgg.mesh.position.x+Math.sin(dir1)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir1)*1.5);
            playerEgg.grabCD=20; playThrowSound();
        } else if(playerEgg.holdingObs){
            // Throw obstacle
            var obs=playerEgg.holdingObs;
            playerEgg.holdingObs=null;
            obs._grabbed=false;
            var dir0=playerEgg.mesh.rotation.y;
            obs.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir0)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir0)*1.5);
            var ow=obs._weight||2.0;var of2=4.5/ow;obs._throwVx=Math.sin(dir0)*of2;obs._throwVy=0.18;obs._throwVz=Math.cos(dir0)*of2;obs._throwTimer=Math.floor(50+20/ow);obs._bounces=2;
            playerEgg.grabCD=20; playThrowSound();
        } else if(playerEgg.holding){
            var held=playerEgg.holding;
            held.heldBy=null; playerEgg.holding=null; if(held.struggleBar){held.mesh.remove(held.struggleBar);held.struggleBar=null;}
            var dir=playerEgg.mesh.rotation.y;
            held.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir)*2, playerEgg.mesh.position.y+2.0, playerEgg.mesh.position.z+Math.cos(dir)*2);
            var tw=held.weight||1.0;var tf=9.0/tw;held.vx=Math.sin(dir)*tf;held.vy=0.22;held.vz=Math.cos(dir)*tf;held._throwTotal=120;held.throwTimer=120;held._bounces=2;
            held.squash=0.5; playerEgg.grabCD=20;
            playThrowSound();
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
        }
    }
}

// ============================================================
//  CAMERA
// ============================================================
var _cameraZoom=1.0; // 1.0 = default, smaller = closer, larger = farther
document.addEventListener('wheel',function(e){
    _cameraZoom+=e.deltaY*0.001;
    if(_cameraZoom<0.04)_cameraZoom=0.04;
    if(_cameraZoom>2.5)_cameraZoom=2.5;
},{passive:true});
function updateCamera(){
    if(!playerEgg)return;
    const p=playerEgg.mesh.position;
    // Camera follows directly behind and above the player
    const tx=p.x, ty=p.y+10*_cameraZoom, tz=p.z+14*_cameraZoom;
    camera.position.x+=(tx-camera.position.x)*0.08;
    camera.position.y+=(ty-camera.position.y)*0.08;
    camera.position.z+=(tz-camera.position.z)*0.08;
    camera.lookAt(p.x, p.y+1, p.z-4);
    sun.position.set(p.x+30,50,p.z+30);
    sun.target.position.set(p.x,0,p.z);

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

    // ---- Fountain water animation ----
    if(window._fountainPoolWater){
        var wt=Date.now()*0.002;
        window._fountainPoolWater.position.y=0.6+Math.sin(wt)*0.03;
        window._fountainPoolWater.rotation.y=wt*0.1;
    }
    if(window._fountainInnerWater){
        var wt2=Date.now()*0.003;
        window._fountainInnerWater.position.y=1.35+Math.sin(wt2+1)*0.02;
    }
    if(window._fountainParticles){
        for(var ffi=0;ffi<window._fountainParticles.length;ffi++){
            var fp=window._fountainParticles[ffi];
            fp.life++;
            if(fp.life>=fp.maxLife||!fp.mesh.visible){
                // Respawn immediately — continuous spray
                fp.life=0;
                fp.mesh.position.set(fp.ox,fp.oy,fp.oz);
                fp.mesh.visible=true;
                fp.mesh.material.opacity=0.6;
                if(fp.type==='jet'){
                    fp.vx=(Math.random()-0.5)*0.12;
                    fp.vy=0.12+Math.random()*0.08;
                    fp.vz=(Math.random()-0.5)*0.12;
                    fp.maxLife=70+Math.random()*40;
                } else {
                    var lla2=fp._lionAngle||0;
                    fp.vx=-Math.cos(lla2)*0.1+(Math.random()-0.5)*0.03;
                    fp.vy=0.02+Math.random()*0.03;
                    fp.vz=-Math.sin(lla2)*0.1+(Math.random()-0.5)*0.03;
                    fp.maxLife=40+Math.random()*20;
                }
            }
            fp.mesh.position.x+=fp.vx;
            fp.mesh.position.z+=fp.vz;
            fp.mesh.position.y+=fp.vy;
            if(fp.type==='jet'){
                fp.vy-=0.004;
            } else {
                fp.vy-=0.003;
            }
            // Hit water surface — hide and respawn next frame
            if(fp.mesh.position.y<0.65){fp.mesh.visible=false;}
            var fAlpha=1-fp.life/fp.maxLife;
            fp.mesh.material.opacity=Math.max(0.05,0.7*fAlpha);
        }
    }
    // Fountain splash when player walks in water
    if(_splashCooldown>0)_splashCooldown--;
    var _fdist=Math.sqrt(px*px+pz*pz);
    var _pspd=playerEgg?Math.sqrt((playerEgg.vx||0)*(playerEgg.vx||0)+(playerEgg.vz||0)*(playerEgg.vz||0)):0;
    if(_fdist<6.5&&playerEgg.mesh.position.y<1.5&&window._fountainSplashParticles){
        // Play splash sound on entry
        if(!playerEgg._inFountain){playerEgg._inFountain=true;playSplashSound();}
        // Check if player is moving (wading)
        var _spawnRate=_pspd>0.02?0.5:0.12; // more splashes when moving
        // Continuous wading splash particles
        for(var fsi2=0;fsi2<window._fountainSplashParticles.length;fsi2++){
            var fsp2=window._fountainSplashParticles[fsi2];
            if(!fsp2.mesh.visible&&fsp2.life>=fsp2.maxLife&&Math.random()<_spawnRate){
                fsp2.mesh.position.set(px+(Math.random()-0.5)*2,0.7,pz+(Math.random()-0.5)*2);
                fsp2.vx=(Math.random()-0.5)*0.2+(playerEgg.vx||0)*0.5;
                fsp2.vy=0.1+Math.random()*0.18;
                fsp2.vz=(Math.random()-0.5)*0.2+(playerEgg.vz||0)*0.5;
                fsp2.life=0;fsp2.maxLife=18+Math.random()*12;
                fsp2.mesh.visible=true;
            }
        }
    } else {
        if(playerEgg)playerEgg._inFountain=false;
    }
    // Periodic splash sound while wading
    if(playerEgg&&playerEgg._inFountain&&_pspd>0.03){playSplashSound();}
    // Always update visible splash particles even if player left
    if(window._fountainSplashParticles){
        for(var fsu=0;fsu<window._fountainSplashParticles.length;fsu++){
            var fsp3=window._fountainSplashParticles[fsu];
            if(fsp3.mesh.visible){
                fsp3.life++;
                fsp3.mesh.position.x+=fsp3.vx;
                fsp3.mesh.position.y+=fsp3.vy;
                fsp3.mesh.position.z+=fsp3.vz;
                fsp3.vy-=0.008;
                fsp3.mesh.material.opacity=0.7*(1-fsp3.life/fsp3.maxLife);
                if(fsp3.life>=fsp3.maxLife){fsp3.mesh.visible=false;}
            }
        }
    }

    // Check portal proximity — show prompt on base, enter when walk into ring
    if(_pipeArrivalCooldown>0)_pipeArrivalCooldown--;
    if(_pipeTraveling||_pipeArrivalCooldown>0){document.getElementById('portal-prompt').style.display='none';} else {
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
            _pt.textContent=_nearP.name+' \u2014 '+_nearP.desc+'  ('+L('walkIn')+')';
        }
    } else if(!_portalConfirmOpen){
        _pp.style.display='none';
    }
    } // end if !_pipeTraveling

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
    stopRaceBGM();
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
    stopBGM(); startRaceBGM(raceIndex);
    const race=RACES[raceIndex];
    document.getElementById('round-label').textContent=race.name;
    document.getElementById('round-name').textContent=race.desc;
    document.getElementById('round-desc').textContent=L('rushGoal');
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
    document.getElementById('result-title').textContent=won?I18N.resultWin(place):L('resultLose');
    document.getElementById('result-sub').textContent=won?I18N.resultSub(raceCoinScore):L('tryAgain');
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
    document.getElementById('place-hud').textContent=I18N.placeN(place);
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
        if(_pipeTraveling){
            updatePipeTravel();
        } else {
            handlePlayerInput();
        }
        if(playerEgg&&!_pipeTraveling) updateEggPhysics(playerEgg, true);
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

    _updateDropShadow();
    R.render(scene,camera);
    _updateChargeParticles();
    // Update grab button text
    if(grabBtn&&playerEgg){if(playerEgg.holding){grabBtn.textContent=L('throwT');grabBtn.classList.add('holding');}else{grabBtn.textContent=L('grab');grabBtn.classList.remove('holding');}}
}

// ============================================================
//  INIT
// ============================================================
buildCity();
buildPortals();
buildCityCoins();
buildWarpPipes();
applyCityTheme();


// Start button
var _startBtn=document.getElementById('start-btn');
function _handleStart(){
    _unlockAudio();
    var ctx=ensureAudio();
    if(ctx&&ctx.state==='suspended')ctx.resume();
    showScreen('select-screen');
    // Delay BGM to let AudioContext fully resume (iOS needs longer)
    setTimeout(function(){
        if(ctx&&ctx.state==='suspended')ctx.resume();
        startSelectBGM();playMenuConfirm();
    },200);
}
_startBtn.addEventListener('click',_handleStart);
_startBtn.addEventListener('touchend',function(e){e.preventDefault();_handleStart();},{passive:false});

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

// Auto-detect nav bar / notch offset for all Android & iOS devices
(function(){
    var tc=document.getElementById('touch-controls');
    if(!tc)return;
    function calcOffset(){
        var offset=12; // base minimum
        // Method 1: visualViewport — most reliable on Android Chrome
        if(window.visualViewport){
            var diff=window.innerHeight-window.visualViewport.height;
            if(diff>5)offset=Math.max(offset,diff+8);
        }
        // Method 2: screen vs window — catches Samsung/Xiaomi nav bars
        var screenH=screen.height;
        var winH=window.innerHeight;
        var dpr=window.devicePixelRatio||1;
        // On Android, screen.height is physical pixels / dpr, window.innerHeight is CSS pixels
        // If there's a significant gap, it's likely a nav bar
        if(screenH>0&&winH>0){
            var gap=screenH-winH;
            if(gap>30)offset=Math.max(offset,Math.min(gap*0.6,80));
        }
        tc.style.setProperty('--nav-offset',offset+'px');
    }
    calcOffset();
    window.addEventListener('resize',calcOffset);
    if(window.visualViewport){
        window.visualViewport.addEventListener('resize',calcOffset);
        window.visualViewport.addEventListener('scroll',calcOffset);
    }
    // Also recalc on orientation change
    window.addEventListener('orientationchange',function(){setTimeout(calcOffset,300);});
})();

// ---- i18n: Apply localized text to HTML elements ----
(function(){
    document.documentElement.lang=_langCode==='zhs'?'zh-CN':_langCode==='zht'?'zh-TW':_langCode==='ja'?'ja':'en';
    document.title=L('title');
    var _e=function(id){return document.getElementById(id);};
    var h1=document.querySelector('#start-screen h1');if(h1)h1.textContent=L('title');
    var sub=document.querySelector('.subtitle');if(sub)sub.textContent=L('subtitle');
    var ver=document.querySelector('.version-text');if(ver)ver.textContent=L('version');
    var sb=_e('start-btn');if(sb)sb.textContent=L('startBtn');
    var st=document.querySelector('.select-title');if(st)st.textContent=L('selectTitle');
    var cb=_e('confirm-btn');if(cb)cb.textContent=L('confirmBtn');
    var py=_e('portal-yes');if(py)py.textContent=L('portalYes');
    var pn=_e('portal-no');if(pn)pn.textContent=L('portalNo');
    var mb=_e('music-btn');if(mb)mb.title=L('music');
    var sb2=_e('sfx-btn');if(sb2)sb2.title=L('sfx');
    var gt=document.querySelector('.hud-pill:last-child');
    // Grab/throw pill in city HUD
    var pills=document.querySelectorAll('#city-hud .hud-pill');
    if(pills.length>=3)pills[2].textContent=L('grabThrow');
    var rb=_e('race-back-btn');if(rb)rb.textContent=L('raceBack');
    var bc=_e('back-city-btn');if(bc)bc.textContent=L('backCity');
    var rt=_e('result-title');if(rt)rt.textContent=L('resultDone');
    var gb=_e('grab-btn');if(gb)gb.textContent=L('grab');
    var jb=_e('jump-btn');if(jb)jb.textContent=L('jump');
    // City name HUD
    var cn=_e('city-name-hud');if(cn)cn.textContent=CITY_STYLES[currentCityStyle].name;
    var pn2=_e('portrait-name');if(pn2)pn2.textContent=CHARACTERS[0].name;
})();

animate();
