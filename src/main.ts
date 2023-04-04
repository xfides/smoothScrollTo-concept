const DOM = {
  nav: "navigation",
  navLink: "navigation__link",
};

const navigation = document.querySelector(`.${DOM.nav}`);

export function smoothScrollTo(scrollTarget: Element | null) {
  // сначала он отрабатывает, только потом переходит по якорю
  const scrollStartPositionY = Math.round(window.scrollY);

  // нашли элемент, к которому скроллим (координата относительно вьюпорта - надо рисунок приложить)
  let targetPositionYRelativeToViewport =
    scrollTarget?.getBoundingClientRect().top;

  if (targetPositionYRelativeToViewport === undefined) {
    return;
  }

  targetPositionYRelativeToViewport = Math.round(
    targetPositionYRelativeToViewport
  );

  // позиция по Y относительно НЕ!!! вьюпорта, а страницы
  const targetPositionY =
    targetPositionYRelativeToViewport + scrollStartPositionY;

  // timestamp начала эффекта. perfomance.now() - ВЫСОКОТОЧНАЯ по сравнению с date.now()
  const startScrollTime = performance.now();

  console.log(startScrollTime);
}

navigation?.addEventListener("click", (e) => {
  e.preventDefault();

  const currentTarget = e.target as HTMLElement;

  if (!currentTarget.closest(`.${DOM.navLink}`)) {
    return;
  }

  const currentLink = currentTarget.closest(`.${DOM.navLink}`);

  const scrollTarget = getScrollTargetElem(currentLink);

  smoothScrollTo(scrollTarget);
});

// найти target
function getScrollTargetElem(clickedLinkElem: Element | null) {
  if (!clickedLinkElem) {
    return null;
  }

  const clickedLinkElemHref = clickedLinkElem.getAttribute("href");

  if (!clickedLinkElemHref) {
    return null;
  }

  let scrollTarget;

  // проверка на то, что у нас валидная (не внешний урл и не ерунда) строка в href
  try {
    scrollTarget = document.querySelector(clickedLinkElemHref);
  } catch (e) {
    console.log(e);
    return null;
  }

  return scrollTarget;
}
