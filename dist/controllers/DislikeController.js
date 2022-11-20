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
const DislikeDao_1 = __importDefault(require("../daos/DislikeDao"));
const TuitDao_1 = __importDefault(require("../daos/TuitDao"));
const LikeDao_1 = __importDefault(require("../daos/LikeDao"));
/**
 * @class DislikeController Implements RESTful Web service API for the dislike resources.
 * Defines the following HTTP endpoints:
 * <ul>
 *     <li>GET /api/tuits/:tid/dislikes to retrieve all users that disliked a tuit
 *     </li>
 *     <li>GET /api/users/:uid/dislikes to retrieve all the tuits disliked by a user
 *     </li>
 *     <li>GET /api/tuits/:tid/dislikes/count to find number of dislikes received by a tuit
 *     </li>
 *     <li>PUT /api/users/:uid/dislikes/:tid to toggle dislike of a tuit</li>
 * </ul>
 * @property {LikeDao} likeDao Singleton DAO implementing likes CRUD operations
 * @property {DislikeDao} dislikeDao Singleton DAO implementing dislikes CRUD operations
 * @property {tuitDao} tuitDao Singleton DAO implementing tuits CRUD operations
 * @property {dislikeController} DislikeController Singleton controller implementing
 * RESTful Web service API
 */
class DislikeController {
    constructor() {
        /**
         * Retrieves all users that disliked a tuit from the database
         * @param {Request} req Represents request from client, including the path
         * parameter tid representing the disliked tuit
         * @param {Response} res Represents response to client, including the
         * body formatted as JSON arrays containing the user objects
         */
        this.findAllUsersThatDislikedTuit = (req, res) => DislikeController.dislikeDao.findAllUsersThatDislikedTuit(req.params.tid)
            .then((users) => res.json(users));
        /**
         * Retrieves all tuits disliked by a user from the database
         * @param {Request} req Represents request from client, including the path
         * parameter uid representing the user disliked the tuits
         * @param {Response} res Represents response to client, including the
         * body formatted as JSON arrays containing the tuit objects that were disliked
         */
        this.findAllTuitsDislikedByUser = (req, res) => DislikeController.dislikeDao.findAllTuitsDislikedByUser(req.params.uid)
            .then((tuits) => res.json(tuits));
        /**
         * Counts all users that disliked a tuit from the database
         * @param {Request} req Represents request from client, including the path
         * parameter tid representing the tuit disliked by some users
         * @param {Response} res Represents response to client, including the
         * body formatted as JSON the total dislikes count
         */
        this.findTuitDislikesCount = (req, res) => DislikeController.dislikeDao.findTuitDislikesCount(req.params.tid)
            .then(dislikesCount => res.json(dislikesCount));
        /**
         * @param {Request} req Represents request from client, including the
         * path parameters uid and tid representing the user that is disliking the tuit
         * and the tuit being disliked
         * @param {Response} res Represents response to client, including the
         * body formatted as JSON containing the new dislike that was inserted in the database
         */
        this.userTogglesTuitDislikes = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const uid = req.params.uid;
            const tid = req.params.tid;
            const profile = req.session['profile'];
            const userId = uid === "me" && profile
                ? profile._id
                : uid;
            try {
                const userAlreadyLikedTuit = yield DislikeController.likeDao
                    .findUserLikesTuit(userId, tid);
                const userAlreadyDislikedTuit = yield DislikeController.dislikeDao
                    .findUserDislikesTuit(userId, tid);
                const howManyLikedTuit = yield DislikeController.likeDao
                    .findTuitLikesCount(tid);
                const howManyDislikedTuit = yield DislikeController.dislikeDao
                    .findTuitDislikesCount(tid);
                let tuit = yield DislikeController.tuitDao.findTuitById(tid);
                if (userAlreadyLikedTuit) {
                    yield DislikeController.likeDao.userUnlikesTuit(userId, tid);
                    tuit.stats.likes = howManyLikedTuit - 1;
                    yield DislikeController.dislikeDao.userDislikesTuit(userId, tid);
                    tuit.stats.dislikes = howManyDislikedTuit + 1;
                }
                else if (userAlreadyDislikedTuit) {
                    yield DislikeController.dislikeDao.userUndislikesTuit(userId, tid);
                    tuit.stats.dislikes = howManyDislikedTuit - 1;
                }
                else {
                    yield DislikeController.dislikeDao.userDislikesTuit(userId, tid);
                    tuit.stats.dislikes = howManyDislikedTuit + 1;
                }
                ;
                yield DislikeController.tuitDao.updateStats(tid, tuit.stats);
                res.sendStatus(200);
            }
            catch (e) {
                res.sendStatus(404);
            }
        });
    }
}
exports.default = DislikeController;
DislikeController.likeDao = LikeDao_1.default.getInstance();
DislikeController.dislikeDao = DislikeDao_1.default.getInstance();
DislikeController.tuitDao = TuitDao_1.default.getInstance();
DislikeController.dislikeController = null;
/**
 * Creates singleton controller instance
 * @param {Express} app Express instance to declare the RESTful Web service API
 * @return DislikeController
 */
DislikeController.getInstance = (app) => {
    if (DislikeController.dislikeController === null) {
        DislikeController.dislikeController = new DislikeController();
        app.get("/api/tuits/:tid/dislikes", DislikeController.dislikeController.findAllUsersThatDislikedTuit);
        app.get("/api/users/:uid/dislikes", DislikeController.dislikeController.findAllTuitsDislikedByUser);
        app.get("/api/tuits/:tid/dislikes/count", DislikeController.dislikeController.findTuitDislikesCount);
        app.put("/api/users/:uid/dislikes/:tid", DislikeController.dislikeController.userTogglesTuitDislikes);
    }
    return DislikeController.dislikeController;
};
;
//# sourceMappingURL=DislikeController.js.map