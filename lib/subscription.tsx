import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import Purchases, { INTRO_ELIGIBILITY_STATUS, type CustomerInfo, type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';

const REVENUECAT_IOS_API_KEY = 'appl_wUdxpANQuglJvKWxGBibpExaraj';
const PRO_ENTITLEMENT = 'pro';

type SubscriptionContextValue = {
  customerInfo: CustomerInfo | null;
  offering: PurchasesOffering | null;
  trialEligibleProductIds: ReadonlySet<string>;
  isPro: boolean;
  loading: boolean;
  error: string;
  purchase: (selectedPackage: PurchasesPackage) => Promise<boolean>;
  refresh: () => Promise<void>;
  restore: () => Promise<boolean>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

let configuredUserId: string | null = null;

function hasProAccess(info: CustomerInfo | null) {
  return Boolean(info?.entitlements.active[PRO_ENTITLEMENT]?.isActive);
}

function messageFor(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'userCancelled' in error && error.userCancelled) return '';
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

async function configurePurchases(appUserId: string) {
  if (process.env.EXPO_OS !== 'ios') return;

  const isConfigured = await Purchases.isConfigured();
  if (!isConfigured) {
    Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY, appUserID: appUserId });
  } else if (configuredUserId !== appUserId) {
    const currentUserId = await Purchases.getAppUserID();
    if (currentUserId !== appUserId) await Purchases.logIn(appUserId);
  }
  configuredUserId = appUserId;
}

export function SubscriptionProvider({ appUserId, children }: PropsWithChildren<{ appUserId: string }>) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [trialEligibleProductIds, setTrialEligibleProductIds] = useState<ReadonlySet<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (process.env.EXPO_OS !== 'ios') {
      setError('Subscriptions are available in the iOS app.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await configurePurchases(appUserId);
      const [info, offerings] = await Promise.all([Purchases.getCustomerInfo(), Purchases.getOfferings()]);
      const currentOffering = offerings.current ?? offerings.all.default ?? null;
      setCustomerInfo(info);
      setOffering(currentOffering);
      if (currentOffering) {
        const productIds = currentOffering.availablePackages.map(item => item.product.identifier);
        const eligibility = await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds);
        setTrialEligibleProductIds(new Set(productIds.filter(id => eligibility[id]?.status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE)));
      }
    } catch (caught) {
      setError(messageFor(caught, 'Unable to load subscription options. Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }, [appUserId]);

  useEffect(() => {
    let active = true;
    const listener = (info: CustomerInfo) => {
      if (active) setCustomerInfo(info);
    };

    void load().then(() => {
      if (active && process.env.EXPO_OS === 'ios') Purchases.addCustomerInfoUpdateListener(listener);
    });

    return () => {
      active = false;
      if (process.env.EXPO_OS === 'ios') Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [load]);

  const purchase = useCallback(async (selectedPackage: PurchasesPackage) => {
    setError('');
    try {
      const result = await Purchases.purchasePackage(selectedPackage);
      setCustomerInfo(result.customerInfo);
      return hasProAccess(result.customerInfo);
    } catch (caught) {
      setError(messageFor(caught, 'The purchase could not be completed. Please try again.'));
      return false;
    }
  }, []);

  const restore = useCallback(async () => {
    setError('');
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      if (!hasProAccess(info)) setError('No active MRI Safety QuickCheck Pro subscription was found for this Apple Account.');
      return hasProAccess(info);
    } catch (caught) {
      setError(messageFor(caught, 'Purchases could not be restored. Check your connection and try again.'));
      return false;
    }
  }, []);

  const value = useMemo<SubscriptionContextValue>(() => ({
    customerInfo,
    offering,
    trialEligibleProductIds,
    isPro: hasProAccess(customerInfo),
    loading,
    error,
    purchase,
    refresh: load,
    restore
  }), [customerInfo, error, load, loading, offering, purchase, restore, trialEligibleProductIds]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const value = useContext(SubscriptionContext);
  if (!value) throw new Error('useSubscription must be used within SubscriptionProvider.');
  return value;
}
