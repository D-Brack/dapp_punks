import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

const Whitelist = ({ provider, nft, setIsLoading }) => {
  const [whitelistAddress, setWhitelistAddress] = useState('')

  const whitelistHandler = async (e) => {
    e.preventDefault()
    console.log('whitelisting... ', whitelistAddress)

    try {
      const signer = provider.getSigner()
      const transaction = await nft.connect(signer).addToWhitelist(whitelistAddress)
      const result = await transaction.wait()
    } catch {
      window.alert('Address NOT whitelisted.')
    }

    setIsLoading(true)
  }

  return(
    <Form onSubmit={whitelistHandler}>
      <Form.Group>
        <Form.Control
          type='test'
          placeholder='Enter address to whitelist'
          style={{ display: 'inline-block', width: '400px' }}
          onChange={(e) => {setWhitelistAddress(e.target.value)}}
        />
        <Button type='submit' className='mx-3' variant='primary'>Add to WL</Button>
      </Form.Group>
    </Form>
  )
}

export default Whitelist
