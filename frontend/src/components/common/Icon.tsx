interface IconProps {
  icon: any;
  className?: string;
  size?: number | string;
}

export default function Icon({ icon: LucideIcon, className = '', size = 20 }: IconProps) {
  const defaultClasses = "text-textAccent";
  
  return (
    <LucideIcon 
      className={`${defaultClasses} ${className}`.trim()} 
      size={size}
    />
  );
}
