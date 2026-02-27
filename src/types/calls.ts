export type SignalingMessage =
  | {
      action: "offer_call";
      request_uid: string;
      object: {
        to_user_uid: string;
        offer_sdp: string;
      };
    }
  | {
      action: "answer_call";
      request_uid: string; 
      object: {
        from_user_uid: string;
        to_user_uid: string;
        answer_sdp: string; 
      };
    }
  | {
      action: "ice_candidate";
      request_uid: string;
      object: {
        from_user_uid: string;
        to_user_uid: string;
        ice_candidate: string;
      };
    }
  | {
      action: "call_completion";
      request_uid: string;
      object: {
        from_user_uid: string;
        to_user_uid: string;
        type_complete: "unreceived" | "rejected" | "completed";
        message_rtc_uid: string;
        duration: number;
      };
    };