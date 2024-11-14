const net = require("net");
const tracker = require("./tracker");
const message = require("./message");
module.exports = (torrent) => {
  tracker.getPeers(torrent, (peers) => {
    console.log("here");
    console.log("list of peers: ", peers);
    if (peers) peers.forEach((peer) => download(peer, torrent));
  });
};

const download = (peer, torrent) => {
  const socket = net.Socket();
  socket.on("error", (err) => {
    if (err.code === "ECONNREFUSED") {
      console.log(`Connection refused by peer ${peer.ip}:${peer.port}`);
    } else if (err.code === "ETIMEDOUT") {
      console.log(`Connection to peer ${peer.ip}:${peer.port} timed out`);
    } else if (err.code === "ENOTFOUND") {
      console.log(`Peer ${peer.ip}:${peer.port} not found`);
    } else {
      console.log(`Socket error on peer ${peer.ip}:${peer.port}:`, err);
    }
  });
  socket.connect(peer.port, peer.ip, () => {
    console.log("here66");
    socket.write(message.buildHandshake(torrent));
  });
  onWholeMsg(socket, (msg) => {
    //handle the complete data here
    msgHandler(msg, socket);
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

const msgHandler = (msg, socket) => {
  if (isHandshake(msg)) {
    console.log("Handshake received, sending interested message");

    socket.write(message.buildInterested());
  }
};

const isHandshake = (msg) => {
  console.log("lol");
  return (
    msg.length == msg.readUInt8(0) + 49 &&
    msg.toString("utf8", 1) == "BitTorrent protocol"
  );
};
