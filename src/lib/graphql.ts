/* Lightweight typed GraphQL client — usable from Server Components (fetch with
   Next.js caching) and Client Components. No heavy client library needed. */

export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

export const GRAPHQL_WS_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ?? "ws://localhost:4000/graphql";

type GqlOptions = {
  token?: string | null;
  revalidate?: number;
};

export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: GqlOptions = {}
): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    ...(typeof window === "undefined"
      ? { next: { revalidate: options.revalidate ?? 60 } }
      : { cache: "no-store" as const }),
  });

  const json = (await response.json()) as {
    data?: T;
    errors?: { message: string; extensions?: { code?: string } }[];
  };

  if (json.errors?.length) {
    throw new GraphQLRequestError(
      json.errors[0].message,
      json.errors[0].extensions?.code
    );
  }
  if (!json.data) throw new GraphQLRequestError("Empty GraphQL response.");
  return json.data;
}

export const API_ORIGIN = GRAPHQL_URL.replace(/\/graphql\/?$/, "");

/** Upload review photos; returns their public URLs. */
export async function uploadReviewImages(files: File[]): Promise<string[]> {
  const token = window.localStorage.getItem("tredella-token");
  const body = new FormData();
  for (const file of files) body.append("images", file);

  const response = await fetch(`${API_ORIGIN}/upload/review-images`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  });
  const json = (await response.json()) as { urls?: string[]; error?: string };
  if (!response.ok || json.error)
    throw new Error(json.error ?? "Could not upload your photos.");
  return json.urls ?? [];
}

/** Client-side helper that automatically attaches the stored auth token. */
export function gqlAuth<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("tredella-token")
      : null;
  return gql<T>(query, variables, { token, revalidate: 0 });
}
