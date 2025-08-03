import { AppPage } from '@/components/app-page';
import { AppView } from '@/components/app-view';
import { TabPageLayout } from '@/components/layouts/TabPageLayout';
import { WinnerModal } from '@/components/shared/WinnerModal';
import { useAuthorization } from '@/components/solana/use-authorization';
import { useMobileWallet } from '@/components/solana/use-mobile-wallet';
import { AppConfig } from '@/constants/app-config';
import { getAllRaceSelectionsByWallet, getRacerNamesByIds } from '@/lib/db/race_selections';
import { supabase } from '@/lib/supabaseClient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function MyBets() {
  const [activeTab, setActiveTab] = useState<'myBets' | 'spsChips'>('myBets');
  const [modalVisible, setModalVisible] = useState(false);
  const [raceEntries, setRaceEntries] = useState([]);
  const [expandedRaceIds, setExpandedRaceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { signIn } = useMobileWallet();

  const { selectedAccount } = useAuthorization();

  useEffect(() => {
    const loadRaceEntries = async () => {
      if (!selectedAccount?.publicKey) return;
      
      const selections = await getAllRaceSelectionsByWallet(selectedAccount.publicKey);
      if (!selections.length) {
        setRaceEntries([]);
        return;
      }

      setLoading(true);
      try {
        const raceIds = selections.map((s) => s.race_id);
        const matchIds = selections.flatMap((s) => Object.keys(s.selections));
        const racerIds = selections.flatMap((s) => Object.values(s.selections));

        const [{ data: racesData }, { data: matchesData }, racerNamesMap] = await Promise.all([
          supabase.from('races').select('id, name').in('id', raceIds),
          supabase.from('matches').select('id, winner_id').in('id', matchIds),
          getRacerNamesByIds(racerIds),
        ]);

        const raceNameMap = (racesData ?? []).reduce((acc, race) => {
          acc[race.id] = race.name;
          return acc;
        }, {});

        const winnerMap = (matchesData ?? []).reduce((acc, match) => {
          acc[match.id] = match.winner_id;
          return acc;
        }, {});

        const entries = selections.map((selection) => ({
          raceId: selection.race_id,
          raceName: raceNameMap[selection.race_id] || 'Unknown Race',
          picks: Object.entries(selection.selections)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([matchId, racerId]) => {
              const winnerId = winnerMap[matchId];
              return {
                ...racerNamesMap[racerId],
                isWinner: winnerId === racerId,
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

    loadRaceEntries();
  }, [selectedAccount]);

  const renderEmptyCard = () => (
    <View style={emptyCardStyle}>
      <Text style={emptyStateTextStyle}>No Chips yet</Text>
    </View>
  );

  const renderMyBetsCard = () => (
    <View style={{ marginBottom: 40 }}>
      {!selectedAccount ? (
        <AppView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={emptyStateTextStyle}>Please sign in to view your entries.</Text>
        <TouchableOpacity
              onPress={() => signIn({ uri: AppConfig.uri })}
              style={{
                backgroundColor: '#DAA520',
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 8
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Semplicita' }}>Sign In</Text>
            </TouchableOpacity>
        </AppView>
      ) : loading ? (
        <Text style={emptyStateTextStyle}>Loading...</Text>
      ) : (
        raceEntries.length > 0 ?
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
                    {idx + 1}. {pick.name} {pick.hasWinner ? (pick.isWinner ? '🥇' : '🥈') : ''}
                  </Text>
                ))}
            </View>
          );
        }) :
        <AppView style={{alignContent: 'center'}}>
        <Text style={emptyStateTextStyle}>0 Selections Made.</Text>
        <TouchableOpacity style={betNowButtonStyle} onPress={() => router.replace('/bracket')}>
          <Text style={betButtonTextStyle}>+ ADD BETS</Text>
        </TouchableOpacity>
        </AppView>
      )}
    </View>
  );

  return (
    <TabPageLayout>
      <AppPage>
        <WinnerModal visible={modalVisible} onClose={() => setModalVisible(false)} />
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

        {raceEntries.length > 0 && <TouchableOpacity style={betNowButtonStyle} onPress={() => router.replace('/bracket')}>
          <Text style={betButtonTextStyle}>+ ADD BETS</Text>
        </TouchableOpacity>}
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
  alignSelf: 'center',
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
  padding: 20,
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