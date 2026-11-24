export interface UserResponse {
  id: string; // publicId
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  roles: string[];
  shops?: {
    shopId: string;
    role: string;
    name: string;
    slug: string;
  }[];
  createdAt: Date;
}

export function formatUserResponse(user: any): UserResponse {
  return {
    id: user.publicId,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone || null,
    avatarUrl: user.avatarUrl || null,
    status: user.status,
    roles: user.roles ? user.roles.map((r: any) => r.role) : ['CUSTOMER'],
    shops: user.shopMembers?.map((m: any) => ({
      shopId: m.shop.publicId,
      role: m.role,
      name: m.shop.name,
      slug: m.shop.slug,
    })),
    createdAt: user.createdAt,
  };
}
