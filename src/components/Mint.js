import { ethers } from 'ethers'
import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

const Mint = ({ provider, nft, cost, setIsLoading, isWhitelisted }) => {
  const [isWaiting, setIsWaiting] = useState(false)

  const mintHandler = async (e) => {
    e.preventDefault()
    setIsWaiting(true)

    try {
      const signer = await provider.getSigner()
      const transaction = await nft.connect(signer).mint(1, { value: cost })
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
          {isWhitelisted ? (
            <Button type='submit' variant='primary' style={{ width: '100%' }} >Mint</Button>
          ) : (
            <Button disabled variant='secondary' style={{ width: '100%' }} >Not Whitelisted</Button>
          )}
        </Form.Group>
      )}
    </Form>
  )
}

export default Mint
