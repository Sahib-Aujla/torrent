const net = require("net");
const tracker = require("./tracker");
const message = require('./message');
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
  onWholeMsg(socket, (data) => {
    //handle the complete data here
  });
};

const onWholeMsg = (socket, callback) => {
  let savedBuf = Buffer.alloc(0);
  let handshake = true;
  socket.on("data", (recBuf) => {
    const msgLen = () =>
      handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readUInt32BE(0) + 4;

    savedBuf = Buffer.concat([savedBuf, recBuf]);

    while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
      callback(savedBuf.slice(0, msgLen()));
      savedBuf = savedBuf.slice(msgLen());
      handshake = false;
    }
  });
};
