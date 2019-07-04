import React from 'react';
import './App.css';

import { rhythm, scale } from './typography';
import Bio from './Bio';
import Form from './Form';
import Navigation from './Navigation';
import Summary from './Summary';

function App() {
  return (
    <div
      style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: rhythm(24),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      }}
    >
      <header className='App-header'>
        <center>
          <h1
            style={{
              ...scale(1.45),
              marginBottom: rhythm(1.5),
              marginTop: 0,
            }}
          >
            <a
              style={{
                boxShadow: 'none',
                textDecoration: 'none',
                color: 'inherit',
              }}
              href={'/'}
            >
              Max Desiatov
            </a>
          </h1>
        </center>

        <Bio />
        <Navigation />
        <Summary />
        <Form
          amounts={[5, 10, 20, 50]}
          currency={{ symbol: '$' }}
          projects={[{ name: 'desiatov.com blog' }]}
        />
      </header>
    </div>
  );
}

export default App;
