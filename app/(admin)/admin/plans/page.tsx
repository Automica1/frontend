// x:\Web Dev\Automica\frontend\app\(admin)\admin\plans\page.tsx
'use client';

import { useEffect, useState } from "react";
import { apiService, Plan } from "../../lib/apiService";
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
        price: 0,
        credits: 0,
        isActive: true
    });

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

    const handleOpenModal = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                planId: plan.planId,
                name: plan.name,
                description: plan.description,
                price: plan.price / 100, // convert cents to dollars
                credits: plan.credits,
                isActive: plan.isActive
            });
        } else {
            setEditingPlan(null);
            setFormData({
                planId: "",
                name: "",
                description: "",
                price: 0,
                credits: 0,
                isActive: true
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
                ...formData,
                price: formData.price * 100 // convert dollars to cents
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
        if (!confirm("Are you sure you want to deactivate this plan?")) return;

        try {
            await apiService.deletePlan(planId);
            fetchPlans();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to deactivate plan");
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-admin-text-main">Subscription Plans</h1>
                    <p className="text-admin-text-muted mt-1 font-medium">Manage your subscription tiers and pricing.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    title="Create a new subscription plan"
                    className="px-4 py-2 bg-admin-primary text-white rounded-xl text-sm font-bold shadow-md shadow-admin-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 w-fit"
                >
                    <Plus className="w-4 h-4" />
                    Create New Plan
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-admin-primary animate-spin" />
                    <p className="text-admin-text-muted font-medium">Loading plans...</p>
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
                                className={`bg-white rounded-2xl border ${plan.isActive ? 'border-admin-border' : 'border-slate-200 bg-slate-50/50'} shadow-sm p-6 space-y-4`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-xl ${plan.isActive ? 'bg-admin-primary/10 text-admin-primary' : 'bg-slate-200 text-slate-500'}`}>
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenModal(plan)}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                            title="Edit Plan"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan.planId)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
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
                                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Inactive</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-admin-text-muted font-medium mt-1">{plan.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-wider">Price</p>
                                        <p className="text-lg font-bold text-admin-text-main flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            {plan.price / 100}
                                            <span className="text-xs font-medium text-admin-text-muted">/mo</span>
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-wider">Credits</p>
                                        <p className="text-lg font-bold text-admin-text-main flex items-center gap-1">
                                            <Coins className="w-4 h-4 text-amber-500" />
                                            {plan.credits.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-wider">Plan ID</p>
                                    <code className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{plan.planId}</code>
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
                        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-admin-border flex items-center justify-between">
                            <h2 className="text-xl font-bold">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                title="Close modal"
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-admin-text-muted uppercase tracking-wider">Plan ID (Unique)</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!!editingPlan}
                                        value={formData.planId}
                                        onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-admin-border rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all font-medium disabled:opacity-50"
                                        placeholder="tier-1"
                                        title="Unique ID for the plan"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-admin-text-muted uppercase tracking-wider">Plan Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-admin-border rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all font-medium"
                                        placeholder="Basic Plan"
                                        title="Display name for the plan"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-admin-text-muted uppercase tracking-wider">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-admin-border rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all font-medium min-h-[80px]"
                                    placeholder="What's included in this plan?"
                                    title="Detailed description of plan benefits"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="price" className="text-xs font-bold text-admin-text-muted uppercase tracking-wider">Price ($ / month)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
                                        <input
                                            id="price"
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-admin-border rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all font-bold"
                                            title="Monthly price in Dollars"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="credits" className="text-xs font-bold text-admin-text-muted uppercase tracking-wider">Credits Per Month</label>
                                    <div className="relative">
                                        <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                        <input
                                            id="credits"
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.credits}
                                            onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-admin-border rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary transition-all font-bold"
                                            title="Credits awarded per month"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    title={formData.isActive ? "Deactivate plan" : "Activate plan"}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                                </button>
                                <span className="text-sm font-bold text-admin-text-main">Plan is Active</span>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 border border-admin-border rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-6 py-3 bg-admin-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-admin-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
