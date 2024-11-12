const tracker = require("./src/tracker");
const torrentParser = require("./src/torrent-parser");

const torrent = torrentParser.open("book.torrent");

console.log(torrent);

tracker.getPeers(torrent, (peers) => {
  console.log('here')
  console.log("list of peers: ", peers);
});
