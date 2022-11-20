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
const DislikesModel_1 = __importDefault(require("../mongoose/dislikes/DislikesModel"));
const UserModel_1 = __importDefault(require("../mongoose/users/UserModel"));
const TuitModel_1 = __importDefault(require("../mongoose/tuits/TuitModel"));
/**
 * @class DislikeDao Implements Data Access Object managing data storage
 * of Dislikes
 * @property {DislikeDao} disliakDao Private single instance of LikeDao
 */
class DislikeDao {
    constructor() {
        this.findAllUsersThatDislikedTuit = (tid) => __awaiter(this, void 0, void 0, function* () {
            return DislikesModel_1.default
                .find({ tuit: tid })
                .then(dislikes => {
                let res = [];
                for (const d of dislikes) {
                    res.push(d.dislikedBy);
                }
                return UserModel_1.default
                    .find({ _id: { $in: res } })
                    .exec();
            });
        });
        this.findAllTuitsDislikedByUser = (uid) => __awaiter(this, void 0, void 0, function* () {
            return DislikesModel_1.default
                .find({ dislikedBy: uid })
                .
                    then(dislikes => {
                let res = [];
                for (const d of dislikes) {
                    res.push(d.tuit);
                }
                return TuitModel_1.default
                    .find({ _id: { $in: res } })
                    .exec();
            });
        });
        this.findTuitDislikesCount = (tid) => __awaiter(this, void 0, void 0, function* () {
            return DislikesModel_1.default
                .countDocuments({ tuit: tid })
                .exec();
        });
        this.userDislikesTuit = (uid, tid) => __awaiter(this, void 0, void 0, function* () { return DislikesModel_1.default.create({ tuit: tid, dislikedBy: uid }); });
        this.userUndislikesTuit = (uid, tid) => __awaiter(this, void 0, void 0, function* () { return DislikesModel_1.default.deleteOne({ tuit: tid, dislikedBy: uid }); });
        this.findUserDislikesTuit = (uid, tid) => __awaiter(this, void 0, void 0, function* () { return DislikesModel_1.default.findOne({ tuit: tid, dislikedBy: uid }); });
    }
}
exports.default = DislikeDao;
DislikeDao.dislikeDao = null;
DislikeDao.getInstance = () => {
    if (DislikeDao.dislikeDao === null) {
        DislikeDao.dislikeDao = new DislikeDao();
    }
    return DislikeDao.dislikeDao;
};
//# sourceMappingURL=DislikeDao.js.map