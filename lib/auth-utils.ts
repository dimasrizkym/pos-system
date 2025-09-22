import bcrypt from "bcryptjs"

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    console.log("[v0] Verifying password...")
    console.log("[v0] Plain password length:", plainPassword.length)
    console.log("[v0] Hash length:", hashedPassword.length)
    console.log("[v0] Hash format valid:", hashedPassword.startsWith("$2a$") || hashedPassword.startsWith("$2b$"))

    const result = await bcrypt.compare(plainPassword, hashedPassword)
    console.log("[v0] bcrypt.compare result:", result)

    return result
  } catch (error) {
    console.error("[v0] Password verification error:", error)
    return false
  }
}

export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    const saltRounds = 10
    return await bcrypt.hash(plainPassword, saltRounds)
  } catch (error) {
    console.error("Password hashing error:", error)
    throw new Error("Failed to hash password")
  }
}
