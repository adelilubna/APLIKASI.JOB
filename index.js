require("dotenv").config();

const app = require("./src/app");
const sequelize = require("./src/config/db");
require("./src/model/index"); // load models + associations

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    await sequelize.sync();
    console.log("Tables synced.");

    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message || error);
    process.exit(1);
  }
}

start();
