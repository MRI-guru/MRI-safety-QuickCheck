# MRI Safety QuickCheck

MRI Safety QuickCheck is an iPhone-first clinical decision-support app backed by the Supabase MRI labeling engine.

## Product design

The UI is scanner-first and fail-closed:

- Green: verified conditions met / MR Safe path.
- Amber: MR Conditional — verify manufacturer conditions.
- Red: hard conflict / not cleared for the selected scanner.
- Gray: unknown or unverified.
- Exact device and component identity is required; similar models are not substituted.
- Manufacturer MRI labeling remains the primary authority.

## Stack

- Expo SDK 57 / React Native 0.86
- Expo Router
- Supabase Auth + protected RPCs
- Expo SecureStore for native auth-session storage
- EAS Build / TestFlight

## Environment

Copy `.env.example` to `.env` for local development or configure the same variables in EAS:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://rmuzmvfzcsmihqoovkms.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
```

Do not put a Supabase service-role or secret key in the mobile app.

## Local run

Use Node 22.13+ for Expo SDK 57.

```bash
npm install
npx expo-doctor@latest
npx expo install --fix
npx expo start
```

Start with Expo Go for UI iteration. Use a development build when native configuration requires it.

## Apple / TestFlight

The project is configured with the initial iOS bundle identifier:

`com.mriguru.mrisafetyquickcheck`

If the App Store Connect record uses a different bundle identifier, update `app.json` before the first production build.

Then link the Expo project and credentials:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest credentials -p ios
```

Configure the Supabase public environment variables in EAS, then create the first iOS build:

```bash
npx eas-cli@latest build -p ios --profile production
```

For TestFlight submission after App Store Connect is linked:

```bash
npx testflight
```

The vector icon master is at `assets/brand/app-icon-master.svg`. Export a 1024x1024 PNG without transparency for the final App Store icon and reference it from `app.json` before submission.

## Current screens

- Protected clinical sign-in
- QuickCheck dashboard
- Saved MRI scanner profiles
- Scanner-first exact-system QuickCheck V3 flow
- Exact device/component search
- Serial-number field for serial-dependent labeling
- Color-coded result card
- QuickCheck history
- Settings / clinical disclaimer / sign out

## Safety

This application is decision support for trained MRI personnel. Final scanning decisions must follow current manufacturer labeling, patient-specific review, scanner conditions, and facility policy.
