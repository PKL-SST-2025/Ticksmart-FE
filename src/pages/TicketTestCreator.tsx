import { For, Show, type Component } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import DashboardLayout from '../components/DashboardLayout';
import SeatingChart from '../components/seating/SeatingChart';
import type { SeatingChartData, Row, Seat } from '../data/seatingData';
import SeatingChartPreview from '../components/seating/SeatingChartPreview';

// A minimal starting point for a new chart
const createInitialChart = (): SeatingChartData => ({
  id: Date.now(),
  name: 'New Custom Chart',
  sections: [{
    id: Date.now() + 1,
    name: 'Section 1',
    defaultTierId: 1,
    rows: [],
  }],
});

const TicketTestCreator: Component = () => {
  // --- The entire seating chart is our state ---
  const [chartData, setChartData] = createStore<SeatingChartData>(createInitialChart());

  // --- Handler Functions to Modify the State ---

  // --- Handlers ---
  const addSection = () => {
    setChartData('sections', produce(sections => {
      sections.push({
        id: Date.now(), name: `Section ${sections.length + 1}`,
        defaultTierId: 1, rows: [],
      });
    }));
  };

  const handleSectionDrag = (sectionId: number, dx: number, dy: number) => {
    // This logic needs to be careful with the discriminated union
    setChartData('sections', (s) => s.id === sectionId, 'rows', produce((rows: Row[]) => {
      rows.forEach(row => {
        if (row.type === 'line') {
          row.seats.forEach(seat => {
            seat.pos_x! += dx;
            seat.pos_y! += dy;
          });
        } else if (row.type === 'curve') {
          row.start.x += dx; row.start.y += dy;
          row.control.x += dx; row.control.y += dy;
          row.end.x += dx; row.end.y += dy;
        }
      });
    }));
  };

  const updateSection = (sectionIndex: number, field: string, value: any) => {
    setChartData('sections', sectionIndex, field as any, value);
  };

  const removeSection = (sectionIndex: number) => {
    setChartData('sections', produce(sections => {
      sections.splice(sectionIndex, 1);
    }));
  };

  const addRow = (sectionIndex: number) => {
    const newRow: Row = {
      id: Date.now(),
      name: String.fromCharCode(65 + chartData.sections[sectionIndex].rows.length),
      type: 'line',
      seats: []
    };
    setChartData('sections', sectionIndex, 'rows', produce(rows => { rows.push(newRow); }));
  };
  const updateRow = (sectionIndex: number, rowIndex: number, field: string, value: any) => {
    // For nested properties like `start.x`
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setChartData('sections', sectionIndex, 'rows', rowIndex, parent as any, child as any, value);
    } else {
      setChartData('sections', sectionIndex, 'rows', rowIndex, field as any, value);
    }
  };
    // --- NEW: Handlers for individual seats and spacers ---
  const addSeatToRow = (sectionIndex: number, rowIndex: number, type: 'seat' | 'spacer') => {
    setChartData('sections', sectionIndex, 'rows', rowIndex, produce((row: Row) => {
      // This `if` statement is a "type guard". Inside this block, TS knows `row` is a line.
      if (row.type === 'line') {
        const lastSeat = row.seats[row.seats.length - 1];
        const nextX = lastSeat ? lastSeat.pos_x + lastSeat.width + 6 : 50;
        const yPos = lastSeat ? lastSeat.pos_y : 200;
        
        const newSeat: Required<Seat> = {
          id: Date.now(),
          seat_number: (row.seats.filter(s => s.type !== 'spacer').length + 1).toString(),
          pos_x: nextX,
          pos_y: yPos,
          width: 22,
          height: 22,
          type: type,
        };
        row.seats.push(newSeat);
      }
    }));
  };


  const removeSeatFromRow = (sectionIndex: number, rowIndex: number, seatIndex: number) => {
    setChartData('sections', sectionIndex, 'rows', rowIndex, produce((row: Row) => {
      if (row.type === 'line') {
        row.seats.splice(seatIndex, 1);
        let seatCounter = 1;
        row.seats.forEach(seat => {
          if (seat.type !== 'spacer') {
            seat.seat_number = (seatCounter++).toString();
          }
        });
      }
    }));
  };
  
  const removeRow = (sectionIndex: number, rowIndex: number) => {
    setChartData('sections', sectionIndex, 'rows', produce(rows => {
      rows.splice(rowIndex, 1);
    }));
  };

  const exportToJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(chartData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "seatingChart.json";
    link.click();
  };

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Seating Chart Creator</h1>
          <p class="mt-1 text-neutral-500 dark:text-neutral-400">
            Design your venue layout in real-time.
          </p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Live Preview Column --- */}
            <div class="lg:col-span-2 ">
            {/* --- THIS IS THE FIX: Use the SeatingChartPreview component --- */}
            {/* It only requires the chartData prop, so the error is gone. */}
            <SeatingChartPreview 
              chartData={chartData} 
              onSectionDrag={handleSectionDrag}
            />
          </div>

          {/* --- Controls Column --- */}
          <div class="lg:col-span-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-6">
            <div>
              <h2 class="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Controls</h2>
              <button onClick={addSection} class="w-full mb-4 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                Add Section
              </button>
              <button onClick={exportToJson} class="w-full px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                Export Layout to JSON
              </button>
            </div>
            
            <div class="space-y-4 max-h-[60vh] overflow-y-auto">
              <For each={chartData.sections}>
                {(section, sectionIndex) => (
                  <div class="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <div class="flex items-center justify-between mb-3">
                      <input 
                        type="text" 
                        value={section.name} 
                        onInput={(e) => updateSection(sectionIndex(), 'name', e.currentTarget.value)}
                        class="w-full bg-transparent font-semibold text-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
                      />
                      <button onClick={() => removeSection(sectionIndex())} class="text-red-500 hover:text-red-700 text-xs font-bold">REMOVE</button>
                    </div>
                    
                    {/* Rows within the section */}
                    <div class="space-y-3">
                      <For each={section.rows}>
                        {(row, rowIndex) => (
                          <div class="p-3 bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
                            <div class="flex items-center justify-between">
                              <input 
                                type="text"
                                value={row.name}
                                onInput={(e) => updateRow(sectionIndex(), rowIndex(), 'name', e.currentTarget.value)}
                                class="w-1/4 bg-transparent text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none"
                              />
                               <select
                                value={row.type}
                                onChange={(e) => updateRow(sectionIndex(), rowIndex(), 'type', e.currentTarget.value)}
                                class="text-xs bg-transparent dark:bg-neutral-800"
                              >
                                <option value="line">Line</option>
                                <option value="curve">Curve</option>
                              </select>
                              <button onClick={() => removeRow(sectionIndex(), rowIndex())} class="text-red-500 text-xs">Delete</button>
                            </div>


                            {/* --- NEW: Seat Management UI --- */}
                            <Show when={row.type === 'line'}>
                                <div class="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                    <label class="text-xs font-semibold text-neutral-500">Seats in this Row</label>
                                    <div class="mt-2 flex flex-wrap items-center gap-2">
                                         <For each={(row as Extract<Row, {type: 'line'}>).seats}>
                                            {(seat, seatIndex) => (
                                                <button 
                                                    onClick={() => removeSeatFromRow(sectionIndex(), rowIndex(), seatIndex())}
                                                    class="h-6 px-2 text-xs font-mono rounded flex items-center justify-center border transition-colors"
                                                    classList={{
                                                        'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200': seat.type !== 'spacer',
                                                        'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200': seat.type === 'spacer',
                                                    }}
                                                    title={seat.type === 'spacer' ? 'Remove Spacer' : `Remove Seat ${seat.seat_number}`}
                                                >
                                                    {seat.type === 'spacer' ? '—' : seat.seat_number}
                                                </button>
                                            )}
                                        </For>
                                    </div>
                                    <div class="mt-3 flex gap-2">
                                        <button onClick={() => addSeatToRow(sectionIndex(), rowIndex(), 'seat')} class="flex-1 text-xs py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded">
                                            + Add Seat
                                        </button>
                                        <button onClick={() => addSeatToRow(sectionIndex(), rowIndex(), 'spacer')} class="flex-1 text-xs py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded">
                                            + Add Spacer
                                        </button>
                                    </div>
                                </div>
                            </Show>
                            
                            {/* Conditional Form for Row Type */}
                            <Show when={row.type === 'line'}>
                               <p class="text-xs text-neutral-500 mt-2">Line properties are edited directly on the seats.</p>
                            </Show>
                            <Show when={row.type === 'curve'}>
                                <div class="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-2 gap-2">
                                    <label class="col-span-2 text-xs">Seat Count: <input class="w-full bg-transparent" type="number" value={(row as any).seatCount} onInput={(e) => updateRow(sectionIndex(), rowIndex(), 'seatCount', parseInt(e.currentTarget.value))} /></label>
                                    <label class="text-xs">Start X: <input class="w-full bg-transparent" type="number" value={(row as any).start.x} onInput={(e) => updateRow(sectionIndex(), rowIndex(), 'start.x', parseInt(e.currentTarget.value))} /></label>
                                    <label class="text-xs">Start Y: <input class="w-full bg-transparent" type="number" value={(row as any).start.y} onInput={(e) => updateRow(sectionIndex(), rowIndex(), 'start.y', parseInt(e.currentTarget.value))} /></label>
                                    <label class="text-xs">Control X: <input class="w-full bg-transparent" type="number" value={(row as any).control.x} onInput={(e) => updateRow(sectionIndex(), rowIndex(), 'control.x', parseInt(e.currentTarget.value))} /></label>
                                    <label class="text-xs">Control Y: <input class="w-full bg-transparent" type="number" value={(row as any).control.y} onInput={(e) => updateRow(sectionIndex(), rowIndex(), 'control.y', parseInt(e.currentTarget.value))} /></label>
                                    <label class="text-xs">End X: <input class="w-full bg-transparent" type="number" value={(row as any).end.x} onInput={(e) => updateRow(sectionIndex(), rowIndex(), 'end.x', parseInt(e.currentTarget.value))} /></label>
                                    <label class="text-xs">End Y: <input class="w-full bg-transparent" type="number" value={(row as any).end.y} onInput={(e) => updateRow(sectionIndex(), rowIndex(), 'end.y', parseInt(e.currentTarget.value))} /></label>
                                </div>
                            </Show>
                            
                          </div>
                        )}
                      </For>
                      <button onClick={() => addRow(sectionIndex())} class="w-full mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800">+ Add Row</button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TicketTestCreator;