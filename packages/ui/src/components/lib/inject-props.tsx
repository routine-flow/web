import React from "react";

export function InjectProps<P>(
  WrappedComponent: React.ElementType,
  additionalProps: Partial<React.ComponentProps<React.ElementType>>
) {
  // 재귀적으로 children을 처리하는 함수
  function injectToChildren(children: React.ReactNode): React.ReactNode {
    // null 또는 undefined인 경우 그대로 반환
    if (children === null || children === undefined) return children;

    // children이 배열인 경우 각 요소를 순회
    if (Array.isArray(children)) {
      return children.map((child) => injectToChild(child));
    }

    // 단일 요소 혹은 문자열 등
    return injectToChild(children);
  }

  function injectToChild(child: React.ReactNode): React.ReactNode {
    if (!React.isValidElement(child)) return child;

    // child의 props 에서 children을 분리
    const { children: childChildren, ...childProps } =
      child.props as React.PropsWithChildren<P>;
    const newChildren = injectToChildren(childChildren);

    // native DOM 요소라면(예: "div") 추가 props를 주입하지 않음
    if (typeof child.type === "string") {
      return React.cloneElement(child, {
        ...childProps,
        children: newChildren,
        key: globalThis.crypto.randomUUID(),
      });
    }

    // 커스텀 컴포넌트라면 additionalProps를 주입
    return React.cloneElement(child, {
      ...childProps,
      ...additionalProps,
      children: newChildren,
      key: globalThis.crypto.randomUUID(),
    });
  }

  type Props = React.PropsWithChildren<React.ComponentProps<React.ElementType>>;
  const WithInjectedProps: React.FC<Props> = (props) => {
    return (
      <WrappedComponent {...props}>
        {injectToChildren(props.children)}
      </WrappedComponent>
    );
  };

  return WithInjectedProps;
}
