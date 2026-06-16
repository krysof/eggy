// wasm.js — optional DANBO World WebAssembly core loader
// Keeps gameplay identical: if WASM cannot load, all helpers fall back to JS.
(function(){
    function n(v){return Number(v);}
    var api={
        ready:false,
        attempted:false,
        failed:false,
        mode:'js-fallback',
        exports:null,
        build:0,
        error:null,
        dist2D:function(px,pz,tx,tz){
            var e=api.exports;
            px=n(px);pz=n(pz);tx=n(tx);tz=n(tz);
            if(e&&e.danbo_portal_distance)return e.danbo_portal_distance(px,pz,tx,tz);
            var dx=px-tx, dz=pz-tz;
            return Math.sqrt(dx*dx+dz*dz);
        },
        dist2DSq:function(px,pz,tx,tz){
            var e=api.exports;
            px=n(px);pz=n(pz);tx=n(tx);tz=n(tz);
            if(e&&e.danbo_distance_2d_sq)return e.danbo_distance_2d_sq(px,pz,tx,tz);
            var dx=px-tx, dz=pz-tz;
            return dx*dx+dz*dz;
        },
        dist3D:function(px,py,pz,tx,ty,tz){
            var e=api.exports;
            px=n(px);py=n(py);pz=n(pz);tx=n(tx);ty=n(ty);tz=n(tz);
            if(e&&e.danbo_distance_3d)return e.danbo_distance_3d(px,py,pz,tx,ty,tz);
            var dx=px-tx, dy=py-ty, dz=pz-tz;
            return Math.sqrt(dx*dx+dy*dy+dz*dz);
        },
        dist3DSq:function(px,py,pz,tx,ty,tz){
            var e=api.exports;
            px=n(px);py=n(py);pz=n(pz);tx=n(tx);ty=n(ty);tz=n(tz);
            if(e&&e.danbo_distance_3d_sq)return e.danbo_distance_3d_sq(px,py,pz,tx,ty,tz);
            var dx=px-tx, dy=py-ty, dz=pz-tz;
            return dx*dx+dy*dy+dz*dz;
        },
        len2D:function(dx,dz){
            var e=api.exports;
            dx=n(dx);dz=n(dz);
            if(e&&e.danbo_length_2d)return e.danbo_length_2d(dx,dz);
            return api.dist2D(dx,dz,0,0);
        },
        len3D:function(dx,dy,dz){
            var e=api.exports;
            dx=n(dx);dy=n(dy);dz=n(dz);
            if(e&&e.danbo_length_3d)return e.danbo_length_3d(dx,dy,dz);
            return api.dist3D(dx,dy,dz,0,0,0);
        },
        within2D:function(px,pz,tx,tz,radius){
            var e=api.exports;
            px=n(px);pz=n(pz);tx=n(tx);tz=n(tz);radius=n(radius);
            if(e&&e.danbo_within_radius_2d)return !!e.danbo_within_radius_2d(px,pz,tx,tz,radius);
            return api.dist2DSq(px,pz,tx,tz)<radius*radius;
        },
        within3D:function(px,py,pz,tx,ty,tz,radius){
            var e=api.exports;
            px=n(px);py=n(py);pz=n(pz);tx=n(tx);ty=n(ty);tz=n(tz);radius=n(radius);
            if(e&&e.danbo_within_radius_3d)return !!e.danbo_within_radius_3d(px,py,pz,tx,ty,tz,radius);
            return api.dist3DSq(px,py,pz,tx,ty,tz)<radius*radius;
        },
        aabb2D:function(px,pz,cx,cz,halfW,halfD,margin){
            var e=api.exports;
            px=n(px);pz=n(pz);cx=n(cx);cz=n(cz);halfW=n(halfW);halfD=n(halfD);margin=n(margin||0);
            if(e&&e.danbo_aabb2d_contains)return !!e.danbo_aabb2d_contains(px,pz,cx,cz,halfW,halfD,margin);
            return Math.abs(px-cx)<halfW+margin&&Math.abs(pz-cz)<halfD+margin;
        },
        sfxVolume:function(px,pz,wx,wz){
            var e=api.exports;
            px=n(px);pz=n(pz);wx=n(wx);wz=n(wz);
            if(e&&e.danbo_sfx_volume)return e.danbo_sfx_volume(px,pz,wx,wz);
            var dist=api.dist2D(wx,wz,px,pz);
            if(isNaN(dist))return 0;
            if(dist<3)return 1;
            if(dist>60)return 0;
            if(dist>30)return 0.5*(1-(dist-30)/30);
            return 1-(dist-3)*0.5/27;
        },
        absDeltaWithin:function(a,b,limit){
            var e=api.exports;
            a=n(a);b=n(b);limit=n(limit);
            if(e&&e.danbo_abs_delta_within)return !!e.danbo_abs_delta_within(a,b,limit);
            return Math.abs(a-b)<=limit;
        },
        absDeltaLess:function(a,b,limit){
            var e=api.exports;
            a=n(a);b=n(b);limit=n(limit);
            if(e&&e.danbo_abs_delta_less)return !!e.danbo_abs_delta_less(a,b,limit);
            return Math.abs(a-b)<limit;
        },
        nearGround:function(onGround,vy,py){
            var e=api.exports;
            vy=n(vy);py=n(py);
            if(e&&e.danbo_near_ground)return !!e.danbo_near_ground(onGround?1:0,vy,py);
            return !!(onGround||Math.abs(vy)<0.25||py<2.5);
        },
        confirmRange:function(confirmDist,isWarpPipe){
            var e=api.exports;
            confirmDist=n(confirmDist);
            if(e&&e.danbo_confirm_range)return e.danbo_confirm_range(confirmDist,isWarpPipe?1:0);
            return confirmDist+(isWarpPipe?1.6:3.4);
        },
        racePortalHeightOk:function(py,portalY){
            var e=api.exports;
            py=n(py);portalY=n(portalY);
            if(e&&e.danbo_race_portal_height_ok)return !!e.danbo_race_portal_height_ok(py,portalY);
            return Math.abs(py-portalY)<=7;
        },
        warpPipeHeightOk:function(py){
            var e=api.exports;
            py=n(py);
            if(e&&e.danbo_warp_pipe_height_ok)return !!e.danbo_warp_pipe_height_ok(py);
            return py<=10;
        },
        portalAction:function(distance,triggerDist,confirmDist,isWarpPipe,isVoluntary){
            var e=api.exports;
            distance=n(distance);triggerDist=n(triggerDist);confirmDist=n(confirmDist);
            if(e&&e.danbo_portal_action)return e.danbo_portal_action(distance,triggerDist,confirmDist,isWarpPipe?1:0,isVoluntary?1:0);
            if(!isVoluntary||distance>=triggerDist)return 0;
            return distance<api.confirmRange(confirmDist,isWarpPipe)?2:1;
        }
    };
    window.DANBO_WASM=api;

    function _wasmUrl(){
        var q='';
        try{
            var s=document.currentScript&&document.currentScript.src;
            if(s&&s.indexOf('?')>=0)q=s.substring(s.indexOf('?'));
        }catch(e){}
        return 'wasm/danbo_core.wasm'+q;
    }
    function _fail(err){
        api.failed=true;api.error=err&&err.message?err.message:String(err||'unknown');api.mode='js-fallback';
        if(window.console&&console.warn)console.warn('[DANBO_WASM] fallback:',api.error);
        return api;
    }
    if(!window.WebAssembly||!window.fetch){
        window._danboWasmReady=Promise.resolve(_fail('WebAssembly/fetch unavailable'));
        return;
    }
    api.attempted=true;
    window._danboWasmReady=fetch(_wasmUrl(),{cache:'force-cache'})
        .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer();})
        .then(function(bytes){return WebAssembly.instantiate(bytes,{});})
        .then(function(result){
            api.exports=result.instance.exports;
            api.ready=true;api.failed=false;api.mode='wasm';
            if(api.exports.danbo_build_number)api.build=api.exports.danbo_build_number();
            return api;
        })
        .catch(_fail);
})();
