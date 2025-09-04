/*
 * 
 * Author: AstridKI
 * 
 * Description:
 * Imports Alight Motion XML data into After Effects
 * with partial automation for effect transfer.
 */

(function () {
    var UI = {
        title: "AstridXMLtoAE",
        subtitle: "",
        btnBrowse: "Browse...",
        btnImport: "Import XML",
        btnOpenBezier: "Motion Graphs",
        btnClearLog: "Clear Log",
        btnSaveReport: "Save Report...",
        lblSelected: "Selected file:",
        lblStatus: "Status:",
        noFile: "No file selected",
        success: "Import completed successfully.",
        warnMissing: "Some mappings or properties were missing. See log.",
        settingsTitle: "Importer Settings",
        settingsTooltip: "Advanced import options (safe defaults enabled).",
        btnClose: "Close",
        footerCredit: "AstridKI"
    };

    function safeParseFloat(value, fallback) {
        if (value === undefined || value === null) {
            return fallback;
        }
        var number = parseFloat(String(value));
        if (isNaN(number)) {
            return fallback;
        }
        return number;
    }

    function splitVector2(stringValue) {
        if (!stringValue) {
            return null;
        }
        var parts = String(stringValue).split(',');
        if (parts.length < 2) {
            return null;
        }
        return [safeParseFloat(parts[0], 0), safeParseFloat(parts[1], 0)];
    }

    function hexToRgbArray(hexString) {
        if (!hexString) {
            return null;
        }
        hexString = String(hexString).replace('#', '');
        if (hexString.length === 8) {
            var alpha = parseInt(hexString.substr(0, 2), 16) / 255;
            var red = parseInt(hexString.substr(2, 2), 16) / 255;
            var green = parseInt(hexString.substr(4, 2), 16) / 255;
            var blue = parseInt(hexString.substr(6, 2), 16) / 255;
            return { rgb: [red, green, blue], a: alpha };
        } else if (hexString.length === 6) {
            var red2 = parseInt(hexString.substr(0, 2), 16) / 255;
            var green2 = parseInt(hexString.substr(2, 2), 16) / 255;
            var blue2 = parseInt(hexString.substr(4, 2), 16) / 255;
            return { rgb: [red2, green2, blue2], a: 1 };
        }
        return null;
    }

    function isLikelyNormalizedTime(value) {
        if (value === null || isNaN(value)) {
            return true;
        }
        return value <= 1.5;
    }

    function valuesEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (a instanceof Array && b instanceof Array && a.length === b.length) {
            for (var index = 0; index < a.length; index++) {
                if (Math.abs(a[index] - b[index]) > 1e-6) {
                    return false;
                }
            }
            return true;
        }
        if (!isNaN(parseFloat(a)) && !isNaN(parseFloat(b))) {
            return Math.abs(parseFloat(a) - parseFloat(b)) < 1e-6;
        }
        return String(a) === String(b);
    }

    function shortNumberAny(value) {
        var number = parseFloat(value);
        if (isNaN(number)) {
            return "0.00";
        }
        return number.toFixed(2);
    }
	 var EFFECT_MAP = {
    "360-reorient-sphere": { aeName: "DKT Reorient Sphere", props: { "orient": "Orientation", "rotate": "Rotation" } },
    "360-reorient-sphere2": { aeName: "DKT Reorient Sphere", props: { "orient": "Orientation", "rotate": "Rotation" } },
    "360-reorient-sphere3": { aeName: "DKT Reorient Sphere", props: { "orient": "Orientation", "rotate": "Rotation" } },
    "360-reorient-sphere4": { aeName: "DKT Reorient Sphere", props: { "orient": "Orientation", "rotate": "Rotation" } },
        "streaks-spin": { aeName: "Spin Streaks", props: { "angle": "Sweep", "alpha": "Alpha", "bias": "Bias", "rmode": "R", "gmode": "G", "bmode": "B", "amode": "A" } },
    "streaks-spin2": { aeName: "Spin Streaks", props: { "angle": "Sweep", "alpha": "Alpha", "bias": "Bias", "rmode": "R", "gmode": "G", "bmode": "B", "amode": "A" } },
    "streaks-spin3": { aeName: "Spin Streaks", props: { "angle": "Sweep", "alpha": "Alpha", "bias": "Bias", "rmode": "R", "gmode": "G", "bmode": "B", "amode": "A" } },
    "streaks-spin4": { aeName: "Spin Streaks", props: { "angle": "Sweep", "alpha": "Alpha", "bias": "Bias", "rmode": "R", "gmode": "G", "bmode": "B", "amode": "A" } },

    "turbulentdisplace": { aeName: "DKT Turbulent Displace", props: { "direction": "Direction", "evolution": "Evolution", "intensity": "Intensity" } },
    "turbulentdisplace2": { aeName: "DKT Turbulent Displace", props: { "direction": "Direction", "evolution": "Evolution", "intensity": "Intensity" } },
    "turbulentdisplace3": { aeName: "DKT Turbulent Displace", props: { "direction": "Direction", "evolution": "Evolution", "intensity": "Intensity" } },
    "turbulentdisplace4": { aeName: "DKT Turbulent Displace", props: { "direction": "Direction", "evolution": "Evolution", "intensity": "Intensity" } },

    "zoomblur": { aeName: "Zoom Blur", props: { "strength": "Strength" } },
    "zoomblur2": { aeName: "Zoom Blur", props: { "strength": "Strength" } },
    "zoomblur3": { aeName: "Zoom Blur", props: { "strength": "Strength" } },
    "zoomblur4": { aeName: "Zoom Blur", props: { "strength": "Strength" } },

    "rgbsep": { aeName: "RGB Split", props: { "strength": "Strength" } },
    "rgbsep2": { aeName: "RGB Split", props: { "strength": "Strength" } },
    "rgbsep3": { aeName: "RGB Split", props: { "strength": "Strength" } },
    "rgbsep4": { aeName: "RGB Split", props: { "strength": "Strength" } },

    "shake": { aeName: "Auto-Shake", props: { "mag": "Magnitude", "freq": "Frequency", "evolution": "Evolution", "seed": "Seed", "angle": "Angle", "slack": "Slack", "zshake": "Z Shake" } },
    "shake2": { aeName: "Auto-Shake", props: { "mag": "Magnitude", "freq": "Frequency", "evolution": "Evolution", "seed": "Seed", "angle": "Angle", "slack": "Slack", "zshake": "Z Shake" } },
    "shake3": { aeName: "Auto-Shake", props: { "mag": "Magnitude", "freq": "Frequency", "evolution": "Evolution", "seed": "Seed", "angle": "Angle", "slack": "Slack", "zshake": "Z Shake" } },
    "shake4": { aeName: "Auto-Shake", props: { "mag": "Magnitude", "freq": "Frequency", "evolution": "Evolution", "seed": "Seed", "angle": "Angle", "slack": "Slack", "zshake": "Z Shake" } },

    "tile": { aeName: "Tiles", props: { "scale": "Crop" } },
    "tile2": { aeName: "Tiles", props: { "scale": "Crop" } },
    "tile3": { aeName: "Tiles", props: { "scale": "Crop" } },
    "tile4": { aeName: "Tiles", props: { "scale": "Crop" } },

    "circularripple": { aeName: "Circular Ripple", props: { "frequency": "Frequency", "strength": "Strength", "phase": "Phase", "radius": "Radius", "feather": "Feather" } },
    "circularripple2": { aeName: "Circular Ripple", props: { "frequency": "Frequency", "strength": "Strength", "phase": "Phase", "radius": "Radius", "feather": "Feather" } },
    "circularripple3": { aeName: "Circular Ripple", props: { "frequency": "Frequency", "strength": "Strength", "phase": "Phase", "radius": "Radius", "feather": "Feather" } },
    "circularripple4": { aeName: "Circular Ripple", props: { "frequency": "Frequency", "strength": "Strength", "phase": "Phase", "radius": "Radius", "feather": "Feather" } },

    "dblur": { aeName: "DKT Directional Blur", props: { "strength": "Strength", "angle": "Angle" } },
    "dblur2": { aeName: "DKT Directional Blur", props: { "strength": "Strength", "angle": "Angle" } },
    "dblur3": { aeName: "DKT Directional Blur", props: { "strength": "Strength", "angle": "Angle" } },
    "dblur4": { aeName: "DKT Directional Blur", props: { "strength": "Strength", "angle": "Angle" } },

    "gaussianblur": { aeName: "DKT Gaussian Blur", props: { "strength": "Strength" } },
    "gaussianblur2": { aeName: "DKT Gaussian Blur", props: { "strength": "Strength" } },
    "gaussianblur3": { aeName: "DKT Gaussian Blur", props: { "strength": "Strength" } },
    "gaussianblur4": { aeName: "DKT Gaussian Blur", props: { "strength": "Strength" } },

    "vignette": { aeName: "DKT Vignette", props: { "scale": "Size", "roundness": "Roundness", "feather": "Feather", "strength": "Strength", "tint": "Tint", "overlaycolor": "Color", "punchout": "Punch Out" } },
    "vignette2": { aeName: "DKT Vignette", props: { "scale": "Size", "roundness": "Roundness", "feather": "Feather", "strength": "Strength", "tint": "Tint", "overlaycolor": "Color", "punchout": "Punch Out" } },
    "vignette3": { aeName: "DKT Vignette", props: { "scale": "Size", "roundness": "Roundness", "feather": "Feather", "strength": "Strength", "tint": "Tint", "overlaycolor": "Color", "punchout": "Punch Out" } },
    "vignette4": { aeName: "DKT Vignette", props: { "scale": "Size", "roundness": "Roundness", "feather": "Feather", "strength": "Strength", "tint": "Tint", "overlaycolor": "Color", "punchout": "Punch Out" } },

    "wavewarp": { aeName: "DKT Wave Warp", props: { "phase": "Phase", "a1d": "Angle", "m1": "Magnitude", "m2": "Spacing", "a2d": "Warp Angle", "damping": "Damping", "dampingSpace": "Damping Space", "dampingOrigin": "Anchor", "screenSpace": "Screen Space" } },
    "wavewarp2": { aeName: "DKT Wave Warp", props: { "phase": "Phase", "a1d": "Angle", "m1": "Magnitude", "m2": "Spacing", "a2d": "Warp Angle", "damping": "Damping", "dampingSpace": "Damping Space", "dampingOrigin": "Anchor", "screenSpace": "Screen Space" } },
    "wavewarp3": { aeName: "DKT Wave Warp", props: { "phase": "Phase", "a1d": "Angle", "m1": "Magnitude", "m2": "Spacing", "a2d": "Warp Angle", "damping": "Damping", "dampingSpace": "Damping Space", "dampingOrigin": "Anchor", "screenSpace": "Screen Space" } },
    "wavewarp4": { aeName: "DKT Wave Warp", props: { "phase": "Phase", "a1d": "Angle", "m1": "Magnitude", "m2": "Spacing", "a2d": "Warp Angle", "damping": "Damping", "dampingSpace": "Damping Space", "dampingOrigin": "Anchor", "screenSpace": "Screen Space" } },

    "exposure": { aeName: "Exposure/Gamma", props: { "exposure": "Exposure", "gamma": "Gamma", "offset": "Offset" } },
    "exposure2": { aeName: "Exposure/Gamma", props: { "exposure": "Exposure", "gamma": "Gamma", "offset": "Offset" } },
    "exposure3": { aeName: "Exposure/Gamma", props: { "exposure": "Exposure", "gamma": "Gamma", "offset": "Offset" } },
    "exposure4": { aeName: "Exposure/Gamma", props: { "exposure": "Exposure", "gamma": "Gamma", "offset": "Offset" } },

    "fractalwarp": { aeName: "Fractal Warp", props: { "offs": "Position", "parr": "Parallax", "mag": "Magnitude", "scale": "Detail", "intensity": "Lacunarity", "screenSpace": "Screen Space", "octaves": "Octaves" } },
    "fractalwarp2": { aeName: "Fractal Warp", props: { "offs": "Position", "parr": "Parallax", "mag": "Magnitude", "scale": "Detail", "intensity": "Lacunarity", "screenSpace": "Screen Space", "octaves": "Octaves" } },
    "fractalwarp3": { aeName: "Fractal Warp", props: { "offs": "Position", "parr": "Parallax", "mag": "Magnitude", "scale": "Detail", "intensity": "Lacunarity", "screenSpace": "Screen Space", "octaves": "Octaves" } },
    "fractalwarp4": { aeName: "Fractal Warp", props: { "offs": "Position", "parr": "Parallax", "mag": "Magnitude", "scale": "Detail", "intensity": "Lacunarity", "screenSpace": "Screen Space", "octaves": "Octaves" } },

    "pinchbulgeinside": { aeName: "Inner Pinch/Bulge", props: { "strength": "Strength", "radius": "Radius", "feather": "Feather", "gaussian": "Use Gaussian" } },
    "pinchbulgeinside2": { aeName: "Inner Pinch/Bulge", props: { "strength": "Strength", "radius": "Radius", "feather": "Feather", "gaussian": "Use Gaussian" } },
    "pinchbulgeinside3": { aeName: "Inner Pinch/Bulge", props: { "strength": "Strength", "radius": "Radius", "feather": "Feather", "gaussian": "Use Gaussian" } },
    "pinchbulgeinside4": { aeName: "Inner Pinch/Bulge", props: { "strength": "Strength", "radius": "Radius", "feather": "Feather", "gaussian": "Use Gaussian" } },

    "linearstreaks": { aeName: "Linear Streaks", props: { "strength": "Strength", "angle": "Angle", "alpha": "Alpha", "bias": "Bias", "rmode": "R", "gmode": "G", "bmode": "B", "amode": "A" } },
    "linearstreaks2": { aeName: "Linear Streaks", props: { "strength": "Strength", "angle": "Angle", "alpha": "Alpha", "bias": "Bias", "rmode": "R", "gmode": "G", "bmode": "B", "amode": "A" } },
    "linearstreaks3": { aeName: "Linear Streaks", props: { "strength": "Strength", "angle": "Angle", "alpha": "Alpha", "bias": "Bias", "rmode": "R", "gmode": "G", "bmode": "B", "amode": "A" } },
    "linearstreaks4": { aeName: "Linear Streaks", props: { "strength": "Strength", "angle": "Angle", "alpha": "Alpha", "bias": "Bias", "rmode": "R", "gmode": "G", "bmode": "B", "amode": "A" } },

    "motionblur": { aeName: "Motion Blur", props: { "tune": "Tune", "usePos": "Position", "useScale": "Scale", "useAngle": "Angle" } },
    "motionblur2": { aeName: "Motion Blur", props: { "tune": "Tune", "usePos": "Position", "useScale": "Scale", "useAngle": "Angle" } },
    "motionblur3": { aeName: "Motion Blur", props: { "tune": "Tune", "usePos": "Position", "useScale": "Scale", "useAngle": "Angle" } },
    "motionblur4": { aeName: "Motion Blur", props: { "tune": "Tune", "usePos": "Position", "useScale": "Scale", "useAngle": "Angle" } },

    "oscillate": { aeName: "Oscillate", props: { "direction": "Direction", "angle": "Angle", "freq": "Frequency", "mag": "Magnitude", "type": "Wave", "phase": "Phase" } },
    "oscillate2": { aeName: "Oscillate", props: { "direction": "Direction", "angle": "Angle", "freq": "Frequency", "mag": "Magnitude", "type": "Wave", "phase": "Phase" } },
    "oscillate3": { aeName: "Oscillate", props: { "direction": "Direction", "angle": "Angle", "freq": "Frequency", "mag": "Magnitude", "type": "Wave", "phase": "Phase" } },
    "oscillate4": { aeName: "Oscillate", props: { "direction": "Direction", "angle": "Angle", "freq": "Frequency", "mag": "Magnitude", "type": "Wave", "phase": "Phase" } },

    "pinchbulge": { aeName: "Pinch/Bulge", props: { "radius": "Radius", "strength": "Strength" } },
    "pinchbulge2": { aeName: "Pinch/Bulge", props: { "radius": "Radius", "strength": "Strength" } },
    "pinchbulge3": { aeName: "Pinch/Bulge", props: { "radius": "Radius", "strength": "Strength" } },
    "pinchbulge4": { aeName: "Pinch/Bulge", props: { "radius": "Radius", "strength": "Strength" } },

    "pulsate": { aeName: "Pulse Size", props: { "freq": "Frequency", "maxsize": "Grow", "minsize": "Shrink", "phase": "Phase", "type": "Wave" } },
    "pulsate2": { aeName: "Pulse Size", props: { "freq": "Frequency", "maxsize": "Grow", "minsize": "Shrink", "phase": "Phase", "type": "Wave" } },
    "pulsate3": { aeName: "Pulse Size", props: { "freq": "Frequency", "maxsize": "Grow", "minsize": "Shrink", "phase": "Phase", "type": "Wave" } },
    "pulsate4": { aeName: "Pulse Size", props: { "freq": "Frequency", "maxsize": "Grow", "minsize": "Shrink", "phase": "Phase", "type": "Wave" } },

    "swing": { aeName: "Swing", props: { "a1": "Angle 1", "a2": "Angle 2", "freq": "Frequency", "phase": "Phase", "type": "Type" } },
    "swing2": { aeName: "Swing", props: { "a1": "Angle 1", "a2": "Angle 2", "freq": "Frequency", "phase": "Phase", "type": "Type" } },
    "swing3": { aeName: "Swing", props: { "a1": "Angle 1", "a2": "Angle 2", "freq": "Frequency", "phase": "Phase", "type": "Type" } },
    "swing4": { aeName: "Swing", props: { "a1": "Angle 1", "a2": "Angle 2", "freq": "Frequency", "phase": "Phase", "type": "Type" } },

    "transform": { aeName: "Raster Transform", props: { "scale": "Scale", "angle": "Angle", "maskToLayer": "Mask To Layer", "alpha": "Alpha", "fill": "Fill", "sample": "Sampling" } },
    "transform2": { aeName: "Raster Transform", props: { "scale": "Scale", "angle": "Angle", "maskToLayer": "Mask To Layer", "alpha": "Alpha", "fill": "Fill", "sample": "Sampling" } },
    "transform3": { aeName: "Raster Transform", props: { "scale": "Scale", "angle": "Angle", "maskToLayer": "Mask To Layer", "alpha": "Alpha", "fill": "Fill", "sample": "Sampling" } },
    "transform4": { aeName: "Raster Transform", props: { "scale": "Scale", "angle": "Angle", "maskToLayer": "Mask To Layer", "alpha": "Alpha", "fill": "Fill", "sample": "Sampling" } },

    "squeeze": { aeName: "Squeeze", props: { "strength": "Strength" } },
    "squeeze2": { aeName: "Squeeze", props: { "strength": "Strength" } },
    "squeeze3": { aeName: "Squeeze", props: { "strength": "Strength" } },
    "squeeze4": { aeName: "Squeeze", props: { "strength": "Strength" } },

    "stretch": { aeName: "Stretch Axis", props: { "scale": "Scale", "angle": "Angle", "contentOnly": "Mask to Layer" } },
    "stretch2": { aeName: "Stretch Axis", props: { "scale": "Scale", "angle": "Angle", "contentOnly": "Mask to Layer" } },
    "stretch3": { aeName: "Stretch Axis", props: { "scale": "Scale", "angle": "Angle", "contentOnly": "Mask to Layer" } },
    "stretch4": { aeName: "Stretch Axis", props: { "scale": "Scale", "angle": "Angle", "contentOnly": "Mask to Layer" } },

    "swirl": { aeName: "Swirl", props: { "strength": "Strength", "radius": "Radius" } },
    "swirl2": { aeName: "Swirl", props: { "strength": "Strength", "radius": "Radius" } },
    "swirl3": { aeName: "Swirl", props: { "strength": "Strength", "radius": "Radius" } },
    "swirl4": { aeName: "Swirl", props: { "strength": "Strength", "radius": "Radius" } },

    "randomdisplace": { aeName: "Random Displacement", props: { "mag": "Magnitude", "evolution": "Evolution", "seed": "Seed", "scatter": "Scatter" } },
    "randomdisplace2": { aeName: "Random Displacement", props: { "mag": "Magnitude", "evolution": "Evolution", "seed": "Seed", "scatter": "Scatter" } },
    "randomdisplace3": { aeName: "Random Displacement", props: { "mag": "Magnitude", "evolution": "Evolution", "seed": "Seed", "scatter": "Scatter" } },
    "randomdisplace4": { aeName: "Random Displacement", props: { "mag": "Magnitude", "evolution": "Evolution", "seed": "Seed", "scatter": "Scatter" } }


};
    function escapeRegExp(string) {
        return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function findMappingForEffectId(effectIdRaw) {
        try {
            if (!effectIdRaw) {
                return null;
            }
            var rawLower = String(effectIdRaw).toLowerCase();
            var lastPart = rawLower.split('.').pop();
            for (var key in EFFECT_MAP) {
                try {
                    if (key.toLowerCase() === lastPart) {
                        return EFFECT_MAP[key];
                    }
                } catch (inner) { }
            }
            var baseNoDigits = lastPart.replace(/(\d+)$/, '');
            for (var key2 in EFFECT_MAP) {
                try {
                    if (key2.toLowerCase() === baseNoDigits) {
                        return EFFECT_MAP[key2];
                    }
                } catch (inner) { }
            }
            for (var mapKey in EFFECT_MAP) {
                try {
                    var escaped = escapeRegExp(mapKey);
                    var regex = new RegExp('^' + escaped + '([0-9]{1,2})?$', 'i');
                    if (regex.test(lastPart)) {
                        return EFFECT_MAP[mapKey];
                    }
                    if (lastPart.indexOf(mapKey) !== -1) {
                        return EFFECT_MAP[mapKey];
                    }
                } catch (inner) { }
            }
            for (var fallbackKey in EFFECT_MAP) {
                try {
                    if (rawLower.indexOf(fallbackKey) !== -1) {
                        return EFFECT_MAP[fallbackKey];
                    }
                } catch (inner) { }
            }
        } catch (e) { }
        return null;
    }

    function findPropertyByNameOrHints(effectInstance, desiredName) {
        try {
            if (!effectInstance || !desiredName) {
                return null;
            }
            try {
                var direct = effectInstance.property(desiredName);
                if (direct) {
                    return direct;
                }
            } catch (inner) { }
            var propertyCount = effectInstance.numProperties || 0;
            var target = String(desiredName).toLowerCase();
            for (var i = 1; i <= propertyCount; i++) {
                try {
                    var propertyItem = effectInstance.property(i);
                    if (!propertyItem || !propertyItem.name) {
                        continue;
                    }
                    var propertyNameLower = String(propertyItem.name).toLowerCase();
                    if (propertyNameLower === target) {
                        return propertyItem;
                    }
                    if (propertyNameLower.indexOf(target) !== -1) {
                        return propertyItem;
                    }
                } catch (inner) { }
            }
            var normalizedTarget = target.replace(/[^a-z0-9]/g, '');
            for (var j = 1; j <= propertyCount; j++) {
                try {
                    var propertyItemJ = effectInstance.property(j);
                    if (!propertyItemJ || !propertyItemJ.name) {
                        continue;
                    }
                    var normalizedNameJ = String(propertyItemJ.name).toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (normalizedNameJ.indexOf(normalizedTarget) !== -1) {
                        return propertyItemJ;
                    }
                } catch (inner) { }
            }
        } catch (e) { }
        return null;
    }

    var animationDataWindow = null;
    var animationDataContent = "";
    var hasAnimationData = false;

    function showAnimationDataWindow() {
        try {
            if (!hasAnimationData) {
                alert("No animation data available yet. Please import an XML file with animated properties first.");
                return;
            }
            var siteFolder = "C:/ae_viewer/";
            try {
                var folderObject = new Folder(siteFolder);
                if (!folderObject.exists) {
                    try {
                        folderObject.create();
                    } catch (eCreate) { }
                }
            } catch (eFolder) { }
            var htmlFile = new File(siteFolder + "index.html");
            function escapeHtml(text) {
                try {
                    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
                } catch (e) {
                    return String(text);
                }
            }
            function processAnimationData(content) {
                try {
                    var lines = content.split("\n");
                    var processedLines = [];
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i];
                        var parts = line.split("|");
                        if (parts.length > 1) {
                            var firstPart = escapeHtml(parts[0]);
                            var secondPart = escapeHtml(parts.slice(1).join("|"));
                            processedLines.push(firstPart + '|<span class="copyable" onclick="copyToClipboard(this)" title="Click to copy">' + secondPart + '</span>');
                        } else {
                            processedLines.push(escapeHtml(line));
                        }
                    }
                    return processedLines.join("\n");
                } catch (e) {
                    return String(content);
                }
            }
			var processedData = processAnimationData(animationDataContent);
			var htmlContent = "";

htmlContent += '<!DOCTYPE html>\n';
htmlContent += '<html lang="en">\n';
htmlContent += '<head>\n';
htmlContent += '  <meta charset="UTF-8">\n';
htmlContent += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
htmlContent += '  <title>AstridXMLtoAE</title>\n';
htmlContent += '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">\n';
htmlContent += '  <style>\n';
htmlContent += '    :root { --bg-primary:#121212; --bg-secondary:#1e1e2f; --bg-tertiary:#2a2a3d; --accent-primary:#7f5af0; --accent-secondary:#4ade80; --text-primary:#e5e5e5; --text-secondary:#a1a1aa; --success:#22c55e; --transition:all 0.3s ease; --border-radius:12px; --box-shadow:0 10px 25px rgba(0,0,0,0.5); }\n';
htmlContent += '    * { margin:0; padding:0; box-sizing:border-box; }\n';
htmlContent += '    html, body { height:100%; width:100%; font-family:"Inter",sans-serif; background:var(--bg-primary); color:var(--text-primary); line-height:1.6; display:flex; flex-direction:column; }\n';
htmlContent += '    main { flex:1; display:flex; flex-direction:column; overflow:hidden; }\n';
htmlContent += '    .data-container { flex:1; display:flex; flex-direction:column; background:var(--bg-secondary); overflow:hidden; }\n';
htmlContent += '    .data-content { flex:1; padding:25px; overflow-y:auto; background:#1c1c28; }\n';
htmlContent += '    pre { font-family:"Roboto Mono", monospace; font-size:14px; white-space:pre-wrap; color:var(--text-primary); }\n';
htmlContent += '    .copyable { background:var(--accent-primary); color:#fff; padding:2px 6px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:500; transition:var(--transition); display:inline-block; margin:0 4px; position:relative; }\n';
htmlContent += '    .copyable:hover { opacity:0.85; }\n';
htmlContent += '    .data-line { margin-bottom:8px; line-height:1.5; }\n';
htmlContent += '    .property-label { color:var(--text-secondary); margin-right:5px; }\n';
htmlContent += '    .property-value { background:rgba(127,90,240,0.2); border:1px solid rgba(127,90,240,0.4); }\n';
htmlContent += '    .copied-hint { position:absolute; top:-28px; left:50%; transform:translateX(-50%); background:var(--success); color:#fff; padding:2px 8px; border-radius:6px; font-size:12px; opacity:0; pointer-events:none; transition:opacity 0.3s ease, transform 0.3s ease; }\n';
htmlContent += '    .copied-hint.show { opacity:1; transform:translateX(-50%) translateY(-4px); }\n';
htmlContent += '    .layer-line { display:block; background:rgba(127,90,240,0.15); color:#7f5af0; font-weight:600; padding:2px 6px; margin:2px 0; border-left:3px solid #7f5af0; border-radius:6px; }\n';
htmlContent += '    .effect-line { display:block; background:rgba(255,255,255,0.15); color:#ffffff; font-weight:600; padding:2px 6px; margin:2px 0; border-left:3px solid #ffffff; border-radius:6px; }\n';
htmlContent += '    .effect-original { font-size: 12px; color: #a1a1aa; margin-left: 8px; font-style: italic; }\n';
htmlContent += '    ::-webkit-scrollbar { width:8px; }\n';
htmlContent += '    ::-webkit-scrollbar-track { background:var(--bg-tertiary); border-radius:4px; }\n';
htmlContent += '    ::-webkit-scrollbar-thumb { background:#55557a; border-radius:4px; }\n';
htmlContent += '    ::-webkit-scrollbar-thumb:hover { background:#7f7fb5; }\n';
htmlContent += '  </style>\n';
htmlContent += '  <script>\n';
htmlContent += '    window.EFFECT_MAP = ' + JSON.stringify(EFFECT_MAP) + ';\n';
htmlContent += '  </script>\n';
htmlContent += '</head>\n';
htmlContent += '<body>\n';
htmlContent += '  <main>\n';
htmlContent += '    <div class="data-container">\n';
htmlContent += '      <div class="data-content">\n';
htmlContent += '        <pre id="data">' + processedData + '</pre>\n';
htmlContent += '      </div>\n';
htmlContent += '    </div>\n';
htmlContent += '  </main>\n';
htmlContent += '  <script>\n';
htmlContent += '    function copyToClipboard(element) {\n';
htmlContent += '      const text = element.textContent;\n';
htmlContent += '      navigator.clipboard.writeText(text).then(function() {\n';
htmlContent += '        var hint = document.createElement("div");\n';
htmlContent += '        hint.className = "copied-hint";\n';
htmlContent += '        hint.textContent = "Copied!";\n';
htmlContent += '        element.appendChild(hint);\n';
htmlContent += '        setTimeout(() => hint.classList.add("show"), 10);\n';
htmlContent += '        setTimeout(() => hint.classList.remove("show"), 1200);\n';
htmlContent += '        setTimeout(() => element.removeChild(hint), 1600);\n';
htmlContent += '      });\n';
htmlContent += '    }\n';
htmlContent += '\n';
htmlContent += '    function highlightData() {\n';
htmlContent += '      const pre = document.getElementById("data");\n';
htmlContent += '      const lines = pre.textContent.split("\\n");\n';
htmlContent += '      let effectCounter = {};\n';
htmlContent += '\n';
htmlContent += '      function getDisplayName(effectKey, aeName, hasCompatibility) {\n';
htmlContent += '        const hasNumber = /\\d$/.test(effectKey);\n';
htmlContent += '        let displayName = aeName;\n';
htmlContent += '        \n';
htmlContent += '        if (!hasNumber && hasCompatibility) {\n';
htmlContent += '          displayName += " (Move keyframes to compatibility subgroup!)";\n';
htmlContent += '        }\n';
htmlContent += '        \n';
htmlContent += '        return displayName + \'<span class="effect-original">(\' + effectKey + \')</span>\';\n';
htmlContent += '      }\n';
htmlContent += '\n';
htmlContent += '      function checkCompatibilityRecursively(obj) {\n';
htmlContent += '        if (!obj || typeof obj !== "object") return false;\n';
htmlContent += '        if (obj.hasOwnProperty("Compatibility") && obj.Compatibility === true) return true;\n';
htmlContent += '        for (let key in obj) {\n';
htmlContent += '          if (checkCompatibilityRecursively(obj[key])) return true;\n';
htmlContent += '        }\n';
htmlContent += '        return false;\n';
htmlContent += '      }\n';
htmlContent += '\n';
htmlContent += '      const EFFECT_MAP = window.EFFECT_MAP || {};\n';
htmlContent += '\n';
htmlContent += '      const processedLines = lines.map(line => {\n';
htmlContent += '        line = line.trim();\n';
htmlContent += '        if (line.startsWith("Layer")) { effectCounter = {}; return `<span class="layer-line">${line}</span>`; }\n';
htmlContent += '\n';
htmlContent += '        if (line.startsWith("Effect")) {\n';
htmlContent += '          let effectKey = line.split(":")[1] ? line.split(":")[1].trim() : line;\n';
htmlContent += '          effectCounter[effectKey] = (effectCounter[effectKey] || 0) + 1;\n';
htmlContent += '\n';
htmlContent += '          const aeName = EFFECT_MAP[effectKey] ? EFFECT_MAP[effectKey].aeName : effectKey;\n';
htmlContent += '          const hasCompatibility = EFFECT_MAP[effectKey] ? checkCompatibilityRecursively(EFFECT_MAP[effectKey]) : false;\n';
htmlContent += '          let displayName = getDisplayName(effectKey, aeName, hasCompatibility);\n';
htmlContent += '\n';
htmlContent += '          if (effectCounter[effectKey] > 1) {\n';
htmlContent += '            displayName = displayName.replace(\'</span>\', \' #\' + effectCounter[effectKey] + \'</span>\');\n';
htmlContent += '          }\n';
htmlContent += '          return `<span class="effect-line">Effect:${displayName}</span>`;\n';
htmlContent += '        }\n';
htmlContent += '\n';
htmlContent += '        if (line.indexOf("|") !== -1) {\n';
htmlContent += '          const parts = line.split("|");\n';
htmlContent += '          if (parts.length > 1) {\n';
htmlContent += '            const firstPart = parts[0];\n';
htmlContent += '            const secondPart = parts.slice(1).join("|");\n';
htmlContent += '            return `<div class="data-line"><span class="property-label">${firstPart}</span>|<span class="copyable property-value" onclick="copyToClipboard(this)">${secondPart}</span></div>`;\n';
htmlContent += '          }\n';
htmlContent += '        }\n';
htmlContent += '\n';
htmlContent += '        return line.replace(/(bezier\\([^)]*\\))/g, match => `<span class="copyable" onclick="copyToClipboard(this)">${match}</span>`);\n';
htmlContent += '      }).join("\\n");\n';
htmlContent += '\n';
htmlContent += '      pre.innerHTML = processedLines;\n';
htmlContent += '    }\n';
htmlContent += '\n';
htmlContent += '    document.addEventListener("DOMContentLoaded", highlightData);\n';
htmlContent += '  </script>\n';
htmlContent += '</body>\n';
htmlContent += '</html>\n';



            try {
                htmlFile.encoding = "UTF-8";
                if (htmlFile.open("w")) {
                    htmlFile.write(htmlContent);
                    htmlFile.close();
                    if (htmlFile.exists) {
                        try {
                            htmlFile.execute();
                        } catch (eExecute) {
                            alert("Could not open HTML file viewer: " + String(eExecute));
                        }
                    } else {
                        alert("Error: index.html was not created.");
                    }
                } else {
                    alert("Error: could not open index.html for writing.");
                }
            } catch (eWrite) {
                alert("Error writing HTML file: " + String(eWrite));
            }
        } catch (e) {
            alert("Error showing animation data window: " + String(e));
        }
    }

    function transferKeysToCompatibility(effectInstanceLocal, mappingLocal, effectIdLocal, parentLayer) {
        try {
            if (!effectInstanceLocal) {
                return;
            }
            function findCompatibilityGroup(root) {
                try {
                    var count = root.numProperties || 0;
                    for (var i = 1; i <= count; i++) {
                        try {
                            var p = root.property(i);
                            if (!p || !p.name) {
                                continue;
                            }
                            if (p.matchName === "ADBE Group" && String(p.name).toLowerCase() === "compatibility") {
                                return p;
                            }
                            if (String(p.name).toLowerCase() === "compatibility") {
                                return p;
                            }
                        } catch (inner) { }
                    }
                } catch (outer) { }
                return null;
            }
            function isLeafProperty(prop) {
                try {
                    return !(prop.numProperties && prop.numProperties > 0);
                } catch (e) {
                    return false;
                }
            }
            function findTargetPropertyInCompat(compatGroup, srcPropName) {
                try {
                    if (!compatGroup) {
                        return null;
                    }
                    try {
                        var direct = compatGroup.property(srcPropName);
                        if (direct) {
                            return direct;
                        }
                    } catch (inner) { }
                    var n = compatGroup.numProperties || 0;
                    var target = String(srcPropName).toLowerCase().replace(/[^a-z0-9]/g, '');
                    for (var j = 1; j <= n; j++) {
                        try {
                            var pj = compatGroup.property(j);
                            if (!pj || !pj.name) {
                                continue;
                            }
                            var nmj = String(pj.name).toLowerCase().replace(/[^a-z0-9]/g, '');
                            if (nmj.indexOf(target) !== -1) {
                                return pj;
                            }
                        } catch (inner) { }
                    }
                } catch (eFind) { }
                return null;
            }
            function copyKeysWithEasingAndRemove(srcProp, dstProp) {
                try {
                    if (!srcProp || !dstProp) {
                        return;
                    }
                    var keyCount = srcProp.numKeys || 0;
                    if (keyCount <= 0) {
                        return;
                    }
                    var keysData = [];
                    for (var k = 1; k <= keyCount; k++) {
                        try {
                            var t = srcProp.keyTime(k);
                            var v = srcProp.keyValue(k);
                            var inEase = null;
                            var outEase = null;
                            var inType = null;
                            var outType = null;
                            try { inEase = srcProp.keyInTemporalEase(k); } catch (e) { inEase = null; }
                            try { outEase = srcProp.keyOutTemporalEase(k); } catch (e) { outEase = null; }
                            try { inType = srcProp.keyInInterpolationType(k); } catch (e) { inType = null; }
                            try { outType = srcProp.keyOutInterpolationType(k); } catch (e) { outType = null; }
                            keysData.push({ t: t, v: v, inEase: inEase, outEase: outEase, inType: inType, outType: outType });
                        } catch (inner) { }
                    }
                    for (var ki = 0; ki < keysData.length; ki++) {
                        try {
                            var kd = keysData[ki];
                            try { dstProp.setValueAtTime(kd.t, kd.v); } catch (e) { try { dstProp.setValueAtTime(kd.t, srcProp.valueAtTime(kd.t, false)); } catch (ee) { } }
                            var foundIndex = -1;
                            var dstCount = dstProp.numKeys || 0;
                            for (var dki = 1; dki <= dstCount; dki++) {
                                try {
                                    if (Math.abs(dstProp.keyTime(dki) - kd.t) < 1e-6) {
                                        foundIndex = dki;
                                        break;
                                    }
                                } catch (inner) { }
                            }
                            if (foundIndex !== -1) {
                                try { if (kd.inType !== null && kd.outType !== null) dstProp.setInterpolationTypeAtKey(foundIndex, kd.inType, kd.outType); } catch (inner) { }
                                try { if (kd.inEase !== null) dstProp.setTemporalEaseAtKey(foundIndex, kd.inEase, kd.outEase); } catch (inner) { }
                            }
                        } catch (inner) { }
                    }
                    for (var rem = keyCount; rem >= 1; rem--) {
                        try { srcProp.removeKey(rem); } catch (inner) { }
                    }
                } catch (e) { }
            }
            var compatGroup = findCompatibilityGroup(effectInstanceLocal);
            if (!compatGroup) {
                return;
            }
            var compatCheckbox = null;
            try { compatCheckbox = compatGroup.property("Compatibility"); } catch (e) { compatCheckbox = null; }
            var compatIsTrue = false;
            try {
                if (compatCheckbox) {
                    compatIsTrue = !!compatCheckbox.value;
                } else {
                    var maybeProp = findTargetPropertyInCompat(compatGroup, "Compatibility");
                    if (maybeProp) {
                        compatIsTrue = !!maybeProp.value;
                    }
                }
            } catch (e) { compatIsTrue = false; }
            if (!compatIsTrue) {
                return;
            }
            try {
                var topCount = effectInstanceLocal.numProperties || 0;
                for (var pi = 1; pi <= topCount; pi++) {
                    try {
                        var topProp = effectInstanceLocal.property(pi);
                        if (!topProp) {
                            continue;
                        }
                        if (topProp.numProperties && topProp.numProperties > 0) {
                            continue;
                        }
                        var lname = String(topProp.name).toLowerCase();
                        if (lname.indexOf("compat") !== -1) {
                            continue;
                        }
                        var targetProp = findTargetPropertyInCompat(compatGroup, topProp.name);
                        if (!targetProp && mappingLocal && mappingLocal.props) {
                            for (var mk in mappingLocal.props) {
                                try {
                                    if (String(mk).toLowerCase() === String(topProp.name).toLowerCase()) {
                                        try { targetProp = compatGroup.property(mappingLocal.props[mk]); } catch (e) { targetProp = null; }
                                        if (!targetProp) targetProp = findTargetPropertyInCompat(compatGroup, mappingLocal.props[mk]);
                                        break;
                                    }
                                } catch (inner) { }
                            }
                        }
                        if (!targetProp) {
                            continue;
                        }
                        copyKeysWithEasingAndRemove(topProp, targetProp);
                    } catch (inner) { }
                }
            } catch (e) { }
        } catch (e) { }
    }
    function findNormalGroup(root) {
        try {
            var count = root.numProperties || 0;
            for (var i = 1; i <= count; i++) {
                try {
                    var p = root.property(i);
                    if (!p || !p.name) {
                        continue;
                    }
                    if (p.matchName === "ADBE Group" && String(p.name).toLowerCase() === "normal") {
                        return p;
                    }
                    if (String(p.name).toLowerCase() === "normal") {
                        return p;
                    }
                } catch (inner) { }
            }
        } catch (outer) { }
        return null;
    }
    function transferKeysFromNormalToCompatibility(effectInstanceLocal, parentLayer, logMessage) {  
        try {
            if (!effectInstanceLocal) {
                logMessage("[TRANSFER_NORMAL] No effect instance.");
                return;
            }

            var normalGroup = findNormalGroup(effectInstanceLocal);
            var compatGroup = findCompatibilityGroup(effectInstanceLocal);

            logMessage("[TRANSFER_NORMAL] Found Normal group: " + !!normalGroup + ", Compat group: " + !!compatGroup);

            if (!normalGroup || !compatGroup) {
                return;
            }
            var normalCheckbox = null;
            try { normalCheckbox = effectInstanceLocal.property("Normal") || normalGroup.property("Normal"); } catch (e) { normalCheckbox = null; }

            var compatCheckbox = null;
            try { compatCheckbox = effectInstanceLocal.property("Compatibility") || compatGroup.property("Compatibility"); } catch (e) { compatCheckbox = null; }

            var normalIsFalse = false;
            var compatIsTrue = false;

            try {
                normalIsFalse = normalCheckbox ? !normalCheckbox.value : true;  
                compatIsTrue = compatCheckbox ? !!compatCheckbox.value : false;
            } catch (e) { }

            logMessage("[TRANSFER_NORMAL] Normal is false: " + normalIsFalse + ", Compat is true: " + compatIsTrue);

            if (!compatIsTrue || !normalIsFalse) {
                return;
            }
            var transferredCount = 0;
            var normalCount = normalGroup.numProperties || 0;
            for (var pi = 1; pi <= normalCount; pi++) {
                try {
                    var normalProp = normalGroup.property(pi);
                    if (!normalProp || normalProp.numProperties > 0) {
                        continue;  
                    }
                    var targetProp = findTargetPropertyInCompat(compatGroup, normalProp.name);

                    if (!targetProp) {
                        logMessage("[TRANSFER_NORMAL] No target for prop: " + normalProp.name);
                        continue;
                    }
                    copyKeysWithEasingAndRemove(normalProp, targetProp);
                    transferredCount++;
                } catch (inner) { }
            }
        } catch (e) { 
        }
    }

	function createImporterUI() {
    var windowInstance = new Window("palette", " " + UI.subtitle, undefined, { resizeable: true });
    windowInstance.orientation = "column";
    windowInstance.alignChildren = ["fill", "top"];
    windowInstance.spacing = 8;
    windowInstance.margins = [15, 15, 15, 15];
    var headerGroup = windowInstance.add("group");
    headerGroup.orientation = "column";
    headerGroup.alignChildren = ["fill", "center"];
    var titleText = headerGroup.add("statictext", undefined, UI.title);
    titleText.graphics.font = ScriptUI.newFont("Segoe UI", "BOLD", 16);
    var brandText = headerGroup.add("statictext", undefined, UI.subtitle);
    brandText.graphics.font = ScriptUI.newFont("Segoe UI", "REGULAR", 10);
    var fileGroup = windowInstance.add("panel", undefined, "1) Select XML File");
    fileGroup.orientation = "row";
    fileGroup.alignChildren = ["fill", "center"];
    fileGroup.margins = [10, 10, 10, 10];

    var filePathEdit = fileGroup.add("edittext", undefined, UI.noFile, { readonly: true });
    filePathEdit.alignment = ["fill", "center"];  
    var browseButton = fileGroup.add("button", undefined, UI.btnBrowse);
    var controlGroup = windowInstance.add("group");
    controlGroup.orientation = "row";
    controlGroup.alignChildren = ["left", "center"];
    controlGroup.spacing = 8;

    var importButton = controlGroup.add("button", undefined, UI.btnImport);
    var openBezierButton = controlGroup.add("button", undefined, UI.btnOpenBezier);
    openBezierButton.enabled = false;
    var clearButton = controlGroup.add("button", undefined, UI.btnClearLog);
    var logPanel = windowInstance.add("panel", undefined, "Log");
    logPanel.orientation = "column";
    logPanel.alignChildren = ["fill", "fill"];
    logPanel.margins = [10, 10, 10, 10];

    var logBox = logPanel.add("edittext", undefined, "", {
        multiline: true,
        scrolling: true,
        readonly: true
    });
    logBox.alignment = ["fill", "fill"]; 
    logBox.preferredSize = [520, 260];
    var footerGroup = windowInstance.add("group");
    footerGroup.orientation = "row";
    footerGroup.alignment = ["right", "bottom"];
    footerGroup.spacing = 8;

    var saveReportButton = footerGroup.add("button", undefined, UI.btnSaveReport);
    var closeButton = footerGroup.add("button", undefined, UI.btnClose);
    var creditText = windowInstance.add("statictext", undefined, UI.footerCredit);
    creditText.graphics.font = ScriptUI.newFont("Segoe UI", "REGULAR", 9);
    creditText.alignment = ["right", "bottom"];
    windowInstance.onResizing = windowInstance.onResize = function() {
        this.layout.resize();
    }

        function logMessage(message) {
            try {
                var timestamp = (new Date()).toLocaleTimeString();
                logBox.text += "[" + timestamp + "] " + message + "\r\n";
                try {
                    logBox.selection = logBox.text.length;
                    logBox.scroll = logBox.text.length;
                } catch (e) { }
                $.writeln(message);
            } catch (e) { }
        }

        var selectedFile = null;
        var lastFolder = null;
        try {
            if (app.settings.haveSetting('AstridXMLtoAE', 'lastFolder')) {
                lastFolder = app.settings.getSetting('AstridXMLtoAE', 'lastFolder');
            }
        } catch (e) {
            lastFolder = null;
        }

        browseButton.onClick = function () {
            try {
                var startFolder = (lastFolder && Folder(lastFolder).exists) ? Folder(lastFolder) : Folder.desktop;
                var file = File.openDialog("Select Alight Motion XML file", "XML:*.xml", false);
                if (file) {
                    selectedFile = file;
                    try {
                        filePathEdit.text = decodeURI(file.fsName);
                    } catch (inner) { filePathEdit.text = file.fsName; }
                    logMessage("Selected file: " + file.name);
                    try {
                        app.settings.saveSetting('AstridXMLtoAE', 'lastFolder', file.parent.fsName);
                        lastFolder = file.parent.fsName;
                    } catch (e) { }
                }
            } catch (e) { logMessage("Browse error: " + String(e)); }
        };

        openBezierButton.onClick = function () {
            try { showAnimationDataWindow(); } catch (e) { logMessage("Open bezier error: " + String(e)); }
        };

        clearButton.onClick = function () {
            try { logBox.text = ""; } catch (e) { }
        };

        saveReportButton.onClick = function () {
            try {
                if (!logBox.text || logBox.text.length < 10) {
                    alert("No log content to save.");
                    return;
                }
                var outFile = File.saveDialog("Save import report as...", "Text Files:*.txt");
                if (!outFile) {
                    return;
                }
                try {
                    outFile.encoding = "UTF-8";
                    if (outFile.open('w')) {
                        outFile.write(logBox.text);
                        outFile.close();
                        alert('Report saved successfully:\n' + outFile.fsName);
                    } else {
                        alert('Failed to open file for writing.');
                    }
                } catch (e) {
                    alert('Error saving report:\n' + e.toString());
                }
            } catch (e) { logMessage("Save report error: " + String(e)); }
        };

        closeButton.onClick = function () {
            try { windowInstance.close(); } catch (e) { }
        };

        importButton.onClick = function () {
            if (!selectedFile) {
                alert('Please select an XML file first.');
                return;
            }
            var undoGroupStarted = false;
            try {
                if (!selectedFile.open('r')) {
                    alert('Failed to open file: ' + selectedFile.fsName);
                    return;
                }
                var xmlText = selectedFile.read();
                selectedFile.close();
                var xmlObject;
                try {
                    xmlObject = new XML(xmlText);
                } catch (e) {
                    alert('XML parse error:\n' + e.toString());
                    return;
                }
                try {
                    app.beginUndoGroup('Import AM XML (AstridXMLtoAE)');
                    undoGroupStarted = true;
                } catch (e) { }
                logMessage('Import started...');
                var scene = xmlObject;
                var width = safeParseFloat(scene.@width, 1080);
                var height = safeParseFloat(scene.@height, 1080);
                var framesPerSecond = safeParseFloat(scene.@fps, 60);
                var totalMilliseconds = safeParseFloat(scene.@totalTime, 10000);
                var durationSeconds = totalMilliseconds / 1000;
                if (!isFinite(durationSeconds) || durationSeconds <= 0) {
                    durationSeconds = 10;
                }
                var compName = 'AM Import ' + (new Date()).toLocaleString().replace(/[\/:,]/g, '-');
                var composition = app.project.items.addComp(compName, width, height, 1, durationSeconds, framesPerSecond);
                composition.openInViewer();
                var missingPluginList = [];
                var missingPropertyList = [];
                var animatedEffectsCount = 0;
                animationDataContent = '\n';
                animationDataContent += 'Source XML: ' + selectedFile.name + '\n';
                animationDataContent += '\n\n';
                var shapes = xmlObject..shape;
                var totalShapes = shapes.length();
                logMessage('Found ' + totalShapes + ' shapes to import.');
                for (var shapeIndex = 0; shapeIndex < totalShapes; shapeIndex++) {
                    try {
                        var shapeNode = shapes[shapeIndex];
                        var startMilliseconds = safeParseFloat(shapeNode.@startTime, 0);
                        var endMilliseconds = safeParseFloat(shapeNode.@endTime, totalMilliseconds);
                        var startSeconds = startMilliseconds / 1000;
                        var endSeconds = endMilliseconds / 1000;
                        if (endSeconds <= startSeconds) {
                            endSeconds = Math.min(startSeconds + 0.01, durationSeconds);
                        }
                        var solidLayer = composition.layers.addSolid([1, 1, 1], 'AM Adjustment ' + (shapeIndex + 1), width, height, 1);
                        solidLayer.adjustmentLayer = true;
                        solidLayer.inPoint = startSeconds;
                        solidLayer.outPoint = endSeconds;
                        var effects = shapeNode.effect;
                        var hasLayerAnimation = false;
                        var layerAnimationContent = '';
                        for (var effectIndex = 0; effectIndex < effects.length(); effectIndex++) {
                            try {
                                var effectNode = effects[effectIndex];
                                var effectIdRaw = String(effectNode.@id || '');
                                var mapping = findMappingForEffectId(effectIdRaw);
                                if (!mapping) {
                                    try {
                                        if (missingPluginList.indexOf(effectIdRaw) === -1) {
                                            missingPluginList.push(effectIdRaw);
                                        }
                                    } catch (inner) { }
                                    continue;
                                }
                                function addEffectSafely(effectName) {
                                    try {
                                        return solidLayer.Effects.addProperty(effectName);
                                    } catch (eAdd) { }
                                    try {
                                        return solidLayer.Effects.addProperty(effectName.replace(/\s+/g, ''));
                                    } catch (eAdd2) { }
                                    return null;
                                }
                                var effectInstance = addEffectSafely(mapping.aeName);
                                var miss = effectIdRaw + ' -> ' + mapping.aeName;
                                if (!effectInstance) {
                                    try {
                                        if (missingPluginList.indexOf(miss) === -1) {
                                            missingPluginList.push(miss);
                                        }
                                    } catch (inner) { }
                                    logMessage('[ERROR] Failed to add effect (' + mapping.aeName + ') for ' + effectIdRaw);
                                    continue;
                                }
                                try {
									(function setPropertiesRecursive(propertyGroup) {
									if (!propertyGroup || !propertyGroup.numProperties) return;

									for (var pi = 1; pi <= propertyGroup.numProperties; pi++) {
										var propertyItem = propertyGroup.property(pi);
										if (!propertyItem) continue;
										if (propertyItem.name === "X Tiles" || propertyItem.name === "Y Tiles" || propertyItem.name === "Mirror") {
											try { propertyItem.setValue(true); } catch (e) { }
										}
										if (propertyItem.matchName === "ADBE Group" && propertyItem.name === "Compatibility") {
											var compatCheckbox = null;
											try { compatCheckbox = propertyItem.property("Compatibility"); } catch (e) { compatCheckbox = null; }

											if (compatCheckbox && compatCheckbox.value) { 
												var normalCheckbox = null;
												try { normalCheckbox = propertyItem.property("Normal"); } catch (e) { normalCheckbox = null; }
												if (normalCheckbox) {
													try { normalCheckbox.setValue(false); } catch (e) { }
												}

												for (var key in mapping.props) {
													try {
														var propOutside = effectInstance.property(mapping.props[key]);
														var propInside = propertyItem.property(mapping.props[key]);

														if (propOutside && propInside) {
															while (propInside.numKeys > 0) {
																propInside.removeKey(1);
															}
															for (var k = 1; k <= propOutside.numKeys; k++) {
																var time = propOutside.keyTime(k);
																var value = propOutside.keyValue(k);
																propInside.setValueAtTime(time, value);
															}
															propInside.setValue(propOutside.value);
														}
													} catch (inner) { }
												}
											}
										}
										if (propertyItem.name === "Compatibility" && propertyItem.matchName !== "ADBE Group") {
											try {
												propertyItem.setValue(!effectIdRaw.match(/\d+$/));
												if (propertyItem.value) {
													var normalCheckbox = null;
													try { normalCheckbox = effectInstance.property("Normal"); } catch (e) { normalCheckbox = null; }
													if (normalCheckbox) {
														try { normalCheckbox.setValue(false); } catch (e) { }
													}
												}
											} catch (inner) { }
										}
										if (propertyItem.numProperties && propertyItem.numProperties > 0) {
											try { setPropertiesRecursive(propertyItem); } catch (inner) { }
										}
									}
								})(effectInstance);

                                } catch (eProps) {
                                    logMessage('[ERROR] Setting effect properties: ' + eProps.toString());
                                }
                                try {
                                    transferKeysToCompatibility(effectInstance, mapping, effectIdRaw, solidLayer);
                                } catch (eTransfer) {
                                    logMessage('[WARN] transferKeysToCompatibility failed: ' + String(eTransfer));
                                }

                                var propertyArray = effectNode.property;
                                var hasEffectAnimation = false;
                                var effectAnimationContent = '';
                                for (var propertyIndex = 0; propertyIndex < propertyArray.length(); propertyIndex++) {
                                    try {
                                        var propertyNode = propertyArray[propertyIndex];
                                        var propertyName = String(propertyNode.@name || '');
                                        var propertyType = String(propertyNode.@type || '');
                                        var aePropertyName = (mapping.props && mapping.props.hasOwnProperty(propertyName)) ? mapping.props[propertyName] : null;
                                        var propertyReference = null;
                                        if (aePropertyName) {
                                            propertyReference = findPropertyByNameOrHints(effectInstance, aePropertyName);
                                        }
                                        if (!propertyReference) {
                                            propertyReference = findPropertyByNameOrHints(effectInstance, propertyName);
                                        }
                                        if (!propertyReference) {
                                            try {
                                                if (missingPropertyList.indexOf({ effect: mapping.aeName, prop: propertyName }) === -1) {
                                                    missingPropertyList.push({ effect: mapping.aeName, prop: propertyName });
                                                }
                                            } catch (inner) { }
                                            continue;
                                        }
                                        if (propertyNode.@value && String(propertyNode.@value).length > 0) {
                                            try {
                                                var rawValue = String(propertyNode.@value);
                                                if (propertyType === 'vec2') {
                                                    var arr = splitVector2(rawValue);
                                                    if (arr) {
                                                        try { propertyReference.setValue(arr); } catch (e) { }
                                                    }
                                                } else if (propertyType === 'color') {
                                                    var col = hexToRgbArray(rawValue);
                                                    if (col) {
                                                        try { propertyReference.setValue(col.rgb); } catch (e) { }
                                                    }
                                                } else if (propertyType === 'bool') {
                                                    try { propertyReference.setValue(rawValue === 'true' || rawValue === '1'); } catch (e) { }
                                                } else {
                                                    var num = safeParseFloat(rawValue, NaN);
                                                    if (!isNaN(num)) {
                                                        try { propertyReference.setValue(num); } catch (e) { }
                                                    } else {
                                                        try { propertyReference.setValue(rawValue); } catch (e) { }
                                                    }
                                                }
                                            } catch (eSet) { }
                                        }
                                        var keys = [];
                                        try {
                                            if (propertyNode.kf && propertyNode.kf.length() > 0) {
                                                for (var keyIndex = 0; keyIndex < propertyNode.kf.length(); keyIndex++) {
                                                    try {
                                                        var keyNode = propertyNode.kf[keyIndex];
                                                        var tVal = safeParseFloat(keyNode.@t, 0);
                                                        keys.push({ key: keyNode, t: tVal });
                                                    } catch (inner) { }
                                                }
                                                keys.sort(function (a, b) { return a.t - b.t; });
                                            }
                                        } catch (eKeys) { }
                                        if (keys.length > 1) {
                                            try {
                                                var firstValRaw = String(keys[0].key.@v);
                                                var animDifferent = false;
                                                for (var kk = 1; kk < keys.length; kk++) {
                                                    try {
                                                        if (!valuesEqual(firstValRaw, String(keys[kk].key.@v))) {
                                                            animDifferent = true;
                                                            break;
                                                        }
                                                    } catch (inner) { }
                                                }
                                                if (!animDifferent) {
                                                    continue;
                                                }
                                                try {
                                                    while (propertyReference.numKeys > 0) {
                                                        try { propertyReference.removeKey(1); } catch (inner) { break; }
                                                    }
                                                } catch (eRemove) { }
                                                for (var keyInsertIndex = 0; keyInsertIndex < keys.length; keyInsertIndex++) {
                                                    try {
                                                        var keyItem = keys[keyInsertIndex].key;
                                                        var timeRaw = safeParseFloat(keyItem.@t, 0);
                                                        var valueRaw = String(keyItem.@v);
                                                        var timeAbsolute;
                                                        if (isLikelyNormalizedTime(timeRaw)) {
                                                            timeAbsolute = solidLayer.inPoint + (solidLayer.outPoint - solidLayer.inPoint) * timeRaw;
                                                        } else {
                                                            timeAbsolute = timeRaw / 1000;
                                                        }
                                                        if (propertyType === 'vec2') {
                                                            var arrv = splitVector2(valueRaw);
                                                            if (arrv) {
                                                                try { propertyReference.setValueAtTime(timeAbsolute, arrv); } catch (e) { }
                                                            }
                                                        } else if (propertyType === 'color') {
                                                            var colv = hexToRgbArray(valueRaw);
                                                            if (colv) {
                                                                try { propertyReference.setValueAtTime(timeAbsolute, colv.rgb); } catch (e) { }
                                                            }
                                                        } else if (propertyType === 'bool') {
                                                            try { propertyReference.setValueAtTime(timeAbsolute, (valueRaw === 'true' || valueRaw === '1')); } catch (e) { }
                                                        } else {
                                                            var numv = safeParseFloat(valueRaw, NaN);
                                                            if (!isNaN(numv)) {
                                                                try { propertyReference.setValueAtTime(timeAbsolute, numv); } catch (e) { }
                                                            } else {
                                                                try { propertyReference.setValueAtTime(timeAbsolute, valueRaw); } catch (e) { }
                                                            }
                                                        }
                                                    } catch (inner) { }
                                                }
                                                var propAnimationContent = '';
                                                var hasPropAnimation = false;
                                                for (var pairIndex = 0; pairIndex < keys.length - 1; pairIndex++) {
                                                    try {
                                                        var keyNode1 = keys[pairIndex].key;
                                                        var keyNode2 = keys[pairIndex + 1].key;
                                                        var timeRaw1 = safeParseFloat(keyNode1.@t, 0);
                                                        var timeRaw2 = safeParseFloat(keyNode2.@t, 0);
                                                        var t1;
                                                        var t2;
                                                        if (isLikelyNormalizedTime(timeRaw1)) {
                                                            t1 = solidLayer.inPoint + (solidLayer.outPoint - solidLayer.inPoint) * timeRaw1;
                                                        } else {
                                                            t1 = timeRaw1 / 1000;
                                                        }
                                                        if (isLikelyNormalizedTime(timeRaw2)) {
                                                            t2 = solidLayer.inPoint + (solidLayer.outPoint - solidLayer.inPoint) * timeRaw2;
                                                        } else {
                                                            t2 = timeRaw2 / 1000;
                                                        }
                                                        var value1 = String(keyNode1.@v);
                                                        var value2 = String(keyNode2.@v);
                                                        var easeString = "";
                                                        if (String(keyNode2.@e).length > 0) {
                                                            easeString = String(keyNode2.@e);
                                                        } else if (String(keyNode1.@e).length > 0) {
                                                            easeString = String(keyNode1.@e);
                                                        }
                                                        if (easeString.length > 0) {
                                                            if (easeString.indexOf('cubicBezier') === 0) {
                                                                var bezParts = easeString.split(/\s+/);
                                                                if (bezParts.length >= 5) {
                                                                    var bx1 = parseFloat(bezParts[1]);
                                                                    var by1 = parseFloat(bezParts[2]);
                                                                    var bx2 = parseFloat(bezParts[3]);
                                                                    var by2 = parseFloat(bezParts[4]);
                                                                    if (!isNaN(bx1) && !isNaN(by1) && !isNaN(bx2) && !isNaN(by2)) {
                                                                        propAnimationContent += '      ' + t1.toFixed(3) + 's → ' + t2.toFixed(3) + 's: ' + value1 + ' → ' + value2 + ' | ' + bx1.toFixed(2) + ',' + by1.toFixed(2) + ',' + bx2.toFixed(2) + ',' + by2.toFixed(2) + '\n';
                                                                        hasPropAnimation = true;
                                                                    }
                                                                }
                                                            } else {
                                                                propAnimationContent += '      ' + t1.toFixed(3) + 's → ' + t2.toFixed(3) + 's: ' + value1 + ' → ' + value2 + ' | ' + easeString.replace(/\s+/g, ' ') + '\n';
                                                                hasPropAnimation = true;
                                                            }
                                                        } else {
                                                            propAnimationContent += '      ' + t1.toFixed(3) + 's → ' + t2.toFixed(3) + 's: ' + value1 + ' → ' + value2 + ' | linear\n';
                                                            hasPropAnimation = true;
                                                        }
                                                    } catch (inner) { }
                                                }
                                                if (hasPropAnimation) {
                                                    if (!hasEffectAnimation) {
                                                        effectAnimationContent += '  Effect: ' + mapping.aeName + '\n';
                                                        hasEffectAnimation = true;
                                                    }
                                                    effectAnimationContent += '    Property: ' + (aePropertyName || propertyName) + '\n';
                                                    effectAnimationContent += propAnimationContent + '\n';
                                                }
                                            } catch (eAnim) { }
                                        }
                                    } catch (inner) { }
                                }
                                try {
                                    transferKeysFromNormalToCompatibility(effectInstance, solidLayer, logMessage); 
                                } catch (eTransferNormal) {
                                    logMessage('[WARN] transferKeysFromNormalToCompatibility failed: ' + String(eTransferNormal));
                                }
                                if (hasEffectAnimation) {
                                    if (!hasLayerAnimation) {
                                        layerAnimationContent += 'Layer: AM Adjustment ' + (shapeIndex + 1) + ' (in: ' + startSeconds.toFixed(3) + 's, out: ' + endSeconds.toFixed(3) + 's)\n';
                                        hasLayerAnimation = true;
                                    }
                                    layerAnimationContent += effectAnimationContent;
                                    animatedEffectsCount++;
                                }
                            } catch (inner) { }
                        }
                        if (hasLayerAnimation) {
                            animationDataContent += layerAnimationContent;
                            animationDataContent += '\n\n';
                        }
                    } catch (innerShape) { logMessage("Shape processing error: " + String(innerShape)); }
                }
                if (animatedEffectsCount > 0) {
                    animationDataContent += '\n';
                    hasAnimationData = true;
                } else {
                    animationDataContent += 'No animated properties found in this XML file.\n';
                    hasAnimationData = false;
                }
                try {
                    if (undoGroupStarted) {
                        try { app.endUndoGroup(); } catch (e) { }
                    }
                } catch (e) { }
                logMessage(UI.success);
                try { openBezierButton.enabled = hasAnimationData; } catch (e) { }
                if (missingPluginList.length > 0 || missingPropertyList.length > 0) {
                    if (missingPluginList.length > 0) {
                        try { logMessage('[MISSING PLUGINS] ' + missingPluginList.join(', ')); } catch (e) { }
                    }
                }
            } catch (err) {
                try {
                    try { app.endUndoGroup(); } catch (ee) { }
                } catch (inner) { }
                alert('Import failed:\n' + err.toString());
                try { logMessage('[ERROR] ' + err.toString()); } catch (e) { }
                try { if (err.stack) logMessage('[STACK] ' + err.stack); } catch (e) { }
            }
        };

        return windowInstance;
    }

    try {
        var panel = createImporterUI();
        panel.center();
        panel.show();
    } catch (e) {
        alert('Failed to create AstridXMLtoAE UI:\n' + e.toString() + '\n\n' + (e.stack || ''));
    }
})();
