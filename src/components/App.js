import React, { Component } from 'react';
import Web3 from 'web3';
import logo from '../Logo.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar';
import Main from './Main';

class App extends Component {

  async componentWillMount() {
    await this.loadweb3();
    // console.log(window.web3);
    await this.loadBlockchainData();

  }

  async loadweb3() {

    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      // Request account access if needed
      await window.ethereum.enable();
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    // console.log(accounts);
    this.setState({account: accounts[0]});
    const networkId = await web3.eth.net.getId();
    console.log(networkId);
    const networkData = Marketplace.networks[networkId];
    if (networkData) {
      // console.log(Marketplace.abi);
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address);
      // console.log(marketplace);
      this.setState({marketplace});
       var productCount = await marketplace.methods.productCount().call();
       this.setState({productCount});
      // console.log(productCount.toString());
      // Load products
      for (let i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call();
        this.setState((state) => ({
          products: [...state.products, product]
        }));
      }
      // console.log(this.state.products);
      this.setState({loading: false});
    } else {
      window.alert('Marketplace contract not deployed to detected network.');
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }
  }

  createProduct = (name, price) => {
    this.setState({loading: true})
    this.state.marketplace.methods.createProduct(name, price).send({from: this.state.account}, (error, result) => {
      this.setState({loading: false})
    })
    .on('receipt', (receipt) => {
    });
  }

  purchaseProduct = (id, price) => {
    this.setState({loading: true})
    this.state.marketplace.methods.purchaseProduct(id).send({from: this.state.account, value: price}, (error, result) => {
      this.setState({loading: false})
    })
    .on('receipt', (receipt) => {
    });
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              {this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
                products={this.state.products}
                createProduct={this.createProduct}
                purchaseProduct={this.purchaseProduct}
                />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
