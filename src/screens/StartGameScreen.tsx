import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform, 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { FROZEN_TRIAL_LEVELS } from '../data/frozenTrial';

type Props = NativeStackScreenProps<RootStackParamList, 'StartGame'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 740 || W < 360;
const IS_TINY = H < 690;
const IS_VERY_TINY = H < 640;

const BG = require('../assets/background1.png');
const HERO = require('../assets/onboard_2.png');
const CROWN = require('../assets/crown.png');

const KEY_UNLOCKED = 'frozen_trial_unlocked_level_v1';
const KEY_COINS = 'tugriks_v1';

export default function StartGameScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState(1);
  const [coins, setCoins] = useState(0);

  const scrollRef = useRef<ScrollView>(null);

  const heroIn = useRef(new Animated.Value(0)).current;
  const cardIn = useRef(new Animated.Value(0)).current;
  const listIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    heroIn.setValue(0);
    cardIn.setValue(0);
    listIn.setValue(0);

    Animated.sequence([
      Animated.timing(heroIn, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(cardIn, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(listIn, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [heroIn, cardIn, listIn]);

  useEffect(() => {
    const load = async () => {
      const u = await AsyncStorage.getItem(KEY_UNLOCKED);
      const c = await AsyncStorage.getItem(KEY_COINS);

      const uu = u ? parseInt(u, 10) : 1;
      const cc = c ? parseInt(c, 10) : 0;

      setUnlocked(Number.isFinite(uu) ? Math.max(1, uu) : 1);
      setCoins(Number.isFinite(cc) ? Math.max(0, cc) : 0);

      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
    };

    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation]);

  const topPad = Math.max(10, insets.top + 6);
  const bottomPad = Math.max(10, insets.bottom + 10);

  const heroW = IS_VERY_TINY
    ? Math.min(280, W * 0.84)
    : IS_TINY
    ? Math.min(305, W * 0.86)
    : IS_SMALL
    ? Math.min(335, W * 0.9)
    : Math.min(385, W * 0.92);

  const heroH = IS_VERY_TINY ? 320 : IS_TINY ? 350 : IS_SMALL ? 410 : 470;

  const cardW = Math.min(440, W * 0.92);
  const baseCardH = Math.min(
    H * (IS_VERY_TINY ? 0.44 : IS_TINY ? 0.46 : 0.48),
    IS_VERY_TINY ? 360 : IS_TINY ? 395 : 430
  );
  const cardH = Platform.OS === 'android' ? baseCardH - 20 : baseCardH;

  const heroShiftDown = 80;

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
            outputRange: [18, 0],
          }),
        },
      ],
    }),
    [cardIn]
  );

  const listStyle = useMemo(
    () => ({
      opacity: listIn,
      transform: [
        {
          translateY: listIn.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          }),
        },
      ],
    }),
    [listIn]
  );

  const titleSize = IS_VERY_TINY ? 17 : 18;
  const subSize = IS_VERY_TINY ? 11 : 12;

  const goLevel = (levelId: number, locked: boolean) => {
    if (locked) return;
    navigation.navigate('FrozenTrialLevel', { levelId });
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backBtn,
            { top: topPad + 30 },
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.95 },
          ]}
          hitSlop={12}
        >
          <Text style={styles.backTxt}>{'‹'}</Text>
        </Pressable>

        <Animated.View style={[styles.heroWrap, heroStyle]}>
          <Image
            source={HERO}
            style={{
              width: heroW,
              height: heroH,
              resizeMode: 'contain',
              marginTop: heroShiftDown,
            }}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.card, 
            { width: cardW, height: cardH }, 
            Platform.OS === 'android' && { marginBottom: 40 },
            cardStyle
          ]}
        >
          <Image source={CROWN} style={styles.crown} />

          <Text style={[styles.title, { fontSize: titleSize }]}>Levels</Text>
          <Text style={[styles.sub, { fontSize: subSize, lineHeight: subSize + 4 }]}>
            Help her swim free.{'\n'}Break the nets with correct answers.
          </Text>

          <View style={styles.coinsRow}>
            <Text style={styles.coinsTxt}>Tugriks:</Text>
            <Text style={styles.coinsVal}>{coins}</Text>
          </View>

          <Animated.View style={[styles.listWrap, listStyle]}>
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.listContent}
            >
              {FROZEN_TRIAL_LEVELS.map((lv) => {
                const locked = lv.id > unlocked;

                return (
                  <Pressable
                    key={lv.id}
                    onPress={() => goLevel(lv.id, locked)}
                    style={({ pressed }) => [
                      styles.levelBtn,
                      locked && styles.levelBtnLocked,
                      pressed && !locked && { transform: [{ scale: 0.985 }], opacity: 0.96 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.levelBtnText,
                        IS_VERY_TINY && { fontSize: 16 },
                        locked && styles.levelBtnTextLocked,
                      ]}
                    >
                      {`Start Level ${lv.id}`}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  root: { flex: 1, alignItems: 'center' },

  backBtn: {
    position: 'absolute',
    left: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD36A',
    backgroundColor: 'rgba(44,89,200,0.45)',
    zIndex: 20,
  },
  backTxt: { color: '#FFD36A', fontSize: 28, fontWeight: '900', marginTop: -2 },

  heroWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
  },

  card: {
    borderRadius: 28,
    backgroundColor: 'rgba(78,144,219,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    paddingTop: IS_VERY_TINY ? 12 : IS_TINY ? 14 : 16,
    paddingHorizontal: 18,
    paddingBottom: IS_VERY_TINY ? 12 : IS_TINY ? 14 : 16,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: IS_TINY ? 2 : 6, 
  },

  crown: {
    width: IS_TINY ? 30 : 34,
    height: IS_TINY ? 20 : 22,
    resizeMode: 'contain',
    marginBottom: IS_VERY_TINY ? 6 : 8,
    opacity: 0.95,
  },

  title: { color: '#FFFFFF', fontWeight: '900', marginBottom: 6 },
  sub: { color: 'rgba(255,255,255,0.80)', textAlign: 'center', marginBottom: 10 },

  coinsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: IS_VERY_TINY ? 8 : 10 },
  coinsTxt: { color: 'rgba(255,255,255,0.85)', fontWeight: '800', fontSize: 14 },
  coinsVal: { color: '#FFD36A', fontWeight: '900', fontSize: 16 },

  listWrap: { width: '100%', flex: 1 },
  listContent: { paddingBottom: 6, gap: IS_VERY_TINY ? 10 : 12 },

  levelBtn: {
    height: IS_VERY_TINY ? 48 : 52,
    borderRadius: 28,
    backgroundColor: '#2C59C8',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBtnText: { color: '#FFD36A', fontWeight: '900', fontSize: 18 },

  levelBtnLocked: {
    backgroundColor: 'rgba(44,89,200,0.40)',
    borderColor: 'rgba(255,255,255,0.30)',
  },
  levelBtnTextLocked: { color: 'rgba(255,211,106,0.45)' },
});