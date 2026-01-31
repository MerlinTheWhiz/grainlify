#![cfg(test)]

use crate::{ProgramEscrowContract, ProgramEscrowContractClient};
use soroban_sdk::{testutils::{Address as _, Ledger}, token, Address, Env, String};

// Helper function to setup a basic program
fn setup_program(env: &Env) -> (ProgramEscrowContractClient, Address, Address, String, Address) {
    let contract_id = env.register_contract(None, ProgramEscrowContract);
    let contract = ProgramEscrowContractClient::new(env, &contract_id);
    
    let admin = Address::generate(env);
    let organizer = Address::generate(env);
    
    // Register a real token contract
    let token_addr = env.register_stellar_asset_contract(admin.clone());
    let program_id = String::from_str(env, "hackathon-2024-q1");

    contract.initialize_program(
        &program_id,
        &admin,
        &token_addr,
        &organizer,
        &None,
    );
    (contract, admin, token_addr, program_id, organizer)
}

// Helper function to setup program with funds
fn setup_program_with_funds(
    env: &Env,
    initial_amount: i128,
) -> (ProgramEscrowContractClient, Address, Address, String, Address) {
    let (contract, admin, token_addr, program_id, organizer) = setup_program(env);
    
    // Mint tokens to the organizer so they can lock funds
    let token_client = token::Client::new(env, &token_addr);
    let token_admin_client = token::StellarAssetClient::new(env, &token_addr);
    token_admin_client.mint(&organizer, &initial_amount);
    
    // Transfer funds to contract (since lock_program_funds currently doesn't pull them)
    token_client.transfer(&organizer, &contract.address, &initial_amount);

    // Mock auths handles the signature requirement
    env.mock_all_auths();
    
    contract.lock_program_funds(&program_id, &initial_amount);
    (contract, admin, token_addr, program_id, organizer)
}

#[test]
fn test_program_claim_flow_success() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (contract, _admin, _token, program_id, _organizer) =
        setup_program_with_funds(&env, 100_000_000_000);

    let recipient = Address::generate(&env);

    // Set claim window
    contract.set_program_claim_config(&program_id, &100);

    // Trigger payout (creates pending claim)
    let program_data =
        contract.single_payout(&program_id, &recipient, &50_000_000_000);
    assert_eq!(program_data.remaining_balance, 50_000_000_000);

    // Claim payout
    let program_data_after = contract.claim_payout(&program_id, &0);
    assert_eq!(program_data_after.payout_history.len(), 1);
}

#[test]
#[should_panic(expected = "Claim expired")]
fn test_program_claim_flow_expired() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (contract, _admin, _token, program_id, _organizer) =
        setup_program_with_funds(&env, 100_000_000_000);

    let recipient = Address::generate(&env);
    contract.set_program_claim_config(&program_id, &10);

    contract.single_payout(&program_id, &recipient, &50_000_000_000);

    // Advance ledger
    env.ledger().with_mut(|l| l.sequence_number = 20);

    contract.claim_payout(&program_id, &0);
}

#[test]
fn test_program_claim_flow_cancelled() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (contract, _admin, _token, program_id, _organizer) =
        setup_program_with_funds(&env, 100_000_000_000);

    let recipient = Address::generate(&env);
    contract.set_program_claim_config(&program_id, &100);

    contract.single_payout(&program_id, &recipient, &50_000_000_000);

    // Cancel claim
    let program_data = contract.cancel_payout_claim(&program_id, &0);
    assert_eq!(program_data.remaining_balance, 100_000_000_000);
}
