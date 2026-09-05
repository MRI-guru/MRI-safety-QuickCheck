# MRI Safety QuickCheck — App Store / TestFlight Beta Metadata

## Beta description
MRI Safety QuickCheck is an iPhone-first clinical decision-support tool for MRI personnel. It helps users search implanted devices, select their scanner profile, review scanner/device compatibility, and quickly reach current manufacturer MRI labeling when available.

The app is designed to fail closed when device identity, exact components, scanner conditions, or manufacturer labeling cannot be sufficiently verified. It does not replace manufacturer MRI labeling, institutional policy, or qualified MRI personnel review.

## What to Test
Test the following workflows in the current TestFlight build:

- Sign in, create account, sign out, forgot password, and reset password.
- Saved login and Face ID behavior on a native iOS/TestFlight build.
- Saved scanner profiles, changing the default scanner, and selecting a different scanner for a QuickCheck.
- Implant/device search, including abbreviations, stimulators, pain pumps, cardiac devices, and common spelling variants.
- MRI compatibility results for scanner field strength and other labeled conditions.
- Exact-system/component checks when a device requires generator/lead/component verification.
- Manufacturer MRI labeling/source links.
- Favorites/pinned devices, recent devices, and QuickCheck history.
- Wrong-field-strength, incomplete-component, unsupported, and unknown cases; these should remain unresolved/fail closed rather than display a clearance result without sufficient manufacturer labeling information.
- Report MRI data issue and general beta feedback actions in Settings.

Do not enter patient names, DOB, MRN, accession numbers, images, or other patient-identifying information into beta feedback.

## Support contact
Beta support email: dballas88@gmail.com

## Privacy notes for beta
- Authentication is provided through Supabase Auth.
- Auth session storage uses iOS Keychain-backed Expo SecureStore.
- Beta feedback is user-initiated through the device email client.
- Feedback templates explicitly instruct testers not to include patient-identifying information.
- No third-party crash telemetry has been intentionally enabled in this beta release package yet.

## Clinical disclaimer
MRI Safety QuickCheck is decision support. MRI personnel remain responsible for confirming the exact implant, current manufacturer MRI labeling, all patient-specific conditions, scanner settings, and facility policy before scanning.

## Release positioning
This document supports controlled beta/TestFlight distribution. Passing internal release or regression checks is not independent clinical validation and should not be described as proof that all implant scenarios are safe or complete.
