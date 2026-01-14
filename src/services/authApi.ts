import { apiSlice } from "@/src/services/baseApi";

export const authApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    sendCode: builder.mutation<void, { phone_number: string }>({
      query: body => ({
        url: "auth/messenger/login/get/code/",
        method: "POST",
        body,
      }),
    }),

    sendMessageToSupport: builder.mutation<void, { email: string; text: string }>({
      query: body => ({
        url: "service/message/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSendCodeMutation, useSendMessageToSupportMutation } = authApi;
