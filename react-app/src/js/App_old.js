import React, { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import Task from './Task';
import '../css/App.css';

import { TaskContractAddress } from './config.js';
import { ethers } from 'ethers';
import TaskAbi from '../artifacts/contracts/TaskContract.sol/TaskContract.json'
import Cookies from 'js-cookie';

/**
 * Fonction principale de l'application
 * @returns le composant App
 */
function App() {
    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState('');
    const [currentAccount, setCurrentAccount] = useState('');
    const [correctNetwork, setCorrectNetwork] = useState(false);

    /**
     * Récupération des tâches
     */
    const getAllTasks = async () => {
        try {
            const { ethereum } = window

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const TaskContract = new ethers.Contract(
                    TaskContractAddress,
                    TaskAbi.abi,
                    signer
                )

                let allTasks = await TaskContract.getMyTasks();
                setTasks(allTasks);
            } else {
                console.log("Ethereum object doesn't exist");
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Récupération des tâches au chargement de la page
    useEffect(() => {
        connectWalletByCookie();
        getAllTasks();
    }, []);

    /**
     * Appel de Metamask pour se connecter au portefeuille en cliquant sur le bouton Connect Wallet
     */
    const connectWallet = async () => {
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
                setCorrectNetwork(true);
            }

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

            console.log('Added account address to cookie: ', accounts[0]);
            setCurrentAccount(accounts[0]);
            Cookies.set('account_address', accounts[0], { expires: 7 });
        } catch (error) {
            console.log('Error connecting to metamask: ', error)
        }
    }

    /**
     * Connexion au portefeuille en utilisant le cookie
     */
    const connectWalletByCookie = async () => {
        try {
            const { ethereum } = window

            if (!ethereum) {
                console.log('Metamask not detected')
                return
            }

            let chainId = await ethereum.request({ method: 'eth_chainId' })
            console.log('Connected to chain:' + chainId)

            const localhostChainId = '0x539'

            if (chainId !== localhostChainId) {
                alert('You are not connected to the Localhost:8545 Testnet!')
                return
            } else {
                setCorrectNetwork(true);
            }

            const accountAddress = Cookies.get('account_address');
            if (accountAddress === undefined && accountAddress !== '') {
                console.log('No account address found in cookie, please connect to Metamask');
                return;
            }
            console.log('Found account address by cookie: ', accountAddress);
            setCurrentAccount(accountAddress);
        } catch (error) {
            console.log('Error connecting to metamask: ', error)
        }
    }

    /**
     * Ajout d'une tâche
     * @param {*} e événement
     */
    const addTask = async (e) => {
        e.preventDefault();

        let task = {
            'taskText': input,
            'isDeleted': false
        };

        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const TaskContract = new ethers.Contract(
                    TaskContractAddress,
                    TaskAbi.abi,
                    signer
                );

                TaskContract.addTask(task.taskText, task.isDeleted)
                    .then(response => {
                        setTasks([...tasks, task]);
                        console.log("Completed Task");
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

        setInput('')
    };

    /**
     * Suppression d'une tâche
     * @param {*} key clé de la tâche à supprimer
     */
    const deleteTask = key => async () => {
        console.log(key);

        // Suppression de la tâche avec la clé de cette dernière
        try {
            const { ethereum } = window

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const TaskContract = new ethers.Contract(
                    TaskContractAddress,
                    TaskAbi.abi,
                    signer
                );

                await TaskContract.deleteTask(key, true);
                let allTasks = await TaskContract.getMyTasks();
                setTasks(allTasks);
            } else {
                console.log("Ethereum object doesn't exist");
            }

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            {(currentAccount !== '') && correctNetwork ? (
                <div className="App">
                    <h3><span className="connected"></span> Connecté au compte : {currentAccount}</h3>
                    <form>
                        <TextField id="outlined-basic" label="Ajouter une tâche" variant="outlined" style={{ margin: "0px 5px" }} size="small" value={input} onChange={e => setInput(e.target.value)} />
                        <Button variant="contained" color="primary" onClick={addTask}>Add</Button>
                    </form>
                    <ul>
                        {tasks.map(item =>
                            <Task
                                key={item.id}
                                taskText={item.taskText}
                                onClick={deleteTask(item.id)}
                            />)
                        }
                    </ul>
                </div>
            ) : (
                <button
                    className='text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
                    onClick={connectWallet}
                >
                    Connect ETH Wallet
                </button>
            )}
        </div>
    );
}

export default App;