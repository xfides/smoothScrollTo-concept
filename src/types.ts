export interface ISmoothScrollToProps {
  scrollTargetElem: Element | null;
  scrollDuration?: number;
}

export interface IAnimateSingleScrollFrame {
  startScrollTime: number;
  scrollDuration: number;
  scrollStartPositionY: number;
  targetPositionY: number;
}

export interface IAnimateSingleScrollFrameProps {
  (currentTime: number): void;
  animationFrameSettings: IAnimateSingleScrollFrame;
}
