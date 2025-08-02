import express from "express";
import {signup, login} from "../controllers/user";
import {emailBreach} from "../controllers/emailBreach";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/email-breach", emailBreach);

export default router;