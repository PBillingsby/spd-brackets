import { PublicKey } from '@solana/web3.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useConnection } from '../solana/solana-provider';

// Mock USDC mint address on devnet
const USDC_MINT = new PublicKey('DJBQS9SCLe63SJnJJjTMupwAM2a1DgiA15tosFCcAK13')

export function useGetBalanceQueryKey({ address, endpoint }: { address: PublicKey; endpoint: string }) {
  return ['get-balance', { endpoint, address }]
}

export function useGetTokenBalanceQueryKey({
  address,
  endpoint,
  mint,
}: {
  address: PublicKey
  endpoint: string
  mint: PublicKey
}) {
  return ['get-token-balance', { endpoint, address, mint: mint.toBase58() }]
}

export function useGetBalance({ address }: { address: PublicKey }) {
  const connection = useConnection()
  const queryKey = useGetBalanceQueryKey({ address, endpoint: connection.rpcEndpoint })

  return useQuery({
    queryKey,
    queryFn: () => connection.getBalance(address),
  })
}

export function useGetTokenBalance({
  address,
  mint = USDC_MINT,
}: {
  address: PublicKey
  mint?: PublicKey
}) {
  const connection = useConnection()
  const queryKey = useGetTokenBalanceQueryKey({
    address,
    endpoint: connection.rpcEndpoint,
    mint,
  })

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { value } = await connection.getParsedTokenAccountsByOwner(address, {
        mint,
      })

      return (
        value[0]?.account.data.parsed.info.tokenAmount.uiAmount ??
        0 // default to 0 if none found
      )
    },
  })
}

export function useGetBalanceInvalidate({ address }: { address: PublicKey }) {
  const connection = useConnection()
  const queryKey = useGetBalanceQueryKey({ address, endpoint: connection.rpcEndpoint })
  const client = useQueryClient()

  return () => client.invalidateQueries({ queryKey })
}
