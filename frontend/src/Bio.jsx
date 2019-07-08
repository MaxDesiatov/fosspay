import React from 'react';

// Import typefaces
import 'typeface-montserrat';
import 'typeface-merriweather';

import profilePic from './profile-pic.jpg';
import { rhythm } from './typography';

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
          mobile and backend apps. My interests include coding in Swift and
          TypeScript, product design, video games and music.
        </Text>
      </Container>
    );
  }
}

export default Bio;
