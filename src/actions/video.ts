import { ScanStream } from "ioredis"
import { UploadVideoSchema, VideoFeedSchema } from "../types.ts";
import { string } from "zod";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



export const getVideoFeed = async(req:Request,res:Response):Promise<any>  =>{
      try{
        const {page = 1, limit = 20, category} = req.query;

        const parsedData = VideoFeedSchema.safeParse({
            page:Number(page),
            limit:Number(limit),
            category:category ? String(category) :undefined
        }) 

        if(!parsedData.success) {
            res.status(400).json({message: "Invalid queary paramter"})
        }       


        let videosQuery = prisma.video.findMany({
        ata
        })



      }catch(e) {

      }
}





export const uploadVideo = async(req:Request,res:Response):Promise<any> => {
    UploadVideoSchema
}