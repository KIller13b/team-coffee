import { FileText, Calendar, X, Building2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { CitationSource } from '../../../types/assistant';

interface CitationSourceModalProps {
  citation: CitationSource | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CitationSourceModal: React.FC<CitationSourceModalProps> = ({
  citation,
  isOpen,
  onClose,
}) => {
  if (!citation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={citation.sectionOrClause || citation.contractName || 'Citation Source'}
      subtitle={`Source: ${citation.sourceType.replace('_', ' ')} (${citation.id})`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1D344B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
              {citation.sourceType === 'contract_clause' ? (
                <FileText className="w-4 h-4 text-teal-300" />
              ) : citation.sourceType === 'company_record' ? (
                <Building2 className="w-4 h-4 text-amber-300" />
              ) : (
                <Calendar className="w-4 h-4 text-blue-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-teal-300">
                  {citation.sourceType.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#081727] text-[#94A3B8] border border-[#1D344B]">
                  {citation.id}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#F1F5F9] mt-0.5">
                {citation.sectionOrClause || citation.contractName || 'Source Reference'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#10263B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#081727] border border-[#1D344B] text-[11px]">
          {citation.contractId && (
            <div>
              <span className="text-[#94A3B8] block">Contract ID:</span>
              <span className="font-mono font-bold text-[#F1F5F9]">{citation.contractId}</span>
            </div>
          )}
          {citation.eventOrRecordId && (
            <div>
              <span className="text-[#94A3B8] block">Event ID:</span>
              <span className="font-mono font-bold text-amber-300">{citation.eventOrRecordId}</span>
            </div>
          )}
          {citation.date && (
            <div>
              <span className="text-[#94A3B8] block">Document Date:</span>
              <span className="font-mono text-[#F1F5F9]">{citation.date}</span>
            </div>
          )}
          <div>
            <span className="text-[#94A3B8] block">Confidence:</span>
            <span className="font-mono text-teal-300 font-bold">
              {Math.round(citation.confidence * 100)}% Verified
            </span>
          </div>
          {citation.documentId && (
            <div>
              <span className="text-[#94A3B8] block">Source Document:</span>
              <span className="font-mono text-[#94A3B8]">{citation.documentId}</span>
            </div>
          )}
        </div>

        {/* Verbatim Excerpt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#94A3B8]">Verbatim Source Excerpt:</span>
            <span className="text-[10px] font-mono text-teal-400">Exact Match</span>
          </div>
          <div className="p-4 rounded-xl bg-[#081727] border border-[#1D344B] font-mono text-xs text-[#E2E8F0] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-text">
            {citation.verbatimExcerpt}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1D344B] text-[11px] text-[#64748B]">
          <span>Grounded in Odin Evidence Repository</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#10263B] text-xs font-medium text-[#F1F5F9] hover:bg-[#1D344B] transition-colors"
          >
            Close Citation
          </button>
        </div>
      </div>
    </Modal>
  );
};
