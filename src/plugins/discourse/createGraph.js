// @flow

import {Graph, NodeAddress, EdgeAddress} from "../../core/graph";
import {type PostId, type TopicId, type Post, type Topic} from "./fetch";
import {Mirror} from "./mirror";
import {
  topicNodeType,
  postNodeType,
  userNodeType,
  authorsEdgeType,
  postRepliesToEdgeType,
  topicContainsPostEdgeType,
} from "./declaration";

export function createGraph(serverUrl: string, mirror: Mirror): Graph {
  if (serverUrl.endsWith("/")) {
    throw new Error(`by convention, serverUrl should not end with /`);
  }
  const g = new Graph();

  const topicAddress = (id: TopicId) =>
    NodeAddress.append(topicNodeType.prefix, serverUrl, String(id));
  const postAddress = (id: PostId) =>
    NodeAddress.append(postNodeType.prefix, serverUrl, String(id));
  const userAddress = (username: string) =>
    NodeAddress.append(userNodeType.prefix, serverUrl, username);

  const authorsAddress = (
    contentType: "POST" | "TOPIC",
    authorName: string,
    contentId: number
  ) =>
    EdgeAddress.append(
      authorsEdgeType.prefix,
      contentType,
      serverUrl,
      authorName,
      String(contentId)
    );

  const topicContainsPostAddress = (topicId: TopicId, postId: PostId) =>
    EdgeAddress.append(
      topicContainsPostEdgeType.prefix,
      serverUrl,
      String(topicId),
      String(postId)
    );

  const postRepliesToAddress = (replyPostId: PostId, basePostId: PostId) =>
    EdgeAddress.append(
      postRepliesToEdgeType.prefix,
      serverUrl,
      String(replyPostId),
      String(basePostId)
    );

  const seenUsers = new Set();
  function addUser(username: string) {
    if (seenUsers.has(username)) {
      return;
    }
    const url = `${serverUrl}/u/${username}/`;
    const description = `[@${username}](${url})`;
    const address = userAddress(username);
    g.addNode({description, timestampMs: null, address});
    seenUsers.add(username);
  }

  const topicIdToTitle: Map<TopicId, string> = new Map();
  for (const {id, title, timestampMs, authorUsername} of mirror.topics()) {
    const url = `${serverUrl}/t/${String(id)}`;
    const description = `[${title}](${url})`;
    const address = topicAddress(id);
    topicIdToTitle.set(id, title);
    g.addNode({description, timestampMs, address});
    addUser(authorUsername);

    g.addEdge({
      address: authorsAddress("TOPIC", authorUsername, id),
      timestampMs: timestampMs,
      src: userAddress(authorUsername),
      dst: address,
    });
  }

  for (const {
    id,
    topicId,
    timestampMs,
    authorUsername,
    postNumber,
    replyToPostNumber,
  } of mirror.posts()) {
    const url = `${serverUrl}/t/${String(topicId)}/${String(id)}`;
    const topicTitle = topicIdToTitle.get(topicId) || "[unknown topic]";
    const description = `[post #${postNumber} on ${topicTitle}](${url})`;
    const address = postAddress(id);
    g.addNode({description, timestampMs, address});
    addUser(authorUsername);

    g.addEdge({
      address: authorsAddress("POST", authorUsername, id),
      timestampMs: timestampMs,
      src: userAddress(authorUsername),
      dst: address,
    });

    g.addEdge({
      address: topicContainsPostAddress(topicId, id),
      timestampMs: timestampMs,
      src: topicAddress(topicId),
      dst: address,
    });

    if (replyToPostNumber != null) {
      const basePostId = mirror.findPostInTopic(topicId, replyToPostNumber);
      if (basePostId != null) {
        g.addEdge({
          address: postRepliesToAddress(id, basePostId),
          timestampMs: timestampMs,
          src: address,
          dst: postAddress(basePostId),
        });
      }
    }
  }

  return g;
}
