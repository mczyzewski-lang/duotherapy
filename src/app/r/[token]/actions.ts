"use server";

import { clientIp } from "@/lib/request";
import { verifyShareCode } from "@/lib/report-share";

export async function verifyReportCode(token: string, code: string) {
  return verifyShareCode(token, code, await clientIp());
}
