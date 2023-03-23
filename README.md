# dApp-ethereum

[Comment créer une Dapp avec Solidity et ReactJS](https://www.youtube.com/watch?v=poyVa6yd4X8)

## Librairies utilisées

- hardhat (alternative à Truffle) : environnement de développement pour la blockchain Ethereum.
- ethers (alternative à web3.js) : permet d'intéragir avec la blockchain Ethereum.

## Lancement

Dans la react-app, il faut lancer la commande suivante pour lancer le serveur de développement :

### Compilation des changements des contrats (fichiers .sol dans le dossier contracts)

npx hardhat compile

### Création des noeuds locaux (on doit avoir 2 terminaux ouverts)

npx hardhat node

### Déploiement du contrat (on a besoin des noeuds locaux)

npx hardhat run scripts/deploy.js --network localhost

## MetaMask (utiliser l'extension navigateur)

Créer un compte et changer le réseau en "localhost 8545"
Faire "Import Account" et importer un des comptes qui a été créé dans le terminal (celui qui a lancé les noeuds locaux) avec sa clé privée.

## Lancer le serveur de développement

npm start
