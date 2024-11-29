import { Router } from "express";
import { getVideoDetails, getVideoFeed, updateTimeStamp, uploadVideo } from "../actions/video";


export const videoRouter = Router()

videoRouter.get("/feed", getVideoFeed)
videoRouter.post("/upload", uploadVideo)
videoRouter.get("/{video_id}", getVideoDetails)
videoRouter.put("/{video_id}/time",updateTimeStamp)