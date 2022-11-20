/**
 * @file Implements an Express Node HTTP server.
 */
import express, {Request, Response} from 'express';
import mongoose from "mongoose";
import AuthController from "./controllers/AuthController";
import BookmarkController from "./controllers/BookmarkController";
import DislikeController from "./controllers/DislikeController";
import FollowController from "./controllers/FollowController";
import LikeController from "./controllers/LikeController";
import MessageController from "./controllers/MessageController";
import TuitController from "./controllers/TuitController";
import UserController from "./controllers/UserController";
const session = require('express-session');
const cors = require('cors')
const app = express();
// Sets the Access-Control-Allow-Origin response header to the req origin.
const corsConfig = {
    credentials: true,
    origin: true,
};
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Creates the session middleware.
let sess = {
    secret: process.env.SECRET,
    cookie: {
        secure: false
    }
}
if (process.env.ENV == 'PRODUCTION') {
    app.set('trust proxy', 1)
    sess.cookie.secure = true
}
app.use(session(sess));

app.get('/', (req: Request, res: Response) =>
    res.send('<h1>App Loaded!</h1>'));
const uri = `mongodb+srv://lwang369:${process.env.mongodbpw}@cluster0.xwyngvl.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(uri);

UserController.getInstance(app);
TuitController.getInstance(app);
LikeController.getInstance(app);
DislikeController.getInstance(app);
FollowController.getInstance(app);
BookmarkController.getInstance(app);
MessageController.getInstance(app);
AuthController(app);

/**
 * Start a server listening at port 4000 locally
 * but use environment variable PORT on AWS Elastic Beanstalk if available.
 */
const PORT = 4000;
app.listen(process.env.PORT || PORT);
