const express = require("express");
const layout = require("express-ejs-layouts");
const path = require("path");

const homeController = require("./controllers/homeControllers");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "/public")));
app.use(layout);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.get("/", homeController.show);

app.listen(port, () => console.log(`listening at http://localhost:${[port]}`));
