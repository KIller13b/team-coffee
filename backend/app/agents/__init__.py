"""
Odin Multi-Agent Intelligence System
System Architecture:
                 CONTRACT
                    │
                    ▼
                  THOR ("What does it say?")
                    │
                    ▼
          ┌───────────────────┐
          │                   │
          ▼                   ▼
        NORNS ("WHEN?")      LOKI ("WHAT CAN GO WRONG?")
          │                   │
          │                   ▼
          │              Risk/Claim
          │                   │
          │                   ▼
          │              HEIMDALL ◄──────── REAL-WORLD EVENTS
          │           ("IS THIS ACTUALLY
          │             HAPPENING?")
          │                   │
          │             ┌─────┴─────┐
          │             │           │
          │            YES          NO
          │             │           │
          │             │           ▼
          │             │          TYR ("Resolve dispute")
          │             │           │
          └─────────────┴───────────┘
                        │
                        ▼
                       ODIN
                        │
                        ▼
                 FINAL ACTION
"""

from app.agents.base import (
    BaseAgent,
    Citation,
    ExtractedClause,
    ExtractedObligation,
    ThorOutput,
    NornsTimelineItem,
    NornsOutput,
    LokiRiskClaim,
    LokiOutput,
    HeimdallVerification,
    HeimdallOutput,
    TyrArbitrationRuling,
    TyrOutput,
    FinalActionItem,
    OdinSynthesisOutput,
    WorkflowExecutionResult
)

from app.agents.thor import ThorAgent
from app.agents.norns import NornsAgent
from app.agents.loki import LokiAgent
from app.agents.heimdall import HeimdallAgent
from app.agents.tyr import TyrAgent
from app.agents.odin import OdinAgent
from app.agents.workflow import ContractWarRoomWorkflow, load_dataset_bundle

__all__ = [
    "BaseAgent",
    "Citation",
    "ExtractedClause",
    "ExtractedObligation",
    "ThorOutput",
    "NornsTimelineItem",
    "NornsOutput",
    "LokiRiskClaim",
    "LokiOutput",
    "HeimdallVerification",
    "HeimdallOutput",
    "TyrArbitrationRuling",
    "TyrOutput",
    "FinalActionItem",
    "OdinSynthesisOutput",
    "WorkflowExecutionResult",
    "ThorAgent",
    "NornsAgent",
    "LokiAgent",
    "HeimdallAgent",
    "TyrAgent",
    "OdinAgent",
    "ContractWarRoomWorkflow",
    "load_dataset_bundle"
]
