const torrentParser = require("./src/torrent-parser");
const download = require("./src/download");
if (process.argv.length != 3) throw new Error("Please provide three arguments");
const torrent = torrentParser.open(process.argv[2]);

console.log(torrent);
download(torrent);
