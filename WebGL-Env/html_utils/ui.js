// FIX ME: need to modify transform in primitives
canvas.addEventListener('mousedown', e => { 
  mouseDown = true; 
  lastX = e.clientX; 
  lastY = e.clientY; 
});

canvas.addEventListener('mouseup',  e => { 
  mouseDown = false; 
  cubeRotX = 0; 
  cubeRotY = 0; 
});

canvas.addEventListener('mousemove', e => {
  if (!mouseDown) return;
  let dx = e.clientX - lastX;
  let dy = e.clientY - lastY;
  cubeRotY += dx * 1e-4;
  cubeRotX += dy * 1e-4;
  lastX = e.clientX; lastY = e.clientY;

  if (selected) {
    selected.transform = mat4RotateY(selected.transform, cubeRotY);
    selected.transform = mat4RotateX(selected.transform, cubeRotX);
  }

});


document.addEventListener('keydown', e => {
  const step = 0.05;      
  const scaleStep = 0.05;
  let translation = [1, 1, 1];
  let scale = [1, 1, 1];

  if (!selected) return; 

  switch (e.key) {
    // case 'ArrowUp':    camY -= step; break;
    // case 'ArrowDown':  camY += step; break;
    // case 'ArrowLeft':  camX += step; break;
    // case 'ArrowRight': camX -= step; break;
    // case 'w': camZ += step; break;       // zoom in
    // case 's': camZ -= step; break;       // zoom out

    // translate
    case 'W':
    case 'w':
      translation = [0, step, 0];
      selected.transform = mat4Translate(selected.transform, translation);
      console.log(selected.transform);
      break;
    case 'S':
    case 's':
      translation = [0, -step, 0];
      selected.transform = mat4Translate(selected.transform, translation);
      break;
    case 'A':
    case 'a':
      translation = [-step, 0, 0];
      selected.transform = mat4Translate(selected.transform, translation);
      break;
    case 'D':
    case 'd':
      translation = [step, 0, 0];
      selected.transform = mat4Translate(selected.transform, translation);
      break;

    case '+':
    case '=': 
      scale = [1+scaleStep, 1+scaleStep, 1];
      selected.transform = mat4Scale(selected.transform, scale);
      break;
    case '-':
    case '_': 
      scale = [1-scaleStep, 1-scaleStep, 1];
      selected.transform = mat4Scale(selected.transform, scale);
      break;
  }

});

// Listener for selecting geometry
document.getElementById("Geometry").addEventListener("change", (e) => {
  selectedGeometry = e.target.value;
});


// listener for RGB sliders


// listener for adding to canvas
function highlightSelected(activeLi) {
  document.querySelectorAll("#primitiveList li").forEach(li => li.classList.remove("selected"));
  activeLi.classList.add("selected");
}


document.getElementById("add").addEventListener("click", () => {
  let r = document.getElementById("rSlider").value / 255;
  let g = document.getElementById("gSlider").value / 255;
  let b = document.getElementById("bSlider").value / 255;

  let newObj;
  let color = [r,g,b];

  if (selectedGeometry === "cube") {
    newObj = makeCube(color);
  } else if (selectedGeometry === "sphere") {
    newObj = makeSphere(color, 100);  
  } else if (selectedGeometry == "cylinder"){
    newObj = makeCylinder(color, 100);
  }

  primitives.push(newObj);
  selected = newObj;

  const list = document.getElementById("primitiveList");
  const li = document.createElement("li");
  li.textContent = `${newObj.type} ${primitives.length}`;
  li.className = "list-item";
  li.addEventListener("click", () => {
    selected = newObj;
    highlightSelected(li);
  });
  list.appendChild(li);

  highlightSelected(li);
});

// listener for reset button
document.getElementById("resetBtn").addEventListener("click", () => {
  if (selected) {
    selected.transform = mat4Identity();    
    selected.color = [1.0, 1.0, 1.0];      
    document.getElementById("rSlider").value = 255;
    document.getElementById("gSlider").value = 255;
    document.getElementById("bSlider").value = 255;
  }
});


// listener for reset all button
document.getElementById("resetAllBtn").addEventListener("click", () => {
  const list = document.getElementById("primitiveList");
  list.innerHTML = "";

  primitives = [];
  selected = null;
});

//listener for delete button
document.getElementById("delete").addEventListener("click", () => {
  if (!selected) return;

  const index = primitives.indexOf(selected);
  if (index > -1) primitives.splice(index, 1);

  const listItems = document.querySelectorAll("#primitiveList li");
  listItems[index]?.remove();

  selected = null;
});
