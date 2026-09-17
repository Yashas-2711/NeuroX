"""Insert local AI test problems into the configured MongoDB database.

This is a Step 7 test utility only. It uses existing CITIZEN ownership and
local BERT-Tiny/MiniLM inference; it does not call the Node backend.
"""

from datetime import datetime, timezone
import os
from pathlib import Path
import sys

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from engine.models import engine


CATEGORY_NAMES = {
    "education": "Education",
    "health": "Healthcare",
    "agriculture": "Agriculture",
    "water_resources": "Water Resources",
    "sanitation": "Sanitation",
    "environment": "Environment",
    "livelihoods": "Livelihoods",
    "accessibility": "Accessibility",
    "infrastructure": "Infrastructure",
    "public_services": "Public Services",
}

SAMPLES = [
    ("Unsafe drinking water in village", "Village residents do not have enough clean drinking water during the summer season.", "Nashik", "Maharashtra"),
    ("Digital learning access at rural school", "Students need reliable internet and digital learning resources to continue their education.", "Pune", "Maharashtra"),
    ("Unreliable irrigation for small farms", "Farmers are facing a shortage of dependable irrigation water for their crops.", "Nashik", "Maharashtra"),
    ("Primary clinic medicine shortage", "Families cannot access essential medicines at the local primary healthcare clinic.", "Nagpur", "Maharashtra"),
    ("Blocked drainage near homes", "Heavy rain causes blocked drains and standing water near homes in the neighborhood.", "Mumbai", "Maharashtra"),
]


def main() -> None:
    load_dotenv()
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        raise RuntimeError("MONGODB_URI is required")
    database_name = os.environ.get("MONGODB_DATABASE", "test")
    client = MongoClient(uri, serverSelectionTimeoutMS=15000)
    database = client[database_name]
    owner = database.users.find_one({"role": "CITIZEN"}, {"_id": 1})
    if not owner:
        raise RuntimeError("No existing CITIZEN user is available for test ownership")

    engine.load()
    removed = database.problems.delete_many({"title": {"$regex": r"^\[AI TEST\]"}}).deleted_count
    now = datetime.now(timezone.utc)
    documents = []
    for title, description, city, state in SAMPLES:
        text = f"{title}\n{description}"
        classification = engine.classify(text)
        documents.append({
            "_id": ObjectId(),
            "title": f"[AI TEST] {title}",
            "description": description,
            "category": CATEGORY_NAMES[classification["category"]],
            "location": {"city": city, "state": state, "country": "India"},
            "evidence": [],
            "submittedBy": owner["_id"],
            "aiClassification": classification["category"],
            "aiConfidence": classification["confidence"],
            "embedding": engine.embed(text),
            "similarProblems": [],
            "priority": "MEDIUM",
            "status": "SUBMITTED",
            "createdAt": now,
            "updatedAt": now,
        })

    result = database.problems.insert_many(documents)
    print(f"removed {removed} previous Step 7 test problems")
    print(f"inserted {len(result.inserted_ids)} Step 7 AI test problems into {database_name}")
    client.close()


if __name__ == "__main__":
    main()
