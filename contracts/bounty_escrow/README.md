# Soroban Project

## Project Structure

This repository uses the recommended structure for a Soroban project:

```text
.
├── contracts
│   └── hello_world
│       ├── src
│       │   ├── lib.rs
│       │   └── test.rs
│       └── Cargo.toml
├── Cargo.toml
└── README.md
## Features
- **Escrow Management**: Securely lock funds for specific recipients.
- **Refund Logic**: Support partial and full refunds to the depositor.
- **Optional Claim Window**: Configure a time window (ledgers) for recipients to claim funds. If not claimed, funds can be reverted.

## Key Functions

### Standard Operations
- `lock_funds`: Deposit and lock tokens for a recipient.
- `release_funds`: Release locked funds to the recipient.
- `initiate_refund`: Start the refund process.

### Claim Window Operations
- `set_claim_config(validity_ledgers)`: Enable the claim window for future releases.
- `claim(escrow_id)`: Recipient claims their released funds.
- `cancel_pending_claim(escrow_id)`: Admin/Depositor cancels an expired claim.

- New Soroban contracts can be put in `contracts`, each in their own directory. There is already a `hello_world` contract in there to get you started.
- If you initialized this project with any other example contracts via `--with-example`, those contracts will be in the `contracts` directory as well.
- Contracts should have their own `Cargo.toml` files that rely on the top-level `Cargo.toml` workspace for their dependencies.
- Frontend libraries can be added to the top-level directory as well. If you initialized this project with a frontend template via `--frontend-template` you will have those files already included.
```
