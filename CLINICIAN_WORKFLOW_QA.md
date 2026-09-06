# MRI Safety QuickCheck — Build 10 Clinician Workflow QA

This matrix is the Step 2 end-to-end workflow gate for `build-10-rc`. It is designed to test the same path a clinician will use: search → identify exact system → select scanner/exam context → review manufacturer labeling → run exact QuickCheck → confirm conditions → review history/audit details.

## Release rule

Any case that produces a more permissive result than current manufacturer labeling, carries a prior scanner/result into a new context, skips a required component/question, or loses source visibility is a release blocker. Unknown or incomplete configurations must remain fail-closed.

## Core workflow cases

| # | Workflow | Expected result |
|---|---|---|
| 1 | Search by exact manufacturer model number | Correct device appears without unrelated higher-ranked match |
| 2 | Search by common term such as pain pump/stimulator/pacemaker | Relevant device class is returned |
| 3 | Search using abbreviation and minor misspelling | Search remains usable without promoting an incorrect model |
| 4 | Open pinned/favorite implant | Same model opens and current manufacturer labeling loads |
| 5 | Open recent implant | Same model opens and stale prior exam/result is not reused |
| 6 | Select exact generator + complete supported components | Exact-system path is available and uses v5 wrapper |
| 7 | Omit one required component from a cardiac/CRT system | MORE INFORMATION / unknown; never conditional-clear |
| 8 | Choose wrong lead/component for generator | Unknown/not cleared; never inherit eligibility from similar model |
| 9 | Choose correct component in wrong slot | Unknown/not cleared |
| 10 | Duplicate or incomplete component slots | Fail closed |
| 11 | 1.5T-only system on 1.5T scanner | Manufacturer conditional pathway shown if all other conditions match |
| 12 | Same 1.5T-only system on 3T scanner | NOT CLEARED / 1.5T only |
| 13 | 1.5T/3T system on supported 3T scanner | Correct 3T conditions shown |
| 14 | Scanner unknown | Manufacturer labeling still visible; no scanner-specific clearance |
| 15 | Change scanner after exact result | Prior result/checklist cleared immediately |
| 16 | Change scan region after guidance/result | Guidance re-evaluates for new region; stale region result not retained |
| 17 | Required RF coil unknown | MORE INFORMATION / fail closed where coil affects eligibility |
| 18 | Incompatible RF coil selected | NOT CLEARED for selected exam context |
| 19 | Region-specific implant with allowed region | Allowed manufacturer condition path shown |
| 20 | Same implant with disallowed region | NOT CLEARED for selected exam |

## High-risk device pathways

| # | Workflow | Expected result |
|---|---|---|
| 21 | Cardiac complete-system case | Generator + every required lead/accessory/port validated exactly |
| 22 | Cardiac abandoned component = present/not excluded | NOT CLEARED |
| 23 | CRT all generator ports not accounted for | MORE INFORMATION |
| 24 | Medtronic/Abbott/Boston connector substitution | Wrong connector family fails closed |
| 25 | Inspire intact system | Device-specific pathway and manufacturer conditions shown |
| 26 | Inspire abandoned lead condition | Specialized abandoned-lead guard executes before generic path |
| 27 | InterStim serial-dependent legacy pathway | Serial requirement enforced |
| 28 | InterStim EOS/fragment pathway | Specialized EOS/fragment logic executes and does not infer normal-system eligibility |
| 29 | DBS complete exact system | Exact manufacturer component path required |
| 30 | DBS mixed/unlisted component | Unknown/not cleared |
| 31 | SCS exact supported system | Correct field/region conditions shown |
| 32 | SCS legacy MR-unsafe/not-compatible system | Unsafe/not cleared remains explicit |
| 33 | Pain pump requiring pre/post MRI actions | Programming/workflow requirements remain prominent |
| 34 | ICM/loop recorder device-only pathway | No artificial lead requirement; scanner/conditions still required |
| 35 | Model-level verified but exact system unresolved (e.g. fail-closed catalog record) | Manufacturer model info visible; MRI decision remains unknown |

## Confirmation and final-decision cases

| # | Workflow | Expected result |
|---|---|---|
| 36 | Exact conditional result before checklist completion | `safe_to_scan` must remain false |
| 37 | Leave one required manufacturer condition unconfirmed | Final verified-conditions state unavailable |
| 38 | Confirm all applicable conditions | Only then may verified-conditions state appear for supported verification bases |
| 39 | Change scanner after confirming checklist | All confirmations cleared |
| 40 | Change device after confirming checklist | All confirmations and exact-system state cleared |
| 41 | Required device-specific question unanswered | MORE INFORMATION REQUIRED |
| 42 | Required dangerous preparation question answered No | Hard stop / NOT CLEARED |
| 43 | Manufacturer source link from result | Opens current manufacturer MRI instructions/source |
| 44 | Unknown/incomplete case | Manufacturer labeling still remains accessible when available |
| 45 | Result saved to History | Scanner, device, exam context, status, and audit details correspond to the performed check |

## Adversarial state/race cases

| # | Workflow | Expected result |
|---|---|---|
| 46 | Rapidly select device A then device B | Final visible guidance belongs only to device B |
| 47 | Rapidly switch 1.5T → 3T → Unknown | Final visible guidance matches Unknown; no earlier response overwrites it |
| 48 | Rapid region changes | Final guidance/exam context matches last region selected |
| 49 | Navigate away/back after manual scanner selection | Manual scanner selection persists |
| 50 | Navigate away/back after Scanner unknown | Unknown persists rather than silently restoring default |

## Step 2 acceptance

Step 2 passes only when:

- all automated Build 10 CI checks pass;
- live clinical regression v31 remains 589/589 or higher;
- baseline v2 remains 46/46;
- release gate v2 remains 16/16;
- the mobile exact-system call uses `quickcheck_run_exact_system_check_v5`;
- no workflow case above shows a stale, more permissive, or source-less result;
- all real-device/UI-only cases are recorded as pass/fail before TestFlight clinician distribution.

Build 9 / `main` must remain unchanged during this QA pass.
