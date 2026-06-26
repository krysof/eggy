(function(){
    'use strict';
    if(!window.DANBO_PLUGIN_HOST){console.warn('[legacy-platformer] Plugin host missing');return;}

    window.DANBO_PLUGIN_HOST.register({
        id:'legacy-platformer',
        version:'0.1.0',
        name:{zhs:'蛋宝冒险',en:'Danbo Adventure'},
        description:'Adapter plugin for the existing side-scrolling platformer minigame.',
        create:function(ctx){
            if(ctx.net)ctx.net.send('minigame.startIntent',{pluginId:ctx.pluginId,characterId:ctx.character.id});
            if(typeof _pfStart==='function'){
                _pfStart();
            } else {
                console.error('[legacy-platformer] _pfStart is missing');
                ctx.api.finish({status:'error',reason:'_pfStart missing'});
            }
            return {
                update:function(){},
                destroy:function(result){
                    if(ctx.net)ctx.net.send('minigame.stopIntent',{pluginId:ctx.pluginId,result:result||{}});
                }
            };
        }
    });
})();
