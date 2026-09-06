# MRI Safety QuickCheck — Controlled Clinician Beta Candidate

Candidate date: 2026-09-06
Release positioning: controlled beta only; not production clinical release.

## Frozen clinical baseline
- Highest clinical regression: v32 — 594/594 passing
- Release score v2: 16/16 passing
- Clinical regression v2: 46/46 passing
- Active implant catalog at freeze: 584 records
- Exact component catalog: 1,079 records
- Exact system definitions: 64
- Database schema fingerprint: `950f82f72d16c25b190af8537aa12e7a`
- Clinical engine fingerprint: `c392b42832a07041b1e55a2b7b29c68a`
- Freeze audit record: `audit_logs.id = 1`

Any schema or clinical-engine change after this point reopens the candidate and requires the full gate suite again.

## Mobile validation
- Current main branch source compiles with `npm run typecheck` successfully in isolated CI.
- No TypeScript code change was needed; prior five-error report was stale.
- Build 10/Build 12 behavior was not modified.

## Controlled cohort
Start with 5–10 MRI clinicians/MRI safety personnel. Use invitation-only TestFlight email invites rather than a public link for the first cohort.

Do not enter patient names, DOB, MRN, accession numbers, images, or other patient-identifying information in beta testing or feedback.

## Required test matrix
Each tester should exercise:
1. Unknown/incomplete implant -> unresolved/fail closed.
2. 1.5T-only device on a 3T scanner -> not cleared.
3. Complete versus incomplete cardiac generator/lead systems.
4. Unidentified, abandoned, fractured, and retained lead/fragment pathways.
5. Mixed or mismatched component combinations.
6. Unsupported/unverified scanner selection.
7. Nevro, Medtronic, Abbott, Boston Scientific, Axonics and other high-use device search paths.
8. Serial-number/EOS exceptions such as Medtronic InterStim 3023.
9. Manufacturer labeling/source visibility.
10. Sign-up, sign-in, sign-out, password reset, Face ID, saved scanner profiles, favorites, recents, and history.

## Stop conditions
Immediately suspend the beta candidate if any of the following occurs:
- any highest clinical regression, release v2, or clinical v2 gate fails;
- a fail-closed case returns MR Conditional/cleared without the required exact identity or conditions;
- a manufacturer source cannot be reconciled with the stored rule;
- a crash/interrupted workflow leaves a result looking complete;
- patient-identifying information is found in beta feedback/storage unexpectedly.

## App Store/TestFlight readiness status
Configured:
- iOS bundle ID `com.mriguru.mrisafetyquickcheck`
- EAS project ID and build profiles
- App Store Connect app ID in EAS submit profile
- app error boundary and explicit interrupted-result warning
- clinical disclaimer and beta support actions in Settings
- beta description / What to Test / support metadata in repository

Still requires account-side completion before external clinician distribution:
- verify Expo/EAS account credentials and Apple Developer membership;
- verify distribution certificate/provisioning profile;
- confirm App Store Connect privacy details and public privacy-policy URL;
- capture/upload required App Store/TestFlight screenshots as appropriate;
- create/upload the iOS beta build;
- create an internal TestFlight group first, then invitation-only external clinician group if using non-App-Store-Connect clinicians;
- submit the first external build/version for TestFlight App Review and provide reviewer contact/demo access if required.

## Clinical positioning
MRI Safety QuickCheck is decision support. Every scan still requires confirmation of the exact implant and components, current manufacturer MRI labeling, scanner/exam conditions, patient-specific factors, and facility policy by qualified MRI personnel.
