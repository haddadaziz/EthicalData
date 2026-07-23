const { Jimp } = require('jimp');

async function processLogo() {
  try {
    const image = await Jimp.read('apps/frontend/public/ethicaldata_main_logo.png');
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];

      if (alpha > 0) {
        // We want to turn black/dark gray into white, but keep the red accent.
        // A typical red accent has high red, low green/blue.
        // Dark text has low red, low green, low blue.
        
        // If it's a dark color (e.g. RGB all < 100)
        if (red < 100 && green < 100 && blue < 100) {
          // Turn it white, preserving alpha
          this.bitmap.data[idx + 0] = 255;
          this.bitmap.data[idx + 1] = 255;
          this.bitmap.data[idx + 2] = 255;
        }
        // If it's almost black (to catch anti-aliasing pixels), we can use a threshold.
        // Let's use a saturation/lightness approach or simple threshold.
        // If the color is very unsaturated (grey/black) and dark, turn white.
        else if (Math.abs(red - green) < 20 && Math.abs(red - blue) < 20 && Math.abs(green - blue) < 20) {
           // It's a shade of gray
           if (red < 150) { // If it's a dark gray
             this.bitmap.data[idx + 0] = 255;
             this.bitmap.data[idx + 1] = 255;
             this.bitmap.data[idx + 2] = 255;
           }
        }
      }
    });

    await image.write('apps/frontend/public/ethicaldata_white_logo.png');
    console.log("Logo processed successfully!");
  } catch (err) {
    console.error(err);
  }
}

processLogo();
