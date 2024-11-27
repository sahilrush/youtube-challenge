import { decode, verify } from "jsonwebtoken"
import { ChannelSchema, GetChannelSchema } from "../types.ts"
import { Request, Response } from "express"
import { JWT_PASSWORD } from "../config.js"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { any } from "zod"

const prisma = new PrismaClient()

export const createChanel = async (req: Request, res: Response) => {

    const parsedData = ChannelSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid parameters" })
        return
    }
    const { name, slug, description } = parsedData.data;

    try {
        const token = req.cookies.Authentication || req.headers.authorization?.split("")[1];

        if (!token) {
            res.status(401).json({ message: "Unauthorized" })
        }


        let userId: string;

        try {
            const decoded = jwt.verify(token, JWT_PASSWORD) as { userId: string };
            userId = decoded.userId
        } catch (e) {
            res.status(401).json({ message: "Invalid or expired token" });
            return
        }



        const existingChannel = await prisma.channel.findUnique({
            where: { userId }
        })

        if (existingChannel) {
            res.status(411).json({ message: "channel already exists" })
        }

        const existingSlug = await prisma.channel.findUnique({
            where: { slug }
        });

        if (existingSlug) {
            res.status(409).json({ message: "slug alredy exists" })
        }


        const newChannel = await prisma.channel.create({
            data: {
                name: name,
                description: description || null,
                slug,
                userId
            }
        })

        res.status(201).json({ message: "Channel succesfully created" })
    } catch (error) {
        res.status(500).json({ message: "internal server error" })

    }
}

export const getChannelDetail = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params
        const token = req.cookies.Authentication || req.headers.authorization?.split("")[1];
        if (!token) {
            res.status(401).json({ message: "unauthorized" })
            return
        }
        try {
            jwt.verify(token, JWT_PASSWORD);
        } catch (error) {
            res.status(401).json({ message: "Invalid or expired token" })
        }


        const channel = await prisma.channel.findUnique({
            where: { slug },
            include: {
                videos: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail_url: true 
                    }
                }
            }
        })

        if (!channel) {
            res.status(404).json({ message: "Channel not found" })
            return
        }

        const ResponseData = {
            id: channel?.id,
            name: channel?.name,
            description: channel?.description || null,
            subscriber_count: channel?.subscribersCount,
            videos: channel?.videos?.map(video => ({
                id: video.id,
                title: video.title,
                thumbnail_url: video.thumbnail_url
            })) 
        }

        const validation = GetChannelSchema.safeParse(ResponseData)
        if (!validation.success) {
            res.status(500).json({ message: "Response Validation failed" })
        }



        return res.status(200).json(ResponseData)
    }catch(e) {
        res.status(500).json({message:"internal server error"})
        return
    }
 
}
