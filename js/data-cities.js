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
     roof:0x333344,tree:0x556655,fog:0x222233},
    {id:6,nameKey:'city6',ground:0xDDCCBB,path:0xBBAA99,sky:0xFFDDEE,
     bColors:[0xCC8888,0xEEBBAA,0xDDAA99,0xCCBBAA,0xDDCCBB,0xBB9988,0xEECCBB,0xDDBBAA],
     roof:0x884444,tree:0xFFAABB,fog:0xFFEEF0}
];

// ---- Portal positions per city ----
var PORTAL_POSITIONS={
    warpPipes:[
        {x:0,z:-145,targetOffset:0},
        {x:145,z:0,targetOffset:1},
        {x:0,z:145,targetOffset:2},
        {x:-145,z:0,targetOffset:3},
        {x:105,z:-105,targetOffset:4},
        {x:-105,z:105,targetOffset:5}
    ],
    platformerPortal:{x:0,z:-15}
};

// ---- Cloud world parameters ----
var CLOUD_CONFIG={
    startY:22,      // roof level
    endY:42,        // cloud world height
    cloudParts:3,   // parts per cloud
    cloudScale:{min:2,max:4},
    staircaseSteps:12
};

// ---- Camera parameters ----
var CAMERA_CONFIG={
    zoomMin:0.04, zoomMax:1000,
    followSmooth:0.08, minHeight:3,
    yOffset:10, zOffset:14,
    shakeMultX:2, shakeMultY:1.5, shakeMultZ:2
};

// ---- Renderer / lighting parameters ----
var RENDER_CONFIG={
    fogNear:80, fogFar:400,
    fogColor:0x87CEEB,
    sunColor:0xFFEECC, sunIntensity:2.0,
    sunPos:{x:60,y:80,z:40},
    shadowMapSize:4096, shadowBias:-0.001,
    shadowRange:120, shadowNear:1, shadowFar:300,
    ambientIntensity:0.6,
    hemiSkyColor:0xaaddff, hemiGroundColor:0x88cc66, hemiIntensity:0.5
};

// ---- Portal (race entrance) parameters ----
var PORTAL_CONFIG={
    ringRadius:2, ringThickness:0.3,
    glowRadius:2.2, glowThickness:0.15,
    baseHeight:2.5, baseRadius:2.5,
    triggerDist:6.0, confirmDist:2.5,
    particleRadius:1.8
};

// ---- Warp pipe parameters ----
var PIPE_CONFIG={
    radius:3, height:8,
    ringRadius:3, ringThickness:0.4,
    travelDuration:180
};

// ---- Tree parameters ----
var TREE_CONFIG={
    trunkRadius:{min:0.2,max:0.3}, trunkHeight:2,
    crownRadius:1.5, crownScaleY:0.7,
    collisionRadius:1.2, weight:3.0
};

// ---- Building parameters ----
var BUILDING_CONFIG={
    roofHeightMul:0.6, roofHeight:3,
    windowSpacingY:3, windowSpacingX:2.5,
    windowSize:{w:1,h:1.2,d:0.1},
    doorSize:{w:1.5,h:2.2,d:0.15}
};

// ---- Lamp post parameters ----
var LAMP_CONFIG={
    poleRadius:{top:0.06,bottom:0.08}, poleHeight:4,
    lampRadius:0.25, lampHeight:4.2,
    emissiveIntensity:0.3
};

// ---- Bench parameters ----
var BENCH_CONFIG={
    seatSize:{w:2,h:0.15,d:0.6}, seatHeight:0.5,
    backSize:{w:2,h:0.8,d:0.1}, backHeight:0.9
};
