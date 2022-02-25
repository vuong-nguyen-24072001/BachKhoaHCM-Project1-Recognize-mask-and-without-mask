module.exports = (io) => {
  io.on("connection", (client) => {
    client.on("disconnect", () => console.log("client disconnect"));
  });
};
