import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://api.dev.chat.ktsf.ru/api/v1/",
  credentials: "include",
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: ["User", "Auth"],
  endpoints: () => ({}),
});
