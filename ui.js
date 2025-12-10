const params = {
    lightIntensity: 1.0,
    ambientStrength: 0.1,
    reflectionStrength: 1.0,
    colorR: 1.0,
    colorG: 1.0,
    colorB: 1.0,
    maxBounces: 4
};

function setupUI() {
    const bind = (id, key) => {
        document.getElementById(id).addEventListener("input", e => {
            params[key] = parseFloat(e.target.value);
        });
    };

    bind("lightIntensity", "lightIntensity");
    bind("ambientStrength", "ambientStrength");
    bind("reflectionStrength", "reflectionStrength");
    bind("colorR", "colorR");
    bind("colorG", "colorG");
    bind("colorB", "colorB");
    bind("maxBounces", "maxBounces");
}
