import {commitMutation, graphql} from 'react-relay';
import {environment} from "../graphql";

const mutation = graphql`
  mutation UpdateNameMutation($id: ID!, $name: String!) {
    updateName(id: $id, name: $name) {
      person {
        fullName
      }
    }
  }
`;

export default (input) => {
  return new Promise((resolve, reject) => {
    commitMutation(
      environment,
      {
        mutation,
        variables: {input},
        updater: (store) => { },
        onError: reject,
        onCompleted: resolve
      }
    );
  });
};
