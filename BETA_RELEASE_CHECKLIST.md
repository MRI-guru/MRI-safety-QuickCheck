# MRI Safety QuickCheck — Controlled Beta Release Checklist

## Automated release gates

- [x] Highest clinical regression suite v35: 621/621 passing
- [x] Release matrix v2: 16/16 passing
- [x] Clinical regression v2: 46/46 passing
- [x] No active verified records lack a displayable manufacturer-guidance pathway
- [x] Exact-system engine v5 remains an active compatibility path with the v6 audit wrapper
- [x] Scanner profile selection/default/delete workflow implemented
- [x] QuickCheck History expanded for audit review
- [x] Multi-implant combined assessment implemented with fail-closed most-restrictive aggregation
- [x] Dedicated fail-closed audit completed for wrong field strength, incomplete cardiac systems, mixed components, unidentified/abandoned leads, unknown devices, and unsupported scanners
- [x] Body-part and RF-coil exam-context resolver hardened; device-specific pathways now own exclusion-zone/configuration-specific decisions
- [x] Precise extremity choices added for pathways where broad Upper/Lower Extremity cannot safely resolve eligibility
- [x] Beta schema/clinical-engine freeze fingerprints recorded; deliberate engine changes require full gate reruns

## Catalog / labeling

- [x] 584 active device records
- [x] 570 active records currently have completed labeling verification
- [x] All 570 verified active records have displayable manufacturer guidance: 409 structured + 161 verified manufacturer fallback; 0 blank
- [ ] Resolve the remaining 2 `needs_review` records only when current manufacturer/authoritative labeling is sufficient
- [ ] Keep the remaining 12 `review_required` exact-model conflicts fail-closed until exact current manufacturer labeling reconciles them
- [ ] Do not promote unresolved exact systems/components by inference across generations, connector suffixes, or similar model numbers
- [ ] Keep unresolved legacy/orphan component records fail-closed until authoritative source re-verification is complete

Current intentionally unresolved high-value records include the Revi Extend MRI pathway pending explicit model-specific manufacturer MRI labeling, the 1987 recalled ferromagnetic McGee piston pending current authoritative re-verification, and exact Abbott/Medtronic cardiac suffix conflicts that must not be inferred from neighboring models.

## Privacy / account flow

- [x] Supabase Auth sign-up/sign-in/password reset implemented
- [x] Email-confirmation deep-link/session handling implemented
- [x] “I confirmed my email — Continue” recovery path implemented
- [x] Privacy Policy is readable inside the app before sign-in/account creation and from Settings
- [x] In-app account deletion added to the controlled beta branch
- [x] Authenticated `delete-account` Supabase Edge Function deployed
- [x] Account deletion removes user-associated saved workflow data before deleting the Auth account
- [x] Operational audit identifiers are de-identified rather than silently deleting clinical/catalog audit history
- [x] Draft publishable privacy policy maintained as `PRIVACY_POLICY.md`
- [ ] Publish the privacy policy at a stable public HTTPS URL and enter that URL in App Store Connect
- [ ] Complete/confirm the App Store Connect App Privacy questionnaire matches actual production data handling

## iOS beta build / release configuration

- [x] iOS bundle identifier configured: `com.mriguru.mrisafetyquickcheck`
- [x] EAS project ID configured and App Store Connect app ID pinned
- [x] EAS development, preview, and production channels configured
- [x] Expo Updates runtime policy (`appVersion`) and EAS Updates URL configured
- [x] `expo-updates` dependency and lockfile synchronized
- [x] Production builds use auto-increment
- [x] Non-exempt encryption flag configured as false
- [x] Controlled TestFlight EAS workflow present at `.eas/workflows/testflight-beta.yml`
- [x] Build 14 was submitted through TestFlight and approved for the controlled external beta
- [x] Invitation-only clinician TestFlight group configured
- [x] Beta branch reconciled with the Build 14 Expo/EAS update configuration
- [x] Current beta branch passes clean `npm ci` + TypeScript typecheck
- [ ] Create the next signed production iOS build containing the post-Build-14 frontend fixes
- [ ] Re-test account creation/email confirmation, exact anatomy/RF-coil resolution, multi-implant assessment, source links, history, and account deletion in the new TestFlight binary
- [ ] Replace any remaining App Store Connect placeholder metadata/URLs before public App Store submission
- [ ] Upload/review final App Store screenshots and final review/contact metadata before public release

## Beta test scope

The controlled beta is a workflow and clinical-engine validation phase. It must not be treated as an independent substitute for current manufacturer MRI labeling or institutional MRI safety policy.

Testers should specifically exercise:

- scanner switching and default scanner behavior
- 1.5T-only implant evaluated on a 3T scanner
- exact generator + lead/component workflows
- incomplete or unknown systems
- abandoned/fractured lead paths
- EOS/serial-number exceptions
- body-region restrictions, including exact shoulder/elbow/wrist/hip/knee/ankle distinctions where applicable
- RF transmit/receive coil selection and device-specific exclusion-zone pathways
- SAR/B1+rms/gradient/programming confirmations
- pumps requiring pre/post-MRI workflow
- manufacturer-labeling link/source visibility for every verified implant
- multi-implant combined assessment and most-restrictive result behavior
- Favorites/Recent devices
- QuickCheck History audit details
- account creation, email confirmation, password reset, sign-out, privacy access, and account deletion

## Required beta feedback

For every suspected incorrect result, capture:

1. device manufacturer/model and all known component model numbers
2. selected scanner make/model/field strength
3. exact scan region/body part
4. selected RF coil/transmit method when applicable
5. displayed QuickCheck status
6. manufacturer document/manual used for comparison
7. screenshot of the result when possible
8. whether the issue is search, data, rules-engine, UI, source-link, auth, or history related

Do not include patient names, dates of birth, MRNs, accession numbers, images, or other patient-identifying information in beta feedback.

## Go/no-go rule

Do not send a new beta build if any automated clinical/release gate fails, if a deliberate schema/clinical-engine change has not been followed by the full regression gates, or if a known fail-closed scenario can produce a clearance result without sufficient manufacturer evidence.

A catalog record that lacks sufficient exact current source verification remains `needs_review` / `review_required` and fail-closed rather than being promoted for release convenience. A verified record must also have displayable current manufacturer guidance so the clinician can see the evidence behind the QuickCheck result.
