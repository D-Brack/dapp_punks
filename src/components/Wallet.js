
const Wallet = ({ nftCollection }) => {
  return(
    <div className="text-center">
      {nftCollection.length > 0 && <h3>Your Collection</h3>}
      {nftCollection.map((url, index) => (
        <img key={index} src={`${url}.png`} alt='' style={{ width: '100px', height: '100px', border: '1px solid black', margin: '1px' }} />
      ))}
    </div>
  )
}

export default Wallet
