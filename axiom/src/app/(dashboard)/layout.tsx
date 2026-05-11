/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign,
  Settings, LogOut, Sun, Moon, Bell, UserCog, FileText, Briefcase,
  Menu, X as XIcon, History, BarChart2,
} from "lucide-react"
import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import { getCurrentUser, logout as mockLogout, type MockUser } from "@/lib/mock-auth"
import { DashboardProvider, useDashboard, getTheme } from "@/lib/dashboard-context"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { getEmployeeAvatar } from "@/lib/actions/user-admin.actions"
import { AvatarImg } from "@/components/ui/avatar-img"

// Nav items per role — bám sát Use Case Diagram
// UC-01: QL thông tin NV, UC-02: QL HĐ LĐ, UC-03: QL quá trình CT
// UC-04: Đăng ký nghỉ phép, UC-05: Duyệt nghỉ phép, UC-06: QL chấm công
// UC-07: Công tác phí, UC-08: Thiết lập CT lương, UC-09: Tính lương TĐ
// UC-10: Xuất phiếu lương, UC-11: Dashboard thống kê, UC-12: RBAC
type NavItem = { href: string; icon: any; vi: string; en: string }
function getNav(role: string): NavItem[] {
  // ── ADMIN: UC-01,02,03 (Core HR) + UC-08 (Cấu hình lương) + UC-11,12 (Báo cáo & RBAC) ──
  const admin: NavItem[] = [
    { href: "/dashboard", icon: LayoutDashboard, vi: "Trang chủ", en: "Home" },
    { href: "/employees", icon: Users, vi: "Quản lý nhân sự", en: "Employees" },
    { href: "/contracts", icon: FileText, vi: "Hợp đồng lao động", en: "Contracts" },
    { href: "/career-history", icon: History, vi: "Quá trình công tác", en: "Career History" },
    { href: "/payroll", icon: DollarSign, vi: "Cấu hình lương", en: "Salary Config" },
    { href: "/settings/users", icon: UserCog, vi: "Phân quyền (RBAC)", en: "User Roles" },
    { href: "/dashboard-director", icon: BarChart2, vi: "Thống kê", en: "Statistics" },
  ]
  // ── DIRECTOR (Ban lãnh đạo): UC-11 (Dashboard thống kê → extends: Xuất báo cáo) ──
  const director: NavItem[] = [
    { href: "/dashboard-director", icon: LayoutDashboard, vi: "Dashboard thống kê", en: "Statistics" },
  ]
  // ── HR MANAGER: UC-01,02,03 (Core HR) + UC-05 (Duyệt NP) + UC-06 (Chấm công) + UC-07 (Công tác phí) + UC-11 ──
  const hr: NavItem[] = [
    { href: "/dashboard-hr", icon: LayoutDashboard, vi: "Tổng quan", en: "Overview" },
    { href: "/employees", icon: Users, vi: "Quản lý nhân sự", en: "Employees" },
    { href: "/contracts", icon: FileText, vi: "Hợp đồng", en: "Contracts" },
    { href: "/career-history", icon: History, vi: "Quá trình công tác", en: "Career History" },
    { href: "/attendance", icon: Clock, vi: "Quản lý chấm công", en: "Attendance" },
    { href: "/leave", icon: CalendarDays, vi: "Duyệt nghỉ phép", en: "Leave Approval" },
    { href: "/business-trips", icon: Briefcase, vi: "Công tác phí", en: "Business Trips" },
  ]
  // ── ACCOUNTANT (Kế toán): UC-08,09,10 (Payroll) + UC-11 (Dashboard thống kê) ──
  const accountant: NavItem[] = [
    { href: "/dashboard-accountant", icon: LayoutDashboard, vi: "Tổng quan", en: "Overview" },
    { href: "/payroll", icon: DollarSign, vi: "Bảng lương", en: "Payroll" },
    { href: "/payroll/config", icon: Settings, vi: "Cấu hình lương", en: "Salary Config" },
    { href: "/payslips", icon: FileText, vi: "Phiếu lương", en: "Payslips" },
  ]
  // ── MANAGER (Trưởng phòng): UC-05 (Duyệt NP) + UC-06 (Chấm công) + UC-11 (Dashboard thống kê) ──
  const manager: NavItem[] = [
    { href: "/dashboard-manager", icon: LayoutDashboard, vi: "Tổng quan", en: "Overview" },
    { href: "/attendance", icon: Clock, vi: "Chấm công phòng", en: "Team Attendance" },
    { href: "/leave", icon: CalendarDays, vi: "Duyệt nghỉ phép", en: "Leave Approval" },
  ]
  // ── EMPLOYEE (Nhân viên): UC-04 (Đăng ký NP) + UC-06 (Chấm công) + UC-07 (Công tác phí) + UC-10 (Xem phiếu lương) ──
  const employee: NavItem[] = [
    { href: "/dashboard-employee", icon: LayoutDashboard, vi: "Trang chủ", en: "Overview" },
    { href: "/attendance/check-in", icon: Clock, vi: "Chấm công", en: "My Attendance" },
    { href: "/leave", icon: CalendarDays, vi: "Đơn nghỉ phép", en: "My Leaves" },
    { href: "/payslips", icon: DollarSign, vi: "Phiếu lương", en: "My Payslip" },
    { href: "/business-trips", icon: Briefcase, vi: "Công tác phí", en: "Business Trips" },
    { href: "/profile", icon: Settings, vi: "Hồ sơ cá nhân", en: "My Profile" },
  ]
  switch (role) {
    case "Director": case "giamdoc": return director
    case "HRManager": case "truongphong_ns": return hr
    case "Accountant": case "ketoan": return accountant
    case "Manager": case "truongphong": return manager
    case "Employee": case "nhanvien": return employee
    case "Admin": case "admin": return admin
    default: return admin
  }
}

const W = 220
const W_COLLAPSED = 64
const W_TABLET = 64
const HEADER_H = 54

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <Inner>{children}</Inner>
    </DashboardProvider>
  )
}

function Inner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { dark, toggleDark, lang, toggleLang } = useDashboard()
  const { isMobile, isTablet } = useBreakpoint()

  const [hov, setHov] = useState<string | null>(null)
  const [user, setUser] = useState<MockUser | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/avatarmacdinh.jpg")
  const [showProfile, setShowProfile] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarHover, setSidebarHover] = useState(false)
  // Thông báo theo role — mỗi tài khoản thấy nội dung phù hợp với công việc của mình
  const [notifications, setNotifications] = useState(() => {
    const role = (() => {
      if (typeof window !== "undefined") {
        try {
          // Đọc role từ session cookie hoặc localStorage nếu có
          const stored = localStorage.getItem("axiom_mock_user")
          if (stored) return JSON.parse(stored).role ?? "Employee"
        } catch { /* ignore */ }
      }
      return "Employee"
    })()

    const SYSTEM = { id: 99, type: "system", read: true, timeVi: "Hôm qua", timeEn: "Yesterday", titleVi: "Cập nhật hệ thống", titleEn: "System Update", bodyVi: "Phiên bản AXIOM HRM v2.1 đã ra mắt", bodyEn: "AXIOM HRM v2.1 has been released" }

    const byRole: Record<string, typeof SYSTEM[]> = {
      // Giám đốc: báo cáo, phê duyệt ngân sách, hoạt động toàn công ty
      Director: [
        { id: 1, type: "payroll", read: false, timeVi: "30 phút trước", timeEn: "30 min ago", titleVi: "Báo cáo lương tháng 4", titleEn: "April Payroll Report", bodyVi: "Tổng quỹ lương tháng 4/2026 sẵn sàng để xem xét", bodyEn: "April 2026 total payroll fund is ready for review" },
        { id: 2, type: "leave", read: false, timeVi: "2 giờ trước", timeEn: "2 hrs ago", titleVi: "5 đơn nghỉ phép chờ duyệt", titleEn: "5 Pending Leave Requests", bodyVi: "Các trưởng phòng đã chuyển 5 đơn để lãnh đạo duyệt", bodyEn: "5 leave requests forwarded by department heads" },
        { id: 3, type: "attendance", read: true, timeVi: "Hôm nay", timeEn: "Today", titleVi: "Tỷ lệ chấm công tháng 4", titleEn: "April Attendance Rate", bodyVi: "Tỷ lệ đi làm đúng giờ đạt 94.2% trong tháng 4", bodyEn: "On-time attendance rate reached 94.2% in April" },
        SYSTEM,
      ],
      // Admin: quản trị hệ thống, phân quyền, nhân sự
      Admin: [
        { id: 1, type: "system", read: false, timeVi: "10 phút trước", timeEn: "10 min ago", titleVi: "Tài khoản mới cần kích hoạt", titleEn: "New Account Pending Activation", bodyVi: "2 tài khoản nhân viên mới đang chờ phê duyệt", bodyEn: "2 new employee accounts awaiting approval" },
        { id: 2, type: "leave", read: false, timeVi: "1 giờ trước", timeEn: "1 hr ago", titleVi: "Hợp đồng sắp hết hạn", titleEn: "Contracts Expiring Soon", bodyVi: "3 hợp đồng lao động sẽ hết hạn trong 30 ngày tới", bodyEn: "3 employment contracts expiring within 30 days" },
        { id: 3, type: "attendance", read: true, timeVi: "3 giờ trước", timeEn: "3 hrs ago", titleVi: "Cảnh báo chấm công", titleEn: "Attendance Alert", bodyVi: "5 nhân viên chưa check-in hôm nay", bodyEn: "5 employees have not checked in today" },
        SYSTEM,
      ],
      // Kế toán: lương, bảo hiểm, thuế
      Accountant: [
        { id: 1, type: "payroll", read: false, timeVi: "15 phút trước", timeEn: "15 min ago", titleVi: "Bảng lương đã tính xong", titleEn: "Payroll Completed", bodyVi: "Lương tháng 4/2026 đã tính xong — chờ phê duyệt", bodyEn: "April 2026 payroll calculated — awaiting approval" },
        { id: 2, type: "payroll", read: false, timeVi: "2 giờ trước", timeEn: "2 hrs ago", titleVi: "Nhắc nộp BHXH", titleEn: "Insurance Payment Reminder", bodyVi: "Hạn nộp BHXH tháng 4 là ngày 30/04/2026", bodyEn: "April insurance payment deadline: April 30, 2026" },
        { id: 3, type: "system", read: true, timeVi: "Hôm nay", timeEn: "Today", titleVi: "Thuế TNCN Q1 đã nộp", titleEn: "Q1 PIT Submitted", bodyVi: "Báo cáo thuế TNCN quý 1/2026 đã được gửi lên Cục Thuế", bodyEn: "Q1 2026 PIT report submitted to Tax Department" },
        SYSTEM,
      ],
      // HR Manager: nhân sự, nghỉ phép, hợp đồng
      HRManager: [
        { id: 1, type: "leave", read: false, timeVi: "5 phút trước", timeEn: "5 min ago", titleVi: "Đơn nghỉ phép mới", titleEn: "New Leave Request", bodyVi: "Nguyễn Văn A đã gửi đơn xin nghỉ 2 ngày", bodyEn: "Nguyen Van A submitted a 2-day leave request" },
        { id: 2, type: "leave", read: false, timeVi: "1 giờ trước", timeEn: "1 hr ago", titleVi: "3 đơn chờ duyệt", titleEn: "3 Pending Approvals", bodyVi: "Có 3 đơn nghỉ phép đang chờ bạn xem xét", bodyEn: "3 leave requests are awaiting your review" },
        { id: 3, type: "attendance", read: false, timeVi: "2 giờ trước", timeEn: "2 hrs ago", titleVi: "Cảnh báo chấm công", titleEn: "Attendance Alert", bodyVi: "4 nhân viên chưa check-in hôm nay", bodyEn: "4 employees have not checked in today" },
        { id: 4, type: "system", read: true, timeVi: "Hôm qua", timeEn: "Yesterday", titleVi: "Hợp đồng sắp hết hạn", titleEn: "Contract Expiring", bodyVi: "Hợp đồng của Trần Thị B hết hạn sau 15 ngày", bodyEn: "Tran Thi B's contract expires in 15 days" },
        SYSTEM,
      ],
      // Trưởng phòng: duyệt nghỉ phép phòng, chấm công phòng
      Manager: [
        { id: 1, type: "leave", read: false, timeVi: "20 phút trước", timeEn: "20 min ago", titleVi: "Đơn nghỉ phép cần duyệt", titleEn: "Leave Request Pending", bodyVi: "Lê Văn C gửi đơn xin nghỉ phép 1 ngày", bodyEn: "Le Van C submitted a 1-day leave request" },
        { id: 2, type: "attendance", read: false, timeVi: "1 giờ trước", timeEn: "1 hr ago", titleVi: "Chấm công phòng bạn", titleEn: "Your Team Attendance", bodyVi: "2 thành viên phòng chưa check-in hôm nay", bodyEn: "2 team members have not checked in today" },
        SYSTEM,
      ],
      // Nhân viên: chỉ nhìn thấy thông tin cá nhân
      Employee: [
        { id: 1, type: "payroll", read: false, timeVi: "Hôm nay", timeEn: "Today", titleVi: "Phiếu lương tháng 4 sẵn sàng", titleEn: "April Payslip Available", bodyVi: "Phiếu lương tháng 4/2026 của bạn đã được tạo", bodyEn: "Your April 2026 payslip is now available" },
        { id: 2, type: "leave", read: true, timeVi: "Hôm qua", timeEn: "Yesterday", titleVi: "Đơn nghỉ phép được duyệt", titleEn: "Leave Request Approved", bodyVi: "Đơn nghỉ ngày 28/04 của bạn đã được chấp thuận", bodyEn: "Your leave request for Apr 28 has been approved" },
        SYSTEM,
      ],
    }

    return byRole[role] ?? byRole["Employee"]
  })
  const th = getTheme(dark)

  // ── NextAuth session ─────────────────────────────────────
  const { data: session, status: sessionStatus } = useSession()

  const reloadUser = useCallback(() => {
    if (session?.user) {
      const su = session.user as any
      const empId: number | undefined = su.employeeId
      setUser({
        id: empId ? `NV${String(empId).padStart(3, "0")}` : "ADMIN",
        username: su.name ?? "user",
        password: "",
        name: su.name ?? "User",
        email: su.email ?? "",
        role: su.role ?? "Employee",
        roleLabel: su.role === "Admin" ? "Quản trị viên" : su.role === "HRManager" ? "Trưởng phòng Nhân sự" : su.role === "Accountant" ? "Kế toán" : su.role === "Director" ? "Giám đốc" : su.role === "Manager" ? "Trưởng phòng Công nghệ Thông tin" : "Nhân viên",
        roleLabelEn: su.role ?? "Employee",
        department: "AXIOM HRM",
        dashboardPath: su.dashboardPath ?? "/dashboard",
      })
      // Fetch avatar từ DB (async, không block render)
      if (empId) {
        getEmployeeAvatar(empId).then(res => {
          if (res.avatarPath) setAvatarUrl(res.avatarPath)
        })
      }
      return
    }
    // Fallback mock-auth (localStorage) — chỉ khi session = null
    if (sessionStatus !== "loading") {
      const u = getCurrentUser()
      if (u) {
        setUser(u)
        if ((u as any).avatarUrl) setAvatarUrl((u as any).avatarUrl)
      }
    }
  }, [session, sessionStatus])

  // Kết hợp với listen sự kiện axiom-user-updated (sau khi đổi avatar)
  const reloadAvatar = useCallback(() => {
    const su = session?.user as any
    const empId: number | undefined = su?.employeeId
    if (empId) {
      getEmployeeAvatar(empId).then(res => {
        if (res.avatarPath) setAvatarUrl(res.avatarPath)
      })
    }
  }, [session])

  useEffect(() => {
    reloadUser()
  }, [reloadUser])

  // ── Auto-sync fake data: cập nhật chấm công + lương ảo hàng ngày cho 57 NV (không block UI) ──
  // ── Auto-fix leave dates: nếu còn data nghỉ phép tháng 3 (cũ) → tự fix sang tháng 4-5 ──
  useEffect(() => {
    fetch("/api/sync-fake-data").catch(() => {})
    fetch("/api/fix-leave-dates").catch(() => {})
  }, [])

  // ── Sync chấm công hôm nay mỗi 1 tiếng → quản lý thấy ai vào/ra giờ nào ──
  useEffect(() => {
    fetch("/api/sync-today-attendance").catch(() => {})
    const interval = setInterval(() => {
      fetch("/api/sync-today-attendance").catch(() => {})
    }, 60 * 60 * 1000) // 60 phút
    return () => clearInterval(interval)
  }, [])

  // Cập nhật notifications theo role thực khi session load xong
  useEffect(() => {
    if (!user) return
    const role = String(user.role)
    const SYSTEM = { id: 99, type: "system", read: true, timeVi: "Hôm qua", timeEn: "Yesterday", titleVi: "Cập nhật hệ thống", titleEn: "System Update", bodyVi: "Phiên bản AXIOM HRM v2.1 đã ra mắt", bodyEn: "AXIOM HRM v2.1 has been released" }
    const map: Record<string, typeof SYSTEM[]> = {
      Director: [
        { id: 1, type: "payroll", read: false, timeVi: "30 phút trước", timeEn: "30 min ago", titleVi: "Báo cáo lương tháng 4", titleEn: "April Payroll Report", bodyVi: "Tổng quỹ lương tháng 4/2026 sẵn sàng để xem xét", bodyEn: "April 2026 total payroll fund is ready for review" },
        { id: 2, type: "leave", read: false, timeVi: "2 giờ trước", timeEn: "2 hrs ago", titleVi: "5 đơn nghỉ phép chờ duyệt", titleEn: "5 Pending Leave Requests", bodyVi: "Các trưởng phòng đã chuyển 5 đơn để lãnh đạo duyệt", bodyEn: "5 leave requests forwarded by department heads" },
        { id: 3, type: "attendance", read: true, timeVi: "Hôm nay", timeEn: "Today", titleVi: "Tỷ lệ chấm công tháng 4", titleEn: "April Attendance Rate", bodyVi: "Tỷ lệ đi làm đúng giờ đạt 94.2% trong tháng 4", bodyEn: "On-time attendance rate reached 94.2% in April" },
        SYSTEM,
      ],
      Admin: [
        { id: 1, type: "system", read: false, timeVi: "10 phút trước", timeEn: "10 min ago", titleVi: "Tài khoản mới cần kích hoạt", titleEn: "New Account Pending Activation", bodyVi: "2 tài khoản nhân viên mới đang chờ phê duyệt", bodyEn: "2 new employee accounts awaiting approval" },
        { id: 2, type: "leave", read: false, timeVi: "1 giờ trước", timeEn: "1 hr ago", titleVi: "Hợp đồng sắp hết hạn", titleEn: "Contracts Expiring Soon", bodyVi: "3 hợp đồng lao động sẽ hết hạn trong 30 ngày tới", bodyEn: "3 employment contracts expiring within 30 days" },
        { id: 3, type: "attendance", read: true, timeVi: "3 giờ trước", timeEn: "3 hrs ago", titleVi: "Cảnh báo chấm công", titleEn: "Attendance Alert", bodyVi: "5 nhân viên chưa check-in hôm nay", bodyEn: "5 employees have not checked in today" },
        SYSTEM,
      ],
      Accountant: [
        { id: 1, type: "payroll", read: false, timeVi: "15 phút trước", timeEn: "15 min ago", titleVi: "Bảng lương đã tính xong", titleEn: "Payroll Completed", bodyVi: "Lương tháng 4/2026 đã tính xong — chờ phê duyệt", bodyEn: "April 2026 payroll calculated — awaiting approval" },
        { id: 2, type: "payroll", read: false, timeVi: "2 giờ trước", timeEn: "2 hrs ago", titleVi: "Nhắc nộp BHXH", titleEn: "Insurance Payment Reminder", bodyVi: "Hạn nộp BHXH tháng 4 là ngày 30/04/2026", bodyEn: "April insurance payment deadline: April 30, 2026" },
        { id: 3, type: "system", read: true, timeVi: "Hôm nay", timeEn: "Today", titleVi: "Thuế TNCN Q1 đã nộp", titleEn: "Q1 PIT Submitted", bodyVi: "Báo cáo thuế TNCN quý 1/2026 đã được gửi lên Cục Thuế", bodyEn: "Q1 2026 PIT report submitted to Tax Department" },
        SYSTEM,
      ],
      HRManager: [
        { id: 1, type: "leave", read: false, timeVi: "5 phút trước", timeEn: "5 min ago", titleVi: "Đơn nghỉ phép mới", titleEn: "New Leave Request", bodyVi: "Nguyễn Văn A đã gửi đơn xin nghỉ 2 ngày", bodyEn: "Nguyen Van A submitted a 2-day leave request" },
        { id: 2, type: "leave", read: false, timeVi: "1 giờ trước", timeEn: "1 hr ago", titleVi: "3 đơn chờ duyệt", titleEn: "3 Pending Approvals", bodyVi: "Có 3 đơn nghỉ phép đang chờ bạn xem xét", bodyEn: "3 leave requests are awaiting your review" },
        { id: 3, type: "attendance", read: false, timeVi: "2 giờ trước", timeEn: "2 hrs ago", titleVi: "Cảnh báo chấm công", titleEn: "Attendance Alert", bodyVi: "4 nhân viên chưa check-in hôm nay", bodyEn: "4 employees have not checked in today" },
        { id: 4, type: "system", read: true, timeVi: "Hôm qua", timeEn: "Yesterday", titleVi: "Hợp đồng sắp hết hạn", titleEn: "Contract Expiring", bodyVi: "Hợp đồng của Trần Thị B hết hạn sau 15 ngày", bodyEn: "Tran Thi B's contract expires in 15 days" },
        SYSTEM,
      ],
      Manager: [
        { id: 1, type: "leave", read: false, timeVi: "20 phút trước", timeEn: "20 min ago", titleVi: "Đơn nghỉ phép cần duyệt", titleEn: "Leave Request Pending", bodyVi: "Lê Văn C gửi đơn xin nghỉ phép 1 ngày", bodyEn: "Le Van C submitted a 1-day leave request" },
        { id: 2, type: "attendance", read: false, timeVi: "1 giờ trước", timeEn: "1 hr ago", titleVi: "Chấm công phòng bạn", titleEn: "Your Team Attendance", bodyVi: "2 thành viên phòng chưa check-in hôm nay", bodyEn: "2 team members have not checked in today" },
        SYSTEM,
      ],
      Employee: [
        { id: 1, type: "payroll", read: false, timeVi: "Hôm nay", timeEn: "Today", titleVi: "Phiếu lương tháng 4 sẵn sàng", titleEn: "April Payslip Available", bodyVi: "Phiếu lương tháng 4/2026 của bạn đã được tạo", bodyEn: "Your April 2026 payslip is now available" },
        { id: 2, type: "leave", read: true, timeVi: "Hôm qua", timeEn: "Yesterday", titleVi: "Đơn nghỉ phép được duyệt", titleEn: "Leave Request Approved", bodyVi: "Đơn nghỉ ngày 28/04 của bạn đã được chấp thuận", bodyEn: "Your leave request for Apr 28 has been approved" },
        SYSTEM,
      ],
    }
    setNotifications(map[role] ?? map["Employee"])
  }, [user?.role]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener("axiom-user-updated", reloadAvatar)
    return () => window.removeEventListener("axiom-user-updated", reloadAvatar)
  }, [reloadAvatar])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  // ── Session loading: hiển thị spinner thay vì return null ──
  // return null gây infinite re-render loop khi NextAuth đang khởi tạo
  if (sessionStatus === "loading" || !user) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: dark ? "#1a0a0a" : "#fce9e9",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: "3px solid rgba(208,33,28,0.2)",
            borderTopColor: "#D0211C", borderRadius: "50%",
            animation: "spin .7s linear infinite", margin: "0 auto 12px",
          }} />
          <div style={{ color: "#D0211C", fontSize: 13, fontWeight: 600, fontFamily: "Inter, sans-serif" }}>AXIOM HRM</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const headerIconBtn: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "none", border: "none", cursor: "pointer",
    padding: 6, borderRadius: 8, transition: "background .15s",
  }

  const roleStr = String(user.role)
  const isAdmin = roleStr === "admin" || roleStr === "Admin"
  const navItems = getNav(roleStr)

  // ── Logout helper ──────────────────────────────────────────
  const doLogout = () => { mockLogout(); nextAuthSignOut({ callbackUrl: "/login" }) }
  const askLogout = () => { setShowProfile(false); setShowLogoutConfirm(true) }

  // ── Sidebar width based on breakpoint ──────────────────────────
  // Mobile: sidebar hidden, shown as overlay when mobileSidebarOpen
  // Tablet: collapsed (icon only, 64px)
  // Desktop: collapsed (64px) by default, expand on hover (220px)
  const isCollapsed = isMobile ? false : isTablet ? true : !sidebarHover
  const sidebarW = isMobile ? W : isTablet ? W_TABLET : (sidebarHover ? W : W_COLLAPSED)
  // Sidebar has 10px left offset when floating, so main content needs extra margin
  const mainMargin = isMobile ? 0 : isTablet ? (W_TABLET + 20) : (W_COLLAPSED + 20)

  // ── Bottom nav items (mobile only) ─ hiển thị TẤT CẢ chức năng ─────────
  const bottomNavItems = navItems

  return (
    <div className={dark ? "dark" : undefined} style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif", background: th.pageBg }}>

      {/* ── MOBILE SIDEBAR BACKDROP ── */}
      {isMobile && mobileSidebarOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 150, backdropFilter: "blur(2px)",
          }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        onMouseEnter={() => { if (!isMobile && !isTablet) setSidebarHover(true) }}
        onMouseLeave={() => { if (!isMobile && !isTablet) setSidebarHover(false) }}
        style={{
          width: sidebarW,
          flexShrink: 0,
          background: dark
            ? "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
          display: "flex", flexDirection: "column",
          position: "fixed",
          top: isMobile ? 0 : (HEADER_H + 10),
          left: isMobile ? 0 : 10,
          bottom: isMobile ? 0 : 10,
          zIndex: isMobile ? 160 : 100,
          borderRadius: isMobile ? 0 : 20,
          border: isMobile ? "none" : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          boxShadow: sidebarHover
            ? dark
              ? "6px 0 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05)"
              : "6px 0 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)"
            : dark
              ? "2px 0 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.03)"
              : "2px 0 10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
          transform: isMobile
            ? (mobileSidebarOpen ? "translateX(0)" : "translateX(-100%)")
            : "translateX(0)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s",
          overflow: "hidden",
        }}
      >

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: "absolute", top: 14, right: 14,
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: 8, width: 32, height: 32, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}
          >
            <XIcon size={18} />
          </button>
        )}

        {/* ── Cụm chức năng (Top) ── */}
        <nav style={{ padding: isCollapsed ? "12px 8px" : "12px 10px", display: "flex", flexDirection: "column", gap: 8, transition: "padding .28s" }}>
          {navItems.map(({ href, icon: Icon, vi, en }) => {
            const active = pathname === href || (pathname.startsWith(href + "/") && !navItems.some(n => n.href !== href && pathname.startsWith(n.href)))
            const label = lang === "vi" ? vi : en
            return (
              <Link key={href} href={href}
                onMouseEnter={() => setHov(href)} onMouseLeave={() => setHov(null)}
                title={isCollapsed ? label : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: isCollapsed ? 0 : 10,
                  padding: isCollapsed ? "8px" : "7px 12px",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  borderRadius: 10, textDecoration: "none",
                  position: "relative",
                  background: active
                    ? "rgba(208,33,28,0.12)"
                    : hov === href
                      ? (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)")
                      : "transparent",
                  color: active
                    ? "#D0211C"
                    : dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
                  fontSize: 13.5, fontWeight: active ? 600 : 400,
                  transition: "all .15s",
                  borderLeft: isCollapsed
                    ? "none"
                    : active
                      ? "3px solid #D0211C"
                      : "3px solid transparent",
                }}
              >
                <Icon size={isCollapsed ? 20 : 17} color={active ? "#D0211C" : (dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)")} style={{ flexShrink: 0 }} />
                {!isCollapsed && (
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* ── Spacer đẩy cụm cá nhân xuống đáy ── */}
        <div style={{ flex: 1 }} />

        {/* ── Divider ── */}
        <div style={{ height: 1, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", margin: "0 12px" }} />

        {/* ── Cụm cá nhân (Bottom) ── */}
        <div style={{ padding: isCollapsed ? "8px" : "8px 10px", transition: "padding .28s" }}>
          <Link href="/profile"
            onMouseEnter={() => setHov("profile")} onMouseLeave={() => setHov(null)}
            title={isCollapsed ? (lang === "vi" ? "Hồ sơ cá nhân" : "Profile") : undefined}
            style={{
              display: "flex", alignItems: "center",
              gap: isCollapsed ? 0 : 10,
              padding: isCollapsed ? "10px" : "9px 12px",
              justifyContent: isCollapsed ? "center" : "flex-start",
              borderRadius: 10, textDecoration: "none",
              background: hov === "profile" ? (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)") : "transparent",
              color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)",
              fontSize: 13.5,
              transition: "all .15s",
            }}
          >
            <AvatarImg
              src={avatarUrl}
              alt={user.name}
              size={isCollapsed ? 28 : 24}
              style={{ border: "2px solid rgba(255,200,200,0.3)", flexShrink: 0 }}
            />
            {!isCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: dark ? "rgba(255,255,255,0.88)" : "#1e293b", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              </div>
            )}
          </Link>
        </div>

        <div style={{ padding: isCollapsed ? "4px 8px 14px" : "4px 10px 14px", transition: "padding .28s" }}>
          <button onClick={askLogout}
            onMouseEnter={() => setHov("logout")} onMouseLeave={() => setHov(null)}
            title={isCollapsed ? (lang === "vi" ? "Đăng xuất" : "Logout") : undefined}
            style={{
              width: "100%",
              display: "flex", alignItems: "center",
              gap: isCollapsed ? 0 : 10,
              padding: isCollapsed ? "10px" : "9px 12px",
              justifyContent: isCollapsed ? "center" : "flex-start",
              borderRadius: 10, border: "none", cursor: "pointer",
              background: hov === "logout" ? "rgba(239,68,68,0.12)" : "transparent",
              color: dark ? "rgba(255,150,150,0.75)" : "rgba(220,38,38,0.8)",
              fontSize: 13.5, fontFamily: "inherit",
              transition: "all .15s",
            }}
          >
            <LogOut size={isCollapsed ? 20 : 17} style={{ flexShrink: 0 }} />
            {!isCollapsed && (
              <span style={{ whiteSpace: "nowrap" }}>{lang === "vi" ? "Đăng xuất" : "Logout"}</span>
            )}
          </button>
        </div>
      </aside>

      {/* ── TOP HEADER BAR ── */}
      <header style={{
        position: "fixed", top: 0,
        left: 0,
        right: 0,
        height: HEADER_H,
        background: th.cardBg, borderBottom: `1px solid ${th.cardBorder}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "0 12px" : "0 24px",
        zIndex: 90,
        transition: "background .3s, border-color .3s, left .28s",
      }}>
        {/* Left: Logo brand area — red circle + AXIOM (giống trang login) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <Link href={user?.dashboardPath ?? "/dashboard"}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            {/* Red gradient circle — giống login page */}
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(140deg, #FF6659, #D0211C, #9A0007)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(154,0,7,0.35)", flexShrink: 0,
              transition: "box-shadow .2s, transform .2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(154,0,7,0.5)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(154,0,7,0.35)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)"
              }}
            >
              <Image src="/images/LogoAXIOM.png" alt="AXIOM" width={28} height={28}
                style={{ objectFit: "contain", filter: "brightness(0) invert(1)", flexShrink: 0 }} />
            </div>
            {!isMobile && (
              <span style={{
                fontWeight: 800, fontSize: 18, letterSpacing: 4,
                background: "linear-gradient(135deg, #FF6659 0%, #D0211C 45%, #9A0007 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", fontStyle: "italic",
              }}>AXIOM</span>
            )}
          </Link>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 16, flexShrink: 0 }}>
          {/* Language toggle */}
          <button onClick={toggleLang} style={{ ...headerIconBtn, gap: 6, display: "flex", alignItems: "center" }}>
            <Image
              src={lang === "vi" ? "/images/CoVietNam.png" : "/images/coanh.png"}
              alt={lang} width={22} height={15}
              style={{ borderRadius: 2, objectFit: "cover" }}
            />
          </button>

          {/* Dark mode toggle */}
          <button onClick={toggleDark} style={headerIconBtn}>
            {dark
              ? <Sun size={18} color="#F59E0B" />
              : <Moon size={18} color={th.text2} />
            }
          </button>

          {/* Notification bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setShowNotif(p => !p); setShowProfile(false) }}
              style={{ ...headerIconBtn, position: "relative" }}
            >
              <Bell size={18} color={showNotif ? "#D0211C" : th.text2} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#EF4444", color: "#fff",
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${th.cardBg}`,
                }}>{notifications.filter(n => !n.read).length}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotif && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setShowNotif(false)} />
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)",
                  right: isMobile ? -60 : -60,
                  background: th.cardBg,
                  border: `1px solid ${th.cardBorder}`,
                  borderRadius: 14,
                  boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.12)",
                  width: isMobile ? "calc(100vw - 24px)" : 340,
                  maxWidth: "calc(100vw - 24px)",
                  zIndex: 999,
                  animation: "fadeDown .15s ease",
                  overflow: "hidden",
                }}>
                  {/* Header */}
                  <div style={{
                    padding: "14px 16px",
                    borderBottom: `1px solid ${th.tableBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: th.text1 }}>
                      {lang === "vi" ? "🔔 Thông báo" : "🔔 Notifications"}
                      {notifications.filter(n => !n.read).length > 0 && (
                        <span style={{
                          marginLeft: 8, background: "#EF4444", color: "#fff",
                          borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700,
                        }}>{notifications.filter(n => !n.read).length}</span>
                      )}
                    </div>
                    <button
                      onClick={() => setNotifications(ns => ns.map(n => ({ ...n, read: true })))}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#D0211C", fontWeight: 600, padding: 0 }}
                    >
                      {lang === "vi" ? "Đánh dấu tất cả đã đọc" : "Mark all read"}
                    </button>
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: 360, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "32px 16px", textAlign: "center", color: th.text2, fontSize: 13 }}>
                        {lang === "vi" ? "Không có thông báo nào" : "No notifications"}
                      </div>
                    ) : notifications.map(n => {
                      const icons: Record<string, string> = {
                        leave: "🗓️", payroll: "💰", attendance: "⏰", system: "⚙️",
                      }
                      const accents: Record<string, string> = {
                        leave: "#3B82F6", payroll: "#10B981", attendance: "#F59E0B", system: "#8B5CF6",
                      }
                      return (
                        <div
                          key={n.id}
                          onClick={() => setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 12,
                            padding: "12px 16px",
                            background: n.read ? "transparent" : (dark ? "rgba(208,33,28,0.08)" : "rgba(208,33,28,0.04)"),
                            borderBottom: `1px solid ${th.tableBorder}`,
                            cursor: "pointer", transition: "background .15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "#F9FAFB")}
                          onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : (dark ? "rgba(208,33,28,0.08)" : "rgba(208,33,28,0.04)"))}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: `${accents[n.type]}18`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16,
                          }}>{icons[n.type]}</div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: th.text1 }}>{lang === "vi" ? n.titleVi : n.titleEn}</span>
                              {!n.read && (
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: th.text2, marginTop: 2, lineHeight: 1.4 }}>{lang === "vi" ? n.bodyVi : n.bodyEn}</div>
                            <div style={{ fontSize: 11, color: th.text2, marginTop: 4, opacity: 0.6 }}>{lang === "vi" ? n.timeVi : n.timeEn}</div>
                          </div>

                          <button
                            onClick={e => { e.stopPropagation(); setNotifications(ns => ns.filter(x => x.id !== n.id)) }}
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              color: th.text2, fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0,
                              opacity: 0.5,
                            }}
                          >×</button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: "10px 16px", borderTop: `1px solid ${th.tableBorder}`, textAlign: "center" }}>
                    <button
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#D0211C", fontWeight: 600 }}
                      onClick={() => setShowNotif(false)}
                    >
                      {lang === "vi" ? "Xem tất cả thông báo" : "View all notifications"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Divider — hidden on mobile */}
          {!isMobile && <div style={{ width: 1, height: 28, background: th.cardBorder }} />}

          {/* User info + dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowProfile(p => !p)}
              style={{
                display: "flex", alignItems: "center", gap: isMobile ? 0 : 10,
                background: "none", border: "none", cursor: "pointer",
                padding: "4px 8px", borderRadius: 10,
                transition: "background .15s",
              }}
            >
              {/* Avatar */}
              <AvatarImg
                src={avatarUrl}
                alt={user.name}
                size={36}
                style={{
                  border: `2px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
                }}
              />
              {/* Name — hidden on mobile */}
              {!isMobile && (
                <div style={{ textAlign: "left", minWidth: 70 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: th.text1, whiteSpace: "nowrap" }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: th.text2, whiteSpace: "nowrap" }}>{lang === "vi" ? user.roleLabel : user.roleLabelEn}</div>
                </div>
              )}
              {/* Chevron — hidden on mobile */}
              {!isMobile && (
                <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0, transition: "transform .2s", transform: showProfile ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <path d="M2 4l4 4 4-4" stroke={th.text2} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Dropdown */}
            {showProfile && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setShowProfile(false)} />
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: th.cardBg,
                  border: `1px solid ${th.cardBorder}`,
                  borderRadius: 12,
                  boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.12)",
                  minWidth: 210, zIndex: 999,
                  overflow: "hidden",
                  animation: "fadeDown .15s ease",
                }}>
                  {/* Profile info header */}
                  <div style={{
                    padding: "14px 16px",
                    borderBottom: `1px solid ${th.tableBorder}`,
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <AvatarImg src={avatarUrl} alt={user.name} size={40} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: th.text1 }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: th.text2 }}>{lang === "vi" ? user.roleLabel : user.roleLabelEn}</div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: "6px" }}>
                    <button
                      onClick={() => { setShowProfile(false); router.push("/profile") }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 8, border: "none",
                        background: "none", cursor: "pointer", textAlign: "left",
                        color: th.text1, fontSize: 13, fontFamily: "inherit",
                        transition: "background .12s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "#F3F4F6")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      <span style={{ fontSize: 16 }}>👤</span>
                      {lang === "vi" ? "Hồ sơ cá nhân" : "My Profile"}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => { setShowProfile(false); router.push("/settings/users") }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 12px", borderRadius: 8, border: "none",
                          background: "none", cursor: "pointer", textAlign: "left",
                          color: th.text1, fontSize: 13, fontFamily: "inherit",
                          transition: "background .12s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "#F3F4F6")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        <UserCog size={15} style={{ flexShrink: 0 }} />
                        {lang === "vi" ? "Quản trị tài khoản" : "Account Admin"}
                      </button>
                    )}

                    <div style={{ height: 1, background: th.tableBorder, margin: "6px 0" }} />

                    <button
                      onClick={askLogout}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 8, border: "none",
                        background: "none", cursor: "pointer", textAlign: "left",
                        color: "#EF4444", fontSize: 13, fontFamily: "inherit",
                        transition: "background .12s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(239,68,68,0.1)" : "#FEF2F2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      <span style={{ fontSize: 16 }}>🚪</span>
                      {lang === "vi" ? "Đăng xuất" : "Sign Out"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── MAIN ── */}
      <main style={{
        marginLeft: isMobile ? 0 : mainMargin,
        flex: 1,
        paddingTop: HEADER_H,
        // On mobile, add bottom padding for bottom nav
        paddingBottom: isMobile ? 60 : 0,
        background: th.pageBg, minHeight: "100vh",
        transition: "background .3s, margin-left .28s",
        overflowX: "hidden",
        maxWidth: "100vw",
      }}>
        {children}
      </main>

      {/* ── BOTTOM NAVIGATION (Mobile only) ── */}
      {isMobile && (
        <nav className="bottom-nav" style={{
          background: th.cardBg,
          borderTop: `1px solid ${th.cardBorder}`,
        }}>
          {bottomNavItems.map(({ href, icon: Icon, vi, en }) => {
            const active = pathname === href || (pathname.startsWith(href + "/") && !bottomNavItems.some(n => n.href !== href && pathname.startsWith(n.href)))
            return (
              <Link key={href} href={href} style={{
                flex: "1 1 0",
                minWidth: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 2, textDecoration: "none",
                color: active ? "#D0211C" : th.text2,
                padding: "6px 1px",
                transition: "color .15s",
                fontSize: 10, fontWeight: active ? 700 : 400,
                position: "relative",
              }}>
                {active && (
                  <span style={{
                    position: "absolute", top: 0, left: "20%", right: "20%",
                    height: 2, background: "#D0211C", borderRadius: "0 0 2px 2px",
                  }} />
                )}
                <Icon size={18} />
                <span style={{ fontSize: bottomNavItems.length > 5 ? 8 : 9.5, lineHeight: 1, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", textAlign: "center", padding: "0 1px" }}>
                  {lang === "vi" ? vi : en}
                </span>
              </Link>
            )
          })}
          {/* Logout button at end if < 5 nav items, otherwise show profile */}
          {bottomNavItems.length < 5 && (
            <button
              onClick={askLogout}
              style={{
                flex: 1,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 3,
                background: "none", border: "none", cursor: "pointer",
                color: th.text2, fontSize: 9.5, padding: "6px 2px",
              }}
            >
              <LogOut size={20} />
              {lang === "vi" ? "Thoát" : "Logout"}
            </button>
          )}
        </nav>
      )}

      {/* ══════════ MODAL: Xác nhận đăng xuất ══════════ */}
      {showLogoutConfirm && (
        <>
          <div
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)", zIndex: 9999
            }}
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div style={{
            position: "fixed", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            padding: 16, zIndex: 10000,
          }}>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: th.cardBg,
                borderRadius: 20,
                width: "min(400px, 92vw)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                animation: "fadeDown .2s ease",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div style={{
                background: "linear-gradient(135deg,#D0211C,#991414)",
                padding: "22px 24px 18px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 40, marginBottom: 6 }}>🚪</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>
                  {lang === "vi" ? "Xác nhận đăng xuất" : "Confirm Sign Out"}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "22px 24px" }}>
                {/* User info */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12,
                  background: dark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
                  border: `1px solid ${th.cardBorder}`,
                  marginBottom: 18,
                }}>
                  <AvatarImg src={avatarUrl} alt={user.name} size={44} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: th.text1 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: th.text2 }}>{lang === "vi" ? user.roleLabel : user.roleLabelEn}</div>
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: th.text2, textAlign: "center", margin: "0 0 20px", lineHeight: 1.6 }}>
                  {lang === "vi"
                    ? "Bạn có chắc chắn muốn đăng xuất khỏi AXIOM HRM không?"
                    : "Are you sure you want to sign out of AXIOM HRM?"}
                </p>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    style={{
                      flex: 1, padding: "11px 0", borderRadius: 11,
                      border: `1.5px solid ${th.cardBorder}`,
                      background: "none", cursor: "pointer",
                      fontSize: 14, fontWeight: 600, color: th.text1,
                      fontFamily: "inherit", transition: "background .15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "#F3F4F6")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    {lang === "vi" ? "❌ Hủy" : "❌ Cancel"}
                  </button>
                  <button
                    onClick={doLogout}
                    style={{
                      flex: 1, padding: "11px 0", borderRadius: 11,
                      background: "linear-gradient(135deg,#D0211C,#991414)",
                      border: "none", cursor: "pointer",
                      fontSize: 14, fontWeight: 700, color: "#fff",
                      fontFamily: "inherit",
                      boxShadow: "0 4px 14px rgba(208,33,28,0.35)",
                      transition: "transform .15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "none")}
                  >
                    ✓ {lang === "vi" ? "Đăng xuất" : "Sign Out"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
