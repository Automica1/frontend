// x:\Web Dev\Automica\frontend\app\(admin)\admin\plans\page.tsx
'use client';

import { useEffect, useState } from "react";
import { apiService, Plan } from "../../lib/apiService";
import { useAdminFeedback } from "../../components/AdminFeedback";
import {
    Package,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    DollarSign,
    Coins,
    AlertCircle,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPlansPage() {
    const { confirm, toast } = useAdminFeedback();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        planId: "",
        name: "",
        description: "",
        priceUsd: 0,
        priceInr: 0,
        razorpayPlanIdUsd: "",
        razorpayPlanIdInr: "",
        credits: 0,
        isActive: true,
        featuresText: "",
        displayOrder: 0,
        isPopular: false,
        contactSales: false,
        ctaLabel: "",
    });

    const getPlanUsdAmount = (plan: Plan) => plan.pricing?.USD?.amount ?? plan.price;
    const getPlanInrAmount = (plan: Plan) => plan.pricing?.INR?.amount ?? 0;

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const data = await apiService.getAllPlans();
            setPlans(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load plans");
        } finally {
            setIsLoading(false);
        }
    };

    const parseFeatures = (text: string) =>
        text
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

    const formatFeatures = (features?: string[]) => (features?.length ? features.join('\n') : '');

    const handleOpenModal = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                planId: plan.planId,
                name: plan.name,
                description: plan.description,
                priceUsd: getPlanUsdAmount(plan) / 100,
                priceInr: getPlanInrAmount(plan) / 100,
                razorpayPlanIdUsd: plan.pricing?.USD?.razorpayPlanId || plan.razorpayPlanId || "",
                razorpayPlanIdInr: plan.pricing?.INR?.razorpayPlanId || "",
                credits: plan.credits,
                isActive: plan.isActive,
                featuresText: formatFeatures(plan.features),
                displayOrder: plan.displayOrder ?? 0,
                isPopular: Boolean(plan.isPopular),
                contactSales: Boolean(plan.contactSales),
                ctaLabel: plan.ctaLabel || "",
            });
        } else {
            setEditingPlan(null);
            setFormData({
                planId: "",
                name: "",
                description: "",
                priceUsd: 0,
                priceInr: 0,
                razorpayPlanIdUsd: "",
                razorpayPlanIdInr: "",
                credits: 0,
                isActive: true,
                featuresText: "",
                displayOrder: 0,
                isPopular: false,
                contactSales: false,
                ctaLabel: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                planId: formData.planId,
                name: formData.name,
                description: formData.description,
                credits: formData.credits,
                isActive: formData.isActive,
                priceUsd: Math.round(formData.priceUsd * 100),
                priceInr: Math.round(formData.priceInr * 100),
                razorpayPlanIdUsd: formData.razorpayPlanIdUsd,
                razorpayPlanIdInr: formData.razorpayPlanIdInr,
                features: parseFeatures(formData.featuresText),
                displayOrder: formData.displayOrder,
                isPopular: formData.isPopular,
                contactSales: formData.contactSales,
                ctaLabel: formData.ctaLabel.trim(),
            };

            if (editingPlan) {
                await apiService.updatePlan(editingPlan.planId, payload);
            } else {
                await apiService.createPlan(payload);
            }

            setIsModalOpen(false);
            fetchPlans();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save plan");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (planId: string) => {
        const ok = await confirm({
            title: "Deactivate plan",
            message: "This will hide the plan from active subscription choices without deleting its history.",
            confirmLabel: "Deactivate",
            tone: "danger",
        });
        if (!ok) return;

        try {
            await apiService.deletePlan(planId);
            toast({
                tone: "success",
                title: "Plan deactivated",
                message: "The plan was updated successfully.",
            });
            fetchPlans();
        } catch (err) {
            toast({
                tone: "error",
                title: "Failed to deactivate plan",
                message: err instanceof Error ? err.message : "Please try again.",
            });
            setError(err instanceof Error ? err.message : "Failed to deactivate plan");
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Subscription Plans</h1>
                    <p className="mt-1 font-medium text-gray-400">
                        Manage catalog pricing and plan copy. Razorpay plan IDs are created automatically when prices are set.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    title="Create a new subscription plan"
                    className="inline-flex w-fit items-center gap-2 rounded-2xl border border-purple-400/20 bg-purple-500/15 px-4 py-2 text-sm font-bold text-purple-100 transition-colors hover:bg-purple-500/25"
                >
                    <Plus className="w-4 h-4" />
                    Create New Plan
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-300" />
                    <p className="font-medium text-gray-400">Loading plans...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {plans.map((plan) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`rounded-[24px] border p-6 space-y-4 shadow-2xl backdrop-blur-xl ${
                                  plan.isActive
                                    ? 'border-white/10 bg-white/5'
                                    : 'border-white/5 bg-black/25'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-xl ${plan.isActive ? 'bg-admin-primary/10 text-admin-primary' : 'bg-slate-200 text-slate-500'}`}>
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenModal(plan)}
                                            className="rounded-xl p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                                            title="Edit Plan"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan.planId)}
                                            className="rounded-xl p-2 text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
                                            title="Deactivate Plan"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold text-admin-text-main">{plan.name}</h3>
                                        {!plan.isActive && (
                                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-300">Inactive</span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-gray-400">{plan.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">USD Price</p>
                                        <p className="flex items-center gap-1 text-lg font-bold text-white">
                                            <DollarSign className="w-4 h-4" />
                                            {getPlanUsdAmount(plan) / 100}
                                            <span className="text-xs font-medium text-gray-500">/mo</span>
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">INR Price</p>
                                        <p className="flex items-center gap-1 text-lg font-bold text-white">
                                            ₹{getPlanInrAmount(plan) / 100}
                                            <span className="text-xs font-medium text-gray-500">/mo</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 py-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Credits</p>
                                        <p className="flex items-center gap-1 text-lg font-bold text-white">
                                            <Coins className="w-4 h-4 text-amber-500" />
                                            {plan.credits.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Plan ID</p>
                                    <code className="rounded border border-white/10 bg-black/25 px-2 py-0.5 text-[10px] font-mono text-gray-200">{plan.planId}</code>
                                    <div className="grid grid-cols-1 gap-1 text-[10px] text-gray-500">
                                        <p>USD Razorpay: <span className="text-gray-300">{plan.pricing?.USD?.razorpayPlanId || plan.razorpayPlanId || '—'}</span></p>
                                        <p>INR Razorpay: <span className="text-gray-300">{plan.pricing?.INR?.razorpayPlanId || '—'}</span></p>
                                    </div>
                                    {plan.isPopular && (
                                        <span className="inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-200">Popular</span>
                                    )}
                                    {plan.contactSales && (
                                        <span className="inline-block rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-200 ml-1">Contact sales</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0c1018] shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between border-b border-white/10 p-6">
                            <h2 className="text-xl font-bold text-white">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                title="Close modal"
                                className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Plan ID (Unique)</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!!editingPlan}
                                        value={formData.planId}
                                        onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10 disabled:opacity-50"
                                        placeholder="tier-1"
                                        title="Unique ID for the plan"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Plan Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                                        placeholder="Basic Plan"
                                        title="Display name for the plan"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">USD Razorpay Plan ID (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.razorpayPlanIdUsd}
                                        onChange={(e) => setFormData({ ...formData, razorpayPlanIdUsd: e.target.value })}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                                        placeholder="Auto-created from USD price if left blank"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">INR Razorpay Plan ID (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.razorpayPlanIdInr}
                                        onChange={(e) => setFormData({ ...formData, razorpayPlanIdInr: e.target.value })}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                                        placeholder="Auto-created from INR price if left blank"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                                    placeholder="What's included in this plan?"
                                    title="Detailed description of plan benefits"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Feature bullets (one per line)</label>
                                <textarea
                                    value={formData.featuresText}
                                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                                    className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                                    placeholder="{credits} AI credits included"
                                />
                                <p className="text-[11px] text-gray-500">Use {'{credits}'} as a placeholder for the plan credit amount.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="priceUsd" className="text-xs font-bold uppercase tracking-wider text-gray-500">USD Price / month</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
                                        <input
                                            id="priceUsd"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.priceUsd}
                                            onChange={(e) => setFormData({ ...formData, priceUsd: Number(e.target.value) })}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 font-bold text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="priceInr" className="text-xs font-bold uppercase tracking-wider text-gray-500">INR Price / month</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                                        <input
                                            id="priceInr"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={formData.priceInr}
                                            onChange={(e) => setFormData({ ...formData, priceInr: Number(e.target.value) })}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 font-bold text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="credits" className="text-xs font-bold uppercase tracking-wider text-gray-500">Credits Per Month</label>
                                    <div className="relative">
                                        <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                        <input
                                            id="credits"
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.credits}
                                            onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 font-bold text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                                            title="Credits awarded per month"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="displayOrder" className="text-xs font-bold uppercase tracking-wider text-gray-500">Display order</label>
                                    <input
                                        id="displayOrder"
                                        type="number"
                                        min="0"
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-bold text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="ctaLabel" className="text-xs font-bold uppercase tracking-wider text-gray-500">Button label (optional)</label>
                                    <input
                                        id="ctaLabel"
                                        type="text"
                                        value={formData.ctaLabel}
                                        onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                                        placeholder="Get Started"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        title={formData.isActive ? "Deactivate plan" : "Activate plan"}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                    <span className="text-sm font-bold text-white">Plan is Active</span>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-white">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPopular}
                                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                                        className="rounded border-white/20"
                                    />
                                    Highlight as popular
                                </label>
                                <label className="flex items-center gap-2 text-sm text-white">
                                    <input
                                        type="checkbox"
                                        checked={formData.contactSales}
                                        onChange={(e) => setFormData({ ...formData, contactSales: e.target.checked })}
                                        className="rounded border-white/20"
                                    />
                                    Contact sales (no checkout)
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold text-gray-200 transition-colors hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-colors hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
