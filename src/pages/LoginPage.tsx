import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock login - simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("로그인 성공!");
      navigate("/");
    }, 1000);
  };

  const handleSSOLogin = () => {
    toast.info("SSO 로그인으로 이동합니다.");
    // Mock SSO redirect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground italic">
            Sign in to AI Worker Platform
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose your authentication method or proceed directly.
          </p>
        </div>

        {/* Login Container */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Email/Password Form */}
          <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  ID
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-background border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-background border-border pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => toast.info("비밀번호 재설정 페이지로 이동합니다.")}
                >
                  Reset Password
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>

          {/* Right: SSO Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground text-center">
              Use SAML SSO
            </h2>
            
            <Button
              onClick={handleSSOLogin}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              Single Sign-On
            </Button>

            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>You will be redirected to your organization's</p>
              <p>sign-in page.</p>
              <p className="mt-2">If your org enforces SSO, manage password</p>
              <p>via your identity provider.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
