import { useCallback, useRef } from "react";
import type { ConnectionMetrics, PeerConnectionState } from "../types";

export function useConnectionMetrics() {
	const metricsRef = useRef<ConnectionMetrics>({
		totalBytesSent: 0,
		totalBytesReceived: 0,
		totalMessagesSent: 0,
		totalMessagesReceived: 0,
		connectionAttempts: 0,
		successfulConnections: 0,
		failedConnections: 0,
		averageLatency: 0,
		peerStates: {},
	});

	const recordMessageSent = useCallback((bytes: number) => {
		metricsRef.current.totalBytesSent += bytes;
		metricsRef.current.totalMessagesSent += 1;
	}, []);

	const recordMessageReceived = useCallback((bytes: number) => {
		metricsRef.current.totalBytesReceived += bytes;
		metricsRef.current.totalMessagesReceived += 1;
	}, []);

	const recordConnectionAttempt = useCallback(() => {
		metricsRef.current.connectionAttempts += 1;
	}, []);

	const recordConnectionSuccess = useCallback((peerId: string) => {
		metricsRef.current.successfulConnections += 1;
		metricsRef.current.peerStates[peerId] = "connected";
	}, []);

	const recordConnectionFailure = useCallback((peerId: string) => {
		metricsRef.current.failedConnections += 1;
		metricsRef.current.peerStates[peerId] = "failed";
	}, []);

	const updatePeerState = useCallback(
		(peerId: string, state: PeerConnectionState) => {
			metricsRef.current.peerStates[peerId] = state;
		},
		[],
	);

	const getMetrics = useCallback(() => metricsRef.current, []);

	const resetMetrics = useCallback(() => {
		metricsRef.current = {
			totalBytesSent: 0,
			totalBytesReceived: 0,
			totalMessagesSent: 0,
			totalMessagesReceived: 0,
			connectionAttempts: 0,
			successfulConnections: 0,
			failedConnections: 0,
			averageLatency: 0,
			peerStates: {},
		};
	}, []);

	return {
		recordMessageSent,
		recordMessageReceived,
		recordConnectionAttempt,
		recordConnectionSuccess,
		recordConnectionFailure,
		updatePeerState,
		getMetrics,
		resetMetrics,
	};
}
