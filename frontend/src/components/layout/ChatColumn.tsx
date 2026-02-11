import type { ReactElement, ReactNode } from 'react';

type ChatColumnProps = {
  children: ReactNode;
};

/**
 * Centers chat content and maintains the same vertical sizing rules as the existing MyMatches layout.
 */
export default function ChatColumn({ children }: ChatColumnProps): ReactElement {
  return (
    <div className="flex justify-center flex-1 min-h-0">
      <div className="w-full lg:px-8 flex flex-1 flex-col px-4 pt-4 min-h-0">
        {children}
      </div>
    </div>
  );
}
