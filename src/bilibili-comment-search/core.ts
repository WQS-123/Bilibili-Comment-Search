import { createCommentButtonDivider, createCommentContainer, createCommentSearch, setProgress } from "@/bilibili-comment-search/components";
import { BiliButtonColor } from './constants';

interface SwitchFunction {
  (container: HTMLElement, search: HTMLElement): void;
}

interface SearchFunction {
  (container: HTMLElement, search: HTMLElement): void;
}

interface CommentBundle {
  button: HTMLElement,
  switch: SwitchFunction,
  search: SearchFunction,
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

function injectCommentSearchStyle(shadowRoot: ShadowRoot) {
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

  shadowRoot.appendChild(style);
}

function injectCommentContainerStyle(shadowRoot: ShadowRoot) {
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

  shadowRoot.appendChild(style);
}

function injectCommentButtons(
  sortActions: Element,
  commentBundleList: CommentBundle[],
  continuations: HTMLElement | null | undefined,
  feed: HTMLElement,
  newFeed: HTMLElement,
  search: HTMLElement)
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
        search.style.display = 'none';
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
        search.style.display = 'block';
        if (continuations) {
          continuations.style.display = 'none';
        }
      }
    }
  }

  // 为 #sort-actions 的新增按钮添加点击操作并初始化
  for (let bundle of commentBundleList) {
    bundle.button.addEventListener('click', () => bundle.switch(newFeed, search) );
    search.querySelector('#bcs-search-start')?.addEventListener('click', () => bundle.search(newFeed, search));

    sortActions.appendChild(createCommentButtonDivider());
    sortActions.appendChild(bundle.button);
  }
  search.querySelector('#bcs-search-stop')?.addEventListener('click', () => {
    stopSearching();
    setProgress(search, `已经停止搜索了哦，麻烦不要多次点击啦 ^_-`);
  });

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
function injectCommentButton(buttonBundleList: CommentBundle[]) {
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
                  // shadowRoot 插入按钮样式
                  injectCommentButtonStyle(header.shadowRoot!);

                  // shadowRoot 插入搜索选项区样式
                  injectCommentSearchStyle(comments.shadowRoot!);

                  // shadowRoot 插入评论区样式
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
                  const newFeedElement = createCommentContainer();
                  const searchElement = createCommentSearch();

                  // 插入新的评论区 container
                  contentsElement.insertBefore(newFeedElement, feedElement);
                  contentsElement.insertBefore(searchElement, newFeedElement);

                  // 将按钮插入至 #sort-actions 队尾
                  injectCommentButtons(sortActions, buttonBundleList, continuationsElement, feedElement, newFeedElement, searchElement);

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

async function startSearching() {
  await storage.setItem<boolean>('local:bili-is-searching', true);
}

async function stopSearching() {
  await storage.setItem<boolean>('local:bili-is-searching', false);
}

async function isSearching(): Promise<boolean | null> {
  return await storage.getItem<boolean>('local:bili-is-searching');
}

function match(content: string, pattern: RegExp): string {
  const matches = Array.from(content.matchAll(pattern));

  if (matches.length != 0) {
    let result = content;

    matches.reverse().forEach(match => {
      const st = match.index;
      const ed = st + match[0].length;

      result = result.slice(0, st) + `<span style="background: #febb8b;">${match[0]}</span>` + result.slice(ed);
    });

    return result;
  }

  return '';
}

export { CommentBundle, injectCommentButton, isSearching, match, SearchFunction, startSearching, stopSearching, SwitchFunction };

