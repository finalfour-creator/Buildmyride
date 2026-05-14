import Design from "../models/Design.js";

// Create a new design draft
export const createDesign = async (req, res) => {
  try {
    const { name, state } = req.body;
    const userId = req.user.id; 

    const newDesign = new Design({
      userId,
      name,
      state,
    });

    await newDesign.save();
    res.status(201).json(newDesign);
  } catch (error) {
    res.status(500).json({ message: "Error creating design", error: error.message });
  }
};

// Update an existing design (Auto-save)
export const updateDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const { state, name, thumbnail } = req.body;

    const updatedDesign = await Design.findByIdAndUpdate(
      id,
      { state, name, thumbnail },
      { new: true }
    );

    if (!updatedDesign) {
      return res.status(404).json({ message: "Design not found" });
    }

    res.json(updatedDesign);
  } catch (error) {
    res.status(500).json({ message: "Error updating design", error: error.message });
  }
};

// Get all designs for a specific user
export const getUserDesigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const designs = await Design.find({ userId }).sort({ updatedAt: -1 });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching designs", error: error.message });
  }
};

// Get a single design by ID
export const getDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const design = await Design.findById(id);

    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    res.json(design);
  } catch (error) {
    res.status(500).json({ message: "Error fetching design", error: error.message });
  }
};
