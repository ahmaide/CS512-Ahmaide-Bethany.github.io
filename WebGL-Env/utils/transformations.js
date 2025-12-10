// Matrix functions
// Perspective matrix
function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}

// Orthographic matrix
function ortho(left, right, bottom, top, near, far) {
    const lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
    return [-2*lr,0,0,0, 0,-2*bt,0,0, 0,0,2*nf,0, (left+right)*lr,(top+bottom)*bt,(far+near)*nf,1];
}

// Identity matrix
function mat4Identity() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function multiplyMat4Vec3(m, v) {
  const w = m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15];
  return [
    (m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12]) / w,
    (m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13]) / w,
    (m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]) / w
  ];
}

function computeNormalMatrix(m) {
  // take upper-left 3x3
  const a = m[0], b = m[1], c = m[2];
  const d = m[4], e = m[5], f = m[6];
  const g = m[8], h = m[9], i = m[10];

  // inverse of 3x3
  const A =  (e*i - f*h);
  const B = -(d*i - f*g);
  const C =  (d*h - e*g);
  const D = -(b*i - c*h);
  const E =  (a*i - c*g);
  const F = -(a*h - b*g);
  const G =  (b*f - c*e);
  const H = -(a*f - c*d);
  const I =  (a*e - b*d);

  const det = a*A + b*B + c*C;
  if (Math.abs(det) < 1e-8) return new Float32Array([1,0,0, 0,1,0, 0,0,1]);

  const invDet = 1.0 / det;


  return new Float32Array([
    A*invDet, D*invDet, G*invDet,
    B*invDet, E*invDet, H*invDet,
    C*invDet, F*invDet, I*invDet
  ]);
}


function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len === 0) return [0, 0, 0];
  return [v[0]/len, v[1]/len, v[2]/len];
}

function cross(a, b) {
  return [
    a[1]*b[2] - a[2]*b[1],
    a[2]*b[0] - a[0]*b[2],
    a[0]*b[1] - a[1]*b[0],
  ];
}

function dot(a, b) {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

function subtract(a, b) {
  return [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2],
  ];
}

// view matrix 
function mat4LookAt(eye, center, up) {
  const f = normalize(subtract(center, eye));
  const s = normalize(cross(f, up));
  const u = cross(s, f);

  return new Float32Array([
    s[0],  u[0], -f[0], 0,
    s[1],  u[1], -f[1], 0,
    s[2],  u[2], -f[2], 0,
    -dot(s, eye), -dot(u, eye), dot(f, eye), 1
  ]);
}


function mat4Scale(matrix, sx, sy, sz) {
  const result = new Float32Array(matrix);

  result[0]  = matrix[0] * sx;
  result[1]  = matrix[1] * sx;
  result[2]  = matrix[2] * sx;
  result[3]  = matrix[3] * sx;

  result[4]  = matrix[4] * sy;
  result[5]  = matrix[5] * sy;
  result[6]  = matrix[6] * sy;
  result[7]  = matrix[7] * sy;

  result[8]  = matrix[8] * sz;
  result[9]  = matrix[9] * sz;
  result[10] = matrix[10] * sz;
  result[11] = matrix[11] * sz;

  return result;
}

// Matrix translation
function mat4Translate(matrix, tx, ty, tz) {
    const result = new Float32Array(matrix);
    result[12] = matrix[0] * tx + matrix[4] * ty + matrix[8] * tz + matrix[12];
    result[13] = matrix[1] * tx + matrix[5] * ty + matrix[9] * tz + matrix[13];
    result[14] = matrix[2] * tx + matrix[6] * ty + matrix[10] * tz + matrix[14];
    result[15] = matrix[3] * tx + matrix[7] * ty + matrix[11] * tz + matrix[15];
    return result;
}

// Matrix rotation around X axis
function mat4RotateX(matrix, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const result = new Float32Array(matrix);

    const mv1 = matrix[4], mv5 = matrix[5], mv9 = matrix[6], mv13 = matrix[7];
    const mv2 = matrix[8], mv6 = matrix[9], mv10 = matrix[10], mv14 = matrix[11];

    result[4] = mv1 * c + mv2 * s;
    result[5] = mv5 * c + mv6 * s;
    result[6] = mv9 * c + mv10 * s;
    result[7] = mv13 * c + mv14 * s;
    result[8] = mv2 * c - mv1 * s;
    result[9] = mv6 * c - mv5 * s;
    result[10] = mv10 * c - mv9 * s;
    result[11] = mv14 * c - mv13 * s;

    return result;
}

// Matrix rotation around Y axis
function mat4RotateY(matrix, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const result = new Float32Array(matrix);

    const mv0 = matrix[0], mv4 = matrix[1], mv8 = matrix[2], mv12 = matrix[3];
    const mv2 = matrix[8], mv6 = matrix[9], mv10 = matrix[10], mv14 = matrix[11];

    result[0] = mv0 * c - mv2 * s;
    result[1] = mv4 * c - mv6 * s;
    result[2] = mv8 * c - mv10 * s;
    result[3] = mv12 * c - mv14 * s;
    result[8] = mv0 * s + mv2 * c;
    result[9] = mv4 * s + mv6 * c;
    result[10] = mv8 * s + mv10 * c;
    result[11] = mv12 * s + mv14 * c;


    return result;
}

// Matrix rotation around Z axis
function mat4RotateZ(matrix, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const result = new Float32Array(matrix);

        const mv0 = matrix[0], mv4 = matrix[4], mv8 = matrix[8], mv12 = matrix[12];
        const mv1 = matrix[1], mv5 = matrix[5], mv9 = matrix[9], mv13 = matrix[13];

        result[0] = mv0 * c + mv1 * s;
        result[1] = mv0 * -s + mv1 * c;
        result[4] = mv4 * c + mv5 * s;
        result[5] = mv4 * -s + mv5 * c;
        result[8] = mv8 * c + mv9 * s;
        result[9] = mv8 * -s + mv9 * c;
        result[12] = mv12 * c + mv13 * s;
        result[13] = mv12 * -s + mv13 * c;

        return result;
    }

// Matrix multiplication
function multiplyMat4(a, b) {
    let r = new Float32Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
            sum += a[k * 4 + i] * b[j * 4 + k]; 
        }
        r[j * 4 + i] = sum;
    }
    return r;
}

function multiplyMat4Vec4(m, v) {
  return [
    m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
    m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
    m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]
  ];
}
