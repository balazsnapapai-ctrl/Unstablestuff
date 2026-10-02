export interface ScholarBook {
  title: string;
  author: string;
  era: string;
  location: string;
  pages: string[];
}

export interface LostCitadel {
  id: string;
  name: string;
  dimension: 'overworld' | 'nether' | 'underworld';
  approxCoord: { x: number; y: number; z: number };
  difficulty: 'Very Hard' | 'Near Impossible' | 'Endgame Transcendent';
  accessRequirement: string;
  books: ScholarBook[];
  clues: string[];
}

export const LOST_CITADELS: LostCitadel[] = [
  {
    id: 'citadel_overworld',
    name: 'The Sunken Archives of the First Horizon',
    dimension: 'overworld',
    approxCoord: { x: 3_480_200, y: 18, z: -1_820_100 },
    difficulty: 'Very Hard',
    accessRequirement: 'Requires Water Breathing & Conduit Power; submerged in Hadopelagic trench beneath ocean floor bedrock fissure.',
    clues: [
      'Clue Fragment I: Found in ancient ruins at X: 140,000, Z: 90,000 — "Look toward the Great Sea shelf where the water turns violet. Follow azimuth 318° for 3.4 million meters."',
      'Clue Fragment II: "The entrance is buried beneath basalt slab Y=18. Only a Conduit placed within five blocks of prismarine will dissolve the seal."',
    ],
    books: [
      {
        title: 'On the Curvature of Chunk Boundaries',
        author: 'Chief Geometer Hesperus',
        era: 'Before the Collapse',
        location: 'First Archive Chamber',
        pages: [
          'We believed our world was continuous. We believed that if a man walked far enough toward the dawn, the land would roll onward in gentle hillocks forever.',
          'We were mistaken. Beyond the third millionth league, the coordinate math begins to jitter. The grid lines bleed through the grass. The numbers, it seems, cannot count forever without growing heavy.',
          'At twelve million five hundred fifty thousand meters, reality surrenders. The ground fractures into a towering orthogonal lattice of hollow cubes. It is not an accident—it is the arithmetic frame of existence itself laid bare.',
        ],
      },
      {
        title: 'The Cartographer\'s Last Warning',
        author: 'Surveyor Karen',
        era: 'Year of the Great Tremor',
        location: 'Deep Vault Archive',
        pages: [
          'Do not fly by elytra where the sky begins to hum. In the deep zones, rocket impulses dissolve into cold kinetic nothingness.',
          'Keep your boots to the stone. Trust your eyes, not your compass. When the needle begins to spin 360 degrees, you are no longer in God\'s garden—you are walking in the engine room.',
        ],
      },
    ],
  },
  {
    id: 'citadel_nether',
    name: 'The Pyrocene Caldera Scriptorium & Forge',
    dimension: 'nether',
    approxCoord: { x: 1_568_852, y: 55, z: 840_000 },
    difficulty: 'Near Impossible',
    accessRequirement: 'Perched precisely on the Nether Farlands threshold (1,568,852 blocks). Requires Fire Resistance & Striders across boundless boiling plasma.',
    clues: [
      'Clue Fragment III: Recovered from Nether Fortress at X: 125,000, Z: -60,000 — "The scholars built their forge where the 8:1 ratio meets the boundary. At 1,568,852 Nether blocks, the ceiling and floor fuse into a lattice of burning stone."',
      'Clue Fragment IV: "To awaken the forge, ignite four weeping obsidian pedestals with blue soul fire while holding an Ancient Debris core."',
    ],
    books: [
      {
        title: 'Treatise on Non-Euclidean Compression',
        author: 'Magister Pyrosthenes',
        era: 'The Age of Obsidian',
        location: 'Caldera Forge Vault',
        pages: [
          'One step in this scorched realm traverses eight in the green world above. This is not sorcery; it is spatial compression of the primary coordinate manifold.',
          'Because of this ratio, the Nether Farlands occur eight times sooner—at exactly one million five hundred sixty-eight thousand eight hundred fifty-two blocks.',
          'Here, we forged the Resonance Keys. If you seek the Citadel beneath the Bedrock, you will need the alloy shaped only in this chamber.',
        ],
      },
    ],
  },
  {
    id: 'citadel_underworld',
    name: 'The Panopticon of the Void Scholars',
    dimension: 'underworld',
    approxCoord: { x: 8_420_000, y: -420, z: -6_110_000 },
    difficulty: 'Endgame Transcendent',
    accessRequirement: '200 blocks below the bedrock floor, hidden inside an invisible Non-Euclidean Spatial Pocket. Exterior entrance is a 3x3 gap, interior expands to 512 blocks.',
    clues: [
      'Clue Fragment V: Etched upon an Archaic Lore monolith — "Drop past the bedrock at Y=-64. Fall through the two hundred meters of howling empty dark. You will not die to the void until Y=-600."',
      'Clue Fragment VI: "The Panopticon cannot be seen from above. You must find the tiny crying obsidian arch at Y=-420. Step through, and space will unfold like a flower into an endless cathedral."',
    ],
    books: [
      {
        title: 'The Great Drop: Surviving the Sub-Bedrock Gap',
        author: 'Unknown Void Scholar',
        era: 'Eternal Deep',
        location: 'The Panopticon Dais',
        pages: [
          'Between the bottom of the world (Y=-64) and the true Underworld lies two hundred blocks of pure emptiness. Many turned back in terror, believing it was the fatal void.',
          'It is not. The true void sleeps below Y=-600. Leap boldly into the blackness. The air will catch you as you enter the acoustic blotch caverns.',
        ],
      },
      {
        title: 'The Architecture of Folded Space',
        author: 'The Silent Archon',
        era: 'Timeless',
        location: 'Inner Sanctum',
        pages: [
          'You stand now in a room that is five hundred blocks wide, yet if you turn and walk three paces backward through the arch, you will stand in a cave no larger than a horse stall.',
          'Space in the Underworld is plastic. It folds, dilates, and multiplies. He who masters the topological gateways can store an entire empire inside a single block of deepslate.',
        ],
      },
    ],
  },
];
