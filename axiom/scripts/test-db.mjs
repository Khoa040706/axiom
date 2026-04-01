import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://axiom:axiom_password@127.0.0.1:5432/axiom_hrm"
})

try {
  const count = await prisma.department.count()
  console.log("✅ Kết nối thành công! Số phòng ban:", count)
} catch (e) {
  console.error("❌ Lỗi:", e.message)
} finally {
  await prisma.$disconnect()
}
