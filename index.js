const fs=require('fs');
const bencode=require('bencode');
const tracker=require('./src/tracker');


const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));

tracker.getPeers(torrent, peers => {
  console.log('list of peers: ', peers);
});