const express = require("express");
const cookieParser = require("cookie-parser");
const { PORT } = require("./config/index,js");
const dbConnect = require("./database/index,js");
const router = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(router);

dbConnect();

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
