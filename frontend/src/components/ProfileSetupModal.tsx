import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import type { Skill } from '../backend';
import { Plus, X, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
  open: boolean;
}

const CATEGORIES = [
  'Technology', 'Design', 'Business', 'Language', 'Music',
  'Art', 'Cooking', 'Fitness', 'Science', 'Writing', 'Other'
];

interface SkillForm {
  name: string;
  category: string;
  description: string;
  proficiency: number;
}

const emptySkill = (): SkillForm => ({
  name: '',
  category: 'Technology',
  description: '',
  proficiency: 3,
});

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [offeredSkills, setOfferedSkills] = useState<SkillForm[]>([emptySkill()]);
  const [wantedSkills, setWantedSkills] = useState<SkillForm[]>([emptySkill()]);
  const saveProfile = useSaveCallerUserProfile();

  const updateSkill = (
    list: SkillForm[],
    setList: React.Dispatch<React.SetStateAction<SkillForm[]>>,
    index: number,
    field: keyof SkillForm,
    value: string | number
  ) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setList(updated);
  };

  const addSkill = (setList: React.Dispatch<React.SetStateAction<SkillForm[]>>) => {
    setList((prev) => [...prev, emptySkill()]);
  };

  const removeSkill = (
    list: SkillForm[],
    setList: React.Dispatch<React.SetStateAction<SkillForm[]>>,
    index: number
  ) => {
    if (list.length === 1) return;
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const validOffered = offeredSkills.filter((s) => s.name.trim());
    const validWanted = wantedSkills.filter((s) => s.name.trim());

    if (validOffered.length === 0) {
      toast.error('Please add at least one skill you can teach');
      return;
    }
    if (validWanted.length === 0) {
      toast.error('Please add at least one skill you want to learn');
      return;
    }

    const toSkill = (s: SkillForm): Skill => ({
      name: s.name.trim(),
      category: s.category,
      description: s.description.trim(),
      proficiency: BigInt(s.proficiency),
    });

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
        offeredSkills: validOffered.map(toSkill),
        wantedSkills: validWanted.map(toSkill),
      });
      toast.success('Profile created! Welcome to SkillSwap 🎉');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save profile');
    }
  };

  const SkillBuilder = ({
    skills,
    setSkills,
    type,
  }: {
    skills: SkillForm[];
    setSkills: React.Dispatch<React.SetStateAction<SkillForm[]>>;
    type: 'offered' | 'wanted';
  }) => (
    <div className="space-y-3">
      {skills.map((skill, idx) => (
        <div key={idx} className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Skill {idx + 1}
            </span>
            {skills.length > 1 && (
              <button
                onClick={() => removeSkill(skills, setSkills, idx)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Skill Name *</Label>
              <Input
                value={skill.name}
                onChange={(e) => updateSkill(skills, setSkills, idx, 'name', e.target.value)}
                placeholder="e.g. Python, Guitar..."
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Select
                value={skill.category}
                onValueChange={(v) => updateSkill(skills, setSkills, idx, 'category', v)}
              >
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Brief Description</Label>
            <Input
              value={skill.description}
              onChange={(e) => updateSkill(skills, setSkills, idx, 'description', e.target.value)}
              placeholder="What can you teach / what do you want to learn?"
              className="h-8 text-sm mt-1"
            />
          </div>
          {type === 'offered' && (
            <div>
              <Label className="text-xs">Proficiency (1–5)</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateSkill(skills, setSkills, idx, 'proficiency', n)}
                    className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${
                      skill.proficiency >= n
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={() => addSkill(setSkills)}
        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add another skill
      </button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">Welcome to SkillSwap!</DialogTitle>
          </div>
          <DialogDescription>
            Let's set up your profile so others can find and connect with you.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should others call you?"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community a bit about yourself, your background, and what you're passionate about..."
                className="mt-1.5 resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Next: Skills I Can Teach →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Skills I Can Teach</h3>
            </div>
            <SkillBuilder skills={offeredSkills} setSkills={setOfferedSkills} type="offered" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                ← Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!offeredSkills.some((s) => s.name.trim())}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next: Skills I Want →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-secondary" />
              </div>
              <h3 className="font-semibold text-sm">Skills I Want to Learn</h3>
            </div>
            <SkillBuilder skills={wantedSkills} setSkills={setWantedSkills} type="wanted" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                ← Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  saveProfile.isPending ||
                  !wantedSkills.some((s) => s.name.trim())
                }
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saveProfile.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Create Profile 🎉'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
