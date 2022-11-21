/**
 * @file Controller for the dislike RESTful Web service API
 */
import {Express, Request, Response} from "express";
import DislikeDao from "../daos/DislikeDao";
import DislikeControllerI from "../interfaces/DislikeController";
import User from "../models/users/User";
import Tuit from "../models/tuits/Tuit";
import TuitDao from "../daos/TuitDao";
import LikeDao from "../daos/LikeDao";

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
export default class DislikeController implements DislikeControllerI {
    private static likeDao: LikeDao = LikeDao.getInstance();
    private static dislikeDao: DislikeDao = DislikeDao.getInstance();
    private static tuitDao: TuitDao = TuitDao.getInstance();
    private static dislikeController: DislikeController | null = null;
    /**
     * Creates singleton controller instance
     * @param {Express} app Express instance to declare the RESTful Web service API
     * @return DislikeController
     */
    public static getInstance = (app: Express): DislikeController => {
        if(DislikeController.dislikeController === null) {
            DislikeController.dislikeController = new DislikeController();
            app.get("/api/tuits/:tid/dislikes", DislikeController.dislikeController.findAllUsersThatDislikedTuit);
            app.get("/api/users/:uid/dislikes", DislikeController.dislikeController.findAllTuitsDislikedByUser);
            app.get("/api/tuits/:tid/dislikes/count", DislikeController.dislikeController.findTuitDislikesCount);
            app.put("/api/users/:uid/dislikes/:tid", DislikeController.dislikeController.userTogglesTuitDislikes);
        }
        return DislikeController.dislikeController;
    }
    private constructor() {}

    /**
     * Retrieves all users that disliked a tuit from the database
     * @param {Request} req Represents request from client, including the path
     * parameter tid representing the disliked tuit
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the user objects
     */
    findAllUsersThatDislikedTuit = (req: Request, res: Response) =>
        DislikeController.dislikeDao.findAllUsersThatDislikedTuit(req.params.tid)
            .then((users: User[]) => res.json(users));

    /**
     * Retrieves all tuits disliked by a user from the database
     * @param {Request} req Represents request from client, including the path
     * parameter uid representing the user disliked the tuits
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the disliked tuit objects and their sender
     */
    findAllTuitsDislikedByUser = (req: any, res: any) => {
        const uid = req.params.uid;
        const profile = req.session['profile'];
        const userId = uid === "me" && profile
            ? profile._id
            : uid;

        DislikeController.dislikeDao.findAllTuitsDislikedByUser(userId)
            .then(populatedDislikes => {
                const dislikesNonNullTuits = populatedDislikes.filter(dislike => dislike.tuit);
                const tuitsFromDislikes = dislikesNonNullTuits.map(dislike => dislike.tuit);
                res.json(tuitsFromDislikes);
            });
    }

    /**
     * Counts all users that disliked a tuit from the database
     * @param {Request} req Represents request from client, including the path
     * parameter tid representing the tuit disliked by some users
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON the total dislikes count
     */
    findTuitDislikesCount = (req: Request, res: Response) =>
        DislikeController.dislikeDao.findTuitDislikesCount(req.params.tid)
            .then(dislikesCount => res.json(dislikesCount));

    /**
     * @param {Request} req Represents request from client, including the
     * path parameters uid and tid representing the user that is disliking the tuit
     * and the tuit being disliked
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the new dislike that was inserted in the database
     */
    userTogglesTuitDislikes = async (req: any, res: any) => {
        const uid = req.params.uid;
        const tid = req.params.tid;
        const profile = req.session['profile'];
        const userId = uid === "me" && profile
            ? profile._id
            : uid;

        try {
            const userAlreadyLikedTuit = await DislikeController.likeDao
                .findUserLikesTuit(userId, tid);
            const userAlreadyDislikedTuit = await DislikeController.dislikeDao
                .findUserDislikesTuit(userId, tid);
            const howManyLikedTuit = await DislikeController.likeDao
                .findTuitLikesCount(tid);
            const howManyDislikedTuit = await DislikeController.dislikeDao
                .findTuitDislikesCount(tid);
            let tuit = await DislikeController.tuitDao.findTuitById(tid);

            if (userAlreadyLikedTuit) {
                await DislikeController.likeDao.userUnlikesTuit(userId, tid);
                tuit.stats.likes = howManyLikedTuit - 1;
                await DislikeController.dislikeDao.userDislikesTuit(userId, tid);
                tuit.stats.dislikes = howManyDislikedTuit + 1;
            }
            else if (userAlreadyDislikedTuit) {
                await DislikeController.dislikeDao.userUndislikesTuit(userId, tid);
                tuit.stats.dislikes = howManyDislikedTuit - 1;
            }
            else {
                await DislikeController.dislikeDao.userDislikesTuit(userId, tid);
                tuit.stats.dislikes = howManyDislikedTuit + 1;
            };

            await DislikeController.tuitDao.updateStats(tid, tuit.stats);
            res.sendStatus(200);
        }
        catch (e) {
            res.sendStatus(404);
        }
    };
};