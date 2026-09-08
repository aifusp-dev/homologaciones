import { AppHeader } from "@/components/app-header";

export default function AppSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 lg:px-10 py-6">{children}</main>
    </div>
  );
}
