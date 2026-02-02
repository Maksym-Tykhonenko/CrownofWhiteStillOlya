import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'IceExchange'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 700;
const IS_VERY_TINY = H < 640;

const BG = require('../assets/background1.png');
const HERO = require('../assets/exchanger_ball.png'); 
const COIN = require('../assets/coin.png'); 
const KEY_COINS = 'tugriks_v1';
const KEY_OWNED_PREDICTIONS = 'ice_predictions_owned_v1';

const PREDICTIONS: string[] = [
  'What moves slowly lasts longer.',
  'The quiet choice is often the correct one.',
  'Not every pause is a delay.',
  'What is beneath the surface matters more than what is seen.',
  'Patience reveals paths others miss.',
  'A steady mind breaks fewer nets.',
  'The cold does not hurry — neither should you.',
  'Progress comes from consistency, not force.',
  'Silence sharpens attention.',
  'A single clear answer outweighs many guesses.',
  'What you skip today may return stronger tomorrow.',
  'The ice remembers careful steps.',
  'Focus travels farther than speed.',
  'Some obstacles exist only to slow reckless motion.',
  'Calm decisions leave fewer traces.',
  'Depth is reached by those who wait.',
  'Every choice leaves the water clearer or darker.',
  'The surface lies more often than the depths.',
  'A measured path avoids unnecessary struggle.',
  'The still moment is part of the journey.',
  'Precision saves more energy than strength.',
  'What is rushed is easily caught.',
  'Cold clarity reveals weak assumptions.',
  'The quiet mind moves unseen.',
  'What endures does not rush forward.',
];

const pickRandomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export default function IceExchangeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [coins, setCoins] = useState(0);
  const [ownedCount, setOwnedCount] = useState(0);
  const [mode, setMode] = useState<'exchange' | 'prediction'>('exchange');
  const [currentPrediction, setCurrentPrediction] = useState<string>('');

  const topPad = Math.max(10, insets.top + 6);
  const bottomPad = Math.max(10, insets.bottom + 12);

  const heroW = IS_VERY_TINY
    ? Math.min(260, W * 0.82)
    : IS_TINY
    ? Math.min(290, W * 0.84)
    : Math.min(320, W * 0.86);

  const heroH = IS_VERY_TINY ? 280 : IS_TINY ? 310 : 340;
  const cardW = Math.min(460, W * 0.92);
  const baseCardH = Math.min(
    H * (IS_VERY_TINY ? 0.42 : IS_TINY ? 0.44 : 0.46), 
    IS_VERY_TINY ? 300 : IS_TINY ? 330 : 360
  );
  const cardH = baseCardH - 40;

  const titleSize = IS_VERY_TINY ? 18 : 20;
  const subSize = IS_VERY_TINY ? 12 : 13;

  const load = useCallback(async () => {
    const c = await AsyncStorage.getItem(KEY_COINS);
    const cc = c ? parseInt(c, 10) : 0;
    setCoins(Number.isFinite(cc) ? Math.max(0, cc) : 0);

    const ownedRaw = await AsyncStorage.getItem(KEY_OWNED_PREDICTIONS);
    const ownedArr: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
    setOwnedCount(Array.isArray(ownedArr) ? ownedArr.length : 0);

    if (mode === 'prediction' && !currentPrediction) {
      setMode('exchange');
    }
  }, [mode, currentPrediction]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation, load]);

  const canExchange = coins >= 1;

  const exchange = useCallback(async () => {
    if (!canExchange) return;

    const ownedRaw = await AsyncStorage.getItem(KEY_OWNED_PREDICTIONS);
    const ownedArr: string[] = ownedRaw ? JSON.parse(ownedRaw) : [];
    const safeOwned = Array.isArray(ownedArr) ? ownedArr : [];

    const remaining = PREDICTIONS.filter((p) => !safeOwned.includes(p));
    const chosen = remaining.length > 0 ? pickRandomFrom(remaining) : pickRandomFrom(PREDICTIONS);

    const nextCoins = coins - 1;
    await AsyncStorage.setItem(KEY_COINS, String(nextCoins));

    let nextOwned = safeOwned;
    if (remaining.length > 0 && !safeOwned.includes(chosen)) {
      nextOwned = [...safeOwned, chosen];
      await AsyncStorage.setItem(KEY_OWNED_PREDICTIONS, JSON.stringify(nextOwned));
      setOwnedCount(nextOwned.length);
    }

    setCoins(nextCoins);
    setCurrentPrediction(chosen);
    setMode('prediction');
  }, [canExchange, coins]);

  const sharePrediction = useCallback(async () => {
    if (!currentPrediction) return;
    try {
      await Share.share({ message: currentPrediction });
    } catch { }
  }, [currentPrediction]);

  const backToExchange = useCallback(() => {
    setMode('exchange');
    setCurrentPrediction('');
  }, []);

  const coinsBadgeW = IS_VERY_TINY ? 72 : 82;
  const coinsBadgeH = IS_VERY_TINY ? 34 : 38;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backBtn,
            { top: topPad + 18 },
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.95 },
          ]}
          hitSlop={12}
        >
          <Text style={styles.backTxt}>{'‹'}</Text>
        </Pressable>

        <View
          style={[
            styles.coinsBadge,
            {
              top: topPad + 18,
              width: coinsBadgeW,
              height: coinsBadgeH,
              borderRadius: coinsBadgeH / 2,
            },
          ]}
        >
          <Text style={styles.coinsBadgeTxt}>{coins}</Text>
          <Image source={COIN} style={styles.coinIcon} />
        </View>

        <View style={styles.heroWrap}>
          <Image
            source={HERO}
            style={{
              width: heroW,
              height: heroH,
              resizeMode: 'contain',
              marginTop: IS_VERY_TINY ? 76 : 86,
            }}
          />
        </View>

        <View 
          style={[
            styles.card, 
            { width: cardW, height: cardH },
          
            Platform.OS === 'android' ? { marginBottom: 66 } : { marginBottom: 26 }
          ]}
        >
          {mode === 'exchange' ? (
            <>
              <Text style={[styles.cardTitle, { fontSize: titleSize }]}>Ice Exchange</Text>
              <Text style={[styles.cardSub, { fontSize: subSize, lineHeight: subSize + 5 }]}>
                Here you can get predictions for{'\n'}your collection.
              </Text>

              <Pressable
                onPress={exchange}
                disabled={!canExchange}
                style={({ pressed }) => [
                  styles.mainBtn,
                  (!canExchange || pressed) && { opacity: !canExchange ? 0.45 : 0.95 },
                  pressed && canExchange && { transform: [{ scale: 0.99 }] },
                ]}
              >
                <Text style={styles.mainBtnTxt}>Exchange</Text>
                <View style={styles.priceChip}>
                  <Text style={styles.priceTxt}>1</Text>
                  <Image source={COIN} style={styles.priceCoin} />
                </View>
              </Pressable>

              <View style={styles.bottomInfo}>
                <Text style={styles.bottomInfoTxt}>
                  {`Owned: ${ownedCount} / ${PREDICTIONS.length} predictions`}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.cardTitle, { fontSize: titleSize }]}>Your prediction</Text>
              <Text style={[styles.predictionTxt, { fontSize: IS_VERY_TINY ? 12 : 13 }]}>
                {currentPrediction}
              </Text>

              <Pressable
                onPress={sharePrediction}
                style={({ pressed }) => [
                  styles.shareBtn,
                  pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] },
                ]}
              >
                <Text style={styles.shareBtnTxt}>Share a prediction</Text>
              </Pressable>

              <Pressable
                onPress={backToExchange}
                style={({ pressed }) => [
                  styles.backSmallBtn,
                  pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] },
                ]}
              >
                <Text style={styles.backSmallTxt}>Back exchanger</Text>
              </Pressable>
            </>
          )}
        </View>
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

  coinsBadge: {
    position: 'absolute',
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#FFD36A',
    backgroundColor: 'rgba(44,89,200,0.45)',
    zIndex: 20,
    paddingHorizontal: 10,
  },
  coinsBadgeTxt: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, marginTop: -1 },
  coinIcon: { width: 18, height: 18, resizeMode: 'contain', opacity: 0.95 },

  heroWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  card: {
    borderRadius: 28,
    backgroundColor: 'rgba(78,144,219,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },

  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },

  cardSub: {
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    marginBottom: 18,
  },

  mainBtn: {
    width: '82%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C59C8',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnTxt: { color: '#FFD36A', fontWeight: '900', fontSize: 18 },

  priceChip: {
    position: 'absolute',
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(20,35,90,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  priceTxt: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, marginTop: -1 },
  priceCoin: { width: 16, height: 16, resizeMode: 'contain', opacity: 0.95 },

  bottomInfo: { marginTop: 18 },
  bottomInfoTxt: { color: 'rgba(255,255,255,0.72)', fontWeight: '800', fontSize: 12 },

  predictionTxt: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginTop: 6,
    marginBottom: 18,
  },

  shareBtn: {
    width: '82%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C59C8',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  shareBtnTxt: { color: '#FFD36A', fontWeight: '900', fontSize: 18 },

  backSmallBtn: {
    width: '54%',
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(44,89,200,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSmallTxt: { color: 'rgba(255,255,255,0.85)', fontWeight: '800', fontSize: 14 },
});