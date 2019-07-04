import React, { Dispatch, useState, useReducer } from 'react';
import { Record, RecordOf } from 'immutable';

type Frequency = 'once' | 'monthly';

const StateFactory = Record({
  amount: 10,
  email: undefined,
  frequency: 'monthly',
  project: null,
} as State);

interface State {
  amount: number;
  email?: string;
  frequency: Frequency;
  project: Project;
}

interface Action {
  type: ActionType;
  payload: any;
}

enum ActionType {
  setAmount = 'setAmount',
  setEmail = 'setEmail',
  setFrequency = 'setFrequency',
  setProject = 'setProject',
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
            onInput={(e) =>
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
            onInput={(e) =>
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

type Project = number | null;

interface ProjectsProps {
  projects: {
    id: number;
    name: string;
  }[];
  selectedProject: Project;
}

const Projects = ({ projects, selectedProject = null }: ProjectsProps) => (
  <>
    <h3>What project?</h3>
    <div className='row'>
      <select className='form-control'>
        {selectedProject === null ? (
          <option value='null' selected>
            All projects
          </option>
        ) : (
          <option value='null'>All projects</option>
        )}
        {projects.map((project) =>
          selectedProject === project.id ? (
            <option value={project.id} selected>
              {project.name}
            </option>
          ) : (
            <option value={project.id}>{project.name}</option>
          ),
        )}
      </select>
    </div>
  </>
);

function reducer(state: RecordOf<State>, action: Action): RecordOf<State> {
  switch (action.type) {
    case ActionType.setAmount:
      return state.set('amount', action.payload);
    case ActionType.setEmail:
      return state.set('email', action.payload);
    case ActionType.setFrequency:
      return state.set('frequency', action.payload);
    case ActionType.setProject:
      return state.set('project', action.payload);
  }
}

export default (props: AmountProps & ProjectsProps) => {
  const [state, dispatch] = useReducer(reducer, StateFactory({}));

  const newProps = { dispatch, state, ...props };
  return (
    <div className='form'>
      <Amount {...newProps} />
      <Frequency {...newProps} />
      <Projects {...newProps} />

      <div className='row'>
        <input
          type='text'
          className='comments'
          placeholder='Any comments?'
          maxLength={512}
        />
      </div>
      <button className='checkout' type='submit'>
        Sponsor
      </button>
    </div>
  );
};
