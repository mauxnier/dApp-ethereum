import '../css/TopNavbar.css';
import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import Cookies from 'js-cookie';

const hre = require("hardhat");

/**
 * Composant TopNavbar
 */
class TopNavbar extends React.Component {
    constructor(props) {
        super(props);

        this.handleDisconnect = this.handleDisconnect.bind(this);
        this.handleWallet = this.handleWallet.bind(this);
    }

    /**
     * Permet de se déconnecter du portefeuille Metamask en supprimant le cookie
     */
    handleDisconnect() {
        console.log("Déconnexion du portefeuille Metamask");
        Cookies.remove('account_address');
        window.location.reload();
    }

    /**
     * Permet de changer de portefeuille Metamask en supprimant le cookie et en appelant la fonction connectWallet()
     */
    handleWallet() {
        console.log("Changement de portefeuille");
        //TODO modifier
        this.props.connectWallet();
    }

    async deployContract() {
        const Contract = await hre.ethers.getContractFactory("TaskContract");
        const contract = await Contract.deploy();
        await contract.deployed();
        console.log("Contract deployed to:", contract.address);
        // Mise en cookie de l'adresse du contrat déployé
        Cookies.set('contract_address', contract.address);
    }


    /**
     * Fonction de rendu du composant
     * @returns {JSX.Element}
     */
    render() {
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
            </div>
        );
    }
}

export default TopNavbar;