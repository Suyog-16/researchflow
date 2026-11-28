import * as collectionService from "../services/collection.service.js";

export async function getAllCollections(req, res, next) {
  try {
    const { owner_id } = req.query;
    const collections = await collectionService.getAllCollections(owner_id);
    res.status(200).json(collections);
  } catch (error) {
    next(error);
  }
}

export async function createCollection(req, res, next) {
  try {
    const { name, owner_id } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Collection name is required" });
    }

    const collection = await collectionService.createCollection(name.trim(), owner_id);
    res.status(201).json({
      message: "Collection created successfully",
      data: collection,
    });
  } catch (error) {
    next(error);
  }
}
