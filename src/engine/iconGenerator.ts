/**
 * Generates a valid 64x64 RGBA PNG image representing the Anomalous World Generator icon:
 * An abyssal cosmic void portal with emerald & cyan crystalline runes.
 */

// Simple Adler-32 checksum calculation
function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

// CRC32 table & calculator for PNG chunks
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const len = data.length;
  const chunk = new Uint8Array(4 + 4 + len + 4);

  // Length (big endian)
  chunk[0] = (len >> 24) & 0xff;
  chunk[1] = (len >> 16) & 0xff;
  chunk[2] = (len >> 8) & 0xff;
  chunk[3] = len & 0xff;

  // Type
  chunk.set(typeBytes, 4);

  // Data
  chunk.set(data, 8);

  // CRC over Type + Data
  const typeAndData = new Uint8Array(4 + len);
  typeAndData.set(typeBytes, 0);
  typeAndData.set(data, 4);
  const crc = crc32(typeAndData);

  const crcPos = 8 + len;
  chunk[crcPos] = (crc >> 24) & 0xff;
  chunk[crcPos + 1] = (crc >> 16) & 0xff;
  chunk[crcPos + 2] = (crc >> 8) & 0xff;
  chunk[crcPos + 3] = crc & 0xff;

  return chunk;
}

export function generateModIconPng(): Uint8Array {
  const width = 64;
  const height = 64;

  // 1. Raw RGBA pixel scanlines (1 filter byte 0x00 per row + 64 * 4 bytes)
  const rawBytes = new Uint8Array(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter: None
    const ny = (y - 32) / 32;

    for (let x = 0; x < width; x++) {
      const nx = (x - 32) / 32;
      const r = Math.sqrt(nx * nx + ny * ny);

      let red = 10;
      let green = 12;
      let blue = 16;
      let alpha = 255;

      if (r < 0.85) {
        // Portal vortex ring
        const ring = Math.sin(r * 18 - 2.5);
        if (ring > 0.3) {
          red = Math.round(16 + ring * 40);
          green = Math.round(180 + ring * 75);
          blue = Math.round(130 + ring * 125);
        } else if (r < 0.4) {
          // Central abyss
          red = 2;
          green = 4;
          blue = 8;
        } else {
          red = 14;
          green = 24;
          blue = 40;
        }
      }

      // Outer border frame
      if (x < 2 || x >= 62 || y < 2 || y >= 62) {
        red = 16;
        green = 185;
        blue = 129;
      }

      rawBytes[offset++] = red;
      rawBytes[offset++] = green;
      rawBytes[offset++] = blue;
      rawBytes[offset++] = alpha;
    }
  }

  // 2. Wrap raw scanlines in an uncompressed zlib stream (RFC 1950)
  // zlib header: 0x78 0x01 (no compression)
  const adler = adler32(rawBytes);
  const blockCount = Math.ceil(rawBytes.length / 65535);
  const zlibLen = 2 + blockCount * 5 + rawBytes.length + 4;
  const zlib = new Uint8Array(zlibLen);

  zlib[0] = 0x78;
  zlib[1] = 0x01; // zlib header

  let zPos = 2;
  let rawPos = 0;

  while (rawPos < rawBytes.length) {
    const chunkLen = Math.min(65535, rawBytes.length - rawPos);
    const isLast = rawPos + chunkLen >= rawBytes.length;

    zlib[zPos++] = isLast ? 0x01 : 0x00;
    zlib[zPos++] = chunkLen & 0xff;
    zlib[zPos++] = (chunkLen >> 8) & 0xff;
    const nlen = ~chunkLen & 0xffff;
    zlib[zPos++] = nlen & 0xff;
    zlib[zPos++] = (nlen >> 8) & 0xff;

    zlib.set(rawBytes.subarray(rawPos, rawPos + chunkLen), zPos);
    zPos += chunkLen;
    rawPos += chunkLen;
  }

  // Adler-32 big-endian
  zlib[zPos++] = (adler >> 24) & 0xff;
  zlib[zPos++] = (adler >> 16) & 0xff;
  zlib[zPos++] = (adler >> 8) & 0xff;
  zlib[zPos++] = adler & 0xff;

  // 3. Assemble PNG Chunks
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = new Uint8Array([
    0, 0, 0, 64, // width = 64
    0, 0, 0, 64, // height = 64
    8, // bit depth = 8
    6, // color type = RGBA (6)
    0, // compression = deflate (0)
    0, // filter = 0
    0, // interlace = 0
  ]);
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', zlib);

  // IEND
  const iendChunk = makeChunk('IEND', new Uint8Array(0));

  // Combine into final PNG
  const totalLen = signature.length + ihdrChunk.length + idatChunk.length + iendChunk.length;
  const png = new Uint8Array(totalLen);
  let p = 0;

  png.set(signature, p);
  p += signature.length;
  png.set(ihdrChunk, p);
  p += ihdrChunk.length;
  png.set(idatChunk, p);
  p += idatChunk.length;
  png.set(iendChunk, p);

  return png;
}
