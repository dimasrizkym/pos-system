// "use client";

// import type React from "react";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useAuth } from "@/app/context/auth-context";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useRouter } from "next/navigation";

// export default function RegisterPage() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("kasir");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const { register } = useAuth();
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setIsLoading(true);

//     try {
//       const isRegistered = await register(
//         username,
//         password,
//         role as "owner" | "kasir"
//       );
//       if (isRegistered) {
//         setSuccess("Akun berhasil dibuat! Silakan login.");
//         setTimeout(() => router.push("/auth/login"), 2000);
//       } else {
//         setError("Gagal membuat akun. Username mungkin sudah digunakan.");
//       }
//     } catch (err) {
//       setError("Terjadi kesalahan saat pendaftaran.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <CardTitle className="text-2xl font-bold">Daftar Akun Baru</CardTitle>
//           <CardDescription>Buat akun owner atau kasir</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="username">Username</Label>
//               <Input
//                 id="username"
//                 type="text"
//                 placeholder="Buat username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Buat password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="role">Role</Label>
//               <Select value={role} onValueChange={setRole}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="kasir">Kasir</SelectItem>
//                   <SelectItem value="owner">Owner</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}
//             {success && (
//               <Alert>
//                 <AlertDescription>{success}</AlertDescription>
//               </Alert>
//             )}
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? "Mendaftar..." : "Daftar"}
//             </Button>
//           </form>
//           <div className="mt-4 text-center text-sm">
//             Sudah punya akun?{" "}
//             <Button variant="link" onClick={() => router.push("/auth/login")}>
//               Login
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
