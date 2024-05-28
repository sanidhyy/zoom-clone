import type { PropsWithChildren } from "react";

const RootLayout = ({ children }: PropsWithChildren) => {
  return <main>{children}</main>;
};

export default RootLayout;
