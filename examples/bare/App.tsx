import React, { useState } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import Modal from 'react-native-modal';

const App = () => {
  const [visibleModal, setVisibleModal] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(null);
  const scrollViewRef = React.useRef(null);

  const handleOnScroll = (event) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const handleScrollTo = (p) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo(p);
    }
  };

  const renderButton = (text, onPress) => (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.button}>
        <Text style={styles.buttonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderModalContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalText}>Hello!</Text>
      {renderButton('Close', () => setVisibleModal(null))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>React Native Modal Examples</Text>

        <Text style={styles.sectionTitle}>Basic</Text>
        {renderButton('Default Modal', () => setVisibleModal('default'))}
        {renderButton('Slow Modal', () => setVisibleModal('slow'))}

        <Text style={styles.sectionTitle}>Animations</Text>
        {renderButton('Sliding from the bottom', () =>
          setVisibleModal('bottom'),
        )}
        {renderButton('Sliding from the top', () => setVisibleModal('top'))}
        {renderButton('Fancy (Zoom In/Out)', () => setVisibleModal('fancy'))}

        <Text style={styles.sectionTitle}>Swipeable</Text>
        {renderButton('Swipe Down to Close', () =>
          setVisibleModal('swipeable'),
        )}

        <Text style={styles.sectionTitle}>Scrollable</Text>
        {renderButton('Scrollable Modal', () => setVisibleModal('scrollable'))}

        <Text style={styles.sectionTitle}>Custom Backdrop</Text>
        {renderButton('Custom Backdrop Color', () =>
          setVisibleModal('backdrop'),
        )}

        <Text style={styles.sectionTitle}>Bottom Sheet</Text>
        {renderButton('Bottom Half Modal', () => setVisibleModal('bottomHalf'))}
      </ScrollView>

      {/* Default Modal */}
      <Modal isVisible={visibleModal === 'default'}>
        {renderModalContent()}
      </Modal>

      {/* Slow Modal */}
      <Modal
        isVisible={visibleModal === 'slow'}
        animationInTiming={1000}
        animationOutTiming={1000}
        backdropTransitionInTiming={800}
        backdropTransitionOutTiming={800}>
        {renderModalContent()}
      </Modal>

      {/* Sliding from bottom */}
      <Modal
        isVisible={visibleModal === 'bottom'}
        onBackdropPress={() => setVisibleModal(null)}>
        <View style={styles.bottomModal}>
          <Text style={styles.modalText}>I'm coming from the bottom!</Text>
          {renderButton('Close', () => setVisibleModal(null))}
        </View>
      </Modal>

      {/* Sliding from top */}
      <Modal
        isVisible={visibleModal === 'top'}
        animationIn="slideInDown"
        animationOut="slideOutUp">
        {renderModalContent()}
      </Modal>

      {/* Fancy Modal */}
      <Modal
        isVisible={visibleModal === 'fancy'}
        animationIn="zoomIn"
        animationOut="zoomOut">
        {renderModalContent()}
      </Modal>

      {/* Swipeable Modal */}
      <Modal
        isVisible={visibleModal === 'swipeable'}
        onSwipeComplete={() => setVisibleModal(null)}
        swipeDirection={['down', 'left', 'right', 'up']}>
        {renderModalContent()}
      </Modal>

      {/* Scrollable Modal */}
      <Modal
        isVisible={visibleModal === 'scrollable'}
        onSwipeComplete={() => setVisibleModal(null)}
        swipeDirection="down"
        scrollTo={handleScrollTo}
        scrollOffset={scrollOffset}
        scrollOffsetMax={400 - 300} // content height - ScrollView height
        style={styles.bottomModal}>
        <View style={styles.scrollableModal}>
          <ScrollView
            ref={scrollViewRef}
            onScroll={handleOnScroll}
            scrollEventThrottle={16}>
            <View style={styles.scrollableModalContent1}>
              <Text style={styles.modalText}>Scroll me up</Text>
            </View>
            <View style={styles.scrollableModalContent2}>
              <Text style={styles.modalText}>Scroll me down</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Custom Backdrop */}
      <Modal
        isVisible={visibleModal === 'backdrop'}
        backdropColor="#B4B3DB"
        backdropOpacity={0.8}
        animationIn="zoomInDown"
        animationOut="zoomOutUp"
        animationInTiming={600}
        animationOutTiming={600}
        backdropTransitionInTiming={600}
        backdropTransitionOutTiming={600}>
        {renderModalContent()}
      </Modal>

      {/* Bottom Half Modal */}
      <Modal
        isVisible={visibleModal === 'bottomHalf'}
        style={styles.bottomHalfModal}
        onBackdropPress={() => setVisibleModal(null)}>
        <View style={styles.bottomHalfContent}>
          <Text style={styles.modalText}>Bottom Half Modal</Text>
          {renderButton('Close', () => setVisibleModal(null))}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: 'lightblue',
    padding: 12,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minWidth: 200,
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 12,
  },
  scrollableModal: {
    height: 300,
  },
  scrollableModalContent1: {
    height: 200,
    backgroundColor: '#87BBE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableModalContent2: {
    height: 200,
    backgroundColor: '#A9DCD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomHalfModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  bottomHalfContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    minHeight: 300,
  },
});

export default App;
