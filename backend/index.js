import app from "./app.js";
import 'dotenv/config'
import { connectDb } from "./config/db.js";

const port = process.env.PORT | 9000


connectDb().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
).catch((error) => {
    console.error(error.message);
});