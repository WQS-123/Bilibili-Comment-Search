import { BiliApi, BiliCommentType } from "@/bilibili-comment-search/constants";

type ReplyData = any;
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

class CommentInfo {
  type: BiliCommentType
  up: boolean
  ctime: number
  content: ContentInfo
  like: number
  member: MemberInfo
  mid: number
  replies: CommentInfo[] | null

  constructor(type: BiliCommentType, ctime: number, content: ContentInfo, like: number, member: MemberInfo, mid: number, replies: CommentInfo[] | null) {
    this.up = false;
    this.type = type;
    this.ctime = ctime;
    this.content = content;
    this.like = like;
    this.member = member;
    this.mid = mid;
    this.replies = replies;
  }

  static fromReply(reply: Reply) {
    let type = BiliCommentType.noraml;

    if ('note_cvid' in reply || reply.note_cvid_str != '0') {
      type = BiliCommentType.note;
    }

    return new CommentInfo(
      type,
      reply.ctime,
      ContentInfo.fromReply(reply),
      reply.like,
      MemberInfo.fromReply(reply),
      reply.mid,
      reply.replies,
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
    return
  }

  return match[0]
}

function getOid(): string | undefined {
  return getBV()
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

async function fetchComments(params: CommentSearchParams): Promise<ReplyData | null> {
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
    return null;
  }

  if (body.data.top_replies && params.pn == 1) {
    body.data.replies.unshift(...body.data.top_replies);
  }

  return body.data;
}

async function fetchAllComments(param: CommentSearchParams): Promise<Reply[]> {
  let replies: Reply[] = [];

  do {
    let data = await fetchComments(param);
    let reply = data.replies as Reply[];

    if (reply.length == 0) {
      break;
    }

    replies.push(...reply);
    param.pn++;

    await new Promise(resolve => setTimeout(resolve, 500));
  } while (true);

  return replies;
}

export { Reply, CommentInfo, CommentSearchParams };
export { getOid, fetchComments, fetchAllComments };
