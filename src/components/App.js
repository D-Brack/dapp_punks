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
                    src={`https://gateway.pinata.cloud/ipfs/${baseURI.slice(7)}${balance.toString()}.png`}
                    alt='open punk'
                    style={{ width: '400px', height: '400px'}}
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
              <Mint provider={provider} nft={nft} cost={cost} setIsLoading={setIsLoading} isWhitelisted={isWhitelisted} />
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default App;
