# dApp-ethereum

[Comment créer une Dapp avec Solidity et ReactJS](https://www.youtube.com/watch?v=poyVa6yd4X8)

## Librairies utilisées

- hardhat (alternative à Truffle) : environnement de développement pour la blockchain Ethereum.
- ethers (alternative à web3.js) : permet d'intéragir avec la blockchain Ethereum.

## Installation DANS ./react-app
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

## Lancement

Dans la react-app, il faut lancer la commande suivante pour lancer le serveur de développement :

### Compilation des changements des contrats (fichiers .sol dans le dossier contracts)

npx hardhat compile

### Création des noeuds locaux (on doit avoir 2 terminaux ouverts)

npx hardhat node

### Déploiement du contrat (on a besoin des noeuds locaux)

npx hardhat run scripts/deploy.js --network localhost

### MetaMask (utiliser l'extension navigateur)

Créer un compte et changer le réseau en "localhost 8545"
Faire "Import Account" et importer un des comptes qui a été créé dans le terminal (celui qui a lancé les noeuds locaux) avec sa clé privée.

### Lancer le serveur de développement

npm start

## Troubleshooting
MetaMask - RPC Error: [ethjs-query] while formatting outputs from RPC '{"value":{"code":-32603,"data":{"code":-32000,"message":"Nonce too high. Expected nonce to be 1 but got 8. Note that transactions can't be queued when automining.","data":{"message":"Nonce too high. Expected nonce to be 1 but got 8. Note that transactions can't be queued when automining."}}}}'
--> Il faut changer de compte ou réinitialiser le compte dans MetaMask.