# Rights-safe MRI QuickCheck release

Branch: rights-safe-content-20260915

This release surface presents only authored MRI condition summaries:
- MR status, field-strength range, scan region, and numeric limits when present.
- Source-record title, source URL, labeling revision, effective date, verified date, and retrieved date.
- Generic authored prompts to verify the current source record.

The app does not render manufacturer requirement paragraphs, copied checklist requirements, tables, screenshots, PDFs, logos, or embedded manufacturer pages. Source URLs open externally with the device's browser.

The Supabase migration `20260915130000_rights_safe_mri_outputs.sql` adds authenticated rights-safe RPC wrappers that allowlist factual fields and source metadata. The app calls those wrappers for guidance, exact checks, and condition confirmation.

Build from this branch after checking out the repository:

```sh
npx eas-cli@latest build -p ios --profile production
```

Submit the resulting iOS build to App Store Connect only after verifying the binary and confirming the source records shown in the app.
