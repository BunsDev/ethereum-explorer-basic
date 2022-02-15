const Web3 = require("web3");
const { ethers } = require("ethers");

// Initalizing web3 and account variables
let web3 = new Web3(new Web3.providers.WebsocketProvider('INSERT_INFURA'));
let account = web3.eth.accounts.create();

// Calculating gas burnt per block - rounded to two decimal places
function burnCalculator(gasUsed, baseFeePerGas) {
    let gasBurned = gasUsed * baseFeePerGas;
    let stringGas = web3.utils.toBN(gasBurned).toString();
    let gas = web3.utils.fromWei(stringGas, 'ether');
    return parseFloat(gas).toFixed(2);
}

// Processes transaction within each block to find the first three transactions
async function blockInformation(blockNumber) {
    let emoji = ["🥇" ,"🥈" ,"🥉"];
    let array = [];
    let blockInfo = await web3.eth.getBlock(blockNumber);
    let transactionHash = blockInfo["transactions"].slice(0,3);
    // Loops through the first three transactions to retrieve gas fee information
    for(let i = 0; i < transactionHash.length; i++) {
        let txnNumber = i + 1;
        let formattedTransaction = transactionHash[i].toLowerCase();
        let transactionData = await web3.eth.getTransaction(formattedTransaction);
        let formattedgasFee = web3.utils.toBN(transactionData["gasPrice"]).toString();
        let gasFee = web3.utils.fromWei(formattedgasFee, "gwei");
        let message = emoji[i] + " Transaction " + txnNumber + ": " + gasFee + " GWEI";
        array.push(message);
    }
    return array;
};

// Subscribes to the latest block event
async function latestBlock() {
    let block = await web3.eth.subscribe('newBlockHeaders', function(error,result){
        if (!error) {
            blockInformation(result["number"]).then((txnInfo) => {
                console.log();
                console.log("🧐 Information for", result["number"] + ":");
                console.log("----------------------------");
                if(result["gasUsed"] > 0){
                    console.log("🔥 Burnt gas fees:", burnCalculator(result["gasUsed"], result["baseFeePerGas"]), "ETH");
                    console.log();
                    for(let i=0; i < txnInfo.length; i++) {
                        console.log(txnInfo[i]);
                    }
                } else {
                    console.log("👀 No transactions within this block");
                }
          
            })
        } else {
            console.log(error);
        };
    });
};

latestBlock();
