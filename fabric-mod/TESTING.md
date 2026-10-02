# Testing & Verification Specification

## Automated Test Coverage

The mod includes JUnit 5 unit tests validating:

1. **Deterministic Invariance (`RegionDeterminismTest`)**:
   - Asserts that for any given seed $S$ and coordinates $(X, Z)$, the derived `RegionState`, active anomaly set, and terrain modifiers remain identical across multiple independent runs and server restarts.

2. **Large-Coordinate Arithmetic & Overflow Safety (`LargeCoordinateMathTest`)**:
   - Asserts Euclidean distance and region coordinate calculation at:
     - $(0, 0)$
     - $(60,000, -60,000)$
     - $(300,000, 300,000)$
     - $(12,550,821, 0)$
     - $(-12,550,821, -12,550,821)$ (Corner Farlands)
     - $(24,000,000, -24,000,000)$ (Ultra-Deep Farlands)
   - Confirms zero integer overflow or NaN/Infinity floating point errors.

3. **Conflict Resolution Matrix (`ConflictResolutionTest`)**:
   - Asserts that when two conflicting anomalies spawn in the same region (e.g. Gravity Inversion vs Heavy Gravity), the priority matrix resolves deterministically to a bounded outcome without crashing.

4. **Safe Mod Detection (`CompatibilityTest`)**:
   - Asserts that classloaders without JJThunder gracefully initialize `VanillaTerrainAdapter` with clean fallback logs.
