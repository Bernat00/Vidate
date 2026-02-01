import type { ReactElement, ReactNode } from 'react';

type ChatColumnProps = {
  children: ReactNode;
};

/**
 * Centers chat content and maintains the same vertical sizing rules as the existing MyMatches layout.
 */
export default function ChatColumn({ children }: ChatColumnProps): ReactElement {
  return (
    <div className="flex justify-center items-center h-full mx-2">
      <div className="w-full lg:w-1/2 h-full">
        <div className="flex flex-col h-full mx-2 pt-4">{children}</div>
      </div>
    </div>
  );
}
