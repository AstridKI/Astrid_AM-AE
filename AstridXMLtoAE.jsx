(function () {
    var UI = {
        title: "AstridXMLtoAE",
        subtitle: "Alight Motion XML → After Effects",
        btnBrowse: "Browse...",
        btnImport: "Import XML",
        btnOpenBezier: "Open Bezier File",
        btnClearLog: "Clear Log",
        btnSaveReport: "Save Report...",
        lblSelected: "Selected file:",
        lblProgress: "Progress:",
        lblStatus: "Status:",
        noFile: "No file selected",
        success: "Import completed successfully.",
        warnMissing: "Some mappings or properties were missing. See log.",
        openHint: "Open the generated Bezier params file in your OS editor.",
        settingsTitle: "Importer Settings",
        settingsTooltip: "Advanced import options (safe defaults enabled).",
        btnClose: "Close",
        footerCredit: "Made by AstridKI"
    };
    function safeParseFloat(v, fallback) {
        var n = parseFloat(String(v));
        return (isNaN(n) ? fallback : n);
    }
    function splitVec2(str) {
        if (!str) return null;
        var p = String(str).split(',');
        if (p.length < 2) return null;
        return [safeParseFloat(p[0], 0), safeParseFloat(p[1], 0)];
    }
    function hexToRgbArray(hex) {
        if (!hex) return null;
        hex = String(hex).replace('#', '');
        if (hex.length === 8) {
            var a = parseInt(hex.substr(0, 2), 16) / 255;
            var r = parseInt(hex.substr(2, 2), 16) / 255;
            var g = parseInt(hex.substr(4, 2), 16) / 255;
            var b = parseInt(hex.substr(6, 2), 16) / 255;
            return { rgb: [r, g, b], a: a };
        } else if (hex.length === 6) {
            var r2 = parseInt(hex.substr(0, 2), 16) / 255;
            var g2 = parseInt(hex.substr(2, 2), 16) / 255;
            var b2 = parseInt(hex.substr(4, 2), 16) / 255;
            return { rgb: [r2, g2, b2], a: 1 };
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
    function valuesEqual(a, b) {
        if (a === b) return true;
        if (a instanceof Array && b instanceof Array && a.length === b.length) {
            for (var i = 0; i < a.length; i++) {
                if (Math.abs(a[i] - b[i]) > 1e-6) return false;
            }
            return true;
        }
        if (!isNaN(parseFloat(a)) && !isNaN(parseFloat(b))) {
            return Math.abs(parseFloat(a) - parseFloat(b)) < 1e-6;
        }
        return String(a) === String(b);
    }
    function shortNumAny(v) {
        var n = parseFloat(v);
        if (isNaN(n)) return "0.00";
        return n.toFixed(2);
    }
    var EFFECT_MAP = {
    "shake": {
        aeName: "Auto-Shake",
        props: {
            "mag": "Magnitude",
            "freq": "Frequency",
            "evolution": "Evolution",
            "seed": "Seed",
            "angle": "Angle",
            "slack": "Slack",
            "zshake": "Z Shake"
        }
    },
	"tile": {
        aeName: "Tiles",
        props: {
            "scale": "Crop"
        }
    },
    "circularripple": {
        aeName: "Circular Ripple",
        props: {
            "frequency": "Frequency",
            "strength": "Strength",
            "phase": "Phase",
            "radius": "Radius",
            "feather": "Feather"
        }
    },
    "dblur": {
        aeName: "DKT Directional Blur",
        props: {
            "strength": "Strength",
            "angle": "Angle"
        }
    },
    "gaussianblur": {
        aeName: "DKT Gaussian Blur",
        props: {
            "strength": "Strength"
        }
    },
    "vignette": {
        aeName: "DKT Vignette",
        props: {
            "scale": "Size",
            "roundness": "Roundness",
            "feather": "Feather",
            "strength": "Strength",
            "tint": "Tint",
            "overlaycolor": "Color",
            "punchout": "Punch Out"
        }
    },
    "wavewarp": {
        aeName: "DKT Wave Warp",
        props: {
            "phase": "Phase",
            "a1d": "Angle",
            "m1": "Magnitude",
            "m2": "Spacing",
            "a2d": "Warp Angle",
            "damping": "Damping",
            "dampingSpace": "Damping Space",
            "dampingOrigin": "Anchor",
            "screenSpace": "Screen Space"
        }
    },
	"wavewarp2": {
        aeName: "DKT Wave Warp",
        props: {
            "phase": "Phase",
            "a1d": "Angle",
            "m1": "Magnitude",
            "m2": "Spacing",
"a2d": "Warp Angle",
            "damping": "Damping",
            "dampingSpace": "Damping Space",
            "dampingOrigin": "Anchor",
            "screenSpace": "Screen Space"
        }
    },
    "exposure": {
        aeName: "Exposure/Gamma",
        props: {
            "exposure": "Exposure",
            "gamma": "Gamma",
            "offset": "Offset"
        }
    },
    "fractalwarp4": {
        aeName: "Fractal Warp",
        props: {
            "offs": "Position",
            "parr": "Parallax",
            "mag": "Magnitude",
            "scale": "Detail",
            "intensity": "Lacunarity",
            "screenSpace": "Screen Space",
            "octaves": "Octaves"
        }
    },
    "pinchbulgeinside": {
        aeName: "Inner Pinch/Bulge",
        props: {
            "strength": "Strength",
            "radius": "Radius",
            "feather": "Feather",
            "gaussian": "Use Gaussian"
        }
    },
    "linearstreaks": {
        aeName: "Linear Streaks",
        props: {
            "strength": "Strength",
            "angle": "Angle",
            "alpha": "Alpha",
            "bias": "Bias",
            "rmode": "R",
            "gmode": "G",
            "bmode": "B",
            "amode": "A"
        }
    },
    "motionblur4": {
        aeName: "Motion Blur",
        props: {
            "tune": "Tune",
            "usePos": "Position",
            "useScale": "Scale",
            "useAngle": "Angle"
        }
    },
    "oscillate3": {
        aeName: "Oscillate",
        props: {
            "direction": "Direction",
            "angle": "Angle",
            "freq": "Frequency",
            "mag": "Magnitude",
            "type": "Wave",
            "phase": "Phase"
        }
    },
    "pinchbulge": {
        aeName: "Pinch/Bulge",
        props: {
            "radius": "Radius",
            "strength": "Strength"
        }
    },
    "pinchbulge2": {
        aeName: "Pinch/Bulge",
        props: {
            "strength": "Strength",
            "radius": "Radius"
        }
    },
    "circularripple2": {
        aeName: "Circular Ripple",
        props: {
            "frequency": "Frequency",
            "strength": "Strength",
            "phase": "Phase",
            "radius": "Radius",
            "feather": "Feather"
        }
    },
    "pulsate": {
        aeName: "Pulse Size",
        props: {
            "freq": "Frequency",
            "maxsize": "Grow",
            "minsize": "Shrink",
            "phase": "Phase",
            "type": "Wave"
        }
    },
    "pulsate2": {
        aeName: "Pulse Size",
        props: {
            "freq": "Frequency",
            "minsize": "Shrink",
            "maxsize": "Grow",
            "phase": "Phase",
            "type": "Wave"
        }
    },
    "oscillate": {
        aeName: "Oscillate",
        props: {
            "angle": "Angle",
            "freq": "Frequency",
            "mag": "Magnitude",
            "type": "Type"
        }
    },
    "motionblur": {
        aeName: "Motion Blur",
        props: {
            "tune": "Tune",
            "useScale": "Use Scale",
            "usePos": "Use Position",
            "useAngle": "Use Angle"
        }
    },
    "swing": {
        aeName: "Swing",
        props: {
            "a1": "Angle 1",
            "a2": "Angle 2",
            "freq": "Frequency",
            "phase": "Phase",
            "type": "Type"
        }
    },
    "swing2": {
        aeName: "Swing",
        props: {
            "freq": "Frequency",
            "a1": "Angle 1",
            "a2": "Angle 2",
            "phase": "Phase",
            "type": "Type"
        }
    },
    "shake2": {
        aeName: "Auto-Shake",
        props: {
            "mag": "Magnitude",
            "freq": "Frequency",
            "evolution": "Evolution",
            "seed": "Seed",
            "angle": "Angle",
            "slack": "Slack",
            "zshake": "Z Shake"
        }
    },
    "transform": {
        aeName: "Raster Transform",
        props: {
            "scale": "Scale",
            "angle": "Angle",
            "maskToLayer": "Mask To Layer",
            "alpha": "Alpha",
            "fill": "Fill",
            "sample": "Sampling"
        }
    },
    "squeeze": {
        aeName: "Squeeze",
        props: {
            "strength": "Strength"
        }
    },
    "stretch2": {
        aeName: "Stretch Axis",
        props: {
            "scale": "Scale",
            "angle": "Angle",
            "contentOnly": "Mask to Layer"
        }
    },
    "swirl4": {
        aeName: "Swirl",
        props: {
            "strength": "Strength",
            "radius": "Radius"
        }
    },
    "randomdisplace": {
        aeName: "Random Displacement",
        props: {
            "mag": "Magnitude",
            "evolution": "Evolution",
            "seed": "Seed",
            "scatter": "Scatter"
        }
    }
};

    function findMappingForEffID(effIDraw) {
        if (!effIDraw) return null;
        var raw = String(effIDraw).toLowerCase();
        var lastPart = raw.split('.').pop();
        for (var k in EFFECT_MAP) if (k.toLowerCase() === lastPart) return EFFECT_MAP[k];
        var baseNoDigits = lastPart.replace(/(\d+)$/, '');
        for (var k2 in EFFECT_MAP) if (k2.toLowerCase() === baseNoDigits) return EFFECT_MAP[k2];
        for (var mk in EFFECT_MAP) {
            var escaped = escapeRegExp(mk);
            var re = new RegExp('^' + escaped + '([0-9]{1,2})?$', 'i');
            if (re.test(lastPart)) return EFFECT_MAP[mk];
            if (lastPart.indexOf(mk) !== -1) return EFFECT_MAP[mk];
        }
        for (var fk in EFFECT_MAP) if (raw.indexOf(fk) !== -1) return EFFECT_MAP[fk];
        return null;
    }

    function findPropertyByNameOrHints(fx, desiredName) {
        if (!fx || !desiredName) return null;
        try {
            var direct = fx.property(desiredName);
            if (direct) return direct;
        } catch (e) { }
        var n = fx.numProperties || 0;
        var target = String(desiredName).toLowerCase();
        for (var i = 1; i <= n; i++) {
            try {
                var p = fx.property(i);
                if (!p || !p.name) continue;
                var nm = String(p.name).toLowerCase();
                if (nm === target) return p;
                if (nm.indexOf(target) !== -1) return p;
            } catch (e) { }
        }
        var tnorm = target.replace(/[^a-z0-9]/g, '');
        for (var j = 1; j <= n; j++) {
            try {
                var pj = fx.property(j);
                if (!pj || !pj.name) continue;
                var nmj = String(pj.name).toLowerCase().replace(/[^a-z0-9]/g, '');
                if (nmj.indexOf(tnorm) !== -1) return pj;
            } catch (e) { }
        }
        return null;
    }
    function createImporterUI() {
        var win = new Window("palette", UI.title + " — " + UI.subtitle, undefined, { resizeable: true });
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 8;
        win.margins = 12;

        var header = win.add("group");
        header.orientation = "column";
        header.alignChildren = ["left", "center"];
        var titleTxt = header.add("statictext", undefined, UI.title);
        titleTxt.graphics.font = ScriptUI.newFont(titleTxt.graphics.font.name, "BOLD", 16);
        var brandTxt = header.add("statictext", undefined, UI.brandLine);
        brandTxt.graphics.font = ScriptUI.newFont(brandTxt.graphics.font.name, "REGULAR", 10);

        
        var fileGroup = win.add("panel", undefined, "1) Select XML File");
        fileGroup.orientation = "row";
        fileGroup.alignChildren = ["fill", "center"];
        fileGroup.margins = 8;
        var filePath = fileGroup.add("edittext", undefined, UI.noFile, { readonly: true });
        filePath.characters = 50;
        var browseBtn = fileGroup.add("button", undefined, UI.btnBrowse);

       
        var ctrlGroup = win.add("group");
        ctrlGroup.orientation = "row";
        ctrlGroup.alignChildren = ["left", "center"];
        ctrlGroup.spacing = 8;
        var importBtn = ctrlGroup.add("button", undefined, UI.btnImport);
        var openBezierBtn = ctrlGroup.add("button", undefined, UI.btnOpenBezier);
        openBezierBtn.enabled = false;
        var clearBtn = ctrlGroup.add("button", undefined, UI.btnClearLog);

       
        var progressPanel = win.add("panel", undefined, "Progress");
        progressPanel.orientation = "column";
        progressPanel.margins = 8;
        var progressGroup = progressPanel.add("group");
        progressGroup.orientation = "row";
        progressGroup.alignChildren = ["fill", "center"];
        var prog = progressGroup.add("progressbar", undefined, 0, 100);
        prog.preferredSize.width = 420;
        var progLabel = progressGroup.add("statictext", undefined, "0%");
        var statusLine = progressPanel.add("statictext", undefined, UI.lblStatus + " — Idle");

     
        var logPanel = win.add("panel", undefined, "Log");
        logPanel.orientation = "column";
        logPanel.margins = 6;
        var logBox = logPanel.add("edittext", undefined, "", { multiline: true, scrolling: true, readonly: true });
        logBox.preferredSize = [520, 260];

      
        var footer = win.add("group");
        footer.orientation = "row";
        footer.alignment = ["right", "bottom"];
        var saveReportBtn = footer.add("button", undefined, UI.btnSaveReport);
        var closeBtn = footer.add("button", undefined, UI.btnClose);

  
        var credit = win.add("statictext", undefined, UI.footerCredit);
        credit.graphics.font = ScriptUI.newFont(credit.graphics.font.name, "REGULAR", 10);

      
        win.onResizing = win.onResize = function () { this.layout.resize(); };

      
        function logMessage(msg) {
            var ts = (new Date()).toLocaleTimeString();
            logBox.text += "[" + ts + "] " + msg + "\r\n";
            try { logBox.selection = logBox.text.length; } catch (e) { }
            $.writeln(msg);
        }

        
        var selectedFile = null;
        var bezierFilePath = null;

      
        var lastFolder = null;
        try {
            if (app.settings.haveSetting('AstridXMLtoAE', 'lastFolder')) lastFolder = app.settings.getSetting('AstridXMLtoAE', 'lastFolder');
        } catch (e) { lastFolder = null; }

     
        browseBtn.onClick = function () {
            var startFolder = (lastFolder && Folder(lastFolder).exists) ? Folder(lastFolder) : Folder.desktop;
            var f = File.openDialog("Select Alight Motion XML file", "XML:*.xml", false);
            if (f) {
                selectedFile = f;
                filePath.text = decodeURI(f.fsName);
                logMessage("Selected file: " + f.name);
                try { app.settings.saveSetting('AstridXMLtoAE', 'lastFolder', f.parent.fsName); lastFolder = f.parent.fsName; } catch (e) { }
            }
        };

        openBezierBtn.onClick = function () {
            if (!bezierFilePath) { alert("No bezier file available."); return; }
            try {
                var bf = new File(bezierFilePath);
                if (bf.exists) bf.execute();
                else alert("Bezier file not found: " + bezierFilePath);
            } catch (e) { alert("Unable to open file: " + e.toString()); }
        };

       
        clearBtn.onClick = function () { logBox.text = ""; };

        
        saveReportBtn.onClick = function () {
            var out = File.saveDialog("Save import report as...");
            if (!out) return;
            try {
                if (out.open('w')) {
                    out.write(logBox.text);
                    out.close();
                    alert('Report saved: ' + out.fsName);
                } else alert('Failed to open file for writing.');
            } catch (e) { alert('Error saving report: ' + e.toString()); }
        };

       
        closeBtn.onClick = function () { win.close(); };

        
        importBtn.onClick = function () {
            if (!selectedFile) { alert('Please select an XML file first.'); return; }
            try {
                if (!selectedFile.open('r')) { alert('Failed to open file: ' + selectedFile.fsName); return; }
                var xmlText = selectedFile.read();
                selectedFile.close();
                var xml;
                try { xml = new XML(xmlText); } catch (e) { alert('XML parse error: ' + e.toString()); return; }

                app.beginUndoGroup('Import AM XML (AstridXMLtoAE)');
                logMessage('Import started...');
                statusLine.text = UI.lblStatus + ' — Creating composition...';

                var scene = xml;
                var width = safeParseFloat(scene.@width, 1080);
                var height = safeParseFloat(scene.@height, 1080);
                var fps = safeParseFloat(scene.@fps, 60);
                var totalMS = safeParseFloat(scene.@totalTime, NaN);
                if (isNaN(totalMS)) totalMS = safeParseFloat(scene.@totalTime, 10000);
                var duration = totalMS / 1000;
                if (!isFinite(duration) || duration <= 0) duration = 10;
                var compName = 'AM Import ' + (new Date()).getTime();
                var comp = app.project.items.addComp(compName, width, height, 1, duration, fps);
                comp.openInViewer();

                var logMissingPlugins = [], logMissingProps = [];

                
                var desktopFolder = Folder.desktop;
                var bezierDir = new Folder((desktopFolder && desktopFolder.fullName ? desktopFolder.fullName : "~") + "/Bezierfiles");
                if (!bezierDir.exists) {
                    try { bezierDir.create(); logMessage('Created folder: ' + bezierDir.fsName); } catch (e) { logMessage('Failed to create Bezierfiles folder: ' + e.toString()); }
                }

                
                var baseName = selectedFile.name.replace(/\.[^\/\\.]+$/, '');

                bezierFilePath = bezierDir.fullName + '/' + baseName + '_bezier.txt';
                var bezierFile = new File(bezierFilePath);
                if (bezierFile.exists) bezierFile.remove();
                if (!bezierFile.open('w')) {
                    alert('Failed to open bezier file for writing: ' + bezierFile.fsName);
                    app.endUndoGroup();
                    return;
                }
                bezierFile.writeln('Bezier parameters export from Alight Motion keys');
                bezierFile.writeln('Source XML: ' + selectedFile.name + '    Export time: ' + (new Date()).toString());
                bezierFile.writeln('-------------------------------------------------\n');

                var shapes = xml..shape;
                var totalShapes = shapes.length();
                logMessage('Found ' + totalShapes + ' shapes to import.');

                for (var si = 0; si < totalShapes; si++) {
                    var shape = shapes[si];
                    var startMS = safeParseFloat(shape.@startTime, 0);
                    var endMS = safeParseFloat(shape.@endTime, totalMS);
                    var startSec = startMS / 1000;
                    var endSec = endMS / 1000;
                    if (endSec <= startSec) endSec = Math.min(startSec + 0.01, duration);

                    var solid = comp.layers.addSolid([1, 1, 1], 'AM Adjustment ' + (si + 1), width, height, 1);
                    solid.adjustmentLayer = true;
                    solid.inPoint = startSec;
                    solid.outPoint = endSec;

                    bezierFile.writeln('AM Adjustment ' + (si + 1) + '  (in: ' + startSec.toFixed(3) + 's, out: ' + endSec.toFixed(3) + 's)');
                    bezierFile.writeln('-------------------------------------------------');

                    var effects = shape.effect;
                    for (var ei = 0; ei < effects.length(); ei++) {
                        var eff = effects[ei];
                        var effIDraw = String(eff.@id || '');
                        var mapping = findMappingForEffID(effIDraw);
                        if (!mapping) {
                            if (logMissingPlugins.indexOf(effIDraw) === -1) logMissingPlugins.push(effIDraw);
                            logMessage('[WARN] No mapping for effect: ' + effIDraw);
                            continue;
                        }
                        var fx = null;
                        try { fx = solid.Effects.addProperty(mapping.aeName); }
                        catch (eAdd) {
                            try { fx = solid.Effects.addProperty(mapping.aeName.replace(/\s+/g, '')); } catch (e2) { fx = null; }
                        }
                        if (!fx) {
                            var miss = effIDraw + ' -> ' + mapping.aeName;
                            if (logMissingPlugins.indexOf(miss) === -1) logMissingPlugins.push(miss);
                            logMessage('[ERROR] Failed to add effect (' + mapping.aeName + ') for ' + effIDraw);
                            continue;
                        }
                        bezierFile.writeln('  ' + mapping.aeName);
                        var props = eff.property;
                        for (var pi = 0; pi < props.length(); pi++) {
                            var p = props[pi];
                            var pname = String(p.@name || '');
                            var ptype = String(p.@type || '');
                            var aePropName = (mapping.props && mapping.props.hasOwnProperty(pname)) ? mapping.props[pname] : null;
                            var propRef = null;
                            if (aePropName) propRef = findPropertyByNameOrHints(fx, aePropName);
                            if (!propRef) propRef = findPropertyByNameOrHints(fx, pname);
                            if (!propRef) {
                                logMissingProps.push({ effect: effIDraw, prop: pname });
                                logMessage('[WARN] Property not found: ' + pname + ' in ' + mapping.aeName);
                                continue;
                            }

                            
                            if (p.@value && String(p.@value).length > 0) {
                                var raw = String(p.@value);
                                try {
                                    if (ptype === 'vec2') {
                                        var arr = splitVec2(raw);
                                        if (arr) propRef.setValue(arr);
                                    } else if (ptype === 'color') {
                                        var col = hexToRgbArray(raw);
                                        if (col) propRef.setValue(col.rgb);
                                    } else if (ptype === 'bool') {
                                        propRef.setValue(raw === 'true' || raw === '1');
                                    } else {
                                        var num = safeParseFloat(raw, NaN);
                                        if (!isNaN(num)) propRef.setValue(num);
                                        else propRef.setValue(raw);
                                    }
                                } catch (eSet) { logMessage('[ERROR] setValue error: ' + eSet.toString()); }
                            }

                           
                            var keys = [];
                            if (p.kf && p.kf.length() > 0) {
                                for (var ki = 0; ki < p.kf.length(); ki++) {
                                    var key = p.kf[ki];
                                    var tVal = safeParseFloat(key.@t, 0);
                                    keys.push({ key: key, t: tVal });
                                }
                                keys.sort(function (a, b) { return a.t - b.t; });
                            }

                            if (keys.length > 1) {
                                var firstValRaw = String(keys[0].key.@v);
                                var animDifferent = false;
                                for (var kk = 1; kk < keys.length; kk++) {
                                    if (!valuesEqual(firstValRaw, String(keys[kk].key.@v))) { animDifferent = true; break; }
                                }
                                if (!animDifferent) continue; // static

                                try { while (propRef.numKeys > 0) propRef.removeKey(1); } catch (e) { }

                                for (var ki2 = 0; ki2 < keys.length; ki2++) {
                                    var K = keys[ki2].key;
                                    var tRaw = safeParseFloat(K.@t, 0);
                                    var vRaw = String(K.@v);
                                    var tAbs = (isLikelyNormalizedT(tRaw) ? (solid.inPoint + (solid.outPoint - solid.inPoint) * tRaw) : tRaw / 1000);
                                    try {
                                        if (ptype === 'vec2') {
                                            var arrv = splitVec2(vRaw);
                                            if (arrv) propRef.setValueAtTime(tAbs, arrv);
                                        } else if (ptype === 'color') {
                                            var colv = hexToRgbArray(vRaw);
                                            if (colv) propRef.setValueAtTime(tAbs, colv.rgb);
                                        } else if (ptype === 'bool') {
                                            var vb = (vRaw === 'true' || vRaw === '1');
                                            propRef.setValueAtTime(tAbs, vb);
                                        } else {
                                            var numv = safeParseFloat(vRaw, NaN);
                                            if (!isNaN(numv)) propRef.setValueAtTime(tAbs, numv);
                                            else propRef.setValueAtTime(tAbs, vRaw);
                                        }
                                    } catch (eK) { logMessage('[ERROR] setValueAtTime error: ' + eK.toString()); }
                                }

                                
                                for (var pair = 0; pair < keys.length - 1; pair++) {
                                    var K1 = keys[pair].key, K2 = keys[pair + 1].key;
                                    var tRaw1 = safeParseFloat(K1.@t, 0), tRaw2 = safeParseFloat(K2.@t, 0);
                                    var t1 = (isLikelyNormalizedT(tRaw1) ? (solid.inPoint + (solid.outPoint - solid.inPoint) * tRaw1) : tRaw1 / 1000);
                                    var t2 = (isLikelyNormalizedT(tRaw2) ? (solid.inPoint + (solid.outPoint - solid.inPoint) * tRaw2) : tRaw2 / 1000);
                                    var v1 = String(K1.@v), v2 = String(K2.@v);
                                    var eStr = "";
                                    if (String(K2.@e).length > 0) eStr = String(K2.@e);
                                    else if (String(K1.@e).length > 0) eStr = String(K1.@e);
                                    var outCurve = "";
                                    if (eStr.length > 0 && eStr.indexOf('cubicBezier') === 0) {
                                        var bezParts = eStr.split(/\s+/);
                                        if (bezParts.length >= 5) {
                                            var bx1 = parseFloat(bezParts[1]);
                                            var by1 = parseFloat(bezParts[2]);
                                            var bx2 = parseFloat(bezParts[3]);
                                            var by2 = parseFloat(bezParts[4]);
                                            if (!isNaN(bx1) && !isNaN(by1) && !isNaN(bx2) && !isNaN(by2)) {
                                                outCurve = 'bezier: ' + shortNumAny(bx1) + ', ' + shortNumAny(by1) + ', ' + shortNumAny(bx2) + ', ' + shortNumAny(by2);
                                            } else outCurve = 'linear graph';
                                        } else outCurve = 'linear graph';
                                    } else if (eStr.length > 0) outCurve = 'easing: ' + eStr.replace(/\s+/g, ' ').substr(0, 120);
                                    else outCurve = 'linear graph';
                                    var line = '    ' + mapping.aeName + ' -> ' + pname +
                                        ' | keyframe ' + (pair + 1) + ' -> ' + (pair + 2) +
                                        ' | t: ' + t1.toFixed(3) + 's -> ' + t2.toFixed(3) + 's' +
                                        ' | v: ' + v1 + ' -> ' + v2 +
                                        ' | ' + outCurve;
                                    bezierFile.writeln(line);
                                }
                            }

                          
                        }
                        bezierFile.writeln('');
                    }

                   
                    var percent = Math.round(((si + 1) / totalShapes) * 100);
                    prog.value = percent;
                    progLabel.text = percent + '%';
                    statusLine.text = UI.lblStatus + ' — Imported adjustment ' + (si + 1) + ' of ' + totalShapes;
                }

               
                bezierFile.writeln('\n---\nMit Liebe gemacht von Astrid.');

                bezierFile.close();
                app.endUndoGroup();
                logMessage(UI.success);
                statusLine.text = UI.lblStatus + ' — Finished';
                openBezierBtn.enabled = true;

                if (logMissingPlugins.length > 0 || logMissingProps.length > 0) {
                    logMessage(UI.warnMissing);
                    if (logMissingPlugins.length > 0) logMessage('[MISSING PLUGINS] ' + logMissingPlugins.join(', '));
                    if (logMissingProps.length > 0) {
                        logMessage('[MISSING PROPS]');
                        for (var m = 0; m < logMissingProps.length; m++) {
                            logMessage('  Effect: ' + logMissingProps[m].effect + ', Prop: ' + logMissingProps[m].prop);
                        }
                    }
                }

            } catch (err) {
                try { app.endUndoGroup(); } catch (ee) { }
                alert('Import failed: ' + err.toString());
                logMessage('[ERROR] ' + err.toString());
            }
        };

        return win;
    }

  
    try {
        var panel = createImporterUI();
        panel.center();
        panel.show();
    } catch (e) {
        alert('Failed to create AstridXMLtoAE UI: ' + e.toString());
    }
})();
