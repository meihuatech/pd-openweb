import QRCode from '@mdfe/qrcode-base';

export const QRErrorCorrectLevel = {
  L: 1, // 7%
  M: 0, // 15%
  Q: 3, // 25%
  H: 2, // 30%
};

const defaultOptions = {
  gap: 0,
  render: 'canvas',
  width: 256,
  height: 256,
  typeNumber: -1,
  correctLevel: QRErrorCorrectLevel.M,
  background: '#ffffff',
  foreground: '#000000',
};

const genQrDataurl = function (options) {
  options = Object.assign({}, defaultOptions, options);
  const qrcode = new QRCode(options.typeNumber, options.correctLevel);
  qrcode.addData(options.value);
  qrcode.make();

  // create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // compute tileW/tileH based on options.width/options.height
  const tileW = (options.width - options.gap * 2) / qrcode.getModuleCount();
  const tileH = (options.height - options.gap * 2) / qrcode.getModuleCount();

  // draw in the canvas
  for (let row = 0; row < qrcode.getModuleCount(); row++) {
    for (let col = 0; col < qrcode.getModuleCount(); col++) {
      ctx.fillStyle = qrcode.isDark(row, col) ? options.foreground : options.background;
      const w = Math.ceil((col + 1) * tileW) - Math.floor(col * tileW);
      const h = Math.ceil((row + 1) * tileH) - Math.floor(row * tileH);
      ctx.fillRect(Math.round(col * tileW) + options.gap, Math.round(row * tileH) + options.gap, w, h);
    }
  }
  // return just built canvas
  return canvas.toDataURL();
};

export default genQrDataurl;
