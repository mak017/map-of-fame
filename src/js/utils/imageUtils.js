/* eslint-disable no-bitwise */

function processExifOrientation(file, callback) {
  const fileCopy = file.slice(0, 131072);

  const reader = new FileReader();
  reader.onload = (e) => {
    const view = new DataView(e.target.result);
    let originalOrientation = 1;
    if (view.getUint16(0, false) !== 0xffd8) {
      callback(file, originalOrientation);
      return;
    }

    const length = view.byteLength;
    let offset = 2;
    const newFileData = new Uint8Array(length);
    newFileData.set(new Uint8Array(view.buffer.slice(0, offset)));

    while (offset < length) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xffe1) {
        offset += 2;
        if (view.getUint32(offset, false) !== 0x45786966) {
          callback(file, originalOrientation);
          return;
        }

        const little = view.getUint16((offset += 6), false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        const tags = view.getUint16(offset, little);
        offset += 2;

        let foundOrientation = false;
        for (let i = 0; i < tags; i += 1) {
          if (view.getUint16(offset + i * 12, little) === 0x0112) {
            originalOrientation = view.getUint16(offset + i * 12 + 8, little);
            if (originalOrientation > 1) {
              newFileData[offset + i * 12 + 8] = 1 & 0xff;
              newFileData[offset + i * 12 + 9] = (1 >> 8) & 0xff;
            }
            foundOrientation = true;
            break;
          }
        }

        if (!foundOrientation) {
          callback(file, originalOrientation);
          return;
        }
      } else if ((marker & 0xff00) !== 0xff00) {
        break;
      } else {
        const segmentLength = view.getUint16(offset, false);
        newFileData.set(
          new Uint8Array(view.buffer.slice(offset - 2, offset + segmentLength))
        );
        offset += segmentLength;
      }
    }

    const newBlob = new Blob([newFileData], { type: file.type });
    callback(newBlob, originalOrientation);
  };

  reader.readAsArrayBuffer(fileCopy);
}

// Derived from https://stackoverflow.com/a/40867559, cc by-sa
function imgToCanvasWithOrientation(img, rawWidth, rawHeight, orientation) {
  const canvas = document.createElement("canvas");
  canvas.width = rawWidth;
  canvas.height = rawHeight;

  if (orientation > 1) {
    console.debug(`EXIF orientation = ${orientation}, rotating picture`);
  }

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
    processExifOrientation(file, (fileWithExif, orientation) => {
      let w = img.width;
      let h = img.height;
      const scale =
        orientation > 4
          ? Math.min(maxHeight / w, maxWidth / h, 1)
          : Math.min(maxWidth / w, maxHeight / h, 1);
      h = Math.round(h * scale);
      w = Math.round(w * scale);
      const canvas = imgToCanvasWithOrientation(img, w, h, orientation);
      const isRotated = orientation > 1;

      canvas.toBlob(
        (blob) => {
          console.debug(`Resized image to ${w}x${h}, ${blob.size >> 10}kB`);

          if (isRecursive && fileWithExif.size > acceptFileSize) {
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

          callback(blob, isRotated);
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
