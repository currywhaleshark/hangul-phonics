const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const encoder = new TextEncoder();

function encode(text) {
  return encoder.encode(text);
}

function asBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
}

function concat(chunks, totalLength) {
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function pdfNumber(value) {
  return Number(value).toFixed(2).replace(/\.?0+$/, "");
}

function placementFor(page, pageWidth, pageHeight) {
  const imageRatio = page.width / page.height;
  const pageRatio = pageWidth / pageHeight;
  if (imageRatio > pageRatio) {
    const width = pageWidth;
    const height = pageWidth / imageRatio;
    return { x: 0, y: (pageHeight - height) / 2, width, height };
  }
  const height = pageHeight;
  const width = pageHeight * imageRatio;
  return { x: (pageWidth - width) / 2, y: 0, width, height };
}

export function buildImagePdfBytes(pages, options = {}) {
  if (!pages.length) throw new Error("PDF로 저장할 페이지가 없습니다.");

  const pageWidth = options.pageWidth || A4_WIDTH_PT;
  const pageHeight = options.pageHeight || A4_HEIGHT_PT;
  const objectCount = 2 + pages.length * 3;
  const offsets = new Array(objectCount + 1).fill(0);
  const chunks = [];
  let byteLength = 0;

  function appendBytes(bytes) {
    chunks.push(bytes);
    byteLength += bytes.length;
  }

  function appendText(text) {
    appendBytes(encode(text));
  }

  function addObject(id, body) {
    offsets[id] = byteLength;
    appendText(`${id} 0 obj\n`);
    for (const part of body) {
      if (typeof part === "string") appendText(part);
      else appendBytes(asBytes(part));
    }
    appendText("\nendobj\n");
  }

  appendText("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  addObject(1, ["<< /Type /Catalog /Pages 2 0 R >>"]);

  const pageObjectIds = pages.map((_, index) => 3 + index * 3);
  addObject(2, [`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`]);

  pages.forEach((page, index) => {
    const pageObjectId = 3 + index * 3;
    const contentObjectId = pageObjectId + 1;
    const imageObjectId = pageObjectId + 2;
    const imageName = `Im${index + 1}`;
    const imageData = asBytes(page.data);
    const placement = placementFor(page, pageWidth, pageHeight);
    const content = [
      "q",
      `${pdfNumber(placement.width)} 0 0 ${pdfNumber(placement.height)} ${pdfNumber(placement.x)} ${pdfNumber(placement.y)} cm`,
      `/${imageName} Do`,
      "Q",
    ].join("\n");
    const contentBytes = encode(content);

    addObject(pageObjectId, [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfNumber(pageWidth)} ${pdfNumber(pageHeight)}] `,
      `/Resources << /XObject << /${imageName} ${imageObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
    ]);
    addObject(contentObjectId, [
      `<< /Length ${contentBytes.length} >>\nstream\n`,
      contentBytes,
      "\nendstream",
    ]);
    addObject(imageObjectId, [
      `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} `,
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageData.length} >>\nstream\n`,
      imageData,
      "\nendstream",
    ]);
  });

  const xrefOffset = byteLength;
  appendText(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
  for (let id = 1; id <= objectCount; id += 1) {
    appendText(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  }
  appendText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return concat(chunks, byteLength);
}

export function buildImagePdfBlob(pages, options = {}) {
  return new Blob([buildImagePdfBytes(pages, options)], { type: "application/pdf" });
}

export function canvasToJpegPage(canvas, quality = 0.94) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(async (blob) => {
        try {
          if (!blob) throw new Error("PDF 페이지 이미지를 만들지 못했습니다.");
          resolve({
            width: canvas.width,
            height: canvas.height,
            data: new Uint8Array(await blob.arrayBuffer()),
          });
        } catch (error) {
          reject(error);
        }
      }, "image/jpeg", quality);
    } catch (error) {
      reject(new Error("PDF 변환 중 브라우저 보안 제한이 발생했습니다.", { cause: error }));
    }
  });
}
