import React, { Dispatch, useState, useRef, useEffect } from 'react';
import { RecordOf } from 'immutable';
import { EmailState } from '../Helpers/EmailState';
import { IAction } from '../Helpers/IAction';
import { validEmail } from '../Helpers/validation';

type ProcessingHandler = (isProcessing: boolean) => void;
type ErrorHandler = (error: any) => void;

interface SubmitProps<V, S extends EmailState<V>, T> {
  executeRequest: (
    setProcessing: ProcessingHandler,
    setError: ErrorHandler,
  ) => Promise<void>;
  addValidation: T;
  children: string;
  dispatch: Dispatch<IAction<T>>;
  state: RecordOf<S>;
  shouldValidate: boolean;
}

export function Submit<V, S extends EmailState<V>, A>({
  addValidation,
  children,
  dispatch,
  executeRequest,
  state,
  shouldValidate,
}: SubmitProps<V, S, A>) {
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
          if (shouldValidate && !validEmail(state.get('email'))) {
            dispatch({
              type: addValidation,
              payload: 'email',
            });
            isValid = false;
          }

          if (shouldValidate && !state.get('isPrivacyPolicyAccepted')) {
            dispatch({
              type: addValidation,
              payload: 'privacy',
            });
            isValid = false;
          }
          if (!isValid) {
            return;
          }

          setIsProcessing(true);
          try {
            await executeRequest(setIsProcessing, setError);
          } catch (error) {
            setIsProcessing(false);
            setError(
              <h3 className='payment-error'>
                An error occurred while processing your request. Please try
                again later or{' '}
                <a href='mailto:sponsor@desiatov.com'>report this problem</a>.
              </h3>,
            );
            console.error(error.toString());
          }
        }}
      >
        {isProcessing ? 'Processing...' : children}
      </button>
    </>
  );
}
