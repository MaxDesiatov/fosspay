import React from 'react';
import { ActionType, StateProps } from './State';

export interface ProjectsProps {
  projects: {
    id: number;
    name: string;
  }[];
}

export const Projects = ({
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
