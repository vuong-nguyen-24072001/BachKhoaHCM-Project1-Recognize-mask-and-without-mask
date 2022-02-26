module.exports = (io) => {
  io.on("connection", (client) => {
    console.log("client connect");
    client.on("disconnect", () => console.log("client disconnect"));
    client.on("message", (data) => {
      // client.emit("message", "nodejssss");
      console.log(data);
    });
    client.on("infoMask", (data) => {
      client.broadcast.emit("infoMask", data);
      console.log(data);
    });
  });
};
