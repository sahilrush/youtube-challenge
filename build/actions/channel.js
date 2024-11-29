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
exports.getChannelDetail = exports.createChanel = void 0;
const types_ts_1 = require("../types.ts");
const config_js_1 = require("../config.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createChanel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parsedData = types_ts_1.ChannelSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid parameters" });
        return;
    }
    const { name, slug, description } = parsedData.data;
    try {
        const token = req.cookies.Authentication || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split("")[1]);
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
        }
        let userId;
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_js_1.JWT_PASSWORD);
            userId = decoded.userId;
        }
        catch (e) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
        const existingChannel = yield prisma.channel.findUnique({
            where: { userId }
        });
        if (existingChannel) {
            res.status(411).json({ message: "channel already exists" });
        }
        const existingSlug = yield prisma.channel.findUnique({
            where: { slug }
        });
        if (existingSlug) {
            res.status(409).json({ message: "slug alredy exists" });
        }
        const newChannel = yield prisma.channel.create({
            data: {
                name: name,
                description: description || null,
                slug,
                userId
            }
        });
        res.status(201).json({ message: "Channel succesfully created" });
    }
    catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});
exports.createChanel = createChanel;
const getChannelDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const { slug } = req.params;
        const token = req.cookies.Authentication || ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split("")[1]);
        if (!token) {
            res.status(401).json({ message: "unauthorized" });
            return;
        }
        try {
            jsonwebtoken_1.default.verify(token, config_js_1.JWT_PASSWORD);
        }
        catch (error) {
            res.status(401).json({ message: "Invalid or expired token" });
        }
        const channel = yield prisma.channel.findUnique({
            where: { slug },
            include: {
                videos: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true
                    }
                }
            }
        });
        if (!channel) {
            res.status(404).json({ message: "Channel not found" });
            return;
        }
        const ResponseData = {
            id: channel === null || channel === void 0 ? void 0 : channel.id,
            name: channel === null || channel === void 0 ? void 0 : channel.name,
            description: (channel === null || channel === void 0 ? void 0 : channel.description) || null,
            subscriber_count: channel === null || channel === void 0 ? void 0 : channel.subscribersCount,
            videos: (_c = channel === null || channel === void 0 ? void 0 : channel.videos) === null || _c === void 0 ? void 0 : _c.map(video => ({
                id: video.id,
                title: video.title,
                thumbnail_url: video.thumbnailUrl
            }))
        };
        const validation = types_ts_1.GetChannelSchema.safeParse(ResponseData);
        if (!validation.success) {
            res.status(500).json({ message: "Response Validation failed" });
        }
        return res.status(200).json(ResponseData);
    }
    catch (e) {
        res.status(500).json({ message: "internal server error" });
        return;
    }
});
exports.getChannelDetail = getChannelDetail;
