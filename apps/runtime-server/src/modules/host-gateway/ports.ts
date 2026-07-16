import type {
  AckPayload,
  ActorId,
  CanonicalTimestamp,
  ContractErrorEnvelope,
  HostHelloPayload,
  HostInstanceId,
  HostMessageId,
  HostToServerMessage,
  HostToServerPayload,
  ProjectId,
  ServerToHostMessage,
  ServerToHostPayload,
} from "@ai-block/runtime-contracts";

export type HostCommandPayload = Exclude<ServerToHostPayload, AckPayload>;
export type HostFactPayload = Exclude<HostToServerPayload, HostHelloPayload | AckPayload>;

export type HostFactMessage = Omit<HostToServerMessage, "payload"> & {
  readonly payload: HostFactPayload;
};

export interface AuthenticatedHostContext {
  readonly projectId: ProjectId;
  readonly actorId: ActorId;
  readonly hostInstanceId: HostInstanceId;
}

export type HostCredentialVerificationResult =
  | {
      readonly kind: "accepted";
      readonly identity: AuthenticatedHostContext;
    }
  | {
      readonly kind: "rejected";
      readonly reason: "invalid" | "unavailable";
    };

export interface HostCredentialVerifier {
  verify(token: string): Promise<HostCredentialVerificationResult>;
}

export interface HostMessageIdProvider {
  nextMessageId(): HostMessageId;
}

export interface HostTimestampProvider {
  now(): CanonicalTimestamp;
}

export interface HostTransportFailure {
  readonly code: "transport_failed";
  readonly message: string;
}

export interface HostGatewayTransport {
  send(message: ServerToHostMessage): void;
  onFailure(listener: (failure: HostTransportFailure) => void): () => void;
}

export interface HostFact {
  readonly identity: AuthenticatedHostContext;
  readonly message: HostFactMessage;
}

export interface HostFactSink {
  accept(fact: HostFact): void;
}

export interface HostGatewayOptions {
  readonly factSink: HostFactSink;
  readonly messageIds: HostMessageIdProvider;
  readonly timestamps: HostTimestampProvider;
}

export type HostConnectionState = "pending" | "live" | "failed";

export type HostGatewayOpenResult =
  | {
      readonly kind: "accepted";
      readonly connection: HostGatewayConnection;
    }
  | {
      readonly kind: "rejected";
      readonly reason: "connection_exists";
    }
  | {
      readonly kind: "transport_failed";
      readonly error: HostGatewayLocalError;
    };

export type HostGatewaySendResult =
  | {
      readonly kind: "sent";
      readonly message: ServerToHostMessage;
    }
  | {
      readonly kind: "rejected";
      readonly reason: "not_live" | "failed";
    }
  | {
      readonly kind: "transport_failed";
      readonly error: HostGatewayLocalError;
    };

export interface HostGatewayLocalError {
  readonly code: "transport_failed" | "fact_sink_failed";
  readonly message: string;
}

export type HostGatewayInboundResult =
  | {
      readonly kind: "hello_registered";
      readonly acknowledgement: ServerToHostMessage;
    }
  | {
      readonly kind: "acknowledged" | "ack_ignored";
      readonly acknowledgedMessageId: HostMessageId;
    }
  | {
      readonly kind: "fact_delivered";
      readonly fact: HostFact;
    }
  | {
      readonly kind: "fact_sink_failed";
      readonly error: HostGatewayLocalError;
    }
  | {
      readonly kind: "transport_failed";
      readonly error: HostGatewayLocalError;
    }
  | {
      readonly kind: "rejected";
      readonly reason:
        | "not_started"
        | "failed"
        | "decode_failed"
        | "generation_mismatch"
        | "sequence_stale"
        | "sequence_gap"
        | "wrong_first_payload"
        | "identity_mismatch"
        | "duplicate_hello";
      readonly error?: ContractErrorEnvelope;
    };

export interface HostGatewayConnection {
  state(): HostConnectionState;
  receive(input: unknown): HostGatewayInboundResult;
  send(payload: HostCommandPayload, causalMessageId?: HostMessageId): HostGatewaySendResult;
}
