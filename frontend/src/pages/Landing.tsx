import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Calendar, TrendingUp, CheckCircle, Zap, Shield, BookOpen } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  { icon: Users, title: "Expert Instructors", desc: "Learn from qualified educators and industry professionals." },
  { icon: Calendar, title: "Flexible Schedule", desc: "Study at your own pace with self-paced and live sessions." },
  { icon: TrendingUp, title: "Progress Tracking", desc: "Track your growth with detailed performance analytics." },
  { icon: Zap, title: "AI-Powered Learning", desc: "Personalized recommendations based on your learning style." },
  { icon: CheckCircle, title: "Certified Content", desc: "Curriculum designed by industry experts and verified." },
  { icon: Shield, title: "Safe & Secure", desc: "Enterprise-grade security for all your learning data." },
];

const stats = [
  { value: 50, suffix: "+", label: "Expert Instructors", sublabel: "across multiple subjects" },
  { value: 5000, suffix: "+", label: "Students Learning", sublabel: "from around the world" },
  { value: 4.9, suffix: "/5", label: "Average Rating", sublabel: "from thousands of reviews" },
  { value: 95, suffix: "%", label: "Success Rate", sublabel: "in course completion" },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const isDecimal = target % 1 !== 0;
        const duration = 1400;
        const steps = 55;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          setCount(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current));
          if (current >= target) clearInterval(timer);
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }, delay);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-6 transition-all duration-700"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 transition-all duration-300" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--ink)' }}>Luma</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle compact />
            <Link to="/login" className="text-sm font-semibold hover:underline" style={{ color: 'var(--ink)' }}>Log in</Link>
            <Link to="/register" className="btn-gradient px-5 py-2 text-sm rounded-full hidden sm:flex">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent dark:from-violet-600/10" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8 animate-fade-up"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--ink-3)' }}>Luma Platform 2.0</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8 animate-fade-up" style={{ animationDelay: '0.1s', color: 'var(--ink)' }}>
            The intelligent way<br className="hidden sm:block" />
            to <span style={{ color: 'var(--blue)' }}>learn & teach.</span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s', color: 'var(--ink-3)' }}>
            Luma brings AI-powered mentoring, seamless class management, and real-time analytics into a single, beautifully designed platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register" className="btn-gradient px-8 py-4 text-base font-bold rounded-xl flex items-center justify-center gap-2 group">
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-4 text-base font-bold rounded-xl flex items-center justify-center">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-20" style={{ background: 'var(--bg-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 100}>
                <div className="text-center lg:text-left">
                  <p className="text-4xl font-black tabular-nums mb-1" style={{ color: 'var(--ink)' }}>
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{s.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-4)' }}>{s.sublabel}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <ScrollReveal>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-4" style={{ color: 'var(--ink)' }}>
                Everything you need
              </h2>
              <p className="max-w-xl mx-auto" style={{ color: 'var(--ink-4)' }}>A comprehensive suite of tools built for modern education.</p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <div className="card-glass p-8 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'var(--blue-light)' }}>
                    <f.icon className="w-6 h-6" style={{ color: 'var(--blue)' }} />
                  </div>
                  <h3 className="font-bold mb-3 text-lg" style={{ color: 'var(--ink)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-3)' }}>{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA Section ── */}
      <section className="py-32 px-6" style={{ background: 'var(--bg-section)' }}>
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight" style={{ color: 'var(--ink)' }}>
              Ready to transform<br />education?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-gradient px-8 py-4 font-bold text-lg rounded-xl">
                Create an account
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: 'var(--ink-3)' }} />
            <span className="font-bold" style={{ color: 'var(--ink)' }}>Luma</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--ink-4)' }}>© 2024 Luma Education. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
