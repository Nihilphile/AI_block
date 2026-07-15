import type {
  AckPayload,
  ActorConfigSnapshotId,
  ActorId,
  ActorLaunchSpec,
  ActorTemplateId,
  BackendAdapterId,
  BackendAdapterLaunchConfig,
  BackendSessionId,
  BrickPrompt,
  BrickSysPrompt,
  CanonicalTimestamp,
  ClientPrincipalId,
  CompletionRequestPayload,
  CompositeBrickPrompt,
  ContractDecodeResult,
  ContractErrorEnvelope,
  ContractSchemaVersion,
  ContractValue,
  ContentHash,
  CreateSessionDirective,
  Delivery,
  DeliveryId,
  DeliveryState,
  ExitedProcessFact,
  GraphId,
  HeartbeatPayload,
  HostFaultPayload,
  HostHelloPayload,
  HostInstanceId,
  HostMessageId,
  HostProtocolVersion,
  HostReadyPayload,
  HostToServerMessage,
  HostToServerPayload,
  InitializeActorHostPayload,
  InvocationId,
  InvocationProcessFact,
  InvocationResult,
  InvocationResultPayload,
  InvocationSpec,
  JsonObject,
  JsonValue,
  LaunchFailedProcessFact,
  Package,
  PackageCreator,
  PackageHashMaterial,
  PackageHead,
  PackageId,
  PackageProvenance,
  PackagePublishRequestPayload,
  PackageRef,
  PackageSchemaVersion,
  PackageType,
  ProjectId,
  ResumeSessionDirective,
  RunId,
  ServerToHostMessage,
  ServerToHostPayload,
  SessionDirective,
  SessionReportPayload,
  ShutdownHostPayload,
  SignaledProcessFact,
  StartInvocationPayload,
  StopInvocationPayload,
  StoppedProcessFact,
  TextBrickPrompt,
  ToolProviderId,
  ToolProviderLaunchConfig,
} from "@ai-block/runtime-contracts";

type AcceptedPublicDerivedTypes = {
  AckPayload: AckPayload;
  ActorConfigSnapshotId: ActorConfigSnapshotId;
  ActorId: ActorId;
  ActorLaunchSpec: ActorLaunchSpec;
  ActorTemplateId: ActorTemplateId;
  BackendAdapterId: BackendAdapterId;
  BackendAdapterLaunchConfig: BackendAdapterLaunchConfig;
  BackendSessionId: BackendSessionId;
  BrickPrompt: BrickPrompt;
  BrickSysPrompt: BrickSysPrompt;
  CanonicalTimestamp: CanonicalTimestamp;
  ClientPrincipalId: ClientPrincipalId;
  CompletionRequestPayload: CompletionRequestPayload;
  CompositeBrickPrompt: CompositeBrickPrompt;
  ContractDecodeResult: ContractDecodeResult<unknown>;
  ContractErrorEnvelope: ContractErrorEnvelope;
  ContractSchemaVersion: ContractSchemaVersion;
  ContractValue: ContractValue<unknown>;
  ContentHash: ContentHash;
  CreateSessionDirective: CreateSessionDirective;
  Delivery: Delivery;
  DeliveryId: DeliveryId;
  DeliveryState: DeliveryState;
  ExitedProcessFact: ExitedProcessFact;
  GraphId: GraphId;
  HeartbeatPayload: HeartbeatPayload;
  HostFaultPayload: HostFaultPayload;
  HostHelloPayload: HostHelloPayload;
  HostInstanceId: HostInstanceId;
  HostMessageId: HostMessageId;
  HostProtocolVersion: HostProtocolVersion;
  HostReadyPayload: HostReadyPayload;
  HostToServerMessage: HostToServerMessage;
  HostToServerPayload: HostToServerPayload;
  InitializeActorHostPayload: InitializeActorHostPayload;
  InvocationId: InvocationId;
  InvocationProcessFact: InvocationProcessFact;
  InvocationResult: InvocationResult;
  InvocationResultPayload: InvocationResultPayload;
  InvocationSpec: InvocationSpec;
  JsonObject: JsonObject;
  JsonValue: JsonValue;
  LaunchFailedProcessFact: LaunchFailedProcessFact;
  Package: Package;
  PackageCreator: PackageCreator;
  PackageHashMaterial: PackageHashMaterial;
  PackageHead: PackageHead;
  PackageId: PackageId;
  PackageProvenance: PackageProvenance;
  PackagePublishRequestPayload: PackagePublishRequestPayload;
  PackageRef: PackageRef;
  PackageSchemaVersion: PackageSchemaVersion;
  PackageType: PackageType;
  ProjectId: ProjectId;
  ResumeSessionDirective: ResumeSessionDirective;
  RunId: RunId;
  ServerToHostMessage: ServerToHostMessage;
  ServerToHostPayload: ServerToHostPayload;
  SessionDirective: SessionDirective;
  SessionReportPayload: SessionReportPayload;
  ShutdownHostPayload: ShutdownHostPayload;
  SignaledProcessFact: SignaledProcessFact;
  StartInvocationPayload: StartInvocationPayload;
  StopInvocationPayload: StopInvocationPayload;
  StoppedProcessFact: StoppedProcessFact;
  TextBrickPrompt: TextBrickPrompt;
  ToolProviderId: ToolProviderId;
  ToolProviderLaunchConfig: ToolProviderLaunchConfig;
};

declare const acceptedPublicDerivedTypes: AcceptedPublicDerivedTypes;
void acceptedPublicDerivedTypes;
