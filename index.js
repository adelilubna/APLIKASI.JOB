require("dotenv").config();

const app = require("./src/app");

async function start() {
  try {
    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    process.exit(1);
  }
}

start();