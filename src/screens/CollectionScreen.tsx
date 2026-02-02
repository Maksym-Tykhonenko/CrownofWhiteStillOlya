import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Collection'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 720 || W < 360;
const IS_VERY_TINY = H < 660;
const IS_NARROW = W < 360;

const BG = require('../assets/background1.png');
const COIN = require('../assets/coin.png');
const SHARE_ICON = require('../assets/share.png'); 

const KEY_COINS = 'tugriks_v1';
const KEY_OWNED_PREDICTIONS = 'ice_predictions_owned_v1';

async function readInt(key: string, fallback = 0) {
  try {
    const v = await AsyncStorage.getItem(key);
    const n = v ? parseInt(v, 10) : fallback;
    return Number.isFinite(n) ? Math.max(0, n) : fallback;
  } catch {
    return fallback;
  }
}

async function readStringArray(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? (arr.filter((x) => typeof x === 'string') as string[]) : [];
  } catch {
    return [];
  }
}

export default function CollectionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [coins, setCoins] = useState(0);
  const [items, setItems] = useState<string[]>([]);

  const appear = useRef(new Animated.Value(0)).current;
  const listIn = useRef(new Animated.Value(0)).current;

  const topPad = Math.max(10, insets.top + 6);
  const bottomPad = Math.max(10, insets.bottom + 12);

  const coinsBadgeW = IS_VERY_TINY ? 68 : IS_TINY ? 74 : 82;
  const coinsBadgeH = IS_VERY_TINY ? 32 : IS_TINY ? 34 : 38;
  const cardW = Math.min(520, W * (IS_NARROW ? 0.94 : 0.92));
  const headerSpacer = IS_VERY_TINY ? 96 : IS_TINY ? 108 : 120;

  const load = useCallback(async () => {
    const c = await readInt(KEY_COINS, 0);
    setCoins(c);

    const owned = await readStringArray(KEY_OWNED_PREDICTIONS);
    setItems(owned.reverse());
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation, load]);

  useEffect(() => {
    appear.setValue(0);
    listIn.setValue(0);

    Animated.parallel([
      Animated.timing(appear, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(listIn, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [appear, listIn]);

  const shareItem = useCallback(async (text: string) => {
    try {
      await Share.share({ message: text });
    } catch {}
  }, []);

  const EmptyCard = () => (
    <View style={[styles.emptyBox, { width: cardW }]}>
      <Text style={[styles.emptyTxt, { fontSize: IS_VERY_TINY ? 12 : IS_TINY ? 13 : 14 }]}>
        You haven&apos;t opened the{'\n'}predictions.
      </Text>

      <View style={styles.snowRow}>
        <Text style={styles.snow}>❄︎</Text>
        <Text style={styles.snow}>❄︎</Text>
        <Text style={styles.snow}>❄︎</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: string }) => {
    const padY = IS_VERY_TINY ? 14 : IS_TINY ? 16 : 18;
    const font = IS_VERY_TINY ? 13 : IS_TINY ? 14 : 16;

    const shareW = IS_VERY_TINY ? 44 : 46;
    const shareH = IS_VERY_TINY ? 34 : 36;

    return (
      <View style={[styles.itemBox, { width: cardW, paddingVertical: padY }]}>
        <Text
          style={[
            styles.itemTxt,
            {
              fontSize: font,
              lineHeight: IS_VERY_TINY ? 18 : IS_TINY ? 19 : 21,
              paddingRight: IS_VERY_TINY ? 54 : 58,
            },
          ]}
          numberOfLines={IS_VERY_TINY ? 3 : 2}
        >
          {item}
        </Text>

        <Pressable
          onPress={() => shareItem(item)}
          hitSlop={12}
          style={({ pressed }) => [
            styles.shareBtn,
            {
              width: shareW,
              height: shareH,
              borderBottomRightRadius: IS_VERY_TINY ? 16 : 18,
              borderTopLeftRadius: IS_VERY_TINY ? 12 : 14,
            },
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <View style={styles.shareInner}>
            <Image
              source={SHARE_ICON}
              style={[
                styles.shareIcon,
                { width: IS_VERY_TINY ? 17 : 18, height: IS_VERY_TINY ? 17 : 18 },
              ]}
            />
          </View>
        </Pressable>

        <Text style={[styles.crownMini, { fontSize: IS_VERY_TINY ? 17 : 18, top: IS_VERY_TINY ? -11 : -12 }]}>
          ♛
        </Text>

        <Text style={[styles.snowMini, { left: IS_VERY_TINY ? 14 : 20, top: IS_VERY_TINY ? 14 : 18 }]}>
          ❄︎
        </Text>
        <Text style={[styles.snowMini, { right: IS_VERY_TINY ? 18 : 26, top: IS_VERY_TINY ? 22 : 18 }]}>
          ❄︎
        </Text>
      </View>
    );
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <Animated.View
        style={[
          styles.root,
          {
            paddingTop: topPad,
            paddingBottom: bottomPad,
            opacity: appear,
            transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backBtn,
            {
              top: topPad + (IS_VERY_TINY ? 14 : 18),
              left: IS_VERY_TINY ? 12 : 14,
              width: IS_VERY_TINY ? 42 : 46,
              height: IS_VERY_TINY ? 42 : 46,
              borderRadius: (IS_VERY_TINY ? 42 : 46) / 2,
            },
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.95 },
          ]}
          hitSlop={12}
        >
          <Text style={[styles.backTxt, { fontSize: IS_VERY_TINY ? 26 : 28 }]}>{'‹'}</Text>
        </Pressable>

        <View
          style={[
            styles.coinsBadge,
            {
              top: topPad + (IS_VERY_TINY ? 14 : 18),
              right: IS_VERY_TINY ? 12 : 14,
              width: coinsBadgeW,
              height: coinsBadgeH,
              borderRadius: coinsBadgeH / 2,
              paddingHorizontal: IS_VERY_TINY ? 9 : 10,
              gap: IS_VERY_TINY ? 7 : 8,
            },
          ]}
        >
          <Text style={[styles.coinsBadgeTxt, { fontSize: IS_VERY_TINY ? 15 : 16 }]}>{coins}</Text>
          <Image source={COIN} style={[styles.coinIcon, { width: IS_VERY_TINY ? 17 : 18, height: IS_VERY_TINY ? 17 : 18 }]} />
        </View>

        <View style={{ height: headerSpacer }} />

        <Animated.View
          style={{
            width: '100%',
            alignItems: 'center',
            opacity: listIn,
            transform: [{ translateY: listIn.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          }}
        >
          {items.length === 0 ? (
            <EmptyCard />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(it, idx) => `${idx}-${it.slice(0, 18)}`}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={10}
              contentContainerStyle={{
                paddingBottom: Math.max(16, bottomPad),
                paddingTop: IS_VERY_TINY ? 2 : 4,
              }}
            />
          )}
        </Animated.View>
      </Animated.View>
    </ImageBackground>
  );
}

const BORDER = '#E1B64D';

const styles = StyleSheet.create({
  bg: { flex: 1 },
  root: { flex: 1, alignItems: 'center' },

  backBtn: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: 'rgba(44,89,200,0.35)',
    zIndex: 20,
  },
  backTxt: { color: BORDER, fontWeight: '900', marginTop: -2 },

  coinsBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: 'rgba(44,89,200,0.35)',
    zIndex: 20,
  },
  coinsBadgeTxt: { color: '#FFFFFF', fontWeight: '900', marginTop: -1 },
  coinIcon: { resizeMode: 'contain', opacity: 0.95 },

  emptyBox: {
    borderRadius: 18,
    backgroundColor: 'rgba(74, 160, 240, 0.75)',
    borderWidth: 2,
    borderColor: BORDER,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  emptyTxt: {
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  snowRow: { flexDirection: 'row', gap: 18, marginTop: 10, opacity: 0.35 },
  snow: { color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: '800' },

  itemBox: {
    borderRadius: 22,
    backgroundColor: 'rgba(74, 160, 240, 0.78)',
    borderWidth: 2,
    borderColor: BORDER,
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: 'center',
  },
  itemTxt: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '800',
    textAlign: 'left',
  },

  shareBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: 'rgba(74, 160, 240, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareInner: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  shareIcon: { resizeMode: 'contain', tintColor: '#FFFFFF', opacity: 0.9 },

  crownMini: {
    position: 'absolute',
    alignSelf: 'center',
    color: BORDER,
    fontWeight: '900',
    opacity: 0.95,
  },
  snowMini: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.35)',
    fontSize: 16,
    fontWeight: '800',
  },
});
