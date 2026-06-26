// minigame-wasm.js — independent WASM loaders for plugin minigames
// Rendering remains JS/Three.js; pure minigame rules use independent WASM modules with JS fallback.
(function(){
    'use strict';
    function n(v){return Number(v);}
    function cacheQuery(){
        if(window.DANBO_ASSET_VERSION)return String(window.DANBO_ASSET_VERSION).charAt(0)==='?'?window.DANBO_ASSET_VERSION:'?'+window.DANBO_ASSET_VERSION;
        try{var s=document.currentScript&&document.currentScript.src;if(s&&s.indexOf('?')>=0)return s.substring(s.indexOf('?'));}catch(e){}
        return '';
    }
    function makeBase(id,file){
        return {id:id,file:file,ready:false,attempted:false,failed:false,mode:'js-fallback',exports:null,build:0,error:null,_outView:null,_tmp:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],_readOut:function(count){var v=this._outView,t=this._tmp;if(v){for(var i=0;i<count;i++)t[i]=v[i];}return t;}};
    }
    function loadModule(api,outPtrName,buildName){
        function fail(err){
            api.failed=true;api.error=err&&err.message?err.message:String(err||'unknown');api.mode='js-fallback';
            if(window.console&&console.warn)console.warn('[DANBO_MINIGAME_WASM:'+api.id+'] fallback:',api.error);
            return api;
        }
        if(!window.WebAssembly||!window.fetch)return Promise.resolve(fail('WebAssembly/fetch unavailable'));
        api.attempted=true;
        return fetch(api.file+cacheQuery(),{cache:'force-cache'})
            .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer();})
            .then(function(bytes){return WebAssembly.instantiate(bytes,{});})
            .then(function(result){
                api.exports=result.instance.exports;
                api.ready=true;api.failed=false;api.mode='wasm';
                if(api.exports[buildName])api.build=api.exports[buildName]();
                if(api.exports.memory&&api.exports[outPtrName])api._outView=new Float64Array(api.exports.memory.buffer,api.exports[outPtrName](),16);
                return api;
            }).catch(fail);
    }

    var race=makeBase('legacy-race','wasm/danbo_race.wasm');
    race.trackWidth=function(){var e=this.exports;return e&&e.danbo_race_track_width?e.danbo_race_track_width():10;};
    race.totalEggs=function(ri){var e=this.exports;ri=ri|0;return e&&e.danbo_race_total_eggs?e.danbo_race_total_eggs(ri):(14+Math.max(0,ri)*2);};
    race.startCols=function(total,trackW){var e=this.exports;total=total|0;trackW=n(trackW);return e&&e.danbo_race_start_cols?e.danbo_race_start_cols(total,trackW):Math.min(total,Math.floor(trackW*2/2.5)||1);};
    race.startX=function(col,cols,trackW,jitter){var e=this.exports;col=col|0;cols=cols|0;trackW=n(trackW);jitter=n(jitter||0);if(e&&e.danbo_race_start_x)return e.danbo_race_start_x(col,cols,trackW,jitter);var c=Math.max(1,cols),spacing=trackW*2/(c+1);return -trackW+spacing*(col+1)+jitter;};
    race.startZ=function(row,jitter){var e=this.exports;row=row|0;jitter=n(jitter||0);return e&&e.danbo_race_start_z?e.danbo_race_start_z(row,jitter):(-2-row*3+jitter);};
    race.startSlot=function(i,cols,trackW,jitterX,jitterZ){var e=this.exports,t=this._tmp;i=i|0;cols=cols|0;trackW=n(trackW);jitterX=n(jitterX||0);jitterZ=n(jitterZ||0);if(e&&e.danbo_race_start_slot&&this._outView){e.danbo_race_start_slot(i,cols,trackW,jitterX,jitterZ);return this._readOut(4);}var c=Math.max(1,cols),row=Math.floor(i/c),col=i%c;t[0]=row;t[1]=col;t[2]=this.startX(col,c,trackW,jitterX);t[3]=this.startZ(row,jitterZ);return t;};
    race.surviveCount=function(total){var e=this.exports;total=total|0;return e&&e.danbo_race_survive_count?e.danbo_race_survive_count(total):Math.ceil(total*0.6);};
    race.isWinningPlace=function(place,total){var e=this.exports;place=place|0;total=total|0;return e&&e.danbo_race_is_winning_place?!!e.danbo_race_is_winning_place(place,total):(place>=1&&place<=this.surviveCount(total));};
    race.progress=function(gz,trackLength){var e=this.exports;gz=n(gz);trackLength=n(trackLength);if(e&&e.danbo_race_progress)return e.danbo_race_progress(gz,trackLength);if(trackLength<=0)return 0;return Math.max(0,Math.min(1,gz/trackLength));};
    race._segTypeCode=function(type){return type==='ramp'?1:(type==='platforms'?2:0);};
    race.floorY=function(seg,z){if(!seg)return 0;var e=this.exports;var code=this._segTypeCode(seg.type);var fy=seg.floorY||0;if(e&&e.danbo_race_floor_y)return e.danbo_race_floor_y(code,n(z),n(seg.startZ),n(seg.endZ),n(seg.startY||0),n(seg.endY||0),n(fy));if(code===2)return -100;if(code===1){var len=seg.endZ-seg.startZ;if(Math.abs(len)<0.000001)return seg.endY||0;var t=Math.max(0,Math.min(1,(z-seg.startZ)/len));return (seg.startY||0)+t*((seg.endY||0)-(seg.startY||0));}return fy;};
    race.finishCrossed=function(finished,pfActive,trackLength,gz){var e=this.exports;if(e&&e.danbo_race_finish_crossed)return !!e.danbo_race_finish_crossed(finished?1:0,pfActive?1:0,n(trackLength),n(gz));return !finished&&!pfActive&&trackLength>0&&gz>=trackLength-2;};
    race.obstacleSpeed=function(base,perRace,ri,sign,multiplier){var e=this.exports;base=n(base);perRace=n(perRace);ri=ri|0;sign=n(sign);multiplier=n(multiplier===undefined?1:multiplier);if(e&&e.danbo_race_obstacle_speed)return e.danbo_race_obstacle_speed(base,perRace,ri,sign,multiplier);return (base+perRace*ri)*(sign<0?-1:1)*multiplier;};

    var platformer=makeBase('legacy-platformer','wasm/danbo_platformer.wasm');
    platformer.tileSize=function(){var e=this.exports;return e&&e.danbo_platformer_tile_size?e.danbo_platformer_tile_size():4;};
    platformer.levelLength=function(){var e=this.exports;return e&&e.danbo_platformer_level_length?e.danbo_platformer_level_length():200;};
    platformer.partySize=function(){var e=this.exports;return e&&e.danbo_platformer_party_size?e.danbo_platformer_party_size():4;};
    platformer.depth=function(tile){var e=this.exports;tile=n(tile);return e&&e.danbo_platformer_depth?e.danbo_platformer_depth(tile):tile*3;};
    platformer.width=function(tile,length){var e=this.exports;tile=n(tile);length=length|0;return e&&e.danbo_platformer_width?e.danbo_platformer_width(tile,length):tile*length;};
    platformer.castleX=function(tile,length){var e=this.exports;tile=n(tile);length=length|0;return e&&e.danbo_platformer_castle_x?e.danbo_platformer_castle_x(tile,length):(length-3)*tile;};
    platformer.goalX=function(tile,length){var e=this.exports;tile=n(tile);length=length|0;return e&&e.danbo_platformer_goal_x?e.danbo_platformer_goal_x(tile,length):(length-6)*tile;};
    platformer.movingX=function(baseX,phase,range){var e=this.exports;baseX=n(baseX);phase=n(phase);range=n(range);return e&&e.danbo_platformer_moving_x?e.danbo_platformer_moving_x(baseX,phase,range):baseX+Math.sin(phase)*range;};
    platformer.rotatingXY=function(centerX,centerY,radius,angle){var e=this.exports,t=this._tmp;centerX=n(centerX);centerY=n(centerY);radius=n(radius);angle=n(angle);if(e&&e.danbo_platformer_rotating_xy&&this._outView){e.danbo_platformer_rotating_xy(centerX,centerY,radius,angle);return this._readOut(2);}t[0]=centerX+Math.cos(angle)*radius;t[1]=centerY+Math.sin(angle)*radius*0.3;return t;};
    platformer.fallingRockStep=function(y,vy,gravity,removeY){var e=this.exports,t=this._tmp;y=n(y);vy=n(vy);gravity=n(gravity===undefined?0.008:gravity);removeY=n(removeY===undefined?-5:removeY);if(e&&e.danbo_platformer_falling_rock_step&&this._outView){e.danbo_platformer_falling_rock_step(y,vy,gravity,removeY);return this._readOut(3);}var nvy=vy-gravity,ny=y+nvy;t[0]=ny;t[1]=nvy;t[2]=ny<removeY?1:0;return t;};
    platformer.crumbleTrigger=function(px,py,cx,cy,hw){var e=this.exports;px=n(px);py=n(py);cx=n(cx);cy=n(cy);hw=n(hw);if(e&&e.danbo_platformer_crumble_trigger)return !!e.danbo_platformer_crumble_trigger(px,py,cx,cy,hw);return Math.abs(px-cx)<=hw+1&&Math.abs(py-cy)<=2;};
    platformer.mushroomBounce=function(px,py,vy,mx,mh,hw){var e=this.exports;px=n(px);py=n(py);vy=n(vy);mx=n(mx);mh=n(mh);hw=n(hw);if(e&&e.danbo_platformer_mushroom_bounce)return !!e.danbo_platformer_mushroom_bounce(px,py,vy,mx,mh,hw);return vy<=0&&Math.abs(px-mx)<=hw+0.5&&py<=mh+0.5&&py>=mh-1.5;};
    platformer.windForce=function(px,x1,x2,force){var e=this.exports;px=n(px);x1=n(x1);x2=n(x2);force=n(force);return e&&e.danbo_platformer_wind_force?e.danbo_platformer_wind_force(px,x1,x2,force):(px>=x1&&px<=x2?force:0);};
    platformer.goalReached=function(px,goalX,reached){var e=this.exports;px=n(px);goalX=n(goalX);if(e&&e.danbo_platformer_goal_reached)return !!e.danbo_platformer_goal_reached(px,goalX,reached?1:0);return goalX&&px>=goalX&&!reached;};

    window.DANBO_MINIGAME_WASM={race:race,platformer:platformer};
    window._danboMinigameWasmReady=Promise.all([
        loadModule(race,'danbo_race_out_ptr','danbo_race_build_number'),
        loadModule(platformer,'danbo_platformer_out_ptr','danbo_platformer_build_number')
    ]).then(function(){return window.DANBO_MINIGAME_WASM;});
})();
