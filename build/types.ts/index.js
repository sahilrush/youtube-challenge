"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTimestampSchema = exports.GetVideoDetailSchema = exports.UploadVideoSchema = exports.GetChannelSchema = exports.ChannelSchema = exports.VideoFeedSchema = exports.SignInSchema = exports.SignUpSchema = void 0;
const zod_1 = __importStar(require("zod"));
exports.SignUpSchema = zod_1.default.object({
    email: zod_1.z.string(),
    password: zod_1.z.string().min(6),
    username: zod_1.z.string(),
});
exports.SignInSchema = zod_1.default.object({
    email: zod_1.z.string(),
    password: zod_1.z.string()
});
exports.VideoFeedSchema = zod_1.default.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    thumbnail_url: zod_1.z.string().url(),
    creator: zod_1.z.string()
});
exports.ChannelSchema = zod_1.default.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    slug: zod_1.z.string()
});
exports.GetChannelSchema = zod_1.default.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    subscriber_count: zod_1.z.number(),
    video: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        thumbnail_url: zod_1.z.string().url()
    }))
});
exports.UploadVideoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    processing_status: zod_1.z.string(),
    qualities: zod_1.z.enum(["240p", "480p", "720p"])
});
exports.GetVideoDetailSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    creator: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        username: zod_1.z.string()
    })),
    status: zod_1.z.string()
});
exports.UpdateTimestampSchema = zod_1.z.object({
    video_id: zod_1.z.string(),
    timestamp: zod_1.z.string()
});
