# MRI Safety QuickCheck — Controlled Beta Release Checklist

## Automated release gates

- [x] Highest clinical regression suite v32: 594/594 passing
- [x] Release matrix v2: 16/16 passing
- [x] Clinical regression v2: 46/46 passing
- [x] No active records falsely marked verified without labeling verification
- [x] Exact-system engine v5 is the active compatibility path
- [x] Scanner profile selection/default/delete workflow implemented
- [x] QuickCheck History expanded for audit review
- [x] Dedicated fail-closed audit completed for wrong field strength, incomplete cardiac systems, mixed components, unidentified/abandoned leads, unknown devices, and unsupported scanners
- [x] Beta schema/clinical-engine freeze fingerprints recorded

## Catalog / labeling

- [x] 584 active device records
- [x] 578 active records currently have completed labeling verification
- [ ] Resolve remaining 5 `needs_review` records only when current manufacturer/authoritative labeling is sufficient
- [ ] Do not promote unresolved exact systems/components by inference across generations or similar model numbers
- [ ] Keep unresolved legacy/orphan component records fail-closed until authoritative source re-verification is complete

## Privacy / account flow

- [x] Supabase Auth sign-up/sign-in/password reset implemented
- [x] In-app account deletion added to the controlled beta branch
- [x] Authenticated `delete-account` Supabase Edge Function deployed
- [x] Account deletion removes user-associated saved workflow data before deleting the Auth account
- [x] Operational audit identifiers are de-identified rather than silently deleting clinical/catalog audit history
- [x] Draft publishable privacy policy added as `PRIVACY_POLICY.md`
- [ ] Publish the privacy policy at a stable public HTTPS URL and enter that URL in App Store Connect
- [ ] Complete App Store Connect App Privacy questionnaire to match actual beta data handling

## iOS beta build

- [x] iOS bundle identifier configured: `com.mriguru.mrisafetyquickcheck`
- [x] EAS development, preview, and production build profiles configured
- [x] Production builds use auto-increment
- [x] Non-exempt encryption flag configured as false
- [x] App Store Connect app ID configured in `eas.json`
- [x] Controlled TestFlight EAS workflow added at `.eas/workflows/testflight-beta.yml`
- [ ] Confirm Expo/EAS account credentials can build this project
- [ ] Confirm paid Apple Developer membership
- [ ] Configure/confirm iOS distribution certificate and provisioning profile
- [ ] Confirm App Store Connect app record and agreements are active
- [ ] Create signed production iOS build from the beta candidate
- [ ] Submit build to TestFlight
- [ ] Create internal TestFlight group first
- [ ] Submit first external beta build for TestFlight App Review
- [ ] Create invitation-only external clinician group (target 5–10 testers)
- [ ] Upload/review required screenshots and TestFlight review contact information

## Beta test scope

The first beta is a controlled workflow test. It must not be treated as an independent substitute for current manufacturer MRI labeling or institutional MRI safety policy.

Testers should specifically exercise:

- scanner switching and default scanner behavior
- 1.5T-only implant evaluated on a 3T scanner
- exact generator + lead/component workflows
- incomplete or unknown systems
- abandoned/fractured lead paths
- EOS/serial-number exceptions
- body-region restrictions
- SAR/B1+rms/coil/programming confirmations
- pumps requiring pre/post-MRI workflow
- manufacturer-labeling link/source visibility
- Favorites/Recent devices
- QuickCheck History audit details
- account creation, password reset, sign-out, and account deletion

## Required beta feedback

For every suspected incorrect result, capture:

1. device manufacturer/model and all known component model numbers
2. selected scanner make/model/field strength
3. scan region
4. displayed QuickCheck status
5. manufacturer document/manual used for comparison
6. screenshot of the result when possible
7. whether the issue is search, data, rules-engine, UI, or source-link related

Do not include patient names, dates of birth, MRNs, accession numbers, images, or other patient-identifying information in beta feedback.

## Go/no-go rule

Do not send a new beta build if any automated clinical/release gate fails, if the frozen clinical-engine/schema fingerprints change without a deliberate beta-candidate reopen, or if a known fail-closed scenario can produce a clearance result without sufficient manufacturer evidence.

A catalog record that lacks sufficient current source verification remains `needs_review`/fail-closed rather than being promoted to verified for release convenience.
