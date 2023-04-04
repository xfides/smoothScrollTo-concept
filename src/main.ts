const DOM = {
  nav: "navigation",
  navLink: "navigation__link",
};

const navigation = document.querySelector(`.${DOM.nav}`);

export function smoothScrollTo() {
  // сначала он отрабатывает, только потом переходит по якорю
  const startPosition = window.scrollY;
  console.log(startPosition);
}

navigation?.addEventListener("click", (e) => {
  const currentTarget = e.target as HTMLElement;

  if (!currentTarget.closest(`.${DOM.navLink}`)) {
    return;
  }

  console.log(currentTarget);

  smoothScrollTo();
});
