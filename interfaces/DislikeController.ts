import {Request, Response} from "express";

/**
 * Interface representing the dislike controller.
 *
 * @interface
 */
export default interface DislikeControllerI {
    findAllUsersThatDislikedTuit (req: Request, res: Response): void;
    findAllTuitsDislikedByUser (req: Request, res: Response): void;
    findTuitDislikesCount (req: Request, res: Response): void;
    userTogglesTuitDislikes (req: Request, res: Response): void;
};