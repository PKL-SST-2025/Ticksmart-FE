import { Component, For, createSignal, onMount, createEffect, on, onCleanup } from 'solid-js';
import type { SeatingChartData, EventSeat, Seat, Section, TicketTier } from '../../data/seatingData';
import { AiOutlineMinus, AiOutlinePlus, AiOutlineReload } from 'solid-icons/ai';

interface SeatingChartProps {
  chartData: SeatingChartData;
  eventSeats: Map<number, EventSeat>;
  ticketTiers: TicketTier[];
  selectedSeats: () => Set<number>; // Now receives the selection set as a prop
  onSelectionChange: (newSelection: Set<number>) => void; // Emits changes back to the parent
}

type SeatStatus = 'available' | 'sold' | 'reserved' | 'selected';


// --- Math Helpers for Bezier Curves ---
const getPointOnCurve = (p0: {x,y}, p1: {x,y}, p2: {x,y}, t: number) => {
  const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
  const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
  return { x, y };
};
const getTangentAngleOnCurve = (p0: {x,y}, p1: {x,y}, p2: {x,y}, t: number) => {
  const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  return Math.atan2(dy, dx);
};

const SeatingChart: Component<SeatingChartProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  
  // --- State for interaction and view ---
  const [selectedSeats, setSelectedSeats] = createSignal<Set<number>>(new Set());
  const [viewTransform, setViewTransform] = createSignal({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = createSignal(false);
  const [panStart, setPanStart] = createSignal({ x: 0, y: 0 });


  // --- All other logic is the same, but we will use props instead of local state ---
  let seatPositions = new Map<number, { x: number; y: number; width: number; height: number; angle: number }>();
  

      // --- Main Drawing Function ---
  const draw = () => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.getBoundingClientRect();
    canvasRef.width = rect.width;
    canvasRef.height = rect.height;
    
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#171717' : '#ffffff';
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

    ctx.save();
    ctx.translate(viewTransform().x, viewTransform().y);
    ctx.scale(viewTransform().scale, viewTransform().scale);

    drawStage(ctx);
    seatPositions.clear();

    props.chartData.sections.forEach(section => {
      // Draw section labels
      ctx.fillStyle = isDark ? '#d4d4d8' : '#3f3f46';
      ctx.font = 'bold 16px sans-serif';
      const firstRow = section.rows[0];
      const sectionLabelX = firstRow.type === 'line' ? firstRow.seats[0].pos_x : firstRow.start.x;
      const sectionLabelY = firstRow.type === 'line' ? firstRow.seats[0].pos_y : firstRow.start.y;
      ctx.fillText(section.name, sectionLabelX, sectionLabelY - 30);
      
      section.rows.forEach(row => {
        // --- THIS IS THE FIX for Row Labels ---
        // Calculate the position for the row label and draw it.
        ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        if (row.type === 'line') {
          ctx.fillText(row.name, row.seats[0].pos_x - 15, row.seats[0].pos_y + row.seats[0].height / 2);
          
          row.seats.forEach(seat => {
            seatPositions.set(seat.id, { x: seat.pos_x, y: seat.pos_y, width: seat.width, height: seat.height, angle: 0 });
            drawSeat(ctx, seat.seat_number, seatPositions.get(seat.id)!, getSeatStatus(seat.id), seat.id);
          });
        } else if (row.type === 'curve') {
          const labelPos = getPointOnCurve(row.start, row.control, row.end, -0.05); // Position slightly before the first seat
          ctx.fillText(row.name, labelPos.x, labelPos.y);

          for (let i = 0; i < row.seatCount; i++) {
            const seatId = row.id * 1000 + i;
            const t = i / (row.seatCount - 1);
            const pos = getPointOnCurve(row.start, row.control, row.end, t);
            const angle = getTangentAngleOnCurve(row.start, row.control, row.end, t);
            
            seatPositions.set(seatId, { x: pos.x, y: pos.y, width: row.seatWidth, height: row.seatHeight, angle });
            drawSeat(ctx, (i + 1).toString(), seatPositions.get(seatId)!, getSeatStatus(seatId), seatId);
          }
        }
      });
    });

    ctx.restore();
  };

  
  const drawSeat = (ctx: CanvasRenderingContext2D, seatNumber: string, pos, status: SeatStatus, seatId: number) => {
    const colors = getStatusColors(status, seatId);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.angle);
    
    ctx.fillStyle = colors.fill;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1.5; // Make the outline thicker and more visible
    ctx.beginPath();
    ctx.roundRect(-pos.width / 2, -pos.height / 2, pos.width, pos.height, 3);
    ctx.fill();
    ctx.stroke();
    // Text color is white for any filled seat (selected, reserved), otherwise it's the tier color.
    ctx.fillStyle = (status === 'selected' || status === 'reserved') ? '#ffffff' : colors.text;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(seatNumber, 0, 1);
    
    ctx.restore();
  };

  const drawStage = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#374151';
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(250, 350); ctx.lineTo(550, 350); ctx.lineTo(650, 400); ctx.lineTo(150, 400); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S T A G E', 400, 385);
  };
  
  // --- Interaction Logic ---
  const getSeatStatus = (seatId: number): SeatStatus => {
    if (props.selectedSeats().has(seatId)) return 'selected'; // Read from props
    const eventSeat = props.eventSeats.get(seatId);
    return eventSeat ? eventSeat.status : 'available';
  };

  // --- REWRITTEN: `getStatusColors` to implement outline/fill logic ---
const getStatusColors = (status: SeatStatus, seatId: number) => {
    // Static colors for non-available states
    const soldColor = '#6b7280';
    const reservedColor = '#f97316';

    // First, find the seat's tier and color, as it's needed for both available and selected states.
    const tierId = seatTierMap.get(seatId);
    const tier = props.ticketTiers.find(t => t.id === tierId);
    const tierColor = tier ? tier.color : '#6b7280'; // Fallback to gray

    switch (status) {
      // --- THIS IS THE FIX ---
      // When a seat is selected, its fill and stroke become its tier's color.
      case 'selected':
        return { fill: tierColor, stroke: tierColor, text: '#ffffff' };
        
      case 'sold':
        return { fill: soldColor, stroke: soldColor, text: '#d1d5db' };
        
      case 'reserved':
        return { fill: reservedColor, stroke: reservedColor, text: '#ffffff' };
        
      case 'available':
        // This remains the same: available seats are transparent with a colored outline.
        return { 
          fill: 'transparent',
          stroke: tierColor, 
          text: tierColor 
        };
    }
  };



  const getSeatAt = (mouseX: number, mouseY: number): number | null => {
    const transform = viewTransform();
    const worldX = (mouseX - transform.x) / transform.scale;
    const worldY = (mouseY - transform.y) / transform.scale;

    for (const [seatId, pos] of seatPositions.entries()) {
      const dx = worldX - pos.x;
      const dy = worldY - pos.y;
      
      // Hit detection for rotated rectangles (more accurate)
      const cosAngle = Math.cos(-pos.angle);
      const sinAngle = Math.sin(-pos.angle);
      const localX = dx * cosAngle - dy * sinAngle;
      const localY = dx * sinAngle + dy * cosAngle;

      if (Math.abs(localX) < pos.width / 2 && Math.abs(localY) < pos.height / 2) {
        return seatId; // Return the ID
      }
    }
    return null;
  };


  // --- Event Handlers ---
  const handleMouseDown = (e: MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };
const handleMouseUp = (e: MouseEvent) => {
    if (isPanning()) {
        const dx = Math.abs(e.clientX - panStart().x);
        const dy = Math.abs(e.clientY - panStart().y);
        if (dx < 5 && dy < 5) {
            handleCanvasClick(e);
        }
    }
    setIsPanning(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning()) return;
    const dx = e.clientX - panStart().x;
    const dy = e.clientY - panStart().y;
    
    // --- THIS IS THE FIX for Panning ---
    setViewTransform(prev => {
        // Apply simple constraints to prevent panning too far away
        const newX = prev.x + dx;
        const newY = prev.y + dy;
        return { ...prev, x: newX, y: newY };
    });
    setPanStart({ x: e.clientX, y: e.clientY });
  };
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const scaleAmount = 1.1;
    const rect = canvasRef!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    let newScale = viewTransform().scale;
    if (e.deltaY < 0) { // Zoom in
      newScale *= scaleAmount;
    } else { // Zoom out
      newScale /= scaleAmount;
    }
    newScale = Math.max(0.5, Math.min(newScale, 3)); // Clamp zoom

    // Zoom towards the mouse cursor
    const newX = mouseX - (mouseX - viewTransform().x) * (newScale / viewTransform().scale);
    const newY = mouseY - (mouseY - viewTransform().y) * (newScale / viewTransform().scale);
    
    setViewTransform({ x: newX, y: newY, scale: newScale });
  };

  const handleCanvasClick = (e: MouseEvent) => {
    const rect = canvasRef!.getBoundingClientRect();
    const seatId = getSeatAt(e.clientX - rect.left, e.clientY - rect.top);

    if (seatId !== null) {
      const status = getSeatStatus(seatId);
      if (status !== 'sold' && status !== 'reserved') {
        const newSet = new Set(props.selectedSeats());
        if (newSet.has(seatId)) {
          newSet.delete(seatId);
        } else {
          newSet.add(seatId);
        }
        // Instead of setting local state, we call the parent's handler
        props.onSelectionChange(newSet);
        draw();
      }
    }
  };


    const handleZoom = (factor: number) => {
      const newScale = viewTransform().scale * factor;
      setViewTransform(prev => ({ ...prev, scale: Math.max(0.2, Math.min(newScale, 5)) }));
  };
  const resetView = () => fitChartToView();

  let seatTierMap = new Map<number, number>();
  let chartBounds = { minX: 0, minY: 0, width: 0, height: 0 }; // Store chart bounds

  // --- REWRITTEN: "Fit to View" Logic ---
  const fitChartToView = () => {
    if (!canvasRef) return;

    // --- THE FIX (Part 1): Use getBoundingClientRect to get the REAL display size ---
    const canvasRect = canvasRef.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return; // Don't run if canvas has no size yet

    const padding = 50;
    
    const scaleX = (canvasRect.width - padding * 2) / chartBounds.width;
    const scaleY = (canvasRect.height - padding * 2) / chartBounds.height;
    const scale = Math.min(scaleX, scaleY);

    // Center the chart based on its calculated bounds
    const chartCenterX = chartBounds.minX + chartBounds.width / 2;
    const chartCenterY = chartBounds.minY + chartBounds.height / 2;
    const x = canvasRect.width / 2 - chartCenterX * scale;
    const y = canvasRect.height / 2 - chartCenterY * scale;

    setViewTransform({ x, y, scale });
  };

  // --- REWRITTEN: Effects for Robust Initialization and Reactivity ---
  onMount(() => {
    // --- Pre-calculate all seat positions and the total chart bounds ONCE ---
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    props.chartData.sections.forEach(section => {
      section.rows.forEach(row => {
        if (row.type === 'line') {
          row.seats.forEach(seat => {
            seatTierMap.set(seat.id, section.defaultTierId); // Populate the tier map
            seatPositions.set(seat.id, { x: seat.pos_x, y: seat.pos_y, width: seat.width, height: seat.height, angle: 0 });
            minX = Math.min(minX, seat.pos_x); maxX = Math.max(maxX, seat.pos_x);
            minY = Math.min(minY, seat.pos_y); maxY = Math.max(maxY, seat.pos_y);
          });
        } else if (row.type === 'curve') {
          for (let i = 0; i < row.seatCount; i++) {
            const seatId = row.id * 1000 + i;
            seatTierMap.set(seatId, section.defaultTierId); // Populate the tier map
            const t = i / (row.seatCount - 1);
            const pos = getPointOnCurve(row.start, row.control, row.end, t);
            const angle = getTangentAngleOnCurve(row.start, row.control, row.end, t);
            seatPositions.set(seatId, { x: pos.x, y: pos.y, width: row.seatWidth, height: row.seatHeight, angle });
            minX = Math.min(minX, pos.x); maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y); maxY = Math.max(maxY, pos.y);
          }
        }
      });
    });
    // Include the stage in the bounds
    minX = Math.min(minX, 150); maxX = Math.max(maxX, 650);
    minY = Math.min(minY, 350); maxY = Math.max(maxY, 400);
    chartBounds = { minX, minY, width: maxX - minX, height: maxY - minY };

    // --- THE FIX (Part 2): Use ResizeObserver for reactive centering ---
    // This is the modern, correct way to handle element resizing.
    const resizeObserver = new ResizeObserver(() => {
      // This will be called on initial mount when the size is known,
      // and on any subsequent resize.
      fitChartToView();
    });

    if (canvasRef) {
      resizeObserver.observe(canvasRef);
    }
    
    // Clean up the observer when the component is unmounted
    onCleanup(() => {
      if (canvasRef) {
        resizeObserver.unobserve(canvasRef);
      }
    });
  });
  createEffect(on(viewTransform, draw));
  createEffect(on(selectedSeats, draw));
  // Re-draw if theme changes
  createEffect(() => {
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    onCleanup(() => observer.disconnect());
  });


  return (
    <div
      class="relative w-full h-[70vh] touch-none border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden"
      classList={{ 'cursor-grab': !isPanning(), 'cursor-grabbing': isPanning() }}
    >
      <canvas ref={canvasRef} class="absolute inset-0 w-full h-full" 
         onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onWheel={handleWheel} onMouseLeave={() => setIsPanning(false)}
      />
      
      {/* --- NEW: Seating Tier Legend --- */}
      <div class="absolute bottom-4 left-4 p-3 rounded-lg bg-neutral-900/80 backdrop-blur-sm border border-neutral-600 shadow-lg">
        <h4 class="text-xs font-bold uppercase text-neutral-400 mb-2">Legend</h4>
        <div class="space-y-1.5">
          {/* Tier colors are shown as outlines now */}
          <For each={props.ticketTiers}>
            {(tier) => (
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded border-2" style={{ "border-color": tier.color }} />
                <span class="text-sm font-medium text-neutral-200">{tier.name}</span>
              </div>
            )}
          </For>
          <div class="pt-1 mt-1 border-t border-neutral-700"></div>
          {/* Static statuses are shown as filled boxes */}
           <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded" style={{ "background-color": '#6b7280' }} />
              <span class="text-sm font-medium text-neutral-200">Sold</span>
           </div>
        </div>
      </div>
      
      {/* --- THIS IS THE MISSING BUTTON CODE --- */}
      <div class="absolute bottom-4 right-4 flex flex-col gap-2">
        <button 
          onClick={() => handleZoom(1.2)} 
          class="w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shadow-lg text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
          aria-label="Zoom in"
        >
          <AiOutlinePlus />
        </button>
        <button 
          onClick={() => handleZoom(0.8)} 
          class="w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shadow-lg text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
          aria-label="Zoom out"
        >
          <AiOutlineMinus />
        </button>
        <button 
          onClick={resetView} 
          class="w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shadow-lg text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
          aria-label="Reset view"
        >
          <AiOutlineReload />
        </button>
      </div>
    </div>
  );
};

export default SeatingChart;