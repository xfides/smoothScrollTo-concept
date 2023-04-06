import { DOM, DEFAULT_SCROLL_ANIMATION_TIME } from "./consts";
import { ISmoothScrollToProps, IAnimateSingleScrollFrame } from "./types";

const navigation = document.querySelector(`.${DOM.nav}`);

navigation?.addEventListener("click", (e) => {
  e.preventDefault();

  const currentTarget = e.target;

  if (!(currentTarget instanceof Element)) {
    return;
  }

  const currentLink = currentTarget.closest(`.${DOM.navLink}`);

  const scrollTargetElem = getScrollTargetElem(currentLink);

  smoothScrollTo({ scrollTargetElem });
});

export function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME,
}: ISmoothScrollToProps) {
  if (!scrollTargetElem) {
    return;
  }

  const scrollStartPositionY = Math.round(window.scrollY);

  const targetPositionYRelativeToViewport = Math.round(
    scrollTargetElem.getBoundingClientRect().top
  );

  const targetPositionY =
    targetPositionYRelativeToViewport + scrollStartPositionY;

  const startScrollTime = performance.now();

  animateSingleScrollFrame({
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
  });
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

function animateSingleScrollFrame({
  startScrollTime,
  scrollDuration,
  scrollStartPositionY,
  targetPositionY,
}: IAnimateSingleScrollFrame) {
  // временный костыль, пока не сделаем raf
  const currentTime = performance.now() + 100;

  const elapsedTime = currentTime - startScrollTime;

  const absoluteAnimationProgress = Math.min(elapsedTime / scrollDuration, 1);

  const normalizedAnimationProgress = normalizeAnimationProgressByBezierCurve(
    absoluteAnimationProgress
  );

  const currentScrollLength =
    (targetPositionY - scrollStartPositionY) * normalizedAnimationProgress;

  const newPositionY = scrollStartPositionY + currentScrollLength;

  window.scrollTo({
    top: newPositionY,
  });

  if (elapsedTime < scrollDuration) {
    console.log("Scroll me");
  } else {
    console.log("Scroll ends here");
  }
}

function normalizeAnimationProgressByBezierCurve(animationProgress: number) {
  return easeInOutQuadProgress(animationProgress);
}

function easeInOutQuadProgress(animationProgress: number) {
  return animationProgress < 0.5
    ? 2 * animationProgress * animationProgress
    : -1 + (4 - 2 * animationProgress) * animationProgress;
}
