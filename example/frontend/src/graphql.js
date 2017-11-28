import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import 'es6-promise';
import 'isomorphic-fetch';

function fetchQuery(operation, variables) {
  return fetch('//localhost:4000/graphql/', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  })
    .then(response => response.json())
    .then(response => {
      if (response.errors) {
        throw new Error(response.errors.map(e => e.message).join(', '));
      }
      return response;
    });
}

export const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});
