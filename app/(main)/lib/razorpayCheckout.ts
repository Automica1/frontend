const CHECKOUT_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let activeCheckout: { close: () => void } | null = null;

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SCRIPT_SRC}"]`
    );

    if (existingScript) {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      existingScript.addEventListener('load', () => resolve(Boolean((window as any).Razorpay)), {
        once: true,
      });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean((window as any).Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const closeActiveCheckout = () => {
  if (!activeCheckout) return;

  try {
    activeCheckout.close();
  } catch {
    // Razorpay may already be closed.
  }

  activeCheckout = null;
};

export const cleanupRazorpayModal = () => {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.razorpay-container, .razorpay-backdrop').forEach((node) => node.remove());
  document.body.style.overflow = '';
};

export const openRazorpayCheckout = (options: Record<string, unknown>) => {
  closeActiveCheckout();

  const paymentObject = new (window as any).Razorpay(options);
  activeCheckout = paymentObject;
  paymentObject.open();
  return paymentObject;
};
