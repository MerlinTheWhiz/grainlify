# Design Document

## Overview

This design implements identity-aware transaction limits for the Grainlify escrow system using off-chain signed identity claims. The system enables regulatory compliance and risk management by enforcing different transaction limits based on user verification levels, without storing sensitive personal information on-chain.

The solution uses cryptographic signatures to verify identity claims issued by trusted KYC providers. These claims associate blockchain addresses with identity tiers (Unverified, Basic, Verified, Premium) and risk scores (0-100). The escrow contracts verify claim authenticity and enforce tier-appropriate limits on all fund operations.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Identity-Aware Limits System                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Off-Chain Components:                                          │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  KYC Provider    │────────▶│  Claim Issuer    │            │
│  │  (Didit, etc.)   │         │  (Backend)       │            │
│  └──────────────────┘         └────────┬─────────┘            │
│                                         │                        │
│                                         │ Signs Claims           │
│                                         ▼                        │
│                              ┌──────────────────┐               │
│                              │  Identity Claim  │               │
│                              │  {address, tier, │               │
│                              │   risk, expiry,  │               │
│                              │   signature}     │               │
│                              └────────┬─────────┘               │
│                                       │                          │
│  ─────────────────────────────────────┼──────────────────────  │
│                                       │ Submit Claim             │
│  On-Chain Components:                 ▼                          │
│  ┌────────────────────────────────────────────────────┐         │
│  │           Escrow Contract (Soroban)                │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  Identity Verification Module                │ │         │
│  │  │  - Verify claim signature                    │ │         │
│  │  │  - Check claim expiry                        │ │         │
│  │  │  - Store address identity data               │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  Limit Enforcement Module                    │ │         │
│  │  │  - Calculate effective limits                │ │         │
│  │  │  - Apply tier-based limits                   │ │         │
│  │  │  - Apply risk-adjusted limits                │ │         │
│  │  │  - Reject over-limit transactions            │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  Storage                                     │ │         │
│  │  │  - Authorized issuers                        │ │         │
│  │  │  - Address identity data                     │ │         │
│  │  │  - Tier limit configuration                  │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
1. User completes KYC with provider (Didit)
2. Backend receives KYC verification webhook
3. Backend generates identity claim with tier and risk score
4. Backend signs claim with issuer private key
5. User receives signed claim
6. User submits claim to escrow contract
7. Contract verifies signature against authorized issuer
8. Contract checks claim expiry
9. Contract stores identity tier and risk score for address
10. On transaction attempt:
    a. Contract retrieves address identity data
    b. Contract calculates effective limit (min of tier limit and risk-adjusted limit)
    c. Contract compares transaction amount to effective limit
    d. Contract approves or rejects transaction
```

## Components and Interfaces

### 1. Identity Claim Structure

```rust
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct IdentityClaim {
    pub address: Address,
    pub tier: IdentityTier,
    pub risk_score: u32,  // 0-100
    pub expiry: u64,      // Unix timestamp
    pub issuer: Address,  // Issuer public key
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum IdentityTier {
    Unverified = 0,
    Basic = 1,
    Verified = 2,
    Premium = 3,
}
```

### 2. Address Identity Data Storage

```rust
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AddressIdentity {
    pub tier: IdentityTier,
    pub risk_score: u32,
    pub expiry: u64,
    pub last_updated: u64,
}

// Storage key
#[contracttype]
pub enum DataKey {
    // ... existing keys ...
    AddressIdentity(Address),
    AuthorizedIssuer(Address),
    TierLimits,
    RiskThresholds,
}
```

### 3. Limit Configuration

```rust
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TierLimits {
    pub unverified_limit: i128,
    pub basic_limit: i128,
    pub verified_limit: i128,
    pub premium_limit: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RiskThresholds {
    pub high_risk_threshold: u32,  // e.g., 70
    pub high_risk_multiplier: u32, // e.g., 50 (50% of tier limit)
}
```

### 4. Contract Functions

#### Admin Functions

```rust
/// Set or update an authorized claim issuer
pub fn set_authorized_issuer(
    env: Env,
    issuer: Address,
    authorized: bool
) -> Result<(), Error>

/// Configure tier-based transaction limits
pub fn set_tier_limits(
    env: Env,
    unverified: i128,
    basic: i128,
    verified: i128,
    premium: i128
) -> Result<(), Error>

/// Configure risk-based adjustments
pub fn set_risk_thresholds(
    env: Env,
    high_risk_threshold: u32,
    high_risk_multiplier: u32
) -> Result<(), Error>
```

#### User Functions

```rust
/// Submit an identity claim for verification and storage
pub fn submit_identity_claim(
    env: Env,
    claim: IdentityClaim,
    signature: BytesN<64>
) -> Result<(), Error>

/// Query identity data for an address
pub fn get_address_identity(
    env: Env,
    address: Address
) -> AddressIdentity

/// Query effective transaction limit for an address
pub fn get_effective_limit(
    env: Env,
    address: Address
) -> i128
```

#### Internal Functions

```rust
/// Verify claim signature
fn verify_claim_signature(
    env: &Env,
    claim: &IdentityClaim,
    signature: &BytesN<64>
) -> Result<(), Error>

/// Check if claim has expired
fn is_claim_expired(
    env: &Env,
    expiry: u64
) -> bool

/// Calculate effective limit based on tier and risk
fn calculate_effective_limit(
    env: &Env,
    identity: &AddressIdentity
) -> i128

/// Enforce limit on transaction
fn enforce_transaction_limit(
    env: &Env,
    address: &Address,
    amount: i128
) -> Result<(), Error>
```

### 5. Off-Chain Helper Module

```rust
// In backend/internal/identity/claims.go

type IdentityClaim struct {
    Address   string
    Tier      IdentityTier
    RiskScore uint32
    Expiry    uint64
    Issuer    string
}

type IdentityTier uint32

const (
    TierUnverified IdentityTier = 0
    TierBasic      IdentityTier = 1
    TierVerified   IdentityTier = 2
    TierPremium    IdentityTier = 3
)

// Create a new identity claim
func CreateClaim(
    address string,
    tier IdentityTier,
    riskScore uint32,
    validityDuration time.Duration
) (*IdentityClaim, error)

// Sign a claim with issuer private key
func SignClaim(
    claim *IdentityClaim,
    privateKey ed25519.PrivateKey
) ([]byte, error)

// Verify a claim signature
func VerifyClaim(
    claim *IdentityClaim,
    signature []byte,
    publicKey ed25519.PublicKey
) error

// Serialize claim for signing
func SerializeClaim(claim *IdentityClaim) ([]byte, error)
```

## Data Models

### Storage Layout

```
Contract Storage:
├── DataKey::AuthorizedIssuer(Address) → bool
│   └── Maps issuer addresses to authorization status
├── DataKey::AddressIdentity(Address) → AddressIdentity
│   └── Maps user addresses to their identity data
├── DataKey::TierLimits → TierLimits
│   └── Stores transaction limits for each tier
└── DataKey::RiskThresholds → RiskThresholds
    └── Stores risk score thresholds and multipliers
```

### Claim Serialization Format

For deterministic signature verification, claims are serialized using XDR encoding:

```
Serialized Claim = XDR_encode(
    address_bytes,
    tier_u32,
    risk_score_u32,
    expiry_u64,
    issuer_bytes
)
```

### Signature Scheme

- Algorithm: Ed25519
- Signature: 64 bytes
- Public Key: 32 bytes
- Message: Serialized claim data

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Issuer authorization updates replace previous values
*For any* issuer address, when an administrator updates the issuer authorization status, the new status should replace the previous status.
**Validates: Requirements 1.2**

### Property 2: Claim signature verification uses authorized issuer
*For any* submitted claim, the signature verification should check against the stored authorized issuer public key.
**Validates: Requirements 1.3**

### Property 3: Authorized issuer list maintains consistency
*For any* sequence of issuer additions and removals, the system should maintain an accurate list of currently authorized issuers.
**Validates: Requirements 1.4**

### Property 4: Removed issuers cannot sign valid claims
*For any* issuer that has been removed from the authorized list, all claims signed by that issuer should be rejected.
**Validates: Requirements 1.5**

### Property 5: Claims contain all required fields
*For any* created identity claim, it should include address, identity tier, risk score, expiry timestamp, and issuer.
**Validates: Requirements 2.1**

### Property 6: Claim signatures are cryptographically valid
*For any* claim signed with an issuer's private key, the signature should be verifiable with the corresponding public key.
**Validates: Requirements 2.2**

### Property 7: Modified claim data invalidates signature
*For any* claim with a valid signature, modifying any field in the claim data should cause signature verification to fail.
**Validates: Requirements 2.3**

### Property 8: Claim expiry must be in the future
*For any* newly created claim, the expiry timestamp should be greater than the current timestamp.
**Validates: Requirements 2.4**

### Property 9: Claim serialization round-trip consistency
*For any* identity claim, serializing then deserializing should produce an equivalent claim structure.
**Validates: Requirements 2.5**

### Property 10: Valid claim signatures are accepted
*For any* claim with a valid signature from an authorized issuer and non-expired timestamp, the system should accept and process the claim.
**Validates: Requirements 3.1**

### Property 11: Invalid signatures preserve current state
*For any* claim with an invalid signature, the submission should be rejected and the address's current identity tier should remain unchanged.
**Validates: Requirements 3.2**

### Property 12: Expired claims are rejected
*For any* claim where the current timestamp exceeds the expiry timestamp, the system should reject the claim.
**Validates: Requirements 3.3**

### Property 13: Valid claims update identity data
*For any* valid claim submission, the system should store the tier and risk score for the address.
**Validates: Requirements 3.4**

### Property 14: New claims replace previous claims
*For any* address with existing identity data, submitting a new valid claim should replace all previous claim data.
**Validates: Requirements 3.5**

### Property 15: Tier-based limits are enforced correctly
*For any* user with an identity tier, transactions should be limited according to the configured limit for that tier.
**Validates: Requirements 4.2, 4.3, 4.4**

### Property 16: Over-limit transactions are rejected
*For any* transaction where the amount exceeds the user's effective limit, the system should reject the transaction.
**Validates: Requirements 4.5**

### Property 17: Risk scores are stored with identity data
*For any* claim that includes a risk score, the system should store the risk score alongside the tier and expiry.
**Validates: Requirements 5.1**

### Property 18: High risk scores reduce limits
*For any* address with a risk score exceeding the high-risk threshold, the effective transaction limit should be reduced according to the risk multiplier.
**Validates: Requirements 5.2**

### Property 19: Low risk scores use standard limits
*For any* address with a risk score below the high-risk threshold, the effective limit should equal the tier-based limit.
**Validates: Requirements 5.3**

### Property 20: Effective limit is minimum of tier and risk-adjusted limits
*For any* address, the effective transaction limit should be the minimum of the tier-based limit and the risk-adjusted limit.
**Validates: Requirements 5.4**

### Property 21: Updated risk scores immediately affect limits
*For any* address, when a new claim updates the risk score, the next limit calculation should use the new risk score.
**Validates: Requirements 5.5**

### Property 22: Query returns stored identity data
*For any* address with a submitted claim, querying the identity should return the stored tier, risk score, and expiry.
**Validates: Requirements 7.1**

### Property 23: Effective limit query matches calculation
*For any* address, the returned effective limit should match the calculated limit based on tier and risk score.
**Validates: Requirements 7.4**

### Property 24: Claim validity check reflects expiry status
*For any* address, the validity check should return true if the claim is not expired and false if it is expired.
**Validates: Requirements 7.5**

### Property 25: Valid claim submission emits event
*For any* valid claim submission, the system should emit an event containing the address, tier, risk score, and expiry.
**Validates: Requirements 8.1**

### Property 26: Rejected claims emit rejection event
*For any* rejected claim, the system should emit an event containing the address and rejection reason.
**Validates: Requirements 8.2**

### Property 27: Expired claims emit expiry event
*For any* transaction attempt with an expired claim, the system should emit an event indicating the expiry.
**Validates: Requirements 8.3**

### Property 28: Limit enforcement emits event
*For any* transaction, the system should emit an event indicating whether the limit check passed or failed.
**Validates: Requirements 8.4**

### Property 29: Issuer management emits events
*For any* issuer addition or removal, the system should emit an event containing the issuer public key and the action taken.
**Validates: Requirements 8.5**

### Property 30: Off-chain helper generates valid claim structure
*For any* claim created by the off-chain helper, it should contain all required fields in the correct format.
**Validates: Requirements 9.1**

### Property 31: Off-chain signature is on-chain compatible
*For any* claim signed off-chain, the signature should be verifiable by the on-chain contract.
**Validates: Requirements 9.2**

### Property 32: Off-chain and on-chain verification consistency
*For any* claim and signature, off-chain verification and on-chain verification should produce the same result.
**Validates: Requirements 9.3**

### Property 33: Off-chain and on-chain serialization consistency
*For any* claim, off-chain serialization and on-chain serialization should produce identical byte sequences.
**Validates: Requirements 9.4**

### Property 34: Test utilities generate valid claims
*For any* test claim generated by the helper utilities, it should have a valid signature and be acceptable to the contract.
**Validates: Requirements 9.5**

### Property 35: Valid claims are accepted
*For any* claim with correct signature and non-expired timestamp, the system should accept it.
**Validates: Requirements 10.1**

### Property 36: Invalid signatures are rejected
*For any* claim with tampered data or wrong issuer signature, the system should reject it.
**Validates: Requirements 10.2**

### Property 37: Expired claims are rejected
*For any* claim where current timestamp exceeds expiry, the system should reject it.
**Validates: Requirements 10.3**

### Property 38: Tier transitions update limits correctly
*For any* sequence of claims with different tiers, the effective limit should update to match the current tier.
**Validates: Requirements 10.4**

### Property 39: Limit enforcement rejects over-limit transactions
*For any* transaction exceeding tier-based or risk-adjusted limits, the system should reject it.
**Validates: Requirements 10.5**

## Error Handling

### Error Types

The contract defines the following error conditions:

```rust
#[contracterror]
#[derive(Clone, Debug, PartialEq)]
#[repr(u32)]
pub enum Error {
    // ... existing errors ...
    InvalidSignature = 100,
    ClaimExpired = 101,
    UnauthorizedIssuer = 102,
    InvalidClaimFormat = 103,
    TransactionExceedsLimit = 104,
    InvalidRiskScore = 105,
    InvalidTier = 106,
}
```

### Error Handling Strategy

1. **Signature Verification Failures**: Return `InvalidSignature` error with no state changes
2. **Expiry Checks**: Return `ClaimExpired` error and revert to default unverified tier
3. **Authorization Checks**: Return `UnauthorizedIssuer` error when issuer is not in authorized list
4. **Format Validation**: Return `InvalidClaimFormat` error for malformed claims
5. **Limit Enforcement**: Return `TransactionExceedsLimit` error with current limit and attempted amount
6. **Input Validation**: Return appropriate errors for invalid risk scores (>100) or tier values

### Error Recovery

- Failed claim submissions do not modify existing identity data
- Expired claims automatically revert addresses to unverified tier
- Invalid transactions are rejected without affecting escrow state
- All errors are logged via events for audit purposes

## Testing Strategy

### Unit Testing

Unit tests will cover specific examples and edge cases:

1. **Initialization Tests**
   - Contract initialization with issuer
   - Setting tier limits and risk thresholds

2. **Edge Case Tests**
   - Unverified users with no claims (default tier)
   - Addresses with expired claims (revert to unverified)
   - Boundary values for risk scores (0, 100)
   - Boundary values for transaction amounts (at limit, just over limit)

3. **Error Condition Tests**
   - Invalid signature formats
   - Expired claim timestamps
   - Unauthorized issuer addresses
   - Malformed claim structures
   - Over-limit transaction attempts

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using the **proptest** crate for Rust:

1. **Signature Properties**
   - Property 6: Valid signatures verify correctly
   - Property 7: Modified data invalidates signatures
   - Property 31: Off-chain signatures work on-chain

2. **State Management Properties**
   - Property 1: Issuer updates replace previous values
   - Property 13: Valid claims update identity data
   - Property 14: New claims replace old claims

3. **Limit Enforcement Properties**
   - Property 15: Tier-based limits are enforced
   - Property 16: Over-limit transactions are rejected
   - Property 20: Effective limit is minimum of tier and risk limits

4. **Serialization Properties**
   - Property 9: Claim serialization round-trip consistency
   - Property 33: Off-chain and on-chain serialization match

5. **Expiry Properties**
   - Property 8: New claims have future expiry
   - Property 12: Expired claims are rejected
   - Property 24: Validity checks reflect expiry status

### Property-Based Testing Configuration

- **Library**: proptest crate for Rust
- **Iterations**: Minimum 100 iterations per property test
- **Tagging**: Each property test must include a comment with format: `// Feature: identity-aware-limits, Property {number}: {property_text}`
- **Generators**: Custom generators for addresses, tiers, risk scores, timestamps, and signatures

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **Complete Claim Lifecycle**
   - Create claim off-chain → Sign → Submit → Verify → Query identity

2. **Limit Enforcement Flow**
   - Submit claim → Attempt transaction → Verify limit enforcement

3. **Tier Transition Flow**
   - Submit basic claim → Verify limits → Submit verified claim → Verify new limits

4. **Expiry Handling Flow**
   - Submit claim → Wait for expiry → Attempt transaction → Verify rejection

### Test Coverage Goals

- 100% coverage of all public contract functions
- All 39 correctness properties implemented as property-based tests
- All error conditions tested with unit tests
- All edge cases covered (unverified users, expired claims, boundary values)

## Security Considerations

### Trust Assumptions

1. **Issuer Trust**: The system trusts authorized issuers to perform proper KYC verification before issuing claims
2. **Signature Security**: Ed25519 signatures are assumed to be cryptographically secure
3. **Admin Trust**: Contract admin is trusted to authorize only legitimate issuers
4. **Time Accuracy**: Ledger timestamps are assumed to be accurate for expiry checks

### Attack Vectors and Mitigations

1. **Signature Forgery**
   - Mitigation: Use Ed25519 cryptographic signatures
   - Verification: All claims verified against authorized issuer public keys

2. **Replay Attacks**
   - Mitigation: Claims include expiry timestamps
   - Verification: Expired claims are rejected

3. **Claim Tampering**
   - Mitigation: Any modification invalidates the signature
   - Verification: Signature covers all claim fields

4. **Unauthorized Issuers**
   - Mitigation: Maintain authorized issuer list
   - Verification: Only claims from authorized issuers are accepted

5. **Limit Bypass Attempts**
   - Mitigation: Limits enforced on all fund operations
   - Verification: Transaction amount checked before execution

### Privacy Considerations

- No personal information stored on-chain
- Only tier and risk score are stored, not KYC details
- Claims can be verified without revealing identity
- Off-chain KYC data remains with provider

## Performance Considerations

### Gas Optimization

1. **Storage Efficiency**
   - Use compact data structures (u32 for risk scores, u64 for timestamps)
   - Store only essential data on-chain

2. **Computation Efficiency**
   - Cache tier limits and risk thresholds
   - Minimize signature verification calls
   - Use efficient XDR serialization

3. **Query Optimization**
   - Provide direct getters for identity data
   - Pre-calculate effective limits when possible

### Scalability

- Each address has independent identity data (no global state bottlenecks)
- Issuer authorization list expected to be small (<10 issuers)
- Claim submissions are infrequent (only when tier changes)
- Limit checks are fast (simple arithmetic operations)

## Deployment and Migration

### Initial Deployment

1. Deploy contract with admin address
2. Set initial tier limits (e.g., unverified: 100, basic: 1000, verified: 10000, premium: 100000)
3. Set risk thresholds (e.g., high_risk: 70, multiplier: 50)
4. Authorize initial claim issuer(s)

### Migration Strategy

For existing escrow contracts:

1. Deploy new identity-aware contract
2. Migrate existing escrows to new contract
3. All addresses start as unverified tier
4. Users submit claims to upgrade tiers
5. Gradually deprecate old contract

### Configuration Updates

- Tier limits can be updated by admin without migration
- Risk thresholds can be adjusted based on operational experience
- Issuers can be added/removed as needed
- No contract redeployment required for configuration changes

## Documentation Requirements

### User Documentation

1. **Claim Submission Guide**
   - How to obtain identity claims from KYC providers
   - How to submit claims to the contract
   - How to verify claim acceptance

2. **Tier Information**
   - Description of each tier
   - Transaction limits for each tier
   - Requirements to achieve each tier

### Developer Documentation

1. **Integration Guide**
   - Off-chain helper API documentation
   - Claim creation and signing examples
   - Contract interaction examples

2. **Testing Guide**
   - How to run property-based tests
   - How to generate test claims
   - How to test limit enforcement

### Operator Documentation

1. **Admin Guide**
   - How to authorize/revoke issuers
   - How to update tier limits
   - How to monitor claim submissions

2. **Monitoring Guide**
   - Key events to monitor
   - Audit log interpretation
   - Troubleshooting common issues

