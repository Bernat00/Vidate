interface CenteredLoaderProps {
  text?: string;
  className?: string;
  spinnerSize?: string;
}

export default function CenteredLoader({
  text = 'Loading...',
  className = "min-h-screen flex flex-col items-center justify-center bg-bgPrimary text-textSecondary gap-4",
  spinnerSize = "h-10 w-10"
}: CenteredLoaderProps) {
  return (
    <div className={className}>
      <div
        aria-label="Loading"
        className={`${spinnerSize} rounded-full border-4 border-borderAccentLight border-t-borderAccent centered-loader-spin`}
      />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}
