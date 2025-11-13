import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastrar | TailAdmin - Dashboard Next.js",
  description: "Página de cadastro do TailAdmin Dashboard Template",
};

export default function SignUp() {
  return <SignUpForm />;
}
