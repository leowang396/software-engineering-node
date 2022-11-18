/**
 * @file Implements an Express Node HTTP server.
 */
import LikeDao from "./daos/LikeDao";
import UserDao from "./daos/UserDao";
import TuitDao from "./daos/TuitDao";
import LikeController from "./controllers/LikeController";
import UserController from "./controllers/UserController";
import TuitController from "./controllers/TuitController";
import express, {Request, Response} from 'express';
import mongoose from "mongoose";
import FollowDao from "./daos/FollowDao";
import FollowController from "./controllers/FollowController";
import BookmarkDao from "./daos/BookmarkDao";
import BookmarkController from "./controllers/BookmarkController";
import MessageDao from "./daos/MessageDao";
import MessageController from "./controllers/MessageController";
import AuthController from "./controllers/AuthController";
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
    secret: 'keyboard cat',
    cookie: {
        secure: false
    }
}
// TODO: Configure express-session for production.
// let sess = {
//     secret: process.env.SECRET,
//     cookie: {
//         secure: false
//     }
// }
if (process.env.ENV == 'PRODUCTION') {
    app.set('trust proxy', 1)
    sess.cookie.secure = true
}
app.use(session(sess));

app.get('/', (req: Request, res: Response) =>
    res.send('<h1>App Loaded!</h1>'));
// TODO: Configure MongoDB Atlas connection for production.
//${process.env.mongodbpw}
const uri = `mongodb+srv://lwang369:Ec7Qr83mvoCUDzsG@cluster0.xwyngvl.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(uri);

const userDao = UserDao.getInstance();
const userController = UserController.getInstance(app);
const tuitDao = TuitDao.getInstance();
const tuitController = TuitController.getInstance(app);
const likeDao = LikeDao.getInstance();
const likeController = LikeController.getInstance(app);
const followDao = FollowDao.getInstance();
const followController = FollowController.getInstance(app);
const bookmarkDao = BookmarkDao.getInstance();
const bookmarkController = BookmarkController.getInstance(app);
const messageDao = MessageDao.getInstance();
const messageController = MessageController.getInstance(app);
const authController = AuthController(app);

/**
 * Start a server listening at port 4000 locally
 * but use environment variable PORT on AWS Elastic Beanstalk if available.
 */
// TODO: Try to refactor and fix nodemon TypeError in package.json.
const PORT = 4000;
app.listen(process.env.PORT || PORT);
