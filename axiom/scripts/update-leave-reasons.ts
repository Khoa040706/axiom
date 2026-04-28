import * as dotenv from "dotenv"
import path from "path"
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://axiom:axiom_password@localhost:5432/axiom_hrm"

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const REASONS = [
  "Đi du lịch cùng gia đình dịp cuối năm",
  "Bị cúm, cần nghỉ ngơi theo chỉ định bác sĩ",
  "Có việc cá nhân cần giải quyết gấp",
  "Nghỉ phép năm theo kế hoạch đã đăng ký",
  "Khám sức khỏe định kỳ theo lịch bệnh viện",
  "Tham dự đám cưới người thân trong gia đình",
  "Dưỡng bệnh sau điều trị, cần nghỉ hồi phục",
  "Đưa con nhỏ đi khám và theo dõi sức khỏe",
]

async function main() {
  const leaves = await prisma.leaveRequest.findMany({
    orderBy: { id: "asc" },
    select: { id: true, reason: true },
  })

  console.log(`Found ${leaves.length} leave requests`)

  for (let i = 0; i < leaves.length; i++) {
    const reason = REASONS[i % REASONS.length]
    await prisma.leaveRequest.update({
      where: { id: leaves[i].id },
      data: { reason },
    })
    console.log(`  #${leaves[i].id} → ${reason}`)
  }

  console.log("\n✅ Done!")
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => { prisma.$disconnect(); pool.end() })
