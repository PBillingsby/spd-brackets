import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey, Transaction } from '@solana/web3.js';

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.152:3000'
  : 'https://your-production-server.com';

export const formatSolanaAddress = (input: string | PublicKey) => {
  if (!input) return '';

  const address = typeof input === 'string' ? input : input.toBase58();

  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-5)}`;
};

export async function submitPayment(
  walletAddress: PublicKey,
): Promise<string> {
  try {
    console.log('Making API call to:', `${API_BASE_URL}/api/transactions/create-transaction`);
    
    // Step 1: Create server-signed transaction
    const createRes = await fetch(`${API_BASE_URL}/api/transactions/create-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderPublicKey: walletAddress.toBase58() }),
    });

    console.log('Create response status:', createRes.status);

    if (!createRes.ok) {
      const responseText = await createRes.text();
      console.log('Error response:', responseText);
      throw new Error(`Server error: ${createRes.status} - ${responseText}`);
    }

    const { transaction, blockhash, lastValidBlockHeight } = await createRes.json();
    console.log('Transaction created successfully');

    // Step 2: Sign transaction using Mobile Wallet Adapter
    const signedTx = await transact(async (wallet) => {
      // Authorize the wallet session
      await wallet.authorize({
        identity: { name: 'March Madness App', uri: 'https://example.com' },
        chain: 'solana:devnet',
      });

      // Parse transaction once
      const tx = Transaction.from(Buffer.from(transaction, 'base64'));
      
      const signedTxs = await wallet.signTransactions({
        transactions: [tx],
      });

      return signedTxs[0];
    });

    console.log('Transaction signed successfully');

    // Step 3: Send to verify-and-submit (FIXED: added /transactions/ to path)
    const verifyRes = await fetch(`${API_BASE_URL}/api/transactions/verify-and-submit-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction: signedTx.serialize().toString('base64'),
        userData: {
          walletAddress: walletAddress.toBase58(),
        },
        blockhash,
        lastValidBlockHeight,
      }),
    });

    if (!verifyRes.ok) {
      const responseText = await verifyRes.text();
      console.log('Verify error response:', responseText);
      throw new Error(`Verification failed: ${verifyRes.status} - ${responseText}`);
    }

    const { signature } = await verifyRes.json();
    console.log('Transaction submitted successfully:', signature);
    return signature;
  } catch (err: any) {
    console.error('submitPayment error:', err.message);
    throw err;
  }
}