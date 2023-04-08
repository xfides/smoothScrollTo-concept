type TCallback = (...args: any[]) => void;

export interface ISmoothScrollToProps {
  scrollTargetElem: Element | null;
  scrollDuration?: number;
  onAnimationEnd?: TCallback;
}

export interface IAnimateSingleScrollFrame {
  startScrollTime: number;
  scrollDuration: number;
  scrollStartPositionY: number;
  targetPositionY: number;
  onAnimationEnd?: TCallback;
}
