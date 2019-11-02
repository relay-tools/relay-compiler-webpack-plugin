import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'

const HomeItem = ({ person: { id, fullName } }) => (
  <li>
    <a href={`/about/${id}/`}>{fullName}</a>
  </li>
)

export default createFragmentContainer(
  HomeItem,
  graphql`
    fragment HomeItem_person on Person {
      id
      fullName
    }
  `
)
