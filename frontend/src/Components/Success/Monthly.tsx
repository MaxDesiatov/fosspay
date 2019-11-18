import React from 'react';
import Body from '../Body';

const query = new URLSearchParams(window.location.search);

export default () => (
  <Body>
    <span style={{ textAlign: 'center' }}>
      <h3>Thank you for your sponsorship!</h3>
    </span>
    <p>
      An email has been sent to you with a link that allows you to manage your
      sponsorship subscription. You can also create your account and access
      sponsorship management{' '}
      <a
        href={`/sponsor/create-account${
          query ? '?email=' + query.get('email') : ''
        }`}
      >
        here directly
      </a>
      .
    </p>
    <p>
      If you have any questions, please send an email to{' '}
      <a href='mailto:sponsor@desiatov.com'>sponsor@desiatov.com</a>.
    </p>
  </Body>
);
