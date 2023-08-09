/* eslint-disable no-bitwise */

// Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
// -2 = not jpeg, -1 = no data, 1..8 = orientations
function getExifOrientation(file, callback) {
  // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
  const fileCopy = file.slice(0, 131072);

  const reader = new FileReader();
  reader.onload = (e) => {
    const view = new DataView(e.target.result);
    if (view.getUint16(0, false) !== 0xffd8) {
      callback(-2);
      return;
    }
    const length = view.byteLength;
    let offset = 2;
    while (offset < length) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffe1) {
        offset += 2;
        if (view.getUint32(offset, false) !== 0x45786966) {
          callback(-1);
          return;
        }
        const little = view.getUint16((offset += 6), false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        const tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i += 1)
          if (view.getUint16(offset + i * 12, little) === 0x0112) {
            callback(view.getUint16(offset + i * 12 + 8, little));
            return;
          }
      } else if ((marker & 0xff00) !== 0xff00) break;
      else offset += view.getUint16(offset, false);
    }
    callback(-1);
  };
  reader.readAsArrayBuffer(fileCopy);
}

// Derived from https://stackoverflow.com/a/40867559, cc by-sa
function imgToCanvas(img, rawWidth, rawHeight) {
  const canvas = document.createElement("canvas");
  canvas.width = rawWidth;
  canvas.height = rawHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
  return canvas;
}

export const processImage = (
  file,
  acceptFileSize,
  maxWidth,
  maxHeight,
  quality,
  isRecursive,
  callback
) => {
  if (file.size <= acceptFileSize) {
    callback(file);
    return;
  }
  const img = new Image();
  function onImgError() {
    URL.revokeObjectURL(this.src);
    callback(file);
  }
  function onImgLoad() {
    URL.revokeObjectURL(this.src);
    getExifOrientation(file, (orientation) => {
      let w = img.width;
      let h = img.height;
      const scale =
        orientation > 4
          ? Math.min(maxHeight / w, maxWidth / h, 1)
          : Math.min(maxWidth / w, maxHeight / h, 1);
      h = Math.round(h * scale);
      w = Math.round(w * scale);

      const canvas = imgToCanvas(img, w, h, orientation);

      canvas.toBlob(
        (blob) => {
          console.debug(`Resized image to ${w}x${h}, ${blob.size >> 10}kB`);

          if (isRecursive && file.size > acceptFileSize) {
            processImage(
              new File([blob], "image.jpg"),
              acceptFileSize,
              Math.round(w * 0.85),
              Math.round(h * 0.85),
              quality,
              isRecursive,
              callback
            );
          }

          callback(blob);
        },
        "image/jpeg",
        quality
      );
    });
  }
  img.onerror = onImgError;
  img.onload = onImgLoad;
  img.src = URL.createObjectURL(file);
};
