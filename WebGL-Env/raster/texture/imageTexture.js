function createImageTexture(gl, url) {
  const textureObj = {
    object: gl.createTexture(),
    loaded: false,
    update: () => {}
  };

  gl.bindTexture(gl.TEXTURE_2D, textureObj.object);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 255, 255])
  );

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;

  img.onload = () => {
    console.log(`Image loaded: ${url} (${img.width}x${img.height})`);

    gl.bindTexture(gl.TEXTURE_2D, textureObj.object);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
      console.log(`Generating mipmaps for ${url}`);
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      console.log(`Non-power-of-two texture: ${url}`);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    textureObj.loaded = true;
    console.log(`Texture ready for use:`, textureObj.object);
  };

  img.onerror = () => {
    console.error(`Failed to load texture: ${url}`);
  };

  return textureObj;
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}
