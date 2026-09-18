export const PLAN_IDS = ["free", "pro", "enterprise"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

type PlanDefinition = {
	label: string;
	limits: {
		maxDevices: number;
	};
	features: {
		reports: boolean;
	};
};

// Placeholder limits/features — Devices/Reports will read these once they
// exist. No real billing/payment processor behind this yet, just gating.
export const PLANS: Record<PlanId, PlanDefinition> = {
	free: {
		label: "Free",
		limits: { maxDevices: 5 },
		features: { reports: false },
	},
	pro: {
		label: "Pro",
		limits: { maxDevices: 50 },
		features: { reports: true },
	},
	enterprise: {
		label: "Enterprise",
		limits: { maxDevices: Number.POSITIVE_INFINITY },
		features: { reports: true },
	},
};

export type PlanFeature = keyof PlanDefinition["features"];

export const planHasFeature = (plan: PlanId, feature: PlanFeature) =>
	PLANS[plan].features[feature];
