import { supabase } from '../supabaseClient';

export async function getMatchesForRound(round: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      match_number,
      created_at,
      racer_a_id,
      racer_b_id
    `)
    .eq('round', round)
    .order('match_number', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getRacerName(id: string): Promise<string> {
  const { data, error } = await supabase
    .from('racers')
    .select('name')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching racer name for id ${id}:`, error);
    return 'Unknown';
  }

  return data.name;
}