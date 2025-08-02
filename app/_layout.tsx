import { AppProviders } from '@/components/app-providers'
import { AppSplashController } from '@/components/app-splash-controller'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useTrackLocations } from '@/hooks/use-track-locations'
import { ensureUserExists } from '@/lib/db/users'
import { PortalHost } from '@rn-primitives/portal'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect } from 'react'
import { Image, StyleSheet, TextInput, View } from 'react-native'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Prevent auto-hiding the splash screen
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Semplicita': require('../assets/fonts/semplicita-medium.otf'),
    'Semplicita-Bold': require('../assets/fonts/semplicita-bold.otf'),
  })

  if (fontsLoaded) {
    // TypeScript-safe way to set default props
    (Text as any).defaultProps = (Text as any).defaultProps || {};
    (Text as any).defaultProps.style = { fontFamily: 'Semplicita' };
    
    (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
    (TextInput as any).defaultProps.style = { fontFamily: 'Semplicita' };
  }


  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return (
      <View style={styles.container} onLayout={onLayoutRootView}>
        <Image
          source={require('../assets/images/initial-loading.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AppProviders>
          <AppSplashController />
          <TrackAndCreateUser />
          <RootNavigator />
          <StatusBar style="auto" />
        </AppProviders>
        <PortalHost />
      </View>
    </SafeAreaProvider>
  )
}

function RootNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}

function TrackAndCreateUser() {
  useTrackLocations((pathname, params) => {
    console.log(`Track ${pathname}`, { params })
  })

  const { selectedAccount } = useAuthorization()

  useEffect(() => {
    const ensureUser = async () => {
      if (!selectedAccount?.publicKey) return
      try {
        await ensureUserExists(selectedAccount.publicKey.toBase58())
      } catch (err) {
        console.error('User creation error:', err)
      }
    }

    ensureUser()
  }, [selectedAccount?.publicKey])

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
})
