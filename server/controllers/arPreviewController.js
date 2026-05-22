import ArPreview from "../models/ArPreview.js";

/** POST /api/ar-previews — create saved AR session */
export const createArPreview = async (req, res) => {
  try {
    const { name, thumbnail, state } = req.body;

    const doc = new ArPreview({
      userId: req.user.id,
      name: name || "AR Preview",
      thumbnail: thumbnail || "",
      state: state || {},
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({
      message: "Error creating AR preview",
      error: error.message,
    });
  }
};

/** GET /api/ar-previews — list current user's AR saves */
export const getUserArPreviews = async (req, res) => {
  try {
    const list = await ArPreview.find({ userId: req.user.id }).sort({
      updatedAt: -1,
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching AR previews",
      error: error.message,
    });
  }
};

/** GET /api/ar-previews/:id — load one AR save (own user only) */
export const getArPreviewById = async (req, res) => {
  try {
    const doc = await ArPreview.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({ message: "AR preview not found" });
    }

    res.json(doc);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching AR preview",
      error: error.message,
    });
  }
};

/** PUT /api/ar-previews/:id — update snapshot and/or part state */
export const updateArPreview = async (req, res) => {
  try {
    const { name, thumbnail, state } = req.body;
    const updates = {};

    if (name != null) updates.name = name;
    if (thumbnail != null) updates.thumbnail = thumbnail;
    if (state != null) updates.state = state;

    const updated = await ArPreview.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "AR preview not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Error updating AR preview",
      error: error.message,
    });
  }
};

/** DELETE /api/ar-previews/:id */
export const deleteArPreview = async (req, res) => {
  try {
    const deleted = await ArPreview.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "AR preview not found" });
    }

    res.json({ message: "AR preview deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting AR preview",
      error: error.message,
    });
  }
};
