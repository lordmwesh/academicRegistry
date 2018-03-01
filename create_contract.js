require('dotenv').config()
const Web3 = require('web3');
const fs = require('fs');
const async = require('async');
const solc = require('solc');
const helper = require('./helper');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider(process.env.NETWORK));
}

// New Contract
web3.eth.defaultAccount = process.env.MAIN_ADDRESS;
const contractAddress = process.env.CONTRACT_ADDRESS;
const abiArray = JSON.parse(fs.readFileSync(process.env.CONTRACT_ABI, 'utf8'));

const code = fs.readFileSync('AcademicRegistry.sol').toString();
const compiledCode = solc.compile(code);
const abiDefination = JSON.parse(compiledCode.contracts[':AcademicRegistry'].interface);

console.log(compiledCode.contracts[':AcademicRegistry'].interface)

const byteCode = compiledCode.contracts[':AcademicRegistry'].bytecode;
const AcademicRegistryContract = web3.eth.contract(abiDefination);

const deployedContract = AcademicRegistryContract.new(null, {data: byteCode, from: web3.eth.accounts[0], gas: 4700000});
const contractInstance = AcademicRegistryContract.at(deployedContract.address);

console.log('deployedContract.address', deployedContract.address);
