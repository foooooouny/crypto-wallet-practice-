import { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import { seedToMnemonic } from '@/utils/wallet'

const App = () => {
  useEffect(() => {
    const seed = '0x00000000000000000000000000000000000000000000000000'
    const mnemonic = seedToMnemonic(seed)
    console.log('- mnemonic3', mnemonic, seed)
  })
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
