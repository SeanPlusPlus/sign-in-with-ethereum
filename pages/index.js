/* pages/index.js */
import React, { useState } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

const ConnectWallet = () => {
  const [account, setAccount] = useState('')
  const [connection, setConnection] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [ensName, setEnsName] = useState(null)

  async function getWeb3Modal() {
    let Torus = (await import('@toruslabs/torus-embed')).default
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: false,
      providerOptions: {
        torus: {
          package: Torus
        },
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: '08f3dea36a6247579876fdd46a428d76'
          },
        },
      },
    })
    return web3Modal
  }

  async function connect() {
    const web3Modal = await getWeb3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const accounts = await provider.listAccounts()
    setConnection(connection)
    setAccount(accounts[0])

  }

  async function signIn() {
    const authData = await fetch(`/api/auth?address=${account}`)
    const user = await authData.json()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const signature = await signer.signMessage(user.nonce.toString())
    const response = await fetch(`/api/verify?address=${account}&signature=${signature}`)
    const data = await response.json()

    const address = await signer.getAddress();
    const ensName = await provider.lookupAddress(address);

    setEnsName(ensName);
    setLoggedIn(data.authenticated)
  }

  return(
    <div style={container}>
      {
        !connection && <button style={button} onClick={connect}> Connect Wallet</button>
      }
      { connection && !loggedIn && (
        <div>
          <button style={button} onClick={signIn}>Sign In</button>
        </div>
      )}
      {
        loggedIn && <h1>Welcome, {ensName ? ensName : account}</h1>
      }
    </div>
  )
}

const container = {
  width: '900px',
  margin: '50px auto'
}

const button = {
  width: '100%',
  margin: '5px',
  padding: '20px',
  border: 'none',
  backgroundColor: 'black',
  color: 'white',
  fontSize: 16,
  cursor: 'pointer'
}

export default ConnectWallet