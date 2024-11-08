import { ReplyInfo, ReplyType } from "@/bilibili-comment-search/bilibili";
import { BiliApi, BiliButtonColor, BiliSvg } from "@/bilibili-comment-search/constants";

function createCommentButtonStyle(): HTMLStyleElement {
  const style = document.createElement('style');

  // 参考“最新|最热”的元素样式
  style.textContent = `
    bilibili-comment-button {
      color: ${BiliButtonColor.unclicked};
      height: 28px;
      padding: 0px 6px;
      font-size: 13px;
    }
    bilibili-comment-button:hover {
      color: ${BiliButtonColor.hover} !important;
      cursor: pointer;
    }
  `;

  return style;
}

function createCommentSearchStyle(): HTMLStyleElement {
  const style = document.createElement('style');

  // 参考“最新|最热”的元素样式
  style.textContent = `
    .bcs-search-container {
      padding-left: 80px;
      font-size: 15px;
      line-height: 24px;
      color: #18191C;
    }
    .bcs-search-main {
      display: flex;
      flex-direction: column;
    }
    .bcs-search-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0px;
    }
    .bcs-search-header button {
      cursor: pointer;
    }
    .bcs-search-header input, .bcs-search-header button {
      padding: 0px 10px;
      border-radius: 5px;
      height: 20px;
      border: 1px solid #9e9e9e;
    }
    .bcs-search-options {
      display: flex;
      gap: 15px;
      margin-top: 10px;
    }
  `;

  return style;
}

function createCommentContainerStyle(): HTMLStyleElement {
  const style = document.createElement('style');

  style.textContent = `
    span {
      display: inline-block;
      word-break: break-all;
    }
    .bcs-container {
      position: relative;
    }
    .bcs-container a {
      text-decoration: none;
      color: inherit;
    }
    .bcs-container a:hover {
      cursor: pointer;
    }
    .bcs-avatar {
      position: absolute;
      transform-origin: left top;
      transform: var(--bili-comments-avatar-size);
      z-index: 10;
    }
    .bcs-avatar img:hover {
      cursor: pointer;
    }
    .bcs-avatar img {
      border-radius: 50%;
      z-index: 10;
    }
    .bcs-avatar-0 {
      left: 20px;
      top: 22px;
      width: 48px;
      height: 48px;
    }
    .bcs-avatar-1 {
      padding: 16px 0px 8px;
      width: 24px;
      height: 24px;
    }
    .bcs-avatar-0 img {
      width: 48px;
      height: 48px;
    }
    .bcs-avatar-1 img {
      width: 24px;
      height: 24px;
    }
    .bcs-main {
      position: relative;
    }
    .bcs-main-0 {
      padding-left: 80px;
      padding-top: 22px;
    }
    .bcs-main-1 {
      padding: 8px 0 8px 34px;
    }
    .bcs-header {
    }
    .bcs-header-0 {
      display: inline-flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .bcs-header-1 {
      display: block;
      align-items: center;
      margin-bottom: 0px;
    }
    .bcs-uname {
      color: #61666D;
      font-size: 13px;
      font-weight: 500;
    }
    .bcs-level {
      margin-left: 5px;
    }
    .bcs-level-0 {
      width: 30px;
      height: 30px;
    }
    .bcs-level-1 {
      width: 30px;
      height: 30px;
    }
    .bcs-content {
      font-size: 15px;
      line-height: 24px;
      color: #18191C;
    }
    .bcs-note {
      width: 48px;
      height: 22px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      color: #9499A0;
      background-color: #F6F7F8;
      vertical-align: text-bottom;
      font-size: 12px;
      font-style: normal;
    }
    .bcs-footer {
      display: flex;
      align-items: center;
      position: relative;
      font-size: 13px;
      color: #9499A0;
    }
    .bcs-footer-0 {
      margin-top: 10px;
    }
    .bcs-footer-1 {
      margin-top: 0px;
    }
    .bcs-footer div {
      display: flex;
      align-items: center;
    }
    .bcs-expander {
      margin-top: 4px;
      color: #9499A0;
    }
    .bcs-div {
      padding-bottom: 14px;
      margin-left: 80px;
      border-bottom: 1px solid #E3E5E7;
    }
  `;

  return style;
}

function createCommentButton(text: string): HTMLElement {
  let button = document.createElement('Bilibili-Comment-Button');
  button.innerHTML = text;
  return button;
}

function createCommentButtonDivider(): HTMLElement {
  let divider = document.createElement('div');
  divider.className = 'sort-div';
  return divider;
}

function createCommentSearch(): HTMLElement {
  let search = document.createElement('div');

  search.style.display = 'none';
  search.className = 'bcs-search-container';
  search.innerHTML = `
    <div class="bcs-progress"></div>
    <div class="bcs-search-main">
      <div class="bcs-search-header">
        <input type="text" id="bcs-search" placeholder="输入搜索内容，或者正则表达式（如：.*）" />
        <button id="bcs-search-start">开始搜索</button>
        <button id="bcs-search-stop">停止搜索</button>
      </div>
      <div class="bcs-search-options">
        <label>
          <input type="checkbox" id="bcs-search__onlyup" /> 只看up
        </label>
        <label>
          <input type="checkbox" id="bcs-search__replies" /> 查询楼中楼
        </label>
      </div>
    </div>
  `;

  return search;
}

function createCommentContainer(): HTMLElement {
  let container = document.createElement('div');
  container.style.display = 'none';
  container.style.marginBottom = '40px';
  return container;
}

function createUpHTML(): string {
  return `<img width="24" height="24" src="${BiliApi.up}" />`;
}

function createNoteHTML(): string {
  return `
    <span class="bcs-note">
      ${BiliSvg.note}
      <span style="font-size: 12px">笔记</span>
    </span>
  `;
}

function createPictureHTML(pictures: any): string {
  let result = `<div>`;

  for (let picture of pictures) {
    if (picture.img_width && picture.img_height) {
      let w = picture.img_width, h = picture.img_height;

      if (w >= 135) {
        h = Math.round(h * 135 / w);
        w = 135;
      }

      result += `
        <a href="${picture.img_src}" target="_blank">
          <img
            src="${picture.img_src}@${w}w_${h}h_1s.avif"
            width="${w}"
            height="${h}"
            style="cursor: zoom-in;"
          />
        </a>
      `;
    }
    else {
      result += `
        <a href="${picture.img_src}" target="_blank">
          <img
            src="${picture.img_src}@135w_1s.avif"
            width="135"
            style="cursor: zoom-in;"
          />
        </a>
      `;
    }
  }

  return result += `</div>`;
}

function createRichTextHTML(info: ReplyInfo): string {
  return info.content.message
    .replace(/\[(.*?)\]/g, (match, text) => {
      return info.content.emote && info.content.emote.hasOwnProperty(`[${text}]`)
        ? `<img src="${info.content.emote[`[${text}]`].url}" alt="${text}" style="width:1.4em;height:1.4em;vertical-align:text-bottom;" />`
        : match;
    }).replace(/@(.*?)/g, (match, text) => {
      return info.content.at_name_to_mid && info.content.at_name_to_mid.hasOwnProperty(`${text}`)
        ? `<a href="${BiliApi.space + info.content.at_name_to_mid[`${text}`]}" style="color: #008AC5">@${text} </a>`
        : match;
    });
}

function createComment(info: ReplyInfo): HTMLElement {
  let comment = document.createElement('div');
  let upHTML = ``;
  let noteHTML = ``;
  let pictureHTML = ``;
  let richTextHTML = createRichTextHTML(info);

  if (info.isUp) {
    upHTML = createUpHTML();
  }

  if (info.type == ReplyType.note) {
    noteHTML = createNoteHTML();
    if (info.content.pictures) {
      pictureHTML = createPictureHTML(info.content.pictures);
    }
  }

  comment.className = 'bcs-container';
  comment.innerHTML = `
    <a class="bcs-avatar bcs-avatar-0" href="${BiliApi.space + info.mid}">
      <img src="${info.member.avatar}" />
    </a>
    <div class="bcs-main bcs-main-0">
      <div class="bcs-header bcs-header-0">
        <span class="bcs-uname"><a href="${BiliApi.space + info.mid}">${info.member.uname}</a></span>
        <img class="bcs-level bcs-level-0" src="${BiliApi.level + 'level_' + info.member.level + '.svg'}" />
        ${upHTML}
      </div>
      <div class="bcs-content">
        <span>${noteHTML}${richTextHTML}</span>
        ${pictureHTML}
      </div>
      <div class="bcs-footer bsc-footer-0">
        <div>${ info.time }</div>
        <div style="margin-left: 20px;">
          <div id="bcs-id-like">${BiliSvg.like}</div>
          <span style="margin-left: 5px;">${info.like}</span>
        </div>
        <div style="margin-left: 20px;">
          <div id="bcs-id-unlike">${BiliSvg.unlike}</div>
        </div>
        <div style="margin-left: 20px;">回复</div>
      </div>
      <div class="bcs-expander" style="display: none;">
        <span>${info.replyControl.sub_reply_entry_text}，</span>
        <span style="cursor: pointer;">点击查看</span>
      </div>
      <div class="bcs-replies" style="display: none;">
      </div>
    </div>
    <div class="bcs-div"></div>
  `;

  let expander = comment.getElementsByClassName('bcs-expander')[0] as HTMLElement;

  expander.getElementsByTagName('span')[1].addEventListener('click', () => {
    let replies = comment.getElementsByClassName('bcs-replies')[0] as HTMLElement;

    if (replies.style.display == 'none') {
      replies.style.display = 'block';
      expander.getElementsByTagName('span')[1].innerText = '点击收起';
    }
    else {
      replies.style.display = 'none';
      expander.getElementsByTagName('span')[1].innerText = '点击查看';
    }
  });

  return comment;
}

function createCommentReply(info: ReplyInfo): HTMLElement {
  let comment = document.createElement('div');
  let upHTML = ``;
  let richTextHTML = createRichTextHTML(info);

  if (info.isUp) {
    upHTML = createUpHTML();
  }

  comment.className = 'bcs-container';
  comment.innerHTML = `
    <a class="bcs-avatar bcs-avatar-1" href="${BiliApi.space + info.mid}">
      <img src="${info.member.avatar}" />
    </a>
    <div class="bcs-main bcs-main-1">
      <div class="bcs-header bcs-header-1">
        <span class="bcs-content">
          <span style="position: relative; top: -8px;" class="bcs-uname"><a href="${BiliApi.space + info.mid}">${info.member.uname}</a></span>
          <img class="bcs-level bcs-level-1" src="${BiliApi.level + 'level_' + info.member.level + '.svg'}" />
          ${upHTML}
          <span style="position: relative; top: -8px;">${richTextHTML}</span>
        </span>
      </div>
      <div class="bcs-footer bsc-footer-1">
        <div>${ info.time }</div>
        <div style="margin-left: 20px;">
          <div id="bcs-id-like">${BiliSvg.like}</div>
          <span style="margin-left: 5px;">${info.like}</span>
        </div>
        <div style="margin-left: 20px;">
          <div id="bcs-id-unlike">${BiliSvg.unlike}</div>
        </div>
        <div style="margin-left: 20px;">回复</div>
      </div>
    </div>
  `;

  return comment;
}

function showCommentReplies(comment: HTMLElement, count: number) {
  let expander = comment.getElementsByClassName('bcs-expander')[0] as HTMLElement;
  expander.style.display = 'block';
  expander.getElementsByTagName('span')[0].innerText = `查看 ${count} 条回复，`;
}

function appendReplyToComment(comment: HTMLElement, reply: HTMLElement) {
  comment.getElementsByClassName('bcs-replies')[0].appendChild(reply);
}

function setProgress(search: HTMLElement, text: string) {
  let progress = search.getElementsByClassName('bcs-progress')[0];
  progress.innerHTML = text;
}

interface CommentSearchOptions {
  onlyup: boolean,
  replies: boolean,
  match: string,
}

function getCommentSearchOptions(search: HTMLElement): CommentSearchOptions {
  let onlyup = search.querySelector('#bcs-search__onlyup') as HTMLInputElement;
  let replies = search.querySelector('#bcs-search__replies') as HTMLInputElement;
  let match = search.querySelector('#bcs-search') as HTMLInputElement;

  return {
    onlyup: onlyup.checked,
    replies: replies.checked,
    match: match.value,
  };
}

export { createCommentButtonStyle, createCommentContainerStyle, createCommentSearchStyle };
export { createComment, createCommentButton, createCommentButtonDivider, createCommentContainer, createCommentSearch, createCommentReply, getCommentSearchOptions, setProgress, appendReplyToComment, showCommentReplies };
