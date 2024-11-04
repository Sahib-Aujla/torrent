const fs=require('fs');
const path=require('path');
const torrent=fs.readFileSync(path.join(__dirname,"puppy.torrent"));
console.log(torrent);
