import Like from "../models/likes/Likes";
import User from "../models/users/User";
import Tuit from "../models/tuits/Tuit";

/**
 * @file Declares API for Likes related data access object methods
 */
export default interface LikeDao {
    findAllUsersThatLikedTuit (tid: string): Promise<User[]>;
    findAllTuitsLikedByUser (uid: string): Promise<any[]>;
    findTuitLikesCount (tid: string): Promise<number>;
    userUnlikesTuit (tid: string, uid: string): Promise<any>;
    userLikesTuit (tid: string, uid: string): Promise<any>;
    findUserLikesTuit (tid: string, uid: string): Promise<any>;
};