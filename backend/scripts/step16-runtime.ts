import "dotenv/config";
import axios from "axios";
import mongoose from "mongoose";

const originalUri = process.env.MONGODB_URI;
if (!originalUri) throw new Error("MONGODB_URI is required for the Step 16 runtime test");
const databaseUrl = new URL(originalUri); databaseUrl.pathname = `/neurox_step16_${Date.now()}`; databaseUrl.searchParams.set("serverSelectionTimeoutMS", "5000"); process.env.NODE_ENV = "test"; process.env.MONGODB_URI = databaseUrl.toString();

async function main() {
  const [{ default: app }, models, { generateAccessToken }] = await Promise.all([import("../src/app"), import("../src/models"), import("../src/utils/jwt")]);
  await mongoose.connect(process.env.MONGODB_URI as string); const server = app.listen(0);
  try {
    await new Promise<void>((resolve) => server.once("listening", () => resolve())); const address = server.address(); if (!address || typeof address === "string") throw new Error("Unable to determine test server port"); const base = `http://127.0.0.1:${address.port}/api`;
    const [admin, universityUser, industryUser] = await Promise.all([
      models.User.create({ name: "Step 16 Admin", email: `step16-admin-${Date.now()}@example.test`, role: "ADMIN", passwordHash: "test-only" }),
      models.User.create({ name: "Step 16 University User", email: `step16-university-${Date.now()}@example.test`, role: "UNIVERSITY", passwordHash: "test-only" }),
      models.User.create({ name: "Step 16 Industry User", email: `step16-industry-${Date.now()}@example.test`, role: "INDUSTRY", passwordHash: "test-only" }),
    ]);
    const [university, industry] = await Promise.all([
      models.University.create({ user: universityUser._id, name: "Step 16 University", domains: ["Water Resources"], researchAreas: ["Water systems"], skills: ["filtration"], resources: ["laboratory"], profileLocation: { country: "India", state: "Maharashtra" } }),
      models.Industry.create({ user: industryUser._id, name: "Step 16 Industry", expertise: ["Water Resources"], technologies: ["filtration"], skills: ["water treatment"], resources: ["field equipment"], facilities: ["laboratory"], profileLocation: { country: "India", state: "Maharashtra" } }),
    ]);
    const embeddingResponse = await axios.post(`${process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8000"}/embed`, { text: "Rural villages need reliable clean drinking water and low-cost filtration." });
    const problem = await models.Problem.create({ title: "Step 16 validated water challenge", description: "Rural villages need reliable clean drinking water and low-cost filtration.", category: "Water Resources", location: { city: "Nashik", state: "Maharashtra", country: "India" }, priority: "HIGH", submittedBy: admin._id, status: "VALIDATED", embedding: embeddingResponse.data.embedding, aiAnalysisStatus: "COMPLETED" });
    const adminAuth = { headers: { Authorization: `Bearer ${generateAccessToken(admin._id.toString(), "ADMIN")}` } }; const universityAuth = { headers: { Authorization: `Bearer ${generateAccessToken(universityUser._id.toString(), "UNIVERSITY")}` } }; const industryAuth = { headers: { Authorization: `Bearer ${generateAccessToken(industryUser._id.toString(), "INDUSTRY")}` } };
    const generated = await axios.post(`${base}/problems/${problem._id}/opportunities/generate`, {}, adminAuth); if (generated.data.data.matches.length !== 2) throw new Error("Expected University and Industry matches");
    const universityMatches = await axios.get(`${base}/problems/${problem._id}/opportunities?entityType=UNIVERSITY&minScore=0&page=1&limit=10`, universityAuth); if (universityMatches.data.data.matches.length !== 1) throw new Error("University match retrieval/filter failed");
    const industryMatches = await axios.get(`${base}/problems/${problem._id}/opportunities?entityType=INDUSTRY&sort=newest`, industryAuth); if (industryMatches.data.data.matches.length !== 1) throw new Error("Industry match retrieval failed");
    const stored = await models.OpportunityMatch.countDocuments({ problem: problem._id }); if (stored !== 2) throw new Error("Match persistence/uniqueness failed");
    console.log(`STEP16_RUNTIME_PASS university=${university._id} industry=${industry._id}`);
  } finally { await new Promise<void>((resolve) => server.close(() => resolve())); await mongoose.connection.dropDatabase(); await mongoose.disconnect(); }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
