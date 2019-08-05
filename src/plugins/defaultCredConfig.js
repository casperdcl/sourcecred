// @flow

import deepFreeze from "deep-freeze";
import {
  userNodeType,
  topicNodeType,
  postNodeType,
  declaration,
} from "./discourse/declaration";
import type {TimelineCredConfig} from "../analysis/timeline/timelineCred";

export const DEFAULT_CRED_CONFIG: TimelineCredConfig = deepFreeze({
  scoreNodePrefix: userNodeType.prefix,
  filterNodePrefixes: [
    userNodeType.prefix,
    topicNodeType.prefix,
    postNodeType.prefix,
  ],
  types: {
    nodeTypes: declaration.nodeTypes.slice(),
    edgeTypes: declaration.edgeTypes.slice(),
  },
});
