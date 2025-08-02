import { router } from 'expo-router';
import React, { ReactNode } from 'react';
import { Image, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode
}

export function TabPageLayout({ children }: Props) {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const isLive = true;

  const liveStatusImage = isLive ?
    'live-now' : 'offline'

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image
        source={require('@/assets/images/shared/header-image.png')}
        style={{
          width: width,
          height: 112 + insets.top,
          resizeMode: 'contain',
          alignSelf: 'center',
        }}
      />
      <TouchableOpacity
        onPress={() => {
          if (liveStatusImage === 'live-now') {
            router.replace('/live');
          }
        }}
        activeOpacity={liveStatusImage === 'live-now' ? 0.7 : 1}
      >
        <Image
          source={require(`@/assets/images/shared/${liveStatusImage}.png`)}
          style={{
            width: 100,
            height: 112,
            resizeMode: 'contain',
            alignSelf: 'center',
          }}
        />
      </TouchableOpacity>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {children}
      </View>
    </View>
  )
}