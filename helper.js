require('dotenv').config()

const Web3 = require('web3');
const coder = require('web3/lib/solidity/coder');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const Tx = require('ethereumjs-tx');
const IPFS = require('ipfs-mini');

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider(process.env.NETWORK));
}

const helper = {};

helper.sendRawTransaction = function (contract, myPrivateKey, functionName, types, args, account, address, callback) {
    var privateKey = new Buffer(myPrivateKey, 'hex') 
    var fullName = functionName + '(' + types.join() + ')';
    var signature = CryptoJS.SHA3(fullName,{outputLength:256}).toString(CryptoJS.enc.Hex).slice(0, 8);
    var dataHex = signature + coder.encodeParams(types, args);
    var data = '0x'+dataHex;
    
    var nonce = web3.toHex(web3.eth.getTransactionCount(account));
    var gasPrice = web3.toHex(web3.eth.gasPrice);
    console.log('gasPrice', gasPrice)
    var gasLimitHex = web3.toHex(3000000);
    var rawTx = { 'nonce': nonce, value: '0x00', 'gasPrice': gasPrice, 'gasLimit': gasLimitHex, 'from': account, 'to': address, 'data': data};
    console.log('rawTx', rawTx)

    var tx = new Tx(rawTx);
    tx.sign(privateKey);
    var serializedTx = '0x'+tx.serialize().toString('hex');
    console.log('serializedTx', serializedTx)
    web3.eth.sendRawTransaction(serializedTx, function(err, txHash){ 
        console.log(err, txHash) 
        return callback(err, txHash)
    });
}

helper.getPrivateKey = function(address) {
    try {
        const accounts = JSON.parse(fs.readFileSync(process.env.ACCOUNTS_FILE, 'utf8'));
        return accounts[address];
    } catch(err) {
        console.log('Private key access error', err);
    }
}

helper.writeToIPFS = function (payload, callback) {
  const IPFS = require('ipfs-mini');
  const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

  ipfs.add(payload.content, (err, result) => {
    if (err) {
        callback({status: 'error', detail: err})
    } else {
        callback({status: 'success', detail: result})
    }
  })
}

module.exports = helper;