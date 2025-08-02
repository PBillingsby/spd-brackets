import { AppPage } from '@/components/app-page';
import { TabPageLayout } from '@/components/layouts/TabPageLayout';
import { useAuthorization } from '@/components/solana/use-authorization';
import { getAllRaceSelectionsByWallet, getRacerNamesByIds } from '@/lib/db/race_selections';
import { supabase } from '@/lib/supabaseClient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function MyBets() {
  const [activeTab, setActiveTab] = useState<'myBets' | 'spsChips'>('myBets');
  const [raceEntries, setRaceEntries] = useState<
    {
      raceId: string;
      raceName: string;
      picks: {
        name: string;
        isWinner: boolean;
        hasWinner: boolean;
      }[];
    }[]
  >([]);
  const [expandedRaceIds, setExpandedRaceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedAccount } = useAuthorization();

  useEffect(() => {
    const loadAll = async () => {
      try {
        const selections = await getAllRaceSelectionsByWallet(selectedAccount?.publicKey ?? '');

        const raceIds = selections.map((s) => s.race_id);
        const matchIds = selections.flatMap((s) => Object.keys(s.selections));
        const racerIds = selections.flatMap((s) => Object.values(s.selections));

        const [{ data: racesData }, { data: matchesData }, racerNamesMap] = await Promise.all([
          supabase.from('races').select('id, name').in('id', raceIds),
          supabase.from('matches').select('id, winner_id').in('id', matchIds),
          getRacerNamesByIds(racerIds),
        ]);

        const raceNameMap = racesData?.reduce((acc, r) => {
          acc[r.id] = r.name;
          return acc;
        }, {} as Record<string, string>) ?? {};

        const winnerMap = matchesData?.reduce((acc, m) => {
          acc[m.id] = m.winner_id;
          return acc;
        }, {} as Record<string, string>) ?? {};

        const entries = selections.map((s) => ({
          raceId: s.race_id,
          raceName: raceNameMap[s.race_id] || 'Unknown Race',
          picks: Object.entries(s.selections)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([matchId, racerId]) => {
              const winnerId = winnerMap[matchId];
              return {
                ...racerNamesMap[racerId],
                isWinner: !!winnerId && winnerId === racerId,
                didLose: !!winnerId && winnerId !== racerId,
                hasWinner: !!winnerId,

              };
            }),
        }));

        setRaceEntries(entries);
      } catch (err) {
        console.error('Failed to load race picks:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedAccount?.publicKey) loadAll();
  }, [selectedAccount]);

  const renderEmptyCard = () => (
    <View style={emptyCardStyle}>
      <Text style={emptyStateTextStyle}>No Chips yet</Text>
    </View>
  );

  const renderMyBetsCard = () => (
    <View style={{ marginBottom: 40 }}>
      {loading ? (
        <Text style={loadingTextStyle}>Loading...</Text>
      ) : raceEntries.length === 0 ? (
        <>
          <Text style={emptyStateTextStyle}>No picks submitted</Text>
          <TouchableOpacity style={betNowButtonStyle} onPress={() => router.replace('/bracket')}>
            <Text style={betButtonTextStyle}>Bet Now</Text>
          </TouchableOpacity>
        </>
      ) : (
        raceEntries.map((race) => {
          const isExpanded = expandedRaceIds.includes(race.raceId);
          return (
            <View key={race.raceId} style={cardStyle}>
              <TouchableOpacity
                onPress={() =>
                  setExpandedRaceIds((prev) =>
                    prev.includes(race.raceId)
                      ? prev.filter((id) => id !== race.raceId)
                      : [...prev, race.raceId]
                  )
                }
                style={cardHeaderStyle}
              >
                <Text style={raceNameTextStyle}>{race.raceName}</Text>
                <Text style={expandIconTextStyle}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isExpanded &&
                race.picks.map((pick, idx) => (
                  <Text key={idx} style={pickItemTextStyle}>
                    {idx + 1}. {pick.name}{' '}
                    {pick.hasWinner ? (pick.isWinner ? '🥇' : '🥈') : ''}
                  </Text>
                ))}
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <TabPageLayout>
      <AppPage>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={tabSelectorStyle}>
            <TouchableOpacity onPress={() => setActiveTab('myBets')}>
              <Text
                style={[
                  tabTextStyle,
                  activeTab === 'myBets' && { color: '#fff', borderBottomWidth: 2, borderBottomColor: '#DAA520' },
                ]}
              >
                My Bets
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('spsChips')}>
              <Text
                style={[
                  tabTextStyle,
                  activeTab === 'spsChips' && { color: '#fff', borderBottomWidth: 2, borderBottomColor: '#DAA520' },
                ]}
              >
                SPS Chips
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            {activeTab === 'myBets' ? renderMyBetsCard() : renderEmptyCard()}
          </View>
        </ScrollView>

        <TouchableOpacity style={betNowButtonStyle} onPress={() => router.replace('/bracket')}>
          <Text style={betButtonTextStyle}>Bet Now</Text>
        </TouchableOpacity>
      </AppPage>
    </TabPageLayout>
  );
}

// === Styles ===

const emptyCardStyle = {
  backgroundColor: '#121212',
  borderRadius: 16,
  borderWidth: 0.5,
  borderColor: '#2C2C2C',
  height: 240,
  marginBottom: 40,
  elevation: 10,
};

const cardStyle = {
  backgroundColor: '#121212',
  borderRadius: 16,
  borderWidth: 0.5,
  borderColor: '#2C2C2C',
  marginBottom: 16,
  elevation: 10,
  padding: 16,
};

const cardHeaderStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const tabSelectorStyle = {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 40,
  marginBottom: 20,
};

const betNowButtonStyle = {
  backgroundColor: '#FFC107',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 8,
  alignSelf: 'flex-end',
  marginTop: 12,
};

const loadingTextStyle = {
  color: '#888',
  fontFamily: 'Semplicita',
};

const emptyStateTextStyle = {
  color: '#888',
  textAlign: 'center' as const,
  fontFamily: 'Semplicita',
  fontSize: 18,
  padding: 100,
};

const betButtonTextStyle = {
  color: '#000',
  fontFamily: 'Semplicita',
};

const raceNameTextStyle = {
  color: '#DAA520',
  fontFamily: 'Semplicita',
  fontSize: 16,
};

const expandIconTextStyle = {
  color: '#DAA520',
  fontSize: 16,
  fontFamily: 'Semplicita',
};

const pickItemTextStyle = {
  color: '#fff',
  fontSize: 16,
  marginTop: 8,
  fontFamily: 'Semplicita',
};

const tabTextStyle = {
  fontSize: 18,
  fontFamily: 'Semplicita',
  color: '#888',
  paddingBottom: 4,
};
