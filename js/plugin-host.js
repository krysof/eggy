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
        // The real transition is drawn in the Three.js scene so it matches the old mini-game Bifrost feel.
        // This transparent marker only blocks input and gives tests a stable hook; it intentionally has no text.
        return '<div data-plugin-loading="rainbow-bridge" aria-hidden="true" style="position:absolute;inset:0;pointer-events:auto;background:rgba(255,255,255,0.01);"></div>';
    }

    var transitionCleanup=null;
    function cleanupSceneBifrost(){
        if(transitionCleanup){try{transitionCleanup();}catch(e){console.error('[PluginHost] transition cleanup failed',e);}transitionCleanup=null;}
    }
    function startSceneBifrost(durationMs){
        cleanupSceneBifrost();
        if(typeof THREE==='undefined'||typeof scene==='undefined'||!scene||typeof playerEgg==='undefined'||!playerEgg||!playerEgg.mesh)return;
        var group=new THREE.Group();group.name='danbo-plugin-bifrost';
        scene.add(group);
        var colors=[0xFF0000,0xFF8800,0xFFDD00,0x44DD44,0x4488FF,0x4400CC,0x8800CC];
        var origin={x:playerEgg.mesh.position.x,y:playerEgg.mesh.position.y,z:playerEgg.mesh.position.z};
        var rotY=playerEgg.mesh.rotation.y;
        var rings=[],pillars=[],particles=[];
        function mb(c,o){return new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false,side:THREE.DoubleSide});}
        for(var i=0;i<7;i++){
            var ring=new THREE.Mesh(new THREE.TorusGeometry(0.35+i*0.38,0.075,8,40),mb(colors[i],0));
            ring.rotation.x=Math.PI/2;ring.position.set(origin.x,0.12+i*0.045,origin.z);ring.renderOrder=900;
            group.add(ring);rings.push(ring);
        }
        for(var p=0;p<18;p++){
            var pillar=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.34,1,8,1,true),mb(colors[p%7],0));
            pillar.position.set(origin.x,40,origin.z);pillar.scale.y=80;pillar.renderOrder=895;
            group.add(pillar);pillars.push(pillar);
        }
        for(var q=0;q<36;q++){
            var sp=new THREE.Mesh(new THREE.SphereGeometry(0.11+Math.random()*0.08,6,4),mb(0xFFFFFF,0));
            sp.userData={angle:Math.random()*Math.PI*2,rad:0.4+Math.random()*2.8,spd:0.6+Math.random()*1.6,off:Math.random()*80};sp.renderOrder=910;
            group.add(sp);particles.push(sp);
        }
        var flash=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:0,depthTest:false,depthWrite:false,side:THREE.DoubleSide}));
        flash.renderOrder=9999;scene.add(flash);
        var start=Date.now(),dur=durationMs||2600,raf=0,done=false;
        function ease(x){return x<0?0:(x>1?1:(x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2));}
        function frame(){
            if(done)return;
            var elapsed=Date.now()-start,t=Math.min(1,elapsed/dur);
            var p1=Math.min(1,t/0.38),p2=Math.max(0,Math.min(1,(t-0.20)/0.62));
            var beamH=96, descend=ease(p1);
            for(var a=0;a<pillars.length;a++){
                var m=pillars[a];
                var spiral=elapsed*0.0035+a*(Math.PI*2/pillars.length);
                var sr=0.35+(a%6)*0.28+Math.floor(a/6)*0.42;
                m.position.x=origin.x+Math.cos(spiral)*sr;
                m.position.z=origin.z+Math.sin(spiral)*sr;
                m.position.y=beamH*(1-descend)+beamH*0.5+Math.sin(elapsed*0.006+a)*1.4;
                m.scale.y=beamH*(0.22+0.78*descend);
                m.material.opacity=(0.18+0.42*descend)*(1-Math.max(0,t-0.86)/0.14);
            }
            for(var r=0;r<rings.length;r++){
                var rg=rings[r],rp=Math.max(0,Math.min(1,(t-0.10-r*0.018)/0.34));
                var suck=Math.max(0,Math.min(1,(t-0.48)/0.34));
                rg.scale.setScalar(0.18+ease(rp)*(1.15-suck*0.58));
                rg.rotation.z=elapsed*0.006+r*0.55;
                rg.position.y=0.12+r*0.045+p2*14;
                rg.material.opacity=Math.max(0,0.86*rp*(1-t*0.35));
            }
            for(var c=0;c<particles.length;c++){
                var pt=particles[c],ud=pt.userData;
                ud.angle+=0.035*ud.spd;
                var py=(ud.off+elapsed*0.055*ud.spd)%86;
                pt.position.set(origin.x+Math.cos(ud.angle)*ud.rad,py,origin.z+Math.sin(ud.angle)*ud.rad);
                pt.material.opacity=0.25+0.55*Math.sin(Math.min(1,t)*Math.PI);
            }
            if(playerEgg&&playerEgg.mesh){
                var rise=ease(p2);
                playerEgg.mesh.position.set(origin.x,origin.y+rise*22,origin.z);
                playerEgg.mesh.rotation.y=rotY+rise*Math.PI*2+elapsed*0.003;
                var sc=1-rise*0.38;playerEgg.mesh.scale.set(sc,sc,sc);
            }
            if(typeof camera!=='undefined'&&camera){
                camera.lookAt(origin.x,origin.y+4+p2*8,origin.z);
            }
            flash.position.copy(camera.position);flash.quaternion.copy(camera.quaternion);flash.translateZ(-1);
            flash.material.opacity=t>0.72?Math.max(0,0.62*(1-Math.abs(t-0.82)/0.10)):0;
            raf=requestAnimationFrame(frame);
        }
        frame();
        transitionCleanup=function(){
            done=true;if(raf)cancelAnimationFrame(raf);
            if(playerEgg&&playerEgg.mesh){playerEgg.mesh.position.set(origin.x,origin.y,origin.z);playerEgg.mesh.rotation.y=rotY;playerEgg.mesh.scale.set(1,1,1);}
            for(var i=group.children.length-1;i>=0;i--){var ch=group.children[i];if(ch.geometry)ch.geometry.dispose();if(ch.material)ch.material.dispose();group.remove(ch);}
            scene.remove(group);if(flash.geometry)flash.geometry.dispose();if(flash.material)flash.material.dispose();scene.remove(flash);
        };
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
        cleanupSceneBifrost();
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
        try{if(typeof stopBGM==='function')stopBGM();}catch(e){}
        mount.innerHTML=bridgeEnterMarkup();
        startSceneBifrost(2600);
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
        cleanupSceneBifrost();
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
