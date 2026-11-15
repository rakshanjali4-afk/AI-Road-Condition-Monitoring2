import unittest
from app import determine_road_condition


class TestRoadConditionLogic(unittest.TestCase):
    def test_only_lmv_returns_inconclusive(self):
        """User's bug scenario: Pothole image detected only 2 LMVs."""
        detections = [
            {"name": "LMV", "confidence": 88.5},
            {"name": "LMV", "confidence": 92.1},
        ]
        condition, score = determine_road_condition(detections)
        self.assertEqual(condition, "ANALYSIS INCONCLUSIVE")
        self.assertIsNone(score, "Score must be None when condition is inconclusive")

    def test_traffic_classes_not_treated_as_safe_evidence(self):
        """HMVs and pedestrians must not trigger GOOD or 100/100."""
        detections = [
            {"name": "HMV", "confidence": 78.0},
            {"name": "Pedestrian", "confidence": 82.5},
        ]
        condition, score = determine_road_condition(detections)
        self.assertEqual(condition, "ANALYSIS INCONCLUSIVE")
        self.assertIsNone(score)

    def test_empty_detections_returns_inconclusive(self):
        """Zero detections cannot confirm good road."""
        condition, score = determine_road_condition([])
        self.assertEqual(condition, "ANALYSIS INCONCLUSIVE")
        self.assertIsNone(score)

    def test_single_road_damage_returns_bad_and_deducts_score(self):
        """RoadDamages detected triggers BAD and score deduction."""
        detections = [{"name": "RoadDamages", "confidence": 75.0}]
        condition, score = determine_road_condition(detections)
        self.assertEqual(condition, "BAD")
        self.assertEqual(score, 80)

    def test_multiple_road_damages_returns_bad_and_deducts_further(self):
        """Multiple RoadDamages detected further reduces score."""
        detections = [
            {"name": "RoadDamages", "confidence": 75.0},
            {"name": "RoadDamages", "confidence": 80.0},
            {"name": "RoadDamages", "confidence": 82.0},
        ]
        condition, score = determine_road_condition(detections)
        self.assertEqual(condition, "BAD")
        self.assertEqual(score, 40)

    def test_unsurfaced_road_returns_bad(self):
        """UnsurfacedRoad detected triggers BAD."""
        detections = [{"name": "UnsurfacedRoad", "confidence": 89.0}]
        condition, score = determine_road_condition(detections)
        self.assertEqual(condition, "BAD")
        self.assertEqual(score, 80)

    def test_speed_bump_alone_returns_moderate(self):
        """SpeedBump alone triggers MODERATE (caution)."""
        detections = [{"name": "SpeedBump", "confidence": 84.0}]
        condition, score = determine_road_condition(detections)
        self.assertEqual(condition, "MODERATE")
        self.assertEqual(score, 95)

    def test_mixed_traffic_and_damage(self):
        """Traffic plus damage still triggers BAD and ignores traffic in score."""
        detections = [
            {"name": "LMV", "confidence": 95.0},
            {"name": "RoadDamages", "confidence": 70.0},
        ]
        condition, score = determine_road_condition(detections)
        self.assertEqual(condition, "BAD")
        self.assertEqual(score, 80)

    def test_invalid_input_handled_safely(self):
        """Non-list input does not throw and returns inconclusive."""
        condition, score = determine_road_condition(None)
        self.assertEqual(condition, "ANALYSIS INCONCLUSIVE")
        self.assertIsNone(score)


if __name__ == "__main__":
    unittest.main()
