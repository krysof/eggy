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
        '.dbw-warp{position:absolute;inset:0;overflow:hidden;background:radial-gradient(circle at 50% 38%,rgba(255,255,255,.24),rgba(118,77,206,.58) 34%,rgba(16,26,58,.86) 72%,rgba(4,10,24,.94));}'+
        '.dbw-warp:before{content:"";position:absolute;left:50%;top:23%;width:min(34vw,220px);height:min(34vw,220px);transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,#fff 0 12%,#fff8 20%,#9df7 35%,#77f0 60%);box-shadow:0 0 36px #fff,0 0 90px #78e8ff,0 0 150px #ff7cf0;animation:dbw-portal 900ms ease-in-out infinite alternate;}'+
        '.dbw-warp:after{content:"";position:absolute;left:50%;top:23%;width:4px;height:4px;border-radius:50%;box-shadow:0 0 22px 8px #fff,0 0 84px 46px rgba(255,255,255,.26);animation:dbw-pulse 720ms ease-in-out infinite alternate;}'+
        '.dbw-bridge{position:absolute;left:50%;bottom:-28vh;width:min(92vw,520px);height:90vh;transform:translateX(-50%) perspective(620px) rotateX(64deg);transform-origin:50% 100%;filter:drop-shadow(0 0 20px rgba(255,255,255,.58));opacity:.96;}'+
        '.dbw-r{position:absolute;bottom:0;height:100%;width:12.8%;border-radius:999px 999px 0 0;animation:dbw-flow 980ms cubic-bezier(.2,.72,.22,1) forwards;box-shadow:inset 0 0 18px rgba(255,255,255,.38),0 0 16px currentColor;}'+
        '.dbw-r:nth-child(1){left:4%;color:#ff5c70;background:linear-gradient(to top,rgba(255,92,112,.12),#ff5c70,#fff1);animation-delay:0ms}.dbw-r:nth-child(2){left:17%;color:#ff9b3d;background:linear-gradient(to top,rgba(255,155,61,.12),#ff9b3d,#fff1);animation-delay:30ms}.dbw-r:nth-child(3){left:30%;color:#ffe55a;background:linear-gradient(to top,rgba(255,229,90,.12),#ffe55a,#fff1);animation-delay:60ms}.dbw-r:nth-child(4){left:43%;color:#64f27a;background:linear-gradient(to top,rgba(100,242,122,.12),#64f27a,#fff1);animation-delay:90ms}.dbw-r:nth-child(5){left:56%;color:#56d8ff;background:linear-gradient(to top,rgba(86,216,255,.12),#56d8ff,#fff1);animation-delay:120ms}.dbw-r:nth-child(6){left:69%;color:#6f7bff;background:linear-gradient(to top,rgba(111,123,255,.12),#6f7bff,#fff1);animation-delay:150ms}.dbw-r:nth-child(7){left:82%;color:#e36bff;background:linear-gradient(to top,rgba(227,107,255,.12),#e36bff,#fff1);animation-delay:180ms}'+
        '.dbw-spark{position:absolute;left:50%;top:58%;width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 18px #fff;opacity:.85;animation:dbw-spark 920ms ease-in forwards}.dbw-spark.s1{margin-left:-34vw;animation-delay:40ms}.dbw-spark.s2{margin-left:31vw;margin-top:6vh;animation-delay:130ms}.dbw-spark.s3{margin-left:-18vw;margin-top:14vh;animation-delay:220ms}.dbw-spark.s4{margin-left:21vw;margin-top:-8vh;animation-delay:310ms}'+
        '.dbw-hero{--hero:'+hero+';--accent:'+accent+';position:absolute;left:50%;top:63%;width:86px;height:76px;transform:translate(-50%,-50%);animation:dbw-suck 1050ms cubic-bezier(.25,.84,.22,1) forwards;filter:drop-shadow(0 12px 18px rgba(0,0,0,.28)) drop-shadow(0 0 18px rgba(255,255,255,.45));}'+
        '.dbw-hero i{position:absolute;left:10px;top:5px;width:66px;height:66px;border-radius:50%;background:var(--hero);box-shadow:inset -9px -11px 0 rgba(0,0,0,.08),inset 8px 8px 0 rgba(255,255,255,.22),0 0 0 5px rgba(255,255,255,.42);}'+
        '.dbw-hero b{position:absolute;top:30px;width:10px;height:15px;border-radius:50%;background:#172033;z-index:2}.dbw-hero b:nth-of-type(1){left:31px}.dbw-hero b:nth-of-type(2){left:48px}.dbw-hero em{position:absolute;left:36px;top:52px;width:15px;height:8px;border-radius:0 0 15px 15px;border-bottom:3px solid #172033;z-index:2}.dbw-hero span{position:absolute;width:20px;height:14px;border-radius:50%;background:var(--accent);top:0;z-index:0}.dbw-hero span:nth-child(1){left:9px}.dbw-hero span:nth-child(2){right:9px}'+
        '@keyframes dbw-portal{from{transform:translate(-50%,-50%) scale(.92);opacity:.78}to{transform:translate(-50%,-50%) scale(1.08);opacity:1}}@keyframes dbw-pulse{from{opacity:.55}to{opacity:1}}@keyframes dbw-flow{0%{transform:translateY(16%) scaleY(.58);opacity:.12}35%{opacity:1}100%{transform:translateY(-42%) scaleY(1.28);opacity:.84}}@keyframes dbw-spark{0%{transform:translate(0,0) scale(.75);opacity:.9}100%{transform:translate(0,-38vh) scale(.18);opacity:0}}@keyframes dbw-suck{0%{transform:translate(-50%,-50%) scale(1);opacity:1}42%{transform:translate(-50%,-86%) scale(.82);opacity:1}78%{transform:translate(-50%,-142%) scale(.46);opacity:.92}100%{transform:translate(-50%,-208%) scale(.12);opacity:.08}}'+
        '</style>'+
        '<div class="dbw-warp" data-plugin-loading="rainbow-bridge" aria-hidden="true">'+
        '<div class="dbw-bridge"><i class="dbw-r"></i><i class="dbw-r"></i><i class="dbw-r"></i><i class="dbw-r"></i><i class="dbw-r"></i><i class="dbw-r"></i><i class="dbw-r"></i></div>'+
        '<i class="dbw-spark s1"></i><i class="dbw-spark s2"></i><i class="dbw-spark s3"></i><i class="dbw-spark s4"></i>'+
        '<div class="dbw-hero"><span></span><span></span><i></i><b></b><b></b><em></em></div>'+
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
        mount.innerHTML=bridgeEnterMarkup();
        function finishStart(){
            var wait=Math.max(0,1400-(Date.now()-bridgeStarted));
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
