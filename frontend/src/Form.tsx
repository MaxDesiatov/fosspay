import React, { Dispatch, useState, useReducer } from 'react';
import { Record, RecordOf, Set } from 'immutable';

import 'whatwg-fetch';

declare var Stripe: any;

const stripe = Stripe('pk_test_VGxLHSuHEFAECSXPBl1ewD9C');

type ValidationMessage = 'amount' | 'email' | 'privacy';

const StateFactory = Record({
  amount: 10,
  comments: '',
  email: '',
  isPrivacyPolicyAccepted: false,
  isPublic: false,
  isSubscription: true,
  projectID: null,
  validationMessages: Set(),
} as State);

interface State {
  amount: number;
  comments: string;
  email: string;
  isPrivacyPolicyAccepted: false;
  isPublic: boolean;
  isSubscription: boolean;
  projectID: number | null;
  validationMessages: Set<ValidationMessage>;
}

interface Action {
  type: ActionType;
  payload: any;
}

enum ActionType {
  setAmount = 'setAmount',
  setComments = 'setComments',
  setEmail = 'setEmail',
  setIsSubscription = 'setIsSubscription',
  setIsPrivacyPolicyAccepted = 'setIsPrivacyPolicyAccepted',
  setIsPublic = 'setIsPublic',
  setProject = 'setProject',
  addValidationMessage = 'pushValidationMessage',
  removeValidationMessage = 'removeValidationMessage',
}

function reducer(state: RecordOf<State>, action: Action): RecordOf<State> {
  switch (action.type) {
    case ActionType.setAmount:
      return state.set('amount', action.payload);
    case ActionType.setEmail:
      return state.set('email', action.payload);
    case ActionType.setIsSubscription:
      return state.set('isSubscription', action.payload);
    case ActionType.setIsPublic:
      return state.set('isPublic', action.payload);
    case ActionType.setProject:
      return state.set('projectID', action.payload);
    case ActionType.setComments:
      return state.set('comments', action.payload);
    case ActionType.setIsPrivacyPolicyAccepted:
      return state.set('isPrivacyPolicyAccepted', action.payload);
    case ActionType.addValidationMessage: {
      const messages = state.get('validationMessages');
      return state.set('validationMessages', messages.add(action.payload));
    }
    case ActionType.removeValidationMessage: {
      const messages = state.get('validationMessages');
      return state.set('validationMessages', messages.remove(action.payload));
    }
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

const Frequency = ({ dispatch, state }: StateProps) => {
  return (
    <>
      <h3>How often?</h3>
      <div className='btn-group' role='group'>
        <button
          onClick={() => {
            dispatch({ type: ActionType.setIsSubscription, payload: false });
            dispatch({
              type: ActionType.removeValidationMessage,
              payload: 'email',
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
          <input
            className={`email${
              state.get('validationMessages').contains('email')
                ? ' invalid'
                : ''
            }`}
            type='email'
            required
            value={state.get('email')}
            onChange={(e) => {
              dispatch({
                type: ActionType.setEmail,
                payload: e.currentTarget.value,
              });

              if (e.currentTarget.value) {
                dispatch({
                  type: ActionType.removeValidationMessage,
                  payload: 'email',
                });
              }
            }}
            onBlur={(e) => {
              dispatch({
                type: e.currentTarget.value
                  ? ActionType.removeValidationMessage
                  : ActionType.addValidationMessage,
                payload: 'email',
              });
            }}
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

const Comments = ({ dispatch, state }: StateProps) => (
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

const Checkboxes = ({ dispatch, state }: StateProps) =>
  state.get('isSubscription') ? (
    <div className='checkbox-block'>
      <label
        className={`checkbox-label${
          state.get('validationMessages').contains('privacy') ? ' invalid' : ''
        }`}
      >
        <input
          type='checkbox'
          onChange={(e) => {
            dispatch({
              type: e.currentTarget.checked
                ? ActionType.removeValidationMessage
                : ActionType.addValidationMessage,
              payload: 'privacy',
            });
            dispatch({
              type: ActionType.setIsPrivacyPolicyAccepted,
              payload: e.currentTarget.checked,
            });
          }}
        />
        <div>
          I confirm that my email can be recorded and cookies can be used so
          that I can manage my subscription.{' '}
          <a href='/privacy'>Privacy Policy</a> explains this in details. <br />
          <small>(required for monthly sponsorship)</small>
        </div>
      </label>
      <label className='checkbox-label'>
        <input type='checkbox' />
        <div>
          My sponsorship can be made public.
          <br />
          <small>(optional)</small>
        </div>
      </label>
    </div>
  ) : null;

const Submit = ({ dispatch, state }: StateProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <button
      className='checkout'
      disabled={state.get('validationMessages').count() > 0}
      type='submit'
      onClick={async () => {
        let isValid = true;
        if (!state.get('email')) {
          dispatch({
            type: ActionType.addValidationMessage,
            payload: 'email',
          });
          isValid = false;
        }

        if (!state.get('isPrivacyPolicyAccepted')) {
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
        const response = await fetch('/support/checkout_session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: state.get('amount') * 100,
            isSubscription: state.get('isSubscription'),
            isPublic: state.get('isPublic'),
          }),
        });
        const sessionId = (await response.json()).session_id;
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

export default (props: AmountProps & ProjectsProps) => {
  const [state, dispatch] = useReducer(reducer, StateFactory({}));

  const newProps = { dispatch, state, ...props };
  return (
    <div className='form'>
      <Amount {...newProps} />
      <Frequency {...newProps} />
      <Projects {...newProps} />
      <Comments {...newProps} />
      <Checkboxes {...newProps} />
      <Submit {...newProps} />
    </div>
  );
};
