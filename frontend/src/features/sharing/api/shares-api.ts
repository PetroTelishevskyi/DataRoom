import { apiRequest } from "@/lib/api";
import type {
  CreatePublicShareInput,
  CreateUserShareInput,
  ResourceShareSummary,
  RevokedShareSummary,
  ShareResource,
  ShareSummary,
  SharedWithMeItem,
} from "../share.types";

type ShareResponse = {
  data: {
    share: ResourceShareSummary;
  };
};

type SharesResponse = {
  data: {
    shares: ResourceShareSummary[];
  };
};

type SharedWithMeResponse = {
  data: {
    shares: SharedWithMeItem[];
  };
};

type RevokeShareResponse = {
  data: {
    share: RevokedShareSummary;
  };
};

export async function createUserShare(input: CreateUserShareInput) {
  const response = await apiRequest<ShareResponse>("/shares", {
    body: JSON.stringify(input),
    method: "POST",
  });

  return response.data.share as ShareSummary;
}

export async function createPublicShare(input: CreatePublicShareInput) {
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

export async function revokeShare(shareId: string) {
  const response = await apiRequest<RevokeShareResponse>(
    `/shares/${shareId}`,
    {
      method: "DELETE",
    },
  );

  return response.data.share;
}
