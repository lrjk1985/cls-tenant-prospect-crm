const supabaseUrl = "https://dnmfqcjownhzngjdngdi.supabase.co";
const supabasePublishableKey = "sb_publishable_hPwolXbHtAbRMoimb_PMuw_PSiYKZGC";
const storageBucket = "crm-files";
const maxAttachmentSize = 10 * 1024 * 1024;
const defaultTradeCategories = ["F&B", "F&B Takeaway", "Retail", "Office"];
const prospectStatusOptions = ["New", "Contacted", "Arranging Viewing", "Viewed", "Negotiating", "Closed"];
const tradeCategoryStorageKey = "tenantProspectCrmTradeCategories";
const defaultInteractionNotice = "Timestamp added automatically. Attachments up to 10 MB.";
const defaultUnitDocumentNotice = "Documents are saved securely in Supabase Storage. Keep files under 10 MB each.";
const defaultAgentInteractionNotice = "Timestamp added automatically.";
const dailyQuotes = [
  { text: "Brevity is the soul of wit.", author: "William Shakespeare", source: "Hamlet" },
  { text: "Sweet are the uses of adversity.", author: "William Shakespeare", source: "As You Like It" },
  { text: "All things are ready, if our minds be so.", author: "William Shakespeare", source: "Henry V" },
  { text: "What's past is prologue.", author: "William Shakespeare", source: "The Tempest" },
  { text: "Be not afraid of greatness.", author: "William Shakespeare", source: "Twelfth Night" },
  { text: "Our bodies are our gardens.", author: "William Shakespeare", source: "Othello" },
  { text: "Strong reasons make strong actions.", author: "William Shakespeare", source: "King John" },
  { text: "The readiness is all.", author: "William Shakespeare", source: "Hamlet" },
  { text: "Know your own happiness.", author: "Jane Austen", source: "Sense and Sensibility" },
  { text: "Time will explain.", author: "Jane Austen", source: "Persuasion" },
  { text: "Think only of the past as its remembrance gives you pleasure.", author: "Jane Austen", source: "Pride and Prejudice" },
  { text: "Friendship is certainly the finest balm.", author: "Jane Austen", source: "Northanger Abbey" },
  { text: "Never put off till tomorrow what you can do today.", author: "Charles Dickens", source: "David Copperfield" },
  { text: "Take nothing on its looks; take everything on evidence.", author: "Charles Dickens", source: "Great Expectations" },
  { text: "Reflect upon your present blessings.", author: "Charles Dickens", source: "A Christmas Carol" },
  { text: "Trust thyself: every heart vibrates to that iron string.", author: "Ralph Waldo Emerson", source: "Self-Reliance" },
  { text: "Nothing can bring you peace but yourself.", author: "Ralph Waldo Emerson", source: "Self-Reliance" },
  { text: "Simplify, simplify.", author: "Henry David Thoreau", source: "Walden" },
  { text: "The price of anything is the amount of life you exchange for it.", author: "Henry David Thoreau", source: "Walden" },
  { text: "Waste no more time disputing what a good man should be. Be one.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "Look within. Within is the fountain of good.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "Some things are in our control and others not.", author: "Epictetus", source: "The Enchiridion" },
  { text: "The cautious seldom err.", author: "Confucius", source: "The Analects" },
  { text: "To be fond of learning is to be near to knowledge.", author: "Confucius", source: "The Analects" },
  { text: "The journey of a thousand li commenced with a single step.", author: "Lao Tzu", source: "Tao Te Ching" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin", source: "Poor Richard's Almanack" },
  { text: "Diligence is the mother of good luck.", author: "Benjamin Franklin", source: "Poor Richard's Almanack" },
  { text: "Lost time is never found again.", author: "Benjamin Franklin", source: "The Autobiography of Benjamin Franklin" },
  { text: "Begin at the beginning.", author: "Lewis Carroll", source: "Alice's Adventures in Wonderland" },
  { text: "It's no use going back to yesterday.", author: "Lewis Carroll", source: "Alice's Adventures in Wonderland" },
  { text: "Tomorrow is a new day with no mistakes in it yet.", author: "L. M. Montgomery", source: "Anne of Green Gables" },
  { text: "Watch and pray, dear, never get tired of trying.", author: "Louisa May Alcott", source: "Little Women" },
  { text: "He that is down need fear no fall.", author: "John Bunyan", source: "The Pilgrim's Progress" },
  { text: "We learn from failure, not from success.", author: "Bram Stoker", source: "Dracula" },
  { text: "Nothing is so painful to the human mind as a great and sudden change.", author: "Mary Shelley", source: "Frankenstein" },
  { text: "I'll go to it laughing.", author: "Herman Melville", source: "Moby-Dick" },
  { text: "It is never too late to be wise.", author: "Daniel Defoe", source: "Robinson Crusoe" },
  { text: "Diligence is the mother of good fortune.", author: "Miguel de Cervantes", source: "Don Quixote" },
  { text: "To strive, to seek, to find, and not to yield.", author: "Alfred, Lord Tennyson", source: "Ulysses" },
  { text: "Let us, then, be up and doing.", author: "Henry Wadsworth Longfellow", source: "A Psalm of Life" },
  { text: "Energy is eternal delight.", author: "William Blake", source: "The Marriage of Heaven and Hell" },
  { text: "The mind is its own place.", author: "John Milton", source: "Paradise Lost" },
  { text: "I am large, I contain multitudes.", author: "Walt Whitman", source: "Leaves of Grass" },
  { text: "Excellence is to do a common thing in an uncommon way.", author: "Booker T. Washington", source: "Up from Slavery" },
  { text: "The world is full of obvious things.", author: "Arthur Conan Doyle", source: "The Hound of the Baskervilles" },
  { text: "There is nothing like staying at home for real comfort.", author: "Jane Austen", source: "Emma" },
  { text: "A faithful friend is a strong defence.", author: "The Apocrypha", source: "Ecclesiasticus" },
  { text: "A soft answer turneth away wrath.", author: "King James Bible", source: "Proverbs" },
  { text: "The soul should always stand ajar.", author: "Emily Dickinson", source: "Poems" },
  { text: "Hope is the thing with feathers.", author: "Emily Dickinson", source: "Poems" },
];
const cloudClient = globalThis.supabase?.createClient(supabaseUrl, supabasePublishableKey);

const state = {
  activeTab: "prospects",
  prospects: [],
  units: [],
  agents: [],
  users: [],
  tradeCategories: readStoredTradeCategories(),
  session: null,
  currentUser: null,
  currentProfile: null,
  selectedId: null,
  selectedUnitId: null,
  selectedAgentId: null,
  searchTerm: "",
  unitSearchTerm: "",
  agentSearchTerm: "",
  contactDate: "",
  contactYear: "",
  tradeFilter: "",
  statusFilter: "",
  showAllProspects: false,
  showAllAgents: false,
  isLoadingProspects: false,
  isLoadingUnits: false,
  isLoadingAgents: false,
  isLoadingTradeCategories: false,
  isLoadingUsers: false,
};

const defaultProspectLimit = 3;
const defaultAgentLimit = 3;
const mobileProspectLayoutQuery = window.matchMedia("(max-width: 960px)");
const uiState = {
  renderFrame: null,
};

const elements = {
  authScreen: document.querySelector("#authScreen"),
  authForm: document.querySelector("#authForm"),
  authEmailInput: document.querySelector("#authEmailInput"),
  authPasswordInput: document.querySelector("#authPasswordInput"),
  loginButton: document.querySelector("#loginButton"),
  signupButton: document.querySelector("#signupButton"),
  authNotice: document.querySelector("#authNotice"),
  authQuoteText: document.querySelector("#authQuoteText"),
  authQuoteSource: document.querySelector("#authQuoteSource"),
  appShell: document.querySelector("#appShell"),
  currentUserText: document.querySelector("#currentUserText"),
  topbarQuoteText: document.querySelector("#topbarQuoteText"),
  topbarQuoteSource: document.querySelector("#topbarQuoteSource"),
  logoutButton: document.querySelector("#logoutButton"),
  prospectsTabButton: document.querySelector("#prospectsTabButton"),
  unitsTabButton: document.querySelector("#unitsTabButton"),
  agentsTabButton: document.querySelector("#agentsTabButton"),
  adminTabButton: document.querySelector("#adminTabButton"),
  prospectsTabPanel: document.querySelector("#prospectsTabPanel"),
  unitsTabPanel: document.querySelector("#unitsTabPanel"),
  agentsTabPanel: document.querySelector("#agentsTabPanel"),
  adminTabPanel: document.querySelector("#adminTabPanel"),
  prospectTopbarActions: document.querySelector("#prospectTopbarActions"),
  unitTopbarActions: document.querySelector("#unitTopbarActions"),
  agentTopbarActions: document.querySelector("#agentTopbarActions"),
  newProspectButton: document.querySelector("#newProspectButton"),
  emptyNewButton: document.querySelector("#emptyNewButton"),
  newUnitButton: document.querySelector("#newUnitButton"),
  emptyNewUnitButton: document.querySelector("#emptyNewUnitButton"),
  newAgentButton: document.querySelector("#newAgentButton"),
  emptyNewAgentButton: document.querySelector("#emptyNewAgentButton"),
  importAgentsCsvButton: document.querySelector("#importAgentsCsvButton"),
  agentCsvFileInput: document.querySelector("#agentCsvFileInput"),
  exportAgentsCsvButton: document.querySelector("#exportAgentsCsvButton"),
  agentImportNotice: document.querySelector("#agentImportNotice"),
  importUnitsCsvButton: document.querySelector("#importUnitsCsvButton"),
  unitCsvFileInput: document.querySelector("#unitCsvFileInput"),
  unitImportNotice: document.querySelector("#unitImportNotice"),
  importCsvButton: document.querySelector("#importCsvButton"),
  csvFileInput: document.querySelector("#csvFileInput"),
  importNotice: document.querySelector("#importNotice"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  searchInput: document.querySelector("#searchInput"),
  showAllProspectsButton: document.querySelector("#showAllProspectsButton"),
  contactDateInput: document.querySelector("#contactDateInput"),
  contactYearInput: document.querySelector("#contactYearInput"),
  tradeFilterInput: document.querySelector("#tradeFilterInput"),
  statusFilterInput: document.querySelector("#statusFilterInput"),
  clearFiltersButton: document.querySelector("#clearFiltersButton"),
  prospectCount: document.querySelector("#prospectCount"),
  interactionCount: document.querySelector("#interactionCount"),
  prospectRail: document.querySelector("#prospectRail"),
  prospectList: document.querySelector("#prospectList"),
  prospectDetailPane: document.querySelector("#prospectDetailPane"),
  backToProspectListButton: document.querySelector("#backToProspectListButton"),
  emptyState: document.querySelector("#emptyState"),
  detailContent: document.querySelector("#detailContent"),
  prospectForm: document.querySelector("#prospectForm"),
  formTitle: document.querySelector("#formTitle"),
  nameInput: document.querySelector("#nameInput"),
  businessInput: document.querySelector("#businessInput"),
  agencyInput: document.querySelector("#agencyInput"),
  agentInput: document.querySelector("#agentInput"),
  buildingInput: document.querySelector("#buildingInput"),
  unitInput: document.querySelector("#unitInput"),
  tradeInput: document.querySelector("#tradeInput"),
  phoneInput: document.querySelector("#phoneInput"),
  emailInput: document.querySelector("#emailInput"),
  telegramInput: document.querySelector("#telegramInput"),
  websiteInput: document.querySelector("#websiteInput"),
  socialInput: document.querySelector("#socialInput"),
  statusInput: document.querySelector("#statusInput"),
  savedNotice: document.querySelector("#savedNotice"),
  saveProspectButton: document.querySelector("#saveProspectButton"),
  deleteProspectButton: document.querySelector("#deleteProspectButton"),
  interactionForm: document.querySelector("#interactionForm"),
  interactionInput: document.querySelector("#interactionInput"),
  interactionFileInput: document.querySelector("#interactionFileInput"),
  interactionNotice: document.querySelector("#interactionNotice"),
  timeline: document.querySelector("#timeline"),
  unitSearchInput: document.querySelector("#unitSearchInput"),
  unitCount: document.querySelector("#unitCount"),
  unitDocumentCount: document.querySelector("#unitDocumentCount"),
  unitList: document.querySelector("#unitList"),
  unitEmptyState: document.querySelector("#unitEmptyState"),
  unitDetailContent: document.querySelector("#unitDetailContent"),
  unitForm: document.querySelector("#unitForm"),
  unitFormTitle: document.querySelector("#unitFormTitle"),
  unitNumberInput: document.querySelector("#unitNumberInput"),
  unitPsfInput: document.querySelector("#unitPsfInput"),
  unitLastOperationInput: document.querySelector("#unitLastOperationInput"),
  unitAvailableInput: document.querySelector("#unitAvailableInput"),
  unitCurrentPriceInput: document.querySelector("#unitCurrentPriceInput"),
  unitMarketPriceInput: document.querySelector("#unitMarketPriceInput"),
  unitSavedNotice: document.querySelector("#unitSavedNotice"),
  saveUnitButton: document.querySelector("#saveUnitButton"),
  deleteUnitButton: document.querySelector("#deleteUnitButton"),
  unitDocumentsForm: document.querySelector("#unitDocumentsForm"),
  unitFloorPlanInput: document.querySelector("#unitFloorPlanInput"),
  unitMeInput: document.querySelector("#unitMeInput"),
  unitPhotosInput: document.querySelector("#unitPhotosInput"),
  unitDocumentNotice: document.querySelector("#unitDocumentNotice"),
  unitDocumentList: document.querySelector("#unitDocumentList"),
  agentSearchInput: document.querySelector("#agentSearchInput"),
  showAllAgentsButton: document.querySelector("#showAllAgentsButton"),
  agentCount: document.querySelector("#agentCount"),
  agentList: document.querySelector("#agentList"),
  agentEmptyState: document.querySelector("#agentEmptyState"),
  agentDetailContent: document.querySelector("#agentDetailContent"),
  agentForm: document.querySelector("#agentForm"),
  agentFormTitle: document.querySelector("#agentFormTitle"),
  agentNameInput: document.querySelector("#agentNameInput"),
  agentAgencyInput: document.querySelector("#agentAgencyInput"),
  agentPhoneInput: document.querySelector("#agentPhoneInput"),
  agentEmailInput: document.querySelector("#agentEmailInput"),
  agentTelegramInput: document.querySelector("#agentTelegramInput"),
  agentWebsiteInput: document.querySelector("#agentWebsiteInput"),
  agentSocialInput: document.querySelector("#agentSocialInput"),
  agentGradeInput: document.querySelector("#agentGradeInput"),
  agentSavedNotice: document.querySelector("#agentSavedNotice"),
  saveAgentButton: document.querySelector("#saveAgentButton"),
  deleteAgentButton: document.querySelector("#deleteAgentButton"),
  agentInteractionForm: document.querySelector("#agentInteractionForm"),
  agentInteractionInput: document.querySelector("#agentInteractionInput"),
  agentInteractionNotice: document.querySelector("#agentInteractionNotice"),
  agentTimeline: document.querySelector("#agentTimeline"),
  inviteUserForm: document.querySelector("#inviteUserForm"),
  inviteEmailInput: document.querySelector("#inviteEmailInput"),
  inviteNameInput: document.querySelector("#inviteNameInput"),
  inviteRoleInput: document.querySelector("#inviteRoleInput"),
  adminNotice: document.querySelector("#adminNotice"),
  tradeCategoryForm: document.querySelector("#tradeCategoryForm"),
  tradeCategoryInput: document.querySelector("#tradeCategoryInput"),
  tradeCategoryNotice: document.querySelector("#tradeCategoryNotice"),
  tradeCategoryList: document.querySelector("#tradeCategoryList"),
  userList: document.querySelector("#userList"),
  prospectItemTemplate: document.querySelector("#prospectItemTemplate"),
  timelineItemTemplate: document.querySelector("#timelineItemTemplate"),
  unitItemTemplate: document.querySelector("#unitItemTemplate"),
  agentItemTemplate: document.querySelector("#agentItemTemplate"),
  agentTimelineItemTemplate: document.querySelector("#agentTimelineItemTemplate"),
};

function cleanTradeCategory(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeTradeCategoryValue(value) {
  return cleanTradeCategory(value).toLowerCase();
}

function normalizeTradeCategoryRecord(category) {
  const source = category && typeof category === "object" ? category : { name: category };
  const name = cleanTradeCategory(source.name);

  if (!name) {
    return null;
  }

  return {
    id: source.id || null,
    name,
    isActive: source.is_active ?? source.isActive ?? true,
    createdBy: source.created_by || source.createdBy || "",
    createdAt: source.created_at || source.createdAt || "",
  };
}

function mergeTradeCategories(...categoryLists) {
  const categoriesByValue = new Map();

  categoryLists.flat().forEach((category) => {
    const record = normalizeTradeCategoryRecord(category);

    if (!record) {
      return;
    }

    categoriesByValue.set(normalizeTradeCategoryValue(record.name), {
      ...categoriesByValue.get(normalizeTradeCategoryValue(record.name)),
      ...record,
    });
  });

  return [...categoriesByValue.values()].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }

    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
  });
}

function readStoredTradeCategories() {
  try {
    const storedCategories = JSON.parse(localStorage.getItem(tradeCategoryStorageKey) || "[]");
    return mergeTradeCategories(defaultTradeCategories, Array.isArray(storedCategories) ? storedCategories : []);
  } catch {
    return mergeTradeCategories(defaultTradeCategories);
  }
}

function saveStoredTradeCategories() {
  try {
    localStorage.setItem(tradeCategoryStorageKey, JSON.stringify(state.tradeCategories));
  } catch {
    // Browser storage can be unavailable in restricted modes; the in-memory list still works for the session.
  }
}

async function loadProspects() {
  const [prospectsResult, interactionsResult] = await Promise.all([
    cloudClient.from("prospects").select("*").order("updated_at", { ascending: false }),
    cloudClient.from("prospect_interactions").select("*").order("created_at", { ascending: false }),
  ]);

  if (prospectsResult.error) {
    throw prospectsResult.error;
  }

  if (interactionsResult.error) {
    throw interactionsResult.error;
  }

  const interactionsByProspect = new Map();

  for (const interaction of interactionsResult.data || []) {
    const mappedInteraction = mapProspectInteractionFromDb(interaction);
    const list = interactionsByProspect.get(interaction.prospect_id) || [];
    list.push(mappedInteraction);
    interactionsByProspect.set(interaction.prospect_id, list);
  }

  state.prospects = (prospectsResult.data || []).map((prospect) => mapProspectFromDb(
    prospect,
    interactionsByProspect.get(prospect.id) || [],
  ));
  state.selectedId = state.prospects.some((prospect) => prospect.id === state.selectedId)
    ? state.selectedId
    : sortProspects(state.prospects)[0]?.id || null;
}

async function loadUnits() {
  const [unitsResult, documentsResult] = await Promise.all([
    cloudClient.from("units").select("*").order("updated_at", { ascending: false }),
    cloudClient.from("unit_documents").select("*").order("created_at", { ascending: false }),
  ]);

  if (unitsResult.error) {
    throw unitsResult.error;
  }

  if (documentsResult.error) {
    throw documentsResult.error;
  }

  const documentsByUnit = new Map();

  for (const document of documentsResult.data || []) {
    const attachment = mapUnitDocumentFromDb(document);
    const list = documentsByUnit.get(document.unit_id) || [];
    list.push(attachment);
    documentsByUnit.set(document.unit_id, list);
  }

  state.units = (unitsResult.data || []).map((unit) => mapUnitFromDb(
    unit,
    documentsByUnit.get(unit.id) || [],
  ));
  state.selectedUnitId = state.units.some((unit) => unit.id === state.selectedUnitId)
    ? state.selectedUnitId
    : sortUnits(state.units)[0]?.id || null;
}

async function loadAgents() {
  const [agentsResult, interactionsResult] = await Promise.all([
    cloudClient.from("agents").select("*").order("updated_at", { ascending: false }),
    cloudClient.from("agent_interactions").select("*").order("created_at", { ascending: false }),
  ]);

  if (agentsResult.error) {
    throw agentsResult.error;
  }

  if (interactionsResult.error) {
    throw interactionsResult.error;
  }

  const interactionsByAgent = new Map();

  for (const interaction of interactionsResult.data || []) {
    const list = interactionsByAgent.get(interaction.agent_id) || [];
    list.push(mapAgentInteractionFromDb(interaction));
    interactionsByAgent.set(interaction.agent_id, list);
  }

  state.agents = (agentsResult.data || []).map((agent) => mapAgentFromDb(
    agent,
    interactionsByAgent.get(agent.id) || [],
  ));
  state.selectedAgentId = state.agents.some((agent) => agent.id === state.selectedAgentId)
    ? state.selectedAgentId
    : sortAgents(state.agents)[0]?.id || null;
}

async function loadTradeCategories() {
  const { data, error } = await cloudClient
    .from("trade_categories")
    .select("id, name, is_active, created_by, created_at")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  const cloudCategories = (data || []).map((category) => ({
    id: category.id,
    name: category.name,
    isActive: category.is_active,
    createdBy: category.created_by || "",
    createdAt: category.created_at || "",
  }));
  state.tradeCategories = cloudCategories.length
    ? mergeTradeCategories(cloudCategories)
    : mergeTradeCategories(defaultTradeCategories);
  saveStoredTradeCategories();
}

async function saveProspects() {
  await syncProspectsToCloud();
}

async function saveUnits() {
  await syncUnitsToCloud();
}

async function saveAgents() {
  await syncAgentsToCloud();
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (character) =>
    (
      Number(character) ^
      (Math.random() * 16) >> (Number(character) / 4)
    ).toString(16),
  );
}

function nowIso() {
  return new Date().toISOString();
}

function requireCloudClient() {
  if (!cloudClient) {
    throw new Error("Supabase client is not available.");
  }
}

function cleanNumberValue(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function fileHref(attachment) {
  return attachment?.url || attachment?.dataUrl || "";
}

function hasFileReference(attachment) {
  return Boolean(fileHref(attachment) || attachment?.path);
}

function safeFileName(name) {
  return String(name || "file")
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    || "file";
}

async function createSignedUrl(path) {
  if (!path) {
    return "";
  }

  const { data, error } = await cloudClient.storage
    .from(storageBucket)
    .createSignedUrl(path, 60 * 60);

  if (error) {
    return "";
  }

  return data?.signedUrl || "";
}

function resolveFileUrl(attachment) {
  if (!attachment) {
    return Promise.resolve("");
  }

  if (attachment.url || attachment.dataUrl) {
    return Promise.resolve(fileHref(attachment));
  }

  if (!attachment.path) {
    return Promise.resolve("");
  }

  if (!attachment.urlPromise) {
    attachment.urlPromise = createSignedUrl(attachment.path).then((url) => {
      attachment.url = url;
      attachment.urlPromise = null;
      return url;
    });
  }

  return attachment.urlPromise;
}

async function uploadCloudFile(file, folder) {
  if (!file) {
    return null;
  }

  if (file.size > maxAttachmentSize) {
    throw new Error("file-too-large");
  }

  const id = createId();
  const path = `${folder}/${id}-${safeFileName(file.name)}`;
  const { error } = await cloudClient.storage
    .from(storageBucket)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return {
    id,
    path,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    url: await createSignedUrl(path),
  };
}

async function deleteCloudFile(path) {
  if (!path) {
    return;
  }

  await cloudClient.storage.from(storageBucket).remove([path]);
}

function prospectToDb(prospect) {
  return {
    id: prospect.id,
    name: prospect.name || "Unnamed prospect",
    business: prospect.business || "",
    agency: prospect.agency || "",
    agent: prospect.agent || "",
    building: prospect.building || "",
    unit: prospect.unit || "",
    trade: prospect.trade || "",
    phone: prospect.phone || "",
    email: prospect.email || "",
    telegram: prospect.telegram || "",
    website: prospect.website || "",
    social: prospect.social || "",
    status: normalizeStatus(prospect.status),
    created_by: prospect.createdBy || state.currentUser?.id || null,
    updated_by: state.currentUser?.id || null,
    created_at: prospect.createdAt || nowIso(),
    updated_at: prospect.updatedAt || nowIso(),
  };
}

function mapProspectFromDb(row, interactions = []) {
  return refreshProspectSearchCache({
    id: row.id,
    name: row.name || "",
    business: row.business || "",
    agency: row.agency || "",
    agent: row.agent || "",
    building: row.building || "",
    unit: row.unit || "",
    trade: row.trade || "",
    phone: row.phone || "",
    email: row.email || "",
    telegram: row.telegram || "",
    website: row.website || "",
    social: row.social || "",
    status: normalizeStatus(row.status),
    isDraft: false,
    createdBy: row.created_by || "",
    updatedBy: row.updated_by || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    interactions,
  });
}

function mapProspectInteractionFromDb(row) {
  const attachment = row.attachment_path
    ? {
        id: row.id,
        path: row.attachment_path,
        name: row.attachment_name || "Attachment",
        type: row.attachment_type || "application/octet-stream",
        size: row.attachment_size || 0,
      }
    : null;

  return {
    id: row.id,
    note: row.note || "",
    createdBy: row.created_by || "",
    createdAt: row.created_at,
    attachment,
  };
}

function unitToDb(unit) {
  return {
    id: unit.id,
    number: unit.number || "Unnamed unit",
    price_per_sqft: cleanNumberValue(unit.pricePerSqft),
    last_operation_date: unit.lastOperationDate || null,
    available_date: unit.availableDate || null,
    current_price: cleanNumberValue(unit.currentPrice),
    market_price: cleanNumberValue(unit.marketPrice),
    created_by: unit.createdBy || state.currentUser?.id || null,
    updated_by: state.currentUser?.id || null,
    created_at: unit.createdAt || nowIso(),
    updated_at: unit.updatedAt || nowIso(),
  };
}

function mapUnitFromDb(row, documents = []) {
  const groupedDocuments = createEmptyUnitDocuments();

  documents.forEach((document) => {
    if (document.documentType === "floorPlan") {
      groupedDocuments.floorPlan = document;
    } else if (document.documentType === "me") {
      groupedDocuments.me = document;
    } else if (document.documentType === "photo") {
      groupedDocuments.photos.push(document);
    }
  });

  return refreshUnitSearchCache({
    id: row.id,
    number: row.number || "",
    pricePerSqft: row.price_per_sqft ?? "",
    lastOperationDate: row.last_operation_date || "",
    availableDate: row.available_date || "",
    currentPrice: row.current_price ?? "",
    marketPrice: row.market_price ?? "",
    isDraft: false,
    createdBy: row.created_by || "",
    updatedBy: row.updated_by || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    documents: groupedDocuments,
  });
}

function mapUnitDocumentFromDb(row) {
  return {
    id: row.id,
    documentType: row.document_type,
    path: row.storage_path,
    name: row.name || "File",
    type: row.type || "application/octet-stream",
    size: row.size || 0,
    createdBy: row.created_by || "",
    createdAt: row.created_at,
  };
}

function agentToDb(agent) {
  return {
    id: agent.id,
    name: agent.name || "Unnamed agent",
    agency: agent.agency || "",
    phone: agent.phone || "",
    email: agent.email || "",
    telegram: agent.telegram || "",
    website: agent.website || "",
    social: agent.social || "",
    grade: normalizeAgentGrade(agent.grade),
    created_by: agent.createdBy || state.currentUser?.id || null,
    updated_by: state.currentUser?.id || null,
    created_at: agent.createdAt || nowIso(),
    updated_at: agent.updatedAt || nowIso(),
  };
}

function mapAgentFromDb(row, interactions = []) {
  return refreshAgentSearchCache({
    id: row.id,
    name: row.name || "",
    agency: row.agency || "",
    phone: row.phone || "",
    email: row.email || "",
    telegram: row.telegram || "",
    website: row.website || "",
    social: row.social || "",
    grade: normalizeAgentGrade(row.grade),
    isDraft: false,
    createdBy: row.created_by || "",
    updatedBy: row.updated_by || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    interactions,
  });
}

function mapAgentInteractionFromDb(row) {
  return {
    id: row.id,
    note: row.note || "",
    createdBy: row.created_by || "",
    createdAt: row.created_at,
  };
}

async function upsertProspectToCloud(prospect) {
  const { data, error } = await cloudClient
    .from("prospects")
    .upsert(prospectToDb(prospect), { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  Object.assign(prospect, mapProspectFromDb(data, prospect.interactions || []));
  return prospect;
}

async function upsertUnitToCloud(unit) {
  const { data, error } = await cloudClient
    .from("units")
    .upsert(unitToDb(unit), { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const documents = unit.documents || createEmptyUnitDocuments();
  Object.assign(unit, mapUnitFromDb(data, [
    documents.floorPlan,
    documents.me,
    ...(documents.photos || []),
  ].filter(Boolean)));
  return unit;
}

async function upsertAgentToCloud(agent) {
  const { data, error } = await cloudClient
    .from("agents")
    .upsert(agentToDb(agent), { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  Object.assign(agent, mapAgentFromDb(data, agent.interactions || []));
  return agent;
}

async function syncProspectsToCloud() {
  for (const prospect of state.prospects.filter((item) => !item.isDraft)) {
    await upsertProspectToCloud(prospect);

    for (const interaction of prospect.interactions || []) {
      const { error } = await cloudClient.from("prospect_interactions").upsert({
        id: interaction.id,
        prospect_id: prospect.id,
        note: interaction.note || "",
        attachment_path: interaction.attachment?.path || null,
        attachment_name: interaction.attachment?.name || null,
        attachment_type: interaction.attachment?.type || null,
        attachment_size: interaction.attachment?.size || null,
        created_by: interaction.createdBy || state.currentUser?.id || null,
        created_at: interaction.createdAt || nowIso(),
      }, { onConflict: "id" });

      if (error) {
        throw error;
      }
    }
  }
}

async function syncUnitsToCloud() {
  for (const unit of state.units.filter((item) => !item.isDraft)) {
    await upsertUnitToCloud(unit);
  }
}

async function syncAgentsToCloud() {
  for (const agent of state.agents.filter((item) => !item.isDraft)) {
    await upsertAgentToCloud(agent);

    for (const interaction of agent.interactions || []) {
      const { error } = await cloudClient.from("agent_interactions").upsert({
        id: interaction.id,
        agent_id: agent.id,
        note: interaction.note || "",
        created_by: interaction.createdBy || state.currentUser?.id || null,
        created_at: interaction.createdAt || nowIso(),
      }, { onConflict: "id" });

      if (error) {
        throw error;
      }
    }
  }
}

function formatDateTime(isoDate) {
  if (!isoDate) {
    return "No interactions yet";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "No interactions yet";
  }

  const dateText = formatDateForDisplay(isoDate);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${dateText}, ${hours}:${minutes}`;
}

function formatDateTimeForCsv(isoDate) {
  return isoDate ? formatDateTime(isoDate) : "";
}

function currentUserId() {
  return state.currentUser?.id || "";
}

function knownUserForId(userId) {
  if (!userId) {
    return null;
  }

  if (state.currentProfile?.id === userId) {
    return state.currentProfile;
  }

  return state.users.find((user) => user.id === userId) || null;
}

function userDisplayName(userId, { forExport = false } = {}) {
  if (!userId) {
    return "Unknown user";
  }

  const user = knownUserForId(userId);

  if (user) {
    return user.full_name || user.email || `User ${String(userId).slice(0, 8)}`;
  }

  if (userId === currentUserId()) {
    return forExport
      ? state.currentProfile?.email || state.currentUser?.email || "You"
      : "You";
  }

  return `User ${String(userId).slice(0, 8)}`;
}

function attributionLine(label, userId, isoDate) {
  const user = userDisplayName(userId);
  const date = formatDateTimeForCsv(isoDate);

  if (!userId && !date) {
    return "";
  }

  return `${label} by ${user}${date ? ` · ${date}` : ""}`;
}

function createAttributionElement(lines, className = "attribution-meta") {
  const cleanLines = lines.filter(Boolean);

  if (cleanLines.length === 0) {
    return null;
  }

  const container = document.createElement("div");
  container.className = className;

  cleanLines.forEach((line) => {
    const item = document.createElement("small");
    item.textContent = line;
    container.append(item);
  });

  return container;
}

function recordAttributionLines(record) {
  if (!record) {
    return [];
  }

  return [
    attributionLine("Created", record.createdBy, record.createdAt),
    attributionLine("Updated", record.updatedBy, record.updatedAt),
  ];
}

function renderRecordAttribution(form, record) {
  form.querySelector(".record-attribution")?.remove();

  const attribution = createAttributionElement(recordAttributionLines(record), "record-attribution");

  if (!attribution) {
    return;
  }

  form.querySelector(".form-heading")?.after(attribution);
}

function exportUserName(userId) {
  return userDisplayName(userId, { forExport: true });
}

function formatDateForInput(isoDate) {
  if (!isoDate) {
    return "";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(isoDate) {
  if (!isoDate) {
    return "";
  }

  const cleanDate = String(isoDate).trim();
  const isoMatch = cleanDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
  }

  const date = new Date(cleanDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}-${month}-${year}`;
}

function parseDisplayDate(value) {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) {
    return "";
  }

  const isoMatch = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    return cleanValue;
  }

  const displayMatch = cleanValue.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

  if (!displayMatch) {
    return "";
  }

  const day = Number(displayMatch[1]);
  const month = Number(displayMatch[2]);
  const year = Number(displayMatch[3]);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function formatYear(isoDate) {
  if (!isoDate) {
    return "";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return String(date.getFullYear());
}

function normalizeStatus(status) {
  const cleanStatus = String(status || "").trim();
  const statusMap = {
    "Viewing booked": "Arranging Viewing",
    "Application received": "Negotiating",
  };

  return statusMap[cleanStatus] || cleanStatus || "New";
}

function latestInteractionDate(prospect) {
  return prospect.interactions?.[0]?.createdAt || prospect.updatedAt || prospect.createdAt;
}

function latestAgentContactDate(agent) {
  return agent.interactions?.[0]?.createdAt || agent.updatedAt || agent.createdAt;
}

function normalizeAgentGrade(grade) {
  const cleanGrade = String(grade || "").trim();
  const gradeMap = {
    a: "A",
    b: "B",
    c: "C",
    watchlist: "Watchlist",
  };

  return gradeMap[cleanGrade.toLowerCase()] || cleanGrade || "B";
}

function agentGradeRank(grade) {
  const ranks = {
    A: 0,
    B: 1,
    C: 2,
    Watchlist: 3,
  };

  return ranks[normalizeAgentGrade(grade)] ?? 4;
}

function createEmptyUnitDocuments() {
  return {
    floorPlan: null,
    me: null,
    photos: [],
  };
}

function getSelectedProspect() {
  return state.prospects.find((prospect) => prospect.id === state.selectedId) || null;
}

function getSelectedUnit() {
  return state.units.find((unit) => unit.id === state.selectedUnitId) || null;
}

function getSelectedAgent() {
  return state.agents.find((agent) => agent.id === state.selectedAgentId) || null;
}

function prospectMergeKey(prospect) {
  return [
    prospect.name,
    prospect.business,
    prospect.agency,
    prospect.agent,
    prospect.building,
    prospect.unit,
    prospect.phone,
    prospect.email,
    prospect.telegram,
  ]
    .map((value) => String(value || "").toLowerCase())
    .join("|");
}

function agentMergeKey(agent) {
  return [
    agent.name,
    agent.agency,
    agent.phone,
    agent.email,
    agent.telegram,
  ]
    .map((value) => String(value || "").toLowerCase())
    .join("|");
}

function sortProspects(prospects) {
  return [...prospects].sort((a, b) => {
    const dateCompare = new Date(latestInteractionDate(b)) - new Date(latestInteractionDate(a));

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return (a.name || "").localeCompare(b.name || "");
  });
}

function sortUnits(units) {
  return [...units].sort((a, b) =>
    (a.number || "").localeCompare(b.number || "", undefined, { numeric: true, sensitivity: "base" }),
  );
}

function sortAgents(agents) {
  return [...agents].sort((a, b) => {
    const dateCompare = new Date(latestAgentContactDate(b)) - new Date(latestAgentContactDate(a));

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
  });
}

function formatMoney(value) {
  if (value === undefined || value === null || value === "") {
    return "No price entered";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: number % 1 === 0 ? 0 : 2,
  }).format(number);
}

function formatDateLabel(isoDate, emptyLabel = "No date entered") {
  if (!isoDate) {
    return emptyLabel;
  }

  return formatDateForDisplay(isoDate) || emptyLabel;
}

function interactionDateMatches(prospect, contactDate, contactYear) {
  if (!contactDate && !contactYear) {
    return true;
  }

  const interactions = prospect.interactions || [];

  return interactions.some((interaction) => {
    const interactionDate = formatDateForInput(interaction.createdAt);
    const interactionYear = formatYear(interaction.createdAt);
    const matchesDate = !contactDate || interactionDate === contactDate;
    const matchesYear = !contactYear || interactionYear === contactYear;

    return matchesDate && matchesYear;
  });
}

function prospectSearchText(prospect) {
  const interactionText = (prospect.interactions || [])
    .flatMap((interaction) => [
      interaction.note,
      interaction.attachment?.name,
      interaction.createdAt,
      formatDateForInput(interaction.createdAt),
      formatYear(interaction.createdAt),
      formatDateTime(interaction.createdAt),
      interaction.createdBy ? exportUserName(interaction.createdBy) : "",
    ])
    .join(" ");

  return [
    prospect.name,
    prospect.business,
    prospect.agency,
    prospect.agent,
    prospect.building,
    prospect.unit,
    prospect.trade,
    prospect.phone,
    prospect.email,
    prospect.telegram,
    prospect.website,
    prospect.social,
    normalizeStatus(prospect.status),
    prospect.createdBy ? exportUserName(prospect.createdBy) : "",
    prospect.updatedBy ? exportUserName(prospect.updatedBy) : "",
    interactionText,
  ]
    .join(" ")
    .toLowerCase();
}

function normalizeFilterValue(value) {
  return String(value || "").trim().toLowerCase();
}

function uniqueFilterOptions(field) {
  const optionsByValue = new Map();

  state.prospects.forEach((prospect) => {
    const label = String(prospect[field] || "").trim();
    const value = normalizeFilterValue(label);

    if (label && !optionsByValue.has(value)) {
      optionsByValue.set(value, label);
    }
  });

  return [...optionsByValue.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" }));
}

function tradeCategoryOptions({
  normalizedValues = false,
  includeInactive = false,
  includeUsedProspectTrades = false,
} = {}) {
  const categories = state.tradeCategories
    .filter((category) => includeInactive || category.isActive)
    .map((category) => category.name);
  const usedTrades = includeUsedProspectTrades ? state.prospects.map((prospect) => prospect.trade) : [];

  return mergeTradeCategories(categories, usedTrades).map((category) => ({
    value: normalizedValues ? normalizeFilterValue(category.name) : category.name,
    label: category.name,
  }));
}

function unitSearchText(unit) {
  const documents = unit.documents || createEmptyUnitDocuments();
  const documentText = [
    documents.floorPlan?.name,
    documents.floorPlan?.createdBy ? exportUserName(documents.floorPlan.createdBy) : "",
    documents.me?.name,
    documents.me?.createdBy ? exportUserName(documents.me.createdBy) : "",
    ...(documents.photos || []).map((photo) => photo.name),
    ...(documents.photos || []).map((photo) => photo.createdBy ? exportUserName(photo.createdBy) : ""),
  ].join(" ");

  return [
    unit.number,
    unit.pricePerSqft,
    unit.lastOperationDate,
    unit.availableDate,
    unit.currentPrice,
    unit.marketPrice,
    unit.createdBy ? exportUserName(unit.createdBy) : "",
    unit.updatedBy ? exportUserName(unit.updatedBy) : "",
    documentText,
  ]
    .join(" ")
    .toLowerCase();
}

function filteredUnits() {
  const term = state.unitSearchTerm.trim().toLowerCase();

  return sortUnits(
    state.units.filter((unit) => !term || unitCachedSearchText(unit).includes(term)),
  );
}

function agentSearchText(agent) {
  const interactionText = (agent.interactions || [])
    .flatMap((interaction) => [
      interaction.note,
      interaction.createdAt,
      formatDateTime(interaction.createdAt),
      interaction.createdBy ? exportUserName(interaction.createdBy) : "",
    ])
    .join(" ");

  return [
    agent.name,
    agent.agency,
    agent.phone,
    agent.email,
    agent.telegram,
    agent.website,
    agent.social,
    normalizeAgentGrade(agent.grade),
    agent.createdBy ? exportUserName(agent.createdBy) : "",
    agent.updatedBy ? exportUserName(agent.updatedBy) : "",
    interactionText,
  ]
    .join(" ")
    .toLowerCase();
}

function refreshProspectSearchCache(prospect) {
  prospect.searchText = prospectSearchText(prospect);
  return prospect;
}

function refreshUnitSearchCache(unit) {
  unit.searchText = unitSearchText(unit);
  return unit;
}

function refreshAgentSearchCache(agent) {
  agent.searchText = agentSearchText(agent);
  return agent;
}

function prospectCachedSearchText(prospect) {
  return prospect.searchText || refreshProspectSearchCache(prospect).searchText;
}

function unitCachedSearchText(unit) {
  return unit.searchText || refreshUnitSearchCache(unit).searchText;
}

function agentCachedSearchText(agent) {
  return agent.searchText || refreshAgentSearchCache(agent).searchText;
}

function refreshAllSearchCaches() {
  state.prospects.forEach(refreshProspectSearchCache);
  state.units.forEach(refreshUnitSearchCache);
  state.agents.forEach(refreshAgentSearchCache);
}

function filteredAgents() {
  const term = state.agentSearchTerm.trim().toLowerCase();

  return sortAgents(
    state.agents.filter((agent) => !term || agentCachedSearchText(agent).includes(term)),
  );
}

function visibleAgents() {
  const agents = filteredAgents();

  if (state.agentSearchTerm.trim() || state.showAllAgents) {
    return agents;
  }

  return agents.slice(0, defaultAgentLimit);
}

function filteredProspects() {
  const term = state.searchTerm.trim().toLowerCase();
  const contactDate = state.contactDate;
  const contactYear = state.contactYear.trim();
  const tradeFilter = state.tradeFilter;
  const statusFilter = state.statusFilter;

  return sortProspects(
    state.prospects.filter((prospect) => {
      const matchesSearch = !term || prospectCachedSearchText(prospect).includes(term);
      const matchesContactDate = interactionDateMatches(prospect, contactDate, contactYear);
      const matchesTrade = !tradeFilter || normalizeFilterValue(prospect.trade) === tradeFilter;
      const matchesStatus = !statusFilter || normalizeStatus(prospect.status) === statusFilter;

      return matchesSearch && matchesContactDate && matchesTrade && matchesStatus;
    }),
  );
}

function hasActiveSearchTerm() {
  return Boolean(state.searchTerm.trim());
}

function hasActiveDateFilter() {
  return Boolean(state.contactDate || state.contactYear.trim());
}

function hasActiveDetailFilter() {
  return Boolean(state.tradeFilter || state.statusFilter);
}

function shouldShowAllProspectMatches() {
  return hasActiveSearchTerm() || hasActiveDateFilter() || hasActiveDetailFilter();
}

function visibleProspects() {
  const prospects = filteredProspects();

  if (shouldShowAllProspectMatches() || state.showAllProspects) {
    return prospects;
  }

  return prospects.slice(0, defaultProspectLimit);
}

function setButtonBusy(button, isBusy, busyText = "Working...") {
  if (!button) {
    return;
  }

  if (isBusy) {
    button.dataset.idleText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
    button.classList.add("is-busy");
    button.setAttribute("aria-busy", "true");
    return;
  }

  if (button.dataset.idleText) {
    button.textContent = button.dataset.idleText;
    delete button.dataset.idleText;
  }

  button.disabled = false;
  button.classList.remove("is-busy");
  button.removeAttribute("aria-busy");
}

function markNoticeUpdated(element) {
  if (!element) {
    return;
  }

  element.classList.remove("notice-updated");
  void element.offsetWidth;
  element.classList.add("notice-updated");
}

function isLoadingMessage(message) {
  return /^(loading|saving|signing|creating|sending|updating|adding|importing|deleting|reactivating|deactivating)/i
    .test(String(message || "").trim());
}

function setNoticeText(element, message) {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.toggle("is-loading-message", isLoadingMessage(message));
  markNoticeUpdated(element);
}

function appendLoadingSkeleton(container, label, rows = 3) {
  const status = document.createElement("p");
  status.className = "sr-only";
  status.textContent = label;
  container.append(status);

  const stack = document.createElement("div");
  stack.className = "loading-stack";
  stack.setAttribute("aria-hidden", "true");

  for (let index = 0; index < rows; index += 1) {
    const item = document.createElement("div");
    item.className = "loading-card";
    stack.append(item);
  }

  container.append(stack);
}

function scheduleRender() {
  if (uiState.renderFrame) {
    return;
  }

  uiState.renderFrame = window.requestAnimationFrame(() => {
    uiState.renderFrame = null;
    render();
  });
}

function debounce(callback, delay = 140) {
  let timer = null;

  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

function quoteIndexForEvent(storageKey, excludeIndex = -1) {
  let previousIndex = -1;
  try {
    const storedIndex = localStorage.getItem(storageKey);
    previousIndex = storedIndex === null ? -1 : Number(storedIndex);
  } catch {
    previousIndex = -1;
  }

  let index = Math.floor(Math.random() * dailyQuotes.length);

  if (dailyQuotes.length > 1 && (index === previousIndex || index === excludeIndex)) {
    index = (index + 1) % dailyQuotes.length;
  }

  try {
    localStorage.setItem(storageKey, String(index));
  } catch {
    // Quote rotation still works without browser storage; it just cannot avoid the previous quote.
  }

  return index;
}

function renderQuote(textElement, sourceElement, quote) {
  if (!textElement || !sourceElement || !quote) {
    return;
  }

  textElement.textContent = `“${quote.text}”`;
  sourceElement.textContent = `${quote.author} · ${quote.source}`;
}

function renderDailyQuotes() {
  const authIndex = quoteIndexForEvent("tenantProspectCrmAuthQuoteIndex");
  const topbarIndex = quoteIndexForEvent("tenantProspectCrmTopbarQuoteIndex", authIndex);
  renderQuote(elements.authQuoteText, elements.authQuoteSource, dailyQuotes[authIndex]);
  renderQuote(elements.topbarQuoteText, elements.topbarQuoteSource, dailyQuotes[topbarIndex]);
}

function setNotice(message) {
  setNoticeText(elements.savedNotice, message);

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (elements.savedNotice.textContent === message) {
      setNoticeText(elements.savedNotice, "");
    }
  }, 2200);
}

function setImportNotice(message) {
  setNoticeText(elements.importNotice, message);

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (elements.importNotice.textContent === message) {
      setNoticeText(elements.importNotice, "");
    }
  }, 4200);
}

function setUnitImportNotice(message) {
  setNoticeText(elements.unitImportNotice, message);

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (elements.unitImportNotice.textContent === message) {
      setNoticeText(elements.unitImportNotice, "");
    }
  }, 4200);
}

function setAgentImportNotice(message) {
  setNoticeText(elements.agentImportNotice, message);

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (elements.agentImportNotice.textContent === message) {
      setNoticeText(elements.agentImportNotice, "");
    }
  }, 4200);
}

function setInteractionNotice(message) {
  setNoticeText(elements.interactionNotice, message || defaultInteractionNotice);

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (elements.interactionNotice.textContent === message) {
      setNoticeText(elements.interactionNotice, defaultInteractionNotice);
    }
  }, 3600);
}

function setUnitNotice(message) {
  setNoticeText(elements.unitSavedNotice, message);

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (elements.unitSavedNotice.textContent === message) {
      setNoticeText(elements.unitSavedNotice, "");
    }
  }, 2200);
}

function setAgentNotice(message) {
  setNoticeText(elements.agentSavedNotice, message);

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (elements.agentSavedNotice.textContent === message) {
      setNoticeText(elements.agentSavedNotice, "");
    }
  }, 2200);
}

function setTradeCategoryNotice(message) {
  setNoticeText(elements.tradeCategoryNotice, message);

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (elements.tradeCategoryNotice.textContent === message) {
      setNoticeText(elements.tradeCategoryNotice, "");
    }
  }, 2600);
}

function setUnitDocumentNotice(message) {
  setNoticeText(elements.unitDocumentNotice, message || defaultUnitDocumentNotice);

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (elements.unitDocumentNotice.textContent === message) {
      setNoticeText(elements.unitDocumentNotice, defaultUnitDocumentNotice);
    }
  }, 3600);
}

function setAgentInteractionNotice(message) {
  setNoticeText(elements.agentInteractionNotice, message || defaultAgentInteractionNotice);

  if (!message) {
    return;
  }

  window.setTimeout(() => {
    if (elements.agentInteractionNotice.textContent === message) {
      setNoticeText(elements.agentInteractionNotice, defaultAgentInteractionNotice);
    }
  }, 3600);
}

function errorText(error) {
  return String(error?.message || error || "").trim();
}

function isNetworkError(error) {
  return /failed to fetch|network|offline|timeout|load failed|internet|connection/i.test(errorText(error));
}

function isAuthError(error) {
  return /jwt|session|auth|token|expired|sign in|login/i.test(errorText(error));
}

function recoveryMessage(error, fallback, { localChangesVisible = false } = {}) {
  const message = errorText(error);
  const prefix = fallback || message || "Something went wrong.";

  if (isAuthError(error)) {
    return `${prefix} Your session may have expired. Refresh the page and sign in again.`;
  }

  if (isNetworkError(error)) {
    return localChangesVisible
      ? `${prefix} Your changes are still on this screen. Check your connection, then try saving again.`
      : `${prefix} Check your connection, then try again.`;
  }

  if (message && message !== prefix) {
    return `${prefix} ${message}`;
  }

  return localChangesVisible
    ? `${prefix} Your changes are still on this screen. Try again.`
    : prefix;
}

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readAttachment(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    if (file.size > maxAttachmentSize) {
      reject(new Error("file-too-large"));
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve({
        id: createId(),
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: String(reader.result || ""),
      });
    });

    reader.addEventListener("error", () => reject(new Error("file-read-failed")));
    reader.readAsDataURL(file);
  });
}

function createProspect() {
  const prospect = {
    id: createId(),
    name: "New prospect",
    business: "",
    agency: "",
    agent: "",
    building: "",
    unit: "",
    trade: "",
    phone: "",
    email: "",
    telegram: "",
    website: "",
    social: "",
    status: "New",
    isDraft: true,
    createdBy: currentUserId(),
    updatedBy: currentUserId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    interactions: [],
  };

  state.prospects.unshift(prospect);
  refreshProspectSearchCache(prospect);
  state.selectedId = prospect.id;
  render();
  scrollProspectDetailsIntoView();
  elements.nameInput.focus();
  elements.nameInput.select();
}

function createUnit() {
  const unit = {
    id: createId(),
    number: "New unit",
    pricePerSqft: "",
    lastOperationDate: "",
    availableDate: "",
    currentPrice: "",
    marketPrice: "",
    isDraft: true,
    createdBy: currentUserId(),
    updatedBy: currentUserId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    documents: createEmptyUnitDocuments(),
  };

  state.units.unshift(unit);
  refreshUnitSearchCache(unit);
  state.selectedUnitId = unit.id;
  state.activeTab = "units";
  render();
  elements.unitNumberInput.focus();
  elements.unitNumberInput.select();
}

function createAgent() {
  const agent = {
    id: createId(),
    name: "New agent",
    agency: "",
    phone: "",
    email: "",
    telegram: "",
    website: "",
    social: "",
    grade: "B",
    isDraft: true,
    createdBy: currentUserId(),
    updatedBy: currentUserId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    interactions: [],
  };

  state.agents.unshift(agent);
  refreshAgentSearchCache(agent);
  state.selectedAgentId = agent.id;
  state.activeTab = "agents";
  render();
  elements.agentNameInput.focus();
  elements.agentNameInput.select();
}

async function deleteSelectedProspect() {
  const prospect = getSelectedProspect();

  if (!prospect) {
    return;
  }

  const confirmed = window.confirm(`Delete ${prospect.name || "this prospect"} and all interactions?`);

  if (!confirmed) {
    return;
  }

  if (!prospect.isDraft) {
    for (const interaction of prospect.interactions || []) {
      await deleteCloudFile(interaction.attachment?.path);
    }

    const { error } = await cloudClient.from("prospects").delete().eq("id", prospect.id);

    if (error) {
      setNotice(recoveryMessage(error, "Could not delete prospect."));
      return;
    }
  }

  state.prospects = state.prospects.filter((item) => item.id !== prospect.id);
  state.selectedId = sortProspects(state.prospects)[0]?.id || null;
  render();
}

async function deleteSelectedUnit() {
  const unit = getSelectedUnit();

  if (!unit) {
    return;
  }

  const confirmed = window.confirm(`Delete Unit ${unit.number || "this unit"} and its files?`);

  if (!confirmed) {
    return;
  }

  if (!unit.isDraft) {
    const documents = unit.documents || createEmptyUnitDocuments();
    const attachments = [documents.floorPlan, documents.me, ...(documents.photos || [])].filter(Boolean);

    for (const attachment of attachments) {
      await deleteCloudFile(attachment.path);
    }

    const { error } = await cloudClient.from("units").delete().eq("id", unit.id);

    if (error) {
      setUnitNotice(recoveryMessage(error, "Could not delete unit."));
      return;
    }
  }

  state.units = state.units.filter((item) => item.id !== unit.id);
  state.selectedUnitId = sortUnits(state.units)[0]?.id || null;
  render();
}

async function deleteSelectedAgent() {
  const agent = getSelectedAgent();

  if (!agent) {
    return;
  }

  const confirmed = window.confirm(`Delete ${agent.name || "this agent"} and all notes?`);

  if (!confirmed) {
    return;
  }

  if (!agent.isDraft) {
    const { error } = await cloudClient.from("agents").delete().eq("id", agent.id);

    if (error) {
      setAgentNotice(recoveryMessage(error, "Could not delete agent."));
      return;
    }
  }

  state.agents = state.agents.filter((item) => item.id !== agent.id);
  state.selectedAgentId = sortAgents(state.agents)[0]?.id || null;
  render();
}

async function updateSelectedProspect(formData) {
  const prospect = getSelectedProspect();

  if (!prospect) {
    return;
  }

  setButtonBusy(elements.saveProspectButton, true, "Saving...");
  prospect.name = formData.get("name").toString().trim() || "Unnamed prospect";
  prospect.business = formData.get("business").toString().trim();
  prospect.agency = formData.get("agency").toString().trim();
  prospect.agent = formData.get("agent").toString().trim();
  prospect.building = formData.get("building").toString().trim();
  prospect.unit = formData.get("unit").toString().trim();
  prospect.trade = formData.get("trade").toString().trim();
  prospect.phone = formData.get("phone").toString().trim();
  prospect.email = formData.get("email").toString().trim();
  prospect.telegram = formData.get("telegram").toString().trim();
  prospect.website = formData.get("website").toString().trim();
  prospect.social = formData.get("social").toString().trim();
  prospect.status = normalizeStatus(formData.get("status"));
  prospect.isDraft = false;
  prospect.updatedBy = currentUserId();
  prospect.updatedAt = nowIso();
  refreshProspectSearchCache(prospect);
  try {
    await upsertProspectToCloud(prospect);
  } catch (error) {
    setButtonBusy(elements.saveProspectButton, false);
    render();
    setNotice(recoveryMessage(error, "Could not save prospect.", { localChangesVisible: true }));
    return;
  }

  setButtonBusy(elements.saveProspectButton, false);
  render();
  setNotice("Prospect saved.");
}

async function updateSelectedUnit(formData) {
  const unit = getSelectedUnit();

  if (!unit) {
    return;
  }

  setButtonBusy(elements.saveUnitButton, true, "Saving...");
  unit.number = formData.get("number").toString().trim() || "Unnamed unit";
  unit.pricePerSqft = formData.get("pricePerSqft").toString().trim();
  unit.lastOperationDate = parseDisplayDate(formData.get("lastOperationDate")) || "";
  unit.availableDate = parseDisplayDate(formData.get("availableDate")) || "";
  unit.currentPrice = formData.get("currentPrice").toString().trim();
  unit.marketPrice = formData.get("marketPrice").toString().trim();
  unit.isDraft = false;
  unit.updatedBy = currentUserId();
  unit.updatedAt = nowIso();
  unit.documents = unit.documents || createEmptyUnitDocuments();
  refreshUnitSearchCache(unit);
  try {
    await upsertUnitToCloud(unit);
  } catch (error) {
    setButtonBusy(elements.saveUnitButton, false);
    render();
    setUnitNotice(recoveryMessage(error, "Could not save unit.", { localChangesVisible: true }));
    return;
  }

  setButtonBusy(elements.saveUnitButton, false);
  render();
  setUnitNotice("Unit saved.");
}

async function updateSelectedAgent(formData) {
  const agent = getSelectedAgent();

  if (!agent) {
    return;
  }

  setButtonBusy(elements.saveAgentButton, true, "Saving...");
  agent.name = formData.get("name").toString().trim() || "Unnamed agent";
  agent.agency = formData.get("agency").toString().trim();
  agent.phone = formData.get("phone").toString().trim();
  agent.email = formData.get("email").toString().trim();
  agent.telegram = formData.get("telegram").toString().trim();
  agent.website = formData.get("website").toString().trim();
  agent.social = formData.get("social").toString().trim();
  agent.grade = normalizeAgentGrade(formData.get("grade"));
  agent.isDraft = false;
  agent.updatedBy = currentUserId();
  agent.updatedAt = nowIso();
  agent.interactions = agent.interactions || [];
  refreshAgentSearchCache(agent);
  try {
    await upsertAgentToCloud(agent);
  } catch (error) {
    setButtonBusy(elements.saveAgentButton, false);
    render();
    setAgentNotice(recoveryMessage(error, "Could not save agent.", { localChangesVisible: true }));
    return;
  }

  setButtonBusy(elements.saveAgentButton, false);
  render();
  setAgentNotice("Agent saved.");
}

async function addInteraction(note, file) {
  const prospect = getSelectedProspect();
  const cleanNote = note.trim();
  const submitButton = elements.interactionForm.querySelector('button[type="submit"]');

  if (!prospect) {
    return;
  }

  if (!cleanNote && !file) {
    setInteractionNotice("Add a note or attach a file first.");
    return;
  }

  if (prospect.isDraft) {
    setInteractionNotice("Save the prospect before adding interactions.");
    return;
  }

  let attachment = null;
  setButtonBusy(submitButton, true, "Adding...");

  try {
    attachment = await uploadCloudFile(file, `prospects/${prospect.id}/interactions`);
  } catch (error) {
    const message =
      error.message === "file-too-large"
        ? `Attachment is too large. Please choose a file under ${formatFileSize(maxAttachmentSize)}.`
        : "Attachment could not be read.";
    setButtonBusy(submitButton, false);
    setInteractionNotice(message);
    return;
  }

  try {
    const { data, error } = await cloudClient.from("prospect_interactions").insert({
      prospect_id: prospect.id,
      note: cleanNote || "Attached file.",
      attachment_path: attachment?.path || null,
      attachment_name: attachment?.name || null,
      attachment_type: attachment?.type || null,
      attachment_size: attachment?.size || null,
      created_by: state.currentUser?.id || null,
      created_at: nowIso(),
    }).select().single();

    if (error) {
      throw error;
    }

    prospect.interactions = prospect.interactions || [];
    prospect.interactions.unshift(mapProspectInteractionFromDb(data));
    prospect.updatedBy = currentUserId();
    prospect.updatedAt = nowIso();
    refreshProspectSearchCache(prospect);
    await upsertProspectToCloud(prospect);
  } catch (error) {
    await deleteCloudFile(attachment?.path);
    setButtonBusy(submitButton, false);
    setInteractionNotice(recoveryMessage(error, "Interaction could not be saved."));
    return;
  }

  elements.interactionInput.value = "";
  elements.interactionFileInput.value = "";
  setButtonBusy(submitButton, false);
  setInteractionNotice("Interaction added.");
  render();
}

async function saveUnitDocuments() {
  const unit = getSelectedUnit();
  const floorPlanFile = elements.unitFloorPlanInput.files[0] || null;
  const meFile = elements.unitMeInput.files[0] || null;
  const photoFiles = Array.from(elements.unitPhotosInput.files || []);
  const submitButton = elements.unitDocumentsForm.querySelector('button[type="submit"]');

  if (!unit) {
    return;
  }

  if (!floorPlanFile && !meFile && photoFiles.length === 0) {
    setUnitDocumentNotice("Choose a PDF or photo first.");
    return;
  }

  if (unit.isDraft) {
    setUnitDocumentNotice("Save the unit before adding files.");
    return;
  }

  const previousDocuments = JSON.parse(JSON.stringify(unit.documents || createEmptyUnitDocuments()));
  const documents = unit.documents || createEmptyUnitDocuments();
  documents.photos = documents.photos || [];
  const uploadedAttachments = [];
  setButtonBusy(submitButton, true, "Saving...");

  try {
    const floorPlan = await uploadCloudFile(floorPlanFile, `units/${unit.id}/floor-plan`);
    const me = await uploadCloudFile(meFile, `units/${unit.id}/me`);
    const photos = await Promise.all(photoFiles.map((file) => uploadCloudFile(file, `units/${unit.id}/photos`)));
    uploadedAttachments.push(...[floorPlan, me, ...photos].filter(Boolean));

    if (floorPlan) {
      if (documents.floorPlan?.path) {
        await cloudClient.from("unit_documents").delete().eq("id", documents.floorPlan.id);
        await deleteCloudFile(documents.floorPlan.path);
      }
      documents.floorPlan = await insertUnitDocument(unit.id, "floorPlan", floorPlan);
    }

    if (me) {
      if (documents.me?.path) {
        await cloudClient.from("unit_documents").delete().eq("id", documents.me.id);
        await deleteCloudFile(documents.me.path);
      }
      documents.me = await insertUnitDocument(unit.id, "me", me);
    }

    for (const photo of photos.filter(Boolean)) {
      documents.photos.push(await insertUnitDocument(unit.id, "photo", photo));
    }

    unit.documents = documents;
    unit.updatedBy = currentUserId();
    unit.updatedAt = nowIso();
    refreshUnitSearchCache(unit);
    await upsertUnitToCloud(unit);
  } catch (error) {
    for (const attachment of uploadedAttachments) {
      await deleteCloudFile(attachment.path);
    }
    unit.documents = previousDocuments;
    const message =
      error.message === "file-too-large"
        ? `One file is too large. Please choose files under ${formatFileSize(maxAttachmentSize)} each.`
        : recoveryMessage(error, "Those files could not be saved.");
    setButtonBusy(submitButton, false);
    setUnitDocumentNotice(message);
    return;
  }

  elements.unitFloorPlanInput.value = "";
  elements.unitMeInput.value = "";
  elements.unitPhotosInput.value = "";
  setButtonBusy(submitButton, false);
  setUnitDocumentNotice("Files saved.");
  render();
}

async function addAgentInteraction(note) {
  const agent = getSelectedAgent();
  const cleanNote = note.trim();
  const submitButton = elements.agentInteractionForm.querySelector('button[type="submit"]');

  if (!agent) {
    return;
  }

  if (!cleanNote) {
    setAgentInteractionNotice("Add a note first.");
    return;
  }

  if (agent.isDraft) {
    setAgentInteractionNotice("Save the agent before adding notes.");
    return;
  }

  setButtonBusy(submitButton, true, "Adding...");
  const { data, error } = await cloudClient.from("agent_interactions").insert({
    agent_id: agent.id,
    note: cleanNote,
    created_by: state.currentUser?.id || null,
    created_at: nowIso(),
  }).select().single();

  if (error) {
    setButtonBusy(submitButton, false);
    setAgentInteractionNotice(recoveryMessage(error, "Note could not be saved."));
    return;
  }

  agent.interactions = agent.interactions || [];
  agent.interactions.unshift(mapAgentInteractionFromDb(data));
  agent.updatedBy = currentUserId();
  agent.updatedAt = nowIso();
  refreshAgentSearchCache(agent);

  try {
    await upsertAgentToCloud(agent);
  } catch (upsertError) {
    setButtonBusy(submitButton, false);
    setAgentInteractionNotice(recoveryMessage(upsertError, "Note was added, but the agent could not be updated.", { localChangesVisible: true }));
    return;
  }

  elements.agentInteractionInput.value = "";
  setButtonBusy(submitButton, false);
  setAgentInteractionNotice("Note added.");
  render();
}

async function deleteAgentInteraction(interactionId) {
  const agent = getSelectedAgent();

  if (!agent) {
    return;
  }

  const confirmed = window.confirm("Delete this agent note?");

  if (!confirmed) {
    return;
  }

  const { error } = await cloudClient.from("agent_interactions").delete().eq("id", interactionId);

  if (error) {
    setAgentInteractionNotice(recoveryMessage(error, "Could not delete note."));
    return;
  }

  agent.interactions = (agent.interactions || []).filter((interaction) => interaction.id !== interactionId);
  agent.updatedBy = currentUserId();
  agent.updatedAt = nowIso();
  refreshAgentSearchCache(agent);
  await upsertAgentToCloud(agent);
  render();
}

async function insertUnitDocument(unitId, documentType, attachment) {
  const { data, error } = await cloudClient.from("unit_documents").insert({
    unit_id: unitId,
    document_type: documentType,
    storage_path: attachment.path,
    name: attachment.name,
    type: attachment.type,
    size: attachment.size,
    created_by: state.currentUser?.id || null,
  }).select().single();

  if (error) {
    throw error;
  }

  return mapUnitDocumentFromDb(data);
}

async function deleteUnitDocument(type, documentId) {
  const unit = getSelectedUnit();

  if (!unit) {
    return;
  }

  unit.documents = unit.documents || createEmptyUnitDocuments();
  let removedAttachment = null;

  if (type === "floorPlan") {
    removedAttachment = unit.documents.floorPlan;
    unit.documents.floorPlan = null;
  } else if (type === "me") {
    removedAttachment = unit.documents.me;
    unit.documents.me = null;
  } else if (type === "photo") {
    removedAttachment = (unit.documents.photos || []).find((photo) => photo.id === documentId);
    unit.documents.photos = (unit.documents.photos || []).filter((photo) => photo.id !== documentId);
  }

  if (removedAttachment?.id) {
    const { error } = await cloudClient.from("unit_documents").delete().eq("id", removedAttachment.id);

    if (error) {
      setUnitDocumentNotice(recoveryMessage(error, "Could not delete file."));
      return;
    }

    await deleteCloudFile(removedAttachment.path);
  }

  unit.updatedAt = nowIso();
  unit.updatedBy = currentUserId();
  refreshUnitSearchCache(unit);
  await upsertUnitToCloud(unit);
  render();
}

async function deleteInteraction(interactionId) {
  const prospect = getSelectedProspect();

  if (!prospect) {
    return;
  }

  const interaction = prospect.interactions.find((item) => item.id === interactionId);
  const confirmationMessage = interaction?.attachment
    ? "Delete this interaction and its attachment?"
    : "Delete this interaction?";
  const confirmed = window.confirm(confirmationMessage);

  if (!confirmed) {
    return;
  }

  const { error } = await cloudClient.from("prospect_interactions").delete().eq("id", interactionId);

  if (error) {
    setInteractionNotice(recoveryMessage(error, "Could not delete interaction."));
    return;
  }

  await deleteCloudFile(interaction?.attachment?.path);
  prospect.interactions = prospect.interactions.filter((item) => item.id !== interactionId);
  prospect.updatedBy = currentUserId();
  prospect.updatedAt = nowIso();
  refreshProspectSearchCache(prospect);
  await upsertProspectToCloud(prospect);
  render();
}

function isMobileProspectLayout() {
  return mobileProspectLayoutQuery.matches;
}

function scrollProspectPanelIntoView(panel) {
  if (!panel || state.activeTab !== "prospects" || !isMobileProspectLayout()) {
    return;
  }

  requestAnimationFrame(() => {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function scrollProspectDetailsIntoView() {
  scrollProspectPanelIntoView(elements.prospectDetailPane);
}

function scrollProspectListIntoView() {
  scrollProspectPanelIntoView(elements.prospectRail);
}

function renderListToggleButton(button, expanded, total, limit) {
  if (!button) {
    return;
  }

  button.textContent = expanded ? `Show Latest ${limit}` : "Show All";
  button.setAttribute("aria-pressed", String(expanded));
  button.disabled = total <= limit && !expanded;
}

function updateActiveListItem(list, selectedId) {
  list.querySelectorAll(".prospect-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.recordId === selectedId);
  });
}

function selectProspect(prospectId) {
  if (state.selectedId === prospectId) {
    scrollProspectDetailsIntoView();
    return;
  }

  state.selectedId = prospectId;
  updateActiveListItem(elements.prospectList, prospectId);
  const selected = getSelectedProspect();
  renderForm(selected);
  renderTimeline(selected);
  scrollProspectDetailsIntoView();
}

function selectUnit(unitId) {
  if (state.selectedUnitId === unitId) {
    return;
  }

  state.selectedUnitId = unitId;
  updateActiveListItem(elements.unitList, unitId);
  const selectedUnit = getSelectedUnit();
  renderUnitForm(selectedUnit);
  renderUnitDocuments(selectedUnit);
}

function selectAgent(agentId) {
  if (state.selectedAgentId === agentId) {
    return;
  }

  state.selectedAgentId = agentId;
  updateActiveListItem(elements.agentList, agentId);
  const selectedAgent = getSelectedAgent();
  renderAgentForm(selectedAgent);
  renderAgentTimeline(selectedAgent);
}

function renderProspectList() {
  const prospects = visibleProspects();
  const filteredCount = filteredProspects().length;
  const previousScrollTop = elements.prospectList.scrollTop;
  elements.prospectList.replaceChildren();
  renderListToggleButton(elements.showAllProspectsButton, state.showAllProspects, filteredCount, defaultProspectLimit);

  if (prospects.length === 0) {
    if (state.isLoadingProspects) {
      appendLoadingSkeleton(elements.prospectList, "Loading prospects...");
      elements.prospectList.scrollTop = previousScrollTop;
      return;
    }

    const empty = document.createElement("p");
    empty.className = "saved-notice";
    empty.textContent = state.prospects.length ? "No prospects match your filters." : "No prospects yet.";
    elements.prospectList.append(empty);
    elements.prospectList.scrollTop = previousScrollTop;
    return;
  }

  prospects.forEach((prospect) => {
    const item = elements.prospectItemTemplate.content.firstElementChild.cloneNode(true);
    item.dataset.recordId = prospect.id;
    item.classList.toggle("active", prospect.id === state.selectedId);
    item.querySelector('[data-field="name"]').textContent = prospect.name || "Unnamed prospect";
    item.querySelector('[data-field="business"]').textContent = prospect.business || prospect.phone || "No business entered";
    item.querySelector('[data-field="status"]').textContent = normalizeStatus(prospect.status);
    item.querySelector('[data-field="lastContact"]').textContent = formatDateTime(prospect.interactions?.[0]?.createdAt);
    item.addEventListener("click", () => {
      selectProspect(prospect.id);
    });
    elements.prospectList.append(item);
  });

  if (!shouldShowAllProspectMatches() && !state.showAllProspects && filteredCount > defaultProspectLimit) {
    const hint = document.createElement("p");
    hint.className = "list-hint";
    hint.textContent = `Showing the ${defaultProspectLimit} latest prospects. Use search, filters, or Show All to find the rest.`;
    elements.prospectList.append(hint);
  }

  if (!shouldShowAllProspectMatches() && state.showAllProspects && filteredCount > defaultProspectLimit) {
    const hint = document.createElement("p");
    hint.className = "list-hint";
    hint.textContent = `Showing all ${filteredCount} prospects.`;
    elements.prospectList.append(hint);
  }

  elements.prospectList.scrollTop = previousScrollTop;
}

function renderSelectOptions(select, defaultLabel, options, selectedValue) {
  select.replaceChildren();

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = defaultLabel;
  select.append(defaultOption);

  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    select.append(item);
  });

  select.value = selectedValue;
  return select.value;
}

function ensureSelectOption(select, value) {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) {
    return;
  }

  const optionExists = [...select.options].some((option) => option.value === cleanValue);

  if (optionExists) {
    return;
  }

  const option = document.createElement("option");
  option.value = cleanValue;
  option.textContent = cleanValue;
  select.append(option);
}

function renderFilterOptions() {
  state.tradeFilter = renderSelectOptions(
    elements.tradeFilterInput,
    "All trades",
    tradeCategoryOptions({ normalizedValues: true, includeInactive: true, includeUsedProspectTrades: true }),
    state.tradeFilter,
  );
  state.statusFilter = renderSelectOptions(
    elements.statusFilterInput,
    "All statuses",
    prospectStatusOptions.map((status) => ({ value: status, label: status })),
    state.statusFilter,
  );
}

function renderUnitList() {
  const units = filteredUnits();
  elements.unitList.replaceChildren();

  if (units.length === 0) {
    if (state.isLoadingUnits) {
      appendLoadingSkeleton(elements.unitList, "Loading units...");
      return;
    }

    const empty = document.createElement("p");
    empty.className = "saved-notice";
    empty.textContent = state.units.length ? "No units match your search." : "No units yet.";
    elements.unitList.append(empty);
    return;
  }

  units.forEach((unit) => {
    const item = elements.unitItemTemplate.content.firstElementChild.cloneNode(true);
    item.dataset.recordId = unit.id;
    item.classList.toggle("active", unit.id === state.selectedUnitId);
    item.querySelector('[data-field="number"]').textContent = unit.number || "Unnamed unit";
    item.querySelector('[data-field="availableDate"]').textContent = unit.availableDate
      ? `Available ${formatDateLabel(unit.availableDate)}`
      : "No available date";
    item.querySelector('[data-field="currentPrice"]').textContent = formatMoney(unit.currentPrice);
    item.querySelector('[data-field="updatedAt"]').textContent = `Updated ${formatDateTime(unit.updatedAt)}`;
    item.addEventListener("click", () => {
      selectUnit(unit.id);
    });
    elements.unitList.append(item);
  });
}

function renderUnitStats() {
  const totalDocuments = state.units.reduce((count, unit) => {
    const documents = unit.documents || createEmptyUnitDocuments();
    return count + (documents.floorPlan ? 1 : 0) + (documents.me ? 1 : 0) + (documents.photos?.length || 0);
  }, 0);

  elements.unitCount.textContent = state.units.length;
  elements.unitDocumentCount.textContent = totalDocuments;
}

function renderUnitForm(unit) {
  if (!unit) {
    elements.unitEmptyState.classList.remove("hidden");
    elements.unitDetailContent.classList.add("hidden");
    return;
  }

  elements.unitEmptyState.classList.add("hidden");
  elements.unitDetailContent.classList.remove("hidden");
  elements.unitFormTitle.textContent = unit.number || "Unnamed unit";
  elements.unitNumberInput.value = unit.number || "";
  elements.unitPsfInput.value = unit.pricePerSqft || "";
  elements.unitLastOperationInput.value = formatDateForDisplay(unit.lastOperationDate);
  elements.unitAvailableInput.value = formatDateForDisplay(unit.availableDate);
  elements.unitCurrentPriceInput.value = unit.currentPrice || "";
  elements.unitMarketPriceInput.value = unit.marketPrice || "";
  elements.saveUnitButton.textContent = unit.isDraft ? "Save Unit" : "Update Unit";
  renderRecordAttribution(elements.unitForm, unit);
}

function createDocumentCard(title, attachment, deleteType) {
  const card = document.createElement("article");
  card.className = "document-card";

  const heading = document.createElement("div");
  heading.className = "document-card-heading";

  const titleElement = document.createElement("strong");
  titleElement.textContent = title;
  heading.append(titleElement);

  if (hasFileReference(attachment)) {
    const deleteButton = document.createElement("button");
    deleteButton.className = "link-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteUnitDocument(deleteType, attachment.id));
    heading.append(deleteButton);
  }

  card.append(heading);

  if (!hasFileReference(attachment)) {
    const empty = document.createElement("p");
    empty.className = "document-empty";
    empty.textContent = "No file attached.";
    card.append(empty);
    return card;
  }

  const link = document.createElement("a");
  link.className = "attachment-link";
  link.download = attachment.name || title;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = `${attachment.name || title} (${formatFileSize(attachment.size)})`;
  const existingHref = fileHref(attachment);
  if (existingHref) {
    link.href = existingHref;
  } else {
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.textContent = `Preparing ${attachment.name || title}...`;
    resolveFileUrl(attachment).then((url) => {
      if (!url) {
        link.textContent = `${attachment.name || title} could not load`;
        return;
      }
      link.href = url;
      link.removeAttribute("aria-disabled");
      link.textContent = `${attachment.name || title} (${formatFileSize(attachment.size)})`;
    });
  }
  card.append(link);

  const attribution = createAttributionElement([
    attributionLine("Uploaded", attachment?.createdBy, attachment?.createdAt),
  ], "entry-attribution");

  if (attribution) {
    card.append(attribution);
  }

  return card;
}

function createPhotoCard(photo) {
  const card = createDocumentCard("Photo", photo, "photo");

  if (hasFileReference(photo)) {
    const image = document.createElement("img");
    image.alt = photo.name || "Unit photo";
    const existingHref = fileHref(photo);
    if (existingHref) {
      image.src = existingHref;
    } else {
      resolveFileUrl(photo).then((url) => {
        if (url) {
          image.src = url;
        }
      });
    }
    card.prepend(image);
  }

  return card;
}

function renderUnitDocuments(unit) {
  elements.unitDocumentList.replaceChildren();

  if (!unit) {
    return;
  }

  const documents = unit.documents || createEmptyUnitDocuments();
  const photos = documents.photos || [];

  elements.unitDocumentList.append(
    createDocumentCard("Unit Floor Plan", documents.floorPlan, "floorPlan"),
    createDocumentCard("Unit M&E", documents.me, "me"),
  );

  const photoSection = document.createElement("section");
  photoSection.className = "photo-section";

  const heading = document.createElement("div");
  heading.className = "document-card-heading";

  const title = document.createElement("strong");
  title.textContent = "Unit Photos";
  heading.append(title);
  photoSection.append(heading);

  if (photos.length === 0) {
    const empty = document.createElement("p");
    empty.className = "document-empty";
    empty.textContent = "No photos attached.";
    photoSection.append(empty);
  } else {
    const grid = document.createElement("div");
    grid.className = "photo-grid";
    photos.forEach((photo) => grid.append(createPhotoCard(photo)));
    photoSection.append(grid);
  }

  elements.unitDocumentList.append(photoSection);
}

function renderAgentList() {
  const agents = visibleAgents();
  const filteredCount = filteredAgents().length;
  elements.agentList.replaceChildren();
  renderListToggleButton(elements.showAllAgentsButton, state.showAllAgents, filteredCount, defaultAgentLimit);

  if (agents.length === 0) {
    if (state.isLoadingAgents) {
      appendLoadingSkeleton(elements.agentList, "Loading agents...");
      return;
    }

    const empty = document.createElement("p");
    empty.className = "saved-notice";
    empty.textContent = state.agents.length ? "No agents match your search." : "No agents yet.";
    elements.agentList.append(empty);
    return;
  }

  agents.forEach((agent) => {
    const item = elements.agentItemTemplate.content.firstElementChild.cloneNode(true);
    item.dataset.recordId = agent.id;
    item.classList.toggle("active", agent.id === state.selectedAgentId);
    item.querySelector('[data-field="name"]').textContent = agent.name || "Unnamed agent";
    item.querySelector('[data-field="agency"]').textContent = agent.agency || agent.phone || "No agency entered";
    item.querySelector('[data-field="grade"]').textContent = `Grade ${normalizeAgentGrade(agent.grade)}`;
    item.querySelector('[data-field="lastContact"]').textContent = agent.interactions?.[0]?.createdAt
      ? formatDateTime(agent.interactions[0].createdAt)
      : "No notes yet";
    item.addEventListener("click", () => {
      selectAgent(agent.id);
    });
    elements.agentList.append(item);
  });

  if (!state.agentSearchTerm.trim() && !state.showAllAgents && filteredCount > defaultAgentLimit) {
    const hint = document.createElement("p");
    hint.className = "list-hint";
    hint.textContent = `Showing the ${defaultAgentLimit} latest agents. Use search or Show All to find the rest.`;
    elements.agentList.append(hint);
  }

  if (!state.agentSearchTerm.trim() && state.showAllAgents && filteredCount > defaultAgentLimit) {
    const hint = document.createElement("p");
    hint.className = "list-hint";
    hint.textContent = `Showing all ${filteredCount} agents.`;
    elements.agentList.append(hint);
  }
}

function renderAgentStats() {
  elements.agentCount.textContent = state.agents.length;
}

function renderAgentForm(agent) {
  if (!agent) {
    elements.agentEmptyState.classList.remove("hidden");
    elements.agentDetailContent.classList.add("hidden");
    return;
  }

  elements.agentEmptyState.classList.add("hidden");
  elements.agentDetailContent.classList.remove("hidden");
  elements.agentFormTitle.textContent = agent.name || "Unnamed agent";
  elements.agentNameInput.value = agent.name || "";
  elements.agentAgencyInput.value = agent.agency || "";
  elements.agentPhoneInput.value = agent.phone || "";
  elements.agentEmailInput.value = agent.email || "";
  elements.agentTelegramInput.value = agent.telegram || "";
  elements.agentWebsiteInput.value = agent.website || "";
  elements.agentSocialInput.value = agent.social || "";
  elements.agentGradeInput.value = normalizeAgentGrade(agent.grade);
  elements.saveAgentButton.textContent = agent.isDraft ? "Save Agent" : "Update Agent";
  renderRecordAttribution(elements.agentForm, agent);
}

function renderAgentTimeline(agent) {
  elements.agentTimeline.replaceChildren();

  if (!agent) {
    return;
  }

  const interactions = agent.interactions || [];

  if (interactions.length === 0) {
    const empty = document.createElement("p");
    empty.className = "saved-notice";
    empty.textContent = "No agent notes recorded yet.";
    elements.agentTimeline.append(empty);
    return;
  }

  interactions.forEach((interaction) => {
    const item = elements.agentTimelineItemTemplate.content.firstElementChild.cloneNode(true);
    item.querySelector('[data-field="createdAt"]').textContent = formatDateTime(interaction.createdAt);
    item.querySelector('[data-field="note"]').textContent = interaction.note;
    const attribution = createAttributionElement([
      attributionLine("Added", interaction.createdBy, interaction.createdAt),
    ], "entry-attribution");
    if (attribution) {
      item.querySelector('[data-field="note"]').after(attribution);
    }
    item.querySelector('[data-action="delete-agent-interaction"]').addEventListener("click", () => {
      deleteAgentInteraction(interaction.id);
    });
    elements.agentTimeline.append(item);
  });
}

function renderStats() {
  const totalInteractions = state.prospects.reduce(
    (count, prospect) => count + (prospect.interactions?.length || 0),
    0,
  );

  elements.prospectCount.textContent = state.prospects.length;
  elements.interactionCount.textContent = totalInteractions;
}

function renderForm(prospect) {
  if (!prospect) {
    elements.emptyState.classList.remove("hidden");
    elements.detailContent.classList.add("hidden");
    return;
  }

  elements.emptyState.classList.add("hidden");
  elements.detailContent.classList.remove("hidden");
  elements.formTitle.textContent = prospect.name || "Unnamed prospect";
  elements.nameInput.value = prospect.name || "";
  elements.businessInput.value = prospect.business || "";
  elements.agencyInput.value = prospect.agency || "";
  elements.agentInput.value = prospect.agent || "";
  ensureSelectOption(elements.buildingInput, prospect.building);
  elements.buildingInput.value = prospect.building || "";
  elements.unitInput.value = prospect.unit || "";
  renderSelectOptions(elements.tradeInput, "Select trade", tradeCategoryOptions(), prospect.trade || "");
  ensureSelectOption(elements.tradeInput, prospect.trade);
  elements.tradeInput.value = prospect.trade || "";
  elements.phoneInput.value = prospect.phone || "";
  elements.emailInput.value = prospect.email || "";
  elements.telegramInput.value = prospect.telegram || "";
  elements.websiteInput.value = prospect.website || "";
  elements.socialInput.value = prospect.social || "";
  elements.statusInput.value = normalizeStatus(prospect.status);
  elements.saveProspectButton.textContent = prospect.isDraft ? "Save Prospect" : "Update Prospect";
  renderRecordAttribution(elements.prospectForm, prospect);
}

function renderTimeline(prospect) {
  elements.timeline.replaceChildren();

  if (!prospect) {
    return;
  }

  const interactions = prospect.interactions || [];

  if (interactions.length === 0) {
    const empty = document.createElement("p");
    empty.className = "saved-notice";
    empty.textContent = "No interactions recorded yet.";
    elements.timeline.append(empty);
    return;
  }

  interactions.forEach((interaction) => {
    const item = elements.timelineItemTemplate.content.firstElementChild.cloneNode(true);
    const attachmentLink = item.querySelector('[data-field="attachment"]');
    item.querySelector('[data-field="createdAt"]').textContent = formatDateTime(interaction.createdAt);
    item.querySelector('[data-field="note"]').textContent = interaction.note;
    const attribution = createAttributionElement([
      attributionLine("Added", interaction.createdBy, interaction.createdAt),
    ], "entry-attribution");
    if (attribution) {
      item.querySelector('[data-field="note"]').after(attribution);
    }
    if (hasFileReference(interaction.attachment)) {
      attachmentLink.classList.remove("hidden");
      attachmentLink.download = interaction.attachment.name || "attachment";
      attachmentLink.textContent = `${interaction.attachment.name || "Attachment"} (${formatFileSize(interaction.attachment.size)})`;
      const existingHref = fileHref(interaction.attachment);
      if (existingHref) {
        attachmentLink.href = existingHref;
      } else {
        attachmentLink.removeAttribute("href");
        attachmentLink.setAttribute("aria-disabled", "true");
        attachmentLink.textContent = `Preparing ${interaction.attachment.name || "attachment"}...`;
        resolveFileUrl(interaction.attachment).then((url) => {
          if (!url) {
            attachmentLink.textContent = `${interaction.attachment.name || "Attachment"} could not load`;
            return;
          }
          attachmentLink.href = url;
          attachmentLink.removeAttribute("aria-disabled");
          attachmentLink.textContent = `${interaction.attachment.name || "Attachment"} (${formatFileSize(interaction.attachment.size)})`;
        });
      }
    }
    item.querySelector('[data-action="delete-interaction"]').addEventListener("click", () => {
      deleteInteraction(interaction.id);
    });
    elements.timeline.append(item);
  });
}

function renderTabs() {
  const showingUnits = state.activeTab === "units";
  const showingAgents = state.activeTab === "agents";
  const showingAdmin = state.activeTab === "admin" && state.currentProfile?.role === "admin";
  const showingProspects = !showingUnits && !showingAgents && !showingAdmin;
  const isAdmin = state.currentProfile?.role === "admin";

  elements.prospectsTabButton.classList.toggle("active", showingProspects);
  elements.unitsTabButton.classList.toggle("active", showingUnits);
  elements.agentsTabButton.classList.toggle("active", showingAgents);
  elements.adminTabButton.classList.toggle("active", showingAdmin);
  elements.adminTabButton.classList.toggle("hidden", !isAdmin);
  elements.prospectsTabButton.setAttribute("aria-selected", String(showingProspects));
  elements.unitsTabButton.setAttribute("aria-selected", String(showingUnits));
  elements.agentsTabButton.setAttribute("aria-selected", String(showingAgents));
  elements.adminTabButton.setAttribute("aria-selected", String(showingAdmin));
  elements.prospectsTabPanel.classList.toggle("hidden", !showingProspects);
  elements.unitsTabPanel.classList.toggle("hidden", !showingUnits);
  elements.agentsTabPanel.classList.toggle("hidden", !showingAgents);
  elements.adminTabPanel.classList.toggle("hidden", !showingAdmin);
  elements.prospectTopbarActions.classList.toggle("hidden", !showingProspects);
  elements.unitTopbarActions.classList.toggle("hidden", !showingUnits);
  elements.agentTopbarActions.classList.toggle("hidden", !showingAgents);
}

function activeVisibleTab() {
  if (state.activeTab === "units") {
    return "units";
  }

  if (state.activeTab === "agents") {
    return "agents";
  }

  if (state.activeTab === "admin" && state.currentProfile?.role === "admin") {
    return "admin";
  }

  return "prospects";
}

function loadingStateAffectsVisibleTab(loadingKey) {
  const activeTab = activeVisibleTab();

  return (
    (loadingKey === "isLoadingProspects" && activeTab === "prospects")
    || (loadingKey === "isLoadingUnits" && activeTab === "units")
    || (loadingKey === "isLoadingAgents" && activeTab === "agents")
    || (loadingKey === "isLoadingTradeCategories" && (activeTab === "prospects" || activeTab === "admin"))
    || (loadingKey === "isLoadingUsers" && activeTab === "admin")
  );
}

function setActiveTab(tab) {
  if (tab === "admin" && state.currentProfile?.role !== "admin") {
    return;
  }

  state.activeTab = tab;
  render();
}

function renderAccount() {
  const email = state.currentUser?.email || "";
  const role = state.currentProfile?.role ? ` · ${state.currentProfile.role}` : "";
  elements.currentUserText.textContent = email ? `${email}${role}` : "";
}

function renderTradeCategoryList() {
  elements.tradeCategoryList.replaceChildren();

  if (state.currentProfile?.role !== "admin") {
    return;
  }

  if (state.isLoadingTradeCategories) {
    appendLoadingSkeleton(elements.tradeCategoryList, "Loading trade categories...", 2);
    return;
  }

  if (state.tradeCategories.length === 0) {
    const empty = document.createElement("p");
    empty.className = "saved-notice";
    empty.textContent = "No trade categories yet.";
    elements.tradeCategoryList.append(empty);
    return;
  }

  state.tradeCategories.forEach((category) => {
    const item = document.createElement("article");
    item.className = "category-card";
    item.classList.toggle("inactive", !category.isActive);

    const header = document.createElement("header");
    const name = document.createElement("strong");
    const status = document.createElement("span");
    name.textContent = category.name;
    status.className = `status-pill ${category.isActive ? "" : "inactive"}`.trim();
    status.textContent = category.isActive ? "Active" : "Inactive";
    header.append(name, status);

    const attribution = createAttributionElement([
      attributionLine("Added", category.createdBy, category.createdAt),
    ], "entry-attribution");

    const actions = document.createElement("div");
    actions.className = "category-actions";

    const toggleButton = document.createElement("button");
    toggleButton.className = "secondary-button compact-inline-button";
    toggleButton.type = "button";
    toggleButton.textContent = category.isActive ? "Deactivate" : "Reactivate";
    toggleButton.disabled = !category.id;
    toggleButton.addEventListener("click", () => {
      updateTradeCategoryStatus(category.id, !category.isActive);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "danger-button compact-inline-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.disabled = !category.id;
    deleteButton.addEventListener("click", () => {
      deleteTradeCategory(category.id, category.name);
    });

    actions.append(toggleButton, deleteButton);
    item.append(header);
    if (attribution) {
      item.append(attribution);
    }
    item.append(actions);
    elements.tradeCategoryList.append(item);
  });
}

function renderUsers() {
  elements.userList.replaceChildren();

  if (state.currentProfile?.role !== "admin") {
    return;
  }

  if (state.isLoadingUsers) {
    appendLoadingSkeleton(elements.userList, "Loading approved users...", 3);
    return;
  }

  if (state.users.length === 0) {
    const empty = document.createElement("p");
    empty.className = "saved-notice";
    empty.textContent = "No users found.";
    elements.userList.append(empty);
    return;
  }

  state.users.forEach((user) => {
    const card = document.createElement("article");
    card.className = "user-card";

    const header = document.createElement("header");
    const details = document.createElement("div");
    const name = document.createElement("strong");
    const email = document.createElement("small");
    const status = document.createElement("span");
    name.textContent = user.full_name || "Unnamed user";
    email.textContent = user.email || "";
    status.className = "status-pill";
    status.textContent = user.active ? "Active" : "Inactive";
    details.append(name, email);
    header.append(details, status);

    const controls = document.createElement("div");
    controls.className = "user-controls";

    const roleSelect = document.createElement("select");
    roleSelect.innerHTML = '<option value="member">Member</option><option value="admin">Admin</option>';
    roleSelect.value = user.role === "admin" ? "admin" : "member";

    const activeSelect = document.createElement("select");
    activeSelect.innerHTML = '<option value="true">Active</option><option value="false">Inactive</option>';
    activeSelect.value = String(Boolean(user.active));

    const updateButton = document.createElement("button");
    updateButton.className = "primary-button";
    updateButton.type = "button";
    updateButton.textContent = "Update";
    updateButton.addEventListener("click", () => updateUserAccess({
      userId: user.id,
      fullName: user.full_name || "",
      role: roleSelect.value,
      active: activeSelect.value === "true",
    }, updateButton));

    controls.append(roleSelect, activeSelect, updateButton);
    card.append(header, controls);
    elements.userList.append(card);
  });
}

function render() {
  const activeTab = activeVisibleTab();
  renderTabs();
  renderAccount();

  if (activeTab === "prospects") {
    const selected = getSelectedProspect();
    renderStats();
    renderFilterOptions();
    renderProspectList();
    renderForm(selected);
    renderTimeline(selected);
    return;
  }

  if (activeTab === "units") {
    const selectedUnit = getSelectedUnit();
    renderUnitStats();
    renderUnitList();
    renderUnitForm(selectedUnit);
    renderUnitDocuments(selectedUnit);
    return;
  }

  if (activeTab === "agents") {
    const selectedAgent = getSelectedAgent();
    renderAgentStats();
    renderAgentList();
    renderAgentForm(selectedAgent);
    renderAgentTimeline(selectedAgent);
    return;
  }

  renderTradeCategoryList();
  renderUsers();
}

function showSignedOut(message = "") {
  elements.authScreen.classList.remove("hidden");
  elements.appShell.classList.add("hidden");
  elements.appShell.classList.remove("is-loading-app");
  setNoticeText(elements.authNotice, message);
}

function showSignedIn() {
  elements.authScreen.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
}

async function loadCurrentProfile() {
  const { data, error } = await cloudClient
    .from("profiles")
    .select("id, email, full_name, role, active")
    .eq("id", state.currentUser.id)
    .single();

  if (error) {
    throw error;
  }

  state.currentProfile = data;
  return data;
}

async function loadAllCloudData() {
  const tasks = [
    loadCloudSection("isLoadingTradeCategories", loadTradeCategories, (error) => {
      setTradeCategoryNotice(recoveryMessage(error, "Could not load trade categories."));
    }),
    loadCloudSection("isLoadingProspects", loadProspects, (error) => {
      setNotice(recoveryMessage(error, "Could not load prospects."));
    }),
    loadCloudSection("isLoadingUnits", loadUnits, (error) => {
      setUnitNotice(recoveryMessage(error, "Could not load units."));
    }),
    loadCloudSection("isLoadingAgents", loadAgents, (error) => {
      setAgentNotice(recoveryMessage(error, "Could not load agents."));
    }),
  ];

  if (state.currentProfile?.role === "admin") {
    tasks.push(loadCloudSection("isLoadingUsers", loadUsers, (error) => {
      setNoticeText(elements.adminNotice, recoveryMessage(error, "Could not load users."));
    }));
  }

  await Promise.allSettled(tasks);
}

async function loadUsers() {
  const { data, error } = await cloudClient.functions.invoke("manage-users", {
    body: { action: "list" },
  });

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  state.users = data?.users || [];
  refreshAllSearchCaches();
}

async function loadCloudSection(loadingKey, loader, onError) {
  if (!state[loadingKey]) {
    state[loadingKey] = true;
    if (loadingStateAffectsVisibleTab(loadingKey)) {
      scheduleRender();
    }
  }

  try {
    await loader();
  } catch (error) {
    onError(error);
  } finally {
    if (state[loadingKey]) {
      state[loadingKey] = false;
      if (loadingStateAffectsVisibleTab(loadingKey)) {
        scheduleRender();
      }
    }
  }
}

async function refreshAppData() {
  try {
    elements.appShell.classList.add("is-loading-app");
    await loadCurrentProfile();

    if (!state.currentProfile.active) {
      state.prospects = [];
      state.units = [];
      state.agents = [];
      state.users = [];
      state.isLoadingProspects = false;
      state.isLoadingUnits = false;
      state.isLoadingAgents = false;
      state.isLoadingTradeCategories = false;
      state.isLoadingUsers = false;
      showSignedOut("Your account exists, but access has not been approved yet.");
      return;
    }

    state.isLoadingProspects = true;
    state.isLoadingUnits = true;
    state.isLoadingAgents = true;
    state.isLoadingTradeCategories = true;
    state.isLoadingUsers = state.currentProfile?.role === "admin";
    showSignedIn();
    render();
    void loadAllCloudData().finally(() => {
      elements.appShell.classList.remove("is-loading-app");
    });
  } catch (error) {
    elements.appShell.classList.remove("is-loading-app");
    showSignedOut(recoveryMessage(error, "Could not load the CRM."));
  }
}

async function handleLogin(formData) {
  const email = formData.get("email").toString().trim();
  const password = formData.get("password").toString();
  setNoticeText(elements.authNotice, "Signing in...");
  setButtonBusy(elements.loginButton, true, "Signing in...");

  const { data, error } = await cloudClient.auth.signInWithPassword({ email, password });

  if (error) {
    setButtonBusy(elements.loginButton, false);
    setNoticeText(elements.authNotice, recoveryMessage(error, "Could not sign in."));
    return;
  }

  state.session = data.session;
  state.currentUser = data.user;
  renderDailyQuotes();
  await refreshAppData();
  setButtonBusy(elements.loginButton, false);
}

async function handleSignup() {
  const email = elements.authEmailInput.value.trim();
  const password = elements.authPasswordInput.value;

  if (!email || !password) {
    setNoticeText(elements.authNotice, "Enter an email and password first.");
    return;
  }

  setNoticeText(elements.authNotice, "Creating account...");
  setButtonBusy(elements.signupButton, true, "Creating...");
  const { data, error } = await cloudClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: email.split("@")[0] },
    },
  });

  if (error) {
    setButtonBusy(elements.signupButton, false);
    setNoticeText(elements.authNotice, recoveryMessage(error, "Could not create account."));
    return;
  }

  if (data.session && data.user) {
    state.session = data.session;
    state.currentUser = data.user;
    renderDailyQuotes();
    await refreshAppData();
    setButtonBusy(elements.signupButton, false);
    return;
  }

  setButtonBusy(elements.signupButton, false);
  setNoticeText(elements.authNotice, "Check your email to confirm the account, then log in.");
}

async function handleLogout() {
  await cloudClient.auth.signOut();
  state.session = null;
  state.currentUser = null;
  state.currentProfile = null;
  state.users = [];
  state.prospects = [];
  state.units = [];
  state.agents = [];
  state.isLoadingProspects = false;
  state.isLoadingUnits = false;
  state.isLoadingAgents = false;
  state.isLoadingTradeCategories = false;
  state.isLoadingUsers = false;
  showSignedOut("");
}

async function inviteUser(formData) {
  const email = formData.get("email").toString().trim();
  const fullName = formData.get("fullName").toString().trim();
  const role = formData.get("role").toString();
  const submitButton = elements.inviteUserForm.querySelector('button[type="submit"]');
  setNoticeText(elements.adminNotice, "Sending invite...");
  setButtonBusy(submitButton, true, "Sending...");

  try {
    const { data, error } = await cloudClient.functions.invoke("manage-users", {
      body: {
        action: "invite",
        email,
        fullName,
        role,
        redirectTo: globalThis.location.origin,
      },
    });

    if (error) {
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    elements.inviteUserForm.reset();
    setNoticeText(elements.adminNotice, "User invited and approved.");
    await loadUsers();
    renderUsers();
  } catch (error) {
    setNoticeText(elements.adminNotice, recoveryMessage(error, "Could not invite user."));
  } finally {
    setButtonBusy(submitButton, false);
  }
}

async function updateUserAccess(payload, button = null) {
  setNoticeText(elements.adminNotice, "Updating user...");
  setButtonBusy(button, true, "Updating...");

  try {
    const { data, error } = await cloudClient.functions.invoke("manage-users", {
      body: { action: "update", ...payload },
    });

    if (error) {
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    setNoticeText(elements.adminNotice, "User access updated.");
    await loadUsers();
    renderUsers();
  } catch (error) {
    setNoticeText(elements.adminNotice, recoveryMessage(error, "Could not update user."));
  } finally {
    setButtonBusy(button, false);
  }
}

async function addTradeCategory(formData) {
  if (state.currentProfile?.role !== "admin") {
    return;
  }

  const category = cleanTradeCategory(formData.get("tradeCategory"));

  if (!category) {
    setTradeCategoryNotice("Enter a trade category first.");
    return;
  }

  const categoryExists = state.tradeCategories.some(
    (item) => normalizeTradeCategoryValue(item.name) === normalizeTradeCategoryValue(category),
  );

  if (categoryExists) {
    setTradeCategoryNotice("That category already exists. Reactivate it if needed.");
    return;
  }

  const submitButton = elements.tradeCategoryForm.querySelector('button[type="submit"]');
  setTradeCategoryNotice("Saving category...");
  setButtonBusy(submitButton, true, "Saving...");

  try {
    const { data, error } = await cloudClient
      .from("trade_categories")
      .insert({
        name: category,
        is_active: true,
        created_by: state.currentUser?.id || null,
      })
      .select("id, name, is_active, created_by, created_at")
      .single();

    if (error) {
      throw error;
    }

    state.tradeCategories = mergeTradeCategories(state.tradeCategories, [{
        id: data.id,
        name: data.name || category,
        isActive: data.is_active,
        createdBy: data.created_by || currentUserId(),
        createdAt: data.created_at || nowIso(),
      }]);
    elements.tradeCategoryForm.reset();
    refreshTradeCategoryUi();
    setTradeCategoryNotice("Trade category added.");
  } catch (error) {
    const isDuplicate = error.code === "23505" || /duplicate/i.test(error.message || "");
    setTradeCategoryNotice(isDuplicate ? "That category already exists." : recoveryMessage(error, "Could not save category."));
  } finally {
    setButtonBusy(submitButton, false);
  }
}

function refreshTradeCategoryUi() {
  saveStoredTradeCategories();
  renderFilterOptions();
  renderForm(getSelectedProspect());
  renderTradeCategoryList();
}

async function updateTradeCategoryStatus(categoryId, isActive) {
  if (state.currentProfile?.role !== "admin" || !categoryId) {
    return;
  }

  setTradeCategoryNotice(isActive ? "Reactivating category..." : "Deactivating category...");

  try {
    const { data, error } = await cloudClient
      .from("trade_categories")
      .update({ is_active: isActive })
      .eq("id", categoryId)
      .select("id, name, is_active")
      .single();

    if (error) {
      throw error;
    }

    state.tradeCategories = mergeTradeCategories(
      state.tradeCategories.filter((category) => category.id !== categoryId),
      [{
        id: data.id,
        name: data.name,
        isActive: data.is_active,
        createdBy: state.tradeCategories.find((category) => category.id === categoryId)?.createdBy || "",
        createdAt: state.tradeCategories.find((category) => category.id === categoryId)?.createdAt || "",
      }],
    );
    refreshTradeCategoryUi();
    setTradeCategoryNotice(isActive ? "Trade category reactivated." : "Trade category deactivated.");
  } catch (error) {
    setTradeCategoryNotice(recoveryMessage(error, "Could not update category."));
  }
}

async function deleteTradeCategory(categoryId, categoryName) {
  if (state.currentProfile?.role !== "admin" || !categoryId) {
    return;
  }

  const confirmed = window.confirm(
    `Delete "${categoryName}" from Trade Categories? Existing prospects with this trade will keep their saved text, but this category will be removed from future dropdowns.`,
  );

  if (!confirmed) {
    return;
  }

  setTradeCategoryNotice("Deleting category...");

  try {
    const { error } = await cloudClient
      .from("trade_categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      throw error;
    }

    state.tradeCategories = state.tradeCategories.filter((category) => category.id !== categoryId);
    refreshTradeCategoryUi();
    setTradeCategoryNotice("Trade category deleted.");
  } catch (error) {
    setTradeCategoryNotice(recoveryMessage(error, "Could not delete category."));
  }
}

async function initializeApp() {
  renderDailyQuotes();

  if (!cloudClient) {
    showSignedOut("Supabase could not load. Check your internet connection and refresh.");
    return;
  }

  requireCloudClient();
  const { data } = await cloudClient.auth.getSession();
  state.session = data.session;
  state.currentUser = data.session?.user || null;

  cloudClient.auth.onAuthStateChange((_event, session) => {
    state.session = session;
    state.currentUser = session?.user || null;
  });

  if (!state.currentUser) {
    showSignedOut("");
    return;
  }

  await refreshAppData();
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const text = csvText.replace(/^\uFEFF/, "");

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (inQuotes) {
      if (character === '"' && nextCharacter === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        inQuotes = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      inQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";

      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
    } else {
      field += character;
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((csvRow) => csvRow.some((value) => value.trim()));
}

function normalizeColumnName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findColumn(headers, aliases) {
  const normalizedHeaders = headers.map(normalizeColumnName);

  return aliases
    .map(normalizeColumnName)
    .map((alias) => normalizedHeaders.indexOf(alias))
    .find((index) => index >= 0);
}

function cell(row, index) {
  if (index === undefined || index < 0) {
    return "";
  }

  return (row[index] || "").trim();
}

function parseImportedDate(value) {
  const cleanValue = String(value || "").trim();
  const displayMatch = cleanValue.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[,\s]+(\d{1,2}):(\d{2}))?$/);

  if (displayMatch) {
    const day = Number(displayMatch[1]);
    const month = Number(displayMatch[2]);
    const year = Number(displayMatch[3]);
    const hours = Number(displayMatch[4] || 0);
    const minutes = Number(displayMatch[5] || 0);
    const date = new Date(year, month - 1, day, hours, minutes);

    if (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date.toISOString();
    }
  }

  const parsedDate = new Date(value);

  if (value && !Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString();
  }

  return nowIso();
}

function parseImportedInputDate(value) {
  const cleanValue = String(value || "").trim();
  const parsedDisplayDate = parseDisplayDate(cleanValue);

  if (parsedDisplayDate) {
    return parsedDisplayDate;
  }

  const parsedDate = new Date(value);

  if (value && !Number.isNaN(parsedDate.getTime())) {
    return formatDateForInput(parsedDate.toISOString());
  }

  return "";
}

function mergeImportedProspects(importedProspects) {
  const existingByKey = new Map(
    state.prospects.map((prospect) => [prospectMergeKey(prospect), prospect]),
  );

  let addedCount = 0;
  let updatedCount = 0;
  let interactionCount = 0;
  let firstImportedId = null;

  importedProspects.forEach((importedProspect) => {
    const key = prospectMergeKey(importedProspect);
    const existingProspect = existingByKey.get(key);

    if (existingProspect) {
      existingProspect.agency = importedProspect.agency || existingProspect.agency || "";
      existingProspect.agent = importedProspect.agent || existingProspect.agent || "";
      existingProspect.building = importedProspect.building || existingProspect.building || "";
      existingProspect.unit = importedProspect.unit || existingProspect.unit || "";
      existingProspect.trade = importedProspect.trade || existingProspect.trade || "";
      existingProspect.email = importedProspect.email || existingProspect.email || "";
      existingProspect.telegram = importedProspect.telegram || existingProspect.telegram || "";
      existingProspect.website = importedProspect.website || existingProspect.website || "";
      existingProspect.social = importedProspect.social || existingProspect.social || "";
      existingProspect.status = normalizeStatus(importedProspect.status || existingProspect.status);
      existingProspect.updatedBy = currentUserId();
      existingProspect.updatedAt = nowIso();
      existingProspect.interactions = existingProspect.interactions || [];
      const existingInteractionKeys = new Set(
        existingProspect.interactions.map((interaction) => `${interaction.createdAt}|${interaction.note}`),
      );
      const newInteractions = importedProspect.interactions.filter(
        (interaction) => !existingInteractionKeys.has(`${interaction.createdAt}|${interaction.note}`),
      );
      existingProspect.interactions.unshift(...newInteractions);
      existingProspect.interactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      refreshProspectSearchCache(existingProspect);
      updatedCount += 1;
      interactionCount += newInteractions.length;
      firstImportedId = firstImportedId || existingProspect.id;
      return;
    }

    state.prospects.unshift(refreshProspectSearchCache(importedProspect));
    existingByKey.set(key, importedProspect);
    addedCount += 1;
    interactionCount += importedProspect.interactions.length;
    firstImportedId = firstImportedId || importedProspect.id;
  });

  return { addedCount, updatedCount, interactionCount, firstImportedId };
}

function prospectsFromCsvRows(rows) {
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  const columns = {
    name: findColumn(headers, ["Name", "Prospect Name", "Contact Name", "Tenant Name"]),
    business:
      findColumn(headers, ["Business Name", "Business", "Company", "Company Name", "Organization"]),
    agency: findColumn(headers, ["Agency", "Agency Name", "Brokerage"]),
    agent: findColumn(headers, ["Agent", "Agent Name", "Representative", "Rep"]),
    building: findColumn(headers, ["Building", "Building Name", "Property", "Property Name"]),
    unit: findColumn(headers, ["Unit Number", "Unit No", "Unit", "Suite", "Shop Unit"]),
    trade: findColumn(headers, ["Trade", "Trade Type", "Business Type", "Category", "Use"]),
    phone:
      findColumn(headers, ["Contact Number", "Phone", "Phone Number", "Mobile", "Telephone", "Tel"]),
    email: findColumn(headers, ["Email Address", "Email", "E-mail", "Mail"]),
    telegram: findColumn(headers, ["Telegram Handle", "Telegram", "Telegram Username"]),
    website: findColumn(headers, ["Website", "Web Site", "URL", "Site"]),
    social: findColumn(headers, ["Social Media", "Social", "Social Link", "Social Links", "LinkedIn", "Instagram"]),
    status: findColumn(headers, ["Status", "Stage"]),
    interactionTimestamp:
      findColumn(headers, [
        "Interaction Timestamp",
        "Timestamp",
        "Interaction Time",
        "Date",
        "Created At",
        "Last Contact",
      ]),
    interactionNote:
      findColumn(headers, ["Interaction Note", "Note", "Notes", "Interaction", "Comments", "Comment"]),
  };
  const importedByKey = new Map();

  rows.slice(1).forEach((row) => {
    const name = cell(row, columns.name);
    const business = cell(row, columns.business);
    const agency = cell(row, columns.agency);
    const agent = cell(row, columns.agent);
    const building = cell(row, columns.building);
    const unit = cell(row, columns.unit);
    const trade = cell(row, columns.trade);
    const phone = cell(row, columns.phone);
    const email = cell(row, columns.email);
    const telegram = cell(row, columns.telegram);
    const website = cell(row, columns.website);
    const social = cell(row, columns.social);
    const status = normalizeStatus(cell(row, columns.status));
    const note = cell(row, columns.interactionNote);

    if (!name && !business && !agency && !agent && !building && !unit && !trade && !phone && !email && !telegram && !website && !social) {
      return;
    }

    if (!name || !trade) {
      return;
    }

    const key = prospectMergeKey({ name, business, agency, agent, building, unit, phone, email, telegram });

    if (!importedByKey.has(key)) {
      importedByKey.set(key, {
        id: createId(),
        name,
        business,
        agency,
        agent,
        building,
        unit,
        trade,
        phone,
        email,
        telegram,
        website,
        social,
        status,
        isDraft: false,
        createdBy: currentUserId(),
        updatedBy: currentUserId(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        interactions: [],
      });
    }

    const prospect = importedByKey.get(key);
    prospect.agency = agency || prospect.agency;
    prospect.agent = agent || prospect.agent;
    prospect.building = building || prospect.building;
    prospect.unit = unit || prospect.unit;
    prospect.trade = trade || prospect.trade;
    prospect.email = email || prospect.email;
    prospect.telegram = telegram || prospect.telegram;
    prospect.website = website || prospect.website;
    prospect.social = social || prospect.social;
    prospect.status = normalizeStatus(status || prospect.status);

    if (note) {
      prospect.interactions.push({
        id: createId(),
        note,
        createdBy: currentUserId(),
        createdAt: parseImportedDate(cell(row, columns.interactionTimestamp)),
        attachment: null,
      });
    }
  });

  return [...importedByKey.values()].map((prospect) => ({
    ...prospect,
    interactions: prospect.interactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  }));
}

function unitsFromCsvRows(rows) {
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  const columns = {
    number: findColumn(headers, ["Unit Number", "Unit No", "Unit", "Suite", "Shop Unit"]),
    pricePerSqft: findColumn(headers, ["Price Per Square Foot", "Price PSF", "PSF", "Price/SF", "Price Per Sqft"]),
    lastOperationDate: findColumn(headers, ["Last Date of Operation", "Last Operation Date", "Last Operated", "Operation End Date"]),
    availableDate: findColumn(headers, ["Available Date", "Availability Date", "Available From"]),
    currentPrice: findColumn(headers, ["Current Price", "Current Rent", "Asking Price", "Asking Rent"]),
    marketPrice: findColumn(headers, ["Market Price", "Market Rent", "Estimated Market Price", "Estimated Market Rent"]),
  };
  const importedByNumber = new Map();

  rows.slice(1).forEach((row) => {
    const number = cell(row, columns.number);

    if (!number) {
      return;
    }

    const key = normalizeFilterValue(number);

    if (!importedByNumber.has(key)) {
      importedByNumber.set(key, {
        id: createId(),
        number,
        pricePerSqft: "",
        lastOperationDate: "",
        availableDate: "",
        currentPrice: "",
        marketPrice: "",
        isDraft: false,
        createdBy: currentUserId(),
        updatedBy: currentUserId(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        documents: createEmptyUnitDocuments(),
      });
    }

    const unit = importedByNumber.get(key);
    unit.pricePerSqft = cell(row, columns.pricePerSqft) || unit.pricePerSqft;
    unit.lastOperationDate = parseImportedInputDate(cell(row, columns.lastOperationDate)) || unit.lastOperationDate;
    unit.availableDate = parseImportedInputDate(cell(row, columns.availableDate)) || unit.availableDate;
    unit.currentPrice = cell(row, columns.currentPrice) || unit.currentPrice;
    unit.marketPrice = cell(row, columns.marketPrice) || unit.marketPrice;
  });

  return [...importedByNumber.values()];
}

function mergeImportedUnits(importedUnits) {
  const existingByNumber = new Map(
    state.units.map((unit) => [normalizeFilterValue(unit.number), unit]),
  );

  let addedCount = 0;
  let updatedCount = 0;
  let firstImportedId = null;

  importedUnits.forEach((importedUnit) => {
    const key = normalizeFilterValue(importedUnit.number);
    const existingUnit = existingByNumber.get(key);

    if (existingUnit) {
      existingUnit.pricePerSqft = importedUnit.pricePerSqft || existingUnit.pricePerSqft || "";
      existingUnit.lastOperationDate = importedUnit.lastOperationDate || existingUnit.lastOperationDate || "";
      existingUnit.availableDate = importedUnit.availableDate || existingUnit.availableDate || "";
      existingUnit.currentPrice = importedUnit.currentPrice || existingUnit.currentPrice || "";
      existingUnit.marketPrice = importedUnit.marketPrice || existingUnit.marketPrice || "";
      existingUnit.documents = existingUnit.documents || createEmptyUnitDocuments();
      existingUnit.isDraft = false;
      existingUnit.updatedBy = currentUserId();
      existingUnit.updatedAt = nowIso();
      refreshUnitSearchCache(existingUnit);
      updatedCount += 1;
      firstImportedId = firstImportedId || existingUnit.id;
      return;
    }

    state.units.unshift(refreshUnitSearchCache(importedUnit));
    existingByNumber.set(key, importedUnit);
    addedCount += 1;
    firstImportedId = firstImportedId || importedUnit.id;
  });

  return { addedCount, updatedCount, firstImportedId };
}

function agentsFromCsvRows(rows) {
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  const columns = {
    name: findColumn(headers, ["Agent Name", "Name", "Agent"]),
    agency: findColumn(headers, ["Agency", "Agency Name", "Brokerage"]),
    phone: findColumn(headers, ["Contact Number", "Phone", "Phone Number", "Mobile", "Telephone", "Tel"]),
    email: findColumn(headers, ["Email Address", "Email", "E-mail", "Mail"]),
    telegram: findColumn(headers, ["Telegram Handle", "Telegram", "Telegram Username"]),
    website: findColumn(headers, ["Website", "Web Site", "URL", "Site"]),
    social: findColumn(headers, ["Social Media", "Social", "Social Link", "Social Links", "LinkedIn", "Instagram"]),
    grade: findColumn(headers, ["Grade", "Agent Grade", "Rating"]),
    interactionTimestamp:
      findColumn(headers, ["Interaction Timestamp", "Timestamp", "Interaction Time", "Date", "Created At", "Last Contact"]),
    interactionNote: findColumn(headers, ["Interaction Note", "Note", "Notes", "Interaction", "Comments", "Comment"]),
  };
  const importedByKey = new Map();

  rows.slice(1).forEach((row) => {
    const name = cell(row, columns.name);
    const agency = cell(row, columns.agency);
    const phone = cell(row, columns.phone);
    const email = cell(row, columns.email);
    const telegram = cell(row, columns.telegram);
    const website = cell(row, columns.website);
    const social = cell(row, columns.social);
    const grade = normalizeAgentGrade(cell(row, columns.grade));
    const note = cell(row, columns.interactionNote);

    if (!name) {
      return;
    }

    const key = agentMergeKey({ name, agency, phone, email, telegram });

    if (!importedByKey.has(key)) {
      importedByKey.set(key, {
        id: createId(),
        name,
        agency,
        phone,
        email,
        telegram,
        website,
        social,
        grade,
        isDraft: false,
        createdBy: currentUserId(),
        updatedBy: currentUserId(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        interactions: [],
      });
    }

    const agent = importedByKey.get(key);
    agent.agency = agency || agent.agency;
    agent.phone = phone || agent.phone;
    agent.email = email || agent.email;
    agent.telegram = telegram || agent.telegram;
    agent.website = website || agent.website;
    agent.social = social || agent.social;
    agent.grade = normalizeAgentGrade(grade || agent.grade);

    if (note) {
      agent.interactions.push({
        id: createId(),
        note,
        createdBy: currentUserId(),
        createdAt: parseImportedDate(cell(row, columns.interactionTimestamp)),
      });
    }
  });

  return [...importedByKey.values()].map((agent) => ({
    ...agent,
    interactions: agent.interactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  }));
}

function mergeImportedAgents(importedAgents) {
  const existingByKey = new Map(
    state.agents.map((agent) => [agentMergeKey(agent), agent]),
  );

  let addedCount = 0;
  let updatedCount = 0;
  let interactionCount = 0;
  let firstImportedId = null;

  importedAgents.forEach((importedAgent) => {
    const key = agentMergeKey(importedAgent);
    const existingAgent = existingByKey.get(key);

    if (existingAgent) {
      existingAgent.agency = importedAgent.agency || existingAgent.agency || "";
      existingAgent.phone = importedAgent.phone || existingAgent.phone || "";
      existingAgent.email = importedAgent.email || existingAgent.email || "";
      existingAgent.telegram = importedAgent.telegram || existingAgent.telegram || "";
      existingAgent.website = importedAgent.website || existingAgent.website || "";
      existingAgent.social = importedAgent.social || existingAgent.social || "";
      existingAgent.grade = normalizeAgentGrade(importedAgent.grade || existingAgent.grade);
      existingAgent.isDraft = false;
      existingAgent.updatedBy = currentUserId();
      existingAgent.updatedAt = nowIso();
      existingAgent.interactions = existingAgent.interactions || [];
      const existingInteractionKeys = new Set(
        existingAgent.interactions.map((interaction) => `${interaction.createdAt}|${interaction.note}`),
      );
      const newInteractions = importedAgent.interactions.filter(
        (interaction) => !existingInteractionKeys.has(`${interaction.createdAt}|${interaction.note}`),
      );
      existingAgent.interactions.unshift(...newInteractions);
      existingAgent.interactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      refreshAgentSearchCache(existingAgent);
      updatedCount += 1;
      interactionCount += newInteractions.length;
      firstImportedId = firstImportedId || existingAgent.id;
      return;
    }

    state.agents.unshift(refreshAgentSearchCache(importedAgent));
    existingByKey.set(key, importedAgent);
    addedCount += 1;
    interactionCount += importedAgent.interactions.length;
    firstImportedId = firstImportedId || importedAgent.id;
  });

  return { addedCount, updatedCount, interactionCount, firstImportedId };
}

function importCsvFile(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  setButtonBusy(elements.importCsvButton, true, "Importing...");
  setImportNotice("Importing CSV");

  reader.addEventListener("load", async () => {
    try {
      const rows = parseCsv(String(reader.result || ""));
      const importedProspects = prospectsFromCsvRows(rows);

      if (importedProspects.length === 0) {
        setImportNotice("No complete prospects found. CSV rows need Name and Trade.");
        return;
      }

      const result = mergeImportedProspects(importedProspects);
      state.selectedId = result.firstImportedId || state.prospects[0]?.id || null;
      await saveProspects();
      render();
      setImportNotice(
        `Imported ${result.addedCount} new, updated ${result.updatedCount}, added ${result.interactionCount} interactions.`,
      );
    } catch (error) {
      setImportNotice(recoveryMessage(error, "That CSV could not be imported."));
    } finally {
      setButtonBusy(elements.importCsvButton, false);
      elements.csvFileInput.value = "";
    }
  });

  reader.addEventListener("error", () => {
    setButtonBusy(elements.importCsvButton, false);
    setImportNotice("That CSV could not be read.");
    elements.csvFileInput.value = "";
  });

  reader.readAsText(file);
}

function importUnitsCsvFile(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  setButtonBusy(elements.importUnitsCsvButton, true, "Importing...");
  setUnitImportNotice("Importing unit CSV");

  reader.addEventListener("load", async () => {
    try {
      const rows = parseCsv(String(reader.result || ""));
      const importedUnits = unitsFromCsvRows(rows);

      if (importedUnits.length === 0) {
        setUnitImportNotice("No units found. CSV rows need at least Unit Number.");
        return;
      }

      const result = mergeImportedUnits(importedUnits);
      state.selectedUnitId = result.firstImportedId || state.units[0]?.id || null;
      state.activeTab = "units";
      await saveUnits();
      render();
      setUnitImportNotice(`Imported ${result.addedCount} new units and updated ${result.updatedCount}.`);
    } catch (error) {
      setUnitImportNotice(recoveryMessage(error, "That unit CSV could not be imported."));
    } finally {
      setButtonBusy(elements.importUnitsCsvButton, false);
      elements.unitCsvFileInput.value = "";
    }
  });

  reader.addEventListener("error", () => {
    setButtonBusy(elements.importUnitsCsvButton, false);
    setUnitImportNotice("That unit CSV could not be read.");
    elements.unitCsvFileInput.value = "";
  });

  reader.readAsText(file);
}

function importAgentsCsvFile(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  setButtonBusy(elements.importAgentsCsvButton, true, "Importing...");
  setAgentImportNotice("Importing agent CSV");

  reader.addEventListener("load", async () => {
    try {
      const rows = parseCsv(String(reader.result || ""));
      const importedAgents = agentsFromCsvRows(rows);

      if (importedAgents.length === 0) {
        setAgentImportNotice("No agents found. CSV rows need at least Agent Name.");
        return;
      }

      const result = mergeImportedAgents(importedAgents);
      state.selectedAgentId = result.firstImportedId || state.agents[0]?.id || null;
      state.activeTab = "agents";
      await saveAgents();
      render();
      setAgentImportNotice(
        `Imported ${result.addedCount} new, updated ${result.updatedCount}, added ${result.interactionCount} notes.`,
      );
    } catch (error) {
      setAgentImportNotice(recoveryMessage(error, "That agent CSV could not be imported."));
    } finally {
      setButtonBusy(elements.importAgentsCsvButton, false);
      elements.agentCsvFileInput.value = "";
    }
  });

  reader.addEventListener("error", () => {
    setButtonBusy(elements.importAgentsCsvButton, false);
    setAgentImportNotice("That agent CSV could not be read.");
    elements.agentCsvFileInput.value = "";
  });

  reader.readAsText(file);
}

function downloadTextFile(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function interactionEntriesForExport(record) {
  const interactions = Array.isArray(record.interactions)
    ? record.interactions.filter(Boolean)
    : [];

  if (interactions.length === 0) {
    return [
      {
        interaction: { createdAt: "", note: "", attachment: null },
        number: "",
        total: "0",
      },
    ];
  }

  return interactions.map((interaction, index) => ({
    interaction,
    number: String(index + 1),
    total: String(interactions.length),
  }));
}

function exportCsv() {
  const rows = [
    [
      "Name",
      "Business Name",
      "Agency",
      "Agent",
      "Building",
      "Unit Number",
      "Trade",
      "Contact Number",
      "Email Address",
      "Telegram Handle",
      "Website",
      "Social Media",
      "Status",
      "Created By",
      "Created Timestamp",
      "Updated By",
      "Updated Timestamp",
      "Interaction Number",
      "Interaction Total",
      "Interaction Timestamp",
      "Interaction Created By",
      "Interaction Note",
      "Attachment Name",
      "Attachment Type",
    ],
  ];

  state.prospects.forEach((prospect) => {
    interactionEntriesForExport(prospect).forEach(({ interaction, number, total }) => {
      rows.push([
        prospect.name,
        prospect.business,
        prospect.agency,
        prospect.agent,
        prospect.building,
        prospect.unit,
        prospect.trade,
        prospect.phone,
        prospect.email,
        prospect.telegram,
        prospect.website,
        prospect.social,
        prospect.status,
        exportUserName(prospect.createdBy),
        formatDateTimeForCsv(prospect.createdAt),
        exportUserName(prospect.updatedBy),
        formatDateTimeForCsv(prospect.updatedAt),
        number,
        total,
        formatDateTimeForCsv(interaction.createdAt),
        interaction.createdBy ? exportUserName(interaction.createdBy) : "",
        interaction.note,
        interaction.attachment?.name || "",
        interaction.attachment?.type || "",
      ]);
    });
  });

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  downloadTextFile(
    `tenant-prospects-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
    "text/csv;charset=utf-8",
  );
}

function exportAgentsCsv() {
  const rows = [
    [
      "Agent Name",
      "Agency",
      "Contact Number",
      "Email Address",
      "Telegram Handle",
      "Website",
      "Social Media",
      "Grade",
      "Created By",
      "Created Timestamp",
      "Updated By",
      "Updated Timestamp",
      "Interaction Timestamp",
      "Interaction Created By",
      "Interaction Note",
    ],
  ];

  state.agents.forEach((agent) => {
    const interactions = agent.interactions?.length
      ? agent.interactions
      : [{ createdAt: "", note: "" }];

    interactions.forEach((interaction) => {
      rows.push([
        agent.name,
        agent.agency,
        agent.phone,
        agent.email,
        agent.telegram,
        agent.website,
        agent.social,
        normalizeAgentGrade(agent.grade),
        exportUserName(agent.createdBy),
        formatDateTimeForCsv(agent.createdAt),
        exportUserName(agent.updatedBy),
        formatDateTimeForCsv(agent.updatedAt),
        formatDateTimeForCsv(interaction.createdAt),
        interaction.createdBy ? exportUserName(interaction.createdBy) : "",
        interaction.note,
      ]);
    });
  });

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  downloadTextFile(
    `agents-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
    "text/csv;charset=utf-8",
  );
}

elements.prospectsTabButton.addEventListener("click", () => setActiveTab("prospects"));
elements.unitsTabButton.addEventListener("click", () => setActiveTab("units"));
elements.agentsTabButton.addEventListener("click", () => setActiveTab("agents"));
elements.adminTabButton.addEventListener("click", () => setActiveTab("admin"));
elements.newProspectButton.addEventListener("click", createProspect);
elements.emptyNewButton.addEventListener("click", createProspect);
elements.newUnitButton.addEventListener("click", createUnit);
elements.emptyNewUnitButton.addEventListener("click", createUnit);
elements.newAgentButton.addEventListener("click", createAgent);
elements.emptyNewAgentButton.addEventListener("click", createAgent);
elements.importAgentsCsvButton.addEventListener("click", () => elements.agentCsvFileInput.click());
elements.agentCsvFileInput.addEventListener("change", (event) => {
  importAgentsCsvFile(event.target.files[0]);
});
elements.exportAgentsCsvButton.addEventListener("click", exportAgentsCsv);
elements.importUnitsCsvButton.addEventListener("click", () => elements.unitCsvFileInput.click());
elements.unitCsvFileInput.addEventListener("change", (event) => {
  importUnitsCsvFile(event.target.files[0]);
});
elements.importCsvButton.addEventListener("click", () => elements.csvFileInput.click());
elements.csvFileInput.addEventListener("change", (event) => {
  importCsvFile(event.target.files[0]);
});
elements.exportCsvButton.addEventListener("click", exportCsv);
elements.deleteProspectButton.addEventListener("click", () => {
  deleteSelectedProspect();
});
elements.backToProspectListButton.addEventListener("click", () => {
  scrollProspectListIntoView();
});
elements.deleteUnitButton.addEventListener("click", () => {
  deleteSelectedUnit();
});
elements.deleteAgentButton.addEventListener("click", () => {
  deleteSelectedAgent();
});

elements.authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleLogin(new FormData(elements.authForm));
});

elements.signupButton.addEventListener("click", () => {
  handleSignup();
});

elements.logoutButton.addEventListener("click", () => {
  handleLogout();
});

elements.showAllProspectsButton.addEventListener("click", () => {
  state.showAllProspects = !state.showAllProspects;
  renderProspectList();
});

elements.showAllAgentsButton.addEventListener("click", () => {
  state.showAllAgents = !state.showAllAgents;
  renderAgentList();
});

elements.inviteUserForm.addEventListener("submit", (event) => {
  event.preventDefault();
  inviteUser(new FormData(elements.inviteUserForm));
});

elements.tradeCategoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTradeCategory(new FormData(elements.tradeCategoryForm));
});

const debouncedRenderProspectList = debounce(renderProspectList, 120);
const debouncedRenderUnitList = debounce(renderUnitList, 120);
const debouncedRenderAgentList = debounce(renderAgentList, 120);

elements.searchInput.addEventListener("input", (event) => {
  state.searchTerm = event.target.value;
  debouncedRenderProspectList();
});

elements.unitSearchInput.addEventListener("input", (event) => {
  state.unitSearchTerm = event.target.value;
  debouncedRenderUnitList();
});

elements.agentSearchInput.addEventListener("input", (event) => {
  state.agentSearchTerm = event.target.value;
  debouncedRenderAgentList();
});

elements.contactDateInput.addEventListener("input", (event) => {
  state.contactDate = parseDisplayDate(event.target.value);
  renderProspectList();
});

elements.contactYearInput.addEventListener("input", (event) => {
  state.contactYear = event.target.value.replace(/\D/g, "").slice(0, 4);
  elements.contactYearInput.value = state.contactYear;
  renderProspectList();
});

elements.tradeFilterInput.addEventListener("change", (event) => {
  state.tradeFilter = event.target.value;
  renderProspectList();
});

elements.statusFilterInput.addEventListener("change", (event) => {
  state.statusFilter = event.target.value;
  renderProspectList();
});

elements.clearFiltersButton.addEventListener("click", () => {
  state.searchTerm = "";
  state.contactDate = "";
  state.contactYear = "";
  state.tradeFilter = "";
  state.statusFilter = "";
  elements.searchInput.value = "";
  elements.contactDateInput.value = "";
  elements.contactYearInput.value = "";
  elements.tradeFilterInput.value = "";
  elements.statusFilterInput.value = "";
  renderProspectList();
});

elements.prospectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateSelectedProspect(new FormData(elements.prospectForm));
});

elements.unitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateSelectedUnit(new FormData(elements.unitForm));
});

elements.agentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateSelectedAgent(new FormData(elements.agentForm));
});

elements.interactionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addInteraction(elements.interactionInput.value, elements.interactionFileInput.files[0]);
});

elements.unitDocumentsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveUnitDocuments();
});

elements.agentInteractionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addAgentInteraction(elements.agentInteractionInput.value);
});

initializeApp();
