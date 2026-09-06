# MRI Safety QuickCheck — Build 10 Release Checklist

## Automated release gates

- [x] Clinical regression v31: 589/589 passing
- [x] Clinical regression v2 baseline: 46/46 passing
- [x] Release matrix v2: 16/16 passing
- [x] Exact-system engine v5 is the active compatibility path
- [x] CI prohibits reintroducing the v4 mobile exact-system RPC
- [x] TypeScript passes
- [x] Expo Doctor passes
- [x] Scanner selection persistence/race hardening implemented
- [x] Device-question and exact-check stale-response guards implemented
- [x] QuickCheck History refreshes on focus and exposes tappable manufacturer source links
- [x] In-app account deletion implemented for App Store account-creation compliance
- [x] No open GitHub release-blocker issues

## Catalog / labeling

- [x] Current release remains manufacturer-labeling-first and fail-closed
- [x] Full active cardiac catalog currently represented in the app has normalized completeness guards
- [x] Unresolved configurations remain unknown/review-required rather than being promoted for release convenience
- [ ] Continue resolving remaining `needs_review` catalog records only when current manufacturer/authoritative labeling is sufficient; this is ongoing catalog work, not a reason to weaken fail-closed behavior
- [ ] Do not promote unresolved legacy or exact-component gaps until manufacturer evidence is sufficient

## iOS / EAS configuration

- [x] Bundle identifier: `com.mriguru.mrisafetyquickcheck`
- [x] Expo/EAS project ID configured: `04e8415c-22c9-41b2-819f-7e4ee0d1261c`
- [x] App Store Connect app ID pinned in EAS submit config: `6808849541`
- [x] Production builds use remote app-version source and auto-increment build number
- [x] Non-exempt encryption flag configured as false
- [x] Face ID usage description configured
- [x] Current marketing version remains `1.0.0`; Build 10 refers to the release-candidate/build number track unless App Store Connect requires a new marketing-version record

## Apple / App Store Connect items that require account access

These cannot be verified from the connected GitHub/Supabase tools and must be confirmed in Apple/Expo before submission:

- [ ] Apple Developer membership and current agreements are active
- [ ] iOS distribution certificate and provisioning profile are valid, or EAS can create/repair them
- [ ] App Store Connect app record `6808849541` is accessible and matches bundle ID `com.mriguru.mrisafetyquickcheck`
- [ ] Privacy Policy URL is present and publicly reachable
- [ ] App Privacy answers accurately describe Supabase authentication/account data and any other collected data
- [ ] Updated 2026 Age Rating questionnaire is complete
- [ ] Regulated Medical Device status declaration is completed for applicable storefronts/regions
- [ ] Support URL is present and reaches real contact/support information
- [ ] App Review contact/sign-in information is current
- [ ] Existing screenshots remain accurate for Build 10, or updated screenshots are uploaded
- [ ] “What’s New in This Version” is entered from `BUILD10_APP_STORE_HANDOFF.md`

## Build 10 binary / TestFlight gate

- [ ] Create the production iOS Build 10 binary from `build-10-rc`
- [ ] Confirm the uploaded binary is associated with the intended App Store version record
- [ ] Install the processed build from TestFlight on a real iPhone
- [ ] Run the physical scanner-selection matrix in `SCANNER_STRESS_TEST.md`
- [ ] Run the real-device clinician workflow smoke cases in `CLINICIAN_WORKFLOW_QA.md`
- [ ] Verify account creation, sign-in/out, password reset, Face ID, and **Delete account permanently** on the TestFlight binary
- [ ] Verify manufacturer source links open correctly from QuickCheck and History
- [ ] Verify a newly completed QuickCheck appears in History after returning to the History tab
- [ ] Submit to App Review only after the above physical/TestFlight checks pass

## Controlled release rule

Do not submit a Build 10 binary if any automated gate fails or any real-device smoke test produces a stale, more-permissive, source-less, or mismatched result. Unknown/incomplete implant configurations remain fail-closed.

Build 9 / `main` remains unchanged until Build 10 is accepted as the release candidate.
