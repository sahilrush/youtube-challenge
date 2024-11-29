"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTimeStamp = exports.getVideoDetails = exports.uploadVideo = exports.getVideoFeed = void 0;
const types_ts_1 = require("../types.ts");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const config_js_1 = require("../config.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const getVideoFeed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20, category } = req.query;
        const parsedData = types_ts_1.VideoFeedSchema.safeParse({
            page: Number(page),
            limit: Number(limit),
            category: category ? String(category) : undefined
        });
        if (!parsedData.success) {
            res.status(400).json({ message: "Invalid queary paramter" });
        }
        let videosQuery = prisma.video.findMany({});
    }
    catch (e) {
    }
});
exports.getVideoFeed = getVideoFeed;
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/videos");
    },
    filename: (req, file, cb) => {
        cb(null, `${(0, uuid_1.v4)()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage });
exports.uploadVideo = [upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const token = req.cookies.Authentication || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split("")[1]);
            if (!token) {
                res.status(401).json({ message: "unauthorized" });
                return;
            }
            try {
                jsonwebtoken_1.default.verify(token, config_js_1.JWT_PASSWORD);
            }
            catch (e) {
                res.status(401).json({ message: "Invalid or expired token" });
                return;
            }
            const { title, description, category } = req.body;
            const parsedData = types_ts_1.VideoInputSchema.safeParse({ title, description, category });
            if (!parsedData.success) {
                res.status(400).json({ message: "Invalid queary paramter" });
                return;
            }
            if (!req.file) {
                res.status(400).json({ message: "Invalid file" });
                return;
            }
            const video = yield prisma.video.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    title: parsedData.data.title,
                    description: parsedData.data.description,
                    category: parsedData.data.category,
                    status: "PROCESSING",
                    channel: {
                        connect: { id: req.user.channelId }, // Connect the channel by its ID
                    },
                    creator: {
                        connect: { id: req.user.id }, // Connect the creator by their ID
                    },
                },
            });
            const qualities = ["240p", "480p", "720p"];
            yield Promise.all(qualities.map((quality) => {
                var _a;
                prisma.videoUrl.create({
                    data: {
                        id: (0, uuid_1.v4)(),
                        quality,
                        url: `/uploads/videos/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.fieldname}`,
                        videoId: video.id
                    }
                });
            }));
            const response = {
                id: video.id,
                title: video.title,
                processing_status: video.status,
                qualities: qualities
            };
            const validaiton = types_ts_1.UploadVideoSchema.safeParse(response);
            if (!validaiton.success) {
                res.status(500).json({ message: "Response validaiton failed" });
                return;
            }
            return res.status(201).json(response);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    })];
const getVideoDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { video_id } = req.params;
        const videoDetails = yield prisma.video.findUnique({
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
        });
        if (!videoDetails) {
            res.status(404).json({ message: "Video not found" });
            return;
        }
        const validaiton = types_ts_1.GetVideoDetailSchema.safeParse(videoDetails);
        if (!validaiton.success) {
            res.status(500).json({ message: "Response validaiton failed" });
        }
        return res.status(200).json(videoDetails);
    }
    catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getVideoDetails = getVideoDetails;
const updateTimeStamp = (res, req) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const token = req.cookies.Authentication || ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split("")[1]);
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        let userId;
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_js_1.JWT_PASSWORD);
            userId = decoded.id;
        }
        catch (e) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
        const validationResult = types_ts_1.UpdateTimestampSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ message: "TimeStamp must be valid, non negative number" });
            return;
        }
        const { video_id, timestamp } = validationResult.data;
        const parsedTimestamp = parseFloat(timestamp);
        if (isNaN(parsedTimestamp) || parsedTimestamp < 0) {
            res.status(400).json({ message: "Timestamo must be a valid number" });
        }
        const video = yield prisma.video.findUnique({
            where: { id: video_id }
        });
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }
        if (parsedTimestamp > video.currentTimestamp) {
            return res.status(400).json({ message: "Timestamp exceeds video length" });
        }
        yield prisma.videoTimeUpdate.create({
            data: {
                userId: userId,
                videoId: video_id,
                timestamp: parsedTimestamp
            }
        });
        return res.status(201).json({ message: "Timestamp updated successfully" });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateTimeStamp = updateTimeStamp;