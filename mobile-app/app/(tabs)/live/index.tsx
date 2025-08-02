import { AppPage } from '@/components/app-page';
import { AppView } from '@/components/app-view';
import { TabPageLayout } from '@/components/layouts/TabPageLayout';
import ClipSection from '@/components/video/video';
import { getRacerNamesByIds } from '@/lib/db/race_selections';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const RACER_IDS = [
  '8091a59e-b02d-4d60-8196-319ace9546f1', // Racer A
  '013dc1a0-634a-4295-8a64-2bb3f46bc557'  // Racer B
];

export default function Live() {
  const [racers, setRacers] = useState<Record<string, {
    name: string;
    total_races: number;
    races_won: number;
    win_percentage: number;
  }>>({});

  useEffect(() => {
    const fetchRacers = async () => {
      try {
        const racerData = await getRacerNamesByIds(RACER_IDS);
        setRacers(racerData);
      } catch (err) {
        console.error('Error fetching racer data:', err);
      }
    };

    fetchRacers();
  }, []);

  const racerA = racers[RACER_IDS[0]];
  const racerB = racers[RACER_IDS[1]];

  return (
    <TabPageLayout>
      <AppPage>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppView style={{ alignItems: 'center', gap: 4 }}>

            {/* Clip & Bet Stats */}
            <AppView style={{ width: '100%' }}>
              <ClipSection link="https://www.youtube.com/watch?v=TUBkpBW5r80" />

              <AppView style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 12 }}>
                <View style={{ backgroundColor: '#28a745', padding: 6, borderRadius: 6 }}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>🔥 +11 bets on {racerA?.name || 'Racer A'}</Text>
                </View>
                <View style={{ backgroundColor: '#dc3545', padding: 6, borderRadius: 6 }}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>💀 -6 bets on {racerB?.name || 'Racer B'}</Text>
                </View>
              </AppView>
            </AppView>

            {/* Live Prediction Section */}
            <AppView style={{ alignItems: 'center', marginTop: 16 }}>
              <Text style={{ color: '#fff', fontSize: 16, letterSpacing: 1 }}>LIVE PREDICTION</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Text style={{ color: '#00ffae', fontSize: 20, fontWeight: 'bold' }}>
                  56% {racerA?.name || 'Racer A'}
                </Text>
                <Text style={{ color: '#ff5e5e', fontSize: 20, fontWeight: 'bold' }}>
                  44% {racerB?.name || 'Racer B'}
                </Text>
              </View>

              {/* Racer Stats */}
              <View style={{ marginTop: 16, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                {[racerA, racerB].map((racer, index) =>
                  racer ? (
                    <View key={index} style={{ backgroundColor: '#202020', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                      <Text style={{ color: '#ccc' }}>Total Races: {racer.total_races}</Text>
                      <Text style={{ color: '#ccc' }}>Wins: {racer.races_won}</Text>
                      <Text style={{ color: '#ccc' }}>Win %: {racer.win_percentage}%</Text>
                    </View>
                  ) : null
                )}
              </View>

              <TouchableOpacity style={{
                backgroundColor: '#DAA520',
                marginTop: 12,
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 8
              }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000', fontFamily: 'Semplicita' }}>Bet Now</Text>
              </TouchableOpacity>
            </AppView>

            {/* Chat Box */}
            <AppView style={{
              width: '100%',
              marginTop: 32,
              backgroundColor: '#181818',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#333'
            }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
                Chat
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: '#1E90FF', fontWeight: 'bold' }}>silentbill2:</Text>
                <Text style={{ color: '#fff', marginLeft: 6 }}>😂😂😂😂</Text>
              </View>

              <View style={{
                backgroundColor: '#222',
                borderLeftWidth: 4,
                borderLeftColor: '#00ffae',
                padding: 8,
                borderRadius: 4
              }}>
                <Text style={{ color: '#00ffae', fontWeight: 'bold' }}>Moderator</Text>
                <Text style={{ color: '#fff' }}>
                  <Text style={{ color: '#FF69B4', fontWeight: 'bold' }}>PunchyBowl:</Text> You already finished the raid two hours after the release!
                </Text>
              </View>
            </AppView>
          </AppView>
        </ScrollView>
      </AppPage>
    </TabPageLayout>
  );
}
