import { cloneDeep } from "lodash-es";
import { PropsWithChildren } from "react";

// export function staticContext<P>(key: string, contextFn?: () => P) {
//   const map = new Map<string, P>();

//   if (!map.has(key) && contextFn) {
//     map.set(key, contextFn());
//   }
//   return {
//     map: map,
//     value: map.get(key) as P,
//     update: (value: P) => map.set(key, value),
//     delete: () => map.delete(key),
//     clear: () => map.clear(),
//   };
// }

export function createStaticContext<P>() {
  let context: P;

  const setContext = (newContext: P) => {
    context = cloneDeep(newContext);
  };

  const getConext = () => {
    return context;
  };

  return {
    getConext,
    Provider: ({ children, value }: PropsWithChildren<{ value: P }>) => {
      setContext(value);
      return <>{children}</>;
    },
  };
}

export function getStaticContext<P>(
  context: ReturnType<typeof createStaticContext<P>>
) {
  return context.getConext();
}
