/* eslint-disable no-multi-assign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
import L from 'leaflet';
/*
 * L.TileLayer.Grayscale is a regular tilelayer with grayscale makeover.
 */

L.TileLayer.Grayscale = L.TileLayer.extend({
  options: {
    quotaRed: 21,
    quotaGreen: 71,
    quotaBlue: 8,
    quotaDividerTune: 0,
    quotaDivider: function () {
      return this.quotaRed + this.quotaGreen + this.quotaBlue + this.quotaDividerTune;
    },
  },

  initialize: function (url, options) {
    options = options || {};
    options.crossOrigin = true;
    L.TileLayer.prototype.initialize.call(this, url, options);

    this.on('tileload', function (e) {
      this._makeGrayscale(e.tile);
    });
  },

  _createTile: function () {
    let tile = L.TileLayer.prototype._createTile.call(this);
    tile.crossOrigin = 'Anonymous';
    return tile;
  },

  _makeGrayscale: function (img) {
    if (img.getAttribute('data-grayscaled')) {
      return;
    }

    img.crossOrigin = '';
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    let imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pix = imgd.data;
    for (let i = 0, n = pix.length; i < n; i += 4) {
      pix[i] = pix[i + 1] = pix[i + 2] =
        (this.options.quotaRed * pix[i] +
          this.options.quotaGreen * pix[i + 1] +
          this.options.quotaBlue * pix[i + 2]) /
        this.options.quotaDivider();
    }
    ctx.putImageData(imgd, 0, 0);
    img.setAttribute('data-grayscaled', true);
    img.src = canvas.toDataURL();
  },
});

export const grayScaleTileLayer = (url, options) => new L.TileLayer.Grayscale(url, options);
