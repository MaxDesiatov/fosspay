import React from 'react';
import { Email } from '../Email';
import { ActionType, StateProps } from './State';

export const Frequency = ({ dispatch, state }: StateProps) => {
  return (
    <>
      <h3>How often?</h3>
      <div className='btn-group' role='group'>
        <button
          onClick={() => {
            dispatch({ type: ActionType.setIsSubscription, payload: false });
            dispatch({
              type: ActionType.resetValidation,
              payload: null,
            });
          }}
          type='button'
          className={`btn btn-default ${
            state.get('isSubscription') ? '' : 'active'
          }`}
        >
          Once
        </button>
        <button
          onClick={() =>
            dispatch({ type: ActionType.setIsSubscription, payload: true })
          }
          type='button'
          className={`btn btn-default ${
            state.get('isSubscription') ? 'active' : ''
          }`}
        >
          Monthly
        </button>
      </div>
      {state.get('isSubscription') ? (
        <>
          <div className='email-explainer'>
            Your email is required for monthly sponsorship so that you can
            cancel your subscription later if you'd like to:
          </div>
          <Email
            {...{ dispatch, state }}
            setEmail={ActionType.setEmail}
            addValidation={ActionType.addValidation}
            removeValidation={ActionType.removeValidation}
          />{' '}
        </>
      ) : null}
    </>
  );
};
