import "dotenv/config";
import axios from "axios";
import mongoose, { Types } from "mongoose";

const originalUri = process.env.MONGODB_URI;
if (!originalUri) throw new Error("MONGODB_URI is required for the Step 14 runtime test");

const databaseName = `neurox_step14_${Date.now()}`;
const databaseUrl = new URL(originalUri);
databaseUrl.pathname = `/${databaseName}`;
databaseUrl.searchParams.set("serverSelectionTimeoutMS", "5000");
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = databaseUrl.toString();

async function main() {
  const [{ default: app }, models, { generateAccessToken }, notificationService] = await Promise.all([
    import("../src/app"),
    import("../src/models"),
    import("../src/utils/jwt"),
    import("../src/services/notification.service"),
  ]);
  await mongoose.connect(process.env.MONGODB_URI as string);
  const server = app.listen(0);
  try {
    await new Promise<void>((resolve) => server.once("listening", () => resolve()));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Unable to determine test server port");
    const baseURL = `http://127.0.0.1:${address.port}/api`;
    const citizen = await models.User.create({ name: "Step 14 Citizen", email: `step14-${Date.now()}@example.test`, role: "CITIZEN", passwordHash: "test-only-hash" });
    const other = await models.User.create({ name: "Step 14 Other", email: `step14-other-${Date.now()}@example.test`, role: "CITIZEN", passwordHash: "test-only-hash" });
    const problem = await models.Problem.create({ title: "Step 14 runtime challenge", description: "Synthetic challenge for isolated runtime verification.", category: "Water Resources", location: { city: "Nashik", state: "Maharashtra", country: "India" }, submittedBy: citizen._id, status: "VALIDATED", aiAnalysisStatus: "COMPLETED", aiAnalyzedAt: new Date(Date.now() - 3000), validatedAt: new Date(Date.now() - 2000), priority: "MEDIUM" });
    const citizenToken = generateAccessToken(citizen._id.toString(), "CITIZEN");
    const otherToken = generateAccessToken(other._id.toString(), "CITIZEN");
    const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

    const passport = await axios.get(`${baseURL}/problems/${problem._id}/passport`, auth(citizenToken));
    const timestamps = passport.data.data.events.map((event: { timestamp: string }) => new Date(event.timestamp).getTime());
    if (passport.status !== 200 || timestamps.some((value: number, index: number) => index > 0 && value < timestamps[index - 1])) throw new Error("Passport response is not chronologically ordered");
    await expectStatus(() => axios.get(`${baseURL}/problems/not-an-object-id/passport`, auth(citizenToken)), 400);
    await expectStatus(() => axios.get(`${baseURL}/problems/${problem._id}/passport`, auth(otherToken)), 403);

    const notification = await notificationService.create({ recipient: citizen._id, title: "Runtime notification", message: "Synthetic notification.", type: "STEP14_TEST", relatedType: "PROBLEM", relatedId: problem._id, dedupeKey: `step14-test:${problem._id}` });
    if (!notification) throw new Error("Notification was not persisted");
    const listed = await axios.get(`${baseURL}/notifications`, auth(citizenToken));
    if (listed.data.data.unreadCount !== 1 || listed.data.data.notifications.length !== 1) throw new Error("Notification list/unread count mismatch");
    await expectStatus(() => axios.get(`${baseURL}/notifications`, auth(otherToken)), 200);
    const notificationId = notification._id.toString();
    await expectStatus(() => axios.patch(`${baseURL}/notifications/${notificationId}/read`, {}, auth(otherToken)), 404);
    await axios.patch(`${baseURL}/notifications/${notificationId}/read`, {}, auth(citizenToken));
    const afterRead = await axios.get(`${baseURL}/notifications/unread-count`, auth(citizenToken));
    if (afterRead.data.data.unreadCount !== 0) throw new Error("Read status did not persist");
    console.log("STEP14_RUNTIME_PASS");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}

async function expectStatus(request: () => Promise<{ status: number }>, expected: number) {
  try {
    const response = await request();
    if (response.status === expected) return;
    throw new Error(`Expected HTTP ${expected}, received ${response.status}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === expected) return;
    throw error;
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
