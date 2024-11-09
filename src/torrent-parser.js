"use strict";

const fs = require("fs");
const bencode = require("bencode");
const crypto = require("crypto");
const bignum = require("bignumber.js");
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
