import { DOM, DEFAULT_SCROLL_ANIMATION_TIME } from "./consts";
import { ISmoothScrollToProps, IAnimateSingleScrollFrame } from "./types";

const navigation = document.querySelector(`.${DOM.nav}`);

navigation?.addEventListener("click", (e) => {
  e.preventDefault();

  const scrollTargetElem = getScrollTargetElem(e.target);

  smoothScrollTo({
    scrollTargetElem,
    onAnimationEnd: () => console.log("animation ends"),
  });
});

function getScrollTargetElem(clickedElem: EventTarget | null) {
  if (!(clickedElem instanceof Element)) {
    return null;
  }

  const clickedLinkElem = clickedElem.closest(`.${DOM.navLink}`);

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

export function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME,
  onAnimationEnd,
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

  const animationFrameSettings = {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
    onAnimationEnd,
  };

  requestAnimationFrame((currentTime) =>
    animateSingleScrollFrame(animationFrameSettings, currentTime)
  );
}



function animateSingleScrollFrame(
  {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
    onAnimationEnd,
  }: IAnimateSingleScrollFrame,
  currentTime: number
) {
  const elapsedTime = Math.max(currentTime - startScrollTime, 0);

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

  const animationFrameSettings = {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
    onAnimationEnd,
  };

  if (elapsedTime < scrollDuration) {
    // eslint-disable-next-line no-shadow
    requestAnimationFrame((currentTime) =>
      animateSingleScrollFrame(animationFrameSettings, currentTime)
    );
  } else if (onAnimationEnd) {
    onAnimationEnd();
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
