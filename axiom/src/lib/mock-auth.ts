/* ──────────────────────────────────────────────────────────
 * Mock Authentication — Demo only (no real DB)
 * ⚠️ SECURITY WARNING: File này lưu password PLAIN TEXT trong localStorage.
 *    KHÔNG SỬ DỤNG trong production. Chỉ dùng cho demo/dev.
 *    Hệ thống thật sử dụng NextAuth + bcrypt (xem lib/auth.ts).
 * 6 tác nhân hệ thống AXIOM HRM
 * Hỗ trợ: quản trị tài khoản, hồ sơ cá nhân, đổi mật khẩu, đổi avatar
 * ────────────────────────────────────────────────────────── */

export type Role =
  | "admin"
  | "giamdoc"
  | "truongphong_ns"
  | "ketoan"
  | "truongphong"
  | "nhanvien"

export interface MockUser {
  id: string
  username: string
  password: string
  name: string
  email: string
  phone?: string
  role: Role
  roleLabel: string
  roleLabelEn: string
  department: string
  dashboardPath: string
  avatarUrl?: string          // base64 hoặc URL ảnh
  isActive?: boolean
  lastLogin?: string          // ISO string
  createdAt?: string          // ISO string
  mustChangePassword?: boolean  // true = yêu cầu đổi mật khẩu sau khi login
  isTempPassword?: boolean      // true = đang dùng mật khẩu tạm thời
  employeeId_num?: number       // numeric employeeId từ DB (NextAuth session)
}

// Dữ liệu mặc định — chỉ dùng lần đầu (seed)
const DEFAULT_USERS: MockUser[] = [
  {
    id: "NV000", username: "admin", password: "admin",
    name: "Administrator", email: "admin@axiom.vn", phone: "0123 456 789",
    role: "admin", roleLabel: "Quản trị viên", roleLabelEn: "System Admin",
    department: "Ban Giám đốc", dashboardPath: "/dashboard",
    isActive: true, createdAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: "GD001", username: "giamdoc", password: "giamdoc",
    name: "Lê Văn Giám Đốc", email: "giamdoc@axiom.vn", phone: "0987 654 321",
    role: "giamdoc", roleLabel: "Giám đốc", roleLabelEn: "Director",
    department: "Ban Giám đốc", dashboardPath: "/dashboard-director",
    isActive: true, createdAt: new Date(2024, 0, 5).toISOString(),
  },
  {
    id: "NS001", username: "nhansu", password: "nhansu",
    name: "Trần Thị Nhân Sự", email: "nhansu@axiom.vn", phone: "0901 234 567",
    role: "truongphong_ns", roleLabel: "Trưởng phòng Nhân sự", roleLabelEn: "HR Manager",
    department: "Phòng Nhân sự", dashboardPath: "/dashboard-hr",
    isActive: true, createdAt: new Date(2024, 1, 1).toISOString(),
  },
  {
    id: "KT001", username: "ketoan", password: "ketoan",
    name: "Phạm Thị Kế Toán", email: "ketoan@axiom.vn", phone: "0912 345 678",
    role: "ketoan", roleLabel: "Kế toán", roleLabelEn: "Accountant",
    department: "Phòng Kế toán", dashboardPath: "/dashboard-accountant",
    isActive: true, createdAt: new Date(2024, 1, 15).toISOString(),
  },
  {
    id: "TP001", username: "quanly", password: "quanly",
    name: "Nguyễn Văn Quản Lý", email: "quanly@axiom.vn", phone: "0933 456 789",
    role: "truongphong", roleLabel: "Trưởng phòng", roleLabelEn: "Department Manager",
    department: "Phòng Công nghệ", dashboardPath: "/dashboard-manager",
    isActive: true, createdAt: new Date(2024, 2, 1).toISOString(),
  },
  {
    id: "NV001", username: "nhanvien", password: "nhanvien",
    name: "Hoàng Thái Đăng Khoa", email: "nhanvien@axiom.vn", phone: "0944 567 890",
    role: "nhanvien", roleLabel: "Nhân viên", roleLabelEn: "Employee",
    department: "Phòng Công nghệ", dashboardPath: "/dashboard-employee",
    isActive: true, createdAt: new Date(2024, 2, 20).toISOString(),
  },
]

// ─── Key lưu localStorage ─────────────────────────────────
const AUTH_KEY     = "axiom_user"
const USERS_DB_KEY = "axiom_users_db"

// ─── Khởi tạo / lấy danh sách users từ DB (localStorage) ─
function getUsersDB(): MockUser[] {
  if (typeof window === "undefined") return DEFAULT_USERS
  try {
    const raw = localStorage.getItem(USERS_DB_KEY)
    if (!raw) {
      // Lần đầu: seed dữ liệu
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_USERS))
      return DEFAULT_USERS
    }
    return JSON.parse(raw) as MockUser[]
  } catch {
    return DEFAULT_USERS
  }
}

function saveUsersDB(users: MockUser[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users))
  }
}

// Export để dùng ở nơi khác khi cần (non-hook context)
export function getAllUsers(): MockUser[] {
  return getUsersDB()
}

// Backward compat — vẫn export MOCK_USERS như cũ
export const MOCK_USERS = DEFAULT_USERS

// ─── Authentication ───────────────────────────────────────

/** Login bằng Employee ID hoặc Username + password */
export function login(idOrUsername: string, password: string): MockUser | null {
  const users = getUsersDB()
  const key   = idOrUsername.toLowerCase()
  const user  = users.find(
    (u) =>
      (u.id.toLowerCase() === key || u.username.toLowerCase() === key) &&
      u.password === password &&
      u.isActive !== false
  )
  if (user) {
    // Cập nhật lastLogin
    const now = new Date().toISOString()
    const updated = { ...user, lastLogin: now }
    const newList = users.map(u => u.id === user.id ? updated : u)
    saveUsersDB(newList)

    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated))
    }
    return updated
  }
  return null
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function getCurrentUser(): MockUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw) as MockUser
    // Lấy dữ liệu mới nhất từ DB (phòng khi đã cập nhật)
    const db = getUsersDB()
    const fresh = db.find(u => u.id === cached.id)
    return fresh ?? cached
  } catch {
    return null
  }
}

/** Find user by email */
export function findUserByEmail(email: string): MockUser | undefined {
  return getUsersDB().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

/** Find user by employee ID */
export function findUserById(employeeId: string): MockUser | undefined {
  return getUsersDB().find((u) => u.id.toLowerCase() === employeeId.toLowerCase())
}

// ─── Hồ sơ cá nhân ───────────────────────────────────────

/** Cập nhật thông tin cá nhân (không phải password) */
export function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string; phone?: string; avatarUrl?: string }
): MockUser | null {
  const users = getUsersDB()
  const idx   = users.findIndex(u => u.id === userId)
  if (idx === -1) return null

  const updated = { ...users[idx], ...data }
  users[idx] = updated
  saveUsersDB(users)

  // Cập nhật session hiện tại nếu đang login với user này
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) {
      const session = JSON.parse(raw) as MockUser
      if (session.id === userId) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(updated))
      }
    }
  }
  return updated
}

/** Đổi mật khẩu — yêu cầu mật khẩu cũ đúng */
export function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  const users = getUsersDB()
  const idx   = users.findIndex(u => u.id === userId)
  if (idx === -1) return { success: false, error: "Tài khoản không tồn tại" }

  if (users[idx].password !== oldPassword) {
    return { success: false, error: "Mật khẩu cũ không đúng" }
  }
  users[idx] = { ...users[idx], password: newPassword }
  saveUsersDB(users)

  // Cập nhật session
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) {
      const session = JSON.parse(raw) as MockUser
      if (session.id === userId) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(users[idx]))
      }
    }
  }
  return { success: true }
}

// ─── Quản trị tài khoản (Admin) ──────────────────────────

/** Tạo tài khoản mới */
export function createUser(data: {
  username: string
  password: string
  name: string
  email: string
  phone?: string
  role: Role
  department: string
}): { success: boolean; user?: MockUser; error?: string } {
  const users = getUsersDB()

  // Kiểm tra username trùng
  if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
    return { success: false, error: "Username đã tồn tại" }
  }

  const ROLE_LABELS: Record<Role, { vi: string; en: string }> = {
    admin:            { vi: "Quản trị viên",          en: "System Admin" },
    giamdoc:          { vi: "Giám đốc",                en: "Director" },
    truongphong_ns:   { vi: "Trưởng phòng Nhân sự",   en: "HR Manager" },
    ketoan:           { vi: "Kế toán",                 en: "Accountant" },
    truongphong:      { vi: "Trưởng phòng",            en: "Department Manager" },
    nhanvien:         { vi: "Nhân viên",               en: "Employee" },
  }

  // Tạo ID tự động
  const prefix = data.role === "admin" ? "AD" : "NV"
  const maxNum = users.filter(u => u.id.startsWith(prefix))
    .map(u => parseInt(u.id.replace(prefix, "")) || 0)
    .reduce((a, b) => Math.max(a, b), 0)
  const newId = `${prefix}${String(maxNum + 1).padStart(3, "0")}`

  const newUser: MockUser = {
    id: newId,
    username: data.username,
    password: data.password,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    roleLabel: ROLE_LABELS[data.role].vi,
    roleLabelEn: ROLE_LABELS[data.role].en,
    department: data.department,
    dashboardPath: "/dashboard",
    isActive: true,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  saveUsersDB(users)
  return { success: true, user: newUser }
}

/** Khoá / Mở khoá tài khoản */
export function toggleUserActive(userId: string): MockUser | null {
  const users = getUsersDB()
  const idx   = users.findIndex(u => u.id === userId)
  if (idx === -1) return null
  users[idx] = { ...users[idx], isActive: !users[idx].isActive }
  saveUsersDB(users)
  return users[idx]
}

/** Đổi role */
export function updateUserRole(userId: string, role: Role): MockUser | null {
  const ROLE_LABELS: Record<Role, { vi: string; en: string }> = {
    admin:            { vi: "Quản trị viên",          en: "System Admin" },
    giamdoc:          { vi: "Giám đốc",                en: "Director" },
    truongphong_ns:   { vi: "Trưởng phòng Nhân sự",   en: "HR Manager" },
    ketoan:           { vi: "Kế toán",                 en: "Accountant" },
    truongphong:      { vi: "Trưởng phòng",            en: "Department Manager" },
    nhanvien:         { vi: "Nhân viên",               en: "Employee" },
  }
  const users = getUsersDB()
  const idx   = users.findIndex(u => u.id === userId)
  if (idx === -1) return null
  users[idx] = {
    ...users[idx], role,
    roleLabel:   ROLE_LABELS[role].vi,
    roleLabelEn: ROLE_LABELS[role].en,
  }
  saveUsersDB(users)
  return users[idx]
}

/** Admin reset mật khẩu (không cần mật khẩu cũ) */
export function adminResetPassword(userId: string, newPassword: string): boolean {
  const users = getUsersDB()
  const idx   = users.findIndex(u => u.id === userId)
  if (idx === -1) return false
  users[idx] = { ...users[idx], password: newPassword }
  saveUsersDB(users)
  return true
}

/** Xoá tài khoản (soft: chỉ admin mới xoá được) */
export function deleteUser(userId: string): boolean {
  const users = getUsersDB()
  const idx   = users.findIndex(u => u.id === userId)
  if (idx === -1) return false
  if (users[idx].role === "admin" && users.filter(u => u.role === "admin").length <= 1) {
    return false // Không được xoá admin cuối cùng
  }
  users.splice(idx, 1)
  saveUsersDB(users)
  return true
}

// ─── Forgot-password / Temporary password ────────────────

/**
 * Đặt mật khẩu tạm thời cho user (gọi từ API forgot-password).
 * Đánh dấu mustChangePassword = true để bắt đổi khi login lần sau.
 */
export function setTempPassword(userEmail: string, tempPassword: string): boolean {
  const users = getUsersDB()
  const idx   = users.findIndex(u => u.email.toLowerCase() === userEmail.toLowerCase())
  if (idx === -1) return false
  users[idx] = {
    ...users[idx],
    password: tempPassword,
    mustChangePassword: true,
    isTempPassword: true,
  }
  saveUsersDB(users)
  return true
}

/**
 * Xoá flag mustChangePassword sau khi user đặt mật khẩu mới thành công.
 * Cũng cập nhật session cookie (localStorage).
 */
export function clearMustChangePassword(userId: string, newPassword: string): boolean {
  const users = getUsersDB()
  const idx   = users.findIndex(u => u.id === userId)
  if (idx === -1) return false
  users[idx] = {
    ...users[idx],
    password: newPassword,
    mustChangePassword: false,
    isTempPassword: false,
  }
  saveUsersDB(users)
  // Cập nhật session
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) {
      const session = JSON.parse(raw) as MockUser
      if (session.id === userId) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(users[idx]))
      }
    }
  }
  return true
}

