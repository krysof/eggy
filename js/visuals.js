// visuals.js — DANBO World
// ============================================================
//  CINEMATIC VISUAL UPGRADE LAYER
//  Lightweight procedural beauty pass: richer skies, horizon depth,
//  particles, aurora, glows, ground detail, and stylized contact shadow.
// ============================================================
/* global THREE, scene, camera, CITY_SIZE, MOON_CITY_SIZE, currentCityStyle, cityColliders, cityBuildingMeshes, playerEgg, gameState, toon, _mixHex */

var _visualFXGroup = new THREE.Group();
_visualFXGroup.name = 'DANBO_CinematicVisualFX';
scene.add(_visualFXGroup);
window._visualFXGroup = _visualFXGroup;

var _visualFXState = {
    style: -1,
    particles: [],
    clouds: [],
    auroras: [],
    glows: [],
    instanced: [],
    playerShadow: null,
    t: 0
};

function _visualCreateSoftCircleTexture(){
    var c=document.createElement('canvas');c.width=64;c.height=64;
    var ctx=c.getContext('2d');
    var g=ctx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,255,255,1)');
    g.addColorStop(0.35,'rgba(255,255,255,0.75)');
    g.addColorStop(0.72,'rgba(255,255,255,0.18)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
    var tex=new THREE.CanvasTexture(c);
    tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;
    return tex;
}
function _visualCreateFlareTexture(){
    var c=document.createElement('canvas');c.width=128;c.height=128;
    var ctx=c.getContext('2d');
    var g=ctx.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,'rgba(255,255,255,.95)');
    g.addColorStop(0.2,'rgba(255,255,255,.55)');
    g.addColorStop(0.55,'rgba(255,255,255,.13)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
    ctx.strokeStyle='rgba(255,255,255,.38)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(8,64);ctx.lineTo(120,64);ctx.moveTo(64,8);ctx.lineTo(64,120);ctx.stroke();
    var tex=new THREE.CanvasTexture(c);
    tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;
    return tex;
}
var _visualSoftTex=_visualCreateSoftCircleTexture();
var _visualFlareTex=_visualCreateFlareTexture();

function _visualColorToCss(hex){
    hex=(hex===undefined?0xffffff:hex)>>>0;
    return '#'+('000000'+hex.toString(16)).slice(-6);
}
function _visualMood(style,st){
    var sky=(st&&st.sky!==undefined)?st.sky:0x87CEEB;
    var ground=(st&&st.ground!==undefined)?st.ground:0x55AA88;
    var glow=[0x9BE8FF,0xFFD381,0xC9F4FF,0xFF5A22,0xFF9AD7,0xB9B8FF,0xFFB7D5,0xBBD7FF][style]||0xAADDFF;
    var accent=[0xFFFFFF,0xFFE0A0,0xE8FFFF,0xFFB000,0xFFFFFF,0xDDE7FF,0xFFEAF3,0xFFF2C7][style]||0xFFFFFF;
    return {sky:sky,ground:ground,glow:glow,accent:accent,horizon:(typeof _mixHex==='function'?_mixHex(sky,ground,0.28):sky)};
}
function _visualDisposeMat(mat){
    if(!mat)return;
    if(Array.isArray(mat)){for(var i=0;i<mat.length;i++)_visualDisposeMat(mat[i]);return;}
    if(mat.map&&mat.map!==_visualSoftTex&&mat.map!==_visualFlareTex)mat.map.dispose();
    mat.dispose();
}
function _visualDisposeObject(obj){
    if(!obj)return;
    obj.traverse(function(o){
        if(o.geometry)o.geometry.dispose();
        if(o.material)_visualDisposeMat(o.material);
    });
}
function _clearCityVisualFX(){
    while(_visualFXGroup.children.length>0){
        var ch=_visualFXGroup.children[0];
        _visualFXGroup.remove(ch);
        _visualDisposeObject(ch);
    }
    _visualFXState.style=-1;
    _visualFXState.particles=[];
    _visualFXState.clouds=[];
    _visualFXState.auroras=[];
    _visualFXState.glows=[];
    _visualFXState.instanced=[];
    _visualFXState.playerShadow=null;
}

function _visualRandomInCity(style){
    var range=(style===5?MOON_CITY_SIZE:CITY_SIZE)*0.96;
    return {x:(Math.random()-0.5)*range*2,z:(Math.random()-0.5)*range*2};
}
function _visualGroundY(style,x,z){
    if(style===7)return 3.11;
    if(style===6)return Math.abs(x)>8?8.08:2.12;
    if(style===5)return 0.05;
    return 0.055;
}
function _visualAvoidColliders(x,z,margin){
    margin=margin||1.5;
    if(typeof cityColliders==='undefined')return false;
    for(var i=0;i<cityColliders.length;i++){
        var c=cityColliders[i];
        // Huge terrain colliders are walkable plateaus; do not treat them as blockers for detail.
        if(c.hw>45||c.hd>80)continue;
        if(DANBO_WASM.aabb2D(x,z,c.x,c.z,c.hw,c.hd,margin))return true;
    }
    return false;
}
function _visualMat(color,opacity,additive,tex){
    return new THREE.SpriteMaterial({
        map:tex||_visualSoftTex,
        color:color,
        transparent:true,
        opacity:opacity===undefined?0.45:opacity,
        depthWrite:false,
        depthTest:true,
        blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,
        fog:false
    });
}
function _visualAddGlow(x,y,z,color,w,h,opacity,phase,tex){
    var sp=new THREE.Sprite(_visualMat(color,opacity,true,tex));
    sp.position.set(x,y,z);sp.scale.set(w,h,1);sp.renderOrder=-5;
    _visualFXGroup.add(sp);
    _visualFXState.glows.push({sprite:sp,baseW:w,baseH:h,baseOpacity:opacity,phase:phase||Math.random()*Math.PI*2,pulse:0.06+Math.random()*0.08});
    return sp;
}

function _visualAddPlayerShadow(style){
    var mat=new THREE.MeshBasicMaterial({map:_visualSoftTex,color:0x000000,transparent:true,opacity:style===5?0.22:0.18,depthWrite:false,depthTest:true});
    var sh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat);
    sh.rotation.x=-Math.PI/2;
    sh.scale.set(3.2,2.1,1);
    sh.renderOrder=3;
    _visualFXGroup.add(sh);
    _visualFXState.playerShadow=sh;
}

function _visualAddHorizon(style,st,mood){
    if(style===5)return;
    var radius=style===7?250:(style===6?265:230);
    var count=style===1?22:28;
    var baseColor=(style===3)?0x2A1410:(style===1?0xD9A35B:(style===4?0xFF9AC9:(style===7?0x23334E:mood.horizon)));
    var mat=new THREE.MeshBasicMaterial({color:baseColor,transparent:true,opacity:style===3?0.62:0.48,depthWrite:false,fog:true});
    var geo=(style===4)?new THREE.SphereGeometry(1,10,6):new THREE.ConeGeometry(1,1,5);
    var dummy=new THREE.Object3D();
    var mesh=new THREE.InstancedMesh(geo,mat,count);
    mesh.name='horizon-silhouette';mesh.frustumCulled=false;
    for(var i=0;i<count;i++){
        var a=i/count*Math.PI*2+(Math.random()-0.5)*0.08;
        var r=radius+Math.random()*50;
        var h=(style===1?12:28)+Math.random()*(style===1?10:38);
        if(style===7)h=35+Math.random()*55;
        if(style===4)h=10+Math.random()*16;
        dummy.position.set(Math.cos(a)*r,h*0.5-2,Math.sin(a)*r);
        if(style===4)dummy.scale.set(14+Math.random()*16,h*0.42,14+Math.random()*16);
        else dummy.scale.set(22+Math.random()*35,h,22+Math.random()*35);
        dummy.rotation.set(0,-a+Math.PI/2,0);
        dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    }
    _visualFXGroup.add(mesh);
    _visualFXState.instanced.push(mesh);
}

function _visualAddAtmosphericClouds(style,mood){
    if(style===5||style===7)return;
    var cloudColor=style===3?0xFF7744:(style===1?0xFFE4A8:(style===4?0xFFE7FF:0xFFFFFF));
    var cloudCount=style===3?10:18;
    for(var i=0;i<cloudCount;i++){
        var a=i/cloudCount*Math.PI*2+Math.random()*0.35;
        var r=135+Math.random()*85;
        var y=42+Math.random()*35+(style===6?10:0);
        var sp=_visualAddGlow(Math.cos(a)*r,y,Math.sin(a)*r,cloudColor,24+Math.random()*35,7+Math.random()*10,style===3?0.16:0.22,Math.random()*6.28);
        sp.material.blending=THREE.NormalBlending;
        _visualFXState.clouds.push({sprite:sp,angle:a,radius:r,baseY:y,speed:(Math.random()*0.05+0.015)*(Math.random()<0.5?-1:1)});
    }
}

function _visualAddPointsCloud(name,count,style,bounds,colorA,colorB,size,opts){
    opts=opts||{};
    var pos=new Float32Array(count*3);
    var col=new Float32Array(count*3);
    var vel=new Float32Array(count*3);
    var phase=new Float32Array(count);
    var ca=new THREE.Color(colorA),cb=new THREE.Color(colorB===undefined?colorA:colorB);
    for(var i=0;i<count;i++){
        var x,z,y;
        if(bounds.sphere){
            var a=Math.random()*Math.PI*2;
            var rr=bounds.radiusMin+Math.random()*(bounds.radiusMax-bounds.radiusMin);
            x=Math.cos(a)*rr;z=Math.sin(a)*rr;y=bounds.yMin+Math.random()*(bounds.yMax-bounds.yMin);
        } else {
            x=bounds.xMin+Math.random()*(bounds.xMax-bounds.xMin);
            z=bounds.zMin+Math.random()*(bounds.zMax-bounds.zMin);
            y=bounds.yMin+Math.random()*(bounds.yMax-bounds.yMin);
        }
        pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;
        vel[i*3]=(opts.vx||0)+(Math.random()-0.5)*(opts.vxRand||0.012);
        vel[i*3+1]=(opts.vy||0)+(Math.random()-0.5)*(opts.vyRand||0.012);
        vel[i*3+2]=(opts.vz||0)+(Math.random()-0.5)*(opts.vzRand||0.012);
        phase[i]=Math.random()*Math.PI*2;
        var c=ca.clone().lerp(cb,Math.random());
        col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
    }
    var geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color',new THREE.BufferAttribute(col,3));
    var mat=new THREE.PointsMaterial({
        size:size||1.0,
        map:_visualSoftTex,
        transparent:true,
        opacity:opts.opacity===undefined?0.72:opts.opacity,
        vertexColors:true,
        depthWrite:false,
        depthTest:true,
        sizeAttenuation:true,
        blending:opts.additive===false?THREE.NormalBlending:THREE.AdditiveBlending,
        fog:opts.fog!==false
    });
    var pts=new THREE.Points(geo,mat);
    pts.name=name;pts.frustumCulled=false;
    _visualFXGroup.add(pts);
    _visualFXState.particles.push({points:pts,pos:pos,vel:vel,phase:phase,bounds:bounds,opts:opts,baseOpacity:mat.opacity});
    return pts;
}

function _visualResetParticle(p,i,px,pz){
    var b=p.bounds,o=p.opts||{};
    var x,z,y;
    if(b.sphere){
        var a=Math.random()*Math.PI*2;
        var rr=b.radiusMin+Math.random()*(b.radiusMax-b.radiusMin);
        x=Math.cos(a)*rr;z=Math.sin(a)*rr;y=b.yMin+Math.random()*(b.yMax-b.yMin);
    } else if(o.followPlayer&&playerEgg){
        x=px+(Math.random()-0.5)*(b.xMax-b.xMin);
        z=pz+(Math.random()-0.5)*(b.zMax-b.zMin);
        y=b.yMin+Math.random()*(b.yMax-b.yMin);
    } else {
        x=b.xMin+Math.random()*(b.xMax-b.xMin);
        z=b.zMin+Math.random()*(b.zMax-b.zMin);
        y=b.yMin+Math.random()*(b.yMax-b.yMin);
    }
    p.pos[i*3]=x;p.pos[i*3+1]=y;p.pos[i*3+2]=z;
}

function _visualAddGroundInstanced(style,st,mood){
    if(style===5)return;
    var count=(style===6)?420:(style===7?330:(style===3?0:520));
    if(count>0){
        var geo=new THREE.ConeGeometry(0.08,0.95,3);
        var grassColor=(style===1)?0xC9B96A:(style===2?0xDDF8FF:(style===4?0xFFB7D9:(style===7?0xDCEBFF:(style===6?0xFFB7C9:0x67D56A))));
        var mat=new THREE.MeshBasicMaterial({color:grassColor,transparent:true,opacity:style===7?0.34:0.62,fog:true});
        var mesh=new THREE.InstancedMesh(geo,mat,count);
        mesh.name='instanced-ground-sparkle-grass';mesh.frustumCulled=false;
        var dummy=new THREE.Object3D();var placed=0,tries=0;
        while(placed<count&&tries<count*8){
            tries++;
            var p=_visualRandomInCity(style);var x=p.x,z=p.z;
            if(style!==6&&style!==7&&(DANBO_WASM.absDeltaLess(x,0,5)||DANBO_WASM.absDeltaLess(z,0,5)))continue;
            if(_visualAvoidColliders(x,z,1.2))continue;
            var gy=_visualGroundY(style,x,z);
            dummy.position.set(x,gy+0.45,z);
            var s=0.45+Math.random()*1.5;
            dummy.scale.set(s*(0.7+Math.random()*0.5),s*(0.8+Math.random()*0.9),s*(0.7+Math.random()*0.5));
            dummy.rotation.set((Math.random()-0.5)*0.28,Math.random()*Math.PI*2,(Math.random()-0.5)*0.28);
            dummy.updateMatrix();mesh.setMatrixAt(placed,dummy.matrix);placed++;
        }
        mesh.count=placed;
        _visualFXGroup.add(mesh);_visualFXState.instanced.push(mesh);
    }
    if(style!==3&&style!==1){
        var fCount=(style===4?180:(style===6?150:(style===7?120:170)));
        var fGeo=new THREE.OctahedronGeometry(0.13,0);
        var fMat=new THREE.MeshBasicMaterial({color:(style===2?0xBFF8FF:(style===7?0xFFF9D8:(style===6?0xFF7FAF:(style===4?0xFFFF88:0xFFEC76)))),transparent:true,opacity:0.72,fog:true});
        var flowers=new THREE.InstancedMesh(fGeo,fMat,fCount);
        flowers.name='instanced-ground-flowers';flowers.frustumCulled=false;
        var d2=new THREE.Object3D();var placed2=0,tries2=0;
        while(placed2<fCount&&tries2<fCount*9){
            tries2++;var fp=_visualRandomInCity(style);var fx=fp.x,fz=fp.z;
            if(_visualAvoidColliders(fx,fz,1.6))continue;
            var fy=_visualGroundY(style,fx,fz);
            d2.position.set(fx,fy+0.16,fz);
            var fs=0.7+Math.random()*1.5;
            d2.scale.set(fs,fs,fs);d2.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI*2,Math.random()*Math.PI);
            d2.updateMatrix();flowers.setMatrixAt(placed2,d2.matrix);placed2++;
        }
        flowers.count=placed2;
        _visualFXGroup.add(flowers);_visualFXState.instanced.push(flowers);
    }
}

function _visualAddBuildingHalos(style,mood){
    if(typeof cityBuildingMeshes==='undefined'||style===5)return;
    var max=Math.min(cityBuildingMeshes.length,style===7?42:34);
    var color=(style===7)?0xFFD28A:(style===3?0xFF6A22:(style===2?0xCCF8FF:(style===6?0xFFB0C8:0xFFF3B0)));
    for(var i=0;i<max;i++){
        var b=cityBuildingMeshes[i];
        if(!b||Math.random()<0.18)continue;
        var y=Math.max(2,(b.h||8)*0.62);
        if(style===6)y=(b.h||8)+1.4;
        var sp=_visualAddGlow(b.x,y,b.z,color,5+(b.hw||3)*0.65,3.5+(b.h||8)*0.12,style===3?0.20:0.16,i*0.3,_visualFlareTex);
        sp.material.depthTest=false;
    }
}

function _visualAddLavaCracks(){
    var count=90;
    var geo=new THREE.BoxGeometry(1,0.035,0.08);
    var mat=new THREE.MeshBasicMaterial({color:0xFF5A13,transparent:true,opacity:0.78,depthWrite:false,blending:THREE.AdditiveBlending,fog:true});
    var mesh=new THREE.InstancedMesh(geo,mat,count);
    var d=new THREE.Object3D();var placed=0,tries=0;
    while(placed<count&&tries<count*8){
        tries++;var p=_visualRandomInCity(3);var x=p.x,z=p.z;
        if(DANBO_WASM.absDeltaLess(x,0,7)||DANBO_WASM.absDeltaLess(z,0,7)||_visualAvoidColliders(x,z,1.0))continue;
        d.position.set(x,0.09,z);
        d.scale.set(2+Math.random()*9,1,1);
        d.rotation.set(0,Math.random()*Math.PI*2,0);
        d.updateMatrix();mesh.setMatrixAt(placed,d.matrix);placed++;
    }
    mesh.count=placed;mesh.name='lava-emissive-cracks';mesh.frustumCulled=false;
    _visualFXGroup.add(mesh);_visualFXState.instanced.push(mesh);
}

function _visualAddIceCrystals(style){
    var count=style===7?70:95;
    var geo=new THREE.ConeGeometry(0.45,2.4,5);
    var mat=new THREE.MeshBasicMaterial({color:style===7?0xC9EAFF:0x9DEEFF,transparent:true,opacity:0.48,depthWrite:false,blending:THREE.AdditiveBlending,fog:true});
    var mesh=new THREE.InstancedMesh(geo,mat,count);
    var d=new THREE.Object3D();var placed=0,tries=0;
    while(placed<count&&tries<count*8){
        tries++;var p=_visualRandomInCity(style);var x=p.x,z=p.z;
        if(_visualAvoidColliders(x,z,2.0))continue;
        var y=_visualGroundY(style,x,z);
        d.position.set(x,y+1.0,z);
        var s=0.45+Math.random()*1.25;
        d.scale.set(0.65*s,0.8+Math.random()*1.8,0.65*s);
        d.rotation.set((Math.random()-0.5)*0.45,Math.random()*Math.PI*2,(Math.random()-0.5)*0.45);
        d.updateMatrix();mesh.setMatrixAt(placed,d.matrix);placed++;
    }
    mesh.count=placed;mesh.name='ice-snow-crystals';mesh.frustumCulled=false;
    _visualFXGroup.add(mesh);_visualFXState.instanced.push(mesh);
}

function _visualAddCandyProps(){
    var colors=[0xFF66AA,0x88CCFF,0xFFFF77,0xAA88FF,0x77FFBB];
    var stickMat=new THREE.MeshBasicMaterial({color:0xFFFFFF,fog:true});
    for(var i=0;i<30;i++){
        var p=_visualRandomInCity(4);if(_visualAvoidColliders(p.x,p.z,2.5))continue;
        var g=new THREE.Group();g.position.set(p.x,0,p.z);g.rotation.y=Math.random()*Math.PI*2;
        var stick=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,2.2,6),stickMat.clone());
        stick.position.y=1.1;g.add(stick);
        var head=new THREE.Mesh(new THREE.TorusGeometry(0.6,0.16,8,18),new THREE.MeshBasicMaterial({color:colors[i%colors.length],transparent:true,opacity:0.88,fog:true}));
        head.position.y=2.35;head.rotation.x=Math.PI/2;g.add(head);
        var candyGlow=_visualAddGlow(p.x,2.35,p.z,colors[i%colors.length],2.3,2.3,0.12,i*0.5);
        candyGlow.material.depthTest=false;
        _visualFXGroup.add(g);
    }
}

function _visualAddAurora(style){
    var palette=style===7?[0x66D8FF,0x88FFCC,0xB68CFF]:[0x88AAFF,0xFF88DD,0x66FFEE];
    for(var r=0;r<3;r++){
        var geo=new THREE.PlaneGeometry(150+r*45,26+r*5,32,1);
        var pos=geo.attributes.position;
        var base=new Float32Array(pos.count);
        for(var i=0;i<pos.count;i++){base[i]=pos.getY(i);}
        geo.userData.baseY=base;
        var mat=new THREE.MeshBasicMaterial({color:palette[r%palette.length],transparent:true,opacity:style===7?0.30:0.22,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
        var mesh=new THREE.Mesh(geo,mat);
        mesh.position.set((r-1)*30,style===7?72+r*9:85+r*5,style===7?-205-r*22:-260-r*30);
        mesh.rotation.y=(r-1)*0.18;mesh.frustumCulled=false;mesh.renderOrder=-8;
        _visualFXGroup.add(mesh);
        _visualFXState.auroras.push({mesh:mesh,phase:Math.random()*Math.PI*2,amp:4+r*1.6,baseOpacity:mat.opacity});
    }
}

function _visualAddMoonVisuals(){
    _visualAddAurora(5);
    _visualAddPointsCloud('moon-deep-stars',900,5,{sphere:true,radiusMin:280,radiusMax:760,yMin:80,yMax:420},0xFFFFFF,0xAAB8FF,2.0,{opacity:0.85,static:true,twinkle:true,fog:false,vxRand:0,vyRand:0,vzRand:0});
    _visualAddPointsCloud('moon-nebula-dust',260,5,{sphere:true,radiusMin:140,radiusMax:470,yMin:35,yMax:220},0x6655FF,0xFF7AD7,4.0,{opacity:0.32,static:true,twinkle:true,fog:false});
    for(var i=0;i<5;i++){
        var a=i/5*Math.PI*2+0.3;
        _visualAddGlow(Math.cos(a)*340,110+Math.random()*90,Math.sin(a)*340, i%2?0xFF8BDD:0x7EA7FF,80+Math.random()*50,42+Math.random()*25,0.12,i,_visualSoftTex);
    }
}

function _visualAddCitySpecific(style,st,mood){
    var range=(style===5?MOON_CITY_SIZE:CITY_SIZE);
    if(style===0){
        _visualAddPointsCloud('hope-fireflies',240,style,{xMin:-range,xMax:range,zMin:-range,zMax:range,yMin:0.7,yMax:8},0xFFF7A0,0xAAFFDD,1.45,{opacity:0.62,vxRand:0.02,vyRand:0.012,vzRand:0.02,wrap:true,twinkle:true});
    } else if(style===1){
        _visualAddPointsCloud('desert-gold-dust',300,style,{xMin:-range,xMax:range,zMin:-range,zMax:range,yMin:0.4,yMax:18},0xFFE39A,0xFFAA55,1.25,{opacity:0.42,vx:0.018,vxRand:0.025,vyRand:0.006,vzRand:0.018,wrap:true,twinkle:true});
    } else if(style===2){
        _visualAddIceCrystals(style);
        _visualAddPointsCloud('ice-diamond-glitter',330,style,{xMin:-range,xMax:range,zMin:-range,zMax:range,yMin:0.5,yMax:20},0xE8FFFF,0x77D8FF,1.25,{opacity:0.58,vxRand:0.018,vyRand:0.01,vzRand:0.018,wrap:true,twinkle:true});
    } else if(style===3){
        _visualAddLavaCracks();
        _visualAddPointsCloud('lava-embers',360,style,{xMin:-range,xMax:range,zMin:-range,zMax:range,yMin:0.4,yMax:24},0xFF3A00,0xFFD15A,2.0,{opacity:0.75,vxRand:0.025,vy:0.035,vyRand:0.03,vzRand:0.025,wrap:true,twinkle:true,additive:true});
        for(var li=0;li<14;li++){var lp=_visualRandomInCity(3);_visualAddGlow(lp.x,1.2,lp.z,0xFF4400,10+Math.random()*14,4+Math.random()*6,0.14,li*0.4);}
    } else if(style===4){
        _visualAddCandyProps();
        _visualAddPointsCloud('candy-sugar-sparkles',300,style,{xMin:-range,xMax:range,zMin:-range,zMax:range,yMin:1,yMax:22},0xFFFFFF,0xFF8CEB,1.5,{opacity:0.66,vxRand:0.02,vyRand:0.02,vzRand:0.02,wrap:true,twinkle:true});
    } else if(style===5){
        _visualAddMoonVisuals();
    } else if(style===6){
        _visualAddPointsCloud('sakura-pink-haze',360,style,{xMin:-range,xMax:range,zMin:-range,zMax:range,yMin:6,yMax:30},0xFFD7E8,0xFF8FB7,1.8,{opacity:0.38,vx:0.025,vxRand:0.025,vy:-0.01,vyRand:0.012,vzRand:0.025,wrap:true,twinkle:true});
        for(var si=0;si<18;si++){
            var z=-110+si*13;
            _visualAddGlow(-10,10,z,0xFFB866,6,5,0.12,si*0.2,_visualFlareTex);
            _visualAddGlow(10,10,z+6,0xFFB866,6,5,0.12,si*0.25,_visualFlareTex);
        }
    } else if(style===7){
        _visualAddAurora(7);
        _visualAddIceCrystals(style);
        _visualAddPointsCloud('snow-soft-glitter',430,style,{xMin:-range,xMax:range,zMin:-range,zMax:range,yMin:3.3,yMax:34},0xFFFFFF,0xBFDFFF,1.55,{opacity:0.64,vxRand:0.025,vy:-0.025,vyRand:0.018,vzRand:0.025,wrap:true,twinkle:true});
        for(var wi=0;wi<26;wi++){
            var p=_visualRandomInCity(7);
            if(_visualAvoidColliders(p.x,p.z,1.0))continue;
            _visualAddGlow(p.x,4.7,p.z,0xFFC975,5.8,4.5,0.16,wi*0.35,_visualFlareTex);
        }
    }
}

function _rebuildCityVisualFX(style,st){
    _clearCityVisualFX();
    style=(style===undefined)?currentCityStyle:style;
    st=st||{};
    var mood=_visualMood(style,st);
    _visualFXState.style=style;
    _visualFXState.t=0;
    if(document&&document.body){
        document.body.setAttribute('data-city-style',String(style));
        document.body.style.setProperty('--city-glow',_visualColorToCss(mood.glow));
        document.body.style.setProperty('--city-sky',_visualColorToCss(mood.sky));
        document.body.style.setProperty('--city-accent',_visualColorToCss(mood.accent));
    }
    _visualAddPlayerShadow(style);
    _visualAddHorizon(style,st,mood);
    _visualAddAtmosphericClouds(style,mood);
    _visualAddGroundInstanced(style,st,mood);
    _visualAddBuildingHalos(style,mood);
    _visualAddCitySpecific(style,st,mood);
}

function _syncVisualFXVisibility(){
    if(!_visualFXGroup)return;
    var gs=(typeof gameState==='undefined')?'city':gameState;
    _visualFXGroup.visible=(gs==='city'||gs==='menu'||gs==='select');
}

function _updateVisualFX(px,py,pz,t){
    _syncVisualFXVisibility();
    if(!_visualFXGroup.visible)return;
    _visualFXState.t=t||Date.now()*0.001;
    var time=_visualFXState.t;
    // Player soft contact shadow: stylized depth even when hardware shadows are faint.
    var sh=_visualFXState.playerShadow;
    if(sh&&playerEgg){
        var x=playerEgg.mesh.position.x,z=playerEgg.mesh.position.z;
        var gy=_visualGroundY(currentCityStyle,x,z);
        var height=Math.max(0.1,playerEgg.mesh.position.y-gy);
        sh.position.set(x,gy+0.022,z);
        var stretch=Math.min(1.9,1+height*0.035);
        sh.scale.set(3.2*stretch,2.05*stretch,1);
        sh.material.opacity=Math.max(0.04,(currentCityStyle===5?0.22:0.18)*(1-Math.min(height/22,0.82)));
    }
    // Billboard glows and lens flares breathe very gently.
    for(var gi=0;gi<_visualFXState.glows.length;gi++){
        var g=_visualFXState.glows[gi];
        var s=1+Math.sin(time*1.4+g.phase)*g.pulse;
        g.sprite.scale.set(g.baseW*s,g.baseH*s,1);
        g.sprite.material.opacity=g.baseOpacity*(0.82+Math.sin(time*2.1+g.phase)*0.18);
    }
    // Decorative far clouds drift, adding parallax to the skyline.
    for(var ci=0;ci<_visualFXState.clouds.length;ci++){
        var cl=_visualFXState.clouds[ci];
        cl.angle+=cl.speed*0.0015;
        cl.sprite.position.x=Math.cos(cl.angle)*cl.radius;
        cl.sprite.position.z=Math.sin(cl.angle)*cl.radius;
        cl.sprite.position.y=cl.baseY+Math.sin(time*0.25+ci)*1.5;
    }
    // Aurora ribbon vertex wave.
    for(var ai=0;ai<_visualFXState.auroras.length;ai++){
        var au=_visualFXState.auroras[ai];
        var pos=au.mesh.geometry.attributes.position;
        var base=au.mesh.geometry.userData.baseY;
        for(var vi=0;vi<pos.count;vi++){
            var x=pos.getX(vi);
            pos.setY(vi,base[vi]+Math.sin(x*0.06+time*0.9+au.phase)*au.amp+Math.sin(x*0.13+time*1.7+ai)*au.amp*0.35);
        }
        pos.needsUpdate=true;
        au.mesh.material.opacity=au.baseOpacity*(0.78+Math.sin(time*0.8+au.phase)*0.22);
    }
    // Points: motes, embers, snow, petals, stars. Counts are small and rendered in one draw call per layer.
    for(var pi=0;pi<_visualFXState.particles.length;pi++){
        var p=_visualFXState.particles[pi];
        var opts=p.opts||{};
        if(opts.twinkle)p.points.material.opacity=p.baseOpacity*(0.72+0.28*Math.abs(Math.sin(time*0.9+pi)));
        if(opts.static){continue;}
        var b=p.bounds;
        for(var i=0;i<p.phase.length;i++){
            var idx=i*3;
            p.pos[idx]+=p.vel[idx]+Math.sin(time*0.9+p.phase[i])*0.004;
            p.pos[idx+1]+=p.vel[idx+1]+Math.sin(time*1.3+p.phase[i])*0.002;
            p.pos[idx+2]+=p.vel[idx+2]+Math.cos(time*0.8+p.phase[i])*0.004;
            var out=false;
            if(p.pos[idx+1]<b.yMin-4||p.pos[idx+1]>b.yMax+4)out=true;
            if(!b.sphere&&(p.pos[idx]<b.xMin-12||p.pos[idx]>b.xMax+12||p.pos[idx+2]<b.zMin-12||p.pos[idx+2]>b.zMax+12))out=true;
            if(out)_visualResetParticle(p,i,px,pz);
        }
        p.points.geometry.attributes.position.needsUpdate=true;
    }
}
