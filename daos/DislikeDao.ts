/**
 * @file Implements DAO managing data storage of dislikes. Uses mongoose DislikeModel
 * to integrate with MongoDB
 */
import DislikeDaoI from "../interfaces/DislikeDao";
import DislikeModel from "../mongoose/dislikes/DislikesModel";
import Tuit from "../models/tuits/Tuit";
import User from "../models/users/User";
import UserModel from "../mongoose/users/UserModel";
import TuitModel from "../mongoose/tuits/TuitModel";

/**
 * @class DislikeDao Implements Data Access Object managing data storage
 * of Dislikes
 * @property {DislikeDao} disliakDao Private single instance of LikeDao
 */
export default class DislikeDao implements DislikeDaoI {
    private static dislikeDao: DislikeDao | null = null;
    public static getInstance = (): DislikeDao => {
        if(DislikeDao.dislikeDao === null) {
            DislikeDao.dislikeDao = new DislikeDao();
        }
        return DislikeDao.dislikeDao;
    }
    private constructor() {}

    findAllUsersThatDislikedTuit = async (tid: string): Promise<User[]> =>
        DislikeModel
            .find({tuit: tid})
            .then(dislikes => {
                let res = [];
                for (const d of dislikes) {
                    res.push(d.dislikedBy);
                }

                return UserModel
                    .find({_id: {$in: res}})
                    .exec()
            });

    findAllTuitsDislikedByUser = async (uid: string): Promise<any[]> =>
        DislikeModel
            .find({dislikedBy: uid})
            .populate({
                path: 'tuit',
                populate: {
                    path: 'postedBy'
                }
            })
            .exec();

    findTuitDislikesCount = async (tid: string): Promise<number> =>
        DislikeModel
            .countDocuments({tuit: tid})
            .exec();

    userDislikesTuit = async (uid: string, tid: string): Promise<any> =>
        DislikeModel.create({tuit: tid, dislikedBy: uid});

    userUndislikesTuit = async (uid: string, tid: string): Promise<any> =>
        DislikeModel.deleteOne({tuit: tid, dislikedBy: uid});

    findUserDislikesTuit = async (uid, tid): Promise<any> =>
        DislikeModel.findOne({tuit: tid, dislikedBy: uid});
}