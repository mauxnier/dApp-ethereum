# dApp-ethereum

[Comment créer une Dapp avec Solidity et ReactJS](https://www.youtube.com/watch?v=poyVa6yd4X8)

## Librairies utilisées

- hardhat (alternative à Truffle) : environnement de développement pour la blockchain Ethereum.
- ethers (alternative à web3.js) : permet d'intéragir avec la blockchain Ethereum.

## Lancement
### Compilation des changements
npx hardhat compile

### Création des noeuds locaux (on doit avoir 2 terminaux ouverts)
npx hardhat node

### Déploiement du contrat (on a besoin des noeuds locaux)
npx hardhat run scripts/deploy.js --network localhost

## MetaMask (utiliser l'extension navigateur)
Créer un compte et changer le réseau en "localhost 8545"
Faire "Import Account" et importer un des comptes qui a été créé dans le terminal (celui qui a lancé les noeuds locaux) avec sa clé privée.
