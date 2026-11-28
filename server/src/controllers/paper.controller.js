import * as paperService from "../services/paper.service.js";

export async function getAllPapers(req, res, next) {
  try {
    const { owner_id } = req.query;
    const papers = await paperService.getAllPapers(owner_id);
    res.status(200).json(papers);
  } catch (error) {
    next(error);
  }
}

export async function getPaperById(req, res, next) {
  try {
    const { id } = req.params;
    const paper = await paperService.getPaperById(id);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.status(200).json(paper);
  } catch (error) {
    next(error);
  }
}

export async function createPaper(req, res, next) {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Paper title is required" });
    }

    const paper = await paperService.createPaper(req.body);
    res.status(201).json({
      message: "Paper created successfully",
      data: paper,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePaper(req, res, next) {
  try {
    const { id } = req.params;
    const paper = await paperService.updatePaper(id, req.body);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.status(200).json({
      message: "Paper updated successfully",
      data: paper,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePaper(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await paperService.deletePaper(id);
    if (!deleted) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.status(200).json({ message: "Paper deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function updateNotes(req, res, next) {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const paper = await paperService.updatePaper(id, { notes: notes || "" });
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.status(200).json({
      message: "Notes updated successfully",
      data: paper,
    });
  } catch (error) {
    next(error);
  }
}

export async function addHighlight(req, res, next) {
  try {
    const { id } = req.params;
    const highlight = req.body;
    const paper = await paperService.addHighlight(id, highlight);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.status(200).json({
      message: "Highlight added successfully",
      data: paper,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteHighlight(req, res, next) {
  try {
    const { id, highlightId } = req.params;
    const paper = await paperService.deleteHighlight(id, highlightId);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.status(200).json({
      message: "Highlight deleted successfully",
      data: paper,
    });
  } catch (error) {
    next(error);
  }
}
