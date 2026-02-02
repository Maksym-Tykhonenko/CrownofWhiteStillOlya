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
import { FROZEN_TRIAL_FINAL_10, type FinalTrialQuestion } from '../data/frozenTrialFinal';

type Props = NativeStackScreenProps<RootStackParamList, 'FrozenTrial'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 760 || W < 360;
const IS_TINY = H < 700;
const IS_VERY_TINY = H < 640;

const BG = require('../assets/background1.png');
const HERO = require('../assets/onboard_1.png');
const CROWN = require('../assets/crown.png');

type AnswerIndex = 0 | 1 | 2;
type ResultState = 'none' | 'defeat' | 'victory';

const KEY_COINS = 'tugriks_v1';
const KEY_BONUS_UNLOCKED = 'frozen_trial_bonus_unlocked_v1';
const KEY_BONUS_COMPLETED = 'frozen_trial_bonus_completed_v1';

export default function FrozenTrialScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const appear = useRef(new Animated.Value(0)).current;
  const heroIn = useRef(new Animated.Value(0)).current;
  const cardIn = useRef(new Animated.Value(0)).current;
  const contentIn = useRef(new Animated.Value(0)).current;
  const resultIn = useRef(new Animated.Value(0)).current;

  const questions = useMemo<FinalTrialQuestion[]>(
    () => (Array.isArray(FROZEN_TRIAL_FINAL_10) ? FROZEN_TRIAL_FINAL_10 : []),
    []
  );

  const total = questions.length || 10;

  const [coins, setCoins] = useState(0);
  const [bonusUnlocked, setBonusUnlocked] = useState(false);
  const [bonusCompleted, setBonusCompleted] = useState(false);
  const [mode, setMode] = useState<'gate' | 'play'>('gate');

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<ResultState>('none');

  const topPad = Math.max(10, insets.top + 6);
  const bottomPad = Math.max(10, insets.bottom + 12);

  const current = questions[Math.min(index, Math.max(0, total - 1))];
  const qText = current?.text ?? 'Question';
  const options =
    current?.answers ?? (['Option 1', 'Option 2', 'Option 3'] as [string, string, string]);
  const correctIndex: AnswerIndex = (current?.correct ?? 0) as AnswerIndex;

  const heroW = IS_VERY_TINY
    ? Math.min(290, W * 0.84)
    : IS_TINY
    ? Math.min(320, W * 0.86)
    : IS_SMALL
    ? Math.min(350, W * 0.9)
    : Math.min(400, W * 0.92);

  const heroH = IS_VERY_TINY ? 320 : IS_TINY ? 350 : IS_SMALL ? 410 : 470;

  const cardW = Math.min(460, W * 0.92);

  const baseCardH = Math.min(
    H * (IS_VERY_TINY ? 0.50 : IS_TINY ? 0.52 : IS_SMALL ? 0.54 : 0.56),
    IS_VERY_TINY ? 390 : IS_TINY ? 420 : 460
  );
  const cardH = baseCardH - 30;

  const loadState = async () => {
    const c = await AsyncStorage.getItem(KEY_COINS);
    const cc = c ? parseInt(c, 10) : 0;
    setCoins(Number.isFinite(cc) ? Math.max(0, cc) : 0);

    const u = await AsyncStorage.getItem(KEY_BONUS_UNLOCKED);
    setBonusUnlocked(u === '1');

    const done = await AsyncStorage.getItem(KEY_BONUS_COMPLETED);
    setBonusCompleted(done === '1');

    setMode('gate');
    resetQuizOnly();
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadState);
    loadState();
    return unsub;
  }, [navigation]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(appear, { toValue: 1, duration: 520, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(heroIn, { toValue: 1, duration: 520, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(cardIn, { toValue: 1, duration: 520, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(contentIn, { toValue: 1, duration: 520, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, []);

  useEffect(() => {
    if (result !== 'none') {
      resultIn.setValue(0);
      Animated.timing(resultIn, { toValue: 1, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
    }
  }, [result]);

  const resetQuizOnly = () => {
    setIndex(0);
    setPicked(null);
    setLocked(false);
    setResult('none');
  };

  const goHome = () => navigation.navigate('Home' as never);

  const startBonus = () => {
    if (!bonusUnlocked || bonusCompleted) return;
    resetQuizOnly();
    setMode('play');
    contentIn.setValue(0);
    Animated.timing(contentIn, { toValue: 1, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
  };

  const giveRewardOnce = async () => {
    if (bonusCompleted) return;
    const c = await AsyncStorage.getItem(KEY_COINS);
    const cc = c ? parseInt(c, 10) : 0;
    const next = cc + 5;
    await AsyncStorage.setItem(KEY_COINS, String(next));
    await AsyncStorage.setItem(KEY_BONUS_COMPLETED, '1');
    setCoins(next);
    setBonusCompleted(true);
  };

  const onPick = (i: AnswerIndex) => {
    if (locked || result !== 'none') return;
    setPicked(i);
    setLocked(true);
    const ok = i === correctIndex;

    setTimeout(async () => {
      if (!ok) {
        setResult('defeat');
        return;
      }
      const nextIndex = index + 1;
      if (nextIndex >= total) {
        setResult('victory');
        await giveRewardOnce();
        return;
      }
      setIndex(nextIndex);
      setPicked(null);
      setLocked(false);
      contentIn.setValue(0);
      Animated.timing(contentIn, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }, 420);
  };

  const headerTitle = result === 'defeat' ? 'Defeat' : result === 'victory' ? 'Victory' : `Question ${index + 1}`;
  const headerSub = result === 'defeat' ? 'Do you want to try again?' : result === 'victory' ? 'Thank you, you deserve this award.' : qText;
  const gateButtonText = !bonusUnlocked ? 'Available from level 5' : bonusCompleted ? 'Completed' : 'Start Frozen trial';
  const gateDisabled = !bonusUnlocked || bonusCompleted;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <Animated.View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad, opacity: appear, transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.backBtn, { top: topPad + 18 }, pressed && { transform: [{ scale: 0.97 }], opacity: 0.95 }]} hitSlop={12}>
          <Text style={styles.backTxt}>{'‹'}</Text>
        </Pressable>

        <Animated.View style={[styles.heroWrap, { opacity: heroIn, transform: [{ translateY: heroIn.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }, { scale: heroIn.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) }] }]}>
          <Image source={HERO} style={{ width: heroW, height: heroH, resizeMode: 'contain', marginTop: IS_VERY_TINY ? 70 : 80 }} />
        </Animated.View>

        <Animated.View 
          style={[
            styles.card, 
            { width: cardW, height: cardH }, 
            { opacity: cardIn, transform: [{ translateY: cardIn.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] },
            Platform.OS === 'android' && { marginBottom: 50 }
          ]}
        >
          <Image source={CROWN} style={styles.crown} />

          {mode === 'gate' && (
            <>
              <Text style={[styles.title, { fontSize: IS_VERY_TINY ? 18 : 20 }]}>Frozen trial</Text>
              <Text style={[styles.qText, { fontSize: IS_VERY_TINY ? 12 : 13, lineHeight: IS_VERY_TINY ? 17 : 18 }]}>
                Bonus level.{'\n'}Unlocks after completing level 5.{'\n'}Reward: +5 Tugriks.
              </Text>
              <View style={styles.coinsRow}>
                <Text style={styles.coinsTxt}>Tugriks:</Text>
                <Text style={styles.coinsVal}>{coins}</Text>
              </View>
              <Pressable onPress={startBonus} disabled={gateDisabled} style={({ pressed }) => [styles.bigBtn, gateDisabled && styles.bigBtnDisabled, pressed && !gateDisabled && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}>
                <Text style={[styles.bigBtnTxt, gateDisabled && styles.bigBtnTxtDisabled]}>{gateButtonText}</Text>
              </Pressable>
              <View style={{ height: 14 }} />
              <Pressable onPress={goHome} style={({ pressed }) => [styles.smallBtn, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}><Text style={styles.smallBtnTxt}>Back home</Text></Pressable>
            </>
          )}

          {mode === 'play' && (
            <Animated.View style={{ width: '100%', alignItems: 'center', opacity: contentIn, transform: [{ translateY: contentIn.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
              <Text style={[styles.title, { fontSize: result === 'none' ? (IS_VERY_TINY ? 17 : 18) : 22 }]}>{headerTitle}</Text>
              <Text style={[styles.qText, { fontSize: result === 'none' ? (IS_VERY_TINY ? 12 : 13) : 14, marginBottom: result === 'none' ? 12 : 18 }]}>{headerSub}</Text>
              {result === 'none' && (
                <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 6 }} showsVerticalScrollIndicator={false} bounces={false}>
                  <View style={[styles.answers, { gap: IS_VERY_TINY ? 10 : 12 }]}>
                    {options.map((label, ai) => (
                      <Pressable key={`${ai}-${label}`} onPress={() => onPick(ai as AnswerIndex)} disabled={locked} style={({ pressed }) => [styles.answerBtn, { height: IS_VERY_TINY ? 46 : 52, borderRadius: 26 }, pressed && !locked && { transform: [{ scale: 0.99 }], opacity: 0.96 }, picked === ai && styles.answerPicked, locked && ai === correctIndex && styles.answerCorrect, locked && picked === ai && ai !== correctIndex && styles.answerWrong]}>
                        <Text style={[styles.answerTxt, { fontSize: IS_VERY_TINY ? 14 : 15 }]}>{label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              )}
              {result !== 'none' && (
                <Animated.View style={{ width: '100%', alignItems: 'center', opacity: resultIn, transform: [{ translateY: resultIn.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
                  <Pressable onPress={result === 'defeat' ? startBonus : () => setMode('gate')} style={({ pressed }) => [styles.bigBtn, { width: '82%', height: IS_VERY_TINY ? 52 : 56 }, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}><Text style={[styles.bigBtnTxt, { fontSize: IS_VERY_TINY ? 16 : 18 }]}>{result === 'defeat' ? 'Restart Frozen trial' : 'Back to Frozen trial'}</Text></Pressable>
                  <View style={{ height: 14 }} /><Pressable onPress={goHome} style={({ pressed }) => [styles.smallBtn, { width: IS_VERY_TINY ? '50%' : '44%', height: IS_VERY_TINY ? 42 : 44 }, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}><Text style={styles.smallBtnTxt}>Back home</Text></Pressable>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  root: { flex: 1, alignItems: 'center' },
  backBtn: { position: 'absolute', left: 14, width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFD36A', backgroundColor: 'rgba(44,89,200,0.45)', zIndex: 20 },
  backTxt: { color: '#FFD36A', fontSize: 28, fontWeight: '900', marginTop: -2 },
  heroWrap: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 12 },
  card: { borderRadius: 28, backgroundColor: 'rgba(78,144,219,0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)', paddingTop: 14, paddingHorizontal: 18, paddingBottom: 16, alignItems: 'center', overflow: 'hidden', marginBottom: 6 },
  crown: { width: 34, height: 22, resizeMode: 'contain', marginBottom: 10, opacity: 0.95 },
  title: { color: '#fff', fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  qText: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', paddingHorizontal: 6, marginBottom: 12 },
  coinsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  coinsTxt: { color: 'rgba(255,255,255,0.85)', fontWeight: '800', fontSize: 14 },
  coinsVal: { color: '#FFD36A', fontWeight: '900', fontSize: 16 },
  answers: { width: '100%' },
  answerBtn: { backgroundColor: '#2C59C8', borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  answerTxt: { color: '#fff', fontWeight: '800' },
  answerPicked: { borderColor: '#FFD36A', borderWidth: 2 },
  answerCorrect: { backgroundColor: 'rgba(70, 200, 170, 0.55)', borderColor: 'rgba(255,255,255,0.9)' },
  answerWrong: { backgroundColor: 'rgba(160, 90, 140, 0.55)', borderColor: 'rgba(255,255,255,0.8)' },
  bigBtn: { width: '82%', height: 56, borderRadius: 28, backgroundColor: 'rgba(44,89,200,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  bigBtnTxt: { color: '#FFD36A', fontWeight: '900', fontSize: 18 },
  bigBtnDisabled: { backgroundColor: 'rgba(44,89,200,0.35)', borderColor: 'rgba(255,255,255,0.30)' },
  bigBtnTxtDisabled: { color: 'rgba(255,211,106,0.45)' },
  smallBtn: { width: '44%', height: 44, borderRadius: 22, backgroundColor: 'rgba(44,89,200,0.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.40)', alignItems: 'center', justifyContent: 'center' },
  smallBtnTxt: { color: 'rgba(255,255,255,0.85)', fontWeight: '800', fontSize: 14 },
});