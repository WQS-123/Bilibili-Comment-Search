import { createCommentButtonStyle, createCommentContainerStyle, createCommentSearchStyle, createCommentButtonDivider, createCommentContainer, createCommentSearch, setProgress } from "@/bilibili-comment-search/components";
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
                  header.shadowRoot!.appendChild(createCommentButtonStyle());

                  // shadowRoot 插入搜索选项区样式
                  comments.shadowRoot!.appendChild(createCommentSearchStyle());

                  // shadowRoot 插入评论区样式
                  comments.shadowRoot!.appendChild(createCommentContainerStyle());

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

