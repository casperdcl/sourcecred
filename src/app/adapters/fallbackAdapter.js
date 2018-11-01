// @flow

import {fallbackDeclaration} from "../../analysis/fallbackDeclaration";
import type {
  StaticAppAdapter,
  DynamicAppAdapter,
} from "../../app/adapters/appAdapter";
import {Assets} from "../../app/assets";
import {type RepoId} from "../../core/repoId";
import {Graph, NodeAddress, type NodeAddressT} from "../../core/graph";

export class FallbackStaticAdapter implements StaticAppAdapter {
  declaration() {
    return fallbackDeclaration;
  }

  load(_unused_assets: Assets, _unused_repoId: RepoId) {
    return Promise.resolve(new FallbackDynamicAdapter());
  }
}

export class FallbackDynamicAdapter implements DynamicAppAdapter {
  graph() {
    return new Graph();
  }

  nodeDescription(x: NodeAddressT) {
    return `[fallback]: ${NodeAddress.toString(x)}`;
  }

  static() {
    return new FallbackStaticAdapter();
  }
}
