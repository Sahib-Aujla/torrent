const net = require("net");
const tracker = require("./tracker");

module.exports = (torrent) => {
  let Peers = [];
  tracker.getPeers(torrent, (peers) => {
    console.log("here");
    console.log("list of peers: ", peers);
    if (peers) peers.forEach((p) => Peers.push(p));
    console.log(Peers);
  });
};
