/**
 * @file Implements DAO managing data storage of likes. Uses mongoose LikeModel
 * to integrate with MongoDB
 */
import LikeDaoI from "../interfaces/LikeDao";
import LikeModel from "../mongoose/likes/LikeModel";
import Tuit from "../models/tuits/Tuit";
import User from "../models/users/User";
import UserModel from "../mongoose/users/UserModel";
import TuitModel from "../mongoose/tuits/TuitModel";

/**
 * @class LikeDao Implements Data Access Object managing data storage
 * of Likes
 * @property {LikeDao} likeDao Private single instance of LikeDao
 */
export default class LikeDao implements LikeDaoI {
    private static likeDao: LikeDao | null = null;
    public static getInstance = (): LikeDao => {
        if(LikeDao.likeDao === null) {
            LikeDao.likeDao = new LikeDao();
        }
        return LikeDao.likeDao;
    }
    private constructor() {}

    findAllUsersThatLikedTuit = async (tid: string): Promise<User[]> =>
        LikeModel.
        find({tuit: tid}).
        then(likes => {
            let res = [];
            for (const l of likes) {
                res.push(l.likedBy);
            }

            return UserModel.
            find({_id: {
                $in: res
            }}).
            exec()
        });
    findAllTuitsLikedByUser = async (uid: string): Promise<Tuit[]> =>
        LikeModel.
        find({likedBy: uid}).
        then(likes => {
            let res = [];
            for (const l of likes) {
                res.push(l.tuit)
            }

            return TuitModel.
                find({_id: {
                    $in: res
                }}).
                exec()
        });
    findTuitLikesCount = async (tid: string): Promise<number> => // (tid: string):
        LikeModel
            .countDocuments({tuit: tid})
            .exec();
    userLikesTuit = async (uid: string, tid: string): Promise<any> =>
        LikeModel.create({tuit: tid, likedBy: uid});
    userUnlikesTuit = async (uid: string, tid: string): Promise<any> =>
        LikeModel.deleteOne({tuit: tid, likedBy: uid});
    findUserLikesTuit = async (uid, tid) =>
        LikeModel.findOne({tuit: tid, likedBy: uid});
}