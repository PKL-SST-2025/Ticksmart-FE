import { Component, createSignal, onMount, createMemo, For, Show, createEffect, onCleanup } from "solid-js";
import { AiOutlineFileText, AiOutlineBank, AiOutlineHome, AiOutlineUser, AiOutlineCreditCard, AiOutlineCheckCircle, AiOutlineEnvironment, AiOutlinePushpin, AiOutlineGlobal, AiOutlineAppstore, AiFillIdcard, AiOutlineApartment, AiOutlineMail, AiOutlineCalendar, AiOutlineDollar, AiOutlineBarcode, AiOutlineNumber } from 'solid-icons/ai'; 

// 1. Import GSAP
import { gsap } from "gsap";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import FloatingLabelSelect from "../../../components/input/FloatingLabelSelect";
import { Calendar } from 'vanilla-calendar-pro';
import 'vanilla-calendar-pro/styles/index.css';
import FloatingDateInput from "../../../components/input/FloatingLabelDate";
import { createStore } from "solid-js/store";
import LocationPickerMap, { LocationData } from "../../../components/map/LocationPickerMap";
import { useNavigate } from "@solidjs/router";
import { sendRequest } from "../../../utils/SendRequest";
import StripePayoutForm from "../../../components/forms/StripePayoutsForm";
import { useUser } from "../../../context/UserContext";
import { useAdmin } from "../../../context/AdminContext";

// ========================================================================
// 2. DATA FOR THE STEPPER
// ========================================================================

const stepsData = [
  { index: 1, title: "Agreements", icon: AiOutlineFileText },
  { index: 2, title: "Business Info", icon: AiOutlineBank },
  { index: 3, title: "Address", icon: AiOutlineHome },
  { index: 4, title: "Representative", icon: AiOutlineUser },
  { index: 5, title: "Payouts", icon: AiOutlineCreditCard },
  { index: 6, title: "Confirmation", icon: AiOutlineCheckCircle },
];

const termsData = [
  { id: "terms", label: "I have read and agree to the Terms of Service." },
  { id: "privacy", label: "I have read and agree to the Privacy Policy." },
  { id: "vendor", label: "I understand and agree to the Vendor Agreement." },
];

const businessTypes = [
  { value: 'company', label: 'Company (Corporation, LLC, etc.)' },
  { value: 'individual', label: 'Individual / Sole Proprietorship' },
  { value: 'non_profit', label: 'Non-Profit Organization' },
  { value: 'government_entity', label: 'Government Entity' },
];

const taxIdTypes = [
  { value: 'vat', label: 'VAT Number' },
  { value: 'gst', label: 'GST / HST Number' },
  { value: 'brn', label: 'Business Registration Number' },
  { value: 'abn', label: 'Australian Business Number (ABN)' },
  { value: 'us_ein', label: 'U.S. Employer Identification Number (EIN)' },
  { value: 'other', label: 'Other / None' },
];

// Curated list of MCCs for event organizers
const organizerMccCodes = [
  { value: '7922', label: 'Theatrical Producers (except Motion Pictures), Ticket Agencies' },
  { value: '7996', label: 'Amusement Parks, Circuses, Carnivals, and Fortune Tellers' },
  { value: '7998', label: 'Aquariums, Dolphinariums, Zoos and Seaquariums' },
  { value: '7991', label: 'Tourist Attractions and Exhibits' },
  { value: '8699', label: 'Membership Organizations (Not Elsewhere Classified)' },
  { value: '5947', label: 'Gift, Card, Novelty, and Souvenir Shops' },
];

// --- Reusable regex patterns for validation ---
const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Allows numbers, spaces, and hyphens for international postal codes
  postalCode: /^[A-Za-z0-9\s-]+$/, 
  date: /^\d{4}-\d{2}-\d{2}$/,
  // ISO 3166-1 alpha-2 country code (e.g., US, ID, GB)
  countryCode: /^[A-Za-z]{2}$/, 
};

// --- A declarative schema that now PERFECTLY matches your Rust backend validation ---
const validationRules = [
  // ========================================================================
  // Step 2: Business Info (Matches OnboardingPayload, CompanyPayload, BusinessProfilePayload)
  // ========================================================================
  { field: 'businessType', step: 2, message: 'Please select a business type.', test: (val: string) => val !== '' },
  { field: 'company.name', step: 2, message: 'Business name must be at least 2 characters.', test: (val: string) => val.trim().length >= 2 },
  { field: 'company.taxIdType', step: 2, message: 'Please select a tax ID type.', test: (val: string) => val !== '' },
  { 
    field: 'company.taxIdNumber', 
    step: 2, 
    message: 'Tax ID number is required for this type.', 
    // Conditional test: required if the type is not 'other' and the field is empty
    test: (val: string, allDetails: any) => allDetails.company.taxIdType === 'other' || (val && val.trim() !== '') 
  },
  { field: 'businessProfile.mcc', step: 2, message: 'Business category must be a 4-digit code.', test: (val: string) => val.length === 4 },

  // ========================================================================
  // Step 3: Address (Matches CompanyAddressPayload)
  // ========================================================================
  { field: 'company.address.line1', step: 3, message: 'Street address must be at least 3 characters.', test: (val: string) => val.trim().length >= 3 },
  { field: 'company.address.city', step: 3, message: 'City must be at least 2 characters.', test: (val: string) => val.trim().length >= 2 },
  { field: 'company.address.state', step: 3, message: 'State/Province must be at least 2 characters.', test: (val: string) => val.trim().length >= 0 },
  { field: 'company.address.postalCode', step: 3, message: 'Postal code must be at least 3 characters.', test: (val: string) => val.trim().length >= 3 },
  { field: 'company.address.country', step: 3, message: 'Country must be a 2-letter code (e.g., US, ID).', test: (val: string) => REGEX.countryCode.test(val.trim()) },
  
  // ========================================================================
  // Step 4: Representative (Matches RepresentativePayload)
  // ========================================================================
  { field: 'representative.firstName', step: 4, message: 'First name must be at least 2 characters.', test: (val: string) => val.trim().length >= 2 },
  { field: 'representative.lastName', step: 4, message: 'Last name must be at least 2 characters.', test: (val: string) => val.trim().length >= 2 },
  { field: 'representative.email', step: 4, message: 'Please enter a valid email address.', test: (val: string) => REGEX.email.test(val) },
  { field: 'representative.dob', step: 4, message: 'Date of birth is required.', test: (val: string) => REGEX.date.test(val) },

  // ========================================================================
  // Step 5: Payouts (Matches OnboardingPayload)
  // ========================================================================
  { 
    field: 'stripeSetupIntentId', 
    step: 5, 
    message: 'You must complete the secure payout form to continue.', 
    test: (val: string) => val.startsWith('seti_')
  },
];

// Helper to safely get nested property values
const getValueByPath = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};
// ========================================================================
// 3. THE SOLIDJS COMPONENT
// ========================================================================


const VendorTermsPage: Component = () => {
  // Array to hold the HTML elements of each content panel for GSAP
const contentRefs: HTMLDivElement[] = [];
  
  const { isAuthenticated, user, refetchUser } = useUser();

createEffect(() => {
  // Make Solid track the reactive value
  const boarding = useUser().isBoarding();
  
  if (!boarding) {
    navigate("/organizer/onboarding", { replace: true });
  }
});


onMount(() => {
  if (!useUser().isBoarding()) {
    navigate("/organizer/onboarding", { replace: true });
  }
});

  const userContext = useUser();
  const adminContext = useAdmin();

  const navigate = useNavigate();
  const handleLogout = async () => {
      await userContext.logout();
      navigate('/login');
  };

  const [currentStep, setCurrentStep] = createSignal(1);
  const [checkedState, setCheckedState] = createStore({ terms: false, privacy: false, vendor: false });
  
  const [organizerDetails, setOrganizerDetails] = createStore({
    businessType: '',
    company: { name: '', taxIdType: '', taxIdNumber: '', address: { line1: '', city: '', state: '', postalCode: '', country: 'US' } }, // Default country
    businessProfile: { url: '', mcc: '' },
    representative: { firstName: '', lastName: '', email: '',  dob: ''  },
    // --- NEW: This will hold the ID from the successful Stripe Payout step ---
    stripeSetupIntentId: '', 
  });

  const [errors, setErrors] = createStore<Record<string, string>>({});



  const [isCalendarOpen, setCalendarOpen] = createSignal(false);


  // --- VALIDATION: NOW CHECKS EACH STEP INDIVIDUALLY ---
  const isCurrentStepValid = createMemo(() => {
    const step = currentStep();
    const details = organizerDetails;
    switch (step) {
      case 1:
        const checks = checkedState;
        return checks.terms && checks.privacy && checks.vendor;
      case 2:
        return details.businessType !== '' && 
               details.company.name.trim() !== '' && 
               details.company.taxIdType !== '' && 
               (details.company.taxIdType === 'other' || details.company.taxIdNumber.trim() !== '') && // Core conditional logic
               details.businessProfile.mcc !== '';
      case 3:
        return details.company.address.line1.trim() !== '' && details.company.address.city.trim() !== '' && details.company.address.state.trim() !== '' && details.company.address.postalCode.trim() !== '';
      case 4:
        return details.representative.firstName.trim() !== '' && details.representative.lastName.trim() !== '' && details.representative.email.trim() !== '' && details.representative.dob.trim() !== '';
      case 5:
        return details.stripeSetupIntentId.trim() !== '' 
      default:
        return true; // All subsequent steps (like confirmation) are valid
    }
  });

  const handlePayoutsSuccess = (setupIntentId: string) => {
    console.log("Stripe SetupIntent confirmed successfully:", setupIntentId);
    setOrganizerDetails('stripeSetupIntentId', setupIntentId);
    // Automatically move to the next step
    
    handleNext();
  };

    // --- EVENT HANDLERS ---
  const handleCheckboxChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    setCheckedState(input.name as keyof typeof checkedState, input.checked);
  };
  
  // A handler for standard <input> elements
  const handleInputChange = (path: string, value: string) => {
    if (errors[path]) setErrors(path, undefined);
    const keys = path.split('.');
    setOrganizerDetails(...keys, value);
  };

  // --- THE FIX: A dedicated handler for our new select component ---
  const handleSelectChange = (path: string, newValue: string) => {
    if (errors[path]) setErrors(path, undefined);
    const keys = path.split('.');
    setOrganizerDetails(...keys, newValue);
  };


  const handleAddressMapChange = (data: LocationData) => {
    setOrganizerDetails('company', 'address', {
      line1: data.address_line_1,
      city: data.city,
      state: data.state,
      postalCode: data.postal_code,
      country: "US",
    });
  };


  // --- LIFECYCLE & ANIMATION ---
  onMount(() => {
    // Set the initial state of the panels with GSAP
    gsap.set(contentRefs.slice(1), { autoAlpha: 0, display: 'none' });
  });

  const goToStep = (fromIndex: number, toIndex: number) => {
        setErrors({}); 

    const fromEl = contentRefs[fromIndex - 1];
    const toEl = contentRefs[toIndex - 1];
    if (!fromEl || !toEl) return;
    
    const direction = toIndex > fromIndex ? 1 : -1;
    const tl = gsap.timeline();
    tl.to(fromEl, { autoAlpha: 0, x: -50 * direction, duration: 0.3, ease: "power2.in" });
    tl.set(fromEl, { display: 'none' });
    tl.fromTo(toEl, { display: 'block', autoAlpha: 0, x: 50 * direction }, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out" });
  };




  
  
  // A robust handler for our nested state object
  const handleDetailsChange = (event: Event) => {
    const el = event.currentTarget as HTMLInputElement | HTMLSelectElement;
    const { name, value } = el;
    const path = name.split('.');

    // Clear the error for this field as the user is typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    
    setOrganizerDetails(prev => {
      const newState = { ...prev };
      let current: any = newState;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newState;
    });
  };


  const handleNext = () => {
    // We now ONLY call validateCurrentStep. It returns true/false.
    if (!validateCurrentStep() || currentStep() >= stepsData.length) return;
    goToStep(currentStep(), currentStep() + 1);
    setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    if (currentStep() <= 1) return;
    goToStep(currentStep(), currentStep() - 1);
    setCurrentStep(s => s - 1);
  };
  
    const [apiError, setApiError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  
  // --- FINAL SUBMISSION ---
  const handleFinish = async () => {
    if (!validateCurrentStep()) return;
    setIsLoading(true);
    setApiError('');
    try {
      // Send the complete data package to the backend
      await sendRequest('/organizer/stripe/onboarding', {
        method: 'POST',
        body: organizerDetails,
      });
      
      // On success, navigate to the organizer dashboard
      const navigate = useNavigate();
      navigate("/organizer/dashboard", { replace: true });


    } catch (err: any) {
      setApiError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);

    }
  };



  const validateCurrentStep = () => {
    const step = currentStep();
    const details = organizerDetails;
    const newErrors: Record<string, string> = {};

    // Handle special case for Step 1
    if (step === 1) {
      const checks = checkedState;
      if (!checks.terms || !checks.privacy || !checks.vendor) {
        newErrors['agreements'] = "You must agree to all terms to proceed.";
      }
    } else {
      // Filter rules for the current step
      const rulesForStep = validationRules.filter(rule => rule.step === step);

      // Apply each rule
      for (const rule of rulesForStep) {
        const value = getValueByPath(details, rule.field);
        if (!rule.test(value, details)) { // Pass all details for conditional checks
          newErrors[rule.field] = rule.message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // NEW: Specific handler to update the DOB state
  const handleDobChange = (dateString: string) => {
    if (errors['representative.dob']) setErrors('representative.dob', undefined);
    setOrganizerDetails('representative', 'dob', dateString);
  };

    const handleEdit = (targetStep: number) => {
    const fromStep = currentStep();
    if (fromStep === targetStep) return; // Do nothing if already on the step

    // Animate from the current step (Confirmation) to the target step
    goToStep(fromStep, targetStep);

    // Update the state to keep the navigation bar in sync
    setCurrentStep(targetStep);
  };


    // --- THE FIX: A single, robust handler for all nested state updates ---
  const updateDetail = (path: string, value: string) => {
    // Clear the error for this field as the user is typing
    if (errors[path]) {
      setErrors(path, undefined);
    }
    // This is the correct way to update nested properties in a Solid store
    const keys = path.split('.');
    setOrganizerDetails(...keys, value);
  };


  return (
    <>
    <div class="relative bg-gray-100 dark:bg-neutral-900 flex items-center justify-center min-h-screen w-screen p-4 font-sans">
                          <button
              type="button"
              class="py-2 px-4 absolute top-6 left-6 text-black cursor-pointer rounded-lg dark:text-white hover:bg-red-700 bg-red-600 transition-opacity"
              onClick={handleLogout }
            >
              Logout
            </button>
      <div class="w-full max-w-3xl bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-6 sm:p-8">


        <div class="relative flex flex-col">
        


          {/* ======================================================================== */}
          {/* STEPPER NAVIGATION: NOW SCROLLABLE AND WITH ENHANCED LOGIC             */}
          {/* ======================================================================== */}
          <ul class="relative flex flex-nowrap items-center gap-x-2 overflow-x-auto pb-4
                     [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full 
                     [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 
                     dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <For each={stepsData}>
              {(step) => (
                // FIX: Removed flex-1 and basis-0. Added shrink-0 and padding.
                <li class="flex items-center gap-x-2 shrink-0 px-2 first:ps-0 last:pe-0">
                   <div class="min-w-8 min-h-8 inline-flex justify-center items-center text-xs align-middle">
                     <span
                       class="size-8 flex justify-center items-center shrink-0 rounded-full font-medium transition-all duration-300"
                       classList={{
                         'bg-blue-600 text-white': step.index === currentStep(),
                         'bg-teal-500 text-white': step.index < currentStep(),
                         'bg-gray-100 text-gray-800 dark:bg-neutral-900 dark:text-white': step.index > currentStep(),
                       }}
                     >
                       <Show when={step.index < currentStep()} fallback={
                         <Show when={step.index === currentStep()} fallback={<step.icon class="size-4" />}>
                           {step.index}
                         </Show>
                       }>
                         <svg class="shrink-0 size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                       </Show>
                     </span>
                     <span class="ms-2 block text-sm font-medium text-gray-800 dark:text-white">{step.title}</span>
                   </div>
                   {/* Hide the connecting line for the very last item */}
                   <Show when={step.index < stepsData.length}>
                     <div class="w-full h-px flex-1 bg-gray-200 group-last:hidden dark:bg-neutral-700"></div>
                   </Show>
                 </li>
              )}
            </For>
          </ul>


          {/* Stepper Content Container - Taller to accommodate the form */}
          <div class="mt-8 relative h-[32rem] ">
            
                        
            {/* Panel 1: Agreements */}
            <div ref={el => contentRefs.push(el)} class="absolute inset-0">
              <div class="p-4 bg-gray-50 rounded-xl dark:bg-neutral-900/50">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Read and Agree to the Following</h3>
                <div class="space-y-4">
                  <For each={termsData}>
                    {(term) => (
                      <div class="flex items-center">
                        <input type="checkbox" name={term.id} id={`check-${term.id}`}   class="shrink-0 mt-0.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-neutral-600"
                        onChange={handleCheckboxChange} />
                        <label for={`check-${term.id}`} class="text-sm text-gray-600 ms-3 dark:text-neutral-400">{term.label}</label>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
            
            {/* Panel 2: Business Info - WITH ERROR HANDLING & CONDITIONAL FIELD */}
            <div ref={el => contentRefs.push(el)} class="absolute inset-0 overflow-y-auto">
              <div class="p-4 space-y-5"> {/* Increased vertical space */}
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Business Information</h3>
                
                <FloatingLabelSelect label="Business Type" name="businessType" icon={AiOutlineBank} options={businessTypes} value={organizerDetails.businessType}
                  onChange={(val) => handleSelectChange('businessType', val)} error={errors.businessType} />
                <FloatingLabelInput label="Legal Business Name" name="company.name" icon={AiOutlineApartment} value={organizerDetails.company.name}
                  onInput={(e) => handleInputChange('company.name', e.currentTarget.value)} error={errors['company.name']} />
                
                <div class="grid sm:grid-cols-2 gap-6 items-end">
                  <FloatingLabelSelect label="Business Tax ID Type" name="company.taxIdType" icon={AiFillIdcard} options={taxIdTypes} value={organizerDetails.company.taxIdType}
                    onChange={(val) => handleSelectChange('company.taxIdType', val)} error={errors['company.taxIdType']} />
                  <Show when={organizerDetails.company.taxIdType !== 'other' && organizerDetails.company.taxIdType !== ''}>
                    <FloatingLabelInput label="Tax ID Number" name="company.taxIdNumber" icon={AiFillIdcard} value={organizerDetails.company.taxIdNumber}
                      onInput={(e) => handleInputChange('company.taxIdNumber', e.currentTarget.value)} error={errors['company.taxIdNumber']} />
                  </Show>
                </div>
                <FloatingLabelSelect label="Business Category" name="businessProfile.mcc" icon={AiOutlineAppstore} options={organizerMccCodes} value={organizerDetails.businessProfile.mcc}
                  onChange={(val) => handleSelectChange('businessProfile.mcc', val)} error={errors['businessProfile.mcc']} />
              </div>
            </div>
            
            
             <div ref={el => contentRefs.push(el)} class="absolute inset-0 overflow-y-auto">
              <div class="p-4 space-y-5"> {/* Increased vertical space */}
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Business Address</h3>
                
                {/* THE MAP INTEGRATION */}
                <LocationPickerMap 
                  latitude={null} 
                  longitude={null} 
                  onLocationChange={handleAddressMapChange} 
                />
                
                <FloatingLabelInput label="Street Address" name="company.address.line1" icon={AiOutlineHome} value={organizerDetails.company.address.line1}
                  onInput={(e) => handleInputChange('company.address.line1', e.currentTarget.value)} error={errors['company.address.line1']} />
                <div class="grid sm:grid-cols-2 gap-6">
                  <FloatingLabelInput label="City" name="company.address.city" icon={AiOutlineEnvironment} value={organizerDetails.company.address.city}
                    onInput={(e) => handleInputChange('company.address.city', e.currentTarget.value)} error={errors['company.address.city']} />
                      <FloatingLabelInput
                        label="State / Province"
                        name="company.address.state"
                        icon={AiOutlineEnvironment}
                        value={organizerDetails.company.address.state}
                        onInput={(e) => updateDetail('company.address.state', e.currentTarget.value)}
                        error={errors['company.address.state']}
                      />
                </div>
                <div class="grid sm:grid-cols-2 gap-6">
                  <FloatingLabelInput label="Postal / Zip Code" name="company.address.postalCode" icon={AiOutlinePushpin} value={organizerDetails.company.address.postalCode}
                    onInput={(e) => handleInputChange('company.address.postalCode', e.currentTarget.value)} error={errors['company.address.postalCode']} />
                  <FloatingLabelInput label="Country" name="company.address.country" icon={AiOutlineGlobal} value={organizerDetails.company.address.country}
                    onInput={(e) => handleInputChange('company.address.country', e.currentTarget.value)} error={errors['company.address.country']} 
                    />
                </div>
              </div>
            </div>

            {/* --- Panel 4: Account Representative (FIXED) --- */}
            <div ref={el => contentRefs.push(el)} class="absolute inset-0 overflow-y-auto">
              <div class="p-4 space-y-6">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Account Representative</h3>
                <p class="text-sm text-gray-500 dark:text-neutral-400 -mt-4">
                  This is the individual who will own and manage this account.
                </p>
                <div class="grid sm:grid-cols-2 gap-6">
                  <FloatingLabelInput
                    label="First Name"
                    name="representative.firstName"
                    icon={AiOutlineUser}
                    value={organizerDetails.representative.firstName}
                    onInput={(e) => updateDetail('representative.firstName', e.currentTarget.value)}
                    error={errors['representative.firstName']}
                  />
                  <FloatingLabelInput
                    label="Last Name"
                    name="representative.lastName"
                    icon={AiOutlineUser}
                    value={organizerDetails.representative.lastName}
                    onInput={(e) => updateDetail('representative.lastName', e.currentTarget.value)}
                    error={errors['representative.lastName']}
                  />
                </div>
                <FloatingLabelInput
                  label="Email Address"
                  name="representative.email"
                  type="email"
                  icon={AiOutlineMail}
                  value={organizerDetails.representative.email}
                  onInput={(e) => updateDetail('representative.email', e.currentTarget.value)}
                  error={errors['representative.email']}
                />
                <FloatingDateInput
                  label="Date of Birth"
                  name="representative.dob"
                  value={organizerDetails.representative.dob}
                  icon={AiOutlineCalendar}
                  onUpdate={handleDobChange}
                  error={errors['representative.dob']}
                />
              </div>
            </div>


            {/* Panel 5: Payout Bank Account */}
                       <div ref={el => contentRefs.push(el)} class="absolute inset-0 overflow-y-auto">
              <div class="p-4 space-y-5">
                <h3 class="text-xl font-semibold text-gray-800 dark:text-white">Add Payout Method</h3>
                
                <StripePayoutForm onSuccess={handlePayoutsSuccess} />

              </div>
            </div>

            <div ref={el => contentRefs.push(el)} class="absolute inset-0 overflow-y-auto">
              <div class="p-4 space-y-5">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Review Your Information</h3>
                <p class="text-sm text-gray-500 dark:text-neutral-400 -mt-3">
                  Please confirm that all the details below are correct before finishing.
                </p>
                
                {/* Review List */}
                <div class="space-y-4">
                  
                  {/* Business Details Review */}
                  <div class="p-4 border border-gray-200 rounded-lg dark:border-neutral-700">
                    <div class="flex justify-between items-center">
                      <h4 class="font-semibold text-gray-700 dark:text-neutral-300">Business Details</h4>
                      <button onClick={() => handleEdit(2)} class="text-sm text-blue-600 hover:underline">Edit</button>
                    </div>
                    <ul class="mt-2 text-sm text-gray-600 dark:text-neutral-400 space-y-1">
                      <li><strong>Name:</strong> {organizerDetails.company.name}</li>
                      <li><strong>Tax ID:</strong> {organizerDetails.company.taxIdNumber || 'N/A'}</li>
                    </ul>
                  </div>

                  {/* Address Review */}
                  <div class="p-4 border border-gray-200 rounded-lg dark:border-neutral-700">
                    <div class="flex justify-between items-center">
                      <h4 class="font-semibold text-gray-700 dark:text-neutral-300">Address</h4>
                      <button onClick={() => handleEdit(3)} class="text-sm text-blue-600 hover:underline">Edit</button>
                    </div>
                    <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                      {organizerDetails.company.address.line1}<br />
                      {organizerDetails.company.address.city}, {organizerDetails.company.address.state} {organizerDetails.company.address.postalCode}<br />
                      {organizerDetails.company.address.country}
                    </p>
                  </div>
                  
                  {/* Representative Review */}
                  <div class="p-4 border border-gray-200 rounded-lg dark:border-neutral-700">
                    <div class="flex justify-between items-center">
                      <h4 class="font-semibold text-gray-700 dark:text-neutral-300">Representative</h4>
                      <button onClick={() => handleEdit(4)} class="text-sm text-blue-600 hover:underline">Edit</button>
                    </div>
                    <ul class="mt-2 text-sm text-gray-600 dark:text-neutral-400 space-y-1">
                      <li><strong>Name:</strong> {organizerDetails.representative.firstName} {organizerDetails.representative.lastName}</li>
                      <li><strong>Email:</strong> {organizerDetails.representative.email}</li>
                      <li><strong>DOB:</strong> {organizerDetails.representative.dob}</li>
                    </ul>
                  </div>
                  
                  {/* Payouts Review */}
                  <div class="p-4 border border-gray-200 rounded-lg dark:border-neutral-700">
                    <div class="flex justify-between items-center">
                      <h4 class="font-semibold text-gray-700 dark:text-neutral-300">Payouts</h4>
                    <button onClick={() => handleEdit(5)} class="text-sm text-indigo-600 hover:underline">Edit</button>
                    </div>
                    <Show 
                    when={organizerDetails.stripeSetupIntentId}
                    fallback={<p class="mt-2 text-sm text-yellow-600">Payout method not yet configured.</p>}
                  >
                    <p class="mt-2 text-sm text-green-600 font-medium">
                      ✓ Payout method successfully configured and ready.
                    </p>
                  </Show>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Stepper Actions */}
          <div class="mt-6 flex justify-between items-center gap-x-2">
            
                        

            <button
              type="button"
              class="py-2 px-4 text-black cursor-pointer dark:text-white hover:text-blue-600 transition-opacity"
              onClick={handleBack}
              disabled={currentStep() === 1}
            >
              Back
            </button>
            {/* Show 'Next' button for all steps except the last */}
            <Show when={currentStep() < stepsData.length}>
              <button
                type="button"
                class="py-2 px-4  bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-md"
                onClick={handleNext}
                disabled={!isCurrentStepValid()}
              >
                Next
              </button>
            </Show>
            {/* Show 'Finish' button ONLY on the last step */}
            <Show when={currentStep() === stepsData.length}>
              <button
                type="button"
                class="py-2 px-4 rounded-lg cursor-pointer bg-teal-500 hover:bg-teal-600 text-white"
                onClick={handleFinish}
                disabled={!isCurrentStepValid()}
              >
                Finish
              </button>
            </Show>
          </div>
        </div>
      </div>

    </div>
    </>
  );
};

export default VendorTermsPage;