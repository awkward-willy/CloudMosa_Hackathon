import json
from typing import Any, Dict, List

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage

from graph.agent_graph import app as agent_app
from state import AgentState
from tools.financial_tips import generate_financial_tip


class TipModel:
    """Model for handling daily tip operations."""

    @staticmethod
    def generate_daily_tip(user_uuid: str) -> str:
        """
        Generate a daily financial tip for a user.

        Args:
            user_uuid: Unique identifier for the user

        Returns:
            Formatted tip text
        """
        # Generate tip using the financial tips tool
        result = generate_financial_tip.invoke({"locale": "en", "theme": "budgeting"})

        # Format the tip for better display
        return TipModel._format_tip_result(result)

    @staticmethod
    def _format_tip_result(result: str) -> str:
        """Format the tip result for better display."""
        try:
            data = json.loads(result)
            title = data.get("title", "").strip()
            body = data.get("body", "").strip()
            tags = ", ".join(data.get("tags", []))
            level = data.get("reading_level", "")

            parts = []
            if title:
                parts.append(f"**{title}**")
            if body:
                parts.append(body)

            meta = []
            if tags:
                meta.append(f"Tags: {tags}")
            if level:
                meta.append(f"Level: {level}")
            if meta:
                parts.append(" · ".join(meta))

            pretty = "\n\n".join(parts).strip()
            return pretty or result
        except Exception:
            return result


class AdviceModel:
    """Model for handling financial advice operations."""

    @staticmethod
    def generate_financial_advice(
        user_uuid: str, transactions: List[Dict[str, Any]]
    ) -> str:
        """
        Generate personalized financial advice based on user's transactions.

        Args:
            user_uuid: Unique identifier for the user
            transactions: List of transaction dictionaries

        Returns:
            Personalized financial advice text
        """
        # Create initial state with user's transaction data
        user_message = f"""Please analyze my transactions and provide financial advice.
Here are my recent transactions: {json.dumps(transactions, indent=2)}"""

        init_msg = HumanMessage(content="Dataset loaded and ready.")
        user_msg = HumanMessage(content=user_message)

        state: AgentState = {"messages": [init_msg, user_msg]}

        # Invoke the agent
        final_state = agent_app.invoke(state)

        # Extract the AI's advice from the final state
        advice = AdviceModel._get_last_ai_message(list(final_state["messages"]))

        return advice.strip() if advice else "Unable to generate advice at this time."

    @staticmethod
    def _get_last_ai_message(messages: List[BaseMessage]) -> str:
        """Return the most recent AI message content."""
        for m in reversed(messages):
            if isinstance(m, AIMessage):
                content = m.content
                if isinstance(content, str):
                    return content
                elif isinstance(content, list):
                    # If content is a list, join string elements and ignore dicts
                    str_items = [item for item in content if isinstance(item, str)]
                    return "\n".join(str_items)
                # If content is neither str nor list, fallback to empty string
                return ""
        return ""


class TransactionModel:
    """Model for handling transaction operations."""

    @staticmethod
    def convert_to_dict_list(transactions: List[Any]) -> List[Dict[str, Any]]:
        """Convert Pydantic transaction models to dictionary format."""
        return [tx.model_dump() for tx in transactions]

    @staticmethod
    def validate_transactions(transactions: List[Dict[str, Any]]) -> bool:
        """Validate transaction data structure."""
        required_fields = ["income", "description", "amount", "type"]

        for transaction in transactions:
            # Check if all required fields are present
            if not all(field in transaction for field in required_fields):
                return False

            # Validate amount is positive
            if (
                not isinstance(transaction["amount"], (int, float))
                or transaction["amount"] <= 0
            ):
                return False

            # Validate income is boolean
            if not isinstance(transaction["income"], bool):
                return False

        return True
