import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  User,
  History,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { assistantService } from '../../services/assistantService';
import {
  StructuredAnswer,
  CitationSource,
  StoredInvestigationSummary,
} from '../../types/assistant';
import { StructuredAnswerView } from './components/StructuredAnswerView';
import { AgentDebateView } from './components/AgentDebateView';
import { CitationSourceModal } from './components/CitationSourceModal';

interface ChatTurn {
  id: string;
  sender: 'user' | 'odin';
  text?: string;
  answer?: StructuredAnswer;
  timestamp: string;
}

export const ContractAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCitation, setSelectedCitation] = useState<CitationSource | null>(null);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState<boolean>(false);
  const [investigations, setInvestigations] = useState<StoredInvestigationSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'answer' | 'debate'>('answer');
  const [currentAnswer, setCurrentAnswer] = useState<StructuredAnswer | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick preloaded benchmark prompt cards
  const samplePrompts = [
    {
      label: 'Acceptance Test A: Harbor Non-Outage Breach',
      query:
        'Is Quillhub currently in default or material breach of any terms in the Harbor Retail agreement (B1), unrelated to service outages? Cite specific provisions and company records.',
    },
    {
      label: 'Acceptance Test B: March 3 Outage & Recovery Gap (E-04)',
      query:
        "On March 3, 2027, an unscheduled outage occurred (Event E-04). What was Quillhub's platform uptime percentage for March 2027, what financial credits does Quillhub owe its customers, and what credits can it recover from StratoNode?",
    },
    {
      label: 'Pixelwright M3 Deemed Acceptance',
      query:
        'Did Quillhub fall into Pixelwright\'s 14-day deemed acceptance trap on Milestone M3 (Event E-03)? Cite Contract D1 Section 3.2.',
    },
    {
      label: 'Meridian Insurance Expiration Analysis',
      query:
        'What contractual liabilities trigger if Meridian Mutual cyber insurance policies expire without renewal on June 30, 2027?',
    },
  ];

  const loadPastInvestigations = async () => {
    try {
      const res = await assistantService.getInvestigations();
      setInvestigations(res.investigations || []);
    } catch {}
  };

  useEffect(() => {
    loadPastInvestigations();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || isLoading) return;

    const userTurn: ChatTurn = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userTurn]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const answer = await assistantService.askQuestion({ query: q });
      const odinTurn: ChatTurn = {
        id: `odin-${Date.now()}`,
        sender: 'odin',
        answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, odinTurn]);
      setCurrentAnswer(answer);
      loadPastInvestigations();
    } catch (err) {
      console.error('Assistant query failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCitation = (cit: CitationSource) => {
    setSelectedCitation(cit);
    setIsCitationModalOpen(true);
  };

  const handleLoadPastInvestigation = async (id: string) => {
    try {
      setIsLoading(true);
      const full = await assistantService.getInvestigationById(id);
      if (full && full.answer) {
        setCurrentAnswer(full.answer);
        setMessages((prev) => [
          ...prev,
          {
            id: `usr-past-${Date.now()}`,
            sender: 'user',
            text: full.query,
            timestamp: 'Reloaded',
          },
          {
            id: `odin-past-${Date.now()}`,
            sender: 'odin',
            answer: full.answer,
            timestamp: 'Reloaded',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to reload investigation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1D344B]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-teal-300" />
            </div>
            <h1 className="text-xl font-bold text-[#F1F5F9] tracking-tight">
              Contract Intelligence Assistant
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold uppercase">
              Evidence-Grounded
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold uppercase">
              6 Norse Agents
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Investigate contracts using natural language. Every conclusion is deterministically grounded in verified contract clauses, event logs, company context records, and multi-agent debate.
          </p>
        </div>

        {/* View mode toggle */}
        {currentAnswer && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#081727] border border-[#1D344B]">
            <button
              onClick={() => setActiveTab('answer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'answer'
                  ? 'bg-blue-600/25 text-teal-300 font-bold'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              📜 Evidence & Determination
            </button>
            <button
              onClick={() => setActiveTab('debate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'debate'
                  ? 'bg-blue-600/25 text-teal-300 font-bold'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              ⚖️ Agent Debate ({currentAnswer.agentTraces.length} Agents)
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Chat Stream & Investigation Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Conversational Workspace */}
        <div className="lg:col-span-8 space-y-4 flex flex-col">
          {/* Sample Benchmark Question Pills */}
          {messages.length === 0 && (
            <div className="space-y-2.5 p-4 rounded-xl bg-[#0D2033] border border-[#1D344B]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Benchmark Question Templates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePrompts.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSend(p.query)}
                    className="p-3 rounded-lg bg-[#081727] border border-[#1D344B] hover:border-teal-500/40 cursor-pointer transition-all space-y-1 group"
                  >
                    <span className="text-[11px] font-bold text-teal-300 group-hover:text-teal-200 block">
                      {p.label}
                    </span>
                    <p className="text-[10.5px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {p.query}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Stream */}
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[750px] pr-1">
            {messages.map((turn) => (
              <div key={turn.id} className="space-y-3">
                {turn.sender === 'user' ? (
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="p-3.5 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-xs text-[#F1F5F9] max-w-xl leading-relaxed select-text">
                      <div className="flex items-center justify-between gap-3 text-[10px] text-teal-300 font-mono mb-1">
                        <span className="font-bold">General Counsel</span>
                        <span>{turn.timestamp}</span>
                      </div>
                      {turn.text}
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-teal-300" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {turn.answer && (
                      activeTab === 'answer' ? (
                        <StructuredAnswerView
                          answer={turn.answer}
                          onSelectCitation={handleOpenCitation}
                          onSelectFollowUp={(prompt) => handleSend(prompt)}
                        />
                      ) : (
                        <AgentDebateView
                          agentTraces={turn.answer.agentTraces}
                          debateItems={turn.answer.debateItems}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="p-5 rounded-xl bg-[#0D2033] border border-teal-500/30 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[#94A3B8]">
                  Orchestrating Thor, The Norns, Loki, Heimdall, Tyr, and Odin... Auditing contract clauses & event logs.
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 rounded-xl bg-[#0D2033] border border-[#1D344B] flex items-center gap-2">
            <textarea
              rows={2}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask complex legal/business questions (e.g. 'Is Quillhub in breach of B1 unrelated to outages?' or 'What customer credits are owed for E-04?')..."
              className="flex-1 bg-transparent text-xs text-[#F1F5F9] border-none outline-none resize-none placeholder:text-[#64748B]"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSend()}
              disabled={isLoading || !inputQuery.trim()}
              icon={<Send className="w-3.5 h-3.5" />}
              className="text-xs shrink-0"
            >
              Investigate
            </Button>
          </div>
        </div>

        {/* Right 4 Cols: Investigation History & Real-Time Context */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 border-[#1D344B] bg-[#0D2033] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1D344B]/60">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-teal-400" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9]">
                  Recent Multi-Agent Investigations
                </CardTitle>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                {investigations.length} Logged
              </span>
            </div>

            {investigations.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No investigations logged yet. Run a benchmark question to generate evidence-backed determinations.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {investigations.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => handleLoadPastInvestigation(inv.id)}
                    className="p-2.5 rounded-lg bg-[#081727] border border-[#1D344B] hover:border-teal-500/40 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-teal-300">
                        {inv.targetContracts.join(', ') || 'Portfolio'}
                      </span>
                      <span className="text-[9.5px] font-mono text-[#64748B]">
                        {inv.durationMs}ms
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#F1F5F9] line-clamp-2">
                      {inv.query}
                    </h5>
                    <p className="text-[10.5px] text-[#94A3B8] line-clamp-1">
                      {inv.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Norse Council Active Roster Card */}
          <Card className="p-4 border-[#1D344B] bg-[#0D2033] space-y-2.5">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">
              Active Norse Council Intelligence
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                <span className="text-[#94A3B8]">⚡ Thor:</span>
                <span className="font-mono text-teal-300">Verbatim Clause Extraction</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                <span className="text-[#94A3B8]">⏳ The Norns:</span>
                <span className="font-mono text-purple-300">Temporal Countdown & Exposure</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                <span className="text-[#94A3B8]">🔥 Loki:</span>
                <span className="font-mono text-red-400">Adversarial Red-Team Traps</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                <span className="text-[#94A3B8]">👁️ Heimdall:</span>
                <span className="font-mono text-blue-300">Sentinel Event Log Audit</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                <span className="text-[#94A3B8]">⚖️ Tyr:</span>
                <span className="font-mono text-emerald-300">Binding Dispute Rulings</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#94A3B8]">👑 Odin:</span>
                <span className="font-mono text-amber-300">Executive Action Synthesis</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Citation Source Inspection Modal */}
      <CitationSourceModal
        citation={selectedCitation}
        isOpen={isCitationModalOpen}
        onClose={() => setIsCitationModalOpen(false)}
      />
    </div>
  );
};
