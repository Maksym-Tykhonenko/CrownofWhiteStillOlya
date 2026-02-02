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

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 740 || W < 360;
const IS_TINY = H < 690;

const BG = require('../assets/background.png');
const HERO = require('../assets/logo.png');
const CROWN = require('../assets/crown.png');

type BtnProps = {
  title: string;
  onPress: () => void;
  active?: boolean;
};

function MenuButton({ title, onPress, active }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        active && styles.btnActive,
        pressed && { transform: [{ scale: 0.985 }], opacity: 0.95 },
      ]}
    >
      <Text style={[styles.btnText, active && styles.btnTextActive]}>{title}</Text>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeKey, setActiveKey] = useState<'start' | 'trial' | 'exchange' | 'collection'>('start');

  const heroIn = useRef(new Animated.Value(0)).current;
  const cardIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroIn, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(cardIn, { toValue: 1, duration: 520, useNativeDriver: true }),
    ]).start();
  }, [heroIn, cardIn]);

  const heroStyle = useMemo(
    () => ({
      opacity: heroIn,
      transform: [
        {
          translateY: heroIn.interpolate({
            inputRange: [0, 1],
            outputRange: [12, 0],
          }),
        },
        {
          scale: heroIn.interpolate({
            inputRange: [0, 1],
            outputRange: [0.985, 1],
          }),
        },
      ],
    }),
    [heroIn]
  );

  const cardStyle = useMemo(
    () => ({
      opacity: cardIn,
      transform: [
        {
          translateY: cardIn.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 0],
          }),
        },
      ],
    }),
    [cardIn]
  );

  const heroW = IS_TINY
    ? Math.min(280, W * 0.78)
    : IS_SMALL
    ? Math.min(320, W * 0.8)
    : Math.min(380, W * 0.82);

  const heroH = IS_TINY ? 240 : IS_SMALL ? 275 : 320;

  const cardW = Math.min(420, W * 0.9);
  const cardH = IS_TINY ? 285 : IS_SMALL ? 315 : 350;

  const crownW = IS_TINY ? 32 : 38;
  const crownH = IS_TINY ? 20 : 24;

  const press = (key: typeof activeKey, go: () => void) => {
    setActiveKey(key);
    requestAnimationFrame(() => {
      setTimeout(go, 90);
    });
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View
        style={[
          styles.root,
          {
            paddingTop: Math.max(14, insets.top + 6),
            paddingBottom: Math.max(14, insets.bottom + 10),
          },
        ]}
      >
        <View style={styles.topWrap}>
          <Animated.View style={heroStyle}>
            <Image source={HERO} style={{ width: heroW, height: heroH, resizeMode: 'contain' }} />
          </Animated.View>
        </View>

        <View style={styles.bottomWrap}>
          <Animated.View style={[styles.card, { width: cardW, height: cardH }, cardStyle]}>
            <Image
              source={CROWN}
              style={{
                width: crownW,
                height: crownH,
                resizeMode: 'contain',
                marginBottom: IS_TINY ? 8 : 10,
              }}
            />

            <View style={styles.buttonsNoBottom}>
              <MenuButton
                title="Start game"
                active={activeKey === 'start'}
                onPress={() => press('start', () => navigation.navigate('StartGame'))}
              />
              <MenuButton
                title="Frozen trial"
                active={activeKey === 'trial'}
                onPress={() => press('trial', () => navigation.navigate('FrozenTrial'))}
              />
              <MenuButton
                title="Ice Exchange"
                active={activeKey === 'exchange'}
                onPress={() => press('exchange', () => navigation.navigate('IceExchange'))}
              />
              <MenuButton
                title="Collection"
                active={activeKey === 'collection'}
                onPress={() => press('collection', () => navigation.navigate('Collection'))}
              />
            </View>
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  root: { flex: 1, alignItems: 'center' },

  topWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  bottomWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    marginBottom: Platform.OS === 'android' ? 20 : 0,
  },

  card: {
    borderRadius: 26,
    backgroundColor: '#4e90db0a',
    paddingTop: IS_TINY ? 16 : 18,
    paddingHorizontal: 18,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  buttonsNoBottom: {
    width: '100%',
    gap: IS_TINY ? 10 : 12,
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? -40 : -10,
  },

  btn: {
    width: '92%',
    height: IS_TINY ? 52 : 58,
    borderRadius: 28,
    backgroundColor: '#2C59C8',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnActive: {
    borderColor: '#FFD36A',
    borderWidth: 2,
    backgroundColor: '#2E63E0',
    shadowColor: '#FFD36A',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  btnText: {
    color: '#FFD36A',
    fontSize: IS_TINY ? 18 : 20,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  btnTextActive: {
    color: '#FFE08A',
  },
});