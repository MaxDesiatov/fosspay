import React, { Dispatch, useState, useReducer } from 'react';
import { Record, RecordOf } from 'immutable';

import 'whatwg-fetch';

declare var Stripe: any;

const stripe = Stripe('pk_test_VGxLHSuHEFAECSXPBl1ewD9C');

type Frequency = 'once' | 'monthly';

const StateFactory = Record({
  amount: 10,
  comments: '',
  email: '',
  frequency: 'monthly',
  projectID: null,
} as State);

interface State {
  amount: number;
  comments: string;
  email: string;
  frequency: Frequency;
  projectID: number | null;
}

interface Action {
  type: ActionType;
  payload: any;
}

enum ActionType {
  setAmount = 'setAmount',
  setComments = 'setComments',
  setEmail = 'setEmail',
  setFrequency = 'setFrequency',
  setProject = 'setProject',
}

function reducer(state: RecordOf<State>, action: Action): RecordOf<State> {
  switch (action.type) {
    case ActionType.setAmount:
      return state.set('amount', action.payload);
    case ActionType.setEmail:
      return state.set('email', action.payload);
    case ActionType.setFrequency:
      return state.set('frequency', action.payload);
    case ActionType.setProject:
      return state.set('projectID', action.payload);
    case ActionType.setComments:
      return state.set('comments', action.payload);
  }
}

interface StateProps {
  state: RecordOf<State>;
  dispatch: Dispatch<Action>;
}

interface AmountProps {
  amounts: number[];
  currency: { symbol: string };
}

const Amount = ({
  amounts,
  currency,
  dispatch,
  state,
}: AmountProps & StateProps) => {
  const [isCustom, setIsCustom] = useState(false);

  return (
    <>
      <h3>How much?</h3>
      <div className='btn-group'>
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
            value={state.get('amount')}
            onChange={(e) =>
              dispatch({
                type: ActionType.setAmount,
                payload: parseInt(e.currentTarget.value),
              })
            }
            className='custom-amount'
            placeholder='Amount'
          />
        </div>
      ) : null}
    </>
  );
};

const Frequency = ({ dispatch, state }: StateProps) => {
  return (
    <>
      <h3>How often?</h3>
      <div className='btn-group' role='group'>
        <button
          onClick={() =>
            dispatch({ type: ActionType.setFrequency, payload: 'once' })
          }
          type='button'
          className={`btn btn-default ${
            state.get('frequency') === 'once' ? 'active' : ''
          }`}
        >
          Once
        </button>
        <button
          onClick={() =>
            dispatch({ type: ActionType.setFrequency, payload: 'monthly' })
          }
          type='button'
          className={`btn btn-default ${
            state.get('frequency') === 'monthly' ? 'active' : ''
          }`}
        >
          Monthly
        </button>
      </div>
      {state.get('frequency') === 'monthly' ? (
        <>
          <div className='email-explainer'>
            Your email is required for monthly sponsorship so that you can
            cancel your subscription later if you'd like to:
          </div>
          <input
            className='email'
            type='email'
            value={state.get('email')}
            onChange={(e) =>
              dispatch({
                type: ActionType.setEmail,
                payload: e.currentTarget.value,
              })
            }
            placeholder='Email'
          />
        </>
      ) : null}
    </>
  );
};

interface ProjectsProps {
  projects: {
    id: number;
    name: string;
  }[];
}

const Projects = ({
  state,
  dispatch,
  projects,
}: ProjectsProps & StateProps) => (
  <>
    <h3>What project?</h3>
    <div className='row'>
      <select
        className='form-control'
        value={(() => {
          const id = state.get('projectID');
          if (typeof id === 'number') {
            return `${id}`;
          } else {
            return 'null';
          }
        })()}
        onChange={(e) =>
          dispatch({
            type: ActionType.setProject,
            payload:
              e.currentTarget.value === 'null'
                ? null
                : parseInt(e.currentTarget.value),
          })
        }
      >
        <option value='null'>All projects</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  </>
);

export default (props: AmountProps & ProjectsProps) => {
  const [state, dispatch] = useReducer(reducer, StateFactory({}));

  const newProps = { dispatch, state, ...props };
  return (
    <div className='form'>
      <Amount {...newProps} />
      <Frequency {...newProps} />
      <Projects {...newProps} />

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
      <button
        className='checkout'
        type='submit'
        onClick={async () => {
          const response = await fetch('/support/checkout_session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: state.get('amount') * 100,
            }),
          });
          const sessionId = (await response.json()).session_id;
          stripe.redirectToCheckout({
            sessionId,
          });
        }}
      >
        Sponsor
      </button>
    </div>
  );
};
