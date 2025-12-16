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
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", e => {
                params[key] = parseFloat(e.target.value);
            });
        }
    };

    // Only bind the sliders that still exist
    bind("lightIntensity", "lightIntensity");
    bind("ambientStrength", "ambientStrength");
    bind("maxBounces", "maxBounces");
}