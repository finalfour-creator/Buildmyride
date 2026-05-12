import Part from "../models/Part.js";

// @desc    Get all parts (optionally filtered by carId and category)
// @route   GET /api/parts
export const getParts = async (req, res) => {
  try {
    const { carId, category } = req.query;
    let query = {};

    if (carId) {
      query.compatibleCars = carId;
    }
    if (category) {
      query.category = category;
    }

    const parts = await Part.find(query);
    res.status(200).json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new part
// @route   POST /api/parts
export const createPart = async (req, res) => {
  try {
    const part = await Part.create(req.body);
    res.status(201).json(part);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single part
// @route   GET /api/parts/:id
export const getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) return res.status(404).json({ message: "Part not found" });
    res.status(200).json(part);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
