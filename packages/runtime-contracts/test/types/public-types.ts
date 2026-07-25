import type {
  AckPayload,
  ActorConfigSnapshot,
  ActorConfigSnapshotId,
  ActorId,
  ActorLaunchSpec,
  ActorTemplateId,
  ActorTemplateSpec,
  ActorTemplateSpecSchemaVersion,
  ActorTemplateValidationFailedDetails,
  ActorTemplateValidationReport,
  ActorTemplateRevisionView,
  ActorTemplateSummary,
  ActorTemplateRevisionSummary,
  BackendAdapterId,
  BackendAdapterLaunchConfig,
  BackendBrickBody,
  BackendSessionId,
  BrickKind,
  BrickPrompt,
  BrickPromptBody,
  BrickSysPrompt,
  BrickSysPromptBody,
  CanonicalTimestamp,
  ClientPrincipalId,
  CompletionRequestPayload,
  CompositeBrickPrompt,
  ConfigDigest,
  ContractDecodeResult,
  ContractErrorEnvelope,
  ContractSchemaVersion,
  ContractValue,
  ContentHash,
  CreateActorTemplateCommand,
  CreateActorTemplateResult,
  CreateSessionDirective,
  DefinitionBrickDigest,
  DefinitionBrickRevision,
  DefinitionBrickRevisionId,
  Delivery,
  DeliveryId,
  DeliveryState,
  ExactBrickRef,
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
  HumanReadableId,
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
  PositiveRevision,
  ProjectId,
  ResolvedBrickRef,
  ResumeSessionDirective,
  ReviseActorTemplateCommand,
  ReviseActorTemplateResult,
  RunId,
  RuntimeConfigBrickBody,
  ServerToHostMessage,
  ServerToHostPayload,
  SessionDirective,
  SessionReportPayload,
  ShutdownHostPayload,
  SignaledProcessFact,
  StartInvocationPayload,
  StopInvocationPayload,
  StoppedProcessFact,
  TemplateRevisionDigest,
  TextBrickPrompt,
  ToolProviderBrickConfig,
  ToolProviderId,
  ToolProviderLaunchConfig,
  ToolsetBrickBody,
  ValidateActorTemplateCandidate,
  ValidateActorTemplateCandidateResult,
  ValidationIssue,
  ValidationIssueCode,
} from "../../src/index.js";

import type {
  ArchiveDefinitionBrickCommand,
  ArchiveDefinitionBrickResult,
  CreateDefinitionBrickCommand,
  CreateDefinitionBrickResult,
  CreateProjectCommand,
  CreateProjectResult,
  DefinitionBrickBody,
  DefinitionBrickId,
  DefinitionBrickStatus,
  DefinitionBrickSummary,
  ListDefinitionBrickHistoryCommand,
  ListDefinitionBrickHistoryResult,
  ListDefinitionBricksCommand,
  ListDefinitionBricksResult,
  ProjectDefinitionBrickError,
  ProjectDefinitionBrickErrorCode,
  ProjectRecord,
  ReadDefinitionBrickCommand,
  ReadDefinitionBrickResult,
  ReadExactDefinitionBrickRevisionCommand,
  ReadExactDefinitionBrickRevisionResult,
  ReadProjectCommand,
  ReadProjectResult,
  ReviseDefinitionBrickCommand,
  ReviseDefinitionBrickResult,
} from "../../src/index.js";

type AcceptedPublicDerivedTypes = {
  AckPayload: AckPayload;
  ActorConfigSnapshot: ActorConfigSnapshot;
  ActorConfigSnapshotId: ActorConfigSnapshotId;
  ActorId: ActorId;
  ActorLaunchSpec: ActorLaunchSpec;
  ActorTemplateId: ActorTemplateId;
  ActorTemplateRevisionSummary: ActorTemplateRevisionSummary;
  ActorTemplateRevisionView: ActorTemplateRevisionView;
  ActorTemplateSpec: ActorTemplateSpec;
  ActorTemplateSpecSchemaVersion: ActorTemplateSpecSchemaVersion;
  ActorTemplateValidationFailedDetails: ActorTemplateValidationFailedDetails;
  ActorTemplateValidationReport: ActorTemplateValidationReport;
  ActorTemplateSummary: ActorTemplateSummary;
  BackendAdapterId: BackendAdapterId;
  BackendAdapterLaunchConfig: BackendAdapterLaunchConfig;
  BackendBrickBody: BackendBrickBody;
  BackendSessionId: BackendSessionId;
  BrickKind: BrickKind;
  BrickPrompt: BrickPrompt;
  BrickPromptBody: BrickPromptBody;
  BrickSysPrompt: BrickSysPrompt;
  BrickSysPromptBody: BrickSysPromptBody;
  CanonicalTimestamp: CanonicalTimestamp;
  ClientPrincipalId: ClientPrincipalId;
  CompletionRequestPayload: CompletionRequestPayload;
  CompositeBrickPrompt: CompositeBrickPrompt;
  ConfigDigest: ConfigDigest;
  ContractDecodeResult: ContractDecodeResult<unknown>;
  ContractErrorEnvelope: ContractErrorEnvelope;
  ContractSchemaVersion: ContractSchemaVersion;
  ContractValue: ContractValue<unknown>;
  ContentHash: ContentHash;
  CreateActorTemplateCommand: CreateActorTemplateCommand;
  CreateActorTemplateResult: CreateActorTemplateResult;
  CreateSessionDirective: CreateSessionDirective;
  DefinitionBrickDigest: DefinitionBrickDigest;
  DefinitionBrickRevision: DefinitionBrickRevision;
  DefinitionBrickRevisionId: DefinitionBrickRevisionId;
  Delivery: Delivery;
  DeliveryId: DeliveryId;
  DeliveryState: DeliveryState;
  ExactBrickRef: ExactBrickRef;
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
  HumanReadableId: HumanReadableId;
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
  PositiveRevision: PositiveRevision;
  ProjectId: ProjectId;
  ResolvedBrickRef: ResolvedBrickRef;
  ResumeSessionDirective: ResumeSessionDirective;
  ReviseActorTemplateCommand: ReviseActorTemplateCommand;
  ReviseActorTemplateResult: ReviseActorTemplateResult;
  RunId: RunId;
  RuntimeConfigBrickBody: RuntimeConfigBrickBody;
  ServerToHostMessage: ServerToHostMessage;
  ServerToHostPayload: ServerToHostPayload;
  SessionDirective: SessionDirective;
  SessionReportPayload: SessionReportPayload;
  ShutdownHostPayload: ShutdownHostPayload;
  SignaledProcessFact: SignaledProcessFact;
  StartInvocationPayload: StartInvocationPayload;
  StopInvocationPayload: StopInvocationPayload;
  StoppedProcessFact: StoppedProcessFact;
  TemplateRevisionDigest: TemplateRevisionDigest;
  TextBrickPrompt: TextBrickPrompt;
  ToolProviderBrickConfig: ToolProviderBrickConfig;
  ToolProviderId: ToolProviderId;
  ToolProviderLaunchConfig: ToolProviderLaunchConfig;
  ToolsetBrickBody: ToolsetBrickBody;
  ValidateActorTemplateCandidate: ValidateActorTemplateCandidate;
  ValidateActorTemplateCandidateResult: ValidateActorTemplateCandidateResult;
  ValidationIssue: ValidationIssue;
  ValidationIssueCode: ValidationIssueCode;
};

type ProjectDefinitionBrickPublicDerivedTypes = {
  ArchiveDefinitionBrickCommand: ArchiveDefinitionBrickCommand;
  ArchiveDefinitionBrickResult: ArchiveDefinitionBrickResult;
  CreateDefinitionBrickCommand: CreateDefinitionBrickCommand;
  CreateDefinitionBrickResult: CreateDefinitionBrickResult;
  CreateProjectCommand: CreateProjectCommand;
  CreateProjectResult: CreateProjectResult;
  DefinitionBrickBody: DefinitionBrickBody;
  DefinitionBrickId: DefinitionBrickId;
  DefinitionBrickStatus: DefinitionBrickStatus;
  DefinitionBrickSummary: DefinitionBrickSummary;
  ListDefinitionBrickHistoryCommand: ListDefinitionBrickHistoryCommand;
  ListDefinitionBrickHistoryResult: ListDefinitionBrickHistoryResult;
  ListDefinitionBricksCommand: ListDefinitionBricksCommand;
  ListDefinitionBricksResult: ListDefinitionBricksResult;
  ProjectDefinitionBrickError: ProjectDefinitionBrickError;
  ProjectDefinitionBrickErrorCode: ProjectDefinitionBrickErrorCode;
  ProjectRecord: ProjectRecord;
  ReadDefinitionBrickCommand: ReadDefinitionBrickCommand;
  ReadDefinitionBrickResult: ReadDefinitionBrickResult;
  ReadExactDefinitionBrickRevisionCommand: ReadExactDefinitionBrickRevisionCommand;
  ReadExactDefinitionBrickRevisionResult: ReadExactDefinitionBrickRevisionResult;
  ReadProjectCommand: ReadProjectCommand;
  ReadProjectResult: ReadProjectResult;
  ReviseDefinitionBrickCommand: ReviseDefinitionBrickCommand;
  ReviseDefinitionBrickResult: ReviseDefinitionBrickResult;
};

declare const acceptedPublicDerivedTypes: AcceptedPublicDerivedTypes;
void acceptedPublicDerivedTypes;

declare const projectDefinitionBrickPublicDerivedTypes: ProjectDefinitionBrickPublicDerivedTypes;
void projectDefinitionBrickPublicDerivedTypes;
