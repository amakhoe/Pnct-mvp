# Security Specification & Invariants (TB Care MISAU Moçambique)

## 1. Data Invariants
1. Unauthenticated users cannot read, list, create, update, or delete any patients, health posts, territories, or user data.
2. Users can only read and update their own user profile document (`/users/{userId}`).
3. Every patient document must have a valid ID format, valid notification code, and belong to a known territory.
4. Updates to patients require authenticated medical/epidemiological personnel and cannot forge immutable fields (`id`).
5. Path variable IDs must satisfy `isValidId(id)` pattern: `^[a-zA-Z0-9_\\-]+$` with size <= 128 characters.
6. Default deny catch-all `match /{document=**} { allow read, write: if false; }` must be the primary gate.

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated List on /patients**: Attacker queries patients without Firebase auth token -> DENIED.
2. **Unauthenticated Read on /users**: Attacker attempts to fetch a doctor's user profile -> DENIED.
3. **Cross-User Profile Hijack**: Authenticated user 'attacker_uid' attempts to write to `/users/victim_uid` -> DENIED.
4. **Malicious Long ID Attack**: Attacker injects a 2KB junk string as document ID -> DENIED by `isValidId`.
5. **Special Characters in ID**: Attacker provides `/patients/../../../admin` or script tags in ID -> DENIED by `isValidId`.
6. **Patient ID Mutation**: Attacker attempts to update patient with `id` changed -> DENIED by immutability guard.
7. **Ghost Field Poisoning**: Attacker injects unauthorized arbitrary root fields -> DENIED by validation schema.
8. **Delete Operation by Anonymous**: Anonymous unauthenticated user attempts to delete patient -> DENIED.
9. **Blanket Query Scraping**: Malicious client issues open query without authentication -> DENIED.
10. **Admin Claim Forgery**: Client sets `token.admin = true` on client-side token -> DENIED (we do not trust client claims).
11. **Malicious Health Post ID**: Attempt to write health post with invalid path chars -> DENIED.
12. **Unauthenticated Territory Modification**: Attacker attempts to delete or alter a Mozambican province -> DENIED.

## 3. Test Invariants Summary
All write and read operations are secured under role and authentication primitives.
