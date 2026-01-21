type FormErrorTextProps = {
  children?: string;
};

export default function FormErrorText({ children }: FormErrorTextProps) {
  if (!children) return null;
  return <span className="text-textError text-xs mt-1">{children}</span>;
}

