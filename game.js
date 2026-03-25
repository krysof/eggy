// ============================================================
//  蛋宝世界 — DANBO World  (Hub City + Race Portals)
// ============================================================
/* global THREE */

// ---- i18n Localization ----
var _autoLangCode=(function(){
    var nav=navigator.language||navigator.userLanguage||'en';
    nav=nav.toLowerCase();
    if(nav.indexOf('zh-tw')===0||nav.indexOf('zh-hant')===0||nav.indexOf('zh-hk')===0)return 'zht';
    if(nav.indexOf('zh')===0)return 'zhs';
    if(nav.indexOf('ja')===0)return 'ja';
    return 'en';
})();
var _langMode='auto'; // 'auto' or manual code
var _langCode=_autoLangCode;
var I18N={
    title:{zhs:'\u86CB\u5B9D\u4E16\u754C',zht:'\u86CB\u5B9D\u4E16\u754C',ja:'\u30C0\u30F3\u30DC\u30EF\u30FC\u30EB\u30C9',en:'DANBO World'},
    subtitle:{zhs:'D A N B O   W O R L D',zht:'D A N B O   W O R L D',ja:'D A N B O   W O R L D',en:'D A N B O   W O R L D'},
    slogan:{zhs:'\u63A2\u7D22\u57CE\u5E02 \u00B7 \u7A7F\u8D8A\u4E16\u754C \u00B7 \u4E00\u8D77\u5192\u9669',zht:'\u63A2\u7D22\u57CE\u5E02 \u00B7 \u7A7F\u8D8A\u4E16\u754C \u00B7 \u4E00\u8D77\u5192\u96AA',ja:'\u63A2\u691C\u30FB\u3064\u306A\u304C\u308B\u30FB\u3044\u3063\u3057\u3087\u306B\u904A\u307C\u3046',en:'Explore \u00B7 Connect \u00B7 Run Together'},
    version:(function(){var v='v20260325.72';return{zhs:v+' by \u767D\u6CB3\u6101',zht:v+' by \u767D\u6CB3\u6101',ja:v+' by \u767D\u6CB3\u6101',en:v+' by Kryso'};})(),
    startBtn:{zhs:'\uD83C\uDFAE \u5F00\u59CB\u6E38\u620F',zht:'\uD83C\uDFAE \u958B\u59CB\u904A\u6232',ja:'\uD83C\uDFAE \u30B2\u30FC\u30E0\u30B9\u30BF\u30FC\u30C8',en:'\uD83C\uDFAE Start Game'},
    selectTitle:{zhs:'\u2014 \u9009 \u62E9 \u89D2 \u8272 \u2014',zht:'\u2014 \u9078 \u64C7 \u89D2 \u8272 \u2014',ja:'\u2014 \u30AD\u30E3\u30E9\u9078\u629E \u2014',en:'\u2014 SELECT CHARACTER \u2014'},
    confirmBtn:{zhs:'\u2694\uFE0F \u786E\u8BA4\u51FA\u6218',zht:'\u2694\uFE0F \u78BA\u8A8D\u51FA\u6230',ja:'\u2694\uFE0F \u6C7A\u5B9A',en:'\u2694\uFE0F Confirm'},
    portalYes:{zhs:'\u2705 \u8FDB\u5165 (Y/\u56DE\u8F66)',zht:'\u2705 \u9032\u5165 (Y/Enter)',ja:'\u2705 \u5165\u308B (Y/Enter)',en:'\u2705 Enter (Y/Enter)'},
    portalNo:{zhs:'\u274C \u53D6\u6D88 (N/ESC)',zht:'\u274C \u53D6\u6D88 (N/ESC)',ja:'\u274C \u30AD\u30E3\u30F3\u30BB\u30EB (N/ESC)',en:'\u274C Cancel (N/ESC)'},
    grabThrow:{zhs:'F \u6293/\u6254 | \u957F\u6309\u84C4\u529B',zht:'F \u6293/\u64F2 | \u9577\u6309\u84C4\u529B',ja:'F \u3064\u304B\u3080/\u6295\u3052\u308B | \u9577\u62BC\u3057\u30C1\u30E3\u30FC\u30B8',en:'F Grab/Throw | Hold to Charge'},
    zoomHint:{zhs:'\u6EDA\u8F6E \u7F29\u653E',zht:'\u6EFE\u8F2A \u7E2E\u653E',ja:'\u30DB\u30A4\u30FC\u30EB \u30BA\u30FC\u30E0',en:'Scroll Zoom'},
    moonCamHint:{zhs:'\u53F3\u952E\u62D6\u52A8 \u65CB\u8F6C\u89C6\u89D2',zht:'\u53F3\u9375\u62D6\u52D5 \u65CB\u8F49\u8996\u89D2',ja:'\u53F3\u30AF\u30EA\u30C3\u30AF\u30C9\u30E9\u30C3\u30B0 \u8996\u70B9\u56DE\u8EE2',en:'Right-drag to orbit camera'},
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
    earthReturn:{zhs:'\u8FD4\u56DE\u5730\u7403',zht:'\u8FD4\u56DE\u5730\u7403',ja:'\u5730\u7403\u3078\u5E30\u9084',en:'Return to Earth'},
    earthReturnDesc:{zhs:'\u4F20\u9001\u56DE\u5730\u7403\u57CE\u5E02',zht:'\u50B3\u9001\u56DE\u5730\u7403\u57CE\u5E02',ja:'\u5730\u7403\u306E\u8857\u3078\u30C6\u30EC\u30DD\u30FC\u30C8',en:'Teleport back to Earth city'},
    charNames:{
        zhs:['\u86CB\u5B9D','\u5C0F\u72D7','\u9A6C\u9A9D','\u516C\u9E21','\u87F3\u8782','\u5C0F\u732B','\u5C0F\u732A','\u9752\u86D9'],
        zht:['\u86CB\u5B9D','\u5C0F\u72D7','\u99AC\u9A1D','\u516C\u96DE','\u8708\u87C2','\u5C0F\u8C93','\u5C0F\u8C6C','\u9752\u86D9'],
        ja:['\u30C0\u30F3\u30DC','\u30A4\u30CC','\u30B5\u30EB','\u30CB\u30EF\u30C8\u30EA','\u30B4\u30AD\u30D6\u30EA','\u30CD\u30B3','\u30D6\u30BF','\u30AB\u30A8\u30EB'],
        en:['Danbo','Puppy','Monkey','Rooster','Cockroach','Kitty','Piggy','Frog']
    },
    cityNames:{
        zhs:['\uD83C\uDFD9\uFE0F \u86CB\u5B9D\u57CE','\uD83C\uDFDC\uFE0F \u6C99\u6F20\u57CE','\u2744\uFE0F \u51B0\u96EA\u57CE','\uD83D\uDD25 \u7194\u5CA9\u57CE','\uD83C\uDF6C \u7CD6\u679C\u57CE','\uD83C\uDF19 \u6708\u9762\u90FD\u5E02'],
        zht:['\uD83C\uDFD9\uFE0F \u86CB\u5B9D\u57CE','\uD83C\uDFDC\uFE0F \u6C99\u6F20\u57CE','\u2744\uFE0F \u51B0\u96EA\u57CE','\uD83D\uDD25 \u7194\u5CA9\u57CE','\uD83C\uDF6C \u7CD6\u679C\u57CE','\uD83C\uDF19 \u6708\u9762\u90FD\u5E02'],
        ja:['\uD83C\uDFD9\uFE0F \u30C0\u30F3\u30DC\u30B7\u30C6\u30A3','\uD83C\uDFDC\uFE0F \u7802\u6F20\u30B7\u30C6\u30A3','\u2744\uFE0F \u6C37\u96EA\u30B7\u30C6\u30A3','\uD83D\uDD25 \u6EB6\u5CA9\u30B7\u30C6\u30A3','\uD83C\uDF6C \u30AD\u30E3\u30F3\u30C7\u30A3\u30B7\u30C6\u30A3','\uD83C\uDF19 \u30EB\u30CA\u30FC\u30BE\u30FC\u30F3'],
        en:['\uD83C\uDFD9\uFE0F DANBO City','\uD83C\uDFDC\uFE0F Desert City','\u2744\uFE0F Ice City','\uD83D\uDD25 Lava City','\uD83C\uDF6C Candy City','\uD83C\uDF19 Lunar Zone']
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
    sfx:{zhs:'\u97F3\u6548',zht:'\u97F3\u6548',ja:'SE',en:'SFX'},
    struggle:{zhs:'\uD83D\uDD25 \u6323\u624E\u4E2D\uFF01\u7591\u72C2\u6309\u65B9\u5411\u952E\uFF01',zht:'\uD83D\uDD25 \u6399\u624E\u4E2D\uFF01\u760B\u72C2\u6309\u65B9\u5411\u9375\uFF01',ja:'\uD83D\uDD25 \u3082\u304C\u3044\u3066\uFF01\u65B9\u5411\u30AD\u30FC\u9023\u6253\uFF01',en:'\uD83D\uDD25 Struggle! Mash direction keys!'},
    chatPlaceholder:{zhs:'\u8F93\u5165\u6D88\u606F...',zht:'\u8F38\u5165\u8A0A\u606F...',ja:'\u30E1\u30C3\u30BB\u30FC\u30B8\u5165\u529B...',en:'Type a message...'}
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
        // Start title BGM once audio is unlocked and we're on start screen
        if(_audioUnlocked&&!titleBgmPlaying&&gameState==='menu'){
            var ss=document.getElementById('start-screen');
            if(ss&&ss.classList.contains('active'))startTitleBGM();
        }
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
    if(!soundEnabled){stopBGM();stopRaceBGM();stopSelectBGM();stopTitleBGM();}
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

// Language toggle button — dropdown menu
var _langOrder=['auto','zhs','zht','ja','en'];
var _langLabels={auto:'Auto',zhs:'\u7B80\u4F53\u4E2D\u6587',zht:'\u7E41\u9AD4\u4E2D\u6587',ja:'\u65E5\u672C\u8A9E',en:'English'};
var _langShort={auto:'',zhs:'\u7B80',zht:'\u7E41',ja:'JP',en:'EN'};
var _autoLabels={zhs:'\u81EA\u52A8',zht:'\u81EA\u52D5',ja:'\u81EA\u52D5',en:'Auto'};
var langBtn=document.getElementById("lang-btn");
var _langMenuOpen=false, _langMenu=null;
function _getLangBtnText(){
    if(_langMode==='auto')return '\uD83C\uDF10'+(_autoLabels[_langCode]||'Auto');
    return '\uD83C\uDF10'+(_langShort[_langMode]||'');
}
function _closeLangMenu(){
    if(_langMenu&&_langMenu.parentNode){_langMenu.parentNode.removeChild(_langMenu);}
    _langMenu=null;_langMenuOpen=false;
}
function _openLangMenu(){
    if(_langMenuOpen){_closeLangMenu();return;}
    _langMenuOpen=true;
    _langMenu=document.createElement('div');
    _langMenu.style.cssText='position:absolute;top:100%;right:0;margin-top:4px;background:rgba(0,0,0,0.85);border:2px solid rgba(255,255,255,0.3);border-radius:10px;padding:4px 0;min-width:130px;backdrop-filter:blur(8px);z-index:99;';
    for(var li=0;li<_langOrder.length;li++){
        (function(code){
            var item=document.createElement('div');
            var isActive=(code===_langMode);
            var label=_langLabels[code];
            if(code==='auto')label=(_autoLabels[_langCode]||'Auto')+' ('+_langLabels[_autoLangCode]+')';
            item.textContent=(isActive?'\u2714 ':'\u2003 ')+label;
            item.style.cssText='padding:7px 14px;color:#fff;font-size:14px;cursor:pointer;white-space:nowrap;'+(isActive?'background:rgba(255,255,255,0.15);':'');
            item.addEventListener('mouseenter',function(){item.style.background='rgba(255,255,255,0.2)';});
            item.addEventListener('mouseleave',function(){item.style.background=isActive?'rgba(255,255,255,0.15)':'';});
            item.addEventListener('click',function(e){
                e.stopPropagation();
                _langMode=code;
                if(_langMode==='auto'){_langCode=_autoLangCode;}
                else{_langCode=_langMode;}
                _applyLang();
                _closeLangMenu();
            });
            _langMenu.appendChild(item);
        })(_langOrder[li]);
    }
    langBtn.style.position='relative';
    langBtn.appendChild(_langMenu);
    // Close on outside click
    setTimeout(function(){
        document.addEventListener('click',_langMenuOutsideClick,{once:true});
    },0);
}
function _langMenuOutsideClick(e){
    if(_langMenu&&!_langMenu.contains(e.target)&&e.target!==langBtn){_closeLangMenu();}
    else if(_langMenuOpen){setTimeout(function(){document.addEventListener('click',_langMenuOutsideClick,{once:true});},0);}
}
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
    var slo=document.querySelector('.slogan-text');if(slo)slo.textContent=L('slogan');
    var sb=document.getElementById('start-btn');if(sb)sb.textContent=L('startBtn');
    var st=document.querySelector('.select-title');if(st)st.textContent=L('selectTitle');
    var cb=document.getElementById('confirm-btn');if(cb)cb.textContent=L('confirmBtn');
    var py=document.getElementById('portal-yes');if(py)py.textContent=L('portalYes');
    var pn=document.getElementById('portal-no');if(pn)pn.textContent=L('portalNo');
    var mb=document.getElementById('music-btn');if(mb)mb.title=L('music');
    var sb2=document.getElementById('sfx-btn');if(sb2)sb2.title=L('sfx');
    var pills=document.querySelectorAll('#city-hud .hud-pill');
    if(pills.length>=3)pills[2].textContent=L('grabThrow');
    var zh=document.getElementById('zoom-hud');if(zh)zh.textContent=L('zoomHint');
    var rb=document.getElementById('race-back-btn');if(rb)rb.textContent=L('raceBack');
    var bc=document.getElementById('back-city-btn');if(bc)bc.textContent=L('backCity');
    var rt=document.getElementById('result-title');if(rt)rt.textContent=L('resultDone');
    var gb=document.getElementById('grab-btn');if(gb)gb.textContent=L('grab');
    var jb=document.getElementById('jump-btn');if(jb)jb.textContent=L('jump');
    var cn=document.getElementById('city-name-hud');if(cn)cn.textContent=CITY_STYLES[currentCityStyle].name;
    var pn2=document.getElementById('portrait-name');if(pn2&&CHARACTERS[selectedChar])pn2.textContent=CHARACTERS[selectedChar].name;
    if(langBtn)langBtn.textContent=_getLangBtnText();
    // Update struggle bar text
    var stText=document.getElementById('struggle-text');if(stText)stText.textContent=L('struggle');
    // Update chat placeholder
    var chatF=document.getElementById('chat-field');if(chatF)chatF.placeholder=L('chatPlaceholder');
    // Rebuild warp pipe signs with new city names
    if(typeof buildWarpPipes==='function'&&typeof cityGroup!=='undefined'&&gameState==='city'){buildWarpPipes();}
}
if(langBtn){
    langBtn.textContent=_getLangBtnText();
    langBtn.addEventListener("click",function(e){
        e.stopPropagation();
        _openLangMenu();
    });
}

// Background music — cheerful multi-layer procedural BGM
let bgmPlaying=false, bgmGain=null, bgmNodes=[], _bgmTimer=null;
function startBGM(){
    if(bgmPlaying||!soundEnabled)return;
    const ctx=ensureAudio(); bgmPlaying=true;
    if(ctx.state==='suspended'){ctx.resume().then(function(){if(bgmPlaying){if(currentCityStyle===5)_playMoonBGMLoop(ctx);else _playBGMLoop(ctx);}});return;}
    if(currentCityStyle===5)_playMoonBGMLoop(ctx);else _playBGMLoop(ctx);
}
function _playBGMLoop(ctx){
    // Dispatch to per-city BGM
    if(currentCityStyle===1)return _playDesertBGM(ctx);
    if(currentCityStyle===2)return _playIceBGM(ctx);
    if(currentCityStyle===3)return _playLavaBGM(ctx);
    if(currentCityStyle===4)return _playCandyBGM(ctx);
    return _playDefaultBGM(ctx);
}
// Helper: generic looping BGM engine
function _bgmEngine(ctx,melA,melB,chords,noteLen,vol,leadType,bassVol,padType){
    bgmGain=ctx.createGain();bgmGain.gain.value=vol||0.15;bgmGain.connect(ctx.destination);
    var loopCount=0;
    function playLoop(){
        if(!bgmPlaying)return;
        var now=ctx.currentTime;var mel=loopCount%2===0?melA:melB;loopCount++;
        for(var i=0;i<mel.length;i++){
            var o=ctx.createOscillator();var g=ctx.createGain();
            o.type=leadType||'triangle';o.frequency.setValueAtTime(mel[i],now+i*noteLen);
            o.frequency.exponentialRampToValueAtTime(mel[i]*1.01,now+i*noteLen+noteLen*0.3);
            o.frequency.exponentialRampToValueAtTime(mel[i],now+i*noteLen+noteLen*0.8);
            g.gain.setValueAtTime(0,now+i*noteLen);g.gain.linearRampToValueAtTime(0.14,now+i*noteLen+0.02);
            g.gain.setValueAtTime(0.12,now+i*noteLen+noteLen*0.5);g.gain.exponentialRampToValueAtTime(0.005,now+i*noteLen+noteLen*0.95);
            o.connect(g);g.connect(bgmGain);o.start(now+i*noteLen);o.stop(now+i*noteLen+noteLen);bgmNodes.push(o);
            if(i%2===0){var h=ctx.createOscillator();var hg=ctx.createGain();h.type='sine';h.frequency.value=mel[i]*1.25;
                hg.gain.setValueAtTime(0.04,now+i*noteLen);hg.gain.exponentialRampToValueAtTime(0.003,now+i*noteLen+noteLen*1.8);
                h.connect(hg);hg.connect(bgmGain);h.start(now+i*noteLen);h.stop(now+i*noteLen+noteLen*2);bgmNodes.push(h);}
            if(i%4===0){var ci=Math.floor(i/4)%chords.length;
                for(var cn=0;cn<chords[ci].length;cn++){var co=ctx.createOscillator();var cg=ctx.createGain();
                    co.type=padType||'sine';co.frequency.value=chords[ci][cn];cg.gain.setValueAtTime(0.035,now+i*noteLen);
                    cg.gain.exponentialRampToValueAtTime(0.005,now+i*noteLen+noteLen*3.8);co.connect(cg);cg.connect(bgmGain);
                    co.start(now+i*noteLen);co.stop(now+i*noteLen+noteLen*4);bgmNodes.push(co);}
                var bo=ctx.createOscillator();var bg2=ctx.createGain();bo.type='sine';bo.frequency.value=chords[ci][0]*0.5;
                bg2.gain.setValueAtTime(bassVol||0.1,now+i*noteLen);bg2.gain.exponentialRampToValueAtTime(0.008,now+i*noteLen+noteLen*3.8);
                bo.connect(bg2);bg2.connect(bgmGain);bo.start(now+i*noteLen);bo.stop(now+i*noteLen+noteLen*4);bgmNodes.push(bo);}
            if(i%4===0){var kb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.08),ctx.sampleRate);var kd=kb.getChannelData(0);
                for(var s=0;s<kd.length;s++){var p=s/kd.length;kd[s]=Math.sin(p*Math.PI*8*(1-p*0.8))*0.4*Math.exp(-p*6);}
                var ks=ctx.createBufferSource();var kg=ctx.createGain();kg.gain.value=0.12;ks.buffer=kb;ks.connect(kg);kg.connect(bgmGain);
                ks.start(now+i*noteLen);ks.stop(now+i*noteLen+0.08);bgmNodes.push(ks);}
            if(i%2===1){var hb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.03),ctx.sampleRate);var hd=hb.getChannelData(0);
                for(var s2=0;s2<hd.length;s2++)hd[s2]=(Math.random()-0.5)*0.15*Math.exp(-s2/(hd.length*0.1));
                var hs=ctx.createBufferSource();var hg2=ctx.createGain();hg2.gain.value=0.06;hs.buffer=hb;hs.connect(hg2);hg2.connect(bgmGain);
                hs.start(now+i*noteLen);hs.stop(now+i*noteLen+0.03);bgmNodes.push(hs);}
        }
        _bgmTimer=setTimeout(playLoop,mel.length*noteLen*1000);
    }
    playLoop();
}
// City 0: Default — cheerful C major
function _playDefaultBGM(ctx){
    var chords=[[262,330,392],[220,262,330],[175,220,262],[196,247,294],[262,330,392],[220,262,330],[175,220,262],[196,247,330]];
    var melA=[784,880,784,659,698,784,880,988,784,659,523,587,659,784,880,784];
    var melB=[659,698,784,880,784,698,659,587,523,587,659,523,440,494,523,659];
    _bgmEngine(ctx,melA,melB,chords,0.18,0.15,'triangle');
}
// City 1: Desert — Arabic/mysterious Phrygian mode, slower
function _playDesertBGM(ctx){
    var chords=[[220,277,330],[208,262,311],[196,247,294],[220,277,349]];
    var melA=[660,622,587,554,587,622,660,698,660,622,554,523,494,523,554,587];
    var melB=[698,660,622,587,554,523,554,587,622,660,698,740,698,660,622,587];
    _bgmEngine(ctx,melA,melB,chords,0.24,0.13,'sawtooth',0.08);
}
// City 2: Ice — gentle, crystalline, high register
function _playIceBGM(ctx){
    var chords=[[330,415,494],[294,370,440],[262,330,392],[294,370,494]];
    var melA=[988,880,784,880,988,1047,988,880,784,698,784,880,988,1047,1175,988];
    var melB=[784,880,988,880,784,698,659,698,784,880,784,698,659,587,659,784];
    _bgmEngine(ctx,melA,melB,chords,0.20,0.12,'sine',0.06,'sine');
}
// City 3: Lava — heavy, dark, minor key with distorted bass
function _playLavaBGM(ctx){
    var chords=[[147,175,220],[131,165,196],[147,175,220],[165,196,247]];
    var melA=[440,415,392,349,330,349,392,440,494,440,392,349,330,294,330,349];
    var melB=[494,440,392,440,494,523,494,440,392,349,330,294,262,294,330,392];
    _bgmEngine(ctx,melA,melB,chords,0.22,0.14,'sawtooth',0.13);
}
// City 4: Candy — bouncy, playful, major pentatonic
function _playCandyBGM(ctx){
    var chords=[[330,415,523],[294,370,440],[349,440,523],[392,494,587]];
    var melA=[523,587,659,784,659,587,523,659,784,880,784,659,523,587,659,784];
    var melB=[880,784,659,587,523,587,659,784,880,988,880,784,659,587,523,659];
    _bgmEngine(ctx,melA,melB,chords,0.16,0.14,'triangle',0.08);
}
function stopBGM(){bgmPlaying=false;if(_bgmTimer){clearTimeout(_bgmTimer);_bgmTimer=null;}bgmNodes.forEach(function(n){try{n.stop();}catch(e){}});bgmNodes=[];if(bgmGain){bgmGain.gain.value=0;bgmGain=null;}}

// Moon battle BGM — epic orchestral war theme (procedural)
function _playMoonBGMLoop(ctx){
    bgmGain=ctx.createGain();bgmGain.gain.value=0.13;bgmGain.connect(ctx.destination);
    // Dm-Bb-Gm-A progression (dark, dramatic)
    var chords=[[293.66,349.23,440],[233.08,293.66,349.23],[196,233.08,293.66],[220,277.18,329.63]];
    // Melody: minor scale heroic motif
    var melA=[587.33,523.25,493.88,440,493.88,523.25,587.33,659.25,587.33,523.25,440,349.23,392,440,493.88,523.25];
    var melB=[659.25,587.33,523.25,587.33,659.25,783.99,659.25,587.33,523.25,493.88,440,392,440,493.88,523.25,587.33];
    var loopN=0;
    function playLoop(){
        if(!bgmPlaying)return;
        var now=ctx.currentTime;var mel=loopN%2===0?melA:melB;var noteLen=0.22;loopN++;
        for(var i=0;i<mel.length;i++){
            // Lead — brass-like sawtooth
            var o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=mel[i];
            var g=ctx.createGain();g.gain.setValueAtTime(0.08,now+i*noteLen);
            g.gain.exponentialRampToValueAtTime(0.005,now+i*noteLen+noteLen*0.9);
            o.connect(g);g.connect(bgmGain);o.start(now+i*noteLen);o.stop(now+i*noteLen+noteLen);bgmNodes.push(o);
            // War drums — heavy kick every 2 notes, snare on off-beats
            if(i%2===0){
                var kb=ctx.createBuffer(1,ctx.sampleRate*0.1,ctx.sampleRate);var kd=kb.getChannelData(0);
                for(var s=0;s<kd.length;s++){var p=s/kd.length;kd[s]=Math.sin(p*Math.PI*6*(1-p*0.9))*0.6*Math.exp(-p*4);}
                var ks=ctx.createBufferSource();var kg=ctx.createGain();kg.gain.value=0.2;
                ks.buffer=kb;ks.connect(kg);kg.connect(bgmGain);ks.start(now+i*noteLen);ks.stop(now+i*noteLen+0.1);bgmNodes.push(ks);
            }
            if(i%4===2){
                var sb=ctx.createBuffer(1,ctx.sampleRate*0.05,ctx.sampleRate);var sd=sb.getChannelData(0);
                for(var s2=0;s2<sd.length;s2++)sd[s2]=(Math.random()-0.5)*0.3*Math.exp(-s2/(sd.length*0.15));
                var ss=ctx.createBufferSource();var sg=ctx.createGain();sg.gain.value=0.15;
                ss.buffer=sb;ss.connect(sg);sg.connect(bgmGain);ss.start(now+i*noteLen);ss.stop(now+i*noteLen+0.05);bgmNodes.push(ss);
            }
            // Chord pads — deep strings
            if(i%4===0){
                var ci=Math.floor(i/4)%chords.length;
                for(var cn=0;cn<chords[ci].length;cn++){
                    var co=ctx.createOscillator();co.type='triangle';co.frequency.value=chords[ci][cn]*0.5;
                    var cg=ctx.createGain();cg.gain.setValueAtTime(0.04,now+i*noteLen);
                    cg.gain.exponentialRampToValueAtTime(0.003,now+i*noteLen+noteLen*3.8);
                    co.connect(cg);cg.connect(bgmGain);co.start(now+i*noteLen);co.stop(now+i*noteLen+noteLen*4);bgmNodes.push(co);
                }
            }
            // Bass — octave below chord root
            if(i%4===0){
                var bi=Math.floor(i/4)%chords.length;
                var bo=ctx.createOscillator();bo.type='sawtooth';bo.frequency.value=chords[bi][0]*0.25;
                var bg2=ctx.createGain();bg2.gain.setValueAtTime(0.1,now+i*noteLen);
                bg2.gain.exponentialRampToValueAtTime(0.008,now+i*noteLen+noteLen*3.8);
                bo.connect(bg2);bg2.connect(bgmGain);bo.start(now+i*noteLen);bo.stop(now+i*noteLen+noteLen*4);bgmNodes.push(bo);
            }
        }
        _bgmTimer=setTimeout(playLoop,mel.length*noteLen*1000);
    }
    playLoop();
}

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
// Title screen BGM — SF2-style dramatic opening (heavy drums, brass stabs, rising melody)
// ============================================================
var titleBgmPlaying=false, titleBgmGain=null, titleBgmNodes=[], titleBgmTimer=null;
function startTitleBGM(){
    if(titleBgmPlaying||!soundEnabled)return;
    var ctx=ensureAudio();
    if(!ctx)return;
    if(ctx.state==='suspended'){ctx.resume().then(function(){if(!titleBgmPlaying){titleBgmPlaying=true;_titleLoop(ctx);}});titleBgmPlaying=true;return;}
    titleBgmPlaying=true;_titleLoop(ctx);
}
function _titleLoop(ctx){
    titleBgmGain=ctx.createGain();titleBgmGain.gain.value=0.16;titleBgmGain.connect(ctx.destination);
    // Cm-Ab-Eb-Bb-Cm-Fm-G-Cm — dramatic minor key, martial feel
    var chords=[
        [261.63,311.13,392],[207.65,261.63,311.13],[311.13,392,466.16],[233.08,293.66,349.23],
        [261.63,311.13,392],[174.61,220,261.63],[196,246.94,293.66],[261.63,311.13,392]
    ];
    // Heroic brass melody — rising motif with dramatic pauses
    var melA=[523.25,0,523.25,587.33,659.25,0,784,784,659.25,587.33,523.25,0,466.16,523.25,587.33,659.25];
    var melB=[784,0,880,784,659.25,0,587.33,523.25,587.33,659.25,784,0,880,988,880,784];
    var noteLen=0.2;
    var loopN=0;
    function doLoop(){
        if(!titleBgmPlaying)return;
        var now=ctx.currentTime;
        var mel=loopN%2===0?melA:melB;loopN++;
        for(var i=0;i<mel.length;i++){
            // Brass lead — sawtooth with attack
            if(mel[i]>0){
                var o=ctx.createOscillator();var g=ctx.createGain();
                o.type='sawtooth';o.frequency.setValueAtTime(mel[i],now+i*noteLen);
                o.frequency.exponentialRampToValueAtTime(mel[i]*0.99,now+i*noteLen+noteLen*0.8);
                g.gain.setValueAtTime(0,now+i*noteLen);
                g.gain.linearRampToValueAtTime(0.12,now+i*noteLen+0.02);
                g.gain.setValueAtTime(0.1,now+i*noteLen+noteLen*0.4);
                g.gain.exponentialRampToValueAtTime(0.005,now+i*noteLen+noteLen*0.95);
                o.connect(g);g.connect(titleBgmGain);o.start(now+i*noteLen);o.stop(now+i*noteLen+noteLen);
                titleBgmNodes.push(o);
                // Octave doubling for power
                var o2=ctx.createOscillator();var g2=ctx.createGain();
                o2.type='square';o2.frequency.value=mel[i]*0.5;
                g2.gain.setValueAtTime(0.04,now+i*noteLen);
                g2.gain.exponentialRampToValueAtTime(0.003,now+i*noteLen+noteLen*0.9);
                o2.connect(g2);g2.connect(titleBgmGain);o2.start(now+i*noteLen);o2.stop(now+i*noteLen+noteLen);
                titleBgmNodes.push(o2);
            }
            // Chord stabs — every 4 notes, brass-like
            if(i%4===0){
                var ci=Math.floor(i/4)%chords.length;
                for(var cn=0;cn<chords[ci].length;cn++){
                    var co=ctx.createOscillator();var cg=ctx.createGain();
                    co.type='sawtooth';co.frequency.value=chords[ci][cn]*0.5;
                    cg.gain.setValueAtTime(0,now+i*noteLen);
                    cg.gain.linearRampToValueAtTime(0.06,now+i*noteLen+0.01);
                    cg.gain.exponentialRampToValueAtTime(0.004,now+i*noteLen+noteLen*3.5);
                    co.connect(cg);cg.connect(titleBgmGain);co.start(now+i*noteLen);co.stop(now+i*noteLen+noteLen*4);
                    titleBgmNodes.push(co);
                }
            }
            // Heavy taiko-style kick drum — every 2 notes
            if(i%2===0){
                var kb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.15),ctx.sampleRate);
                var kd=kb.getChannelData(0);
                for(var s=0;s<kd.length;s++){var p=s/kd.length;kd[s]=Math.sin(p*Math.PI*5*(1-p*0.9))*0.7*Math.exp(-p*3.5);}
                var ks=ctx.createBufferSource();var kg=ctx.createGain();kg.gain.value=0.22;
                ks.buffer=kb;ks.connect(kg);kg.connect(titleBgmGain);ks.start(now+i*noteLen);ks.stop(now+i*noteLen+0.15);
                titleBgmNodes.push(ks);
            }
            // Snare crack on beats 2 and 4 (every 4 notes, offset by 2)
            if(i%4===2){
                var sb2=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.07),ctx.sampleRate);
                var sd=sb2.getChannelData(0);
                for(var s2=0;s2<sd.length;s2++)sd[s2]=(Math.random()-0.5)*0.5*Math.exp(-s2/(sd.length*0.12));
                var ss=ctx.createBufferSource();var sg=ctx.createGain();sg.gain.value=0.18;
                ss.buffer=sb2;ss.connect(sg);sg.connect(titleBgmGain);ss.start(now+i*noteLen);ss.stop(now+i*noteLen+0.07);
                titleBgmNodes.push(ss);
            }
            // Deep bass — root of chord, sub-bass
            if(i%4===0){
                var bi=Math.floor(i/4)%chords.length;
                var bo=ctx.createOscillator();var bg2=ctx.createGain();
                bo.type='sine';bo.frequency.value=chords[bi][0]*0.25;
                bg2.gain.setValueAtTime(0.14,now+i*noteLen);
                bg2.gain.exponentialRampToValueAtTime(0.008,now+i*noteLen+noteLen*3.8);
                bo.connect(bg2);bg2.connect(titleBgmGain);bo.start(now+i*noteLen);bo.stop(now+i*noteLen+noteLen*4);
                titleBgmNodes.push(bo);
            }
            // Cymbal crash on loop start
            if(i===0){
                var cb2=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.3),ctx.sampleRate);
                var cd=cb2.getChannelData(0);
                for(var s3=0;s3<cd.length;s3++)cd[s3]=(Math.random()-0.5)*0.3*Math.exp(-s3/(cd.length*0.25));
                var cs=ctx.createBufferSource();var csg=ctx.createGain();csg.gain.value=0.1;
                cs.buffer=cb2;cs.connect(csg);csg.connect(titleBgmGain);cs.start(now);cs.stop(now+0.3);
                titleBgmNodes.push(cs);
            }
        }
        titleBgmTimer=setTimeout(doLoop,mel.length*noteLen*1000);
    }
    doLoop();
}
function stopTitleBGM(){titleBgmPlaying=false;if(titleBgmTimer){clearTimeout(titleBgmTimer);titleBgmTimer=null;}titleBgmNodes.forEach(function(n){try{n.stop();}catch(e){}});titleBgmNodes=[];if(titleBgmGain){titleBgmGain.gain.value=0;titleBgmGain=null;}}

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

// ---- Battle sounds (moon MS combat) ----
var _beamSoundCD=0, _explSoundCD=0, _missileSoundCD=0;
// Volume multiplier for battle sounds — reduced when player is inside a moon city shield
function _battleSoundVol(){
    if(!playerEgg||currentCityStyle!==5||!window._moonShields)return 1.0;
    var px=playerEgg.mesh.position.x,pz=playerEgg.mesh.position.z;
    for(var si=0;si<window._moonShields.length;si++){
        var s=window._moonShields[si];
        var dx=px-s.x,dz=pz-s.z;
        if(dx*dx+dz*dz<s.r*s.r)return 0.01; // inside city — nearly silent
    }
    return 1.0;
}
function playBeamSound(){
    if(!sfxEnabled||_beamSoundCD>0)return;_beamSoundCD=4;
    var ctx=ensureAudio();if(!ctx)return;var t=ctx.currentTime;var bv=_battleSoundVol();
    var o=ctx.createOscillator();var g=ctx.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(1200+Math.random()*400,t);o.frequency.exponentialRampToValueAtTime(600,t+0.08);
    g.gain.setValueAtTime(0.04*bv,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.1);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.1);
}
function playExplosionSound(){
    if(!sfxEnabled||_explSoundCD>0)return;_explSoundCD=8;
    var ctx=ensureAudio();if(!ctx)return;var t=ctx.currentTime;var bv=_battleSoundVol();
    var buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.3),ctx.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++){var p=i/d.length;d[i]=(Math.random()-0.5)*Math.exp(-p*3)*(1-p);}
    var ns=ctx.createBufferSource();var ng=ctx.createGain();ng.gain.value=0.08*bv;
    ns.buffer=buf;ns.connect(ng);ng.connect(ctx.destination);ns.start(t);ns.stop(t+0.3);
    var o=ctx.createOscillator();var g=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(80,t);o.frequency.exponentialRampToValueAtTime(30,t+0.25);
    g.gain.setValueAtTime(0.06*bv,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.3);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.3);
}
function playMissileSound(){
    if(!sfxEnabled||_missileSoundCD>0)return;_missileSoundCD=6;
    var ctx=ensureAudio();if(!ctx)return;var t=ctx.currentTime;var bv=_battleSoundVol();
    var o=ctx.createOscillator();var g=ctx.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(300,t);o.frequency.linearRampToValueAtTime(800,t+0.15);
    g.gain.setValueAtTime(0.03*bv,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.18);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.18);
}
// AT Field effect — hexagonal flash at shield impact point
function _spawnATField(x,y,z,nx,ny,nz){
    // Evangelion AT Field — ripple rings expanding outward one by one
    for(var ai=0;ai<6;ai++){
        // Each ring starts tiny and expands; delayed by ai*6 frames
        var hex=new THREE.Mesh(new THREE.RingGeometry(0.3,0.8,6),
            new THREE.MeshBasicMaterial({color:ai<3?0xFF8800:0xFFAA33,transparent:true,opacity:0,side:THREE.DoubleSide}));
        hex.position.set(x,y,z);
        hex.lookAt(x+nx,y+ny,z+nz);
        scene.add(hex);
        window._moonBeams.push({mesh:hex,life:50,vx:nx*0.01,vy:ny*0.01,vz:nz*0.01,
            _isExplosion:true,_atField:true,_atDelay:ai*6,_atAge:0,_atMaxR:5+ai*3.5});
    }
    // Central impact flash
    var flash=new THREE.Mesh(new THREE.SphereGeometry(1.5,6,4),new THREE.MeshBasicMaterial({color:0xFFCC44,transparent:true,opacity:0.9}));
    flash.position.set(x,y,z);scene.add(flash);
    window._moonBeams.push({mesh:flash,life:20,vx:0,vy:0,vz:0,_isExplosion:true,_atField:true,_atDelay:0,_atAge:0});
    // AT Field sound
    if(sfxEnabled){
        var ctx=ensureAudio();if(ctx){var t=ctx.currentTime;var _atVol=_battleSoundVol();
        var o=ctx.createOscillator();var g=ctx.createGain();
        o.type='sine';o.frequency.setValueAtTime(1200,t);o.frequency.exponentialRampToValueAtTime(200,t+0.2);
        g.gain.setValueAtTime(0.06*_atVol,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.25);
        o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.25);}
    }
}
// Check if point is inside any moon shield, returns shield or null
function _checkMoonShield(px,py,pz){
    if(!window._moonShields)return null;
    for(var si=0;si<window._moonShields.length;si++){
        var s=window._moonShields[si];
        var dx=px-s.x,dy=py-s.y,dz=pz-s.z;
        if(dx*dx+dy*dy+dz*dz<s.r*s.r)return s;
    }
    return null;
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

const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.5, 2000000);
window.addEventListener('resize', ()=>{ R.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); });

// ---- Lighting ----
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xFFEECC, 2.0);
sun.position.set(60,80,40); sun.castShadow=true;
sun.shadow.mapSize.set(4096,4096);
const ssc=sun.shadow.camera; ssc.left=-120;ssc.right=120;ssc.top=120;ssc.bottom=-120;ssc.near=1;ssc.far=300;
sun.shadow.bias=-0.001;
scene.add(sun); scene.add(sun.target);
scene.add(new THREE.HemisphereLight(0xaaddff,0x88cc66,0.5));
// Sun visual mesh (visible in ground cities)
var _sunMesh=new THREE.Mesh(new THREE.SphereGeometry(8,16,12),new THREE.MeshBasicMaterial({color:0xFFEE44,fog:false}));
_sunMesh.position.copy(sun.position).multiplyScalar(3);
scene.add(_sunMesh);
// Sun glow
var _sunGlow=new THREE.Mesh(new THREE.SphereGeometry(12,16,12),new THREE.MeshBasicMaterial({color:0xFFFF88,transparent:true,opacity:0.25,fog:false}));
_sunGlow.position.copy(_sunMesh.position);
scene.add(_sunGlow);

// ---- Skins ----
// ---- Characters ----
const CHARACTERS = [
    {name:'\u86CB\u5B9D',type:'egg',color:0xFFDD44,accent:0xFFAA00,icon:'\uD83E\uDD5A',portrait:'#FFDD44'},
    {name:'\u5C0F\u72D7',type:'dog',color:0xC8915A,accent:0xA0704A,icon:'\uD83D\uDC36',portrait:'#C8915A'},
    {name:'\u9A6C\u9A9D',type:'monkey',color:0xFF8866,accent:0xCC5533,icon:'\uD83D\uDC35',portrait:'#FF8866'},
    {name:'\u516C\u9E21',type:'rooster',color:0xFFEEDD,accent:0xFF4444,icon:'\uD83D\uDC13',portrait:'#FFEECC'},
    {name:'\u87F3\u8782',type:'cockroach',color:0x8B4513,accent:0x5C2E0A,icon:'\uD83E\uDEB3',portrait:'#8B4513'},
    {name:'\u5C0F\u732B',type:'cat',color:0xDDDDDD,accent:0xAAAAAA,icon:'\uD83D\uDC31',portrait:'#DDDDDD'},
    {name:'\u5C0F\u732A',type:'pig',color:0xFFAAAA,accent:0xFF7788,icon:'\uD83D\uDC37',portrait:'#FFAAAA'},
    {name:'\u9752\u86D9',type:'frog',color:0x55BB55,accent:0x338833,icon:'\uD83D\uDC38',portrait:'#55BB55'},
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

// ---- Stun stars (SF2 style spinning stars above head) ----
function _createStunStars(egg){
    if(egg._stunStars)return;
    var group=new THREE.Group();
    // Stun type based on severity: longer stun = higher tier visual
    // 0=small stars (light), 1=big stars, 2=ducks, 3=birds (heavy)
    var dur=egg._stunTimer||0;
    var stunType=dur<60?0:dur<120?1:dur<200?2:3;
    var items=[];
    for(var i=0;i<4;i++){
        var s;
        if(stunType===0){
            // Small yellow stars
            s=new THREE.Mesh(new THREE.OctahedronGeometry(0.15,0),new THREE.MeshBasicMaterial({color:0xFFFF00,transparent:true,opacity:0.9}));
        } else if(stunType===1){
            // Big white stars with glow
            s=new THREE.Mesh(new THREE.OctahedronGeometry(0.28,0),new THREE.MeshBasicMaterial({color:0xFFFFCC,transparent:true,opacity:0.85}));
        } else if(stunType===2){
            // Little ducks (yellow sphere body + orange beak)
            s=new THREE.Group();
            var body=new THREE.Mesh(new THREE.SphereGeometry(0.14,6,4),new THREE.MeshBasicMaterial({color:0xFFDD00}));
            s.add(body);
            var head=new THREE.Mesh(new THREE.SphereGeometry(0.09,5,4),new THREE.MeshBasicMaterial({color:0xFFDD00}));
            head.position.set(0,0.12,0.06);s.add(head);
            var beak=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.08,4),new THREE.MeshBasicMaterial({color:0xFF8800}));
            beak.position.set(0,0.12,0.16);beak.rotation.x=Math.PI/2;s.add(beak);
            var eye=new THREE.Mesh(new THREE.SphereGeometry(0.02,3,3),new THREE.MeshBasicMaterial({color:0x000000}));
            eye.position.set(0.04,0.15,0.12);s.add(eye);
        } else {
            // Little birds (blue body + wings)
            s=new THREE.Group();
            var bb=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),new THREE.MeshBasicMaterial({color:0x4488FF}));
            s.add(bb);
            var wing1=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.02,0.1),new THREE.MeshBasicMaterial({color:0x6699FF}));
            wing1.position.set(-0.15,0.04,0);s.add(wing1);
            var wing2=wing1.clone();wing2.position.set(0.15,0.04,0);s.add(wing2);
            var bbeak=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.06,3),new THREE.MeshBasicMaterial({color:0xFF6600}));
            bbeak.position.set(0,0,0.14);bbeak.rotation.x=Math.PI/2;s.add(bbeak);
        }
        group.add(s);
        items.push(s);
    }
    scene.add(group);
    egg._stunStars={group:group,stars:items,phase:0,type:stunType};
}
function _updateStunStars(egg){
    if(egg._stunTimer>0){
        if(!egg._stunStars)_createStunStars(egg);
        var ss=egg._stunStars;
        ss.phase+=0.12;
        var p=egg.mesh.position;
        ss.group.position.set(p.x,p.y+2.2,p.z);
        for(var i=0;i<ss.stars.length;i++){
            var a=ss.phase+i/ss.stars.length*Math.PI*2;
            var ix=Math.cos(a)*0.7,iz=Math.sin(a)*0.7;
            var iy=Math.sin(ss.phase*2+i)*0.15;
            ss.stars[i].position.set(ix,iy,iz);
            if(ss.type<=1){
                // Stars spin
                ss.stars[i].rotation.y=ss.phase*3;
            } else if(ss.type===2){
                // Ducks bob and face outward
                ss.stars[i].rotation.y=a+Math.PI;
                ss.stars[i].position.y=iy+Math.sin(ss.phase*3+i*1.5)*0.08;
            } else {
                // Birds flap wings and face forward
                ss.stars[i].rotation.y=a+Math.PI/2;
                if(ss.stars[i].children&&ss.stars[i].children.length>1){
                    var flapAngle=Math.sin(ss.phase*8+i*2)*0.4;
                    ss.stars[i].children[1].rotation.z=flapAngle;
                    ss.stars[i].children[2].rotation.z=-flapAngle;
                }
            }
        }
        ss.group.visible=true;
    } else {
        // Remove stun stars when stun ends so next stun picks a new random type
        if(egg._stunStars&&egg._stunStars.group.visible){
            egg._stunStars.group.visible=false;
            scene.remove(egg._stunStars.group);egg._stunStars=null;
        }
    }
}
function _removeStunStars(egg){
    if(egg._stunStars){scene.remove(egg._stunStars.group);egg._stunStars=null;}
}

// ---- Sonic spin dash state ----
var _spinDashing=false, _spinDashTimer=0, _spinDashTimerMax=0, _spinDashSpeed=0;
var _spinDashBar=null;
function _createSpinDashBar(){
    var canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=40;
    var tex=new THREE.CanvasTexture(canvas);
    tex.minFilter=THREE.LinearFilter;
    var mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});
    var sprite=new THREE.Sprite(mat);
    sprite.scale.set(2.5,0.4,1);
    sprite.renderOrder=1002;
    sprite._canvas=canvas;sprite._ctx=canvas.getContext('2d');sprite._tex=tex;
    return sprite;
}
function _drawSpinDashBar(sprite,pct){
    var ctx=sprite._ctx,w=256,h=40;
    ctx.clearRect(0,0,w,h);
    function rr(x,y,rw,rh,rad){ctx.beginPath();ctx.moveTo(x+rad,y);ctx.lineTo(x+rw-rad,y);ctx.quadraticCurveTo(x+rw,y,x+rw,y+rad);ctx.lineTo(x+rw,y+rh-rad);ctx.quadraticCurveTo(x+rw,y+rh,x+rw-rad,y+rh);ctx.lineTo(x+rad,y+rh);ctx.quadraticCurveTo(x,y+rh,x,y+rh-rad);ctx.lineTo(x,y+rad);ctx.quadraticCurveTo(x,y,x+rad,y);ctx.closePath();}
    ctx.fillStyle='rgba(0,0,0,0.85)';
    rr(2,2,w-4,h-4,8);ctx.fill();
    // Cyan → blue as it depletes
    var r2=0,g2=Math.floor(180+75*pct),b3=255;
    ctx.strokeStyle='rgba('+r2+','+g2+','+b3+','+(0.6+Math.sin(Date.now()*0.02)*0.2)+')';
    ctx.lineWidth=3;rr(5,5,w-10,h-10,6);ctx.stroke();
    var fw=Math.max(4,(w-20)*pct);
    var grad=ctx.createLinearGradient(10,0,10+fw,0);
    grad.addColorStop(0,'rgb(0,'+Math.floor(g2*0.7)+',200)');
    grad.addColorStop(1,'rgb('+r2+','+g2+','+b3+')');
    ctx.fillStyle=grad;
    rr(10,10,fw,h-20,4);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.3)';
    rr(10,10,fw,Math.floor((h-20)/2),4);ctx.fill();
    sprite._tex.needsUpdate=true;
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
    // 0.3s delay (18 frames) before sprint starts
    if(!playerEgg._sprintHoldFrames)playerEgg._sprintHoldFrames=0;
    if(holdingF){
        playerEgg._sprintHoldFrames++;
        if(playerEgg._sprintHoldFrames>=18){
            _sprintCharge=Math.min(_sprintCharge+1,_sprintChargeMax);
        }
        playerEgg._wasSprintHolding=true;
    } else {
        // Trigger spin dash on release if charge was high enough
        if(playerEgg._wasSprintHolding&&_sprintCharge>=_sprintChargeMax&&!_spinDashing){
            var sdPct=_sprintCharge/_sprintChargeMax;
            _spinDashing=true;
            _spinDashTimer=Math.floor(80+sdPct*160);
            _spinDashTimerMax=_spinDashTimer;
            _spinDashSpeed=MAX_SPEED*4.0;
            // Store dash direction from player facing
            var dashDir=playerEgg.mesh.rotation.y;
            playerEgg._dashDirX=Math.sin(dashDir);
            playerEgg._dashDirZ=Math.cos(dashDir);
            // Sonic spin sound
            if(sfxEnabled){var ctx=ensureAudio();if(ctx){var ct=ctx.currentTime;var o=ctx.createOscillator();var g=ctx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(200,ct);o.frequency.exponentialRampToValueAtTime(800,ct+0.15);o.frequency.exponentialRampToValueAtTime(400,ct+0.3);g.gain.setValueAtTime(0.12,ct);g.gain.exponentialRampToValueAtTime(0.001,ct+0.35);o.connect(g);g.connect(ctx.destination);o.start(ct);o.stop(ct+0.35);}}
        }
        playerEgg._wasSprintHolding=false;
        playerEgg._sprintHoldFrames=0;
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
addEventListener('keydown',e=>{ keys[e.code]=true; if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyE','KeyF','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault(); if(e.code==='Enter'&&gameState==='city'&&!_portalConfirmOpen&&!_chatOpen){e.preventDefault();_openChatInput();} });
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
// Chat button (mobile)
var chatBtn=document.getElementById('chat-btn');
if(chatBtn){
    chatBtn.addEventListener('touchstart',function(e){e.preventDefault();_openChatInput();},{passive:false});
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

// ============================================================
//  EGG MESH & ENTITY
// ============================================================
function createEggMesh(color, accent, charType) {
    var g = new THREE.Group();
    var bodyGeo = new THREE.SphereGeometry(0.6,20,14);
    var pos = bodyGeo.attributes.position;
    // Species-specific body deformation
    if (charType==='dog') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.95+0.2*Math.sin(t*Math.PI)+0.1*(1-t);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.15);
        }
    } else if (charType==='monkey') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.85+0.3*Math.sin(t*Math.PI)-0.15*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.08);
        }
    } else if (charType==='rooster') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.88+0.22*Math.sin(t*Math.PI)-0.12*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.18);
        }
    } else if (charType==='cockroach') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=1.05+0.15*Math.sin(t*Math.PI);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*0.88);
        }
    } else if (charType==='cat') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.9+0.24*Math.sin(t*Math.PI)-0.1*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.12);
        }
    } else if (charType==='pig') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=1.0+0.2*Math.sin(t*Math.PI);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.0);
        }
    } else if (charType==='frog') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=1.05+0.18*Math.sin(t*Math.PI);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*0.85);
        }
    } else {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.9+0.25*Math.sin(t*Math.PI)-0.08*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.1);
        }
    }
    bodyGeo.computeVertexNormals();
    var body=new THREE.Mesh(bodyGeo,toon(color));
    body.position.y=0.7; body.castShadow=true; body.receiveShadow=true; g.add(body);

    // Cracked eggshell — ONLY for egg character
    if (charType==='egg') {
        var shellMat=toon(0xFFFFF0);
        for(var si=0;si<5;si++){
            var sa=si/5*Math.PI*2+0.3;
            var sh=0.08+Math.random()*0.12;
            var sw=0.15+Math.random()*0.08;
            var shard=new THREE.Mesh(new THREE.BoxGeometry(sw,sh,0.03),shellMat);
            shard.position.set(Math.cos(sa)*0.28,1.15+sh*0.5,Math.sin(sa)*0.28);
            shard.rotation.z=Math.cos(sa)*0.3;
            shard.rotation.x=-Math.sin(sa)*0.3;
            shard.rotation.y=sa;
            body.add(shard);
        }
        var rimGeo=new THREE.TorusGeometry(0.3,0.03,6,16);
        var rim=new THREE.Mesh(rimGeo,shellMat);
        rim.position.y=1.12;rim.rotation.x=Math.PI/2;
        body.add(rim);
    }

    // Big cute eyes
    var eyeWhiteG=new THREE.SphereGeometry(0.17,12,10);
    var pupilG=new THREE.SphereGeometry(0.1,10,8);
    var shineG=new THREE.SphereGeometry(0.04,6,4);
    var eyeY=charType==='frog'?0.68:0.88;
    [-1,1].forEach(function(s){
        var ew=new THREE.Mesh(eyeWhiteG,toon(0xffffff));
        ew.position.set(s*0.24, eyeY, 0.46); ew.scale.set(1,1.2,0.7);
        body.add(ew);
        var ep=new THREE.Mesh(pupilG,toon(0x222222));
        ep.position.set(s*0.24, eyeY-0.02, 0.53);
        body.add(ep);
        var es=new THREE.Mesh(shineG,toon(0xffffff));
        es.position.set(s*0.24+s*0.04, eyeY+0.04, 0.56);
        body.add(es);
    });

    // Smile
    var smileCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.12, 0.62, 0.52),
        new THREE.Vector3(0, 0.56, 0.55),
        new THREE.Vector3(0.12, 0.62, 0.52)
    );
    var smileGeo = new THREE.TubeGeometry(smileCurve, 10, 0.025, 6, false);
    body.add(new THREE.Mesh(smileGeo, toon(0x333333)));

    // Blush cheeks
    var blG=new THREE.CircleGeometry(0.1,12);
    var blM=toon(0xff7777,{transparent:true,opacity:0.45,side:THREE.DoubleSide});
    [-1,1].forEach(function(s){
        var bl=new THREE.Mesh(blG,blM);
        bl.position.set(s*0.38, 0.72, 0.42); bl.rotation.y=s*0.5;
        body.add(bl);
    });

    // Small arms (Q-style stubs)
    var armMat=toon(color);
    [-1,1].forEach(function(s){
        var arm=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),armMat);
        arm.position.set(s*0.52,0.65,0);
        arm.scale.set(0.8,1.2,0.8);
        body.add(arm);
    });

    // Character-specific features
    if (charType==='dog') {
        var earG=new THREE.SphereGeometry(0.18,8,6); earG.scale(1,1.8,0.6);
        [-1,1].forEach(function(s){
            var ear=new THREE.Mesh(earG,toon(0xA0704A));
            ear.position.set(s*0.42,1.05,0.1); ear.rotation.z=s*0.6;
            ear.castShadow=true; body.add(ear);
        });
        var nose=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),toon(0x333333));
        nose.position.set(0,0.72,0.55); body.add(nose);
        // Short tail
        var dtail=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),toon(0xA0704A));
        dtail.position.set(0,0.75,-0.55); dtail.scale.set(0.8,1.2,0.8);
        body.add(dtail);
    } else if (charType==='cat') {
        var cearG=new THREE.ConeGeometry(0.14,0.35,4);
        [-1,1].forEach(function(s){
            var ear=new THREE.Mesh(cearG,toon(color));
            ear.position.set(s*0.32,1.2,0.1);ear.rotation.z=s*0.2;
            body.add(ear);
            var inner=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.2,4),toon(0xFFBBAA));
            inner.position.set(s*0.32,1.18,0.14);inner.rotation.z=s*0.2;
            body.add(inner);
        });
        var whG=new THREE.CylinderGeometry(0.008,0.008,0.4,3);
        [-1,1].forEach(function(s){
            for(var w=-1;w<=1;w++){
                var wh=new THREE.Mesh(whG,toon(0x888888));
                wh.position.set(s*0.35,0.7+w*0.06,0.45);
                wh.rotation.z=Math.PI/2+s*0.15+w*0.1;
                body.add(wh);
            }
        });
        // Curved tail
        var catTailPts=[];
        for(var ct=0;ct<=8;ct++){
            var ctt=ct/8;
            catTailPts.push(new THREE.Vector3(0, 0.7+ctt*0.4, -0.5-ctt*0.5+Math.sin(ctt*Math.PI)*0.2));
        }
        var catTailCurve=new THREE.CatmullRomCurve3(catTailPts);
        var catTailGeo=new THREE.TubeGeometry(catTailCurve,12,0.04,6,false);
        body.add(new THREE.Mesh(catTailGeo,toon(color)));
    } else if (charType==='monkey') {
        var mearG=new THREE.SphereGeometry(0.18,8,6);
        [-1,1].forEach(function(s){
            var ear=new THREE.Mesh(mearG,toon(0xFFCC88));
            ear.position.set(s*0.5,0.9,0); ear.scale.z=0.5;
            body.add(ear);
            var inner=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),toon(0xD4956B));
            inner.position.set(s*0.5,0.9,0.05); inner.scale.z=0.5;
            body.add(inner);
        });
        var muz=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),toon(0xFFCC88));
        muz.position.set(0,0.65,0.45); muz.scale.set(1.2,0.8,0.6);
        body.add(muz);
        // Long tail (>=0.6x body)
        var monkTailPts=[];
        for(var mt=0;mt<=10;mt++){
            var mtt=mt/10;
            monkTailPts.push(new THREE.Vector3(
                Math.sin(mtt*Math.PI*0.5)*0.15,
                0.6-mtt*0.3+Math.sin(mtt*Math.PI)*0.3,
                -0.5-mtt*0.7
            ));
        }
        var monkTailCurve=new THREE.CatmullRomCurve3(monkTailPts);
        var monkTailGeo=new THREE.TubeGeometry(monkTailCurve,14,0.04,6,false);
        body.add(new THREE.Mesh(monkTailGeo,toon(0xCC5533)));
    } else if (charType==='rooster') {
        for(var ri=0;ri<3;ri++){
            var cb=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),toon(0xFF3333));
            cb.position.set(-0.08+ri*0.08,1.25+Math.abs(ri-1)*0.04,0.15);
            body.add(cb);
        }
        var wat=new THREE.Mesh(new THREE.SphereGeometry(0.08,6,4),toon(0xFF3333));
        wat.position.set(0,0.52,0.5); wat.scale.y=1.5; body.add(wat);
        var beak=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.18,4),toon(0xFFAA00));
        beak.position.set(0,0.7,0.58); beak.rotation.x=-Math.PI/2;
        body.add(beak);
        // Wings
        [-1,1].forEach(function(s){
            var wing=new THREE.Mesh(new THREE.SphereGeometry(0.18,6,4),toon(0xFFEECC));
            wing.position.set(s*0.55,0.65,-0.05);
            wing.scale.set(0.4,1.0,0.8); wing.rotation.z=s*0.3;
            body.add(wing);
        });
        // Tail feathers
        for(var fi=0;fi<3;fi++){
            var feather=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.4,4),toon(fi===1?0xFF4444:0xFFAA00));
            feather.position.set((fi-1)*0.08,0.85+fi*0.05,-0.55);
            feather.rotation.x=0.6+fi*0.1;
            body.add(feather);
        }
    } else if (charType==='cockroach') {
        // Twin-tail antennae (hair-style)
        var antennae=[];
        [-1,1].forEach(function(s){
            var antPts=[];
            for(var ai=0;ai<=6;ai++){
                var att=ai/6;
                antPts.push(new THREE.Vector3(s*0.1+s*att*0.35, 1.1+att*0.5, 0.1-att*0.15));
            }
            var antCurve=new THREE.CatmullRomCurve3(antPts);
            var antGeo=new THREE.TubeGeometry(antCurve,10,0.025,6,false);
            var ant=new THREE.Mesh(antGeo,toon(0x5C2E0A));
            ant.userData._antSide=s;
            body.add(ant);
            antennae.push(ant);
            var tip=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,4),toon(0x8B6040));
            tip.position.set(s*0.45,1.6,-0.05);
            tip.userData._antSide=s;
            body.add(tip);
            antennae.push(tip);
        });
        g.userData._antennae=antennae;
        // Shell line
        var sline=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.6,0.02),toon(0x3D2215));
        sline.position.set(0,0.8,-0.1); body.add(sline);
        // Small legs
        [-1,1].forEach(function(s){
            for(var j=0;j<2;j++){
                var leg=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.25,3),toon(0x5C2E0A));
                leg.position.set(s*0.45,0.4+j*0.25,0); leg.rotation.z=s*0.8;
                body.add(leg);
            }
        });
    } else if (charType==='pig') {
        // Prominent snout
        var snout=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.12,8),toon(0xFF8899));
        snout.position.set(0,0.68,0.52); snout.rotation.x=Math.PI/2;
        body.add(snout);
        [-1,1].forEach(function(s){
            var nos=new THREE.Mesh(new THREE.SphereGeometry(0.04,4,4),toon(0xDD6677));
            nos.position.set(s*0.06,0.68,0.6); body.add(nos);
        });
        // Small floppy ears
        var pearG=new THREE.SphereGeometry(0.14,6,4); pearG.scale(1,1.2,0.5);
        [-1,1].forEach(function(s){
            var ear=new THREE.Mesh(pearG,toon(0xFFBBBB));
            ear.position.set(s*0.35,1.08,0.1); ear.rotation.z=s*0.5;
            body.add(ear);
        });
        // Curly tail
        var pigTailPts=[];
        for(var pt=0;pt<=12;pt++){
            var ptt=pt/12;
            pigTailPts.push(new THREE.Vector3(
                Math.sin(ptt*Math.PI*3)*0.08,
                0.7+Math.cos(ptt*Math.PI*3)*0.08,
                -0.5-ptt*0.25
            ));
        }
        var pigTailCurve=new THREE.CatmullRomCurve3(pigTailPts);
        var pigTailGeo=new THREE.TubeGeometry(pigTailCurve,16,0.03,6,false);
        body.add(new THREE.Mesh(pigTailGeo,toon(0xFFAAAA)));
    } else if (charType==='frog') {
        // Bulging eyes on top
        [-1,1].forEach(function(s){
            var bulge=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),toon(color));
            bulge.position.set(s*0.22,1.0,0.3); body.add(bulge);
            var bigEye=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),toon(0xffffff));
            bigEye.position.set(s*0.22,1.02,0.38); body.add(bigEye);
            var bigPupil=new THREE.Mesh(new THREE.SphereGeometry(0.07,6,4),toon(0x111111));
            bigPupil.position.set(s*0.22,1.01,0.44); body.add(bigPupil);
        });
        // Wide mouth line
        var mouthCurve=new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-0.25,0.5,0.48),
            new THREE.Vector3(0,0.42,0.52),
            new THREE.Vector3(0.25,0.5,0.48)
        );
        var mouthGeo=new THREE.TubeGeometry(mouthCurve,10,0.025,4,false);
        body.add(new THREE.Mesh(mouthGeo,toon(0x226622)));
    }

    // Feet
    var ftG=new THREE.SphereGeometry(0.14,8,6); ftG.scale(1.1,0.45,1.4);
    var ftM=toon(accent||0xFFCC00);
    var feet=[];
    [-1,1].forEach(function(s){ var ft=new THREE.Mesh(ftG,ftM); ft.position.set(s*0.2,0.05,0.06); ft.castShadow=true; g.add(ft); feet.push(ft); });
    g.userData.body=body; g.userData.feet=feet; g.userData._charType=charType;
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
        heldBy:null, holding:null, grabCD:0, struggleTimer:0, struggleMax:0, struggleBar:null, throwTimer:0, holdingObs:null, holdingProp:null, weight:1.0, _stunTimer:0,
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
    var isCity=(gameState==='city');
    var groundY=0;
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
                var clTop=cl.y+(cl.top||1.2);
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
var _prevCityStyle=0; // track previous city for earth return
var CITY_STYLES=[
    {name:'\uD83C\uDFD9\uFE0F \u86CB\u5B9D\u57CE',ground:0x6EC850,path:0xDDCCAA,sky:0x87CEEB,bColors:[0xFF8888,0x88BBFF,0xFFDD66,0xAADD88,0xDDAA88,0xBB99DD,0xFF99CC,0x88DDCC],roof:0xDD6644,tree:0x44BB44,fog:null},
    {name:'🏜️ 沙漠城',ground:0xDDCC88,path:0xCCBB77,sky:0xFFCC66,bColors:[0xDDAA66,0xCC9955,0xEEBB77,0xBB8844,0xDDCC88,0xCCAA55,0xEECC99,0xBB9966],roof:0xAA6633,tree:0x88AA44,fog:0xFFEECC},
    {name:'❄️ 冰雪城',ground:0xDDEEFF,path:0xBBCCDD,sky:0xAABBDD,bColors:[0xAADDFF,0x88BBEE,0xCCEEFF,0x99CCEE,0xBBDDFF,0x77AADD,0xDDEEFF,0xAABBCC],roof:0x6699BB,tree:0x88CCAA,fog:0xCCDDEE},
    {name:'🔥 熔岩城',ground:0x443322,path:0x554433,sky:0x331111,bColors:[0x884422,0x663311,0xAA5533,0x774422,0x995544,0x553311,0xBB6644,0x664422],roof:0x442211,tree:0x556633,fog:0x221100},
    {name:'🍬 糖果城',ground:0xFFBBDD,path:0xFFDDEE,sky:0xFFCCEE,bColors:[0xFF88BB,0xBB88FF,0xFFBB88,0x88FFBB,0xFF88FF,0xFFFF88,0x88BBFF,0xFFAA88],roof:0xDD66AA,tree:0xFF88CC,fog:null},
    {name:'\uD83C\uDF19 \u6708\u9762\u90FD\u5E02',ground:0x888899,path:0xAAAABB,sky:0x0A0015,bColors:[0x9999AA,0x7777AA,0xBBBBCC,0x8888AA,0xAAAABB,0x6666AA,0xCCCCDD,0x9999BB],roof:0x6666AA,tree:0x99AACC,fog:null}
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
    if(currentCityStyle===5){
        // Moon: large flat ground plane
        var moonGroundGeo=new THREE.PlaneGeometry(MOON_CITY_SIZE*2,MOON_CITY_SIZE*2,16,16);
        var moonGround=new THREE.Mesh(moonGroundGeo,toon(st.ground));
        moonGround.rotation.x=-Math.PI/2;moonGround.receiveShadow=true;
        cityGroup.add(moonGround);
        // Subtle surface detail — darker patches on flat ground
        for(var pi=0;pi<15;pi++){
            var ppx=(Math.random()-0.5)*MOON_CITY_SIZE*1.6;
            var ppz=(Math.random()-0.5)*MOON_CITY_SIZE*1.6;
            var pr=8+Math.random()*16;
            var patch=new THREE.Mesh(new THREE.CircleGeometry(pr,16),toon(0x666677));
            patch.rotation.x=-Math.PI/2;
            patch.position.set(ppx,0.02,ppz);
            cityGroup.add(patch);
        }
    } else {
    const groundGeo = new THREE.PlaneGeometry(CITY_SIZE*2, CITY_SIZE*2, 16, 16);
    const ground = new THREE.Mesh(groundGeo, toon(st.ground));
    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true;
    cityGroup.add(ground);
    }

    // Paths (not on moon)
    if(currentCityStyle!==5){
    const pathM = toon(st.path);
    [{w:CITY_SIZE*2,d:5,x:0,z:0},{w:5,d:CITY_SIZE*2,x:0,z:0},
     {w:CITY_SIZE*1.2,d:4,x:15,z:25},{w:4,d:CITY_SIZE*1.2,x:-25,z:-10}].forEach(p=>{
        const path=new THREE.Mesh(new THREE.BoxGeometry(p.w,0.06,p.d),pathM);
        path.position.set(p.x,0.03,p.z); path.receiveShadow=true; cityGroup.add(path);
    });
    }

    // ---- Buildings (not on moon) ----
    if(currentCityStyle!==5){
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
    // (Hidden entrances removed — moon only reachable from cloud world)
    } // end if not moon

    // ---- Moon City special decorations (FLAT) ----
    if(currentCityStyle===5){
        // Layout: Von Braun city on left (x<0), battlefield on right (x>0)
        var _moonCityHalf=MOON_CITY_SIZE; // 400
        // Craters on flat ground (outside city zone)
        for(var ci=0;ci<30;ci++){
            var crx=(Math.random()-0.5)*_moonCityHalf*1.8;
            var crz=(Math.random()-0.5)*_moonCityHalf*1.8;
            // Skip if inside Von Braun zone (x<-50) or too close to center
            if(crx<-50&&Math.abs(crz)<120)continue;
            var crr=3+Math.random()*8;
            var craterG=new THREE.Group();
            var crater=new THREE.Mesh(new THREE.CylinderGeometry(crr,crr*1.1,1,16),toon(0x555566));
            crater.position.y=-0.3;craterG.add(crater);
            var rim=new THREE.Mesh(new THREE.TorusGeometry(crr,0.8,6,16),toon(0x777788));
            rim.position.y=0.1;rim.rotation.x=Math.PI/2;craterG.add(rim);
            craterG.position.set(crx,0,crz);
            cityGroup.add(craterG);
        }
        // Apollo Lunar Module — flat positioned
        var apollo=new THREE.Group();
        var descent=new THREE.Mesh(new THREE.BoxGeometry(3,2,3),toon(0xCCAA44,{emissive:0x886622,emissiveIntensity:0.2}));
        descent.position.y=2;apollo.add(descent);
        for(var li=0;li<4;li++){
            var la=li/4*Math.PI*2+Math.PI/4;
            var leg=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,2.5,4),toon(0xAAAAAA));
            leg.position.set(Math.cos(la)*2,0.8,Math.sin(la)*2);
            leg.rotation.z=Math.cos(la)*0.3;leg.rotation.x=-Math.sin(la)*0.3;
            apollo.add(leg);
            var pad=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,0.1,8),toon(0x999999));
            pad.position.set(Math.cos(la)*2.5,0.05,Math.sin(la)*2.5);
            apollo.add(pad);
        }
        var ascent=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.8,2.2),toon(0xCCCCCC));
        ascent.position.y=3.8;apollo.add(ascent);
        var win=new THREE.Mesh(new THREE.CircleGeometry(0.4,8),toon(0x224466,{emissive:0x112233,emissiveIntensity:0.3}));
        win.position.set(0,4,1.12);apollo.add(win);
        var ant=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,2,4),toon(0xDDDDDD));
        ant.position.set(0.5,5.5,0);apollo.add(ant);
        var dish=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,4,0,Math.PI*2,0,Math.PI/2),toon(0xDDDDDD));
        dish.position.set(0.5,6.5,0);dish.rotation.x=Math.PI;apollo.add(dish);
        var flagPole=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,3,4),toon(0xCCCCCC));
        flagPole.position.set(5,1.5,0);apollo.add(flagPole);
        var flag=new THREE.Mesh(new THREE.BoxGeometry(1.5,1,0.02),toon(0x2244AA));
        flag.position.set(5.8,2.8,0);apollo.add(flag);
        var stripes=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.08,0.03),toon(0xDD2222));
        stripes.position.set(5.8,2.5,0.01);apollo.add(stripes);
        var stripes2=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.08,0.03),toon(0xDD2222));
        stripes2.position.set(5.8,3.1,0.01);apollo.add(stripes2);
        // Place Apollo on flat ground (battlefield side)
        apollo.position.set(280,0,280);
        apollo.scale.set(3,3,3);
        cityGroup.add(apollo);
        // Lunar Rover — projected onto sphere
        var rover=new THREE.Group();
        var rBody=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.3,1.2),toon(0xBBBBBB));
        rBody.position.y=0.8;rover.add(rBody);
        for(var wi=0;wi<4;wi++){
            var wx2=(wi%2===0?-1:1)*1.1;
            var wz2=(wi<2?-1:1)*0.7;
            var wheel=new THREE.Mesh(new THREE.TorusGeometry(0.35,0.08,6,12),toon(0x666666));
            wheel.position.set(wx2,0.35,wz2);wheel.rotation.y=Math.PI/2;
            rover.add(wheel);
        }
        var rDish=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,4,0,Math.PI*2,0,Math.PI/2),toon(0xDDDDDD));
        rDish.position.set(0,1.5,0);rDish.rotation.x=Math.PI;rover.add(rDish);
        // Place rover on flat ground near Apollo
        rover.position.set(270,0,290);
        rover.scale.set(3,3,3);
        rover.rotateY(0.5);
        cityGroup.add(rover);
        // ---- Grand Lunar City "Von Braun" (Gundam-style) ----
        var lunarCity=new THREE.Group();
        var lcBase=toon(0x888899),lcWall=toon(0x667788),lcDark=toon(0x445566);
        var lcGlow=new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.4});
        var lcWarm=new THREE.MeshBasicMaterial({color:0xFFCC66,transparent:true,opacity:0.35});
        // Crater rim (outer wall — raised)
        var craterRim=new THREE.Mesh(new THREE.TorusGeometry(18,3,8,24),toon(0x666677));
        craterRim.rotation.x=Math.PI/2;craterRim.position.y=2;lunarCity.add(craterRim);
        // Crater floor (sunken)
        var craterFloor=new THREE.Mesh(new THREE.CylinderGeometry(17,17,0.5,24),toon(0x555566));
        craterFloor.position.y=-3;lunarCity.add(craterFloor);
        // Crater inner wall (sloped)
        var craterWall=new THREE.Mesh(new THREE.CylinderGeometry(17,18.5,5,24,1,true),toon(0x556677));
        craterWall.position.y=-0.5;lunarCity.add(craterWall);
        // Main dome — large transparent geodesic
        var mainDome=new THREE.Mesh(new THREE.SphereGeometry(16,24,16,0,Math.PI*2,0,Math.PI/2),
            new THREE.MeshPhongMaterial({color:0x8899BB,transparent:true,opacity:0.18,side:THREE.DoubleSide}));
        mainDome.position.y=0;lunarCity.add(mainDome);
        // Dome wireframe for geodesic look
        var domeWire=new THREE.Mesh(new THREE.SphereGeometry(16.1,24,16,0,Math.PI*2,0,Math.PI/2),
            new THREE.MeshBasicMaterial({color:0x6688AA,wireframe:true,transparent:true,opacity:0.25}));
        lunarCity.add(domeWire);
        // Central tower (Anaheim Electronics HQ)
        var aeHQ=new THREE.Mesh(new THREE.CylinderGeometry(0.8,1.5,18,8),lcWall);aeHQ.position.y=9;lunarCity.add(aeHQ);
        var aeTop=new THREE.Mesh(new THREE.SphereGeometry(1.2,8,6),toon(0x99AABB));aeTop.position.y=18.5;lunarCity.add(aeTop);
        var aeAnt=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,8,4),toon(0xCCCCCC));aeAnt.position.y=23;lunarCity.add(aeAnt);
        // AE logo glow
        var aeLogo=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.6,0.1),lcGlow);aeLogo.position.set(0,14,1.55);lunarCity.add(aeLogo);
        // Tall needle spires (Gundam-style Von Braun skyline)
        for(var nsi=0;nsi<20;nsi++){
            var nsa=nsi/20*Math.PI*2+Math.random()*0.3;
            var nsr=3+Math.random()*14;
            var nsh=8+Math.random()*18;
            var nsw=0.15+Math.random()*0.3;
            var ns=new THREE.Mesh(new THREE.CylinderGeometry(nsw*0.3,nsw,nsh,5),toon(0x778899));
            ns.position.set(Math.cos(nsa)*nsr,nsh/2-1,Math.sin(nsa)*nsr);lunarCity.add(ns);
            // Spire tip glow
            if(Math.random()<0.5){
                var nsGlow=new THREE.Mesh(new THREE.SphereGeometry(0.2,4,3),new THREE.MeshBasicMaterial({color:0x88CCFF,transparent:true,opacity:0.6}));
                nsGlow.position.set(Math.cos(nsa)*nsr,nsh-0.5,Math.sin(nsa)*nsr);lunarCity.add(nsGlow);
            }
        }
        // Ring of tall buildings (commercial district)
        for(var lbi=0;lbi<12;lbi++){
            var lba=lbi/12*Math.PI*2;var lbr=8+Math.random()*3;
            var lbh=3+Math.random()*6;var lbw=1.2+Math.random()*1.5;
            var lb=new THREE.Mesh(new THREE.BoxGeometry(lbw,lbh,lbw),lbi%3===0?lcDark:lcWall);
            lb.position.set(Math.cos(lba)*lbr,lbh/2-1,Math.sin(lba)*lbr);lunarCity.add(lb);
            // Window rows
            for(var wri=0;wri<Math.floor(lbh/1.2);wri++){
                var wm=new THREE.Mesh(new THREE.BoxGeometry(lbw*0.7,0.15,lbw+0.05),lcWarm);
                wm.position.set(Math.cos(lba)*lbr,wri*1.2+0.5,Math.sin(lba)*lbr);lunarCity.add(wm);
            }
        }
        // Inner ring — residential towers
        for(var lri=0;lri<8;lri++){
            var lra=lri/8*Math.PI*2+0.4;var lrr=4+Math.random()*2;
            var lrh=2+Math.random()*4;
            var lr=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.8,lrh,6),lcWall);
            lr.position.set(Math.cos(lra)*lrr,lrh/2-1,Math.sin(lra)*lrr);lunarCity.add(lr);
            var lrw=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.1,1.3),lcWarm);
            lrw.position.set(Math.cos(lra)*lrr,lrh*0.6,Math.sin(lra)*lrr);lunarCity.add(lrw);
        }
        // Spaceport — 4 large landing pads on crater rim
        for(var spi2=0;spi2<4;spi2++){
            var spa2=spi2/4*Math.PI*2+Math.PI/8;var spr=19;
            var sPad=new THREE.Mesh(new THREE.CylinderGeometry(3,3,0.3,12),toon(0x556666));
            sPad.position.set(Math.cos(spa2)*spr,1.5,Math.sin(spa2)*spr);lunarCity.add(sPad);
            // Pad markings
            var sMark=new THREE.Mesh(new THREE.RingGeometry(1.5,2,12),new THREE.MeshBasicMaterial({color:0xFFAA00,transparent:true,opacity:0.5,side:THREE.DoubleSide}));
            sMark.rotation.x=-Math.PI/2;sMark.position.set(Math.cos(spa2)*spr,1.7,Math.sin(spa2)*spr);lunarCity.add(sMark);
            // Control tower
            var sTower=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,3,6),lcWall);
            sTower.position.set(Math.cos(spa2)*(spr+3),3,Math.sin(spa2)*(spr+3));lunarCity.add(sTower);
            var sLight=new THREE.Mesh(new THREE.SphereGeometry(0.3,4,3),lcGlow);
            sLight.position.set(Math.cos(spa2)*(spr+3),4.6,Math.sin(spa2)*(spr+3));lunarCity.add(sLight);
        }
        // Mass driver — long rail extending from city
        var mdGroup=new THREE.Group();
        var mdRail=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.4,40),toon(0x556677));mdRail.position.z=20;mdGroup.add(mdRail);
        var mdRail2=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.8,40),toon(0x445566));mdRail2.position.set(-0.8,0.4,20);mdGroup.add(mdRail2);
        var mdRail3=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.8,40),toon(0x445566));mdRail3.position.set(0.8,0.4,20);mdGroup.add(mdRail3);
        // Electromagnetic coils along rail
        for(var mci=0;mci<8;mci++){
            var mc=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.15,6,12),toon(0x4466AA));
            mc.position.set(0,0.8,mci*5+2);mc.rotation.y=Math.PI/2;mdGroup.add(mc);
        }
        mdGroup.position.set(22,0,0);mdGroup.rotation.y=Math.PI/4;lunarCity.add(mdGroup);
        // Solar panel arrays (large, on stilts)
        for(var sai=0;sai<6;sai++){
            var saa=sai/6*Math.PI*2+Math.PI/6;var sar=24+Math.random()*4;
            var saG=new THREE.Group();
            var saPole=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,5,4),toon(0x888888));saPole.position.y=2.5;saG.add(saPole);
            var saPanel=new THREE.Mesh(new THREE.BoxGeometry(5,0.08,2.5),toon(0x224488));saPanel.position.y=5.2;saG.add(saPanel);
            var saFrame=new THREE.Mesh(new THREE.BoxGeometry(5.2,0.15,0.1),toon(0x666666));saFrame.position.y=5.2;saG.add(saFrame);
            saG.position.set(Math.cos(saa)*sar,0,Math.sin(saa)*sar);
            saG.rotation.y=saa+Math.PI/2;lunarCity.add(saG);
        }
        // Fiber-optic light viaducts (glowing tubes inside dome)
        for(var fvi=0;fvi<6;fvi++){
            var fva=fvi/6*Math.PI*2;
            var fv=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,14,6),
                new THREE.MeshBasicMaterial({color:0x88CCFF,transparent:true,opacity:0.25}));
            fv.position.set(Math.cos(fva)*12,7,Math.sin(fva)*12);
            fv.rotation.z=Math.PI/2*0.3;fv.rotation.y=fva;lunarCity.add(fv);
        }
        // Place Von Braun on flat ground (left side, x<0)
        lunarCity.position.set(-200,0,0);
        lunarCity.scale.set(8,8,8);
        cityGroup.add(lunarCity);
        // Von Braun city doors — 4 entrances (N/S/E/W) on crater rim
        var _vbDoorAngles=[0,Math.PI/2,Math.PI,Math.PI*1.5];
        var _vbDoorR=18.5; // on crater rim
        for(var vdi=0;vdi<4;vdi++){
            var vda=_vbDoorAngles[vdi];
            var doorG=new THREE.Group();
            // Door frame
            var doorFrame=new THREE.Mesh(new THREE.BoxGeometry(3,4,0.5),toon(0x4466AA));
            doorFrame.position.y=2;doorG.add(doorFrame);
            // Door opening (glowing)
            var doorGlow=new THREE.Mesh(new THREE.BoxGeometry(2.2,3.2,0.3),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.4}));
            doorGlow.position.y=1.8;doorG.add(doorGlow);
            // Arch top
            var doorArch=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,0.5,8,1,false,0,Math.PI),toon(0x4466AA));
            doorArch.position.y=4;doorArch.rotation.z=Math.PI/2;doorArch.rotation.y=Math.PI/2;doorG.add(doorArch);
            // Position on rim
            doorG.position.set(Math.cos(vda)*_vbDoorR,1,Math.sin(vda)*_vbDoorR);
            doorG.rotation.y=vda+Math.PI; // face outward
            lunarCity.add(doorG);
        }
        // Von Braun collider zone (flat)
        window._moonShields=[];
        // AT Field shields around cities — MS and projectiles can't enter
        // doors: array of {angle, width} for player pass-through openings
        window._moonShields.push({x:-200,y:0,z:0,r:160,
            doors:[{a:0,w:0.25},{a:Math.PI/2,w:0.25},{a:Math.PI,w:0.25},{a:Math.PI*1.5,w:0.25}]
        }); // Von Braun dome
        window._moonCities=[
            {cx:-200,cy:0,cz:0,r:160,scale:8,name:{zhs:'\u51AF\u00B7\u5E03\u52B3\u6069',zht:'\u99AE\u00B7\u5E03\u52DE\u6069',ja:'\u30D5\u30A9\u30F3\u30FB\u30D6\u30E9\u30A6\u30F3',en:'Von Braun'},flatX:-200,flatZ:0}
        ];
        // ---- Granada (second city, far side) ----
        var granada=new THREE.Group();
        // Deep crater rim
        var grRim=new THREE.Mesh(new THREE.TorusGeometry(10,2,8,20),toon(0x556666));
        grRim.rotation.x=Math.PI/2;grRim.position.y=0.5;granada.add(grRim);
        // Crater bowl (sunken floor)
        var grFloor=new THREE.Mesh(new THREE.CylinderGeometry(9,9,0.5,20),toon(0x334455));
        grFloor.position.y=-3;granada.add(grFloor);
        // Crater inner wall (sloped)
        var grWall=new THREE.Mesh(new THREE.CylinderGeometry(9,10.5,4,20,1,true),toon(0x445566));
        grWall.position.y=-1;granada.add(grWall);
        // Blue glow from within (Granada's signature blue lighting)
        var grGlowFloor=new THREE.Mesh(new THREE.CircleGeometry(8,20),new THREE.MeshBasicMaterial({color:0x2244AA,transparent:true,opacity:0.15,side:THREE.DoubleSide}));
        grGlowFloor.rotation.x=-Math.PI/2;grGlowFloor.position.y=-2.5;granada.add(grGlowFloor);
        // Concentric ring lights (blue)
        for(var gri=0;gri<3;gri++){
            var grRing=new THREE.Mesh(new THREE.TorusGeometry(3+gri*2.5,0.08,6,24),new THREE.MeshBasicMaterial({color:0x4488FF,transparent:true,opacity:0.3}));
            grRing.rotation.x=Math.PI/2;grRing.position.y=-2.4;granada.add(grRing);
        }
        // Military hangars (inside crater)
        for(var ghi=0;ghi<6;ghi++){
            var gha=ghi/6*Math.PI*2;var ghr=5+Math.random()*2;
            var gh=new THREE.Mesh(new THREE.BoxGeometry(2,1.5,3),toon(0x445544));
            gh.position.set(Math.cos(gha)*ghr,0.5,Math.sin(gha)*ghr);gh.rotation.y=gha;granada.add(gh);
            var ghd=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.2,0.1),new THREE.MeshBasicMaterial({color:0x44AA44,transparent:true,opacity:0.3}));
            ghd.position.set(Math.cos(gha)*(ghr+1.5),0.6,Math.sin(gha)*(ghr+1.5));ghd.rotation.y=gha;granada.add(ghd);
        }
        var grTower=new THREE.Mesh(new THREE.CylinderGeometry(0.6,1.0,10,8),toon(0x556655));grTower.position.y=5;granada.add(grTower);
        // Granada spires (military comm towers)
        for(var gsi=0;gsi<8;gsi++){
            var gsa=gsi/8*Math.PI*2+0.2;var gsr=3+Math.random()*5;
            var gsh=5+Math.random()*10;
            var gs=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.2,gsh,4),toon(0x667766));
            gs.position.set(Math.cos(gsa)*gsr,gsh/2-2,Math.sin(gsa)*gsr);granada.add(gs);
        }
        // Place Granada on flat ground (left side, behind Von Braun)
        granada.position.set(-200,0,-200);
        granada.scale.set(8,8,8);
        cityGroup.add(granada);
        // Granada city doors — 4 entrances (N/S/E/W) on rim
        var _grDoorR=10.5;
        for(var gdi=0;gdi<4;gdi++){
            var gda=gdi/4*Math.PI*2;
            var gdoorG=new THREE.Group();
            var gdFrame=new THREE.Mesh(new THREE.BoxGeometry(2.5,3.5,0.4),toon(0x446644));
            gdFrame.position.y=1.75;gdoorG.add(gdFrame);
            var gdGlow=new THREE.Mesh(new THREE.BoxGeometry(1.8,2.8,0.3),new THREE.MeshBasicMaterial({color:0x44FF88,transparent:true,opacity:0.4}));
            gdGlow.position.y=1.5;gdoorG.add(gdGlow);
            gdoorG.position.set(Math.cos(gda)*_grDoorR,0.5,Math.sin(gda)*_grDoorR);
            gdoorG.rotation.y=gda+Math.PI;
            granada.add(gdoorG);
        }
        // Granada collider zone (flat)
        window._moonCities.push({cx:-200,cy:0,cz:-200,r:100,scale:8,name:{zhs:'\u683C\u62C9\u7EB3\u8FBE',zht:'\u683C\u62C9\u7D0D\u9054',ja:'\u30B0\u30E9\u30CA\u30C0',en:'Granada'},flatX:-200,flatZ:-200});
        window._moonShields.push({x:-200,y:0,z:-200,r:100,
            doors:[{a:0,w:0.3},{a:Math.PI/2,w:0.3},{a:Math.PI,w:0.3},{a:Math.PI*1.5,w:0.3}]
        }); // Granada dome
        // Visible AT Field shield domes (translucent hexagonal-look spheres)
        var _shieldMat=new THREE.MeshBasicMaterial({color:0xFF8800,transparent:true,opacity:0.04,side:THREE.DoubleSide});
        var _shieldWire=new THREE.MeshBasicMaterial({color:0xFF6600,wireframe:true,transparent:true,opacity:0.06});
        // Von Braun shield dome
        var vbShield=new THREE.Mesh(new THREE.SphereGeometry(160,24,16,0,Math.PI*2,0,Math.PI/2),_shieldMat);
        vbShield.position.set(-200,0,0);scene.add(vbShield);
        var vbWire=new THREE.Mesh(new THREE.SphereGeometry(160.5,24,16,0,Math.PI*2,0,Math.PI/2),_shieldWire);
        vbWire.position.set(-200,0,0);scene.add(vbWire);
        // Granada shield dome
        var grShield=new THREE.Mesh(new THREE.SphereGeometry(100,20,12,0,Math.PI*2,0,Math.PI/2),_shieldMat);
        grShield.position.set(-200,0,-200);scene.add(grShield);
        var grWire2=new THREE.Mesh(new THREE.SphereGeometry(100.5,20,12,0,Math.PI*2,0,Math.PI/2),_shieldWire);
        grWire2.position.set(-200,0,-200);scene.add(grWire2);
        // Store for cleanup
        window._moonShieldDomes=[vbShield,vbWire,grShield,grWire2];
        // Moon city building colliders — flat box colliders
        window._moonBldgColliders=[];
        // Von Braun central tower
        cityColliders.push({x:-200,z:0,hw:12,hd:12,h:100});
        // Von Braun ring buildings
        for(var mbi=0;mbi<12;mbi++){
            var mba=mbi/12*Math.PI*2;var mbr=70;
            var mbx=-200+Math.cos(mba)*mbr;var mbz=Math.sin(mba)*mbr;
            cityColliders.push({x:mbx,z:mbz,hw:10,hd:10,h:50});
        }
        // Granada hangars
        for(var gci=0;gci<6;gci++){
            var gca=gci/6*Math.PI*2;var gcr=45;
            var gcx=-200+Math.cos(gca)*gcr;var gcz=-200+Math.sin(gca)*gcr;
            cityColliders.push({x:gcx,z:gcz,hw:10,hd:14,h:15});
        }
        // Granada central tower
        cityColliders.push({x:-200,z:-200,hw:8,hd:8,h:70});
        // Add moon city meshes to building occlusion array
        // Collect all meshes from each city group for occlusion
        var _vbAllMeshes=[];lunarCity.traverse(function(c){if(c.isMesh)_vbAllMeshes.push(c);});
        var _grAllMeshes=[];granada.traverse(function(c){if(c.isMesh)_grAllMeshes.push(c);});
        // Von Braun: central tower area (narrow box so it only fades when directly behind)
        cityBuildingMeshes.push({meshes:_vbAllMeshes,x:-200,z:0,hw:15,hd:15,h:100});
        // Granada: central area
        cityBuildingMeshes.push({meshes:_grAllMeshes,x:-200,z:-200,hw:10,hd:10,h:70});
        // Earth in sky — semi-realistic scale (Earth radius ~3.67x Moon)
        var earthGroup=new THREE.Group();
        var _earthR=29340; // Earth radius in game units (real ratio to moon)
        var earth=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),new THREE.MeshBasicMaterial({color:0x3366CC,fog:false}));
        earthGroup.add(earth);
        for(var ei=0;ei<8;ei++){
            var ea=ei/8*Math.PI*2;
            var ep=(Math.random()-0.5)*Math.PI*0.7;
            var cont=new THREE.Mesh(new THREE.SphereGeometry(0.26+Math.random()*0.2,10,8),new THREE.MeshBasicMaterial({color:0x33AA44,fog:false}));
            cont.position.set(Math.cos(ea)*Math.cos(ep)*0.87,Math.sin(ep)*0.87,Math.sin(ea)*Math.cos(ep)*0.87);
            cont.scale.set(1,0.5,1);
            earthGroup.add(cont);
        }
        var iceCap1=new THREE.Mesh(new THREE.SphereGeometry(0.27,10,8),new THREE.MeshBasicMaterial({color:0xDDEEFF,fog:false}));
        iceCap1.position.set(0,0.93,0);earthGroup.add(iceCap1);
        var iceCap2=new THREE.Mesh(new THREE.SphereGeometry(0.2,10,8),new THREE.MeshBasicMaterial({color:0xDDEEFF,fog:false}));
        iceCap2.position.set(0,-0.93,0);earthGroup.add(iceCap2);
        var atmo=new THREE.Mesh(new THREE.SphereGeometry(1.07,32,24),new THREE.MeshBasicMaterial({color:0x6699FF,transparent:true,opacity:0.15,side:THREE.BackSide,fog:false}));
        earthGroup.add(atmo);
        var atmo2=new THREE.Mesh(new THREE.SphereGeometry(1.17,32,24),new THREE.MeshBasicMaterial({color:0x88BBFF,transparent:true,opacity:0.08,side:THREE.BackSide,fog:false}));
        earthGroup.add(atmo2);
        // Earth-Moon distance: skybox positioning (far away)
        var _earthDist=400000;
        earthGroup.position.set(_earthDist*0.6,_earthDist*0.7,-_earthDist*0.3);
        earthGroup.scale.set(_earthR,_earthR,_earthR);
        scene.add(earthGroup);
        window._moonEarth=earthGroup;

        // ---- Solar System — Sun and planets at compressed but proportional distances ----
        // Sun: radius 696,000km → 80,000 units (compressed), distance 150M km → 1,200,000 units
        var _sunSolar=new THREE.Mesh(new THREE.SphereGeometry(80000,24,16),new THREE.MeshBasicMaterial({color:0xFFEE44,fog:false}));
        _sunSolar.position.set(-800000,600000,400000);
        scene.add(_sunSolar);
        window._sunSolar=_sunSolar;
        var _sunSolarGlow=new THREE.Mesh(new THREE.SphereGeometry(100000,16,12),new THREE.MeshBasicMaterial({color:0xFFFF88,transparent:true,opacity:0.15,fog:false}));
        _sunSolarGlow.position.copy(_sunSolar.position);
        scene.add(_sunSolarGlow);
        window._sunSolarGlow=_sunSolarGlow;
        // Point light from sun direction for moon lighting
        var _solarLight=new THREE.DirectionalLight(0xFFEECC,1.0);
        _solarLight.position.copy(_sunSolar.position).normalize().multiplyScalar(100);
        scene.add(_solarLight);
        window._solarLight=_solarLight;

        // Planets (compressed distances, exaggerated sizes for visibility)
        var _planets=[
            {name:'Mercury',color:0xAA9988,r:200,dist:300000,angle:0.8},
            {name:'Venus',color:0xFFCC88,r:500,dist:450000,angle:2.1},
            // Earth is already placed above
            {name:'Mars',color:0xCC6644,r:350,dist:600000,angle:3.5},
            {name:'Jupiter',color:0xDDAA66,r:5800,dist:900000,angle:1.2},
            {name:'Saturn',color:0xDDCC88,r:4800,dist:1100000,angle:4.0},
            {name:'Uranus',color:0x88CCDD,r:2000,dist:1300000,angle:5.5},
            {name:'Neptune',color:0x4466CC,r:1900,dist:1500000,angle:0.3},
            {name:'Pluto',color:0xBBAA99,r:100,dist:1700000,angle:2.8}
        ];
        window._solarPlanets=[];
        for(var _pi=0;_pi<_planets.length;_pi++){
            var _pl=_planets[_pi];
            var _pm=new THREE.Mesh(new THREE.SphereGeometry(_pl.r,12,8),new THREE.MeshBasicMaterial({color:_pl.color,fog:false}));
            var _pa=_pl.angle;
            var _pelev=(Math.random()-0.3)*0.2; // slight orbital inclination
            _pm.position.set(
                _sunSolar.position.x+Math.cos(_pa)*_pl.dist,
                Math.sin(_pelev)*_pl.dist*0.1+_pl.dist*0.3,
                _sunSolar.position.z+Math.sin(_pa)*_pl.dist
            );
            scene.add(_pm);
            window._solarPlanets.push({mesh:_pm,data:_pl});
            // Saturn rings
            if(_pl.name==='Saturn'){
                var ring=new THREE.Mesh(new THREE.RingGeometry(_pl.r*1.3,_pl.r*2.2,32),new THREE.MeshBasicMaterial({color:0xCCBB88,transparent:true,opacity:0.5,side:THREE.DoubleSide,fog:false}));
                ring.position.copy(_pm.position);
                ring.rotation.x=Math.PI*0.35;
                scene.add(ring);
            }
        }

        // ---- Nebulae (large colorful gas clouds in deep space) ----
        window._moonNebulae=[];
        var nebColors=[0x330044,0x220033,0x440022,0x110033,0x330033,0x220044,0x441122,0x112244];
        for(var ni=0;ni<20;ni++){
            var na=Math.random()*Math.PI*2;
            var ne2=(Math.random()-0.5)*Math.PI;
            var nd=200000+Math.random()*800000;
            var nnx=Math.cos(na)*Math.cos(ne2)*nd;
            var nny=Math.sin(ne2)*nd;
            var nnz=Math.sin(na)*Math.cos(ne2)*nd;
            var ns=20000+Math.random()*60000;
            var nc=nebColors[Math.floor(Math.random()*nebColors.length)];
            var neb=new THREE.Mesh(new THREE.SphereGeometry(ns,8,6),new THREE.MeshBasicMaterial({color:nc,transparent:true,opacity:0.08+Math.random()*0.06,fog:false,side:THREE.BackSide}));
            neb.position.set(nnx,nny,nnz);
            scene.add(neb);
            window._moonNebulae.push(neb);
        }

        // ---- Twinkling stars — surround the sphere ----
        window._moonStars=[];
        var starColors=[0xFFFFFF,0xFFFFFF,0xFFFFFF,0xCCDDFF,0xAABBFF,0xFFEECC,0xFFCCDD,0xDDCCFF];
        for(var sti=0;sti<500;sti++){
            var sa=Math.random()*Math.PI*2;
            var se=(Math.random()-0.5)*Math.PI;
            var sd=MOON_CITY_SIZE*4+Math.random()*MOON_CITY_SIZE*8;
            var sx=Math.cos(sa)*Math.cos(se)*sd;
            var sy=Math.sin(se)*sd;
            var sz=Math.sin(sa)*Math.cos(se)*sd;
            var ss=8+Math.random()*32;
            var sc=starColors[Math.floor(Math.random()*starColors.length)];
            var star=new THREE.Mesh(new THREE.SphereGeometry(ss,4,3),new THREE.MeshBasicMaterial({color:sc,fog:false,transparent:true}));
            star.position.set(sx,sy,sz);
            scene.add(star);
            window._moonStars.push({mesh:star,phase:Math.random()*Math.PI*2,speed:0.5+Math.random()*3});
        }
        // Footprints — flat positioned near Apollo
        var fpMat=toon(0x666677);
        for(var fi=0;fi<15;fi++){
            var ffx=270+(Math.random()-0.5)*20;
            var ffz=280+(Math.random()-0.5)*20;
            var fp=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.05,0.8),fpMat);
            fp.position.set(ffx,0.02,ffz);
            fp.rotation.y=Math.random()*Math.PI*2;
            cityGroup.add(fp);
        }
        // Moon rocks — flat positioned (outside city zones)
        for(var ri2=0;ri2<25;ri2++){
            var rrx=(Math.random()-0.5)*_moonCityHalf*1.8;
            var rrz=(Math.random()-0.5)*_moonCityHalf*1.8;
            // Skip if inside Von Braun zone
            if(rrx<-50&&Math.abs(rrz)<120)continue;
            var rs=1+Math.random()*3;
            var rock=new THREE.Mesh(new THREE.DodecahedronGeometry(rs,0),toon(0x888899));
            rock.position.set(rrx,rs*0.4,rrz);
            rock.rotation.set(Math.random(),Math.random(),Math.random());
            cityGroup.add(rock);
        }
        // ---- Large craters with rims (battlefield terrain) ----
        var _bigCraters=[];
        for(var bci=0;bci<15;bci++){
            var bcx=30+Math.random()*320;
            var bcz=(Math.random()-0.5)*600;
            var bcr=8+Math.random()*20;
            var bcG=new THREE.Group();
            // Crater depression (dark floor)
            var bcFloor=new THREE.Mesh(new THREE.CylinderGeometry(bcr*0.8,bcr,0.6,16),toon(0x444455));
            bcFloor.position.y=-0.5;bcG.add(bcFloor);
            // Raised rim
            var bcRim=new THREE.Mesh(new THREE.TorusGeometry(bcr,bcr*0.15,6,16),toon(0x777788));
            bcRim.rotation.x=Math.PI/2;bcRim.position.y=bcr*0.08;bcG.add(bcRim);
            // Scattered ejecta rocks around rim
            for(var bri=0;bri<5;bri++){
                var bra=Math.random()*Math.PI*2;
                var brr=bcr*0.9+Math.random()*bcr*0.4;
                var brs=0.5+Math.random()*1.5;
                var brk=new THREE.Mesh(new THREE.DodecahedronGeometry(brs,0),toon(0x666677));
                brk.position.set(Math.cos(bra)*brr,brs*0.3,Math.sin(bra)*brr);
                brk.rotation.set(Math.random(),Math.random(),Math.random());
                bcG.add(brk);
            }
            bcG.position.set(bcx,0,bcz);
            cityGroup.add(bcG);
            _bigCraters.push({x:bcx,z:bcz,r:bcr});
        }
        // ---- Apollo Lunar Rover (moving) ----
        window._moonRover=null;
        var roverG=new THREE.Group();
        var rvBody=new THREE.Mesh(new THREE.BoxGeometry(3,0.4,1.5),toon(0xBBBBBB));
        rvBody.position.y=0.9;roverG.add(rvBody);
        // Fenders
        var rvFender1=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.1,1.8),toon(0xAAAAAA));
        rvFender1.position.set(-0.9,0.7,0);roverG.add(rvFender1);
        var rvFender2=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.1,1.8),toon(0xAAAAAA));
        rvFender2.position.set(0.9,0.7,0);roverG.add(rvFender2);
        // Wheels (wire mesh)
        for(var rwi=0;rwi<4;rwi++){
            var rwx=(rwi%2===0?-1:1)*1.2;
            var rwz=(rwi<2?-1:1)*0.8;
            var rwh=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.1,6,12),toon(0x555555));
            rwh.position.set(rwx,0.4,rwz);rwh.rotation.y=Math.PI/2;roverG.add(rwh);
        }
        // High-gain antenna dish
        var rvDish=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,4,0,Math.PI*2,0,Math.PI/2),toon(0xDDDDDD));
        rvDish.position.set(0,1.8,0);rvDish.rotation.x=Math.PI;roverG.add(rvDish);
        var rvAnt=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.2,4),toon(0xCCCCCC));
        rvAnt.position.set(0,1.4,0);roverG.add(rvAnt);
        // Camera/TV on front
        var rvCam=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.4),toon(0x333333));
        rvCam.position.set(1.3,1.2,0);roverG.add(rvCam);
        // Seats (2 simple frames)
        var rvSeat1=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.8),toon(0x999999));
        rvSeat1.position.set(-0.3,1.1,0);roverG.add(rvSeat1);
        var rvSeat2=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.8),toon(0x999999));
        rvSeat2.position.set(0.5,1.1,0);roverG.add(rvSeat2);
        roverG.position.set(150,0,100);
        roverG.scale.set(3,3,3);
        cityGroup.add(roverG);
        window._moonRover={group:roverG,x:150,z:100,angle:0,speed:0.15,timer:0,turnTimer:0,targetAngle:0};
        // ---- Additional US flags scattered on battlefield ----
        var _flagPositions=[[100,0,50],[200,0,-80],[320,0,150],[80,0,-150],[250,0,250]];
        for(var fli=0;fli<_flagPositions.length;fli++){
            var fp2=_flagPositions[fli];
            var flG=new THREE.Group();
            var flPole=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,5,4),toon(0xCCCCCC));
            flPole.position.y=2.5;flG.add(flPole);
            // Flag — red/white/blue
            var flFlag=new THREE.Mesh(new THREE.BoxGeometry(2.5,1.5,0.03),toon(0x2244AA));
            flFlag.position.set(1.3,4.5,0);flG.add(flFlag);
            // Red stripes
            for(var fsi=0;fsi<4;fsi++){
                var fStr=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.1,0.04),toon(0xDD2222));
                fStr.position.set(1.3,3.9+fsi*0.3,0.01);flG.add(fStr);
            }
            // White canton area
            var flCanton=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.7,0.04),toon(0xEEEEEE));
            flCanton.position.set(0.3,4.7,0.02);flG.add(flCanton);
            flG.position.set(fp2[0],fp2[1],fp2[2]);
            flG.scale.set(2,2,2);
            cityGroup.add(flG);
        }
        // ---- More footprint trails across battlefield ----
        var fpMat2=toon(0x555566);
        for(var fti=0;fti<40;fti++){
            var ftx=50+Math.random()*300;
            var ftz=(Math.random()-0.5)*400;
            var ftp=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.05,0.9),fpMat2);
            ftp.position.set(ftx,0.02,ftz);
            ftp.rotation.y=Math.random()*Math.PI*2;
            cityGroup.add(ftp);
        }
        // ---- Regolith mounds (small hills on battlefield) ----
        for(var rmi=0;rmi<20;rmi++){
            var rmx=20+Math.random()*350;
            var rmz=(Math.random()-0.5)*600;
            var rmr=2+Math.random()*5;
            var rmh=0.5+Math.random()*1.5;
            var mound=new THREE.Mesh(new THREE.SphereGeometry(rmr,8,4,0,Math.PI*2,0,Math.PI/2),toon(0x777788));
            mound.position.set(rmx,0,rmz);mound.scale.y=rmh/rmr;
            cityGroup.add(mound);
        }
        // ---- Return-to-Earth portal inside Von Braun city ----
        // Placed near the central tower, looks like a space elevator pad
        var earthPortalG=new THREE.Group();
        // Platform base
        var epBase=new THREE.Mesh(new THREE.CylinderGeometry(3,3.5,0.5,12),toon(0x4466AA));
        epBase.position.y=0.25;earthPortalG.add(epBase);
        // Glowing ring
        var epRing=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.2,8,24),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.6}));
        epRing.rotation.x=Math.PI/2;epRing.position.y=0.6;earthPortalG.add(epRing);
        // Inner portal glow (Earth colors)
        var epInner=new THREE.Mesh(new THREE.CircleGeometry(2,16),new THREE.MeshBasicMaterial({color:0x3366CC,transparent:true,opacity:0.4,side:THREE.DoubleSide}));
        epInner.rotation.x=-Math.PI/2;epInner.position.y=0.7;earthPortalG.add(epInner);
        // Holographic Earth above portal
        var epEarth=new THREE.Mesh(new THREE.SphereGeometry(1.2,16,12),new THREE.MeshBasicMaterial({color:0x3366CC,transparent:true,opacity:0.35}));
        epEarth.position.y=4;earthPortalG.add(epEarth);
        var epCont=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6),new THREE.MeshBasicMaterial({color:0x33AA44,transparent:true,opacity:0.3}));
        epCont.position.set(0.3,4.2,0.5);earthPortalG.add(epCont);
        // Arch frame
        var epArch1=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,6,6),toon(0x4466AA));
        epArch1.position.set(-2.5,3,0);earthPortalG.add(epArch1);
        var epArch2=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,6,6),toon(0x4466AA));
        epArch2.position.set(2.5,3,0);earthPortalG.add(epArch2);
        var epArchTop=new THREE.Mesh(new THREE.BoxGeometry(5.5,0.3,0.3),toon(0x4466AA));
        epArchTop.position.y=6;earthPortalG.add(epArchTop);
        // Sign: "Earth" in holographic text style
        var epSign=new THREE.Mesh(new THREE.BoxGeometry(2,0.5,0.1),new THREE.MeshBasicMaterial({color:0x44CCFF,transparent:true,opacity:0.5}));
        epSign.position.set(0,6.5,0);earthPortalG.add(epSign);
        // Orbiting particles
        for(var epi=0;epi<6;epi++){
            var epPart=new THREE.Mesh(new THREE.SphereGeometry(0.12,4,3),new THREE.MeshBasicMaterial({color:0x88CCFF,transparent:true,opacity:0.7}));
            epPart.userData.orbitPhase=epi/6*Math.PI*2;
            earthPortalG.add(epPart);
        }
        // Place inside Von Braun, near central tower (local coords, will be scaled by 8)
        earthPortalG.position.set(-200+8*5,0,8*5); // offset from VB center
        cityGroup.add(earthPortalG);
        window._earthReturnPortal={group:earthPortalG,x:-200+8*5,z:8*5,ring:epRing,inner:epInner,earth:epEarth};
        // Add to portals array for proximity detection
        portals.push({mesh:earthPortalG,ring:epRing,inner:epInner,
            name:'\uD83C\uDF0D '+L('earthReturn'),desc:L('earthReturnDesc'),
            raceIndex:-1,x:-200+8*5,z:8*5,y:0,color:0x3366CC,_hiddenType:'earthReturn',_targetStyle:-99});
        // (Moon mini-game portals removed — races are Earth-only)
        // ---- Moon city props (inside Von Braun) ----
        // Oxygen tanks
        var _vbPropsData=[
            {type:'tank',x:-200+8*3,z:8*2},{type:'tank',x:-200-8*3,z:-8*2},
            {type:'tank',x:-200+8*7,z:-8*3},{type:'tank',x:-200-8*6,z:8*4},
            {type:'crate',x:-200+8*(-2),z:8*6},{type:'crate',x:-200+8*4,z:-8*5},
            {type:'crate',x:-200-8*5,z:-8*6},{type:'crate',x:-200+8*(-8),z:8*2},
            {type:'barrel',x:-200+8*6,z:8*7},{type:'barrel',x:-200-8*4,z:8*(-3)},
            {type:'antenna',x:-200+8*(-7),z:8*(-5)},{type:'antenna',x:-200+8*8,z:8*(-7)}
        ];
        for(var vpi=0;vpi<_vbPropsData.length;vpi++){
            var vpd=_vbPropsData[vpi];
            var vpG=new THREE.Group();
            if(vpd.type==='tank'){
                // Oxygen/fuel tank
                var tk=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,2,8),toon(0xDDDDDD));
                tk.position.y=1;vpG.add(tk);
                var tkTop=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,4),toon(0xCCCCCC));
                tkTop.position.y=2;vpG.add(tkTop);
                var tkValve=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.3,4),toon(0xCC2222));
                tkValve.position.y=2.3;vpG.add(tkValve);
                vpG.position.set(vpd.x,0,vpd.z);
                cityGroup.add(vpG);
                cityProps.push({group:vpG,x:vpd.x,z:vpd.z,radius:0.8,type:'tank',grabbed:false,origY:0,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:1.8});
            } else if(vpd.type==='crate'){
                // Supply crate
                var cr=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5),toon(0x887744));
                cr.position.y=0.75;vpG.add(cr);
                var crStripe=new THREE.Mesh(new THREE.BoxGeometry(1.55,0.15,1.55),toon(0xCC8833));
                crStripe.position.y=0.75;vpG.add(crStripe);
                vpG.position.set(vpd.x,0,vpd.z);
                cityGroup.add(vpG);
                cityProps.push({group:vpG,x:vpd.x,z:vpd.z,radius:1.0,type:'crate',grabbed:false,origY:0,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:2.5});
            } else if(vpd.type==='barrel'){
                // Fuel barrel
                var br=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1.5,8),toon(0x336633));
                br.position.y=0.75;vpG.add(br);
                var brBand=new THREE.Mesh(new THREE.TorusGeometry(0.52,0.05,6,12),toon(0x888888));
                brBand.position.y=0.4;brBand.rotation.x=Math.PI/2;vpG.add(brBand);
                vpG.position.set(vpd.x,0,vpd.z);
                cityGroup.add(vpG);
                cityProps.push({group:vpG,x:vpd.x,z:vpd.z,radius:0.8,type:'barrel',grabbed:false,origY:0,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:2.0});
            } else if(vpd.type==='antenna'){
                // Communication antenna
                var anPole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,4,4),toon(0xAAAAAA));
                anPole.position.y=2;vpG.add(anPole);
                var anDish=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,4,0,Math.PI*2,0,Math.PI/2),toon(0xCCCCCC));
                anDish.position.y=4;anDish.rotation.x=Math.PI*0.7;vpG.add(anDish);
                vpG.position.set(vpd.x,0,vpd.z);
                cityGroup.add(vpG);
                cityProps.push({group:vpG,x:vpd.x,z:vpd.z,radius:0.6,type:'antenna',grabbed:false,origY:0,throwVx:0,throwVy:0,throwVz:0,throwTimer:0,weight:1.2});
            }
        }
        // ---- Mobile Suit battles in moon space ----
        window._moonGundams=[];
        window._moonBeams=[];
        window._moonMissiles=[];
        // MS units: 6 Gundam, 20 GM, 60 Zaku, 14 Dom = 100 Gundam-verse
        // Macross: 8 VF-1 Valkyrie, 1 SDF-1, 15 Zentradi pods, 6 Zentradi cruisers = 30 Macross
        var msUnits=[];
        msUnits.push({ms:'gundam',weapon:'rifle'});msUnits.push({ms:'gundam',weapon:'saber'});msUnits.push({ms:'gundam',weapon:'funnel'});msUnits.push({ms:'gundam',weapon:'rifle'});
        for(var gmi=0;gmi<12;gmi++){msUnits.push({ms:'gm',weapon:Math.random()<0.5?'rifle':Math.random()<0.5?'saber':'missile'});}
        var zakuColors=[0x336633,0x225522,0x447744,0xCC2222,0x882222,0x224488,0x335533,0x556655,0x443366,0x228844];
        for(var zki=0;zki<35;zki++){msUnits.push({ms:'zaku',weapon:Math.random()<0.35?'rifle':Math.random()<0.5?'missile':'saber',color:zakuColors[zki%zakuColors.length]});}
        for(var dmi=0;dmi<8;dmi++){msUnits.push({ms:'dom',weapon:Math.random()<0.5?'rifle':'missile'});}
        // Macross units
        for(var vfi=0;vfi<5;vfi++){msUnits.push({ms:'valkyrie',weapon:'rifle'});}
        msUnits.push({ms:'sdf1',weapon:'missile'});
        for(var zpi=0;zpi<10;zpi++){msUnits.push({ms:'zenPod',weapon:'rifle'});}
        for(var zci=0;zci<4;zci++){msUnits.push({ms:'zenCruiser',weapon:'missile'});}
        for(var gi=0;gi<msUnits.length;gi++){
            var mu=msUnits[gi];
            var gd=_buildMobileSuit(mu.ms,mu.weapon,mu.color);
            // Spawn above battlefield area (right side, x>0)
            var gAlt=30+Math.random()*60; // altitude above ground
            if(mu.ms==='sdf1')gAlt=200+Math.random()*100;
            if(mu.ms==='zenCruiser')gAlt=150+Math.random()*100;
            // Spread across entire battlefield area (all directions, avoid cities)
            var gAngle=Math.random()*Math.PI*2;
            var gDist=80+Math.random()*300;
            var gFlatX=Math.cos(gAngle)*gDist;
            var gFlatZ=Math.sin(gAngle)*gDist;
            // Avoid spawning inside city zones
            var _gInCity=false;
            if(Math.sqrt((gFlatX+200)*(gFlatX+200)+gFlatZ*gFlatZ)<170)_gInCity=true;
            if(Math.sqrt((gFlatX+200)*(gFlatX+200)+(gFlatZ+200)*(gFlatZ+200))<110)_gInCity=true;
            if(_gInCity){gFlatX=100+Math.random()*250;gFlatZ=(Math.random()-0.5)*500;}
            gd.group.position.set(gFlatX,gAlt,gFlatZ);
            gd.group.scale.set(2,2,2);
            scene.add(gd.group);
            var faction;
            if(mu.ms==='gundam'||mu.ms==='gm')faction='efsf';
            else if(mu.ms==='valkyrie'||mu.ms==='sdf1')faction='unSpacy';
            else if(mu.ms==='zenPod'||mu.ms==='zenCruiser')faction='zentradi';
            else faction='zeon';
            // Random waypoint AI state
            var wpAngle=Math.random()*Math.PI*2;
            var wpElev=(Math.random()-0.5)*Math.PI*0.6;
            var wpR=30+Math.random()*60;
            if(mu.ms==='sdf1')wpR=200+Math.random()*100;
            if(mu.ms==='zenCruiser')wpR=150+Math.random()*100;
            window._moonGundams.push({group:gd.group,type:mu.weapon,ms:mu.ms,faction:faction,
                px:gFlatX,py:gAlt,pz:gFlatZ,
                wpAngle:wpAngle,wpElev:wpElev,wpR:wpR,
                wpTimer:30+Math.floor(Math.random()*60),
                speed:mu.ms==='sdf1'?1.0:mu.ms==='zenCruiser'?1.2:1.8+Math.random()*1.8,
                phase:Math.random()*Math.PI*2,
                actionTimer:Math.floor(Math.random()*30),
                funnels:gd.funnels||null,saberMesh:gd.saberMesh||null,weapon:gd.weapon||null,
                target:null,dodgeTimer:0,dodgeDir:null,
                hp:mu.ms==='sdf1'?50:mu.ms==='zenCruiser'?30:mu.ms==='gundam'?12:mu.ms==='dom'?10:8,
                hpMax:mu.ms==='sdf1'?50:mu.ms==='zenCruiser'?30:mu.ms==='gundam'?12:mu.ms==='dom'?10:8,
                _dead:false,_respawnTimer:0,_msType:mu.ms,_weaponType:mu.weapon,_color:mu.color
            });
        }
        // Pair up saber units for duels (EFSF vs Zeon)
        var efsfSabers=window._moonGundams.filter(function(g2){return g2.type==='saber'&&(g2.faction==='efsf');});
        var zeonSabers=window._moonGundams.filter(function(g2){return g2.type==='saber'&&g2.faction==='zeon';});
        var pairCount=Math.min(efsfSabers.length,zeonSabers.length);
        for(var sp=0;sp<pairCount;sp++){
            efsfSabers[sp].duelPartner=zeonSabers[sp];
            zeonSabers[sp].duelPartner=efsfSabers[sp];
        }
    }
}

function _buildMobileSuit(msType,weaponType,customColor){
    var g=new THREE.Group();
    var gray=toon(0x666677);var darkGray=toon(0x333344);
    var glowMat=new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.6});
    var result={group:g};
    if(msType==='gundam'){
        var w=toon(0xEEEEF0),b=toon(0x2244AA),r=toon(0xCC2222),y=toon(0xDDAA00);
        g.add(new THREE.Mesh(new THREE.BoxGeometry(1.8,2.0,1.0),w));
        var v1=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.3,0.15),r);v1.position.set(-0.45,0.5,0.55);g.add(v1);
        var v2=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.3,0.15),r);v2.position.set(0.45,0.5,0.55);g.add(v2);
        var wa2=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.4,0.8),y);wa2.position.y=-1.2;g.add(wa2);
        var hd=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.8,0.8),w);hd.position.y=1.5;g.add(hd);
        var f1=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.7,4),y);f1.position.set(-0.3,2.1,0.1);f1.rotation.z=0.5;g.add(f1);
        var f2=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.7,4),y);f2.position.set(0.3,2.1,0.1);f2.rotation.z=-0.5;g.add(f2);
        var gvi=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.2,0.15),new THREE.MeshBasicMaterial({color:0x44FF88}));gvi.position.set(0,1.55,0.45);g.add(gvi);
        var ch=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.15,0.2),r);ch.position.set(0,1.2,0.35);g.add(ch);
        var s1=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.7),b);s1.position.set(-1.5,0.6,0);g.add(s1);
        var s2=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.7),b);s2.position.set(1.5,0.6,0);g.add(s2);
        [[-1.5,w],[1.5,w]].forEach(function(p){var a=new THREE.Mesh(new THREE.BoxGeometry(0.4,1.4,0.4),p[1]);a.position.set(p[0],-0.4,0);g.add(a);var h=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.3,0.35),gray);h.position.set(p[0],-1.2,0);g.add(h);});
        [[-0.45,w,b,r],[0.45,w,b,r]].forEach(function(p){var u=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.0,0.5),p[1]);u.position.set(p[0],-1.9,0);g.add(u);var l=new THREE.Mesh(new THREE.BoxGeometry(0.55,1.2,0.55),p[2]);l.position.set(p[0],-3.1,0);g.add(l);var ft=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.3,0.8),p[3]);ft.position.set(p[0],-3.85,0.1);g.add(ft);});
        var bp=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.4,0.6),gray);bp.position.set(0,0.2,-0.8);g.add(bp);
        [[-0.35],[0.35]].forEach(function(p){var t=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,0.5,6),darkGray);t.position.set(p[0],-0.3,-1.1);g.add(t);var gl=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.8,6),glowMat);gl.position.set(p[0],-0.9,-1.1);gl.rotation.x=Math.PI;g.add(gl);});
        var sh=new THREE.Group();sh.add(new THREE.Mesh(new THREE.BoxGeometry(0.15,2.0,1.2),w));var sht=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.6,1.0),r);sht.position.y=0.8;sh.add(sht);var shc=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.15,0.8),y);shc.position.y=0.2;sh.add(shc);sh.position.set(-2.0,-0.3,0.3);g.add(sh);
    } else if(msType==='gm'){
        var bg=toon(0xCCBB99),r2=toon(0xCC3333),dkBg=toon(0xAA9977);
        g.add(new THREE.Mesh(new THREE.BoxGeometry(1.7,1.9,0.9),bg));
        var gwa=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.4,0.7),dkBg);gwa.position.y=-1.15;g.add(gwa);
        var ghd=new THREE.Mesh(new THREE.BoxGeometry(0.85,0.75,0.75),bg);ghd.position.y=1.4;g.add(ghd);
        var gmvi=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.2,0.15),new THREE.MeshBasicMaterial({color:0xFF4444}));gmvi.position.set(0,1.45,0.42);g.add(gmvi);
        var gs1=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.6),r2);gs1.position.set(-1.4,0.5,0);g.add(gs1);
        var gs2=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.6),r2);gs2.position.set(1.4,0.5,0);g.add(gs2);
        [[-1.4,bg],[1.4,bg]].forEach(function(p){var a=new THREE.Mesh(new THREE.BoxGeometry(0.38,1.3,0.38),p[1]);a.position.set(p[0],-0.4,0);g.add(a);var h=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.28,0.32),gray);h.position.set(p[0],-1.15,0);g.add(h);});
        [[-0.42,bg,dkBg],[0.42,bg,dkBg]].forEach(function(p){var u=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.95,0.48),p[1]);u.position.set(p[0],-1.8,0);g.add(u);var l=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.1,0.5),p[2]);l.position.set(p[0],-2.95,0);g.add(l);var ft=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.28,0.7),p[2]);ft.position.set(p[0],-3.65,0.1);g.add(ft);});
        var gbp=new THREE.Mesh(new THREE.BoxGeometry(1.0,1.2,0.5),gray);gbp.position.set(0,0.1,-0.7);g.add(gbp);
        [[-0.3],[0.3]].forEach(function(p){var gt=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.7,6),glowMat);gt.position.set(p[0],-0.7,-0.7);gt.rotation.x=Math.PI;g.add(gt);});
        var gsh=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.6,1.0),r2);gsh.position.set(-1.9,-0.2,0.3);g.add(gsh);
    } else if(msType==='zaku'){
        var zc=toon(customColor||0x336633);var zdk=toon(0x224422);
        g.add(new THREE.Mesh(new THREE.BoxGeometry(1.7,1.9,0.9),zc));
        var zwa=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.4,0.7),zdk);zwa.position.y=-1.15;g.add(zwa);
        var zhd=new THREE.Mesh(new THREE.SphereGeometry(0.55,8,6),zc);zhd.position.y=1.5;g.add(zhd);
        var zeye=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),new THREE.MeshBasicMaterial({color:0xFF44AA}));zeye.position.set(0,1.5,0.5);g.add(zeye);
        var zt1=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.8,6),gray);zt1.position.set(0.3,1.2,0.3);zt1.rotation.z=0.5;g.add(zt1);
        var zt2=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.8,6),gray);zt2.position.set(-0.3,1.2,0.3);zt2.rotation.z=-0.5;g.add(zt2);
        var zs1=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.6),zc);zs1.position.set(-1.4,0.5,0);g.add(zs1);
        var zs2=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.7,0.8),zc);zs2.position.set(1.4,0.6,0);g.add(zs2);
        var zspk=new THREE.Mesh(new THREE.ConeGeometry(0.15,0.6,6),gray);zspk.position.set(1.4,1.1,0);g.add(zspk);
        [[-1.4,zc],[1.4,zc]].forEach(function(p){var a=new THREE.Mesh(new THREE.BoxGeometry(0.38,1.3,0.38),p[1]);a.position.set(p[0],-0.4,0);g.add(a);var h=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.28,0.32),gray);h.position.set(p[0],-1.15,0);g.add(h);});
        [[-0.42,zc,zdk],[0.42,zc,zdk]].forEach(function(p){var u=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.95,0.48),p[1]);u.position.set(p[0],-1.8,0);g.add(u);var l=new THREE.Mesh(new THREE.BoxGeometry(0.52,1.1,0.52),p[2]);l.position.set(p[0],-2.95,0);g.add(l);var ft=new THREE.Mesh(new THREE.BoxGeometry(0.52,0.28,0.7),p[2]);ft.position.set(p[0],-3.65,0.1);g.add(ft);});
        var zbp=new THREE.Mesh(new THREE.BoxGeometry(0.9,1.0,0.5),gray);zbp.position.set(0,0.1,-0.7);g.add(zbp);
        var zgl=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.7,6),glowMat);zgl.position.set(0,-0.6,-0.7);zgl.rotation.x=Math.PI;g.add(zgl);
        var zsh=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,0.12,8),zc);zsh.rotation.z=Math.PI/2;zsh.position.set(-1.9,-0.2,0.3);g.add(zsh);
    } else if(msType==='dom'){
        var dc2=toon(0x332244);var dlc=toon(0x443355);var dblk=toon(0x1A1A2A);
        g.add(new THREE.Mesh(new THREE.BoxGeometry(2.0,2.0,1.1),dc2));
        var dwa=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.4,0.9),dblk);dwa.position.y=-1.2;g.add(dwa);
        var dhd=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.7,0.7),dc2);dhd.position.y=1.5;g.add(dhd);
        var dvi=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.15,0.15),new THREE.MeshBasicMaterial({color:0xFF4444}));dvi.position.set(0,1.55,0.4);g.add(dvi);
        var ds1=new THREE.Mesh(new THREE.SphereGeometry(0.5,6,5),dlc);ds1.position.set(-1.5,0.6,0);g.add(ds1);
        var ds2=new THREE.Mesh(new THREE.SphereGeometry(0.5,6,5),dlc);ds2.position.set(1.5,0.6,0);g.add(ds2);
        var da1=new THREE.Mesh(new THREE.BoxGeometry(0.42,1.3,0.42),dc2);da1.position.set(-1.5,-0.4,0);g.add(da1);
        var da2=new THREE.Mesh(new THREE.BoxGeometry(0.42,1.3,0.42),dc2);da2.position.set(1.5,-0.4,0);g.add(da2);
        var dsk=new THREE.Mesh(new THREE.CylinderGeometry(0.8,1.4,1.8,8),dblk);dsk.position.y=-2.3;g.add(dsk);
        var dgl=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.3,0.3,8),new THREE.MeshBasicMaterial({color:0x6644FF,transparent:true,opacity:0.4}));dgl.position.y=-3.3;g.add(dgl);
        var dbp=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.2,0.5),gray);dbp.position.set(0,0.2,-0.8);g.add(dbp);
    } else if(msType==='valkyrie'){
        return _buildValkyrie();
    } else if(msType==='sdf1'){
        return _buildSDF1();
    } else if(msType==='zenPod'){
        return _buildZenPod();
    } else if(msType==='zenCruiser'){
        return _buildZenCruiser();
    }
    // Weapons (shared across all MS types)
    if(weaponType==='rifle'){
        var rf=new THREE.Group();var brl=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,2.5,6),gray);brl.rotation.x=Math.PI/2;brl.position.z=1.0;rf.add(brl);var rfgrp=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.4,0.3),darkGray);rfgrp.position.set(0,-0.15,0);rf.add(rfgrp);rf.position.set(1.5,-1.0,0.5);g.add(rf);result.weapon=rf;
    } else if(weaponType==='saber'){
        var sb=new THREE.Group();sb.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.5,6),gray));
        var bld=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.02,2.5,6),new THREE.MeshBasicMaterial({color:msType==='zaku'||msType==='dom'?0xFF4466:0xFF88CC,transparent:true,opacity:0.8}));bld.position.y=1.5;sb.add(bld);
        sb.position.set(1.5,-0.5,0.8);sb.rotation.x=-0.3;g.add(sb);result.saberMesh=sb;
    } else if(weaponType==='funnel'){
        var funnels=[];
        for(var fi2=0;fi2<6;fi2++){var fnG=new THREE.Group();var fnBody=new THREE.Mesh(new THREE.ConeGeometry(0.35,0.9,4),toon(0x8866AA));fnG.add(fnBody);var fnGlow=new THREE.Mesh(new THREE.SphereGeometry(0.2,4,3),new THREE.MeshBasicMaterial({color:0xFF44FF,transparent:true,opacity:0.5}));fnGlow.position.y=-0.5;fnG.add(fnGlow);var fa2=fi2*Math.PI*2/6;fnG.position.set(Math.cos(fa2)*3,Math.sin(fa2)*2,Math.sin(fa2)*3);g.add(fnG);funnels.push({mesh:fnG,angle:fa2,dist:3+Math.random()});}
        result.funnels=funnels;
    } else if(weaponType==='missile'){
        [[-1.5],[1.5]].forEach(function(p){var pd=new THREE.Group();for(var mi=0;mi<3;mi++){var tb=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.8,6),darkGray);tb.position.set(0,0,mi*0.25-0.25);tb.rotation.x=Math.PI/2;pd.add(tb);}pd.position.set(p[0],1.1,0);g.add(pd);});
    }
    g.scale.set(0.4,0.4,0.4); // realistic proportions, visible at moon scale
    if(msType==='sdf1')g.scale.set(0.8,0.8,0.8);
    if(msType==='zenCruiser')g.scale.set(0.3,0.3,0.3);
    return result;
}
// ---- Macross units ----
function _buildValkyrie(){
    var g=new THREE.Group();
    var w=toon(0xEEEEEE),r=toon(0xCC2222),b=toon(0x2244AA),dk=toon(0x444455);
    // Fuselage
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.8,0.5,3.5),w));
    // Nose cone
    var nose=new THREE.Mesh(new THREE.ConeGeometry(0.35,1.5,6),w);nose.rotation.x=Math.PI/2;nose.position.z=2.5;g.add(nose);
    // Canopy
    var canopy=new THREE.Mesh(new THREE.SphereGeometry(0.25,6,4,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.6}));
    canopy.position.set(0,0.35,1.2);g.add(canopy);
    // Wings (swept)
    var wingL=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.08,1.2),w);wingL.position.set(-1.5,0,-0.3);wingL.rotation.y=0.15;g.add(wingL);
    var wingR=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.08,1.2),w);wingR.position.set(1.5,0,-0.3);wingR.rotation.y=-0.15;g.add(wingR);
    // Tail fins
    var tailV=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.8,0.6),b);tailV.position.set(0,0.4,-1.5);g.add(tailV);
    var tailL=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.06,0.5),w);tailL.position.set(-0.5,0,-1.5);g.add(tailL);
    var tailR=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.06,0.5),w);tailR.position.set(0.5,0,-1.5);g.add(tailR);
    // Engines
    var eng1=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,1.0,6),dk);eng1.rotation.x=Math.PI/2;eng1.position.set(-0.4,-0.15,-1.8);g.add(eng1);
    var eng2=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,1.0,6),dk);eng2.rotation.x=Math.PI/2;eng2.position.set(0.4,-0.15,-1.8);g.add(eng2);
    // Engine glow
    var gl1=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.6,6),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.6}));gl1.rotation.x=-Math.PI/2;gl1.position.set(-0.4,-0.15,-2.4);g.add(gl1);
    var gl2=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.6,6),new THREE.MeshBasicMaterial({color:0x44AAFF,transparent:true,opacity:0.6}));gl2.rotation.x=-Math.PI/2;gl2.position.set(0.4,-0.15,-2.4);g.add(gl2);
    // Red stripes
    var stripe=new THREE.Mesh(new THREE.BoxGeometry(0.82,0.06,0.4),r);stripe.position.set(0,0.28,0.5);g.add(stripe);
    g.scale.set(0.7,0.7,0.7);
    return {group:g};
}
function _buildSDF1(){
    var g=new THREE.Group();
    var w=toon(0xCCCCDD),dk=toon(0x555566),r=toon(0xCC2222);
    // Main body (long hull)
    g.add(new THREE.Mesh(new THREE.BoxGeometry(3,3,18),w));
    // Bridge tower
    var bridge=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.5,2),dk);bridge.position.set(0,2.5,4);g.add(bridge);
    // Arm booms (Daedalus/Prometheus)
    var armL=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,8),w);armL.position.set(-3.5,0,2);g.add(armL);
    var armR=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,8),w);armR.position.set(3.5,0,2);g.add(armR);
    // Carrier decks at arm ends
    var deckL=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.5,4),dk);deckL.position.set(-3.5,0.5,6.5);g.add(deckL);
    var deckR=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.5,4),dk);deckR.position.set(3.5,0.5,6.5);g.add(deckR);
    // Main cannon (bow)
    var cannon=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.8,6,8),r);cannon.rotation.x=Math.PI/2;cannon.position.set(0,0,12);g.add(cannon);
    // Engine block
    var eng=new THREE.Mesh(new THREE.BoxGeometry(4,3,3),dk);eng.position.set(0,0,-9);g.add(eng);
    // Engine glow
    for(var ei=0;ei<4;ei++){var egl=new THREE.Mesh(new THREE.ConeGeometry(0.6,2,6),new THREE.MeshBasicMaterial({color:0x44CCFF,transparent:true,opacity:0.5}));egl.rotation.x=-Math.PI/2;egl.position.set(-1.2+ei*0.8,0,-11);g.add(egl);}
    // Antenna
    var ant=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,4,4),w);ant.position.set(0,4.5,4);g.add(ant);
    g.scale.set(0.8,0.8,0.8);
    return {group:g};
}
function _buildZenPod(){
    var g=new THREE.Group();
    var grn=toon(0x446644),dk=toon(0x334433);
    // Body (egg-shaped)
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),grn));
    // Legs
    var leg1=new THREE.Mesh(new THREE.BoxGeometry(0.2,1.5,0.2),dk);leg1.position.set(-0.5,-1.3,0);leg1.rotation.z=0.2;g.add(leg1);
    var leg2=new THREE.Mesh(new THREE.BoxGeometry(0.2,1.5,0.2),dk);leg2.position.set(0.5,-1.3,0);leg2.rotation.z=-0.2;g.add(leg2);
    // Eye
    var eye=new THREE.Mesh(new THREE.SphereGeometry(0.15,6,4),new THREE.MeshBasicMaterial({color:0xFF4444}));eye.position.set(0,0.2,0.75);g.add(eye);
    // Gun arm
    var gun=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1.2,6),dk);gun.rotation.x=Math.PI/2;gun.position.set(0.7,0,0.5);g.add(gun);
    g.scale.set(0.5,0.5,0.5);
    return {group:g};
}
function _buildZenCruiser(){
    var g=new THREE.Group();
    var grn=toon(0x335533),dk=toon(0x223322),r=toon(0x884422);
    // Hull (elongated)
    g.add(new THREE.Mesh(new THREE.BoxGeometry(2,1.5,10),grn));
    // Bow
    var bow=new THREE.Mesh(new THREE.ConeGeometry(1.0,3,6),grn);bow.rotation.x=Math.PI/2;bow.position.z=6.5;g.add(bow);
    // Engine section
    var eng=new THREE.Mesh(new THREE.BoxGeometry(2.5,2,3),dk);eng.position.z=-5.5;g.add(eng);
    // Turrets
    for(var ti=0;ti<3;ti++){var turret=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.5,6),r);turret.position.set(0,1,ti*3-2);g.add(turret);}
    // Engine glow
    var egl=new THREE.Mesh(new THREE.ConeGeometry(0.8,2,6),new THREE.MeshBasicMaterial({color:0x44FF44,transparent:true,opacity:0.4}));egl.rotation.x=-Math.PI/2;egl.position.z=-7.5;g.add(egl);
    g.scale.set(0.3,0.3,0.3);
    return {group:g};
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
    if(currentCityStyle===5) return; // No race portals on moon
    RACES.forEach((race,i)=>{
        const g = new THREE.Group();
        var portalX=race.x, portalY=0, portalZ=race.z;
        g.position.set(portalX,portalY,portalZ);

        // Moon-style portals: silver/blue tones
        var pColor=race.color;
        var baseColor=0x888888;
        if(currentCityStyle===5){
            pColor=[0xAABBDD,0x8899CC,0xCCCCEE,0x99AADD,0x7788BB,0xBBCCEE,0x6677AA,0xAABBCC,0x8899BB,0xCCDDFF,0x7788CC,0x99AACC][i%12];
            baseColor=0x666688;
        }

        // Portal ring
        const ring = new THREE.Mesh(new THREE.TorusGeometry(2, 0.3, 8, 24), toon(pColor, {emissive:pColor, emissiveIntensity:0.3}));
        ring.position.y = 2.5; ring.castShadow = true;
        g.add(ring);

        // Outer glow ring
        var glowRing=new THREE.Mesh(new THREE.TorusGeometry(2.2,0.15,6,24),new THREE.MeshBasicMaterial({color:pColor,transparent:true,opacity:0.3}));
        glowRing.position.y=2.5;g.add(glowRing);

        // Swirling inner
        const inner = new THREE.Mesh(new THREE.CircleGeometry(1.7, 20), toon(pColor, {transparent:true, opacity:0.4, side:THREE.DoubleSide, emissive:pColor, emissiveIntensity:0.5}));
        inner.position.y = 2.5;
        g.add(inner);

        // Base platform
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.8, 0.4, 16), toon(baseColor));
        base.position.y = 0.2; base.receiveShadow = true;
        g.add(base);

        // Floating particles (small spheres)
        for(let p=0;p<8;p++){
            var partColor=currentCityStyle===5?pColor:race.color;
            const particle = new THREE.Mesh(new THREE.SphereGeometry(0.12,4,4), toon(partColor, {emissive:partColor, emissiveIntensity:0.6}));
            particle.position.set(Math.cos(p)*1.8, 2.5+Math.sin(p*2)*0.8, Math.sin(p)*1.8);
            particle.userData.orbitPhase = p;
            g.add(particle);
        }

        cityGroup.add(g);
        portals.push({mesh:g, ring, inner, name:race.name, desc:race.desc, raceIndex:i, x:portalX, z:portalZ, y:portalY, color:race.color});

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
    var coinCount=currentCityStyle===5?200:90;
    for(let i=0;i<coinCount;i++){
        var coinSpread=currentCityStyle===5?MOON_CITY_SIZE*0.9:CITY_SIZE*0.9;
        const cx=(Math.random()-0.5)*coinSpread*2, cz=(Math.random()-0.5)*coinSpread*2;
        let skip=false;
        if(currentCityStyle!==5){
            for(const c of cityColliders) if(Math.abs(cx-c.x)<c.hw+1&&Math.abs(cz-c.z)<c.hd+1) skip=true;
            if(Math.sqrt(cx*cx+cz*cz)<7) skip=true;
        }
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
    // No ground warp pipes on moon (only reachable from cloud world)
    if(currentCityStyle===5)return;
    var pipeMat=new THREE.MeshPhongMaterial({color:0x44DD44,transparent:true,opacity:0.45,side:THREE.DoubleSide});
    var rimMat=toon(0x33BB33,{emissive:0x22AA22,emissiveIntensity:0.2});
    // Build pipe targets: ground pipes go to cities 0-4 only (not moon=5)
    var targets=[];
    for(var ti=0;ti<CITY_STYLES.length;ti++){
        if(ti===currentCityStyle)continue;
        if(ti===5)continue; // Moon city only reachable from cloud world
        targets.push(ti);
    }
    // Place up to 4 pipes at edges
    var positions=[
        {x:0,z:-65},{x:65,z:0},{x:0,z:65},{x:-65,z:0}
    ];
    var pipeColors=[0x44DD44,0x44CCFF,0xFF8844,0xFF44DD,0xFFDD44,0xCCCCFF];
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
    // Remove scene-added coins (cloud world coins)
    for(var ci=0;ci<cityCoins.length;ci++){if(cityCoins[ci].inScene)scene.remove(cityCoins[ci].mesh);}
    cityCoins.length=0;
    cityProps.length=0;
    warpPipeMeshes.length=0;
    window._fountainParticles=null;
    window._fountainSplashParticles=null;
    window._fountainPoolWater=null;
    window._fountainInnerWater=null;
    // Remove city NPCs
    for(var i=0;i<cityNPCs.length;i++){_removeStunStars(cityNPCs[i]);scene.remove(cityNPCs[i].mesh);}
    cityNPCs.length=0;
    // Remove from allEggs
    for(var j=allEggs.length-1;j>=0;j--){if(allEggs[j].cityNPC){scene.remove(allEggs[j].mesh);allEggs.splice(j,1);}}
    // Remove clouds
    for(var k=0;k<cityCloudPlatforms.length;k++){scene.remove(cityCloudPlatforms[k].group);}
    cityCloudPlatforms.length=0;
    // Remove cloud world moon pipe
    if(_cloudWorldPipe){scene.remove(_cloudWorldPipe.group);_cloudWorldPipe=null;}
    // Remove moon earth
    if(window._moonEarth){scene.remove(window._moonEarth);window._moonEarth=null;}
    // Remove moon stars
    if(window._moonStars){for(var si=0;si<window._moonStars.length;si++){scene.remove(window._moonStars[si].mesh);}window._moonStars=null;}
    // Remove moon nebulae
    if(window._moonNebulae){for(var ni=0;ni<window._moonNebulae.length;ni++){scene.remove(window._moonNebulae[ni]);}window._moonNebulae=null;}
    // Remove moon Gundams
    if(window._moonGundams){for(var gi=0;gi<window._moonGundams.length;gi++){scene.remove(window._moonGundams[gi].group);}window._moonGundams=null;}
    if(window._moonBeams){for(var bi=0;bi<window._moonBeams.length;bi++){scene.remove(window._moonBeams[bi].mesh);}window._moonBeams=null;}
    if(window._moonMissiles){for(var mmi=0;mmi<window._moonMissiles.length;mmi++){scene.remove(window._moonMissiles[mmi].group);}window._moonMissiles=null;}
    window._moonShields=null;
    // Remove shield dome visual meshes from scene
    if(window._moonShieldDomes){for(var _sdi=0;_sdi<window._moonShieldDomes.length;_sdi++){scene.remove(window._moonShieldDomes[_sdi]);}window._moonShieldDomes=null;}
    window._moonCities=null;
    window._moonBldgColliders=null;
    window._moonRover=null;
    window._earthReturnPortal=null;
    // Remove solar system objects
    if(window._solarPlanets){for(var spi=0;spi<window._solarPlanets.length;spi++){scene.remove(window._solarPlanets[spi].mesh);}window._solarPlanets=null;}
    if(window._sunSolar){scene.remove(window._sunSolar);window._sunSolar=null;}
    if(window._sunSolarGlow){scene.remove(window._sunSolarGlow);window._sunSolarGlow=null;}
    if(window._solarLight){scene.remove(window._solarLight);window._solarLight=null;}
    // Remove Tower of Babel
    if(_babylonTower){scene.remove(_babylonTower.group);_babylonTower=null;}
    _babylonTriggered=false;_babylonRising=false;_babylonRiseY=-52;_earthquakeTimer=0;
    _moonPipeDismissed=false;_moonPipePromptOpen=false;
}

function applyCityTheme(){
    var st=CITY_STYLES[currentCityStyle];
    // Sky color
    scene.background=new THREE.Color(st.sky);
    // Fog
    if(st.fog){scene.fog=new THREE.Fog(st.fog,60,180);}
    else{scene.fog=null;}
    // Sun visibility — only in ground cities, not on moon
    var isMoon=(currentCityStyle===5);
    _sunMesh.visible=!isMoon;
    _sunGlow.visible=!isMoon;
    sun.visible=!isMoon;
    // Follow player with shadow camera
    if(!isMoon){
        sun.shadow.camera.far=300;
        sun.intensity=2.0;
    }
    // Update HUD
    document.getElementById('city-name-hud').textContent=st.name;
}

// ---- Pipe travel animation state ----
var _pipeTraveling=false, _pipeTimer=0, _pipeDuration=180, _pipeArrivalCooldown=0; // 3 seconds at 60fps
var _pipeStartX=0, _pipeStartZ=0, _pipeEndX=0, _pipeEndZ=0;
var _pipeTubeGroup=null, _pipeTargetStyle=0;
var _pipeMidX=0, _pipeMidZ=0;
var _pipeStartY=3; // starting Y height for pipe travel

function startPipeTravel(fromX,fromZ,targetStyle,fromY){
    _pipeTraveling=true;_pipeTimer=0;_pipeTargetStyle=targetStyle;
    _pipeStartX=fromX;_pipeStartZ=fromZ;
    _pipeStartY=(fromY!==undefined)?fromY:3;
    camera.up.set(0,1,0); // reset camera up for pipe travel
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
    var pipeColors=[0x44DD44,0x44CCFF,0xFF8844,0xFF44DD,0xFFDD44,0xCCCCFF];
    var pColor=pipeColors[targetStyle]||tubeColor;
    var isMoonTravel=(targetStyle===5);
    if(isMoonTravel)pColor=0x6644CC;
    var tubeMat=new THREE.MeshPhongMaterial({color:pColor,transparent:true,opacity:isMoonTravel?0.15:0.25,side:THREE.DoubleSide});
    for(var i=0;i<steps;i++){
        var t=i/steps;
        // Quadratic bezier: start → mid (far away) → end (center)
        var u=1-t;
        var px=u*u*fromX+2*u*t*midX+t*t*_pipeEndX;
        var pz=u*u*fromZ+2*u*t*midZ+t*t*_pipeEndZ;
        var py=_pipeStartY+Math.sin(t*Math.PI)*60; // high arc — 60 units up
        var seg=new THREE.Mesh(new THREE.CylinderGeometry(3,3,3,10,1,true),tubeMat);
        seg.position.set(px,py,pz);
        if(i<steps-1){
            var t2=(i+1)/steps;var u2=1-t2;
            var nx=u2*u2*fromX+2*u2*t2*midX+t2*t2*_pipeEndX;
            var nz=u2*u2*fromZ+2*u2*t2*midZ+t2*t2*_pipeEndZ;
            var ny=_pipeStartY+Math.sin(t2*Math.PI)*60;
            seg.lookAt(nx,ny,nz);seg.rotateX(Math.PI/2);
        }
        _pipeTubeGroup.add(seg);
        if(i%5===0){
            var ringColor=isMoonTravel?0x8866DD:pColor;
            var ring=new THREE.Mesh(new THREE.TorusGeometry(3,0.2,8,16),new THREE.MeshBasicMaterial({color:ringColor,transparent:true,opacity:isMoonTravel?0.5:0.4}));
            ring.position.set(px,py,pz);
            if(i<steps-1){
                var t3=(i+1)/steps;var u3=1-t3;
                ring.lookAt(u3*u3*fromX+2*u3*t3*midX+t3*t3*_pipeEndX,_pipeStartY+Math.sin(t3*Math.PI)*60,u3*u3*fromZ+2*u3*t3*midZ+t3*t3*_pipeEndZ);
            }
            _pipeTubeGroup.add(ring);
        }
        // Moon travel: stars and nebula particles inside the tunnel
        if(isMoonTravel&&i%2===0){
            var starColors2=[0xFFFFFF,0xCCDDFF,0xFFCCDD,0xDDCCFF,0xAABBFF,0xFFEECC];
            for(var si=0;si<3;si++){
                var sa=Math.random()*Math.PI*2;
                var sr=0.5+Math.random()*2.5;
                var ssc=starColors2[Math.floor(Math.random()*starColors2.length)];
                var sStar=new THREE.Mesh(new THREE.SphereGeometry(0.08+Math.random()*0.15,4,3),new THREE.MeshBasicMaterial({color:ssc,transparent:true,opacity:0.7+Math.random()*0.3}));
                sStar.position.set(px+Math.cos(sa)*sr,py+Math.sin(sa)*sr,pz+(Math.random()-0.5)*2);
                _pipeTubeGroup.add(sStar);
            }
            // Nebula wisps
            if(i%6===0){
                var nebC=[0x330055,0x440033,0x220044,0x110033][Math.floor(Math.random()*4)];
                var neb=new THREE.Mesh(new THREE.SphereGeometry(2+Math.random()*2,6,4),new THREE.MeshBasicMaterial({color:nebC,transparent:true,opacity:0.15+Math.random()*0.1,side:THREE.BackSide}));
                neb.position.set(px+(Math.random()-0.5)*4,py+(Math.random()-0.5)*3,pz+(Math.random()-0.5)*4);
                _pipeTubeGroup.add(neb);
            }
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
    var py=_pipeStartY+Math.sin(st*Math.PI)*60;
    playerEgg.mesh.position.set(px,py,pz);
    playerEgg.vx=0;playerEgg.vy=0;playerEgg.vz=0;
    playerEgg.mesh.rotation.y+=0.15;
    // Camera follows from behind and above
    var camDist=15;
    var lookAhead=Math.min(st+0.05,1);
    var lu=1-lookAhead;
    var lx=lu*lu*_pipeStartX+2*lu*lookAhead*_pipeMidX+lookAhead*lookAhead*_pipeEndX;
    var lz=lu*lu*_pipeStartZ+2*lu*lookAhead*_pipeMidZ+lookAhead*lookAhead*_pipeEndZ;
    var ly=_pipeStartY+Math.sin(lookAhead*Math.PI)*60;
    var cdx=px-lx,cdz=pz-lz;
    var cl=Math.sqrt(cdx*cdx+cdz*cdz)||1;
    camera.position.set(px+cdx/cl*camDist,py+6,pz+cdz/cl*camDist);
    camera.lookAt(px,py,pz);
    // At 40% — rebuild city (while player is high up and can't see ground)
    if(_pipeTimer===Math.floor(_pipeDuration*0.4)){
        _prevCityStyle=currentCityStyle;
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
        if(currentCityStyle===5){
            // Moon flat: spawn inside Von Braun city
            playerEgg.mesh.position.set(-200,3,0);
            playerEgg.vy=0;playerEgg.vx=0;playerEgg.vz=0;
            playerEgg.onGround=false;
            camera.position.set(-200,12,19);camera.lookAt(-200,0,0);
            camera.up.set(0,1,0);
        } else {
            playerEgg.mesh.position.set(0,3,0);
            playerEgg.vy=0;playerEgg.vx=0;playerEgg.vz=0;
            playerEgg.onGround=false;
            camera.position.set(0,12,19);camera.lookAt(0,0,5);
            camera.up.set(0,1,0);
        }
        for(var i=0;i<warpPipeMeshes.length;i++)warpPipeMeshes[i]._cooldown=true;
        // SOTN area name reveal after pipe travel
        _showCityAreaName(currentCityStyle);
    }
}

function switchCity(targetStyle){
    if(targetStyle===currentCityStyle)return;
    _prevCityStyle=currentCityStyle;
    currentCityStyle=targetStyle;
    _cameraZoom=1.0; // reset zoom on city switch
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
    if(currentCityStyle===5){
        // Moon flat: spawn in battlefield area
        playerEgg.mesh.position.set(50,0.5,0);
        camera.position.set(50,12,19);camera.lookAt(50,0,0);
        camera.up.set(0,1,0);
    } else {
        camera.position.set(0,12,19);camera.lookAt(0,0,5);
        camera.up.set(0,1,0);
    }
    // SOTN area name reveal
    _showCityAreaName(currentCityStyle);
}

// ---- NPC eggs wandering city ----
function spawnCityNPCs() {
    var npcCount=currentCityStyle===5?24:12;
    for(let i=0;i<npcCount;i++){
        var nx2,nz2,spawnY=0;
        if(currentCityStyle===5){
            // Moon: half NPCs inside Von Braun city, half on battlefield
            if(i<12){
                // Inside Von Braun (local coords scaled by 8, center at -200,0)
                var nAngle=Math.random()*Math.PI*2;
                var nRad=Math.random()*120; // within shield radius 160
                nx2=-200+Math.cos(nAngle)*nRad;
                nz2=Math.sin(nAngle)*nRad;
            } else {
                // Battlefield side
                nx2=30+Math.random()*300;
                nz2=(Math.random()-0.5)*400;
            }
        } else {
            nx2=(Math.random()-0.5)*50;nz2=(Math.random()-0.5)*50;
        }
        const col=AI_COLORS[i%AI_COLORS.length];
        const npc=createEgg(nx2,nz2,col,AI_COLORS[(i+4)%AI_COLORS.length],false,undefined,CHARACTERS[i%CHARACTERS.length].type);
        npc.cityNPC=true;
        npc.aiTargetX=nx2; npc.aiTargetZ=nz2;
        npc.aiWanderTimer=60+Math.random()*120;
        cityNPCs.push(npc);
    }
}

// ---- Clouds (can stand on them) ----
var cityCloudPlatforms=[]; // {group, x, z, y, hw, hd}
var _cloudWorldPipe=null; // moon pipe in cloud world
function _makeCloud(cx,cy,cz,minParts,maxParts,minS,maxS){
    var cg2=new THREE.SphereGeometry(1,8,6);
    var cm2=toon(0xffffff,{transparent:true,opacity:0.85});
    var g=new THREE.Group();
    var maxW=0,maxD=0,maxTop=0,maxSc=0;
    var numParts=minParts+Math.floor(Math.random()*(maxParts-minParts+1));
    for(var j=0;j<numParts;j++){
        var s=minS+Math.random()*(maxS-minS);
        var m=new THREE.Mesh(cg2,cm2);
        m.scale.set(s,s*0.45,s*0.7);
        m.castShadow=true;m.receiveShadow=true;
        var pz=Math.random()*1.5-0.75;
        m.position.set(j*2.5,0,pz);
        g.add(m);
        if(j*2.5+s>maxW)maxW=j*2.5+s;
        var partD=Math.abs(pz)+s*0.7;
        if(partD>maxD)maxD=partD;
        if(s*0.45>maxTop)maxTop=s*0.45;
        if(s>maxSc)maxSc=s;
    }
    var halfW=maxW*0.5;
    for(var ci2=0;ci2<g.children.length;ci2++){g.children[ci2].position.x-=halfW;}
    g.position.set(cx,cy,cz);
    scene.add(g);
    var cl={group:g,x:cx,z:cz,y:cy,hw:halfW+maxSc,hd:Math.max(maxD,maxSc*0.7),top:maxTop};
    cityCloudPlatforms.push(cl);
    return cl;
}
function addClouds(){
    // No clouds on the moon
    if(currentCityStyle===5)return;
    // Cloud above each building roof — reachable with charge jump
    var roofClouds=[];
    for(var bi=0;bi<cityColliders.length;bi++){
        var c=cityColliders[bi];
        var roofTop=(c.h||6)+(c.roofH||3);
        var rc=_makeCloud(c.x,roofTop+2,c.z,2,3,2,4);
        roofClouds.push(rc);
    }
    // ---- Staircase clouds from roof level to cloud world ----
    // Tallest roof is about y=19, cloud world at y=42
    // Need steps every ~4 units (easy charge jump) from y=22 to y=40
    // Place staircase columns near several buildings
    var stairPositions=[];
    // First staircase near center (close to Babel tower at 12,0)
    stairPositions.push({x:8,z:8});
    for(var _si=0;_si<5;_si++){
        stairPositions.push({x:(Math.random()-0.5)*80,z:(Math.random()-0.5)*80});
    }
    window._stairPositions=stairPositions;
    for(var si=0;si<stairPositions.length;si++){
        var sp=stairPositions[si];
        var baseY=22; // just above typical roof clouds
        var steps=5; // 5 steps to reach cloud world
        for(var st=0;st<steps;st++){
            var sy=baseY+st*4;
            var sx=sp.x+(Math.random()-0.5)*8;
            var sz=sp.z+(Math.random()-0.5)*8;
            _makeCloud(sx,sy,sz,2,3,2,4);
        }
    }
    // ---- Cloud World (y=46) — large platform layer ----
    var cwY=46;
    // Central HUGE cloud platform — the highest cloud, moon pipe sits here
    _makeCloud(0,cwY,0,8,10,14,20);
    // Ring of cloud platforms around center
    for(var ai=0;ai<8;ai++){
        var ang=ai/8*Math.PI*2;
        var r=25+Math.random()*10;
        _makeCloud(Math.cos(ang)*r,cwY-1+Math.random()*2,Math.sin(ang)*r,3,4,3,5);
    }
    // Outer ring
    for(var oi=0;oi<6;oi++){
        var oa=oi/6*Math.PI*2;
        _makeCloud(Math.cos(oa)*50,cwY+Math.random()*2,Math.sin(oa)*50,3,4,3,5);
    }
    // ---- Moving clouds (platforms that drift back and forth) ----
    for(var mi=0;mi<8;mi++){
        var ma=mi/8*Math.PI*2;
        var mr=15+Math.random()*25;
        var mx=Math.cos(ma)*mr;
        var mz=Math.sin(ma)*mr;
        var my=cwY-1+Math.random()*3;
        var mc=_makeCloud(mx,my,mz,2,3,3,5);
        // Mark as moving cloud
        mc.moving=true;
        mc.moveAxis=Math.random()<0.5?'x':'z'; // drift direction
        mc.moveSpeed=0.01+Math.random()*0.02;
        mc.moveRange=8+Math.random()*12;
        mc.movePhase=Math.random()*Math.PI*2;
        mc.baseX=mx;
        mc.baseZ=mz;
    }
    // Some moving clouds in the staircase zone too
    for(var mi2=0;mi2<4;mi2++){
        var mx2=(Math.random()-0.5)*60;
        var mz2=(Math.random()-0.5)*60;
        var my2=26+Math.random()*12;
        var mc2=_makeCloud(mx2,my2,mz2,2,3,2,4);
        mc2.moving=true;
        mc2.moveAxis=Math.random()<0.5?'x':'z';
        mc2.moveSpeed=0.008+Math.random()*0.015;
        mc2.moveRange=6+Math.random()*10;
        mc2.movePhase=Math.random()*Math.PI*2;
        mc2.baseX=mx2;
        mc2.baseZ=mz2;
    }
    // Random decorative clouds (high, not for standing)
    for(var di=0;di<10;di++){
        var dx2=(Math.random()-0.5)*200;
        var dz2=(Math.random()-0.5)*200;
        var dy2=50+Math.random()*20;
        _makeCloud(dx2,dy2,dz2,3,4,3,6);
    }
    // Coins in cloud world
    var coinGeo=new THREE.CylinderGeometry(0.4,0.4,0.1,12);
    var coinMat=toon(0xFFDD44,{emissive:0xFFAA00,emissiveIntensity:0.3});
    for(var cci=0;cci<15;cci++){
        var ca=cci/15*Math.PI*2;
        var cr=8+Math.random()*20;
        var ccY=cwY+2+Math.random()*2;
        var coin=new THREE.Mesh(coinGeo,coinMat);
        coin.position.set(Math.cos(ca)*cr,ccY,Math.sin(ca)*cr);
        coin.rotation.x=Math.PI/2;
        scene.add(coin);
        cityCoins.push({mesh:coin,collected:false,baseY:ccY,inScene:true});
    }
    // ---- Moon Warp Pipe in cloud world center ----
    _buildCloudWorldMoonPipe(0,cwY,0);
}
function _buildCloudWorldMoonPipe(px,py,pz){
    var pColor=0xCCCCFF;
    var g=new THREE.Group();
    var pMat=new THREE.MeshPhongMaterial({color:pColor,transparent:true,opacity:0.4,side:THREE.DoubleSide});
    var tube=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,6,16,1,true),pMat);
    tube.position.y=3;g.add(tube);
    var rim=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.35,8,16),toon(pColor,{emissive:pColor,emissiveIntensity:0.5}));
    rim.position.y=6;rim.rotation.x=Math.PI/2;g.add(rim);
    var rim2=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.3,8,16),toon(pColor,{emissive:pColor,emissiveIntensity:0.3}));
    rim2.position.y=0.1;rim2.rotation.x=Math.PI/2;g.add(rim2);
    // Moon icon on top
    var moonSphere=new THREE.Mesh(new THREE.SphereGeometry(1.2,12,8),toon(0xEEEECC,{emissive:0xAAAA88,emissiveIntensity:0.4}));
    moonSphere.position.y=8;g.add(moonSphere);
    // Craters
    for(var ci=0;ci<5;ci++){
        var ca=ci/5*Math.PI*2;
        var crater=new THREE.Mesh(new THREE.SphereGeometry(0.2,6,4),toon(0xBBBBAA));
        crater.position.set(Math.cos(ca)*0.8,8+Math.sin(ca)*0.6,Math.sin(ca)*0.5);
        crater.scale.set(1,0.4,1);
        g.add(crater);
    }
    // Glow orbs inside
    var sMat=new THREE.MeshBasicMaterial({color:pColor,transparent:true,opacity:0.5});
    for(var si=0;si<8;si++){
        var sp=new THREE.Mesh(new THREE.SphereGeometry(0.3,6,4),sMat);
        var a=si/8*Math.PI*2;
        sp.position.set(Math.cos(a)*1.5,0.5+si*0.6,Math.sin(a)*1.5);
        g.add(sp);
    }
    // Label
    var canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
    var ctx2=canvas.getContext('2d');
    ctx2.fillStyle='rgba(0,0,0,0.6)';ctx2.fillRect(0,0,256,64);
    ctx2.fillStyle='#fff';ctx2.font='bold 28px sans-serif';ctx2.textAlign='center';
    var moonName=CITY_STYLES[5]?CITY_STYLES[5].name:'Moon';
    ctx2.fillText(moonName,128,42);
    var tex=new THREE.CanvasTexture(canvas);
    var sign=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));
    sign.scale.set(4,1,1);sign.position.y=10;
    g.add(sign);
    g.position.set(px,py,pz);
    scene.add(g);
    _cloudWorldPipe={group:g,x:px,z:pz,y:py,targetStyle:5,_cooldown:false};
}
addClouds();

// ---- Tower of Babel (Ziggurat) ----
function playRumbleSound(){
    if(!sfxEnabled)return;
    var ctx=ensureAudio();if(!ctx)return;
    var dur=3.0;
    var bufSize=Math.floor(ctx.sampleRate*dur);
    var buf=ctx.createBuffer(1,bufSize,ctx.sampleRate);
    var data=buf.getChannelData(0);
    for(var i=0;i<bufSize;i++){
        var t=i/ctx.sampleRate;
        // Deep rumble + mid-range cracking for audibility on all speakers
        data[i]=(Math.random()-0.5)*0.35*Math.sin(t*40)*Math.exp(-t*0.3)
            +Math.sin(t*55)*0.15*Math.exp(-t*0.4)
            +Math.sin(t*30+Math.sin(t*7)*3)*0.12*Math.exp(-t*0.35)
            +(Math.random()-0.5)*0.2*Math.exp(-t*0.5)
            +Math.sin(t*180+Math.random()*0.5)*0.08*Math.exp(-t*0.6)
            +Math.sin(t*110)*0.1*Math.exp(-t*0.45);
    }
    var src=ctx.createBufferSource();src.buffer=buf;
    var g=ctx.createGain();g.gain.setValueAtTime(0.5,ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.6,ctx.currentTime+0.5);
    g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+dur);
    // Wider low-pass to let mid-range through
    var filt=ctx.createBiquadFilter();filt.type='lowpass';filt.frequency.value=350;filt.Q.value=0.7;
    src.connect(filt);filt.connect(g);g.connect(ctx.destination);
    src.start();src.stop(ctx.currentTime+dur);
}

function _buildBabylonTower(){
    if(_babylonTower)return;
    var g=new THREE.Group();
    // Ziggurat — 8 stacked layers reaching above cloud world (y=48)
    var layers=8;
    var baseW=16, baseD=16, layerH=6.4;
    var colors=[0xD4A460,0xC8963C,0xBB8833,0xAA7722,0x996611,0x885500,0x774400,0x663300];
    for(var i=0;i<layers;i++){
        var w=baseW-i*1.5;
        var d=baseD-i*1.5;
        var geo=new THREE.BoxGeometry(w,layerH,d);
        var mat=toon(colors[i]);
        var mesh=new THREE.Mesh(geo,mat);
        mesh.position.y=i*layerH+layerH/2;
        mesh.castShadow=true;mesh.receiveShadow=true;
        g.add(mesh);
        // Decorative ledge
        var ledge=new THREE.Mesh(new THREE.BoxGeometry(w+0.6,0.4,d+0.6),toon(colors[Math.max(0,i-1)]));
        ledge.position.y=i*layerH+layerH;
        g.add(ledge);
    }
    var topY=layers*layerH; // =42
    // Archway at top
    var topW=baseW-layers*1.5+1;
    var arch1=new THREE.Mesh(new THREE.BoxGeometry(0.8,4,0.8),toon(0x996611));
    arch1.position.set(-topW/3,topY+2,0);g.add(arch1);
    var arch2=new THREE.Mesh(new THREE.BoxGeometry(0.8,4,0.8),toon(0x996611));
    arch2.position.set(topW/3,topY+2,0);g.add(arch2);
    var archTop=new THREE.Mesh(new THREE.BoxGeometry(topW*0.8,0.8,1.2),toon(0x774400));
    archTop.position.set(0,topY+4,0);g.add(archTop);
    // Pipe elevator inside — launches player to cloud world (y=44)
    var pipeMat=new THREE.MeshPhongMaterial({color:0x44FF88,transparent:true,opacity:0.5,side:THREE.DoubleSide});
    var pipeBody=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,topY+2,16,1,true),pipeMat);
    pipeBody.position.y=(topY+2)/2;g.add(pipeBody);
    var pipeRim=new THREE.Mesh(new THREE.TorusGeometry(1.8,0.3,8,16),toon(0x44FF88,{emissive:0x22AA44,emissiveIntensity:0.4}));
    pipeRim.position.y=0.2;pipeRim.rotation.x=Math.PI/2;g.add(pipeRim);
    var pipeRimTop=new THREE.Mesh(new THREE.TorusGeometry(1.8,0.3,8,16),toon(0x44FF88,{emissive:0x22AA44,emissiveIntensity:0.4}));
    pipeRimTop.position.y=topY+1;pipeRimTop.rotation.x=Math.PI/2;g.add(pipeRimTop);
    // Glowing orbs spiraling up inside pipe
    var orbMat=new THREE.MeshBasicMaterial({color:0x88FFAA,transparent:true,opacity:0.6});
    for(var oi=0;oi<14;oi++){
        var orb=new THREE.Mesh(new THREE.SphereGeometry(0.25,6,4),orbMat);
        var oa=oi/14*Math.PI*2*3;
        orb.position.set(Math.cos(oa)*1.0,oi*3+1,Math.sin(oa)*1.0);
        g.add(orb);
    }
    // Arrows pointing up
    var arrowMat=toon(0xFFFF44,{emissive:0xFFAA00,emissiveIntensity:0.5});
    for(var ai=0;ai<5;ai++){
        var arrow=new THREE.Mesh(new THREE.ConeGeometry(0.6,1.2,6),arrowMat);
        arrow.position.set(0,4+ai*8,0);
        g.add(arrow);
    }
    // Label sign
    var canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
    var ctx2=canvas.getContext('2d');
    ctx2.fillStyle='rgba(0,0,0,0.6)';ctx2.fillRect(0,0,256,64);
    ctx2.fillStyle='#FFD700';ctx2.font='bold 22px sans-serif';ctx2.textAlign='center';
    var towerLabel={zhs:'\u5DF4\u522B\u5854 \u2191 \u4E91\u4E2D\u754C',zht:'\u5DF4\u5225\u5854 \u2191 \u96F2\u4E2D\u754C',ja:'\u30D0\u30D9\u30EB\u306E\u5854 \u2191 \u96F2\u4E2D\u754C',en:'Babel \u2191 Cloud Realm'};
    ctx2.fillText(towerLabel[_langCode]||towerLabel.en,128,42);
    var tex=new THREE.CanvasTexture(canvas);
    var sign=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));
    sign.scale.set(5,1.2,1);sign.position.set(0,topY+6,0);
    g.add(sign);
    // Doors on all 4 faces (N/S/E/W) to avoid being blocked
    var doorDirs=[{dx:0,dz:1},{dx:0,dz:-1},{dx:1,dz:0},{dx:-1,dz:0}];
    for(var di=0;di<4;di++){
        var dd=doorDirs[di];
        var dox=dd.dx*(baseD/2+0.1), doz=dd.dz*(baseD/2+0.1);
        var dFrame=new THREE.Mesh(new THREE.BoxGeometry(dd.dx===0?3.5:0.5,5,dd.dz===0?3.5:0.5),toon(0x664400));
        dFrame.position.set(dox,2.5,doz);g.add(dFrame);
        var dInner=new THREE.Mesh(new THREE.BoxGeometry(dd.dx===0?2.5:0.3,4,dd.dz===0?2.5:0.3),toon(0x332200));
        dInner.position.set(dox,2,doz);g.add(dInner);
        var dGlow=new THREE.Mesh(new THREE.PlaneGeometry(2,3.5),new THREE.MeshBasicMaterial({color:0x44FF88,transparent:true,opacity:0.3,side:THREE.DoubleSide}));
        dGlow.position.set(dox,2,doz);
        if(dd.dx!==0)dGlow.rotation.y=Math.PI/2;
        g.add(dGlow);
    }
    // Position on edge of the big cloud — tower top is ~5 units above cloud, offset from moon pipe
    var towerX, towerZ;
    towerX=12;
    towerZ=0;
    g.position.set(towerX,_babylonRiseY,towerZ);
    scene.add(g);
    _babylonTower={group:g,x:towerX,z:towerZ,pipeX:towerX,pipeZ:towerZ,topY:topY,baseW:baseW,baseD:baseD,_collidersAdded:false};
    // Add bridge clouds from tower top down to the big cloud platform
    for(var bci=0;bci<5;bci++){
        var bcx=towerX-bci*2.5;
        var bcz=towerZ+(Math.random()-0.5)*6;
        var bcy=topY-bci*1.5;
        _makeCloud(bcx,bcy,bcz,2,3,2,4);
    }
}

function _triggerBabylonEvent(){
    if(_babylonTriggered)return;
    if(currentCityStyle===5)return; // not on moon
    _babylonTriggered=true;
    _earthquakeTimer=180; // 3 seconds at 60fps
    _earthquakeIntensity=0.5;
    _babylonRising=true;
    _babylonRiseY=-52;
    playRumbleSound();
    _buildBabylonTower();
}

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
var MOON_CITY_SIZE=400; // half-size of flat moon city ground

// (spherical _moonProject removed — moon is now flat city)
// (spherical _moonOrient removed — moon is now flat city)

function updateEggPhysics(egg, isCity){if(egg.heldBy)return;
    if(!egg.alive) return;
    // ---- Normal flat physics (used for all cities including moon) ----
    var grav=GRAVITY;
    egg.vy -= grav;
    egg._prevY=egg.mesh.position.y;
    egg.mesh.position.x += egg.vx + (egg.conveyorVx||0);
    egg.mesh.position.y += egg.vy;
    // Thrown egg bounce
    if(egg.throwTimer>0&&egg.vy<-0.05){
        var _bFloor=0.01;
        if(!isCity){var _bgz=-egg.mesh.position.z;_bFloor=getFloorY(_bgz)+0.01;}
        if(egg.mesh.position.y<=_bFloor){
            if(egg._bounces>0){egg._bounces--;egg.vy=Math.abs(egg.vy)*0.5;egg.mesh.position.y=_bFloor;egg.squash=0.6;egg.vx*=0.75;egg.vz*=0.75;playHitSound();
                // Drop coins on first impact
                if(egg._dropCoinsOnLand&&!egg._coinsDropped){egg._coinsDropped=true;_dropNpcStolenCoins(egg);}
            } else {var _impSpd2=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);egg.vy=0;egg.mesh.position.y=_bFloor;egg.vx*=0.3;egg.vz*=0.3;egg.throwTimer=0;egg._stunTimer=Math.floor(30+_impSpd2*300);playHitSound();
                if(egg._dropCoinsOnLand&&!egg._coinsDropped){egg._coinsDropped=true;_dropNpcStolenCoins(egg);}
                egg._dropCoinsOnLand=false;egg._coinsDropped=false;
            }
        }
    }
    egg.mesh.position.z += egg.vz + (egg.conveyorVz||0);
    egg.conveyorVx=0; egg.conveyorVz=0;

    if(isCity){
        // City ground
        if(egg.mesh.position.y<=0.01){egg.mesh.position.y=0.01;if(egg.vy<-0.1)egg.squash=0.7;egg.vy=0;egg.onGround=true;
            if(egg._dropCoinsOnLand&&!egg._coinsDropped){egg._coinsDropped=true;_dropNpcStolenCoins(egg);}
        }else{egg.onGround=false;}
        // City bounds — air wall bounce
        const bound=(currentCityStyle===5?MOON_CITY_SIZE:CITY_SIZE)-1;
        if(egg.mesh.position.x>bound){egg.mesh.position.x=bound;egg.vx=-Math.abs(egg.vx)*0.5;}
        if(egg.mesh.position.x<-bound){egg.mesh.position.x=-bound;egg.vx=Math.abs(egg.vx)*0.5;}
        if(egg.mesh.position.z>bound){egg.mesh.position.z=bound;egg.vz=-Math.abs(egg.vz)*0.5;}
        if(egg.mesh.position.z<-bound){egg.mesh.position.z=-bound;egg.vz=Math.abs(egg.vz)*0.5;}
        // AT Field shield collision — block player/NPC except at door openings
        if(currentCityStyle===5&&window._moonShields){
            for(var _si=0;_si<window._moonShields.length;_si++){
                var _sh=window._moonShields[_si];
                var _sdx=egg.mesh.position.x-_sh.x;
                var _sdz=egg.mesh.position.z-_sh.z;
                var _sdist=Math.sqrt(_sdx*_sdx+_sdz*_sdz);
                // Check if egg is near the shield boundary (inside or crossing)
                if(_sdist<_sh.r+3&&_sdist>_sh.r-6){
                    // Check if near a door opening
                    var _sAngle=Math.atan2(_sdz,_sdx);
                    if(_sAngle<0)_sAngle+=Math.PI*2;
                    var _atDoor=false;
                    for(var _di=0;_di<_sh.doors.length;_di++){
                        var _da=_sh.doors[_di].a;var _dw=_sh.doors[_di].w;
                        var _diff=Math.abs(_sAngle-_da);
                        if(_diff>Math.PI)_diff=Math.PI*2-_diff;
                        if(_diff<_dw){_atDoor=true;break;}
                    }
                    if(!_atDoor){
                        // Push egg out of shield
                        if(_sdist<_sh.r){
                            // Inside shield near boundary (not at door) — block exit
                            var _moveDir=egg.vx*_sdx+egg.vz*_sdz; // positive = moving outward
                            if(_moveDir>0){
                                // Moving outward through wall — push back in
                                var _pushR=_sh.r-1;
                                egg.mesh.position.x=_sh.x+(_sdx/_sdist)*_pushR;
                                egg.mesh.position.z=_sh.z+(_sdz/_sdist)*_pushR;
                                // Reflect velocity along shield normal
                                var _nx=_sdx/_sdist,_nz=_sdz/_sdist;
                                var _vdot=egg.vx*_nx+egg.vz*_nz;
                                egg.vx-=2*_vdot*_nx;egg.vz-=2*_vdot*_nz;
                                egg.vx*=0.3;egg.vz*=0.3;
                            }
                        }else{
                            // Outside shield trying to enter — push out
                            var _pushR2=_sh.r+0.5;
                            egg.mesh.position.x=_sh.x+(_sdx/_sdist)*_pushR2;
                            egg.mesh.position.z=_sh.z+(_sdz/_sdist)*_pushR2;
                            var _nx2=_sdx/_sdist,_nz2=_sdz/_sdist;
                            var _vdot2=egg.vx*_nx2+egg.vz*_nz2;
                            if(_vdot2<0){
                                egg.vx-=2*_vdot2*_nx2;egg.vz-=2*_vdot2*_nz2;
                                egg.vx*=0.3;egg.vz*=0.3;
                            }
                        }
                    }
                }
            }
        }
        // Building collisions — can land on roof
        // Thrown eggs: check building wall collision → drop coins + stop
        if(egg.throwTimer>0){
            for(var tci=0;tci<cityColliders.length;tci++){
                var tc=cityColliders[tci];
                var tdx=egg.mesh.position.x-tc.x, tdz=egg.mesh.position.z-tc.z;
                var tinX=Math.abs(tdx)<tc.hw+egg.radius, tinZ=Math.abs(tdz)<tc.hd+egg.radius;
                if(tinX&&tinZ){
                    // Hit building wall — bounce back and drop coins
                    var toverlapX=tc.hw+egg.radius-Math.abs(tdx);
                    var toverlapZ=tc.hd+egg.radius-Math.abs(tdz);
                    if(toverlapX<toverlapZ){egg.mesh.position.x+=Math.sign(tdx)*toverlapX;egg.vx*=-0.3;}
                    else{egg.mesh.position.z+=Math.sign(tdz)*toverlapZ;egg.vz*=-0.3;}
                    if(egg._dropCoinsOnLand&&!egg._coinsDropped){egg._coinsDropped=true;_dropNpcStolenCoins(egg);}
                    var _wallImpSpd=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);
                    egg.throwTimer=1;egg._stunTimer=Math.floor(30+_wallImpSpd*400);
                    egg.squash=0.6;playHitSound();
                    break;
                }
            }
            // Thrown egg hits other NPCs → knockback + drop coins
            for(var tei=0;tei<allEggs.length;tei++){
                var te=allEggs[tei];
                if(te===egg||!te.alive||te.heldBy)continue;
                var htdx=egg.mesh.position.x-te.mesh.position.x;
                var htdz=egg.mesh.position.z-te.mesh.position.z;
                var htdy=egg.mesh.position.y-te.mesh.position.y;
                var htd=Math.sqrt(htdx*htdx+htdz*htdz+htdy*htdy);
                if(htd<2.0){
                    // Knockback the hit NPC
                    var kbf=0.3;
                    te.vx-=htdx/htd*kbf;te.vz-=htdz/htd*kbf;te.vy+=0.12;
                    te.squash=0.6;
                    // Drop coins from thrown NPC on impact
                    if(egg._dropCoinsOnLand&&!egg._coinsDropped){egg._coinsDropped=true;_dropNpcStolenCoins(egg);}
                    // Also drop coins from hit NPC
                    _dropNpcStolenCoins(te);
                    egg.vx*=0.3;egg.vz*=0.3;
                    egg.squash=0.6;playHitSound();
                    break;
                }
            }
        } else for(const c of cityColliders){
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
                // Babel tower: wider landing range but skip if egg came from far above (charge-jump to cloud)
                var landBelow=c._babel?6.0:1.0;
                var skipBabelSnap=false;
                if(c._babel&&egg._prevY&&egg._prevY>roofY+10){skipBabelSnap=true;}
                // On top of building body — land on roof (penetration correction only)
                if(!skipBabelSnap&&Math.abs(dx)<c.hw&&Math.abs(dz)<c.hd&&egg.vy<=0&&egg.mesh.position.y<=roofY+0.05&&egg.mesh.position.y>=roofY-landBelow){
                    egg.mesh.position.y=roofY+0.01;egg.vy=0;egg.onGround=true;
                }
                // Jumping upward past building — let egg phase through walls while going up
                else if(egg.vy>0.05){
                    // Allow vertical movement, no horizontal push
                }
                // Below roof — push out horizontally (but not for Babel tower when falling from above)
                else if(egg.mesh.position.y<roofY-0.3){
                    if(c._babel&&egg.mesh.position.y>2&&egg.vy<0){
                        // Falling alongside Babel tower — don't push out, let gravity work
                    } else {
                    const overlapX=c.hw+egg.radius-Math.abs(dx);
                    const overlapZ=c.hd+egg.radius-Math.abs(dz);
                    if(overlapX<overlapZ){egg.mesh.position.x+=Math.sign(dx)*overlapX;egg.vx*=-0.2;}
                    else{egg.mesh.position.z+=Math.sign(dz)*overlapZ;egg.vz*=-0.2;}
                    }
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
                // Land on top of cloud visual surface
                var cloudTop=cl.y+(cl.top||1.2);
                if(egg.vy<=0&&egg.mesh.position.y<=cloudTop+0.05&&egg.mesh.position.y>=cloudTop-1.5){
                    egg.mesh.position.y=cloudTop+0.01;egg.vy=0;egg.onGround=true;
                    egg._onCloud=cl;
                }
            }
        }
        // Moving cloud carry — always apply if standing on a moving cloud
        if(egg._onCloud&&egg._onCloud.moving&&egg.onGround){
            var oc=egg._onCloud;
            var mOff=Math.sin(oc.movePhase)*oc.moveRange;
            var mOffPrev=Math.sin(oc.movePhase-oc.moveSpeed)*oc.moveRange;
            var delta=mOff-mOffPrev;
            if(oc.moveAxis==='x')egg.mesh.position.x+=delta;
            else egg.mesh.position.z+=delta;
        }
        if(!egg.onGround)egg._onCloud=null;
        // Warp pipe teleport — player only
        if(egg.isPlayer){
            for(var wpi=0;wpi<warpPipeMeshes.length;wpi++){
                var wp=warpPipeMeshes[wpi];
                var wdx=egg.mesh.position.x-wp.x,wdz=egg.mesh.position.z-wp.z;
                var wdist=Math.sqrt(wdx*wdx+wdz*wdz);
                if(wdist<3.5&&egg.mesh.position.y<4&&!wp._cooldown&&!_pipeTraveling&&!_spinDashing){
                    wp._cooldown=true;
                    startPipeTravel(wp.x,wp.z,wp.targetStyle);
                    return; // player is now in pipe travel mode
                }
                if(wdist>5)wp._cooldown=false;
            }
            // Cloud world moon pipe — proximity prompt
            if(_cloudWorldPipe&&!_pipeTraveling&&!_portalConfirmOpen&&!_spinDashing){
                var mp=_cloudWorldPipe;
                var mdx=egg.mesh.position.x-mp.x,mdz=egg.mesh.position.z-mp.z;
                var mdy=egg.mesh.position.y-mp.y;
                var mdist=Math.sqrt(mdx*mdx+mdz*mdz);
                if(mdist<4&&egg.mesh.position.y>=mp.y-3&&egg.mesh.position.y<=mp.y+8&&!_moonPipeDismissed){
                    _showMoonPipePrompt();
                }
                if(mdist>6){_moonPipeDismissed=false;}
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

    if(egg.throwTimer>0){egg.throwTimer--;var _eDrag2=egg._chargeDrag||0.98;egg.vx*=_eDrag2;egg.vz*=_eDrag2;if(egg.throwTimer<=0){
        // Fallback: drop coins when throw ends if not already dropped
        if(egg._dropCoinsOnLand&&!egg._coinsDropped){egg._coinsDropped=true;_dropNpcStolenCoins(egg);}
        egg._dropCoinsOnLand=false;egg._coinsDropped=false;
        var _impSpd3=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);
        egg._stunTimer=Math.floor(30+_impSpd3*300);
    }}else{egg.vx*=FRICTION;egg.vz*=FRICTION;}

    // Walk anim
    var speed=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);
    var prevPhase=egg.walkPhase;
    if(speed>0.005&&egg.onGround)egg.walkPhase+=speed*20; else egg.walkPhase*=0.85;
    // Step sound for player
    if(egg.isPlayer&&speed>0.02&&egg.onGround){
        var prevStep=Math.floor(prevPhase/Math.PI);
        var curStep=Math.floor(egg.walkPhase/Math.PI);
        if(curStep!==prevStep) playStepSound();
    }
    var feet=egg.mesh.userData.feet, body=egg.mesh.userData.body;
    if(feet&&feet.length===2){
        const sw=Math.sin(egg.walkPhase)*0.14;
        feet[0].position.z=0.06+sw; feet[1].position.z=0.06-sw;
        feet[0].position.y=0.05+Math.max(0,Math.sin(egg.walkPhase))*0.07;
        feet[1].position.y=0.05+Math.max(0,-Math.sin(egg.walkPhase))*0.07;
    }
    if(body){var tz=Math.sin(egg.walkPhase)*speed*0.25;var tx=-speed*0.35;body.rotation.z+=(tz-body.rotation.z)*0.1;body.rotation.x+=(tx-body.rotation.x)*0.1;}

    var sq=egg.squash; egg.squash+=(1-egg.squash)*0.15;
    egg.mesh.scale.set(1+(1-sq)*0.3,sq,1+(1-sq)*0.3);

    // Egg randomly wobbles (not always — random trigger)
    if(egg._wobbleTimer===undefined){egg._wobbleTimer=0;egg._wobbleAmt=0;egg._wobbleDir=1;}
    if(egg._wobbleTimer<=0&&speed>0.01&&Math.random()<0.003){
        egg._wobbleTimer=60+Math.floor(Math.random()*120);
        egg._wobbleAmt=0.15+Math.random()*0.25;
        egg._wobbleDir=Math.random()<0.5?1:-1;
    }
    if(egg._wobbleTimer>0){
        egg._wobbleTimer--;
        var wob=Math.sin(egg.walkPhase*1.5)*egg._wobbleAmt*egg._wobbleDir;
        egg.mesh.rotation.z+=(wob-egg.mesh.rotation.z)*0.1;
        egg.mesh.rotation.x+=(wob*0.5-egg.mesh.rotation.x)*0.1;
    } else {
        egg.mesh.rotation.x+=(0-egg.mesh.rotation.x)*0.12;
        egg.mesh.rotation.z+=(0-egg.mesh.rotation.z)*0.12;
    }

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
    // Thrown or stunned NPCs cannot act
    if(egg.throwTimer>0)return;
    if(egg._stunTimer>0){egg._stunTimer--;egg.vx*=0.9;egg.vz*=0.9;return;}
    // ---- NPC coin stealing (priority behavior) ----
    if(!egg._stolenCoins)egg._stolenCoins=[];
    if(!egg._stolenCoinMeshes)egg._stolenCoinMeshes=[];
    // Actively seek nearby coins
    if(egg._stolenCoins.length<3&&!egg._coinTarget&&Math.random()<0.04){
        var bestCoin=null,bestCD=25;
        for(var bci=0;bci<cityCoins.length;bci++){
            var bc=cityCoins[bci];
            if(bc.collected||bc._stolenBy)continue;
            var bcdx=egg.mesh.position.x-bc.mesh.position.x;
            var bcdy=egg.mesh.position.y-bc.mesh.position.y;
            var bcdz=egg.mesh.position.z-bc.mesh.position.z;
            var bcd=Math.sqrt(bcdx*bcdx+bcdy*bcdy+bcdz*bcdz);
            if(bcd<bestCD){bestCD=bcd;bestCoin=bci;}
        }
        if(bestCoin!==null){egg._coinTarget=bestCoin;egg._coinTargetTimer=360;}
    }
    var _chasingCoin=false;
    // Move toward targeted coin (overrides normal AI)
    if(egg._coinTarget!==null&&egg._coinTarget>=0&&egg._coinTarget<cityCoins.length){
        var tc=cityCoins[egg._coinTarget];
        if(tc.collected||tc._stolenBy){egg._coinTarget=null;}
        else{
            // Abandon coin target if it's outside city bounds
            var _tcBound=CITY_SIZE-3;
            if(currentCityStyle!==5&&(Math.abs(tc.mesh.position.x)>_tcBound||Math.abs(tc.mesh.position.z)>_tcBound)){egg._coinTarget=null;}
            else{
            egg._coinTargetTimer=(egg._coinTargetTimer||0)-1;
            if(egg._coinTargetTimer<=0){egg._coinTarget=null;}
            else{
                var tcdx=tc.mesh.position.x-egg.mesh.position.x;
                var tcdy=tc.mesh.position.y-egg.mesh.position.y;
                var tcdz=tc.mesh.position.z-egg.mesh.position.z;
                var tcd=Math.sqrt(tcdx*tcdx+tcdy*tcdy+tcdz*tcdz);
                if(tcd>0.5){egg.vx+=(tcdx/tcd)*MOVE_ACCEL*0.7;egg.vy+=(tcdy/tcd)*MOVE_ACCEL*0.7;egg.vz+=(tcdz/tcd)*MOVE_ACCEL*0.7;}
                _chasingCoin=true;
            }
            }
        }
    }
    // Steal coins when close enough
    if(egg._stolenCoins.length<3){
        for(var sci=0;sci<cityCoins.length;sci++){
            var sc=cityCoins[sci];
            if(sc.collected||sc._stolenBy)continue;
            var sdx=egg.mesh.position.x-sc.mesh.position.x;
            var sdy=egg.mesh.position.y-sc.mesh.position.y;
            var sdz=egg.mesh.position.z-sc.mesh.position.z;
            var sdist=Math.sqrt(sdx*sdx+sdy*sdy+sdz*sdz);
            if(sdist<2.5){
                sc._stolenBy=egg;
                sc.mesh.visible=false;
                egg._stolenCoins.push(sci);
                egg._coinTarget=null;
                // Make NPC body semi-transparent so coins are visible inside
                if(!egg._madeTransparent){
                    egg._madeTransparent=true;
                    egg.mesh.traverse(function(child){
                        if(child.isMesh&&child.material){
                            var m=child.material;
                            if(!m._origOpacity){m._origOpacity=m.opacity;m._origTransparent=m.transparent;}
                            m.transparent=true;
                            m.opacity=0.45;
                        }
                    });
                }
                // Add visible coin mesh inside NPC body
                var sCoin=new THREE.Mesh(
                    new THREE.CylinderGeometry(0.4,0.4,0.08,10),
                    new THREE.MeshBasicMaterial({color:0xFFDD00,emissive:0xFFAA00})
                );
                var sIdx=egg._stolenCoinMeshes.length;
                sCoin.rotation.x=Math.PI/2;
                sCoin.position.set(0.35*(sIdx-1),0.3+sIdx*0.4,0);
                egg.mesh.add(sCoin);
                egg._stolenCoinMeshes.push(sCoin);
                if(egg._stolenCoins.length>=3)break;
            }
        }
    }
    // Rotate stolen coin meshes for visibility
    if(egg._stolenCoinMeshes){
        for(var scr=0;scr<egg._stolenCoinMeshes.length;scr++){
            egg._stolenCoinMeshes[scr].rotation.y+=0.05;
        }
    }
    // Skip normal AI if chasing a coin
    if(_chasingCoin){
        var spd2=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);
        if(spd2>MAX_SPEED*0.6){egg.vx=(egg.vx/spd2)*MAX_SPEED*0.6;egg.vz=(egg.vz/spd2)*MAX_SPEED*0.6;}
        return;
    }
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
        if(r<0.25) egg._aiState='wander';
        else if(r<0.38) egg._aiState='idle';
        else if(r<0.50) egg._aiState='chase';
        else if(r<0.60) egg._aiState='flee';
        else if(r<0.70) egg._aiState='dance';
        else if(r<0.78) egg._aiState='circle';
        else if(r<0.86&&currentCityStyle!==5&&_babylonTower) egg._aiState='babel';
        else if(r<0.93) egg._aiState='spinDash';
        else egg._aiState='wander';
        egg._aiStateTimer=80+Math.random()*200;
        egg._circleCenter={x:egg.mesh.position.x,z:egg.mesh.position.z};
        egg._circleAngle=Math.random()*Math.PI*2;
    }
    var st=egg._aiState;
    if(st==='wander'){
        egg.aiWanderTimer--;
        if(egg.aiWanderTimer<=0){
            egg.aiWanderTimer=60+Math.random()*120;
            if(currentCityStyle===5){
                // Moon flat: wander across the city
                egg.aiTargetX=(Math.random()-0.5)*MOON_CITY_SIZE*1.5;
                egg.aiTargetZ=(Math.random()-0.5)*MOON_CITY_SIZE*1.5;
            } else {
                egg.aiTargetX=(Math.random()-0.5)*55;
                egg.aiTargetZ=(Math.random()-0.5)*55;
            }
        }
        // Clamp wander target inside city bounds
        var _npcBound=(currentCityStyle===5?MOON_CITY_SIZE:CITY_SIZE)-5;
        if(egg.aiTargetX>_npcBound)egg.aiTargetX=_npcBound;
        if(egg.aiTargetX<-_npcBound)egg.aiTargetX=-_npcBound;
        if(egg.aiTargetZ>_npcBound)egg.aiTargetZ=_npcBound;
        if(egg.aiTargetZ<-_npcBound)egg.aiTargetZ=-_npcBound;
        // Push NPC away from city edge
        var _epx=egg.mesh.position.x, _epz=egg.mesh.position.z;
        if(Math.abs(_epx)>_npcBound||Math.abs(_epz)>_npcBound){
            egg.aiTargetX=(Math.random()-0.5)*30;
            egg.aiTargetZ=(Math.random()-0.5)*30;
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
    } else if(st==='babel'){
        // Walk toward Babel tower and use elevator
        if(_babylonTower){
            var bt=_babylonTower;
            var bdx=bt.x-egg.mesh.position.x, bdz=bt.z-egg.mesh.position.z;
            var bd=Math.sqrt(bdx*bdx+bdz*bdz);
            if(bd>4){
                egg.vx+=(bdx/bd)*MOVE_ACCEL*0.5;egg.vz+=(bdz/bd)*MOVE_ACCEL*0.5;
            } else {
                // Near tower — teleport to cloud world or back
                if(egg.mesh.position.y<5&&Math.random()<0.01){
                    // Go up to cloud level
                    egg.mesh.position.y=bt.topY||45;
                    egg.vy=0.1;
                    egg._aiStateTimer=10; // quickly switch to wander in clouds
                } else if(egg.mesh.position.y>30&&Math.random()<0.01){
                    // Come back down
                    egg.mesh.position.y=1;egg.vy=0;
                    egg._aiStateTimer=10;
                }
            }
        }
    } else if(st==='spinDash'){
        // NPC spin dash — charge and dash forward
        if(!egg._npcSpinTimer)egg._npcSpinTimer=0;
        egg._npcSpinTimer++;
        if(egg._npcSpinTimer<30){
            // Charging — crouch in place
            egg.vx*=0.85;egg.vz*=0.85;
            egg.squash=0.7+0.3*(1-egg._npcSpinTimer/30);
            egg.mesh.rotation.y+=0.3;
        } else if(egg._npcSpinTimer<90){
            // Dashing
            if(egg._npcSpinTimer===30){
                var dashDir=egg.mesh.rotation.y;
                egg._npcDashVx=Math.sin(dashDir)*MAX_SPEED*3;
                egg._npcDashVz=Math.cos(dashDir)*MAX_SPEED*3;
            }
            egg.vx=egg._npcDashVx||0;egg.vz=egg._npcDashVz||0;
            egg.mesh.rotation.y+=0.5;
            egg.squash=0.6;
            // Keep on ground
            if(egg.mesh.position.y<0.6)egg.mesh.position.y=0.6;
            if(egg.onGround)egg.vy=0;
            // Hit nearby eggs
            for(var sdi=0;sdi<allEggs.length;sdi++){
                var sde2=allEggs[sdi];
                if(sde2===egg||!sde2.alive||sde2.heldBy)continue;
                var sddx2=sde2.mesh.position.x-egg.mesh.position.x;
                var sddz2=sde2.mesh.position.z-egg.mesh.position.z;
                var sddy2=sde2.mesh.position.y-egg.mesh.position.y;
                if(Math.abs(sddy2)>1.5)continue;
                var sdd2=Math.sqrt(sddx2*sddx2+sddz2*sddz2);
                if(sdd2<2.5&&sdd2>0.01){
                    sde2.vx+=sddx2/sdd2*0.4;sde2.vy+=0.2;sde2.vz+=sddz2/sdd2*0.4;
                    sde2.throwTimer=15;sde2._bounces=1;sde2.squash=0.5;
                    sde2._stunTimer=Math.floor(30+Math.random()*40);
                    if(sde2.isPlayer)playHitSound();
                    _dropNpcStolenCoins(sde2);
                }
            }
        } else {
            egg._npcSpinTimer=0;egg._aiStateTimer=10;
        }
    }
    var spd=Math.sqrt(egg.vx*egg.vx+egg.vz*egg.vz);
    var npcSpd=(egg._aiSprint>0)?1.2:1;
    var maxSpd=st==='flee'?MAX_SPEED*0.7*npcSpd:st==='chase'?MAX_SPEED*0.6*npcSpd:MAX_SPEED*0.45*npcSpd;
    if(spd>maxSpd){egg.vx=(egg.vx/spd)*maxSpd;egg.vz=(egg.vz/spd)*maxSpd;}
}

// ---- Drop stolen coins from NPC ----
function _dropNpcStolenCoins(egg){
    if(!egg._stolenCoins||egg._stolenCoins.length===0)return;
    // Play scatter sound
    if(sfxEnabled){
        var ctx=ensureAudio();
        [600,900,1100,700].forEach(function(f,i){
            var osc=ctx.createOscillator();var g=ctx.createGain();
            osc.type='sine';osc.frequency.value=f;
            g.gain.setValueAtTime(0.1,ctx.currentTime+i*0.06);
            g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.06+0.1);
            osc.connect(g);g.connect(ctx.destination);
            osc.start(ctx.currentTime+i*0.06);osc.stop(ctx.currentTime+i*0.06+0.1);
        });
    }
    for(var di=0;di<egg._stolenCoins.length;di++){
        var coinIdx=egg._stolenCoins[di];
        if(coinIdx>=0&&coinIdx<cityCoins.length){
            var dc=cityCoins[coinIdx];
            dc._stolenBy=null;
            dc.collected=false;
            dc.mesh.visible=true;
            // Sonic-style scatter: coins fly outward in arcs
            var angle=di*(Math.PI*2/egg._stolenCoins.length)+Math.random()*0.5;
            var scatterSpeed=0.18+Math.random()*0.12;
            var svx=Math.cos(angle)*scatterSpeed;
            var svz=Math.sin(angle)*scatterSpeed;
            var svy=0.25+Math.random()*0.15;
            dc.mesh.position.set(egg.mesh.position.x,egg.mesh.position.y+1.5,egg.mesh.position.z);
            dc._scatterVX=svx;dc._scatterVY=svy;dc._scatterVZ=svz;dc._scatterTimer=80;
            dc.baseY=undefined; // will be set when scatter ends
        }
    }
    // Remove visual coin meshes from NPC
    if(egg._stolenCoinMeshes){
        for(var ri=0;ri<egg._stolenCoinMeshes.length;ri++){
            egg.mesh.remove(egg._stolenCoinMeshes[ri]);
        }
    }
    egg._stolenCoins=[];
    egg._stolenCoinMeshes=[];
    // Restore NPC body opacity
    if(egg._madeTransparent){
        egg._madeTransparent=false;
        egg.mesh.traverse(function(child){
            if(child.isMesh&&child.material&&child.material._origOpacity!==undefined){
                child.material.opacity=child.material._origOpacity;
                child.material.transparent=child.material._origTransparent;
            }
        });
    }
}

function updateRaceAI(egg){
    if(!egg.alive||egg.finished||egg.isPlayer||egg.cityNPC)return;
    if(egg.throwTimer>0)return;
    if(egg._stunTimer>0){egg._stunTimer--;egg.vx*=0.9;egg.vz*=0.9;return;}
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
    // Cannot control while thrown or stunned (except struggle when held)
    if(playerEgg.throwTimer>0||playerEgg._stunTimer>0){
        // Interrupt: drop held items and cancel charges when hit
        if(playerEgg.holding){var _ih=playerEgg.holding;_ih.heldBy=null;playerEgg.holding=null;if(_ih.struggleBar){_ih.mesh.remove(_ih.struggleBar);_ih.struggleBar=null;}playerEgg.grabCD=20;}
        if(playerEgg.holdingProp){playerEgg.holdingProp.grabbed=false;playerEgg.holdingProp=null;playerEgg.grabCD=20;}
        if(playerEgg.holdingObs){playerEgg.holdingObs._grabbed=false;playerEgg.holdingObs=null;playerEgg.grabCD=20;}
        _jumpCharging=false;_jumpCharge=0;_chargeHoldTimer=0;
        playerEgg._throwCharging=false;playerEgg._throwCharge=0;
        _sprintCharge=0;
        if(playerEgg.throwTimer>0)return;
    }
    if(playerEgg._stunTimer>0){playerEgg._stunTimer--;playerEgg.vx*=0.9;playerEgg.vz*=0.9;
        // Cancel spin dash on stun
        if(_spinDashing){_spinDashing=false;_spinDashTimer=0;_spinDashSpeed=0;if(_spinDashBar)_spinDashBar.visible=false;}
        return;}
    let mx=0,mz=0;
    if(keys['KeyA']||keys['ArrowLeft'])mx-=1;
    if(keys['KeyD']||keys['ArrowRight'])mx+=1;
    if(keys['KeyW']||keys['ArrowUp'])mz-=1;
    if(keys['KeyS']||keys['ArrowDown'])mz+=1;
    if(joyActive){mx+=joyVec.x;mz+=joyVec.y;}
    // Sprint: hold F — gradual speed ramp (only when not holding something)
    var _holdAnything=playerEgg.holding||playerEgg.holdingProp||playerEgg.holdingObs;
    var holdingF=keys['KeyF']&&!_portalConfirmOpen&&!_holdAnything;
    var sprintPct=_updateSprintBar(holdingF);
    var accelMul=1+sprintPct*1.0;
    var speedMul=1+sprintPct*1.0;
    const len=Math.sqrt(mx*mx+mz*mz);
    if(len>0.1){
        mx/=len;mz/=len;
        playerEgg.vx+=mx*MOVE_ACCEL*accelMul;playerEgg.vz+=mz*MOVE_ACCEL*accelMul;
    }
    // Sprint smoke + ground dust
    if(sprintPct>0.15&&playerEgg.onGround&&len>0.1){
        if(!playerEgg._sprintSmokeTick)playerEgg._sprintSmokeTick=0;
        playerEgg._sprintSmokeTick++;
        if(playerEgg._sprintSmokeTick%3===0)_spawnButtSmoke(playerEgg,sprintPct*0.6);
        if(playerEgg._sprintSmokeTick%5===0)_spawnGroundDust(playerEgg.mesh.position.x,playerEgg.mesh.position.y,playerEgg.mesh.position.z,sprintPct*0.3);
    } else { playerEgg._sprintSmokeTick=0; }
    // ---- Sonic spin dash ----
    if(_spinDashing){
        _spinDashTimer--;
        if(_spinDashTimer<=0){_spinDashing=false;_spinDashSpeed=0;if(_spinDashBar)_spinDashBar.visible=false;}
        else{
            // Steering during spin dash — WASD/joystick can curve the direction
            var sdSteerX=0, sdSteerZ=0;
            if(keys['KeyA']||keys['ArrowLeft'])sdSteerX-=1;
            if(keys['KeyD']||keys['ArrowRight'])sdSteerX+=1;
            if(keys['KeyW']||keys['ArrowUp'])sdSteerZ-=1;
            if(keys['KeyS']||keys['ArrowDown'])sdSteerZ+=1;
            if(joyActive){sdSteerX+=joyVec.x;sdSteerZ+=joyVec.y;}
            var sdSteerLen=Math.sqrt(sdSteerX*sdSteerX+sdSteerZ*sdSteerZ);
            if(sdSteerLen>0.1){
                sdSteerX/=sdSteerLen;sdSteerZ/=sdSteerLen;
                // Blend steering into dash direction (turn rate)
                var turnRate=0.06;
                playerEgg._dashDirX+=(sdSteerX-playerEgg._dashDirX)*turnRate;
                playerEgg._dashDirZ+=(sdSteerZ-playerEgg._dashDirZ)*turnRate;
                var ddl=Math.sqrt(playerEgg._dashDirX*playerEgg._dashDirX+playerEgg._dashDirZ*playerEgg._dashDirZ)||1;
                playerEgg._dashDirX/=ddl;playerEgg._dashDirZ/=ddl;
            }
            // Apply dash velocity
            playerEgg.vx=playerEgg._dashDirX*_spinDashSpeed;
            playerEgg.vz=playerEgg._dashDirZ*_spinDashSpeed;
            // No speed decay — constant speed until bar depletes
            // Show spin dash progress bar
            var sdBarPct=_spinDashTimer/_spinDashTimerMax;
            if(!_spinDashBar){_spinDashBar=_createSpinDashBar();scene.add(_spinDashBar);}
            _spinDashBar.visible=true;
            _spinDashBar.position.set(playerEgg.mesh.position.x,playerEgg.mesh.position.y+2.8,playerEgg.mesh.position.z);
            _drawSpinDashBar(_spinDashBar,sdBarPct);
            // Spin the egg body rapidly
            playerEgg.mesh.rotation.x+=0.6;
            playerEgg.squash=1.0; // keep normal scale — no sinking
            // Keep egg on ground during spin dash
            if(playerEgg.mesh.position.y<0.6)playerEgg.mesh.position.y=0.6;
            playerEgg.vy=0;playerEgg.onGround=true;
            // Spawn ground dust while dashing
            if(_spinDashTimer%2===0)_spawnGroundDust(playerEgg.mesh.position.x,playerEgg.mesh.position.y,playerEgg.mesh.position.z,0.4);
            // Hit NPCs while spin dashing — knock them away
            for(var sdi=0;sdi<allEggs.length;sdi++){
                var sde=allEggs[sdi];
                if(sde===playerEgg||!sde.alive||sde.heldBy)continue;
                var sddx=sde.mesh.position.x-playerEgg.mesh.position.x;
                var sddz=sde.mesh.position.z-playerEgg.mesh.position.z;
                var sddy=sde.mesh.position.y-playerEgg.mesh.position.y;
                var sdd=Math.sqrt(sddx*sddx+sddz*sddz+sddy*sddy);
                // Only hit NPCs at similar height (within 1.5 units vertically on flat cities)
                if(currentCityStyle!==5&&Math.abs(sddy)>1.5)continue;
                if(sdd<2.5&&sdd>0.01){
                    var sdForce=_spinDashSpeed*2;
                    sde.vx+=sddx/sdd*sdForce;sde.vy+=0.2+sdForce*0.3;sde.vz+=sddz/sdd*sdForce;
                    sde.throwTimer=20;sde._bounces=1;sde.squash=0.4;
                    sde._stunTimer=Math.floor(40+_spinDashSpeed*200);
                    playHitSound();
                    _dropNpcStolenCoins(sde);
                }
            }
            // Hit city props while spin dashing — knock them away
            for(var sdpi=0;sdpi<cityProps.length;sdpi++){
                var sdp=cityProps[sdpi];
                if(sdp.grabbed)continue;
                var spdx=sdp.group.position.x-playerEgg.mesh.position.x;
                var spdz=sdp.group.position.z-playerEgg.mesh.position.z;
                var spdy=sdp.group.position.y-playerEgg.mesh.position.y;
                if(currentCityStyle!==5&&Math.abs(spdy)>1.5)continue;
                var spdd=Math.sqrt(spdx*spdx+spdz*spdz+spdy*spdy);
                if(spdd<3.0&&spdd>0.01){
                    var spForce=_spinDashSpeed*1.5;
                    sdp.throwVx=spdx/spdd*spForce;sdp.throwVy=0.15+spForce*0.2;sdp.throwVz=spdz/spdd*spForce;
                    sdp.throwTimer=30;sdp._bounces=2;
                    playHitSound();
                }
            }
        }
    }
    // Charge jump: release Space within 0.3s = normal jump, hold past 0.3s = charge mode
    var _onGroundOrGrace=playerEgg.onGround;
    if(!playerEgg.onGround&&_jumpCharging){
        if(!playerEgg._chargeGrace)playerEgg._chargeGrace=0;
        playerEgg._chargeGrace++;
        if(playerEgg._chargeGrace<=8)_onGroundOrGrace=true;
    } else {
        playerEgg._chargeGrace=0;
    }
    if(!playerEgg._spaceHoldFrames)playerEgg._spaceHoldFrames=0;
    var _chargeDelay=18; // 0.3s at 60fps
    if(keys['Space']&&_onGroundOrGrace){
        // Cannot charge jump while holding something
        if(playerEgg.holding||playerEgg.holdingProp||playerEgg.holdingObs){
            if(playerEgg._spaceHoldFrames===0){
                playerEgg.vy=JUMP_FORCE*1.2;
                playerEgg.squash=0.7;playJumpSound();
            }
            playerEgg._spaceHoldFrames++;
            _jumpCharging=false;_jumpCharge=0;_chargeHoldTimer=0;
        } else {
        playerEgg._spaceHoldFrames++;
        // After 0.3s hold, enter charge mode (no instant jump)
        if(playerEgg._spaceHoldFrames>=_chargeDelay&&!_jumpCharging){
            _jumpCharging=true;_jumpCharge=0;_chargeBeepTimer=0;_chargeHoldTimer=0;
        }
        if(_jumpCharging){
            if(_jumpCharge<_jumpChargeMax){
                _jumpCharge=Math.min(_jumpCharge+1,_jumpChargeMax);
                var pct=_jumpCharge/_jumpChargeMax;
                var beepInterval=Math.max(3,Math.floor(15-pct*12));
                _chargeBeepTimer++;
                if(_chargeBeepTimer>=beepInterval){_chargeBeepTimer=0;_playChargeBeep(pct);}
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
        } // end else (not holding something)
    }
    if(!keys['Space']||!_onGroundOrGrace){
        if(_onGroundOrGrace){
            if(_jumpCharging&&_jumpCharge>0){
                // Release from charge mode → charged jump
                var pct2=_jumpCharge/_jumpChargeMax;
                var jumpF=JUMP_FORCE*(1.6+pct2*2.4);
                playerEgg.vy=jumpF;
                playerEgg.squash=0.65-pct2*0.2;
                playJumpSound();
                if(pct2>0.15)_spawnGroundDust(playerEgg.mesh.position.x,playerEgg.mesh.position.y,playerEgg.mesh.position.z,pct2);
                _ascendSmoke=true;_ascendSmokePct=pct2;
            } else if(!_jumpCharging&&playerEgg._spaceHoldFrames>0&&playerEgg._spaceHoldFrames<_chargeDelay){
                // Released before 0.3s → normal tap jump
                playerEgg.vy=JUMP_FORCE*1.5;
                playerEgg.squash=0.65;playJumpSound();
            }
        }
        _jumpCharging=false;_jumpCharge=0;_chargeHoldTimer=0;
        if(!keys['Space']){playerEgg._spaceHoldFrames=0;}
    }
    _updateChargeBar();
    // Ascending butt smoke while rising from charged jump
    if(_ascendSmoke&&playerEgg.vy>0&&!playerEgg.onGround){
        _spawnButtSmoke(playerEgg,_ascendSmokePct*0.7);
    }
    if(_ascendSmoke&&playerEgg.vy<=0&&!playerEgg.onGround){
        _ascendSmoke=false;
    }
    if(!_spinDashing){
        const spd=Math.sqrt(playerEgg.vx*playerEgg.vx+playerEgg.vz*playerEgg.vz);
        var curMax=MAX_SPEED*speedMul;
        if(spd>curMax){playerEgg.vx=(playerEgg.vx/spd)*curMax;playerEgg.vz=(playerEgg.vz/spd)*curMax;}
    }
    // Grab / Throw (F key)
    if(playerEgg.grabCD>0) playerEgg.grabCD--;
    if(!playerEgg._fHoldFrames)playerEgg._fHoldFrames=0;
    if(!playerEgg._throwCharging)playerEgg._throwCharging=false;
    var _throwChargeDelay=18; // 0.3s at 60fps
    var _throwChargeMax=60; // 1 second max charge
    var _holdingSomething=playerEgg.holding||playerEgg.holdingProp||playerEgg.holdingObs;
    // Track F press
    if(keys['KeyF']&&!playerEgg._fWasDown&&playerEgg.grabCD<=0){
        playerEgg._fPressStart=true;
        playerEgg._fHoldFrames=0;
        playerEgg._throwCharging=false;
        playerEgg._throwCharge=0;
        playerEgg._justGrabbed=false;
    }
    // Count hold frames while F is down
    if(keys['KeyF']){
        playerEgg._fHoldFrames++;
        // Charge throw: holding something + held past 0.3s
        if(_holdingSomething&&playerEgg._fHoldFrames>=_throwChargeDelay){
            playerEgg._throwCharging=true;
            playerEgg._throwCharge=Math.min((playerEgg._throwCharge||0)+1,_throwChargeMax);
        }
    }
    // F released
    if(!keys['KeyF']&&playerEgg._fWasDown){
        if(playerEgg._throwCharging&&_holdingSomething&&!playerEgg._justGrabbed){
            // Charge throw release → power throw
            var dir=playerEgg.mesh.rotation.y;
            var chargePct=(playerEgg._throwCharge||0)/_throwChargeMax;
            var throwMul=1+chargePct*4;
            if(playerEgg.holding){
                var held=playerEgg.holding;
                held.heldBy=null; playerEgg.holding=null; if(held.struggleBar){held.mesh.remove(held.struggleBar);held.struggleBar=null;}
                held.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir)*2, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir)*2);
                var tw=held.weight||1.0;var tf=0.5/tw*throwMul;held.vx=Math.sin(dir)*tf;held.vy=0.05+chargePct*0.25;held.vz=Math.cos(dir)*tf;held._throwTotal=80+Math.floor(chargePct*100);held.throwTimer=held._throwTotal;held._bounces=2+Math.floor(chargePct*2);held._chargeDrag=0.985+chargePct*0.01;
                held.squash=0.5; playerEgg.grabCD=20;
                playThrowSound();
                held._dropCoinsOnLand=true;held._coinsDropped=false;
            } else if(playerEgg.holdingProp){
                var prop=playerEgg.holdingProp;
                playerEgg.holdingProp=null;
                var pw=prop.weight||1.0;var pf=2.5/pw*throwMul;prop.throwVx=Math.sin(dir)*pf;prop.throwVy=0.18+chargePct*0.25;prop.throwVz=Math.cos(dir)*pf;prop._bounces=2+Math.floor(chargePct*2);prop.throwTimer=25+Math.floor(chargePct*60);prop._chargeDrag=0.98-chargePct*0.02;
                prop.group.position.set(playerEgg.mesh.position.x+Math.sin(dir)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir)*1.5);
                playerEgg.grabCD=20; playThrowSound();
            } else if(playerEgg.holdingObs){
                var obs=playerEgg.holdingObs;
                playerEgg.holdingObs=null;
                obs._grabbed=false;
                obs.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir)*1.5);
                var ow=obs._weight||2.0;var of2=4.5/ow*throwMul;obs._throwVx=Math.sin(dir)*of2;obs._throwVy=0.18+chargePct*0.25;obs._throwVz=Math.cos(dir)*of2;obs._throwTimer=Math.floor((50+20/ow)*(1+chargePct*1.5));obs._bounces=2+Math.floor(chargePct*2);obs._chargeDrag=0.98-chargePct*0.02;
                playerEgg.grabCD=20; playThrowSound();
            }
        } else if(_holdingSomething&&!playerEgg._justGrabbed&&playerEgg._fHoldFrames<_throwChargeDelay&&playerEgg._fHoldFrames>0){
            // Quick tap F while holding → normal throw (separate press from grab)
            if(playerEgg.holdingProp){
                var prop=playerEgg.holdingProp;
                playerEgg.holdingProp=null;
                var dir1=playerEgg.mesh.rotation.y;
                var pw=prop.weight||1.0;var pf=2.5/pw;prop.throwVx=Math.sin(dir1)*pf;prop.throwVy=0.18;prop.throwVz=Math.cos(dir1)*pf;prop._bounces=2;prop.throwTimer=25;prop._chargeDrag=0;
                prop.group.position.set(playerEgg.mesh.position.x+Math.sin(dir1)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir1)*1.5);
                playerEgg.grabCD=20; playThrowSound();
            } else if(playerEgg.holdingObs){
                var obs=playerEgg.holdingObs;
                playerEgg.holdingObs=null;
                obs._grabbed=false;
                var dir0=playerEgg.mesh.rotation.y;
                obs.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir0)*1.5, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir0)*1.5);
                var ow=obs._weight||2.0;var of2=4.5/ow;obs._throwVx=Math.sin(dir0)*of2;obs._throwVy=0.18;obs._throwVz=Math.cos(dir0)*of2;obs._throwTimer=Math.floor(50+20/ow);obs._bounces=2;
                playerEgg.grabCD=20; playThrowSound();
            } else if(playerEgg.holding){
                var held2=playerEgg.holding;
                held2.heldBy=null; playerEgg.holding=null; if(held2.struggleBar){held2.mesh.remove(held2.struggleBar);held2.struggleBar=null;}
                var dir2=playerEgg.mesh.rotation.y;
                held2.mesh.position.set(playerEgg.mesh.position.x+Math.sin(dir2)*2, playerEgg.mesh.position.y+0.5, playerEgg.mesh.position.z+Math.cos(dir2)*2);
                var tw2=held2.weight||1.0;var tf2=0.4/tw2;held2.vx=Math.sin(dir2)*tf2;held2.vy=0.15;held2.vz=Math.cos(dir2)*tf2;held2._throwTotal=80;held2.throwTimer=80;held2._bounces=2;held2._chargeDrag=0.992;
                held2.squash=0.5; playerEgg.grabCD=20;
                playThrowSound();
                held2._dropCoinsOnLand=true;held2._coinsDropped=false;
            }
        }
        playerEgg._throwCharging=false;playerEgg._throwCharge=0;playerEgg._fHoldFrames=0;playerEgg._fPressStart=false;
    }
    // Grab on first press (only when not holding anything)
    if(playerEgg._fPressStart&&!_holdingSomething&&playerEgg.grabCD<=0){
        playerEgg._fPressStart=false;
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
            // Drop any prop the grabbed NPC was holding
            if(nearest.holdingProp){nearest.holdingProp.grabbed=false;nearest.holdingProp=null;}
            nearest.struggleMax=300+Math.floor(Math.random()*240); nearest.struggleTimer=nearest.struggleMax;
            playerEgg.grabCD=20; playGrabSound();
            playerEgg._justGrabbed=true;
        } else {
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
                nearObs._throwTimer=0;nearObs._throwVx=0;nearObs._throwVy=0;nearObs._throwVz=0;
                nearObs.mesh.rotation.set(0,0,0);
                playerEgg.grabCD=20; playGrabSound();
                playerEgg._justGrabbed=true;
            } else if(gameState==='city'){
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
                        nearProp.throwTimer=0;nearProp.throwVx=0;nearProp.throwVy=0;nearProp.throwVz=0;
                        nearProp.group.rotation.set(0,0,0);
                        playerEgg.grabCD=20; playGrabSound();
                        playerEgg._justGrabbed=true;
                    }
            }
        }
    }
    // Show charge throw bar while charging
    if(playerEgg._throwCharging&&_holdingSomething){
        var chPct=(playerEgg._throwCharge||0)/60;
        if(chPct>0.01){
            if(!playerEgg._throwChargeBar){
                var tc=document.createElement('canvas');tc.width=128;tc.height=16;
                var ttex=new THREE.CanvasTexture(tc);
                playerEgg._throwChargeBar=new THREE.Sprite(new THREE.SpriteMaterial({map:ttex,transparent:true}));
                playerEgg._throwChargeBar.scale.set(2,0.3,1);
                scene.add(playerEgg._throwChargeBar);
            }
            playerEgg._throwChargeBar.visible=true;
            playerEgg._throwChargeBar.position.set(playerEgg.mesh.position.x,playerEgg.mesh.position.y+3.2,playerEgg.mesh.position.z);
            var tctx=playerEgg._throwChargeBar.material.map.image.getContext('2d');
            tctx.clearRect(0,0,128,16);
            tctx.fillStyle='rgba(0,0,0,0.5)';tctx.fillRect(0,0,128,16);
            var grd=tctx.createLinearGradient(0,0,128*chPct,0);
            grd.addColorStop(0,'#FF4444');grd.addColorStop(1,'#FFAA00');
            tctx.fillStyle=grd;tctx.fillRect(2,2,124*chPct,12);
            playerEgg._throwChargeBar.material.map.needsUpdate=true;
        }
    } else {
        if(playerEgg._throwChargeBar){playerEgg._throwChargeBar.visible=false;}
    }
    playerEgg._fWasDown=!!keys['KeyF'];
}

// ============================================================
//  CAMERA
// ============================================================
var _cameraZoom=1.0; // 1.0 = default, smaller = closer, larger = farther
// Moon third-person camera orbit angles (mouse-controlled)
var _moonCamYaw=0; // horizontal orbit angle around player (radians)
var _moonCamPitch=0.35; // vertical angle (0=level, positive=above)
var _moonCamDragging=false;
var _moonCamLastX=0, _moonCamLastY=0;
document.addEventListener('wheel',function(e){
    _cameraZoom+=e.deltaY*0.001*Math.max(1,_cameraZoom*0.5);
    if(_cameraZoom<0.04)_cameraZoom=0.04;
    if(_cameraZoom>1000)_cameraZoom=1000;
},{passive:true});
// Mouse drag to orbit camera (disabled — moon now uses flat camera)
document.addEventListener('mousedown',function(e){
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
document.addEventListener('contextmenu',function(e){});
// Touch orbit disabled — moon now uses flat camera
var _moonTouchOrbit=false, _moonTouchStartX=0, _moonTouchStartY=0;
function updateCamera(){
    if(!playerEgg)return;
    const p=playerEgg.mesh.position;
    // Normal flat camera (used for all cities including moon)
    var tx=p.x, ty=p.y+10*_cameraZoom, tz=p.z+14*_cameraZoom;
    camera.position.x+=(tx-camera.position.x)*0.08;
    camera.position.y+=(ty-camera.position.y)*0.08;
    camera.position.z+=(tz-camera.position.z)*0.08;
    // Earthquake shake
    if(_earthquakeTimer>0){
        var shakeAmt=_earthquakeIntensity*(_earthquakeTimer/180);
        camera.position.x+=(Math.random()-0.5)*shakeAmt*2;
        camera.position.y+=(Math.random()-0.5)*shakeAmt*1.5;
        camera.position.z+=(Math.random()-0.5)*shakeAmt*2;
        _earthquakeTimer--;
    }
    camera.lookAt(p.x, p.y+1, p.z-4);
    sun.position.set(p.x+60,80,p.z+40);
    sun.target.position.set(p.x,0,p.z);
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
    const px=playerEgg.mesh.position.x, pz=playerEgg.mesh.position.z, py=playerEgg.mesh.position.y;

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
    if(_beamSoundCD>0)_beamSoundCD--;
    if(_explSoundCD>0)_explSoundCD--;
    if(_missileSoundCD>0)_missileSoundCD--;
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
    // Skip portal triggers while spin dashing
    if(_pipeArrivalCooldown>0)_pipeArrivalCooldown--;
    if(_pipeTraveling||_pipeArrivalCooldown>0||_spinDashing){document.getElementById('portal-prompt').style.display='none';} else {
    var _pp=document.getElementById('portal-prompt');
    var _pt=document.getElementById('portal-prompt-text');
    var _nearP=null, _nearD=9999;
    for(var pi=0;pi<portals.length;pi++){
        var _dx=px-portals[pi].x, _dz=pz-portals[pi].z;
        var _dy=(currentCityStyle===5)?(py-(portals[pi].y||0)):0;
        var _d=Math.sqrt(_dx*_dx+_dz*_dz+_dy*_dy);
        // Ground portals: only trigger when player is near ground level (y < 4)
        if(currentCityStyle!==5&&py>4)continue;
        if(_d<_nearD){_nearD=_d;_nearP=portals[pi];}
    }
    if(_nearP&&_nearD<6.0){
        _pp.style.display='block';
        var _dismissKey=(_nearP.raceIndex>=0)?_nearP.raceIndex:('h'+(_nearP._targetStyle||0));
        if(_nearD<2.5&&!_portalConfirmOpen&&_portalDismissed!==_dismissKey){
            _pp.style.display='none';
            showPortalConfirm(_nearP);
        } else if(!_portalConfirmOpen){
            _pt.textContent=_nearP.name+' \u2014 '+_nearP.desc+'  ('+L('walkIn')+')';
        }
    } else if(!_portalConfirmOpen){
        _pp.style.display='none';
        _portalDismissed=null;
    }
    } // end if !_pipeTraveling

    // Coins
    for(const c of cityCoins){
        if(c.collected)continue;
        // Sonic-style scatter physics
        if(c._scatterTimer>0){
            c._scatterTimer--;
            c.mesh.position.x+=c._scatterVX;
            c.mesh.position.y+=c._scatterVY;
            c.mesh.position.z+=c._scatterVZ;
            c._scatterVY-=0.008; // gravity
            c.mesh.rotation.y+=0.2;
            c.mesh.rotation.x+=0.15;
            // Bounce on ground
            if(c.mesh.position.y<1.2){c.mesh.position.y=1.2;c._scatterVY=Math.abs(c._scatterVY)*0.5;c._scatterVX*=0.7;c._scatterVZ*=0.7;}
            // Building wall bounce for scattered coins
            for(var _sci=0;_sci<cityColliders.length;_sci++){
                    var _sc=cityColliders[_sci];
                    var _scdx=c.mesh.position.x-_sc.x, _scdz=c.mesh.position.z-_sc.z;
                    if(Math.abs(_scdx)<_sc.hw+0.5&&Math.abs(_scdz)<_sc.hd+0.5&&c.mesh.position.y<(_sc.h||6)){
                        var _scox=_sc.hw+0.5-Math.abs(_scdx);
                        var _scoz=_sc.hd+0.5-Math.abs(_scdz);
                        if(_scox<_scoz){c.mesh.position.x+=(_scdx>=0?1:-1)*_scox;c._scatterVX*=-0.5;}
                        else{c.mesh.position.z+=(_scdz>=0?1:-1)*_scoz;c._scatterVZ*=-0.5;}
                        break;
                    }
                }
                // City boundary bounce for coins
                var _cb=(currentCityStyle===5?MOON_CITY_SIZE:CITY_SIZE)-1;
                if(c.mesh.position.x>_cb){c.mesh.position.x=_cb;c._scatterVX=-Math.abs(c._scatterVX)*0.4;}
                if(c.mesh.position.x<-_cb){c.mesh.position.x=-_cb;c._scatterVX=Math.abs(c._scatterVX)*0.4;}
                if(c.mesh.position.z>_cb){c.mesh.position.z=_cb;c._scatterVZ=-Math.abs(c._scatterVZ)*0.4;}
                if(c.mesh.position.z<-_cb){c.mesh.position.z=-_cb;c._scatterVZ=Math.abs(c._scatterVZ)*0.4;}
            if(c._scatterTimer<=0){
                // Settle coin at final position
                c.baseY=1.2;c.mesh.position.y=1.2;
                c._scatterVX=0;c._scatterVY=0;c._scatterVZ=0;
            }
            continue; // skip normal bobbing while scattering
        }
        c.mesh.rotation.y+=0.03;
        var coinBaseY=c.baseY||1.2;
        c.mesh.position.y=coinBaseY+Math.sin(Date.now()*0.003+c.mesh.position.x)*0.2;
        var cdx2=px-c.mesh.position.x, cdz2=pz-c.mesh.position.z, cdy2=py-c.mesh.position.y;
        if(Math.sqrt(cdx2*cdx2+cdz2*cdz2+cdy2*cdy2)<1.5){
            c.collected=true; c.mesh.visible=false;
            coins++; document.getElementById('coin-hud').textContent='⭐ '+coins;
            playCoinSound();
            // Tower of Babel trigger at 10 coins
            if(coins>=10&&!_babylonTriggered){_triggerBabylonEvent();}
        }
    }

    // NPC AI
    for(const npc of cityNPCs){
        updateCityNPC(npc);
        updateEggPhysics(npc, true);
        _updateStunStars(npc);
    }

    // ---- Tower of Babel rise animation ----
    if(_babylonRising&&_babylonTower){
        _babylonRiseY+=0.29; // rise speed (~3 seconds)
        // Push player away from tower during rise
        if(playerEgg){
            var brx=px-_babylonTower.x, brz=pz-_babylonTower.z;
            var brd=Math.sqrt(brx*brx+brz*brz);
            var brHalf=_babylonTower.baseW/2+1.5;
            if(brd<brHalf&&brd>0.01){
                var brPush=(brHalf-brd)*0.15;
                playerEgg.vx+=brx/brd*brPush;playerEgg.vz+=brz/brd*brPush;
            }
        }
        if(_babylonRiseY>=0){
            _babylonRiseY=0;
            _babylonRising=false;
            // Add wall colliders now that tower is fully risen
            if(!_babylonTower._collidersAdded){
                _babylonTower._collidersAdded=true;
                var bw=_babylonTower.baseW||16, bd=_babylonTower.baseD||16;
                var tx=_babylonTower.x, tz=_babylonTower.z, tTop=_babylonTower.topY;
                // Solid body collider (player can't walk through)
                // Split into left and right halves with door gap on +Z face
                var doorGap=2.0; // door width
                cityColliders.push({x:tx,z:tz,hw:bw/2,hd:bd/2,h:tTop,_babel:true});
                // Add tower meshes to building occlusion array
                var _babelMeshes=[];
                _babylonTower.group.traverse(function(child){if(child.isMesh)_babelMeshes.push(child);});
                cityBuildingMeshes.push({meshes:_babelMeshes,x:tx,z:tz,hw:bw/2,hd:bd/2,h:tTop,_babel:true});
            }
        }
        _babylonTower.group.position.y=_babylonRiseY;
    }
    // ---- Tower of Babel door collision (4 doors: N/S/E/W) ----
    if(_babylonTower&&!_pipeTraveling&&!_portalConfirmOpen&&!_babylonElevator&&!_spinDashing){
        var bt=_babylonTower;
        var bHalfW=bt.baseW/2+0.5;
        // Check all 4 door positions
        var _babelDoors=[
            {x:bt.x,z:bt.z+bHalfW},{x:bt.x,z:bt.z-bHalfW},
            {x:bt.x+bHalfW,z:bt.z},{x:bt.x-bHalfW,z:bt.z}
        ];
        var _nearestBabelDoor=9999;
        for(var bdi=0;bdi<4;bdi++){
            var bdx2=px-_babelDoors[bdi].x, bdz2=pz-_babelDoors[bdi].z;
            var bdd=Math.sqrt(bdx2*bdx2+bdz2*bdz2);
            if(bdd<_nearestBabelDoor)_nearestBabelDoor=bdd;
            if(bdd<3&&py<3&&!_babylonPromptDismissed&&!_babylonRising){
                _showBabylonPrompt(1);
            }
        }
        // Top of tower — return elevator
        var topDoorX=bt.x, topDoorZ=bt.z;
        var tdx=px-topDoorX, tdz=pz-topDoorZ;
        var tdist=Math.sqrt(tdx*tdx+tdz*tdz);
        if(tdist<3&&py>=bt.topY-2&&py<=bt.topY+4&&!_babylonPromptDismissed&&!_babylonRising){
            _showBabylonPrompt(-1);
        }
        if(_nearestBabelDoor>4.5&&tdist>4.5)_babylonPromptDismissed=false;
    }
    // ---- Babel elevator ride animation ----
    if(_babylonElevator&&_babylonTower&&playerEgg){
        var bt2=_babylonTower;
        var elevSpeed=0.35;
        _babylonElevY+=_babylonElevDir*elevSpeed;
        playerEgg.mesh.position.set(bt2.x,_babylonElevY,bt2.z);
        playerEgg.vx=0;playerEgg.vy=0;playerEgg.vz=0;
        playerEgg.onGround=true;
        // Arrived at top
        if(_babylonElevDir===1&&_babylonElevY>=bt2.topY+1){
            _babylonElevator=false;
            playerEgg.mesh.position.set(bt2.x,bt2.topY+1,bt2.z);
            playerEgg.onGround=true;
            _babylonPromptDismissed=true; // don't immediately prompt to go back down
            _showCloudAreaName();
        }
        // Arrived at bottom
        if(_babylonElevDir===-1&&_babylonElevY<=1){
            _babylonElevator=false;
            playerEgg.mesh.position.set(bt2.x,1,bt2.z+9);
            playerEgg.onGround=false;
            _babylonPromptDismissed=true; // don't immediately prompt to go back up
        }
    }

    // Moving clouds
    for(var mci=0;mci<cityCloudPlatforms.length;mci++){
        var mc=cityCloudPlatforms[mci];
        if(!mc.moving)continue;
        mc.movePhase+=mc.moveSpeed;
        var offset=Math.sin(mc.movePhase)*mc.moveRange;
        if(mc.moveAxis==='x'){
            mc.group.position.x=mc.baseX+offset;
            mc.x=mc.baseX+offset;
        } else {
            mc.group.position.z=mc.baseZ+offset;
            mc.z=mc.baseZ+offset;
        }
    }
    // Moon earth rotation + star twinkling
    if(window._moonEarth){window._moonEarth.rotation.y+=0.001;}
    if(window._moonStars){
        var st2=Date.now()*0.003;
        for(var si2=0;si2<window._moonStars.length;si2++){
            var s=window._moonStars[si2];
            s.mesh.material.opacity=0.3+0.7*Math.abs(Math.sin(st2*s.speed+s.phase));
        }
    }
    // ---- Moon rover movement ----
    if(window._moonRover){
        var rv=window._moonRover;
        rv.timer++;
        rv.turnTimer--;
        if(rv.turnTimer<=0){
            rv.targetAngle=Math.random()*Math.PI*2;
            rv.turnTimer=120+Math.floor(Math.random()*180);
        }
        // Smoothly turn toward target angle
        var aDiff=rv.targetAngle-rv.angle;
        while(aDiff>Math.PI)aDiff-=Math.PI*2;
        while(aDiff<-Math.PI)aDiff+=Math.PI*2;
        rv.angle+=aDiff*0.02;
        // Move forward
        var rvNx=rv.x+Math.cos(rv.angle)*rv.speed;
        var rvNz=rv.z+Math.sin(rv.angle)*rv.speed;
        // Keep on battlefield (x>20, within bounds)
        if(rvNx>20&&rvNx<350&&Math.abs(rvNz)<280){
            rv.x=rvNx;rv.z=rvNz;
        } else {
            rv.targetAngle=Math.atan2(-rv.z,-rv.x+150);
            rv.turnTimer=60;
        }
        rv.group.position.x=rv.x;rv.group.position.z=rv.z;
        rv.group.rotation.y=rv.angle;
    }
    // ---- Animate earth return portal ----
    if(window._earthReturnPortal){
        var erp=window._earthReturnPortal;
        var ert=Date.now()*0.001;
        erp.ring.rotation.z=ert*0.5;
        erp.inner.rotation.z=-ert*0.8;
        erp.earth.rotation.y=ert*0.3;
        erp.earth.position.y=4+Math.sin(ert)*0.3;
    }
    // ---- Gundam battle animation ----
    if(window._moonGundams){
        var gt=Date.now()*0.001;
        // Get player position for MS clustering (flat battlefield)
        var _plAng=0, _plElev=0;
        if(playerEgg){
            var _pdx=playerEgg.mesh.position.x, _pdz=playerEgg.mesh.position.z;
            _plAng=Math.atan2(_pdz,_pdx);
            _plElev=0;
        }
        for(var ggi=0;ggi<window._moonGundams.length;ggi++){
            var gm=window._moonGundams[ggi];
            if(gm._dead)continue;
            gm.phase+=0.03;
            // Waypoint AI: move toward random waypoint near player
            gm.wpTimer--;
            if(gm.wpTimer<=0){
                gm.wpTimer=60+Math.floor(Math.random()*120);
                // Bias waypoints toward player position (within ~120 degrees)
                gm.wpAngle=_plAng+(Math.random()-0.5)*Math.PI*1.3;
                gm.wpElev=_plElev+(Math.random()-0.5)*Math.PI*0.6;
                gm.wpElev=Math.max(-Math.PI*0.45,Math.min(Math.PI*0.45,gm.wpElev));
                gm.wpR=30+Math.random()*60;
                if(gm.ms==='sdf1')gm.wpR=200+Math.random()*100;
                if(gm.ms==='zenCruiser')gm.wpR=150+Math.random()*100;
            }
            // Random dodge maneuver
            if(gm.dodgeTimer>0){gm.dodgeTimer--;}
            else if(Math.random()<0.02){gm.dodgeTimer=10+Math.floor(Math.random()*15);gm.dodgeDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();}
            // Compute waypoint world position (spread across battlefield)
            var wpx=Math.cos(gm.wpAngle)*200;
            var wpy=gm.wpR;
            var wpz=Math.sin(gm.wpAngle)*200;
            // Steer toward waypoint
            var dx3=wpx-gm.group.position.x,dy3=wpy-gm.group.position.y,dz3=wpz-gm.group.position.z;
            var dd3=Math.sqrt(dx3*dx3+dy3*dy3+dz3*dz3)||1;
            var spd=gm.speed;
            gm.group.position.x+=dx3/dd3*spd;
            gm.group.position.y+=dy3/dd3*spd;
            gm.group.position.z+=dz3/dd3*spd;
            // Dodge offset
            if(gm.dodgeTimer>0&&gm.dodgeDir){
                gm.group.position.x+=gm.dodgeDir.x*spd*0.5;
                gm.group.position.y+=gm.dodgeDir.y*spd*0.5;
                gm.group.position.z+=gm.dodgeDir.z*spd*0.5;
            }
            // Face direction of travel
            var gx=gm.group.position.x,gy=gm.group.position.y,gz=gm.group.position.z;
            // Shield deflection — MS can't enter city shields
            var _gsShield=_checkMoonShield(gx,gy,gz);
            if(_gsShield){
                var _gsdx=gx-_gsShield.x,_gsdy=gy-_gsShield.y,_gsdz=gz-_gsShield.z;
                var _gsd=Math.sqrt(_gsdx*_gsdx+_gsdy*_gsdy+_gsdz*_gsdz)||1;
                // Push out to shield surface
                gm.group.position.x=_gsShield.x+_gsdx/_gsd*(_gsShield.r+1);
                gm.group.position.y=_gsShield.y+_gsdy/_gsd*(_gsShield.r+1);
                gm.group.position.z=_gsShield.z+_gsdz/_gsd*(_gsShield.r+1);
                gx=gm.group.position.x;gy=gm.group.position.y;gz=gm.group.position.z;
                gm.wpTimer=0; // pick new waypoint
                if(Math.random()<0.08)_spawnATField(gx,gy,gz,_gsdx/_gsd,_gsdy/_gsd,_gsdz/_gsd);
            }
            gm.group.lookAt(wpx,wpy,wpz);
            if(dd3<3)gm.wpTimer=0; // arrived, pick new waypoint
            // Saber duel: fast swing
            if(gm.type==='saber'&&gm.saberMesh){
                gm.saberMesh.rotation.x=-0.3+Math.sin(gt*8+ggi*2)*0.9;
                gm.saberMesh.rotation.z=Math.sin(gt*7+ggi*3)*0.5;
                // Saber clash sparks
                if(gm.duelPartner&&Math.random()<0.04&&window._moonBeams.length<300){
                    var sp=new THREE.Mesh(new THREE.SphereGeometry(0.3,4,3),new THREE.MeshBasicMaterial({color:0xFFFF44,transparent:true,opacity:1.0}));
                    sp.position.set(gx+(Math.random()-0.5)*2,gy+(Math.random()-0.5)*2,gz+(Math.random()-0.5)*2);
                    scene.add(sp);
                    window._moonBeams.push({mesh:sp,life:8,vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5,vz:(Math.random()-0.5)*0.5});
                }
            }
            // Funnels: orbit + shoot
            if(gm.type==='funnel'&&gm.funnels){
                for(var ffi=0;ffi<gm.funnels.length;ffi++){
                    var ff=gm.funnels[ffi];
                    ff.angle+=0.06;
                    var fd=ff.dist+Math.sin(gt*3+ffi)*0.5;
                    ff.mesh.position.set(Math.cos(ff.angle)*fd,Math.sin(ff.angle*0.7+ffi)*fd*0.5,Math.sin(ff.angle)*fd);
                    if(Math.random()<0.03&&window._moonBeams.length<300){
                        var bDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                        var fWorld=new THREE.Vector3();ff.mesh.getWorldPosition(fWorld);
                        var fb=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,8,4),new THREE.MeshBasicMaterial({color:0xFF44FF,transparent:true,opacity:0.9}));
                        fb.position.copy(fWorld);fb.lookAt(fWorld.x+bDir.x,fWorld.y+bDir.y,fWorld.z+bDir.z);fb.rotateX(Math.PI/2);
                        scene.add(fb);
                        window._moonBeams.push({mesh:fb,life:25,vx:bDir.x*3,vy:bDir.y*3,vz:bDir.z*3});
                    }
                }
            }
            // Rifle: frequent beam shots
            gm.actionTimer--;
            if(gm.type==='rifle'&&gm.actionTimer<=0){
                gm.actionTimer=25+Math.floor(Math.random()*45);
                if(window._moonBeams.length<300){
                    var beamColor=gm.faction==='efsf'?0xFF8844:gm.faction==='unSpacy'?0x44CCFF:gm.faction==='zentradi'?0x88FF44:0x44FF44;
                    var bm=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,4,4),new THREE.MeshBasicMaterial({color:beamColor,transparent:true,opacity:0.9}));
                    var fwd3=new THREE.Vector3(0,0,1).applyQuaternion(gm.group.quaternion);
                    bm.position.set(gx+fwd3.x*2,gy+fwd3.y*2,gz+fwd3.z*2);
                    bm.lookAt(gx+fwd3.x*20,gy+fwd3.y*20,gz+fwd3.z*20);bm.rotateX(Math.PI/2);
                    scene.add(bm);
                    window._moonBeams.push({mesh:bm,life:35,vx:fwd3.x*4,vy:fwd3.y*4,vz:fwd3.z*4});
                    playBeamSound();
                }
            }
            // Missile: frequent launch
            if(gm.type==='missile'&&gm.actionTimer<=0){
                gm.actionTimer=40+Math.floor(Math.random()*60);
                if(window._moonMissiles.length<150){
                    var mg=new THREE.Group();
                    var mbody=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.06,1.0,6),new THREE.MeshStandardMaterial({color:0x888888}));
                    mbody.rotation.x=Math.PI/2;mg.add(mbody);
                    var mnose=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.3,6),new THREE.MeshStandardMaterial({color:0xCC4444}));
                    mnose.rotation.x=-Math.PI/2;mnose.position.z=0.65;mg.add(mnose);
                    var mflame=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.5,4),new THREE.MeshBasicMaterial({color:0xFF6600,transparent:true,opacity:0.7}));
                    mflame.rotation.x=Math.PI/2;mflame.position.z=-0.7;mg.add(mflame);
                    var mfwd3=new THREE.Vector3(0,0,1).applyQuaternion(gm.group.quaternion);
                    mfwd3.x+=(Math.random()-0.5)*0.4;mfwd3.y+=(Math.random()-0.5)*0.4;mfwd3.z+=(Math.random()-0.5)*0.4;mfwd3.normalize();
                    mg.position.set(gx,gy,gz);
                    mg.lookAt(gx+mfwd3.x,gy+mfwd3.y,gz+mfwd3.z);
                    scene.add(mg);
                    window._moonMissiles.push({group:mg,life:80,vx:mfwd3.x*2.5,vy:mfwd3.y*2.5,vz:mfwd3.z*2.5,trail:[]});
                    playMissileSound();
                }
            }
            // Random explosions near MS (battle damage effects)
            if(Math.random()<0.012&&window._moonBeams.length<300){
                var exOff=2+Math.random()*4;
                var exDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                var exSize=0.5+Math.random()*1.0;
                var exColors=[0xFF4400,0xFF8800,0xFFCC00,0xFF6600];
                var exColor=exColors[Math.floor(Math.random()*exColors.length)];
                var exMesh=new THREE.Mesh(new THREE.SphereGeometry(exSize,6,4),new THREE.MeshBasicMaterial({color:exColor,transparent:true,opacity:0.9}));
                exMesh.position.set(gx+exDir.x*exOff,gy+exDir.y*exOff,gz+exDir.z*exOff);
                scene.add(exMesh);
                window._moonBeams.push({mesh:exMesh,life:15,vx:exDir.x*0.3,vy:exDir.y*0.3,vz:exDir.z*0.3,_isExplosion:true});
                playExplosionSound();
                // Debris particles
                for(var dbi=0;dbi<3;dbi++){
                    var dbDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                    var dbMesh=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2),new THREE.MeshBasicMaterial({color:0x666666,transparent:true,opacity:0.8}));
                    dbMesh.position.copy(exMesh.position);
                    scene.add(dbMesh);
                    window._moonBeams.push({mesh:dbMesh,life:20,vx:dbDir.x*1.5,vy:dbDir.y*1.5,vz:dbDir.z*1.5});
                }
                // Deal damage to this MS
                gm.hp=(gm.hp||gm.hpMax)-1;
            }
        }
        // ---- MS destruction: remove dead units with big explosion ----
        for(var _di=window._moonGundams.length-1;_di>=0;_di--){
            var _dm=window._moonGundams[_di];
            if(_dm._dead){
                // Respawn timer countdown
                _dm._respawnTimer--;
                if(_dm._respawnTimer<=0){
                    // Respawn: rebuild MS and fly in above battlefield
                    var _newGd=_buildMobileSuit(_dm._msType,_dm._weaponType,_dm._color);
                    // Spawn above battlefield (spread across map)
                    var _isLargeShip=(_dm._msType==='sdf1'||_dm._msType==='zenCruiser');
                    var _rsAngle=Math.random()*Math.PI*2;
                    var _rsDist=100+Math.random()*250;
                    var _sx=Math.cos(_rsAngle)*_rsDist;
                    var _sy=_isLargeShip?200+Math.random()*100:30+Math.random()*60;
                    var _sz=Math.sin(_rsAngle)*_rsDist;
                    _newGd.group.position.set(_sx,_sy,_sz);
                    _newGd.group.scale.set(2,2,2);
                    scene.add(_newGd.group);
                    _dm.group=_newGd.group;_dm.funnels=_newGd.funnels||null;_dm.saberMesh=_newGd.saberMesh||null;_dm.weapon=_newGd.weapon||null;
                    _dm.hp=_dm.hpMax;_dm._dead=false;
                    _dm.wpAngle=Math.random()*Math.PI*2;_dm.wpElev=0;
                    _dm.wpR=_isLargeShip?200+Math.random()*100:30+Math.random()*60;
                    _dm.wpTimer=5;
                }
                continue;
            }
            if(_dm.hp<=0&&!_dm._dead){
                // Destroy: big explosion + scatter debris
                var _dpos=_dm.group.position;
                var _dScale=_dm.ms==='sdf1'?8:_dm.ms==='zenCruiser'?6:3;
                for(var _ei=0;_ei<4;_ei++){
                    var _eDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                    var _eR=_dScale*(1+_ei*0.5);
                    var _eC=[0xFF4400,0xFF8800,0xFFCC00,0xFFFFFF][_ei%4];
                    var _eM=new THREE.Mesh(new THREE.SphereGeometry(_eR,6,4),new THREE.MeshBasicMaterial({color:_eC,transparent:true,opacity:0.95}));
                    _eM.position.set(_dpos.x+_eDir.x*_ei*0.5,_dpos.y+_eDir.y*_ei*0.5,_dpos.z+_eDir.z*_ei*0.5);
                    scene.add(_eM);
                    window._moonBeams.push({mesh:_eM,life:12+_ei*3,vx:_eDir.x*0.4,vy:_eDir.y*0.4,vz:_eDir.z*0.4,_isExplosion:true});
                }
                // Scatter debris pieces
                for(var _dbi=0;_dbi<4;_dbi++){
                    var _dbD=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                    var _dbM=new THREE.Mesh(new THREE.BoxGeometry(0.15*_dScale,0.1*_dScale,0.08*_dScale),new THREE.MeshBasicMaterial({color:0x555566,transparent:true,opacity:0.8}));
                    _dbM.position.copy(_dpos);scene.add(_dbM);
                    window._moonBeams.push({mesh:_dbM,life:30,vx:_dbD.x*2.5,vy:_dbD.y*2.5,vz:_dbD.z*2.5});
                }
                playExplosionSound();
                // Hide the MS group
                scene.remove(_dm.group);
                _dm._dead=true;
                _dm._respawnTimer=300+Math.floor(Math.random()*300); // 5-10 seconds
            }
        }
        // Determine if player is inside a city shield — hide all battle visuals if so
        var _playerInShield=playerEgg?_checkMoonShield(playerEgg.mesh.position.x,playerEgg.mesh.position.y,playerEgg.mesh.position.z):null;
        // Hide/show Gundam groups based on player shield status
        for(var _gvi=0;_gvi<window._moonGundams.length;_gvi++){
            var _gvm=window._moonGundams[_gvi];
            if(_gvm.group)_gvm.group.visible=!_playerInShield;
        }
        // Update beams + explosions
        for(var bbi=window._moonBeams.length-1;bbi>=0;bbi--){
            var bb=window._moonBeams[bbi];
            bb.mesh.position.x+=bb.vx;bb.mesh.position.y+=bb.vy;bb.mesh.position.z+=bb.vz;
            bb.life--;
            bb.mesh.visible=!_playerInShield;
            if(bb._isExplosion){
                if(bb._atField){
                    // AT Field ripple: delayed appearance, expand outward, then fade
                    if(bb._atDelay>0){
                        bb._atDelay--;
                        bb.mesh.visible=false;
                        bb.life++; // don't count down while waiting
                    } else {
                        bb.mesh.visible=!_playerInShield;
                        bb._atAge++;
                        if(bb._atMaxR){
                            // Ring: expand from small to max radius
                            var expandT=Math.min(bb._atAge/20,1);
                            var curR=1+expandT*(bb._atMaxR-1);
                            bb.mesh.scale.set(curR,curR,1);
                            // Fade in then out
                            if(bb._atAge<8) bb.mesh.material.opacity=bb._atAge/8*0.8;
                            else bb.mesh.material.opacity=Math.max(0,(bb.life/40)*0.8);
                        } else {
                            // Central flash: just fade
                            bb.mesh.material.opacity=Math.max(0,bb.life/20*0.9);
                            bb.mesh.scale.multiplyScalar(1.03);
                        }
                    }
                } else {
                    bb.mesh.material.opacity=bb.life/15*0.9;
                    bb.mesh.scale.multiplyScalar(1.1);
                }
            } else {
                bb.mesh.material.opacity=Math.max(0,bb.life/35);
                // Shield collision — AT Field effect
                if(!bb._shieldHit){
                    var _bs=_checkMoonShield(bb.mesh.position.x,bb.mesh.position.y,bb.mesh.position.z);
                    if(_bs){
                        var _bsx=bb.mesh.position.x-_bs.x,_bsy=bb.mesh.position.y-_bs.y,_bsz=bb.mesh.position.z-_bs.z;
                        var _bsd=Math.sqrt(_bsx*_bsx+_bsy*_bsy+_bsz*_bsz)||1;
                        _spawnATField(bb.mesh.position.x,bb.mesh.position.y,bb.mesh.position.z,_bsx/_bsd,_bsy/_bsd,_bsz/_bsd);
                        bb._shieldHit=true;bb.life=Math.min(bb.life,3);
                        bb.vx*=-0.3;bb.vy*=-0.3;bb.vz*=-0.3;
                    }
                }
                // Beam hits eggs (same as being thrown) — skip eggs inside city shields
                if(!bb._hitEgg)for(var _bei=0;_bei<allEggs.length;_bei++){
                    var _be=allEggs[_bei];if(!_be.alive||_be.heldBy||_be.throwTimer>0)continue;
                    if(_checkMoonShield(_be.mesh.position.x,_be.mesh.position.y,_be.mesh.position.z))continue;
                    var _bdx=_be.mesh.position.x-bb.mesh.position.x;
                    var _bdy=_be.mesh.position.y-bb.mesh.position.y;
                    var _bdz=_be.mesh.position.z-bb.mesh.position.z;
                    var _bd=Math.sqrt(_bdx*_bdx+_bdy*_bdy+_bdz*_bdz);
                    if(_bd<2.0){
                        var _bImp=0.15;
                        _be.vx+=bb.vx*_bImp;_be.vy+=bb.vy*_bImp+0.1;_be.vz+=bb.vz*_bImp;
                        _be.throwTimer=15;_be._bounces=1;_be.squash=0.5;
                        if(_be.isPlayer)playHitSound();
                        _dropNpcStolenCoins(_be);
                        bb._hitEgg=true;bb.life=Math.min(bb.life,3);break;
                    }
                }
            }
            if(bb.life<=0){scene.remove(bb.mesh);window._moonBeams.splice(bbi,1);}
        }
        // Update missiles with smoke trails
        for(var mmi2=window._moonMissiles.length-1;mmi2>=0;mmi2--){
            var mm=window._moonMissiles[mmi2];
            mm.group.position.x+=mm.vx;mm.group.position.y+=mm.vy;mm.group.position.z+=mm.vz;
            mm.life--;
            mm.group.visible=!_playerInShield;
            // Smoke trail puff
            if(mm.life%3===0&&mm.trail.length<12){
                var puff=new THREE.Mesh(new THREE.SphereGeometry(0.15+Math.random()*0.15,4,3),new THREE.MeshBasicMaterial({color:0xAAAAAA,transparent:true,opacity:0.5}));
                puff.position.copy(mm.group.position);
                scene.add(puff);
                mm.trail.push({mesh:puff,life:20});
            }
            // Fade trail
            for(var ti=mm.trail.length-1;ti>=0;ti--){
                mm.trail[ti].life--;
                mm.trail[ti].mesh.material.opacity=mm.trail[ti].life/20*0.5;
                mm.trail[ti].mesh.scale.multiplyScalar(1.04);
                mm.trail[ti].mesh.visible=!_playerInShield;
                if(mm.trail[ti].life<=0){scene.remove(mm.trail[ti].mesh);mm.trail.splice(ti,1);}
            }
            // Missile hits shields — AT Field
            if(!mm._shieldHit){
                var _ms=_checkMoonShield(mm.group.position.x,mm.group.position.y,mm.group.position.z);
                if(_ms){
                    var _msx=mm.group.position.x-_ms.x,_msy=mm.group.position.y-_ms.y,_msz=mm.group.position.z-_ms.z;
                    var _msd=Math.sqrt(_msx*_msx+_msy*_msy+_msz*_msz)||1;
                    _spawnATField(mm.group.position.x,mm.group.position.y,mm.group.position.z,_msx/_msd,_msy/_msd,_msz/_msd);
                    mm._shieldHit=true;mm.life=0;
                }
            }
            // Missile hits eggs — skip eggs inside city shields
            if(!mm._hitEgg)for(var _mei=0;_mei<allEggs.length;_mei++){
                var _me=allEggs[_mei];if(!_me.alive||_me.heldBy||_me.throwTimer>0)continue;
                if(_checkMoonShield(_me.mesh.position.x,_me.mesh.position.y,_me.mesh.position.z))continue;
                var _mdx=_me.mesh.position.x-mm.group.position.x;
                var _mdy=_me.mesh.position.y-mm.group.position.y;
                var _mdz=_me.mesh.position.z-mm.group.position.z;
                var _md=Math.sqrt(_mdx*_mdx+_mdy*_mdy+_mdz*_mdz);
                if(_md<3.0){
                    var _mImp=0.2;if(_md>0.1){_me.vx+=_mdx/_md*_mImp;_me.vy+=_mdy/_md*_mImp+0.15;_me.vz+=_mdz/_md*_mImp;}
                    _me.throwTimer=20;_me._bounces=1;_me.squash=0.4;
                    if(_me.isPlayer)playHitSound();
                    _dropNpcStolenCoins(_me);
                    mm._hitEgg=true;mm.life=0;break;
                }
            }
            // Missile expired — big explosion
            if(mm.life<=0){
                // Multi-layer explosion
                var exColors2=[0xFF4400,0xFF8800,0xFFCC00];
                for(var exi=0;exi<3;exi++){
                    var exR=0.5+exi*0.4;
                    var flash=new THREE.Mesh(new THREE.SphereGeometry(exR,6,4),new THREE.MeshBasicMaterial({color:exColors2[exi%3],transparent:true,opacity:0.9-exi*0.15}));
                    flash.position.copy(mm.group.position);
                    flash.position.x+=(Math.random()-0.5)*0.5;flash.position.y+=(Math.random()-0.5)*0.5;flash.position.z+=(Math.random()-0.5)*0.5;
                    scene.add(flash);
                    window._moonBeams.push({mesh:flash,life:10+exi*4,vx:0,vy:0,vz:0,_isExplosion:true});
                }
                playExplosionSound();
                // Shrapnel
                for(var shi=0;shi<4;shi++){
                    var shDir=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
                    var shMesh=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.15,0.15),new THREE.MeshBasicMaterial({color:0x888888,transparent:true,opacity:0.7}));
                    shMesh.position.copy(mm.group.position);scene.add(shMesh);
                    window._moonBeams.push({mesh:shMesh,life:18,vx:shDir.x*2,vy:shDir.y*2,vz:shDir.z*2});
                }
                for(var tri=mm.trail.length-1;tri>=0;tri--){scene.remove(mm.trail[tri].mesh);}
                scene.remove(mm.group);window._moonMissiles.splice(mmi2,1);
            }
        }
    }
}

// ---- Struggle bar (HTML overlay) ----
var struggleBarDiv=null;
function ensureStruggleBar(){
    if(struggleBarDiv)return;
    struggleBarDiv=document.createElement('div');
    struggleBarDiv.id='struggle-bar-container';
    struggleBarDiv.style.cssText='position:absolute;top:18%;left:50%;transform:translateX(-50%);z-index:15;pointer-events:none;display:none;text-align:center;';
    var _stText=L('struggle');struggleBarDiv.innerHTML='<div id="struggle-text" style="color:#fff;font-size:13px;font-weight:700;text-shadow:1px 1px 0 #000;margin-bottom:4px">'+_stText+'</div><div style="width:180px;height:14px;background:rgba(0,0,0,0.5);border-radius:7px;border:2px solid rgba(255,255,255,0.3);overflow:hidden"><div id="struggle-fill" style="height:100%;background:linear-gradient(90deg,#FF4444,#FFAA00);border-radius:5px;width:100%;transition:width 0.05s"></div></div>';
    document.getElementById('game-container').appendChild(struggleBarDiv);
}

// ---- PSOBB-style Chat Bubble System ----
var _chatBubbles=[]; // {egg, div, timer}
var _chatInput=null, _chatOpen=false;
function _ensureChatInput(){
    if(_chatInput)return;
    _chatInput=document.createElement('div');
    _chatInput.id='chat-input-bar';
    _chatInput.style.cssText='position:absolute;bottom:60px;left:50%;transform:translateX(-50%);z-index:20;display:none;';
    _chatInput.innerHTML='<input id="chat-field" type="text" maxlength="40" style="width:260px;padding:8px 12px;border:2px solid rgba(255,255,255,0.4);border-radius:20px;background:rgba(0,0,0,0.7);color:#fff;font-size:14px;outline:none;backdrop-filter:blur(6px);" placeholder="'+L('chatPlaceholder')+'">';
    document.getElementById('game-container').appendChild(_chatInput);
    var field=document.getElementById('chat-field');
    field.addEventListener('keydown',function(e){
        e.stopPropagation();
        if(e.code==='Enter'){
            var msg=field.value.trim();
            if(msg){
                // Check for chat commands (don't show bubble)
                if(_processChatCommand(msg)){
                    field.value='';_closeChatInput();
                    return;
                }
                if(playerEgg)_showChatBubble(playerEgg,msg);
            }
            field.value='';_closeChatInput();
        }
        if(e.code==='Escape'){field.value='';_closeChatInput();}
    });
}
function _openChatInput(){
    if(_chatOpen||gameState!=='city')return;
    _ensureChatInput();
    _chatOpen=true;
    _chatInput.style.display='block';
    var field=document.getElementById('chat-field');
    field.placeholder=L('chatPlaceholder');
    field.focus();
}
function _closeChatInput(){
    _chatOpen=false;
    if(_chatInput)_chatInput.style.display='none';
    var field=document.getElementById('chat-field');
    if(field)field.blur();
}
function _processChatCommand(msg){
    var cmd=msg.toLowerCase().replace(/\s+/g,' ').trim();
    // /fly me to the moon — teleport to moon
    if(cmd==='/fly me to the moon'||cmd==='fly me to the moon'){
        if(playerEgg&&currentCityStyle!==5&&gameState==='city'){
            startPipeTravel(playerEgg.mesh.position.x,playerEgg.mesh.position.z,5,playerEgg.mesh.position.y);
        }
        return true;
    }
    // Commands start with / are hidden
    if(msg.charAt(0)==='/') return true;
    return false;
}
function _showChatBubble(egg,msg){
    if(!egg||!egg.mesh)return;
    // Remove old bubble for this egg
    for(var i=_chatBubbles.length-1;i>=0;i--){
        if(_chatBubbles[i].egg===egg){
            if(_chatBubbles[i].sprite)egg.mesh.remove(_chatBubbles[i].sprite);
            _chatBubbles.splice(i,1);
        }
    }
    // Create 3D sprite bubble above egg head (PSOBB comic style)
    var canvas=document.createElement('canvas');
    canvas.width=512;canvas.height=128;
    var ctx2=canvas.getContext('2d');
    // Comic bubble background
    ctx2.fillStyle='rgba(255,255,255,0.92)';
    _drawBubblePath(ctx2,10,10,492,90,18);
    ctx2.fill();
    ctx2.strokeStyle='rgba(0,0,0,0.5)';ctx2.lineWidth=3;
    _drawBubblePath(ctx2,10,10,492,90,18);
    ctx2.stroke();
    // Tail triangle
    ctx2.fillStyle='rgba(255,255,255,0.92)';
    ctx2.beginPath();ctx2.moveTo(230,100);ctx2.lineTo(256,125);ctx2.lineTo(280,100);ctx2.fill();
    ctx2.strokeStyle='rgba(0,0,0,0.5)';ctx2.lineWidth=3;
    ctx2.beginPath();ctx2.moveTo(230,100);ctx2.lineTo(256,125);ctx2.lineTo(280,100);ctx2.stroke();
    // Text
    ctx2.fillStyle='#222';ctx2.font='bold 32px sans-serif';ctx2.textAlign='center';ctx2.textBaseline='middle';
    ctx2.fillText(msg.substring(0,20),256,55);
    var tex=new THREE.CanvasTexture(canvas);
    var spriteMat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});
    var sprite=new THREE.Sprite(spriteMat);
    sprite.scale.set(4,1,1);
    sprite.position.y=3.2;
    egg.mesh.add(sprite);
    _chatBubbles.push({egg:egg,sprite:sprite,timer:300}); // 5 seconds
}
function _drawBubblePath(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
}
function _updateChatBubbles(){
    for(var i=_chatBubbles.length-1;i>=0;i--){
        var cb=_chatBubbles[i];
        cb.timer--;
        if(cb.timer<30&&cb.sprite)cb.sprite.material.opacity=cb.timer/30;
        if(cb.timer<=0){
            if(cb.sprite&&cb.egg&&cb.egg.mesh)cb.egg.mesh.remove(cb.sprite);
            _chatBubbles.splice(i,1);
        }
    }
}
// NPC random chat bubbles
var _npcChatPhrases={
    zhs:['\u4F60\u597D\uFF01','\u54C8\u54C8','\u8DD1\u5440\uFF01','\u52A0\u6CB9\uFF01','\u563F\u563F','\u597D\u73A9\uFF01','\u8981\u8D62\uFF01','\u522B\u8DD1\uFF01','\u6765\u6293\u6211\u5440','\u54CE\u5440\uFF01'],
    zht:['\u4F60\u597D\uFF01','\u54C8\u54C8','\u8DD1\u5440\uFF01','\u52A0\u6CB9\uFF01','\u563F\u563F','\u597D\u73A9\uFF01','\u8981\u8D0F\uFF01','\u5225\u8DD1\uFF01','\u4F86\u6293\u6211\u5440','\u54CE\u5440\uFF01'],
    ja:['\u3084\u3042\uFF01','\u30CF\u30CF','\u8D70\u308C\uFF01','\u30D5\u30A1\u30A4\u30C8\uFF01','\u30D8\u30D8','\u697D\u3057\u3044\uFF01','\u52DD\u3064\uFF01','\u9003\u3052\u308D\uFF01','\u6355\u307E\u3048\u3066\u307F\u308D','\u3046\u308F\uFF01'],
    en:['Hi!','Haha','Run!','Go go!','Hehe','Fun!','Win!','Catch me!','Whoa!','Yay!']
};
function _npcRandomChat(egg){
    if(Math.random()>0.0008)return; // very rare
    if(egg.heldBy||!egg.alive)return;
    var phrases=_npcChatPhrases[_langCode]||_npcChatPhrases.en;
    _showChatBubble(egg,phrases[Math.floor(Math.random()*phrases.length)]);
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
            var ntw=egg.weight||1.0;var ntf=0.3/ntw;egg.vx=Math.sin(throwDir)*ntf;egg.vy=-0.02;egg.vz=Math.cos(throwDir)*ntf;egg._throwTotal=60;egg.throwTimer=60;egg._bounces=2;
            if(currentCityStyle===5&&gameState==='city'){egg.vx*=0.3;egg.vy*=0.3;egg.vz*=0.3;egg._throwTotal=60;egg.throwTimer=60;}
            egg.squash=0.5; playThrowSound();
            egg._dropCoinsOnLand=true;egg._coinsDropped=false;
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
            _dropNpcStolenCoins(egg);
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
        if(npc.isPlayer||!npc.alive||npc.heldBy||npc.holding||npc.holdingProp||npc.grabCD>0)continue;
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
            // Drop any prop the grabbed NPC was holding
            if(best.holdingProp){best.holdingProp.grabbed=false;best.holdingProp=null;}
            npc.grabCD=30;
            best.struggleMax=240+Math.floor(Math.random()*240);
            best.struggleTimer=best.struggleMax;
            playGrabSound();
        } else if(gameState==='city'){
            // NPC grab city prop if no egg nearby
            var bestProp=null,bestPD=2.5;
            for(var pp2=0;pp2<cityProps.length;pp2++){
                var cp2=cityProps[pp2];
                if(cp2.grabbed)continue;
                var cpdx=cp2.group.position.x-npc.mesh.position.x;
                var cpdz=cp2.group.position.z-npc.mesh.position.z;
                var cpd2=Math.sqrt(cpdx*cpdx+cpdz*cpdz);
                if(cpd2<bestPD){bestPD=cpd2;bestProp=cp2;}
            }
            if(bestProp){
                npc.holdingProp=bestProp;
                bestProp.grabbed=true;
                bestProp.throwTimer=0;bestProp.throwVx=0;bestProp.throwVy=0;bestProp.throwVz=0;
                bestProp.group.rotation.set(0,0,0);
                npc.grabCD=30;
                npc._npcPropHoldTimer=90+Math.floor(Math.random()*120);
                playGrabSound();
            }
        }
    }
    // ---- NPC throw held props ----
    for(var np2=0;np2<allEggs.length;np2++){
        var npc2=allEggs[np2];
        if(npc2.isPlayer||!npc2.alive||!npc2.holdingProp)continue;
        var hp=npc2.holdingProp;
        hp.group.position.x=npc2.mesh.position.x;
        hp.group.position.y=npc2.mesh.position.y+1.8;
        hp.group.position.z=npc2.mesh.position.z;
        if(!npc2._npcPropHoldTimer)npc2._npcPropHoldTimer=60;
        npc2._npcPropHoldTimer--;
        if(npc2._npcPropHoldTimer<=0){
            // Throw prop toward nearest egg
            var throwDir2=npc2.mesh.rotation.y;
            var nearTgt=null,nearTD=20;
            for(var nt=0;nt<allEggs.length;nt++){
                var tgt=allEggs[nt];
                if(tgt===npc2||!tgt.alive||tgt.heldBy)continue;
                var ntdx=tgt.mesh.position.x-npc2.mesh.position.x;
                var ntdz=tgt.mesh.position.z-npc2.mesh.position.z;
                var ntd=Math.sqrt(ntdx*ntdx+ntdz*ntdz);
                if(ntd<nearTD){nearTD=ntd;nearTgt=tgt;throwDir2=Math.atan2(ntdx,ntdz);}
            }
            npc2.holdingProp=null;
            var pw2=hp.weight||1.0;var pf2=2.5/pw2;
            hp.throwVx=Math.sin(throwDir2)*pf2;hp.throwVy=0.18;hp.throwVz=Math.cos(throwDir2)*pf2;
            hp._bounces=2;hp.throwTimer=25;
            hp.group.position.set(npc2.mesh.position.x+Math.sin(throwDir2)*1.5,npc2.mesh.position.y+0.5,npc2.mesh.position.z+Math.cos(throwDir2)*1.5);
            npc2.grabCD=40;
            playThrowSound();
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
        if(tp.throwTimer<=0){
            // Throw ended — reset grabbed state
            tp.grabbed=false;
            tp.x=tp.group.position.x;tp.z=tp.group.position.z;
            if(tp.group.position.y>0.01){tp.throwVy=-0.05;tp.throwTimer=1;} // still in air, keep falling
            else{tp.group.rotation.set(Math.PI/2*(Math.random()*0.4+0.8)*(Math.random()<0.5?1:-1),Math.random()*Math.PI*2,0);} // topple over
            continue;
        }
        tp.group.position.x+=tp.throwVx;
        tp.group.position.y+=tp.throwVy;
        tp.group.position.z+=tp.throwVz;
        tp.throwVy-=0.012*(tp.weight||1);
        var _tpDrag=tp._chargeDrag||0.92;
        tp.throwVx*=_tpDrag; tp.throwVz*=_tpDrag;
        tp.group.rotation.x+=0.25; tp.group.rotation.z+=0.2;
        // Building collision for thrown props
        for(var _tpci=0;_tpci<cityColliders.length;_tpci++){
            var _tpc=cityColliders[_tpci];
            var _tpdx=tp.group.position.x-_tpc.x, _tpdz=tp.group.position.z-_tpc.z;
            if(Math.abs(_tpdx)<_tpc.hw+1.5&&Math.abs(_tpdz)<_tpc.hd+1.5&&tp.group.position.y<(_tpc.h||6)){
                var _tpox=_tpc.hw+1.5-Math.abs(_tpdx);
                var _tpoz=_tpc.hd+1.5-Math.abs(_tpdz);
                if(_tpox<_tpoz){tp.group.position.x+=(_tpdx>=0?1:-1)*_tpox;tp.throwVx*=-0.3;}
                else{tp.group.position.z+=(_tpdz>=0?1:-1)*_tpoz;tp.throwVz*=-0.3;}
                tp.throwTimer=1;playHitSound();break;
            }
        }
        // City boundary air wall bounce for props
        var _pb=CITY_SIZE-1;
        if(tp.group.position.x>_pb){tp.group.position.x=_pb;tp.throwVx=-Math.abs(tp.throwVx)*0.4;}
        if(tp.group.position.x<-_pb){tp.group.position.x=-_pb;tp.throwVx=Math.abs(tp.throwVx)*0.4;}
        if(tp.group.position.z>_pb){tp.group.position.z=_pb;tp.throwVz=-Math.abs(tp.throwVz)*0.4;}
        if(tp.group.position.z<-_pb){tp.group.position.z=-_pb;tp.throwVz=Math.abs(tp.throwVz)*0.4;}
        if(tp.group.position.y<0.01&&tp.throwVy<0){
            if(tp._bounces>0){tp._bounces--;tp.throwVy=Math.abs(tp.throwVy)*0.45;tp.throwVx*=0.7;tp.throwVz*=0.7;tp.group.position.y=0.01;playHitSound();}
            else{tp.group.position.y=0.01;tp.throwTimer=0;tp.grabbed=false;tp.group.rotation.set(Math.PI/2*(Math.random()*0.4+0.8)*(Math.random()<0.5?1:-1),Math.random()*Math.PI*2,0);tp.x=tp.group.position.x;tp.z=tp.group.position.z;}
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
                _dropNpcStolenCoins(tpeg);
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
        var _obDrag=tob._chargeDrag||0.96;
        tob._throwVx*=_obDrag; tob._throwVz*=_obDrag;
        if(tob.mesh.position.y<(tob.data.fy||0)+0.5&&tob._throwVy<0){
            if(tob._bounces>0){tob._bounces--;tob._throwVy=Math.abs(tob._throwVy)*0.45;tob._throwVx*=0.7;tob._throwVz*=0.7;tob.mesh.position.y=(tob.data.fy||0)+0.5;playHitSound();}
            else{tob.mesh.position.y=(tob.data.fy||0)+0.5;tob._throwTimer=0;tob._grabbed=false;}
        }
        // Hit other eggs with thrown obstacle
        for(var te=0;te<allEggs.length;te++){
            var teg=allEggs[te];
            if(!teg.alive||teg.heldBy)continue;
            var tdx=teg.mesh.position.x-tob.mesh.position.x;
            var tdz=teg.mesh.position.z-tob.mesh.position.z;
            if(Math.sqrt(tdx*tdx+tdz*tdz)<1.5){
                var oiw=tob._weight||2;teg.vx+=tdx*0.35*oiw;teg.vz+=tdz*0.35*oiw;teg.vy=0.3+0.12*oiw;teg.squash=0.4;teg.throwTimer=15;teg._bounces=1;if(teg.isPlayer)playHitSound();
                _dropNpcStolenCoins(teg);
            }
        }
        if(tob._throwTimer<=0){
            tob._grabbed=false;
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
var _portalConfirmOpen=false, _portalConfirmRace=-1, _portalConfirmTarget=-1, _portalDismissed=null, _portalConfirmHidden=null;
function showPortalConfirm(portal){
    _portalConfirmOpen=true;
    _babylonPromptOpen=false;_moonPipePromptOpen=false; // safety reset
    _portalConfirmRace=portal.raceIndex;
    _portalConfirmTarget=portal._targetStyle||(-1);
    _portalConfirmHidden=portal._hiddenType||null;
    _portalDismissed=null;
    var box=document.getElementById('portal-confirm');
    document.getElementById('portal-confirm-name').textContent=portal.name;
    document.getElementById('portal-confirm-desc').textContent=portal.desc;
    box.style.display='flex';
}
function hidePortalConfirm(){
    _portalDismissed=(_portalConfirmRace>=0)?_portalConfirmRace:('h'+_portalConfirmTarget);
    _portalConfirmOpen=false;
    _portalConfirmRace=-1;
    _portalConfirmTarget=-1;
    _portalConfirmHidden=null;
    document.getElementById('portal-confirm').style.display='none';
}
function confirmPortalEnter(){
    var ri=_portalConfirmRace;
    var ts=_portalConfirmTarget;
    var ht=_portalConfirmHidden;
    hidePortalConfirm();
    document.getElementById('portal-prompt').style.display='none';
    if(ri>=0){ enterRace(ri); }
    else if(ht==='earthReturn'&&playerEgg){
        // Return to Earth with pipe travel effect — go back to previous city
        var _retStyle=(_prevCityStyle>=0&&_prevCityStyle<5)?_prevCityStyle:0;
        startPipeTravel(playerEgg.mesh.position.x,playerEgg.mesh.position.z,_retStyle,playerEgg.mesh.position.y);
    }
    else if(ts>=0){ switchCity(ts); }
}
document.getElementById('portal-yes').addEventListener('click',function(){if(_babylonPromptOpen){_confirmBabylonEnter();}else if(_moonPipePromptOpen){_confirmMoonPipeEnter();}else{confirmPortalEnter();}});
document.getElementById('portal-no').addEventListener('click',function(){if(_babylonPromptOpen){_hideBabylonPrompt();}else if(_moonPipePromptOpen){_hideMoonPipePrompt();}else{hidePortalConfirm();}});

// ---- Babel Tower prompt (reuses portal-confirm dialog) ----
var _babylonPromptOpen=false, _babylonPromptDir=1;
function _showBabylonPrompt(dir){
    if(_babylonPromptOpen||_portalConfirmOpen)return;
    _babylonPromptOpen=true;
    _babylonPromptDir=dir||1;
    _portalConfirmOpen=true;
    var box=document.getElementById('portal-confirm');
    var babelName={zhs:'\u5DF4\u522B\u5854',zht:'\u5DF4\u5225\u5854',ja:'\u30D0\u30D9\u30EB\u306E\u5854',en:'Tower of Babel'};
    var upDesc={zhs:'\u4E58\u5750\u7535\u68AF\u524D\u5F80\u4E91\u4E2D\u754C\uFF1F',zht:'\u4E58\u5750\u96FB\u68AF\u524D\u5F80\u96F2\u4E2D\u754C\uFF1F',ja:'\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u3067\u96F2\u4E2D\u754C\u3078\uFF1F',en:'Take elevator to Cloud Realm?'};
    var downDesc={zhs:'\u4E58\u5750\u7535\u68AF\u8FD4\u56DE\u5730\u9762\uFF1F',zht:'\u4E58\u5750\u96FB\u68AF\u8FD4\u56DE\u5730\u9762\uFF1F',ja:'\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u3067\u5730\u4E0A\u3078\uFF1F',en:'Take elevator back down?'};
    document.getElementById('portal-confirm-name').textContent=babelName[_langCode]||babelName.en;
    document.getElementById('portal-confirm-desc').textContent=(dir===-1?downDesc:upDesc)[_langCode]||(dir===-1?downDesc:upDesc).en;
    box.style.display='flex';
}
function _hideBabylonPrompt(){
    _babylonPromptOpen=false;
    _portalConfirmOpen=false;
    _babylonPromptDismissed=true;
    document.getElementById('portal-confirm').style.display='none';
}
function _confirmBabylonEnter(){
    _babylonPromptOpen=false;
    _portalConfirmOpen=false;
    document.getElementById('portal-confirm').style.display='none';
    if(!_babylonTower)return;
    _babylonElevator=true;
    _babylonElevDir=_babylonPromptDir;
    _babylonElevY=(_babylonPromptDir===1)?1:_babylonTower.topY;
    if(sfxEnabled){
        var ctx=ensureAudio();if(ctx){
            var o=ctx.createOscillator();var g=ctx.createGain();
            o.type='sine';
            if(_babylonPromptDir===1){o.frequency.setValueAtTime(200,ctx.currentTime);o.frequency.linearRampToValueAtTime(600,ctx.currentTime+2);}
            else{o.frequency.setValueAtTime(600,ctx.currentTime);o.frequency.linearRampToValueAtTime(200,ctx.currentTime+2);}
            g.gain.setValueAtTime(0.1,ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+2.5);
            o.connect(g);g.connect(ctx.destination);
            o.start();o.stop(ctx.currentTime+2.5);
        }
    }
}
// ---- Moon Pipe prompt (reuses portal-confirm dialog) ----
function _showMoonPipePrompt(){
    if(_moonPipePromptOpen||_portalConfirmOpen||_babylonPromptOpen)return;
    _moonPipePromptOpen=true;
    _portalConfirmOpen=true;
    var box=document.getElementById('portal-confirm');
    var moonName=CITY_STYLES[5]?CITY_STYLES[5].name:'Moon';
    var desc={zhs:'\u901A\u8FC7\u661F\u7A7A\u96A7\u9053\u524D\u5F80'+moonName+'\uFF1F',zht:'\u901A\u904E\u661F\u7A7A\u96A7\u9053\u524D\u5F80'+moonName+'\uFF1F',ja:'\u661F\u7A7A\u30C8\u30F3\u30CD\u30EB\u3067'+moonName+'\u3078\uFF1F',en:'Travel through starfield tunnel to '+moonName+'?'};
    document.getElementById('portal-confirm-name').textContent=moonName;
    document.getElementById('portal-confirm-desc').textContent=desc[_langCode]||desc.en;
    box.style.display='flex';
}
function _hideMoonPipePrompt(){
    _moonPipePromptOpen=false;
    _portalConfirmOpen=false;
    _moonPipeDismissed=true;
    document.getElementById('portal-confirm').style.display='none';
}
function _confirmMoonPipeEnter(){
    _moonPipePromptOpen=false;
    _portalConfirmOpen=false;
    document.getElementById('portal-confirm').style.display='none';
    if(_cloudWorldPipe){
        startPipeTravel(_cloudWorldPipe.x,_cloudWorldPipe.z,_cloudWorldPipe.targetStyle,_cloudWorldPipe.y);
    }
}
addEventListener('keydown',function(e){
    if(!_portalConfirmOpen)return;
    if(_babylonPromptOpen){
        if(e.code==='KeyY'||e.code==='Enter'||e.code==='Space'){e.preventDefault();_confirmBabylonEnter();}
        if(e.code==='KeyN'||e.code==='Escape'){e.preventDefault();_hideBabylonPrompt();}
        return;
    }
    if(_moonPipePromptOpen){
        if(e.code==='KeyY'||e.code==='Enter'||e.code==='Space'){e.preventDefault();_confirmMoonPipeEnter();}
        if(e.code==='KeyN'||e.code==='Escape'){e.preventDefault();_hideMoonPipePrompt();}
        return;
    }
    if(e.code==='KeyY'||e.code==='Enter'||e.code==='Space'){e.preventDefault();confirmPortalEnter();}
    if(e.code==='KeyN'||e.code==='Escape'){e.preventDefault();hidePortalConfirm();}
});
// Result screen — Enter/Space to go back to city
addEventListener('keydown',function(e){
    if(gameState!=='raceResult')return;
    if(e.code==='Enter'||e.code==='Space'){e.preventDefault();goBackToCity();}
});

// ============================================================
//  SOTN Area Name Reveal
// ============================================================
var _areaNameTimer=null;
var _areaNames={
    zhs:['\u86CB\u5B9D\u57CE \u2014 \u5E0C\u671B\u4E4B\u8857','\u6C99\u6F20\u57CE \u2014 \u9EC4\u91D1\u4E4B\u7802','\u51B0\u96EA\u57CE \u2014 \u6C38\u51BB\u4E4B\u5730','\u7194\u5CA9\u57CE \u2014 \u706B\u7130\u4E4B\u5FC3','\u7CD6\u679C\u57CE \u2014 \u68A6\u5E7B\u4E50\u56ED','\u6708\u9762\u90FD\u5E02 \u2014 \u5BD2\u5BC2\u4E4B\u6D77'],
    zht:['\u86CB\u5B9D\u57CE \u2014 \u5E0C\u671B\u4E4B\u8857','\u6C99\u6F20\u57CE \u2014 \u9EC3\u91D1\u4E4B\u7802','\u51B0\u96EA\u57CE \u2014 \u6C38\u51CD\u4E4B\u5730','\u7194\u5CA9\u57CE \u2014 \u706B\u7130\u4E4B\u5FC3','\u7CD6\u679C\u57CE \u2014 \u5922\u5E7B\u6A02\u5712','\u6708\u9762\u90FD\u5E02 \u2014 \u5BD2\u5BC2\u4E4B\u6D77'],
    ja:['\u30C0\u30F3\u30DC\u30B7\u30C6\u30A3 \u2014 \u5E0C\u671B\u306E\u8857','\u7802\u6F20\u30B7\u30C6\u30A3 \u2014 \u9EC4\u91D1\u306E\u7802','\u6C37\u96EA\u30B7\u30C6\u30A3 \u2014 \u6C38\u51CD\u306E\u5730','\u6EB6\u5CA9\u30B7\u30C6\u30A3 \u2014 \u708E\u306E\u5FC3\u81D3','\u30AD\u30E3\u30F3\u30C7\u30A3\u30B7\u30C6\u30A3 \u2014 \u5922\u306E\u697D\u5712','\u30EB\u30CA\u30FC\u30BE\u30FC\u30F3 \u2014 \u9759\u5BC2\u306E\u6D77'],
    en:['DANBO City \u2014 Street of Hope','Desert City \u2014 Golden Sands','Ice City \u2014 Frozen Lands','Lava City \u2014 Heart of Flame','Candy City \u2014 Dreamland','Lunar Zone \u2014 Sea of Silence']
};
var _areaNameCloud={zhs:'\u4E91\u4E2D\u754C \u2014 \u5929\u7A7A\u4E4B\u57CE',zht:'\u96F2\u4E2D\u754C \u2014 \u5929\u7A7A\u4E4B\u57CE',ja:'\u96F2\u4E2D\u754C \u2014 \u5929\u7A7A\u306E\u57CE',en:'Cloud Realm \u2014 City in the Sky'};
function _showAreaName(name){
    if(!name)return;
    var overlay=document.getElementById('area-name-overlay');
    var text=document.getElementById('area-name-text');
    if(!overlay||!text)return;
    if(_areaNameTimer){clearTimeout(_areaNameTimer);_areaNameTimer=null;}
    overlay.style.display='none';
    text.style.animation='none';
    // Force reflow to restart animation
    void text.offsetWidth;
    text.textContent=name;
    text.style.animation='sotnReveal 3.5s ease-out forwards';
    overlay.style.display='flex';
    _areaNameTimer=setTimeout(function(){overlay.style.display='none';_areaNameTimer=null;},3600);
}
function _showCityAreaName(cityIdx){
    var names=_areaNames[_langCode]||_areaNames.en;
    if(cityIdx>=0&&cityIdx<names.length)_showAreaName(names[cityIdx]);
}
function _showCloudAreaName(){
    _showAreaName(_areaNameCloud[_langCode]||_areaNameCloud.en);
}

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
    _spinDashing=false;_spinDashTimer=0;_spinDashTimerMax=0;_spinDashSpeed=0;if(_spinDashBar)_spinDashBar.visible=false;
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
        npc.throwTimer=0;npc.grabCD=60;npc.finished=false;npc._stunTimer=0;
        if(npc.struggleBar){try{npc.mesh.remove(npc.struggleBar);}catch(e){}npc.struggleBar=null;}
    }

    // Create player in city
    var sx=(spawnX!==undefined)?spawnX:0;
    var sz=(spawnZ!==undefined)?spawnZ:5;
    const skin=CHARACTERS[selectedChar];
    playerEgg=createEgg(sx,sz,skin.color,skin.accent,true,undefined,skin.type);
    playerEgg.finished=false;playerEgg.alive=true;
    if(currentCityStyle===5){
        // Moon flat: spawn in battlefield area (right side)
        if(sx===0&&sz===5){sx=50;sz=0;}
        playerEgg.mesh.position.set(sx,0.5,sz);
        camera.position.set(sx,12,sz+14);camera.lookAt(sx,0,sz);
        camera.up.set(0,1,0);
    } else {
        camera.position.set(sx,12,sz+14); camera.lookAt(sx,0,sz);
        camera.up.set(0,1,0);
    }
    // Check if Tower of Babel should already be triggered
    if(coins>=10&&!_babylonTriggered&&currentCityStyle!==5){_triggerBabylonEvent();}
    // SOTN area name reveal
    _showCityAreaName(currentCityStyle);
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
    camera.up.set(0,1,0); // reset from moon spherical camera

    // Show countdown then start
    gameState='raceIntro';
    stopBGM(); startRaceBGM(raceIndex);
    const race=RACES[raceIndex];
    // SOTN area name reveal for race
    var raceNames=I18N.raceNames[_langCode]||I18N.raceNames.en;
    if(raceNames[raceIndex])_showAreaName(raceNames[raceIndex]);
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
                _dropNpcStolenCoins(b);
            }
        }
    }
}
// ============================================================
//  MAIN LOOP
// ============================================================
const clock = new THREE.Clock();
var _lastFrameTime=0;
var _targetFrameInterval=1000/62; // ~60fps with small tolerance

function animate(now){
    requestAnimationFrame(animate);
    // Frame rate limiter — skip frames on high refresh rate displays (120Hz etc.)
    if(!now)now=performance.now();
    if(now-_lastFrameTime<_targetFrameInterval)return;
    _lastFrameTime=now-(now-_lastFrameTime)%_targetFrameInterval;
    const dt=Math.min(clock.getDelta(),0.05);

    if(gameState==='city'){
        if(_pipeTraveling){
            updatePipeTravel();
        } else {
            handlePlayerInput();
        }
        if(playerEgg&&!_pipeTraveling) updateEggPhysics(playerEgg, true);
        if(playerEgg) _updateStunStars(playerEgg);
        updateCity();
        const cityEggList = [playerEgg, ...cityNPCs].filter(e=>e&&e.alive);
        resolveEggCollisions(cityEggList);
        checkThrownEggImpact(cityEggList);
        updateHeldEggs();
        _updateChatBubbles();
        for(var _nci=0;_nci<allEggs.length;_nci++){if(!allEggs[_nci].isPlayer)_npcRandomChat(allEggs[_nci]);}
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
    stopTitleBGM();
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
                showScreen('select-screen');stopTitleBGM();ensureAudio();startSelectBGM();playMenuConfirm();
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
    _portalConfirmHidden=null;
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
    var slo2=document.querySelector('.slogan-text');if(slo2)slo2.textContent=L('slogan');
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
    var zh2=_e('zoom-hud');if(zh2)zh2.textContent=(currentCityStyle===5)?L('moonCamHint'):L('zoomHint');
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
