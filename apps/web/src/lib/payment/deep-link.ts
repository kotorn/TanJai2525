// SEC-0002: Payment Deep Link Integration
// Owner: Guardian Sec

type BankApp = 'KPLUS' | 'SCB_EASY' | 'KMA';

interface DeepLinkParams {
    amount: number;
    ref1: string; // Order ID
    ref2?: string; // Table ID
    accountNo: string; // Merchant Account
}

export const PaymentDeepLink = {
    /**
     * Generates a deep link to open the specific banking app.
     * Note: Schema formats are based on public specs or reverse engineering.
     */
    generate: (app: BankApp, params: DeepLinkParams): string => {
        const { amount, ref1, ref2, accountNo } = params;
        const ref2Safe = ref2 || 'POS';

        switch (app) {
            case 'KPLUS':
                // KPlus Schema (Example structure)
                // kplus://payment?billerId={acc}&ref1={ref1}&ref2={ref2}&amount={amount}
                return `kplus://payment?billerId=${accountNo}&ref1=${ref1}&ref2=${ref2Safe}&amount=${amount}`;
            
            case 'SCB_EASY':
                // SCB Easy Schema
                // scbeasy://payment/billpayment?billerid={acc}&ref1={ref1}&ref2={ref2}&amount={amount}
                return `scbeasy://payment/billpayment?billerid=${accountNo}&ref1=${ref1}&ref2=${ref2Safe}&amount=${amount}`;
            
            case 'KMA':
                 return `kma://payment?billerId=${accountNo}&ref1=${ref1}&amount=${amount}`;

            default:
                return '#';
        }
    },

    /**
     * checks if the current user agent is likely to support deep linking (Mobile).
     */
    isMobile: (): boolean => {
        if (typeof window === 'undefined') return false;
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
};
