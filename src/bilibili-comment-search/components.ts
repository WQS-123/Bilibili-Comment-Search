import { Reply, getAvatar, getLevel, getUname, getContent, getLike, getReplies } from "@/bilibili-comment-search/bilibili";

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
      getAvatar(reply),
      getLevel(reply),
      getContent(reply)
    );
  }
}

class CommentInfo {
  content: string
  like: number
  member: MemberInfo
  replies: (CommentInfo | null)[]

  constructor(content: string, like: number, member: MemberInfo, replies: (CommentInfo | null)[]) {
    this.content = content;
    this.like = like;
    this.member = member;
    this.replies = replies;
  }

  static fromReply(reply: Reply) {
    return new CommentInfo(
      getContent(reply),
      getLike(reply),
      MemberInfo.fromReply(reply),
      getReplies(reply)
    );
  }
}

function createDivider(): HTMLElement {
  let divider = document.createElement('div');
  divider.className = 'sort-div';
  return divider;
}

function createCommentButton(text: string): HTMLElement {
  let button = document.createElement('Bilibili-Comment-Button');
  button.innerHTML = text;
  return button;
}

function createCommentsContainer(): HTMLElement {
  let container = document.createElement('div');
  return container;
}

function createComment(comment: CommentInfo): HTMLElement {
  return document.createElement('div');
}

export { MemberInfo, CommentInfo };
export { createDivider, createCommentButton, createCommentsContainer, createComment };
