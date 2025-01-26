import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Logo className="w-40 h-40" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Bienvenido de nuevo
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
