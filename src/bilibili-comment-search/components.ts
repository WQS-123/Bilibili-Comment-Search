import { ButtonClickFunction } from './core';
import { BiliButtonColor } from './constants';

interface ButtonBundle {
  button: HTMLElement;
  click: ButtonClickFunction;
}

function createDivider(): HTMLElement {
  let divider = document.createElement('div');
  divider.className = 'sort-div';
  return divider;
}

function createButton(text: string): HTMLElement {
  let button = document.createElement('Bilibili-Comment-Button');
  button.innerHTML = text;
  return button;
}

function createCommentsContainer(): HTMLElement {
  let container = document.createElement('div');
  return container;
}

function injectCommentButtonStyle(shadowRoot: ShadowRoot) {
  const style = document.createElement('style');

  // 参考（最新|最热）的元素样式
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

  shadowRoot.appendChild(style)
}

/**
 * 整个B站评论区的结构（需要注入的部分）如下
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
 * <div id="head">
 *  <bili-comments-header-renderer>
 *  shadow-root
 *    ...
 *    <div id="navbar">
 *      ...
 *      <div id="sort-actions">
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
                  const commentsContents = comments.shadowRoot?.querySelector('#contents');
                  const commentsContinuations = comments.shadowRoot?.querySelector('#continuations');
                  const commentsFeed = commentsContents?.querySelector('#feed');

                  if (!commentsContents || !commentsFeed) {
                    console.error("评论区元素: '#contents' 与 '#feed' 不存在");
                    shadowObserver.disconnect();
                  }

                  const commentsContentsElement = commentsContents as HTMLElement;
                  const commentsContinuationsElement = commentsContinuations as HTMLElement | null | undefined;
                  const commentsFeedElement = commentsFeed as HTMLElement;
                  const newCommentsFeedElement = createCommentsContainer();

                  // 插入新的评论区 container
                  commentsContentsElement.insertBefore(
                    newCommentsFeedElement,
                    commentsFeedElement
                  );

                  // 将按钮插入至 #sort-actions 队尾
                  for (let buttonBundle of buttonBundleList) {
                    const button = buttonBundle.button;
                    const click = buttonBundle.click;

                    // 为按钮绑定 click 函数
                    button.addEventListener('click', () => {
                      click(newCommentsFeedElement);
                    });

                    // 插入按钮
                    sortActions.appendChild(createDivider());
                    sortActions.appendChild(button);
                  }

                  // 为 sort-actions 所有子元素添加点击切换颜色的操作
                  for (let node of sortActions.childNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                      const element = node as HTMLElement;

                      if (element.className === 'sort-div') {
                        continue;
                      }

                      element.addEventListener('click', function() {
                        // 因为B站原生的两个按钮（最新|最热）包含 shadowRoot，需要进行特判
                        function setButtonState(button: HTMLElement, state: boolean) {
                          const color = state ? BiliButtonColor.clicked : BiliButtonColor.unclicked;

                          if (button.shadowRoot) {
                            const buttonShadowRoot = button.shadowRoot.querySelector('button') as HTMLElement;
                            buttonShadowRoot.style.color = color;

                            if (state) {
                              commentsFeedElement.style.display = 'block';
                              if (commentsContinuationsElement) {
                                commentsContinuationsElement.style.display = 'block';
                              }
                            }
                          }
                          else {
                            button.style.color = color;

                            if (state) {
                              commentsFeedElement.style.display = 'none';
                              if (commentsContinuationsElement) {
                                commentsContinuationsElement.style.display = 'none';
                              }
                            }
                          }
                        }

                        for (let sibling of sortActions.childNodes) {
                          if (sibling.nodeType === Node.ELEMENT_NODE) {
                            setButtonState(sibling as HTMLElement, false);
                          }
                        }

                        setButtonState(element, true);
                      });
                    }
                  }

                  shadowObserver.disconnect();
                }
              });

              // shadowRoot 插入 css 样式
              injectCommentButtonStyle(header.shadowRoot)

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

export { createButton, injectCommentButton };
