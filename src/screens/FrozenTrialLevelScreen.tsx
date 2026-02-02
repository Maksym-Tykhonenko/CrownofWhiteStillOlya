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

type Props = NativeStackScreenProps<RootStackParamList, 'FrozenTrialLevel'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 720;
const IS_VERY_TINY = H < 670;
const IS_NARROW = W < 360;

const BG = require('../assets/background1.png');
const CROWN = require('../assets/crown.png');

const TOP_FISH = require('../assets/trial_fish.png');
const TOP_NET = require('../assets/trial_net.png');
const TOP_NET_BROKEN = require('../assets/trial_net_broken.png');
const TOP_FISH_CAUGHT = require('../assets/trial_fish_caught.png');

type AnswerIndex = 0 | 1 | 2;
type ResultState = 'none' | 'defeat' | 'victory';

const KEY_UNLOCKED = 'frozen_trial_unlocked_level_v1';
const KEY_COINS = 'tugriks_v1';
const KEY_BONUS_UNLOCKED = 'frozen_trial_bonus_unlocked_v1';

export default function FrozenTrialLevelScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const levelId = route.params?.levelId ?? 1;

  const screenIn = useRef(new Animated.Value(0)).current;
  const topIn = useRef(new Animated.Value(0)).current;

  const contentSwap = useRef(new Animated.Value(1)).current;
  const caughtPulse = useRef(new Animated.Value(0)).current;
  const resultIn = useRef(new Animated.Value(0)).current;

  const level = useMemo(() => {
    return FROZEN_TRIAL_LEVELS.find((l) => l.id === levelId) ?? FROZEN_TRIAL_LEVELS[0];
  }, [levelId]);

  const questions = level?.questions ?? [];
  const total = questions.length || 5;

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [showCaught, setShowCaught] = useState(false);
  const [result, setResult] = useState<ResultState>('none');

  useEffect(() => {
    setIndex(0);
    setPicked(null);
    setLocked(false);
    setShowCaught(false);
    setResult('none');

    screenIn.setValue(0);
    topIn.setValue(0);
    contentSwap.setValue(1);
    caughtPulse.setValue(0);
    resultIn.setValue(0);

    Animated.parallel([
      Animated.timing(screenIn, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(topIn, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [levelId, screenIn, topIn, contentSwap, caughtPulse, resultIn]);

  useEffect(() => {
    if (result === 'none') {
      resultIn.setValue(0);
      return;
    }
    resultIn.setValue(0);
    Animated.timing(resultIn, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [result, resultIn]);

  const current = questions[Math.min(index, Math.max(0, total - 1))] ?? null;

  const questionText = current?.q ?? 'Question';
  const options = current?.options ?? ['Option 1', 'Option 2', 'Option 3'];
  const correctIndex: AnswerIndex = (current?.correctIndex ?? 0) as AnswerIndex;

  const topPad = Math.max(10, insets.top + 6);
  const bottomPad = Math.max(10, insets.bottom + 10);

  const cardW = Math.min(460, W * 0.92);
  const cardHBase = H * (IS_VERY_TINY ? 0.44 : IS_TINY ? 0.46 : 0.48);
  const cardH = Math.min(cardHBase, IS_VERY_TINY ? 360 : 410);

  const titleSize = IS_VERY_TINY ? 16 : 18;
  const qSize = IS_VERY_TINY ? 12 : 13;

  const answerH = IS_VERY_TINY ? 46 : 52;
  const answerTxt = IS_VERY_TINY ? 14 : 15;

  const crownW = IS_VERY_TINY ? 28 : 34;
  const crownH = IS_VERY_TINY ? 18 : 22;

  const sceneTop = topPad + (IS_VERY_TINY ? 24 : 34);
  const sceneH = IS_VERY_TINY ? 200 : 220;

  const netW = IS_VERY_TINY ? 58 : 64;
  const netH = IS_VERY_TINY ? 74 : 82;
  const netGap = IS_VERY_TINY ? 12 : 14;

  const netsTotalW = total * netW + (total - 1) * netGap;
  const netsLeft = Math.max(12, (W - netsTotalW) / 2);

  const fishW = IS_VERY_TINY ? 84 : 92;
  const fishH = IS_VERY_TINY ? 56 : 62;

  const fishX = useMemo(() => {
    const maxStep = Math.max(0, total - 1);
    const stepIndex = Math.min(index, maxStep);
    const targetNetX = netsLeft + stepIndex * (netW + netGap);
    return Math.max(10, targetNetX - fishW * 0.7);
  }, [index, total, netsLeft, netW, netGap, fishW]);

  const showResult = result !== 'none';

  const animateContentSwap = () => {
    contentSwap.setValue(0);
    Animated.timing(contentSwap, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const awardAfterVictory = async () => {
    const u = await AsyncStorage.getItem(KEY_UNLOCKED);
    const unlockedNow = u ? parseInt(u, 10) : 1;
    const safeUnlocked = Number.isFinite(unlockedNow) ? Math.max(1, unlockedNow) : 1;

    const nextUnlock = Math.max(safeUnlocked, levelId + 1);
    await AsyncStorage.setItem(KEY_UNLOCKED, String(nextUnlock));

    const c = await AsyncStorage.getItem(KEY_COINS);
    const coinsNow = c ? parseInt(c, 10) : 0;
    const safeCoins = Number.isFinite(coinsNow) ? Math.max(0, coinsNow) : 0;

    const rewardForLevel = 1;
    await AsyncStorage.setItem(KEY_COINS, String(safeCoins + rewardForLevel));

    if (levelId >= 5) {
      await AsyncStorage.setItem(KEY_BONUS_UNLOCKED, '1');
    }
  };

  const restartLevel = () => {
    setIndex(0);
    setPicked(null);
    setLocked(false);
    setShowCaught(false);
    setResult('none');
    animateContentSwap();
  };

  const goHome = () => navigation.navigate('Home');

  const startNextLevel = () => {
    const nextLevelId = levelId + 1;
    const exists = FROZEN_TRIAL_LEVELS.some((l) => l.id === nextLevelId);
    if (!exists) {
      goHome();
      return;
    }
    navigation.replace('FrozenTrialLevel', { levelId: nextLevelId });
  };

  const onPick = (i: AnswerIndex) => {
    if (locked || showCaught || showResult) return;

    setPicked(i);
    setLocked(true);

    const ok = i === correctIndex;

    setTimeout(() => {
      if (!ok) {
        setShowCaught(true);
        setResult('defeat');
        animateContentSwap();

        caughtPulse.setValue(0);
        Animated.timing(caughtPulse, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();

        return;
      }

      const nextIndex = index + 1;
      const finished = nextIndex >= total;

      if (finished) {
        (async () => {
          await awardAfterVictory();
          setResult('victory');
          animateContentSwap();
        })();
        return;
      }

      setIndex(nextIndex);
      setPicked(null);
      setLocked(false);
      animateContentSwap();
    }, 420);
  };

  const headerTitle =
    result === 'defeat' ? 'Defeat' : result === 'victory' ? 'Victory' : `Question ${index + 1}`;

  const headerSub =
    result === 'defeat'
      ? 'Try again'
      : result === 'victory'
      ? 'You have completed this level, move\non to the next one?'
      : questionText;

  const screenStyle = {
    opacity: screenIn,
    transform: [
      {
        translateY: screenIn.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  } as const;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <Animated.View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }, screenStyle]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backBtn,
            { top: topPad + 22 },
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.95 },
          ]}
          hitSlop={12}
        >
          <Text style={styles.backTxt}>{'‹'}</Text>
        </Pressable>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.topScene,
            {
              top: sceneTop + 60,
              height: sceneH,
              opacity: topIn,
              transform: [{ translateY: topIn.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
            },
          ]}
        >
          {!showCaught ? (
            <>
              <Image source={TOP_FISH} style={[styles.fish, { width: fishW, height: fishH, left: fishX }]} />
              {Array.from({ length: total }).map((_, ni) => {
                const left = netsLeft + ni * (netW + netGap);
                const broken = ni < index;

                return (
                  <Image
                    key={`net-${ni}`}
                    source={broken ? TOP_NET_BROKEN : TOP_NET}
                    style={[
                      styles.net,
                      { left, width: netW, height: netH, opacity: broken ? 0.95 : 0.9 },
                    ]}
                  />
                );
              })}
            </>
          ) : (
            <Animated.View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: caughtPulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                transform: [{ scale: caughtPulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
              }}
            >
              <Image
                source={TOP_FISH_CAUGHT}
                style={[styles.caughtFish, { width: IS_VERY_TINY ? 98 : 108, height: IS_VERY_TINY ? 78 : 86 }]}
              />
            </Animated.View>
          )}
        </Animated.View>

        <View style={{ flex: 1 }} />

        <View 
          style={[
            styles.card, 
            { width: cardW, height: cardH, paddingTop: IS_VERY_TINY ? 12 : 16 },
            Platform.OS === 'android' && { marginBottom: 30 }
          ]}
        >
          <Image source={CROWN} style={[styles.crown, { width: crownW, height: crownH }]} />

          <Animated.View
            style={{
              width: '100%',
              alignItems: 'center',
              opacity: contentSwap,
              transform: [{ translateY: contentSwap.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            }}
          >
            <Text style={[styles.title, { fontSize: result === 'none' ? titleSize : IS_VERY_TINY ? 20 : 22 }]}>
              {headerTitle}
            </Text>

            <Text
              style={[
                styles.qText,
                {
                  fontSize: result === 'none' ? qSize : 14,
                  lineHeight: result === 'none' ? qSize + 5 : 20,
                  marginBottom: result === 'none' ? 12 : 18,
                  paddingHorizontal: IS_NARROW ? 2 : 6,
                },
              ]}
            >
              {headerSub}
            </Text>

            {result === 'none' && (
              <ScrollView
                style={{ width: '100%' }}
                contentContainerStyle={{ paddingBottom: 6 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={[styles.answers, { gap: IS_VERY_TINY ? 10 : 12 }]}>
                  {options.map((label, ai) => {
                    const isPicked = picked === ai;
                    const isCorrect = locked && ai === correctIndex;
                    const isWrongPicked = locked && isPicked && ai !== correctIndex;

                    return (
                      <Pressable
                        key={`${ai}-${label}`}
                        onPress={() => onPick(ai as AnswerIndex)}
                        disabled={locked || showCaught}
                        style={({ pressed }) => [
                          styles.answerBtn,
                          { height: answerH, borderRadius: answerH / 2 },
                          pressed && !locked && !showCaught && { transform: [{ scale: 0.99 }], opacity: 0.96 },
                          isPicked && styles.answerPicked,
                          isCorrect && styles.answerCorrect,
                          isWrongPicked && styles.answerWrong,
                        ]}
                      >
                        <Text style={[styles.answerTxt, { fontSize: answerTxt }]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {result !== 'none' && (
              <Animated.View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  opacity: resultIn,
                  transform: [{ translateY: resultIn.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
                }}
              >
                <Pressable
                  onPress={result === 'defeat' ? restartLevel : startNextLevel}
                  style={({ pressed }) => [
                    styles.bigBtn,
                    { width: '82%', height: IS_VERY_TINY ? 52 : 56 },
                    pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] },
                  ]}
                >
                  <Text style={[styles.bigBtnTxt, { fontSize: IS_VERY_TINY ? 16 : 18 }]}>
                    {result === 'defeat' ? `Restart Level ${levelId}` : `Start Level ${levelId + 1}`}
                  </Text>
                </Pressable>

                <View style={{ height: 14 }} />

                <Pressable
                  onPress={goHome}
                  style={({ pressed }) => [
                    styles.smallBtn,
                    { width: IS_VERY_TINY ? '50%' : '44%', height: IS_VERY_TINY ? 42 : 44 },
                    pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] },
                  ]}
                >
                  <Text style={styles.smallBtnTxt}>Back home</Text>
                </Pressable>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </Animated.View>
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

  topScene: { position: 'absolute', left: 0, right: 0 },

  fish: { position: 'absolute', bottom: 42, resizeMode: 'contain', opacity: 0.95 },

  net: { position: 'absolute', top: 22, resizeMode: 'contain' },

  caughtFish: { resizeMode: 'contain', opacity: 0.98 },

  card: {
    borderRadius: 28,
    backgroundColor: 'rgba(78,144,219,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    paddingHorizontal: 18,
    paddingBottom: 14,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: IS_TINY ? 2 : 6,
  },

  crown: { resizeMode: 'contain', marginBottom: 10, opacity: 0.95 },

  title: { color: '#fff', fontWeight: '900', marginBottom: 8, textAlign: 'center' },

  qText: { color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

  answers: { width: '100%' },

  answerBtn: {
    backgroundColor: '#2C59C8',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  answerTxt: { color: '#fff', fontWeight: '800' },

  answerPicked: { borderColor: '#FFD36A', borderWidth: 2 },

  answerCorrect: {
    backgroundColor: 'rgba(70, 200, 170, 0.55)',
    borderColor: 'rgba(255,255,255,0.9)',
  },

  answerWrong: {
    backgroundColor: 'rgba(160, 90, 140, 0.55)',
    borderColor: 'rgba(255,255,255,0.8)',
  },

  bigBtn: {
    borderRadius: 28,
    backgroundColor: 'rgba(44,89,200,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigBtnTxt: { color: '#FFD36A', fontWeight: '900' },

  smallBtn: {
    borderRadius: 22,
    backgroundColor: 'rgba(44,89,200,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnTxt: { color: 'rgba(255,255,255,0.85)', fontWeight: '800', fontSize: 14 },
});