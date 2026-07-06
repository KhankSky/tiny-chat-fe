import type { Dictionary, Locale } from "./types";

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    appName: "Tiny Chat",
    appTagline: "Talk, learn, connect",
    header: {
      nav: [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Contact", href: "#contact" },
      ],
      login: "Login",
      register: "Register",
      switchLabel: "VI",
    },
    landing: {
      badge: "Build meaningful conversations faster",
      title: "A clean chat experience for language practice, communities, and support.",
      description:
        "Tiny Chat is set up as a simple, scalable front-end foundation. We keep marketing pages separate from auth and product flows so every feature stays easy to grow.",
      primaryCta: "Get started",
      secondaryCta: "See how it works",
      previewTitle: "Preview",
      bubbles: [
        { label: "Teacher", text: "Welcome back. What topic do you want to practice today?" },
        { label: "You", text: "I want to practice speaking about travel and daily routines." },
        { label: "AI Tutor", text: "Perfect. We can start with simple prompts and level up gradually." },
      ],
      features: [
        {
          title: "Separation of concerns",
          description:
            "Landing, auth, and app screens live as distinct modules, so future pages do not leak into each other.",
        },
        {
          title: "Reusable UI blocks",
          description:
            "Header, hero, and feature cards are isolated into components that can be reused or replaced independently.",
        },
        {
          title: "Auth-ready navigation",
          description:
            "The top bar already points to login and register routes, making the next integration step straightforward.",
        },
      ],
      foundationLabel: "Foundation",
      foundationTitle: "Ready for login, register, and the main chat app.",
      foundationDescription:
        "The structure is intentionally boring in the best way. A small set of focused components now makes it much easier to add routes like auth, profile setup, onboarding, and the actual chat workspace later.",
    },
    auth: {
      loginTitle: "Welcome back",
      registerTitle: "Create your account",
      loginDescription:
        "Sign in to continue the conversation, pick up your profile, and move into the main app.",
      registerDescription:
        "Set up a Tiny Chat account first. We keep the profile onboarding separate so the auth flow stays fast and clean.",
      emailLabel: "Email",
      passwordLabel: "Password",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "••••••••",
      loading: "Please wait...",
      loginButton: "Login",
      registerButton: "Create account",
      backToLanding: "Back to home",
      errorFallback: "Request failed",
    },
  },
  vi: {
    appName: "Tiny Chat",
    appTagline: "Nói chuyện, học tập, kết nối",
    header: {
      nav: [
        { label: "Tính năng", href: "#features" },
        { label: "Cách hoạt động", href: "#how-it-works" },
        { label: "Liên hệ", href: "#contact" },
      ],
      login: "Đăng nhập",
      register: "Đăng ký",
      switchLabel: "EN",
    },
    landing: {
      badge: "Xây dựng cuộc trò chuyện ý nghĩa nhanh hơn",
      title: "Trải nghiệm chat gọn gàng cho luyện ngôn ngữ, cộng đồng và hỗ trợ.",
      description:
        "Tiny Chat được thiết kế như một nền tảng front-end đơn giản nhưng có thể mở rộng. Chúng ta tách riêng landing, auth và luồng sản phẩm để mọi tính năng đều dễ phát triển.",
      primaryCta: "Bắt đầu ngay",
      secondaryCta: "Xem cách hoạt động",
      previewTitle: "Xem trước",
      bubbles: [
        { label: "Giáo viên", text: "Chào mừng bạn quay lại. Hôm nay bạn muốn luyện chủ đề nào?" },
        { label: "Bạn", text: "Mình muốn luyện nói về du lịch và sinh hoạt hằng ngày." },
        { label: "AI Tutor", text: "Tuyệt vời. Chúng ta có thể bắt đầu với câu hỏi đơn giản rồi nâng dần độ khó." },
      ],
      features: [
        {
          title: "Tách biệt trách nhiệm",
          description:
            "Landing, auth và màn hình app được chia thành module riêng, nên các trang tương lai không chồng chéo nhau.",
        },
        {
          title: "Khối UI tái sử dụng",
          description:
            "Header, hero và feature cards được tách riêng để có thể dùng lại hoặc thay thế độc lập.",
        },
        {
          title: "Sẵn sàng cho auth",
          description:
            "Thanh điều hướng đã trỏ sẵn tới login và register, giúp tích hợp bước tiếp theo rất nhanh.",
        },
      ],
      foundationLabel: "Nền tảng",
      foundationTitle: "Sẵn sàng cho login, register và app chat chính.",
      foundationDescription:
        "Cấu trúc được giữ đơn giản theo hướng tốt nhất. Một bộ component nhỏ nhưng tập trung sẽ giúp việc thêm auth, profile setup, onboarding và khu vực chat sau này dễ hơn rất nhiều.",
    },
    auth: {
      loginTitle: "Chào mừng quay lại",
      registerTitle: "Tạo tài khoản của bạn",
      loginDescription:
        "Đăng nhập để tiếp tục cuộc trò chuyện, lấy lại hồ sơ và đi vào ứng dụng chính.",
      registerDescription:
        "Tạo tài khoản Tiny Chat trước. Phần hoàn thiện hồ sơ được tách riêng để luồng auth luôn nhanh và gọn.",
      emailLabel: "Email",
      passwordLabel: "Mật khẩu",
      emailPlaceholder: "ban@example.com",
      passwordPlaceholder: "••••••••",
      loading: "Vui lòng chờ...",
      loginButton: "Đăng nhập",
      registerButton: "Tạo tài khoản",
      backToLanding: "Về trang chủ",
      errorFallback: "Gửi yêu cầu thất bại",
    },
  },
};

