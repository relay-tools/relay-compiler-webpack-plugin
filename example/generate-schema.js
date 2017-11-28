const graphqlToJson = require('graphql-to-json');

graphqlToJson({input: 'backend/src/schema.js', output: 'data/schema.json'});
