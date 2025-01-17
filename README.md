# Création d'un système de preuve Zero-Knowledge Proof (ZKP)

Ce TP vous permettra de comprendre et d'implémenter un système ZKP non-interactif basé sur Groth16, un type de zk-SNARK. Voici une explication détaillée pour chaque étape.

## Introduction

Qu'est ce que le Zero-Knowledge-Proof (ZKP) ?

Un Zero-Knowledge Proof permet de prouver qu'un calcul ou une condition est valide sans révéler les données utilisées pour ce calcul. Imaginez prouver que vous avez un mot de passe correct sans montrer le mot de passe.

Dans ce TP, nous allons :

- Créer un circuit (un "programme" mathématique).
- Générer une preuve que notre circuit fonctionne avec des données secrètes.
- Vérifier cette preuve pour confirmer qu’elle est valide.


### **Étape 1 : Préparer l’environnement**
**But :** Installer les outils nécessaires pour travailler avec les ZKP.

#### **1. Installez les outils requis**
Ouvrez votre terminal et exécutez ces commandes :
1. **Installer Node.js** :
   Si Node.js n'est pas encore installé, téléchargez-le depuis [Node.js](https://nodejs.org/).

2. **Installer Circom** :
   Suivez ces étapes pour installer Circom :
   ```bash
   npm install -g circom
   ```

3. **Installer SnarkJS** :
   SnarkJS nous aide à générer et vérifier des preuves :
   ```bash
   npm install snarkjs
   ```

4. **Initialisez un projet Node.js** :
   Créez un nouveau dossier et initialisez un projet Node.js :
   ```bash
   mkdir zkp-tp
   cd zkp-tp
   npm init -y
   ```

---

### **Étape 2 : Créer un circuit ZKP**
**But :** Définir un circuit qui prendra un nombre secret et générera un hachage. Ce circuit prouvera que vous avez un secret sans le montrer.

1. **Installez la bibliothèque Circomlib** :
   ```bash
   npm install circomlib
   ```

2. **Écrivez votre circuit** :
   Créez un fichier `circuit.circom` dans le dossier `zkp-tp` et ajoutez ce code :
   ```circom
   pragma circom 2.0.0;

   include "node_modules/circomlib/circuits/pedersen.circom";

   template Hasher() {
       signal input secret;
       signal output out;

       component pedersen = Pedersen(1);
       pedersen.in[0] <== secret;
       out <== pedersen.out[0];
   }

   component main = Hasher();
   ```

   **Explication** :
   - Le circuit **Hasher** prend un nombre secret comme entrée (`secret`) et utilise une fonction appelée **Pedersen** pour générer un hachage (`out`).
   - Nous allons prouver que nous connaissons le secret, sans révéler sa valeur.

---

### **Étape 3 : Compiler le circuit**
**But :** Convertir le circuit en un format utilisable pour générer des preuves.

1. **Compilez le circuit** :
   Dans votre terminal, exécutez :
   ```bash
   circom circuit.circom --r1cs --wasm
   ```

2. **Résultat :**
   Cette commande génère :
   - `circuit.r1cs` : Décrit les règles du circuit.
   - `circuit.wasm` : Permet de calculer les preuves.

🎉 Vous avez créé un circuit ZKP !

---

### **Étape 4 : Mise en place du coordinateur**
**But :** Générer le trusted setup pour zk-SNARKs.

1. **Téléchargez sur votre projet un fichier pré-généré :**
   Dans votre terminal, exécutez :
   ```bash
   curl -o powersOfTau28_hez_final_12.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
   ```

2. **Initialisez les paramètres de configuration à notre circuit zk-SNARKs :**
   Exécutez cette commande pour calculer une preuve à partir du circuit et de votre secret :
   ```bash
   npx snarkjs groth16 fullProve input.json circuit_js/circuit.wasm circuit_0000.zkey
   ```

3. **Générez la clé de vérification :**
   Enfin, générez la clé de vérification au format JSON afin de pouvoir utiliser notre circuit
   ```bash
   npx snarkjs zkey export verificationkey circuit_0000.zkey verification_key.json
   ```

🎉 Vous avez généré votre circuit de vérification !

---

### **Étape 5 : Générer une preuve**
**But :** Utiliser le circuit pour prouver que vous connaissez un secret.

1. **Préparez un fichier d’entrée :**
   Créez un fichier `input.json` contenant votre secret :
   ```json
   {
       "secret": 12345
   }
   ```

2. **Générez la preuve :**
   Exécutez cette commande pour calculer une preuve à partir du circuit et de votre secret :
   ```bash
   npx snarkjs groth16 fullProve input.json circuit_js/circuit.wasm circuit_0000.zkey
   ```

3. **Résultat :**
   - Une preuve cryptographique est générée (elle ressemble à un gros fichier JSON).
   - **Exemple d’une preuve :**
     ```json
     {
         "proof": {
             "pi_a": [...],
             "protocol": "groth16",
             "curve": "bn128"
         },
         "publicSignals": ["547083752..."]
     }
     ```

🎉 Vous avez généré une preuve (π) !

---

### **Étape 6 : Vérifier la preuve**
**But :** Vérifier que la preuve est valide sans révéler le secret.

1. **Générez une clé de vérification :**
   Exécutez cette commande pour créer une clé publique pour vérifier la preuve :
   ```bash
   npx snarkjs zkey export verificationkey circuit_0000.zkey verification_key.json
   ```

2. **Écrivez un script de vérification :**
   Créez un fichier `verify.js` avec ce code :
   ```javascript
   const snarkjs = require('snarkjs');
   const fs = require("fs");

   async function verifyProof() {
       const { proof, publicSignals } = await snarkjs.groth16.fullProve(
           { secret: 12345 }, 
           "circuit_js/circuit.wasm", 
           "circuit_0000.zkey"
       );

       const vKey = JSON.parse(fs.readFileSync("verification_key.json"));
       const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

       if (isValid) {
           console.log("Proof is valid!");
       } else {
           console.log("Proof is invalid!");
       }
   }

   verifyProof();
   ```

3. **Exécutez la vérification :**
   ```bash
   node verify.js
   ```

4. **Résultat attendu :**
   ```bash
   Proof is valid!
   ```

🎉 Vous avez vérifié la preuve avec succès !

---

### **Explication claire pour débutants**
- **Circuit** : Un programme qui transforme votre secret en hachage.
- **Preuve** : Une attestation que vous connaissez un secret sans le révéler.
- **Vérification** : Confirmer que la preuve est valide en utilisant une clé publique.

---

### **Exercice Bonus : Amélioration**
1. **Changez la valeur secrète :** Testez avec d'autres secrets.
2. **Cas pratique :** Imaginez prouver que vous avez un mot de passe correct sans jamais le partager.

Avec ce TP, vous avez manipulé un concept avancé de cryptographie de manière simple et pratique. Bonne exploration ! 😊
