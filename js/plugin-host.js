(function(){
    'use strict';

    var registry={};
    var manifest=[];
    var active=null;
    var layer=null;
    var loadedScripts={};
    var pendingScripts={};

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
        if(registry[pluginId])return startLoaded(pluginId,options||{});
        var m=manifestEntry(pluginId);
        if(!m)throw new Error('Plugin not registered: '+pluginId);
        var mount=ensureLayer();
        stop({status:'replaced'});
        setLayerVisible(true);
        mount.innerHTML='<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,16,32,.72);color:#fff;font:900 18px system-ui,Segoe UI,sans-serif;text-shadow:0 2px 8px #000;">Loading plugin...</div>';
        loadPluginRuntime(pluginId,function(){startLoaded(pluginId,options||{});},function(e){
            console.error('[PluginHost] lazy load failed',e);
            mount.innerHTML='<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(32,8,8,.75);color:#fff;font:900 18px system-ui,Segoe UI,sans-serif;">Plugin load failed</div>';
            setTimeout(function(){stop({status:'error',reason:'load failed'});},900);
        });
        return {id:pluginId,loading:true,startedAt:Date.now()};
    }

    function stop(result){
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
        setManifest:setManifest,
        list:list,
        get:function(id){return registry[id]||manifestEntry(id)||null;},
        start:start,
        stop:stop,
        update:update,
        getActive:function(){return active?{id:active.id,startedAt:active.startedAt}:null;},
        getCharacterSnapshot:selectedCharacterSnapshot
    };
})();
