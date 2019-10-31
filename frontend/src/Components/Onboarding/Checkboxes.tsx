import React from 'react';
import { ActionType, StateProps } from './State';
import { Checkbox } from '../Checkbox';
import { PrivacyCheckbox } from '../PrivacyCheckbox';

export const Checkboxes = ({ dispatch, state }: StateProps) =>
  state.get('isSubscription') ? (
    <div className='checkbox-block'>
      <PrivacyCheckbox
        addValidation={ActionType.addValidation}
        removeValidation={ActionType.removeValidation}
        setIsAccepted={ActionType.setIsPrivacyPolicyAccepted}
        dispatch={dispatch}
        state={state}
      >
        sponsorship
      </PrivacyCheckbox>
      <Checkbox action={ActionType.setEmailUpdates} dispatch={dispatch}>
        <div>
          Send me email updates about my sponsorship, including exclusive
          articles and other sponsorship perks.
          <br />
          <small>(optional)</small>
        </div>
      </Checkbox>
      <Checkbox action={ActionType.setIsPublic} dispatch={dispatch}>
        <div>
          My sponsorship can be made public.
          <br />
          <small>(optional)</small>
        </div>
      </Checkbox>
    </div>
  ) : null;
