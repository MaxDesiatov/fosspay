import React from 'react';
import profilePic from '../profile-pic.jpg';
import { rhythm } from '../Helpers/typography';

const Container = (props) => (
  <div {...props} style={{ marginBottom: rhythm(1.5) }} />
);

const profilePicSize = rhythm(3);

const ProfilePic = () => (
  <img
    src={profilePic}
    alt='Max Desiatov'
    style={{
      float: 'left',
      marginRight: rhythm(0.5),
      marginBottom: rhythm(0.25),
      borderRadius: profilePicSize,
      height: profilePicSize,
      width: profilePicSize,
    }}
  />
);

const Text = (props) => <p {...props} />;

class Bio extends React.Component {
  render() {
    return (
      <Container>
        <ProfilePic />
        <Text>
          I'm <strong>Max Desiatov</strong>, a software consultant building
          mobile and backend apps. I code in Swift and TypeScript, curate{' '}
          <strong>
            <a href='https://twitter.com/ServerSideSwift'>@ServerSideSwift</a>
          </strong>{' '}
          feed and co-maintain{' '}
          <strong>
            {' '}
            <a href='https://swiftwasm.org'>SwiftWasm</a>{' '}
          </strong>
          .
        </Text>
      </Container>
    );
  }
}

export default Bio;
