import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

const Pause = ({ provider, nft, setIsLoading, isPaused, setIsPaused }) => {

  const [isWaiting, setIsWaiting] = useState(false)

  const pauseHandler = async () => {
    setIsWaiting(true)

    try {
      const signer = await provider.getSigner()
      const transaction = await nft.connect(signer).pauseMint(!isPaused)
      const result = await transaction.wait()
    } catch {
      window.alert('Paused status NOT changed')
    }

    setIsLoading(true)
  }

  return(
    <div className='my-2'>
      {isWaiting ? (
        <Spinner animation='border' variant='primary' />
      ) : (
        <Button onClick={pauseHandler}>{isPaused ? 'Unpause Mint' : 'Pause Mint'}</Button>
      )}
    </div>
  )
}

export default Pause
