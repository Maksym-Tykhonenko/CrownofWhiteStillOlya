import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboard'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 740 || W < 360;
const IS_TINY = H < 690;

const BG = require('../assets/background.png');

const ONB_1 = require('../assets/onboard_1.png');
const ONB_2 = require('../assets/onboard_2.png');
const ONB_3 = require('../assets/onboard_3.png');

const CROWN = require('../assets/crown.png');

type Slide = {
  key: 'one' | 'two' | 'three';
  image: any;
  title: string;
  text: string;
  button: string;
};

export default function OnboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  const slides: Slide[] = useMemo(
    () => [
      {
        key: 'one',
        image: ONB_1,
        title: 'Answer the Questions',
        text: 'Choose the correct answer from\nthree options. Each correct answer\nbreaks the ice.',
        button: 'Next',
      },
      {
        key: 'two',
        image: ONB_2,
        title: 'Collect and Exchange',
        text: 'Earn ice shards for correct answers.\nExchange them for predictions.',
        button: 'Next',
      },
      {
        key: 'three',
        image: ONB_3,
        title: 'Face the Frozen Trial',
        text: 'Unlock the bonus level.\nOne mistake ends the run.',
        button: 'Start',
      },
    ],
    []
  );

  const slide = slides[index];

  const fade = useRef(new Animated.Value(0)).current;
  const up = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
    fade.setValue(0);
    up.setValue(10);
    scale.setValue(0.985);

    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(up, { toValue: 0, duration: 240, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [index, fade, up, scale]);

  const onNext = () => {
    if (index < 2) setIndex((v) => v + 1);
    else navigation.replace('Home');
  };

  const heroH = IS_TINY
    ? Math.min(420, H * 0.56)
    : IS_SMALL
    ? Math.min(470, H * 0.6)
    : Math.min(540, H * 0.62);

  const cardH = IS_TINY ? 250 : IS_SMALL ? 270 : 295;

  const crownW = IS_TINY ? 34 : 40;
  const crownH = IS_TINY ? 22 : 26;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.root, { paddingTop: Math.max(18, insets.top + 8) }]}>
        <View style={[styles.heroWrap, { height: heroH }]}>
          <Animated.View
            style={{
              opacity: fade,
              transform: [{ translateY: up }, { scale }],
            }}
          >
            <Image source={slide.image} style={styles.heroImage} />
          </Animated.View>
        </View>

        <View
          style={[
            styles.bottomWrap,
            { paddingBottom: Math.max(16, insets.bottom + 12) },
          ]}
        >
          <Animated.View
            style={[
              styles.card,
              {
                height: cardH,
                opacity: fade,
                transform: [{ translateY: up }],
              },
            ]}
          >
            <Image
              source={CROWN}
              style={{
                width: crownW,
                height: crownH,
                resizeMode: 'contain',
                marginBottom: 10,
              }}
            />

            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.text}>{slide.text}</Text>

            <Pressable style={styles.btn} onPress={onNext}>
              <Text style={styles.btnText}>{slide.button}</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  root: { flex: 1 },

  heroWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  heroImage: {
    width: Math.min(520, W * 0.92),
    height: '100%',
    resizeMode: 'contain',
  },

  bottomWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
  },

  card: {
    width: '100%',
    borderRadius: 26,
    backgroundColor: '#4E8FDB',
    paddingTop: IS_TINY ? 16 : 18,
    paddingHorizontal: 18,
    paddingBottom: IS_TINY ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: Platform.OS === 'android' ? -40 : 0,
    marginBottom: Platform.OS === 'android' ? 30 : 0,
  },

  title: {
    color: '#FFFFFF',
    fontSize: IS_TINY ? 22 : 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },

  text: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: IS_TINY ? 14 : 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: IS_TINY ? 19 : 22,
    marginBottom: 0,
  },

  btn: {
    marginTop: IS_TINY ? 20 : 30,
    width: Math.min(300, W * 0.7),
    height: IS_TINY ? 46 : 52,
    borderRadius: 28,
    backgroundColor: '#2C59C8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },

  btnText: {
    color: '#FFD36A',
    fontSize: IS_TINY ? 16 : 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});