'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Build } from '@/types';
import { LocalBuildStorage } from '@/storage/localStorage';
import { checkCompatibility } from '@/engine/compatibility';
import { calculatePriceBreakdown, formatINR } from '@/engine/pricing';
import { validateImportedBuildJson } from '@/engine/shareCodec';
import { InrPrice } from '@/components/common/InrPrice';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ShareModal } from '@/components/builder/ShareModal';
import {
  Bookmark,
  Wrench,
  Trash2,
  Edit2,
  Download,
  Share2,
  Upload,
  Calendar,
  Layers,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';

export default function SavedBuildsPage() {
  const router = useRouter();
  const [savedBuilds, setSavedBuilds] = useState<Build[]>([]);
  const [activeShareBuild, setActiveShareBuild] = useState<Build | null>(null);
  const [renameTarget, setRenameTarget] = useState<Build | null>(null);
  const [newName, setNewName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const loadBuilds = () => {
    const list = LocalBuildStorage.getSavedBuilds();
    setSavedBuilds(list);
  };

  useEffect(() => {
    loadBuilds();
  }, []);

  const handleLoadInBuilder = (build: Build) => {
    LocalBuildStorage.saveActiveBuild(build);
    router.push('/builder');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete configuration "${name}"?`)) {
      LocalBuildStorage.deleteSavedBuild(id);
      loadBuilds();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('pcdost:build-saved'));
      }
      setNotice(`Deleted "${name}".`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleStartRename = (build: Build) => {
    setRenameTarget(build);
    setNewName(build.name);
  };

  const handleConfirmRename = () => {
    if (renameTarget && newName.trim()) {
      LocalBuildStorage.renameSavedBuild(renameTarget.id, newName.trim());
      loadBuilds();
      setRenameTarget(null);
      setNotice(`Renamed to "${newName.trim()}".`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleExportJson = (build: Build) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(build, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${build.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const validated = validateImportedBuildJson(parsed);

        if (validated.isValid && validated.build) {
          LocalBuildStorage.saveBuildToSavedList(validated.build);
          loadBuilds();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('pcdost:build-saved'));
          }
          setNotice(`Imported "${validated.build.name}" successfully!`);
        } else {
          alert(validated.error || 'Invalid configuration file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-magenta-400">
            Saved Configurations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My PC Builds
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-400 mt-1">
            Access, export, share, or resume your customized desktop configurations stored locally.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* File input for JSON import */}
          <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-charcoal-200 bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 rounded-lg cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-magenta-400" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-magenta-accent hover:bg-magenta-600 rounded-lg shadow-magenta-sm transition-all"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>New Build</span>
          </Link>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-magenta-950/60 border border-magenta-700/60 text-xs text-magenta-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-magenta-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Build list or empty state */}
      {savedBuilds.length === 0 ? (
        <div className="text-center py-20 bg-charcoal-900 border border-dashed border-charcoal-800 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-800 text-charcoal-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No saved builds found</h3>
            <p className="text-xs text-charcoal-400 mt-1 max-w-sm mx-auto">
              You haven&apos;t saved any custom configurations yet. Head to the PC Builder to design your dream rig.
            </p>
          </div>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-magenta-accent hover:bg-magenta-600 rounded-lg shadow-magenta-sm transition-all"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Open PC Builder</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedBuilds.map((b) => {
            const report = checkCompatibility(b.components);
            const breakdown = calculatePriceBreakdown(b.components);
            const dateStr = new Date(b.updatedAt || b.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={b.id}
                className="bg-charcoal-900 border border-charcoal-750 hover:border-magenta-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-charcoal-850/60 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] text-charcoal-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-charcoal-500" />
                      {dateStr}
                    </span>
                    <Badge
                      variant={report.status === 'compatible' ? 'success' : report.status === 'incompatible' ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {report.statusLabel}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5 tracking-tight">
                    {b.name}
                  </h3>

                  <div className="mb-4">
                    <InrPrice amount={breakdown.effectiveTotalINR} size="xl" className="text-magenta-400" />
                    <span className="block text-[10px] text-charcoal-400">
                      Total build estimate
                    </span>
                  </div>

                  {/* Component summary tags */}
                  <div className="space-y-1.5 text-xs text-charcoal-300 mb-4 bg-charcoal-850/70 p-3 rounded-xl border border-charcoal-800">
                    <div className="flex justify-between">
                      <span className="text-charcoal-400">Processor:</span>
                      <span className="font-semibold text-white truncate max-w-[160px]">
                        {b.components.cpu ? `${b.components.cpu.brand} ${b.components.cpu.name}` : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-400">Graphic Card:</span>
                      <span className="font-semibold text-white truncate max-w-[160px]">
                        {b.components.gpu ? `${b.components.gpu.brand} ${b.components.gpu.name}` : 'Integrated / None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-400">Memory:</span>
                      <span className="font-semibold text-white truncate max-w-[160px]">
                        {b.components.ram ? b.components.ram.name : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-charcoal-800 text-[11px] text-charcoal-400">
                      <span>Total Parts:</span>
                      <span className="font-semibold text-charcoal-200">
                        {breakdown.componentCount} / 11 Slots
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-charcoal-800 space-y-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    icon={<Wrench className="w-3.5 h-3.5" />}
                    onClick={() => handleLoadInBuilder(b)}
                  >
                    Open in Builder
                  </Button>

                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => handleStartRename(b)}
                      className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 hover:text-white flex items-center justify-center transition-colors"
                      title="Rename build"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveShareBuild(b)}
                      className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 hover:text-white flex items-center justify-center transition-colors"
                      title="Share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExportJson(b)}
                      className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 hover:text-white flex items-center justify-center transition-colors"
                      title="Export JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.name)}
                      className="p-2 rounded-lg bg-charcoal-800 hover:bg-rose-950/60 text-charcoal-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                      title="Delete build"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {activeShareBuild && (
        <ShareModal
          isOpen={true}
          onClose={() => setActiveShareBuild(null)}
          build={activeShareBuild}
        />
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <Modal
          isOpen={true}
          onClose={() => setRenameTarget(null)}
          title="Rename Configuration"
          description="Enter a new title for this saved build."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 bg-charcoal-800 border border-charcoal-700 rounded-lg text-sm text-white focus:outline-none focus:border-magenta-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRenameTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmRename}>
                Save Title
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
