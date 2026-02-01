interface CenteredLoaderProps {
  text?: string;
}

export default function CenteredLoader({ text = 'Loading...' }: CenteredLoaderProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bgPrimary text-textSecondary gap-4">
      <div
        aria-label="Loading"
        className="h-10 w-10 rounded-full border-4 border-borderAccentLight border-t-borderAccent centered-loader-spin"
      />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}
