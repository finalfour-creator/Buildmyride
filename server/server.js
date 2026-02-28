import "dotenv/config";
import app from "./app.js";
import config from "./config/index.js";

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${config.NODE_ENV})`);
});
