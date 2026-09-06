# Build 10 RC — Scanner Selection Stress Test

Purpose: verify that scanner selection never reuses or displays MRI guidance/result state calculated for a different scanner context.

## Preconditions

- Build from `build-10-rc` at or after commit `a15c4342e8dd86ff859c9b3e2d074260f3f6bc4a`.
- User has at least two saved scanners: one 1.5T and one 3T.
- One scanner is marked default.
- Use a device with different 1.5T vs 3T behavior where possible, preferably a manufacturer-labeled 1.5T-only device for the strongest stale-result signal.

## Pass criteria

Every deliberate scanner change must immediately invalidate the previously displayed result/condition confirmations/exam context. The app may then load fresh manufacturer guidance for the newly selected scanner. A result calculated for scanner A must never remain visible as if it applies to scanner B.

## Test matrix

| # | Action | Expected result |
|---|---|---|
| 1 | Cold-open QuickCheck with no prior manual scanner choice | Saved default scanner is selected automatically. |
| 2 | Select saved non-default 1.5T scanner | Picker closes; selected scanner changes to 1.5T; old result/checklist confirmations/exam context are cleared; fresh guidance uses 1.5T. |
| 3 | Navigate away from QuickCheck and return | Manually selected 1.5T scanner remains selected; default scanner does not overwrite it. |
| 4 | Run a device check on 1.5T, then change to saved 3T scanner | 1.5T result disappears immediately; confirmations and exam context clear; any replacement guidance reflects 3T. |
| 5 | Navigate away and return | Manually selected 3T scanner remains selected. |
| 6 | Change from 3T to `Scanner unknown / guidelines only` | Scanner/profile selection clears; previous 3T result/confirmations/exam context clear; manufacturer labeling may reload without scanner-specific clearance. |
| 7 | Navigate away and return | `Scanner unknown` remains selected and is not silently replaced by the default. |
| 8 | From Unknown select 1.5T, then immediately select 3T | Final displayed scanner is 3T; no result or condition state from the intermediate 1.5T selection may be presented as current. |
| 9 | From 3T select Unknown, then immediately select 1.5T | Final displayed scanner is 1.5T; no Unknown/3T result may overwrite the current 1.5T state. |
| 10 | Run a conditional result, check condition checklist boxes, then change scanner | All prior condition confirmations clear immediately. |
| 11 | Create an exam-context conflict on one scanner, then change scanner | Prior conflict card clears and is recalculated for the new scanner. |
| 12 | Select non-default scanner, lock/background app, return | Manual scanner selection remains stable for the mounted QuickCheck session. |
| 13 | Change the default scanner in Scanner Settings, return to QuickCheck after a manual selection was already made | Current manual selection remains unchanged during the current mounted session. The new default is not allowed to silently replace it. |
| 14 | Start a result on a 1.5T-only implant at 1.5T, then change to 3T | Previous conditional/eligible result is removed; 3T must not inherit the 1.5T status. Expected new state is manufacturer-appropriate `not_cleared`/guidance. |
| 15 | Repeat scanner switches 1.5T → 3T → Unknown → 1.5T ten times | No stale result, confirmation, or exam-context state survives any transition; final scanner and displayed guidance always agree. |

## Failure conditions

Treat any of the following as a release blocker:

- Focus/navigation silently restores the default after a manual choice.
- `Scanner unknown` is replaced by the default after navigation.
- A result card remains visible after the scanner changes before fresh guidance is returned.
- Checklist confirmations remain checked after scanner change.
- Exam-context conflict/readiness from the prior scanner remains visible after scanner change.
- A 1.5T eligibility/result is ever shown while the selected scanner UI says 3T, or vice versa.
- A slower response from an earlier scanner selection overwrites the result for a later scanner selection.

## Current automated/static validation

- GitHub Actions Build 10 RC validation: TypeScript `tsc --noEmit` PASS.
- Expo Doctor: 21/21 checks PASS.
- Commit `a15c434...` fixes focus/default restoration so deliberate scanner selection and `Scanner unknown` persist across focus while the default still initializes an untouched session.

## Remaining manual requirement

This matrix must be executed on an actual iOS device/TestFlight or local development build before Step 1 can be marked fully passed. Static/CI validation does not substitute for the real-device interaction test.
