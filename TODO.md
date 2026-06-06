# TODO: Fix racing stripe / hood & bumper color / side graphic / spoiler

## Step 1 — Racing stripe placement + sizing
- Update `ArAnchoredModels` logic for `racing_stripe` so it uses the combined left+right door bbox for the current side view.
- Ensure stripe is anchored at the **bottom** of the combined door region (ny near 1.0 using bbox bottom), and decrease stripe size if it is currently too tall/large.

## Step 2 — Decrease side graphics size + move to bottom half of rear door
- Update `ArAnchoredModels` logic for `side_graphic` so it uses only the rear door bbox, but scales to the **bottom half** (roughly from 50%->100% of rear door bbox height).
- Reduce the configured scale to match the screenshot expectation.

## Step 3 — Fix spoiler placement
- Adjust `spoiler` positioning/ny so it sits correctly relative to trunk/tailgate bbox bottom/top.
- If rotation causes drift, adjust rotation or anchor offset.

## Step 4 — Hood / front bumper / rear bumper color not applying
- Trace why paint color / per-part colors aren’t applied to GLTF parts for `hood`, `front_bumper`, `rear_bumper`.
- Verify key names match `ArPartsPanel` keys and `ANCHOR_CONFIG` anchor keys.
- Ensure tint is applied to the correct loaded object (and not overwritten later by restoreOriginalColors logic).

## Step 5 — Quick verification
- Run app build/lint checks.
- Validate in AR preview:
  - Hood & bumpers tint correctly.
  - Racing stripe small and at bottom of both detected doors (combined).
  - Side graphic reduced and at bottom half of rear door.
  - Spoiler fixed.
