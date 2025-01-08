const snarkjs = require("snarkjs");
const fs = require("fs");

async function main() {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { secret: 10 }, 
        "build/circuit_js/circuit.wasm", 
        "circuit_0000.zkey"
    );

    console.log("Public Signals: ", publicSignals);
    console.log("Proof: ", proof);

    const vKey = JSON.parse(fs.readFileSync("verification_key.json"));
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
}

main();
