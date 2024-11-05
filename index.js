const fs=require('fs');
const path=require('path');
const bencode=require('bencode');
const torrent=bencode.decode( fs.readFileSync(path.join(__dirname,"puppy.torrent")));
console.log(torrent.announce.toString());
console.log(torrent);

