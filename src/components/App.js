import { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Countdown from 'react-countdown'
import { ethers } from 'ethers'

import preview from '../preview.png'

// Components
import Navigation from './Navigation'
import Loading from './Loading'
import Data from './Data'
import Mint from './Mint'
import Whitelist from './Whitelist'
import Pause from './Pause'
import Wallet from './Wallet'

// ABIs: Import your contract ABIs here
import NFT_ABI from '../abis/NFT.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)

  const [nft, setNFT] = useState(null)
  const [cost, setCost] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [balance, setBalance] = useState(0)
  const [revealTime, setRevealTime] = useState(0)
  const [baseURI, setBaseURI] = useState('')
  const [isWhitelisted, setIsWhitelisted] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [nftCollection, setNFTCollection] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const { chainId } = await provider.getNetwork()

    // Initiate NFT contract
    const nft = new ethers.Contract(config[chainId].nft.address, NFT_ABI, provider)
    setNFT(nft)

    // Fetch accounts and account status
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    const isWhitelisted = await nft.whitelist(account)
    setIsWhitelisted(isWhitelisted)

    const owner = await nft.owner()
    setIsOwner(account === owner)

    // Fetch minting cost
    const cost = await nft.cost()
    setCost(cost)

    // Fetch maximum supply
    const maxSupply = await nft.maxSupply()
    setMaxSupply(maxSupply)

    // Fetch total supply
    const totalSupply = await nft.totalSupply()
    setTotalSupply(totalSupply)

    // Fetch account nft balance
    const balance = await nft.balanceOf(account)
    setBalance(balance)

    // Fetch minting start time
    const allowMintingOn = await nft.allowMintingOn()
    setRevealTime(allowMintingOn * 1000)

    // Fetch base URI
    const baseURI = await nft.baseURI()
    setBaseURI(baseURI)

    // Fetch paused status
    const isPaused = await nft.isPaused()
    setIsPaused(isPaused)

    // Fetch current account's NFT collection
    const wallet = await nft.walletOfOwner(account)
    let nftCollection = []

    for (let i = 0; i < wallet.length; i++) {
      nftCollection.push(`https://gateway.pinata.cloud/ipfs/${baseURI.slice(7)}${wallet[i]}`)
    }

    setNFTCollection(nftCollection)

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  // Listen for account changes
  window.ethereum.on('accountsChanged', () => {
    setIsLoading(true)
  })

  return(
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>Dapp Punks</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Row>
            <Col>
              {balance > 0 ? (
                <div className='text-center'>
                  <img
                    src={`${nftCollection[nftCollection.length - 1]}.png`}
                    alt='open punk'
                    style={{ width: '400px', height: '400px' }}
                  />
                </div>
              ) : (
                <img src={preview} alt='' />
              )}
            </Col>

            <Col>
              <div className='my-4 text-center'>
                <Countdown date={revealTime} className='h2' />
              </div>

              <Data maxSupply={maxSupply} totalSupply={totalSupply} cost={cost} balance={balance} />
              <Mint provider={provider} nft={nft} cost={cost} setIsLoading={setIsLoading} isWhitelisted={isWhitelisted} isPaused={isPaused} />
              <Wallet nftCollection={nftCollection} />
            </Col>
          </Row>
          {isOwner && (
            <div>
              <hr />
              <Whitelist provider={provider} nft={nft} setIsLoading={setIsLoading} />
              <Pause provider={provider} nft={nft} setIsLoading={setIsLoading} isPaused={isPaused} setIsPaused={setIsPaused} />
            </div>
          )}
        </>
      )}
    </Container>
  )
}

export default App;
