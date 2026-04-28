import { prisma } from "@/lib/prisma"

async function main() {
  const sample = await prisma.employee.findMany({ take: 3, select: { id: true, fullName: true, status: true } })
  console.log("Sample employees:", JSON.stringify(sample, null, 2))
  await prisma.$disconnect()
}
main()
