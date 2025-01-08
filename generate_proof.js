const snarkjs = require("snarkjs");
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { in: 10 }, 
    "build/circuit_js/circuit.wasm", 
    "circuit_0000.zkey"
);
console.log(publicSignals);
console.log(proof);
