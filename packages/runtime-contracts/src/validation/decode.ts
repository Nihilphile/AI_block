import * as AjvModule from "ajv";
import * as AjvFormatsModule from "ajv-formats";
import type { AnySchema, ErrorObject, ValidateFunction } from "ajv";
import Type from "typebox";
import {
  INVALID_JSON_VALUE_ERROR,
  SCHEMA_MISMATCH_ERROR,
  type ContractErrorEnvelope,
  type MaterializationReason,
  type SchemaIssueRule,
} from "../error/error.js";
import { isCanonicalTimestamp } from "../identity/identity.js";

type RuntimeAjv = {
  addFormat(name: string, format: { type: "string"; validate: (value: unknown) => boolean }): RuntimeAjv;
  compile(schema: AnySchema): ValidateFunction;
};

type RuntimeAjvConstructor = new (options: Record<string, unknown>) => RuntimeAjv;
const Ajv = AjvModule.default as unknown as RuntimeAjvConstructor;
const addFormats = AjvFormatsModule.default as unknown as (ajv: RuntimeAjv) => RuntimeAjv;

export type ContractValue<T> = T extends null | string | number | boolean
  ? T
  : T extends readonly unknown[]
    ? { readonly [K in keyof T]: ContractValue<T[K]> }
    : T extends object
      ? { readonly [K in keyof T]: ContractValue<T[K]> }
      : never;

export type ContractDecodeResult<T> =
  | Readonly<{ ok: true; value: ContractValue<T> }>
  | Readonly<{ ok: false; error: ContractErrorEnvelope }>;

type Failure = { path: string; reason: MaterializationReason };

class MaterializationError extends Error {
  constructor(readonly failure: Failure) {
    super(failure.reason);
  }
}

function pointerSegment(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function childPath(path: string, key: string): string {
  return `${path}/${pointerSegment(key)}`;
}

function hasLoneSurrogate(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next < 0xdc00 || next > 0xdfff) return true;
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }
  return false;
}

function isArrayIndex(key: string, length: number): boolean {
  if (!/^(0|[1-9][0-9]*)$/.test(key)) return false;
  const index = Number(key);
  return Number.isSafeInteger(index) && index >= 0 && index < length && String(index) === key;
}

function defineOwn(target: Record<string, unknown>, key: string, value: unknown): void {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}

function materialize(value: unknown, path: string, active: Set<object>): unknown {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (hasLoneSurrogate(value)) throw new MaterializationError({ path, reason: "lone_surrogate" });
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new MaterializationError({ path, reason: "non_finite_number" });
    return Object.is(value, -0) ? 0 : value;
  }
  if (typeof value !== "object") throw new MaterializationError({ path, reason: "unsupported_type" });

  if (active.has(value)) throw new MaterializationError({ path, reason: "cyclic_reference" });
  active.add(value);
  try {
    let keys: readonly (string | symbol)[];
    let prototype: object | null;
    try {
      keys = Reflect.ownKeys(value);
      prototype = Object.getPrototypeOf(value);
    } catch {
      throw new MaterializationError({ path, reason: "reflection_failed" });
    }

    const stringKeys: string[] = [];
    for (const key of keys) {
      if (typeof key === "symbol") throw new MaterializationError({ path, reason: "symbol_key" });
      if (hasLoneSurrogate(key)) throw new MaterializationError({ path, reason: "lone_surrogate" });
      stringKeys.push(key);
    }

    let isArrayValue: boolean;
    try {
      isArrayValue = Array.isArray(value);
    } catch {
      throw new MaterializationError({ path, reason: "reflection_failed" });
    }

    if (isArrayValue) {
      if (prototype !== Array.prototype) throw new MaterializationError({ path, reason: "custom_prototype" });
      const array = value as unknown[];
      const output: unknown[] = [];
      let length: number;
      try {
        length = array.length;
      } catch {
        throw new MaterializationError({ path, reason: "reflection_failed" });
      }
      for (let index = 0; index < length; index += 1) {
        const key = String(index);
        let hasOwn: boolean;
        try {
          hasOwn = Object.prototype.hasOwnProperty.call(array, key);
        } catch {
          throw new MaterializationError({ path: childPath(path, key), reason: "reflection_failed" });
        }
        if (!hasOwn) {
          throw new MaterializationError({ path: childPath(path, key), reason: "sparse_array" });
        }
        let descriptor: PropertyDescriptor | undefined;
        try {
          descriptor = Object.getOwnPropertyDescriptor(array, key);
        } catch {
          throw new MaterializationError({ path: childPath(path, key), reason: "reflection_failed" });
        }
        if (!descriptor || !("value" in descriptor)) {
          throw new MaterializationError({ path: childPath(path, key), reason: "accessor_property" });
        }
        output.push(materialize(descriptor.value, childPath(path, key), active));
      }
      for (const key of stringKeys) {
        if (key !== "length" && !isArrayIndex(key, length)) {
          throw new MaterializationError({ path: childPath(path, key), reason: "array_extra_property" });
        }
      }
      return output;
    }

    if (prototype !== Object.prototype && prototype !== null) {
      throw new MaterializationError({ path, reason: "custom_prototype" });
    }

    const output: Record<string, unknown> = {};
    for (const key of stringKeys) {
      let descriptor: PropertyDescriptor | undefined;
      try {
        descriptor = Object.getOwnPropertyDescriptor(value, key);
      } catch {
        throw new MaterializationError({ path: childPath(path, key), reason: "reflection_failed" });
      }
      if (!descriptor || !("value" in descriptor)) {
        throw new MaterializationError({ path: childPath(path, key), reason: "accessor_property" });
      }
      defineOwn(output, key, materialize(descriptor.value, childPath(path, key), active));
    }
    return output;
  } finally {
    active.delete(value);
  }
}

function freezeValue<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    if (Array.isArray(value)) {
      for (const child of value) freezeValue(child);
    } else {
      for (const child of Object.values(value)) freezeValue(child);
    }
    Object.freeze(value);
  }
  return value;
}

function escapedIssuePath(path: string, key: string): string {
  return childPath(path, key);
}

function issueRule(error: ErrorObject): SchemaIssueRule {
  if (error.keyword === "required") return "required";
  if (error.keyword === "additionalProperties") return "additional_property";
  if (["const", "enum"].includes(error.keyword)) return "literal";
  if (["pattern", "format", "propertyNames"].includes(error.keyword)) return "format";
  if ([
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    "minLength",
    "maxLength",
    "minItems",
    "maxItems",
    "minProperties",
    "maxProperties",
  ].includes(error.keyword)) return "range";
  if (error.keyword === "$ref") return "reference";
  if (["anyOf", "oneOf", "allOf", "not", "items", "contains", "uniqueItems", "dependencies", "dependentRequired", "dependentSchemas"].includes(error.keyword)) return "structure";
  return error.keyword === "type" ? "type" : "structure";
}

function issuePath(error: ErrorObject): string {
  const path = error.instancePath;
  if (error.keyword === "required" && typeof error.params.missingProperty === "string") {
    return escapedIssuePath(path, error.params.missingProperty);
  }
  if (error.keyword === "additionalProperties" && typeof error.params.additionalProperty === "string") {
    return escapedIssuePath(path, error.params.additionalProperty);
  }
  return path;
}

function normalizeIssues(errors: readonly ErrorObject[] | null | undefined): Array<{ path: string; rule: SchemaIssueRule }> {
  const unique = new Map<string, { path: string; rule: SchemaIssueRule }>();
  for (const error of errors ?? []) {
    const issue = { path: issuePath(error), rule: issueRule(error) };
    unique.set(`${issue.path}\u0000${issue.rule}`, issue);
  }
  return [...unique.values()].sort((left, right) => {
    if (left.path < right.path) return -1;
    if (left.path > right.path) return 1;
    if (left.rule < right.rule) return -1;
    if (left.rule > right.rule) return 1;
    return 0;
  });
}

function createAjv(): RuntimeAjv {
  const ajv = new Ajv({
    allErrors: true,
    coerceTypes: false,
    removeAdditional: false,
    strict: true,
    useDefaults: false,
  });
  addFormats(ajv);
  ajv.addFormat("date-time", { type: "string", validate: isCanonicalTimestamp });
  return ajv;
}

const validatorAjv = createAjv();
const validators = new WeakMap<object, ValidateFunction>();

function validatorFor(schema: Type.TSchema): ValidateFunction {
  const key = schema as object;
  const cached = validators.get(key);
  if (cached) return cached;
  const validator = validatorAjv.compile(schema as AnySchema);
  validators.set(key, validator);
  return validator;
}

function errorEnvelope(base: typeof INVALID_JSON_VALUE_ERROR | typeof SCHEMA_MISMATCH_ERROR, details?: Record<string, unknown>): ContractErrorEnvelope {
  const result: Record<string, unknown> = { ...base };
  if (details && Object.keys(details).length > 0) defineOwn(result, "details", details);
  return freezeValue(result) as ContractErrorEnvelope;
}

export function decodeContract<const TSchema extends Type.TSchema>(
  schema: TSchema,
  input: unknown,
): ContractDecodeResult<Type.Static<TSchema>> {
  let inert: unknown;
  try {
    inert = materialize(input, "", new Set<object>());
  } catch (error) {
    if (!(error instanceof MaterializationError)) throw error;
    return freezeValue({ ok: false, error: errorEnvelope(INVALID_JSON_VALUE_ERROR, { path: error.failure.path, reason: error.failure.reason }) });
  }

  const validator = validatorFor(schema);
  if (!validator(inert)) {
    return freezeValue({
      ok: false,
      error: errorEnvelope(SCHEMA_MISMATCH_ERROR, { issues: normalizeIssues(validator.errors) }),
    });
  }
  return freezeValue({ ok: true, value: freezeValue(inert) as ContractValue<Type.Static<TSchema>> });
}
