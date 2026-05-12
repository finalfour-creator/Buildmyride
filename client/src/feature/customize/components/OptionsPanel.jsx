import BodyOptions from "./BodyOptions";
import Wheel1Options from "./Wheel1Options";
import ModularPartOptions from "./ModularPartOptions";

export default function OptionsPanel({
  selectedPart, // This is now the category name (e.g. "bumper", "spoiler")
  availableParts,
  currentBuild,
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
  // We match the selectedPart (id) to the availableParts (category name)
  const categoryKey = Object.keys(availableParts).find(
    k => k.toLowerCase() === selectedPart.toLowerCase()
  );

  if (categoryKey) {
    return (
      <ModularPartOptions
        category={categoryKey}
        options={availableParts[categoryKey]}
        selectedPartUrl={currentBuild[categoryKey]}
        onSelect={(url) => onPartSelect(categoryKey, url)}
      />
    );
  }

  return null;
}