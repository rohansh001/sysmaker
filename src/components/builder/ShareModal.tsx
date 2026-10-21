import React, { useState, useEffect } from 'react';
import { Build } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { encodeBuildToQueryString } from '@/engine/shareCodec';
import { Copy, Check, Share2, AlertCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: Build;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, build }) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const code = encodeBuildToQueryString(build);
      const url = `${window.location.origin}/builder?config=${code}`;
      setShareUrl(url);
    }
  }, [isOpen, build]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share PC Configuration"
      description="Anyone with this unique link can load your exact components into System Maker Core India."
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-charcoal-300 block mb-1.5">
            Shareable URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 bg-charcoal-800 border border-charcoal-700 rounded-lg text-xs text-white font-mono select-all focus:outline-none focus:border-magenta-500"
            />
            <Button
              variant={copied ? 'secondary' : 'primary'}
              size="sm"
              icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 text-xs text-charcoal-400 flex items-start gap-2 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-magenta-400 shrink-0 mt-0.5" />
          <span>
            Configuration data is safely compressed directly into the URL parameters. No private accounts, cookies, or remote server storage required.
          </span>
        </div>
      </div>
    </Modal>
  );
};
