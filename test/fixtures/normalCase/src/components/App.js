import React from 'react';
import Home from './Home';
import About from './About';
import {QueryRenderer} from 'react-relay';

export default () => {
  return <QueryRenderer
    environment={{}}
    query={graphql`
      query AppQuery {
        people {
          ...Home_people
        }
      }`}
    render={({props, error}) => {
      if (error) {
        console.error(error);
        return <div>Error</div>;
      }

      if (!props) {
        return <div>Loading</div>;
      }

      const {people} = props;
      return <div>
        <Home people={people} />
        <About id={1} relayEnvironment={{}} {...props} />
      </div>;
    }}
    />;
};
