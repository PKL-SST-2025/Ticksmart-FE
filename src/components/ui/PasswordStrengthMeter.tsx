import { Component, createMemo, For } from 'solid-js';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: Component<PasswordStrengthMeterProps> = (props) => {
  const strength = createMemo(() => {
    let score = 0;
    const pass = props.password;
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };

    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1: case 2: return { score, label: 'Weak', color: 'bg-red-500' };
      case 3: return { score, label: 'Medium', color: 'bg-yellow-500' };
      case 4: return { score, label: 'Strong', color: 'bg-blue-500' };
      case 5: return { score, label: 'Very Strong', color: 'bg-green-500' };
      default: return { score: 0, label: '', color: 'bg-gray-200' };
    }
  });

  return (
    <div class="mt-2 space-y-1">
      <div class="grid grid-cols-5 gap-x-2">
        <For each={[1, 2, 3, 4, 5]}>
          {(bar) => (
            <div
              class="h-1 rounded-full transition-colors"
              classList={{
                [strength().color]: bar <= strength().score,
                'bg-gray-200 dark:bg-neutral-600': bar > strength().score,
              }}
            />
          )}
        </For>
      </div>
      <p class="text-xs text-right text-neutral-500 dark:text-neutral-400 font-medium">
        {strength().label}
      </p>
    </div>
  );
};

export default PasswordStrengthMeter;