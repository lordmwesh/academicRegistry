require('dotenv').config();
var keyth=require('keythereum');

const keyobj= keyth.importFromFile('UTC--2018-01-05T08-42-58.547862138Z--c3799067d204d0f99b5ec8961c1a4ee59347a68d','/Users/user/Library/Ethereum/rinkeby/');
var privateKey=keyth.recover('kipkemoi2010',keyobj);
console.log('privateKey', privateKey.toString('hex'));