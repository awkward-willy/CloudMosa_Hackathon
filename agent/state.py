from typing import TypedDict, List, Optional
from langchain_core.messages import BaseMessage

class AgentState(TypedDict, total=False):
    messages: List[BaseMessage]
    dataset_path: Optional[str]
    last_response: Optional[str]
    _df: object  # 內部用，放 pandas DataFrame
