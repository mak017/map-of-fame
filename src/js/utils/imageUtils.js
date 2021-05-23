/* eslint-disable no-bitwise */
// // From https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob, needed for Safari:
// if (!HTMLCanvasElement.prototype.toBlob) {
//   Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
//       value: function(callback, type, quality) {

//           var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
//               len = binStr.length,
//               arr = new Uint8Array(len);

//           for (var i = 0; i < len; i++) {
//               arr[i] = binStr.charCodeAt(i);
//           }

//           callback(new Blob([arr], {type: type || 'image/png'}));
//       }
//   });
// }

// window.URL = window.URL || window.webkitURL;

// Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
// -2 = not jpeg, -1 = no data, 1..8 = orientations
function getExifOrientation(file, callback) {
  // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
  // let fileCopy = {...file}
  // if (fileCopy.slice) {
  const fileCopy = file.slice(0, 131072);
  // }

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
function imgToCanvasWithOrientation(img, rawWidth, rawHeight, orientation) {
  const canvas = document.createElement("canvas");
  if (orientation > 4) {
    canvas.width = rawHeight;
    canvas.height = rawWidth;
  } else {
    canvas.width = rawWidth;
    canvas.height = rawHeight;
  }

  if (orientation > 1) {
    console.log("EXIF orientation = " + orientation + ", rotating picture");
  }

  const ctx = canvas.getContext("2d");
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, rawWidth, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, rawHeight);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, rawHeight, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, rawHeight, rawWidth);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, rawWidth);
      break;
    default:
    // intentionally empty
  }
  ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
  return canvas;
}

export function reduceFileSize(
  file,
  acceptFileSize,
  maxWidth,
  maxHeight,
  quality,
  callback
) {
  if (file.size <= acceptFileSize) {
    callback(file);
    return;
  }
  const img = new Image();
  img.onerror = function () {
    URL.revokeObjectURL(this.src);
    callback(file);
  };
  img.onload = function () {
    URL.revokeObjectURL(this.src);
    getExifOrientation(file, function (orientation) {
      let w = img.width;
      let h = img.height;
      const scale =
        orientation > 4
          ? Math.min(maxHeight / w, maxWidth / h, 1)
          : Math.min(maxWidth / w, maxHeight / h, 1);
      h = Math.round(h * scale);
      w = Math.round(w * scale);

      const canvas = imgToCanvasWithOrientation(img, w, h, orientation);
      canvas.toBlob(
        function (blob) {
          console.log(
            "Resized image to " + w + "x" + h + ", " + (blob.size >> 10) + "kB"
          );
          callback(blob);
        },
        "image/jpeg",
        quality
      );
    });
  };
  img.src = URL.createObjectURL(file);
}
