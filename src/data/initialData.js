// src/data/initialData.js — Abdominal Gym Kudus

export const initialMembers = [
  { id: 1, name: "Ahmad Ridwan", email: "ahmad@email.com", phone: "0812-1111-2222", package: "Monthly", joinDate: "2025-01-05", expiry: "2025-02-05", status: "active" },
  { id: 2, name: "Siti Rahayu", email: "siti@email.com", phone: "0821-3333-4444", package: "Gold", joinDate: "2024-12-01", expiry: "2025-06-01", status: "active" },
  { id: 3, name: "Budi Santoso", email: "budi@email.com", phone: "0856-5555-6666", package: "Silver", joinDate: "2024-10-15", expiry: "2025-01-15", status: "inactive" },
  { id: 4, name: "Dewi Lestari", email: "dewi@email.com", phone: "0878-7777-8888", package: "Platinum", joinDate: "2024-09-01", expiry: "2025-09-01", status: "active" },
  { id: 5, name: "Rudi Hartono", email: "rudi@email.com", phone: "0819-9999-0000", package: "Monthly", joinDate: "2025-01-10", expiry: "2025-02-10", status: "active" },
];

export const initialTrainers = [
  { id: 1, name: "Tyo", specialization: "Strength & Conditioning", phone: "0823-2472-0045", email: "tyo@abdominalgym.id", experience: "3 tahun", certifications: "Certified Personal Trainer", status: "active", schedule: "Setiap Hari (Shift 1 & 2)", gender: "Pria" },
  { id: 2, name: "Elia", specialization: "Fat Loss & Body Toning", phone: "0812-xxxx-xxxx", email: "elia@abdominalgym.id", experience: "2 tahun", certifications: "Certified Personal Trainer", status: "active", schedule: "Senin–Sabtu", gender: "Wanita" },
  { id: 3, name: "Indah", specialization: "Cardio & Flexibility", phone: "0821-xxxx-xxxx", email: "indah@abdominalgym.id", experience: "2 tahun", certifications: "Certified Personal Trainer", status: "active", schedule: "Selasa–Minggu", gender: "Wanita" },
];

export const initialSchedules = [
  { id: 1, className: "Morning Workout", trainer: "Tyo", day: "Senin", time: "07:00 - 09:00", capacity: 20, enrolled: 10, room: "Area Utama", level: "All Level" },
  { id: 2, className: "Fat Loss Program", trainer: "Elia", day: "Senin", time: "17:00 - 19:00", capacity: 15, enrolled: 8, room: "Area Cardio", level: "All Level" },
  { id: 3, className: "Cardio & Endurance", trainer: "Indah", day: "Selasa", time: "15:00 - 17:00", capacity: 15, enrolled: 7, room: "Area Cardio", level: "Beginner" },
  { id: 4, className: "Strength Training", trainer: "Tyo", day: "Rabu", time: "15:00 - 17:00", capacity: 12, enrolled: 6, room: "Area Beban", level: "Intermediate" },
  { id: 5, className: "Body Toning", trainer: "Elia", day: "Kamis", time: "17:00 - 19:00", capacity: 15, enrolled: 9, room: "Area Utama", level: "All Level" },
  { id: 6, className: "Weekend Warrior", trainer: "Tyo", day: "Sabtu", time: "07:00 - 10:00", capacity: 25, enrolled: 18, room: "Area Utama", level: "All Level" },
];

export const initialAttendances = [
  { id: 1, employeeId: "EMP001", name: "Tyo", role: "Trainer / Karyawan", date: "2025-01-20", checkIn: "07:00", checkOut: "15:00", status: "hadir", notes: "Shift 1", shift: "Shift 1" },
  { id: 2, employeeId: "EMP002", name: "Galang", role: "Karyawan", date: "2025-01-20", checkIn: "07:00", checkOut: "15:00", status: "hadir", notes: "Shift 1", shift: "Shift 1" },
  { id: 3, employeeId: "EMP003", name: "Wisnu", role: "Karyawan", date: "2025-01-20", checkIn: "15:00", checkOut: "22:00", status: "hadir", notes: "Shift 2", shift: "Shift 2" },
  { id: 4, employeeId: "EMP004", name: "Osa", role: "Karyawan", date: "2025-01-20", checkIn: "15:00", checkOut: "22:00", status: "hadir", notes: "Shift 2", shift: "Shift 2" },
  { id: 5, employeeId: "EMP005", name: "Lutfi", role: "Karyawan", date: "2025-01-20", checkIn: "-", checkOut: "-", status: "izin", notes: "Izin sakit", shift: "Shift 1" },
  { id: 6, employeeId: "EMP006", name: "Elia", role: "Trainer", date: "2025-01-20", checkIn: "07:00", checkOut: "15:00", status: "hadir", notes: "Shift 1", shift: "Shift 1" },
  { id: 7, employeeId: "EMP007", name: "Indah", role: "Trainer", date: "2025-01-20", checkIn: "15:00", checkOut: "22:00", status: "hadir", notes: "Shift 2", shift: "Shift 2" },
];

export const initialFinances = [
  { id: 1, date: "2025-01-20", type: "pemasukan", category: "Iuran Member", description: "Membership Monthly - Ahmad Ridwan", amount: 160000, method: "Cash" },
  { id: 2, date: "2025-01-20", type: "pemasukan", category: "Personal Training", description: "PT 8× Sesi - Siti Rahayu (Pelatih: Elia)", amount: 600000, method: "Transfer" },
  { id: 3, date: "2025-01-19", type: "pengeluaran", category: "Utilitas", description: "Tagihan listrik bulan Januari", amount: 800000, method: "Transfer" },
  { id: 4, date: "2025-01-19", type: "pemasukan", category: "Iuran Member", description: "Membership Insidentil - Walk-in member", amount: 30000, method: "Cash" },
  { id: 5, date: "2025-01-18", type: "pengeluaran", category: "Perawatan", description: "Servis treadmill unit 2", amount: 350000, method: "Cash" },
  { id: 6, date: "2025-01-18", type: "pemasukan", category: "Iuran Member", description: "Membership Gold 6bln - Dewi Lestari", amount: 730000, method: "Transfer" },
  { id: 7, date: "2025-01-17", type: "pengeluaran", category: "Gaji", description: "Gaji karyawan bulan Januari", amount: 3000000, method: "Transfer" },
  { id: 8, date: "2025-01-17", type: "pemasukan", category: "Iuran Member", description: "Membership Platinum - Member baru", amount: 1240000, method: "QRIS" },
  { id: 9, date: "2025-01-16", type: "pemasukan", category: "Personal Training", description: "PT Trial - 1 Day (Pelatih: Indah)", amount: 150000, method: "Cash" },
  { id: 10, date: "2025-01-15", type: "pengeluaran", category: "Operasional", description: "Pembelian perlengkapan kebersihan", amount: 120000, method: "Cash" },
];
