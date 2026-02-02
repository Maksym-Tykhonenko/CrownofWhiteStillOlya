import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 740 || W < 360;
const IS_TINY = H < 690;

const BG = require('../assets/background.png');
const LOGO = require('../assets/logo.png');

export default function LoaderScreen({ navigation }: Props) {
  const [phase, setPhase] = useState<'web' | 'logo'>('web');
  const [webReady, setWebReady] = useState(false);

  const webOpacity = useRef(new Animated.Value(1)).current;
  const webScale = useRef(new Animated.Value(1)).current;

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const spinnerSize = IS_TINY ? 86 : IS_SMALL ? 96 : 108;
  const spinnerBorder = IS_TINY ? 14 : IS_SMALL ? 15 : 16;

  const spinnerHTML = useMemo(() => {
    return `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
<style>
  html,body{
    margin:0;padding:0;width:100%;height:100%;
    background:transparent;
  }
  body{
    display:flex;
    align-items:center;
    justify-content:center;
    background:transparent;
    overflow:hidden;
  }
  .spinner{
    width:${spinnerSize}px;
    height:${spinnerSize}px;
    display:grid;
  }
  .spinner::before,
  .spinner::after{
    content:"";
    grid-area: 1/1;
    border:${spinnerBorder}px solid;
    border-radius:50%;
    border-color:#474bff #474bff transparent transparent;
    animation:spin 1s linear infinite;
  }
  .spinner::after{
    border-color:transparent transparent #dbdcef #dbdcef;
    animation-direction:reverse;
  }
  @keyframes spin { 100% { transform: rotate(360deg); } }
</style>
</head>
<body>
  <div class="spinner"></div>
</body>
</html>`;
  }, [spinnerSize, spinnerBorder]);

  useEffect(() => {
    setWebReady(false);
    setPhase('web');

    webOpacity.setValue(1);
    webScale.setValue(1);
    logoOpacity.setValue(0);
    logoScale.setValue(0.92);
    
  }, [navigation, logoOpacity, logoScale, webOpacity, webScale]);

  const boxSize = IS_TINY ? 190 : IS_SMALL ? 220 : 250;
  const logoSize = IS_TINY ? 190 : IS_SMALL ? 220 : 260;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.centerWrap}>
        <View style={styles.stage}>
          <Animated.View
            pointerEvents={phase === 'web' ? 'auto' : 'none'}
            style={[
              styles.absoluteCenter,
              {
                opacity: webOpacity,
                transform: [{ scale: webScale }],
              },
            ]}
          >
            
                <View style={styles.webFallback}>
                  <ActivityIndicator size="small" />
                </View>
              
          </Animated.View>

          <Animated.View
            pointerEvents={phase === 'logo' ? 'auto' : 'none'}
            style={[
              styles.absoluteCenter,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image source={LOGO} style={{ width: logoSize, height: logoSize, resizeMode: 'contain' }} />
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  absoluteCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  webBox: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  webContainer: { backgroundColor: 'transparent' },
  web: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    opacity: 0.99,
  },

  webFallback: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
