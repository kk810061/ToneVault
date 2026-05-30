'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pedal } from '@/components/pedal';
import { AmpHead } from '@/components/amp-head';
import { Cabinet } from '@/components/cabinet';
import { PedalDefinition, AmpDefinition, CabinetDefinition } from '@/hooks/useDefinitions';
import { SignalChain, PedalInstance } from '@/hooks/useSignalChain';
import { Plus, ChevronRight, GripVertical, Search, X, Guitar, Speaker, ListFilter, Activity } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { restrictToHorizontalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

interface SignalChainEditorProps {
  chain: SignalChain;
  pedalDefinitions: PedalDefinition[];
  ampDefinitions: AmpDefinition[];
  cabinetDefinitions: CabinetDefinition[];
  onAddPedal: (pedalSlug: string) => string | void;
  onRemovePedal: (pedalId: string) => void;
  onReorderPedals?: (pedals: PedalInstance[]) => void;
  onUpdatePedalControl: (pedalId: string, controlId: string, value: number | string | boolean) => void;
  onTogglePedalBypass: (pedalId: string) => void;
  onSetAmp: (ampSlug: string) => void;
  onUpdateAmpControl: (controlId: string, value: number | string | boolean) => void;
  onSetCabinet: (cabinetSlug: string) => void;
}

// ------------------------------------------------------------------
// Sortable Pedal Tile Component
// ------------------------------------------------------------------
function SortablePedal({ 
  pedal, 
  definition, 
  isActive, 
  onClick, 
  onRemove, 
  onToggleBypass 
}: { 
  pedal: PedalInstance; 
  definition: PedalDefinition; 
  isActive: boolean; 
  onClick: () => void; 
  onRemove: () => void; 
  onToggleBypass: () => void; 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pedal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative flex-shrink-0 group">
      <div 
        className={`w-20 h-28 rounded-lg border-2 cursor-pointer flex flex-col items-center justify-between p-2 transition-all ${
          isActive 
            ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(255,107,0,0.5)]' 
            : 'border-border bg-card/90 hover:border-accent/60 shadow-[0_4px_10px_rgba(0,0,0,0.4)]'
        } ${pedal.bypassed ? 'opacity-60 grayscale-[0.5]' : ''}`}
        onClick={onClick}
      >
        <div {...attributes} {...listeners} className="absolute -top-3 left-1/2 -translate-x-1/2 p-1.5 bg-card/90 backdrop-blur border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-accent hover:text-black hover:border-accent z-20">
          <GripVertical className="w-3 h-3" />
        </div>

        <div className="w-full flex justify-between items-start">
          <div className={`w-2.5 h-2.5 rounded-full border border-black/50 ${pedal.bypassed ? 'bg-neutral-700 shadow-inner' : 'bg-red-500 shadow-[0_0_8px_1px_rgba(255,0,0,0.8)]'}`} />
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }} 
            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-destructive/20"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-[10px] font-bold text-center uppercase leading-tight line-clamp-3 text-foreground break-words text-balance">
            {definition.name}
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onToggleBypass(); }}
          className={`w-full mt-1 py-1 rounded text-[9px] uppercase font-bold border transition-colors ${
            pedal.bypassed 
              ? 'border-border bg-background text-muted-foreground hover:bg-muted' 
              : 'border-accent/50 bg-accent/20 text-accent hover:bg-accent hover:text-black'
          }`}
        >
          {pedal.bypassed ? 'Off' : 'On'}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main Editor Component
// ------------------------------------------------------------------
export function SignalChainEditor({
  chain,
  pedalDefinitions,
  ampDefinitions,
  cabinetDefinitions,
  onAddPedal,
  onRemovePedal,
  onReorderPedals,
  onUpdatePedalControl,
  onTogglePedalBypass,
  onSetAmp,
  onUpdateAmpControl,
  onSetCabinet,
}: SignalChainEditorProps) {
  const [selectedItem, setSelectedItem] = useState<{ type: 'pedal' | 'amp' | 'cabinet'; id?: string } | null>(null);
  
  // Modals / Drawers
  const [showPedalDrawer, setShowPedalDrawer] = useState(false);
  const [pedalSearch, setPedalSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isChangingAmp, setIsChangingAmp] = useState(false);
  const [isChangingCab, setIsChangingCab] = useState(false);

  // DndKit State
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const activeDragPedal = useMemo(() => chain.pedals.find(p => p.id === activeDragId), [chain.pedals, activeDragId]);
  const activeDragDefinition = useMemo(() => pedalDefinitions.find(d => d.slug === activeDragPedal?.definitionSlug), [activeDragPedal, pedalDefinitions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderPedals) {
      const oldIndex = chain.pedals.findIndex((p) => p.id === active.id);
      const newIndex = chain.pedals.findIndex((p) => p.id === over.id);
      onReorderPedals(arrayMove(chain.pedals, oldIndex, newIndex));
    }
  };

  const groupedPedals = useMemo(() => {
    const groups: Record<string, PedalDefinition[]> = {};
    pedalDefinitions.forEach(p => {
      const cat = p.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      if (p.name.toLowerCase().includes(pedalSearch.toLowerCase())) {
        groups[cat].push(p);
      }
    });
    return groups;
  }, [pedalDefinitions, pedalSearch]);

  const getSelectedDefinition = () => {
    if (!selectedItem) return null;
    if (selectedItem.type === 'pedal' && selectedItem.id) {
      const pedal = chain.pedals.find((p) => p.id === selectedItem.id);
      return pedal ? pedalDefinitions.find((d) => d.slug === pedal.definitionSlug) : null;
    } else if (selectedItem.type === 'amp' && chain.amp) {
      return ampDefinitions.find((d) => d.slug === chain.amp!.definitionSlug);
    } else if (selectedItem.type === 'cabinet' && chain.cabinet) {
      return cabinetDefinitions.find((d) => d.slug === chain.cabinet!.definitionSlug);
    }
    return null;
  };

  const selectedDefinition = getSelectedDefinition();
  const selectedPedal = selectedItem?.type === 'pedal' ? chain.pedals.find((p) => p.id === selectedItem.id) : null;

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
    >
      <div className="flex flex-col h-full bg-background rounded-lg border border-border shadow-xl overflow-hidden relative">
        
        {/* ------------------------------------------------------------------ */}
        {/* TOP: Horizontal Signal Chain Ribbon                                */}
        {/* ------------------------------------------------------------------ */}
        <div className="h-48 border-b border-border bg-card/60 backdrop-blur-md flex flex-col shrink-0 relative z-20">
          <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground">
              <Activity className="w-4 h-4 text-accent" />
              Signal Routing
            </div>
          </div>

          <div className="flex-1 overflow-x-auto flex items-center px-6 py-4 custom-scrollbar">
            <div className="flex items-center gap-4 min-w-max h-full">
              
              {/* Input Node */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-muted flex items-center justify-center bg-black shadow-inner">
                  <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
              </div>

              {/* Pedals Drop Zone (DndKit) */}
              <SortableContext items={chain.pedals.map(p => p.id)} strategy={horizontalListSortingStrategy}>
                {chain.pedals.map((pedal, index) => {
                  const def = pedalDefinitions.find((d) => d.slug === pedal.definitionSlug);
                  if (!def) return null;
                  return (
                    <React.Fragment key={pedal.id}>
                      <SortablePedal
                        pedal={pedal}
                        definition={def}
                        isActive={selectedItem?.id === pedal.id}
                        onClick={() => setSelectedItem({ type: 'pedal', id: pedal.id })}
                        onRemove={() => {
                          onRemovePedal(pedal.id);
                          if (selectedItem?.id === pedal.id) setSelectedItem(null);
                        }}
                        onToggleBypass={() => onTogglePedalBypass(pedal.id)}
                      />
                      <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                    </React.Fragment>
                  );
                })}
              </SortableContext>

            {/* Add Pedal Block */}
            <button 
              onClick={() => setShowPedalDrawer(true)}
              className="w-20 h-28 rounded-lg border-2 border-dashed border-muted hover:border-accent hover:bg-accent/10 flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer shadow-md shrink-0 bg-black/40"
            >
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-accent" />
              <span className="text-[9px] uppercase font-bold text-muted-foreground group-hover:text-accent">Add Pedal</span>
            </button>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />

            {/* Amp Node */}
            <div 
              className={`w-32 h-24 rounded-lg border-2 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all p-3 shadow-md shrink-0 ${
                selectedItem?.type === 'amp' ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(255,107,0,0.4)]' : 'border-border bg-card/80 hover:border-accent/50'
              }`}
              onClick={() => { setSelectedItem({ type: 'amp' }); setIsChangingAmp(false); }}
            >
              <Guitar className={`w-8 h-8 ${chain.amp ? 'text-accent' : 'text-muted-foreground'}`} />
              <span className="text-[10px] font-bold uppercase text-center text-balance leading-tight">
                {chain.amp ? ampDefinitions.find(d => d.slug === chain.amp!.definitionSlug)?.name : 'Select Amp'}
              </span>
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />

            {/* Cabinet Node */}
            <div 
              className={`w-32 h-24 rounded-lg border-2 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all p-3 shadow-md shrink-0 ${
                selectedItem?.type === 'cabinet' ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(255,107,0,0.4)]' : 'border-border bg-card/80 hover:border-accent/50'
              }`}
              onClick={() => { setSelectedItem({ type: 'cabinet' }); setIsChangingCab(false); }}
            >
              <Speaker className={`w-8 h-8 ${chain.cabinet ? 'text-accent' : 'text-muted-foreground'}`} />
              <span className="text-[10px] font-bold uppercase text-center text-balance leading-tight">
                {chain.cabinet ? cabinetDefinitions.find(d => d.slug === chain.cabinet!.definitionSlug)?.name : 'Select Cab'}
              </span>
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />

            {/* Output Node */}
            <div className="w-12 h-12 rounded-full border-2 border-muted flex items-center justify-center bg-black shadow-inner shrink-0">
              <div className="w-4 h-4 rounded-full bg-accent shadow-[0_0_10px_rgba(255,107,0,0.6)] animate-pulse" />
            </div>

          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM: Main Hardware Workspace & Drawer                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 flex overflow-hidden relative bg-black/40 z-10 min-h-[650px]">
        
        {/* Backdrop for Drawer */}
        <AnimatePresence>
          {showPedalDrawer && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPedalDrawer(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30"
            />
          )}
        </AnimatePresence>

        {/* Pedal Drawer */}
        <AnimatePresence>
          {showPedalDrawer && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-y-0 left-0 w-80 bg-card border-r border-border z-40 flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.8)]"
            >
              <div className="p-4 border-b border-border bg-black/20 flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-accent" />
                  Pedal Library
                </h3>
                <button onClick={() => setShowPedalDrawer(false)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 border-b border-border bg-black/10">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search pedals..." 
                    value={pedalSearch}
                    onChange={(e) => setPedalSearch(e.target.value)}
                    className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {Object.entries(groupedPedals).map(([category, pedals]) => {
                  if (pedals.length === 0) return null;
                  const isOpen = activeCategory === category || pedalSearch.length > 0;
                  return (
                    <div key={category} className="rounded-md border border-border/50 bg-background/50 overflow-hidden">
                      <button 
                        onClick={() => setActiveCategory(isOpen && !pedalSearch ? null : category)}
                        className="w-full px-4 py-2.5 flex justify-between items-center hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-xs font-bold uppercase tracking-wider">{category}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90 text-accent' : 'text-muted-foreground'}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-black/20"
                          >
                            <div className="p-2 grid grid-cols-2 gap-2">
                              {pedals.map(p => (
                                <button
                                  key={p.slug}
                                  onClick={() => {
                                    const newId = onAddPedal(p.slug);
                                    if (newId) setSelectedItem({ type: 'pedal', id: newId });
                                    setShowPedalDrawer(false);
                                  }}
                                  className="px-2 py-3 rounded text-[10px] font-bold uppercase leading-tight bg-card border border-border hover:border-accent/50 hover:bg-accent/10 transition-colors text-center text-balance flex flex-col items-center justify-center min-h-[60px]"
                                >
                                  {p.name}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Focused Hardware Workbench (Center) */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {!selectedItem ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center text-muted-foreground flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-muted flex items-center justify-center mb-4">
                  <Guitar className="w-8 h-8 opacity-50" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-foreground">Workbench Empty</h2>
                <p className="text-sm mt-2 max-w-sm">Select a device from the signal chain ribbon above to edit its parameters.</p>
              </motion.div>
            ) : selectedItem.type === 'pedal' && selectedPedal && selectedDefinition ? (
              <motion.div
                key={selectedPedal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full flex justify-center"
              >
                <Pedal
                  definition={selectedDefinition as PedalDefinition}
                  controlValues={selectedPedal.controlValues}
                  onControlChange={(controlId, value) => onUpdatePedalControl(selectedPedal.id, controlId, value)}
                  bypassed={selectedPedal.bypassed}
                  onBypassChange={() => onTogglePedalBypass(selectedPedal.id)}
                  isSelected={true}
                />
              </motion.div>
            ) : selectedItem.type === 'amp' ? (
              <motion.div
                key="amp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-5xl"
              >
                {chain.amp && !isChangingAmp ? (
                  <div className="w-full flex flex-col gap-4">
                    <div className="flex justify-end pr-4">
                       <button 
                         onClick={() => setIsChangingAmp(true)} 
                         className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-accent border border-accent/50 bg-black/40 rounded hover:bg-accent hover:text-black transition-colors shadow-md"
                       >
                         Change Amplifier
                       </button>
                    </div>
                    <AmpHead
                      definition={ampDefinitions.find((d) => d.slug === chain.amp!.definitionSlug)!}
                      controlValues={chain.amp.controlValues}
                      onControlChange={onUpdateAmpControl}
                      isSelected={true}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-6 bg-card p-12 rounded-xl border border-border shadow-2xl">
                    <h2 className="text-2xl font-bold uppercase tracking-widest">Select an Amplifier</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {ampDefinitions.map(amp => (
                        <button
                          key={amp.slug}
                          onClick={() => { onSetAmp(amp.slug); setIsChangingAmp(false); }}
                          className="p-4 rounded-lg border-2 border-border bg-background hover:border-accent hover:bg-accent/10 transition-all font-bold uppercase text-xs"
                        >
                          {amp.name}
                        </button>
                      ))}
                    </div>
                    {chain.amp && (
                      <button 
                        onClick={() => setIsChangingAmp(false)} 
                        className="mt-6 text-xs font-bold text-muted-foreground hover:text-white uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : selectedItem.type === 'cabinet' ? (
              <motion.div
                key="cab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-3xl"
              >
                {chain.cabinet && !isChangingCab ? (
                  <div className="w-full flex flex-col gap-4">
                    <div className="flex justify-end pr-4">
                       <button 
                         onClick={() => setIsChangingCab(true)} 
                         className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-accent border border-accent/50 bg-black/40 rounded hover:bg-accent hover:text-black transition-colors shadow-md"
                       >
                         Change Cabinet
                       </button>
                    </div>
                    <Cabinet
                      definition={cabinetDefinitions.find((d) => d.slug === chain.cabinet!.definitionSlug)!}
                      isSelected={true}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-6 bg-card p-12 rounded-xl border border-border shadow-2xl">
                    <h2 className="text-2xl font-bold uppercase tracking-widest">Select a Cabinet</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {cabinetDefinitions.map(cab => (
                        <button
                          key={cab.slug}
                          onClick={() => { onSetCabinet(cab.slug); setIsChangingCab(false); }}
                          className="p-4 rounded-lg border-2 border-border bg-background hover:border-accent hover:bg-accent/10 transition-all font-bold uppercase text-xs"
                        >
                          {cab.name}
                        </button>
                      ))}
                    </div>
                    {chain.cabinet && (
                      <button 
                        onClick={() => setIsChangingCab(false)} 
                        className="mt-6 text-xs font-bold text-muted-foreground hover:text-white uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragId && activeDragPedal && activeDragDefinition ? (
          <div className="w-20 h-28 rounded-lg border-2 border-accent bg-accent/20 flex items-center justify-center backdrop-blur-md shadow-2xl scale-105 cursor-grabbing z-50">
            <span className="text-[10px] font-bold uppercase text-white text-center text-balance">{activeDragDefinition.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
