// ============================================================
//  data-characters.js — Character stats & move parameters
// ============================================================

// ---- Physics constants ----
var CHAR_PHYSICS={
    GRAVITY:0.018, JUMP_FORCE:0.28, MOVE_ACCEL:0.016, MAX_SPEED:0.22, FRICTION:0.92
};

// ---- Stun system ----
var STUN_CONFIG={
    threshold:100,
    damage:{light:8,medium:15,heavy:25,slam:40,special:20},
    hitStunFrames:5,
    grabRange:2.5,
    piledriverRange:5.0
};

// ---- Character definitions ----
var CHAR_DEFS=[
    {name:'egg',sf2:'Ryu',color:0xF5F5F0,accent:0xCC2222,icon:'\uD83E\uDD5A',country:'Japan',flag:'\uD83C\uDDEF\uD83C\uDDF5',mapX:360,mapY:52,
     bodyShape:'normal',portraitRx:55,portraitRy:70,miniRx:0.32,miniRy:0.38},
    {name:'pig',sf2:'E.Honda',color:0x4A3728,accent:0x2244AA,icon:'\uD83D\uDC03',country:'Japan',flag:'\uD83C\uDDEF\uD83C\uDDF5',mapX:360,mapY:52,
     bodyShape:'round',portraitRx:65,portraitRy:60,miniRx:0.38,miniRy:0.34},
    {name:'cat',sf2:'Blanka',color:0x33AA33,accent:0xFF8800,icon:'\uD83D\uDC31',country:'Brazil',flag:'\uD83C\uDDE7\uD83C\uDDF7',mapX:95,mapY:155,
     bodyShape:'round',portraitRx:65,portraitRy:60,miniRx:0.38,miniRy:0.34},
    {name:'rooster',sf2:'Guile',color:0x556B2F,accent:0xFFDD44,icon:'\uD83D\uDC13',country:'USA',flag:'\uD83C\uDDFA\uD83C\uDDF8',mapX:70,mapY:55,
     bodyShape:'normal',portraitRx:55,portraitRy:70,miniRx:0.32,miniRy:0.38},
    {name:'dog',sf2:'Ken',color:0xCC2222,accent:0xFFDD44,icon:'\uD83D\uDC36',country:'USA',flag:'\uD83C\uDDFA\uD83C\uDDF8',mapX:70,mapY:55,
     bodyShape:'normal',portraitRx:55,portraitRy:70,miniRx:0.32,miniRy:0.38},
    {name:'monkey',sf2:'Chun-Li',color:0x2255CC,accent:0xFFFFFF,icon:'\uD83D\uDC35',country:'China',flag:'\uD83C\uDDE8\uD83C\uDDF3',mapX:310,mapY:55,
     bodyShape:'slim',portraitRx:42,portraitRy:75,miniRx:0.25,miniRy:0.42},
    {name:'frog',sf2:'Zangief',color:0x8B6B4A,accent:0x8B4513,icon:'\uD83D\uDC3B',country:'Russia',flag:'\uD83C\uDDF7\uD83C\uDDFA',mapX:290,mapY:18,
     bodyShape:'big',portraitRx:72,portraitRy:72,miniRx:0.42,miniRy:0.40},
    {name:'cockroach',sf2:'Dhalsim',color:0x8B6914,accent:0xFFFFFF,icon:'\uD83E\uDEB3',country:'India',flag:'\uD83C\uDDEE\uD83C\uDDF3',mapX:278,mapY:88,
     bodyShape:'thin',portraitRx:30,portraitRy:78,miniRx:0.20,miniRy:0.42}
];

// ---- Special move parameters per character ----
var MOVE_PARAMS={
    egg:{ // Ryu
        hadouken:{speed:0.35,life:120,color:0xFF4422,ringColor:0xFF8866,burns:true,stunDmg:15},
        shoryuken:{jumpMul:1.6,fwdSpeed:0.15,duration:65,stunDmg:15},
        tatsumaki:{duration:94,hitForce:0.5,hitVy:0.3,stunDmg:15}
    },
    dog:{ // Ken
        hadouken:{speed:0.35,life:120,color:0x4488FF,ringColor:0x88AAFF,burns:false,stunDmg:15},
        shoryuken:{jumpMul:1.7,fwdSpeed:0.35,duration:75,stunDmg:15,fire:true},
        tatsumaki:{duration:94,hitForce:0.5,hitVy:0.3,stunDmg:15}
    },
    pig:{ // Honda
        hyakuretsu:{cd:4,range:2.5,hitForce:0.5,hitVy:0.25,stunDmg:10},
        headbutt:{speed:2,duration:60,cd:70}
    },
    cat:{ // Blanka
        electric:{duration:60,range:2.5,stunDmg:15},
        roll:{speed:3,duration:60,cd:35}
    },
    rooster:{ // Guile
        sonicBoom:{speed:0.5,life:100,color:0xFFDD44,ringColor:0xFFFF88},
        somersault:{jumpMul:1.6,duration:65,arcSpeed:0.2,arcLife:30}
    },
    monkey:{ // Chun-Li
        kikouken:{speed:0.5,life:100,color:0x88BBFF,ringColor:0x88FF88},
        hyakuretsuKick:{cd:4,range:2.5,hitForce:0.5,hitVy:0.25,stunDmg:10},
        spinningBird:{jumpMul:1.2,duration:60}
    },
    frog:{ // Zangief
        lariat:{duration:60,hitForce:0.5,hitVy:0.3,stunDmg:15},
        piledriver:{range:5.0,riseFrames:40,pauseFrames:8,slamFrames:12,maxHeight:15}
    },
    cockroach:{ // Dhalsim
        yogaFire:{speed:0.2,life:180,color:0xFF6600,ringColor:0xFFAA00,burns:true},
        yogaFlame:{duration:60,range:4,stunDmg:20,fireDuration:120,fireStun:90},
        extendedRange:2.5,
        punchCD:32,kickCD:36,punchAnim:28,kickAnim:28,comboTimerPunch:40,comboTimerKick:45
    }
};

// ---- NPC AI special move chances ----
var NPC_MOVE_CHANCE={
    hadouken:0.02,shoryuken:0.008,tatsumaki:0.008,
    hyakuretsu:0.02,headbutt:0.008,
    electric:0.01,roll:0.006,
    sonicBoom:0.015,somersault:0.008,
    kikouken:0.015,hyakuretsuKick:0.015,spinningBird:0.006,
    lariat:0.008,piledriver:0.008,
    yogaFire:0.02,yogaFlame:0.006
};
