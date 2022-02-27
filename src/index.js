const express = require("express");
const layout = require("express-ejs-layouts");
const cors = require("cors");
const path = require("path");

const homeController = require("./controllers/homeControllers");
const notifyController = require("./controllers/notifyController");
const apiController = require("./controllers/apiController");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "/public")));
app.use(layout);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.get("/", (req, res) => {
  res.locals.port = port;
  res.render("home/index");
});
app.get("/api", apiController.showTestIo);
app.post("/warning", (req, res) => {
  console.log(req.query.state);
  res.send("Data received from Nodejs");
});

console.log(`porttttttttttttttt envvvvvvv: ${port}`);
const server = app.listen(port, () =>
  console.log(`listening at http://localhost:${[port]}`)
);
const io = require("socket.io")(server);
notifyController(io);
