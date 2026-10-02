/**
 * 64-bit Deterministic Hashing & PRNG in TypeScript.
 * Uses BigInt to ensure 64-bit integer precision without floating point truncation or overflow.
 */

const M_SEED = 0x9e3779b97f4a7c15n;
const C1 = 0xbf58476d1ce4e5b9n;
const C2 = 0x94d049bb133111ebn;
const MASK64 = 0xffffffffffffffffn;

export function splitMix64(z: bigint): bigint {
  z = (z ^ (z >> 30n)) * C1 & MASK64;
  z = (z ^ (z >> 27n)) * C2 & MASK64;
  return (z ^ (z >> 31n)) & MASK64;
}

export function hash64(worldSeed: bigint, x: bigint, z: bigint, layer: bigint): bigint {
  let h = (worldSeed ^ ((x * C1) & MASK64)) & MASK64;
  h = (h ^ ((z * C2) & MASK64)) & MASK64;
  h = (h ^ ((layer * M_SEED) & MASK64)) & MASK64;
  return splitMix64(h);
}

export function hashString(worldSeed: bigint, str: string, layer: bigint): bigint {
  let h = (worldSeed ^ ((layer * M_SEED) & MASK64)) & MASK64;
  for (let i = 0; i < str.length; i++) {
    const code = BigInt(str.charCodeAt(i) & 0xffff);
    h = (h ^ (code << BigInt((i % 4) * 16))) & MASK64;
    h = splitMix64(h);
  }
  return h;
}

export function toDouble(hash: bigint): number {
  const v = Number(hash >> 11n & 0x1fffffffffffffn);
  return v / 9007199254740992; // 2^53
}

export function toSignedDouble(hash: bigint): number {
  return toDouble(hash) * 2.0 - 1.0;
}

export function safeDistance(x: number, z: number): number {
  return Math.sqrt(x * x + z * z);
}
