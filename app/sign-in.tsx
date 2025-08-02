import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { useAuth } from '@/components/auth/auth-provider'
import { AppConfig } from '@/constants/app-config'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignIn() {
  const { signIn, isLoading } = useAuth()
  return (
    <AppView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          <View />
          <View style={{ alignItems: 'center', gap: 16 }}>
            <AppText type="title">{AppConfig.name}</AppText>
            <Image source={require('../assets/images/icon.png')} style={{ width: 128, height: 128 }} />
          </View>
          <View style={{ marginBottom: 16 }}>
  <Pressable
    style={{
      marginHorizontal: 16,
      backgroundColor: '#ff0000',
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    }}
    onPress={async () => {
      await signIn()
      router.replace('/')
    }}
  >
    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Connect</Text>
  </Pressable>
</View>
        </SafeAreaView>
      )}
    </AppView>
  )
}
