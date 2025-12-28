import { ViewStyle, StyleProp } from 'react-native';

export type OrNull<T> = null | T;

export type SupportedAnimation =
  | string
  | { from: ViewStyle; to: ViewStyle }
  | any; // Reanimated animation builder or Keyframe

export type Orientation =
  | 'portrait'
  | 'portrait-upside-down'
  | 'landscape'
  | 'landscape-left'
  | 'landscape-right';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type AnimationEvent = (...args: any[]) => void;
export type PresentationStyle =
  | 'fullScreen'
  | 'pageSheet'
  | 'formSheet'
  | 'overFullScreen';
export type OnOrientationChange = (orientation: {
  nativeEvent: { orientation: Orientation };
}) => void;

export interface GestureResponderEvent {
  nativeEvent: any;
}

export type Animations = {
  animationIn: string;
  animationOut: string;
};

export interface OnSwipeCompleteParams {
  swipingDirection: Direction;
}

export interface ModalProps {
  animationIn?: SupportedAnimation;
  animationInTiming?: number;
  animationOut?: SupportedAnimation;
  animationOutTiming?: number;
  avoidKeyboard?: boolean;
  coverScreen?: boolean;
  hasBackdrop?: boolean;
  backdropColor?: string;
  backdropOpacity?: number;
  backdropTransitionInTiming?: number;
  backdropTransitionOutTiming?: number;
  customBackdrop?: React.ReactNode;
  children?: React.ReactNode;
  deviceHeight?: number;
  deviceWidth?: number;
  isVisible?: boolean;
  hideModalContentWhileAnimating?: boolean;
  propagateSwipe?:
    | boolean
    | ((event: GestureResponderEvent, gestureState: any) => boolean);
  onModalShow?: () => void;
  onModalWillShow?: () => void;
  onModalHide?: () => void;
  onModalWillHide?: () => void;
  onBackButtonPress?: () => void;
  onBackdropPress?: () => void;
  onSwipeStart?: () => void;
  onSwipeMove?: (percentageShown: number) => void;
  onSwipeComplete?: (params: OnSwipeCompleteParams) => void;
  onSwipeCancel?: () => void;
  swipeThreshold?: number;
  swipeDirection?: Direction | Direction[];
  useNativeDriver?: boolean; // Deprecated
  useNativeDriverForBackdrop?: boolean; // Deprecated
  style?: StyleProp<ViewStyle>;
  scrollTo?: (e: any) => void;
  scrollOffset?: number;
  scrollOffsetMax?: number;
  scrollHorizontal?: boolean;
  supportedOrientations?: Orientation[];
  panResponderThreshold?: number;

  // React Native Modal props
  onDismiss?: () => void;
  onShow?: () => void;
  hardwareAccelerated?: boolean;
  onOrientationChange?: OnOrientationChange;
  presentationStyle?: PresentationStyle;
  statusBarTranslucent?: boolean;
  testID?: string;
}
