"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth")); // Import the auth router
const sessions_1 = __importDefault(require("./routes/sessions")); // Import the sessions router
const auth_2 = require("./middleware/auth"); // Import auth middleware if needed globally, or apply per route
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT || 3000;
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// Basic root route
app.get('/', (req, res) => {
    res.send('Hello from Meditation Tracker Backend!');
});
// Mount the authentication routes
app.use('/api/auth', auth_1.default);
// TODO: Add routes for sessions (e.g., app.use('/api/sessions', sessionRouter);)
// Mount the sessions routes - apply auth middleware here or within the router file
app.use('/api/sessions', auth_2.verifyAuthToken, sessions_1.default);
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
