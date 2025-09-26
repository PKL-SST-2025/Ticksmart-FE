import { Component, onMount, createEffect, on, createSignal, onCleanup } from 'solid-js';
import type { SeatingChartData, Row, Section } from '../../data/seatingData';

// This component has much simpler props. It doesn't need selection or event data.
interface SeatingChartPreviewProps {
  chartData: SeatingChartData;

  onSectionDrag: (sectionId: number, dx: number, dy: number) => void;
}

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


// --- Store section hitboxes for reliable checking ---
let sectionHitboxes = new Map<number, { x: number, y: number, width: number, height: number }>();

const SeatingChartPreview: Component<SeatingChartPreviewProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  
  // This is now purely for the view (zoom/pan)
    // --- THIS IS THE FIX: Declare the missing state signals ---
  
  const [viewTransform, setViewTransform] = createSignal({ x: 0, y: 0, scale: 1 });
  const [interactionMode, setInteractionMode] = createSignal<'idle' | 'panning' | 'draggingSection'>('idle');
  const [draggingSectionId, setDraggingSectionId] = createSignal<number | null>(null);
  const [dragStart, setDragStart] = createSignal({ x: 0, y: 0 });
  const [hoveredSectionId, setHoveredSectionId] = createSignal<number | null>(null);

  // --- Simplified Drawing Logic ---
  const draw = () => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.getBoundingClientRect();
    canvasRef.width = rect.width; canvasRef.height = rect.height;
    
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#171717' : '#ffffff';
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

    ctx.save();
    ctx.translate(viewTransform().x, viewTransform().y);
    ctx.scale(viewTransform().scale, viewTransform().scale);

    drawStage(ctx);

    sectionHitboxes.clear(); 

    props.chartData.sections.forEach(section => {
      ctx.fillStyle = isDark ? '#d4d4d8' : '#3f3f46';
      ctx.font = 'bold 16px sans-serif';
      const firstRow = section.rows[0];
      if (firstRow) {
        const x = firstRow.type === 'line' ? firstRow.seats[0]?.pos_x : firstRow.start.x;
        const y = firstRow.type === 'line' ? firstRow.seats[0]?.pos_y : firstRow.start.y;
        if (x && y) {
          ctx.fillText(section.name, x, y - 30);
          // --- Store the hitbox for this section ---
          const metrics = ctx.measureText(section.name);
          sectionHitboxes.set(section.id, { x: x, y: y - 30 - 16, width: metrics.width, height: 20 });
        }
      }
      
      section.rows.forEach(row => {
        ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
        ctx.font = '12px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';

        if (row.type === 'line') {
          if (row.seats[0]) ctx.fillText(row.name, row.seats[0].pos_x - 15, row.seats[0].pos_y + row.seats[0].height / 2);
          // THIS LOOP WAS MISSING. IT NOW CORRECTLY DRAWS ALL SEATS.
          row.seats.forEach(seat => {
            drawSeat(ctx, seat.seat_number, { x: seat.pos_x, y: seat.pos_y, width: seat.width, height: seat.height, angle: 0 }, seat.type);
          });
        } else if (row.type === 'curve') {
          const labelPos = getPointOnCurve(row.start, row.control, row.end, -0.05);
          ctx.fillText(row.name, labelPos.x, labelPos.y);
          for (let i = 0; i < row.seatCount; i++) {
            const t = i / (row.seatCount - 1);
            const pos = getPointOnCurve(row.start, row.control, row.end, t);
            const angle = getTangentAngleOnCurve(row.start, row.control, row.end, t);
            drawSeat(ctx, (i + 1).toString(), { x: pos.x, y: pos.y, width: row.seatWidth, height: row.seatHeight, angle }, 'seat');
          }
        }
      });
    });
    ctx.restore();
  };

    // --- NEW: Hit Detection for Drag & Drop ---
  const getSectionAt = (worldX: number, worldY: number): Section | null => {
    for (const section of props.chartData.sections) {
      const firstRow = section.rows[0];
      if (firstRow) {
        const x = firstRow.type === 'line' ? firstRow.seats[0]?.pos_x : firstRow.start.x;
        const y = firstRow.type === 'line' ? firstRow.seats[0]?.pos_y : firstRow.start.y;
        if (x && y && worldX > x - 10 && worldX < x + 100 && worldY > y - 45 && worldY < y - 25) {
          return section;
        }
      }
    }
    return null;
  };


  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 1) e.preventDefault();
    const rect = canvasRef!.getBoundingClientRect();
    const transform = viewTransform();
    const worldX = (e.clientX - rect.left - transform.x) / transform.scale;
    const worldY = (e.clientY - rect.top - transform.y) / transform.scale;

    let hitSectionId: number | null = null;
    for (const [id, box] of sectionHitboxes.entries()) {
      if (worldX >= box.x && worldX <= box.x + box.width && worldY >= box.y && worldY <= box.y + box.height) {
        hitSectionId = id;
        break;
      }
    }
    
    if (e.button === 0 && hitSectionId !== null) { // Left-click on a section
      setInteractionMode('draggingSection');
      setDraggingSectionId(hitSectionId);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (e.button === 1) { // Middle-click anywhere
      setInteractionMode('panning');
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

    const handleMouseMove = (e: MouseEvent) => {
    const mode = interactionMode();
    if (mode === 'idle') return; // Do nothing if not dragging or panning

    const dx = e.clientX - dragStart().x;
    const dy = e.clientY - dragStart().y;
    const transform = viewTransform();

    if (mode === 'draggingSection') {
      props.onSectionDrag(draggingSectionId()!, dx / transform.scale, dy / transform.scale);
    } else if (mode === 'panning') {
      setViewTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    }
    
    setDragStart({ x: e.clientX, y: e.clientY }); // Reset start for next movement delta
  };


  const handleMouseUp = () => {
    setInteractionMode('idle');
    setDraggingSectionId(null);
  };
  
  // A much simpler drawSeat function, as all seats are just "layout" seats
const drawSeat = (ctx, seatNumber, pos, seatType) => { // Added seatType
  // --- THIS IS THE FIX: If the seat is a spacer, do nothing and exit ---
  if (seatType === 'spacer') {
    return; 
  }

  const isDark = document.documentElement.classList.contains('dark');
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(pos.angle);
  
  ctx.fillStyle = isDark ? '#52525b' : '#f3f4f6';
  ctx.strokeStyle = isDark ? '#71717a' : '#d1d5db';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-pos.width / 2, -pos.height / 2, pos.width, pos.height, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isDark ? '#d4d4d8' : '#3f3f46';
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
  

  
  
  // Redraw whenever the chart data from props changes
  createEffect(on(() => props.chartData, draw, { defer: true }));

createEffect(on(viewTransform, draw));

  onMount(() => {
    const observer = new ResizeObserver(() => draw());
    if (canvasRef) observer.observe(canvasRef);
    onCleanup(() => observer.disconnect());
  });
  
  
  return (
    <div
      class="relative w-full h-[70vh] border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black rounded-xl overflow-hidden"
      classList={{
        'cursor-move': hoveredSectionId() && interactionMode() === 'idle',
        'cursor-grabbing': interactionMode() === 'panning' || interactionMode() === 'draggingSection',
        'cursor-default': !hoveredSectionId() && interactionMode() === 'idle',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} class="w-full h-full" 
        onMouseDown={handleMouseDown} 
        onMouseMove={handleMouseMove} 
        onMouseUp={handleMouseUp} 
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default SeatingChartPreview;