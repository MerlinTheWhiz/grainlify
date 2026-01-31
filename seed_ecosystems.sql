INSERT INTO ecosystems (slug, name, description, website_url, status) VALUES
('stellar', 'Stellar', 'An open-source network for currencies and payments.', 'https://stellar.org', 'active'),
('ethereum', 'Ethereum', 'A decentralized platform that runs smart contracts.', 'https://ethereum.org', 'active'),
('solana', 'Solana', 'A fast, secure, and censorship-resistant blockchain.', 'https://solana.com', 'active'),
('polkadot', 'Polkadot', 'A multichain network that connects blockchains.', 'https://polkadot.network', 'active'),
('cosmos', 'Cosmos', 'An ecosystem of independent, interoperable blockchains.', 'https://cosmos.network', 'active')
ON CONFLICT (slug) DO NOTHING;
