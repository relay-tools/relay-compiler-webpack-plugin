import {commitMutation, graphql} from 'react-relay';

const mutation = graphql`
  mutation updateFirstNameMutation($id: ID!, $firstName: String!) {
    updateFirstName(id: $id, firstName: $firstName) {
      person {
        firstName
        fullName
      }
    }
  }
`;

export default (environment, variables) => {
  return new Promise((resolve, reject) => {
    commitMutation(
      environment,
      {
        mutation,
        variables,
        onError: reject,
        onCompleted: resolve
      }
    );
  });
};
