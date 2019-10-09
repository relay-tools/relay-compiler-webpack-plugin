"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRaiseErrorsReporter;

// Was using a ConsoleReporter with quiet true (which is essentially a no-op)
// This implements graphql-compiler GraphQLReporter
// https://github.com/facebook/relay/blob/v1.7.0/packages/graphql-compiler/reporters/GraphQLReporter.js
// Wasn't able to find a way to import the GraphQLReporter interface to declare that it is
// implemented
function createRaiseErrorsReporter(logger) {
  return {
    reportMessage(message) {
      if (logger) logger.log(message);else console.log(message); // eslint-disable-line no-console
    },

    /* eslint-disable no-unused-vars */
    reportTime(name, ms) {// process.stdout.write('Report time: ' + name + ' ' + ms + '\n');
    },

    /* eslint-enable no-unused-vars */
    reportError(caughtLocation, error) {
      // process.stdout.write('Report error: ' + caughtLocation + ' ' + error.toString() + '\n');
      throw error;
    }

  };
}