import React from 'react';
import Cookies from 'js-cookie';
import { ethers } from 'ethers';
import { TextField, Button } from '@mui/material';
import { Navbar, Nav } from 'react-bootstrap';
import TaskContractAbi from '../artifacts/contracts/TaskContract.sol/TaskContract.json';
// import { TaskContractAddress } from './config.js';
import Task from './Task';
import '../css/App.css';
import '../css/TopNavbar.css';


// const hre = require("hardhat");

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
			showStatus: true,
			accountAddress: '',
			showAccountAddress: false,
			contractAddress: '',
			showContractAddress: false,
		};
		this.toggleStatus = this.toggleStatus.bind(this);
		this.handleShowAccountAddress = this.handleShowAccountAddress.bind(this);
		this.handleShowContractAddress = this.handleShowContractAddress.bind(this);
	}

	/**
	 * Appelle des fonctions au chargement de la page
	 */
	componentDidMount() {
		this.connectWalletByCookie();
		if (this.state.accountAddress !== '') {
			this.getAllTasks();
		}
	}

	/**
	 * Appel de Metamask pour se connecter au portefeuille en cliquant sur le bouton Connect Wallet
	 */
	connectWallet = async () => {
		try {
			const { ethereum } = window

			if (!ethereum) {
				console.log('Metamask not detected')
				return
			}
			let chainId = await ethereum.request({ method: 'eth_chainId' })
			console.log('Connected to chain: ' + chainId)

			const localhostChainId = '0x539'

			if (chainId !== localhostChainId) {
				alert('You are not connected to the Localhost:8545 Testnet!')
				return
			} else {
				this.setState({ correctNetwork: true });
			}

			const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

			this.setState({ accountAddress: accounts[0] });
			Cookies.set('account_address', accounts[0], { expires: 7 });
			console.log('Added account address to cookie: ', accounts[0]);
		} catch (error) {
			console.log('Error connecting to metamask: ', error)
		}
	}

	/**
	 * Connexion au portefeuille en utilisant le cookie
	 */
	connectWalletByCookie = async () => {
		try {
			const { ethereum } = window

			if (!ethereum) {
				console.log('Metamask not detected')
				return
			}

			let chainId = await ethereum.request({ method: 'eth_chainId' })
			// console.log('Connected to chain: ' + chainId)

			const localhostChainId = '0x539'

			if (chainId !== localhostChainId) {
				alert('You are not connected to the Localhost:8545 Testnet!')
				return
			} else {
				this.setState({ correctNetwork: true });
			}

			const accountAddress = Cookies.get('account_address');
			if (accountAddress === undefined || accountAddress === '') {
				console.log('No account address found in cookie, please connect to Metamask');
				return;
			}
			console.log('Found account address by cookie: ', accountAddress);
			this.setState({ accountAddress: accountAddress });

			const contractAddress = Cookies.get('contract_address');
			if (contractAddress === undefined || contractAddress === '') {
				console.log('No contract address found in cookie, please deploy the contract');
				return;
			}
			console.log('Found contract address by cookie: ', contractAddress);
			this.setState({ contractAddress: contractAddress });
		} catch (error) {
			console.log('Error connecting to metamask: ', error)
		}
	}

	/**
	 * Récupération des tâches
	 */
	getAllTasks = async () => {
		try {
			const { ethereum } = window

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const TaskContract = new ethers.Contract(
					this.state.contractAddress,
					// TaskContractAddress,
					TaskContractAbi.abi,
					signer
				)

				let allTasks = await TaskContract.getMyTasks();
				this.setState({ tasks: allTasks });
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
				const signer = provider.getSigner();
				const TaskContract = new ethers.Contract(
					this.state.contractAddress,
					// TaskContractAddress,
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
				const signer = provider.getSigner();
				const TaskContract = new ethers.Contract(
					this.state.contractAddress,
					// TaskContractAddress,
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
	* Permet de se déconnecter du portefeuille Metamask en supprimant le cookie
	*/
	handleDisconnect = async () => {
		console.log("Déconnexion du portefeuille Metamask");
		Cookies.remove('account_address');
		window.location.reload();
	}

	/**
	 * Permet de changer de portefeuille Metamask en supprimant le cookie et en appelant la fonction connectWallet()
	 */
	handleWallet = async () => {
		console.log("Changement de portefeuille");
		//TODO modifier
		this.connectWallet();
		// window.location.reload();
	}

	/**
	 * Permet de déployer le contrat sur la blockchain
	 */
	// deployContract = async () => {
	// const Contract = await hre.ethers.getContractFactory("TaskContract");
	// const contract = await Contract.deploy();
	// await contract.deployed();
	// console.log("Contract deployed to:", contract.address);
	// // Mise en cookie de l'adresse du contrat déployé
	// Cookies.set('contract_address', contract.address);
	// }

	deployContract = async () => {
		// create an ethers.js provider object connected to the current network
		const provider = new ethers.providers.Web3Provider(window.ethereum);

		// request access to the user's MetaMask account
		await window.ethereum.request({ method: 'eth_requestAccounts' });

		// get the signer (account) from the provider
		const signer = provider.getSigner();

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
	 * Affiche ou non l'adresse du portefeuille connecté
	 */
	handleShowAccountAddress() {
		this.setState({
			showAccountAddress: !this.state.showAccountAddress
		});
	}

	/**
	 * Affiche ou non l'adresse du contrat déployé
	 */
	handleShowContractAddress() {
		this.setState({
			showContractAddress: !this.state.showContractAddress
		});
	}

	/**
	 * Affiche ou non le statut de la connexion au réseau Ethereum
	 */
	toggleStatus() {
		this.setState({
			showStatus: !this.state.showStatus
		});
	}

	/**
	 * Fonction de rendu du composant
	 * @returns {JSX.Element}
	 */
	render() {
		const { input, tasks, correctNetwork, accountAddress, contractAddress } = this.state;
		const statusClass = this.state.showStatus ? "status-indicator" : "status-indicator hidden";
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
								<Nav.Link onClick={this.deployContract}>Déployer le contrat</Nav.Link>
								<Nav.Link onClick={this.handleWallet}>Changer de portefeuille</Nav.Link>
								<Nav.Link onClick={this.handleDisconnect}>Déconnexion</Nav.Link>
								{/* <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
											<NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
											<NavDropdown.Item href="">Another action</NavDropdown.Item>
											<NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
											<NavDropdown.Divider />
											<NavDropdown.Item href="">Separated link</NavDropdown.Item>
										</NavDropdown> */}
							</Nav>
						</Navbar.Collapse>
					</div>
				</Navbar>
				<div className={statusClass}>
					{this.state.accountAddress !== '' ? (
						<h6><span className="connected" onClick={this.handleShowAccountAddress}></span>Compte connecté</h6>
					) : (
						<h6><span className="disconnected"></span>Compte non-connecté</h6>
					)}
					{this.state.showAccountAddress && (
						<p>Adresse : {accountAddress}</p>
					)}

					{this.state.contractAddress !== '' ? (
						<h6><span className="connected"onClick={this.handleShowContractAddress}></span>Contrat déployé</h6>
					) : (
						<h6><span className="disconnected"></span>Contrat non-déployé</h6>
					)}
					{this.state.showContractAddress && (
						<p>Adresse : {contractAddress}</p>
					)}
				</div>
				{(accountAddress !== '') && correctNetwork ? (
					<div className="App">
						<h2>Get Things Done</h2>
						<h6><em>Qui veut faire quelque chose trouve un moyen, qui ne veut rien faire trouve une excuse.</em></h6>
						<form style={{ margin: "10px 0px" }}>
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
						<button className='walletButton' onClick={this.connectWallet}>
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
