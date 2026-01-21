type AuthHeaderProps = {
  title?: string;
};

export default function AuthHeader({ title = 'Vidate' }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      <img className="w-16 h-16 mb-2 rounded-4xl" src="/logo.png" alt="logo" />
      <h1 className="text-2xl font-bold text-textAccent">{title}</h1>
    </div>
  );
}

