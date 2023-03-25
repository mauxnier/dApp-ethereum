import React from 'react';
import Cookies from 'js-cookie';
import { ethers } from 'ethers';
import { TextField, Button } from '@mui/material';
import { Navbar, Nav } from 'react-bootstrap';
import TaskAbi from '../artifacts/contracts/TaskContract.sol/TaskContract.json';
import { TaskContractAddress } from './config.js';
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
			currentAccount: '',
			correctNetwork: false,
			contractAddress: '',
		};
	}

	/**
	 * Appelle des fonctions au chargement de la page
	 */
	componentDidMount() {
		this.connectWalletByCookie();
		if (this.state.currentAccount !== '') {
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

			console.log('Added account address to cookie: ', accounts[0]);
			this.setState({ currentAccount: accounts[0] });
			Cookies.set('account_address', accounts[0], { expires: 7 });
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
			if (accountAddress === undefined || accountAddress == '') {
				console.log('No account address found in cookie, please connect to Metamask');
				return;
			}
			console.log('Found account address by cookie: ', accountAddress);
			this.setState({ currentAccount: accountAddress });

			// const contractAddress = Cookies.get('contract_address');
			// if (contractAddress === undefined || contractAddress == '') {
			// 	console.log('No contract address found in cookie, please deploy the contract');
			// 	return;
			// }
			// this.setState({ contractAddress: contractAddress });
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
					// this.state.contractAddress,
					TaskContractAddress,
					TaskAbi.abi,
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
					// this.state.contractAddress,
					TaskContractAddress,
					TaskAbi.abi,
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
					// this.state.contractAddress,
					TaskContractAddress,
					TaskAbi.abi,
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
		window.location.reload();
	}

	/**
	 * Fonction de rendu du composant
	 * @returns {JSX.Element}
	 */
	render() {
		const { input, tasks, currentAccount, correctNetwork } = this.state;
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
							<Nav >
								{/* <Nav.Link href="#features">Features</Nav.Link> */}
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
				{(currentAccount !== '') && correctNetwork ? (
					<div className="App">
						<h3><span className="connected"></span> Connecté au compte : {currentAccount}</h3>
						{/* <h4>Contrat déployé : {this.state.contractAddress}</h4> */}
						<form>
							<TextField id="outlined-basic" label="Ajouter une tâche" variant="outlined" style={{ margin: "0px 5px" }} size="small" value={input} onChange={e => this.setState({ input: e.target.value })} />
							<Button variant="contained" color="primary" onClick={this.addTask}>Add</Button>
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
					<button
						className='text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
						onClick={this.connectWallet}
					>
						Connecter un portefeuille Ethereum
					</button>
				)}
			</div>
		);
	}
}

export default App;
