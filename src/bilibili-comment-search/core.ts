import { createDivider, createCommentsContainer, createComment } from "@/bilibili-comment-search/components";
import { startSearching, stopSearching, isSearching } from "@/bilibili-comment-search/bilibili";
import { CommentInfo, getOid, CommentSearchParams, fetchComments } from "@/bilibili-comment-search/bilibili";
import { BiliButtonColor, BiliCommentType } from './constants';

interface ButtonClickFunction {
  (commentContainer: HTMLElement): void;
}

interface ButtonBundle {
  button: HTMLElement,
  click: ButtonClickFunction,
}

function injectCommentButtonStyle(shadowRoot: ShadowRoot) {
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

  shadowRoot.appendChild(style);
}

function injectCommentContainerStyle(shadowRoot: ShadowRoot) {
  const style = document.createElement('style');

  style.textContent = `
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
      left: 20px;
      top: 22px;
      width: 48px;
      height: 48px;
      transform-origin: left top;
      transform: var(--bili-comments-avatar-size);
      z-index: 10;
    }
    .bcs-avatar img:hover {
      cursor: pointer;
    }
    .bcs-avatar img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      z-index: 10;
    }
    .bcs-main {
      position: relative;
      padding-left: 80px;
      padding-top: 22px;
    }
    .bcs-header {
      display: inline-flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .bcs-uname {
      color: #61666D;
      font-size: 13px;
      font-weight: 500;
    }
    .bcs-level {
      margin-left: 5px;
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
      margin-top: 5px;
      font-size: 13px;
      color: #9499A0;
    }
    .bcs-footer div {
      display: flex;
      align-items: center;
    }
    .bcs-div {
      padding-bottom: 14px;
      margin-left: 80px;
      border-bottom: 1px solid #E3E5E7;
    }
  `;

  shadowRoot.appendChild(style);
}

function injectNewCommentContainer(contents: HTMLElement, feed: HTMLElement, newFeed: HTMLElement) {
  contents.insertBefore(newFeed, feed);
}

function injectCommentButtons(
  sortActions: Element,
  buttonBundleList: ButtonBundle[],
  continuations: HTMLElement | null | undefined,
  feed: HTMLElement,
  newFeed: HTMLElement)
{
  // 因为B站原生的两个按钮“最新|最热”包含 shadowRoot，需要进行特判
  function setButton(button: HTMLElement, state: boolean) {
    const color = state ? BiliButtonColor.clicked : BiliButtonColor.unclicked;

    if (button.shadowRoot) {
      const buttonShadowRoot = button.shadowRoot.querySelector('button') as HTMLElement;

      buttonShadowRoot.style.color = color;
      if (state) {
        feed.style.display = 'block';
        newFeed.style.display = 'none';
        if (continuations) {
          continuations.style.display = 'block';
        }
      }
    }
    else {
      button.style.color = color;
      if (state) {
        feed.style.display = 'none';
        newFeed.style.display = 'block';
        if (continuations) {
          continuations.style.display = 'none';
        }
      }
    }
  }

  // 为 #sort-actions 的新增按钮添加 click 操作
  for (let bundle of buttonBundleList) {
    const button = bundle.button;
    const click = bundle.click;

    button.addEventListener('click', () => click(newFeed) );

    sortActions.appendChild(createDivider());
    sortActions.appendChild(button);
  }

  // 为 #sort-actions 的所有按钮添加点击切换颜色 & 切换 feed 的操作
  for (let node of sortActions.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      if (element.className === 'sort-div') {
        continue;
      }

      element.addEventListener('click', function() {
        for (let sibling of sortActions.childNodes) {
          if (sibling.nodeType === Node.ELEMENT_NODE) {
            setButton(sibling as HTMLElement, false);
          }
        }

        setButton(element, true);
      });
    }
  }
}

/**
 * 整个B站评论区的结构（需要注入的部分）如下
 * 
 * <body>
 *  ...
 *  <div id="app">
 *    ... 
 *    <div id="mirror-vdcon">
 *      ...
 *      <div class="left-container">
 *        ...
 *        <div id="commentapp">
 *          ...
 *          <bili-comments>
 *            shadow-root
 *            <div id="head">
 *            <div id="contents">
 *            <div id="continuations">
 * 
 * 
 * <div id="head">
 *  <bili-comments-header-renderer>
 *  shadow-root
 *    ...
 *    <div id="navbar">
 *      ...
 *      <div id="sort-actions">
 * 
 * 
 * <div id="contents">
 *  ...
 *  <div id="feed">
 * 
 * @param buttonBundleList 新增按钮数组
 */
function injectCommentButton(buttonBundleList: ButtonBundle[]) {
  const observerComment = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const comments = document.getElementsByTagName('bili-comments')[0];

        if (comments && comments.shadowRoot) {
          const commentsShadowObserver = new MutationObserver((_, shadowObserver) => {
            const header = comments.shadowRoot?.querySelector('bili-comments-header-renderer');

            if (header && header.shadowRoot) {
              const headerShadowObserver = new MutationObserver((_, shadowObserver) => {
                const sortActions = header.shadowRoot?.querySelector('#sort-actions');

                if (sortActions) {
                  // shadowRoot 插入 css 样式
                  injectCommentButtonStyle(header.shadowRoot!);

                  // 新评论区 container 添加样式
                  injectCommentContainerStyle(comments.shadowRoot!);

                  const contents = comments.shadowRoot?.querySelector('#contents');
                  const continuations = comments.shadowRoot?.querySelector('#continuations');
                  const feed = contents?.querySelector('#feed');

                  if (!contents || !feed) {
                    console.error("评论区元素不存在");
                    shadowObserver.disconnect();
                  }

                  const contentsElement = contents as HTMLElement;
                  const continuationsElement = continuations as HTMLElement | null | undefined;
                  const feedElement = feed as HTMLElement;
                  const newFeedElement = createCommentsContainer();

                  // 插入新的评论区 container
                  injectNewCommentContainer(contentsElement, feedElement, newFeedElement);

                  // 将按钮插入至 #sort-actions 队尾
                  injectCommentButtons(sortActions, buttonBundleList, continuationsElement, feedElement, newFeedElement);

                  shadowObserver.disconnect();
                }
              });

              headerShadowObserver.observe(header.shadowRoot, { childList: true, subtree: true });
              shadowObserver.disconnect();
            }
          });

          commentsShadowObserver.observe(comments.shadowRoot, { childList: true, subtree: true });
          observer.disconnect();
          break;
        }
      }
    }
  });

  observerComment.observe(document.body, { childList: true, subtree: true });
}

const emptyButtonClickFunction: ButtonClickFunction = (commentsContainer: HTMLElement) => { }

function match(content: string, pattern: RegExp): string {
  const matches = Array.from(content.matchAll(pattern));

  if (matches.length != 0) {
    let result = content;

    matches.reverse().forEach(match => {
      const st = match.index;
      const ed = st + match[0].length;

      result = result.slice(0, st) + `<span>${match[0]}</span>` + result.slice(ed);
    });

    return result;
  }

  return '';
}

const noteClick: ButtonClickFunction = async (commentContainer: HTMLElement) => {
  let param: CommentSearchParams = {
    oid: getOid()!,
    type: 1,
    sort: 2,
    pn: 1,
    ps: 20,
  };

  await startSearching();

  do {
    let replies = await fetchComments(param);

    if (replies.length == 0 || !await isSearching()) {
      break;
    }

    replies.forEach(reply => {
      let info = CommentInfo.fromReply(reply);

      if (info.type == BiliCommentType.note) {
        commentContainer.appendChild(createComment(info));
      }
    });

    param.pn++;

    await new Promise(resolve => setTimeout(resolve, 500));
  } while (true);

  await stopSearching();
}

export { injectCommentButton, emptyButtonClickFunction, noteClick };
