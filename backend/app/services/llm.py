"""
LLM Client Service for Odin War Room
Uses Groq API for rapid inference when GROQ_API_KEY is configured.
Standard library urllib implementation: zero extra pip dependencies required.
"""

import os
import json
import urllib.request
from typing import Optional, Dict, Any, List

class LLMService:
    def __init__(self):
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"

    @property
    def api_key(self) -> Optional[str]:
        return os.getenv("GROQ_API_KEY")

    @property
    def model(self) -> str:
        return os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")

    @property
    def is_available(self) -> bool:
        return bool(self.api_key)

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 500,
        temperature: float = 0.2
    ) -> Optional[str]:
        """Generates completion using Groq."""
        if not self.is_available:
            return None

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            self.api_url,
            data=data,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Odin-Contract-Intelligence/1.0"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"[LLMService] Groq API call error: {e}")
            return None

llm_service = LLMService()
