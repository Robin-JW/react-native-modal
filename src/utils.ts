import { Dimensions } from 'react-native';
import {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  SlideOutDown,
  SlideOutUp,
  SlideOutLeft,
  SlideOutRight,
  ZoomIn,
  ZoomOut,
  Keyframe,
  ComplexAnimationBuilder,
} from 'react-native-reanimated';

const { height, width } = Dimensions.get('window');

// Note regarding animation directions:
//
// 1. IN Animations (Entrance):
//    - react-native-modal props use "Movement Direction" naming:
//      - slideInUp: Move Up (appears from Bottom)
//      - slideInDown: Move Down (appears from Top)
//    - Reanimated uses "Origin" naming:
//      - SlideInUp: From Top (Origin is Up)
//      - SlideInDown: From Bottom (Origin is Down)
//    -> Mismatch! We must swap them.
//       slideInUp (Move Up) maps to SlideInDown (From Bottom)
//       slideInDown (Move Down) maps to SlideInUp (From Top)
//
// 2. OUT Animations (Exit):
//    - react-native-modal props use "Movement Direction" naming:
//      - slideOutDown: Move Down (disappears to Bottom)
//      - slideOutUp: Move Up (disappears to Top)
//    - Reanimated uses "Destination" naming:
//      - SlideOutDown: To Bottom (Destination is Down)
//      - SlideOutUp: To Top (Destination is Up)
//    -> Match! No swap needed.
//       slideOutDown (Move Down) maps to SlideOutDown (To Bottom)
//       slideOutUp (Move Up) maps to SlideOutUp (To Top)

const SlideInFromBottom = SlideInDown;
const SlideInFromTop = SlideInUp;
const SlideOutToBottom = SlideOutDown;
const SlideOutToTop = SlideOutUp;

const ANIMATION_MAP: Record<string, any> = {
  slideInDown: SlideInFromTop,
  slideInUp: SlideInFromBottom,
  slideInLeft: SlideInLeft,
  slideInRight: SlideInRight,
  slideOutDown: SlideOutToBottom,
  slideOutUp: SlideOutToTop,
  slideOutLeft: SlideOutLeft,
  slideOutRight: SlideOutRight,
  fadeIn: FadeIn,
  fadeOut: FadeOut,
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
};

export const initializeAnimations = () => {
  // No-op for Reanimated
};

export const buildAnimations = ({
  animationIn,
  animationOut,
}: {
  animationIn: any;
  animationOut: any;
}) => {
  return {
    animationIn,
    animationOut,
  };
};

export const reversePercentage = (x: number) => -(x - 1);

export const getAnimation = (
  animation: string | object,
  type: 'in' | 'out',
): ComplexAnimationBuilder | any => {
  if (typeof animation === 'string') {
    const AnimationConstructor = ANIMATION_MAP[animation];
    if (AnimationConstructor) {
      return AnimationConstructor;
    }
    // Fallback
    return type === 'in' ? FadeIn : FadeOut;
  }

  if (typeof animation === 'object' && animation !== null) {
    return new Keyframe(animation as any);
  }

  return type === 'in' ? FadeIn : FadeOut;
};
