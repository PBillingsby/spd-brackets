import { AppPage } from '@/components/app-page';
import { TabPageLayout } from '@/components/layouts/TabPageLayout';
import { useAuthorization } from '@/components/solana/use-authorization';
import { getAllRaceSelectionsByWallet, getRacerNamesByIds } from '@/lib/db/race_selections';
import { supabase } from '@/lib/supabaseClient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function MyBets() {
  const [activeTab, setActiveTab] = useState<'myBets' | 'spsChips'>('myBets');
  const [raceEntries, setRaceEntries] = useState<
    { raceName: string; picks: string[]; raceId: string }[]
  >([]);
  const [expandedRaceIds, setExpandedRaceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedAccount } = useAuthorization();

  useEffect(() => {
    const loadAll = async () => {
      try {
        const selections = await getAllRaceSelectionsByWallet(selectedAccount?.publicKey ?? '');
        const raceIds = selections.map((s) => s.race_id);
        const racerIds = selections.flatMap((s) => Object.values(s.selections));

        const [raceNamesMap, racerNamesMap] = await Promise.all([
          (async () => {
            const { data } = await supabase
              .from('races')
              .select('id, name')
              .in('id', raceIds);
            return (
              data?.reduce((acc, r) => {
                acc[r.id] = r.name;
                return acc;
              }, {} as Record<string, string>) || {}
            );
          })(),
          getRacerNamesByIds(racerIds),
        ]);

        const entries = selections.map((s) => ({
          raceId: s.race_id,
          raceName: raceNamesMap[s.race_id] || 'Unknown Race',
          picks: Object.entries(s.selections)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([_, racerId]) => racerNamesMap[racerId] || 'Unknown'),
        }));

        setRaceEntries(entries);
      } catch (err) {
        console.error('Failed to load race picks:', err);
      } finally {
        setLoading(false);
      }
    };

    console.log(selectedAccount)
    if (selectedAccount) loadAll();
  }, []);

  const renderEmptyCard = () => (
    <View
      style={{
        backgroundColor: '#121212',
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: '#2C2C2C',
        height: 240,
        marginBottom: 40,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        elevation: 10,
      }}
    />
  );

  const renderMyBetsCard = () => (
    <View style={{ marginBottom: 40 }}>
      {loading ? (
        <Text style={{ color: '#888' }}>Loading...</Text>
      ) : raceEntries.length === 0 ? (
        <>
        <Text style={{ color: '#888', textAlign: 'center' }}>No picks submitted</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#FFC107',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignSelf: 'center',
            marginTop: 12,
          }}
          onPress={() => {
            router.replace('/bracket')
          }}
        >
          <Text style={{ color: '#000', fontWeight: 'bold' }}>Bet Now</Text>
        </TouchableOpacity>
        </>
      ) : (
        raceEntries.map((race) => {
          const isExpanded = expandedRaceIds.includes(race.raceId);
          return (
            <View
              key={race.raceId}
              style={{
                backgroundColor: '#121212',
                borderRadius: 16,
                borderWidth: 0.5,
                borderColor: '#2C2C2C',
                marginBottom: 16,
                shadowColor: '#FFD700',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                elevation: 10,
                padding: 16,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  setExpandedRaceIds((prev) =>
                    prev.includes(race.raceId)
                      ? prev.filter((id) => id !== race.raceId)
                      : [...prev, race.raceId]
                  )
                }
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#DAA520',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}
                >
                  {race.raceName}
                </Text>
                <Text style={{ color: '#DAA520', fontSize: 16 }}>
                  {isExpanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {isExpanded && (
                <>
                  {race.picks.map((name, idx) => (
                    <Text
                      key={idx}
                      style={{
                        color: '#fff',
                        fontSize: 15,
                        marginTop: 8,
                      }}
                    >
                      {idx + 1}. {name}
                    </Text>
                  ))}
                </>
              )}
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <TabPageLayout>
      <AppPage>
        <ScrollView style={{ backgroundColor: '#1a1a1a' }} showsVerticalScrollIndicator={false}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 40,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity onPress={() => setActiveTab('myBets')}>
              <Text
                style={{
                  fontSize: 18,
                  color: activeTab === 'myBets' ? '#fff' : '#888',
                  fontWeight: 'bold',
                  borderBottomWidth: activeTab === 'myBets' ? 2 : 0,
                  borderBottomColor: '#DAA520',
                  paddingBottom: 4,
                }}
              >
                My Bets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab('spsChips')}>
              <Text
                style={{
                  fontSize: 18,
                  color: activeTab === 'spsChips' ? '#fff' : '#888',
                  fontWeight: 'bold',
                  borderBottomWidth: activeTab === 'spsChips' ? 2 : 0,
                  borderBottomColor: '#DAA520',
                  paddingBottom: 4,
                }}
              >
                SPS Chips
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            {activeTab === 'myBets' ? renderMyBetsCard() : renderEmptyCard()}
          </View>
        </ScrollView>
        <TouchableOpacity
          style={{
            backgroundColor: '#FFC107',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignSelf: 'flex-end',
            marginTop: 12,
          }}
          onPress={() => {
            // handle bet now action
          }}
        >
          <Text style={{ color: '#000', fontWeight: 'bold' }}>Bet Now</Text>
        </TouchableOpacity>
      </AppPage>
    </TabPageLayout>
  );
}
