import {
  buildCasdoorProxyUrl,
  buildCasdoorRequestHeaders,
  readCasdoorJsonResponse,
  type BillingFetch,
} from './casdoor-payment-session.ts';
import type {
  BillingCasdoorApiResponse,
  BillingCasdoorPlanDetail,
  BillingCasdoorPlanLookupInput,
  BillingCasdoorPlanProductResolution,
  BillingCasdoorPricingDetail,
  BillingCasdoorPricingLookupInput,
} from './types.ts';

interface FetchableRequest {
  fetcher?: BillingFetch;
}

type FetchablePricingInput = BillingCasdoorPricingLookupInput & FetchableRequest;
type FetchablePlanInput = BillingCasdoorPlanLookupInput & FetchableRequest;

function getFetch(input?: FetchableRequest): BillingFetch {
  return input?.fetcher ?? fetch;
}

function buildCasdoorPlanId(owner: string, name: string): string {
  return `${owner}/${name}`;
}

export async function fetchCasdoorPricing(
  input: FetchablePricingInput,
): Promise<BillingCasdoorPricingDetail> {
  const url = buildCasdoorProxyUrl(input.requestUrl, '/auth/api/get-pricing');
  url.searchParams.set('id', buildCasdoorPlanId(input.owner, input.pricingName));

  const response = await getFetch(input)(url, {
    method: 'GET',
    headers: buildCasdoorRequestHeaders(input),
  });
  const payload = (await readCasdoorJsonResponse<BillingCasdoorApiResponse<BillingCasdoorPricingDetail>>(response)) as BillingCasdoorApiResponse<BillingCasdoorPricingDetail>;
  if (payload.status.trim().toLowerCase() !== 'ok' || !payload.data) {
    throw new Error(payload.msg || `Failed to load Casdoor pricing ${buildCasdoorPlanId(input.owner, input.pricingName)}.`);
  }

  return payload.data;
}

export async function fetchCasdoorPlan(input: FetchablePlanInput): Promise<BillingCasdoorPlanDetail> {
  const url = buildCasdoorProxyUrl(input.requestUrl, '/auth/api/get-plan');
  url.searchParams.set('id', buildCasdoorPlanId(input.owner, input.planName));
  if (input.includeOption !== false) {
    url.searchParams.set('includeOption', 'true');
  }

  const response = await getFetch(input)(url, {
    method: 'GET',
    headers: buildCasdoorRequestHeaders(input),
  });
  const payload = (await readCasdoorJsonResponse<BillingCasdoorApiResponse<BillingCasdoorPlanDetail>>(response)) as BillingCasdoorApiResponse<BillingCasdoorPlanDetail>;
  if (payload.status.trim().toLowerCase() !== 'ok' || !payload.data) {
    throw new Error(payload.msg || `Failed to load Casdoor plan ${buildCasdoorPlanId(input.owner, input.planName)}.`);
  }

  return payload.data;
}

export async function resolveCasdoorPlanProduct(
  input: FetchablePlanInput,
): Promise<BillingCasdoorPlanProductResolution> {
  const plan = await fetchCasdoorPlan(input);
  if (!plan.product || !plan.product.trim()) {
    throw new Error(`Casdoor plan ${buildCasdoorPlanId(input.owner, input.planName)} did not return a product.`);
  }

  return {
    owner: input.owner,
    planName: input.planName,
    productId: buildCasdoorPlanId(input.owner, plan.product.trim()),
    plan,
  };
}

export async function resolveCasdoorPlanProductId(input: FetchablePlanInput): Promise<string> {
  const result = await resolveCasdoorPlanProduct(input);
  return result.productId;
}
