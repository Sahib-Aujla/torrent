"use strict";

const fs = require("fs");
const bencode = require("bencode");
const crypto = require("crypto");
const bignum = require("bignumber.js");

module.exports.BLOCK_LEN = Math.pow(2, 14);
module.exports.open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

module.exports.size = (torrent) => {
  const size = torrent.info.files
    ? torrent.info.files.map((file) => file.length).reduce((a, b) => a + b)
    : torrent.info.length;

  const bigSize = new bignum(size);

  // Convert BigNumber to a hexadecimal string, pad to 16 chars for 8 bytes, then create a buffer
  const hexString = bigSize.toString(16).padStart(16, "0");
  return Buffer.from(hexString, "hex");
};

module.exports.infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash("sha1").update(info).digest();
};

module.exports.pieceLen = (torrent, pieceIndex) => {
  const totalLength = new bignum(this.size(torrent).toString("hex"), 16)
  const pieceLength = torrent.info["piece length"];

  const lastPieceLength = totalLength % pieceLength;
  const lastPieceIndex = Math.floor(totalLength / pieceLength);

  return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength;
};

module.exports.blocksPerPiece = (torrent, pieceIndex) => {
  const pieceLength = this.pieceLen(torrent, pieceIndex);
  return Math.ceil(pieceLength / this.BLOCK_LEN);
};

module.exports.blockLen = (torrent, pieceIndex, blockIndex) => {
  const pieceLength = this.pieceLen(torrent, pieceIndex);

  const lastPieceLength = pieceLength % this.BLOCK_LEN;
  const lastPieceIndex = Math.floor(pieceLength / this.BLOCK_LEN);

  return blockIndex === lastPieceIndex ? lastPieceLength : this.BLOCK_LEN;
};
