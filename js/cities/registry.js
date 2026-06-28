// ============================================================
//  js/cities/registry.js — City data registry
//  城市数据注册表：每个城市单独文件注册，city.js 只负责生成。
// ============================================================
(function(global){
    var registry=global.DANBO_CITY_REGISTRY||{};
    registry.cities=registry.cities||{};
    registry.styles=registry.styles||[];
    registry.defaults=registry.defaults||{};

    registry.registerCity=function(def){
        if(!def||def.id===undefined||def.id===null)return;
        var id=Number(def.id);
        registry.cities[id]=def;
        if(def.style)registry.styles[id]=def.style;
    };
    registry.setDefault=function(key,value){registry.defaults[key]=value;};
    registry.getDefault=function(key){return registry.defaults[key];};
    registry.loadBundle=function(bundle,source){
        if(!bundle)return false;
        if(bundle.defaults){
            Object.keys(bundle.defaults).forEach(function(key){
                registry.defaults[key]=bundle.defaults[key];
            });
        }
        var list=bundle.cities||[];
        for(var i=0;i<list.length;i++)registry.registerCity(list[i]);
        registry.bundleVersion=bundle.version||0;
        registry.bundleBuild=bundle.build||0;
        registry.bundleSource=source||bundle.source||'bundle';
        return true;
    };
    registry.getCity=function(id){return registry.cities[Number(id)]||null;};
    registry.getStyle=function(id){
        var city=registry.getCity(id);
        return (city&&city.style)||registry.styles[Number(id)]||null;
    };
    registry.getStyles=function(){
        var max=-1;
        Object.keys(registry.cities).forEach(function(k){var n=Number(k);if(n>max)max=n;});
        if(registry.styles.length-1>max)max=registry.styles.length-1;
        var arr=[];
        for(var i=0;i<=max;i++){
            var st=registry.getStyle(i);
            if(st)arr[i]=st;
        }
        return arr;
    };
    registry.getLayout=function(id){
        var city=registry.getCity(id);
        return (city&&city.layout)||{};
    };
    registry.getPathList=function(id){
        var layout=registry.getLayout(id);
        if(layout.paths)return layout.paths;
        if(layout.pathSet===null)return [];
        if(layout.pathSet&&registry.defaults[layout.pathSet])return registry.defaults[layout.pathSet];
        if(layout.inherits==='normal')return registry.defaults.normalPaths;
        return null;
    };
    registry.getBuildingList=function(id){
        var layout=registry.getLayout(id);
        if(layout.buildings)return layout.buildings;
        if(layout.buildingSet===null)return [];
        if(layout.buildingSet&&registry.defaults[layout.buildingSet])return registry.defaults[layout.buildingSet];
        if(layout.inherits==='normal')return registry.defaults.normalBuildings;
        return null;
    };
    registry.getWarpPipes=function(){return registry.defaults.warpPipes||null;};

    global.DANBO_CITY_REGISTRY=registry;
})(window);
