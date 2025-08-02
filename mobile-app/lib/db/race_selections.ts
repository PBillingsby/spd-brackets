import { submitPayment } from '@/utils/solana';
import { PublicKey } from '@solana/web3.js';
import { supabase } from '../supabaseClient';
import { getUser } from './users';

export async function submitRacePicks({
  walletAddress,
  raceId,
  picks
}: {
  walletAddress: PublicKey | undefined;
  raceId: string;
  picks: Record<string, string>;
}) {
  if (!walletAddress) return;
  const txId = await submitPayment(walletAddress);
  const user = await getUser(walletAddress)
  const { error } = await supabase
    .from('race_selections')
    .insert([
      {
        user_id: user.id,
        race_id: raceId,
        selections: picks,
        is_final: true,
        tx_id: txId,
      }
    ]);

  if (error) {
    console.error('Failed to submit picks:', error);
    throw error;
  }
}

export async function getAllRaceSelectionsByWallet(walletAddress: string | PublicKey) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', walletAddress)
    .single();

  if (userError || !user) throw new Error('User not found');

  const { data, error } = await supabase
    .from('race_selections')
    .select('selections, race_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) throw new Error('No race selections found');

  return data; // array of { selections, race_id, created_at }
}

export async function getRaceNameById(raceId: string): Promise<string> {
  const { data, error } = await supabase
    .from('races')
    .select('name')
    .eq('id', raceId)
    .single();

  if (error || !data) throw new Error('Race not found');
  return data.name;
}

export async function getRacerNamesByIds(
  ids: string[]
): Promise<Record<string, { name: string; total_races: number; races_won: number; win_percentage: number }>> {
  const { data, error } = await supabase
    .from('racers')
    .select('id, name, total_races, races_won, win_percentage')
    .in('id', ids);

  if (error || !data) throw new Error('Could not fetch racer data');

  return data.reduce((acc, curr) => {
    acc[curr.id] = {
      name: curr.name,
      total_races: curr.total_races,
      races_won: curr.races_won,
      win_percentage: curr.win_percentage,
    };
    return acc;
  }, {} as Record<string, { name: string; total_races: number; races_won: number; win_percentage: number }>);
}