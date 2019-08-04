import React from 'react';
import { ActionType, StateProps } from './State';

export const Comments = ({ dispatch, state }: StateProps) => (
  <input
    value={state.get('comments')}
    type='text'
    className='comments'
    placeholder='Any comments?'
    maxLength={512}
    onChange={(e) =>
      dispatch({
        type: ActionType.setComments,
        payload: e.currentTarget.value,
      })
    }
  />
);
