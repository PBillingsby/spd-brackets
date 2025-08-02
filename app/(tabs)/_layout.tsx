import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#CB9A20',
      tabBarInactiveTintColor: '#A3A3A3',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '200',
      }
     }}
    >
      <Tabs.Screen name="index" options={{ tabBarItemStyle: { display: 'none' } }} />

      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/navbar/home-gold.png')
                  : require('../../assets/images/navbar/home-grey.png')
              }
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bracket"
        options={{
          title: 'Tournament',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/navbar/trophy-gold.png')
                  : require('../../assets/images/navbar/trophy-grey.png')
              }
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/navbar/radio-gold.png')
                  : require('../../assets/images/navbar/radio-grey.png')
              }
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bets"
        options={{
          title: 'My Bets',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/navbar/coins-gold.png')
                  : require('../../assets/images/navbar/coins-grey.png')
              }
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/navbar/profile-gold.png')
                  : require('../../assets/images/navbar/profile-grey.png')
              }
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />

    </Tabs>
  );
}
