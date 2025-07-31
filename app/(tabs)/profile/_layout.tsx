import { Stack } from 'expo-router'
import React from 'react'

// TODO - Sign up is going to be username and email 

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}
