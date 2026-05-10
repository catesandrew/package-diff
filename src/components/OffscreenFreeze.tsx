import React from 'react';

export function OffscreenFreeze(props: {
  active: boolean;
  children: React.ReactNode;
}): React.ReactElement | null {
  if (!props.active) {
    return null;
  }

  return <>{props.children}</>;
}
