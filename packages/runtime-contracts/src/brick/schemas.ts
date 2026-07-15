import Type from "typebox";

const textBrickPrompt = Type.Object(
  {
    kind: Type.Literal("text"),
    text: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);

const compositeBrickPrompt = Type.Object(
  {
    kind: Type.Literal("composite"),
    parts: Type.Array(Type.Ref("BrickPrompt"), { minItems: 1 }),
  },
  { additionalProperties: false },
);

const BRICK_DEFINITIONS = {
  BrickPrompt: Type.Union([textBrickPrompt, compositeBrickPrompt]),
  CompositeBrickPrompt: compositeBrickPrompt,
};

export const TextBrickPromptSchema = textBrickPrompt;
export type TextBrickPrompt = Type.Static<typeof TextBrickPromptSchema>;

export const CompositeBrickPromptSchema = Type.Cyclic(BRICK_DEFINITIONS, "CompositeBrickPrompt");
export type CompositeBrickPrompt = Type.Static<typeof CompositeBrickPromptSchema>;

export const BrickPromptSchema = Type.Cyclic(BRICK_DEFINITIONS, "BrickPrompt");
export type BrickPrompt = Type.Static<typeof BrickPromptSchema>;

export const BrickSysPromptSchema = Type.Object(
  {
    kind: Type.Literal("system_text"),
    text: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
export type BrickSysPrompt = Type.Static<typeof BrickSysPromptSchema>;
