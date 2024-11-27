"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const actions_1 = require("../actions");
const router = (0, express_1.Router)();
router.get("/health", (req, res) => {
    res.send("API Server is running");
});
router.post("/signup", actions_1.signup);
router.post("/signin", actions_1.signin);
exports.default = router;
