import React from 'react';
import './App.css';

import { rhythm, scale } from './typography';
import Bio from './Bio';
import { ProjectsProps, default as Form } from './Form';
import Navigation from './Navigation';
import Summary from './Summary';

declare var initialState: ProjectsProps;

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
        <div>
          <h1
            style={{
              ...scale(1.45),
              marginBottom: rhythm(1.5),
              marginTop: 0,
              textAlign: 'center',
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
        </div>

        <Bio />
        <Navigation />
      </header>

      <Summary />
      <Form
        amounts={[5, 10, 20, 50]}
        currency={{ symbol: '$' }}
        projects={initialState.projects}
      />
      <footer>
        <small>
          Powered by <a href='https://github.com/SirCmpwn/fosspay'>fosspay</a>.
        </small>
      </footer>
    </div>
  );
}

export default App;
