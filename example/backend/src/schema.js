var {buildSchema} = require('graphql');

module.exports = buildSchema(`
  type Person {
    id: ID!
    fullName: String!
  }
  
  type Query {
    people: [Person]
    personById(id: ID!): Person
  }
  
  type UpdateNameOutput {
    person: Person!
  }
  
  type Mutation {
    updateName(id: ID!, name: String!): UpdateNameOutput!
  }
`);
