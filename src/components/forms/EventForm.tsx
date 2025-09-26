import type { Component } from 'solid-js';
import { createSignal, createEffect, createMemo, Show, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import FloatingLabelInput from '../input/FloatingLabelInput';
import FloatingLabelTextarea from '../input/FloatingLabelTextarea';
import FloatingLabelSelect from '../input/FloatingLabelSelect';
import FloatingDateInput from '../input/FloatingLabelDate';
import TierSubForm, { type TierFormData } from './TierSubForm';
import OfferSubForm, { type OfferFormData } from './OfferSubForm';
import { sendRequest } from '../../utils/SendRequest';
import { useModal } from '../../context/ModalContext';
import { AiOutlineFileText, AiOutlineCalendar, AiOutlineClockCircle, AiOutlineTag, AiOutlineEnvironment, AiOutlineFlag, AiOutlinePlusCircle, AiOutlineEdit, AiOutlineDelete } from 'solid-icons/ai';

export type TempId = string | number;

export type TierWithOffers = TierFormData & { offers: OfferFormData[] };

export type EventFormData = {
  id?: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  venue_id: number | null;
  segment_id: number | null;
  genre_id: number | null;
  status: 'draft' | 'published' | 'on_sale';
  tiers: TierWithOffers[];
  organizer_id?: number | null;
};

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: () => Promise<void>;
  isAdmin?: boolean;
}

const EventForm: Component<EventFormProps> = (props) => {
  const { closeModal } = useModal();

  // --- Initialize form store with reactive nested tiers/offers ---
  const getInitialForm = (): EventFormData => {
    const data = props.initialData;
    console.log(data);
    console.log(data?.event?.title.toString());

    const formatDate = (d?: string | null) =>
      d ? new Date(d).toISOString().slice(0, 16) : '';
    return {
      title: data?.title || '',
      description: data?.description || '',
      start_time: formatDate(data?.start_time),
      end_time: formatDate(data?.end_time),
      venue_id: data?.venue_id || null,
      segment_id: data?.segment_id || null,
      genre_id: data?.genre_id || null,
      status: data?.status || 'draft',
      tiers: data?.tiers?.map(t => ({
        ...t,
        total_inventory: Number(t.total_inventory) || 0,
        offers: t.offers?.map(o => ({ ...o })) || [],
      })) || [],
      organizer_id: data?.organizer_id || null,
      id: data?.id
      
    };
  };

  const [form, setForm] = createStore<EventFormData>(getInitialForm());
  const [errors, setErrors] = createStore<Partial<Record<keyof EventFormData, string>>>({});
  const [step4Error, setStep4Error] = createSignal<string | null>(null);
  const [step, setStep] = createSignal(1);
  const totalSteps = 4;
  const [editingTierId, setEditingTierId] = createSignal<TempId | null>(null);
  const [editingOffer, setEditingOffer] = createSignal<{ tierId: TempId; offerId: TempId | null } | null>(null);
  const [venues, setVenues] = createSignal<{ value: string, label: string, capacity: number }[]>([]);
  const [segments, setSegments] = createSignal<{ value: string, label: string }[]>([]);
  const [genres, setGenres] = createSignal<{ value: string, label: string }[]>([]);
  const [organizers, setOrganizers] = createSignal<{ value: string, label: string }[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // --- Fetch select options ---
  createEffect(async () => {
    try {
      type VenueData = { id: number; name: string; capacity: number | null };
      type SegmentData = { id: number; name: string };
      type UserData = { id: number; username: string; role: string };

      const promises: [
        Promise<VenueData[]>,
        Promise<SegmentData[]>,
        Promise<UserData[]>?
      ] = [
        sendRequest<VenueData[]>('/venues'),
        sendRequest<SegmentData[]>('/categories/segments')
      ];
      if (props.isAdmin) promises.push(sendRequest<UserData[]>('/admin/users'));

      const [venuesData, segmentsData, usersData] = await Promise.all(promises);

      setVenues(venuesData.map(v => ({ value: String(v.id), label: v.name, capacity: v.capacity || 0 })));
      setSegments(segmentsData.map(s => ({ value: String(s.id), label: s.name })));
      if (usersData) {
        setOrganizers(usersData.filter(u => u.role === 'organizer').map(u => ({ value: String(u.id), label: u.username })));
      }
    } catch (err) {
      console.error(err);
    }
  });

  // --- Fetch genres when segment changes ---
  createEffect(async () => {
    if (form.segment_id) {
      const data = await sendRequest<{ id: number; name: string }[]>(`/categories/segments/${form.segment_id}/genres`);
      setGenres(data.map(g => ({ value: String(g.id), label: g.name })));
    } else setGenres([]);
  });

  // --- Validation ---
  const validateStep = (s: number) => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};
    setStep4Error(null);

    switch (s) {
      case 1:
        if (!form.title.trim()) newErrors.title = 'Event title is required.';
        if (!form.start_time) newErrors.start_time = 'Start date is required.';
        if (form.end_time && new Date(form.end_time) < new Date(form.start_time)) newErrors.end_time = 'End cannot be before start.';
        break;
      case 2:
        if (!form.segment_id) newErrors.segment_id = 'Segment required.';
        if (!form.genre_id) newErrors.genre_id = 'Genre required.';
        break;
      case 3:
        if (props.isAdmin && !form.organizer_id) newErrors.organizer_id = 'Organizer required.';
        if (!form.venue_id) newErrors.venue_id = 'Venue required.';
        break;
      case 4:
        if (editingTierId() !== null || editingOffer() !== null) {
          setStep4Error('Please save or cancel pending edits.');
          return false;
        }
        const venueCapacity = venues().find(v => v.value === String(form.venue_id))?.capacity;
        const totalInventory = form.tiers.reduce((sum, t) => sum + t.total_inventory, 0);
        if (venueCapacity && totalInventory > venueCapacity) setStep4Error(`Total tier inventory (${totalInventory}) exceeds capacity (${venueCapacity}).`);
        if (!form.tiers.length) setStep4Error('Create at least one tier.');
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !step4Error();
  };

  // --- Handlers ---
  const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
    setErrors(name as keyof EventFormData, undefined);
    setForm(name as keyof EventFormData, value);
  };
  const handleSelectChange = (name: keyof EventFormData, val: string) => setForm(name, Number(val) || null);
  const handleDateChange = (name: keyof EventFormData, val: string) => setForm(name, val);
  const handleNext = () => { if (validateStep(step())) setStep(s => Math.min(s + 1, totalSteps)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSaveTier = (tier: TierWithOffers) => {
    const exists = form.tiers.find(t => t.id === tier.id);
    if (exists) setForm('tiers', t => t.map(ti => ti.id === tier.id ? tier : ti));
    else setForm('tiers', t => [...t, tier]);
    setEditingTierId(null);
  };
  const handleSaveOffer = (offer: OfferFormData) => {
    const parentTierId = editingOffer()?.tierId;
    if (!parentTierId) return;
    setForm('tiers', t => t.map(ti => {
      if (ti.id === parentTierId) {
        const exists = ti.offers.find(o => o.id === offer.id);
        return { ...ti, offers: exists ? ti.offers.map(o => o.id === offer.id ? offer : o) : [...ti.offers, offer] };
      }
      return ti;
    }));
    setEditingOffer(null);
  };
  const handleDeleteTier = (id: TempId) => setForm('tiers', t => t.filter(ti => ti.id !== id));
  const handleDeleteOffer = (tierId: TempId, offerId: TempId) => {
    setForm('tiers', t => t.map(ti => ti.id === tierId ? { ...ti, offers: ti.offers.filter(o => o.id !== offerId) } : ti));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!validateStep(totalSteps)) return;
    setIsLoading(true);
    setError(null);

    try {
      // --- Create or update event ---
      const payload = {
        title: form.title,
        description: form.description,
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
        venue_id: form.venue_id,
        segment_id: form.segment_id,
        genre_id: form.genre_id,
        status: form.status
      };

      let eventId: number;
      if (form.id) {
        eventId = form.id;
        await sendRequest(`/organizer/events/${eventId}`, { method: 'PATCH', body: payload });
      } else {
        const newEvent = await sendRequest<{ id: number }>('/organizer/events', { method: 'POST', body: payload });
        eventId = newEvent.id;
      }

      // --- Sync tiers and offers ---
      for (const tier of form.tiers) {
        let tierId = tier.id;
        if (typeof tierId === 'string' && tierId.startsWith('temp-')) {
          const newTier = await sendRequest<{ id: number }>(`/organizer/events/${eventId}/tiers`, { method: 'POST', body: tier });
          tierId = newTier.id;
        } else {
          await sendRequest(`/organizer/tiers/${tierId}`, { method: 'PATCH', body: tier });
        }

        for (const offer of tier.offers) {
          if (typeof offer.id === 'string' && offer.id.startsWith('temp-')) {
            await sendRequest(`/organizer/tiers/${tierId}/offers`, { method: 'POST', body: offer });
          } else {
            await sendRequest(`/organizer/offers/${offer.id}`, { method: 'PATCH', body: offer });
          }
        }
      }

      await props.onSubmit();
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Unexpected error.');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Published', label: 'Published' },
    { value: 'OnSale', label: 'On Sale' },
    { value: 'Cancelled', label: 'On Sale' },
    { value: 'Completed', label: 'On Sale' }
  ];

  const selectedVenue = createMemo(() => venues().find(v => v.value === String(form.venue_id)));
  const totalTierInventory = createMemo(() => form.tiers.reduce((sum, t) => sum + t.total_inventory, 0));
  const isOverCapacity = createMemo(() => selectedVenue()?.capacity ? totalTierInventory() > selectedVenue()!.capacity : false);

  return (
    <form onSubmit={handleSubmit}>
      {/* Step 1: Details */}
      <Show when={step() === 1}>
        <div class="space-y-6">
          <FloatingLabelInput name="title" label="Event Title" icon={AiOutlineFileText} value={form.title} onInput={handleInput} error={errors.title} />
          <FloatingLabelTextarea name="description" label="Description" icon={AiOutlineFileText} value={form.description} onInput={handleInput} />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FloatingDateInput name="start_time" label="Start Date" icon={AiOutlineCalendar} value={form.start_time} onUpdate={(v) => handleDateChange('start_time', v)} error={errors.start_time} />
            <FloatingDateInput name="end_time" label="End Date" icon={AiOutlineClockCircle} value={form.end_time || ''} onUpdate={(v) => handleDateChange('end_time', v)} error={errors.end_time} />
          </div>
        </div>
      </Show>

      {/* Step 2: Categorization */}
      <Show when={step() === 2}>
        <div class="space-y-6">
          <FloatingLabelSelect name="segment_id" label="Segment" icon={AiOutlineTag} options={segments()} value={String(form.segment_id || '')} onChange={(val) => handleSelectChange('segment_id', val)} error={errors.segment_id} />
          <FloatingLabelSelect name="genre_id" label="Genre" icon={AiOutlineTag} options={genres()} value={String(form.genre_id || '')} onChange={(val) => handleSelectChange('genre_id', val)} error={errors.genre_id} />
        </div>
      </Show>


      <Show when={step() === 3}>
        <div class="space-y-6">
          <FloatingLabelSelect name="venue_id" label="Venue" icon={AiOutlineEnvironment} options={venues()} value={String(form.venue_id || '')} onChange={(val) => handleSelectChange('venue_id', val)} error={errors.venue_id} />
          <FloatingLabelSelect name="status" label="Event Status" icon={AiOutlineFlag} options={statusOptions} value={form.status || 'draft'} onChange={(val) => setForm('status', val as EventFormData['status'])} />
        </div>
      </Show>

      {/* --- Step 4: Pricing & Tiers (Fully Implemented) --- */}
      <Show when={step() === 4}>
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Pricing & Tiers</h3>
            <button type="button" onClick={() => setEditingTierId(`temp-${Date.now()}`)} class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300">
              <AiOutlinePlusCircle /> Add Tier
            </button>
          </div>

          <Show when={step4Error()}>
            <p class="p-3 text-sm text-center text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900/50 rounded-lg">{step4Error()}</p>
          </Show>
          
          <Show when={editingTierId() !== null}>
            <div class="p-4 border border-indigo-500 rounded-lg bg-indigo-50 dark:bg-indigo-900/50">
              <TierSubForm 
                key={editingTierId()!}
                initialData={form.tiers?.find(t => t.id === editingTierId())}
                onSubmit={handleSaveTier}
                onCancel={() => setEditingTierId(null)}
              />
            </div>
          </Show>

          <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
            <For each={form.tiers} fallback={<p class="text-center text-sm text-neutral-500 py-8">No ticket tiers created yet.</p>}>
              {(tier) => (
                <div class="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  {/* --- TIER DISPLAY --- */}
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-semibold text-neutral-800 dark:text-neutral-200">{tier.name}</h4>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Inventory: {tier.total_inventory.toLocaleString()}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button type="button" onClick={() => setEditingTierId(tier.id)} class="text-neutral-400 hover:text-indigo-600" title="Edit Tier"><AiOutlineEdit /></button>
                      <button type="button" onClick={() => handleDeleteTier(tier.id)} class="text-neutral-400 hover:text-red-600" title="Delete Tier"><AiOutlineDelete /></button>
                    </div>
                  </div>
                  
                  {/* --- INLINE OFFER FORM --- */}
                  <Show when={editingOffer()?.tierId === tier.id}>
                     <div class="mt-4 pt-4 border-t border-dashed border-neutral-300 dark:border-neutral-600">
                        <OfferSubForm 
                          key={editingOffer()!.offerId!}
                          tierInventory={tier.total_inventory}
                          initialData={tier.offers.find(o => o.id === editingOffer()!.offerId)}
                          onSubmit={handleSaveOffer}
                          onCancel={() => setEditingOffer(null)}
                        />
                     </div>
                  </Show>
                  
                  {/* --- OFFER DISPLAY --- */}
                  <div class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                    <div class="flex justify-between items-center">
                      <h5 class="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Offers</h5>
                      <button type="button" onClick={() => setEditingOffer({ tierId: tier.id, offerId: `temp-${Date.now()}` })} class="text-xs text-indigo-600 font-semibold hover:underline">Add Offer</button>
                    </div>
                    <For each={tier.offers} fallback={<p class="text-xs text-neutral-500 text-center py-2">No offers for this tier yet.</p>}>
                      {(offer) => (
                        <div class="flex justify-between items-center p-2 bg-neutral-50 dark:bg-neutral-900/50 rounded">
                          <div>
                            <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{offer.name}</p>
                            <p class="text-xs text-neutral-500">{offer.quantity_for_sale.toLocaleString()} tickets</p>
                          </div>
                          <div class="flex items-center gap-4">
                            <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{offer.price.toLocaleString('id-ID', {style:'currency', currency:'IDR'})}</p>
                            <div class="flex items-center gap-2">
                              <button type="button" onClick={() => setEditingOffer({ tierId: tier.id, offerId: offer.id })} class="text-neutral-400 hover:text-indigo-600" title="Edit Offer"><AiOutlineEdit class="size-4"/></button>
                              <button type="button" onClick={() => handleDeleteOffer(tier.id, offer.id)} class="text-neutral-400 hover:text-red-600" title="Delete Offer"><AiOutlineDelete class="size-4"/></button>
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* --- Navigation and Submit --- */}
      <Show when={error()}><p class="mt-4 text-sm text-center text-red-500">{error()}</p></Show>
      <div class="pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <div>
          <Show when={step() > 1}>
            <button type="button" onClick={prevStep} class="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600">
              Previous
            </button>
          </Show>
        </div>
        <div>
 <Show 
            when={step() === totalSteps}
            fallback={
              <button type="button" onClick={handleNext} class="px-6 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                Next
              </button>
            }
          >
            <button
              type="button" // It's just a button, but it triggers the final submit
              onClick={handleSubmit}
              disabled={isLoading()}
              class="px-6 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading() ? 'Saving...' : (props.initialData ? 'Save Changes' : 'Create Event')}
            </button>
          </Show>
        </div>
      </div>
    </form>
  );
};

export default EventForm;