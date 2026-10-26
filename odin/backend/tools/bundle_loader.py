"""
Bundle Loader — reads and validates the odin_dev_pack bundle.
Provides clean access to all contract text, events, ledger, holidays, clock.
"""

from __future__ import annotations
import csv
import json
import os
from pathlib import Path
from typing import Any, Dict, Iterator, List


BUNDLE_ROOT = Path(__file__).parent.parent.parent.parent / "Pack" / "odin_dev_pack"


def bundle_path(*parts: str) -> Path:
    return BUNDLE_ROOT / "bundle" / Path(*parts)


def load_clock() -> Dict[str, Any]:
    with open(BUNDLE_ROOT / "clock.json") as f:
        return json.load(f)


def load_manifest() -> Dict[str, Any]:
    with open(bundle_path("manifest.json")) as f:
        return json.load(f)


def load_company_context() -> str:
    with open(bundle_path("company", "context.txt")) as f:
        return f.read()


def load_contract(doc_id: str) -> str:
    """Load the canonical .txt for a contract by its doc ID (e.g. 'A1')."""
    path = bundle_path("contracts", f"{doc_id}.txt")
    with open(path) as f:
        return f.read()


def load_all_contracts() -> Dict[str, str]:
    contracts_dir = bundle_path("contracts")
    result = {}
    for p in sorted(contracts_dir.glob("*.txt")):
        doc_id = p.stem
        with open(p) as f:
            result[doc_id] = f.read()
    return result


def load_payments_ledger() -> List[Dict[str, str]]:
    rows = []
    with open(bundle_path("data", "payments_ledger.csv"), newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(dict(row))
    return rows


def load_holidays() -> List[Dict[str, str]]:
    rows = []
    with open(bundle_path("data", "holidays.csv"), newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(dict(row))
    return rows


def _safe_jsonl(path: Path) -> Iterator[Dict[str, Any]]:
    """JSONL reader that skips blank / malformed lines (resilient parsing — NFR3)."""
    with open(path) as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as exc:
                # log but never crash (NFR3: graceful handling of malformed events)
                print(f"[BundleLoader] WARN: Skipping malformed event at line {lineno} of {path.name}: {exc}")


def load_events(drop: int = 1) -> List[Dict[str, Any]]:
    """Load event drop 1 or 2."""
    assert drop in (1, 2), "drop must be 1 or 2"
    path = bundle_path("events", f"events_drop{drop}.jsonl")
    return list(_safe_jsonl(path))


def load_all_events() -> List[Dict[str, Any]]:
    return load_events(1) + load_events(2)


# ─── Quick self-test ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    clock = load_clock()
    contracts = load_all_contracts()
    events = load_all_events()
    ledger = load_payments_ledger()
    holidays = load_holidays()

    print(f"Clock:     {clock}")
    print(f"Contracts: {list(contracts.keys())}")
    print(f"Events:    {len(events)}")
    print(f"Ledger:    {len(ledger)} rows")
    print(f"Holidays:  {len(holidays)} rows")
