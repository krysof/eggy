// ============================================================
//  js/cities/wasm-city-loader.js — load city data from WASM for public builds
//  Dev source may still load js/cities/city-*.js first. Public dist removes
//  those data files, so this loader registers the same bundle from WASM.
// ============================================================
(function(){
    'use strict';
    var registry=window.DANBO_CITY_REGISTRY;
    var api=window.DANBO_CITY_DATA={ready:false,attempted:false,failed:false,mode:'pending',build:0,error:null,source:'none'};

    function cacheQuery(){
        if(window.DANBO_ASSET_VERSION)return String(window.DANBO_ASSET_VERSION).charAt(0)==='?'?window.DANBO_ASSET_VERSION:'?'+window.DANBO_ASSET_VERSION;
        try{var s=document.currentScript&&document.currentScript.src;if(s&&s.indexOf('?')>=0)return s.substring(s.indexOf('?'));}catch(e){}
        return '';
    }
    function registryCityCount(){
        try{return registry&&registry.cities?Object.keys(registry.cities).length:0;}catch(e){return 0;}
    }
    function finish(mode){api.ready=true;api.failed=false;api.mode=mode;api.source=mode;return api;}
    function fail(err){
        api.failed=true;api.error=err&&err.message?err.message:String(err||'unknown');api.mode='js-fallback';api.source='js-fallback';
        if(window.console&&console.warn)console.warn('[DANBO_CITY_DATA] fallback:',api.error);
        return api;
    }
    function shouldUseExistingJsData(){
        var force=false;
        try{force=/[?&]cityData=wasm\b/.test(location.search)||window.DANBO_CITY_FORCE_WASM;}catch(e){}
        return !force&&registryCityCount()>=8;
    }
    function wasmUrl(){return 'wasm/danbo_city_data.wasm'+cacheQuery();}

    if(!registry){window._danboCityDataReady=Promise.resolve(fail('registry unavailable'));return;}
    if(shouldUseExistingJsData()){
        registry.bundleSource=registry.bundleSource||'js-dev';
        window._danboCityDataReady=Promise.resolve(finish('js-dev'));
        return;
    }
    if(!window.WebAssembly||!window.fetch){window._danboCityDataReady=Promise.resolve(fail('WebAssembly/fetch unavailable'));return;}

    api.attempted=true;
    window._danboCityDataReady=fetch(wasmUrl(),{cache:'force-cache'})
        .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer();})
        .then(function(bytes){return WebAssembly.instantiate(bytes,{});})
        .then(function(result){
            var e=result.instance.exports;
            if(!e.memory||!e.danbo_city_data_json_ptr||!e.danbo_city_data_json_len)throw new Error('invalid city-data wasm ABI');
            var ptr=e.danbo_city_data_json_ptr()>>>0;
            var len=e.danbo_city_data_json_len()>>>0;
            var bytes=new Uint8Array(e.memory.buffer,ptr,len);
            var text=(window.TextDecoder?new TextDecoder('utf-8').decode(bytes):String.fromCharCode.apply(null,Array.prototype.slice.call(bytes)));
            var bundle=JSON.parse(text);
            if(!registry.loadBundle)throw new Error('registry loadBundle unavailable');
            registry.loadBundle(bundle,'wasm');
            api.build=e.danbo_city_data_build_number?e.danbo_city_data_build_number():(bundle.build||0);
            return finish('wasm');
        })
        .catch(fail);
})();
