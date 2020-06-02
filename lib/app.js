'use strict';

var _core = require('@iota/core');

console.log("Connecting to IOTA devnet");

var iota = (0, _core.composeAPI)({
    provider: 'https://nodes.comnet.thetangle.org:443'
});

console.log("Connected to IOTA devnet");

iota.getNodeInfo().then(function (info) {
    return console.log(info);
}).catch(function (error) {
    console.log('Request error: ' + error.message);
});

var SEED = 'QDCJFJWRAXHRXASPADYUFZBIPYWETPRYVFRDTZGCKVXHUEIJOBTTZ9EJ9XHORFRHHZMIGYROMJULRDCHG';
var ADDRESS = 'LGHIBEMMPMPLHW9MANWFFZFZCMTXDXRDMMMNHRTIRXCEIT9YABSAPMIFABMQYBY9EAWQCZ9KOYAIU9RICJBZQUYSCC';
/*
let addresses = iota.getNewAddress(SEED, 
    {index:0, total:1, security:2, checksum:true, returnAll:false},
    (error, success)=>{
        if(error){
            console.log(error)
        }
        else{
            console.log(success[0])
        }
    });
*/

function sendIOTA(seed, value, address) {
    var transfers = [{
        address: address,
        value: value,
        tag: '',
        message: ''
    }];
    var depth = 3;
    var minWeightMagnitude = 10;
    iota.prepareTransfers(seed, transfers).then(function (trytes) {
        return iota.sendTrytes(trytes, depth, minWeightMagnitude);
    }).then(function (bundle) {
        console.log('Publoshed transaction with tail hast ' + bundle[0].hash);
    }).catch(function (err) {
        console.log(err);
    });
}

sendIOTA(SEED, 100, ADDRESS);

/*
import HMKit from 'hmkit'
import { composeAPI } from '@iota/core'
import { generateAddress } from '@iota/core'

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})

const iota = composeAPI({
  provider: 'https://nodes.devnet.iota.org:443'
})

const hmkit = new HMKit(
    "dGVzdCh3rR2bK747uy+ZSWPBvoBMPmGRdshpLxJ82mluueVjRMdnfSKhj4pwdNQ+TsEdq2XlLC4OmkM9MVQ2ippr8IYYB2jSC3EKpOFCQRQLHfWG9HAFOnGuccEuKU57WBXQQET96spxCm/gT03C1qO0P5DHKWdBxF8kj/U2SSeCA3HfQm2xzLxPkj5HbUlHM1JGisz7jWV0",
    "0mJFmZOxHTd1CFiZno0dCL6B7v6oEBz3LtJZ7v/SIUo="
);

const vehicleSeed = 'MMSGFR9QFAZXBUYQAJDHTMQRKOCSPFFA9YQZNRUUAMLZPFOOGMR9YRMCTGNVBTOMRN9VPOCKJWF9OI9XE'

const accessTokenVehicle = 'a950af84-fb4e-4d9d-8c82-c59672190aa6'

const chargerSeed = 'QDCJFJWRAXHRXASPADYUFZBIPYWETPRYVFRDTZGCKVXHUEIJOBTTZ9EJ9XHORFRHHZMIGYROMJULRDCHG'

const accessTokenCharger = 'd9f5727c-e972-414e-8d60-35396b99c145'

class HMVehicle {
  constructor (seed) {
    this.seed = seed
  }
  async initHMCertificate (accessTokenVehicle) {
      this.accessCertificate = await hmkit.downloadAccessCertificate(accessTokenVehicle)
  }

  async sendTransaction(value, address){
      sendIOTA(this.seed, value,address)
  }

  async startCharging(){
      try{
        await hmkit.tekematics.sendCommand(
            this.accessCertificate.getSerial(),
            hmkit.commands.ChargingCommand.startCharging()
        )
      }catch(e){
          console.log(e)
      }
  }
}

class HMCharger {
  constructor (seed) {
    this.seed = seed
  }
  async initHMCertificateCharger (accessTokenCharger) {
    this.accessCertificate = await hmkit.downloadAccessCertificate(accessTokenCharger)
  }
  async getRecieveAddress(){
      this.currentAddress = generateAddress(this.seed,0)
      return this.currentAddress
  }

  async prepareForPayment(){
      this.balance = await this.checkBalance()
  }

  async checkBalance(){
      let responce = await iota.getBalances([this.currentAddress],100)
      return responce.balances[0]
  }

  async authenticate(){
      try{
        await hmkit.tekematics.sendCommand(
            this.accessCertificate.getSerial(),
            hmkit.commands.HomeCharger.authenticate()
        )
      }catch(e){
          console.log(e)
      }
  }
  async checkForPaymentConfirmation(callback){
      try{
        let initialBalance = this.balance
        var currentBalance = 0
        for (var i=0; i<240; i++){
            currentBalance = await this.checkBalance()

            if(currentBalance>initialBalance){
                await this.authenticate()
                return callback(null)
            }
            await new Promise((resolve)=>setTimeout(resolve, 5000))
        }
        return callback('Error: TimeOut')
      }catch(e){
          return callback(e)
      }
  }
}

async function app () {
  try {
    // init vehicle object
    var vehicle = new HMVehicle(vehicleSeed)
    await vehicle.initHMCertificate(accessTokenVehicle)
    console.log('Vehicle initialized.')

    // init charger object
    var charger = new HMCharger(chargerSeed)
    await charger.initHMCertificateCharger(accessTokenCharger)
    console.log('Charger initialized.')

    let chargerAddress = await charger.getRecieveAddress()
    console.log(`Charger Address: ${chargerAddress}`)
    console.log('Preparing for payment...')
    await charger.prepareForPayment()
    console.log('Sending Transac')
    vehicle.sendTransaction(1, chargerAddress)
    console.log('Checking for payment confrmation')
    charger.checkForPaymentConfirmation((error)=>{
        if(!error){
            console.log('Payment confirmed!')
            console.log('Starting charging!')

            vehicle.startCharging()
        }else{
            console.log(error)
        }
    })

    }catch(e){
        console.log(e)
    }
}

function sendIOTA(seed, value, address){
    const transfers = [{
        address:address,
        value:value,
        tag:'',
        message: ''
    }]
    const depth = 3
    const minWeightMagnitude = 9
    iota.prepareTransfers(seed, transfers)
        .then(trytes => iota.sendTrytes(trytes, depth, minWeightMagnitude))
        .then(bundle => {
            console.log(`Published transaction with tail hash : ${bundle[0].hash}`)
        })
        .catch(err => {console.log(err)})
}
// Run your app
app()*/