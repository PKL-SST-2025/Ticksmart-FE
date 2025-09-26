import { Component, createSignal, createMemo, For, Show, onMount, onCleanup, createEffect } from "solid-js";
import { Portal } from 'solid-js/web';
import gsap from "gsap";
import { AiOutlineLeft, AiOutlineRight, AiOutlineClose, AiOutlineCalendar } from "solid-icons/ai";

// A global signal to control the date picker modal
// This is an alternative to a full context for a single-purpose modal
const [datePickerState, setDatePickerState] = createSignal<{
  isOpen: boolean;
  initialDate: string;
  onSelect?: (dateString: string) => void;
} | null>(null);

// This is the function other components will call to open the modal
export const openDatePicker = (initialDate: string, onSelect: (dateString: string) => void) => {
  setDatePickerState({ isOpen: true, initialDate, onSelect });
};


const DatePickerModal: Component = () => {
  // Local state for calendar UI, derived from the global signal
  const [displayDate, setDisplayDate] = createSignal(new Date());
  const [currentView, setCurrentView] = createSignal<'days' | 'months' | 'years'>('days');

  let daysViewRef: HTMLDivElement | undefined;
  let monthsViewRef: HTMLDivElement | undefined;
  let yearsViewRef: HTMLDivElement | undefined;
  
  // Effect to update internal state when the modal is opened
  createEffect(() => {
    const state = datePickerState();
    if (state?.isOpen) {
      const initial = state.initialDate ? new Date(state.initialDate) : new Date();
      setDisplayDate(initial);
      setCurrentView('days'); // Always reset to days view on open
    }
  });
  
  const closeModal = () => {
    setDatePickerState(prev => prev ? { ...prev, isOpen: false } : null);
  };
  
  const handleDayClick = (date: Date) => {
    const state = datePickerState();
    if (state?.onSelect) {
      state.onSelect(date.toISOString().split('T')[0]);
    }
    closeModal();
  };
  
  // --- Calendar Memo Logic (same as before) ---
  const selectedDate = createMemo(() => {
    const state = datePickerState();
    if (!state?.initialDate) return null;
    const date = new Date(state.initialDate);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  });

  // The core logic to generate the days for the current month view
  const calendarDays = createMemo(() => {
    const date = displayDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon...
    
    // Add padding days from the previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      const day = new Date(year, month, i - startDayOfWeek + 1);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Add all days of the current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }

    // Add padding days from the next month to fill the grid
    const remaining = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remaining; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }

    return days;
  });

  const calendarMonths = createMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      index: i,
      name: new Date(0, i).toLocaleString('default', { month: 'short' })
    }))
  );

  const calendarYears = createMemo(() => {
    const year = displayDate().getFullYear();
    const startYear = Math.floor(year / 12) * 12; // Start of a 12-year block
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  });

  // --- Handlers for Navigation and View Switching (same as before) ---
    const handleMonthClick = (monthIndex: number) => {
    setDisplayDate(d => new Date(d.getFullYear(), monthIndex, 1));
    animateViewChange('months', 'days');
    setCurrentView('days');
  };
  
  const handleYearClick = (year: number) => {
    setDisplayDate(d => new Date(year, d.getMonth(), 1));
    animateViewChange('years', 'months');
    setCurrentView('months');
  };

  const handleHeaderClick = () => {
    if (currentView() === 'days') {
      animateViewChange('days', 'months');
      setCurrentView('months');
    } else if (currentView() === 'months') {
      animateViewChange('months', 'years');
      setCurrentView('years');
    }
  };

  const handlePrev = () => {
    const view = currentView();
    if (view === 'days') setDisplayDate(d => new Date(d.setMonth(d.getMonth() - 1)));
    if (view === 'months') setDisplayDate(d => new Date(d.setFullYear(d.getFullYear() - 1)));
    if (view === 'years') setDisplayDate(d => new Date(d.setFullYear(d.getFullYear() - 12)));
  };

  const handleNext = () => {
    const view = currentView();
    if (view === 'days') setDisplayDate(d => new Date(d.setMonth(d.getMonth() + 1)));
    if (view === 'months') setDisplayDate(d => new Date(d.setFullYear(d.getFullYear() + 1)));
    if (view === 'years') setDisplayDate(d => new Date(d.setFullYear(d.getFullYear() + 12)));
  };

  // --- GSAP Animations (adapted for modal) ---
  const animateViewChange = (fromView: 'days'|'months'|'years', toView: 'days'|'months'|'years') => {
    const viewMap = { days: daysViewRef, months: monthsViewRef, years: yearsViewRef };
    const fromEl = viewMap[fromView];
    const toEl = viewMap[toView];

    if (!fromEl || !toEl) return;
    
    // A snappier fade and slide animation
    const tl = gsap.timeline();
    tl.to(fromEl, { autoAlpha: 0, y: -10, duration: 0.15, ease: 'power2.in' })
      .set(fromEl, { display: 'none' })
      .set(toEl, { display: 'block', y: 10, autoAlpha: 0 })
      .to(toEl, { autoAlpha: 1, y: 0, duration: 0.15, ease: 'power2.out' });
  };
  

    const goToToday = () => {
    setDisplayDate(new Date());
    if (currentView() !== 'days') {
      animateViewChange(currentView(), 'days');
      setCurrentView('days');
    }
  };

  return (
    <Portal>
      <div
        class="fixed inset-0 z-[999] flex items-center justify-center p-4 transition-opacity duration-300 "
        classList={{ 'opacity-100 bg-black/50 block ': datePickerState()?.isOpen, 'opacity-0 pointer-events-none hidden': !datePickerState()?.isOpen }}
        onClick={closeModal}
      >
        <div
          class="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 transition-all duration-300"
          classList={{ 'opacity-100 translate-y-0': datePickerState()?.isOpen, 'opacity-0 -translate-y-10': !datePickerState()?.isOpen }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* --- REFINED HEADER --- */}
          <div class="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
            <button type="button" onClick={handlePrev} class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
              <AiOutlineLeft class="size-5" />
            </button>
            <button type="button" onClick={handleHeaderClick} class="font-semibold text-sm text-neutral-800 dark:text-neutral-200 text-center hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md px-3 py-1.5 transition-colors">
              <Show when={currentView() === 'days'}>{displayDate().toLocaleString('default', { month: 'long', year: 'numeric' })}</Show>
              <Show when={currentView() === 'months'}>{displayDate().getFullYear()}</Show>
              <Show when={currentView() === 'years'}>{`${calendarYears()[0]} - ${calendarYears()[11]}`}</Show>
            </button>
            <button type="button" onClick={handleNext} class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
              <AiOutlineRight class="size-5" />
            </button>
          </div>
          
          {/* --- REFINED CALENDAR CONTAINER --- */}
          <div class="m-4 flex justify-center items-center relative h-64">
            <div ref={daysViewRef} class="absolute inset-0">
              <div class="grid grid-cols-7 mr-4 gap-4 text-center text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-2">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div class="grid grid-cols-7 gap-1">
                <For each={calendarDays()}>
                  {(day) => {
                    const isSelected = () => selectedDate() && day.date.getTime() === selectedDate()!.getTime();
                    const isToday = () => day.date.toDateString() === new Date().toDateString();
                    return (
                      <button type="button" onClick={() => handleDayClick(day.date)} class="size-8 flex justify-center items-center text-sm rounded-full font-medium transition-colors"
                        classList={{
                          'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700': day.isCurrentMonth,
                          'text-neutral-400 dark:text-neutral-500': !day.isCurrentMonth,
                          'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md': isSelected(),
                          'text-indigo-600 dark:text-indigo-400': isToday() && !isSelected(),
                        }}>
                        {day.date.getDate()}
                      </button>
                    );
                  }}
                </For>
              </div>
            </div>

            <div ref={monthsViewRef} class="absolute inset-0" style="display: none;">
                <div class="grid grid-cols-3 gap-2 h-full">
                  <For each={calendarMonths()}>
                    {(month) => (
                      <button type="button" onClick={() => handleMonthClick(month.index)} class="flex items-center justify-center text-sm font-semibold rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        classList={{'bg-indigo-600 text-white hover:bg-indigo-700': displayDate().getMonth() === month.index}}>
                        {month.name}
                      </button>
                    )}
                  </For>
                </div>
            </div>
            
            <div ref={yearsViewRef} class="absolute inset-0" style="display: none;">
                <div class="grid grid-cols-4 gap-2 h-full">
                  <For each={calendarYears()}>
                    {(year) => (
                      <button type="button" onClick={() => handleYearClick(year)} class="flex items-center justify-center text-sm font-semibold rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        classList={{'bg-indigo-600 text-white hover:bg-indigo-700': displayDate().getFullYear() === year}}>
                        {year}
                      </button>
                    )}
                  </For>
                </div>
            </div>
          </div>

          {/* --- NEW: FOOTER WITH TODAY BUTTON --- */}
          <div class="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-center">
            <button
              onClick={goToToday}
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
            >
              <AiOutlineCalendar /> Go to Today
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default DatePickerModal;