const DOM = {
  nav: "navigation",
  navLink: "navigation__link",
};

const navigation = document.querySelector(`.${DOM.nav}`);

export function smoothScrollTo(scrollTarget: Element | null) {
  // сначала он отрабатывает, только потом переходит по якорю
  const startPosition = window.scrollY;

  // нашли элемент, к которому скроллим
  console.log(scrollTarget);
}

navigation?.addEventListener("click", (e) => {
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
