// @flow

import type { Compilation } from 'webpack';
import { AsyncSeriesWaterfallHook } from 'tapable';

const relayCompilerPluginHooksMap = new WeakMap();

export interface PluginHooks {
  beforeWrite: AsyncSeriesWaterfallHook,
  afterWrite: AsyncSeriesWaterfallHook
}

function createRelayCompilerPluginHooks(): PluginHooks {
  return {
    beforeWrite: new AsyncSeriesWaterfallHook(['pluginArgs']),
    afterWrite: new AsyncSeriesWaterfallHook(['pluginArgs']),
  };
}

export default function (compilation: Compilation): PluginHooks {
  let hooks = relayCompilerPluginHooksMap.get(compilation);
  if (!hooks) {
    hooks = createRelayCompilerPluginHooks();
    relayCompilerPluginHooksMap.set(compilation, hooks);
  }
  return hooks;
}
