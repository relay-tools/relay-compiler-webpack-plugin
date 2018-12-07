import React from 'react';
import {createFragmentContainer} from 'react-relay';
import HomeItem from './HomeItem';

const Home = ({people}) => {
  return <div>
    <h2>Home</h2>
    <ul>
      {people.map((person) => <HomeItem key={person.id} person={person}/>)}
    </ul>
  </div>;
};

export default createFragmentContainer(
  Home,
  graphql`
    fragment Home_people on Person @relay(plural: true) {
      id
      ...HomeItem_person
    }
  `
)
