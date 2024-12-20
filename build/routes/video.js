"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoRouter = void 0;
const express_1 = require("express");
const video_1 = require("../actions/video");
exports.videoRouter = (0, express_1.Router)();
exports.videoRouter.get("/feed", video_1.videoFeed);
exports.videoRouter.post("/upload", video_1.uploadVideo);
exports.videoRouter.get("/{video_id}", video_1.getVideoDetails);
exports.videoRouter.put("/{video_id}/time", video_1.updateTimeStamp);
