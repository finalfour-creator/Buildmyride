import BodyOptions from "./BodyOptions";
import Wheel1Options from "./Wheel1Options";
import ModularPartOptions from "./ModularPartOptions";

export default function OptionsPanel({
  selectedPart, // This is now the category name (e.g. "bumper", "spoiler")
  availableParts = {}, // Default to empty object to prevent crash
  currentBuild = {},   // Default to empty object
  onPartSelect,
  // Existing props for Body/Wheels
  selectedColor,
  setSelectedColor,
  colorPalette,
  activeWheelPosition,
  wheels,
  setWheels,
  onApplyAllWheels,
}) {
  // 1. Special case: Body Paint
  if (selectedPart === "body") {
    return (
      <BodyOptions
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        colorPalette={colorPalette}
      />
    );
  }

  // 2. Special case: Wheels (Uses per-position logic)
  if (selectedPart === "wheels") {
    return (
      <Wheel1Options
        activeWheelPosition={activeWheelPosition}
        wheels={wheels}
        setWheels={setWheels}
        wheelOptions={availableParts["wheels"] || []}
        onApplyAllWheels={onApplyAllWheels}
      />
    );
  }

  // 3. Dynamic Case: All other parts (Bumper, Spoiler, Hood, etc.)
  // The selectedPart ID now directly matches the lowercase key in availableParts
  const categoryData = availableParts[selectedPart];

  if (categoryData) {
    return (
      <ModularPartOptions
        category={selectedPart}
        options={categoryData}
        currentBuild={currentBuild}
        onSelect={(url, slot) => onPartSelect(selectedPart, url, slot)}
      />
    );
  }

  return null;
}