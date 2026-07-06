// app/(main)/lib/subscriptionApi.ts
import { apiService } from './apiService';

export const subscriptionApi = {
    async createOrder() {
        return apiService.post('/subscription/create-order', {});
    },

    async verifyPayment(paymentData: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }) {
        return apiService.post('/subscription/verify-payment', paymentData);
    },

    async getStatus() {
        return apiService.get('/subscription/status');
    },

    async cancelSubscription() {
        return apiService.post('/subscription/cancel', {});
    },

    async resumeSubscription() {
        return apiService.post('/subscription/resume', {});
    },

    async calculateUpgradePrice(planId: string) {
        return apiService.calculateUpgradePrice(planId);
    },

    async createUpgradeOrder(planId: string) {
        return apiService.createUpgradeOrder(planId);
    },

    async downgradeSubscription(planId: string) {
        return apiService.downgradeSubscription(planId);
    },

    async clearPendingPlanChange() {
        return apiService.clearPendingPlanChange();
    },
};
