import Navbar from 'react-bootstrap/Navbar';

import logo from '../logo.png';

const Navigation = ({ account }) => {
  return (
    <Navbar className='my-3'>
      <img
        alt="logo"
        src={logo}
        width="40"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <Navbar.Brand href="#">Dapp Punks NFTs</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          {account && `${account.slice(0,6)}...${account.slice(-4)}`}
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
