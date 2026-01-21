import { publicApi } from "@/src/services/baseApi";

export const authApi = publicApi.injectEndpoints({
  endpoints: builder => ({
    sendCode: builder.mutation<void, { phone_number: string }>({
      query: body => ({
        url: "/api/v1/auth/messenger/login/get/code/",
        method: "POST",
        body,
      }),
    }),

    sendMessageToSupport: builder.mutation<void, { email: string; text: string }>({
      query: body => ({
        url: "/api/v1/service/message/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSendCodeMutation, useSendMessageToSupportMutation } = authApi;
