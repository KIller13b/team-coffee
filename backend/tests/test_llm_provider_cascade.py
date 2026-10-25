import os
import pytest
from unittest.mock import patch, MagicMock
from app.services.llm import LLMService

def test_provider_priority_order_defaults():
    """Verify that default priority order is strictly Claude -> Groq -> Gemini -> OpenAI."""
    service = LLMService()
    assert service.provider_order == ["claude", "groq", "gemini", "openai"]

def test_claude_selected_first_when_configured():
    """Verify that Claude is prioritized when multiple keys are present."""
    service = LLMService()
    with patch.dict(os.environ, {
        "ANTHROPIC_API_KEY": "test-claude-key",
        "GROQ_API_KEY": "test-groq-key",
        "GEMINI_API_KEY": "test-gemini-key",
        "OPENAI_API_KEY": "test-openai-key"
    }):
        assert service.provider == "claude"
        assert service.configured_providers == ["claude", "groq", "gemini", "openai"]
        assert service.model == "claude-3-5-sonnet-20241022"

def test_groq_selected_when_claude_missing():
    """Verify that Groq is chosen when Claude key is not present."""
    service = LLMService()
    with patch.dict(os.environ, {
        "ANTHROPIC_API_KEY": "",
        "CLAUDE_API_KEY": "",
        "GROQ_API_KEY": "test-groq-key",
        "GEMINI_API_KEY": "test-gemini-key",
        "OPENAI_API_KEY": "test-openai-key"
    }):
        assert service.provider == "groq"
        assert service.configured_providers == ["groq", "gemini", "openai"]

def test_gemini_selected_when_claude_and_groq_missing():
    """Verify that Gemini is chosen when Claude and Groq are not present."""
    service = LLMService()
    with patch.dict(os.environ, {
        "ANTHROPIC_API_KEY": "",
        "CLAUDE_API_KEY": "",
        "GROQ_API_KEY": "",
        "GEMINI_API_KEY": "test-gemini-key",
        "OPENAI_API_KEY": "test-openai-key"
    }):
        assert service.provider == "gemini"
        assert service.configured_providers == ["gemini", "openai"]

def test_openai_selected_when_all_precedents_missing():
    """Verify that OpenAI is chosen as the final fallback."""
    service = LLMService()
    with patch.dict(os.environ, {
        "ANTHROPIC_API_KEY": "",
        "CLAUDE_API_KEY": "",
        "GROQ_API_KEY": "",
        "GEMINI_API_KEY": "",
        "GOOGLE_API_KEY": "",
        "OPENAI_API_KEY": "test-openai-key"
    }):
        assert service.provider == "openai"
        assert service.configured_providers == ["openai"]

def test_runtime_cascading_fallback_on_failure():
    """Verify runtime fallback: if Claude throws an exception, Groq is tried next."""
    service = LLMService()
    
    with patch.dict(os.environ, {
        "ANTHROPIC_API_KEY": "dummy-claude-key",
        "GROQ_API_KEY": "dummy-groq-key"
    }):
        # Mock _call_claude to raise an error
        def fail_claude(*args, **kwargs):
            raise ConnectionError("Claude API unreachable / rate limited")

        # Mock _call_groq to succeed
        def succeed_groq(*args, **kwargs):
            return "Response from Groq fallback", 20, 15

        with patch.object(service, "_call_claude", side_effect=fail_claude):
            with patch.object(service, "_call_groq", side_effect=succeed_groq):
                res = service.generate("Hello world")
                assert res == "Response from Groq fallback"
                assert service.provider == "groq"

def test_full_cascade_down_to_openai():
    """Verify runtime cascade: Claude -> Groq -> Gemini all fail, OpenAI succeeds."""
    service = LLMService()
    
    with patch.dict(os.environ, {
        "ANTHROPIC_API_KEY": "dummy-claude",
        "GROQ_API_KEY": "dummy-groq",
        "GEMINI_API_KEY": "dummy-gemini",
        "OPENAI_API_KEY": "dummy-openai"
    }):
        with patch.object(service, "_call_claude", side_effect=RuntimeError("Claude 500")):
            with patch.object(service, "_call_groq", side_effect=RuntimeError("Groq 429")):
                with patch.object(service, "_call_gemini", side_effect=RuntimeError("Gemini 503")):
                    with patch.object(service, "_call_openai", return_value=("Response from OpenAI final fallback", 10, 10)):
                        res = service.generate("Test prompt")
                        assert res == "Response from OpenAI final fallback"
                        assert service.provider == "openai"
