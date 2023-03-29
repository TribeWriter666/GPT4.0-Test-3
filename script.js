const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// Define the PerlinNoise class inline
class PerlinNoise {
  constructor(octaves = 1, falloff = 0.5, amplitude = 1, persistence = 2) {
    this.octaves = octaves;
    this.falloff = falloff;
    this.amplitude = amplitude;
    this.persistence = persistence;
    this.p = new Uint8Array(512);
    for (let i = 0; i < 256; i++) {
      this.p[i] = this.p[i + 256] = Math.floor(Math.random() * 256);
    }
  }

  noise(x, y = 0, z = 0) {
    let noiseValue = 0;
    let frequency = 1;
    let amplitude = 1;
    for (let octave = 0; octave < this.octaves; octave++) {
      const sampleX = x * frequency;
      const sampleY = y * frequency;
      const sampleZ = z * frequency;
      const perlinValue = this.perlin(sampleX, sampleY, sampleZ);
      noiseValue += perlinValue * amplitude;
      frequency *= this.persistence;
      amplitude *= this.falloff;
    }
    return noiseValue;
  }

  perlin(x, y, z) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const zi = Math.floor(z) & 255;
    if (typeof this.p[xi] === 'undefined' || typeof this.p[yi] === 'undefined' || typeof this.p[zi] === 'undefined') {
      console.log('Error: index out of range: x=' + xi + ', y=' + yi + ', z=' + zi);
    }
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);
    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);
    const aaa = this.p[this.p[this.p[xi] + yi] + zi];
    const aba = this.p[this.p[this.p[xi] + this.inc(yi)] + zi];
    const aab = this.p[this.p[this.p[xi] + yi] + this.inc(zi)];
    const abb = this.p[this.p[this.p[xi] + this.inc(yi)] + this.inc(zi)];
    const baa = this.p[this.p[this.p[this.inc(xi)] + yi] + zi];
    const bba = this.p[this.p[this.p[this.inc(xi)] + this.inc(yi)] + zi];
    const bab = this.p[this.p[this.p[this.inc(xi)] + yi] + this.inc(zi)];
    const bbb = this.p[this.p[this.p[this.inc(xi)] + this.inc(yi)] + this.inc(zi)];
    const x1 = this.lerp(this.grad(aaa, xf, yf, zf), this.grad(baa, xf - 1, yf, zf), u);
    const x2 = this.lerp(this.grad(aba, xf, yf - 1, zf), this.grad(bba, xf - 1, yf - 1, zf), u);
    const y1 = this.lerp(x1, x2, v);
    const x3 = this.lerp(this.grad(aab, xf, yf, zf - 1), this.grad(bab, xf - 1, yf, zf - 1), u);
    const x4 = this.lerp(this.grad(abb, xf - 1, yf - 1, zf - 1), this.grad(bbb, xf - 1, yf - 1, zf - 1), u);
    const y2 = this.lerp(x3, x4, v);
    const z1 = this.lerp(y1, y2, w);
    return z1;
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return (1 - t) * a + t * b;
  }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  inc(num) {
    num++;
    return this.wrap(num);
  }

  wrap(num) {
    return num & 255;
  }
}

let time = 0;
let noise = new PerlinNoise(2, 0.5, 1, 2);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = 100;

  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const nx = x / scale;
      const ny = y / scale;
      const noiseValue = noise.noise(nx, ny, time);
      const distortionX = x + noiseValue * scale;
      const distortionY = y + noiseValue * scale;
      const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
      ctx.fillStyle = color;
      ctx.fillRect(distortionX, distortionY, 1, 1);
    }
  }

  time += 0.01;

  requestAnimationFrame(draw);
}

draw();
