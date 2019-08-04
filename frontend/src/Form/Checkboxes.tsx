import React from 'react';
import { ActionType, StateProps } from './State';

export const Checkboxes = ({ dispatch, state }: StateProps) =>
  state.get('isSubscription') ? (
    <div className='checkbox-block'>
      <label
        className={`checkbox-label${
          state.get('validationMessages').contains('privacy') ? ' invalid' : ''
        }`}
      >
        <div>
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
        </div>
        <div>
          I accept that my data will be processed according to the{' '}
          <a href='/privacy'>Privacy Policy</a>: my email can be recorded and
          cookies can be used so that I can manage my subscription. The
          subscription can be cancelled at any time.
          <br />
          <small>(required for monthly sponsorship)</small>
        </div>
      </label>
      <label className='checkbox-label'>
        <div>
          <input
            type='checkbox'
            onChange={(e) =>
              dispatch({
                type: ActionType.setEmailUpdates,
                payload: e.currentTarget.checked,
              })
            }
          />
        </div>
        <div>
          Send me email updates about my subscription, including exclusive
          articles and other sponsorship perks.
          <br />
          <small>(optional)</small>
        </div>
      </label>
      <label className='checkbox-label'>
        <div>
          <input
            type='checkbox'
            onChange={(e) =>
              dispatch({
                type: ActionType.setIsPublic,
                payload: e.currentTarget.checked,
              })
            }
          />
        </div>
        <div>
          My sponsorship can be made public.
          <br />
          <small>(optional)</small>
        </div>
      </label>
    </div>
  ) : null;
