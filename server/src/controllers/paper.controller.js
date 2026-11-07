import * as paperService from "../services/paper.service.js";

export async function createPaper(req, res, next) {
    try {
        const { owner_id, title, abstract, publication_year } = req.body;

        if (!owner_id || !title) {
            return res.status(400).json({
                message: "Owner ID and title are required"
            });
        }

        const paper = await paperService.createPaper({
            owner_id,
            title,
            abstract,
            publication_year
        });

        res.status(201).json({
            message: "Paper created successfully",
            data: paper
        });

    } catch (error) {
        next(error);
    }
}
export async function getAllPapers(req, res, next) {
    try {
        const { owner_id } = req.query;

        if (!owner_id) {
            return res.status(400).json({
                message: "Owner ID is required"
            });
        }

        const papers = await paperService.getAllPapers(owner_id);

        res.status(200).json({
            count: papers.length,
            data: papers
        });

    } catch (error) {
        next(error);
    }
}