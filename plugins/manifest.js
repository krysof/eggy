(function(){
    'use strict';
    window.DANBO_PLUGIN_MANIFEST=[
        {
            id:'ability-card',
            name:'角色能力卡测试',
            version:'0.1.0',
            enabled:true,
            script:'plugins/ability-card/plugin.js',
            networkReady:true,
            description:'示例小游戏插件：只接收当前角色编号、名字、能力和基础数值，并通过房间 API 发送意图。'
        }
    ];
    if(window.DANBO_PLUGIN_HOST&&window.DANBO_PLUGIN_HOST.setManifest){
        window.DANBO_PLUGIN_HOST.setManifest(window.DANBO_PLUGIN_MANIFEST);
    }
})();
