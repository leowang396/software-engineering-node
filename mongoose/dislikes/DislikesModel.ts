/**
 * @file Implements mongoose model to CRUD documents in the dislikes collection
 */
import mongoose from "mongoose";
import DislikesSchema from "./DislikesSchema";

const DislikeModel = mongoose.model("DislikeModel", DislikesSchema);
export default DislikeModel;