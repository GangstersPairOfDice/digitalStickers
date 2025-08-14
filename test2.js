const img = document.getElementById("sticker");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

img.style.visibility = "hidden"; // hide original but keep layout

// Insert canvas after image so it overlays in same spot
img.parentNode.insertBefore(canvas, img.nextSibling);

function updateCanvasSize() {
  const rect = img.getBoundingClientRect();
  canvas.style.position = "absolute";
  canvas.style.left = rect.left + window.scrollX + "px";
  canvas.style.top = rect.top + window.scrollY + "px";
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";
  canvas.style.pointerEvents = "none"; // allow clicks through canvas
  canvas.style.zIndex = 9999;
}

// RGB to HSL conversion
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

// HSL to RGB conversion
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

function isInsideImage(x, y, imageData) {
  const i = (Math.floor(y) * imageData.width + Math.floor(x)) * 4 + 3; // alpha channel index
  return imageData.data[i] > 0;
}

function drawSparkles(ctx, imageData, frame) {
  const sparkleCount = 30;
  for (let i = 0; i < sparkleCount; i++) {
    const x = (Math.sin(frame * 0.1 + i) * 0.5 + 0.5) * imageData.width;
    const y = (Math.cos(frame * 0.15 + i * 1.3) * 0.5 + 0.5) * imageData.height;

    if (!isInsideImage(x, y, imageData)) continue;

    const size = 1 + Math.sin(frame * 0.2 + i) * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${
      0.7 + 0.3 * Math.sin(frame * 0.3 + i * 1.5)
    })`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawScanlines(ctx, imageData) {
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;

  for (let y = 0; y < imageData.height; y += 4) {
    ctx.beginPath();
    let drawing = false;
    for (let x = 0; x < imageData.width; x++) {
      const alpha = imageData.data[(y * imageData.width + x) * 4 + 3];
      if (alpha > 0) {
        if (!drawing) {
          ctx.moveTo(x, y);
          drawing = true;
        }
      } else {
        if (drawing) {
          ctx.lineTo(x, y);
          ctx.stroke();
          drawing = false;
        }
      }
    }
    if (drawing) {
      ctx.lineTo(imageData.width, y);
      ctx.stroke();
    }
  }
}

function drawNoise(ctx, width, height, frame) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const rand = (Math.random() - 0.5) * 20; // small noise range
    data[i] = Math.min(255, Math.max(0, data[i] + rand));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + rand));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + rand));
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawGlitter(ctx, imageData, frame) {
  const glitterCount = 50;
  for (let i = 0; i < glitterCount; i++) {
    const x = Math.random() * imageData.width;
    const y = Math.random() * imageData.height;
    if (!isInsideImage(x, y, imageData)) continue;
    const alpha = 0.5 + 0.5 * Math.sin(frame * 0.3 + i);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

function applyWaveDistortion(imageData, frame) {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const dst = new Uint8ClampedArray(src.length);
  const amplitude = 5; // pixels
  const wavelength = 50; // pixels

  for (let y = 0; y < height; y++) {
    const offsetX = Math.floor(
      amplitude * Math.sin((2 * Math.PI * y) / wavelength + frame * 0.05)
    );
    for (let x = 0; x < width; x++) {
      const srcX = Math.min(width - 1, Math.max(0, x + offsetX));
      const srcIndex = (y * width + srcX) * 4;
      const dstIndex = (y * width + x) * 4;
      dst[dstIndex] = src[srcIndex];
      dst[dstIndex + 1] = src[srcIndex + 1];
      dst[dstIndex + 2] = src[srcIndex + 2];
      dst[dstIndex + 3] = src[srcIndex + 3];
    }
  }

  // Copy distorted data back
  imageData.data.set(dst);
}

function applyColorPulse(imageData, frame) {
  const data = imageData.data;
  const pulse = 0.3 + 0.7 * (Math.sin(frame * 0.05) * 0.5 + 0.5); // 0.3 to 1 saturation pulse

  for (let i = 0; i < data.length; i += 4) {
    // Convert RGB to HSL
    let [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    s *= pulse; // modulate saturation
    s = Math.min(1, Math.max(0, s));
    // Back to RGB
    let [r, g, b] = hslToRgb(h, s, l);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    // alpha unchanged
  }
}

function drawColorBars(ctx, imageData, frame) {
  const barWidth = 5;
  for (let x = 0; x < imageData.width; x += barWidth) {
    const hue = (x / imageData.width + frame * 0.005) % 1;
    ctx.fillStyle = `hsla(${hue * 360}, 70%, 60%, 0.1)`;

    // Draw only if at least one pixel underneath has alpha > 0
    let alphaSum = 0;
    for (let y = 0; y < imageData.height; y++) {
      alphaSum += imageData.data[(y * imageData.width + x) * 4 + 3];
      if (alphaSum > 0) {
        ctx.fillRect(x, 0, barWidth, imageData.height);
        break;
      }
    }
  }
}

let frame = 0;

function animate() {
  updateCanvasSize();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    img,
    0,
    0,
    img.naturalWidth,
    img.naturalHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Add a bright highlight stripe that moves top to bottom:
  const highlightY = (frame * 0.5) % canvas.height; // fast vertical position

  for (let y = 0; y < canvas.height; y++) {
    // Stronger shimmer wave vertically
    const shimmer =
      0.6 * Math.sin(frame * 0.01 + (y / canvas.height) * Math.PI * 10);

    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      let [h, s, l] = rgbToHsl(r, g, b);

      // Horizontal hue wave (rainbow shimmer)
      const waves = 0.25; // e.g. N = 1 for one wave, 5 for five waves
      const wave_speed = 0.005; // how fast the hue wave scrolls the image
      const hueWave =
        0.5 *
        Math.sin((x / canvas.width) * 2 * Math.PI * waves + frame * wave_speed);

      h = (h + hueWave + 1) % 1;

      // Lightness shimmer
      l += shimmer * 0.3;

      // Add a bright moving highlight stripe (like a gloss reflection)
      const dist = Math.abs(y - highlightY);
      if (dist < 10) {
        // Strong boost in lightness near highlight stripe
        l += (10 - dist) * 0.025;
      }

      // Clamp lightness to [0,1]
      l = Math.min(1, Math.max(0, l));

      const [nr, ng, nb] = hslToRgb(h, s, l);

      data[i] = nr;
      data[i + 1] = ng;
      data[i + 2] = nb;
      // alpha unchanged
    }
  }

  // 1. Apply wave distortion before putting image back (modifies pixels)
  //applyWaveDistortion(imageData, frame);

  // 2. Apply color pulsing effect
  applyColorPulse(imageData, frame);

  ctx.putImageData(imageData, 0, 0);

  //drawShimmer(ctx, canvas.width, canvas.height, frame);

  drawSparkles(ctx, imageData, frame);
  drawScanlines(ctx, imageData);
  drawNoise(ctx, canvas.width, canvas.height, frame);

  // 7. Draw vertical color bars overlay
  // drawColorBars(ctx, imageData, frame);

  frame++;
  requestAnimationFrame(animate);
}

img.onload = () => {
  animate();
};

window.addEventListener("resize", () => {
  updateCanvasSize();
});
