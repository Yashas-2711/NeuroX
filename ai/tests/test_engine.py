import unittest

from engine.models import engine
from engine.similarity import DUPLICATE_THRESHOLD, RELATED_THRESHOLD, find_similar_problems, relationship_for


class LocalEngineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        engine.load()

    def test_classification(self):
        result = engine.classify("Farmers in rural areas are facing a shortage of reliable irrigation water during the summer season.")
        self.assertIn(result["category"], {"education", "health", "agriculture", "water_resources", "sanitation", "environment", "livelihoods", "accessibility", "infrastructure", "public_services"})
        self.assertGreaterEqual(result["confidence"], 0)
        self.assertLessEqual(result["confidence"], 1)

    def test_embedding_dimension(self):
        self.assertEqual(len(engine.embed("Many villages have limited access to clean drinking water.")), 384)

    def test_similarity_relationships(self):
        first = engine.embed("Village residents do not have enough clean drinking water.")
        second = engine.embed("People in rural villages are facing problems accessing safe drinking water.")
        score = sum(a * b for a, b in zip(first, second))
        self.assertGreaterEqual(score, -1)
        self.assertLessEqual(score, 1)
        self.assertIn(relationship_for(score), {"duplicate", "related", "different"})
        matches = find_similar_problems(first, [{"problemId": "related-example", "embedding": second}])
        self.assertEqual(matches["matches"][0]["problemId"], "related-example")

    def test_unrelated_similarity_is_calculated(self):
        first = engine.embed("Village residents do not have enough clean drinking water.")
        unrelated = engine.embed("Students need better access to digital learning resources.")
        result = find_similar_problems(first, [{"problemId": "unrelated-example", "embedding": unrelated}])
        self.assertIsInstance(result["matches"][0]["similarity"], float)

    def test_thresholds(self):
        self.assertEqual(relationship_for(DUPLICATE_THRESHOLD), "duplicate")
        self.assertEqual(relationship_for(RELATED_THRESHOLD), "related")
        self.assertEqual(relationship_for(RELATED_THRESHOLD - 0.001), "different")


if __name__ == "__main__":
    unittest.main()
