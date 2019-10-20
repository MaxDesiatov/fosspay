import React from 'react';
import { Email } from './Email';
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
              type: ActionType.resetValidationMessages,
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
      {state.get('isSubscription') ? <Email {...{ dispatch, state }} /> : null}
    </>
  );
};
