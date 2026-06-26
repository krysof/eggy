(function(){
    'use strict';
    if(!window.DANBO_PLUGIN_HOST){console.warn('[legacy-race] Plugin host missing');return;}

    window.DANBO_PLUGIN_HOST.register({
        id:'legacy-race',
        version:'0.1.0',
        name:{zhs:'经典竞速赛道',en:'Legacy Race Course'},
        description:'Adapter plugin for the existing race-course minigames. Keeps old race code but starts it through the plugin host.',
        create:function(ctx){
            var raceIndex=Number(ctx.options&&ctx.options.raceIndex);
            if(!isFinite(raceIndex))raceIndex=0;
            if(ctx.net)ctx.net.send('minigame.startIntent',{pluginId:ctx.pluginId,raceIndex:raceIndex,characterId:ctx.character.id});
            if(typeof enterRace==='function'){
                enterRace(raceIndex);
            } else {
                console.error('[legacy-race] enterRace is missing');
                ctx.api.finish({status:'error',reason:'enterRace missing'});
            }
            return {
                update:function(){},
                destroy:function(result){
                    if(ctx.net)ctx.net.send('minigame.stopIntent',{pluginId:ctx.pluginId,raceIndex:raceIndex,result:result||{}});
                }
            };
        }
    });
})();
