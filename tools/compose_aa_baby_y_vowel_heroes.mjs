import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputSize = 1254;

const jobs = [
  {
    toolSource: "야야 두 나뭇가지.png",
    output: "public/아아 아기 야 시안.png",
    accent: [248, 151, 31, 255],
    toolCrop: { x: 270, y: 58, width: 630, height: 1090 },
    toolHeight: 815,
    toolX: 720,
    toolY: 220,
  },
  {
    toolSource: "여여 두 풍선.png",
    output: "public/아아 아기 여 시안.png",
    accent: [88, 163, 241, 255],
    toolCrop: { x: 245, y: 58, width: 665, height: 1110 },
    toolHeight: 815,
    toolX: 705,
    toolY: 210,
  },
];

const babySource = "public/아아 아기.png";
const babyCrop = { x: 230, y: 78, width: 675, height: 1040 };
const babyHeight = 910;
const babyX = 78;
const babyY = 238;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  const crcInput = Buffer.concat([typeBuffer, data]);
  chunk.writeUInt32BE(crc32(crcInput), 8 + data.length);
  return chunk;
}

function readPng(filePath) {
  const source = readFileSync(filePath);
  const signature = source.subarray(0, 8);
  if (!signature.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error(`${filePath} is not a PNG file.`);
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  while (offset < source.length) {
    const length = source.readUInt32BE(offset);
    const type = source.toString("ascii", offset + 4, offset + 8);
    const data = source.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8) {
    throw new Error(`${filePath} uses unsupported PNG bit depth ${bitDepth}.`);
  }

  const bytesPerPixel = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!bytesPerPixel) {
    throw new Error(`${filePath} uses unsupported PNG color type ${colorType}.`);
  }

  const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
  const rgba = Buffer.alloc(width * height * 4);
  const rowBytes = width * bytesPerPixel;
  const prior = Buffer.alloc(rowBytes);
  const current = Buffer.alloc(rowBytes);
  let inputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;

    for (let x = 0; x < rowBytes; x += 1) {
      const raw = inflated[inputOffset + x];
      const left = x >= bytesPerPixel ? current[x - bytesPerPixel] : 0;
      const up = prior[x] ?? 0;
      const upLeft = x >= bytesPerPixel ? prior[x - bytesPerPixel] : 0;
      let value;

      if (filter === 0) value = raw;
      else if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) value = raw + paethPredictor(left, up, upLeft);
      else throw new Error(`Unsupported PNG filter ${filter} in ${filePath}.`);

      current[x] = value & 0xff;
    }

    inputOffset += rowBytes;
    for (let x = 0; x < width; x += 1) {
      const sourceOffset = x * bytesPerPixel;
      const targetOffset = (y * width + x) * 4;
      if (colorType === 0) {
        const gray = current[sourceOffset];
        rgba[targetOffset] = gray;
        rgba[targetOffset + 1] = gray;
        rgba[targetOffset + 2] = gray;
        rgba[targetOffset + 3] = 255;
      } else if (colorType === 2) {
        rgba[targetOffset] = current[sourceOffset];
        rgba[targetOffset + 1] = current[sourceOffset + 1];
        rgba[targetOffset + 2] = current[sourceOffset + 2];
        rgba[targetOffset + 3] = 255;
      } else if (colorType === 4) {
        const gray = current[sourceOffset];
        rgba[targetOffset] = gray;
        rgba[targetOffset + 1] = gray;
        rgba[targetOffset + 2] = gray;
        rgba[targetOffset + 3] = current[sourceOffset + 1];
      } else {
        rgba[targetOffset] = current[sourceOffset];
        rgba[targetOffset + 1] = current[sourceOffset + 1];
        rgba[targetOffset + 2] = current[sourceOffset + 2];
        rgba[targetOffset + 3] = current[sourceOffset + 3];
      }
    }
    prior.set(current);
  }

  return { width, height, data: rgba };
}

function paethPredictor(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);
  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
}

function writePng(filePath, image) {
  const raw = Buffer.alloc((image.width * 4 + 1) * image.height);
  for (let y = 0; y < image.height; y += 1) {
    const rowStart = y * (image.width * 4 + 1);
    raw[rowStart] = 0;
    image.data.copy(raw, rowStart + 1, y * image.width * 4, (y + 1) * image.width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(image.width, 0);
  ihdr.writeUInt32BE(image.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND"),
  ]);

  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, png);
}

function cropImage(image, rect) {
  const x = Math.max(0, rect.x);
  const y = Math.max(0, rect.y);
  const width = Math.min(rect.width, image.width - x);
  const height = Math.min(rect.height, image.height - y);
  const cropped = { width, height, data: Buffer.alloc(width * height * 4) };

  for (let row = 0; row < height; row += 1) {
    const sourceStart = ((y + row) * image.width + x) * 4;
    const targetStart = row * width * 4;
    image.data.copy(cropped.data, targetStart, sourceStart, sourceStart + width * 4);
  }

  return cropped;
}

function removeConnectedPaper(image) {
  const visited = new Uint8Array(image.width * image.height);
  const queue = [];
  const pushIfPaper = (x, y) => {
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
    const index = y * image.width + x;
    if (visited[index]) return;
    const offset = index * 4;
    const red = image.data[offset];
    const green = image.data[offset + 1];
    const blue = image.data[offset + 2];
    if (red > 226 && green > 226 && blue > 226 && Math.max(red, green, blue) - Math.min(red, green, blue) < 34) {
      visited[index] = 1;
      queue.push(index);
    }
  };

  for (let x = 0; x < image.width; x += 1) {
    pushIfPaper(x, 0);
    pushIfPaper(x, image.height - 1);
  }
  for (let y = 1; y < image.height - 1; y += 1) {
    pushIfPaper(0, y);
    pushIfPaper(image.width - 1, y);
  }

  for (let head = 0; head < queue.length; head += 1) {
    const index = queue[head];
    const x = index % image.width;
    const y = Math.floor(index / image.width);
    image.data[index * 4 + 3] = 0;
    pushIfPaper(x + 1, y);
    pushIfPaper(x - 1, y);
    pushIfPaper(x, y + 1);
    pushIfPaper(x, y - 1);
  }

  softenTransparentEdge(image);
  return image;
}

function softenTransparentEdge(image) {
  const alpha = Buffer.alloc(image.width * image.height);
  for (let i = 0; i < alpha.length; i += 1) alpha[i] = image.data[i * 4 + 3];

  for (let y = 1; y < image.height - 1; y += 1) {
    for (let x = 1; x < image.width - 1; x += 1) {
      const index = y * image.width + x;
      if (alpha[index] === 0) continue;
      const touchesPaper =
        alpha[index - 1] === 0 ||
        alpha[index + 1] === 0 ||
        alpha[index - image.width] === 0 ||
        alpha[index + image.width] === 0;
      if (!touchesPaper) continue;

      const offset = index * 4;
      const red = image.data[offset];
      const green = image.data[offset + 1];
      const blue = image.data[offset + 2];
      if (red > 230 && green > 230 && blue > 230) {
        image.data[offset + 3] = Math.max(0, 255 - Math.max(red, green, blue));
      }
    }
  }
}

function trimTransparent(image, padding = 8) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (image.data[(y * image.width + x) * 4 + 3] === 0) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) return image;

  return cropImage(image, {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: Math.min(image.width, maxX - minX + 1 + padding * 2),
    height: Math.min(image.height, maxY - minY + 1 + padding * 2),
  });
}

function resizeImage(image, targetWidth, targetHeight) {
  const resized = { width: targetWidth, height: targetHeight, data: Buffer.alloc(targetWidth * targetHeight * 4) };
  const scaleX = image.width / targetWidth;
  const scaleY = image.height / targetHeight;

  for (let y = 0; y < targetHeight; y += 1) {
    const sourceY = Math.min(image.height - 1, Math.max(0, (y + 0.5) * scaleY - 0.5));
    const y0 = Math.floor(sourceY);
    const y1 = Math.min(image.height - 1, y0 + 1);
    const yWeight = sourceY - y0;

    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = Math.min(image.width - 1, Math.max(0, (x + 0.5) * scaleX - 0.5));
      const x0 = Math.floor(sourceX);
      const x1 = Math.min(image.width - 1, x0 + 1);
      const xWeight = sourceX - x0;
      const targetOffset = (y * targetWidth + x) * 4;
      const mixed = [0, 0, 0, 0];

      sampleWeighted(image, x0, y0, (1 - xWeight) * (1 - yWeight), mixed);
      sampleWeighted(image, x1, y0, xWeight * (1 - yWeight), mixed);
      sampleWeighted(image, x0, y1, (1 - xWeight) * yWeight, mixed);
      sampleWeighted(image, x1, y1, xWeight * yWeight, mixed);

      const alpha = mixed[3];
      resized.data[targetOffset + 3] = Math.round(alpha);
      if (alpha > 0) {
        resized.data[targetOffset] = Math.round(mixed[0] / alpha);
        resized.data[targetOffset + 1] = Math.round(mixed[1] / alpha);
        resized.data[targetOffset + 2] = Math.round(mixed[2] / alpha);
      }
    }
  }

  return resized;
}

function sampleWeighted(image, x, y, weight, mixed) {
  const offset = (y * image.width + x) * 4;
  const alpha = image.data[offset + 3] / 255;
  const weightedAlpha = alpha * weight;
  mixed[0] += image.data[offset] * weightedAlpha;
  mixed[1] += image.data[offset + 1] * weightedAlpha;
  mixed[2] += image.data[offset + 2] * weightedAlpha;
  mixed[3] += weightedAlpha * 255;
}

function scaleToHeight(image, targetHeight) {
  const targetWidth = Math.round((image.width / image.height) * targetHeight);
  return resizeImage(image, targetWidth, targetHeight);
}

function createCanvas(width, height, color) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = color[0];
    data[i * 4 + 1] = color[1];
    data[i * 4 + 2] = color[2];
    data[i * 4 + 3] = color[3];
  }
  return { width, height, data };
}

function composite(base, overlay, x, y) {
  for (let row = 0; row < overlay.height; row += 1) {
    const targetY = y + row;
    if (targetY < 0 || targetY >= base.height) continue;
    for (let column = 0; column < overlay.width; column += 1) {
      const targetX = x + column;
      if (targetX < 0 || targetX >= base.width) continue;

      const sourceOffset = (row * overlay.width + column) * 4;
      const alpha = overlay.data[sourceOffset + 3] / 255;
      if (alpha <= 0) continue;

      const targetOffset = (targetY * base.width + targetX) * 4;
      const inverseAlpha = 1 - alpha;
      base.data[targetOffset] = Math.round(overlay.data[sourceOffset] * alpha + base.data[targetOffset] * inverseAlpha);
      base.data[targetOffset + 1] = Math.round(
        overlay.data[sourceOffset + 1] * alpha + base.data[targetOffset + 1] * inverseAlpha
      );
      base.data[targetOffset + 2] = Math.round(
        overlay.data[sourceOffset + 2] * alpha + base.data[targetOffset + 2] * inverseAlpha
      );
      base.data[targetOffset + 3] = 255;
    }
  }
}

function drawDashedBorder(image, color) {
  const margin = 38;
  const radius = 70;
  const stroke = 8;
  drawDashedLine(image, margin + radius, margin, image.width - margin - radius, margin, color, stroke);
  drawDashedLine(
    image,
    margin + radius,
    image.height - margin,
    image.width - margin - radius,
    image.height - margin,
    color,
    stroke
  );
  drawDashedLine(image, margin, margin + radius, margin, image.height - margin - radius, color, stroke);
  drawDashedLine(
    image,
    image.width - margin,
    margin + radius,
    image.width - margin,
    image.height - margin - radius,
    color,
    stroke
  );
  drawDashedArc(image, margin + radius, margin + radius, radius, Math.PI, Math.PI * 1.5, color, stroke);
  drawDashedArc(image, image.width - margin - radius, margin + radius, radius, Math.PI * 1.5, Math.PI * 2, color, stroke);
  drawDashedArc(
    image,
    image.width - margin - radius,
    image.height - margin - radius,
    radius,
    0,
    Math.PI / 2,
    color,
    stroke
  );
  drawDashedArc(image, margin + radius, image.height - margin - radius, radius, Math.PI / 2, Math.PI, color, stroke);
}

function drawDashedLine(image, x1, y1, x2, y2, color, stroke) {
  const dash = 32;
  const gap = 18;
  const horizontal = y1 === y2;
  const length = horizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
  const direction = horizontal ? Math.sign(x2 - x1) : Math.sign(y2 - y1);
  for (let start = 0; start < length; start += dash + gap) {
    const end = Math.min(length, start + dash);
    for (let distance = start; distance < end; distance += 1) {
      const x = horizontal ? x1 + distance * direction : x1;
      const y = horizontal ? y1 : y1 + distance * direction;
      fillCircle(image, Math.round(x), Math.round(y), stroke / 2, color);
    }
  }
}

function drawDashedArc(image, cx, cy, radius, startAngle, endAngle, color, stroke) {
  const dash = 34;
  const gap = 18;
  const arcLength = (endAngle - startAngle) * radius;
  for (let length = 0; length < arcLength; length += 1) {
    const inDash = length % (dash + gap) < dash;
    if (!inDash) continue;
    const angle = startAngle + length / radius;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    fillCircle(image, Math.round(x), Math.round(y), stroke / 2, color);
  }
}

function drawShadow(image, cx, cy, rx, ry) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const distance = nx * nx + ny * ny;
      if (distance > 1) continue;
      const alpha = Math.round((1 - distance) * 35);
      blendPixel(image, x, y, [206, 157, 104, alpha]);
    }
  }
}

function fillCircle(image, cx, cy, radius, color) {
  const radiusSquared = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > radiusSquared) continue;
      blendPixel(image, x, y, color);
    }
  }
}

function blendPixel(image, x, y, color) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
  const offset = (y * image.width + x) * 4;
  const alpha = color[3] / 255;
  const inverseAlpha = 1 - alpha;
  image.data[offset] = Math.round(color[0] * alpha + image.data[offset] * inverseAlpha);
  image.data[offset + 1] = Math.round(color[1] * alpha + image.data[offset + 1] * inverseAlpha);
  image.data[offset + 2] = Math.round(color[2] * alpha + image.data[offset + 2] * inverseAlpha);
  image.data[offset + 3] = 255;
}

function prepareCutout(fileName, cropRect) {
  const fullPath = path.resolve(rootDir, fileName);
  return trimTransparent(removeConnectedPaper(cropImage(readPng(fullPath), cropRect)));
}

function makeHero(job, babyCutout) {
  const canvas = createCanvas(outputSize, outputSize, [255, 254, 250, 255]);
  drawDashedBorder(canvas, job.accent);
  drawShadow(canvas, 402, 1118, 300, 34);
  drawShadow(canvas, 903, 1040, 165, 28);

  const baby = scaleToHeight(babyCutout, babyHeight);
  const tool = scaleToHeight(prepareCutout(job.toolSource, job.toolCrop), job.toolHeight);
  composite(canvas, baby, babyX, babyY);
  composite(canvas, tool, job.toolX, job.toolY);

  const outputPath = path.resolve(rootDir, job.output);
  writePng(outputPath, canvas);
  console.log(`wrote ${job.output}`);
  return canvas;
}

function makePreview(heroes) {
  const previewWidth = 920;
  const previewHeight = 470;
  const preview = createCanvas(previewWidth, previewHeight, [255, 255, 255, 255]);
  heroes.forEach((hero, index) => {
    const scaled = resizeImage(hero, 430, 430);
    composite(preview, scaled, 20 + index * 455, 20);
  });
  writePng(path.resolve(rootDir, "tmp/imagegen/aa-baby-ya-yeo-node-preview.png"), preview);
}

const babyCutout = prepareCutout(babySource, babyCrop);
const heroes = jobs.map((job) => makeHero(job, babyCutout));
makePreview(heroes);
