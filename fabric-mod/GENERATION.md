# World Generation Pipeline: Anomalous World Generator

## 1. Distance Regimes

The world shifts through 6 primary regimes based on Euclidean distance $D = \sqrt{x^2 + z^2}$:

1. **Normal Spawn Zone ($0 \le D < 60,000$)**:
   - Terrain amplitude factor: $1.0\times$.
   - Normal vanilla biome distribution, cave networks, and ore distribution.
   - Anomaly probability: $\le 0.02$. Subtle cosmetic or ambient variations only.

2. **Amplified Terrain Region ($60,000 \le D < 300,000$)**:
   - Terrain amplitude factor scales smoothly from $1.0\times$ up to $4.2\times$.
   - Peaks ascend toward build limit ($Y=319$), chasms plunge toward deepslate depths ($Y=-50$).
   - Ridge multiplier introduces vertical cliff faces, natural stone arches, and overhangs while preserving geological coherence.

3. **The Great Sea ($300,000 \le D < 1,000,000$)**:
   - Continental height base plunges below sea level ($Y=63$).
   - Sparse archipelago islands ($< 4\%$ landmass).
   - Abyssal ocean floor with submarine trenches, basalt ridges, and underwater volcanic vents.

4. **The Outer World ($1,000,000 \le D < 12,550,821$)**:
   - Biome blending distortion: neighboring biomes exhibit sharp or folded transitions.
   - Structural repetitions and inverted subterranean cave systems.
   - Emergence of Level 2 and Level 3 regional anomalies.

5. **The Farlands ($12,550,821 \le D < 20,000,000$)**:
   - Emulates 3D noise coordinate overflow using modern 1.21.1 density functions.
   - **The Lattice**: Repeating $32\text{m}$ orthogonal tunnel network carved through solid stone.
   - **Corner Farlands**: Occurs when $|X| \ge 12,550,821$ AND $|Z| \ge 12,550,821$. Superposition of X and Z lattice grids producing soaring vertical monolithic pillars and geometric cubic voids.
   - **Linear Walls**: High-density cardinal plates extending along $X$ or $Z$ axes.
   - **Void Channels**: Deep chasms descending to the void.

6. **The Ultra-Deep Farlands ($D \ge 20,000,000$)**:
   - Extreme spatial dissonance, reality-breaking physics anomalies, and historical echo architecture.

---

## 2. Mathematical Farlands Lattice Equation

The Farlands density offset is evaluated chunk-locally via:

$$
\text{Lattice}(x, y, z) = \sin(x \cdot \omega_x) \cdot \cos(y \cdot \omega_y) + \sin(z \cdot \omega_z) \cdot \cos(x \cdot \omega_x) + \dots
$$

When coordinate overflow emulation activates ($|x| \ge X_{\text{far}}$):
$$
\Delta_{\text{density}}(x, y, z) = \left( \frac{|x| - X_{\text{far}}}{\lambda} \right) \cdot \Phi(x \bmod P, y, z \bmod P)
$$
This creates continuous, chunk-local, reproducible 3D geometry without memory allocation spikes.
