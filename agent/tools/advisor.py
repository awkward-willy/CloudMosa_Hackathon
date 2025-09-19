from typing import Dict, List
import pandas as pd

class Advisor:
    def advise(self, m: Dict[str, float]) -> List[str]:
        tips: List[str] = []
        sr = m.get("savings_rate", 0.0)
        if sr < 0.2:
            tips.append(
                f"Savings rate {sr:.1%} is below the 20% target. "
                "Set up an automatic transfer of at least 10% of income."
            )
        food_spend = -m.get("cat::Food", 0.0)
        if food_spend > 0.25 * m.get("expense", 1):
            tips.append(
                "Food spending exceeds 25% of total expenses. "
                "Plan meals or buy in bulk to cut 10%."
            )
        shopping_spend = -m.get("cat::Shopping", 0.0)
        if shopping_spend > 0.15 * m.get("expense", 1):
            tips.append(
                "Shopping exceeds 15% of total expenses. "
                "Introduce a 30-day cooling-off rule."
            )
        return tips
