# Requirements Document

## Introduction

The 蛋宝世界 (DANBO World) game currently features 8 playable characters that all share an identical egg-shaped body with minor cosmetic add-ons. This feature overhauls each character to have a distinct species-specific body shape, color palette, structural features (tails, ears, antennae, wings), and matching 2D portrait rendering. The goal is to give each character a unique visual identity while preserving the unified Q-style cute aesthetic and shared elastic animation system.

## Glossary

- **Character_Mesh**: The Three.js Group returned by `createEggMesh()` containing the 3D body, eyes, mouth, limbs, and species-specific features for a single character
- **Body_Shape**: The base SphereGeometry that defines a character's torso proportions (height, width, flatness) before species-specific features are added
- **Species_Feature**: A structural 3D element unique to a character type (e.g., tail, ears, antennae, wings, comb) added to the Character_Mesh
- **Portrait_Renderer**: The `drawPortrait()` function that draws a 2D canvas representation of a character for the SF2-style character select screen
- **Eggshell**: The cracked shell fragments and rim ring rendered on top of a character's body
- **Elastic_Animation**: The shared animation system applying bounce-run, squash/stretch jump, and landing deformation to all characters
- **CHARACTERS_Array**: The configuration array (~line 692 in game.js) defining each character's name, type, color, accent, icon, and portrait color
- **MeshToonMaterial**: The Three.js material used for the cartoon cel-shaded look across all character meshes
- **Q_Style**: A cute, round, chibi-like art style with exaggerated proportions (big eyes, small body, stubby limbs)

## Requirements

### Requirement 1: Species-Specific Body Shapes

**User Story:** As a player, I want each character to have a distinct body shape matching its species, so that characters are visually distinguishable during gameplay.

#### Acceptance Criteria

1. THE Character_Mesh for type "egg" SHALL use the current standard egg Body_Shape (SphereGeometry 0.6, existing deformation)
2. THE Character_Mesh for type "dog" SHALL use a slightly elongated Body_Shape with a wider base compared to the standard egg
3. THE Character_Mesh for type "monkey" SHALL use a Body_Shape where the upper body is smaller and the lower body is larger than the standard egg
4. THE Character_Mesh for type "rooster" SHALL use a Body_Shape with an elongated and slightly pointed top compared to the standard egg
5. THE Character_Mesh for type "cockroach" SHALL use a flatter and wider Body_Shape compared to the standard egg
6. THE Character_Mesh for type "cat" SHALL use a Body_Shape with a slightly pointed top compared to the standard egg
7. THE Character_Mesh for type "pig" SHALL use a rounder and wider Body_Shape compared to the standard egg
8. THE Character_Mesh for type "frog" SHALL use a flatter Body_Shape with reduced height compared to the standard egg
9. THE Character_Mesh for all 8 character types SHALL maintain a final height within ±10% of each other

### Requirement 2: Species-Specific Color Palettes

**User Story:** As a player, I want each character colored to match its species, so that the visual identity feels natural and recognizable.

#### Acceptance Criteria

1. THE CHARACTERS_Array entry for type "dog" SHALL use body color 0xC8915A (brown) and a matching brown accent color
2. THE CHARACTERS_Array entry for type "cockroach" SHALL use body color 0x6633AA (dark purple) and a matching dark accent color
3. THE CHARACTERS_Array entry for type "cat" SHALL use body color 0xDDDDDD (white/gray) and a matching gray accent color
4. THE CHARACTERS_Array entry for type "pig" SHALL use body color 0xFFAAAA (pink) and a matching pink accent color
5. THE CHARACTERS_Array entry for type "egg" SHALL retain its current color 0xFFDD44
6. THE CHARACTERS_Array entry for type "monkey" SHALL retain its current color 0xFF8866
7. THE CHARACTERS_Array entry for type "rooster" SHALL retain its current color 0xFFEEDD
8. THE CHARACTERS_Array entry for type "frog" SHALL retain its current color 0x55BB55

### Requirement 3: Eggshell Exclusivity

**User Story:** As a player, I want only the egg character (蛋宝) to have a cracked eggshell on its head, so that the eggshell is a unique identity marker for the main character.

#### Acceptance Criteria

1. WHEN charType is "egg", THE Character_Mesh SHALL include the cracked Eggshell fragments and rim ring on top of the body
2. WHEN charType is not "egg", THE Character_Mesh SHALL omit the cracked Eggshell fragments and rim ring entirely

### Requirement 4: Dog Species Features

**User Story:** As a player, I want the dog character to have floppy ears, a nose, and a short wagging tail, so that it looks like a cute cartoon dog.

#### Acceptance Criteria

1. THE Character_Mesh for type "dog" SHALL include two floppy ears positioned on the sides of the head
2. THE Character_Mesh for type "dog" SHALL include a dark nose on the front of the face
3. THE Character_Mesh for type "dog" SHALL include a short tail attached to the rear of the body

### Requirement 5: Monkey Species Features

**User Story:** As a player, I want the monkey character to have round ears, a muzzle, and a long tail, so that it looks like a cute cartoon monkey.

#### Acceptance Criteria

1. THE Character_Mesh for type "monkey" SHALL include two round ears with inner ear detail
2. THE Character_Mesh for type "monkey" SHALL include a lighter-colored muzzle on the front of the face
3. THE Character_Mesh for type "monkey" SHALL include a tail with length at least 0.6 times the body height
4. THE tail of the "monkey" Character_Mesh SHALL be visually curved or curling

### Requirement 6: Rooster Species Features

**User Story:** As a player, I want the rooster character to have a comb, beak, wattle, wings, and tail feathers, so that it looks like a cute cartoon rooster.

#### Acceptance Criteria

1. THE Character_Mesh for type "rooster" SHALL include a red comb on top of the head
2. THE Character_Mesh for type "rooster" SHALL include a beak on the front of the face
3. THE Character_Mesh for type "rooster" SHALL include a red wattle below the beak
4. THE Character_Mesh for type "rooster" SHALL include two small wings on the sides of the body
5. THE Character_Mesh for type "rooster" SHALL include tail feathers at the rear of the body

### Requirement 7: Cockroach Species Features

**User Story:** As a player, I want the cockroach character to have twin-tail antennae with sway animation, a shell line, and decorative legs, so that it looks like a cute cartoon cockroach.

#### Acceptance Criteria

1. THE Character_Mesh for type "cockroach" SHALL include two antennae styled as twin-tails extending from the top of the head
2. WHILE the game is running, THE cockroach antennae SHALL exhibit a continuous dynamic sway animation
3. THE Character_Mesh for type "cockroach" SHALL include a shell dividing line on the back of the body
4. THE Character_Mesh for type "cockroach" SHALL include decorative small legs on the sides of the body

### Requirement 8: Cat Species Features

**User Story:** As a player, I want the cat character to have triangle ears, whiskers, and a curved tail, so that it looks like a cute cartoon cat.

#### Acceptance Criteria

1. THE Character_Mesh for type "cat" SHALL include two triangular pointed ears with inner ear coloring
2. THE Character_Mesh for type "cat" SHALL include whiskers on both sides of the face
3. THE Character_Mesh for type "cat" SHALL include a curved tail attached to the rear of the body

### Requirement 9: Pig Species Features

**User Story:** As a player, I want the pig character to have a prominent snout, small ears, and a curly tail, so that it looks like a cute cartoon pig.

#### Acceptance Criteria

1. THE Character_Mesh for type "pig" SHALL include a prominent cylindrical snout with two nostrils on the front of the face
2. THE Character_Mesh for type "pig" SHALL include two small floppy ears on the top of the head
3. THE Character_Mesh for type "pig" SHALL include a curly tail attached to the rear of the body

### Requirement 10: Frog Species Features

**User Story:** As a player, I want the frog character to have protruding eyes on top and a wide mouth line, so that it looks like a cute cartoon frog.

#### Acceptance Criteria

1. THE Character_Mesh for type "frog" SHALL include two protruding bulging eyes positioned on top of the head
2. THE Character_Mesh for type "frog" SHALL include a wide mouth line across the front of the face

### Requirement 11: Shared Elastic Animation Compatibility

**User Story:** As a developer, I want all species-specific meshes to remain compatible with the shared Elastic_Animation system, so that gameplay animations work consistently across all characters.

#### Acceptance Criteria

1. THE Character_Mesh for all 8 character types SHALL expose `userData.body` and `userData.feet` references for the Elastic_Animation system
2. THE Elastic_Animation system SHALL apply bounce-run, squash/stretch jump, and landing deformation to all 8 character types
3. WHERE the character type is "monkey", THE Elastic_Animation system SHALL allow a higher jump multiplier
4. WHERE the character type is "frog", THE Elastic_Animation system SHALL allow a more bouncy jump feel
5. WHERE the character type is "pig", THE Elastic_Animation system SHALL allow a heavier landing deformation

### Requirement 12: Portrait Rendering Updates

**User Story:** As a player, I want the character select screen portraits to reflect each character's new species-specific appearance, so that the 2D portraits match the 3D in-game models.

#### Acceptance Criteria

1. THE Portrait_Renderer SHALL draw the body ellipse using the updated species-specific color for each character type
2. THE Portrait_Renderer for type "dog" SHALL draw floppy ears, a nose, and use brown tones matching the 3D model
3. THE Portrait_Renderer for type "monkey" SHALL draw round ears, a muzzle, and use orange tones matching the 3D model
4. THE Portrait_Renderer for type "rooster" SHALL draw a comb, beak, wattle, and use white/orange tones matching the 3D model
5. THE Portrait_Renderer for type "cockroach" SHALL draw twin-tail antennae and use dark purple tones matching the 3D model
6. THE Portrait_Renderer for type "cat" SHALL draw triangle ears, whiskers, and use white/gray tones matching the 3D model
7. THE Portrait_Renderer for type "pig" SHALL draw a prominent snout, small ears, and use pink tones matching the 3D model
8. THE Portrait_Renderer for type "frog" SHALL draw protruding bulging eyes, a wide mouth, and use green tones matching the 3D model
9. THE Portrait_Renderer for type "egg" SHALL draw the cracked Eggshell on top of the body, distinguishing it from other characters

### Requirement 13: Q-Style Design Consistency

**User Story:** As a player, I want all characters to maintain a unified cute Q-style aesthetic, so that the game's visual identity remains cohesive.

#### Acceptance Criteria

1. THE Character_Mesh for all 8 character types SHALL use the unified big-eye style (same eye size and positioning pattern)
2. THE Character_Mesh for all 8 character types SHALL use MeshToonMaterial for all geometry
3. THE Character_Mesh for all 8 character types SHALL maintain round, cute proportions with no realistic anatomy
4. THE Character_Mesh for all 8 character types SHALL include blush cheeks and a smile
