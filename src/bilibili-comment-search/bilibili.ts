import { BiliApi, BiliCommentType } from "@/bilibili-comment-search/constants";

type RespData = any;
type Reply = any;

class MemberInfo {
  avatar: string
  level: number
  uname: string

  constructor(avatar: string, level: number, uname: string) {
    this.avatar = avatar;
    this.level = level;
    this.uname = uname;
  }

  static fromReply(reply: Reply) {
    return new MemberInfo(
      reply.member.avatar,
      reply.member.level_info.current_level,
      reply.member.uname,
    );
  }
}

class ContentInfo {
  at_name_to_mid: Record<any, any> | null
  message: string
  emote: Record<any, any> | undefined
  pictures: any[] | undefined

  constructor(at_name_to_mid: Record<any, any>| null, message: string, emote: Record<any, any>, pictures: any[]) {
    this.at_name_to_mid = at_name_to_mid;
    this.message = message;
    this.emote = emote;
    this.pictures = pictures;
  }

  static fromReply(reply: Reply) {
    return new ContentInfo(
      reply.content.at_name_to_mid,
      reply.content.message,
      reply.content.emote,
      reply.content.pictures,
    );
  }
}

class ReplyInfo {
  type: BiliCommentType
  up: boolean
  ctime: number
  content: ContentInfo
  like: number
  member: MemberInfo
  mid: number
  replies: ReplyInfo[] | null
  rpid: number

  constructor(type: BiliCommentType, ctime: number, content: ContentInfo, like: number, member: MemberInfo, mid: number, replies: ReplyInfo[] | null, rpid: number) {
    this.up = false;
    this.type = type;
    this.ctime = ctime;
    this.content = content;
    this.like = like;
    this.member = member;
    this.mid = mid;
    this.replies = replies;
    this.rpid = rpid;
  }

  static fromReply(reply: Reply) {
    let type = BiliCommentType.noraml;

    if ('note_cvid' in reply || reply.note_cvid_str != '0') {
      type = BiliCommentType.note;
    }

    return new ReplyInfo(
      type,
      reply.ctime,
      ContentInfo.fromReply(reply),
      reply.like,
      MemberInfo.fromReply(reply),
      reply.mid,
      reply.replies,
      reply.rpid,
    );
  }

  getTime() {
    return new Date(this.ctime * 1000)
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).replace(/\//g, '-');
  }
}

function getBV(): string | undefined {
  let url = window.location.href;
  let match = url.match(/BV[a-zA-Z0-9]+/);

  if (!match) {
    console.error('未找到 bv 号');
    return;
  }

  return match[0];
}

function getOid(): string | undefined {
  return getBV();
}

type ReqParams = Record<string, string>;

interface CommentsReqParams extends ReqParams {
  oid: string,
  type: string,
  sort: string,
  ps: string,
  pn: string,
};

interface CommentRepliesReqParams extends ReqParams {
  oid: string,
  type: string,
  root: string,
  ps: string,
  pn: string,
};

async function fetchComments(params: CommentsReqParams): Promise<RespData | null> {
  const resp = await fetch(
    `${BiliApi.comments}?${new URLSearchParams(params).toString()}`,
    {
      method: "GET",
      credentials: 'include'
    }
  );
  const body = await resp.json();

  if (body.code != 0) {
    console.error(`获取评论区数据失败: ${body.message}`);
    return null;
  }

  if (body.data.top_replies && params.pn === '1') {
    body.data.replies.unshift(...body.data.top_replies);
  }

  return body.data;
}

async function fetchCommentReplies(params: CommentRepliesReqParams): Promise<RespData | null> {
  const resp = await fetch(
    `${BiliApi.commentReplies}?${new URLSearchParams(params).toString()}`,
    {
      method: "GET",
      credentials: 'include'
    }
  );
  const body = await resp.json();

  if (body.code != 0) {
    console.error(`获取评论的评论区数据失败: ${body.message}`);
    return null;
  }

  return body.data;
}

async function fetchAllComments(params: CommentsReqParams): Promise<Reply[]> {
  let result: Reply[] = [];

  do {
    let data = await fetchComments(params);
    let replies = data.replies as Reply[];

    if (replies.length == 0) {
      break;
    }

    result.push(...replies);
    params.pn = (parseInt(params.pn, 10) + 1).toString();

    await new Promise(resolve => setTimeout(resolve, 500));
  } while (true);

  return result;
}

async function fetchAllCommentReplies(params: CommentRepliesReqParams): Promise<Reply[]> {
  let result: Reply[] = [];

  do {
    let data = await fetchCommentReplies(params);
    let replies = data.replies as Reply[];

    if (replies.length == 0) {
      break;
    }

    result.push(...replies);
    params.pn = (parseInt(params.pn, 10) + 1).toString();

    await new Promise(resolve => setTimeout(resolve, 500));
  } while (true);

  return result;
}

export { RespData, Reply, ReplyInfo, CommentsReqParams, CommentRepliesReqParams };
export { getOid, fetchComments, fetchCommentReplies, fetchAllComments, fetchAllCommentReplies };
