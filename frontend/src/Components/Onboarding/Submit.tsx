import React from 'react';
import { ActionType, StateProps } from './State';
import stripe from './stripe';
import { Submit } from '../Submit';

export const OnboardingSubmit = ({ dispatch, state }: StateProps) => (
  <Submit
    {...{ dispatch, state }}
    addValidation={ActionType.addValidation}
    shouldValidateEmail={state.get('isSubscription')}
    executeRequest={async (setIsProcessing, setError) => {
      const response = await fetch('/sponsor/checkout_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: state.get('amount') * 100,
          email: state.get('email'),
          isSubscription: state.get('isSubscription'),
          isPublic: state.get('isPublic'),
          emailUpdates: state.get('emailUpdates'),
        }),
      });
      const { sessionId } = await response.json();
      const redirect = await stripe.redirectToCheckout({
        sessionId,
      });

      if (redirect.error) {
        setIsProcessing(false);
        setError(redirect.error);
      }
    }}
  >
    Sponsor
  </Submit>
);
