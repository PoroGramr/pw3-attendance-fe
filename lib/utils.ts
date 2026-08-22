import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UAParser } from "ua-parser-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 브라우저의 User-Agent를 분석해 "Chrome on macOS"와 같은 형태의 deviceInfo 문자열을 만든다.
export function getDeviceInfo(): string {
  const { browser, os } = new UAParser().getResult()

  const browserName = browser.name || "Unknown Browser"
  const osName = os.name || "Unknown OS"

  return `${browserName} on ${osName}`
}

// 서버가 초 단위 Unix epoch 타임스탬프로 내려주는 만료 시각을 Date로 변환한다.
export function epochSecondsToDate(epochSeconds: number): Date {
  return new Date(epochSeconds * 1000)
}

// 쿠키를 설정한다. expires를 넘기지 않으면 세션 쿠키로 저장된다.
export function setCookie(name: string, value: string, expires?: Date) {
  if (typeof document === "undefined") return
  const expiresPart = expires ? `; expires=${expires.toUTCString()}` : ""
  document.cookie = `${name}=${encodeURIComponent(value)}${expiresPart}; path=/; SameSite=Lax`
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"))
  return match ? decodeURIComponent(match[1]) : null
}

export function removeCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

