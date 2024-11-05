const fs=require('fs');
const path=require('path');
const bencode=require('bencode');
const dgram=require('dgram');
const urlparser=require('url');


const torrent=bencode.decode( fs.readFileSync(path.join(__dirname,"puppy.torrent")));
const url=urlparser.parse( torrent.announce.toString());
console.log(torrent.announce.toString());
console.log(url);

const socket=dgram.createSocket('udp4');

const message=Buffer.from("hello?",'utf8');

socket.send(message,0,message.length,url.port,url.host,()=>{});

socket.on('message',msg=>{
    console.log('message is ',msg);
})

