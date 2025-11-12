# Identity Stack Scripts

Utility scripts for the Shibarium Identity Stack.

## Generate Verifier DID

Creates an Ethereum-based DID for the verifier backend that is deterministically tied to your Ethereum address.

### Usage

```bash
cd /Users/iamdoraemon/Desktop/github.com/shibaone/identity-stack/js-sdk
WALLET_KEY=0xYourPrivateKeyHere npm run generate:verifier-did
```

### What it does

1. Takes your Ethereum private key as input
2. Generates a DID that is deterministically derived from your Ethereum address
3. Creates a BJJ (Baby JubJub) authentication credential for ZK proof generation
4. Outputs the DID in a format ready to paste into your `.env` file

### Output

The script will display:

- Your Ethereum address
- The generated DID (format: `did:iden3:shibarium:testnet:...`)
- The authentication credential ID
- Instructions for adding to your `.env` file

### Key Features

- **Deterministic**: Same Ethereum address always generates the same DID
- **Tied to Address**: The DID is cryptographically bound to your Ethereum address
- **Reproducible**: Can regenerate the same DID anytime using the same private key

### Environment Setup

You can also create a `.env` file in the `js-sdk` directory:

```bash
WALLET_KEY=0xYourPrivateKeyHere
```

Then run without the inline variable:

```bash
npm run generate:verifier-did
```

### Adding to Verifier Backend

After generation, copy the DID output and add it to:

```
/Users/iamdoraemon/Desktop/github.com/shibaone/identity-stack/verifier-backend/.env
```

As:

```bash
VERIFIER_BACKEND_SHIB_TESTNET_SENDER_DID=did:iden3:shibarium:testnet:YOUR_DID_HERE
```

### Security Notes

- Never commit your private key to version control
- Keep your `.env` files in `.gitignore`
- Fund your Ethereum address with BONE tokens for Puppynet transactions
- The same private key will always generate the same DID (useful for backup/recovery)
