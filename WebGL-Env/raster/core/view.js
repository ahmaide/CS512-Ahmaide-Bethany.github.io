class View {
  constructor(fov = Math.PI / 4, aspect = 1, near = 0.1, far = 100) {
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.position =  [2, 2, 16];
    this.target = [0, 0,0];
    this.up = [0, 1, 0];

    this.radius = 16;
    this.angleX = 0; 
    this.angleY = 0.5 * Math.PI;

    console.log('Initial camera position:', this.position);
    
        this.updateMatrices();

  }

  updateMatrices() {
  this.projMatrix = perspective(this.fov, this.aspect, this.near, this.far);
  this.viewMatrix = mat4LookAt(this.position, this.target, this.up);
  }

  rotateCamera(deltaX, deltaY) {
    this.angleX += deltaX;
    this.angleY += deltaY;
    
    this.angleY = Math.max(0.1, Math.min(Math.PI - 0.1, this.angleY));
    
    this.position[0] = this.target[0] + this.radius * Math.sin(this.angleY) * Math.sin(this.angleX);
    this.position[1] = this.target[1] + this.radius * Math.cos(this.angleY);
    this.position[2] = this.target[2] + this.radius * Math.sin(this.angleY) * Math.cos(this.angleX);
    
    this.updateMatrices();
  }
}

