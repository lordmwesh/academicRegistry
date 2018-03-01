// Maintain a list of blockchain method calls
// const path = require('path');
require('dotenv').config()
const express = require('express');
const Web3 = require('web3');
const fs = require('fs');
const async = require('async');
const moment = require('moment');
const helper = require('./../helper');
const router = express.Router();

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider(process.env.NETWORK));
}

// Initialize contract
// Set default account
web3.eth.defaultAccount = process.env.MAIN_ADDRESS;
const contractAddress = process.env.CONTRACT_ADDRESS;
const abiArray = JSON.parse(fs.readFileSync(process.env.CONTRACT_ABI, 'utf8'));
const AcademicRegistryContract = web3.eth.contract(abiArray);
const contractInstance = AcademicRegistryContract.at(contractAddress);

/* GET api listing. */
router.get('/', function(req, res, next) {
  return res.send('API Methods Call');
});

router.post('/enroll-candidate', function(req, res, next){
  try {
    const admissionNumber = parseInt(req.body.admissionNumber);
    const name = req.body.name;
    const admissionDate = parseInt(moment(req.body.admissionDate, 'YYYY-MM-DD').format('x'));
    const totalFeesPaid = 0;
    const programCode = parseInt(req.body.programCode);
    const idNumber = parseInt(req.body.idNumber);

    // Get user details
    const user = req.body.user;
    const user_key = helper.getPrivateKey(user);

    helper.sendRawTransaction(
      contractInstance,
      user_key,
      'enrollCandidate',
      ['string', 'uint256', 'uint256', 'uint256', 'uint256'],
      [name, admissionDate, totalFeesPaid, programCode, idNumber],
      user,
      process.env.CONTRACT_ADDRESS,
      function(err, txHash) {
        if (!err) {
          return res.send({'status': 'success', 'detail': 'Candidate enrolled'});
        } else {
          const error = {
            name: err.name,
            message: err.message
          }
          return res.send({'status': 'error', 'detail': error}, 400);
        }
      }
    )
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    console.log('Enroll candidate', error);
    return res.send({'status': 'error', 'detail': 'You might not have enough permission to update record. All fields are required'}, 400);
  }
})


router.post('/update-fees', function(req, res, next){
  try {
    const admissionNumber = req.body.admissionNumber;
    const amount = req.body.amount;

    // Get user details
    const user = req.body.user;
    const user_key = helper.getPrivateKey(user);

    helper.sendRawTransaction(
      contractInstance,
      user_key,
      'updateFeesPaid',
      ['uint256','uint256'],
      [admissionNumber, amount],
      user,
      process.env.CONTRACT_ADDRESS,
      function(err, txHash) {
        if (!err) {
          return res.send({'status': 'success', 'detail': 'Fees updated'});
        } else {
          const error = {
            name: err.name,
            message: err.message
          }
          return res.send({'status': 'error', 'detail': error}, 400);
        }
      }
    )
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    console.log('updateFeesPaid error', error)
    return res.send({'status': 'error', 'detail': 'You might not have enough permission to update record. All fields are required'}, 400);
  }
})


router.get('/get-candidates', function(req, res, next){
  try {
    const candidatesAdmNumbers = [];
    const candidates = [];
    contractInstance.numberOfCandidates(function(error, result){
        if (!error) {
            const numberOfCandidates = result.toNumber();
            numberOfCandidatesRange = Array.from({length: numberOfCandidates}, (x,i) => i);

            async.forEachOf(numberOfCandidatesRange, function(value, key, callback){
                contractInstance.candidatesList(key, function(error, result){
                    if (!error) {
                        console.log('Address', result);
                        candidatesAdmNumbers.push(result);
                        callback();
                    } else {
                        callback(error);
                    }
                })
            }, function(err){
                if (err) { 
                  throw err
                }
                async.forEachOf(candidatesAdmNumbers, function(value, key, callback2){
                  contractInstance.candidates(value, function(err, candidate){
                    if(err) {
                      callback2(err);
                    }
                    console.log('candidate log: ',candidate)
                    candidates.push({
                      admissionNumber: candidate[0],
                      name: candidate[1],
                      admissionDate: candidate[2],
                      totalFeesPaid: candidate[3],
                      passedUnits: candidate[4],
                      totalUnits: candidate[5],
                      clearedByAdmin: candidate[6],
                      certificate: candidate[7],
                      idNumber: candidate[8]
                    });
                    callback2()
                  });
                }, function(err){
                  console.log('Second function', err);
                  console.log('candidates', candidates)
                  return res.send({'status': 'success', 'detail': candidates});
                })
            })
        }
    })
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})

router.post('/get-candidate', function(req, res, next){
  try {
    const admissionNumber = req.body.admissionNumber;
    if (!admissionNumber) {
      return res.send({'status': 'error', 'detail': 'Admission number is required'}, 400);
    }
    contractInstance.candidates(admissionNumber, function(err, candidate){
      if (!err) {
        var candidateInfo = {
          admissionNumber: candidate[0],
          name: candidate[1],
          admissionDate: candidate[2],
          totalFeesPaid: candidate[3],
          passedUnits: candidate[4],
          totalUnits: candidate[5],
          clearedByAdmin: candidate[6],
          certificate: candidate[7],
          idNumber: candidate[8]
        }
        return res.send({'status': 'success', 'detail': [candidateInfo]});
      } else {
        throw err
      }
    })
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})


router.get('/get-programs', function(req, res, next){
  try {
    const programCodes = [];
    const programs = [];
    contractInstance.numberOfPrograms(function(error, result){
        if (!error) {
            const numberOfPrograms = result.toNumber();
            numberOfProgramsRange = Array.from({length: numberOfPrograms}, (x,i) => i);

            async.forEachOf(numberOfProgramsRange, function(value, key, callback){
                contractInstance.programList(key, function(error, result){
                    if (!error) {
                        console.log('Address', result);
                        programCodes.push(result);
                        callback();
                    } else {
                        callback(error);
                    }
                })
            }, function(err){
                if (err) { 
                  throw err
                }
                async.forEachOf(programCodes, function(value, key, callback2){
                  contractInstance.programs(value, function(err, program){
                    if(err) {
                      callback2(err);
                    }
                    programs.push({
                      code: program[0],
                      name: program[1],
                      requiredMiniumUnits: program[2],
                      requiredMinimumDuration: program[3],
                      totalCost: program[4]
                    });
                    callback2()
                  });
                }, function(err){
                  console.log('Second function', err);
                  console.log('programs', programs)
                  return res.send({'status': 'success', 'detail': programs});
                })
            })
        }
    })
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})

router.post('/get-candidate-program', function(req, res, next) {
  try {
    const admissionNumber = req.body.admissionNumber;
    contractInstance.getCandidateProgram(admissionNumber, function(err, result){
      if(err) {
        throw err;
      }
      const program = {
        code: result[0],
        name: result[1],
        requiredMiniumUnits: result[2],
        totalCost: result[3],
        requiredMinimumDuration: result[4]
      }
      return res.send({'status': 'success', 'detail': program});
    })
  } catch(err){
    const error = {
      name: err.name,
      message: err.message
    }
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})

router.post('/add-staff', function(req, res, next){
  try{
    const member = req.body.member;
    const name = req.body.name;
    const memberSince = moment(req.body.memberSince, 'YYYY-MM-DD').format('x');
    const permission = req.body.permission;
    
    const user = req.body.user;
    const user_key = helper.getPrivateKey(user);

    helper.sendRawTransaction(
      contractInstance,
      user_key,
      'addStaff',
      ['address','string','uint256','uint8'],
      [member, name, memberSince, permission],
      user,
      process.env.CONTRACT_ADDRESS,
      function(err, txHash) {
        if (!err) {
          return res.send({'status': 'success', 'detail': 'Staff added'});
        } else {
          return res.send({'status': 'error', 'detail': err}, 400);
        }
      }
    )
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    console.log('addStaff error', error)
    return res.send({'status': 'error', 'detail': 'You might not have enough permission to update record. All fields are required'}, 400);
  }
})

router.post('/update-staff-permissions', function(req, res, next){
  try{
    const memberAddress = req.body.memberAddress;
    const permissions = req.body.permissions || [];

    const user = req.body.user;
    const user_key = helper.getPrivateKey(user);
    var batch = web3.createBatch();

    async.forEachOf(permissions, function(value, key, callback){
      helper.sendRawTransaction(
        contractInstance,
        user_key,
        'updatePermissions',
        ['address', 'uint8'],
        [memberAddress, value],
        user,
        process.env.CONTRACT_ADDRESS,
        function(err, txHash) {
          if (!err) {
            callback()
          } else {
            callback(err)
          }
        }
      )
    }, function(err){
      if (err) { 
        const error = {
          name: err.name,
          message: err.message
        }
        return res.send({'status': 'error', 'detail': error}, 400);
      }
      return res.send({'status': 'success', 'detail': 'Permissions updated'});
    })
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    console.log('updatePermission', error)
    return res.send({'status': 'error', 'detail': 'You might not have enough permission to update record. Tip: Add one record at a time to avoid exceeding gas limit'}, 400);
  }
})

router.get('/get-staffs', function(req, res, next){
  try {
    const staffAddresses = [];
    const staffs = [];
    contractInstance.numberOfStaff(function(error, result){
        if (!error) {
            const numberOfStaff = result.toNumber();
            numberOfStaffRange = Array.from({length: numberOfStaff}, (x,i) => i);

            async.forEachOf(numberOfStaffRange, function(value, key, callback){
                contractInstance.staffAddresses(key, function(error, result){
                    if (!error) {
                        console.log('Address', result);
                        staffAddresses.push(result);
                        callback();
                    } else {
                        callback(error);
                    }
                })
            }, function(err){
                if (err) { 
                  throw err
                }
                async.forEachOf(staffAddresses, function(value, key, callback2){
                  contractInstance.staffs(value, function(err, staff){
                    if(err) {
                      callback2(err);
                    }
                    staffs.push({
                      memberAddress: staff[0],
                      name: staff[1],
                      memberSince: staff[2].toNumber(),
                      permissions: []
                    });
                    callback2()
                  });
                }, function(err){
                  console.log('Second function', err);
                  console.log('staffs', staffs)
                  return res.send({'status': 'success', 'detail': staffs});
                })
            })
        }
    })
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})

router.post('/add-program', function(req, res, next){
  try {
    const name = req.body.name;
    const requiredMiniumUnits = req.body.requiredMiniumUnits;
    const requiredMinimumDuration = req.body.requiredMinimumDuration;
    const totalCost = req.body.totalCost;

    const user = req.body.user;
    const user_key = helper.getPrivateKey(user);

    helper.sendRawTransaction(
      contractInstance,
      user_key,
      'addProgram',
      ['string','uint256','uint256','uint256'],
      [name, requiredMiniumUnits, totalCost, requiredMinimumDuration],
      user,
      process.env.CONTRACT_ADDRESS,
      function(err, txHash) {
        if (!err) {
          return res.send({'status': 'success', 'detail': 'Program added'});
        } else {
          return res.send({'status': 'error', 'detail': err}, 400);
        }
      }
    )
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})

router.post('/add-unit', function(req, res, next){
  try {
    const name = req.body.name;
    const program_code = req.body.program;

    const user = req.body.user;
    const user_key = helper.getPrivateKey(user);

    const addUnitFunc = function(callback) {
      helper.sendRawTransaction(
        contractInstance,
        user_key,
        'addUnits',
        ['string'],
        [name],
        user,
        process.env.CONTRACT_ADDRESS,
        function(err, txHash) {
          if (!err) {
            callback()
          } else {
            callback(err)
          }
        }
      )
    }

    // Append new unit to program
    addUnitFunc(function(err){
      if (err) {
        console.log('Unit err', err);
        const error = {
          name: err.name,
          message: err.message
        }
        return res.send({'status': 'error', 'detail': error}, 400);
      }
      // Append units to program
      contractInstance.numberOfUnits(null, function(error, result){
        // The the code of the latest written unit
        if (!error) {
            const latestUnitCode = result.toNumber();
            helper.sendRawTransaction(
              contractInstance,
              user_key,
              'appendUnitToProgram',
              ['uint256','uint256'],
              [latestUnitCode, program_code],
              user,
              process.env.CONTRACT_ADDRESS,
              function(err, txHash) {
                if (!err) {
                  return res.send({'status': 'success', 'detail': 'Unit added'});
                } else {
                  const error = {
                    name: err.name,
                    message: err.message
                  }
                  console.log('append error', error)
                  return res.send({'status': 'error', 'detail': error}, 400);
                }
              }
            )
        }
      })
    })
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    console.log('addUnits error', error)
    return res.send({'status': 'error', 'detail': 'You might not have enough permission to update record. Tip: Add one record at a time to avoid exceeding gas limit'}, 400);
  }
})

router.post('/get-program-units', function(req, res, next) {
  try {
    const program_code = req.body.program;
    const program_units = [];
    contractInstance.getProgramUnitsCount(program_code, function(error, result){
      if (!error) {
          const numberOfProgramUnits = result.toNumber();
          numberOfProgramUnitsRange = Array.from({length: numberOfProgramUnits}, (x,i) => i);

          async.forEachOf(numberOfProgramUnitsRange, function(value, key, callback){
              contractInstance.getProgramUnits(program_code, key, function(error, result){
                  if (!error) {
                      console.log('program_units', result);
                      program_units.push({code: result[0], name: result[1]});
                      callback();
                  } else {
                      callback(error);
                  }
              })
          }, function(err){
              if (err) { 
                throw err;
              }
              return res.send({'status': 'success', 'detail': program_units});
          })
      }
    })
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})


router.post('/get-candidate-units', function(req, res, next) {
  try {
    const admissionNumber = req.body.admissionNumber;
    const candidate_units = [];
    contractInstance.getCandidateProgram(admissionNumber, function(err, program){
      if (err) {
        throw err;
      }
      var programCode = program[0];
      // Get program units and loop through to retrive candidate units
      contractInstance.getProgramUnitsCount(programCode, function(error, result){
        if (!error) {
            const numberOfProgramUnits = result.toNumber();
            numberOfProgramUnitsRange = Array.from({length: numberOfProgramUnits}, (x,i) => i);
  
            async.forEachOf(numberOfProgramUnitsRange, function(value, key, callback){
              contractInstance.getProgramUnits(programCode, key, function(error, result){
                contractInstance.getCandidateUnits(admissionNumber, result[0], function(error, result){
                    if (!error) {
                        console.log('candidate_units', result);
                        if (result[3]) {
                          candidate_units.push({
                            passed: result[0], 
                            marked: result[1], 
                            code: result[2], 
                            name: result[3]
                          });
                        }
                        callback();
                    } else {
                        callback(error);
                    }
                })
              })
            }, function(err, result){
              if (err) { 
                throw err;
              }
              return res.send({'status': 'success', 'detail': candidate_units});
            })
          }
        })
    })
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})



router.post('/get-candidate-certificate', function(req, res, next) {
  try {
    const admissionNumber = req.body.admissionNumber;
    contractInstance.getCandidateCertificate(admissionNumber, function(err, result){
      if (!err) {
        var certificate = {id: result[0], document: result[1]}
        return res.send({'status': 'success', 'detail': certificate}); 
      } else {
        const error = {
          name: err.name,
          message: err.message
        }
        return res.send({'status': 'error', 'detail': error}, 400);
      }
    })
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})


// Mark candidate units function
router.post('/mark-unit', function(req, res, next){
  try {
    const admissionNumber = req.body.admissionNumber;
    const unitCode = req.body.unitCode;
    const passed = req.body.passed || false;
    // Get user details
    const user = req.body.user;
    const user_key = helper.getPrivateKey(user);

    helper.sendRawTransaction(
      contractInstance,
      user_key,
      'markUnits',
      ['uint256','uint256', 'bool'],
      [admissionNumber, unitCode, passed],
      user,
      process.env.CONTRACT_ADDRESS,
      function(err, txHash) {
        if (!err) {
          return res.send({'status': 'success', 'detail': 'Candidate unit marking status updated'});
        } else {
          const error = {
            name: err.name,
            message: err.message
          }
          return res.send({'status': 'error', 'detail': error}, 400);
        }
      }
    )
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    console.log('markUnits error: ', error);
    return res.send({'status': 'error', 'detail': 'You might not have enough permission to update record. Tip: Add one record at a time to avoid exceeding gas limit'}, 400);
  }
})


router.post('/register-candidate-unit', function(req, res, next){
  try {
    const admissionNumber = req.body.admissionNumber;
    const unitCode = req.body.unitCode;

    const user = req.body.user;
    const user_key = helper.getPrivateKey(user);

    helper.sendRawTransaction(
      contractInstance,
      user_key,
      'registerCandidateUnits',
      ['uint256','uint256'],
      [admissionNumber, unitCode],
      user,
      process.env.CONTRACT_ADDRESS,
      function(err, txHash) {
        if (!err) {
          return res.send({'status': 'success', 'detail': 'Candidate subscribed to unit'});
        } else {
          const error = {
            name: err.name,
            message: err.message
          }
          return res.send({'status': 'error', 'detail': error}, 400);
        }
      }
    )
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    console.log('registerCandidateUnits error: ', error);
    return res.send({'status': 'error', 'detail': 'You might not have enough permission to update record. Tip: Add one record at a time to avoid exceeding gas limit'}, 400);
  }
})


router.post('/clear-candidate', function(req, res, next){
  try {
    const admissionNumber = req.body.admissionNumber;
    const cleared = req.body.cleared;
    console.log('Clear admissionNumber', admissionNumber)

    const user = req.body.user;
    const user_key = helper.getPrivateKey(user);

    helper.sendRawTransaction(
      contractInstance,
      user_key,
      'clearCandidate',
      ['uint256','bool'],
      [admissionNumber, cleared],
      user,
      process.env.CONTRACT_ADDRESS,
      function(err, txHash) {
        if (!err) {
          return res.send({'status': 'success', 'detail': 'Candidate cleared'});
        } else {
          return res.send({'status': 'error', 'detail': err}, 400);
        }
      }
    )
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    console.log('clearCandidate error: ', error);
    return res.send({'status': 'error', 'detail': 'You might not have enough permission to update record.'}, 400);
  }
})

router.get('/events', function(req, res, next){
  try {
    contractInstance.allEvents({}, null)
    .get(function(err, logs){
        if (err) {
          console.log('Error in logs event handler: ' + err);
          const error = {
            name: err.name,
            message: err.message
          }
          return res.send({'status': 'error', 'detail': error}, 400);
        }
        else {
          console.log('logs: ' + JSON.stringify(logs));
          return res.send({'status': 'success', 'detail': logs});
        }
      }
    );
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    console.log('error', error);
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})

router.get('/logs', function(req, res, next){
  try {
    var filter = web3.eth.filter({fromBlock: 0, toBlock: 'latest'});
    filter.get(function(err, logs){
      if (err) {
        console.log('Error in logs filter: ' + err);
        const error = {
          name: err.name,
          message: err.message
        }
        console.log('error', error);
        return res.send({'status': 'error', 'detail': error}, 400);
      }
      else {
        console.log('logs: ' + JSON.stringify(logs));
        return res.send({'status': 'success', 'detail': logs});
      }
    });
  } catch(err) {
    const error = {
      name: err.name,
      message: err.message
    }
    console.log('error', error);
    return res.send({'status': 'error', 'detail': error}, 400);
  }
})

contractInstance.TrackCandidateChanges({})
  .watch(function(err, log){
      if (err) {
        const error = {
          name: err.name,
          message: err.message
        }
        console.log('Error in TrackCandidateChanges event handler: ' + error);
      }
      else {
        console.log('Event TrackCandidateChanges log: ' + JSON.stringify(log));
        
        // Write cert to IPFS if a cert has been issued
        if (log) {
          if (log.args._msg == 'Certificate issued to candidate') {
            console.log('CERT ISSUED', log)
            // Generate cert and add file link to certificate
            var admissionNumber = log.args._subject;
            var blockchainBlockNumber = log.blockNumber
            var transactionHash = log.transactionHash

            // Get candidate details
            contractInstance.candidates(admissionNumber, function(err, candidate){
              if (!err) {
                var candidateInfo = {
                  admissionNumber: candidate[0],
                  name: candidate[1],
                  admissionDate: candidate[2],
                  totalFeesPaid: candidate[3],
                  passedUnits: candidate[4],
                  totalUnits: candidate[5],
                  clearedByAdmin: candidate[6],
                  certificate: candidate[7],
                  idNumber: candidate[8]
                }
                // Get candidate Program
                contractInstance.getCandidateProgram(admissionNumber, function(err, program){
                  if (!err) {
                    var programInfo = {
                      code: program[0],
                      name: program[1]
                    }
                    // 
                    var certificateContent = 'Certificate\n'+
                      'Name of candidate:'+candidateInfo.name+'\n'+
                      'National ID Number:'+candidateInfo.idNumber+'\n'+
                      'Admission Number:'+candidateInfo.admissionNumber+'\n'+
                      'Name of Course:'+programInfo.name+'\n'+
                      'Enrolment Date:'+moment(candidateInfo.admissionDate, 'x').format('MMMM Do YYYY, h:mm')+'\n'+
                      'Number of Units Passed:'+candidateInfo.passedUnits+'\n'+
                      'Number of Units Done:'+candidateInfo.totalUnits+'\n'+
                      'Certificate Generation Date:'+moment().format('MMMM Do YYYY, h:mm')+'\n'+
                      'BlockChain Block Number:'+blockchainBlockNumber+'\n'+
                      'BlockChain Transaction Hash:'+transactionHash+'\n'+
                      'Public explorer link: To verify this certificate, go to http://academic-registry.herokuapp.com/explorer and search using the Admission Number';

                      // Update certificate details
                      var payload = {admissionNumber: admissionNumber, content: certificateContent};
                      helper.writeToIPFS(payload, function(response){
                        console.log('IPFS Response', response)
                        if (response.status == 'success') {
                          // Update document hash
                          var content_hash = response.detail
                          if (content_hash) {
                            // Update certificate hash
                            contractInstance.updateCertDocumentHash(admissionNumber, content_hash, function(error, result) {
                              console.log('Updated contract hash')
                              console.log(error, result)
                            })
                          }
                        }
                      }) // End updating certificate
                  } else {
                    console.log('Error fetching candidate program', err)
                  }
                })
              } else {
                console.log('Error fetching candidate', err)
              }
            })
          }
        } 
      }
    }
  );

module.exports = router;
