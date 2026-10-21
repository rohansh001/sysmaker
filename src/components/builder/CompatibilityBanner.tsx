import React, { useState } from 'react';
import { CompatibilityReport, IssueSeverity } from '@/types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface CompatibilityBannerProps {
  report: CompatibilityReport;
}

export const CompatibilityBanner: React.FC<CompatibilityBannerProps> = ({ report }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const errors = report.issues.filter((i) => i.severity === 'error');
  const warnings = report.issues.filter((i) => i.severity === 'warning');
  const infos = report.issues.filter((i) => i.severity === 'info');

  // Status visual configurations
  const statusConfig = {
    compatible: {
      border: 'border-emerald-600/60 bg-emerald-950/30',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      titleColor: 'text-emerald-400',
      badgeVariant: 'success' as const,
    },
    incompatible: {
      border: 'border-rose-600/80 bg-rose-950/40',
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      titleColor: 'text-rose-400',
      badgeVariant: 'danger' as const,
    },
    has_warnings: {
      border: 'border-amber-600/70 bg-amber-950/30',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      titleColor: 'text-amber-400',
      badgeVariant: 'warning' as const,
    },
    incomplete: {
      border: 'border-charcoal-700 bg-charcoal-900',
      icon: <Info className="w-5 h-5 text-charcoal-400" />,
      titleColor: 'text-charcoal-300',
      badgeVariant: 'charcoal' as const,
    },
    unknown: {
      border: 'border-amber-500/70 bg-amber-950/20',
      icon: <HelpCircle className="w-5 h-5 text-amber-400" />,
      titleColor: 'text-amber-400',
      badgeVariant: 'warning' as const,
    },
  }[report.status];

  const renderIssueIcon = (severity: IssueSeverity, isUnknown?: boolean) => {
    if (isUnknown) return <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />;
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'info':
        return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  return (
    <div className={`rounded-xl border transition-all overflow-hidden ${statusConfig.border}`}>
      {/* Main Banner Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-charcoal-900/90 border border-charcoal-750 shrink-0">
            {statusConfig.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3 className={`text-base font-bold tracking-tight ${statusConfig.titleColor}`}>
                {report.statusLabel}
              </h3>
              {errors.length > 0 && (
                <Badge variant="danger" size="sm">
                  {errors.length} Conflict{errors.length > 1 ? 's' : ''}
                </Badge>
              )}
              {warnings.length > 0 && (
                <Badge variant="warning" size="sm">
                  {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <p className="text-xs text-charcoal-300 leading-relaxed">
              {report.summary}
            </p>
          </div>
        </div>

        {/* Toggle Details Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-charcoal-800">
          {report.issues.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-charcoal-850 hover:bg-charcoal-800 text-charcoal-200 border border-charcoal-700 transition-colors"
            >
              <span>{isExpanded ? 'Hide Diagnostics' : 'View Diagnostics'} ({report.issues.length})</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Diagnostics Drawer */}
      {isExpanded && report.issues.length > 0 && (
        <div className="border-t border-charcoal-800/80 bg-charcoal-950/60 p-4 sm:p-5 space-y-4">
          {/* Errors Section */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Critical Incompatibilities ({errors.length})
                </span>
              </div>
              <div className="space-y-2">
                {errors.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/60 text-xs flex items-start gap-2.5"
                  >
                    {renderIssueIcon(issue.severity, issue.isUnknown)}
                    <div>
                      <div className="font-semibold text-rose-300">
                        {issue.title}
                        <span className="ml-2 text-[10px] text-rose-400/80 uppercase tracking-wider">
                          [{issue.category}]
                        </span>
                      </div>
                      <p className="text-rose-200/90 mt-0.5 leading-relaxed">
                        {issue.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings Section */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Advisories & Unknowns ({warnings.length})
              </span>
              <div className="space-y-2">
                {warnings.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/50 text-xs flex items-start gap-2.5"
                  >
                    {renderIssueIcon(issue.severity, issue.isUnknown)}
                    <div>
                      <div className="font-semibold text-amber-300">
                        {issue.title}
                        <span className="ml-2 text-[10px] text-amber-400/80 uppercase tracking-wider">
                          [{issue.category}]
                        </span>
                      </div>
                      <p className="text-amber-200/90 mt-0.5 leading-relaxed">
                        {issue.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Information / Verified Matches Section */}
          {infos.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Verified Matches & Hardware Notices ({infos.length})
              </span>
              <div className="space-y-2">
                {infos.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs flex items-start gap-2.5"
                  >
                    {renderIssueIcon(issue.severity, issue.isUnknown)}
                    <div>
                      <div className="font-semibold text-charcoal-200">
                        {issue.title}
                      </div>
                      <p className="text-charcoal-400 mt-0.5 leading-relaxed">
                        {issue.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
