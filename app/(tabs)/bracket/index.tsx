import { TabPageLayout } from '@/components/layouts/TabPageLayout';
import { useAuthorization } from '@/components/solana/use-authorization';
import { submitRacePicks } from '@/lib/db/race_selections';
import { getMatchesForRound, getRacerName } from '@/lib/db/races';
import { supabase } from '@/lib/supabaseClient';
import { BlurView } from 'expo-blur';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState<boolean>();
  const [modalVisible, setModalVisible] = useState<boolean>(true);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [hasSubmittedPicks, setHasSubmittedPicks] = useState(false);
  const { selectedAccount } = useAuthorization();
  const scrollViewRef = useRef<ScrollView>(null);

  const raceId = '366f9ebb-c1d4-48f1-9ae0-8fcf5768ee58'; // TODO: dynamic

  // Load matches
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
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
      setIsLoading(false)
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

  const [currentScrollY, setCurrentScrollY] = useState(0);

  const handlePick = (matchId: string, player: string) => {
    if (hasSubmittedPicks || selectedRound !== activeRound) return;
  
    setPicks(prev => {
      const isAlreadySelected = prev[matchId] === player;
      const newPicks = { ...prev };
  
      if (isAlreadySelected) {
        // Unselect if the same player was already selected
        delete newPicks[matchId];
      } else {
        // Select the player
        newPicks[matchId] = player;
      }
  
      // Simple scroll down by a fixed amount
      setTimeout(() => {
        if (scrollViewRef.current) {
          const cardHeight = 140;
          const newScrollY = currentScrollY + cardHeight;
          scrollViewRef.current.scrollTo({ y: newScrollY, animated: true });
          setCurrentScrollY(newScrollY);
        }
      }, 100);
  
      return newPicks;
    });
  };

  const handleSubmit = async () => {
    try {
      // Check if all matches in the current round are picked
      const currentRoundMatches = rounds[selectedRound].filter((m): m is Match => m !== null);
      const unpicked = currentRoundMatches.some(match => !picks[match.id]);
  
      if (unpicked) {
        alert('Please make a selection for every match in this round before submitting.');
        return;
      }
  
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
  
      await submitRacePicks({
        walletAddress: selectedAccount?.publicKey,
        raceId,
        picks: racerIdMap,
      });
  
      setHasSubmittedPicks(true);
      alert('Picks submitted!');
    } catch (err) {
      console.error(err);
      alert('Submit failed. See console.');
    }
  };
  
  
  const handleRoundMap = (round: string): string => {
    const keyMapping: Record<string, string> = {
      round1: 'Round 1',
      round2: 'Round 2',
      semifinals: 'Semi Finals',
      finals: 'Finals',
    };
  
    return keyMapping[round] || round; // fallback to original if not found
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
          <Text style={[playerTextStyle, { color: isSelected ? '#DAA520' : '#fff' }]}>
            {player}
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <View key={match.id}>
        <View style={cardStyle}>
          <View style={{ flex: 1 }}>
            <Text style={statusTextStyle}>
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
            <Text style={pickDisplayTextStyle}>{selectedPlayer || 'N/A'}</Text>
            <Text style={dimText}>Beats:</Text>
            <Text style={pickDisplayTextStyle}>
              {selectedPlayer
                ? selectedPlayer === match.player1
                  ? match.player2
                  : match.player1
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <TabPageLayout>
      <ScrollView
        ref={scrollViewRef}
        style={{ backgroundColor: '#0E0E0E' }}
        contentContainerStyle={{ padding: 16 }}
        onScroll={(event) => {
          setCurrentScrollY(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
      {isLoading ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={loadingTextStyle}>Loading...</Text>
        </View>
      ) : (
        <>
          {/* Round selector */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
            {roundKeys.map(r => (
              <TouchableOpacity key={r} onPress={() => setSelectedRound(r)}>
                <Text style={[
                  roundTextStyle,
                  {
                    color: selectedRound === r ? '#DAA520' : '#888',
                    borderBottomWidth: selectedRound === r ? 2 : 0,
                    borderBottomColor: '#DAA520',
                  }
                ]}>
                  {handleRoundMap(r)}
                  {'\n'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
              <Text style={submitButtonTextStyle}>
                Submit Picks
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
      {modalVisible && (
        <BlurView
          intensity={50}
          tint="dark"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
          }}
        >
          <View
            style={{
              backgroundColor: '#1e1e1e',
              padding: 24,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#DAA520',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text
              style={{
                color: '#DAA520',
                fontSize: 18,
                fontFamily: 'Semplicita-Bold',
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              {modalMessage}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: '#DAA520',
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontFamily: 'Semplicita', color: '#0E0E0E', fontSize: 16 }}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      )}

      </ScrollView>
    </TabPageLayout>
  );
}

// Styles with Semplicita fonts
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
  fontFamily: 'Semplicita-Bold',
  marginBottom: 6,
};

const statusTextStyle = {
  color: '#DAA520',
  fontFamily: 'Semplicita-Bold',
};

const playerTextStyle = {
  fontFamily: 'Semplicita',
};

const dimText = { 
  color: '#888', 
  fontSize: 10,
  fontFamily: 'Semplicita'
};

const pickDisplayTextStyle = {
  color: '#fff',
  fontSize: 10,
  fontFamily: 'Semplicita'
};

const loadingTextStyle = {
  color: '#DAA520',
  fontSize: 16,
  fontFamily: 'Semplicita'
};

const roundTextStyle = {
  fontSize: 16,
  fontFamily: 'Semplicita',
  paddingBottom: 4,
  textAlign: 'center',
};

const submitButtonTextStyle = {
  color: '#0E0E0E',
  fontFamily: 'Semplicita',
  fontSize: 16,
};

const emptyCircle = {
  width: 24,
  height: 24,
  borderRadius: 12,
  borderColor: '#DAA520',
  borderWidth: 2,
  marginBottom: 8,
};