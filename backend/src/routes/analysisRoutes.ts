import express from "express";
import type { Request, Response } from "express";

const router = express.Router();

router.post("/analyze", (req: Request, res: Response) => {
  res.status(200).json({
    // Temporary response to confirm route + request body are working
    message: "SkillGuard analysis route is working",
    receivedData: req.body
  });
});

export default router;