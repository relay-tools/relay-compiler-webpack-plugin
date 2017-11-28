import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Home from './Home';
import NoMatch from './NoMatch';
import About from './About';
import {environment} from '../graphql';
import {QueryRenderer} from 'react-relay';

export default () => {
  return <QueryRenderer
    environment={environment}
    query={graphql`
      query AppQuery {
        people {
          id
          fullName
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
      return <BrowserRouter>
        <Switch>
          <Route exact path="/" component={(props) => <Home people={people} />}/>
          <Route exact path="/about/:id/" component={About}/>
          <Route component={NoMatch}/>
        </Switch>
      </BrowserRouter>;
    }}
    />;
};
