import React, { useState, useEffect, useRef } from 'react';
import { validEmail } from './Email';
import { ActionType, StateProps } from './State';
import stripe from './stripe';

export const Submit = ({ dispatch, state }: StateProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<React.ReactElement | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isProcessing && !timeout.current) {
      timeout.current = setTimeout(() => {
        setIsProcessing(false);
        setError(
          <h3 className='payment-error'>
            The server did not respond in a reasonable amount of time, or
            internet connectivity is not available. Please try again later.
          </h3>,
        );
      }, 5 * 1000);
    } else if (!isProcessing && timeout.current) {
      clearTimeout(timeout.current);
    }
  });

  return (
    <>
      {!isProcessing && error ? <div>{error}</div> : null}
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
          try {
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
          } catch (error) {
            setIsProcessing(false);
            setError(
              <h3 className='payment-error'>
                An error occurred while processing your payment. Please try
                again later or{' '}
                <a href='mailto:sponsor@desiatov.com'>report this problem</a>.
              </h3>,
            );
            console.error(error.toString());
          }
        }}
      >
        {isProcessing ? 'Processing...' : 'Sponsor'}
      </button>
    </>
  );
};
