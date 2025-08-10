{
    function safeParseFloat(v, fallback) {
        var n = parseFloat(String(v));
        return (isNaN(n) ? fallback : n);
    }
    function splitVec2(str) {
        if (!str) return null;
        var p = String(str).split(',');
        if (p.length < 2) return null;
        return [safeParseFloat(p[0],0), safeParseFloat(p[1],0)];
    }
    function hexToRgbArray(hex) {
        if (!hex) return null;
        hex = String(hex).replace('#','');
        if (hex.length === 8) {
            var a = parseInt(hex.substr(0,2),16)/255;
            var r = parseInt(hex.substr(2,2),16)/255;
            var g = parseInt(hex.substr(4,2),16)/255;
            var b = parseInt(hex.substr(6,2),16)/255;
            return { rgb:[r,g,b], a: a };
        } else if (hex.length === 6) {
            var r2 = parseInt(hex.substr(0,2),16)/255;
            var g2 = parseInt(hex.substr(2,2),16)/255;
            var b2 = parseInt(hex.substr(4,2),16)/255;
            return { rgb:[r2,g2,b2], a: 1 };
        }
        return null;
    }
    function isLikelyNormalizedT(val) {
        if (val === null || isNaN(val)) return true;
        return (val <= 1.5);
    }
    function escapeRegExp(s) {
        return String(s).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

var EFFECT_MAP = {
    "shake": {
        aeName: "Auto-Shake",
        props: { "mag":"Magnitude","freq":"Frequency","evolution":"Evolution","seed":"Seed","angle":"Angle","slack":"Slack","zshake":"Z Shake" }
    },
    "circularripple": {
        aeName: "Circular Ripple",
        props: { "frequency":"Frequency","strength":"Strength","phase":"Phase","radius":"Radius","feather":"Feather" }
    },
    "dblur": {
        aeName: "DKT Directional Blur",
        props: { "strength":"Strength","angle":"Angle" }
    },
    "gaussianblur": {
        aeName: "DKT Gaussian Blur",
        props: { "strength":"Strength" }
    },
    "vignette": {
        aeName: "DKT Vignette",
        props: { "scale":"Size","roundness":"Roundness","feather":"Feather","strength":"Strength","tint":"Tint","overlaycolor":"Color","punchout":"Punch Out" }
    },
    "wavewarp": {
        aeName: "DKT Wave Warp",
        props: { "phase":"Phase","a1d":"Angle","m1":"Magnitude","m2":"Spacing","a2d":"Warp Angle","damping":"Damping","dampingSpace":"Damping Space","dampingOrigin":"Anchor","screenSpace":"Screen Space" }
    },
    "exposure": {
        aeName: "Exposure/Gamma",
        props: { "exposure":"Exposure","gamma":"Gamma","offset":"Offset" }
    },
    "fractalwarp": {
        aeName: "Fractal Warp",
        props: { "offs":"Position","parr":"Parallax","mag":"Magnitude","scale":"Detail","intensity":"Lacunarity","screenSpace":"Screen Space","octaves":"Octaves" }
    },
    "pinchbulgeinside": {
        aeName: "Inner Pinch/Bulge",
        props: { "strength":"Strength","radius":"Radius","feather":"Feather","gaussian":"Use Gaussian" }
    },
    "linearstreaks": {
        aeName: "Linear Streaks",
        props: { "strength":"Strength", "angle":"Angle", "alpha":"Alpha", "bias":"Bias", "rmode":"R", "gmode":"G", "bmode":"B", "amode":"A" }
    },
    "motionblur4": {
        aeName: "Motion Blur",
        props: { "tune":"Tune", "usePos":"Position", "useScale":"Scale", "useAngle":"Angle" }
    },
    "oscillate3": {
        aeName: "Oscillate",
        props: { "direction":"Direction", "angle":"Angle", "freq":"Frequency", "mag":"Magnitude", "type":"Wave", "phase":"Phase" }
    },
    "pinchbulge2": {
        aeName: "Pinch/Bulge",
        props: { "strength":"Strength", "radius":"Radius" }
    },
    "pulsate2": {
        aeName: "Pulse Size",
        props: { "freq":"Frequency", "minsize":"Shrink", "maxsize":"Grow", "phase":"Phase", "type":"Wave" }
    },
    "randomdisplace": {
        aeName: "Random Displacement",
        props: { "mag":"Magnitude", "evolution":"Evolution", "seed":"Seed", "scatter":"Scatter" }
    },
    "transform": {
        aeName: "Raster Transform",
        props: { "scale":"Scale", "angle":"Angle", "maskToLayer":"Mask To Layer", "alpha":"Alpha", "fill":"Fill", "sample":"Sampling" }
    },
    "squeeze": {
        aeName: "Squeeze",
        props: { "strength":"Strength" }
    },
    "stretch2": {
        aeName: "Stretch Axis",
        props: { "scale":"Scale", "angle":"Angle", "contentOnly":"Mask to Layer" }
    },
    "swing2": {
        aeName: "Swing",
        props: { "freq":"Frequency", "a1":"Angle 1", "a2":"Angle 2", "phase":"Phase", "type":"Wave" }
    },
    "swirl4": {
        aeName: "Swirl",
        props: { "strength":"Strength", "radius":"Radius" }
    }
};

    function findMappingForEffID(effIDraw) {
        if (!effIDraw) return null;
        var raw = String(effIDraw).toLowerCase();
        var lastPart = raw.split('.').pop();
        for (var k in EFFECT_MAP) {
            if (k.toLowerCase() === lastPart) return EFFECT_MAP[k];
        }
        var baseNoDigits = lastPart.replace(/(\d+)$/, '');
        for (var k2 in EFFECT_MAP) {
            if (k2.toLowerCase() === baseNoDigits) return EFFECT_MAP[k2];
        }
        for (var mk in EFFECT_MAP) {
            var escaped = escapeRegExp(mk);
            var re = new RegExp('^' + escaped + '([0-9]{1,2})?$', 'i');
            if (re.test(lastPart)) return EFFECT_MAP[mk];
            if (lastPart.indexOf(mk) !== -1) return EFFECT_MAP[mk];
        }
        for (var fk in EFFECT_MAP) {
            if (raw.indexOf(fk) !== -1) return EFFECT_MAP[fk];
        }
        return null;
    }

    function findPropertyByNameOrHints(fx, desiredName) {
        if (!fx || !desiredName) return null;
        try {
            var direct = fx.property(desiredName);
            if (direct) return direct;
        } catch(e){}
        var n = fx.numProperties || 0;
        var target = String(desiredName).toLowerCase();
        for (var i=1;i<=n;i++){
            try {
                var p = fx.property(i);
                if (!p || !p.name) continue;
                var nm = String(p.name).toLowerCase();
                if (nm === target) return p;
                if (nm.indexOf(target) !== -1) return p;
            } catch(e){}
        }
        var tnorm = target.replace(/[^a-z0-9]/g,'');
        for (var j=1;j<=n;j++){
            try {
                var pj = fx.property(j);
                if (!pj||!pj.name) continue;
                var nmj = String(pj.name).toLowerCase().replace(/[^a-z0-9]/g,'');
                if (nmj.indexOf(tnorm) !== -1) return pj;
            } catch(e){}
        }
        return null;
    }

    function importAM() {
        var xmlFile = File.openDialog("Select Alight Motion XML file", "*.xml");
        if (!xmlFile) { alert("No file selected."); return; }
        if (!xmlFile.open("r")) { alert("Failed to open file."); return; }
        var xmlText = xmlFile.read();
        xmlFile.close();

        var xml;
        try { xml = new XML(xmlText); } catch(e) { alert("XML parse error: " + e.toString()); return; }

        app.beginUndoGroup("Import AM XML (suffixes 0..10)");

        var scene = xml;
        var width = safeParseFloat(scene.@width, 1080);
        var height = safeParseFloat(scene.@height, 1080);
        var fps = safeParseFloat(scene.@fps, 60);
        var totalMS = safeParseFloat(scene.@totalTime, NaN);
        if (isNaN(totalMS)) totalMS = safeParseFloat(scene.@totalTime, 10000);
        var duration = totalMS/1000;
        if (!isFinite(duration) || duration <= 0) duration = 10;

        var compName = "AM Import " + (new Date()).getTime();
        var comp = app.project.items.addComp(compName, width, height, 1, duration, fps);
        comp.openInViewer();

        var logMissingPlugins = [], logMissingProps = [];

        var shapes = xml..shape;
        for (var si=0; si<shapes.length(); si++) {
            var shape = shapes[si];
            var startMS = safeParseFloat(shape.@startTime, 0);
            var endMS = safeParseFloat(shape.@endTime, totalMS);
            var startSec = startMS/1000;
            var endSec = endMS/1000;
            if (endSec <= startSec) endSec = Math.min(startSec + 0.01, duration);

            var solid = comp.layers.addSolid([1,1,1], "AM Adjustment " + (si+1), width, height, 1);
            solid.adjustmentLayer = true;
            solid.inPoint = startSec;
            solid.outPoint = endSec;

            var effects = shape.effect;
            for (var ei=0; ei<effects.length(); ei++) {
                var eff = effects[ei];
                var effIDraw = String(eff.@id || "");
                var mapping = findMappingForEffID(effIDraw);
                if (!mapping) {
                    logMissingPlugins.push(effIDraw);
                    $.writeln("[WARN] No mapping for effect: " + effIDraw);
                    continue;
                }

                var fx = null;
                try {
                    fx = solid.Effects.addProperty(mapping.aeName);
                } catch(eAdd) {
                    try { fx = solid.Effects.addProperty(mapping.aeName.replace(/\s+/g,'')); } catch(e2) { fx = null; }
                }
                if (!fx) {
                    logMissingPlugins.push(effIDraw + " -> " + mapping.aeName);
                    $.writeln("[ERROR] Failed to add effect ("+mapping.aeName+") for " + effIDraw);
                    continue;
                }

                var props = eff.property;
                for (var pi=0; pi<props.length(); pi++) {
                    var p = props[pi];
                    var pname = String(p.@name || "");
                    var ptype = String(p.@type || "");
                    var aePropName = (mapping.props && mapping.props.hasOwnProperty(pname)) ? mapping.props[pname] : null;
                    var propRef = null;
                    if (aePropName) propRef = findPropertyByNameOrHints(fx, aePropName);
                    if (!propRef) propRef = findPropertyByNameOrHints(fx, pname);
                    if (!propRef) {
                        logMissingProps.push({effect: effIDraw, prop: pname});
                        $.writeln("[WARN] Property not found: " + pname + " in " + mapping.aeName);
                        continue;
                    }

                    if (p.@value && String(p.@value).length > 0) {
                        var raw = String(p.@value);
                        try {
                            if (ptype === "vec2") {
                                var arr = splitVec2(raw);
                                if (arr) propRef.setValue(arr);
                            } else if (ptype === "color") {
                                var col = hexToRgbArray(raw);
                                if (col) propRef.setValue(col.rgb);
                            } else if (ptype === "bool") {
                                propRef.setValue(raw === "true" || raw === "1");
                            } else {
                                var num = safeParseFloat(raw, NaN);
                                if (!isNaN(num)) propRef.setValue(num);
                                else propRef.setValue(raw);
                            }
                        } catch(eSet) { $.writeln("[ERROR] setValue error: " + eSet.toString()); }
                    }

                    var keys = p.kf;
                    if (keys && keys.length() > 0) {
                        try { while (propRef.numKeys > 0) propRef.removeKey(1); } catch(e) {}
                        for (var ki=0; ki<keys.length(); ki++) {
                            var k = keys[ki];
                            var tRaw = safeParseFloat(k.@t, 0);
                            var vRaw = String(k.@v);
                            var tAbs;
                            if (isLikelyNormalizedT(tRaw)) tAbs = solid.inPoint + (solid.outPoint - solid.inPoint) * tRaw;
                            else tAbs = tRaw/1000;

                            try {
                                if (ptype === "vec2") {
                                    var arrv = splitVec2(vRaw);
                                    if (arrv) propRef.setValueAtTime(tAbs, arrv);
                                } else if (ptype === "color") {
                                    var colv = hexToRgbArray(vRaw);
                                    if (colv) propRef.setValueAtTime(tAbs, colv.rgb);
                                } else if (ptype === "bool") {
                                    var vb = (vRaw === "true" || vRaw === "1");
                                    propRef.setValueAtTime(tAbs, vb);
                                } else {
                                    var numv = safeParseFloat(vRaw, NaN);
                                    if (!isNaN(numv)) propRef.setValueAtTime(tAbs, numv);
                                    else propRef.setValueAtTime(tAbs, vRaw);
                                }
                                if (String(k.@e).length > 0) {
                                    try {
                                        var idx = propRef.nearestKeyIndex(tAbs);
                                        if (idx > 0) propRef.setInterpolationTypeAtKey(idx, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
                                    } catch(eInterp) {}
                                }
                            } catch(eK) {
                                $.writeln("[ERROR] setValueAtTime error for " + mapping.aeName + " -> " + pname + " : " + eK.toString());
                            }
                        }
                    }
                }
            }
        }

        app.endUndoGroup();

        if (logMissingPlugins.length > 0) {
            var uniq = [];
            for (var i=0;i<logMissingPlugins.length;i++) if (uniq.indexOf(logMissingPlugins[i]) === -1) uniq.push(logMissingPlugins[i]);
            alert("Import completed. Some plugins were not found (see console).");
            for (var r=0;r<uniq.length;r++) $.writeln("[MISSING PLUGIN] " + uniq[r]);
        } else {
            alert("Import completed successfully.");
        }
        if (logMissingProps.length > 0) {
            $.writeln("Some properties were not found:");
            for (var s=0;s<logMissingProps.length;s++) $.writeln("  "+logMissingProps[s].effect + " -> " + logMissingProps[s].prop);
        }
    }

    importAM();
}