import { z } from "zod";

const optionalEndpoint = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .transform((value) => value || undefined)
  .refine(
    (value) =>
      value === undefined || value.startsWith("/") || URL.canParse(value),
    "Use a relative path or a valid URL",
  );

export const verificationInputSchema = z.object({
  projectName: z.string().trim().min(2).max(80),
  repositoryUrl: z.string().trim().url().max(2048),
  deploymentUrl: z.string().trim().url().max(2048),
  healthEndpoint: optionalEndpoint,
  readinessEndpoint: optionalEndpoint,
  contractAddress: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine(
      (value) => value === undefined || /^0x[a-fA-F0-9]{40}$/.test(value),
      "Enter a valid EVM contract address",
    ),
  chainId: z.literal(10143),
});

export type VerificationInput = z.infer<typeof verificationInputSchema>;

