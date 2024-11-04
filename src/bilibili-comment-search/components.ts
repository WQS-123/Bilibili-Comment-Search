import { fetchAllCommentReplies, getOid, ReplyInfo } from "@/bilibili-comment-search/bilibili";
import { BiliApi, BiliCommentType, BiliSvg } from "@/bilibili-comment-search/constants";
import { match } from "@/bilibili-comment-search/core";

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
        <input type="text" id="bcs-search" placeholder="输入搜索内容" />
        <button id="bcs-search-start">开始搜索</button>
        <button id="bcs-search-stop">停止搜索</button>
      </div>
      <div class="bcs-search-options">
        <label>
          <input type="checkbox" id="bcs-search__onlyup" /> 只看up
        </label>
        <label>
          <input type="checkbox" id="bcs-search__regexp" /> 正则模式
        </label>
      </div>
    </div>
  `

  return search;
}

function createCommentContainer(): HTMLElement {
  let container = document.createElement('div');
  container.style.display = 'none';
  container.style.marginBottom = '40px';
  return container;
}

async function createComment(info: ReplyInfo, options: CommentSearchOptions | null): Promise<[HTMLElement, number, CommentSearchOptionsIsOk]> {
  let comment = document.createElement('div');
  let count = 1, show: CommentSearchOptionsIsOk = { onlyup: false, regexp: false };
  let noteHTML = ``;
  let pictureHTML = ``;
  let upHTML = ``;

  if (options && options.match == '') {
    show.regexp = true;
  }
  if (options && options.match != '') {
    let messageMatched = match(info.content.message, options.pattern!);
    let unameMatched = match(info.member.uname, options.pattern!);

    if (messageMatched != '') {
      info.content.message = messageMatched;
      show.regexp = true;
    }
    if (unameMatched != '') {
      info.member.uname = unameMatched;
      show.regexp = true;
    }
  }

  let richText = info.content.message
    .replace(/\[(.*?)\]/g, (match, text) => {
      return info.content.emote && info.content.emote.hasOwnProperty(`[${text}]`)
        ? `<img src="${info.content.emote[`[${text}]`].url}" alt="${text}" style="width:1.4em;height:1.4em;vertical-align:text-bottom;" />`
        : match;
    }).replace(/@(.*?) /g, (match, text) => {
      return info.content.at_name_to_mid && info.content.at_name_to_mid.hasOwnProperty(`${text}`)
        ? `<a href="${BiliApi.space + info.content.at_name_to_mid[`${text}`]}" style="color: #008AC5">@${text} </a>`
        : match;
    });

  if (info.type == BiliCommentType.note) {
    noteHTML = `
      <span class="bcs-note">
        ${BiliSvg.note}
        <span style="font-size: 12px">笔记</span>
      </span>
    `;

    if (info.content.pictures) {
      pictureHTML += `<div>`;

      for (let picture of info.content.pictures) {
        if (picture.img_width && picture.img_height) {
          let w = picture.img_width, h = picture.img_height;

          if (w >= 135) {
            h = Math.round(h * 135 / w);
            w = 135;
          }

          pictureHTML += `<a href="${picture.img_src}" target="_blank">
            <img
              src="${picture.img_src}@${w}w_${h}h_1s.avif"
              width="${w}"
              height="${h}"
              style="cursor: zoom-in;"
            /></a>
          `;
        }
        else {
          pictureHTML += `<a href="${picture.img_src}" target="_blank">
            <img
              src="${picture.img_src}@135w_1s.avif"
              width="135"
              style="cursor: zoom-in;"
            /></a>
          `;
        }
      }

      pictureHTML += `</div>`;
    }
  }

  if (info.up) {
    upHTML = `<img width="24" height="24" src="${BiliApi.up}" />`
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
        <span>${noteHTML}${richText}</span>
        ${pictureHTML}
      </div>
      <div class="bcs-footer bsc-footer-0">
        <div>${ info.getTime() }</div>
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
        <span>查看 ? 条回复，</span>
        <span style="cursor: pointer;">点击查看</span>
      </div>
      <div class="bcs-replies" style="display: none;">
      </div>
    </div>
    <div class="bcs-div"></div>
  `;

  if (options && options.onlyup) {
    if (info.mid == options.mid) {
      show.onlyup = true;
    }
  }

  if (info.replies && info.replies.length > 0) {
    let expander = comment.getElementsByClassName('bcs-expander')[0] as HTMLElement
    expander.style.display = 'block';

    const replies = await fetchAllCommentReplies({
      oid: getOid()!,
      type: '1',
      root: info.rpid.toString(),
      ps: '10',
      pn: '1',
    })

    for (let reply of replies) {
      const info = ReplyInfo.fromReply(reply);
      const [element, isOk] = createRepliesComment(info, options);

      comment.getElementsByClassName('bcs-replies')[0].appendChild(element);
      if (options && info.mid == options.mid) {
        show.onlyup = true;
      }
      if (isOk.regexp) {
        show.regexp = true;
      }
    }

    count += replies.length;
  }

  let showReplies = comment.getElementsByClassName('bcs-expander')[0] as HTMLElement;
  showReplies
    .getElementsByTagName('span')[1]
    .addEventListener('click', () => {
      let replies = comment.getElementsByClassName('bcs-replies')[0] as HTMLElement;
      let display = replies.style.display;
      console.log(display);

      if (display == 'none') {
        replies.style.display = 'block';
        showReplies.getElementsByTagName('span')[1].innerText = '点击收起';
      }
      else {
        replies.style.display = 'none';
        showReplies.getElementsByTagName('span')[1].innerText = '点击查看';
      }
    });

  return [comment, count, show];
}

function createRepliesComment(info: ReplyInfo, options: CommentSearchOptions | null): [HTMLElement, CommentSearchOptionsIsOk] {
  let comment = document.createElement('div');
  let show: CommentSearchOptionsIsOk = { onlyup: false, regexp: false };
  let upHTML = ``;

  if (options && options.match == '') {
    show.regexp = true;
  }
  if (options && options.match != '') {
    let messageMatched = match(info.content.message, options.pattern!);
    let unameMatched = match(info.member.uname, options.pattern!);

    if (messageMatched != '') {
      info.content.message = messageMatched;
      show.regexp = true;
    }
    if (unameMatched != '') {
      info.member.uname = unameMatched;
      show.regexp = true;
    }
  }

  let richText = info.content.message
    .replace(/\[(.*?)\]/g, (match, text) => {
      return info.content.emote && info.content.emote.hasOwnProperty(`[${text}]`)
        ? `<img src="${info.content.emote[`[${text}]`].url}" alt="${text}" style="width:1.4em;height:1.4em;vertical-align:text-bottom;" />`
        : match;
    }).replace(/@(.*?) /g, (match, text) => {
      return info.content.at_name_to_mid && info.content.at_name_to_mid.hasOwnProperty(`${text}`)
        ? `<a href="${BiliApi.space + info.content.at_name_to_mid[`${text}`]}" style="color: #008AC5">@${text} </a>`
        : match;
    });

  if (info.up) {
    upHTML = `<img width="24" height="24" src="${BiliApi.up}" />`
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
          <span style="position: relative; top: -8px;">${richText}</span>
        </span>
      </div>
      <div class="bcs-footer bsc-footer-1">
        <div>${ info.getTime() }</div>
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

  return [comment, show];
}

function setProgress(search: HTMLElement, text: string) {
  let progress = search.getElementsByClassName('bcs-progress')[0];

  progress.innerHTML = text;
}

interface CommentSearchOptions {
  onlyup: boolean,
  regexp: boolean,
  match: string,
  mid: number,
  pattern: RegExp | null,
}

interface CommentSearchOptionsIsOk {
  onlyup: boolean,
  regexp: boolean,
}

function getSearchOptions(search: HTMLElement): CommentSearchOptions {
  let onlyup = search.querySelector('#bcs-search__onlyup') as HTMLInputElement;
  let regexp = search.querySelector('#bcs-search__regexp') as HTMLInputElement;
  let match = search.querySelector('#bcs-search') as HTMLInputElement;

  return {
    onlyup: onlyup.checked,
    regexp: regexp.checked,
    match: match.value,
    mid: 0,
    pattern: null,
  };
}

export { createComment, createCommentButton, createCommentButtonDivider, createCommentContainer, createCommentSearch, createRepliesComment, getSearchOptions, setProgress };