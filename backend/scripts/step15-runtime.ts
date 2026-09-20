import "dotenv/config";
import axios from "axios";
import mongoose from "mongoose";

const originalUri = process.env.MONGODB_URI;
if (!originalUri) throw new Error("MONGODB_URI is required for the Step 15 runtime test");
const databaseUrl = new URL(originalUri);
databaseUrl.pathname = `/neurox_step15_${Date.now()}`;
databaseUrl.searchParams.set("serverSelectionTimeoutMS", "5000");
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = databaseUrl.toString();

async function main() {
  const [{ default: app }, models, { generateAccessToken }] = await Promise.all([import("../src/app"), import("../src/models"), import("../src/utils/jwt")]);
  await mongoose.connect(process.env.MONGODB_URI as string);
  const server = app.listen(0);
  try {
    await new Promise<void>((resolve) => server.once("listening", () => resolve()));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Unable to determine test server port");
    const base = `http://127.0.0.1:${address.port}/api`;
    const user = await models.User.create({ name: "Step 15 University", email: `step15-${Date.now()}@example.test`, role: "UNIVERSITY", passwordHash: "test-only" });
    const problem = await models.Problem.create({ title: "Step 15 water access challenge", description: "Rural residents cannot access reliable drinking water during summer.", category: "Water Resources", location: { city: "Nashik", state: "Maharashtra", country: "India" }, priority: "HIGH", submittedBy: user._id, status: "VALIDATED", aiAnalysisStatus: "COMPLETED" });
    await models.University.create({ user: user._id, name: "Step 15 University" });
    const auth = { headers: { Authorization: `Bearer ${generateAccessToken(user._id.toString(), "UNIVERSITY")}` } };
    const generated = await axios.post(`${base}/problems/${problem._id}/dna/generate`, {}, auth);
    if (generated.status !== 201 || generated.data.data.dna.generationStatus !== "COMPLETED") throw new Error("DNA generation did not complete");
    const fetched = await axios.get(`${base}/problems/${problem._id}/dna`, auth);
    if (fetched.status !== 200 || fetched.data.data.dna.problemId !== problem._id.toString()) throw new Error("DNA retrieval did not return persisted DNA");
    const stored = await models.ProblemDNA.findOne({ problem: problem._id });
    if (!stored || stored.generationStatus !== "COMPLETED") throw new Error("DNA was not persisted");
    console.log("STEP15_RUNTIME_PASS");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
