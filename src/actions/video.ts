import { ScanStream } from "ioredis"
import { GetVideoDetailSchema, UpdateTimestampSchema, UploadVideoSchema, VideoFeedSchema, VideoInputSchema } from "../types.ts";
import { string } from "zod";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from 'multer';
import { v4 as uuidv4, validate } from "uuid";
import { JWT_PASSWORD } from "../config.js";
import jwt from "jsonwebtoken";
import { parse } from "dotenv";



const prisma = new PrismaClient();



export const getVideoFeed = async (req: Request, res: Response): Promise<any> => {
    try {
        const { page = 1, limit = 20, category } = req.query;

        const parsedData = VideoFeedSchema.safeParse({
            page: Number(page),
            limit: Number(limit),
            category: category ? String(category) : undefined
        })

        if (!parsedData.success) {
            res.status(400).json({ message: "Invalid queary paramter" })
        }


        let videosQuery = prisma.video.findMany({

        })



    } catch (e) {

    }
}



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/videos")
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`)
    }
})

const upload = multer({ storage });


export const uploadVideo = [upload.single("file"), async (req: Request, res: Response): Promise<any> => {
    try {
        const token = req.cookies.Authentication || req.headers.authorization?.split("")[1];
        if (!token) {
            res.status(401).json({ message: "unauthorized" })
            return
        }

        try {
            jwt.verify(token, JWT_PASSWORD!);
        } catch (e) {
            res.status(401).json({ message: "Invalid or expired token" })
            return
        }

        const { title, description, category } = req.body;

        const parsedData = VideoInputSchema.safeParse({ title, description, category })
        if (!parsedData.success) {
            res.status(400).json({ message: "Invalid queary paramter" })
            return
        }

        if (!req.file) {
            res.status(400).json({ message: "Invalid file" })
            return
        }


        const video = await prisma.video.create({
            data: {
                id: uuidv4(),
                title: parsedData.data.title,
                description: parsedData.data.description,
                category: parsedData.data.category as any, // Assuming category is a valid VideoCategory enum value
                status: "PROCESSING",
                channel: {
                    connect: { id: (req as any).user.channelId }, // Connect the channel by its ID
                },
                creator: {
                    connect: { id: (req as any).user.id }, // Connect the creator by their ID
                },
            },
        });


        const qualities = ["240p", "480p", "720p"]



        await Promise.all(
            qualities.map((quality) => {
                prisma.videoUrl.create({
                    data: {
                        id: uuidv4(),
                        quality,
                        url: `/uploads/videos/${req.file?.fieldname}`,
                        videoId: video.id
                    }
                })
            })
        )

        const response = {
            id: video.id,
            title: video.title,
            processing_status: video.status,
            qualities: qualities
        }

        const validaiton = UploadVideoSchema.safeParse(response);
        if (!validaiton.success) {
            res.status(500).json({ message: "Response validaiton failed" })
            return
        }

        return res.status(201).json(response)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}]


export const getVideoDetails = async (req: Request, res: Response): Promise<any> => {
    try {

        const { video_id } = req.params;

        const videoDetails = await prisma.video.findUnique({
            where: { id: video_id },
            select: {
                id: true,
                title: true,
                description: true,
                creator: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                status: true
            }
        })


        if (!videoDetails) {
            res.status(404).json({ message: "Video not found" })
            return
        }

        const validaiton = GetVideoDetailSchema.safeParse(videoDetails);
        if (!validaiton.success) {
            res.status(500).json({ message: "Response validaiton failed" })
        }
        return res.status(200).json(videoDetails);
    } catch (e) {
        res.status(500).json({ message: "Internal server error" })
    }

}



export const updateTimeStamp = async (res: Response, req: Request):Promise<any> => {
    try {

        const token = req.cookies.Authentication || req.headers.authorization?.split("")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        let userId: string;
        try {
            const decoded = jwt.verify(token, JWT_PASSWORD);
            userId = (decoded as { id: string }).id;
        } catch (e) {
            res.status(401).json({ message: "Invalid or expired token" })
            return
        }


        const validationResult = UpdateTimestampSchema.safeParse(req.body)
        if (!validationResult.success) {
            res.status(400).json({ message: "TimeStamp must be valid, non negative number" })
            return
        }


        const { video_id, timestamp } = validationResult.data
        const parsedTimestamp = parseFloat(timestamp);
        if (isNaN(parsedTimestamp) || parsedTimestamp < 0) {
            res.status(400).json({ message: "Timestamo must be a valid number" })
        }


        const video = await prisma.video.findUnique({
            where: { id: video_id }
        });
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        if (parsedTimestamp > video.currentTimestamp) {
            return res.status(400).json({ message: "Timestamp exceeds video length" });
        }



        await prisma.videoTimeUpdate.create({
            data: {
                userId: userId,
                videoId: video_id,
                timestamp: parsedTimestamp
            }
        })


        return res.status(201).json({ message: "Timestamp updated successfully" });





    } catch (e) {
        return res.status(500).json({ message: "Internal server error" });

    }


}

