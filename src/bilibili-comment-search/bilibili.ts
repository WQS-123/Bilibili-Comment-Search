import { BiliApi } from "@/bilibili-comment-search/constants";
import { storage } from 'wxt/storage';

type Reply = any;

function getAvatar(reply: Reply): string {
  return reply.member.avatar;
}

function getLevel(reply: Reply): number {
  return reply.member.level_info.current_level;
}

function getUname(reply: Reply): string {
  return reply.member.uname;
}

function getContent(reply: Reply): string {
  return reply.contents.message;
}

function getLike(reply: Reply): number {
  return reply.like;
}

function getReplies(reply: Reply): Reply[] {
  return reply.replies;
}

function getBV(): string | undefined {
  let url = window.location.href;
  let match = url.match(/BV[a-zA-Z0-9]+/);

  if (!match) {
    console.error('未找到 bv 号');
    return
  }

  return match[0]
}

function getOid(): string | undefined {
  return getBV()
}

async function startSearching() {
  await storage.setItem<boolean>('local:bili-is-searching', true);
}

async function stopSearching() {
  await storage.setItem<boolean>('local:bili-is-searching', false);
}

async function isSearching(): Promise<boolean | null> {
  return await storage.getItem<boolean>('local:bili-is-searching');
}

interface CommentSearchParams {
  oid: string,
  type: number,
  sort: number,
  pn: number,
  ps: number,
};

function createURLSearchParams(param: CommentSearchParams): URLSearchParams {
  return new URLSearchParams({
    oid: param.oid,
    type: param.type.toString(),
    sort: param.sort.toString(),
    pn: param.pn.toString(),
    ps: param.ps.toString(),
  });
}

async function fetchComments(params: CommentSearchParams): Promise<[]> {
  const resp = await fetch(
    `${BiliApi.comments}?${createURLSearchParams(params).toString()}`,
    {
      method: "GET",
      credentials: 'include'
    }
  );
  const body = await resp.json();

  if (body.code != 0) {
    console.error(`获取评论区数据失败: ${body.message}`);
    return [];
  }

  if (body.data.top_replies && params.pn == 1) {
    body.data.replies.unshift(body.data.top_replies);
  }

  return body.data.replies;
}

async function fetchAllComments(param: CommentSearchParams): Promise<Reply[]> {
  let replies: Reply[] = [];

  await startSearching();

  do {
    let reply = await fetchComments(param);

    if (reply.length == 0 || !await isSearching()) {
      break;
    }

    replies.push(...reply);
    param.pn++;

    await new Promise(resolve => setTimeout(resolve, 500));
  } while (true);

  await stopSearching();

  return replies;
}

export { Reply, getAvatar, getLevel, getUname, getContent, getLike, getReplies };
export { startSearching, stopSearching, isSearching };
export { getOid };
export { CommentSearchParams, fetchComments, fetchAllComments };
