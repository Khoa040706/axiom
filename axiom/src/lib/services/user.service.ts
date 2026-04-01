import { prisma } from "@/lib/prisma"

export const userService = {
  // ── Queries ──────────────────────────────────────────────

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      include: {
        employee: { select: { id: true, code: true, fullName: true, department: { select: { name: true } } } },
      },
    })
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, code: true, fullName: true } },
      },
    })
  },

  /** Lấy tất cả users kèm thông tin employee (cho admin page) */
  async findAll() {
    return prisma.user.findMany({
      include: {
        employee: {
          select: {
            id: true, code: true, fullName: true,
            email: true, phone: true,
            department: { select: { name: true } },
            avatarPath: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  },

  // ── Mutations ───────────────────────────────────────────

  /** Tạo user mới + Employee record liên kết (transaction) */
  async createWithEmployee(data: {
    username: string
    passwordHash: string
    fullName: string
    email?: string
    phone?: string
    role: string
    departmentId?: number
    positionId?: number
  }) {
    // Check username trùng
    const exists = await prisma.user.findUnique({ where: { username: data.username } })
    if (exists) throw new Error("Username đã tồn tại")

    return prisma.$transaction(async (tx) => {
      // 1. Tìm mã NV tiếp theo — chỉ lấy code bắt đầu bằng "NV"
      const existingNVs = await tx.employee.findMany({
        where: { code: { startsWith: "NV" } },
        select: { code: true },
        orderBy: { code: "desc" },
        take: 1,
      })
      const lastNVCode = existingNVs[0]?.code
      const num = lastNVCode ? parseInt(lastNVCode.replace(/\D/g, "")) + 1 : 1
      const code = `NV${String(num).padStart(3, "0")}`

      // 2. Tạo Employee
      const employee = await tx.employee.create({
        data: {
          code,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          departmentId: data.departmentId ?? null,
          positionId: data.positionId ?? null,
          hireDate: new Date(),
          status: "Đang làm",
        },
      })

      // 3. Tạo User liên kết
      const user = await tx.user.create({
        data: {
          username: data.username,
          passwordHash: data.passwordHash,
          role: data.role,
          employeeId: employee.id,
          isActive: true,
        },
      })

      return { employee, user }
    })
  },

  async create(data: {
    username: string
    passwordHash: string
    employeeId?: number
    role?: string
  }) {
    return prisma.user.create({ data })
  },

  async updateRole(id: number, role: string) {
    return prisma.user.update({ where: { id }, data: { role } })
  },

  /** Toggle active/inactive */
  async toggleActive(id: number) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new Error("User không tồn tại")
    return prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    })
  },

  async deactivate(id: number) {
    return prisma.user.update({ where: { id }, data: { isActive: false } })
  },

  /** Xóa user + soft-delete employee liên kết */
  async deleteWithEmployee(id: number) {
    // Đảm bảo không xóa admin cuối
    const admins = await prisma.user.count({ where: { role: "Admin", isActive: true } })
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new Error("User không tồn tại")
    if (user.role === "Admin" && admins <= 1) {
      throw new Error("Không thể xoá admin cuối cùng")
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id } })
      if (user.employeeId) {
        await tx.employee.update({
          where: { id: user.employeeId },
          data: { status: "Nghỉ việc" },
        })
      }
    })
  },

  /** Admin reset password (không cần mật khẩu cũ) */
  async resetPassword(id: number, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    })
  },

  /** User tự đổi password — trả về user để verify */
  async findForPasswordChange(id: number) {
    return prisma.user.findUnique({ where: { id } })
  },

  async updatePassword(id: number, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } })
  },

  async updateLastLogin(id: number) {
    return prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    })
  },

  /** Cập nhật profile employee (name, email, phone, avatar) */
  async updateEmployeeProfile(employeeId: number, data: {
    fullName?: string
    email?: string
    phone?: string
    avatarPath?: string
  }) {
    return prisma.employee.update({
      where: { id: employeeId },
      data,
    })
  },

  /** Forgot password: set temp password */
  async setTempPassword(username: string, passwordHash: string) {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) throw new Error("Tài khoản không tồn tại")
    if (!user.isActive) throw new Error("Tài khoản đã bị khoá")
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
    return user
  },

  /** Lấy departments cho dropdown khi tạo user */
  async getDepartmentsForSelect() {
    return prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
  },

  /** Đếm admin active (dùng khi xóa) */
  async countActiveAdmins() {
    return prisma.user.count({ where: { role: "Admin", isActive: true } })
  },
}
