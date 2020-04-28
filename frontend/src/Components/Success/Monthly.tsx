import React from 'react';
import Body from '../Body';

export default () => {
  const query = new URLSearchParams(window.location.search);
  const isExistingAccount = query?.get('is_existing_account') === 'true';
  return (
    <Body>
      <span style={{ textAlign: 'center' }}>
        <h3>Thank you for your sponsorship!</h3>
      </span>
      {isExistingAccount ? <ExistingAccount /> : <NewAccount query={query} />}
      <p>
        If you have any questions, please send an email to{' '}
        <a href='mailto:sponsor@desiatov.com'>sponsor@desiatov.com</a>.
      </p>
    </Body>
  );
};

function NewAccount({ query }: { query: URLSearchParams }) {
  const createAccountQuery = query ? '?email=' + query.get('email') : '';
  return (
    <p>
      An email has been sent to you with a link that allows you to manage your
      sponsorship subscription. You can also create your account and access
      sponsorship management{' '}
      <a href={`/sponsor/create-account${createAccountQuery}`}>here directly</a>
      .
    </p>
  );
}

function ExistingAccount() {
  return (
    <p>
      According to our records, you already have a sponsorship account. Please
      navigate to <a href='/sponsor/panel'>the sponsorship management page</a>{' '}
      if you need to review your payments.
    </p>
  );
}
