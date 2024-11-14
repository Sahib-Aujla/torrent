const dgram = require("dgram");
const urlparse = require("url").parse;
const crypto = require("crypto");
const utils = require("./utils");
const torrentParser = require("./torrent-parser");
const bencode = require("bencode");
const trackers = [];
module.exports.getPeers = (torrent, callback) => {
  const socket = dgram.createSocket("udp4");
  const urls = torrent["announce-list"];

  urls.forEach((url) => {
    const u = url.toString();
    if (u) {
      udpSend(socket, buildConnReq(), u);
    }
  });
  socket.on("message", (response) => {
    if (respType(response) === "connect") {
      // 2. receive and parse connect response

      if (!trackers) return;

      const connResp = parseConnResp(response);
      // 3. send announce request

      const announceReq = buildAnnounceReq(connResp.connectionId, torrent);

      trackers.forEach((url) => udpSend(socket, announceReq, url));
    } else if (respType(response) === "announce") {
      // 4. parse announce response
      const announceResp = parseAnnounceResp(response);
      if (!announceResp) return;

      // 5. pass peers to callback
      callback(announceResp.peers);
    }
  });

  socket.on("error", (e) => console.log("error: " + e));
};

function udpSend(
  socket,
  message,
  rawUrl,
  callback = (err) => {
    if (err) console.error("Send error:", err);
    else {
      trackers.push(rawUrl);
    }
  }
) {
  const url = urlparse(rawUrl);

  socket.send(message, 0, message.length, url.port, url.hostname, callback);
}

function respType(resp) {
  const action = resp.readUInt32BE(0);
  if (action === 0) return "connect";
  if (action === 1) return "announce";
}

function buildConnReq() {
  //allocating 16 bytes
  const buffer = Buffer.alloc(16);
  buffer.writeUInt32BE(0x417, 0);
  buffer.writeUInt32BE(0x27101980, 4);
  buffer.writeUInt32BE(0, 8);
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

function buildAnnounceReq(connId, torrent, port = 80) {
  // Allocate a 98-byte buffer for the announce request
  const buf = Buffer.alloc(98);

  // 1. Connection ID (8 bytes)
  connId.copy(buf, 0);

  // 2. Action (4 bytes) - Announce action is always 1
  buf.writeUInt32BE(1, 8);

  // 3. Transaction ID (4 bytes) - Random value for the transaction
  crypto.randomBytes(4).copy(buf, 12);

  // 4. Info Hash (20 bytes) - Hash of the torrent info
  torrentParser.infoHash(torrent).copy(buf, 16);

  // 5. Peer ID (20 bytes) - Random ID for the peer
  utils.genId().copy(buf, 36);

  // 6. Downloaded (8 bytes) - Total downloaded data, set to 0 if unknown
  Buffer.alloc(8).copy(buf, 56);

  // 7. Left (8 bytes) - Remaining data to download, set to total size of torrent
  torrentParser.size(torrent).copy(buf, 64);

  // 8. Uploaded (8 bytes) - Total uploaded data, set to 0 if unknown
  Buffer.alloc(8).copy(buf, 72);

  // 9. Event (4 bytes) - Set to 0 for no event
  buf.writeUInt32BE(0, 80);

  // 10. IP Address (4 bytes) - Set to 0.0.0.0
  Buffer.alloc(4).copy(buf, 84);

  // 11. Key (4 bytes) - Random value, typically set to 0
  Buffer.alloc(4).copy(buf, 88);

  // 12. Num Want (4 bytes) - Set to -1 for unlimited peers
  buf.writeInt32BE(-1, 92);

  // 13. Port (2 bytes) - The listening port of the peer
  buf.writeUInt16BE(port, 96);

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
  if (resp.length < 20) return;

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
