import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setTokens, logout } from "../store/slices/authSlice";
import type { RootState } from "@/src/store/store";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api/v1/",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await baseQuery(
      {
        url: "auth/login/refresh/token/",
        method: "POST",
        body: { refresh: refreshToken },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const newAccessToken = (refreshResult.data as { access: string }).access;
      api.dispatch(
        setTokens({
          access: newAccessToken,
          refresh: refreshToken,
          is_filled: (api.getState() as RootState).auth.isProfileFilled,
        }),
      );

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Auth"],
  endpoints: () => ({}),
});
