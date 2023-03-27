import React from 'react';
import Cookies from 'js-cookie';
import { ethers } from 'ethers';
import { TextField, Button } from '@mui/material';
import { Navbar, Nav } from 'react-bootstrap';
import TaskContractAbi from '../artifacts/contracts/TaskContract.sol/TaskContract.json';
import Task from './Task';
import '../css/App.css';
import '../css/TopNavbar.css';

/**
 * Composant principal de l'application
 */
class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			input: '',
			tasks: [],
			correctNetwork: false,
			connectAccount: false,
			showStatus: true,
			accountAddress: '',
			showAccountAddress: false,
			contractAddress: '',
			showContractAddress: false,
		};
		this.handleConnectAccount = this.handleConnectAccount.bind(this);
		this.toggleStatus = this.toggleStatus.bind(this);
		this.handleShowAccountAddress = this.handleShowAccountAddress.bind(this);
		this.handleShowContractAddress = this.handleShowContractAddress.bind(this);
		this.getAccountsFromCookieList = this.getAccountsFromCookieList.bind(this);
	}

	/**
	 * Appelle des fonctions au chargement de la page
	 */
	async componentDidMount() {
		this.handleChangeWallet();

		await this.retrieveContractAddress();
		await this.retrieveAccountAddress();
	}

	/**
	 * Récupère l'adresse du portefeuille
	 */
	retrieveAccountAddress = async () => {
		await this.connectWallet()
	}

	/**
	 * Récupère l'adresse du contrat
	 */
	retrieveContractAddress = async () => {
		const contractAddress = Cookies.get('contract_address');
		if (contractAddress === undefined || contractAddress === '') {
			console.log('No contract address found in cookie, please deploy the contract');
			return;
		}
		console.log('Found contract address by cookie (need to verify it): ', contractAddress);
		if (await this.checkContractDeployment(contractAddress) === true) {
			console.log('Contract address is verified at address: ', contractAddress);
			this.setState({ contractAddress: contractAddress });
		} else {
			console.log('The contract address found in the cookie is not valid, please deploy the contract again (here is the cookie address): ', contractAddress);
			this.setState({ contractAddress: '' });
		}
	}

	/**
	 * Appel de Metamask pour se connecter au portefeuille en cliquant sur le bouton Connect Wallet
	 */
	connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Metamask not detected');
				return;
			}
			let chainId = await ethereum.request({ method: 'eth_chainId' });
			console.log('Connected to chain: ' + chainId);

			const localhostChainId = '0x539';

			if (chainId !== localhostChainId) {
				alert('You are not connected to the Localhost:8545 Testnet!');
				return;
			} else {
				this.setState({ correctNetwork: true });
			}

			const accountAddress = this.getSelectedAccountFromCookie();
			if (accountAddress === undefined || accountAddress === '') {
				if (this.state.connectAccount === true) {
					console.log('No account address found in cookie, connecting to Metamask...');
					const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
					this.setState({ accountAddress: accounts[0] }, () => {
						console.log('Added account address to state: ', this.state.accountAddress);

						// Ajout de l'adresse du portefeuille sélectionné dans le cookie et récupération des tâches
						this.setSelectedAccountToCookie(this.state.accountAddress);
						console.log('Add account address to cookie of selected account', this.state.accountAddress);

						// Ajout de l'adresse du portefeuille dans la liste des cookies si il n'y est pas déjà
						this.addAccountToCookieList(this.state.accountAddress);

						// Récupération des tâches
						this.getAllTasks(this.state.contractAddress, this.state.accountAddress);
					});
				} else {
					return;
				}
			} else {
				console.log('Found account address by cookie: ', accountAddress);

				this.setState({ connectAccount: true });
				this.setState({ accountAddress: accountAddress }, () => {
					console.log('Set account address to state: ', this.state.accountAddress);

					// Ajout de l'adresse du portefeuille dans la liste des cookies si il n'y est pas déjà
					this.addAccountToCookieList(this.state.accountAddress);

					// Récupération des tâches
					this.getAllTasks(this.state.contractAddress, this.state.accountAddress);
				});
			}
		} catch (error) {
			console.log('Error connecting to metamask: ', error);
			return;
		}
	}

	/**
	 * Récupération des tâches
	 */
	getAllTasks = async (contractAddress, accountAddress) => {
		console.log('Getting all tasks linked to the account address from the contract: ', contractAddress);
		try {
			const { ethereum } = window

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner(accountAddress);
				const TaskContract = new ethers.Contract(
					contractAddress,
					TaskContractAbi.abi,
					signer
				)

				let allTasks = await TaskContract.getMyTasks();
				this.setState({ tasks: allTasks }, () => {
					console.log('Retrieved all tasks from the contract: ', this.state.tasks);
				});
			} else {
				console.log("Ethereum object doesn't exist");
			}
		} catch (error) {
			console.log(error);
		}
	}

	/**
	 * Ajout d'une tâche
	 * @param {*} e événement
	 */
	addTask = async (e) => {
		e.preventDefault();

		let task = {
			'taskText': this.state.input,
			'isDeleted': false
		};

		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner(this.state.accountAddress);
				const TaskContract = new ethers.Contract(
					this.state.contractAddress,
					TaskContractAbi.abi,
					signer
				);

				TaskContract.addTask(task.taskText, task.isDeleted)
					.then(response => {
						this.setState({ tasks: [...this.state.tasks, task] });
						console.log("Task added");
					})
					.catch(err => {
						console.log("Error occured while adding a new task: ", err);
					});
				;
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log("Error submitting new Task", error);
		}

		this.setState({ input: '' })
	};

	/**
	 * Suppression d'une tâche
	 * @param {*} key clé de la tâche à supprimer
	 */
	deleteTask = key => async () => {
		console.log(key);

		// Suppression de la tâche avec la clé de cette dernière
		try {
			const { ethereum } = window

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner(this.state.accountAddress);
				const TaskContract = new ethers.Contract(
					this.state.contractAddress,
					TaskContractAbi.abi,
					signer
				);
				await TaskContract.deleteTask(key, true);
				let allTasks = await TaskContract.getMyTasks();
				this.setState({ tasks: allTasks });
			} else {
				console.log("Ethereum object doesn't exist");
			}

		} catch (error) {
			console.log(error);
		}
	};

	/**
	 * Permet de déployer le contrat sur la blockchain
	 */
	deployContract = async () => {
		// create an ethers.js provider object connected to the current network
		const provider = new ethers.providers.Web3Provider(window.ethereum);

		// request access to the user's MetaMask account
		await window.ethereum.request({ method: 'eth_requestAccounts' });

		// get the signer (account) from the provider
		const signer = provider.getSigner(this.state.accountAddress);

		// get the contract factory
		const contractFactory = new ethers.ContractFactory(
			TaskContractAbi.abi,
			TaskContractAbi.bytecode,
			signer
		);

		// deploy the contract
		const contract = await contractFactory.deploy();

		// wait for the contract to be mined
		await contract.deployed();

		Cookies.set('contract_address', contract.address);
		this.setState({ contractAddress: contract.address });
		console.log('TaskContract deployed to:', contract.address);
	}

	/**
	 * Vérifie si le contrat est déployé
	 * @returns true si le contrat est déployé, false sinon
	 */
	checkContractDeployment = async (contractAddress) => {
		try {
			// create an ethers.js provider object connected to the current network
			const provider = new ethers.providers.Web3Provider(window.ethereum);

			// get the contract instance using the contract address
			const contract = new ethers.Contract(contractAddress, TaskContractAbi.abi, provider);

			// call a function on the contract to check if it exists at the given address
			const name = await contract.getName();
			console.log('Verify contract name: ', name);
			return name === 'TaskContract';
		} catch (error) {
			console.error('Erreur lors de la vérification du déploiement du contrat', error);
			return false;
		}
	}

	/**
	 * Permet de gérer la popup de changement de portefeuille
	 */
	handleChangeWallet = async () => {
		console.log("Changement de portefeuille");

		// fermer la popup
		this.closeChangeWalletPopup();

		// récupérer la liste d'adresses de compte depuis le cookie
		const accountList = this.getAccountsFromCookieList();

		// récupérer l'élément ul où les éléments li seront ajoutés
		const accountListElement = document.getElementById('account-list');

		// boucler à travers les adresses de compte et créer des éléments li
		for (let i = 0; i < accountList.length; i++) {
			const li = document.createElement('li');
			const button = document.createElement('button');
			button.textContent = accountList[i];
			button.className = 'account-address';
			button.onclick = this.setSelectedAccount.bind(this, accountList[i]);
			li.appendChild(button);
			accountListElement.appendChild(li);
		}

	}

	/**
	* Permet de se déconnecter du portefeuille Metamask en supprimant le cookie
	*/
	handleDisconnect = async () => {
		console.log("Déconnexion du portefeuille Metamask");

		this.setState({ connectAccount: false }, () => {
			this.removeSelectedAccountCookie();
			// this.removeAccountFromCookieList(this.state.accountAddress);
			this.setState({ accountAddress: '' });
		});
	}

	/**
	 * Retourne l'adresse du portefeuille Metamask sélectionné
	 * @returns l'adresse du portefeuille Metamask
	 */
	getSelectedAccountFromCookie = () => {
		const selectedAccount = Cookies.get('selected_account');
		return selectedAccount ? selectedAccount : '';
	}

	/**
	 * Ajoute l'adresse du portefeuille Metamask sélectionné
	 * @param {*} selectedAccount portefeuille sélectionné
	 */
	setSelectedAccount = (selectedAccount) => {
		this.setSelectedAccountToCookie(selectedAccount);
		this.setState({ accountAddress: selectedAccount }, () => {
			this.closeChangeWalletPopup();
			this.getAllTasks(this.state.contractAddress, this.state.accountAddress);
		});
	}

	/**
	 * Ajoute l'adresse du portefeuille Metamask sélectionné dans le cookie
	 * @param {*} selectedAccount portefeuille sélectionné
	 */
	setSelectedAccountToCookie = (selectedAccount) => {
		Cookies.set('selected_account', selectedAccount, { expires: 7 });
	}

	/**
	 * Supprime le cookie de l'adresse du portefeuille Metamask sélectionné
	 */
	removeSelectedAccountCookie = () => {
		Cookies.remove('selected_account');
	}

	/**
	 * Récupère la liste des adresses stockées dans le cookie
	 * @returns la liste des adresses stockées dans le cookie
	 */
	getAccountsFromCookieList = () => {
		const accountListJSON = Cookies.get('account_addresses');
		const accountList = accountListJSON ? JSON.parse(accountListJSON) : [];

		return accountList.map(account => account.toString());
	};

	/**
	 * Ajoute une adresse à la liste des adresses stockées dans le cookie
	 * @param {*} address l'adresse à ajouter
	 */
	addAccountToCookieList = (accountAddress) => {
		const accountListJSON = Cookies.get('account_addresses');
		const accountList = accountListJSON ? JSON.parse(accountListJSON) : [];

		if (!accountList.includes(accountAddress)) {
			accountList.push(accountAddress);
			Cookies.set('account_addresses', JSON.stringify(accountList));
			console.log('Added account address to cookie list: ', this.state.accountAddress);
		}
	};

	/**
	 * Supprime une adresse de la liste des adresses stockées dans le cookie
	 * @param {*} accountAddress l'adresse à supprimer
	 */
	removeAccountFromCookieList = (accountAddress) => {
		const accountListJSON = Cookies.get('account_addresses');
		const accountList = accountListJSON ? JSON.parse(accountListJSON) : [];

		const index = accountList.indexOf(accountAddress);
		if (index > -1) {
			accountList.splice(index, 1);
			Cookies.set('account_addresses', JSON.stringify(accountList));
		}
	};

	/**
	 * Permet de se connecter à un portefeuille Metamask
	 */
	handleConnectAccount() {
		this.setState({ connectAccount: true }, () => {
			this.connectWallet();
		});
	}

	/**
	 * Affiche ou non l'adresse du portefeuille connecté
	 */
	handleShowAccountAddress() {
		this.setState({ showAccountAddress: !this.state.showAccountAddress });
	}

	/**
	 * Affiche ou non l'adresse du contrat déployé
	 */
	handleShowContractAddress() {
		this.setState({ showContractAddress: !this.state.showContractAddress });
	}

	/**
	 * Affiche ou non le statut de la connexion au réseau Ethereum
	 */
	toggleStatus() {
		this.setState({ showStatus: !this.state.showStatus });
	}

	/**
	 * Permet d'afficher la popup de changement de portefeuille
	 */
	toggleChangeWalletPopup() {
		const popup = document.querySelector('.popup');
		popup.toggleAttribute('hidden');
	}

	/**
	 * Permet de fermer la popup de changement de portefeuille
	 */
	closeChangeWalletPopup() {
		const popup = document.querySelector('.popup');
		popup.setAttribute('hidden', true);
	}

	/**
	 * Fonction de rendu du composant
	 * @returns {JSX.Element}
	 */
	render() {
		const { input, tasks, correctNetwork, connectAccount, accountAddress, contractAddress, showStatus, showAccountAddress, showContractAddress } = this.state;
		const statusClass = showStatus ? "status-indicator" : "status-indicator hidden";

		return (
			<div>
				<Navbar collapseOnSelect expand="lg" className="top-nav">
					<div className="container">
						<Navbar.Brand>
							<img id="logo" src="/img/logo.png" alt="Logo"></img>
							Todo List DApp
						</Navbar.Brand>
						<Navbar.Toggle aria-controls="responsive-navbar-nav" />
						<Navbar.Collapse id="responsive-navbar-nav" className="menu-list">
							<Nav>
								<Nav.Link onClick={this.toggleStatus}>Afficher le statut</Nav.Link>
								{connectAccount ? (
									<>
										<Nav.Link onClick={this.deployContract}>Déployer le contrat</Nav.Link>
										<Nav.Link onClick={this.toggleChangeWalletPopup}>Changer de portefeuille</Nav.Link>
										<Nav.Link onClick={this.handleDisconnect}>Déconnexion</Nav.Link>
									</>
								) : (
									<Nav.Link onClick={this.handleConnectAccount}>Connexion</Nav.Link>
								)}
							</Nav>
						</Navbar.Collapse>
					</div>
				</Navbar>
				<div className="popup">
					<h2>Choisir un compte</h2>
					<p>Choisissez un compte dans la liste ci-dessous :</p>
					<ul id="account-list">
						{/* Boucle pour afficher les adresses de compte depuis le cookie */}
					</ul>
					<button className="close-popup" onClick={this.closeChangeWalletPopup}>X</button>
				</div>
				<div className={statusClass}>
					{accountAddress !== '' ? (
						<h6><span className="connected" onClick={this.handleShowAccountAddress}></span>Compte connecté</h6>
					) : (
						<h6><span className="disconnected"></span>Compte non-connecté</h6>
					)}
					{showAccountAddress && accountAddress !== '' && <p>Adresse : {accountAddress}</p>}


					{contractAddress !== '' ? (
						<h6><span className="connected" onClick={this.handleShowContractAddress}></span>Contrat déployé</h6>
					) : (
						<h6><span className="disconnected"></span>Contrat non-déployé</h6>
					)}
					{showContractAddress && contractAddress !== '' && <p>Adresse : {contractAddress}</p>}

					<button className="close-popup" onClick={this.toggleStatus}>X</button>
				</div>
				{(accountAddress !== '') && correctNetwork ? (
					<div className="App">
						<h2>Get Things Done</h2>
						<h6><em>Qui veut faire quelque chose trouve un moyen, qui ne veut rien faire trouve une excuse.</em></h6>
						<form>
							<TextField id="outlined-basic" label="Ajouter une tâche" variant="outlined" style={{ margin: "0px 5px" }} size="small" value={input} onChange={e => this.setState({ input: e.target.value })} />
							<Button variant="contained" color="primary" onClick={this.addTask}>Ajouter</Button>
						</form>
						<ul>
							{tasks.map(item =>
								<Task
									key={item.id}
									taskText={item.taskText}
									onClick={this.deleteTask(item.id)}
								/>)
							}
						</ul>
					</div>
				) : (
					<div className="flex-container">
						<button className='walletButton' onClick={this.handleConnectAccount}>
							<img src="/img/metamask.png" alt="MetaMask" />
							Connecter un portefeuille Ethereum
						</button>
					</div>

				)}
			</div>
		);
	}
}

export default App;
