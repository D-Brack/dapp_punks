import { ethers } from 'ethers'
import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

const Mint = ({ provider, nft, cost, setIsLoading, isWhitelisted, isPaused }) => {
  const [isWaiting, setIsWaiting] = useState(false)
  const [mintAmount, setMintAmount] = useState(0)

  const mintHandler = async (e) => {
    e.preventDefault()
    setIsWaiting(true)

    let mintCost = cost * mintAmount
    mintCost = ethers.utils.formatUnits(mintCost.toString(), 'ether')
    mintCost = ethers.utils.parseUnits(mintCost, 'ether')

    try {
      const signer = await provider.getSigner()
      const transaction = await nft.connect(signer).mint(parseInt(mintAmount), { value: mintCost })
      const result = await transaction.wait()
    } catch {
      window.alert('Mint canceled or reverted')
    }

    setIsLoading(true)
  }

  return(
    <Form onSubmit={mintHandler} style={{ maxWidth: '450px', margin: '50px auto' }}>
      {isWaiting ? (
        <Spinner animation='border' style={{ display: 'block', margin: '0px auto' }} />
      ) : (
        <Form.Group>
          <Form.Control type='number' placeholder='Enter Mint Amount' className='my-3' max={5} min={1} onChange={ (e) => { setMintAmount(e.target.value) }}/>
          {isPaused ? (
            <p className='text-center'>Minting is Paused</p>
          ) : (
            isWhitelisted ? (
              <Button type='submit' variant='primary' style={{ width: '100%' }} >Mint</Button>
            ) : (
              <Button disabled variant='secondary' style={{ width: '100%' }} >Not Whitelisted</Button>
            )
          )}
        </Form.Group>
      )}
    </Form>
  )
}

export default Mint
