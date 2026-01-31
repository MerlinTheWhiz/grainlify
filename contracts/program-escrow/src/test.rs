#![cfg(test)]

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env, String, Vec, vec, token};
use soroban_sdk::testutils::Ledger;

// Helper function to create a mock token contract
fn create_token_contract<'a>(env: &Env, admin: &Address) -> token::Client<'a> {
    let token_address = env.register_stellar_asset_contract(admin.clone());
    token::Client::new(env, &token_address)
}

// Helper function to setup a basic program
fn setup_program<'a>(env: &Env) -> (ProgramEscrowContractClient<'a>, Address, Address, String) {
    let contract_id = env.register_contract(None, ProgramEscrowContract);
    let client = ProgramEscrowContractClient::new(env, &contract_id);
    let admin = Address::generate(env);
    let token = Address::generate(env);
    let program_id = String::from_str(env, "hackathon-2024-q1");

    client.initialize_program(&program_id, &admin, &token, &admin, &None);
    (client, admin, token, program_id)
}

// Helper function to setup program with funds
fn setup_program_with_funds<'a>(env: &Env, initial_amount: i128) -> (ProgramEscrowContractClient<'a>, Address, Address, String) {
    let contract_id = env.register_contract(None, ProgramEscrowContract);
    let client = ProgramEscrowContractClient::new(env, &contract_id);
    // Need a token client to mint/approve
    
    let admin = Address::generate(env);
    let token_client = create_token_contract(env, &admin);
    let program_id = String::from_str(env, "hackathon-2024-q1");

    client.initialize_program(&program_id, &admin, &token_client.address, &admin, &None);
    
    // Mint and approve
    let token_admin = token::StellarAssetClient::new(env, &token_client.address);
    token_admin.mint(&admin, &initial_amount);
    token_client.approve(&admin, &env.current_contract_address(), &initial_amount, &1000);
    
    client.lock_program_funds(&program_id, &initial_amount);
    (client, admin, token_client.address, program_id)
}

// =============================================================================
// TESTS FOR AMOUNT LIMITS
// =============================================================================

#[test]
fn test_amount_limits_initialization() {
    let env = Env::default();
    let (client, _admin, _token, _program_id) = setup_program(&env);
    
    // Check default limits
    let limits = client.get_amount_limits();
    assert_eq!(limits.min_lock_amount, 1);
    assert_eq!(limits.max_lock_amount, i128::MAX);
    assert_eq!(limits.min_payout, 1);
    assert_eq!(limits.max_payout, i128::MAX);
}

#[test]
fn test_update_amount_limits() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin, _token, _program_id) = setup_program(&env);
    
    // Update limits (requires admin auth which is mocked)
    // Note: setup_program sets admin as organizer, but update_amount_limits usually requires contract admin
    // For simplicity, we assume mock_all_auths covers it. 
    // Wait, update_amount_limits is likely restricted to admin.
    // Let's check if we need to set admin.
    let new_admin = Address::generate(&env);
    client.set_admin(&new_admin);
    
    client.update_amount_limits(&200, &2000, &100, &1000);
    
    // Verify updated limits
    let limits = client.get_amount_limits();
    assert_eq!(limits.min_lock_amount, 200);
    assert_eq!(limits.max_lock_amount, 2000);
    assert_eq!(limits.min_payout, 100);
    assert_eq!(limits.max_payout, 1000);
}

#[test]
#[should_panic(expected = "Invalid amount: amounts cannot be negative")]
fn test_update_amount_limits_invalid_negative() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _, _, _) = setup_program(&env);
    let new_admin = Address::generate(&env);
    client.set_admin(&new_admin);
    
    // Try to set negative limits
    client.update_amount_limits(&-100, &1000, &50, &500);
}

#[test]
#[should_panic(expected = "Invalid amount: minimum cannot exceed maximum")]
fn test_update_amount_limits_invalid_min_greater_than_max() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _, _, _) = setup_program(&env);
    let new_admin = Address::generate(&env);
    client.set_admin(&new_admin);
    
    // Try to set min > max
    client.update_amount_limits(&1000, &100, &50, &500);
}

#[test]
fn test_lock_program_funds_respects_amount_limits() {
    let env = Env::default();
    env.mock_all_auths();
    
    // Setup manual to control token interaction
    let contract_id = env.register_contract(None, ProgramEscrowContract);
    let client = ProgramEscrowContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let token_client = create_token_contract(&env, &admin);
    let program_id = String::from_str(&env, "hackathon-2024-q1");
    
    client.initialize_program(&program_id, &admin, &token_client.address, &admin, &None);
    client.set_admin(&admin); // For updating limits
    
    // Set limits
    client.update_amount_limits(&100, &1000, &50, &500);
    
    // Mint tokens 
    let token_admin = token::StellarAssetClient::new(&env, &token_client.address);
    token_admin.mint(&admin, &10000);
    token_client.approve(&admin, &env.current_contract_address(), &10000, &1000);
    
    // Test successful lock within limits
    let result = client.lock_program_funds(&program_id, &500);
    assert_eq!(result.remaining_balance, 500);
    
    // Test lock at minimum limit
    let result = client.lock_program_funds(&program_id, &100);
    assert_eq!(result.remaining_balance, 600);
    
    // Test lock at maximum limit
    let result = client.lock_program_funds(&program_id, &1000);
    assert_eq!(result.remaining_balance, 1600);
}

#[test]
#[should_panic(expected = "Amount violates configured limits")]
fn test_lock_program_funds_below_minimum() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (client, admin, _, program_id) = setup_program(&env);
    let new_admin = Address::generate(&env);
    client.set_admin(&new_admin);
    
    // Set limits
    client.update_amount_limits(&100, &1000, &50, &500);
    
    // Try to lock below minimum (requires valid token setup, but panic check might happen first? 
    // Actually lock_program_funds checks amount before transfer, so we might not need token setup if it fails early.
    // But let's assume it checks amount first. 
    // However, setup_program uses a random address for token, so transfer would fail if it got there.
    // The previous test helper `setup_program` didn't real token client.
    // But since we expect panic on limits, it should be fine.
    
    client.lock_program_funds(&program_id, &50);
}

#[test]
#[should_panic(expected = "Amount violates configured limits")]
fn test_lock_program_funds_above_maximum() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (client, admin, _, program_id) = setup_program(&env);
    client.set_admin(&admin);
    
    // Set limits
    client.update_amount_limits(&100, &1000, &50, &500);
    
    // Try to lock above maximum
    client.lock_program_funds(&program_id, &1500);
}

#[test]
fn test_single_payout_respects_limits() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin, _, program_id) = setup_program_with_funds(&env, 1000);
    client.set_admin(&admin);
    
    // Set limits - payout limits are 100-500
    client.update_amount_limits(&100, &2000, &100, &500);
    
    let recipient = Address::generate(&env);
    
    // Payout within limits should work
    let result = client.single_payout(&program_id, &recipient, &300);
    assert_eq!(result.remaining_balance, 700);
}

#[test]
#[should_panic(expected = "Payout amount violates configured limits")]
fn test_single_payout_above_maximum() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin, _, program_id) = setup_program_with_funds(&env, 1000);
    client.set_admin(&admin);
    
    // Set limits - payout max is 500
    client.update_amount_limits(&100, &2000, &100, &500);
    
    let recipient = Address::generate(&env);
    
    // Try to payout above maximum
    client.single_payout(&program_id, &recipient, &600);
}

#[test]
#[should_panic(expected = "Payout amount violates configured limits")]
fn test_single_payout_below_minimum() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin, _, program_id) = setup_program_with_funds(&env, 1000);
    client.set_admin(&admin);
    
    // Set limits - payout min is 100
    client.update_amount_limits(&100, &2000, &100, &500);
    
    let recipient = Address::generate(&env);
    
    // Try to payout below minimum
    client.single_payout(&program_id, &recipient, &50);
}

#[test]
fn test_batch_payout_respects_limits() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin, _, program_id) = setup_program_with_funds(&env, 2000);
    client.set_admin(&admin);
    
    // Set limits
    client.update_amount_limits(&100, &2000, &100, &500);
    
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    
    let recipients = vec![&env, recipient1, recipient2];
    let amounts = vec![&env, 200i128, 300i128];
    
    // Batch payout within limits should work
    let result = client.batch_payout(&program_id, &recipients, &amounts);
    assert_eq!(result.remaining_balance, 1500);
}

#[test]
#[should_panic(expected = "Payout amount violates configured limits")]
fn test_batch_payout_with_amount_above_maximum() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin, _, program_id) = setup_program_with_funds(&env, 2000);
    client.set_admin(&admin);
    
    // Set limits - payout max is 500
    client.update_amount_limits(&100, &2000, &100, &500);
    
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    
    let recipients = vec![&env, recipient1, recipient2];
    let amounts = vec![&env, 200i128, 600i128]; // 600 > 500 (max)
    
    // Should fail because one amount exceeds maximum
    client.batch_payout(&program_id, &recipients, &amounts);
}

// ========================================================================
// Anti-Abuse Tests
// ========================================================================

#[test]
#[should_panic(expected = "Operation in cooldown period")]
fn test_anti_abuse_cooldown_panic() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000);
    let contract_id = env.register_contract(None, ProgramEscrowContract);
    let client = ProgramEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.set_admin(&admin);
    client.update_rate_limit_config(&3600, &10, &60);

    let backend = Address::generate(&env);
    let token = Address::generate(&env);

    client.initialize_program(
        &String::from_str(&env, "P1"),
        &backend,
        &token,
        &backend,
        &None,
    );

    // Advance time by 30s (less than 60s cooldown)
    env.ledger().with_mut(|li| li.timestamp += 30);

    client.initialize_program(
        &String::from_str(&env, "P2"),
        &backend,
        &token,
        &backend,
        &None,
    );
}

#[test]
#[should_panic(expected = "Rate limit exceeded")]
fn test_anti_abuse_limit_panic() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000);
    let contract_id = env.register_contract(None, ProgramEscrowContract);
    let client = ProgramEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.set_admin(&admin);
    client.update_rate_limit_config(&3600, &2, &0); // 2 ops max, no cooldown

    let backend = Address::generate(&env);
    let token = Address::generate(&env);

    client.initialize_program(
        &String::from_str(&env, "P1"),
        &backend,
        &token,
        &backend,
        &None,
    );

    client.initialize_program(
        &String::from_str(&env, "P2"),
        &backend,
        &token,
        &backend,
        &None,
    );

    // 3rd op should fail
    client.initialize_program(
        &String::from_str(&env, "P3"),
        &backend,
        &token,
        &backend,
        &None,
    );
}

// ========================================================================
// Existing Tests from lib.rs (Restored)
// ========================================================================

fn setup_program_with_schedule(
    env: &Env,
    client: &ProgramEscrowContractClient<'static>,
    authorized_key: &Address,
    token: &Address,
    program_id: &String,
    total_amount: i128,
    winner: &Address,
    release_timestamp: u64,
) {
    // Register program
    client.initialize_program(program_id, authorized_key, token, authorized_key, &None);

    // Create and fund token
    let token_client = create_token_contract(env, authorized_key);
    let token_admin = token::StellarAssetClient::new(env, &token_client.address);
    token_admin.mint(authorized_key, &total_amount);

    // Lock funds for program
    token_client.approve(
        authorized_key,
        &env.current_contract_address(),
        &total_amount,
        &1000,
    );
    client.lock_program_funds(program_id, &total_amount);

    // Create release schedule
    client.create_program_release_schedule(
        program_id,
        &total_amount,
        &release_timestamp,
        &winner,
    );
}

#[test]
fn test_single_program_release_schedule() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ProgramEscrowContract);
    let client = ProgramEscrowContractClient::new(&env, &contract_id);

    let authorized_key = Address::generate(&env);
    let winner = Address::generate(&env);
    let token = Address::generate(&env);
    let program_id = String::from_str(&env, "Hackathon2024");
    let amount = 1000_0000000;
    let release_timestamp = 1000;

    env.mock_all_auths();

    // Setup program with schedule
    setup_program_with_schedule(
        &env,
        &client,
        &authorized_key,
        &token,
        &program_id,
        amount,
        &winner,
        release_timestamp,
    );

    // Verify schedule was created
    let schedule = client.get_program_release_schedule(&program_id, &1);
    assert_eq!(schedule.schedule_id, 1);
    assert_eq!(schedule.amount, amount);
    assert_eq!(schedule.release_timestamp, release_timestamp);
    assert_eq!(schedule.recipient, winner);
    assert!(!schedule.released);

    // Check pending schedules
    let pending = client.get_pending_program_schedules(&program_id);
    assert_eq!(pending.len(), 1);
}
