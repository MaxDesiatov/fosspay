import React, { useState } from 'react';

const Amount = ({ defaultAmount, amounts, currency }) => {
  const [currentAmount, setAmount] = useState(defaultAmount);
  const [isCustom, setIsCustom] = useState(false);

  return (
    <>
      <h3>How much?</h3>
      <div class='btn-group'>
        {amounts.map((amount) => (
          <button
            type='button'
            class={`btn btn-default${
              amount === currentAmount && !isCustom ? ' active' : ''
            }`}
            onClick={() => {
              setAmount(amount);
              setIsCustom(false);
            }}
          >
            {currency.symbol}
            {amount}
          </button>
        ))}
        <button
          type='button'
          class={`btn btn-default${isCustom ? ' active' : ''}`}
          onClick={() => setIsCustom(true)}
        >
          Custom
        </button>
      </div>
      <div class={`row${isCustom ? '' : ' hidden'}`}>
        <span class='input-group-addon'>{currency.symbol}</span>
        <input
          type='number'
          value={currentAmount}
          onInput={(e) => setAmount(parseInt(e.target.value))}
          class='custom-amount'
          placeholder='Amount'
        />
      </div>
    </>
  );
};

const Frequency = ({ defaultFrequency }) => {
  const [frequency, setFrequency] = useState(defaultFrequency);

  return (
    <>
      <h3>How often?</h3>
      <div className='btn-group' role='group'>
        <button
          onClick={() => setFrequency('once')}
          type='button'
          class={`btn btn-default ${frequency === 'once' ? 'active' : ''}`}
        >
          Once
        </button>
        <button
          onClick={() => setFrequency('monthly')}
          type='button'
          className={`btn btn-default ${
            frequency === 'monthly' ? 'active' : ''
          }`}
        >
          Monthly
        </button>
      </div>
    </>
  );
};

const Projects = ({ projects, selectedProject }) => (
  <>
    <h3>What project?</h3>
    <div class='row'>
      <select id='project' name='project' class='form-control'>
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

    <div class='row'>
      <input
        type='text'
        id='comments'
        class='form-control'
        placeholder='Any comments?'
        maxlength='512'
      />
    </div>
  </>
);

export default (props) => (
  <center class='form'>
    <Amount {...props} />
    <Frequency {...props} />
    <Projects {...props} />

    <button class='checkout' type='submit'>
      Sponsor
    </button>
  </center>
);
