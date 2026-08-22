import axios from "./apiClient";

export interface AdminApplicant {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  approvalStatus: string;
  approvedById: number | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

// 슈퍼어드민이 볼 수 있는 전체 관리자(가입 신청자 포함) 목록을 조회한다.
export const getAdmins = async (): Promise<AdminApplicant[]> => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/super-admin/admins`);
  return response.data;
};

// 관리자 가입 신청을 승인한다.
export const approveAdmin = async (id: number) => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/super-admin/admins/${id}/approve`);
  return response.data;
};

// 관리자 가입 신청을 거절한다.
export const rejectAdmin = async (id: number) => {
  const response = await axios.patch(
    `${process.env.NEXT_PUBLIC_API_URL}/super-admin/admins/${id}/reject`,
    { reason: "관리자 마음" }
  );
  return response.data;
};
