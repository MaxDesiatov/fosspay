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
          email: state.get('isSubscription') ? state.get('email') : undefined,
          isSubscription: state.get('isSubscription'),
          isPublic: state.get('isSubscription') ? state.get('isPublic') : false,
          emailUpdates: state.get('isSubscription')
            ? state.get('emailUpdates')
            : false,
          projectID: state.get('projectID'),
          comments: state.get('comments'),
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
