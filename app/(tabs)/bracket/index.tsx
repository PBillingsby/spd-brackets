import { TabPageLayout } from '@/components/layouts/TabPageLayout';
import { useAuthorization } from '@/components/solana/use-authorization';
import { submitRacePicks } from '@/lib/db/race_selections';
import { getMatchesForRound, getRacerName } from '@/lib/db/races';
import { supabase } from '@/lib/supabaseClient';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Match = {
  id: string;
  player1: string;
  player2: string;
  time: string;
};

const roundKeys = ['round1', 'round2', 'semifinals', 'finals'] as const;
type RoundKey = typeof roundKeys[number];

const initialRounds: Record<RoundKey, (Match | null)[]> = {
  round1: [],
  round2: Array(8).fill(null),
  semifinals: Array(4).fill(null),
  finals: Array(2).fill(null),
};

export default function Bracket() {
  const [selectedRound, setSelectedRound] = useState<RoundKey>('round1');
  const [rounds, setRounds] = useState(initialRounds);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [hasSubmittedPicks, setHasSubmittedPicks] = useState(false);
  const { selectedAccount } = useAuthorization();

  const raceId = '366f9ebb-c1d4-48f1-9ae0-8fcf5768ee58'; // TODO: dynamic

  // Load matches
  useEffect(() => {
    const load = async () => {
      const rawMatches = await getMatchesForRound(1);

      const enriched: Match[] = await Promise.all(
        rawMatches.map(async (m: any) => {
          const player1 = await getRacerName(m.racer_a_id);
          const player2 = await getRacerName(m.racer_b_id);
          return {
            id: m.id,
            player1,
            player2,
            time: new Date(m.created_at).toLocaleString(),
          };
        })
      );

      setRounds(prev => ({
        ...prev,
        round1: enriched,
      }));
    };

    const loadSelections = async () => {
      const { data } = await supabase
        .from('race_selections')
        .select('selections')
        .eq('wallet_address', selectedAccount?.publicKey)
        .eq('race_id', raceId)
        .maybeSingle();

      if (data?.selections) {
        const parsed = JSON.parse(data.selections);
        const resolved: Record<string, string> = {};
        for (const matchId of Object.keys(parsed)) {
          const racerId = parsed[matchId];
          const { data: racer } = await supabase
            .from('racers')
            .select('name')
            .eq('id', racerId)
            .single();
          resolved[matchId] = racer?.name ?? 'Unknown';
        }
        setPicks(resolved);
        setHasSubmittedPicks(true);
      }
    };

    load();
    loadSelections();
  }, []);

  // Determine which round is active based on seeds
  const activeRound = useMemo(() => {
    for (const r of roundKeys) {
      const hasSeeds = rounds[r]?.some(m => m !== null);
      if (hasSeeds) return r;
    }
    return 'round1';
  }, [rounds]);

  const roundStatusMap = useMemo(() => {
    return roundKeys.reduce((acc, r) => {
      if (r === activeRound) acc[r] = 'active';
      else if (roundKeys.indexOf(r) < roundKeys.indexOf(activeRound)) acc[r] = 'past';
      else acc[r] = 'future';
      return acc;
    }, {} as Record<RoundKey, 'past' | 'active' | 'future'>);
  }, [activeRound]);

  const handlePick = (matchId: string, player: string) => {
    if (hasSubmittedPicks || selectedRound !== activeRound) return;
    setPicks(prev => ({ ...prev, [matchId]: player }));
  };

  const handleSubmit = async () => {
    try {
      const racerIdMap: Record<string, string> = {};
      for (const matchId of Object.keys(picks)) {
        const name = picks[matchId];
        const { data } = await supabase
          .from('racers')
          .select('id')
          .eq('name', name)
          .single();
        if (!data) throw new Error(`Missing racer "${name}"`);
        racerIdMap[matchId] = data.id;
      }
      await submitRacePicks({ raceId, picks: racerIdMap });
      setHasSubmittedPicks(true);
      alert('Picks submitted!');
    } catch (err) {
      console.error(err);
      alert('Submit failed. See console.');
    }
  };

  const renderMatch = (match: Match | null, index: number) => {
    const locked = roundStatusMap[selectedRound] !== 'active' || hasSubmittedPicks;

    if (!match) {
      return (
        <View key={index} style={lockedCardStyle}>
          <Text style={lockedTextStyle}>LOCKED</Text>
          <Text style={dimText}>My pick: N/A</Text>
          <Text style={dimText}>Beats: N/A</Text>
          <Text style={{ fontSize: 24, color: '#888' }}>🔒</Text>
        </View>
      );
    }

    const selectedPlayer = picks[match.id];
    const renderPlayer = (player: string) => {
      const isSelected = selectedPlayer === player;
      return (
        <TouchableOpacity
          key={player}
          disabled={locked}
          onPress={() => handlePick(match.id, player)}
          style={{
            backgroundColor: isSelected ? '#2e2e2e' : '#2a2a2a',
            padding: 8,
            borderRadius: 6,
            marginBottom: 6,
          }}
        >
          <Text style={{ color: isSelected ? '#DAA520' : '#fff' }}>{player}</Text>
        </TouchableOpacity>
      );
    };

    return (
      <View key={match.id} style={cardStyle}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#DAA520', fontWeight: 'bold' }}>
            {locked ? 'LOCKED' : 'OPEN'}
          </Text>
          {renderPlayer(match.player1)}
          {renderPlayer(match.player2)}
          <Text style={dimText}>{match.time}</Text>
        </View>
        <View style={{ width: 80, alignItems: 'center' }}>
          {selectedPlayer ? (
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17l-5-5"
                stroke="#DAA520"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : (
            <View style={emptyCircle} />
          )}
          <Text style={dimText}>My pick:</Text>
          <Text style={{ color: '#fff', fontSize: 10 }}>{selectedPlayer || 'N/A'}</Text>
          <Text style={dimText}>Beats:</Text>
          <Text style={{ color: '#fff', fontSize: 10 }}>
            {selectedPlayer
              ? selectedPlayer === match.player1
                ? match.player2
                : match.player1
              : 'N/A'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <TabPageLayout>
      <ScrollView style={{ backgroundColor: '#0E0E0E' }} contentContainerStyle={{ padding: 16 }}>
        {/* Tabs */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
          {roundKeys.map(r => (
            <TouchableOpacity key={r} onPress={() => setSelectedRound(r)}>
              <Text
                style={{
                  color: selectedRound === r ? '#DAA520' : '#888',
                  fontSize: 16,
                  fontWeight: 'bold',
                  borderBottomWidth: selectedRound === r ? 2 : 0,
                  borderBottomColor: '#DAA520',
                  paddingBottom: 4,
                  textAlign: 'center',
                }}
              >
                {r.toUpperCase()}
                {'\n'}
                <Text style={{ fontSize: 10 }}>
                  {roundStatusMap[r] === 'active'
                    ? 'ACTIVE'
                    : roundStatusMap[r] === 'past'
                    ? 'LOCKED'
                    : 'COMING SOON'}
                </Text>
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Matches */}
        {rounds[selectedRound].map(renderMatch)}

        {/* Submit button */}
        {roundStatusMap[selectedRound] === 'active' && !hasSubmittedPicks && (
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: '#DAA520',
              borderRadius: 10,
              padding: 12,
              marginTop: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#0E0E0E', fontWeight: 'bold', fontSize: 16 }}>
              Submit Picks
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </TabPageLayout>
  );
}

// Styles
const cardStyle = {
  backgroundColor: '#1e1e1e',
  borderRadius: 12,
  padding: 12,
  marginBottom: 16,
  flexDirection: 'row',
} as const;

const lockedCardStyle = {
  ...cardStyle,
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 100,
};

const lockedTextStyle = {
  color: '#DAA520',
  fontWeight: 'bold',
  marginBottom: 6,
};

const dimText = { color: '#888', fontSize: 10 };

const emptyCircle = {
  width: 24,
  height: 24,
  borderRadius: 12,
  borderColor: '#DAA520',
  borderWidth: 2,
  marginBottom: 8,
};
