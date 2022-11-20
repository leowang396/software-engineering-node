"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Implements an Express Node HTTP server.
 */
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const AuthController_1 = __importDefault(require("./controllers/AuthController"));
const BookmarkController_1 = __importDefault(require("./controllers/BookmarkController"));
const DislikeController_1 = __importDefault(require("./controllers/DislikeController"));
const FollowController_1 = __importDefault(require("./controllers/FollowController"));
const LikeController_1 = __importDefault(require("./controllers/LikeController"));
const MessageController_1 = __importDefault(require("./controllers/MessageController"));
const TuitController_1 = __importDefault(require("./controllers/TuitController"));
const UserController_1 = __importDefault(require("./controllers/UserController"));
const session = require('express-session');
const cors = require('cors');
const app = (0, express_1.default)();
// Sets the Access-Control-Allow-Origin response header to the req origin.
const corsConfig = {
    credentials: true,
    origin: true,
};
app.use(cors(corsConfig));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Creates the session middleware.
let sess = {
    secret: process.env.SECRET,
    cookie: {
        secure: false
    }
};
if (process.env.ENV == 'PRODUCTION') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
}
app.use(session(sess));
app.get('/', (req, res) => res.send('<h1>App Loaded!</h1>'));
const uri = `mongodb+srv://lwang369:${process.env.mongodbpw}@cluster0.xwyngvl.mongodb.net/?retryWrites=true&w=majority`;
mongoose_1.default.connect(uri);
UserController_1.default.getInstance(app);
TuitController_1.default.getInstance(app);
LikeController_1.default.getInstance(app);
DislikeController_1.default.getInstance(app);
FollowController_1.default.getInstance(app);
BookmarkController_1.default.getInstance(app);
MessageController_1.default.getInstance(app);
(0, AuthController_1.default)(app);
/**
 * Start a server listening at port 4000 locally
 * but use environment variable PORT on AWS Elastic Beanstalk if available.
 */
// TODO: Try to refactor and fix nodemon TypeError in package.json.
const PORT = 4000;
app.listen(process.env.PORT || PORT);
//# sourceMappingURL=server.js.map