const tracker = require("./src/tracker");
const torrentParser = require("./src/torrent-parser");

const torrent = torrentParser.open("resume.torrent");

console.log(torrent);
let Peers=[];
tracker.getPeers(torrent, (peers) => {
  console.log('here')
  console.log("list of peers: ", peers);
  if(peers)peers.forEach(p=>Peers.push(p));
  console.log(Peers);
});


