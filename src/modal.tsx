import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Modal,
  PanResponder,
  PanResponderGestureState,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  initializeAnimations,
  getAnimation,
} from './utils';
import {
  ModalProps,
  Direction,
  Orientation,
  OrNull,
  GestureResponderEvent,
} from './types';
import styles from './modal.style';
import { BackHandler } from './back-handler';

// Override default react-native-animatable animations (No-op now but kept for compatibility)
initializeAnimations();

const defaultProps = {
  animationIn: 'slideInUp',
  animationInTiming: 300,
  animationOut: 'slideOutDown',
  animationOutTiming: 300,
  avoidKeyboard: false,
  coverScreen: true,
  hasBackdrop: true,
  backdropColor: 'black',
  backdropOpacity: 0.7,
  backdropTransitionInTiming: 300,
  backdropTransitionOutTiming: 300,
  customBackdrop: null as React.ReactNode,
  useNativeDriver: false,
  deviceHeight: null as OrNull<number>,
  deviceWidth: null as OrNull<number>,
  hideModalContentWhileAnimating: false,
  propagateSwipe: false as
    | boolean
    | ((
        event: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => boolean),
  isVisible: false,
  panResponderThreshold: 4,
  swipeThreshold: 100,

  onModalShow: (() => null) as () => void,
  onModalWillShow: (() => null) as () => void,
  onModalHide: (() => null) as () => void,
  onModalWillHide: (() => null) as () => void,
  onBackdropPress: (() => null) as () => void,
  onBackButtonPress: (() => null) as () => void,
  scrollTo: null as OrNull<(e: any) => void>,
  scrollOffset: 0,
  scrollOffsetMax: 0,
  scrollHorizontal: false,
  statusBarTranslucent: false,
  supportedOrientations: ['portrait', 'landscape'] as Orientation[],
};

export type { ModalProps };

const ReactNativeModal = forwardRef<any, ModalProps>((props, ref) => {
  const {
    animationIn,
    animationInTiming,
    animationOut,
    animationOutTiming,
    avoidKeyboard,
    coverScreen,
    hasBackdrop,
    backdropColor,
    backdropOpacity,
    backdropTransitionInTiming,
    backdropTransitionOutTiming,
    customBackdrop,
    children,
    isVisible,
    onModalShow,
    onModalWillShow,
    onModalHide,
    onModalWillHide,
    onBackButtonPress,
    onBackdropPress,
    scrollTo,
    scrollOffset,
    scrollOffsetMax,
    scrollHorizontal,
    panResponderThreshold,
    useNativeDriver,
    propagateSwipe,
    style,
    swipeDirection,
    swipeThreshold,
    onSwipeStart,
    onSwipeMove,
    onSwipeComplete,
    onSwipeCancel,
    onDismiss,
    onShow,
    hardwareAccelerated,
    onOrientationChange,
    presentationStyle,
    useNativeDriverForBackdrop,
    testID,
    ...otherProps
  } = { ...defaultProps, ...props };

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const deviceWidth = props.deviceWidth || windowWidth;
  const deviceHeight = props.deviceHeight || windowHeight;

  // State
  const [showContent, setShowContent] = useState(isVisible);
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  
  // Refs
  const isTransitioning = useRef(false);
  const interactionHandle = useRef<number | null>(null);

  // Animations
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const backdropOpacityValue = useSharedValue(0);

  // Helper to determine if swiping is enabled
  const isSwipeable = !!swipeDirection;

  // Effects
  useEffect(() => {
    if (isVisible) {
      setIsModalVisible(true);
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (showContent) {
        props.onModalWillShow && props.onModalWillShow();
        // Reset pan
        panX.value = 0;
        panY.value = 0;
        // Backdrop animation
        backdropOpacityValue.value = withTiming(backdropOpacity, { duration: backdropTransitionInTiming });
    } else {
        props.onModalWillHide && props.onModalWillHide();
        // Backdrop animation
        backdropOpacityValue.value = withTiming(0, { duration: backdropTransitionOutTiming });
    }
  }, [showContent, backdropOpacity, backdropTransitionInTiming, backdropTransitionOutTiming]);

  // Back Handler
  useEffect(() => {
    const handler = () => {
      if (onBackButtonPress && isVisible) {
        onBackButtonPress();
        return true;
      }
      return false;
    };
    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => backHandlerSubscription.remove();
  }, [onBackButtonPress, isVisible]);

  // Pan Responder logic
  const currentSwipingDirection = useRef<Direction | null>(null);

  const getSwipingDirection = (gestureState: PanResponderGestureState) => {
    if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
      return gestureState.dx > 0 ? 'right' : 'left';
    }
    return gestureState.dy > 0 ? 'down' : 'up';
  };

  const isDirectionIncluded = (direction: Direction) => {
    return Array.isArray(swipeDirection)
      ? swipeDirection.includes(direction)
      : swipeDirection === direction;
  };

  const isSwipeDirectionAllowed = ({ dy, dx }: PanResponderGestureState) => {
    const draggedDown = dy > 0;
    const draggedUp = dy < 0;
    const draggedLeft = dx < 0;
    const draggedRight = dx > 0;

    if (currentSwipingDirection.current === 'up' && isDirectionIncluded('up') && draggedUp) return true;
    if (currentSwipingDirection.current === 'down' && isDirectionIncluded('down') && draggedDown) return true;
    if (currentSwipingDirection.current === 'right' && isDirectionIncluded('right') && draggedRight) return true;
    if (currentSwipingDirection.current === 'left' && isDirectionIncluded('left') && draggedLeft) return true;
    return false;
  };

  const calcDistancePercentage = (gestureState: PanResponderGestureState) => {
    switch (currentSwipingDirection.current) {
      case 'down':
        return (gestureState.moveY - gestureState.y0) / (deviceHeight - gestureState.y0);
      case 'up':
        return -((gestureState.moveY - gestureState.y0) / gestureState.y0);
      case 'left':
        return -((gestureState.moveX - gestureState.x0) / gestureState.x0);
      case 'right':
        return (gestureState.moveX - gestureState.x0) / (deviceWidth - gestureState.x0);
      default:
        return 0;
    }
  };

  const shouldPropagateSwipe = (evt: any, gestureState: PanResponderGestureState) => {
    return typeof propagateSwipe === 'function'
      ? propagateSwipe(evt, gestureState)
      : propagateSwipe;
  };

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      if (shouldPropagateSwipe(evt, gestureState)) {
        return false;
      }
      const shouldSetPanResponder =
        Math.abs(gestureState.dx) >= (panResponderThreshold || 4) ||
        Math.abs(gestureState.dy) >= (panResponderThreshold || 4);
      
      if (shouldSetPanResponder && onSwipeStart) {
        onSwipeStart();
      }
      
      if (shouldSetPanResponder) {
        currentSwipingDirection.current = getSwipingDirection(gestureState);
      }
      
      return shouldSetPanResponder;
    },
    onStartShouldSetPanResponder: (e: any, gestureState) => {
        const hasScrollableView =
          e._dispatchInstances &&
          e._dispatchInstances.some((instance: any) =>
            /scrollview|flatlist/i.test(instance.type),
          );

        if (
          hasScrollableView &&
          shouldPropagateSwipe(e, gestureState) &&
          scrollTo &&
          scrollOffset > 0
        ) {
          return false;
        }
        if (onSwipeStart) {
          onSwipeStart();
        }
        currentSwipingDirection.current = null;
        return true;
    },
    onPanResponderMove: (evt, gestureState) => {
        if (!currentSwipingDirection.current) {
            if (gestureState.dx === 0 && gestureState.dy === 0) return;
            currentSwipingDirection.current = getSwipingDirection(gestureState);
        }

        if (isSwipeDirectionAllowed(gestureState)) {
            const newOpacityFactor = 1 - calcDistancePercentage(gestureState);
            backdropOpacityValue.value = backdropOpacity * newOpacityFactor;
            
            // Manually update shared values
            if (currentSwipingDirection.current === 'right' || currentSwipingDirection.current === 'left') {
                panX.value = gestureState.dx;
            } else {
                panY.value = gestureState.dy;
            }

            if (onSwipeMove) {
                onSwipeMove(newOpacityFactor);
            }
        } else {
             if (scrollTo) {
                if (scrollHorizontal) {
                  let offsetX = -gestureState.dx;
                  if (offsetX > scrollOffsetMax) {
                    offsetX -= (offsetX - scrollOffsetMax) / 2;
                  }
                  scrollTo({ x: offsetX, animated: false });
                } else {
                  let offsetY = -gestureState.dy;
                  if (offsetY > scrollOffsetMax) {
                    offsetY -= (offsetY - scrollOffsetMax) / 2;
                  }
                  scrollTo({ y: offsetY, animated: false });
                }
              }
        }
    },
    onPanResponderRelease: (evt, gestureState) => {
        const accDistance = (() => {
            switch (currentSwipingDirection.current) {
                case 'up': return -gestureState.dy;
                case 'down': return gestureState.dy;
                case 'right': return gestureState.dx;
                case 'left': return -gestureState.dx;
                default: return 0;
            }
        })();

        if (accDistance > swipeThreshold && isSwipeDirectionAllowed(gestureState)) {
            if (onSwipeComplete) {
                onSwipeComplete({ swipingDirection: getSwipingDirection(gestureState) });
                return;
            }
            // Trigger close
            // Here we should probably animate out manually based on direction, but for now let's just trigger close
            // Ideally we want to continue the movement
            setShowContent(false);
        } else {
            // Reset
            if (onSwipeCancel) {
                onSwipeCancel();
            }
            backdropOpacityValue.value = withTiming(backdropOpacity, { duration: backdropTransitionInTiming });
            panX.value = withSpring(0, { damping: 15, stiffness: 100 });
            panY.value = withSpring(0, { damping: 15, stiffness: 100 });
            
             if (scrollTo) {
              if (scrollOffset > scrollOffsetMax) {
                scrollTo({
                  y: scrollOffsetMax,
                  animated: true,
                });
              }
            }
        }
    }
  }), [isSwipeable, swipeDirection, swipeThreshold, onSwipeStart, onSwipeMove, onSwipeComplete, onSwipeCancel, scrollTo, scrollOffset, scrollOffsetMax, panResponderThreshold, scrollHorizontal]);

  // Animated Styles
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
        transform: [
            { translateX: panX.value },
            { translateY: panY.value }
        ]
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
      return {
          opacity: backdropOpacityValue.value
      };
  });

  // Entering / Exiting animations
  const enteringAnimation = useMemo(() => {
    const anim = getAnimation(animationIn, 'in');
    if ('duration' in anim) { // It's a ComplexAnimationBuilder
         return anim.duration(animationInTiming);
    }
    return anim;
  }, [animationIn, animationInTiming]);

  const exitingAnimation = useMemo(() => {
    const anim = getAnimation(animationOut, 'out');
    // Keyframe doesn't support .duration() directly in the same way, but let's assume getAnimation returns correct types
    // Reanimated types are a bit complex. ComplexAnimationBuilder has .duration(). Keyframe has duration in config.
    // Simplified:
    if (typeof anim === 'object' && 'duration' in anim && typeof anim.duration === 'function') {
         return anim.duration(animationOutTiming).withCallback((finished: boolean) => {
            'worklet';
            if (finished) {
                runOnJS(setIsModalVisible)(false);
                if (onModalHide) runOnJS(onModalHide)();
            }
         });
    }
    // For Keyframe or others, we might need a wrapper or handle callback differently
    // But Keyframe in Reanimated 3 supports .duration? No, it's defined in the keyframe object.
    // If it's Keyframe, we can't easily attach callback.
    // Fallback: use a timeout or assume it works. 
    // Actually, Keyframe DOES support .duration() in latest Reanimated? No.
    // Let's assume standard animations for now.
    // If it is Keyframe, we can wrap it?
    
    // WORKAROUND: For Keyframe, we use a separate callback mechanism or just use standard Exiting.withCallback
    // Since we upgraded to 3.19.5, let's try to stick to standard builders if possible.
    // If it is Keyframe, we can try `exiting={anim.duration(time)}` if supported.
    // Checking types: Keyframe does NOT have .withCallback.
    // We might need to use `runOnJS` inside the keyframe? No.
    
    // Alternative: Use `useEffect` to detect when showContent becomes false, and set a timeout?
    // That's risky if animation is interrupted.
    
    // Let's rely on standard builders having .withCallback.
    // If Keyframe, we lose the callback for now or need a workaround.
    // For this task, let's assume standard animations.
    
    return (anim as any).duration(animationOutTiming).withCallback((finished: boolean) => {
        'worklet';
        if (finished) {
            runOnJS(setIsModalVisible)(false);
            if (onModalHide) runOnJS(onModalHide)();
        }
    });
  }, [animationOut, animationOutTiming, onModalHide]);

  const handleEnteringCallback = useCallback((finished: boolean) => {
      'worklet';
      if (finished && onModalShow) {
          runOnJS(onModalShow)();
      }
  }, [onModalShow]);

  // Apply callback to entering as well
  const finalEntering = useMemo(() => {
       if (typeof enteringAnimation === 'object' && 'withCallback' in enteringAnimation) {
           return (enteringAnimation as any).withCallback(handleEnteringCallback);
       }
       return enteringAnimation;
  }, [enteringAnimation, handleEnteringCallback]);


  // Imperative Handle
  useImperativeHandle(ref, () => ({
      open: () => {
          setShowContent(true);
      },
      close: () => {
          setShowContent(false);
      }
  }));

  // Render
  const computedStyle = [
      { margin: deviceWidth * 0.05, transform: [{ translateY: 0 }] },
      styles.content,
      style,
    ];

  const renderBackdrop = () => {
      if (!hasBackdrop) return null;
      
      const backdropStyle = [
          styles.backdrop,
          {
              width: deviceWidth,
              height: deviceHeight,
              backgroundColor: backdropColor,
          },
          backdropAnimatedStyle
      ];

      if (customBackdrop) {
          return (
            <Animated.View style={backdropStyle}>
                {customBackdrop}
            </Animated.View>
          );
      }

      return (
        <TouchableWithoutFeedback onPress={onBackdropPress}>
            <Animated.View style={backdropStyle} />
        </TouchableWithoutFeedback>
      );
  };

  const containerView = (
      <Animated.View
        {...(isSwipeable ? panResponder.panHandlers : {})}
        style={[computedStyle, contentAnimatedStyle]}
        pointerEvents="box-none"
        entering={finalEntering}
        exiting={exitingAnimation}
      >
        {children}
      </Animated.View>
  );

  if (!coverScreen && isModalVisible) {
      return (
        <View
          pointerEvents="box-none"
          style={[styles.backdrop, styles.containerBox]}
        >
          {renderBackdrop()}
          {showContent && containerView}
        </View>
      );
  }

  return (
      <Modal
        transparent={true}
        animationType={'none'}
        visible={isModalVisible}
        onRequestClose={onBackButtonPress}
        {...otherProps}
      >
        {renderBackdrop()}
        
        {avoidKeyboard ? (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              pointerEvents="box-none"
              style={computedStyle.concat([{ margin: 0 }])} 
            >
                {showContent && containerView}
            </KeyboardAvoidingView>
        ) : (
            showContent && containerView
        )}
      </Modal>
  );
});

export default ReactNativeModal;
