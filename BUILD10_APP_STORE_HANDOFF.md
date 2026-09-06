# MRI Safety QuickCheck — Build 10 App Store Connect Handoff

## Release identity

- Release branch: `build-10-rc`
- Public app name: MRI Safety QuickCheck
- Marketing version in `app.json`: `1.0.0`
- Build track: Build 10 RC
- iOS bundle ID: `com.mriguru.mrisafetyquickcheck`
- EAS project ID: `04e8415c-22c9-41b2-819f-7e4ee0d1261c`
- App Store Connect app ID: `6808849541`
- Production EAS profile: `production`
- EAS version source: remote
- Production build number: auto-increment

Build 10 refers to the iOS build/release-candidate track, not marketing version 10.0.0. Keep marketing version `1.0.0` unless the existing App Store version state requires creating a new incremental marketing-version record.

## Verified release state before binary creation

- Clinical regression v31: 589/589 PASS
- Clinical regression v2 baseline: 46/46 PASS
- Release gate v2: 16/16 PASS
- Build 10 CI: exact-system v5 guard PASS
- Build 10 CI: TypeScript PASS
- Build 10 CI: Expo Doctor PASS
- No open GitHub release-blocker issues
- Mobile exact-system RPC uses `quickcheck_run_exact_system_check_v5`
- Scanner-selection focus persistence fixed
- Guidance stale-response race fixed
- Device-question stale-response race fixed
- In-flight exact-check context invalidation implemented
- History manufacturer source is tappable
- History refreshes on tab focus
- In-app account deletion implemented
- Supabase account-deletion RPC restricted to authenticated users
- Build 9 / `main`: unchanged

## Exact EAS commands from `build-10-rc`

Run from the repository root after signing into the correct Expo/EAS account:

```bash
npm run release:ios:version
npm run release:ios:build
```

The first command shows the current remote iOS version/build state. Confirm the next production build will be **10** before starting the production build. The production profile already has `autoIncrement: true`.

After the production build succeeds and you have confirmed it is the intended Build 10 binary:

```bash
npm run release:ios:submit
```

`release:ios:submit` submits the latest production iOS build to the App Store Connect app configured in `eas.json` (`6808849541`). Do not run the submit command if another newer production build has been created in the meantime.

A GitHub `workflow_dispatch` release workflow is intentionally **not** used while Build 9/`main` remains frozen. GitHub requires a manually dispatched workflow file to exist on the default branch, so adding one only to `build-10-rc` would not create a usable release button. The supported release path for this RC is the local EAS command sequence above.

## App Store Connect — What’s New

Suggested text:

MRI Safety QuickCheck Build 10 improves scanner selection and exact-system MRI workflows, expands manufacturer-first implant coverage, strengthens fail-closed safety checks, and improves audit history. This update also adds faster manufacturer MRI source access, pinned/recent implants, improved scanner switching, and additional safeguards against stale results when exam context changes.

## App Review notes

Suggested notes for the reviewer:

MRI Safety QuickCheck is clinical decision-support software for MRI personnel. It is designed to help users identify implanted devices, select MRI scanner context, and review current manufacturer MRI labeling. Unknown or incomplete implant configurations remain unresolved/fail-closed. The app does not replace manufacturer MRI labeling, institutional policy, or qualified MRI personnel review.

Authentication uses Supabase. The Settings screen includes Sign Out and a clearly labeled “Delete account permanently” action. Account deletion removes the authenticated account and account-linked app data.

The app intentionally requires sign-in because saved scanner profiles, favorites, recent devices, and QuickCheck history are account-specific workflow features.

## App Store Connect fields to verify before submission

1. Privacy Policy URL is publicly reachable.
2. App Privacy responses accurately describe account/authentication and other collected data.
3. Support URL reaches real support/contact information.
4. App Review contact information and any reviewer credentials are current.
5. Updated 2026 Age Rating questionnaire is complete.
6. Regulated Medical Device declaration is completed if required by the app’s Medical/Health category or Medical/Treatment age-rating responses.
7. Screenshots still accurately represent the current interface.
8. “What’s New in This Version” is populated from the suggested text above.
9. Release option (manual, automatic, or phased) is intentionally selected.

## Build / upload sequence

1. Use the `build-10-rc` branch.
2. Run `npm run release:ios:version` and verify the remote iOS build sequence.
3. Run `npm run release:ios:build` to create the production iOS binary.
4. Confirm EAS assigns the intended next iOS build number; for this release track, that should be Build 10 if the remote build counter is currently at 9.
5. After confirming the correct successful binary, run `npm run release:ios:submit` to submit it to App Store Connect app ID `6808849541`.
6. Wait for Apple build processing to finish.
7. Install that exact processed build from TestFlight on a real iPhone.
8. Complete `SCANNER_STRESS_TEST.md` and the real-device portions of `CLINICIAN_WORKFLOW_QA.md`.
9. Specifically verify account deletion on the TestFlight binary with a disposable test account.
10. Only then select the build for the App Store version and submit to App Review.

## Real-device minimum smoke pass

- Saved default scanner loads on first entry.
- A manually selected non-default scanner persists through navigation.
- Scanner Unknown persists through navigation.
- 1.5T → 3T → Unknown rapid switching never leaves stale guidance.
- Device A → Device B rapid switching never leaves Device A questions/results visible.
- Changing device/scanner/region/coil/components after a result clears/invalidates prior exact results.
- 1.5T-only implant on 3T remains not cleared.
- Incomplete/wrong exact components remain unknown/not cleared.
- Manufacturer MRI instructions open from the live result.
- Manufacturer MRI instructions open from History.
- New QuickCheck appears in History on return without manual refresh.
- Sign up, sign in, sign out, reset password, and Face ID behave correctly.
- Delete account permanently works with a disposable TestFlight account and returns the app to sign-in.

## Go / no-go

GO only when:

- all automated CI/backend gates remain green;
- Apple/EAS credentials and agreements are valid;
- the production Build 10 binary uploads and processes successfully;
- the real-device/TestFlight smoke pass is complete with no release blocker;
- App Store privacy, age-rating, support, review, and regulated-medical-device fields are complete.

NO-GO if any result becomes more permissive than manufacturer labeling, stale context can pair with an old decision, source access is missing, account deletion fails, or any release gate falls below 100%.
