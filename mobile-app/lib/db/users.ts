import { PublicKey } from '@solana/web3.js';
import { supabase } from '../supabaseClient';

export async function createUser(walletAddress: string) {
  const { data, error } = await supabase
    .from('users')
    .insert({ wallet_address: walletAddress })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(walletAddress: string | PublicKey, updates: {
  username?: string;
  profile_image?: string;
}) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('wallet_address', walletAddress);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}


export async function getUser(walletAddress: PublicKey | undefined) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()

  if (error) throw error
  return data
}

export async function ensureUserExists(publicKey: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', publicKey)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  if (!data) {
    return createUser(publicKey)
  }
}

