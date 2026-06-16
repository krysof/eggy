// wasm.js — optional DANBO World WebAssembly core loader
// Keeps gameplay identical: if WASM cannot load, all helpers fall back to JS.
(function(){
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
            if(e&&e.danbo_portal_distance)return e.danbo_portal_distance(+px||0,+pz||0,+tx||0,+tz||0);
            var dx=(+px||0)-(+tx||0), dz=(+pz||0)-(+tz||0);
            return Math.sqrt(dx*dx+dz*dz);
        },
        dist2DSq:function(px,pz,tx,tz){
            var e=api.exports;
            if(e&&e.danbo_distance_2d_sq)return e.danbo_distance_2d_sq(+px||0,+pz||0,+tx||0,+tz||0);
            var dx=(+px||0)-(+tx||0), dz=(+pz||0)-(+tz||0);
            return dx*dx+dz*dz;
        },
        dist3D:function(px,py,pz,tx,ty,tz){
            var e=api.exports;
            if(e&&e.danbo_distance_3d)return e.danbo_distance_3d(+px||0,+py||0,+pz||0,+tx||0,+ty||0,+tz||0);
            var dx=(+px||0)-(+tx||0), dy=(+py||0)-(+ty||0), dz=(+pz||0)-(+tz||0);
            return Math.sqrt(dx*dx+dy*dy+dz*dz);
        },
        dist3DSq:function(px,py,pz,tx,ty,tz){
            var e=api.exports;
            if(e&&e.danbo_distance_3d_sq)return e.danbo_distance_3d_sq(+px||0,+py||0,+pz||0,+tx||0,+ty||0,+tz||0);
            var dx=(+px||0)-(+tx||0), dy=(+py||0)-(+ty||0), dz=(+pz||0)-(+tz||0);
            return dx*dx+dy*dy+dz*dz;
        },
        within2D:function(px,pz,tx,tz,radius){
            var e=api.exports;
            if(e&&e.danbo_within_radius_2d)return !!e.danbo_within_radius_2d(+px||0,+pz||0,+tx||0,+tz||0,+radius||0);
            return api.dist2DSq(px,pz,tx,tz)<(+radius||0)*(+radius||0);
        },
        within3D:function(px,py,pz,tx,ty,tz,radius){
            var e=api.exports;
            if(e&&e.danbo_within_radius_3d)return !!e.danbo_within_radius_3d(+px||0,+py||0,+pz||0,+tx||0,+ty||0,+tz||0,+radius||0);
            return api.dist3DSq(px,py,pz,tx,ty,tz)<(+radius||0)*(+radius||0);
        },
        aabb2D:function(px,pz,cx,cz,halfW,halfD,margin){
            var e=api.exports;
            if(e&&e.danbo_aabb2d_contains)return !!e.danbo_aabb2d_contains(+px||0,+pz||0,+cx||0,+cz||0,+halfW||0,+halfD||0,+margin||0);
            return Math.abs((+px||0)-(+cx||0))<(+halfW||0)+(+margin||0)&&Math.abs((+pz||0)-(+cz||0))<(+halfD||0)+(+margin||0);
        },
        sfxVolume:function(px,pz,wx,wz){
            var e=api.exports;
            if(e&&e.danbo_sfx_volume)return e.danbo_sfx_volume(+px||0,+pz||0,+wx||0,+wz||0);
            var dist=api.dist2D(wx,wz,px,pz);
            if(isNaN(dist))return 0;
            if(dist<3)return 1;
            if(dist>60)return 0;
            if(dist>30)return 0.5*(1-(dist-30)/30);
            return 1-(dist-3)*0.5/27;
        },
        absDeltaWithin:function(a,b,limit){
            var e=api.exports;
            if(e&&e.danbo_abs_delta_within)return !!e.danbo_abs_delta_within(+a||0,+b||0,+limit||0);
            return Math.abs((+a||0)-(+b||0))<=(+limit||0);
        },
        nearGround:function(onGround,vy,py){
            var e=api.exports;
            if(e&&e.danbo_near_ground)return !!e.danbo_near_ground(onGround?1:0,+vy||0,+py||0);
            return !!(onGround||Math.abs(+vy||0)<0.25||(+py||0)<2.5);
        },
        confirmRange:function(confirmDist,isWarpPipe){
            var e=api.exports;
            if(e&&e.danbo_confirm_range)return e.danbo_confirm_range(+confirmDist||0,isWarpPipe?1:0);
            return (+confirmDist||0)+(isWarpPipe?1.6:3.4);
        },
        racePortalHeightOk:function(py,portalY){
            var e=api.exports;
            if(e&&e.danbo_race_portal_height_ok)return !!e.danbo_race_portal_height_ok(+py||0,+portalY||0);
            return Math.abs((+py||0)-(+portalY||0))<=7;
        },
        warpPipeHeightOk:function(py){
            var e=api.exports;
            if(e&&e.danbo_warp_pipe_height_ok)return !!e.danbo_warp_pipe_height_ok(+py||0);
            return (+py||0)<=10;
        },
        portalAction:function(distance,triggerDist,confirmDist,isWarpPipe,isVoluntary){
            var e=api.exports;
            if(e&&e.danbo_portal_action)return e.danbo_portal_action(+distance||0,+triggerDist||0,+confirmDist||0,isWarpPipe?1:0,isVoluntary?1:0);
            if(!isVoluntary||(+distance||0)>=(+triggerDist||0))return 0;
            return (+distance||0)<api.confirmRange(confirmDist,isWarpPipe)?2:1;
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
