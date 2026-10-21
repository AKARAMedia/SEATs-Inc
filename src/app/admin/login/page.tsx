import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[380px] rounded-lg bg-white p-8 shadow-sm ring-1 ring-black/5">
        <Image src="/media/seats-inc.png" alt="S.E.A.T.S Inc." width={1701} height={412} className="mx-auto mb-6 h-auto w-[200px]" loading="eager" />
        <h1 className="mb-6 text-center text-[18px] font-semibold text-[#333]">News &amp; Events Admin</h1>
        <LoginForm />
      </div>
    </div>
  );
}
