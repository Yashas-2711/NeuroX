import "dotenv/config";
import axios from "axios";
import mongoose from "mongoose";

const originalUri = process.env.MONGODB_URI;
if (!originalUri) throw new Error("MONGODB_URI is required for the Step 17 runtime test");
const databaseUrl = new URL(originalUri); databaseUrl.pathname = `/neurox_step17_${Date.now()}`; databaseUrl.searchParams.set("serverSelectionTimeoutMS", "5000"); process.env.NODE_ENV = "test"; process.env.MONGODB_URI = databaseUrl.toString();

async function main() {
  const [{ default: app }, models, { generateAccessToken }] = await Promise.all([import("../src/app"), import("../src/models"), import("../src/utils/jwt")]);
  await mongoose.connect(process.env.MONGODB_URI as string); const server = app.listen(0);
  try {
    await new Promise<void>((resolve) => server.once("listening", resolve)); const address = server.address(); if (!address || typeof address === "string") throw new Error("Unable to determine test port"); const base = `http://127.0.0.1:${address.port}/api`;
    const [owner, other] = await Promise.all([
      models.User.create({ name: "Step 17 Admin", email: `step17-admin-${Date.now()}@example.test`, role: "ADMIN", passwordHash: "test-only" }),
      models.User.create({ name: "Step 17 Other", email: `step17-other-${Date.now()}@example.test`, role: "CITIZEN", passwordHash: "test-only" }),
    ]);
    const problem = await models.Problem.create({ title: "Step 17 impact challenge", description: "Validated challenge for impact tracking.", category: "Water Resources", location: { city: "Nashik", state: "Maharashtra", country: "India" }, submittedBy: owner._id, status: "VALIDATED" });
    const ownerAuth = { headers: { Authorization: `Bearer ${generateAccessToken(owner._id.toString(), "ADMIN")}` } }; const otherAuth = { headers: { Authorization: `Bearer ${generateAccessToken(other._id.toString(), "CITIZEN")}` } };
    const empty = await axios.get(`${base}/problems/${problem._id}/impact`, ownerAuth); if (empty.data.data.summary.totalIndicators !== 0) throw new Error("Empty Impact Twin summary failed");
    const created = await axios.post(`${base}/problems/${problem._id}/impact/indicators`, { name: "Average collection time", unit: "minutes", baselineValue: 120, targetValue: 60 }, ownerAuth); const indicatorId = created.data.data.indicator._id;
    await axios.post(`${base}/problems/${problem._id}/impact/scenarios`, { name: "Community filtration", proposedIntervention: "Install local filtration points", estimationMethod: "Stakeholder estimate", expectedValues: { [indicatorId]: 75 }, assumptions: ["Maintenance is funded"] }, ownerAuth);
    await axios.post(`${base}/problems/${problem._id}/impact/observations`, { indicatorId, observedValue: 90, measurementDate: new Date().toISOString() }, ownerAuth);
    const result = await axios.get(`${base}/problems/${problem._id}/impact`, ownerAuth); if (result.data.data.summary.indicatorsWithObservations !== 1 || result.data.data.summary.targetProgress === null) throw new Error("Impact summary calculation failed");
    try { await axios.get(`${base}/problems/${problem._id}/impact`, otherAuth); throw new Error("Cross-owner access was allowed"); } catch (error) { if (!axios.isAxiosError(error) || error.response?.status !== 403) throw error; }
    console.log(`STEP17_RUNTIME_PASS indicators=${result.data.data.summary.totalIndicators} observations=${result.data.data.summary.indicatorsWithObservations}`);
  } finally { await new Promise<void>((resolve) => server.close(() => resolve())); await mongoose.connection.dropDatabase(); await mongoose.disconnect(); }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
