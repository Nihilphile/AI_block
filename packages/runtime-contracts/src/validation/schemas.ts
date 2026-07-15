import Type from "typebox";

const JSON_KEY_PATTERN = "^[\\s\\S]*$";

const JSON_DEFINITIONS = {
  Json: Type.Union([
    Type.Null(),
    Type.Boolean(),
    Type.Number(),
    Type.String(),
    Type.Array(Type.Ref("Json")),
    Type.Record(Type.String({ pattern: JSON_KEY_PATTERN }), Type.Ref("Json")),
  ]),
  JsonObject: Type.Record(Type.String({ pattern: JSON_KEY_PATTERN }), Type.Ref("Json")),
};

export const JsonValueSchema = Type.Cyclic(JSON_DEFINITIONS, "Json");
export type JsonValue = Type.Static<typeof JsonValueSchema>;

export const JsonObjectSchema = Type.Cyclic(JSON_DEFINITIONS, "JsonObject");
export type JsonObject = Type.Static<typeof JsonObjectSchema>;
