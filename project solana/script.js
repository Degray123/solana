document.addEventListener('DOMContentLoaded', () => {
    const connectWalletButton = document.getElementById('connect-wallet-btn');
    const walletStatusElement = document.getElementById('wallet-status');

    let wallet; // To store the connected wallet adapter
    let publicKey; // To store the connected public key

    // Function to update the wallet status in the UI
    const updateWalletStatus = (status, address = null) => {
        walletStatusElement.textContent = status;
        if (address) {
            walletStatusElement.textContent += ` (${address.slice(0, 6)}...${address.slice(-4)})`;
        }
    };

    // --- Phantom Wallet Specific Logic ---
    const connectPhantomWallet = async () => {
        if (!window.phantom?.solana) {
            updateWalletStatus('Phantom wallet not detected. Please install it.');
            return;
        }

        try {
            const resp = await window.phantom.solana.connect();
            publicKey = new solanaWeb3.PublicKey(resp.publicKey.toString()); // Convert to web3 PublicKey
            updateWalletStatus('Connected', publicKey.toBase58());
            console.log('Connected with Phantom:', publicKey.toBase58());

            // You can now perform other actions with the connected publicKey
            // For example, fetching balance or sending transactions.

            // Subscribe to account changes (optional)
            window.phantom.solana.on('accountChanged', (newPublicKey) => {
                if (newPublicKey) {
                    publicKey = new solanaWeb3.PublicKey(newPublicKey.toString());
                    updateWalletStatus('Connected', publicKey.toBase58());
                    console.log('Phantom account changed to:', publicKey.toBase58());
                } else {
                    updateWalletStatus('Not Connected');
                    publicKey = null;
                    console.log('Phantom wallet disconnected');
                }
            });

            // Subscribe to disconnect events (optional)
            window.phantom.solana.on('disconnect', () => {
                updateWalletStatus('Not Connected');
                publicKey = null;
                console.log('Phantom wallet disconnected');
            });

        } catch (err) {
            console.error('Failed to connect with Phantom:', err);
            updateWalletStatus(`Connection failed: ${err?.message || 'Unknown error'}`);
        }
    };

    // Event listener for the connect button
    connectWalletButton.addEventListener('click', connectPhantomWallet);

    // Check if already connected on page load (Phantom's way)
    const checkPhantomConnection = async () => {
        if (window.phantom?.solana?.isConnected) {
            try {
                const resp = await window.phantom.solana.connect({ onlyIfTrusted: true });
                if (resp?.publicKey) {
                    publicKey = new solanaWeb3.PublicKey(resp.publicKey.toString());
                    updateWalletStatus('Connected', publicKey.toBase58());
                    console.log('Phantom wallet already connected:', publicKey.toBase58());
                } else {
                    updateWalletStatus('Not Connected');
                    publicKey = null;
                    console.log('Phantom wallet not trusted or not connected.');
                }
            } catch (error) {
                console.error('Error checking Phantom connection:', error);
                updateWalletStatus('Not Connected');
                publicKey = null;
            }
        } else {
            updateWalletStatus('Not Connected');
            publicKey = null;
            console.log('Phantom wallet not connected.');
        }
    };

    checkPhantomConnection();
});