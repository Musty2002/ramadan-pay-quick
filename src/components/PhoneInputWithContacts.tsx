import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Contact } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface PhoneInputWithContactsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  maxLength?: number;
}

const normalizePhoneForInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length >= 13) {
    return `0${digits.slice(3, 14)}`;
  }
  if (!digits.startsWith('0') && digits.length === 10) {
    return `0${digits}`;
  }
  return digits.slice(0, 11);
};

export function PhoneInputWithContacts({
  value,
  onChange,
  placeholder = 'Enter phone number',
  className = '',
  id = 'phone',
}: PhoneInputWithContactsProps) {
  const [picking, setPicking] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const normalized = normalizePhoneForInput(pasted);
    onChange(normalized);
  };

  const pickContact = async () => {
    if (picking) return;
    setPicking(true);

    try {
      // Try Contact Picker API (Chrome Android)
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const contacts = await (navigator as any).contacts.select(
          ['tel'],
          { multiple: false }
        );
        if (contacts?.length > 0 && contacts[0].tel?.length > 0) {
          const phone = normalizePhoneForInput(contacts[0].tel[0]);
          onChange(phone);
          return;
        }
      }

      // Fallback: try reading from clipboard
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        const digits = text.replace(/\D/g, '');
        if (digits.length >= 10) {
          const phone = normalizePhoneForInput(text);
          onChange(phone);
          toast.success('Phone number pasted from clipboard');
          return;
        }
      }

      toast.info('Contact picker not available. Please type or paste the number.');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Contact pick error:', err);
        toast.info('Please type or paste the phone number');
      }
    } finally {
      setPicking(false);
    }
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type="tel"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        className={`pr-12 ${className}`}
      />
      <button
        type="button"
        onClick={pickContact}
        disabled={picking}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        title="Pick from contacts"
      >
        <Contact className="w-5 h-5" />
      </button>
    </div>
  );
}
