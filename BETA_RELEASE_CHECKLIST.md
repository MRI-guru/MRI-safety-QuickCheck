# MRI Safety QuickCheck — Controlled Beta Release Checklist

## Automated release gates

- [x] Clinical regression suite v2: 46/46 passing
- [x] Release matrix v2: 16/16 passing
- [x] No active records falsely marked verified without labeling verification
- [x] Exact-system engine v5 is the active compatibility path
- [x] Scanner profile selection/default/delete workflow implemented
- [x] QuickCheck History expanded for audit review

## Catalog / labeling

- [x] 373 active records currently verified
- [ ] Resolve remaining 4 `needs_review` records only when current manufacturer/authoritative labeling is sufficient
- [ ] Do not promote Abbott Quadra Assura CD3371-40C until exact MRI Ready device/lead combinations are loaded and verified
- [ ] Keep unresolved legacy orbital/stapes records fail-closed until authoritative source re-verification is complete

## iOS beta build

- [x] iOS bundle identifier configured: `com.mriguru.mrisafetyquickcheck`
- [x] EAS development, preview, and production build profiles configured
- [x] Production builds use auto-increment
- [x] Non-exempt encryption flag configured as false
- [ ] Confirm Expo/EAS account is linked to the project
- [ ] Confirm paid Apple Developer membership
- [ ] Configure/confirm iOS distribution certificate and provisioning profile
- [ ] Create or confirm App Store Connect app record
- [ ] Create production iOS build
- [ ] Submit build to TestFlight
- [ ] Create internal TestFlight group

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

## Required beta feedback

For every suspected incorrect result, capture:

1. device manufacturer/model and all known component model numbers
2. selected scanner make/model/field strength
3. scan region
4. displayed QuickCheck status
5. manufacturer document/manual used for comparison
6. screenshot of the result when possible
7. whether the issue is search, data, rules-engine, UI, or source-link related

## Go/no-go rule

Do not send a new beta build if either automated release gate fails. A catalog record that lacks sufficient current source verification remains `needs_review`/fail-closed rather than being promoted to verified for release convenience.
