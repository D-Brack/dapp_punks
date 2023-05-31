const { expect } = require('chai');
const { ethers } = require('hardhat');
const { inputFile } = require('hardhat/internal/core/params/argumentTypes');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('NFT', () => {
  const NAME = 'Dapp Punks'
  const SYMBOL = 'DP'
  const COST = ether(10)
  const MAX_SUPPLY = 25
  const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'

  let nft, deployer, minter

  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter = accounts[1]
  })

  describe('Deployment', () => {
    const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10)

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
    })

    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })

    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })

    it('it returns the cost to mint', async () => {
      expect(await nft.cost()).to.equal(COST)
    })

    it('it returns maximum supply', async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
    })

    it('it returns the allowed minting time', async () => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
    })

    it('it returns the base URI', async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI)
    })

    it('tracks the owner', async() => {
      expect(await nft.owner()).to.equal(deployer.address)
    })

  })

  describe('Minting', () => {
    let transaction, result

    describe('Success', () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()
      })

      it('returns the minter\'s address', async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })

      it('returns minter\'s token total', async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1)
      })

      it('returns IPFS URI', async () => {
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })

      it('updates the total supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })

      it('updates the contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST)
      })

      it('emits a Mint event', async () => {
        await expect(transaction).to.emit(nft, 'Mint').withArgs(1, minter.address)
      })

    })

    describe('Failure', () => {

      it('rejects insufficient payment', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(1, {value: ether(1)})).to.be.reverted
      })

      it('rejects early minting', async () => {
        const ALLOW_MINTING_ON = new Date('June 1, 2030 00:00:00').getTime().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(1, { value: COST })).to.be.reverted
      })

      it('requires at least 1 NFT to be minted', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(0, { value: 0 })).to.be.reverted
      })

      it('does not allow more NFTs to be minted than total supply', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(26, { value: ether(260) })).to.be.reverted
      })

      it('does not return URIs for invalid tokens', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(minter).mint(1, { value: COST })

        await expect(nft.tokenURI(2)).to.be.reverted
      })

    })

  })

  describe('Displaying Result', () => {
    let transaction, result
    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

      transaction = await nft.connect(minter).mint(3, { value: ether(30) })
      result = await transaction.wait()
    })

    it('returns all the NFTs for a given owner', async () => {
      const tokenIds = await nft.walletOfOwner(minter.address)

      expect(tokenIds.length).to.equal(3)
      expect(tokenIds[0].toString()).to.equal('1')
      expect(tokenIds[1].toString()).to.equal('2')
      expect(tokenIds[2].toString()).to.equal('3')
    })
  })

  describe('Withdraw Ether', () => {

    describe('Success', () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

      let transaction, result, balanceBefore

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

        balanceBefore = await ethers.provider.getBalance(deployer.address)

        transaction = await nft.connect(deployer).withdraw()
        result = await transaction.wait()
      })

      it('deducts the contract balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(0)
      })

      it('sends funds to the owner', async () => {
        expect(await ethers.provider.getBalance(deployer.address)).to.be.greaterThan(balanceBefore)
      })

      it('emits a Withdraw event', async () => {
        expect(transaction).to.emit(nft, 'Withdraw').withArgs(COST, deployer.address)
      })

    })

    describe('Failure', () => {

      it('prevents non-owner from withdrawing', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

        await expect(nft.connect(minter).withdraw()).to.be.reverted
      })

    })

  })

  describe('Sets new cost', () => {

    describe('Success', () => {

      it('sets a new cost', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        let transaction, result

        transaction = await nft.connect(deployer).setCost(ether(5))
        result = await transaction.wait()

        expect(await nft.cost()).to.equal(ether(5))
      })

    })

    describe('Failure', () => {

      it('prevents non-owner from setting new cost', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).setCost(ether(100))).to.be.reverted
      })

    })

  })

})
