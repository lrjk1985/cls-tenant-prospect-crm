type DocumentType = "quotation" | "letter_of_offer" | "lease_agreement" | "revision_request" | "unclear";

type RiskFlag = {
  level: "low" | "medium" | "high";
  message: string;
};

type AnalysisOutput = {
  documentType: DocumentType;
  confidence: number;
  extractedFields: Record<string, unknown>;
  missingFields: string[];
  followUpQuestions: string[];
  riskFlags: RiskFlag[];
  needsHumanReview: boolean;
  cleanedSpecialConditions?: string[];
  aiProvider?: string;
  aiUnavailableMessage?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const documentRequirements: Record<Exclude<DocumentType, "revision_request" | "unclear">, string[]> = {
  quotation: ["clientName", "eventBookingLocation", "bookingDates", "price"],
  letter_of_offer: ["tenantName", "unitNumber", "rentalStructure", "optionToRenew", "specialConditions"],
  lease_agreement: [
    "tenantName",
    "unitNumber",
    "permittedUse",
    "leaseTerm",
    "commencementDate",
    "rentalStructure",
    "securityDeposit",
    "handoverCondition",
    "optionToRenew",
    "specialConditions",
  ],
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return jsonResponse({}, 200);
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    await requireActiveStaff(request);

    const body = await request.json();
    const action = String(body.action || "");

    if (action !== "analyze_request") {
      return jsonResponse({ error: "Unsupported document AI action." }, 400);
    }

    const inputText = String(body.inputText || "").trim();
    if (!inputText) {
      return jsonResponse({ error: "Document request text is required." }, 400);
    }

    const documentTypeHint = normalizeDocumentType(body.documentTypeHint);
    const fallbackOutput = analyzeWithRules(inputText, documentTypeHint);
    const output = await analyzeWithAi(inputText, documentTypeHint, body.existingCrmData, fallbackOutput);

    await logAiInteraction(request, {
      interaction_type: "analyze_request",
      input_text: inputText,
      ai_output: output,
      model_name: output.aiProvider || "rules-fallback",
    });

    return jsonResponse(output, 200);
  } catch (error) {
    return jsonResponse({ error: errorMessage(error) }, 400);
  }
});

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || "Unknown error.");
}

function env(name: string) {
  return Deno.env.get(name) || "";
}

async function requireActiveStaff(request: Request) {
  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    throw new Error("Sign in is required.");
  }

  const supabaseUrl = env("SUPABASE_URL");
  const anonKey = env("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    throw new Error("Supabase function environment is not configured.");
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: authorization,
      apikey: anonKey,
    },
  });

  if (!userResponse.ok) {
    throw new Error("Could not verify signed-in user.");
  }

  const user = await userResponse.json();
  const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,active`, {
    headers: {
      Authorization: authorization,
      apikey: anonKey,
      Accept: "application/json",
    },
  });

  if (!profileResponse.ok) {
    throw new Error("Could not verify staff profile.");
  }

  const profiles = await profileResponse.json();
  if (!profiles?.[0]?.active) {
    throw new Error("Your account is not active.");
  }
}

async function logAiInteraction(request: Request, row: Record<string, unknown>) {
  const supabaseUrl = env("SUPABASE_URL");
  const anonKey = env("SUPABASE_ANON_KEY");
  const authorization = request.headers.get("Authorization") || "";

  if (!supabaseUrl || !anonKey || !authorization) {
    return;
  }

  await fetch(`${supabaseUrl}/rest/v1/ai_interactions`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      apikey: anonKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  }).catch(() => {
    // Logging is audit support, but analysis should still return even before the SQL setup is installed.
  });
}

function normalizeDocumentType(value: unknown): DocumentType {
  const text = String(value || "").toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  if (text === "quotation" || text === "quote") {
    return "quotation";
  }
  if (text === "letter_of_offer" || text === "loo" || text === "offer") {
    return "letter_of_offer";
  }
  if (text === "lease_agreement" || text === "lease") {
    return "lease_agreement";
  }
  if (text === "revision_request" || text === "revision") {
    return "revision_request";
  }
  return "unclear";
}

function classifyDocumentRequest(inputText: string, hint: DocumentType): DocumentType {
  const text = inputText.toLowerCase();

  if (/\b(revise|revision|change|amend|update)\b/.test(text)) {
    return "revision_request";
  }
  if (/\b(quotation|quote|event booking|booking date)\b/.test(text)) {
    return "quotation";
  }
  if (/\b(lease agreement|tenancy agreement)\b/.test(text)) {
    return "lease_agreement";
  }
  if (/\b(letter of offer|loo|offer letter)\b/.test(text)) {
    return "letter_of_offer";
  }
  return hint === "unclear" ? "letter_of_offer" : hint;
}

function analyzeWithRules(inputText: string, hint: DocumentType): AnalysisOutput {
  const documentType = classifyDocumentRequest(inputText, hint);
  const extractedFields = extractDocumentFields(documentType, inputText);
  const missingFields = checkMissingInformation(documentType, extractedFields, inputText);
  const riskFlags = flagRiskyInstructions(documentType, extractedFields, inputText);
  const followUpQuestions = generateFollowUpQuestions(documentType, missingFields);

  return {
    documentType,
    confidence: documentType === "unclear" ? 0.25 : 0.62,
    extractedFields,
    missingFields,
    followUpQuestions,
    riskFlags,
    needsHumanReview: true,
    cleanedSpecialConditions: cleanSpecialConditions(extractedFields.specialConditions),
    aiProvider: "rules-fallback",
    aiUnavailableMessage: "AI provider is not configured yet, so this used the controlled rule-based checker.",
  };
}

function extractDocumentFields(documentType: DocumentType, inputText: string) {
  const text = inputText.trim();
  const fields: Record<string, unknown> = {};
  const unitNumber = matchValue(text, /\bunit\s+([#a-z0-9-]+)/i);
  const tenantName = matchValue(text, /\bfor\s+(.+?)\s+for\s+unit\b/i) || matchValue(text, /\btenant\s+(?:is\s+)?(.+?)(?:\s+for\s+unit|\.|$)/i);
  const clientName = tenantName || matchValue(text, /\bclient\s+(?:is\s+)?(.+?)(?:\.|$)/i);
  const leaseTerm = matchValue(text, /\blease term\s+(?:is\s+)?([^.,]+)/i) || matchValue(text, /\b(\d+\s+years?)\b/i);
  const commencementDate = matchValue(text, /\bfrom\s+(\d{1,2}\s+[a-z]+\s+\d{4})/i);
  const securityDeposit = matchValue(text, /\bsecurity deposit\s+(?:is\s+)?([^.,]+)/i);
  const permittedUse = matchValue(text, /\bpermitted use\s+(?:is\s+)?([^.,]+)/i);
  const price = matchValue(text, /\bprice\s+(?:is\s+)?([^.,]+)/i) || matchValue(text, /(\$[\d,.]+(?:\s*(?:psf|per square foot))?)/i);
  const bookingDates = matchValue(text, /\bbooking dates?\s+(?:are|is)?\s*([^.,]+)/i) || matchValue(text, /\bon\s+(\d{1,2}\s+[a-z]+\s+\d{4})/i);
  const eventBookingLocation = matchValue(text, /\b(?:at|location)\s+([a-z0-9# -]+?)(?:\.|,| for | on |$)/i);
  const rentalStructure = extractRentalStructure(text);
  const specialConditions = extractSpecialConditions(text);
  const optionToRenew = /\bno option to renew\b/i.test(text)
    ? "None"
    : matchValue(text, /\boption to renew\s+(?:is\s+)?([^.,]+)/i);
  const handoverCondition = matchValue(text, /\bhandover\s+(?:is\s+)?([^.,]+)/i);

  if (documentType === "quotation") {
    assignPresent(fields, "clientName", clientName);
    assignPresent(fields, "eventBookingLocation", eventBookingLocation);
    assignPresent(fields, "bookingDates", bookingDates);
    assignPresent(fields, "price", price);
  } else {
    assignPresent(fields, "tenantName", tenantName || clientName);
    assignPresent(fields, "unitNumber", unitNumber);
    assignPresent(fields, "rentalStructure", rentalStructure.length ? rentalStructure : undefined);
    assignPresent(fields, "leaseTerm", leaseTerm);
    assignPresent(fields, "commencementDate", commencementDate);
    assignPresent(fields, "securityDeposit", securityDeposit);
    assignPresent(fields, "permittedUse", permittedUse);
    assignPresent(fields, "handoverCondition", handoverCondition);
    assignPresent(fields, "optionToRenew", optionToRenew);
    assignPresent(fields, "specialConditions", specialConditions.length ? specialConditions : undefined);
  }

  return fields;
}

function assignPresent(fields: Record<string, unknown>, key: string, value: unknown) {
  if (value !== undefined && value !== null && String(value).trim() !== "") {
    fields[key] = value;
  }
}

function matchValue(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  return match?.[1]?.trim().replace(/\s+/g, " ");
}

function extractRentalStructure(text: string) {
  const rentals: Array<{ year: number; rent: string }> = [];
  const pattern = /\byear\s*(\d+)\D{0,40}?(\$[\d,.]+(?:\s*(?:psf|per square foot))?)/gi;
  let match = pattern.exec(text);

  while (match) {
    rentals.push({
      year: Number(match[1]),
      rent: match[2].trim(),
    });
    match = pattern.exec(text);
  }

  return rentals;
}

function extractSpecialConditions(text: string) {
  const condition = matchValue(text, /\bspecial condition[s]?:?\s*(.+)$/i);
  if (!condition) {
    return [];
  }
  return [condition.trim().replace(/\.$/, ".")];
}

function checkMissingInformation(documentType: DocumentType, extractedFields: Record<string, unknown>, inputText: string) {
  if (documentType === "unclear" || documentType === "revision_request") {
    return ["documentType"];
  }

  const required = documentRequirements[documentType];
  const missing = required.filter((field) => isEmptyValue(extractedFields[field]));

  if (
    (documentType === "letter_of_offer" || documentType === "lease_agreement")
    && !/\b(no option to renew|option to renew)\b/i.test(inputText)
    && !missing.includes("optionToRenew")
  ) {
    missing.push("optionToRenew");
  }

  if (
    (documentType === "letter_of_offer" || documentType === "lease_agreement")
    && !/\b(no special conditions?|special conditions?)\b/i.test(inputText)
    && !missing.includes("specialConditions")
  ) {
    missing.push("specialConditions");
  }

  return missing;
}

function isEmptyValue(value: unknown) {
  if (value === undefined || value === null) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return String(value).trim() === "";
}

function generateFollowUpQuestions(documentType: DocumentType, missingFields: string[]) {
  return missingFields.map((field) => {
    if (field === "optionToRenew") {
      return "Please confirm whether there is an option to renew, or mark it as none.";
    }
    if (field === "specialConditions") {
      return "Please confirm whether there are special conditions, or mark them as none.";
    }
    return `Please provide ${humanFieldName(field)}.`;
  });
}

function humanFieldName(field: string) {
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toLowerCase());
}

function cleanSpecialConditions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function flagRiskyInstructions(documentType: DocumentType, fields: Record<string, unknown>, inputText: string): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const text = inputText.toLowerCase();

  if (documentType === "lease_agreement") {
    flags.push({
      level: "medium",
      message: "Lease Agreement terms should be reviewed by an authorized staff member before generation.",
    });
  }

  if (/subject to|existing tenant|vacating|legal|indemn/i.test(text)) {
    flags.push({
      level: "medium",
      message: "The request includes conditional or legally sensitive wording. Staff should review before issuance.",
    });
  }

  if (fields.optionToRenew && !/^none$/i.test(String(fields.optionToRenew)) && documentType !== "quotation") {
    flags.push({
      level: "low",
      message: "Option to renew terms were detected. Confirm duration and pricing method before generation.",
    });
  }

  return flags;
}

async function analyzeWithAi(
  inputText: string,
  hint: DocumentType,
  existingCrmData: unknown,
  fallbackOutput: AnalysisOutput,
): Promise<AnalysisOutput> {
  const apiKey = env("OPENAI_API_KEY") || env("AI_API_KEY");
  if (!apiKey) {
    return fallbackOutput;
  }

  const model = env("OPENAI_MODEL") || "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: [
            "You are a controlled internal CRM document assistant.",
            "Extract only terms explicitly provided by staff or matching CRM context.",
            "Do not invent prices, dates, names, unit numbers, lease terms, or commercial terms.",
            "Do not make legal or commercial decisions.",
            "Return JSON only and require human review before generation.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            action: "analyze_request",
            documentTypeHint: hint,
            inputText,
            existingCrmData,
            fallbackOutput,
          }),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "document_analysis",
          strict: false,
          schema: analysisJsonSchema(),
        },
      },
    }),
  });

  if (!response.ok) {
    return {
      ...fallbackOutput,
      aiUnavailableMessage: "AI provider call failed, so this used the controlled rule-based checker.",
    };
  }

  const payload = await response.json();
  const text = String(payload.choices?.[0]?.message?.content || "").trim();

  if (!text) {
    return fallbackOutput;
  }

  try {
    const parsed = JSON.parse(text) as AnalysisOutput;
    const documentType = normalizeDocumentType(parsed.documentType);
    const extractedFields = parsed.extractedFields || {};
    const missingFields = checkMissingInformation(documentType, extractedFields, inputText);
    return {
      ...parsed,
      documentType,
      extractedFields,
      missingFields,
      followUpQuestions: generateFollowUpQuestions(documentType, missingFields),
      riskFlags: [
        ...(Array.isArray(parsed.riskFlags) ? parsed.riskFlags : []),
        ...flagRiskyInstructions(documentType, extractedFields, inputText),
      ],
      needsHumanReview: true,
      aiProvider: model,
      cleanedSpecialConditions: cleanSpecialConditions(extractedFields.specialConditions),
    };
  } catch {
    return fallbackOutput;
  }
}

function analysisJsonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "documentType",
      "confidence",
      "extractedFields",
      "missingFields",
      "followUpQuestions",
      "riskFlags",
      "needsHumanReview",
    ],
    properties: {
      documentType: {
        type: "string",
        enum: ["quotation", "letter_of_offer", "lease_agreement", "revision_request", "unclear"],
      },
      confidence: { type: "number" },
      extractedFields: { type: "object" },
      missingFields: {
        type: "array",
        items: { type: "string" },
      },
      followUpQuestions: {
        type: "array",
        items: { type: "string" },
      },
      riskFlags: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["level", "message"],
          properties: {
            level: { type: "string", enum: ["low", "medium", "high"] },
            message: { type: "string" },
          },
        },
      },
      needsHumanReview: { type: "boolean" },
    },
  };
}
