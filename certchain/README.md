# 🎓 CertiChain - Decentralized Academic Credential Verification

CertiChain is a Web3 education platform that enables verified institutions to issue tamper-proof, on-chain academic credentials. Built on the Stacks blockchain using Clarity smart contracts.

## 🚀 Features

- Institutions can register and issue credentials on-chain
- Students receive non-transferable (soulbound) credentials
- Employers can verify authenticity instantly
- All data is public, immutable, and decentralized

---

## 🛠️ Smart Contracts

### 1. `institution-registry.clar`
- Registers and manages verified educational institutions.
- Only the admin can add or remove institutions.

**Key Functions:**
- `(register-institution (institution principal))`
- `(revoke-institution (institution principal))`
- `(is-approved (institution principal)) -> bool`

---

### 2. `credential-issuer.clar`
- Allows registered institutions to issue academic credentials as NFTs (or SBTs).

**Key Functions:**
- `(issue-credential (student principal) (metadata (buff 256)))`
- `(revoke-credential (credential-id uint))`
- `(get-credential (credential-id uint)) -> (tuple ...)`

---

### 3. `credential-verifier.clar`
- Verifies if a credential is valid and issued by a trusted institution.

**Key Functions:**
- `(verify-credential (credential-id uint)) -> bool`
- `(get-issuer (credential-id uint)) -> (optional principal)`

---

## 📦 Requirements

- [Clarity](https://docs.stacks.co/docs/clarity)
- [Clarinet](https://github.com/hirosystems/clarinet) for local development and testing

---

## 📄 Usage

```bash
# Clone the repo
git clone https://github.com/your-org/certichain.git

# Navigate to project
cd certichain

# Run tests
clarinet test
