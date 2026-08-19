import { apiRequest } from "@/lib/api";
import type {
  CreateUserShareInput,
  ShareResource,
  ShareSummary,
  SharedWithMeItem,
} from "../share.types";

type ShareResponse = {
  data: {
    share: ShareSummary;
  };
};

type SharesResponse = {
  data: {
    shares: ShareSummary[];
  };
};

type SharedWithMeResponse = {
  data: {
    shares: SharedWithMeItem[];
  };
};

export async function createUserShare(input: CreateUserShareInput) {
  const response = await apiRequest<ShareResponse>("/shares", {
    body: JSON.stringify(input),
    method: "POST",
  });

  return response.data.share;
}

export async function getResourceShares(resource: ShareResource) {
  const searchParams = new URLSearchParams({
    resourceId: resource.id,
    resourceType: resource.type,
  });

  const response = await apiRequest<SharesResponse>(
    `/shares?${searchParams.toString()}`,
  );

  return response.data.shares;
}

export async function getSharedWithMe() {
  const response =
    await apiRequest<SharedWithMeResponse>("/shared-with-me");

  return response.data.shares;
}
