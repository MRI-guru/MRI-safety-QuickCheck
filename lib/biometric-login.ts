import * as SecureStore from 'expo-secure-store';

const SAVED_EMAIL_KEY = 'mri_quickcheck_saved_email';
const SAVED_PASSWORD_KEY = 'mri_quickcheck_saved_password';

const protectedOptions: SecureStore.SecureStoreOptions = {
  requireAuthentication: true,
  authenticationPrompt: 'Use Face ID to sign in to MRI Safety QuickCheck.'
};

export async function canUseBiometricLogin() {
  try {
    return SecureStore.canUseBiometricAuthentication();
  } catch {
    return false;
  }
}

export async function hasSavedLogin() {
  try {
    return Boolean(await SecureStore.getItemAsync(SAVED_EMAIL_KEY));
  } catch {
    return false;
  }
}

export async function getSavedEmail() {
  try {
    return (await SecureStore.getItemAsync(SAVED_EMAIL_KEY)) ?? '';
  } catch {
    return '';
  }
}

export async function saveBiometricLogin(email: string, password: string) {
  await SecureStore.setItemAsync(SAVED_EMAIL_KEY, email.trim().toLowerCase(), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
  await SecureStore.setItemAsync(SAVED_PASSWORD_KEY, password, {
    ...protectedOptions,
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

export async function readBiometricLogin() {
  const email = await SecureStore.getItemAsync(SAVED_EMAIL_KEY);
  if (!email) return null;

  const password = await SecureStore.getItemAsync(SAVED_PASSWORD_KEY, protectedOptions);
  if (!password) return null;

  return { email, password };
}

export async function clearBiometricLogin() {
  await SecureStore.deleteItemAsync(SAVED_EMAIL_KEY);
  try {
    await SecureStore.deleteItemAsync(SAVED_PASSWORD_KEY, protectedOptions);
  } catch {
    await SecureStore.deleteItemAsync(SAVED_PASSWORD_KEY).catch(() => undefined);
  }
}
