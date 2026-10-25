"""
Contract War Room Workflow Orchestrator
Executes the multi-agent pipeline in the exact topological structure:

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

from datetime import datetime
from typing import List, Dict, Any, Optional
import os
import json

from app.agents.base import WorkflowExecutionResult
from app.agents.thor import ThorAgent
from app.agents.norns import NornsAgent
from app.agents.loki import LokiAgent
from app.agents.heimdall import HeimdallAgent
from app.agents.tyr import TyrAgent
from app.agents.odin import OdinAgent


class ContractWarRoomWorkflow:
    def __init__(self):
        self.thor = ThorAgent()
        self.norns = NornsAgent()
        self.loki = LokiAgent()
        self.heimdall = HeimdallAgent()
        self.tyr = TyrAgent()
        self.odin = OdinAgent()

    def execute(
        self,
        doc_id: str,
        contract_text: str,
        real_world_events: Optional[List[Dict[str, Any]]] = None,
        clock_date: str = "2027-01-15",
        company_context: Optional[str] = None
    ) -> WorkflowExecutionResult:
        """
        Executes the multi-agent graph from CONTRACT to FINAL ACTION.
        """
        started_at = datetime.utcnow().isoformat() + "Z"
        all_logs: List[Dict[str, Any]] = []

        if real_world_events is None:
            real_world_events = []

        # ---------------------------------------------------------
        # STEP 1: THOR — "What does it say?"
        # ---------------------------------------------------------
        thor_output = self.thor.extract(
            doc_id=doc_id,
            contract_text=contract_text,
            context=company_context
        )
        all_logs.extend(self.thor.logs)

        # ---------------------------------------------------------
        # STEP 2 (PARALLEL):
        # A) NORNS — "WHEN?" (Simulated clock, obligations, worst-case timeline)
        # B) LOKI — "WHAT CAN GO WRONG?" (Adversarial risks & claims)
        # ---------------------------------------------------------
        norns_output = self.norns.analyze_timeline(
            thor_output=thor_output,
            current_clock=clock_date
        )
        all_logs.extend(self.norns.logs)

        loki_output = self.loki.challenge(
            thor_output=thor_output
        )
        all_logs.extend(self.loki.logs)

        # ---------------------------------------------------------
        # STEP 3: HEIMDALL ◄── REAL-WORLD EVENTS
        # "IS THIS ACTUALLY HAPPENING?"
        # ---------------------------------------------------------
        heimdall_output = self.heimdall.monitor_and_verify(
            loki_output=loki_output,
            real_world_events=real_world_events
        )
        all_logs.extend(self.heimdall.logs)

        # ---------------------------------------------------------
        # STEP 4: BRANCHING
        # - YES: Materialized real-world breach -> Directly to Odin
        # - NO: Unverified / disputed / collisions -> Sent to TYR
        # ---------------------------------------------------------
        tyr_output = self.tyr.arbitrate_disputes(
            heimdall_output=heimdall_output,
            loki_claims=loki_output.risks_and_claims
        )
        all_logs.extend(self.tyr.logs)

        # ---------------------------------------------------------
        # STEP 5 & 6: ODIN — "Synthesize & Generate FINAL ACTION"
        # ---------------------------------------------------------
        odin_output = self.odin.synthesize_final_actions(
            thor=thor_output,
            norns=norns_output,
            loki=loki_output,
            heimdall=heimdall_output,
            tyr=tyr_output
        )
        all_logs.extend(self.odin.logs)

        completed_at = datetime.utcnow().isoformat() + "Z"

        return WorkflowExecutionResult(
            workflow_id=f"wf-{doc_id}-{int(datetime.utcnow().timestamp())}",
            contract_id=doc_id,
            contract_title=thor_output.title,
            started_at=started_at,
            completed_at=completed_at,
            thor=thor_output,
            norns=norns_output,
            loki=loki_output,
            heimdall=heimdall_output,
            tyr=tyr_output,
            odin=odin_output,
            logs=all_logs
        )


def load_dataset_bundle(bundle_dir: str) -> Dict[str, Any]:
    """Helper utility to load files from odin_data/bundle."""
    data = {
        "contracts": {},
        "events": [],
        "context": "",
        "clock": "2027-01-15"
    }

    # Load context
    ctx_path = os.path.join(bundle_dir, "company", "context.txt")
    if os.path.exists(ctx_path):
        with open(ctx_path, "r", encoding="utf-8") as f:
            data["context"] = f.read()

    # Load contracts
    contracts_dir = os.path.join(bundle_dir, "contracts")
    if os.path.exists(contracts_dir):
        for fname in os.listdir(contracts_dir):
            if fname.endswith(".txt"):
                cid = fname.replace(".txt", "")
                with open(os.path.join(contracts_dir, fname), "r", encoding="utf-8") as f:
                    data["contracts"][cid] = f.read()

    # Load events
    events_dir = os.path.join(bundle_dir, "events")
    if os.path.exists(events_dir):
        for fname in sorted(os.listdir(events_dir)):
            if fname.endswith(".jsonl"):
                with open(os.path.join(events_dir, fname), "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line:
                            try:
                                data["events"].append(json.loads(line))
                            except Exception:
                                pass

    return data
