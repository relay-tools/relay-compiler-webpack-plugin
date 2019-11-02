"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _tapable = require("tapable");

const relayCompilerPluginHooksMap = new WeakMap();

function createRelayCompilerPluginHooks() {
  return {
    beforeWrite: new _tapable.AsyncSeriesWaterfallHook(['pluginArgs']),
    afterWrite: new _tapable.AsyncSeriesWaterfallHook(['pluginArgs'])
  };
}

function _default(compilation) {
  let hooks = relayCompilerPluginHooksMap.get(compilation);

  if (!hooks) {
    hooks = createRelayCompilerPluginHooks();
    relayCompilerPluginHooksMap.set(compilation, hooks);
  }

  return hooks;
}