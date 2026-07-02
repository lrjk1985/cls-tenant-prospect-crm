type DocumentType = "quotation" | "letter_of_offer" | "lease_agreement";

type StaffUser = {
  id: string;
};

type ZipEntry = {
  name: string;
  method: number;
  compressedData: Uint8Array;
};

type OutputZipEntry = {
  name: string;
  data: Uint8Array;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const documentTemplateBucket = "document-templates";
const generatedDocumentBucket = "generated-documents";
const docxContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const documentCurrencyFields = new Set([
  "security_deposit",
  "advance_rental",
  "fitting_out_deposit",
  "stamp_fees",
  "base_rent",
  "service_charge",
  "joint_promotion_fund",
]);
const documentRequirements: Record<DocumentType, string[]> = {
  quotation: ["client_name", "event_booking_location", "booking_dates", "price"],
  letter_of_offer: [
    "date",
    "tenant_company_name",
    "tenant_address",
    "tenant_email",
    "tenant_name",
    "unit_number",
    "floor_area",
    "permitted_use",
    "shop_name",
    "rental_structure",
    "security_deposit",
    "advance_rental",
    "fitting_out_deposit",
    "stamp_fees",
    "option_to_renew",
    "base_rent",
    "service_charge",
    "joint_promotion_fund",
    "rent_free",
    "fitting_out_period",
    "offer_lapse",
    "special_conditions",
  ],
  lease_agreement: [
    "tenant_name",
    "unit_number",
    "permitted_use",
    "lease_term",
    "commencement_date",
    "rental_structure",
    "security_deposit",
    "handover_condition",
    "option_to_renew",
    "special_conditions",
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
    const staffUser = await requireActiveStaff(request);
    const body = await request.json();
    const documentType = normalizeDocumentType(body.documentType);

    if (documentType !== "letter_of_offer") {
      throw new Error("Document generation is currently enabled for Letter of Offer first.");
    }

    const structuredData = normalizeExtractedFieldKeys(body.structuredData || {});
    const missingFields = missingRequiredFields(documentType, structuredData);
    if (missingFields.length) {
      return jsonResponse({ error: "Required fields are missing.", missingFields }, 400);
    }

    const template = await activeTemplateForType(documentType);
    const templateBytes = await downloadStorageObject(documentTemplateBucket, String(template.storage_path || ""));
    const generatedBytes = await generateDocx(templateBytes, structuredData);
    const requestId = crypto.randomUUID();
    const filePath = generatedFilePath(documentType, structuredData, requestId, 1);

    await uploadStorageObject(generatedDocumentBucket, filePath, generatedBytes, docxContentType);

    const requestRow = await createDocumentRequest({
      requestId,
      documentType,
      staffUserId: staffUser.id,
      sourceType: String(body.sourceType || "ai_request"),
      originalRequestText: String(body.originalRequestText || ""),
      structuredData,
      aiExtractedData: normalizeExtractedFieldKeys(body.aiAnalysis?.extractedFields || structuredData),
      riskFlags: Array.isArray(body.aiAnalysis?.riskFlags) ? body.aiAnalysis.riskFlags : [],
      latestFilePath: filePath,
    });

    try {
      await createDocumentVersion(requestRow.id, filePath, structuredData, staffUser.id);
    } catch (error) {
      await cancelGeneratedDocumentRequest(requestRow.id).catch(() => {});
      throw error;
    }

    return jsonResponse({
      documentRequest: requestRow,
      filePath,
      versionNumber: 1,
    }, 200);
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

function serviceHeaders() {
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRoleKey) {
    throw new Error("Supabase service role key is not configured.");
  }

  return {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
  };
}

async function requireActiveStaff(request: Request): Promise<StaffUser> {
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

  return { id: user.id };
}

function normalizeDocumentType(value: unknown): DocumentType {
  const text = String(value || "").toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  if (text === "quotation" || text === "quote") {
    return "quotation";
  }
  if (text === "lease_agreement" || text === "lease") {
    return "lease_agreement";
  }
  return "letter_of_offer";
}

function normalizeExtractedFieldKeys(fields: Record<string, unknown>) {
  const aliases: Record<string, string> = {
    clientName: "client_name",
    eventBookingLocation: "event_booking_location",
    bookingDates: "booking_dates",
    tenantCompanyName: "tenant_company_name",
    tenantAddress: "tenant_address",
    tenantEmail: "tenant_email",
    tenantName: "tenant_name",
    unitNumber: "unit_number",
    floorArea: "floor_area",
    permittedUse: "permitted_use",
    shopName: "shop_name",
    rentalStructure: "rental_structure",
    securityDeposit: "security_deposit",
    advanceRental: "advance_rental",
    fittingOutDeposit: "fitting_out_deposit",
    stampFees: "stamp_fees",
    optionToRenew: "option_to_renew",
    baseRent: "base_rent",
    serviceCharge: "service_charge",
    jointPromotionFund: "joint_promotion_fund",
    rentFree: "rent_free",
    fittingOutPeriod: "fitting_out_period",
    offerLapse: "offer_lapse",
    specialConditions: "special_conditions",
    leaseTerm: "lease_term",
    commencementDate: "commencement_date",
    expiryDate: "expiry_date",
  };
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(fields || {})) {
    const normalizedKey = aliases[key] || key;
    normalized[normalizedKey] = normalizeDocumentFieldValue(normalizedKey, value);
  }

  return normalizeLetterOfOfferWording(normalized);
}

function formatDocumentValue(value: unknown) {
  if (value === undefined || value === null) {
    return "";
  }
  if (Array.isArray(value)) {
    if (value.every((item) => item && typeof item === "object" && "year" in item && "rent" in item)) {
      return value.map((item) => `Year ${item.year}: ${item.rent}`).join("\n");
    }
    return value.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join("\n");
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function normalizeDocumentFieldValue(key: string, value: unknown) {
  const formatted = formatDocumentValue(value);
  return documentCurrencyFields.has(key) ? withSingaporeDollarPrefix(formatted) : formatted;
}

function withSingaporeDollarPrefix(value: string) {
  return String(value || "").replace(/(^|[^\w$])(?:S\$|\$)?\s*(\d[\d,.]*(?:\.\d+)?)/g, (match, prefix, number, offset, fullText) => {
    const after = fullText.slice(offset + match.length, offset + match.length + 12);
    if (/^\s*(?:months?|years?)\b/i.test(after)) {
      return match;
    }
    if (/S\$\s*\d/i.test(match)) {
      return match.replace(/S\$\s*/i, "S$");
    }
    return `${prefix}S$${number}`;
  });
}

function normalizeLetterOfOfferWording(fields: Record<string, string>) {
  const rentalStructure = formatLetterOfOfferRentalStructure(fields.rental_structure, fields.commencement_date, fields.expiry_date);
  const optionToRenew = formatLetterOfOfferOptionToRenew(fields.option_to_renew);
  const normalized = { ...fields };

  if (rentalStructure || "rental_structure" in fields) {
    normalized.rental_structure = rentalStructure;
  }
  if (optionToRenew || "option_to_renew" in fields) {
    normalized.option_to_renew = optionToRenew;
  }

  return normalized;
}

function formatLetterOfOfferRentalStructure(value = "", commencementDate = "", expiryDate = "") {
  const text = String(value || "").trim();
  if (!text || /commencing from the expiry of the fitting out period/i.test(text)) {
    return text;
  }

  const term = formatYearTerm(text);
  const commencement = commencementDate || dateAfterKeyword(text, /\b(?:i\.e\.|from|commencing)\s+(\d{1,2}\s+[a-z]+\s+\d{4})/i);
  const expiry = expiryDate || dateAfterKeyword(text, /\b(?:to|until|expiry|expiring on)\s+(\d{1,2}\s+[a-z]+\s+\d{4})/i);

  if (!term || !commencement || !expiry) {
    return text;
  }

  return `${term}, commencing from the expiry of the Fitting Out Period, i.e. ${commencement} ("Commencement Date") to ${expiry}.`;
}

function formatLetterOfOfferOptionToRenew(value = "") {
  const text = String(value || "").trim();
  if (!text || /^none$/i.test(text) || /prevailing market rental/i.test(text)) {
    return text;
  }

  const term = formatYearTerm(text);
  if (!term) {
    return text;
  }

  return `${term}, at the prevailing market rental and at such terms and conditions as shall be determined by the Landlord.`;
}

function formatYearTerm(value: string) {
  const match = String(value || "").match(/\b(\d+)\s*(?:\(\s*\d+\s*\))?\s*years?\b/i);
  if (!match) {
    return "";
  }

  const years = Number(match[1]);
  return `${numberWord(years)} (${years}) ${years === 1 ? "year" : "years"}`;
}

function numberWord(value: number) {
  const words: Record<number, string> = {
    1: "One",
    2: "Two",
    3: "Three",
    4: "Four",
    5: "Five",
    6: "Six",
    7: "Seven",
    8: "Eight",
    9: "Nine",
    10: "Ten",
  };
  return words[value] || String(value);
}

function dateAfterKeyword(value: string, pattern: RegExp) {
  return String(value || "").match(pattern)?.[1]?.trim() || "";
}

function missingRequiredFields(documentType: DocumentType, data: Record<string, unknown>) {
  return documentRequirements[documentType].filter((field) => String(data[field] || "").trim() === "");
}

async function activeTemplateForType(documentType: DocumentType) {
  const supabaseUrl = env("SUPABASE_URL");
  const url = `${supabaseUrl}/rest/v1/document_templates?document_type=eq.${documentType}&is_active=eq.true&select=*&limit=1`;
  const response = await fetch(url, {
    headers: {
      ...serviceHeaders(),
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Could not load active document template.");
  }

  const rows = await response.json();
  if (!rows?.[0]?.storage_path) {
    throw new Error("No active template is available for this document type.");
  }

  return rows[0];
}

async function createDocumentRequest(values: {
  requestId: string;
  documentType: DocumentType;
  staffUserId: string;
  sourceType: string;
  originalRequestText: string;
  structuredData: Record<string, unknown>;
  aiExtractedData: Record<string, unknown>;
  riskFlags: unknown[];
  latestFilePath: string;
}) {
  const supabaseUrl = env("SUPABASE_URL");
  const response = await fetch(`${supabaseUrl}/rest/v1/document_requests?select=*`, {
    method: "POST",
    headers: {
      ...serviceHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      id: values.requestId,
      document_type: values.documentType,
      status: "generated",
      requested_by: values.staffUserId,
      source_type: allowedSourceType(values.sourceType),
      original_request_text: values.originalRequestText,
      source_data: {},
      ai_extracted_data: values.aiExtractedData,
      approved_data: values.structuredData,
      missing_fields: [],
      risk_flags: values.riskFlags,
      latest_version_number: 1,
      latest_file_path: values.latestFilePath,
    }),
  });

  if (!response.ok) {
    throw new Error(`Could not create document request: ${await response.text()}`);
  }

  const rows = await response.json();
  return rows[0];
}

function allowedSourceType(value: string) {
  return ["structured_form", "ai_request", "direct_terms_input"].includes(value) ? value : "ai_request";
}

async function createDocumentVersion(
  requestId: string,
  filePath: string,
  structuredData: Record<string, unknown>,
  staffUserId: string,
) {
  const supabaseUrl = env("SUPABASE_URL");
  const response = await fetch(`${supabaseUrl}/rest/v1/document_versions`, {
    method: "POST",
    headers: {
      ...serviceHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      document_request_id: requestId,
      version_number: 1,
      file_path: filePath,
      structured_data: structuredData,
      change_summary: "Initial generated version.",
      created_by: staffUserId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Could not create document version: ${await response.text()}`);
  }
}

async function cancelGeneratedDocumentRequest(requestId: string) {
  const supabaseUrl = env("SUPABASE_URL");
  const response = await fetch(`${supabaseUrl}/rest/v1/document_requests?id=eq.${requestId}`, {
    method: "PATCH",
    headers: {
      ...serviceHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      status: "cancelled",
      latest_version_number: 0,
      latest_file_path: null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Could not cancel incomplete document request: ${await response.text()}`);
  }
}

async function downloadStorageObject(bucket: string, path: string) {
  const supabaseUrl = env("SUPABASE_URL");
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodePath(path)}`, {
    headers: serviceHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Could not download template: ${await response.text()}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function uploadStorageObject(bucket: string, path: string, bytes: Uint8Array, contentType: string) {
  const supabaseUrl = env("SUPABASE_URL");
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodePath(path)}`, {
    method: "POST",
    headers: {
      ...serviceHeaders(),
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: bytes,
  });

  if (!response.ok) {
    throw new Error(`Could not upload generated document: ${await response.text()}`);
  }
}

function generatedFilePath(documentType: DocumentType, data: Record<string, unknown>, requestId: string, version: number) {
  const tenant = safeFileName(String(data.tenant_company_name || data.tenant_name || "Client"));
  const unit = safeFileName(String(data.unit_number || "Unit"));
  const prefix = documentType === "letter_of_offer" ? "Letter_of_Offer" : "Document";
  return `${documentType}/${requestId}/${prefix}_${unit}_${tenant}_v${version}.docx`;
}

function safeFileName(value: string) {
  return String(value || "Document")
    .trim()
    .replace(/[#/\\?%*:|"<>]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80)
    || "Document";
}

function encodePath(path: string) {
  return path.split("/").map((part) => encodeURIComponent(part)).join("/");
}

async function generateDocx(templateBytes: Uint8Array, data: Record<string, unknown>) {
  const entries = await parseZipEntries(templateBytes);
  const outputEntries: OutputZipEntry[] = [];

  for (const entry of entries) {
    let bytes = await unzipEntry(entry);

    if (/^word\/.*\.xml$/i.test(entry.name)) {
      const xml = new TextDecoder().decode(bytes);
      bytes = new TextEncoder().encode(replacePlaceholdersInXml(xml, data));
    }

    outputEntries.push({ name: entry.name, data: bytes });
  }

  return buildZip(outputEntries);
}

async function parseZipEntries(bytes: Uint8Array): Promise<ZipEntry[]> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const endOffset = findZipEndRecord(view);
  if (endOffset < 0) {
    throw new Error("Template is not a valid .docx file.");
  }

  const entryCount = view.getUint16(endOffset + 10, true);
  let offset = view.getUint32(endOffset + 16, true);
  const entries: ZipEntry[] = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      break;
    }

    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const name = new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + fileNameLength));
    const localNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;

    entries.push({
      name,
      method,
      compressedData: bytes.slice(dataStart, dataStart + compressedSize),
    });

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findZipEndRecord(view: DataView) {
  const minimumEndSize = 22;
  const searchStart = Math.max(0, view.byteLength - 66000);

  for (let offset = view.byteLength - minimumEndSize; offset >= searchStart; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      return offset;
    }
  }

  return -1;
}

async function unzipEntry(entry: ZipEntry) {
  if (entry.method === 0) {
    return entry.compressedData;
  }

  if (entry.method !== 8) {
    throw new Error(`Unsupported template compression for ${entry.name}.`);
  }

  const stream = new Blob([entry.compressedData]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function replacePlaceholdersInXml(xml: string, data: Record<string, unknown>) {
  const textNodePattern = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
  const nodes: Array<{ markup: string; open: string; close: string; text: string; start: number; end: number }> = [];
  let fullText = "";
  let match = textNodePattern.exec(xml);

  while (match) {
    const markup = match[0];
    const openEnd = markup.indexOf(">") + 1;
    const open = markup.slice(0, openEnd);
    const close = "</w:t>";
    const text = match[1];
    const start = fullText.length;
    fullText += text;
    nodes.push({
      markup,
      open,
      close,
      text,
      start,
      end: fullText.length,
    });
    match = textNodePattern.exec(xml);
  }

  if (nodes.length === 0) {
    return replaceExactPlaceholders(xml, data);
  }

  const nodeTexts = nodes.map((node) => replaceExactPlaceholders(node.text, data));
  const replacements = Object.entries(data)
    .flatMap(([key, value]) => placeholderRanges(fullText, `{{${key}}}`, formatDocumentValue(value)))
    .filter((range) => !nodes.some((node) => range.start >= node.start && range.end <= node.end))
    .sort((a, b) => b.start - a.start);

  for (const replacement of replacements) {
    const overlappingIndexes = nodes
      .map((node, index) => ({ node, index }))
      .filter(({ node }) => replacement.start < node.end && replacement.end > node.start)
      .map(({ index }) => index);

    if (!overlappingIndexes.length) {
      continue;
    }

    const first = overlappingIndexes[0];
    const last = overlappingIndexes[overlappingIndexes.length - 1];

    for (const index of overlappingIndexes) {
      const node = nodes[index];
      const localStart = Math.max(0, replacement.start - node.start);
      const localEnd = Math.min(node.text.length, replacement.end - node.start);

      if (index === first && index === last) {
        nodeTexts[index] = `${node.text.slice(0, localStart)}${escapeXml(replacement.value)}${node.text.slice(localEnd)}`;
      } else if (index === first) {
        nodeTexts[index] = `${node.text.slice(0, localStart)}${escapeXml(replacement.value)}`;
      } else if (index === last) {
        nodeTexts[index] = node.text.slice(localEnd);
      } else {
        nodeTexts[index] = "";
      }
    }
  }

  let nodeIndex = 0;
  return xml.replace(textNodePattern, () => {
    const node = nodes[nodeIndex];
    const text = nodeTexts[nodeIndex];
    nodeIndex += 1;
    return `${node.open}${text}${node.close}`;
  });
}

function replaceExactPlaceholders(xml: string, data: Record<string, unknown>) {
  return Object.entries(data).reduce((current, [key, value]) => {
    return current.split(`{{${key}}}`).join(escapeXml(formatDocumentValue(value)));
  }, xml);
}

function placeholderRanges(text: string, needle: string, value: string) {
  const ranges: Array<{ start: number; end: number; value: string }> = [];
  let start = text.indexOf(needle);

  while (start >= 0) {
    ranges.push({ start, end: start + needle.length, value });
    start = text.indexOf(needle, start + needle.length);
  }

  return ranges;
}

function escapeXml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildZip(entries: OutputZipEntry[]) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.name);
    const crc = crc32(entry.data);
    const localHeader = zipLocalHeader(nameBytes, entry.data.length, crc);
    localParts.push(localHeader, entry.data);
    centralParts.push(zipCentralHeader(nameBytes, entry.data.length, crc, offset));
    offset += localHeader.length + entry.data.length;
  }

  const centralDirectory = concatBytes(centralParts);
  const endRecord = zipEndRecord(entries.length, centralDirectory.length, offset);
  return concatBytes([...localParts, centralDirectory, endRecord]);
}

function zipLocalHeader(nameBytes: Uint8Array, size: number, crc: number) {
  const header = new Uint8Array(30 + nameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 33, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, nameBytes.length, true);
  view.setUint16(28, 0, true);
  header.set(nameBytes, 30);
  return header;
}

function zipCentralHeader(nameBytes: Uint8Array, size: number, crc: number, localOffset: number) {
  const header = new Uint8Array(46 + nameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 33, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, nameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localOffset, true);
  header.set(nameBytes, 46);
  return header;
}

function zipEndRecord(entryCount: number, centralSize: number, centralOffset: number) {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return header;
}

function concatBytes(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }

  return output;
}

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
