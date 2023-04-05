const DOM = {
  nav: "navigation",
  navLink: "navigation__link",
};

const navigation = document.querySelector(`.${DOM.nav}`);

navigation?.addEventListener("click", (e) => {
  e.preventDefault();

  const currentTarget = e.target;

  if (!(currentTarget instanceof Element)) {
    return;
  }

  const currentLink = currentTarget.closest(`.${DOM.navLink}`);

  const scrollTargetElem = getScrollTargetElem(currentLink);

  smoothScrollTo(scrollTargetElem);
});

export function smoothScrollTo(scrollTarget: Element | null) {
  if (!scrollTarget) {
    return;
  }

  const scrollStartPositionY = Math.round(window.scrollY);

  // нашли элемент, к которому скроллим (координата относительно вьюпорта - надо рисунок приложить)
  let targetPositionYRelativeToViewport =
    scrollTarget.getBoundingClientRect().top;

  targetPositionYRelativeToViewport = Math.round(
    targetPositionYRelativeToViewport
  );

  // позиция по Y относительно НЕ!!! вьюпорта, а страницы
  const targetPositionY =
    targetPositionYRelativeToViewport + scrollStartPositionY;

  // timestamp начала эффекта. perfomance.now() - ВЫСОКОТОЧНАЯ по сравнению с date.now()
  const startScrollTime = performance.now();

  animateSingleScrollFrame(startScrollTime);
}

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

  try {
    scrollTarget = document.querySelector(clickedLinkElemHref);
  } catch (e) {
    console.log(e);
    return null;
  }

  return scrollTarget;
}

function animateSingleScrollFrame(startScrollTime: number) {
  console.log(startScrollTime);
}
