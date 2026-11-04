import { LogoutButton, PasswordForm } from "@/components/ui/Account";

export default function TeacherProfile() {
  return (
    <div className="grid max-w-4xl gap-5 lg:grid-cols-2">
      <section className="flex flex-col gap-3 rounded-[26px] border border-line bg-surface p-5 shadow-card">
        <h3 className="text-lg font-extrabold">Hesap</h3>
        <p className="text-sm font-semibold text-slate">
          Öğrenci hesaplarını “Öğrencilerim” sayfasından oluşturabilirsiniz; oluşturulan her öğrenci otomatik olarak size bağlanır ve yalnızca siz görebilirsiniz.
        </p>
        <LogoutButton />
      </section>
      <PasswordForm />
    </div>
  );
}
