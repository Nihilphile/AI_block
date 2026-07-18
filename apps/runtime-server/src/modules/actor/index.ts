export type {
  ActorConfigSnapshotWriteResult,
  ActorModulePorts,
  ActorResourceKind,
  ActorTemplateArchiveResult,
  ActorTemplateCreateResult,
  ActorTemplateRepositoryPort,
  ActorTemplateRevisionWriteResult,
  ActorUnitOfWork,
  ActorUnitOfWorkPort,
  BackendAdapterValidatorPort,
  BackendAdapterValidatorRegistryPort,
  BackendToolsetCompatibilityPort,
  DefinitionBrickResolverPort,
  ProjectNamespacePort,
  ProjectResourceReservation,
  ProjectWorkspaceResolverPort,
  ToolProviderValidatorPort,
  ToolProviderValidatorRegistryPort,
  ValidatorFinding,
  WorkspaceResolution,
} from "./ports.js";

export {
  bindDefinitionBrickRef,
  buildConfigurationDigestMaterial,
  buildDefinitionBrickDigestMaterial,
  buildTemplateRevisionDigestMaterial,
  canonicalizeStructuredBody,
  canonicalizeText,
  computeConfigurationDigest,
  computeDefinitionBrickDigest,
  computeTemplateRevisionDigest,
  parseExactBrickRef,
  sha256CanonicalJson,
} from "./values.js";
export type {
  BoundDefinitionBrickRef,
  ConfigurationDigestMaterial,
  DefinitionBrickDigestMaterial,
  DefinitionBrickRefBindingResult,
  ExactBrickRefParseResult,
  TemplateRevisionDigestMaterial,
} from "./values.js";

export {
  createActorTemplateValidationError,
  resolveAndValidateActorTemplateCandidate,
  validateActorTemplateCandidate,
} from "./validation.js";
export type {
  ActorTemplateValidationError,
  ActorTemplateValidationOutcome,
  ActorTemplateValidationPorts,
  ResolvedActorTemplateBrick,
  ResolvedActorTemplateCandidate,
} from "./validation.js";

export { compileActorTemplate } from "./compiler.js";
export type {
  ActorCompilationError,
  ActorCompilationResult,
  ActorCompilerInput,
} from "./compiler.js";
