import { useState } from 'react';
import { validEmail } from './Email';
import { ActionType, StateProps } from './State';
import stripe from './stripe';

export const Submit = ({ dispatch, state }: StateProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <button
      className='checkout'
      disabled={state.get('validationMessages').count() > 0}
      type='submit'
      onClick={async () => {
        let isValid = true;
        const isSubscription = state.get('isSubscription');
        if (isSubscription && !validEmail(state.get('email'))) {
          dispatch({
            type: ActionType.addValidationMessage,
            payload: 'email',
          });
          isValid = false;
        }

        if (isSubscription && !state.get('isPrivacyPolicyAccepted')) {
          dispatch({
            type: ActionType.addValidationMessage,
            payload: 'privacy',
          });
          isValid = false;
        }
        if (!isValid) {
          return;
        }

        setIsProcessing(true);
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
          }),
        });
        const { sessionId } = await response.json();
        const redirect = await stripe.redirectToCheckout({
          sessionId,
        });

        if (redirect.error) {
          setIsProcessing(false);
        }
      }}
    >
      {isProcessing ? 'Processing...' : 'Sponsor'}
    </button>
  );
};
