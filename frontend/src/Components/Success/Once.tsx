import React from 'react';
import Body from '../Body';
import { Checkbox } from '../Checkbox';

export default () => (
  <Body>
    <span>Thank you for your sponsorship!</span>
    <p>
      Would you like to get email updates about the sponsorship, including
      exclusive articles and other sponsorship perks?
    </p>
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
