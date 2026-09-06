# Build 10 RC — Step 2 Clinician Workflow QA Status

- Mobile exact-system RPC: `quickcheck_run_exact_system_check_v5`
- v4 mobile exact-system RPC calls: prohibited by Build 10 CI guard
- Clinician workflow matrix: `CLINICIAN_WORKFLOW_QA.md`
- Scanner stress matrix: `SCANNER_STRESS_TEST.md`
- Backend gates last verified during Step 2: v31 589/589; v2 baseline 46/46; release v2 16/16
- Build 10 CI: exact-system wrapper guard PASS; TypeScript PASS; Expo Doctor PASS
- Build 9 / `main`: unchanged

## Automated high-risk coverage confirmed

The live v31 regression matrix is passing across representative high-risk workflow groups including:

- Cardiac exact component validation: 18/18
- Cardiac full-system gate: 2/2
- Medtronic CRT-P current catalog guards: 12/12
- Medtronic Mirro/Primo connector guards: 8/8
- Medtronic pacing current catalog guards: 8/8
- Inspire intact: 3/3
- Inspire abandoned lead: 3/3
- InterStim 3023 serial pathway: 5/5
- InterStim EOS: 3/3
- InterStim fragment: 4/4
- Abbott DBS: 3/3
- Medtronic DBS: 3/3
- Boston DBS mixed-system guards: 3/3
- Axonics SNM: 3/3
- Legacy Medtronic SCS: 8/8
- LivaNova VNS: 4/4
- Aurora EV-ICD standard: 5/5
- Aurora EV-ICD adversarial: 12/12

## Step 2 blockers resolved

1. GitHub issue #2 — stale device-question responses after rapid device A → B selection: FIXED/CLOSED.
2. GitHub issue #3 — stale in-flight exact QuickCheck after scanner/device/region/coil/context change: FIXED/CLOSED.
3. History manufacturer-source navigation: manufacturer MRI source is now actionable from audit details.

## Remaining Step 2 work

Step 2 is no longer blocked by known code defects. Remaining work is the real-device/TestFlight execution of UI-only workflow cases, including rapid interaction behavior, source opening on-device, History audit review, scanner persistence, and final visual verification that no stale result is shown after context changes.

Step 2 passes only after those manual cases are recorded as pass/fail before clinician distribution.
