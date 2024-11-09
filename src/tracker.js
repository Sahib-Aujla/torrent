const dgram = require("dgram");
const urlparse = require("url").parse;
const crypto = require("crypto");
const utils = require("./utils");
const torrentParser = require("./torrent-parser");

module.exports.getPeers = (torrent, callback) => {
  const socket = dgram.createSocket("udp4");
  const url = torrent.announce.toString();

  udpSend(socket, buildConnReq(), url);

  socket.on("message", (response) => {
    if (respType(response) === "connect") {
      // 2. receive and parse connect response
      const connResp = parseConnResp(response);
      // 3. send announce request
      const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
      udpSend(socket, announceReq, url);
    } else if (respType(response) === "announce") {
      // 4. parse announce response
      const announceResp = parseAnnounceResp(response);

      // 5. pass peers to callback
      callback(announceResp.peers);
    }
  });
};

function udpSend(socket, message, rawUrl, callback = () => {}) {
  const url = urlparse(rawUrl);
  socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(resp) {
  // ...
}

function buildConnReq() {
  //allocating 16 bytes
  const buffer = Buffer.alloc(16);
  buffer.writeUint32BE(0x417, 0);
  buffer.writeUInt32BE(0x27101980, 4);
  buffer.writeUint32BE(0, 8);
  crypto.randomBytes(4).copy(buffer, 12);
  return buffer;
}

function parseConnResp(resp) {
  // ...
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    connectionId: resp.slice(8),
  };
}

function buildAnnounceReq(connId, torrent, port = 6881) {
  // ...
  const buf = Buffer.alloc(98);
  connId.copy(buf, 0);
  crypto.randomBytes(4).copy(buf, 12);
  torrentParser.infoHash(torrent).copy(buf, 16);
  utils.genId().copy(buf, 36);
  Buffer.alloc(8).copy(buf, 56);
  torrentParser.size(torrent).copy(buf, 64);
  Buffer.alloc(8).copy(buf, 72);
  buf.writeUint32BE(0, 80);
  buf.writeUint32BE(0, 80);
  crypto.randomBytes(4).copy(buf, 80);
  buf.writeInt32BE(-1, 92);
  buf.writeUint16BE(port, 96);
  return buf;
}

function parseAnnounceResp(resp) {
  // ...
  function group(iterable, groupSize) {
    let groups = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    }
    return groups;
  }

  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    leechers: resp.readUInt32BE(8),
    seeders: resp.readUInt32BE(12),
    peers: group(resp.slice(20), 6).map((address) => {
      return {
        //changes the buffer to string and joing using .
        ip: address.slice(0, 4).join("."),
        port: address.readUInt16BE(4),
      };
    }),
  };
}
