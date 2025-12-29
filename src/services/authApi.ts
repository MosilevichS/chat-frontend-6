import { apiSlice } from "@/src/services/apiSlice";
import { setTokens } from "@/src/store/slices/authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    sendCode: builder.mutation<void, { phone_number: string }>({
      query: body => ({
        url: "auth/messenger/login/get/code/",
        method: "POST",
        body,
      }),
    }),

    verifyCode: builder.mutation<
      { access: string; refresh: string; is_filled: boolean },
      { phone_number: string; code: string }
    >({
      query: body => ({
        url: "auth/messenger/login/get/token/",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setTokens(data));
      },
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

export const { useSendCodeMutation, useVerifyCodeMutation, useSendMessageToSupportMutation } =
  authApi;
