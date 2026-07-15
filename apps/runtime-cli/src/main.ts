import type {
  ActorLaunchSpec,
  HostToServerMessage,
  Package,
} from "@ai-block/runtime-contracts";

export type RuntimeContractsConsumerFixture = ActorLaunchSpec | HostToServerMessage | Package;
