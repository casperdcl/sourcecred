// @flow

import Database from "better-sqlite3";
import * as NullUtil from "../../util/null";
import base64url from "base64url";
import {DiscourseFetcher, type DiscourseFetchOptions} from "./fetch";
import {Mirror} from "./mirror";
import {createGraph} from "./createGraph";
import {TaskReporter} from "../../util/taskReporter";
import {Graph} from "../../core/graph";
import path from "path";

export type Options = {|
  +fetchOptions: DiscourseFetchOptions,
  +cacheDirectory: string,
|};

export async function loadDiscourse(
  options: Options,
  reporter: TaskReporter
): Promise<Graph> {
  const filename = base64url.encode(options.fetchOptions.serverUrl) + ".db";
  const db = new Database(path.join(options.cacheDirectory, filename));
  const fetcher = new DiscourseFetcher(options.fetchOptions);
  const mirror = new Mirror(db, fetcher, options.fetchOptions.serverUrl);
  await mirror.update();
  const graph = createGraph(options.fetchOptions.serverUrl, mirror);
  return graph;
}
