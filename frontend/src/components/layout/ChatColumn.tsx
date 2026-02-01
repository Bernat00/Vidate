import type { ReactElement, ReactNode } from 'react';

type ChatColumnProps = {
  children: ReactNode;
};

/**
 * Centers chat content and maintains the same vertical sizing rules as the existing MyMatches layout.
 */
export default function ChatColumn({ children }: ChatColumnProps): ReactElement {
  return (
    <div className="flex justify-center flex-1 mx-2">
      <div className="w-full lg:w-1/2 flex flex-col mx-2 pt-4 pb-4">
        {children}
      </div>
    </div>
  );
}
