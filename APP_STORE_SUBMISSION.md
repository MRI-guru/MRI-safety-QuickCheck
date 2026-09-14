# MRI Safety QuickCheck — App Store Submission Packet

Prepared for iOS 1.0 controlled beta / initial App Store submission.

## App information

**Name:** MRI Safety QuickCheck

**Subtitle (30 characters max):** MRI Implant Safety Support

**Primary category:** Medical

**Secondary category:** Utilities

**Copyright:** 2026 MRI Safety QuickCheck

## Promotional text

Rapid MRI implant safety decision support for trained MRI personnel, with scanner-aware checks and direct manufacturer-labeling references.

## App Store description

MRI Safety QuickCheck is a clinician-focused decision-support tool designed to help trained MRI personnel rapidly evaluate MRI conditions for implantable devices.

The app combines device identification, scanner field strength, exam context, exact-system details, and current manufacturer MRI labeling into a structured workflow that emphasizes conservative, fail-closed decisions when required information is missing or conflicting.

Key features include:

• Searchable implant/device catalog with manufacturer and model details
• Scanner profiles including make, model, and field strength
• Scanner-aware MRI compatibility checks
• Exact generator, lead, and component pathways where manufacturer labeling requires a complete system
• Body-part and RF-coil context for device-specific MRI restrictions
• Multi-implant assessment using the most restrictive applicable result
• Favorites and recent-device access
• QuickCheck history for workflow review
• Direct access to manufacturer MRI labeling/guidance for verified device records
• Account-based synchronization and saved scanner profiles

MRI Safety QuickCheck is decision support only. It is not a substitute for current manufacturer labeling, institutional policy, qualified MRI safety review, or clinical judgment. Users remain responsible for confirming the exact implant and all components, current manufacturer MRI conditions, patient-specific factors, scanner parameters, and local policy before scanning.

The app intentionally fails closed when exact device/system information or manufacturer conditions are incomplete, unresolved, or conflicting.

## Keywords

MRI,safety,implant,pacemaker,stimulator,defibrillator,scanner,MR conditional,medical

## Support text / contact

For support, beta feedback, or suspected manufacturer-labeling issues, contact: dballas88@gmail.com

Do not include patient-identifying information in support or feedback messages.

## TestFlight beta description

MRI Safety QuickCheck is a controlled clinician beta for rapid MRI implant/device safety workflow testing. Please test device search, scanner selection, exact-component pathways, body-part/RF-coil restrictions, manufacturer guidance links, multi-implant assessment, Favorites/Recent devices, QuickCheck History, authentication, and account deletion.

This beta is decision support only. Always verify the exact implant/system and current manufacturer MRI labeling before scanning. Do not enter patient-identifying information in the app or beta feedback.

## What to test

Please focus on:

- scanner switching and default scanner behavior
- 1.5T-only implant evaluated on a 3T scanner
- exact generator + lead/component workflows
- incomplete or unknown systems
- abandoned/fractured lead paths
- body-region restrictions and RF coil selection
- LivaNova VNS exact-pathway confirmation
- manufacturer-labeling/source links
- multi-implant combined assessment
- Favorites/Recent devices
- QuickCheck History
- sign-up, email confirmation, password reset, sign-out, privacy access, and account deletion

If reporting a suspected incorrect result, include the implant manufacturer/model, component model numbers if known, scanner make/model/field strength, scan region, selected RF coil when applicable, displayed status, and manufacturer document used for comparison. Do not include patient-identifying information.

## Beta App Review notes

MRI Safety QuickCheck is a professional clinical decision-support application intended for trained MRI personnel.

A reviewer account is required to access the complete feature set. Use the active demo credentials entered in the dedicated Demo Account Name and Demo Account Password fields in App Store Connect. Do not place credentials in this notes field.

Suggested review path:

1. Sign in with the supplied demo account.
2. Open QuickCheck.
3. Select or create a scanner profile with a field strength.
4. Search for an implantable device and select a verified device/model.
5. Review the scanner-aware result and manufacturer-guidance section.
6. Where prompted, enter exact component, exam-region, RF-coil, or manufacturer-condition details.
7. Open Multi-Implant to review the combined fail-closed assessment workflow.
8. Open History and Favorites/Recent devices.
9. Open Settings to view the Privacy Policy and account-deletion control.

Important clinical behavior: the app is intentionally conservative. Unknown devices, incomplete exact systems, unsupported scanner conditions, or unresolved manufacturer requirements remain not cleared / require more information rather than being treated as safe.

The app does not claim to replace manufacturer labeling or clinical judgment. It directs users to current manufacturer guidance and reminds users to confirm the exact implant/system, patient-specific conditions, scanner parameters, and institutional policy before scanning.

No patient-identifying information is required for review.

## App Review notes for public App Store submission

MRI Safety QuickCheck is intended for trained MRI personnel as decision support. It evaluates implant/device MRI conditions using current manufacturer labeling and scanner/exam context. It does not independently diagnose disease, measure physiologic values, prescribe treatment, or replace manufacturer instructions or institutional MRI safety policy.

The app deliberately fails closed when exact device/system information is incomplete, when the selected scanner conflicts with manufacturer labeling, or when required conditions cannot be confirmed.

Please use the active review account supplied in the App Review Sign-In Information fields to access all functionality. No patient-identifying information is needed or requested.

## App Privacy questionnaire — draft based on current beta implementation

This section must be confirmed against the production build and every integrated SDK before publishing.

### Does the app collect data?

**Yes.** The current beta uses account authentication and stores account-linked application data.

### Data types likely requiring disclosure

**Contact Info — Email Address**
- Collected: Yes, for account creation/authentication.
- Linked to the user: Yes.
- Used for: App functionality / account management.
- Tracking: No.

**User Content / Other User Content**
- Scanner profiles, favorites, recent-device activity, QuickCheck history, and user-created workflow data may be stored with the account.
- Linked to the user: Yes while account-associated.
- Used for: App functionality.
- Tracking: No.

**Identifiers — User ID**
- Supabase authentication/account identifiers are used to associate saved app data with the account.
- Linked to the user: Yes.
- Used for: App functionality / account management / security.
- Tracking: No.

Do not mark patient health information as intentionally collected unless the production app actually stores patient-identifying or patient-specific health data. Current beta policy explicitly instructs users not to enter patient-identifying information.

The controlled beta does not intentionally include advertising SDKs or cross-app tracking.

## Privacy Policy URL

A public HTTPS privacy-policy URL is required before public App Store submission. The repository currently contains `PRIVACY_POLICY.md`, but a stable public-facing URL should be entered into App Store Connect and tested without authentication.

## Support URL

A public HTTPS support page is required for the App Store product page. It should include at minimum:

- app name
- support email
- a short explanation of supported use
- how to report device-labeling issues
- instruction not to include PHI/patient identifiers
- privacy-policy link

## Age rating

Complete Apple's current age-rating questionnaire in App Store Connect. This app is intended for professional/clinical users and is not directed to children. Answer the questionnaire according to actual app content rather than selecting a desired rating manually.

## Content rights

Confirm that MRI Safety QuickCheck has the rights/permission necessary to display its own text, manufacturer names/model identifiers, and links/citations to manufacturer materials. Do not represent third-party manufacturer documents or marks as owned by MRI Safety QuickCheck.

## Export compliance

Current Expo configuration sets `ITSAppUsesNonExemptEncryption` to `false`. Confirm that the production binary only uses exempt/standard platform encryption and that no non-exempt cryptography has been added before submission.

## Medical-app review preparation

Because this is a medical decision-support app, App Review may scrutinize safety and accuracy more closely. Keep these points explicit in the app and review metadata:

- decision support only
- trained/professional users
- manufacturer labeling is authoritative
- exact device/system and scanner conditions must be verified
- unknown/incomplete/conflicting cases fail closed
- not a substitute for qualified MRI safety review or institutional policy
- users should consult appropriate qualified clinical personnel before making patient-care decisions

If the app later receives regulatory clearance, provide Apple with the applicable documentation. Do not claim regulatory clearance unless it has actually been obtained.

## Screenshots recommended for iPhone listing

Capture clean production/TestFlight screenshots without patient data showing:

1. Home/dashboard with QuickCheck entry point
2. Device search with scanner profile visible
3. A clear MR Conditional result with manufacturer guidance visible
4. A fail-closed / more-information-required result
5. Multi-implant assessment
6. Manufacturer guidance/source view
7. QuickCheck History or Favorites

Use only screenshots from the current production candidate build. Avoid screenshots containing demo email addresses, internal IDs, debug text, or patient-identifying information.

## Final pre-submission checklist

- [ ] New production iOS build completes successfully in EAS
- [ ] Build appears and finishes processing in App Store Connect
- [ ] External TestFlight beta review information is complete
- [ ] Active demo reviewer credentials verified on the exact submitted build
- [ ] New build tested by clinician beta group
- [ ] Stable public HTTPS Privacy Policy URL entered
- [ ] Stable public HTTPS Support URL entered
- [ ] App Privacy questionnaire completed and published
- [ ] Age Rating questionnaire completed
- [ ] Primary/secondary categories confirmed
- [ ] Description, subtitle, keywords, promotional text finalized
- [ ] Final screenshots uploaded for required iPhone display sizes
- [ ] App Review contact information completed
- [ ] App Review sign-in information completed
- [ ] Review notes pasted and checked
- [ ] Export-compliance response confirmed
- [ ] Content-rights response confirmed
- [ ] Pricing/availability selected
- [ ] Version build selected
- [ ] No placeholder metadata/URLs remain
- [ ] Add for Review
- [ ] Submit for Review
