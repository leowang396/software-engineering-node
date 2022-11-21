/**
 * @file Controller RESTful Web service API for likes resource
 */
import {Express, Request, Response} from "express";
import LikeDao from "../daos/LikeDao";
import LikeControllerI from "../interfaces/LikeController";
import User from "../models/users/User";
import Tuit from "../models/tuits/Tuit";
import TuitDao from "../daos/TuitDao";
import DislikeDao from "../daos/DislikeDao";

/**
 * @class LikeController Implements RESTful Web service API for likes resource.
 * Defines the following HTTP endpoints:
 * <ul>
 *    <li>GET /api/tuits/:tid/likes to retrieve all users that liked a tuit
 *     </li>
 *     <li>GET /api/users/:uid/likes to retrieve all the tuits liked by a user
 *     </li>
 *     <li>GET /api/tuits/:tid/likes/count to find number of likes received by a tuit
 *     </li>
 *     <li>PUT /api/users/:uid/likes/:tid to toggle like of a tuit</li>
 * </ul>
 * @property {LikeDao} likeDao Singleton DAO implementing likes CRUD operations
 * @property {DislikeDao} dislikeDao Singleton DAO implementing dislikes CRUD operations
 * @property {tuitDao} tuitDao Singleton DAO implementing tuits CRUD operations
 * @property {LikeController} LikeController Singleton controller implementing
 * RESTful Web service API
 */
export default class LikeController implements LikeControllerI {
    private static likeDao: LikeDao = LikeDao.getInstance();
    private static dislikeDao: DislikeDao = DislikeDao.getInstance();
    private static tuitDao: TuitDao = TuitDao.getInstance();
    private static likeController: LikeController | null = null;
    /**
     * Creates singleton controller instance
     * @param {Express} app Express instance to declare the RESTful Web service
     * API
     * @return TuitController
     */
    public static getInstance = (app: Express): LikeController => {
        if(LikeController.likeController === null) {
            LikeController.likeController = new LikeController();
            app.get("/api/users/:uid/likes", LikeController.likeController.findAllTuitsLikedByUser);
            app.get("/api/tuits/:tid/likes", LikeController.likeController.findAllUsersThatLikedTuit);
            app.get("/api/tuits/:tid/likes/count", LikeController.likeController.findTuitLikesCount);
            app.put("/api/users/:uid/likes/:tid", LikeController.likeController.userTogglesTuitLikes);
        }
        return LikeController.likeController;
    }

    private constructor() {}

    /**
     * Retrieves all users that liked a tuit from the database
     * @param {Request} req Represents request from client, including the path
     * parameter tid representing the liked tuit
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the user objects
     */
    findAllUsersThatLikedTuit = (req: Request, res: Response) =>
        LikeController.likeDao.findAllUsersThatLikedTuit(req.params.tid)
            .then((users: User[]) => res.json(users));

    /**
     * Retrieves all tuits liked by a user from the database
     * @param {Request} req Represents request from client, including the path
     * parameter uid representing the user liked the tuits
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the liked tuits populated with their sender
     */
    findAllTuitsLikedByUser = (req: any, res: any) => {
        const uid = req.params.uid;
        const profile = req.session['profile'];
        const userId = uid === "me" && profile
            ? profile._id
            : uid;

        LikeController.likeDao.findAllTuitsLikedByUser(userId)
            .then(populatedLikes => {
                const likesNonNullTuits = populatedLikes.filter(like => like.tuit);
                const tuitsFromLikes = likesNonNullTuits.map(like => like.tuit);
                res.json(tuitsFromLikes);
            });
    }

    /**
     * Counts all users that liked a tuit from the database
     * @param {Request} req Represents request from client, including the path
     * parameter tid representing the tuit liked by some users
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the total likes count
     */
    findTuitLikesCount = (req: Request, res: Response) =>
        LikeController.likeDao.findTuitLikesCount(req.params.tid)
            .then(likesCount => res.json(likesCount));

    /**
     * @param {Request} req Represents request from client, including the
     * path parameters uid and tid representing the user that is liking the tuit
     * and the tuit being liked
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the new likes that was inserted in the
     * database
     */
    userTogglesTuitLikes = async (req: any, res: any) => {
        const uid = req.params.uid;
        const tid = req.params.tid;
        const profile = req.session['profile'];
        const userId = uid === "me" && profile
            ? profile._id
            : uid;

        try {
            const userAlreadyLikedTuit = await LikeController.likeDao
                .findUserLikesTuit(userId, tid);
            const userAlreadyDislikedTuit = await LikeController.dislikeDao
                .findUserDislikesTuit(userId, tid);
            const howManyLikedTuit = await LikeController.likeDao
                .findTuitLikesCount(tid);
            const howManyDislikedTuit = await LikeController.dislikeDao
                .findTuitDislikesCount(tid);
            let tuit = await LikeController.tuitDao.findTuitById(tid);

            if (userAlreadyLikedTuit) {
                await LikeController.likeDao.userUnlikesTuit(userId, tid);
                tuit.stats.likes = howManyLikedTuit - 1;
            }
            else if (userAlreadyDislikedTuit) {
                await LikeController.likeDao.userLikesTuit(userId, tid);
                tuit.stats.likes = howManyLikedTuit + 1;
                await LikeController.dislikeDao.userUndislikesTuit(userId, tid);
                tuit.stats.dislikes = howManyDislikedTuit - 1;
            }
            else {
                await LikeController.likeDao.userLikesTuit(userId, tid);
                tuit.stats.likes = howManyLikedTuit + 1;
            };

            await LikeController.tuitDao.updateStats(tid, tuit.stats);
            res.sendStatus(200);
        }
        catch (e) {
            res.sendStatus(404);
        }
    };
};