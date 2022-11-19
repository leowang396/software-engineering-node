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
const LikeModel_1 = __importDefault(require("../mongoose/likes/LikeModel"));
const UserModel_1 = __importDefault(require("../mongoose/users/UserModel"));
const TuitModel_1 = __importDefault(require("../mongoose/tuits/TuitModel"));
/**
 * @class LikeDao Implements Data Access Object managing data storage
 * of Likes
 * @property {LikeDao} likeDao Private single instance of LikeDao
 */
class LikeDao {
    constructor() {
        this.findAllUsersThatLikedTuit = (tid) => __awaiter(this, void 0, void 0, function* () {
            return LikeModel_1.default.
                find({ tuit: tid }).
                then(likes => {
                let res = [];
                for (const l of likes) {
                    res.push(l.likedBy);
                }
                return UserModel_1.default.
                    find({ _id: {
                        $in: res
                    } }).
                    exec();
            });
        });
        this.findAllTuitsLikedByUser = (uid) => __awaiter(this, void 0, void 0, function* () {
            return LikeModel_1.default.
                find({ likedBy: uid }).
                then(likes => {
                let res = [];
                for (const l of likes) {
                    res.push(l.tuit);
                }
                return TuitModel_1.default.
                    find({ _id: {
                        $in: res
                    } }).
                    exec();
            });
        });
        this.findTuitLikesCount = (tid) => // (tid: string):
         __awaiter(this, void 0, void 0, function* () {
            return LikeModel_1.default
                .countDocuments({ tuit: tid })
                .exec();
        });
        this.userLikesTuit = (uid, tid) => __awaiter(this, void 0, void 0, function* () { return LikeModel_1.default.create({ tuit: tid, likedBy: uid }); });
        this.userUnlikesTuit = (uid, tid) => __awaiter(this, void 0, void 0, function* () { return LikeModel_1.default.deleteOne({ tuit: tid, likedBy: uid }); });
        this.findUserLikesTuit = (uid, tid) => __awaiter(this, void 0, void 0, function* () { return LikeModel_1.default.findOne({ tuit: tid, likedBy: uid }); });
    }
}
exports.default = LikeDao;
LikeDao.likeDao = null;
LikeDao.getInstance = () => {
    if (LikeDao.likeDao === null) {
        LikeDao.likeDao = new LikeDao();
    }
    return LikeDao.likeDao;
};
//# sourceMappingURL=LikeDao.js.map