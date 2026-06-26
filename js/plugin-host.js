(function(){
    'use strict';

    var registry={};
    var entrances={};
    var manifest=[];
    var active=null;
    var layer=null;
    var loadedScripts={};
    var pendingScripts={};
    var loadSeq=0;

    function clonePlain(obj){
        if(obj===undefined||obj===null)return obj;
        try{return JSON.parse(JSON.stringify(obj));}
        catch(e){
            if(Array.isArray(obj))return obj.slice();
            if(typeof obj==='object'){
                var out={};
                for(var k in obj){
                    if(!Object.prototype.hasOwnProperty.call(obj,k))continue;
                    var v=obj[k];
                    if(typeof v!=='function')out[k]=clonePlain(v);
                }
                return out;
            }
            return obj;
        }
    }

    function freezeDeep(obj){
        if(!obj||typeof obj!=='object')return obj;
        Object.freeze(obj);
        Object.keys(obj).forEach(function(k){
            var v=obj[k];
            if(v&&typeof v==='object'&&!Object.isFrozen(v))freezeDeep(v);
        });
        return obj;
    }

    function abilityListFor(charKey){
        var moves=(typeof MOVE_PARAMS!=='undefined'&&MOVE_PARAMS)?MOVE_PARAMS[charKey]:null;
        if(!moves)return [];
        return Object.keys(moves).map(function(id){
            var m=moves[id]||{};
            return {
                id:id,
                name:m.name||id,
                type:m.type||id,
                input:m.input||'',
                trigger:m.trigger||'',
                cooldown:m.cd||0,
                damage:m.damage||0,
                stunDamage:m.stunDmg||0,
                duration:m.duration||0,
                tags:{
                    projectile:!!(m.type==='projectile'||m.speed),
                    fire:!!(m.fire||m.burns),
                    grab:!!(m.type==='piledriver'),
                    movement:!!(m.fwdSpeed||m.type==='dash'||m.type==='roll')
                }
            };
        });
    }

    function selectedCharacterSnapshot(){
        var idx=(typeof selectedChar==='number')?selectedChar:0;
        var defs=(typeof CHAR_DEFS!=='undefined'&&CHAR_DEFS)||[];
        var ch=defs[idx]||defs[0]||{};
        var key=ch.name||('char'+idx);
        var physics=(typeof CHAR_PHYSICS!=='undefined'&&CHAR_PHYSICS)||{};
        var snap={
            schemaVersion:1,
            index:idx,
            id:key,
            key:key,
            name:ch.name||key,
            displayName:ch.sf2||ch.name||key,
            icon:ch.icon||'',
            country:ch.country||'',
            flag:ch.flag||'',
            style:{
                color:ch.color||0,
                accent:ch.accent||0,
                bodyShape:ch.bodyShape||'normal',
                miniRx:ch.miniRx||0,
                miniRy:ch.miniRy||0
            },
            stats:{
                gravity:physics.GRAVITY||0,
                jumpForce:physics.JUMP_FORCE||0,
                moveAccel:physics.MOVE_ACCEL||0,
                maxSpeed:physics.MAX_SPEED||0,
                friction:physics.FRICTION||0
            },
            abilities:abilityListFor(key)
        };
        return freezeDeep(clonePlain(snap));
    }

    function ensureLayer(){
        if(layer&&document.body.contains(layer))return layer;
        layer=document.getElementById('plugin-layer');
        if(!layer){
            layer=document.createElement('div');
            layer.id='plugin-layer';
            layer.style.cssText='position:absolute;inset:0;z-index:60;pointer-events:none;display:none;';
            var parent=document.getElementById('game-container')||document.body;
            parent.appendChild(layer);
        }
        return layer;
    }

    function setLayerVisible(v){
        var el=ensureLayer();
        el.style.display=v?'block':'none';
        el.style.pointerEvents=v?'auto':'none';
    }

    function cssColor(v,fallback){
        if(typeof v==='number'&&isFinite(v)){
            return '#'+('000000'+((v|0)&0xffffff).toString(16)).slice(-6);
        }
        return fallback||'#80ea7a';
    }

    function bridgeEnterMarkup(){
        var snap=selectedCharacterSnapshot();
        var hero=cssColor(snap&&snap.style&&snap.style.color,'#80ea7a');
        var accent=cssColor(snap&&snap.style&&snap.style.accent,'#ffe15d');
        return ''+
        '<style>'+
        '.dbw-warp{position:absolute;inset:0;overflow:hidden;background:radial-gradient(circle at 50% 62%,rgba(255,255,255,.20),rgba(111,74,214,.28) 35%,rgba(12,20,52,.42) 72%,rgba(4,8,22,.56));isolation:isolate;}'+
        '.dbw-warp:before{content:"";position:absolute;inset:-10%;background:radial-gradient(circle at 50% 62%,rgba(255,255,255,.50),rgba(255,255,255,0) 22%),radial-gradient(circle at 50% 18%,rgba(120,240,255,.38),rgba(255,124,240,.20) 28%,rgba(0,0,0,0) 58%);animation:dbw-glow 780ms ease-in-out infinite alternate;mix-blend-mode:screen;}'+
        '.dbw-sky-orb{position:absolute;left:50%;top:12%;width:min(54vw,330px);height:min(54vw,330px);transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,#fff 0 10%,#fff9 18%,#8ef6 34%,#f8a0 62%);box-shadow:0 0 45px #fff,0 0 110px #75eaff,0 0 190px #ff75f4;animation:dbw-orb 980ms ease-in-out infinite alternate;z-index:2;}'+
        '.dbw-beam{position:absolute;left:50%;top:-18vh;width:min(76vw,470px);height:145vh;transform:translateX(-50%) perspective(520px) rotateX(5deg);filter:blur(.15px) drop-shadow(0 0 30px rgba(255,255,255,.75));opacity:.98;mix-blend-mode:screen;z-index:3;}'+
        '.dbw-beam i{position:absolute;top:0;height:100%;width:13.4%;border-radius:999px;box-shadow:0 0 18px currentColor,inset 0 0 22px rgba(255,255,255,.42);animation:dbw-beam-fall 2350ms cubic-bezier(.16,.82,.2,1) forwards,dbw-beam-pulse 620ms ease-in-out infinite alternate;}'+
        '.dbw-beam i:nth-child(1){left:3%;color:#ff405c;background:linear-gradient(to bottom,rgba(255,64,92,0),#ff405c 20%,rgba(255,64,92,.72) 72%,rgba(255,64,92,0));animation-delay:0ms}.dbw-beam i:nth-child(2){left:16%;color:#ff9b2f;background:linear-gradient(to bottom,rgba(255,155,47,0),#ff9b2f 20%,rgba(255,155,47,.70) 72%,rgba(255,155,47,0));animation-delay:35ms}.dbw-beam i:nth-child(3){left:29%;color:#ffe84f;background:linear-gradient(to bottom,rgba(255,232,79,0),#ffe84f 20%,rgba(255,232,79,.72) 72%,rgba(255,232,79,0));animation-delay:70ms}.dbw-beam i:nth-child(4){left:42%;color:#60ff76;background:linear-gradient(to bottom,rgba(96,255,118,0),#60ff76 20%,rgba(96,255,118,.72) 72%,rgba(96,255,118,0));animation-delay:105ms}.dbw-beam i:nth-child(5){left:55%;color:#4fdcff;background:linear-gradient(to bottom,rgba(79,220,255,0),#4fdcff 20%,rgba(79,220,255,.72) 72%,rgba(79,220,255,0));animation-delay:140ms}.dbw-beam i:nth-child(6){left:68%;color:#6977ff;background:linear-gradient(to bottom,rgba(105,119,255,0),#6977ff 20%,rgba(105,119,255,.72) 72%,rgba(105,119,255,0));animation-delay:175ms}.dbw-beam i:nth-child(7){left:81%;color:#e36bff;background:linear-gradient(to bottom,rgba(227,107,255,0),#e36bff 20%,rgba(227,107,255,.72) 72%,rgba(227,107,255,0));animation-delay:210ms}'+
        '.dbw-rings{position:absolute;left:50%;top:64%;width:1px;height:1px;z-index:5;filter:drop-shadow(0 0 14px rgba(255,255,255,.9));}'+
        '.dbw-ring{position:absolute;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border:5px solid currentColor;border-radius:50%;opacity:0;animation:dbw-ring 1450ms ease-out forwards;mix-blend-mode:screen}.dbw-ring:nth-child(1){color:#ff405c;animation-delay:80ms}.dbw-ring:nth-child(2){color:#ff9b2f;animation-delay:150ms}.dbw-ring:nth-child(3){color:#ffe84f;animation-delay:220ms}.dbw-ring:nth-child(4){color:#60ff76;animation-delay:290ms}.dbw-ring:nth-child(5){color:#4fdcff;animation-delay:360ms}.dbw-ring:nth-child(6){color:#6977ff;animation-delay:430ms}.dbw-ring:nth-child(7){color:#e36bff;animation-delay:500ms}'+
        '.dbw-spark{position:absolute;left:50%;top:63%;width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 18px #fff,0 0 34px #7eeaff;opacity:.95;z-index:6;animation:dbw-spark 1650ms ease-in forwards}.dbw-spark.s1{margin-left:-34vw;animation-delay:80ms}.dbw-spark.s2{margin-left:31vw;margin-top:6vh;animation-delay:180ms}.dbw-spark.s3{margin-left:-18vw;margin-top:14vh;animation-delay:280ms}.dbw-spark.s4{margin-left:21vw;margin-top:-8vh;animation-delay:380ms}.dbw-spark.s5{margin-left:5vw;margin-top:18vh;animation-delay:480ms}.dbw-spark.s6{margin-left:-7vw;margin-top:-12vh;animation-delay:580ms}'+
        '.dbw-hero{--hero:'+hero+';--accent:'+accent+';position:absolute;left:50%;top:66%;width:92px;height:82px;transform:translate(-50%,-50%);animation:dbw-suck 2200ms cubic-bezier(.18,.78,.16,1) forwards;filter:drop-shadow(0 14px 20px rgba(0,0,0,.30)) drop-shadow(0 0 24px rgba(255,255,255,.75));z-index:7;}'+
        '.dbw-hero i{position:absolute;left:10px;top:6px;width:72px;height:72px;border-radius:50%;background:var(--hero);box-shadow:inset -9px -11px 0 rgba(0,0,0,.08),inset 9px 9px 0 rgba(255,255,255,.22),0 0 0 6px rgba(255,255,255,.48);}'+
        '.dbw-hero b{position:absolute;top:34px;width:10px;height:16px;border-radius:50%;background:#172033;z-index:2}.dbw-hero b:nth-of-type(1){left:34px}.dbw-hero b:nth-of-type(2){left:53px}.dbw-hero em{position:absolute;left:40px;top:57px;width:16px;height:8px;border-radius:0 0 15px 15px;border-bottom:3px solid #172033;z-index:2}.dbw-hero span{position:absolute;width:22px;height:15px;border-radius:50%;background:var(--accent);top:0;z-index:0}.dbw-hero span:nth-child(1){left:9px}.dbw-hero span:nth-child(2){right:9px}'+
        '.dbw-flash{position:absolute;inset:0;background:#fff;opacity:0;z-index:9;animation:dbw-flash 2450ms ease-out forwards;pointer-events:none;}'+
        '@keyframes dbw-glow{from{opacity:.65;transform:scale(.98)}to{opacity:1;transform:scale(1.03)}}@keyframes dbw-orb{from{transform:translate(-50%,-50%) scale(.88);opacity:.78}to{transform:translate(-50%,-50%) scale(1.08);opacity:1}}@keyframes dbw-beam-fall{0%{transform:translateY(-48vh) scaleY(.34);opacity:0}22%{opacity:1}62%{transform:translateY(0) scaleY(1);opacity:.96}100%{transform:translateY(-18vh) scaleY(1.22);opacity:.70}}@keyframes dbw-beam-pulse{from{filter:brightness(1)}to{filter:brightness(1.35)}}@keyframes dbw-ring{0%{transform:scale(.35);opacity:0}12%{opacity:.95}100%{transform:scale(8.8);opacity:0}}@keyframes dbw-spark{0%{transform:translate(0,0) scale(.75);opacity:.95}100%{transform:translate(0,-52vh) scale(.18);opacity:0}}@keyframes dbw-suck{0%{transform:translate(-50%,-50%) scale(1);opacity:1}36%{transform:translate(-50%,-72%) scale(.92);opacity:1}72%{transform:translate(-50%,-165%) scale(.46);opacity:.95}100%{transform:translate(-50%,-310%) scale(.10);opacity:.10}}@keyframes dbw-flash{0%,72%{opacity:0}82%{opacity:.72}100%{opacity:0}}'+
        '</style>'+
        '<div class="dbw-warp" data-plugin-loading="rainbow-bridge" aria-hidden="true">'+
        '<div class="dbw-sky-orb"></div><div class="dbw-beam"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>'+
        '<div class="dbw-rings"><i class="dbw-ring"></i><i class="dbw-ring"></i><i class="dbw-ring"></i><i class="dbw-ring"></i><i class="dbw-ring"></i><i class="dbw-ring"></i><i class="dbw-ring"></i></div>'+
        '<i class="dbw-spark s1"></i><i class="dbw-spark s2"></i><i class="dbw-spark s3"></i><i class="dbw-spark s4"></i><i class="dbw-spark s5"></i><i class="dbw-spark s6"></i>'+
        '<div class="dbw-hero"><span></span><span></span><i></i><b></b><b></b><em></em></div><div class="dbw-flash"></div>'+
        '</div>';
    }

    function makeStorage(pluginId){
        var prefix='danbo_plugin:'+pluginId+':';
        return {
            get:function(key,fallback){
                try{
                    var raw=localStorage.getItem(prefix+key);
                    if(raw===null||raw===undefined)return fallback;
                    return JSON.parse(raw);
                }catch(e){return fallback;}
            },
            set:function(key,value){
                try{localStorage.setItem(prefix+key,JSON.stringify(value));return true;}
                catch(e){return false;}
            },
            remove:function(key){try{localStorage.removeItem(prefix+key);}catch(e){}}
        };
    }

    function makeContext(pluginId,options){
        options=options||{};
        var mount=ensureLayer();
        mount.innerHTML='';
        var characterSnapshot=selectedCharacterSnapshot();
        var net=(window.DANBO_NET&&window.DANBO_NET.createRoom)?window.DANBO_NET.createRoom({
            pluginId:pluginId,
            character:characterSnapshot,
            network:options.network||null,
            roomId:options.roomId||null
        }):null;
        var finished=false;
        var ctx={
            pluginId:pluginId,
            options:freezeDeep(clonePlain(options)),
            character:characterSnapshot,
            mount:mount,
            storage:makeStorage(pluginId),
            net:net,
            network:net,
            api:{
                finish:function(result){finish(result);},
                setTitle:function(text){mount.setAttribute('data-title',String(text||''));},
                play:function(name){
                    if(name==='confirm'&&typeof playMenuConfirm==='function')playMenuConfirm();
                    else if(name==='move'&&typeof playMenuMove==='function')playMenuMove();
                    else if(name==='cancel'&&typeof playMenuBack==='function')playMenuBack();
                }
            }
        };
        function finish(result){
            if(finished)return;
            finished=true;
            stop(result||{status:'finished'});
        }
        return ctx;
    }

    function register(def){
        if(!def||!def.id){console.warn('[PluginHost] invalid plugin definition',def);return false;}
        if(typeof def.create!=='function'){console.warn('[PluginHost] plugin missing create(ctx): '+def.id);return false;}
        registry[def.id]=def;
        return true;
    }

    function registerEntrance(def){
        if(!def||!def.id){console.warn('[PluginHost] invalid entrance definition',def);return false;}
        if(typeof def.create!=='function'){console.warn('[PluginHost] entrance missing create(ctx): '+def.id);return false;}
        entrances[def.id]=def;
        return true;
    }

    function entranceList(){
        return Object.keys(entrances).sort().map(function(id){return entrances[id];});
    }

    function manifestEntry(id){
        for(var i=0;i<manifest.length;i++){
            if(manifest[i]&&manifest[i].id===id)return manifest[i];
        }
        return null;
    }

    function setManifest(list){
        manifest=Array.isArray(list)?clonePlain(list):[];
    }

    function list(){
        var seen={}, ids=[];
        manifest.forEach(function(m){if(m&&m.id&&!seen[m.id]){seen[m.id]=1;ids.push(m.id);}});
        Object.keys(registry).forEach(function(id){if(!seen[id]){seen[id]=1;ids.push(id);}});
        return ids.sort().map(function(id){
            var p=registry[id]||{};
            var m=manifestEntry(id)||{};
            return freezeDeep({
                id:id,
                name:p.name||m.name||id,
                version:p.version||m.version||'',
                description:p.description||m.description||'',
                enabled:m.enabled!==false,
                loaded:!!registry[id]
            });
        });
    }

    function pluginScripts(pluginId){
        var m=manifestEntry(pluginId)||{};
        var files=[];
        if(Array.isArray(m.scripts))m.scripts.forEach(function(src){if(src)files.push(src);});
        else if(m.script)files.push(m.script);
        return files;
    }

    function cacheSuffix(){
        var v=window.DANBO_ASSET_VERSION||'';
        return v?('?'+v):'';
    }

    function loadScriptOnce(src,onload,onerror){
        if(loadedScripts[src]){onload();return;}
        if(pendingScripts[src]){pendingScripts[src].push({ok:onload,fail:onerror});return;}
        pendingScripts[src]=[{ok:onload,fail:onerror}];
        var s=document.createElement('script');
        s.src=src+cacheSuffix();
        s.onload=function(){
            loadedScripts[src]=true;
            var q=pendingScripts[src]||[];delete pendingScripts[src];
            q.forEach(function(cb){try{cb.ok&&cb.ok();}catch(e){setTimeout(function(){throw e;},0);}});
        };
        s.onerror=function(){
            var q=pendingScripts[src]||[];delete pendingScripts[src];
            q.forEach(function(cb){try{cb.fail&&cb.fail(new Error('Failed to load plugin script '+src));}catch(e){setTimeout(function(){throw e;},0);}});
        };
        document.body.appendChild(s);
    }

    function loadPluginRuntime(pluginId,onload,onerror){
        if(registry[pluginId]){onload();return;}
        var files=pluginScripts(pluginId);
        if(!files.length){onerror(new Error('Plugin scripts not found: '+pluginId));return;}
        var i=0;
        function next(){
            if(registry[pluginId]){onload();return;}
            if(i>=files.length){
                if(registry[pluginId])onload();
                else onerror(new Error('Plugin did not register: '+pluginId));
                return;
            }
            loadScriptOnce(files[i++],next,onerror);
        }
        next();
    }

    function startLoaded(pluginId,options){
        var def=registry[pluginId];
        if(!def)throw new Error('Plugin not registered: '+pluginId);
        stop({status:'replaced'});
        var ctx=makeContext(pluginId,options||{});
        setLayerVisible(true);
        window._danboPluginTransition=false;
        var instance=def.create(ctx)||{};
        active={id:pluginId,def:def,ctx:ctx,instance:instance,startedAt:Date.now()};
        return active;
    }

    function start(pluginId,options){
        var m=manifestEntry(pluginId);
        if(!registry[pluginId]&&!m)throw new Error('Plugin not registered: '+pluginId);
        var mount=ensureLayer();
        stop({status:'replaced'});
        var seq=++loadSeq;
        var bridgeStarted=Date.now();
        setLayerVisible(true);
        window._danboPluginTransition=true;
        mount.innerHTML=bridgeEnterMarkup();
        function finishStart(){
            var wait=Math.max(0,2600-(Date.now()-bridgeStarted));
            setTimeout(function(){
                if(seq===loadSeq)startLoaded(pluginId,options||{});
            },wait);
        }
        if(registry[pluginId]){
            finishStart();
        }else{
            loadPluginRuntime(pluginId,finishStart,function(e){
            if(seq!==loadSeq)return;
            console.error('[PluginHost] lazy load failed',e);
            mount.innerHTML='<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(32,8,8,.75);color:#fff;font:900 18px system-ui,Segoe UI,sans-serif;">进入失败，请重试</div>';
            setTimeout(function(){stop({status:'error',reason:'load failed'});},900);
            });
        }
        return {id:pluginId,loading:true,startedAt:Date.now()};
    }

    function stop(result){
        loadSeq++;
        if(active&&active.instance&&typeof active.instance.destroy==='function'){
            try{active.instance.destroy(result||{status:'stopped'});}catch(e){console.error('[PluginHost] destroy failed',e);}
        }
        if(active&&active.ctx&&active.ctx.net&&typeof active.ctx.net.close==='function'){
            try{active.ctx.net.close();}catch(e2){}
        }
        active=null;
        window._danboPluginTransition=false;
        if(layer){layer.innerHTML='';setLayerVisible(false);}
    }

    function update(dt){
        if(active&&active.instance&&typeof active.instance.update==='function'){
            active.instance.update(dt||0,active.ctx);
        }
    }

    window.DANBO_PLUGIN_HOST={
        register:register,
        registerEntrance:registerEntrance,
        setManifest:setManifest,
        list:list,
        get:function(id){return registry[id]||manifestEntry(id)||null;},
        getEntrance:function(id){return entrances[id]||null;},
        getEntrances:entranceList,
        start:start,
        stop:stop,
        update:update,
        getActive:function(){return active?{id:active.id,startedAt:active.startedAt}:null;},
        getCharacterSnapshot:selectedCharacterSnapshot
    };
})();
