# Requirements Document

## Introduction

This feature enables the Grainlify escrow system to enforce identity-aware limits on transactions based on off-chain identity verification claims. The system will accept cryptographically signed claims from trusted identity providers (such as KYC services) that attach identity tiers or risk scores to blockchain addresses. Different transaction limits will be enforced based on these identity tiers, enabling regulatory compliance and risk management without performing identity verification directly on-chain.

## Glossary

- **Identity Claim**: A cryptographically signed assertion that associates a blockchain address with an identity tier, risk score, and validity period
- **Identity Tier**: A classification level (e.g., Unverified, Basic, Verified, Premium) that determines transaction limits
- **Claim Issuer**: A trusted off-chain entity (e.g., KYC service provider) authorized to sign identity claims
- **Claim Signature**: A cryptographic signature proving the authenticity and integrity of an identity claim
- **Risk Score**: A numerical value (0-100) indicating the risk level associated with an address
- **Escrow Contract**: The Soroban smart contract that manages locked funds and enforces transaction limits
- **Program Escrow Contract**: The Soroban smart contract that manages program-level prize pools with identity-aware limits
- **Claim Expiry**: The timestamp after which an identity claim is no longer valid
- **Transaction Limit**: The maximum amount that can be transferred in a single transaction or within a time period based on identity tier
- **Claim Verification**: The process of validating a claim's signature, expiry, and issuer authorization

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to designate trusted identity claim issuers, so that only authorized entities can provide identity verification claims.

#### Acceptance Criteria

1. WHEN the Escrow Contract is initialized THEN the system SHALL store the authorized claim issuer's public key
2. WHEN an administrator updates the claim issuer THEN the system SHALL replace the existing issuer public key with the new one
3. WHEN a claim is submitted THEN the system SHALL verify the signature against the stored issuer public key
4. WHERE multiple issuers are supported THEN the system SHALL maintain a list of authorized issuer public keys
5. WHEN an issuer is removed from the authorized list THEN the system SHALL reject all subsequent claims signed by that issuer

### Requirement 2

**User Story:** As an identity provider, I want to issue signed claims that associate addresses with identity tiers, so that users can prove their verification level without revealing personal information on-chain.

#### Acceptance Criteria

1. WHEN an identity claim is created THEN the system SHALL include the address, identity tier, risk score, expiry timestamp, and issuer signature
2. WHEN a claim is signed THEN the system SHALL use the issuer's private key to generate a cryptographic signature over the claim data
3. WHEN the claim data is modified THEN the system SHALL invalidate the existing signature
4. WHEN a claim includes an expiry timestamp THEN the system SHALL ensure the expiry is in the future at creation time
5. WHEN a claim is serialized THEN the system SHALL use a deterministic encoding format to ensure signature verification consistency

### Requirement 3

**User Story:** As a user, I want to submit my identity claim to the escrow contract, so that I can access higher transaction limits based on my verification level.

#### Acceptance Criteria

1. WHEN a user submits an identity claim THEN the system SHALL verify the claim signature matches the authorized issuer
2. WHEN a claim signature is invalid THEN the system SHALL reject the claim and maintain the current identity tier
3. WHEN a claim has expired THEN the system SHALL reject the claim and revert to the default unverified tier
4. WHEN a valid claim is submitted THEN the system SHALL store the identity tier and risk score for the address
5. WHEN a user submits a new claim THEN the system SHALL replace the previous claim data with the new claim data

### Requirement 4

**User Story:** As a compliance officer, I want the system to enforce different transaction limits based on identity tiers, so that we can meet regulatory requirements for different user verification levels.

#### Acceptance Criteria

1. WHEN an unverified user attempts a transaction THEN the system SHALL enforce the lowest transaction limit
2. WHEN a basic-tier user attempts a transaction THEN the system SHALL enforce the basic transaction limit
3. WHEN a verified-tier user attempts a transaction THEN the system SHALL enforce the verified transaction limit
4. WHEN a premium-tier user attempts a transaction THEN the system SHALL enforce the highest transaction limit
5. WHEN a transaction amount exceeds the user's tier limit THEN the system SHALL reject the transaction with a clear error message

### Requirement 5

**User Story:** As a risk manager, I want to use risk scores to apply additional restrictions, so that high-risk addresses have reduced limits regardless of their identity tier.

#### Acceptance Criteria

1. WHEN a claim includes a risk score THEN the system SHALL store the risk score with the address identity data
2. WHEN a risk score exceeds the high-risk threshold THEN the system SHALL apply reduced transaction limits
3. WHEN a risk score is below the low-risk threshold THEN the system SHALL apply standard tier-based limits
4. WHEN calculating effective limits THEN the system SHALL use the minimum of tier-based limits and risk-adjusted limits
5. WHEN a risk score is updated via a new claim THEN the system SHALL immediately apply the new risk-adjusted limits

### Requirement 6

**User Story:** As a developer, I want clear error messages when claims are rejected, so that I can help users understand why their claim was not accepted.

#### Acceptance Criteria

1. WHEN a claim signature verification fails THEN the system SHALL return an error indicating invalid signature
2. WHEN a claim has expired THEN the system SHALL return an error indicating the claim expiry timestamp
3. WHEN a claim issuer is not authorized THEN the system SHALL return an error indicating unauthorized issuer
4. WHEN a claim format is invalid THEN the system SHALL return an error indicating the specific format issue
5. WHEN a transaction exceeds limits THEN the system SHALL return an error indicating the current limit and attempted amount

### Requirement 7

**User Story:** As a system operator, I want to query the current identity tier and limits for any address, so that I can verify the system is enforcing the correct limits.

#### Acceptance Criteria

1. WHEN querying an address identity THEN the system SHALL return the current tier, risk score, and expiry timestamp
2. WHEN querying an address with no claim THEN the system SHALL return the default unverified tier
3. WHEN querying an address with an expired claim THEN the system SHALL return the default unverified tier
4. WHEN querying transaction limits for an address THEN the system SHALL return the effective limit based on tier and risk score
5. WHEN querying claim validity THEN the system SHALL indicate whether the claim is currently valid or expired

### Requirement 8

**User Story:** As a security auditor, I want all identity claim submissions and tier changes to be logged, so that I can audit the system's compliance enforcement.

#### Acceptance Criteria

1. WHEN a valid claim is submitted THEN the system SHALL emit an event containing the address, tier, risk score, and expiry
2. WHEN a claim is rejected THEN the system SHALL emit an event containing the address and rejection reason
3. WHEN a claim expires THEN the system SHALL emit an event when the expiry is detected during a transaction attempt
4. WHEN transaction limits are enforced THEN the system SHALL emit an event indicating the limit check result
5. WHEN an issuer is added or removed THEN the system SHALL emit an event containing the issuer public key and action

### Requirement 9

**User Story:** As a backend developer, I want helper functions to create and verify claims off-chain, so that I can integrate identity providers with the escrow system.

#### Acceptance Criteria

1. WHEN creating a claim off-chain THEN the helper SHALL generate a properly formatted claim structure
2. WHEN signing a claim off-chain THEN the helper SHALL produce a signature compatible with on-chain verification
3. WHEN verifying a claim off-chain THEN the helper SHALL use the same verification logic as the on-chain contract
4. WHEN serializing a claim THEN the helper SHALL use the same encoding format as the on-chain contract
5. WHEN testing claim integration THEN the helper SHALL provide utilities to generate test claims with valid signatures

### Requirement 10

**User Story:** As a maintainer, I want comprehensive tests for claim verification and limit enforcement, so that I can ensure the system correctly handles valid, invalid, and expired claims.

#### Acceptance Criteria

1. WHEN testing valid claims THEN the system SHALL accept claims with correct signatures and non-expired timestamps
2. WHEN testing invalid signatures THEN the system SHALL reject claims with tampered data or wrong issuer signatures
3. WHEN testing expired claims THEN the system SHALL reject claims where the current timestamp exceeds the expiry
4. WHEN testing tier transitions THEN the system SHALL correctly update limits when users submit claims for different tiers
5. WHEN testing limit enforcement THEN the system SHALL reject transactions that exceed tier-based or risk-adjusted limits
