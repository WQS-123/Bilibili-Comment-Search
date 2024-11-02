import { ButtonClickFunction } from './core';
import { BiliButtonColor } from './constants';

interface ButtonBundle {
  button: HTMLElement;
  click: ButtonClickFunction;
}

function createDivider() {
  let divider = document.createElement('div');
  divider.className = 'sort-div';
  return divider;
}

function createButton(text: string): HTMLElement {
  let button = document.createElement('Bilibili-Comment-Button');
  button.innerHTML = text;
  return button;
}

function injectCommentButtonStyle(shadowRoot: ShadowRoot) {
  const style = document.createElement('style');

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
                  // 将新元素插入至 sort-actions 队尾
                  for (let buttonBundle of buttonBundleList) {
                    const button = buttonBundle.button;
                    const click = buttonBundle.click;
                    const commentContainer = comments.shadowRoot?.querySelector('#contents');

                    button.addEventListener('click', () => {
                      if (commentContainer) {
                        click(commentContainer as HTMLElement);
                      }
                    });

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
                        function setButtonColor(button: HTMLElement, color: string) {
                          if (button.shadowRoot) {
                            const buttonShadowRoot = button.shadowRoot.querySelector('button') as HTMLElement;
                            buttonShadowRoot.style.color = color;
                          }
                          else {
                            button.style.color = color;
                          }
                        }

                        for (let sibling of sortActions.childNodes) {
                          if (sibling.nodeType === Node.ELEMENT_NODE) {
                            setButtonColor(sibling as HTMLElement, BiliButtonColor.unclicked);
                          }
                        }

                        setButtonColor(element, BiliButtonColor.clicked);
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
