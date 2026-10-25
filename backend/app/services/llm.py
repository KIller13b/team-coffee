"""
LLM Client Service for Odin War Room.
Multi-provider fallback cascade with strict priority:
1. Claude (Anthropic)
2. Groq
3. Gemini (Google)
4. OpenAI

Zero external pip dependencies: implemented using Python standard library (urllib).
Gracefully falls back to the next provider if any provider fails, rate limits, or is unconfigured.
"""

import os
import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List, Callable, Tuple


class LLMService:
    PROVIDER_PRIORITY = ["claude", "groq", "gemini", "openai"]

    def __init__(self):
        self._mock_handler: Optional[Callable[[str, Optional[str]], Optional[str]]] = None
        self.total_prompt_tokens = 0
        self.total_completion_tokens = 0
        self._last_successful_provider: Optional[str] = None

    @property
    def provider_order(self) -> List[str]:
        env_order = os.getenv("LLM_PROVIDER_ORDER")
        if env_order:
            custom = [p.strip().lower() for p in env_order.split(",") if p.strip()]
            if custom:
                return custom
        return self.PROVIDER_PRIORITY

    def get_api_key(self, provider: str) -> Optional[str]:
        p = provider.lower()
        if p in ("claude", "anthropic"):
            return os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
        elif p == "groq":
            return os.getenv("GROQ_API_KEY")
        elif p in ("gemini", "google"):
            return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        elif p == "openai":
            return os.getenv("OPENAI_API_KEY")
        return None

    def get_model(self, provider: str) -> str:
        p = provider.lower()
        if p in ("claude", "anthropic"):
            return os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")
        elif p == "groq":
            return os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        elif p in ("gemini", "google"):
            return os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        elif p == "openai":
            return os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        return "default"

    @property
    def configured_providers(self) -> List[str]:
        return [p for p in self.provider_order if bool(self.get_api_key(p))]

    @property
    def api_key(self) -> Optional[str]:
        """Returns the primary configured API key following the priority chain."""
        for p in self.provider_order:
            k = self.get_api_key(p)
            if k:
                return k
        return None

    @property
    def provider(self) -> str:
        """Returns the currently active or top priority configured provider."""
        if self._last_successful_provider:
            return self._last_successful_provider
        for p in self.provider_order:
            if self.get_api_key(p):
                return p
        return "none"

    @property
    def model(self) -> str:
        """Returns the model for the active provider."""
        return self.get_model(self.provider)

    @property
    def is_available(self) -> bool:
        """True if any priority provider is configured with an API key, or mock handler is installed."""
        return bool(self.configured_providers) or (self._mock_handler is not None)

    def set_mock_handler(self, handler: Optional[Callable[[str, Optional[str]], Optional[str]]]):
        """Injects a deterministic mock handler for unit and regression testing."""
        self._mock_handler = handler

    def clear_mock_handler(self):
        """Clears the mock handler."""
        self._mock_handler = None

    def get_status(self) -> Dict[str, Any]:
        """Returns provider connectivity and priority status without exposing secrets."""
        return {
            "provider": self.provider,
            "priority_order": self.provider_order,
            "configured_providers": self.configured_providers,
            "configured": bool(self.configured_providers),
            "is_mocked": self._mock_handler is not None,
            "is_available": self.is_available,
            "model": self.model if self.is_available else None,
            "total_tokens_used": self.total_prompt_tokens + self.total_completion_tokens
        }

    # -------------------------------------------------------------
    # Provider-Specific Call Handlers
    # -------------------------------------------------------------

    def _call_claude(
        self,
        api_key: str,
        prompt: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float,
        timeout: int
    ) -> Tuple[str, int, int]:
        model = self.get_model("claude")
        url = "https://api.anthropic.com/v1/messages"

        payload: Dict[str, Any] = {
            "model": model,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature
        }
        if system_prompt:
            payload["system"] = system_prompt

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
                "user-agent": "Odin-Contract-Intelligence/1.0"
            },
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=timeout) as response:
            result = json.loads(response.read().decode("utf-8"))
            text = ""
            for block in result.get("content", []):
                if block.get("type") == "text":
                    text += block.get("text", "")
            usage = result.get("usage", {})
            prompt_toks = usage.get("input_tokens", len(prompt) // 4)
            comp_toks = usage.get("output_tokens", len(text) // 4)
            return text.strip(), prompt_toks, comp_toks

    def _call_groq(
        self,
        api_key: str,
        prompt: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float,
        timeout: int
    ) -> Tuple[str, int, int]:
        model = self.get_model("groq")
        url = "https://api.groq.com/openai/v1/chat/completions"

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Odin-Contract-Intelligence/1.0"
            },
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=timeout) as response:
            result = json.loads(response.read().decode("utf-8"))
            text = result["choices"][0]["message"]["content"].strip()
            usage = result.get("usage", {})
            prompt_toks = usage.get("prompt_tokens", len(prompt) // 4)
            comp_toks = usage.get("completion_tokens", len(text) // 4)
            return text, prompt_toks, comp_toks

    def _call_gemini(
        self,
        api_key: str,
        prompt: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float,
        timeout: int
    ) -> Tuple[str, int, int]:
        model = self.get_model("gemini")
        # Use Google Generative Language OpenAI-compatible endpoint
        url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Odin-Contract-Intelligence/1.0"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                result = json.loads(response.read().decode("utf-8"))
                text = result["choices"][0]["message"]["content"].strip()
                usage = result.get("usage", {})
                prompt_toks = usage.get("prompt_tokens", len(prompt) // 4)
                comp_toks = usage.get("completion_tokens", len(text) // 4)
                return text, prompt_toks, comp_toks
        except Exception:
            # Secondary fallback: Gemini Native REST generateContent endpoint
            native_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            native_payload: Dict[str, Any] = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens
                }
            }
            if system_prompt:
                native_payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

            native_data = json.dumps(native_payload).encode("utf-8")
            native_req = urllib.request.Request(
                native_url,
                data=native_data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(native_req, timeout=timeout) as response:
                native_res = json.loads(response.read().decode("utf-8"))
                text = native_res["candidates"][0]["content"]["parts"][0]["text"].strip()
                return text, len(prompt) // 4, len(text) // 4

    def _call_openai(
        self,
        api_key: str,
        prompt: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float,
        timeout: int
    ) -> Tuple[str, int, int]:
        model = self.get_model("openai")
        base = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
        url = f"{base.rstrip('/')}/chat/completions"

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Odin-Contract-Intelligence/1.0"
            },
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=timeout) as response:
            result = json.loads(response.read().decode("utf-8"))
            text = result["choices"][0]["message"]["content"].strip()
            usage = result.get("usage", {})
            prompt_toks = usage.get("prompt_tokens", len(prompt) // 4)
            comp_toks = usage.get("completion_tokens", len(text) // 4)
            return text, prompt_toks, comp_toks

    def _dispatch_provider(
        self,
        provider: str,
        api_key: str,
        prompt: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float,
        timeout: int
    ) -> Tuple[str, int, int]:
        p = provider.lower()
        if p in ("claude", "anthropic"):
            return self._call_claude(api_key, prompt, system_prompt, max_tokens, temperature, timeout)
        elif p == "groq":
            return self._call_groq(api_key, prompt, system_prompt, max_tokens, temperature, timeout)
        elif p in ("gemini", "google"):
            return self._call_gemini(api_key, prompt, system_prompt, max_tokens, temperature, timeout)
        elif p == "openai":
            return self._call_openai(api_key, prompt, system_prompt, max_tokens, temperature, timeout)
        raise ValueError(f"Unknown LLM provider: {provider}")

    # -------------------------------------------------------------
    # Primary Generation with Priority Cascading Fallback
    # -------------------------------------------------------------

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 800,
        temperature: float = 0.2,
        timeout: int = 15
    ) -> Optional[str]:
        """
        Generates completion adhering strictly to priority:
        Claude -> Groq -> Gemini -> OpenAI -> Deterministic Fallback.
        """
        # 1. Deterministic test mock handler hook
        if self._mock_handler is not None:
            mock_res = self._mock_handler(prompt, system_prompt)
            if mock_res is not None:
                self.total_prompt_tokens += len(prompt) // 4
                self.total_completion_tokens += len(mock_res) // 4
            return mock_res

        # 2. Priority Provider Cascade
        for provider in self.provider_order:
            api_key = self.get_api_key(provider)
            if not api_key:
                continue

            try:
                text, p_toks, c_toks = self._dispatch_provider(
                    provider=provider,
                    api_key=api_key,
                    prompt=prompt,
                    system_prompt=system_prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    timeout=timeout
                )
                self.total_prompt_tokens += p_toks
                self.total_completion_tokens += c_toks
                self._last_successful_provider = provider
                return text
            except urllib.error.HTTPError as e:
                err_detail = ""
                try:
                    err_detail = e.read().decode("utf-8")[:120]
                except Exception:
                    pass
                print(f"[LLMService] Provider '{provider}' HTTP {e.code} error: {err_detail}. Cascading to next provider in priority chain.")
            except urllib.error.URLError as e:
                print(f"[LLMService] Provider '{provider}' network/timeout error: {e.reason}. Cascading to next provider in priority chain.")
            except Exception as e:
                print(f"[LLMService] Provider '{provider}' invocation failed: {e}. Cascading to next provider in priority chain.")

        # 3. All configured providers failed or none configured
        return None

    def structured_json_generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.1,
        timeout: int = 15
    ) -> Optional[Any]:
        """Generates completion and parses it into JSON."""
        sys = (system_prompt or "") + "\nYou MUST return strictly valid JSON. Do not include markdown commentary."
        raw = self.generate(
            prompt=prompt,
            system_prompt=sys.strip(),
            max_tokens=max_tokens,
            temperature=temperature,
            timeout=timeout
        )
        if not raw:
            return None

        cleaned = raw.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except Exception as e:
            print(f"[LLMService] Failed to parse JSON response: {e}")
            return None


llm_service = LLMService()
