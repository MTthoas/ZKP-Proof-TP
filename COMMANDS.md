 circom circuit.circom --wasm --r1cs -o ./build
curl -o powersOfTau28_hez_final_12.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau


## Configurer la clé preuve :

npx snarkjs groth16 setup build/circuit.r1cs powersOfTau28_hez_final_12.ptau circuit_0000.zkey

Genère la clé de vérification > verification_key.json avec :

npx snarkjs zkey export verificationkey circuit_0000.zkey verification_key.json

### Ensuite ecrit verif.js