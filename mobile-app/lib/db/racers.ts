import { supabase } from '../supabaseClient';

export async function getAllRacers() {
  const { data, error } = await supabase
    .from('racers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getRacerById(id: string) {
  const { data, error } = await supabase
    .from('racers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getRacerByName(name: string) {
  const { data, error } = await supabase
    .from('racers')
    .select('*')
    .ilike('name', name) // Case-insensitive match
    .single();

  if (error) throw error;
  return data;
}
