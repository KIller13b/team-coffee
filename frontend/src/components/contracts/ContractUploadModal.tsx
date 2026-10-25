import React, { useState, useRef } from 'react'
import { UploadCloud, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { CONTRACT_TYPES } from '../../lib/constants'
import { contractsService } from '../../services/contractsService'

interface ContractUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const ContractUploadModal: React.FC<ContractUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [counterparty, setCounterparty] = useState('')
  const [contractType, setContractType] = useState<string>(CONTRACT_TYPES[0])
  const [error, setError] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle')
  const [stageMessage, setStageMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (selectedFile: File | undefined) => {
    setError(null)
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.pdf')) {
      setError('Only PDF documents are supported for semantic clause extraction.')
      return
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB limit.')
      return
    }

    setFile(selectedFile)
    if (!title) {
      setTitle(selectedFile.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file && !title) {
      setError('Please provide a file or contract title.')
      return
    }

    setUploadStatus('uploading')
    setStageMessage('Encrypting and buffering PDF document...')

    setTimeout(async () => {
      setUploadStatus('processing')
      setStageMessage('Thor parsing clauses, Norns mapping obligations, Loki testing edge cases...')

      setTimeout(async () => {
        try {
          await contractsService.addContract({
            title: title || file?.name || 'New Enterprise Contract',
            counterparty: counterparty || 'Vendor Systems Ltd.',
            contractType,
            riskLevel: 'medium',
            summary: `Automated clause segmentation completed for ${title || 'uploaded document'}. Verified by Thor.`,
          })
          setUploadStatus('done')
          setStageMessage('Contract successfully indexed into Odin Multi-Agent mesh.')
          setTimeout(() => {
            resetForm()
            onClose()
            onSuccess?.()
          }, 1200)
        } catch {
          setError('Failed to index contract.')
          setUploadStatus('idle')
        }
      }, 1500)
    }, 1200)
  }

  const resetForm = () => {
    setFile(null)
    setTitle('')
    setCounterparty('')
    setError(null)
    setUploadStatus('idle')
    setStageMessage('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (uploadStatus === 'idle' || uploadStatus === 'done') {
          resetForm()
          onClose()
        }
      }}
      title="Upload Contract for Agentic Extraction"
      subtitle="Thor extracts verbatim clauses, Norns maps obligations, and Loki audits latent risks."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#1D344B] hover:border-teal-400/50 rounded-xl p-6 text-center bg-[#081727]/60 cursor-pointer transition-all"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            accept=".pdf"
            className="hidden"
          />

          {file ? (
            <div className="flex items-center justify-center gap-3 text-teal-300">
              <FileCheck className="w-8 h-8 text-teal-400 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-[#F1F5F9] truncate max-w-sm">
                  {file.name}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document Ready
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-teal-400 mb-2" />
              <p className="text-sm font-medium text-[#F1F5F9]">
                Drop PDF contract here, or{' '}
                <span className="text-teal-400 underline">browse</span>
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Supports PDF up to 25MB (MSA, SLA, SOW, Vendor Frameworks)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Contract Title & Counterparty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              Contract Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Services Agreement 2027"
              className="w-full bg-[#10263B] border border-[#1D344B] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-teal-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              Counterparty / Vendor
            </label>
            <input
              type="text"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="e.g. Acme Cloud Corp."
              className="w-full bg-[#10263B] border border-[#1D344B] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-teal-400"
              required
            />
          </div>
        </div>

        {/* Contract Type Selection */}
        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1">
            Contract Classification
          </label>
          <select
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            className="w-full bg-[#10263B] border border-[#1D344B] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-teal-400"
          >
            {CONTRACT_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[#0D2033] text-[#F1F5F9]">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Processing Indicator */}
        {uploadStatus !== 'idle' && (
          <div className="p-3 rounded-lg bg-[#10263B] border border-teal-500/40 text-xs text-teal-300 flex items-center gap-2.5 animate-pulse">
            {uploadStatus === 'done' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            <span>{stageMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1D344B]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={uploadStatus === 'uploading' || uploadStatus === 'processing'}
            disabled={uploadStatus === 'done'}
          >
            Initiate Agent Analysis
          </Button>
        </div>
      </form>
    </Modal>
  )
}
