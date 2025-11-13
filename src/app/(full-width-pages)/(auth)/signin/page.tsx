import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar | TailAdmin - Dashboard Next.js",
  description: "Página de login do TailAdmin Dashboard Template",
};

export default function SignIn() {
  return <SignInForm />;
}
