const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: "./config.env" });
console.log("MongoDB URI:", process.env.MONGO_URI);

const port = process.env.PORT || 5500;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
