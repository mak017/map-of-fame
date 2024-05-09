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

export const addWatermark = (img, user) => {
  // Scaling coefficient that takes into account image width and height, where 938 and 539 are the width and height respectively of mockup img
  // basePx param is just a representation of sizes according to mockup image
  const getScaledSize = (basePx) =>
    (img.width + img.height) / ((938 + 539) / basePx);

  const ctx = img.getContext("2d");
  const siteName = window.location.hostname.replace("www.", "").toUpperCase();
  const username = user.toUpperCase();
  ctx.font = `800 ${getScaledSize(30)}px Montserrat`;
  const metrics1 = ctx.measureText(siteName);
  ctx.font = `800 ${getScaledSize(18)}px Montserrat`;
  const metrics2 = ctx.measureText(username);
  const textHeight =
    (metrics1.actualBoundingBoxAscent + metrics2.actualBoundingBoxAscent) *
    1.35;
  const textWidth = Math.max(metrics1.width, metrics2.width) * 0.64;
  const x = img.width - getScaledSize(36);
  const y = img.height;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-90 * Math.PI) / 180);
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#000";
  roundRect(
    ctx,
    0,
    -textHeight - textHeight * 0.4,
    textWidth,
    textHeight + textHeight * 0.4,
    { tr: 2, br: 2 },
    true,
    false
  );
  ctx.translate(getScaledSize(16), -textHeight + textHeight * 0.2);
  ctx.font = `800 ${getScaledSize(14)}px Montserrat`;
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.5;
  ctx.fillText(siteName, 4, 0);
  ctx.font = `400 ${getScaledSize(8)}px Montserrat`;
  ctx.translate(0, metrics1.actualBoundingBoxAscent * 0.67);
  ctx.fillText(username, 4, 0);
  ctx.restore();

  return img;
};
