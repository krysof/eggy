(function(){
    'use strict';
    window.DANBO_PLUGIN_MANIFEST=[
        {
            id:'legacy-race',
            name:'经典竞速赛道',
            version:'0.1.0',
            enabled:true,
            script:'plugins/legacy-race/plugin.js',
            networkReady:true,
            legacyAdapter:true,
            description:'旧竞速赛道小游戏适配器：传入 raceIndex 后启动原 enterRace 流程。'
        },
        {
            id:'legacy-platformer',
            name:'蛋宝冒险',
            version:'0.1.0',
            enabled:true,
            script:'plugins/legacy-platformer/plugin.js',
            networkReady:true,
            legacyAdapter:true,
            description:'旧横版平台关小游戏适配器：启动原 _pfStart 流程。'
        },
        {
            id:'ability-card',
            name:'角色能力卡测试',
            version:'0.1.0',
            enabled:true,
            script:'plugins/ability-card/plugin.js',
            networkReady:true,
            devOnly:true,
            description:'示例小游戏插件：只接收当前角色编号、名字、能力和基础数值，并通过房间 API 发送意图。'
        }
    ];
    if(window.DANBO_PLUGIN_HOST&&window.DANBO_PLUGIN_HOST.setManifest){
        window.DANBO_PLUGIN_HOST.setManifest(window.DANBO_PLUGIN_MANIFEST);
    }
})();
