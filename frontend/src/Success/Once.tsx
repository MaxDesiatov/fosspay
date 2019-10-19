import React from 'react';
import Body from '../Style/Body';

export default () => (
  <Body>
    <span>Thank you for your sponsorship!</span>
    <p>Would you like to get an email when I publish something new?</p>
    <div>
      <input
        type='email'
        name='email'
        autoComplete='email'
        required
        placeholder='Email'
      />
    </div>
  </Body>
);
