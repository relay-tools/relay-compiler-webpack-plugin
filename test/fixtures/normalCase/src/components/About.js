import React from 'react';
import {QueryRenderer} from 'react-relay';
import updateFirstNameMutation from '../mutations/updateFirstNameMutation';

export default ({id, relayEnvironment}) => {
  const onSubmit = (e) => {
    e.preventDefault();

    updateFirstNameMutation(relayEnvironment, {id, firstName: e.target.firstName.value});
  };

  return <QueryRenderer
    environment={relayEnvironment}
    query={graphql`
      query AboutQuery($id: ID!) {
        personById(id: $id) {
          id
          firstName
          fullName
        }
      }
    `}
    variables={{id}}
    render={({props, error}) => {
      if (!props) {
        return <div>Loading</div>;
      }

      const {personById} = props;
      if (!personById) {
        return <div>No match</div>;
      }
      return <div>
        <h2>About</h2>
        <div>
          Id: {personById.id}<br />
          Name: {personById.fullName}
        </div>
        <div>
          <form onSubmit={onSubmit}>
            Change first name:
            <input type="text" name="firstName" defaultValue={personById.firstName} required />
            <input type="submit" value="Change" />
          </form>
        </div>
      </div>
    }}
  />;
}
