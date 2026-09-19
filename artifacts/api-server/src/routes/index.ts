import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profitabilityRouter from "./profitability";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profitabilityRouter);

export default router;
