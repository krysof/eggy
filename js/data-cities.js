// ============================================================
//  data-cities.js — City configuration & style data
// ============================================================

var CITY_CONFIG={
    size:160,           // half-size of city ground
    moonSize:400,       // half-size of moon city
    npcCount:36,        // NPCs in ground cities
    moonNpcCount:24,    // NPCs on moon
    coinCount:180,      // coins in ground cities
    moonCoinCount:200,  // coins on moon
    buildingCount:40,   // approximate buildings
    treeCount:80,
    lampCount:20,
    benchCount:12,
    fountainRadius:7,
    fountainInnerRadius:3.5,
    fountainPillarHeight:6.1,
    fountainLionCount:4,
    fountainColumnCount:8,
    fountainCoins:20,
    waterParticlesCentral:120,
    waterParticlesLion:80
};

// ---- City style themes ----
var CITY_THEME_DATA=[
    {id:0,nameKey:'city0',ground:0x55AA88,path:0xBBCCAA,sky:0x87CEEB,
     bColors:[0xFF8888,0x88BBFF,0xFFDD66,0xAADD88,0xDDAA88,0xBB99DD,0xFF99CC,0x88DDCC],
     roof:0xDD6644,tree:0x44BB44,fog:null},
    {id:1,nameKey:'city1',ground:0xDDCC88,path:0xCCBB77,sky:0xFFCC66,
     bColors:[0xDDAA66,0xCC9955,0xEEBB77,0xBB8844,0xDDCC88,0xCCAA55,0xEECC99,0xBB9966],
     roof:0xAA6633,tree:0x88AA44,fog:0xFFEECC},
    {id:2,nameKey:'city2',ground:0xDDEEFF,path:0xBBCCDD,sky:0xAABBDD,
     bColors:[0xAADDFF,0x88BBEE,0xCCEEFF,0x99CCEE,0xBBDDFF,0x77AADD,0xDDEEFF,0xAABBCC],
     roof:0x6699BB,tree:0x88CCAA,fog:0xCCDDEE},
    {id:3,nameKey:'city3',ground:0x884444,path:0xAA6644,sky:0xFF6644,
     bColors:[0xCC4444,0xAA3333,0xDD5555,0x993333,0xBB4444,0x882222,0xCC5555,0xAA4444],
     roof:0x662222,tree:0xAA6644,fog:0xFF8866},
    {id:4,nameKey:'city4',ground:0xFFCCDD,path:0xFFBBCC,sky:0xFFDDEE,
     bColors:[0xFFAACC,0xFF88BB,0xFFCCDD,0xFF99BB,0xFFBBDD,0xFF77AA,0xFFDDEE,0xFFAABB],
     roof:0xFF6699,tree:0xFF88AA,fog:0xFFEEFF},
    {id:5,nameKey:'city5',ground:0x444455,path:0x555566,sky:0x111122,
     bColors:[0x666677,0x555566,0x777788,0x444455,0x888899,0x333344,0x666688,0x555577],
     roof:0x333344,tree:0x556655,fog:0x222233}
];

// ---- Portal positions per city ----
var PORTAL_POSITIONS={
    warpPipes:[
        {x:0,z:-65,targetOffset:0},
        {x:65,z:0,targetOffset:1},
        {x:0,z:65,targetOffset:2},
        {x:-65,z:0,targetOffset:3}
    ],
    platformerPortal:{x:0,z:-8}
};

// ---- Cloud world parameters ----
var CLOUD_CONFIG={
    startY:22,      // roof level
    endY:42,        // cloud world height
    cloudParts:3,   // parts per cloud
    cloudScale:{min:2,max:4},
    staircaseSteps:12
};
