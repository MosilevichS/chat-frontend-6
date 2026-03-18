import { privateApi } from "@/src/services/baseApi";

interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

interface GetCallQueryResponse {
  ice_servers: IceServer[];
}

export const callApi = privateApi.injectEndpoints({
  endpoints: builder => ({
    getCall: builder.query<GetCallQueryResponse, void>({
      query: () => "/call",
    }),
  }),
});

export const { useGetCallQuery } = callApi;
