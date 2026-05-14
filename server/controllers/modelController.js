
import CarModel from "../models/CarModels.js";

export const createModel = async (req, res) => {
  try {
    const model = await CarModel.create(req.body);
    res.status(201).json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getModels = async (req, res) => {
  try {
    const models = await CarModel.find();
    res.status(200).json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getModelById = async (req, res) => {
  try {
    const model = await CarModel.findById(req.params.id);
    if (!model) return res.status(404).json({ message: "Car model not found" });
    res.status(200).json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};