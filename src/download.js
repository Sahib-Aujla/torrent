const net = require("net");
const tracker = require("./tracker");

module.exports = (torrent) => {
  tracker.getPeers(torrent, (peers) => {
    console.log("here");
    console.log("list of peers: ", peers);
    if (peers) peers.forEach(download);
  });
};

const download = (peer) => {
  const socket = net.Socket();
  socket.on("error", console.log);
  socket.connect(peer.port, peer.ip, () => {});
  socket.on("data", (data) => {});
};
