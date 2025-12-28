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

const ANIMATION_MAP: Record<string, any> = {
  slideInDown: SlideInDown,
  slideInUp: SlideInUp,
  slideInLeft: SlideInLeft,
  slideInRight: SlideInRight,
  slideOutDown: SlideOutDown,
  slideOutUp: SlideOutUp,
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
