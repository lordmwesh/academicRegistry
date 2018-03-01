require('dotenv').config()
const Web3 = require('web3');
const fs = require('fs');
const async = require('async');
const helper = require('./helper');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider(process.env.NETWORK));
}

// Contract
web3.eth.defaultAccount = process.env.MAIN_ADDRESS;
const contractAddress = process.env.CONTRACT_ADDRESS;
const abiArray = JSON.parse(fs.readFileSync(process.env.CONTRACT_ABI, 'utf8'));
const AcademicRegistryContract = web3.eth.contract(abiArray);
const contractInstance = AcademicRegistryContract.at(contractAddress);

// Watch all events
// contractInstance.allEvents()
// .watch(function(error, eventResult){
//     if (error) {
//       console.log('Error in myEvent event handler: ' + error);
//     }
//     else {
//       console.log('myEvent: ' + JSON.stringify(eventResult.args));
//     }
//   }
// );

admissionNumber = 1
content_hash = "New cert issued"
user =  process.env.MAIN_ADDRESS
user_key = helper.getPrivateKey(user)

// helper.sendRawTransaction(
//   contractInstance,
//   user_key,
//   'updateCandidateTransactionHash',
//   ['uint','string'],
//   [admissionNumber, '0x84d394c2ef666e12130f389c37ad7f79afb2945211ba63318f307e52413a8bdc'],
//   user,
//   process.env.CONTRACT_ADDRESS,
//   function(err, txHash) {
//     if (!err) {
//       console.log('updateCandidateTransactionHash updated', txHash)
//     } else {
//       console.log('Error updating updateCandidateTransactionHash', err)
//     }
//   }
// )


// var result = contractInstance.updateCandidateTransactionHash(5,'0x84d394c2ef666e12130f389c37ad7f79afb2945211ba63318f307e52413a8bdc', {gas: 3000000})
// console.log('result', result);

// web3.eth.getBlock(739, function(error, result){
//   if(!error)
//       console.log(JSON.stringify(result));
//   else
//       console.error(error);
// })

web3.eth.getTransaction('0x55c0a2fd0e6d489c0a2327144e37fae5bd79bd6a628be7176dd56041274aa7ce', function (error, result) {
  if(!error)
    console.log('ASCII', web3.toAscii(result.input))
      // console.log(JSON.stringify(result));
  else
      console.error(error);
})