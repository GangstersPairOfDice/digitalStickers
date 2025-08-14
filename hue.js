let hue = 0;
const img = document.getElementById("sticker");

function updateHue() {
  hue = (hue + 1) % 360; // step hue each frame
    img.style.filter = `hue-rotate(${hue}deg)`;
      requestAnimationFrame(updateHue);
      }

      updateHue();

