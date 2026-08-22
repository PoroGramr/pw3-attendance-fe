import Image from "next/image";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-linear-to-b from-[#FFFFFF] to-[#ECEDFF] px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <Image src="/images/logo.png" alt="logo" width={140} height={64} priority />

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-xl font-bold text-[#2C79FF]">로그인이 필요합니다</h1>
          <p className="text-sm text-[#697077]">
            세션이 만료되었거나 로그인 정보를 확인할 수 없습니다.
            <br />
            다시 로그인해주세요.
          </p>
        </div>

        <Link
          href="/"
          className="w-full rounded-lg bg-[#2C79FF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B4FB8]"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    </div>
  );
}
