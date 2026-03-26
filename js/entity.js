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
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.95+0.2*Math.sin(t*Math.PI)+0.1*(1-t);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.15);
        }
    } else if (charType==='monkey') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.85+0.3*Math.sin(t*Math.PI)-0.15*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.08);
        }
    } else if (charType==='rooster') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.88+0.22*Math.sin(t*Math.PI)-0.12*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.18);
        }
    } else if (charType==='cockroach') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=1.05+0.15*Math.sin(t*Math.PI);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*0.88);
        }
    } else if (charType==='cat') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=0.9+0.24*Math.sin(t*Math.PI)-0.1*t;
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.12);
        }
    } else if (charType==='pig') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=1.0+0.2*Math.sin(t*Math.PI);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*1.0);
        }
    } else if (charType==='frog') {
        for(var i=0;i<pos.count;i++){
            var y=pos.getY(i); var t=(y+0.6)/1.2;
            var s=1.05+0.18*Math.sin(t*Math.PI);
            pos.setX(i,pos.getX(i)*s); pos.setZ(i,pos.getZ(i)*s); pos.setY(i,y*0.85);
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
    var eyeY=charType==='frog'?0.68:0.88;
    [-1,1].forEach(function(s){
        var ew=new THREE.Mesh(eyeWhiteG,toon(0xffffff));
        ew.position.set(s*0.24, eyeY, 0.46); ew.scale.set(1,1.2,0.7);
        body.add(ew);
        var ep=new THREE.Mesh(pupilG,toon(0x222222));
        ep.position.set(s*0.24, eyeY-0.02, 0.53);
        body.add(ep);
        var es=new THREE.Mesh(shineG,toon(0xffffff));
        es.position.set(s*0.24+s*0.04, eyeY+0.04, 0.56);
        body.add(es);
    });

    // Smile
    var smileCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.12, 0.62, 0.52),
        new THREE.Vector3(0, 0.56, 0.55),
        new THREE.Vector3(0.12, 0.62, 0.52)
    );
    var smileGeo = new THREE.TubeGeometry(smileCurve, 10, 0.025, 6, false);
    body.add(new THREE.Mesh(smileGeo, toon(0x333333)));

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
        // Wings
        [-1,1].forEach(function(s){
            var wing=new THREE.Mesh(new THREE.SphereGeometry(0.18,6,4),toon(0x556B2F));
            wing.position.set(s*0.55,0.65,-0.05);
            wing.scale.set(0.4,1.0,0.8); wing.rotation.z=s*0.3;
            body.add(wing);
        });
        // Tail feathers
        for(var fi=0;fi<3;fi++){
            var feather=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.4,4),toon(fi===1?0x556B2F:0xFFDD44));
            feather.position.set((fi-1)*0.08,0.85+fi*0.05,-0.55);
            feather.rotation.x=0.6+fi*0.1;
            body.add(feather);
        }
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
    } else if (charType==='pig') {
        // E.Honda — sumo wrestler traits
        // Prominent snout
        var snout=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.12,8),toon(0xFFCCAA));
        snout.position.set(0,0.68,0.52); snout.rotation.x=Math.PI/2;
        body.add(snout);
        [-1,1].forEach(function(s){
            var nos=new THREE.Mesh(new THREE.SphereGeometry(0.04,4,4),toon(0xDD6677));
            nos.position.set(s*0.06,0.68,0.6); body.add(nos);
        });
        // Sumo topknot (mage)
        var topknot=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,4),toon(0x222222));
        topknot.position.set(0,1.2,0);body.add(topknot);
        // Face paint — prominent blue and red kabuki stripes
        // Blue vertical stripes (Honda's signature)
        [-1,1].forEach(function(s){
            var blueStripe=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.35,0.02),toon(0x2244AA));
            blueStripe.position.set(s*0.18,0.78,0.55);body.add(blueStripe);
        });
        // Red horizontal stripe across face
        var redStripe=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.06,0.02),toon(0xCC2222));
        redStripe.position.set(0,0.85,0.54);body.add(redStripe);
        // Additional red marks under eyes
        [-1,1].forEach(function(s){
            var redMark=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.04,0.02),toon(0xCC2222));
            redMark.position.set(s*0.2,0.72,0.56);body.add(redMark);
        });
        // Small floppy ears
        var pearG=new THREE.SphereGeometry(0.14,6,4); pearG.scale(1,1.2,0.5);
        [-1,1].forEach(function(s){
            var ear=new THREE.Mesh(pearG,toon(0xFFCCAA));
            ear.position.set(s*0.35,1.08,0.1); ear.rotation.z=s*0.5;
            body.add(ear);
        });
        // Curly tail
        var pigTailPts=[];
        for(var pt=0;pt<=12;pt++){
            var ptt=pt/12;
            pigTailPts.push(new THREE.Vector3(
                Math.sin(ptt*Math.PI*3)*0.08,
                0.7+Math.cos(ptt*Math.PI*3)*0.08,
                -0.5-ptt*0.25
            ));
        }
        var pigTailCurve=new THREE.CatmullRomCurve3(pigTailPts);
        var pigTailGeo=new THREE.TubeGeometry(pigTailCurve,16,0.03,6,false);
        body.add(new THREE.Mesh(pigTailGeo,toon(0xFFCCAA)));
    } else if (charType==='frog') {
        // Zangief — bulging eyes on top
        [-1,1].forEach(function(s){
            var bulge=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),toon(color));
            bulge.position.set(s*0.22,1.0,0.3); body.add(bulge);
            var bigEye=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),toon(0xffffff));
            bigEye.position.set(s*0.22,1.02,0.38); body.add(bigEye);
            var bigPupil=new THREE.Mesh(new THREE.SphereGeometry(0.07,6,4),toon(0x111111));
            bigPupil.position.set(s*0.22,1.01,0.44); body.add(bigPupil);
        });
        // Wide mouth line
        var mouthCurve=new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-0.25,0.5,0.48),
            new THREE.Vector3(0,0.42,0.52),
            new THREE.Vector3(0.25,0.5,0.48)
        );
        var mouthGeo=new THREE.TubeGeometry(mouthCurve,10,0.025,4,false);
        body.add(new THREE.Mesh(mouthGeo,toon(0x881111)));
        // Chest hair — brown fuzzy patch on front
        var chestHairMat=toon(0x8B4513);
        for(var chi=0;chi<7;chi++){
            var cha=(chi-3)*0.12;
            var chv=0.55+Math.abs(chi-3)*0.03;
            var hair=new THREE.Mesh(new THREE.ConeGeometry(0.025,0.12,3),chestHairMat);
            hair.position.set(cha,chv,0.5);hair.rotation.x=-0.3;
            body.add(hair);
        }
        // Extra chest hair row
        for(var chi2=0;chi2<5;chi2++){
            var cha2=(chi2-2)*0.1;
            var hair2=new THREE.Mesh(new THREE.ConeGeometry(0.02,0.1,3),chestHairMat);
            hair2.position.set(cha2,0.45,0.52);hair2.rotation.x=-0.3;
            body.add(hair2);
        }
        // Scars — thin lines on body
        var scarMat=toon(0xFFAAAA);
        var scar1=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.015,0.01),scarMat);
        scar1.position.set(0.15,0.7,0.52);scar1.rotation.z=0.3;
        body.add(scar1);
        var scar2=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.015,0.01),scarMat);
        scar2.position.set(-0.1,0.6,0.53);scar2.rotation.z=-0.2;
        body.add(scar2);
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
        _origColor:color,
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

