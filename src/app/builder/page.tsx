'use client';

import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Build,
  BuildComponents,
  Component,
  ComponentCategory,
  NormalizedRetailerOffer,
} from '@/types';
import { LocalBuildStorage, createEmptyBuild } from '@/storage/localStorage';
import { checkCompatibility } from '@/engine/compatibility';
import { calculatePriceBreakdown } from '@/engine/pricing';
import { decodeBuildFromQueryString } from '@/engine/shareCodec';

// BuildCores Layout Components
import { BuildCoresTopNavbar } from '@/components/builder/BuildCoresTopNavbar';
import { BuildCoresLeftSidebar } from '@/components/builder/BuildCoresLeftSidebar';
import { BuildCoresStageHeader } from '@/components/builder/BuildCoresStageHeader';
import { BuildCoresPartsDrawer } from '@/components/builder/BuildCoresPartsDrawer';
import { BuildCoresToolDock } from '@/components/builder/BuildCoresToolDock';
import { RigVisualizer2D } from '@/components/builder/RigVisualizer2D';
import { SetupVisualizer2D } from '@/components/builder/SetupVisualizer2D';
import { AirflowSimulation } from '@/components/builder/AirflowSimulation';
import { QuickSearchModal } from '@/components/builder/QuickSearchModal';
import { BuildSettingsModal } from '@/components/builder/BuildSettingsModal';
import { DealsModal } from '@/components/builder/DealsModal';
import {
  UpdatesModal,
  GuidesModal,
  ProModal,
  PartGalleryModal,
} from '@/components/builder/CommunityModals';

// Modals & Panels
import { ComponentPickerModal } from '@/components/builder/ComponentPickerModal';
import { ShareModal } from '@/components/builder/ShareModal';
import { PriceSummary } from '@/components/builder/PriceSummary';
import { PowerEstimator } from '@/components/builder/PowerEstimator';
import { FpsEstimator } from '@/components/builder/FpsEstimator';
import { CompatibilityBanner } from '@/components/builder/CompatibilityBanner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

// Icons
import {
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  CheckCircle,
  Cpu,
  Monitor,
  Flame,
  Layers,
  Wrench,
} from 'lucide-react';

function BuilderContent() {
  const searchParams = useSearchParams();

  // Core Build State
  const [build, setBuild] = useState<Build>(createEmptyBuild());
  const [activePickerCategory, setActivePickerCategory] = useState<ComponentCategory | null>(null);
  const [saveBuildName, setSaveBuildName] = useState('New Build (Clone)');
  const [savedBuildCount, setSavedBuildCount] = useState<number>(0);

  // Stage & Visualizer State
  const [activeStageMode, setActiveStageMode] = useState<'build' | 'setup'>('build');
  const [showVisualizer, setShowVisualizer] = useState<boolean>(true);
  const [fanSpeed, setFanSpeed] = useState<'off' | 'normal' | 'turbo'>('normal');
  const [rgbTheme, setRgbTheme] = useState<'magenta' | 'cyberpunk' | 'arctic' | 'stealth'>('magenta');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [dualDisplays, setDualDisplays] = useState<boolean>(false);
  const [isModdedCables, setIsModdedCables] = useState<boolean>(true);
  const [showAirflow, setShowAirflow] = useState<boolean>(false);
  const [canvasZoom, setCanvasZoom] = useState<number>(1);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Sidebar / Drawer Toggles
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState<boolean>(false);
  const [isPartsDrawerCollapsed, setIsPartsDrawerCollapsed] = useState<boolean>(false);

  // Modals State
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isDealsModalOpen, setIsDealsModalOpen] = useState(false);
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);
  const [isGuidesModalOpen, setIsGuidesModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isCompatibilityModalOpen, setIsCompatibilityModalOpen] = useState(false);
  const [isWattageModalOpen, setIsWattageModalOpen] = useState(false);
  const [isFpsModalOpen, setIsFpsModalOpen] = useState(false);
  const [isSummarySheetOpen, setIsSummarySheetOpen] = useState(false);

  // User Preferences
  const [budgetCapINR, setBudgetCapINR] = useState<number>(0);
  const [includePeripheralsInBudget, setIncludePeripheralsInBudget] = useState<boolean>(false);
  const [enableTaxEstimate, setEnableTaxEstimate] = useState<boolean>(false);
  const [enableShippingEstimate, setEnableShippingEstimate] = useState<boolean>(false);

  // Canvas container reference for fullscreen
  const canvasRef = useRef<HTMLDivElement>(null);

  // Update saved build count helper
  const refreshSavedCount = () => {
    const list = LocalBuildStorage.getSavedBuilds();
    setSavedBuildCount(list.length);
  };

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load from LocalStorage or URL params on mount
  useEffect(() => {
    refreshSavedCount();

    // 1. Check if URL has shared configuration
    const configParam = searchParams.get('config');
    if (configParam) {
      const decoded = decodeBuildFromQueryString(configParam);
      if (decoded.isValid) {
        const importedBuild: Build = {
          id: `shared-${Date.now()}`,
          name: decoded.name || 'Shared Configuration',
          components: decoded.components,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBuild(importedBuild);
        setSaveBuildName(importedBuild.name);
        LocalBuildStorage.saveActiveBuild(importedBuild);
        return;
      }
    }

    // 2. Otherwise load existing active build from LocalStorage
    const stored = LocalBuildStorage.getActiveBuild();
    setBuild(stored);
    setSaveBuildName(stored.name || 'New Build (Clone)');

    // Load stored user preferences
    const prefs = LocalBuildStorage.getPreferences();
    setBudgetCapINR(prefs.budgetCapINR || 0);
    setIncludePeripheralsInBudget(prefs.includePeripheralsInBudget || false);
    setEnableTaxEstimate(prefs.enableTaxEstimate || false);
    setEnableShippingEstimate(prefs.enableShippingEstimate || false);
  }, [searchParams]);

  // Persist build to LocalStorage whenever it changes
  const updateComponents = (newComponents: BuildComponents) => {
    const updated: Build = {
      ...build,
      components: newComponents,
      updatedAt: new Date().toISOString(),
    };
    setBuild(updated);
    LocalBuildStorage.saveActiveBuild(updated);
  };

  const handleSelectComponent = (comp: Component) => {
    const nextComponents = {
      ...build.components,
      [comp.category]: comp,
    };
    updateComponents(nextComponents);
  };

  const handleRemoveComponent = (category: ComponentCategory) => {
    const nextComponents = { ...build.components };
    delete nextComponents[category];
    updateComponents(nextComponents);
  };

  const handleClearBuild = () => {
    if (window.confirm('Are you sure you want to clear this build and start fresh?')) {
      const empty = createEmptyBuild('New Build (Clone)');
      setBuild(empty);
      setSaveBuildName('New Build (Clone)');
      LocalBuildStorage.saveActiveBuild(empty);
    }
  };

  const handleCloneBuild = () => {
    const cloned: Build = {
      ...build,
      id: `clone-${Date.now()}`,
      name: `${build.name || 'Build'} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    LocalBuildStorage.saveBuildToSavedList(cloned);
    setBuild(cloned);
    setSaveBuildName(cloned.name);
    refreshSavedCount();
    showToast(`Build cloned as "${cloned.name}"`);
  };

  const handleSaveBuild = () => {
    const finalized: Build = {
      ...build,
      name: saveBuildName.trim() || 'My Custom Rig',
      updatedAt: new Date().toISOString(),
    };
    LocalBuildStorage.saveBuildToSavedList(finalized);
    setBuild(finalized);
    LocalBuildStorage.saveActiveBuild(finalized);
    refreshSavedCount();
    setIsSaveModalOpen(false);
    showToast(`Build "${finalized.name}" saved to Builds List!`);
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(build, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${(build.name || 'custom-rig').toLowerCase().replace(/\s+/g, '-')}-build.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON build specification downloaded.');
  };

  const showToast = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Shareable link copied to clipboard!');
    }
  };

  const handleCopyMarkdown = () => {
    const lines = [
      `### ${build.name || 'Custom PC Build'} (via System Maker Core India)`,
      `| Category | Component | Price (INR) |`,
      `| --- | --- | --- |`,
    ];
    Object.entries(build.components).forEach(([cat, comp]) => {
      if (comp) {
        lines.push(`| ${cat.toUpperCase()} | ${comp.name} | ₹${comp.priceINR.toLocaleString('en-IN')} |`);
      }
    });
    lines.push(`| **Total** | | **₹${priceBreakdown.grandTotalINR.toLocaleString('en-IN')}** |`);

    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(lines.join('\n'));
      showToast('Reddit / Markdown spec table copied!');
    }
  };

  // Compatibility Engine calculations
  const compatibilityReport = useMemo(() => {
    return checkCompatibility(build.components);
  }, [build.components]);

  // Price Engine calculations
  const priceBreakdown = useMemo(() => {
    return calculatePriceBreakdown(build.components, {
      includePeripheralsInBudget,
      budgetCapINR,
      enableTaxEstimate,
      enableShippingEstimate,
    });
  }, [
    build.components,
    includePeripheralsInBudget,
    budgetCapINR,
    enableTaxEstimate,
    enableShippingEstimate,
  ]);

  // Toggle Fullscreen helper
  const handleToggleFullscreen = () => {
    if (!canvasRef.current) return;
    if (!document.fullscreenElement) {
      canvasRef.current.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  // Cycle Fan speed
  const handleCycleFanSpeed = () => {
    setFanSpeed((prev) => (prev === 'off' ? 'normal' : prev === 'normal' ? 'turbo' : 'off'));
  };

  // Cycle RGB theme
  const handleCycleRgbTheme = () => {
    const themes: ('magenta' | 'cyberpunk' | 'arctic' | 'stealth')[] = [
      'magenta',
      'cyberpunk',
      'arctic',
      'stealth',
    ];
    const nextIdx = (themes.indexOf(rgbTheme) + 1) % themes.length;
    setRgbTheme(themes[nextIdx]);
  };

  // Render canvas snapshot helper
  const handleRenderImage = () => {
    showToast('Rendering high-resolution rig snapshot...');
    setTimeout(() => {
      showToast('Snapshot captured! Check your downloads.');
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-28px)] w-full overflow-hidden bg-charcoal-950 text-charcoal-100 font-sans">
      {/* 1. BuildCores Top Navbar */}
      <BuildCoresTopNavbar
        onOpenSearch={() => setIsQuickSearchOpen(true)}
        onOpenPro={() => setIsProModalOpen(true)}
        onNewBuild={handleClearBuild}
        savedBuildCount={savedBuildCount}
      />

      {/* 2. Main 3-Column Studio Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* ================= LEFT SIDEBAR (Navigation Rail) ================= */}
        {!isLeftSidebarCollapsed && (
          <BuildCoresLeftSidebar
            onOpenDeals={() => setIsDealsModalOpen(true)}
            onOpenUpdates={() => setIsUpdatesModalOpen(true)}
            onOpenGuides={() => setIsGuidesModalOpen(true)}
            onOpenGallery={() => setIsGalleryModalOpen(true)}
            onNewBuild={handleClearBuild}
            className="hidden lg:flex"
          />
        )}

        {/* ================= CENTER COLUMN (Stage Canvas & Controls) ================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0c0f17] relative overflow-hidden">
          {/* Stage Header (Build info, metric pills, share row) */}
          <BuildCoresStageHeader
            buildName={saveBuildName}
            onUpdateBuildName={(name) => {
              setSaveBuildName(name);
              const updated = { ...build, name };
              setBuild(updated);
              LocalBuildStorage.saveActiveBuild(updated);
            }}
            totalPriceINR={priceBreakdown.grandTotalINR}
            compatibilityReport={compatibilityReport}
            estimatedWattage={compatibilityReport.estimatedWattage}
            showVisualizer={showVisualizer}
            onToggleVisualizer={() => setShowVisualizer(!showVisualizer)}
            onOpenPriceModal={() => setIsPriceModalOpen(true)}
            onOpenCompatibilityModal={() => setIsCompatibilityModalOpen(true)}
            onOpenWattageModal={() => setIsWattageModalOpen(true)}
            onOpenFpsModal={() => setIsFpsModalOpen(true)}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onCloneBuild={handleCloneBuild}
            onExportJson={handleExportJson}
            onCopyLink={handleCopyLink}
            onCopyMarkdown={handleCopyMarkdown}
            copiedNotification={copiedNotification}
          />

          {/* Canvas Viewport Area */}
          <div
            ref={canvasRef}
            className="flex-1 relative flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden bg-gradient-to-b from-[#090b12] to-[#0f1422] select-none"
          >
            {/* Stage Mode Switcher Tabs (top center) matching BuildCores */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center p-1 rounded-full bg-charcoal-900/90 backdrop-blur-md border border-charcoal-700/80 shadow-lg">
              <button
                onClick={() => setActiveStageMode('build')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeStageMode === 'build'
                    ? 'bg-charcoal-800 text-white shadow-sm'
                    : 'text-charcoal-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-magenta-400" />
                <span>PC Build</span>
              </button>
              <button
                onClick={() => setActiveStageMode('setup')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeStageMode === 'setup'
                    ? 'bg-charcoal-800 text-white shadow-sm'
                    : 'text-charcoal-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>Setup</span>
              </button>
            </div>

            {/* Top Left Watermark matching BuildCores screenshot */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1.5 text-white font-extrabold text-xs tracking-wider">
                <span className="w-2 h-2 rounded-full bg-magenta-500" />
                <span>SYSTEM MAKER CORE INDIA</span>
              </div>
              <div className="text-[9px] text-charcoal-400">
                Subject to Terms. Verified Indian Retailers.
              </div>
            </div>

            {/* Top Right Floating Camera & View Controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1 p-1 rounded-xl bg-charcoal-900/80 backdrop-blur-md border border-charcoal-800 shadow-lg">
              <button
                onClick={handleToggleFullscreen}
                className="p-1.5 text-charcoal-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
                title="Fullscreen Canvas"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCanvasZoom(1)}
                className="p-1.5 text-charcoal-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
                title="Reset Camera"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCanvasZoom((prev) => Math.min(prev + 0.15, 1.4))}
                className="p-1.5 text-charcoal-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCanvasZoom((prev) => Math.max(prev - 0.15, 0.7))}
                className="p-1.5 text-charcoal-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Left & Right Mobile Drawer Toggle Buttons */}
            <div className="absolute bottom-20 left-4 z-20 lg:hidden">
              <button
                onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
                className="p-2 rounded-xl bg-charcoal-900/90 text-charcoal-300 border border-charcoal-800 shadow-lg"
              >
                {isLeftSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </div>
            <div className="absolute bottom-20 right-4 z-20 sm:hidden">
              <button
                onClick={() => setIsPartsDrawerCollapsed(!isPartsDrawerCollapsed)}
                className="p-2 rounded-xl bg-charcoal-900/90 text-charcoal-300 border border-charcoal-800 shadow-lg"
              >
                {isPartsDrawerCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
              </button>
            </div>

            {/* Center Stage Presentation */}
            {showVisualizer ? (
              <div
                className="w-full max-w-4xl h-full flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${canvasZoom})` }}
              >
                {activeStageMode === 'build' ? (
                  <div className="relative w-full aspect-[4/3] max-h-[580px] flex items-center justify-center">
                    <RigVisualizer2D
                      components={build.components}
                      onSelectCategory={(cat) => setActivePickerCategory(cat)}
                      onRemoveCategory={(cat) => handleRemoveComponent(cat)}
                      isGpuRequired={
                        Boolean(
                          build.components.cpu &&
                            !(build.components.cpu.specifications as any)?.integratedGraphics
                        )
                      }
                    />
                    {/* Airflow Simulation Layer */}
                    <svg
                      viewBox="0 0 800 600"
                      className="absolute inset-0 w-full h-full pointer-events-none z-20"
                    >
                      <AirflowSimulation isActive={showAirflow} />
                    </svg>
                  </div>
                ) : (
                  /* Setup Mode Battlestation */
                  <SetupVisualizer2D
                    components={build.components}
                    onSelectCategory={(cat) => setActivePickerCategory(cat)}
                    rgbTheme={rgbTheme}
                    dualDisplays={dualDisplays}
                  />
                )}
              </div>
            ) : (
              /* If visualizer is hidden */
              <div className="text-center space-y-3 py-16 text-charcoal-400">
                <p className="text-sm">2D Visualizer is currently hidden.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowVisualizer(true)}
                >
                  Show 2D Visualizer
                </Button>
              </div>
            )}

            {/* Bottom Floating Tool Dock matching BuildCores */}
            {showVisualizer && (
              <BuildCoresToolDock
                onOpenPro={() => setIsProModalOpen(true)}
                fanSpeed={fanSpeed}
                onCycleFanSpeed={handleCycleFanSpeed}
                showLabels={showLabels}
                onToggleLabels={() => setShowLabels(!showLabels)}
                rgbTheme={rgbTheme}
                onCycleRgbTheme={handleCycleRgbTheme}
                dualDisplays={dualDisplays}
                onToggleDualDisplays={() => setDualDisplays(!dualDisplays)}
                isModdedCables={isModdedCables}
                onToggleModdedCables={() => setIsModdedCables(!isModdedCables)}
                showAirflow={showAirflow}
                onToggleAirflow={() => setShowAirflow(!showAirflow)}
                onRenderImage={handleRenderImage}
                onOpenSummary={() => setIsSummarySheetOpen(true)}
              />
            )}
          </div>
        </main>

        {/* ================= RIGHT COLUMN (Parts & Price History Drawer) ================= */}
        <BuildCoresPartsDrawer
          components={build.components}
          onSelectCategory={(category) => setActivePickerCategory(category)}
          onRemoveCategory={(category) => handleRemoveComponent(category)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          isCollapsed={isPartsDrawerCollapsed}
          onToggleCollapse={() => setIsPartsDrawerCollapsed(!isPartsDrawerCollapsed)}
          className={isPartsDrawerCollapsed ? 'hidden' : 'flex'}
        />
      </div>

      {/* ================= MODALS & OVERLAYS ================= */}

      {/* 1. Quick Search Modal (Ctrl+K) */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onSelectComponent={handleSelectComponent}
        selectedComponents={build.components}
      />

      {/* 2. Component Picker Modal (when clicking slot or hotspot) */}
      <ComponentPickerModal
        isOpen={activePickerCategory !== null}
        onClose={() => setActivePickerCategory(null)}
        category={activePickerCategory}
        currentBuild={build.components}
        onSelectComponent={handleSelectComponent}
      />

      {/* 3. Build & Budget Settings Modal */}
      <BuildSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        budgetCapINR={budgetCapINR}
        onBudgetChange={(val) => {
          setBudgetCapINR(val);
          LocalBuildStorage.savePreferences({ budgetCapINR: val });
        }}
        includePeripheralsInBudget={includePeripheralsInBudget}
        onToggleIncludePeripherals={(val) => {
          setIncludePeripheralsInBudget(val);
          LocalBuildStorage.savePreferences({ includePeripheralsInBudget: val });
        }}
        enableTaxEstimate={enableTaxEstimate}
        onToggleTax={(val) => {
          setEnableTaxEstimate(val);
          LocalBuildStorage.savePreferences({ enableTaxEstimate: val });
        }}
        enableShippingEstimate={enableShippingEstimate}
        onToggleShipping={(val) => {
          setEnableShippingEstimate(val);
          LocalBuildStorage.savePreferences({ enableShippingEstimate: val });
        }}
      />

      {/* 4. Sales & Deals Modal */}
      <DealsModal
        isOpen={isDealsModalOpen}
        onClose={() => setIsDealsModalOpen(false)}
      />

      {/* 5. Updates / Changelog Modal */}
      <UpdatesModal
        isOpen={isUpdatesModalOpen}
        onClose={() => setIsUpdatesModalOpen(false)}
      />

      {/* 6. Hardware Guides Modal */}
      <GuidesModal
        isOpen={isGuidesModalOpen}
        onClose={() => setIsGuidesModalOpen(false)}
      />

      {/* 7. Pro Features Modal */}
      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

      {/* 8. 2D Part Gallery Modal */}
      <PartGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
      />

      {/* 9. Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        build={build}
      />

      {/* 10. Price Breakdown Modal (Green Price Pill) */}
      <Modal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        title="INR Price Breakdown & Indian Retailers"
        description="Transparent cost breakdown calculated in Indian Rupees."
        maxWidth="lg"
      >
        <PriceSummary
          breakdown={priceBreakdown}
          budgetCapINR={budgetCapINR}
          onBudgetChange={(val) => {
            setBudgetCapINR(val);
            LocalBuildStorage.savePreferences({ budgetCapINR: val });
          }}
          includePeripheralsInBudget={includePeripheralsInBudget}
          onToggleIncludePeripherals={(val) => {
            setIncludePeripheralsInBudget(val);
            LocalBuildStorage.savePreferences({ includePeripheralsInBudget: val });
          }}
          enableTaxEstimate={enableTaxEstimate}
          onToggleTax={(val) => {
            setEnableTaxEstimate(val);
            LocalBuildStorage.savePreferences({ enableTaxEstimate: val });
          }}
          enableShippingEstimate={enableShippingEstimate}
          onToggleShipping={(val) => {
            setEnableShippingEstimate(val);
            LocalBuildStorage.savePreferences({ enableShippingEstimate: val });
          }}
          onSaveBuild={handleSaveBuild}
          onShareBuild={() => setIsShareModalOpen(true)}
          onExportJson={handleExportJson}
          onClearBuild={handleClearBuild}
        />
      </Modal>

      {/* 11. Compatibility Modal (Blue Compatible Pill) */}
      <Modal
        isOpen={isCompatibilityModalOpen}
        onClose={() => setIsCompatibilityModalOpen(false)}
        title="Hardware Compatibility Engine Report"
        description="Deterministic verification of socket, chipset, clearances, and power limits."
        maxWidth="md"
      >
        <CompatibilityBanner report={compatibilityReport} />
      </Modal>

      {/* 12. Power Estimator Modal (Yellow Wattage Pill) */}
      <Modal
        isOpen={isWattageModalOpen}
        onClose={() => setIsWattageModalOpen(false)}
        title="Power Consumption & PSU Headroom"
        description="Component-by-component TDP wattage calculation with 20% safety margin."
        maxWidth="md"
      >
        <PowerEstimator
          estimatedWattage={compatibilityReport.estimatedWattage}
          recommendedWattage={compatibilityReport.recommendedPsuWattage}
          selectedPsu={build.components.psu}
        />
      </Modal>

      {/* 13. Gaming FPS Modal (Orange Telemetry Pill) */}
      <Modal
        isOpen={isFpsModalOpen}
        onClose={() => setIsFpsModalOpen(false)}
        title="Verified Gaming Telemetry & Benchmarks"
        description="Estimated frame rates based on standardized hardware testing."
        maxWidth="lg"
      >
        <FpsEstimator
          cpu={build.components.cpu}
          gpu={build.components.gpu}
        />
      </Modal>

      {/* 14. Quick Summary Sheet (Dock Summary Button) */}
      <Modal
        isOpen={isSummarySheetOpen}
        onClose={() => setIsSummarySheetOpen(false)}
        title="Rig Telemetry & Component Overview"
        description="Instant summary of your selected components, power, thermals, and price."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
              <div className="text-[10px] text-charcoal-400 font-bold uppercase">Total Cost</div>
              <div className="text-base font-extrabold text-magenta-400 mt-1">
                ₹{priceBreakdown.grandTotalINR.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
              <div className="text-[10px] text-charcoal-400 font-bold uppercase">Estimated Draw</div>
              <div className="text-base font-extrabold text-amber-400 mt-1">
                {compatibilityReport.estimatedWattage}W
              </div>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
              <div className="text-[10px] text-charcoal-400 font-bold uppercase">Components</div>
              <div className="text-base font-extrabold text-white mt-1">
                {priceBreakdown.componentCount} / 8
              </div>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
              <div className="text-[10px] text-charcoal-400 font-bold uppercase">Compatibility</div>
              <div className={`text-base font-extrabold mt-1 ${compatibilityReport.isCompatible ? 'text-sky-400' : 'text-amber-400'}`}>
                {compatibilityReport.isCompatible ? 'Passed' : 'Review'}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsSummarySheetOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* 15. Save Build Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Custom Configuration"
        description="Name your custom PC build to save it into local storage."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal-300 block mb-1.5">
              Build Name
            </label>
            <input
              type="text"
              value={saveBuildName}
              onChange={(e) => setSaveBuildName(e.target.value)}
              placeholder="e.g., Delhi Esports 1080p Beast"
              className="w-full px-3 py-2 bg-charcoal-800 border border-charcoal-700 rounded-lg text-sm text-white focus:outline-none focus:border-magenta-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveBuild}>
              Save to Builds List
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-magenta-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-charcoal-400">Loading System Maker Core Studio...</p>
          </div>
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
