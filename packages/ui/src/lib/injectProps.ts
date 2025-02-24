import React from "react";

// 재귀적으로 자식 엘리먼트에 prop을 주입하는 헬퍼 함수 (배열 처리 추가)
export const injectProps = <P>(
  children: React.ReactNode,
  additionalProps: P
): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    const { children: childChildren, ...childProps } =
      child.props as React.PropsWithChildren<P>;
    const newChildren = childChildren
      ? injectProps(childChildren, additionalProps)
      : childChildren;

    // Native DOM 엘리먼트라면 ui prop 등을 주입하지 않음
    if (typeof child.type === "string") {
      return React.cloneElement(child, {
        ...childProps,
        children: newChildren,
      });
    }

    return React.cloneElement(child, {
      ...childProps,
      ...additionalProps,
      children: newChildren,
    });
  });
};
