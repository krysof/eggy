// ============================================================
//  js/cities/index.js — lightweight city index
//  Only metadata/theme/file paths. Full map data is lazy-loaded per city.
// ============================================================
(function(registry){
    if(!registry)return;
    registry.registerCityIndex({
        version:1,
        preload:[0],
        cities:[
            {id:0,slug:'hope-city',nameKey:'city0',script:'js/cities/city-0-hope.js',wasm:'wasm/cities/city-0-hope.wasm',style:{name:'🏙️ 希望之城',ground:0x55AA88,path:0xBBCCAA,sky:0x87CEEB,bColors:[0xFF8888,0x88BBFF,0xFFDD66,0xAADD88,0xDDAA88,0xBB99DD,0xFF99CC,0x88DDCC],roof:0xDD6644,tree:0x44BB44,fog:null}},
            {id:1,slug:'desert-city',nameKey:'city1',script:'js/cities/city-1-desert.js',wasm:'wasm/cities/city-1-desert.wasm',style:{name:'🏜️ 沙漠城',ground:0xDDCC88,path:0xCCBB77,sky:0xFFCC66,bColors:[0xDDAA66,0xCC9955,0xEEBB77,0xBB8844,0xDDCC88,0xCCAA55,0xEECC99,0xBB9966],roof:0xAA6633,tree:0x88AA44,fog:0xFFEECC}},
            {id:2,slug:'ice-city',nameKey:'city2',script:'js/cities/city-2-ice.js',wasm:'wasm/cities/city-2-ice.wasm',style:{name:'❄️ 冰雪城',ground:0xDDEEFF,path:0xBBCCDD,sky:0xAABBDD,bColors:[0xAADDFF,0x88BBEE,0xCCEEFF,0x99CCEE,0xBBDDFF,0x77AADD,0xDDEEFF,0xAABBCC],roof:0x6699BB,tree:0x88CCAA,fog:0xCCDDEE}},
            {id:3,slug:'lava-city',nameKey:'city3',script:'js/cities/city-3-lava.js',wasm:'wasm/cities/city-3-lava.wasm',style:{name:'🔥 熔岩城',ground:0x443322,path:0x554433,sky:0x331111,bColors:[0x884422,0x663311,0xAA5533,0x774422,0x995544,0x553311,0xBB6644,0x664422],roof:0x442211,tree:0x556633,fog:0x221100}},
            {id:4,slug:'candy-city',nameKey:'city4',script:'js/cities/city-4-candy.js',wasm:'wasm/cities/city-4-candy.wasm',style:{name:'🍬 糖果城',ground:0xFFBBDD,path:0xFFDDEE,sky:0xFFCCEE,bColors:[0xFF88BB,0xBB88FF,0xFFBB88,0x88FFBB,0xFF88FF,0xFFFF88,0x88BBFF,0xFFAA88],roof:0xDD66AA,tree:0xFF88CC,fog:null}},
            {id:5,slug:'moon-city',nameKey:'city5',script:'js/cities/city-5-moon.js',wasm:'wasm/cities/city-5-moon.wasm',style:{name:'🌙 月面都市',ground:0x888899,path:0xAAAABB,sky:0x0A0015,bColors:[0x9999AA,0x7777AA,0xBBBBCC,0x8888AA,0xAAAABB,0x6666AA,0xCCCCDD,0x9999BB],roof:0x6666AA,tree:0x99AACC,fog:null}},
            {id:6,slug:'sakura-country',nameKey:'city6',script:'js/cities/city-6-sakura.js',wasm:'wasm/cities/city-6-sakura.wasm',style:{name:'🌸 樱之国',ground:0xDDCCBB,path:0xBBAA99,sky:0x7BC8F6,bColors:[0xCC8888,0xEEBBAA,0xDDAA99,0xCCBBAA,0xDDCCBB,0xBB9988,0xEECCBB,0xDDBBAA],roof:0x884444,tree:0xFFAABB,fog:null}},
            {id:7,slug:'snow-village',nameKey:'city7',script:'js/cities/city-7-snow.js',wasm:'wasm/cities/city-7-snow.wasm',style:{name:'🏔️ 雪之乡',ground:0xC8D0DD,path:0x998877,sky:0x1A2844,bColors:[0xF5F0E8,0xE8DDD0,0xDDD5C8,0xF0EBE0,0xE0D8CC,0xD8D0C0,0xEEE8DD,0xE5DDD0],roof:0x8B7355,tree:0x2D5A3D,fog:null}}
        ]
    });
})(window.DANBO_CITY_REGISTRY);
