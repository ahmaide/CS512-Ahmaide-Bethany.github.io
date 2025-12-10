class World {
    constructor(gl) {
        this.gl = gl;
        this.elements = [];
        this.backgroundColor = [1.0, 0.0, 0.0, 1.0];
    }

add(element) {
    this.elements.push(element);
}

remove(element) {
    this.elements = this.elements.filter(e => e !== element);

}

// should this go here?
setBackgroundColor(color) {
    this.backgroundColor = color;
    this.gl.clearColor(...color);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}

getElementByName(name) {
    const searchElements = (elements) => {
        for (let elem of elements) {
            console.log(elem);
            if (elem.name === name) {
                return elem;
            }
            if (elem.children) {
                const found = searchElements(elem.children);
                if (found) return found;
            }
        }
        return null;
    };
    return searchElements(this.elements);
}

getElementByRule(ruleFn) {
  const results = [];

  const searchElements = (elements) => {
    for (let elem of elements) {
      if (ruleFn(elem)) {
        results.push(elem);
      }
      if (elem.children && elem.children.length > 0) {
        searchElements(elem.children);
      }
    }
  };

  searchElements(this.elements);
  return results;
}



}