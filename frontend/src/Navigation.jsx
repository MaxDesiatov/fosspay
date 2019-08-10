import React from 'react';
import {
  faTwitterSquare,
  faGithubSquare,
  faMastodon,
} from '@fortawesome/free-brands-svg-icons';
import { faRssSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { rhythm } from './typography';

const Container = (props) => (
  <div
    {...props}
    style={{
      marginTop: rhythm(0.25),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
    }}
  />
);

const Follow = (props) => (
  <div
    {...props}
    style={{
      marginTop: rhythm(0.5),
      marginLeft: rhythm(0.5),
      display: 'flex',
      justifyContent: 'space-between',
    }}
  />
);

const A = (props) => (
  // eslint-disable-next-line
  <a
    {...props}
    style={{
      marginRight: rhythm(0.5),
    }}
  />
);

const NavItem = (props) => (
  // eslint-disable-next-line
  <h1
    {...props}
    style={{
      marginLeft: rhythm(0.1),
      marginRight: rhythm(0.1),
      fontSize: rhythm(0.95),
      marginTop: rhythm(0.25),
      marginBottom: 0,
    }}
  />
);

const NavLink = ({ className, ...rest }) => (
  <A className={`${className} nav-link`} {...rest} />
);

const Icon = ({ title, href, icon }) => (
  <A className='nav-link inactive' {...{ title, href }}>
    <FontAwesomeIcon icon={icon} size='2x' />
  </A>
);

export default () => (
  <Container>
    <Container>
      <NavItem>
        <NavLink className='inactive' href='/'>
          Blog
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink className='active' href='/sponsor'>
          Support My Work
        </NavLink>
      </NavItem>
    </Container>
    <Follow>
      <Icon title='RSS' href='/rss.xml' icon={faRssSquare} />
      <Icon
        title='Twitter'
        href='https://twitter.com/maxdesiatov'
        icon={faTwitterSquare}
        size='2x'
      />
      <Icon
        title='GitHub'
        href='https://github.com/maxdesiatov'
        icon={faGithubSquare}
        size='2x'
      />
      <Icon
        className='inactive'
        title='Mastodon'
        href='https://mastodon.social/@maxd'
        icon={faMastodon}
        size='2x'
      />
    </Follow>
  </Container>
);
