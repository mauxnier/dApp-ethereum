import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';

const greeterAddress = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'; // l'adresse du contrat déployé

function App() {
  const [greeting, setGreetingValue] = useState();

  useEffect(() => {
    fetchGreeting();
  }, []);

  // Fonction qui permet de se connecter à MetaMask
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // Fonction qui permet de récupérer le message du contrat
  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider);
      try {
        const data = await contract.greet();
        console.log('data: ', data);
        setGreetingValue(data);
      } catch (err) {
        console.log('Error: ', err);
      }
    }
  }

  // Fonction qui permet de mettre à jour le message du contrat
  async function setGreeting() {
    if (!greeting) return;
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
      const transaction = await contract.setGreeting(greeting);
      setGreetingValue('');
      await transaction.wait();
      fetchGreeting();
    }
  }

  return (
    <div className="App">
      <p>{greeting}</p>
      <input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" />
      <button onClick={setGreeting}>Set Greeting</button>
    </div>
  );
}

export default App;
