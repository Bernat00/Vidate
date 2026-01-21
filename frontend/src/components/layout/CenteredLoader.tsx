import { Spinner } from 'flowbite-react';

interface CenteredLoaderProps {
  text?: string;
}

export default function CenteredLoader({ text = 'Loading...' }: CenteredLoaderProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bgPrimary text-textSecondary gap-4">
      <Spinner size="xl" color="purple" aria-label="Loading" />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}
