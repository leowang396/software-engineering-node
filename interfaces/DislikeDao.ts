import Dislikes from "../models/dislikes/Dislikes";
import User from "../models/users/User";
import Tuit from "../models/tuits/Tuit";

/**
 * @file Declares API for Dislikes related data access object methods
 */
export default interface DislikeDao {
    findAllUsersThatDislikedTuit (tid: string): Promise<User[]>;
    findAllTuitsDislikedByUser (uid: string): Promise<Tuit[]>;
    findTuitDislikesCount (tid: string): Promise<number>;
    userDislikesTuit (tid: string, uid: string): Promise<any>;
    userUndislikesTuit (tid: string, uid: string): Promise<any>;
    findUserDislikesTuit (tid: string, uid: string): Promise<any>;
};