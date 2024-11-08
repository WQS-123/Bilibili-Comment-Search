import { BiliApi } from "@/bilibili-comment-search/constants";

type Resp = any
type RespData = any;
type RespReply = any;

class MemberInfo {
  constructor(
    public avatar: string,
    public level: number,
    public uname: string
  ) {}

  static fromResp(reply: RespReply) {
    return new MemberInfo(
      reply.member.avatar,
      reply.member.level_info.current_level,
      reply.member.uname,
    );
  }
}

class ContentInfo {
  constructor(
    public at_name_to_mid: Record<any, any>| undefined,
    public message: string,
    public emote: Record<any, any> | undefined,
    public pictures: any[] | undefined
  ) {}

  static fromResp(reply: RespReply) {
    return new ContentInfo(
      reply.content.at_name_to_mid,
      reply.content.message,
      reply.content.emote,
      reply.content.pictures,
    );
  }
}

class ReplyControlInfo {
  constructor(
    public sub_reply_entry_text: string | undefined,
    public up_like: boolean | undefined,
    public up_reply: boolean | undefined
  ) {}

  static fromResp(reply: RespReply) {
    return new ReplyControlInfo(
      reply.reply_control.sub_reply_entry_text,
      reply.reply_control.up_like,
      reply.reply_control.up_reply
    );
  }
}

const enum ReplyType {
  none = 0,
  note = 1,
}

class ReplyInfo {
  constructor(
    public type: ReplyType,
    public isUp: boolean,
    public total: number,
    public time: string,
    public content: ContentInfo,
    public like: number,
    public member: MemberInfo,
    public mid: number,
    public replies: ReplyInfo[] | null,
    public replyControl: ReplyControlInfo,
    public rpid_str: string
  ) {}

  static fromResp(reply: RespReply, data: RespData) {
    let type = ReplyType.none;
    let isUp = data.upper.mid == reply.mid;
    let total = data.page.acount;
    let time = new Date(reply.ctime * 1000).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(/\//g, '-');

    if ('note_cvid' in reply || reply.note_cvid_str != '0') {
      type = ReplyType.note;
    }

    return new ReplyInfo(
      type,
      isUp,
      total,
      time,
      ContentInfo.fromResp(reply),
      reply.like,
      MemberInfo.fromResp(reply),
      reply.mid,
      reply.replies,
      ReplyControlInfo.fromResp(reply),
      reply.rpid_str,
    );
  }
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

async function fetchComments(params: CommentsReqParams): Promise<ReplyInfo[] | null> {
  const resp = await fetch(
    `${BiliApi.comments}?${new URLSearchParams(params).toString()}`,
    { method: "GET", credentials: 'include' }
  );
  const body: Resp = await resp.json();
  let result: ReplyInfo[] = [];

  if (body.code != 0) {
    console.error(`获取评论区数据失败: ${body.message}`);
    return null;
  }

  if (body.data.top_replies && params.pn === '1') {
    body.data.replies.unshift(...body.data.top_replies);
  }

  if (body.data.replies.length == 0) {
    return null;
  }

  for (let reply of body.data.replies) {
    result.push(ReplyInfo.fromResp(reply, body.data));
  }

  return result;
}

async function fetchCommentReplies(params: CommentRepliesReqParams): Promise<ReplyInfo[] | null> {
  const resp = await fetch(
    `${BiliApi.commentReplies}?${new URLSearchParams(params).toString()}`,
    { method: "GET", credentials: 'include' }
  );
  const body = await resp.json();
  let result: ReplyInfo[] = [];

  if (body.code != 0) {
    console.error(`获取评论的评论区数据失败: ${body.message}`);
    return null;
  }

  if (body.data.replies.length == 0) {
    return null;
  }

  for (let reply of body.data.replies) {
    result.push(ReplyInfo.fromResp(reply, body.data));
  }

  return result;
}

async function fetchAllComments(params: CommentsReqParams): Promise<RespReply[]> {
  let result: ReplyInfo[] = [];

  while (true) {
    let replyInfoList = await fetchComments(params);

    if (replyInfoList == null) {
      break;
    }

    result.push(...replyInfoList);
    params.pn = (parseInt(params.pn, 10) + 1).toString();

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return result;
}

async function fetchAllCommentReplies(params: CommentRepliesReqParams): Promise<RespReply[]> {
  let result: ReplyInfo[] = [];

  while (true) {
    let replyInfoList = await fetchCommentReplies(params);

    if (replyInfoList == null) {
      break;
    }

    result.push(...replyInfoList);
    params.pn = (parseInt(params.pn, 10) + 1).toString();

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return result;
}

export { ReplyType, ReplyInfo, CommentsReqParams, CommentRepliesReqParams };
export { getOid, fetchComments, fetchCommentReplies, fetchAllComments, fetchAllCommentReplies };
