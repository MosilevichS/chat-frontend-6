"use client";

import { Provider } from "react-redux";
import { store } from "@/src/store/store";
import { useSocketListenerQuery } from "@/src/services/socketApi";

function SocketInitializer() {
  useSocketListenerQuery();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SocketInitializer />
      {children}
    </Provider>
  );
}
