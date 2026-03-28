// entity.js — DANBO World
// ============================================================
//  EGG MESH & ENTITY
// ============================================================
function createEggMesh(color, accent, charType) {
    var g = new THREE.Group();
    var bodyGeo = new THREE.SphereGeometry(0.6,20,14);
    var pos = bodyGeo.attributes.position;
    // Species-specific body deformation
    if (charType==='dog') {
        // Ken — normal build (same as Ryu)
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.9+0.25*Math.sin(t*Math.PI)-0.08*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.05);
        }
    } else if (charType==='monkey') {
        // Chun-Li — slim feminine build, narrower waist, taller
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.7+0.2*Math.sin(t*Math.PI)-0.1*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.15);
        }
    } else if (charType==='rooster') {
        // Guile — normal build (same as Ryu)
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.9+0.25*Math.sin(t*Math.PI)-0.08*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.05);
        }
    } else if (charType==='cockroach') {
        // Dhalsim — very thin and tall
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.45+0.1*Math.sin(t*Math.PI);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.2);
        }
    } else if (charType==='cat') {
        // Blanka — round ball shape
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=1.1+0.2*Math.sin(t*Math.PI);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*0.9);
        }
    } else if (charType==='bull') {
        // Honda/Buffalo — round ball shape
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=1.1+0.2*Math.sin(t*Math.PI);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*0.9);
        }
    } else if (charType==='bear') {
        // Zangief/Bear — 1.5x bigger than normal, muscular
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=(0.9+0.25*Math.sin(t*Math.PI)-0.08*t)*1.5;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.05);
        }
    } else {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.9+0.25*Math.sin(t*Math.PI)-0.08*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.1);
        }
    }
    bodyGeo.computeVertexNormals();
    var body=new THREE.Mesh(bodyGeo,toon(color));
    body.position.y=0.7; body.receiveShadow=true; g.add(body);

    // Cracked eggshell — ONLY for egg character
    if (charType==='egg') {
        var shellMat=toon(0xFFFFF0);
        for(var si=0;si<5;si++){
            var sa=si/5*Math.PI*2+0.3;
            var sh=0.08+Math.random()*0.12;
            var sw=0.15+Math.random()*0.08;
            var shard=new THREE.Mesh(new THREE.BoxGeometry(sw,sh,0.03),shellMat);
            shard.position.set(Math.cos(sa)*0.28,1.15+sh*0.5,Math.sin(sa)*0.28);
            shard.rotation.z=Math.cos(sa)*0.3;
            shard.rotation.x=-Math.sin(sa)*0.3;
            shard.rotation.y=sa;
            body.add(shard);
        }
        var rimGeo=new THREE.TorusGeometry(0.3,0.03,6,16);
        var rim=new THREE.Mesh(rimGeo,shellMat);
        rim.position.y=1.12;rim.rotation.x=Math.PI/2;
        body.add(rim);
        // Ryu headband — red band around top of head with trailing ends
        var hbMat=toon(0xCC2222);
        var hbGeo=new THREE.TorusGeometry(0.32,0.035,6,20);
        var headband=new THREE.Mesh(hbGeo,hbMat);
        headband.position.y=1.05;headband.rotation.x=Math.PI/2;
        body.add(headband);
        // Trailing ends at back
        [-1,1].forEach(function(s){
            var trail=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.22,0.025),hbMat);
            trail.position.set(s*0.12,0.92,-0.32);
            trail.rotation.z=s*0.25;trail.rotation.x=0.3;
            body.add(trail);
        });
    }

    // Big cute eyes
    var eyeWhiteG=new THREE.SphereGeometry(0.17,12,10);
    var pupilG=new THREE.SphereGeometry(0.1,10,8);
    var shineG=new THREE.SphereGeometry(0.04,6,4);
    var eyeY=0.88;
    var _eyeWhites=[],_pupils=[],_shines=[];
    [-1,1].forEach(function(s){
        var ew=new THREE.Mesh(eyeWhiteG,toon(0xffffff));
        ew.position.set(s*0.24, eyeY, 0.46); ew.scale.set(1,1.2,0.7);
        body.add(ew);_eyeWhites.push(ew);
        var ep=new THREE.Mesh(pupilG,toon(0x222222));
        ep.position.set(s*0.24, eyeY-0.02, 0.53);
        body.add(ep);_pupils.push(ep);
        var es=new THREE.Mesh(shineG,toon(0xffffff));
        es.position.set(s*0.24+s*0.04, eyeY+0.04, 0.56);
        body.add(es);_shines.push(es);
    });

    // Smile
    var smileCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.12, 0.62, 0.52),
        new THREE.Vector3(0, 0.56, 0.55),
        new THREE.Vector3(0.12, 0.62, 0.52)
    );
    var smileGeo = new THREE.TubeGeometry(smileCurve, 10, 0.025, 6, false);
    var _smileMesh=new THREE.Mesh(smileGeo, toon(0x333333));
    body.add(_smileMesh);

    // Blush cheeks
    var blG=new THREE.CircleGeometry(0.1,12);
    var blM=toon(0xff7777,{transparent:true,opacity:0.45,side:THREE.DoubleSide});
    [-1,1].forEach(function(s){
        var bl=new THREE.Mesh(blG,blM);
        bl.position.set(s*0.38, 0.72, 0.42); bl.rotation.y=s*0.5;
        body.add(bl);
    });

    // Small arms (Q-style stubs)
    var armMat=toon(color);
    [-1,1].forEach(function(s){
        var arm=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),armMat);
        arm.position.set(s*0.52,0.65,0);
        arm.scale.set(0.8,1.2,0.8);
        body.add(arm);
    });

    // Character-specific features
    if (charType==='dog') {
        var earG=new THREE.SphereGeometry(0.18,8,6); earG.scale(1,1.8,0.6);
        [-1,1].forEach(function(s){
            var ear=new THREE.Mesh(earG,toon(0xA0704A));
            ear.position.set(s*0.42,1.05,0.1); ear.rotation.z=s*0.6;
            body.add(ear);
        });
        var nose=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),toon(0x333333));
        nose.position.set(0,0.72,0.55); body.add(nose);
        // Short tail
        var dtail=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),toon(0xA0704A));
        dtail.position.set(0,0.75,-0.55); dtail.scale.set(0.8,1.2,0.8);
        body.add(dtail);
        // Ken blonde hair tuft — spiky yellow on top
        var kenHairMat=toon(0xFFDD44);
        for(var khi=0;khi<6;khi++){
            var kha=khi/6*Math.PI*2;
            var spike=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.2,4),kenHairMat);
            spike.position.set(Math.cos(kha)*0.12,1.2+Math.random()*0.08,Math.sin(kha)*0.1);
            spike.rotation.z=Math.cos(kha)*0.4;spike.rotation.x=-Math.sin(kha)*0.3;
            body.add(spike);
        }
        // Center tall spike
        var centerSpike=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.25,4),kenHairMat);
        centerSpike.position.set(0,1.3,0);
        body.add(centerSpike);
        // Protruding muzzle/snout
        var dogSnout=new THREE.Mesh(new THREE.SphereGeometry(0.15,8,6),toon(0xC08060));
        dogSnout.position.set(0,0.68,0.55);dogSnout.scale.set(1.0,0.7,0.7);
        body.add(dogSnout);
        // Small tongue hanging out
        var tongue=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,4),toon(0xFF6688));
        tongue.position.set(0.04,0.58,0.6);tongue.scale.set(0.8,1.5,0.5);
        body.add(tongue);
        // Paw-print toes on feet
        [-1,1].forEach(function(s){
            for(var pi=0;pi<3;pi++){
                var paw=new THREE.Mesh(new THREE.SphereGeometry(0.03,4,4),toon(0x555555));
                paw.position.set(s*0.2+(pi-1)*0.05,-0.58,0.14);
                body.add(paw);
            }
            // Central pad
            var pad=new THREE.Mesh(new THREE.SphereGeometry(0.04,4,4),toon(0x555555));
            pad.position.set(s*0.2,-0.56,0.08);
            body.add(pad);
        });
    } else if (charType==='cat') {
        // Blanka — wild beast traits
        var cearG=new THREE.ConeGeometry(0.14,0.35,4);
        [-1,1].forEach(function(s){
            var ear=new THREE.Mesh(cearG,toon(color));
            ear.position.set(s*0.32,1.2,0.1);ear.rotation.z=s*0.2;
            body.add(ear);
            var inner=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.2,4),toon(0xFFBBAA));
            inner.position.set(s*0.32,1.18,0.14);inner.rotation.z=s*0.2;
            body.add(inner);
        });
        // Wild mane — orange, more prominent
        for(var _bmi=0;_bmi<12;_bmi++){
            var _bma=_bmi/12*Math.PI*2;
            var spike=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.35,4),toon(0xFF8800));
            spike.position.set(Math.cos(_bma)*0.38,1.1+Math.random()*0.2,Math.sin(_bma)*0.25);
            spike.rotation.z=Math.cos(_bma)*0.5;spike.rotation.x=-Math.sin(_bma)*0.4;
            body.add(spike);
        }
        // Extra top mane tufts
        for(var _bti=0;_bti<4;_bti++){
            var _bta=_bti/4*Math.PI*2+0.4;
            var topSpike=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.28,4),toon(0xFF8800));
            topSpike.position.set(Math.cos(_bta)*0.15,1.35,Math.sin(_bta)*0.12);
            body.add(topSpike);
        }
        // Fangs
        [-1,1].forEach(function(s){
            var fang=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.1,4),toon(0xFFFFFF));
            fang.position.set(s*0.12,0.5,0.55);fang.rotation.x=Math.PI;
            body.add(fang);
        });
        var whG=new THREE.CylinderGeometry(0.008,0.008,0.4,3);
        [-1,1].forEach(function(s){
            for(var w=-1;w<=1;w++){
                var wh=new THREE.Mesh(whG,toon(0x888888));
                wh.position.set(s*0.35,0.7+w*0.06,0.45);
                wh.rotation.z=Math.PI/2+s*0.15+w*0.1;
                body.add(wh);
            }
        });
        // Curved tail
        var catTailPts=[];
        for(var ct=0;ct<=8;ct++){
            var ctt=ct/8;
            catTailPts.push(new THREE.Vector3(0, 0.7+ctt*0.4, -0.5-ctt*0.5+Math.sin(ctt*Math.PI)*0.2));
        }
        var catTailCurve=new THREE.CatmullRomCurve3(catTailPts);
        var catTailGeo=new THREE.TubeGeometry(catTailCurve,12,0.04,6,false);
        body.add(new THREE.Mesh(catTailGeo,toon(color)));
        // Darker stripe markings on body (3 horizontal stripes)
        var stripeMat=toon(0x1A6600);
        for(var sti=0;sti<3;sti++){
            var stripeY=0.35+sti*0.2;
            // Front stripe
            var stripeF=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.04,0.02),stripeMat);
            stripeF.position.set(0,stripeY,0.52);body.add(stripeF);
            // Left side stripe
            var stripeL=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.04,0.35),stripeMat);
            stripeL.position.set(-0.52,stripeY,0.1);body.add(stripeL);
            // Right side stripe
            var stripeR=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.04,0.35),stripeMat);
            stripeR.position.set(0.52,stripeY,0.1);body.add(stripeR);
        }
        // Bigger cat-like slit pupils (cover existing round pupils)
        [-1,1].forEach(function(s){
            var slitPupil=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.18,0.02),toon(0x111111));
            slitPupil.position.set(s*0.24,0.86,0.555);
            body.add(slitPupil);
        });
    } else if (charType==='monkey') {
        var mearG=new THREE.SphereGeometry(0.18,8,6);
        [-1,1].forEach(function(s){
            var ear=new THREE.Mesh(mearG,toon(0xFFCC88));
            ear.position.set(s*0.5,0.9,0); ear.scale.z=0.5;
            body.add(ear);
            var inner=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),toon(0xD4956B));
            inner.position.set(s*0.5,0.9,0.05); inner.scale.z=0.5;
            body.add(inner);
        });
        var muz=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),toon(0xFFCC88));
        muz.position.set(0,0.65,0.45); muz.scale.set(1.2,0.8,0.6);
        body.add(muz);
        // Chun-Li hair buns — two spheres on sides with ribbons
        var bunMat=toon(0x222222);
        [-1,1].forEach(function(s){
            var bun=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),bunMat);
            bun.position.set(s*0.48,1.15,0);
            body.add(bun);
            // Bun cover/wrap
            var wrap=new THREE.Mesh(new THREE.TorusGeometry(0.12,0.03,6,12),toon(0xFFFFFF));
            wrap.position.set(s*0.48,1.15,0);wrap.rotation.y=Math.PI/2;
            body.add(wrap);
            // Ribbon trailing down
            var ribbon=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.25,0.02),toon(0xFFFFFF));
            ribbon.position.set(s*0.52,0.95,0);ribbon.rotation.z=s*0.15;
            body.add(ribbon);
        });
        // Long tail (>=0.6x body)
        var monkTailPts=[];
        for(var mt=0;mt<=10;mt++){
            var mtt=mt/10;
            monkTailPts.push(new THREE.Vector3(
                Math.sin(mtt*Math.PI*0.5)*0.15,
                0.6-mtt*0.3+Math.sin(mtt*Math.PI)*0.3,
                -0.5-mtt*0.7
            ));
        }
        var monkTailCurve=new THREE.CatmullRomCurve3(monkTailPts);
        var monkTailGeo=new THREE.TubeGeometry(monkTailCurve,14,0.04,6,false);
        body.add(new THREE.Mesh(monkTailGeo,toon(0x2255CC)));
        // Lighter belly patch (front of body)
        var bellyPatch=new THREE.Mesh(new THREE.SphereGeometry(0.3,10,8),toon(0xFFDDBB));
        bellyPatch.position.set(0,0.45,0.38);bellyPatch.scale.set(0.8,1.0,0.3);
        body.add(bellyPatch);
        // Curled tail tip with puff ball
        var tailPuff=new THREE.Mesh(new THREE.SphereGeometry(0.07,6,4),toon(0x2255CC));
        tailPuff.position.set(0.15,0.35,-1.15);
        body.add(tailPuff);
    } else if (charType==='rooster') {
        for(var ri=0;ri<3;ri++){
            var cb=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),toon(0xFF3333));
            cb.position.set(-0.08+ri*0.08,1.25+Math.abs(ri-1)*0.04,0.15);
            body.add(cb);
        }
        var wat=new THREE.Mesh(new THREE.SphereGeometry(0.08,6,4),toon(0xFF3333));
        wat.position.set(0,0.52,0.5); wat.scale.y=1.5; body.add(wat);
        var beak=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.18,4),toon(0xFFAA00));
        beak.position.set(0,0.7,0.58); beak.rotation.x=-Math.PI/2;
        body.add(beak);
        // Guile blonde flat-top — rectangular yellow block on top
        var flatTop=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.2,0.3),toon(0xFFDD44));
        flatTop.position.set(0,1.35,0);
        body.add(flatTop);
        // Flat-top side edges for sharp military look
        [-1,1].forEach(function(s){
            var sideFlat=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.18,0.25),toon(0xFFDD44));
            sideFlat.position.set(s*0.22,1.33,0);
            body.add(sideFlat);
        });
        // Bigger wings (scaled up)
        [-1,1].forEach(function(s){
            var wing=new THREE.Mesh(new THREE.SphereGeometry(0.25,8,6),toon(0x556B2F));
            wing.position.set(s*0.58,0.6,-0.05);
            wing.scale.set(0.5,1.3,1.0); wing.rotation.z=s*0.3;
            body.add(wing);
            // Wing tip feather detail
            var wingTip=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.2,4),toon(0x556B2F));
            wingTip.position.set(s*0.72,0.45,-0.05);wingTip.rotation.z=s*0.8;
            body.add(wingTip);
        });
        // Fan-shaped tail feathers (more feathers spread wider)
        for(var fi=0;fi<7;fi++){
            var fAngle=(fi-3)*0.25;
            var fColor=(fi%2===0)?0x556B2F:0xFFDD44;
            var feather=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.45,4),toon(fColor));
            feather.position.set(Math.sin(fAngle)*0.15,0.8+Math.abs(fi-3)*0.04,-0.55);
            feather.rotation.x=0.5+Math.abs(fi-3)*0.08;
            feather.rotation.y=fAngle*0.3;
            body.add(feather);
        }
        // Spurs on feet
        [-1,1].forEach(function(s){
            var spur=new THREE.Mesh(new THREE.ConeGeometry(0.025,0.12,4),toon(0xCCAA00));
            spur.position.set(s*0.2,-0.6,-0.08);spur.rotation.x=0.5;
            body.add(spur);
        });
    } else if (charType==='cockroach') {
        // Dhalsim — elongated body with skull necklace
        // Twin-tail antennae (hair-style)
        var antennae=[];
        [-1,1].forEach(function(s){
            var antPts=[];
            for(var ai=0;ai<=6;ai++){
                var att=ai/6;
                antPts.push(new THREE.Vector3(s*0.1+s*att*0.35, 1.1+att*0.5, 0.1-att*0.15));
            }
            var antCurve=new THREE.CatmullRomCurve3(antPts);
            var antGeo=new THREE.TubeGeometry(antCurve,10,0.025,6,false);
            var ant=new THREE.Mesh(antGeo,toon(0x5C2E0A));
            ant.userData._antSide=s;
            body.add(ant);
            antennae.push(ant);
            var tip=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,4),toon(0x8B6040));
            tip.position.set(s*0.45,1.6,-0.05);
            tip.userData._antSide=s;
            body.add(tip);
            antennae.push(tip);
        });
        g.userData._antennae=antennae;
        // Shell line
        var sline=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.6,0.02),toon(0x3D2215));
        sline.position.set(0,0.8,-0.1); body.add(sline);
        // Small legs
        [-1,1].forEach(function(s){
            for(var j=0;j<2;j++){
                var leg=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.25,3),toon(0x5C2E0A));
                leg.position.set(s*0.45,0.4+j*0.25,0); leg.rotation.z=s*0.8;
                body.add(leg);
            }
        });
        // Skull necklace — 3 small white spheres around neck
        var skullMat=toon(0xFFFFFF);
        for(var ski=0;ski<3;ski++){
            var ska=(ski-1)*0.7;
            var skull=new THREE.Mesh(new THREE.SphereGeometry(0.06,6,4),skullMat);
            skull.position.set(Math.sin(ska)*0.35,0.48,Math.cos(ska)*0.35);
            body.add(skull);
            // Eye holes on each skull
            [-1,1].forEach(function(s){
                var hole=new THREE.Mesh(new THREE.SphereGeometry(0.015,4,3),toon(0x111111));
                hole.position.set(Math.sin(ska)*0.35+s*0.02,0.5,Math.cos(ska)*0.35+0.03);
                body.add(hole);
            });
        }
        // Elongate body slightly more
        body.scale.y=1.1;
        // Wing cases on back (two elliptical translucent shapes)
        var wingCaseMat=toon(0x7B5030,{transparent:true,opacity:0.5});
        [-1,1].forEach(function(s){
            var wingCase=new THREE.Mesh(new THREE.SphereGeometry(0.22,8,6),wingCaseMat);
            wingCase.position.set(s*0.12,0.7,-0.35);
            wingCase.scale.set(0.8,1.4,0.3);
            wingCase.rotation.z=s*0.15;
            body.add(wingCase);
        });
        // Wider/flatter body shape enhancement
        body.scale.x=1.15;body.scale.z=0.9;
    } else if (charType==='bull') {
        // Buffalo (野牛) — Honda moveset
        // Big bull horns (牛魔王 style) — horizontal outward then curve up
        [-1,1].forEach(function(s){
            // Horn root — thick, horizontal outward from head sides
            var hornRoot=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,0.25,8),toon(0x333333));
            hornRoot.position.set(s*0.35,1.0,0.0);hornRoot.rotation.z=s*Math.PI/2;body.add(hornRoot);
            // Horn mid — angled upward
            var hornMid=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.25,8),toon(0x444444));
            hornMid.position.set(s*0.55,1.1,0.0);hornMid.rotation.z=s*Math.PI/3;body.add(hornMid);
            // Horn tip — pointed upward
            var hornTip=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.2,6),toon(0xCCBB88));
            hornTip.position.set(s*0.62,1.3,0.0);hornTip.rotation.z=s*Math.PI/6;body.add(hornTip);
        });
        // Nose ring
        var ringG=new THREE.TorusGeometry(0.06,0.015,6,12,Math.PI);
        var ring=new THREE.Mesh(ringG,toon(0xCCAA00));
        ring.position.set(0,0.6,0.58);ring.rotation.x=Math.PI/2;body.add(ring);
        // Wide nostrils
        [-1,1].forEach(function(s){
            var nos=new THREE.Mesh(new THREE.SphereGeometry(0.04,4,4),toon(0x2A1A0A));
            nos.position.set(s*0.08,0.65,0.55);body.add(nos);
        });
        // Sumo topknot (Honda trait)
        var topknot=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,4),toon(0x222222));
        topknot.position.set(0,1.22,0);body.add(topknot);
        // Face paint stripes (Honda signature)
        [-1,1].forEach(function(s){
            var blueStripe=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.25,0.02),toon(0x2244AA));
            blueStripe.position.set(s*0.16,0.82,0.56);body.add(blueStripe);
        });
        var redStripe=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.05,0.02),toon(0xCC2222));
        redStripe.position.set(0,0.9,0.55);body.add(redStripe);
        // Short tail
        var bufTail=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.01,0.2,4),toon(0x2A1A0A));
        bufTail.position.set(0,0.65,-0.55);bufTail.rotation.x=0.5;body.add(bufTail);
        var tailTuft=new THREE.Mesh(new THREE.SphereGeometry(0.04,4,4),toon(0x222222));
        tailTuft.position.set(0,0.58,-0.63);body.add(tailTuft);
        // Wider protruding muzzle/snout area
        var bullSnout=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),toon(0x3A2A1A));
        bullSnout.position.set(0,0.62,0.52);bullSnout.scale.set(1.3,0.7,0.6);
        body.add(bullSnout);
        // Bigger nostrils (replace small ones with larger)
        [-1,1].forEach(function(s){
            var bigNos=new THREE.Mesh(new THREE.SphereGeometry(0.06,6,4),toon(0x1A0A00));
            bigNos.position.set(s*0.1,0.6,0.6);body.add(bigNos);
        });
        // Hoof-shaped darker feet
        [-1,1].forEach(function(s){
            var hoof=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,0.06,8),toon(0x2A1A0A));
            hoof.position.set(s*0.2,-0.6,0.06);
            body.add(hoof);
        });
    } else if (charType==='bear') {
        // Bear with boar mask (Inosuke style) — Zangief moveset
        // Round bear ears
        [-1,1].forEach(function(s){
            var ear=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6),toon(0x6B4A2A));
            ear.position.set(s*0.35,1.15,0.05);body.add(ear);
            var earInner=new THREE.Mesh(new THREE.SphereGeometry(0.08,6,4),toon(0xAA7755));
            earInner.position.set(s*0.35,1.15,0.1);body.add(earInner);
        });
        // Boar mask on face (lighter color, snout shape)
        var mask=new THREE.Mesh(new THREE.SphereGeometry(0.35,8,6),toon(0xDDCCAA));
        mask.position.set(0,0.82,0.35);mask.scale.set(1,0.8,0.6);body.add(mask);
        // Boar snout
        var snout=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,0.15,8),toon(0xCCBB99));
        snout.position.set(0,0.7,0.55);snout.rotation.x=Math.PI/2;body.add(snout);
        [-1,1].forEach(function(s){
            var nos=new THREE.Mesh(new THREE.SphereGeometry(0.035,4,4),toon(0x885544));
            nos.position.set(s*0.05,0.7,0.63);body.add(nos);
        });
        // Boar tusks
        [-1,1].forEach(function(s){
            var tusk=new THREE.Mesh(new THREE.ConeGeometry(0.025,0.12,4),toon(0xFFFFF0));
            tusk.position.set(s*0.1,0.6,0.58);tusk.rotation.x=-0.3;tusk.rotation.z=s*0.2;body.add(tusk);
        });
        // Chest hair — Zangief trait (bigger, more visible)
        var chestHairMat=toon(0x8B4513);
        for(var chi=0;chi<9;chi++){
            var cha=(chi-4)*0.1;
            var chv=0.35+Math.abs(chi-4)*0.02;
            var hair=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.18,3),chestHairMat);
            hair.position.set(cha,chv,0.5);hair.rotation.x=-0.4;
            body.add(hair);
        }
        // Scars — Zangief trait (large X-shaped scars on chest)
        var scarMat=toon(0xFF6666);
        // Big X scar on chest center
        var scar1=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.05,0.05),scarMat);
        scar1.position.set(0,0.25,0.5);scar1.rotation.z=0.6;body.add(scar1);
        var scar2=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.05,0.05),scarMat);
        scar2.position.set(0,0.25,0.5);scar2.rotation.z=-0.6;body.add(scar2);
        // Scar on left side
        var scar3=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.05,0.05),scarMat);
        scar3.position.set(-0.45,0.3,0.2);scar3.rotation.z=0.4;body.add(scar3);
        // Scar on right side
        var scar4=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.05,0.05),scarMat);
        scar4.position.set(0.45,0.2,0.15);scar4.rotation.z=-0.3;body.add(scar4);
        // Scar on back
        var scar5=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.05,0.05),scarMat);
        scar5.position.set(0.1,0.3,-0.45);scar5.rotation.z=0.5;body.add(scar5);
        // Short stubby bear tail
        var bearTail=new THREE.Mesh(new THREE.SphereGeometry(0.08,6,4),toon(0x6B4A2A));
        bearTail.position.set(0,0.65,-0.55);body.add(bearTail);
        // Bigger bear paws (larger arms/stubs)
        var bearPawMat=toon(0x6B4A2A);
        [-1,1].forEach(function(s){
            var paw=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6),bearPawMat);
            paw.position.set(s*0.6,0.55,0.1);paw.scale.set(0.9,1.0,0.9);
            body.add(paw);
            // Visible claws (small cones on paws)
            for(var ci=0;ci<3;ci++){
                var claw=new THREE.Mesh(new THREE.ConeGeometry(0.02,0.1,4),toon(0xEEDDCC));
                claw.position.set(s*0.65+(ci-1)*0.06,0.42,0.15);
                claw.rotation.x=-0.3;
                body.add(claw);
            }
        });
    }

    // Feet
    var ftG=new THREE.SphereGeometry(0.14,8,6); ftG.scale(1.1,0.45,1.4);
    var ftM=toon(accent||0xFFCC00);
    var feet=[];
    [-1,1].forEach(function(s){ var ft=new THREE.Mesh(ftG,ftM); ft.position.set(s*0.2,0.05,0.06); g.add(ft); feet.push(ft); });
    // Attack limbs (hidden by default, shown during punch/kick)
    var armMat=toon(accent||0xFFCC00);
    var fistMat=toon(0xFFFFFF); // white fists for visibility
    // Fists — white spheres, clearly outside body surface
    var rightArm=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6),fistMat);
    rightArm.position.set(0.4,0.2,0.7);rightArm.visible=false;body.add(rightArm);
    var leftArm=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6),fistMat);
    leftArm.position.set(-0.4,0.2,0.7);leftArm.visible=false;body.add(leftArm);
    // Legs — cylinders on the group
    var rightLeg=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.13,0.7,6),armMat);
    rightLeg.position.set(0.22,0.1,0.5);rightLeg.rotation.x=-Math.PI/3;rightLeg.visible=false;g.add(rightLeg);
    var leftLeg=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.13,0.7,6),armMat);
    leftLeg.position.set(-0.22,0.1,0.5);leftLeg.rotation.x=-Math.PI/3;leftLeg.visible=false;g.add(leftLeg);
    g.userData.body=body; g.userData.feet=feet; g.userData._charType=charType;
    g.userData._eyeWhites=_eyeWhites;g.userData._pupils=_pupils;g.userData._shines=_shines;g.userData._smile=_smileMesh;g.userData._eyeY=eyeY;
    g.userData.rightArm=rightArm;g.userData.leftArm=leftArm;
    g.userData.rightLeg=rightLeg;g.userData.leftLeg=leftLeg;
    return g;
}

const allEggs=[];
let playerEgg=null;

function createEgg(x,z,color,accent,isPlayer,targetScene,charType){
    const mesh=createEggMesh(color,accent,charType);
    mesh.position.set(x,0.01,z);
    (targetScene||scene).add(mesh);
    let arrow=null;
    if(isPlayer){
        const ag=new THREE.ConeGeometry(0.25,0.5,8);
        arrow=new THREE.Mesh(ag,toon(0xFFCC00,{emissive:0xFFCC00,emissiveIntensity:0.4}));
        arrow.rotation.x=Math.PI; arrow.position.y=2.0; mesh.add(arrow);
    }
    const egg={
        mesh, vx:0,vy:0,vz:0, onGround:false, isPlayer,
        alive:true, finished:false, finishOrder:-1,
        radius:0.55, squash:1, arrow, walkPhase:0,
        aiSkill:0.4+Math.random()*0.6,
        aiTargetX:x, aiReactTimer:Math.random()*30, aiJumpCD:0,
        conveyorVx:0, conveyorVz:0, onPlatform:null,
        heldBy:null, holding:null, grabCD:0, struggleTimer:0, struggleMax:0, struggleBar:null, throwTimer:0, holdingObs:null, holdingProp:null, weight:1.0, _stunTimer:0,
        _origColor:color, _stunMeter:0, _stunThreshold:100,
    };
    allEggs.push(egg);
    return egg;
}

// ---- Drop shadow (dark circle projected straight down) ----
var _dropShadowMesh=null;
function _ensureDropShadow(){
    if(_dropShadowMesh)return;
    var geo=new THREE.CircleGeometry(0.7,16);
    var mat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false});
    _dropShadowMesh=new THREE.Mesh(geo,mat);
    _dropShadowMesh.rotation.x=-Math.PI/2;
    _dropShadowMesh.renderOrder=1;
    scene.add(_dropShadowMesh);
}
function _updateDropShadow(){
    if(!playerEgg||!playerEgg.mesh){if(_dropShadowMesh)_dropShadowMesh.visible=false;return;}
    _ensureDropShadow();
    var px=playerEgg.mesh.position.x, py=playerEgg.mesh.position.y, pz=playerEgg.mesh.position.z;
    var isCity=(gameState==='city');
    var groundY=0;
    if(isCity){
        // Check building roofs, props, clouds for highest surface below player
        for(var bi=0;bi<cityColliders.length;bi++){
            var c=cityColliders[bi];
            var dx=px-c.x, dz=pz-c.z;
            // Cone roof
            if(c.roofR&&c.roofH){
                var dist=Math.sqrt(dx*dx+dz*dz);
                if(dist<c.roofR){
                    var roofBase=c.h||6;
                    var surfY=roofBase+(1-dist/c.roofR)*c.roofH;
                    if(surfY<py&&surfY>groundY)groundY=surfY;
                }
            }
            // Flat roof top
            if(Math.abs(dx)<c.hw&&Math.abs(dz)<c.hd){
                var roofY2=(c.h||6);
                if(roofY2<py&&roofY2>groundY)groundY=roofY2;
            }
        }
        // Cloud platforms
        for(var ci3=0;ci3<cityCloudPlatforms.length;ci3++){
            var cl=cityCloudPlatforms[ci3];
            if(Math.abs(px-cl.x)<cl.hw&&Math.abs(pz-cl.z)<cl.hd){
                var clTop=cl.y+(cl.top||1.2);
                if(clTop<py&&clTop>groundY)groundY=clTop;
            }
        }
    } else {
        // Race track floor
        var gz=-pz;
        groundY=getFloorY(gz,px);
        if(groundY<-10)groundY=0;
    }
    _dropShadowMesh.visible=true;
    _dropShadowMesh.position.set(px,groundY+0.05,pz);
    // Scale shadow based on height — smaller when higher up
    var height=py-groundY;
    var sc=Math.max(0.3,1.2-height*0.04);
    _dropShadowMesh.scale.set(sc,sc,sc);
    _dropShadowMesh.material.opacity=Math.max(0.08,0.35-height*0.012);
}

