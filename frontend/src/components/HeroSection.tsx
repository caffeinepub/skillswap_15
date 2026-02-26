import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Zap, Star } from 'lucide-react';

interface HeroSectionProps {
  onExplore: () => void;
  onLogin?: () => void;
  isAuthenticated: boolean;
}

export default function HeroSection({ onExplore, onLogin, isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Zap className="w-3.5 h-3.5" />
              Peer-to-peer skill exchange
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Teach what you know.{' '}
              <span className="text-primary">Learn what you love.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Connect with people who have the skills you want, and share the skills you have.
              No fees, no barriers — just genuine knowledge exchange.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onExplore}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 gap-2"
              >
                Explore Skills
                <ArrowRight className="w-4 h-4" />
              </Button>
              {!isAuthenticated && onLogin && (
                <Button
                  onClick={onLogin}
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-6 border-border hover:bg-accent/50"
                >
                  Join the Community
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { icon: <Users className="w-4 h-4" />, label: 'Community-driven' },
                { icon: <Star className="w-4 h-4" />, label: 'Peer-reviewed' },
                { icon: <Zap className="w-4 h-4" />, label: 'Free to use' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="text-primary">{stat.icon}</span>
                  {stat.label}
                </div>
              ))}
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl blur-2xl" />
              <img
                src="/assets/generated/hero-illustration.dim_1200x500.png"
                alt="People exchanging skills"
                className="relative w-full rounded-2xl shadow-card object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
