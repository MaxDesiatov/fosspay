import React from 'react';
import Body from './Body';

export default () => (
  <Body>
    Your contributions allow me to spend more time on{' '}
    <a href='https://github.com/MaxDesiatov'>open-source projects</a> and to
    produce more content for <a href='/'>my blog</a>. You can also pick a
    specific project you'd like to support in the form below.
    <br />
    <br />
    The sponsorship payment is securely processed by{' '}
    <a href='https://stripe.com'>Stripe</a>. When you proceed to the payment
    page, you can use <a href='https://www.apple.com/apple-pay/'>Apple Pay</a>{' '}
    or <a href='https://pay.google.com/about/'>Google Pay</a> if you have it
    enabled on your device and in your browser.
    <br />
    <br />
    Are you an existing sponsor with a monthly subscription? Then you can also
    access <a href='/sponsor/panel'>your sponsorship account</a> to manage your
    payments.
  </Body>
);
