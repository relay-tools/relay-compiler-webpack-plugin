'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildWatchExpression;
function buildWatchExpression(options) {
  return ['allof', ['type', 'f'], ['anyof', ...options.extensions.map(ext => ['suffix', ext])], ['anyof', ...options.include.map(include => ['match', include, 'wholename'])], ...options.exclude.map(exclude => ['not', ['match', exclude, 'wholename']])];
}