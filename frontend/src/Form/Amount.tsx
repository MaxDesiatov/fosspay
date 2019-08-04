import React, { useState } from 'react';
import { ActionType, StateProps } from './State';

export interface AmountProps {
  amounts: number[];
  currency: {
    symbol: string;
  };
}

export const Amount = ({
  amounts,
  currency,
  dispatch,
  state,
}: AmountProps & StateProps) => {
  const [isCustom, setIsCustom] = useState(false);
  return (
    <>
      <h3>How much?</h3>
      <div className='btn-group' role='group'>
        {amounts.map((amount) => (
          <button
            key={amount}
            type='button'
            className={`btn btn-default${
              amount === state.get('amount') && !isCustom ? ' active' : ''
            }`}
            onClick={() => {
              dispatch({ type: ActionType.setAmount, payload: amount });
              setIsCustom(false);
              dispatch({
                type: ActionType.removeValidationMessage,
                payload: 'amount',
              });
            }}
          >
            {currency.symbol}
            {amount}
          </button>
        ))}
        <button
          type='button'
          className={`btn btn-default${isCustom ? ' active' : ''}`}
          onClick={() => setIsCustom(true)}
        >
          Custom
        </button>
      </div>
      {isCustom ? (
        <div>
          <span className='input-group-addon'>{currency.symbol}</span>
          <input
            type='number'
            value={isNaN(state.get('amount')) ? '' : state.get('amount')}
            onChange={(e) => {
              const value = parseInt(e.currentTarget.value);
              dispatch({
                type: ActionType.setAmount,
                payload: value,
              });
              if (isNaN(value)) {
                dispatch({
                  type: ActionType.addValidationMessage,
                  payload: 'amount',
                });
              } else {
                dispatch({
                  type: ActionType.removeValidationMessage,
                  payload: 'amount',
                });
              }
            }}
            className='custom-amount'
            placeholder='Amount'
          />
        </div>
      ) : null}
    </>
  );
};
