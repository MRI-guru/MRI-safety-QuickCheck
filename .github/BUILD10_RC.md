# Build 10 RC

This branch is the isolated release-candidate hardening path for MRI Safety QuickCheck.

Validation requirements:
- `npm ci`
- `npm run typecheck`
- `npx expo-doctor`
- Supabase release gate: 100%
- Supabase clinical regression gate: 100%

Build 9 / `main` remains the protected baseline until Build 10 RC validation is complete.
