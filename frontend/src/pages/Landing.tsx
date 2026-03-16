import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Calendar, TrendingUp, CheckCircle, Zap, Shield } from 'lucide-react';

const testimonials = [
  { id: 1, rating: 5, text: "AI-Mentor transformed how I learn. The structured curriculum and AI guidance helped me go from beginner to intermediate in 3 months.", studentName: "Alex Chen", avatar: "https://i.pravatar.cc/80?img=11", mentorName: "Dr. Sarah", role: "AI Expert" },
  { id: 2, rating: 5, text: "The most intuitive learning platform I've used. Progress tracking kept me motivated, and the assignments are perfectly challenging.", studentName: "Priya Sharma", avatar: "https://i.pravatar.cc/80?img=12", mentorName: "Marcus J.", role: "Instructor" },
  { id: 3, rating: 5, text: "Finally, a platform that truly understands personalized learning. Highly recommend to anyone serious about their education.", studentName: "Jordan Lee", avatar: "https://i.pravatar.cc/80?img=13", mentorName: "Priya S.", role: "Educator" },
];

const features = [
  { icon: Users, title: "Expert Instructors", desc: "Learn from qualified educators and industry professionals." },
  { icon: Calendar, title: "Flexible Schedule", desc: "Study at your own pace with self-paced and live sessions." },
  { icon: TrendingUp, title: "Progress Tracking", desc: "Track your growth with detailed performance analytics." },
  { icon: Zap, title: "AI-Powered Learning", desc: "Personalized recommendations based on your learning style." },
  { icon: CheckCircle, title: "Certified Content", desc: "Curriculum designed by industry experts and verified." },
  { icon: Shield, title: "Safe & Secure", desc: "Enterprise-grade security for all your learning data." },
];

const steps = [
  { num: "01", title: "Create Your Profile", desc: "Tell us about your goals and preferred learning style." },
  { num: "02", title: "Browse Courses", desc: "Explore our curated collection of high-quality courses." },
  { num: "03", title: "Start Learning", desc: "Join classes, complete assignments, and track progress." },
  { num: "04", title: "Achieve Goals", desc: "Earn certificates and reach your educational milestones." },
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
    <div className="bg-white text-zinc-900 overflow-x-hidden font-sans">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1800&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/70 to-zinc-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full py-32">
          <div className="max-w-2xl animate-fade-up">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
              </span>
              <span className="text-zinc-300 text-sm font-medium tracking-wide">Join thousands of successful students</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.0] tracking-tight mb-6">
              Learn from the
              <br />
              <span className="text-violet-400">best educators</span>
              <br />
              in the world.
            </h1>

            {/* Subheading */}
            <p className="text-lg text-zinc-300 mb-10 leading-relaxed max-w-xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
              AI-Mentor connects you with expert instructors for personalized learning, progress tracking, and real skill breakthroughs.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all duration-200 text-sm"
              >
                Start learning free
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all duration-200 text-sm backdrop-blur-sm"
              >
                Sign in
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex -space-x-2">
                {[11, 12, 13, 14, 15].map((i) => (
                  <img key={i} src={`https://i.pravatar.cc/40?img=${i}`} className="w-8 h-8 rounded-full border-2 border-zinc-800" alt="" />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-400">
                  <span className="text-white font-semibold">4.9/5</span> from 2,400+ reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted Section ── */}
      <section className="py-14 border-y border-zinc-200 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-8">
            Trusted by leading educational institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {['Harvard', 'Stanford', 'MIT', 'Oxford', 'Cambridge', 'Yale', 'Cornell', 'Columbia'].map((c) => (
              <span key={c} className="text-sm font-semibold text-zinc-400 hover:text-zinc-600 transition-colors duration-200">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 100}>
                <div className="text-center lg:text-left">
                  <p className="text-4xl font-black text-zinc-900 tabular-nums mb-1">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-sm font-semibold text-zinc-900">{s.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{s.sublabel}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-24 px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">Platform</p>
                <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 leading-tight max-w-xl">
                  Everything you need to succeed
                </h2>
              </div>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <div className="group bg-white p-8 rounded-2xl border border-zinc-200 hover:border-violet-300 hover:shadow-lg transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-5">
                    <f.icon size={20} className="text-violet-600" />
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-2 text-base">{f.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="relative py-24 px-6 overflow-hidden bg-zinc-950">
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="mb-16">
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-3">Process</p>
                <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  Start in four steps
                </h2>
                <p className="text-zinc-400 mt-4 max-w-lg">Get started in less than five minutes and begin your learning journey today.</p>
              </div>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <ScrollReveal key={s.num} delay={i * 100}>
                <div className="group">
                  <div className="text-5xl font-black text-zinc-800 mb-5 tabular-nums">{s.num}</div>
                  <h3 className="font-bold text-white mb-2 text-base">{s.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section className="py-24 px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">Testimonials</p>
                <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 leading-tight">
                  Real success stories
                </h2>
              </div>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.id} delay={i * 100}>
                <div className="bg-white rounded-2xl p-7 border border-zinc-200 hover:shadow-lg hover:border-violet-200 transition-all duration-200">
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-zinc-700 leading-relaxed mb-6 text-[15px]">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-zinc-200">
                    <img src={t.avatar} alt={t.studentName} className="w-10 h-10 rounded-full bg-zinc-200" />
                    <div>
                      <p className="font-semibold text-sm text-zinc-900">{t.studentName}</p>
                      <p className="text-xs text-violet-600 font-medium">{t.role}</p>
                      <p className="text-xs text-zinc-500">Mentored by {t.mentorName}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA Section ── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-zinc-950/80" />
        </div>

        <ScrollReveal>
          <div className="relative max-w-2xl mx-auto text-center text-white">
            <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4">Get started</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Ready to learn from<br />
              the best?
            </h2>
            <p className="text-zinc-300 mb-10 text-lg leading-relaxed">
              Start your learning journey today. No credit card required — create your account and explore our courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Get started free
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
