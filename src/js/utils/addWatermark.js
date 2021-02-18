const roundRect = (
  ctx,
  x,
  y,
  width,
  height,
  radius = 5,
  fill,
  stroke = true
) => {
  let radiusToApply = radius;
  if (typeof radius === "number") {
    radiusToApply = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    Object.keys(defaultRadius).forEach((key) => {
      radiusToApply[key] = radiusToApply[key] || defaultRadius[key];
    });
  }
  ctx.beginPath();
  ctx.moveTo(x + radiusToApply.tl, y);
  ctx.lineTo(x + width - radiusToApply.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radiusToApply.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radiusToApply.br,
    y + height
  );
  ctx.lineTo(x + radiusToApply.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radiusToApply.bl);
  ctx.lineTo(x, y + radiusToApply.tl);
  ctx.quadraticCurveTo(x, y, x + radiusToApply.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
};

export const addWatermark = (img, logo, user) => {
  const ctx = img.getContext("2d");
  const siteName = "MOFF.ORG";
  const text = `${siteName}    ${user.toUpperCase()}`;
  const fontSize = img.height / 29.94;
  ctx.font = `900 ${fontSize}px Montserrat`;
  const metrics = ctx.measureText(text);
  const siteNameMetrics = ctx.measureText(siteName);
  const squareMetrics = ctx.measureText("  ");
  const x = img.width - 13;
  const y = img.height;
  ctx.drawImage(
    logo,
    x - metrics.actualBoundingBoxAscent,
    y - metrics.actualBoundingBoxRight,
    metrics.actualBoundingBoxAscent,
    metrics.actualBoundingBoxAscent * 1.74
  );

  ctx.translate(x, y);
  ctx.globalAlpha = 0.7;
  ctx.rotate((-90 * Math.PI) / 180);
  ctx.fillStyle = "#373737";
  roundRect(
    ctx,
    0,
    -metrics.fontBoundingBoxAscent,
    metrics.actualBoundingBoxRight + metrics.actualBoundingBoxAscent * 2.75,
    metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxAscent * 0.2,
    { tr: 2, br: 2 },
    true,
    false
  );
  ctx.fillStyle = "#fff";
  ctx.fillText(text, 4, 0);
  ctx.fillRect(
    siteNameMetrics.actualBoundingBoxRight + squareMetrics.width * 0.9,
    -siteNameMetrics.actualBoundingBoxAscent,
    squareMetrics.width * 0.8,
    siteNameMetrics.actualBoundingBoxAscent
  );
  ctx.rotate((90 * Math.PI) / 180);
  ctx.drawImage(
    logo,
    -metrics.actualBoundingBoxAscent,
    -metrics.actualBoundingBoxRight - metrics.actualBoundingBoxAscent * 2.5,
    metrics.actualBoundingBoxAscent,
    metrics.actualBoundingBoxAscent * 1.74
  );
  return img;
};
