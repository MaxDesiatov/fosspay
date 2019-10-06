import React from 'react';
import './App.css';

import { rhythm, scale } from './Style/typography';
import Bio from './Bio';
import Form from './Form';
import { ProjectsProps } from './Form/Projects';
import Navigation from './Navigation';
import Summary from './Summary';
import Monthly from './Success/Monthly';
import Once from './Success/Once';
import 'url-search-params-polyfill';

const query = new URLSearchParams(window.location.search);

declare var initialState: ProjectsProps;

function App() {
  let jsx: JSX.Element;

  switch (query.get('success')) {
    case 'once':
      jsx = <Once />;
      break;
    case 'monthly':
      jsx = <Monthly />;
      break;
    default:
      jsx = (
        <>
          <Summary />
          <Form
            amounts={[5, 10, 20, 50]}
            currency={{ symbol: '$' }}
            projects={initialState.projects}
          />
        </>
      );
  }

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
              ...scale(1.4),
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

      {jsx}
      <footer>
        <small>
          Powered by <a href='https://github.com/ddevault/fosspay'>fosspay</a>.
        </small>
      </footer>
    </div>
  );
}

export default App;
