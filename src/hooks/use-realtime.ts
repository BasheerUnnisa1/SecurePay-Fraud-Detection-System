import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import {
  getListTransactionsQueryKey,
  getGetDashboardStatsQueryKey,
  getGetRiskBreakdownQueryKey,
} from "@workspace/api-client-react";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface FraudAlert {
  transactionId: string;
  amount: number;
  category: string;
  country: string;
  riskScore: number;
  recommendation: string;
  analyzedAt: string;
}

export interface RealtimeState {
  status: ConnectionStatus;
  lastActivity: Date | null;
  fraudAlerts: FraudAlert[];
  newTransactionFlash: boolean;
  dismissAlert: (id: string) => void;
}

let sharedSocket: Socket | null = null;
const listeners = new Set<() => void>();

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io({
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return sharedSocket;
}

export function useRealtime(): RealtimeState {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [newTransactionFlash, setNewTransactionFlash] = useState(false);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerFlash = useCallback(() => {
    setNewTransactionFlash(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setNewTransactionFlash(false), 1200);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setStatus("connected");
      setLastActivity(new Date());
    };

    const onDisconnect = () => {
      setStatus("disconnected");
    };

    const onConnectError = () => {
      setStatus("disconnected");
    };

    const onNewTransaction = () => {
      setLastActivity(new Date());
      triggerFlash();
      queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRiskBreakdownQueryKey() });
    };

    const onStatsUpdate = () => {
      setLastActivity(new Date());
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
    };

    const onFraudAlert = (alert: FraudAlert) => {
      setLastActivity(new Date());
      setFraudAlerts((prev) => [alert, ...prev].slice(0, 5));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("new_transaction", onNewTransaction);
    socket.on("stats_update", onStatsUpdate);
    socket.on("fraud_alert", onFraudAlert);

    if (socket.connected) setStatus("connected");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("new_transaction", onNewTransaction);
      socket.off("stats_update", onStatsUpdate);
      socket.off("fraud_alert", onFraudAlert);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, [queryClient, triggerFlash]);

  const dismissAlert = useCallback((id: string) => {
    setFraudAlerts((prev) => prev.filter((a) => a.transactionId !== id));
  }, []);

  return { status, lastActivity, fraudAlerts, newTransactionFlash, dismissAlert };
}
