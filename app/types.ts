import type { ComponentType, ElementType } from "react";

export type ActionResponse<T = any, E = any> = {
  success: boolean;
  errors?: E;
  data?: T;
};

export type PropsWithClassName<T = {}> = { className?: string } & T;

/**
 * This type allows us to pass a Component or element as a prop.
 * ex: <Container as="main"></Container>
 **/
export type Tag = ElementType | ComponentType<{ className?: string }>;

export type UserSession =
  | {
      kind: "basic";
      userId: string;
    }
  | {
      kind: "totp";
      authenticated: boolean;
      userId: string;
    };
